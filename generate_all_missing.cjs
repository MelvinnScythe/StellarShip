const fs = require('fs');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Read API key from .env file securely
let apiKey = '';
try {
  const envFile = fs.readFileSync('.env', 'utf8');
  const match = envFile.match(/GEMINI_API_KEY=(.*)/);
  if (match && match[1]) {
    apiKey = match[1].trim();
  }
} catch (e) {
  console.error("Could not read .env file. Please create one with GEMINI_API_KEY=your_key_here");
  process.exit(1);
}

if (!apiKey) {
  console.error("GEMINI_API_KEY not found in .env file.");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

async function generateChapterContent(chapterName) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  
  const prompt = `You are an expert curriculum designer for Class 1-5 students in India (NCERT syllabus).
Write engaging, educational, and age-appropriate study material for the chapter "${chapterName}".
For Mathematics, focus on logic and calculation. For EVS, focus on nature and social surroundings. For English/Hindi, focus on the story or poem's meaning and grammar.

Return ONLY a valid JSON object matching this exact structure:
{
  "content": "<h3><strong>Main focus: [1 sentence summary]</strong></h3><p>[1 paragraph simple explanation for kids]</p><h3><strong>Key Concepts:</strong></h3><ul><li>[concept 1]</li><li>[concept 2]</li></ul>",
  "quiz": [
    { "question": "[MCQ 1]", "options": ["A", "B", "C", "D"], "answer": "A" },
    { "question": "[MCQ 2]", "options": ["A", "B", "C", "D"], "answer": "B" },
    { "question": "[MCQ 3]", "options": ["A", "B", "C", "D"], "answer": "C" },
    { "question": "[MCQ 4]", "options": ["A", "B", "C", "D"], "answer": "D" },
    { "question": "[MCQ 5]", "options": ["A", "B", "C", "D"], "answer": "A" }
  ],
  "lessons": [
    { "title": "[Lesson 1 Title]", "explanation": "[Short 1-2 sentence intro]" },
    { "title": "[Lesson 2 Title]", "explanation": "[Short explanation]" },
    { "title": "[Lesson 3 Title]", "explanation": "[Short explanation]" },
    { "title": "[Lesson 4 Title]", "explanation": "[Short explanation]" },
    { "title": "[Lesson 5 Title]", "explanation": "[Short explanation]" },
    { "title": "[Lesson 6 Title]", "explanation": "[Short explanation]" }
  ]
}

- Ensure the content is in HTML format.
- Exactly 5 quiz questions.
- Exactly 6 lessons with meaningful sub-topic titles.
- Return ONLY valid JSON. No markdown.`;

  try {
    const result = await model.generateContent(prompt);
    let text = result.response.text();
    text = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    return JSON.parse(text);
  } catch (error) {
    console.error(`Failed to generate content for ${chapterName}:`, error.message);
    return null;
  }
}

async function main() {
  const filePath = 'src/curriculumData.js';
  let curriculumData = fs.readFileSync(filePath, 'utf8');

  // Find all placeholder chapters. They have 'Welcome to the lesson on'
  const regex = /"([^"]+)":\s*\{\s*content:\s*"Welcome to the lesson on [^"]+",\s*quiz:\s*\[[\s\S]*?\],\s*topics:\s*\[[\s\S]*?\]\s*\}/g;
  
  let match;
  const matches = [];
  while ((match = regex.exec(curriculumData)) !== null) {
    matches.push({
      fullMatch: match[0],
      chapterName: match[1]
    });
  }

  console.log(`Found ${matches.length} placeholder chapters. Processing sequentially to respect rate limits...`);

  for (let i = 0; i < matches.length; i++) {
    const item = matches[i];
    console.log(`[${i + 1}/${matches.length}] Generating content for: ${item.chapterName}`);
    
    // Check if it already has content (might have failed mid-way earlier)
    if (!item.fullMatch.includes("Welcome to the lesson on")) {
       console.log(`Skipping ${item.chapterName}, already filled.`);
       continue;
    }

    const data = await generateChapterContent(item.chapterName);
    if (data) {
      const contentSafe = data.content.replace(/\n/g, '\\n').replace(/"/g, '\\"');
      const quizSafe = JSON.stringify(data.quiz);
      const lessonsSafe = JSON.stringify(data.lessons);
      const replacement = `"${item.chapterName}": {\n      content: "${contentSafe}",\n      quiz: ${quizSafe},\n      lessons: ${lessonsSafe}\n    }`;
      curriculumData = curriculumData.replace(item.fullMatch, replacement);
      console.log(`✅ Success: ${item.chapterName}`);
      
      // Save progressively
      fs.writeFileSync(filePath, curriculumData);
    } else {
      console.log(`❌ Failed: ${item.chapterName}`);
    }

    // Wait 10 seconds to stay under rate limits
    console.log("Waiting 10s for rate limit...");
    await new Promise(resolve => setTimeout(resolve, 10000));
  }

  console.log('All done!');
}

main();
