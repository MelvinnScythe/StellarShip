const fs = require('fs');

// Read CSV
const csvData = fs.readFileSync('english_hindi_syllabus.csv', 'utf8');
const lines = csvData.split('\n');

const syllabus = { 6: [], 7: [], 8: [], 9: [], 10: [] };

for (let i = 1; i < lines.length; i++) {
  const line = lines[i].trim();
  if (!line) continue;
  
  // Custom CSV parser to handle quotes and commas
  const parts = [];
  let currentPart = '';
  let inQuotes = false;
  
  for (let j = 0; j < line.length; j++) {
    const char = line[j];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      parts.push(currentPart.trim());
      currentPart = '';
    } else {
      currentPart += char;
    }
  }
  parts.push(currentPart.trim());
  
  if (parts.length >= 4) {
    const classStr = parts[0];
    let subject = parts[1];
    const chapterName = parts.slice(3).join(',').replace(/^"|"$/g, '').trim(); // Remove wrapping quotes if any
    
    const classNum = parseInt(classStr.replace('Class ', ''));
    if ([6, 7, 8, 9, 10].includes(classNum)) {
      // Normalize subject
      let normalizedSubject = '';
      if (subject === 'Mathematics') {
        normalizedSubject = 'Mathematics';
      } else if (subject === 'Science') {
        normalizedSubject = 'Science';
      } else if (subject.startsWith('Social Science')) {
        normalizedSubject = 'Social Studies';
      } else if (subject.startsWith('English')) {
        normalizedSubject = 'English';
      } else if (subject.startsWith('Hindi')) {
        normalizedSubject = 'Hindi';
      } else {
        continue; // skip other subjects
      }
      
      syllabus[classNum].push({
        subject: normalizedSubject,
        title: chapterName,
        xp: 15
      });
    }
  }
}

// 1. Update App.jsx ncertData block
const appPath = 'src/App.jsx';
let appContent = fs.readFileSync(appPath, 'utf8');

// Find ncertData in App.jsx
const startTag = 'const ncertData = {';
const startIndex = appContent.indexOf(startTag);
if (startIndex !== -1) {
  let braceCount = 1;
  const innerStart = startIndex + startTag.length;
  let endIndex = -1;
  for (let i = innerStart; i < appContent.length; i++) {
    if (appContent[i] === '{') braceCount++;
    if (appContent[i] === '}') braceCount--;
    if (braceCount === 0) {
      endIndex = i;
      break;
    }
  }

  if (endIndex !== -1) {
    const existingNcertStr = appContent.substring(startIndex, endIndex + 1);
    
    // We will parse ncertData for classes 1-5 first and keep them
    // Then we append/overwrite classes 6-10
    // To make it simple, let's extract 1-5 manually or programmatically.
    // The easiest way is to build a new ncertData block:
    // classes 1-5 will be retrieved by keeping everything in existingNcertStr up to class 6: or class 5 ending.
    // Let's find where "6: [" starts in existingNcertStr.
    const class6Index = existingNcertStr.indexOf('6: [');
    
    let baseNcertStr = '';
    if (class6Index !== -1) {
      baseNcertStr = existingNcertStr.substring(0, class6Index).trim();
      // Remove trailing comma if present
      if (baseNcertStr.endsWith(',')) {
        baseNcertStr = baseNcertStr.substring(0, baseNcertStr.length - 1);
      }
    } else {
      // If 6 wasn't there yet (or was in different format), use up to index of last closing brace
      baseNcertStr = existingNcertStr.substring(0, existingNcertStr.lastIndexOf('}')).trim();
    }
    
    let updatedNcertStr = baseNcertStr;
    for (let cls = 6; cls <= 10; cls++) {
      updatedNcertStr += `,\n      ${cls}: ${JSON.stringify(syllabus[cls], null, 8)}`;
    }
    updatedNcertStr += '\n    };';
    
    appContent = appContent.replace(existingNcertStr, updatedNcertStr);
    fs.writeFileSync(appPath, appContent);
    console.log('App.jsx successfully updated with Classes 6-10 syllabus!');
  }
}

// 2. Update curriculumData.js placeholders
const curriculumPath = 'src/curriculumData.js';
let curriculumContent = fs.readFileSync(curriculumPath, 'utf8');
const sIndex = curriculumContent.indexOf('const specificData = {');
if (sIndex !== -1) {
  const insertPos = sIndex + 'const specificData = {'.length;
  let placeholders = "";
  
  for (let cls = 6; cls <= 10; cls++) {
    syllabus[cls].forEach(ch => {
      // Avoid inserting duplicate key if it's already there
      const searchKey = `"${ch.title}":`;
      const searchKeyAlt = `'${ch.title}':`;
      if (!curriculumContent.includes(searchKey) && !curriculumContent.includes(searchKeyAlt)) {
        placeholders += `    "${ch.title}": {\n      content: "Welcome to the lesson on ${ch.title}! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",\n      quiz: [\n        { question: "What is a key concept in ${ch.title}?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },\n        { question: "What do we learn from ${ch.title}?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }\n      ],\n      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]\n    },\n`;
      }
    });
  }

  curriculumContent = curriculumContent.substring(0, insertPos) + '\n' + placeholders + curriculumContent.substring(insertPos);
  fs.writeFileSync(curriculumPath, curriculumContent);
  console.log('curriculumData.js successfully updated with placeholders!');
}
