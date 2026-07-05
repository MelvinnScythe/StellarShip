// generate_reading_groq.cjs
// Dynamic Provider Switching:
// 1. Try Groq.
// 2. If Groq fails or rate limits max out, switch to OpenRouter (Key 1).
// 3. If OpenRouter Key 1 has insufficient credits (402), switch to OpenRouter (Key 2).
// Saves after every successful chapter (generate-once, store-forever).

const fs   = require('fs');
const path = require('path');
const https = require('https');

// ─── Load env ────────────────────────────────────────────────────────────────
const envPath = path.resolve(__dirname, '.env');
const envText = fs.readFileSync(envPath, 'utf8');
const getEnv  = (key) => { const m = envText.match(new RegExp(`${key}=(.+)`)); return m ? m[1].trim() : ''; };

const GROQ_API_KEY       = getEnv('GROQ_API_KEY');
const OPENROUTER_API_KEY = getEnv('OPENROUTER_API_KEY');
const OPENROUTER_API_KEY_2 = getEnv('OPENROUTER_API_KEY_2');

if (!GROQ_API_KEY) { console.error('GROQ_API_KEY missing'); process.exit(1); }

// ─── Session state ────────────────────────────────────────────────────────────
let groqConsecutiveFailures = 0;
let openRouterKey1Failed = false;

// ─── HTTP helper ──────────────────────────────────────────────────────────────
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

// ─── Prompt ───────────────────────────────────────────────────────────────────
function buildPrompt(className, subject, chapterName) {
  return `You are an expert curriculum designer for ${className} students in India (NCERT syllabus).
Write engaging, educational, age-appropriate study material for the chapter "${chapterName}" in ${subject}.

Return ONLY a valid JSON object with this exact structure:
{
  "content": "<p>[Hook: ~55 words introducing the chapter to spark curiosity. Single <p> tag only.]</p>",
  "lessons": [
    { "title": "Introduction & Concept Deep-Dive", "explanation": "<p>[~80-word engaging explanation combining intro and a deep dive into the core idea]</p>" },
    { "title": "Key Concepts - Part 1", "explanation": "<p>[~80-word detailed teaching of the first major concept of the chapter. DO NOT write meta-text like 'A guide on key concepts', actually teach the material!]</p>" },
    { "title": "Key Concepts - Part 2", "explanation": "<p>[~80-word detailed teaching of the second major concept of the chapter.]</p>" },
    { "title": "Key Concepts - Part 3 & Activities", "explanation": "<p>[~80-word teaching of the final concepts, including a practice activity or thought exercise.]</p>" }
  ]
}

Rules:
- Only <p> tags. No <h3>, <ul>, <li>, <br>.
- Exactly 4 lessons.
- Teach the actual material. DO NOT write meta-text like "This is a guide on key concepts". 
- Return ONLY valid JSON. No markdown fences.`;
}

// ─── Parse & validate ─────────────────────────────────────────────────────────
function parseResponse(text) {
  const clean = text.replace(/```json/gi, '').replace(/```/g, '').trim();
  const data  = JSON.parse(clean);
  if (!data.content || !Array.isArray(data.lessons) || data.lessons.length < 2) {
    throw new Error('Invalid structure: missing content or lessons');
  }
  return data;
}

// ─── Check if error is a daily quota (not just a rate limit) ─────────────────
function isDailyQuota(errMsg) {
  return (
    errMsg.includes('ResourceExhausted') ||
    errMsg.includes('RESOURCE_EXHAUSTED') ||
    errMsg.includes('quota') ||
    errMsg.includes('daily') ||
    errMsg.includes('exceeded') ||
    errMsg.includes('402') // OpenRouter out of credits
  );
}

function isTransientRate(errMsg) {
  return errMsg.includes('429') && !isDailyQuota(errMsg);
}

// ─── Groq call ────────────────────────────────────────────────────────────────
async function callGroq(className, subject, chapterName) {
  const res = await httpsPost(
    'api.groq.com',
    '/openai/v1/chat/completions',
    { 'Content-Type': 'application/json', 'Authorization': `Bearer ${GROQ_API_KEY}` },
    { model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: buildPrompt(className, subject, chapterName) }],
      temperature: 0.7, max_tokens: 1400 }
  );
  return res.choices[0].message.content.trim();
}

// ─── OpenRouter fallback (last resort) ───────────────────────────────────────
async function callOpenRouter(className, subject, chapterName, useSecondKey = false) {
  const apiKey = useSecondKey ? OPENROUTER_API_KEY_2 : OPENROUTER_API_KEY;
  if (!apiKey) throw new Error('No OPENROUTER_API_KEY available');
  
  const res = await httpsPost(
    'openrouter.ai',
    '/api/v1/chat/completions',
    { 'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://stellarstudy.app',
      'X-Title': 'StellarStudy' },
    { model: 'meta-llama/llama-3.3-70b-instruct',
      messages: [{ role: 'user', content: buildPrompt(className, subject, chapterName) }],
      temperature: 0.7, max_tokens: 1400 }
  );
  return res.choices[0].message.content.trim();
}

// ─── sleep helper ─────────────────────────────────────────────────────────────
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// ─── Generate with smart fallback ────────────────────────────────────────────
async function generateChapter(className, subject, chapterName) {
  const label = `${className} - ${subject} - ${chapterName}`;

  // ── STEP 1: Groq ────────────────────────────────────────────────────────────
  if (groqConsecutiveFailures < 5) {
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const text = await callGroq(className, subject, chapterName);
        const data = parseResponse(text);
        console.log(`  ✅ [Groq] ${label}`);
        groqConsecutiveFailures = 0; // reset on success
        return data;
      } catch (err) {
        const msg = err.message || '';
        console.warn(`  ⚠️  [Groq attempt ${attempt}/3] ${msg.slice(0, 100)}`);
        if (attempt < 3) {
          const wait = isDailyQuota(msg) || isTransientRate(msg) ? 20000 : 5000;
          console.log(`  ⏳ Waiting ${wait / 1000}s...`);
          await sleep(wait);
        }
      }
    }
    // Failed all 3 attempts for this chapter
    groqConsecutiveFailures++;
    console.warn(`  🚫 Groq failed chapter (${groqConsecutiveFailures}/5 consecutive failures)`);
    if (groqConsecutiveFailures >= 5) {
      console.warn(`  🚨 Groq disabled for remainder of session. Switching to OpenRouter.`);
    }
  }

  // ── STEP 2: OpenRouter ──────────────────────────────────────────────────────
  let apiKey2Index = openRouterKey1Failed;
  
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      console.log(`  🔄 Last resort: OpenRouter (Key ${apiKey2Index ? '2' : '1'}) for ${chapterName}`);
      const text = await callOpenRouter(className, subject, chapterName, apiKey2Index);
      const data = parseResponse(text);
      console.log(`  ✅ [OpenRouter] ${label}`);
      return data;
    } catch (err) {
      const msg = err.message || '';
      console.warn(`  ⚠️  [OpenRouter] ${msg.slice(0, 100)}`);
      
      if (msg.includes('402')) {
        if (!apiKey2Index) {
          console.warn(`  🚨 OpenRouter Key 1 has insufficient credits! Switching to Key 2.`);
          openRouterKey1Failed = true;
          apiKey2Index = true;
          continue; // Try again immediately with Key 2
        } else {
          console.error(`  🚨 OpenRouter Key 2 ALSO has insufficient credits!`);
          break; // Both keys are out of credits
        }
      }
      break;
    }
  }

  console.error(`  ❌ All providers failed for: ${label}`);
  return null;
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  const csvPath    = path.resolve(__dirname, 'syllabus.csv');
  const outputPath = path.resolve(__dirname, 'src/generated_reading_material.json');

  // Load existing (generate-once principle — never overwrite completed chapters)
  let outputData = {};
  if (fs.existsSync(outputPath)) {
    try { outputData = JSON.parse(fs.readFileSync(outputPath, 'utf8')); }
    catch(e) { console.warn('Could not parse existing JSON, starting fresh.'); }
  }

  // Parse CSV — support both "Subject" and "Subject/Discipline" headers
  const rawLines = fs.readFileSync(csvPath, 'utf8').trim().split(/\r?\n/);
  rawLines.shift(); // remove header

  const todo = [];
  for (const line of rawLines) {
    const parts = line.split(',');
    if (parts.length < 4) continue;
    const className   = parts[0].trim();
    const subject     = parts[1].trim();
    const chapterName = parts.slice(3).join(',').trim();
    const key         = `${className} - ${subject} - ${chapterName}`;
    if (!outputData[key]?.content) todo.push({ className, subject, chapterName, key });
  }

  const alreadyDone = Object.keys(outputData).filter(k => outputData[k]?.content).length;

  console.log(`\n📚 Chapter generation starting`);
  console.log(`   Total in CSV  : ${rawLines.length}`);
  console.log(`   Already done  : ${alreadyDone}`);
  console.log(`   To generate   : ${todo.length}`);
  console.log(`   Provider logic: Groq (fail 5) → OpenRouter (Key 1) → OpenRouter (Key 2)\n`);

  let done = 0, failed = 0;

  for (const { className, subject, chapterName, key } of todo) {
    done++;
    console.log(`\n[${done}/${todo.length}] ${key}`);
    const data = await generateChapter(className, subject, chapterName);

    if (data) {
      outputData[key] = data;
      fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2), 'utf8');
    } else {
      failed++;
    }

    // Polite delay: 8s is safe for Groq rate limits for large contexts
    if (done < todo.length) await sleep(8000);
  }

  const total = todo.length;
  console.log(`\n🎉 Done! Generated: ${total - failed}/${total}  Failed: ${failed}`);
  console.log(`   Output: ${outputPath}`);
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
