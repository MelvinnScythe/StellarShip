const fs = require('fs');
const { GoogleGenerativeAI } = require('@google/generative-ai');

let apiKey = '';
try {
  const envFile = fs.readFileSync('.env', 'utf8');
  const match = envFile.match(/GEMINI_API_KEY=(.*)/);
  if (match && match[1]) {
    apiKey = match[1].trim();
  }
} catch (e) {
  console.error("Could not read .env file.");
  process.exit(1);
}

if (!apiKey) {
  console.error("GEMINI_API_KEY not found in .env file.");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

async function generateChapterContentWithRetry(className, subject, chapterName) {
  const maxRetries = 8;
  let attempt = 0;
  let delay = 10000; // start with 10 seconds

  while (attempt < maxRetries) {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      const prompt = `You are an expert curriculum designer for ${className} students in India (NCERT syllabus).
Write engaging, educational, and age-appropriate study material for the chapter "${chapterName}" in ${subject}.
The quiz questions are already generated, so ONLY generate the reading part.

Return ONLY a valid JSON object matching this exact structure:
{
  "content": "<p>[Write a short, exciting hook of around 50-60 words explaining what the chapter is about. Do NOT summarize the lessons; just introduce the topic to spark interest. Must be a single text block in a p tag.]</p>",
  "lessons": [
    { "title": "[Lesson 1 Title]", "explanation": "[Write a detailed, engaging explanation of around 70-80 words.]" },
    { "title": "[Lesson 2 Title]", "explanation": "[Write a detailed, engaging explanation of around 70-80 words.]" },
    { "title": "[Lesson 3 Title]", "explanation": "[Write a detailed, engaging explanation of around 70-80 words.]" },
    { "title": "[Lesson 4 Title]", "explanation": "[Write a detailed, engaging explanation of around 70-80 words.]" }
  ]
}

- Ensure the content is in HTML format and only uses <p> tags. No <h3>, no <ul>, no <li>.
- Exactly 4-6 lessons with meaningful sub-topic titles.
- Each lesson explanation must be around 70-80 words long.
- Return ONLY valid JSON. No markdown backticks.`;

      const result = await model.generateContent(prompt);
      let text = result.response.text();
      text = text.replace(/```json/gi, '').replace(/```/g, '').trim();
      
      const parsedData = JSON.parse(text);
      if (!parsedData.content || !Array.isArray(parsedData.lessons)) {
        throw new Error("Invalid structure generated (missing 'content' or 'lessons')");
      }
      return parsedData;

    } catch (error) {
      attempt++;
      const msg = error.message || '';
      const isRateLimit = msg.includes('429') || msg.includes('ResourceExhausted') || msg.includes('quota');
      const isServiceUnavailable = msg.includes('503') || msg.includes('Service Unavailable') || msg.includes('demand');
      const isParseError = error instanceof SyntaxError || msg.includes("Invalid structure");
      
      let errorType = 'Error';
      if (isRateLimit) errorType = 'Rate limit (429)';
      else if (isServiceUnavailable) errorType = 'Service unavailable (503)';
      else if (isParseError) errorType = 'JSON Parse error';

      console.warn(`[Attempt ${attempt}/${maxRetries}] ${errorType} for ${chapterName}: ${error.message}`);

      if (attempt >= maxRetries) {
        console.error(`❌ Max retries reached for ${chapterName}. Skipping.`);
        return null;
      }

      let waitTime = isParseError ? 2000 : delay;
      if (!isParseError) {
        delay = Math.min(delay * 2, 300000); // cap at 5 minutes
      }

      console.log(`Waiting ${Math.round(waitTime / 1000)} seconds before retrying...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
  return null;
}

async function main() {
  const csvData = fs.readFileSync('syllabus.csv', 'utf8').trim().split('\n');
  const headers = csvData.shift(); // remove header
  
  const outputPath = 'src/generated_reading_material.json';
  let outputData = {};
  if (fs.existsSync(outputPath)) {
    try {
        outputData = JSON.parse(fs.readFileSync(outputPath, 'utf8'));
    } catch(e) {}
  }

  console.log(`Found ${csvData.length} chapters in CSV.`);

  let i = 0;
  while (i < csvData.length) {
    const parts = csvData[i].split(',');
    if (parts.length < 4) {
      i++;
      continue;
    }
    const className = parts[0].trim();
    const subject = parts[1].trim();
    const chapterName = parts.slice(3).join(',').trim();
    
    const uniqueKey = `${className} - ${subject} - ${chapterName}`;

    if (outputData[uniqueKey] && outputData[uniqueKey].content) {
       console.log(`Skipping ${uniqueKey}, already generated.`);
       i++;
       continue;
    }

    console.log(`[${i + 1}/${csvData.length}] Generating for: ${uniqueKey}`);
    const data = await generateChapterContentWithRetry(className, subject, chapterName);
    
    if (data) {
      outputData[uniqueKey] = data;
      fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2));
      console.log(`✅ Success: ${uniqueKey}`);
    } else {
      console.log(`❌ Failed: ${uniqueKey}`);
    }

    // Safer delay between successful requests to stay below 15 RPM
    await new Promise(resolve => setTimeout(resolve, 8000));
    i++;
  }

  console.log('All done! Reading material saved to src/generated_reading_material.json');
}

main();
