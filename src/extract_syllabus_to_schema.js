const fs = require('fs');
const path = require('path');
const csv = require('csv-parse/sync');

// Path to syllabus CSV
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
    const classNum = record.Class?.trim();
    // CSV may use 'Subject/Discipline' or 'Subject' as header
    const subject = (record['Subject/Discipline'] || record.Subject)?.trim();
    const chapter = Number((record['Chapter Number'] || record.Chapter)?.trim()) || 0;
    const title = (record['Chapter Name'] || record.Title)?.trim() || '';
    const syllabus = record.Syllabus?.trim() || '';
    if (!classNum || !subject || !title) return;
    if (!curriculum[classNum]) curriculum[classNum] = {};
    if (!curriculum[classNum][subject]) curriculum[classNum][subject] = [];
    const chapterObj = {
      chapter,
      title,
      syllabus,
      teachingContent: '',
      questions: {
        recall: [],
        understanding: [],
        application: [],
        hots: []
      }
    };
    // Insert in order based on chapter number
    const arr = curriculum[classNum][subject];
    const index = arr.findIndex(c => c.chapter > chapter);
    if (index === -1) arr.push(chapterObj);
    else arr.splice(index, 0, chapterObj);
  });
  return curriculum;
}

function main() {
  try {
    const csvContent = fs.readFileSync(csvPath, 'utf8');
    const records = parseCSV(csvContent);
    const curriculum = buildSkeleton(records);
    fs.writeFileSync(outputPath, JSON.stringify(curriculum, null, 2), 'utf8');
    console.log('Curriculum skeleton written to', outputPath);
  } catch (err) {
    console.error('Error generating curriculum skeleton:', err);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
