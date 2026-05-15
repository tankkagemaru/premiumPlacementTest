# Deeper quality audit for the C1 batch — supplements build-csv.ps1's
# validation with content/structure checks (passage groups, audio clip
# groups, distractor lengths, etc.).

$ErrorActionPreference = 'Stop'
$folder = $PSScriptRoot
if (-not $folder) { $folder = Split-Path -Parent $MyInvocation.MyCommand.Path }

$files = @(Get-ChildItem -Path $folder -Filter 'c1_*.json' | Sort-Object Name)
$all = @()
foreach ($f in $files) {
    $data = Get-Content -Raw -Path $f.FullName | ConvertFrom-Json
    foreach ($i in $data.items) {
        $all += [pscustomobject]@{
            file = $f.Name
            skill = $data.skill
            difficulty = [double]$i.difficulty
            stem = [string]$i.stem
            options = @($i.options)
            key = [string]$i.key
            explanation = [string]$i.explanation
            passage = if ($null -ne $i.passage) { [string]$i.passage } else { '' }
            audio_url = if ($null -ne $i.audio_url) { [string]$i.audio_url } else { '' }
            egp_target = if ($null -ne $i.egp_target) { [string]$i.egp_target } else { '' }
            evp_target = if ($null -ne $i.evp_target) { [string]$i.evp_target } else { '' }
            skill_subarea = if ($null -ne $i.skill_subarea) { [string]$i.skill_subarea } else { '' }
            review_note = if ($null -ne $i.review_note) { [string]$i.review_note } else { '' }
        }
    }
}

Write-Output "Total items: $($all.Count)"
Write-Output ""

# Per-skill difficulty distribution
Write-Output "=== Per-skill difficulty spread ==="
foreach ($skill in @('grammar','vocabulary','reading','listening')) {
    $items = $all | Where-Object skill -eq $skill
    if (-not $items) { continue }
    $stats = $items | Measure-Object difficulty -Average -Minimum -Maximum
    "{0,-12} {1,3} items  min={2:F1} avg={3:F2} max={4:F1}" -f $skill, $items.Count, $stats.Minimum, $stats.Average, $stats.Maximum
}
Write-Output ""

# Reading passage groups
Write-Output "=== Reading passage groups ==="
$reading = $all | Where-Object skill -eq 'reading'
$readGroups = $reading | Group-Object passage
foreach ($g in $readGroups) {
    $wc = ($g.Name -split '\s+').Count
    "  passage ($wc words, $($g.Count) items): $($g.Name.Substring(0,[Math]::Min(70,$g.Name.Length)))..."
}
if ($readGroups.Count -gt 0) {
    $minPerPassage = ($readGroups | Measure-Object Count -Minimum).Minimum
    $maxPerPassage = ($readGroups | Measure-Object Count -Maximum).Maximum
    Write-Output "  -> unique passages: $($readGroups.Count); items-per-passage min=$minPerPassage max=$maxPerPassage"
}
Write-Output ""

# Listening clip groups (group by audio_url)
Write-Output "=== Listening clip groups ==="
$listening = $all | Where-Object skill -eq 'listening'
$listenGroups = $listening | Group-Object audio_url
foreach ($g in $listenGroups) {
    $transcript = if ($g.Group[0].passage) { $g.Group[0].passage } else { '(no transcript captured)' }
    $tlen = ($transcript -split '\s+').Count
    "  $($g.Name) - $($g.Count) items, transcript $tlen words"
}
Write-Output "  -> unique audio clips: $($listenGroups.Count)"
Write-Output ""

# EGP / EVP coverage
Write-Output "=== Grammar EGP target diversity ==="
$grammarTargets = ($all | Where-Object skill -eq 'grammar' | Group-Object egp_target | Sort-Object Count -Descending)
foreach ($g in $grammarTargets) {
    "  $($g.Count)x  $($g.Name)"
}
$dupeGrammar = $grammarTargets | Where-Object Count -gt 1
if ($dupeGrammar) {
    Write-Output "  -> WARN: $($dupeGrammar.Count) EGP targets covered by multiple items (consolidation OK if intentional)"
}
Write-Output ""

Write-Output "=== Vocabulary EVP target diversity ==="
$vocabTargets = ($all | Where-Object skill -eq 'vocabulary' | Group-Object evp_target | Sort-Object Count -Descending)
foreach ($g in $vocabTargets) {
    "  $($g.Count)x  $($g.Name)"
}
Write-Output ""

# Cross-batch duplicate KEY check (same correct answer appearing in many items
# is suspicious — could mean templated items)
Write-Output "=== Suspicious key reuse ==="
$keyDupes = $all | Group-Object key | Where-Object Count -ge 3
foreach ($g in $keyDupes) {
    "  '${($g.Name)}' is the key in $($g.Count) items"
}
if (-not $keyDupes) { Write-Output "  None." }
Write-Output ""

# Items flagged by the author for review
Write-Output "=== Items with review_note ==="
$flagged = $all | Where-Object { $_.review_note }
if ($flagged) {
    foreach ($i in $flagged) {
        "  [$($i.skill) d=$($i.difficulty)] $($i.review_note)"
        "      stem: $($i.stem.Substring(0,[Math]::Min(80,$i.stem.Length)))..."
    }
} else { Write-Output "  None." }
Write-Output ""

# Distractor sanity: options length variance
Write-Output "=== Options length variance (per-item) ==="
$lengthAnomalies = @()
foreach ($i in $all) {
    $lens = @($i.options | ForEach-Object { $_.Length })
    $min = ($lens | Measure-Object -Minimum).Minimum
    $max = ($lens | Measure-Object -Maximum).Maximum
    if ($max -gt 0 -and ($max - $min) -gt ($max * 0.7) -and $max -ge 8) {
        $lengthAnomalies += [pscustomobject]@{ skill=$i.skill; diff=$i.difficulty; min=$min; max=$max; stem=$i.stem }
    }
}
if ($lengthAnomalies) {
    Write-Output "  $($lengthAnomalies.Count) items with key/distractor length imbalance (>70% gap, possible length cue to answer):"
    $lengthAnomalies | Select-Object -First 8 | ForEach-Object {
        "    [$($_.skill) d=$($_.diff)] min=$($_.min) max=$($_.max) | $($_.stem.Substring(0,[Math]::Min(70,$_.stem.Length)))..."
    }
    if ($lengthAnomalies.Count -gt 8) { Write-Output "    (+$($lengthAnomalies.Count - 8) more)" }
} else { Write-Output "  Within tolerance." }
