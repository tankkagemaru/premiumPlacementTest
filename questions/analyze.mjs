import { readFileSync } from 'node:fs';

const path = process.argv[2];
const text = readFileSync(path, 'utf8');

function parseCSV(text) {
  const rows = [];
  let row = [], field = '', inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') inQuotes = false;
      else field += c;
    } else {
      if (c === '"') inQuotes = true;
      else if (c === ',') { row.push(field); field = ''; }
      else if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
      else if (c === '\r') {}
      else field += c;
    }
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  return rows;
}

const rows = parseCSV(text);
const header = rows[0];
const idx = Object.fromEntries(header.map((h, i) => [h, i]));
const data = rows.slice(1).filter(r => r[idx.id]);

const levels = ['A1','A2','B1','B2','C1','C2'];
const skills = ['grammar','vocabulary','reading','listening'];

console.log(`Total questions: ${data.length}\n`);

// Cross-tab: CEFR × skill
console.log('=== Count by CEFR × Skill ===');
console.log('Level | ' + skills.map(s => s.padStart(10)).join(' ') + ' | Total');
console.log('-'.repeat(70));
for (const lvl of levels) {
  const row = skills.map(sk =>
    data.filter(d => d[idx.cefr_level] === lvl && d[idx.skill] === sk).length
  );
  const total = row.reduce((a,b) => a+b, 0);
  console.log(lvl.padEnd(5) + ' | ' + row.map(n => String(n).padStart(10)).join(' ') + ' | ' + total);
}
const noLevel = data.filter(d => !levels.includes(d[idx.cefr_level])).length;
if (noLevel) console.log(`(rows with non-standard cefr_level: ${noLevel})`);

// Difficulty buckets
console.log('\n=== Count by difficulty bucket ===');
const buckets = [[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,8],[8,9],[9,10],[10,11]];
console.log('Bucket | Count | CEFR breakdown');
for (const [lo, hi] of buckets) {
  const inBucket = data.filter(d => {
    const x = parseFloat(d[idx.difficulty_score]);
    return !isNaN(x) && x >= lo && x < hi;
  });
  const byLvl = levels.map(l =>
    `${l}:${inBucket.filter(d => d[idx.cefr_level] === l).length}`
  ).filter(s => !s.endsWith(':0')).join(' ');
  console.log(`[${lo},${hi}) | ${String(inBucket.length).padStart(5)} | ${byLvl}`);
}

// C1+ availability — items the bank can actually use to discriminate C1
console.log('\n=== C1/C2 ceiling diagnostic ===');
const c1Plus = data.filter(d => {
  const x = parseFloat(d[idx.difficulty_score]);
  return !isNaN(x) && x >= 7.5;
});
console.log(`Items at difficulty ≥ 7.5: ${c1Plus.length}`);
const skillBreak = skills.map(sk => `${sk}:${c1Plus.filter(d => d[idx.skill] === sk).length}`).join(' ');
console.log(`  by skill: ${skillBreak}`);

const c2Range = data.filter(d => {
  const x = parseFloat(d[idx.difficulty_score]);
  return !isNaN(x) && x >= 8.5;
});
console.log(`Items at difficulty ≥ 8.5 (needed for C2): ${c2Range.length}`);
console.log(`  by skill: ${skills.map(sk => `${sk}:${c2Range.filter(d => d[idx.skill] === sk).length}`).join(' ')}`);

const maxDiff = Math.max(...data.map(d => parseFloat(d[idx.difficulty_score])).filter(x => !isNaN(x)));
console.log(`Highest difficulty_score in bank: ${maxDiff}`);

// Audio coverage for listening
console.log('\n=== Listening audio coverage ===');
for (const lvl of levels) {
  const listenItems = data.filter(d => d[idx.cefr_level] === lvl && d[idx.skill] === 'listening');
  const withAudio = listenItems.filter(d => d[idx.audio_url]?.trim()).length;
  if (listenItems.length) console.log(`  ${lvl}: ${listenItems.length} items, ${withAudio} with audio`);
}

// Reading passage coverage
console.log('\n=== Reading passage coverage ===');
for (const lvl of levels) {
  const readItems = data.filter(d => d[idx.cefr_level] === lvl && d[idx.skill] === 'reading');
  const withPassage = readItems.filter(d => d[idx.passage]?.trim()).length;
  if (readItems.length) console.log(`  ${lvl}: ${readItems.length} items, ${withPassage} with passage`);
}

// CEFR/difficulty mismatch — items whose difficulty doesn't fit their declared CEFR
console.log('\n=== CEFR ↔ difficulty consistency check ===');
const expectedBands = {
  A1: [1, 3], A2: [2.5, 4.5], B1: [4, 6], B2: [5.5, 7.5], C1: [7, 9], C2: [8.5, 10]
};
let mismatches = 0;
for (const lvl of levels) {
  const band = expectedBands[lvl];
  const items = data.filter(d => d[idx.cefr_level] === lvl);
  const outside = items.filter(d => {
    const x = parseFloat(d[idx.difficulty_score]);
    return !isNaN(x) && (x < band[0] || x > band[1]);
  });
  if (outside.length) {
    mismatches += outside.length;
    console.log(`  ${lvl} (expected ${band[0]}-${band[1]}): ${outside.length}/${items.length} items outside band`);
  }
}
if (!mismatches) console.log('  All items within expected difficulty bands for their CEFR.');
