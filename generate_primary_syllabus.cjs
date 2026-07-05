const fs = require('fs');
const path = require('path');
const https = require('https');

const envPath = path.resolve(__dirname, '.env');
const envText = fs.readFileSync(envPath, 'utf8');
const getEnv  = (key) => { const m = envText.match(new RegExp(`${key}=(.+)`)); return m ? m[1].trim() : ''; };

const OPENROUTER_API_KEY = getEnv('OPENROUTER_API_KEY');

function httpsPost(hostname, urlPath, headers, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req  = https.request(
      { hostname, path: urlPath, method: 'POST',
        headers: { ...headers, 'Content-Length': Buffer.byteLength(data) } },
      (res) => {
        let raw = '';
        res.on('data', c => raw += c);
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(JSON.parse(raw));
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${raw.slice(0, 400)}`));
          }
        });
      }
    );
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

const subjectsByClass = {
  "Class 1": ["Mathematics (Math Magic)", "English (Marigold)", "Hindi (Rimjhim)"],
  "Class 2": ["Mathematics (Math Magic)", "English (Marigold)", "Hindi (Rimjhim)"],
  "Class 3": ["Mathematics (Math Magic)", "Environmental Studies (Looking Around)", "English (Marigold)", "Hindi (Rimjhim)"],
  "Class 4": ["Mathematics (Math Magic)", "Environmental Studies (Looking Around)", "English (Marigold)", "Hindi (Rimjhim)"],
  "Class 5": ["Mathematics (Math Magic)", "Environmental Studies (Looking Around)", "English (Marigold)", "Hindi (Rimjhim)"]
};

async function getSyllabus(className, subject) {
  const prompt = `You are an expert on the Indian CBSE/NCERT curriculum.
List all the chapters for ${className} - ${subject} as per the official NCERT textbook.
Return ONLY a valid JSON array of strings containing the chapter names in order.
Example: ["Shapes and Space", "Numbers from One to Nine", "Addition"]
No markdown fences, no other text, just the JSON array.`;

  const res = await httpsPost(
    'openrouter.ai',
    '/api/v1/chat/completions',
    { 'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'HTTP-Referer': 'https://stellarstudy.app',
      'X-Title': 'StellarStudy' },
    { model: 'meta-llama/llama-3.3-70b-instruct',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2, max_tokens: 1000 }
  );

  const text = res.choices[0].message.content.trim();
  if (!text) throw new Error('Empty OpenRouter response');
  const clean = text.replace(/```json/gi, '').replace(/```/g, '').trim();
  return JSON.parse(clean);
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function main() {
  const csvPath = path.resolve(__dirname, 'syllabus.csv');
  let currentCsv = fs.readFileSync(csvPath, 'utf8').trim();
  let appendedCount = 0;

  for (const [className, subjects] of Object.entries(subjectsByClass)) {
    for (const subject of subjects) {
      console.log(`Fetching syllabus for ${className} - ${subject}...`);
      try {
        const chapters = await getSyllabus(className, subject);
        console.log(`  Found ${chapters.length} chapters.`);
        
        let subjectKey = subject;
        if (subject.includes('Mathematics')) subjectKey = 'Mathematics';
        if (subject.includes('Environmental')) subjectKey = 'Environmental Studies';

        chapters.forEach((chapter, index) => {
          const line = `${className},${subjectKey},${index + 1},${chapter.replace(/,/g, '')}`;
          // Make sure not to add duplicates if it's already there
          if (!currentCsv.includes(line)) {
            currentCsv += `\n${line}`;
            appendedCount++;
          }
        });
        
        // Polite delay
        await sleep(3000);
      } catch (err) {
        console.error(`  Failed for ${className} ${subject}: ${err.message}`);
      }
    }
  }

  fs.writeFileSync(csvPath, currentCsv, 'utf8');
  console.log(`\nDone! Appended ${appendedCount} new chapters to syllabus.csv`);
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
