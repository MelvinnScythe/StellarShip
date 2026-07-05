// generate_curriculum.cjs
// This script reads the skeleton JSON created by extract_syllabus_to_schema.cjs,
// generates teaching content (≈80‑word lessons) for each chapter via Gemini,
// and writes the final hierarchical curriculum data to src/curriculumData.js.

const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Load API key from .env (same logic as previous script)
let apiKey = '';
try {
  // Use __dirname so .env is always resolved relative to this script
  const envPath = require('path').resolve(__dirname, '..', '.env');
  const env = fs.readFileSync(envPath, 'utf8');
  const match = env.match(/GEMINI_API_KEY=(.*)/);
  if (match && match[1]) apiKey = match[1].trim();
} catch (e) {
  // Fallback: try process.env
  apiKey = process.env.GEMINI_API_KEY || '';
  if (!apiKey) { console.error('Could not read .env and GEMINI_API_KEY not in environment'); process.exit(1); }
}
if (!apiKey) {
  console.error('GEMINI_API_KEY missing');
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

// Prompt template – creates a hook + 4‑6 lessons each ~80 words
function buildPrompt(classNum, subject, title) {
  return `You are an expert curriculum designer for Class ${classNum} students in India (NCERT syllabus).
Write engaging, age‑appropriate study material for the chapter "${title}" in ${subject}.
Return ONLY a valid JSON object with this exact structure:
{
  "content": "<p>[Hook of ~60 words introducing the chapter.]</p>",
  "lessons": [
    { "title": "[Lesson 1 Title]", "explanation": "<p>[~80‑word lesson explanation.]</p>" },
    { "title": "[Lesson 2 Title]", "explanation": "<p>[~80‑word lesson explanation.]</p>" },
    { "title": "[Lesson 3 Title]", "explanation": "<p>[~80‑word lesson explanation.]</p>" },
    { "title": "[Lesson 4 Title]", "explanation": "<p>[~80‑word lesson explanation.]</p>" }
  ]
}
- Use only <p> tags (no <h3>, <ul>, etc.).
- Each lesson explanation must be around 80 words.
- Return ONLY the JSON (no markdown backticks).`;
}

async function generateChapter(classNum, subject, title) {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  const prompt = buildPrompt(classNum, subject, title);
  const result = await model.generateContent(prompt);
  let text = result.response.text();
  // Strip possible markdown fences
  text = text.replace(/```json/gi, '').replace(/```/g, '').trim();
  try {
    const data = JSON.parse(text);
    if (!data.content || !Array.isArray(data.lessons)) throw new Error('Invalid structure');
    return data;
  } catch (e) {
    console.error('Parse error for', title, e.message);
    return null;
  }
}

function loadSkeleton() {
  const skelPath = path.resolve(__dirname, 'curriculumSkeleton.json');
  if (!fs.existsSync(skelPath)) {
    console.error('Skeleton not found at', skelPath);
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(skelPath, 'utf8'));
}

async function main() {
  const skeleton = loadSkeleton();
  const output = {};
  for (const classNum of Object.keys(skeleton)) {
    output[classNum] = {};
    const subjects = skeleton[classNum];
    for (const subject of Object.keys(subjects)) {
      output[classNum][subject] = [];
      const chapters = subjects[subject];
      for (const chap of chapters) {
        console.log(`Generating ${classNum} - ${subject} - ${chap.title}`);
        const gen = await generateChapter(classNum, subject, chap.title);
        if (gen) {
          output[classNum][subject].push({
            chapter: chap.chapter,
            title: chap.title,
            syllabus: chap.syllabus,
            teachingContent: gen.content,
            lessons: gen.lessons,
            questions: chap.questions // empty placeholder; will be filled later
          });
        } else {
          // keep placeholder with empty content
          output[classNum][subject].push({
            chapter: chap.chapter,
            title: chap.title,
            syllabus: chap.syllabus,
            teachingContent: '',
            lessons: [],
            questions: { recall: [], understanding: [], application: [], hots: [] }
          });
        }
        // gentle pause to respect rate limits
        await new Promise(r => setTimeout(r, 8000));
      }
    }
  }
  const outPath = path.resolve(__dirname, 'curriculumData.js');
  const fileContent = 'export const curriculum = ' + JSON.stringify(output, null, 2) + ';\n';
  fs.writeFileSync(outPath, fileContent, 'utf8');
  console.log('Curriculum data written to', outPath);
}

main();
