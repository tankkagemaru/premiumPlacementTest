# Converts c1_*.json files in this folder into a single CSV ready for Supabase upload.
#
# Usage:
#   powershell -ExecutionPolicy Bypass -File build-csv.ps1
#   powershell -ExecutionPolicy Bypass -File build-csv.ps1 -BankCsv "Placement Test questions_rows (1).csv"
#
# What it does:
#   1. Loads every c1_*.json file in the same folder.
#   2. Validates each item (see Validation rules below). If ANY item fails,
#      the script prints all errors and exits without writing CSV.
#   3. Optionally checks new item stems against the existing bank CSV for
#      duplicates (case-insensitive, whitespace-collapsed).
#   4. Writes c1_items_upload.csv ready for Supabase Table Editor import.
#
# Validation rules per item:
#   - stem: non-empty, no duplicates within batch (or vs existing bank)
#   - options: array of exactly 4 unique strings
#   - key: must be one of the options
#   - difficulty: numeric, 7.5 <= x <= 9.5 for C1
#   - explanation: non-empty
#   - listening items: audio_url present
#   - reading items: passage present
#
# CSV column order matches the existing questions table export:
#   id, created_by, question_text, question_type, skill, cefr_level,
#   difficulty_score, options, correct_answer, audio_url, passage,
#   explanation, created_at, updated_at, correct_answers
#
# Blank columns (id, correct_answer, audio_url for non-listening, passage for
# non-reading/listening, created_at, updated_at) rely on Supabase column
# defaults or are legitimately empty.

[CmdletBinding()]
param(
    [string]$BankCsv = ''
)

$ErrorActionPreference = 'Stop'
$folder = $PSScriptRoot
if (-not $folder) { $folder = Split-Path -Parent $MyInvocation.MyCommand.Path }

# Auto-detect bank CSV if not specified.
if (-not $BankCsv) {
    $candidate = Get-ChildItem -Path $folder -Filter '*questions_rows*.csv' -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($candidate) { $BankCsv = $candidate.FullName }
}

function Convert-ToJsonArray {
    param([Parameter(Mandatory)][string[]]$Items)
    $escaped = foreach ($s in $Items) {
        '"' + ($s -replace '\\','\\' -replace '"','\"') + '"'
    }
    '[' + ($escaped -join ',') + ']'
}

function Normalize-Stem {
    param([string]$s)
    if (-not $s) { return '' }
    return ($s -replace '\s+',' ').Trim().ToLowerInvariant()
}

# --- Load existing bank stems (for duplicate detection) ---
$existingStems = New-Object 'System.Collections.Generic.HashSet[string]'
if ($BankCsv -and (Test-Path $BankCsv)) {
    Import-Csv -Path $BankCsv | ForEach-Object {
        [void]$existingStems.Add((Normalize-Stem $_.question_text))
    }
    Write-Output "Bank reference: $BankCsv ($($existingStems.Count) stems indexed)"
} else {
    Write-Warning "No bank CSV provided/found. Skipping cross-bank duplicate check."
}

# --- Load and validate all c1_*.json files ---
$files = @(Get-ChildItem -Path $folder -Filter 'c1_*.json' | Sort-Object Name)
if (-not $files) { Write-Error "No c1_*.json files found in $folder" }

$errors  = New-Object System.Collections.Generic.List[string]
$rows    = New-Object System.Collections.Generic.List[object]
$batchStems = New-Object 'System.Collections.Generic.HashSet[string]'

foreach ($file in $files) {
    $data = $null
    try {
        $data = Get-Content -Raw -Path $file.FullName | ConvertFrom-Json
    } catch {
        $errors.Add("[$($file.Name)] JSON parse error: $_") ; continue
    }

    if (-not $data.skill)       { $errors.Add("[$($file.Name)] missing top-level 'skill'") ; continue }
    if (-not $data.cefr_level)  { $errors.Add("[$($file.Name)] missing top-level 'cefr_level'") ; continue }
    if (-not $data.created_by)  { $errors.Add("[$($file.Name)] missing top-level 'created_by'") ; continue }

    $skill = [string]$data.skill
    $idx = 0
    foreach ($item in $data.items) {
        $idx++
        $loc = "[$($file.Name) item #$idx]"

        $stem = if ($null -ne $item.stem) { [string]$item.stem } else { '' }
        if (-not $stem.Trim()) { $errors.Add("$loc stem is empty"); continue }

        $norm = Normalize-Stem $stem
        if (-not $batchStems.Add($norm)) {
            $errors.Add("$loc duplicate stem within this batch: '$($stem.Substring(0,[Math]::Min(60,$stem.Length)))...'")
        }
        if ($existingStems.Contains($norm)) {
            $errors.Add("$loc stem already exists in bank: '$($stem.Substring(0,[Math]::Min(60,$stem.Length)))...'")
        }

        $options = @($item.options)
        if ($options.Count -ne 4) {
            $errors.Add("$loc options must have exactly 4 entries (got $($options.Count))") ; continue
        }
        $uniqOpts = @($options | Sort-Object -Unique)
        if ($uniqOpts.Count -ne 4) {
            $errors.Add("$loc options contain duplicates: $($options -join ' | ')")
        }

        $key = if ($null -ne $item.key) { [string]$item.key } else { '' }
        if (-not $key) { $errors.Add("$loc key is empty") ; continue }
        if ($options -notcontains $key) {
            $errors.Add("$loc key '$key' is not in options ($($options -join ' | '))")
        }

        $diff = $null
        try { $diff = [double]$item.difficulty } catch {}
        if ($null -eq $diff) {
            $errors.Add("$loc difficulty must be numeric (got '$($item.difficulty)')")
        } elseif ($data.cefr_level -eq 'C1' -and ($diff -lt 7.5 -or $diff -gt 9.5)) {
            $errors.Add("$loc difficulty $diff outside C1 range 7.5-9.5")
        }

        $explanation = if ($null -ne $item.explanation) { [string]$item.explanation } else { '' }
        if (-not $explanation.Trim()) {
            $errors.Add("$loc explanation is empty")
        }

        $audio_url = if ($null -ne $item.audio_url) { [string]$item.audio_url } else { '' }
        $passage   = if ($null -ne $item.passage)   { [string]$item.passage }   else { '' }

        if ($skill -eq 'listening' -and -not $audio_url.Trim()) {
            $errors.Add("$loc listening item missing audio_url (use placeholder pattern)")
        }
        if ($skill -eq 'reading' -and -not $passage.Trim()) {
            $errors.Add("$loc reading item missing passage")
        }

        if ($errors.Count -gt 0 -and $errors[$errors.Count - 1].StartsWith($loc)) {
            # If we accumulated any error for THIS item, still try to render it
            # so later runs have full context, but skip emitting to CSV.
        }

        # NOTE: id, created_at, updated_at are intentionally OMITTED from the
        # CSV (not included as empty strings). Supabase Table Editor rejects
        # an empty string for the uuid `id` column with 22P02. Omitting them
        # lets the table-level defaults (gen_random_uuid(), now()) fire on
        # insert.
        $rows.Add([pscustomobject]@{
            created_by        = $data.created_by
            question_text     = $stem
            question_type     = 'multiple_choice'
            skill             = $skill
            cefr_level        = $data.cefr_level
            difficulty_score  = $diff
            options           = (Convert-ToJsonArray -Items $options)
            correct_answer    = ''
            audio_url         = $audio_url
            passage           = $passage
            explanation       = $explanation
            correct_answers   = (Convert-ToJsonArray -Items @($key))
        }) | Out-Null
    }
}

# --- Report and exit on errors ---
if ($errors.Count -gt 0) {
    Write-Output ""
    Write-Output "Validation FAILED with $($errors.Count) error(s):"
    foreach ($e in $errors) { Write-Output "  - $e" }
    Write-Output ""
    Write-Output "No CSV written. Fix the JSON files and re-run."
    exit 1
}

# --- Write CSV ---
$outPath = Join-Path $folder 'c1_items_upload.csv'
$rows | Export-Csv -Path $outPath -NoTypeInformation -Encoding utf8
Write-Output ""
Write-Output "Validation passed."
Write-Output "Wrote $($rows.Count) items to: $outPath"
Write-Output ""
Write-Output "Breakdown by skill:"
$rows | Group-Object skill | Sort-Object Name | ForEach-Object {
    Write-Output ("  {0,-12} {1,4} items" -f $_.Name, $_.Count)
}
Write-Output ""
Write-Output "Difficulty spread:"
$buckets = @(@(7.5,8.0),@(8.0,8.5),@(8.5,9.0),@(9.0,9.5),@(9.5,10.0))
foreach ($b in $buckets) {
    $count = ($rows | Where-Object { [double]$_.difficulty_score -ge $b[0] -and [double]$_.difficulty_score -lt $b[1] }).Count
    Write-Output ("  [{0},{1}) {2,4} items" -f $b[0], $b[1], $count)
}
