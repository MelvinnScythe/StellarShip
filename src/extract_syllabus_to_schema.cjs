// extract_syllabus_to_schema.cjs
// This script reads `syllabus.csv` and generates a hierarchical JSON skeleton
// for the curriculum data structure required by the new schema.
// Output file: `curriculumSkeleton.json` placed in the same directory.

const fs = require('fs');
const path = require('path');
const csv = require('csv-parse/sync');

// Paths
const csvPath = path.resolve(__dirname, '..', 'syllabus.csv');
const outputPath = path.resolve(__dirname, 'curriculumSkeleton.json');

function parseCSV(content) {
  // Expect headers: Class,Subject,Chapter,Title,Syllabus (optional)
  const records = csv.parse(content, { columns: true, skip_empty_lines: true });
  return records;
}

function buildSkeleton(records) {
  const curriculum = {};
  records.forEach(record => {
    const classNum = (record.Class || '').trim();
    // CSV may use 'Subject/Discipline' or 'Subject' as header
    const subject = (record['Subject/Discipline'] || record.Subject || '').trim();
    const chapter = Number((record['Chapter Number'] || record.Chapter || '').trim()) || 0;
    const title = (record['Chapter Name'] || record.Title || '').trim();
    const syllabus = (record.Syllabus || '').trim();
    if (!classNum || !subject || !title) return;
    if (!curriculum[classNum]) curriculum[classNum] = {};
    if (!curriculum[classNum][subject]) curriculum[classNum][subject] = [];
    const chapterObj = { chapter, title, syllabus, teachingContent: '', questions: { recall: [], understanding: [], application: [], hots: [] } };
    // Insert keeping order by chapter number
    const arr = curriculum[classNum][subject];
    const idx = arr.findIndex(c => c.chapter > chapter);
    if (idx === -1) arr.push(chapterObj);
    else arr.splice(idx, 0, chapterObj);
  });
  return curriculum;
}

function main() {
  if (!fs.existsSync(csvPath)) {
    console.error('syllabus.csv not found at', csvPath);
    process.exit(1);
  }
  const csvContent = fs.readFileSync(csvPath, 'utf8');
  const records = parseCSV(csvContent);
  const curriculum = buildSkeleton(records);
  fs.writeFileSync(outputPath, JSON.stringify(curriculum, null, 2), 'utf8');
  console.log('Curriculum skeleton written to', outputPath);
}

if (require.main === module) {
  main();
}
