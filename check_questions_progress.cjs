const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'src', 'generated_question_banks.json');
const TOTAL_CHAPTERS = 758;

try {
  if (!fs.existsSync(dbPath)) {
    console.log(`\n📊 Progress: 0 / ${TOTAL_CHAPTERS} chapters generated (0%)\n`);
    process.exit(0);
  }

  const data = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
  const count = Object.keys(data).length;
  const percentage = ((count / TOTAL_CHAPTERS) * 100).toFixed(1);

  console.log(`\n📊 Progress: ${count} / ${TOTAL_CHAPTERS} chapters generated (${percentage}%)\n`);
  
  // Get the most recently generated chapter if possible
  const chapters = Object.keys(data);
  if (chapters.length > 0) {
    const lastChapter = chapters[chapters.length - 1];
    console.log(`Last completed: ${lastChapter}\n`);
  }

} catch (error) {
  console.error("Error reading progress:", error.message);
}
