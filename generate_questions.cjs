const fs = require('fs');
const path = require('path');
const https = require('https');

const envPath = path.resolve(__dirname, '.env');
const envText = fs.readFileSync(envPath, 'utf8');
const getEnv  = (key) => { const m = envText.match(new RegExp(`${key}=(.+)`)); return m ? m[1].trim() : ''; };

const GROQ_API_KEY       = getEnv('GROQ_API_KEY');
const OPENROUTER_API_KEY = getEnv('OPENROUTER_API_KEY');
const OPENROUTER_API_KEY_2 = getEnv('OPENROUTER_API_KEY_2');

if (!GROQ_API_KEY) { console.error('GROQ_API_KEY missing'); process.exit(1); }

let groqConsecutiveFailures = 0;
let openRouterKey1Failed = false;

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
            try {
              resolve(JSON.parse(raw));
            } catch (err) {
              reject(new Error(`JSON Parse Error. Raw response: ${raw.slice(0, 100)}`));
            }
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

function buildPrompt(className, subject, chapterName) {
  return `You are an expert curriculum designer for ${className} students in India (NCERT syllabus).
Create a comprehensive test bank for the chapter "${chapterName}" in ${subject}.

Generate 10 high-quality multiple-choice questions (MCQs) that test both fundamental concepts and deeper understanding. The questions must be age-appropriate.

Return ONLY a valid JSON object with this exact structure:
{
  "questions": [
    {
      "type": "mcq",
      "question": "[Clear, engaging question text]",
      "options": ["[Option A]", "[Option B]", "[Option C]", "[Option D]"],
      "answer": "[Exact string of the correct option]",
      "explanation": "[Brief 1-sentence explanation of why the answer is correct]"
    }
  ]
}

Rules:
- Exactly 10 questions.
- Return ONLY valid JSON. No markdown fences or extra text.`;
}

function parseResponse(text) {
  const clean = text.replace(/```json/gi, '').replace(/```/g, '').trim();
  const data  = JSON.parse(clean);
  if (!Array.isArray(data.questions) || data.questions.length === 0) {
    throw new Error('Invalid structure: missing questions array');
  }
  return data;
}

function isDailyQuota(errMsg) {
  return errMsg.includes('ResourceExhausted') || errMsg.includes('quota') || errMsg.includes('daily') || errMsg.includes('402');
}
function isTransientRate(errMsg) {
  return errMsg.includes('429') && !isDailyQuota(errMsg);
}

async function callGroq(className, subject, chapterName) {
  const res = await httpsPost('api.groq.com', '/openai/v1/chat/completions', {
    'Content-Type': 'application/json', 'Authorization': `Bearer ${GROQ_API_KEY}`
  }, {
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: buildPrompt(className, subject, chapterName) }],
    temperature: 0.7, max_tokens: 2000
  });
  return res.choices[0].message.content.trim();
}

async function callOpenRouter(className, subject, chapterName, useSecondKey = false) {
  const apiKey = useSecondKey ? OPENROUTER_API_KEY_2 : OPENROUTER_API_KEY;
  if (!apiKey) throw new Error('No OPENROUTER_API_KEY available');
  const res = await httpsPost('openrouter.ai', '/api/v1/chat/completions', {
    'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}`,
    'HTTP-Referer': 'https://stellarstudy.app', 'X-Title': 'StellarStudy'
  }, {
    model: 'meta-llama/llama-3.3-70b-instruct',
    messages: [{ role: 'user', content: buildPrompt(className, subject, chapterName) }],
    temperature: 0.7, max_tokens: 2000
  });
  return res.choices[0].message.content.trim();
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function generateChapterQuestions(className, subject, chapterName) {
  const label = `${className} - ${subject} - ${chapterName}`;

  if (groqConsecutiveFailures < 5) {
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const text = await callGroq(className, subject, chapterName);
        const data = parseResponse(text);
        console.log(`  ✅ [Groq] ${label}`);
        groqConsecutiveFailures = 0;
        return data.questions;
      } catch (err) {
        const msg = err.message || '';
        console.warn(`  ⚠️  [Groq attempt ${attempt}/3] ${msg.slice(0, 100)}`);
        if (attempt < 3) await sleep(isDailyQuota(msg) || isTransientRate(msg) ? 20000 : 5000);
      }
    }
    groqConsecutiveFailures++;
    if (groqConsecutiveFailures >= 5) console.warn(`  🚨 Groq disabled. Switching to OpenRouter.`);
  }

  let apiKey2Index = openRouterKey1Failed;
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      console.log(`  🔄 Last resort: OpenRouter (Key ${apiKey2Index ? '2' : '1'}) for ${chapterName}`);
      const text = await callOpenRouter(className, subject, chapterName, apiKey2Index);
      const data = parseResponse(text);
      console.log(`  ✅ [OpenRouter] ${label}`);
      return data.questions;
    } catch (err) {
      const msg = err.message || '';
      console.warn(`  ⚠️  [OpenRouter] ${msg.slice(0, 100)}`);
      if (msg.includes('402')) {
        if (!apiKey2Index) {
          console.warn(`  🚨 OpenRouter Key 1 out of credits! Switching to Key 2.`);
          openRouterKey1Failed = true;
          apiKey2Index = true;
          continue;
        } else {
          console.error(`  🚨 OpenRouter Key 2 ALSO out of credits!`);
          break;
        }
      }
      break;
    }
  }

  console.error(`  ❌ All providers failed for: ${label}`);
  return null;
}

async function main() {
  const csvPath = path.resolve(__dirname, 'syllabus.csv');
  const outputPath = path.resolve(__dirname, 'src/generated_question_banks.json');

  let outputData = {};
  if (fs.existsSync(outputPath)) {
    try { outputData = JSON.parse(fs.readFileSync(outputPath, 'utf8')); }
    catch(e) { console.warn('Could not parse existing JSON, starting fresh.'); }
  }

  const rawLines = fs.readFileSync(csvPath, 'utf8').trim().split(/\r?\n/);
  rawLines.shift();

  const todo = [];
  for (const line of rawLines) {
    const parts = line.split(',');
    if (parts.length < 4) continue;
    const className = parts[0].trim();
    const subject = parts[1].trim();
    const chapterName = parts.slice(3).join(',').trim();
    const key = `${className} - ${subject} - ${chapterName}`;
    if (!outputData[key] || outputData[key].length === 0) todo.push({ className, subject, chapterName, key });
  }

  const alreadyDone = Object.keys(outputData).length;

  console.log(`\n📝 Question Bank Generation starting`);
  console.log(`   Total in CSV  : ${rawLines.length}`);
  console.log(`   Already done  : ${alreadyDone}`);
  console.log(`   To generate   : ${todo.length}`);
  console.log(`   Provider logic: Groq (fail 5) → OpenRouter (Key 1) → OpenRouter (Key 2)\n`);

  let done = 0, failed = 0;
  // Lowered concurrency from 5 to 2 to prevent rapid rate limit triggering on Groq
  const CONCURRENCY = 2;
  const chunkedTodo = [];
  
  for (let i = 0; i < todo.length; i += CONCURRENCY) {
    chunkedTodo.push(todo.slice(i, i + CONCURRENCY));
  }

  for (const chunk of chunkedTodo) {
    const results = await Promise.all(chunk.map(async (item) => {
      const { className, subject, chapterName, key } = item;
      const questions = await generateChapterQuestions(className, subject, chapterName);
      return { key, questions };
    }));

    for (const res of results) {
      done++;
      console.log(`\n[${done}/${todo.length}] ${res.key}`);
      if (res.questions) {
        outputData[res.key] = res.questions;
      } else {
        failed++;
      }
    }
    
    // Save to disk once per chunk
    fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2), 'utf8');
    
    // Generous sleep to respect API limits
    if (done < todo.length) await sleep(5000);
  }

  console.log(`\n🎉 Done! Generated: ${todo.length - failed}/${todo.length}`);
}

main().catch(console.error);
