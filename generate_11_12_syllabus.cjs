const fs = require('fs');
const path = require('path');
const https = require('https');

const envPath = path.resolve(__dirname, '.env');
const envText = fs.readFileSync(envPath, 'utf8');
const getEnv  = (key) => { const m = envText.match(new RegExp(`${key}=(.+)`)); return m ? m[1].trim() : ''; };

const GROQ_API_KEY = getEnv('GROQ_API_KEY');

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
  "11": ["Physics", "Chemistry", "Mathematics", "Biology", "English Core"],
  "12": ["Physics", "Chemistry", "Mathematics", "Biology", "English Core"]
};

async function getSyllabus(className, subject) {
  const prompt = `You are an expert on the Indian CBSE/NCERT curriculum.
List all the chapters for Class ${className} - ${subject} as per the official NCERT textbook.
Return ONLY a valid JSON array of strings containing the chapter names in order.
Example: ["Physical World", "Units and Measurements", "Motion in a Straight Line"]
No markdown fences, no other text, just the JSON array.`;

  const res = await httpsPost(
    'api.groq.com',
    '/openai/v1/chat/completions',
    { 'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_API_KEY}` },
    { model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2, max_tokens: 1000 }
  );

  const text = res.choices[0].message.content.trim();
  if (!text) throw new Error('Empty Groq response');
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
      console.log(`Fetching syllabus for Class ${className} - ${subject}...`);
      try {
        const chapters = await getSyllabus(className, subject);
        console.log(`  Found ${chapters.length} chapters.`);
        
        chapters.forEach((chapter, index) => {
          const line = `${className},${subject},${index + 1},${chapter.replace(/,/g, '')}`;
          // Make sure not to add duplicates if it's already there
          if (!currentCsv.includes(line)) {
            currentCsv += `\n${line}`;
            appendedCount++;
          }
        });
        
        // Polite delay
        await sleep(10000);
      } catch (err) {
        console.error(`  Failed for Class ${className} ${subject}: ${err.message}`);
      }
    }
  }

  fs.writeFileSync(csvPath, currentCsv, 'utf8');
  console.log(`\nDone! Appended ${appendedCount} new chapters to syllabus.csv`);
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
