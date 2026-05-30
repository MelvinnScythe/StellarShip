const fs = require('fs');

// Read CSV
const csvData = fs.readFileSync('syllabus.csv', 'utf8');
const lines = csvData.split('\n');

const newSyllabus = { 6: [], 7: [], 8: [], 9: [] };

// Parse CSV
for (let i = 1; i < lines.length; i++) {
  if (!lines[i].trim()) continue;
  const parts = lines[i].split(',');
  if (parts.length >= 4) {
    const classStr = parts[0].trim();
    let subject = parts[1].trim();
    const chapterName = parts.slice(3).join(',').trim().replace(/\r/g, '');
    
    // Normalize subject names
    if (subject === 'Science') subject = 'Science';
    else if (subject.includes('Social Science')) subject = 'Social Studies';
    else if (subject === 'Mathematics') subject = 'Mathematics';
    
    const classNum = parseInt(classStr.replace('Class ', ''));
    
    if ([6,7,8,9].includes(classNum)) {
      newSyllabus[classNum].push({
        subject: subject,
        title: chapterName,
        xp: 15
      });
    }
  }
}

// 1. Update App.jsx
let appPath = 'src/App.jsx';
let appContent = fs.readFileSync(appPath, 'utf8');

// Replace ncertData mapping
let startTag = 'const ncertData = {';
let startIndex = appContent.indexOf(startTag);
if (startIndex !== -1) {
  let braceCount = 1;
  let innerStart = startIndex + startTag.length;
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
    
    // We want to append classes 6 to 9 to ncertData
    // We can just add them before the last closing brace
    let updatedNcertStr = existingNcertStr.substring(0, existingNcertStr.lastIndexOf('}'));
    for (let cls in newSyllabus) {
        if (!updatedNcertStr.includes(`${cls}: [`)) {
            updatedNcertStr += `,\n      ${cls}: ${JSON.stringify(newSyllabus[cls], null, 8)}`;
        }
    }
    updatedNcertStr += '\n};';
    
    appContent = appContent.replace(existingNcertStr, updatedNcertStr);
  }
}

// 2. Fix dailyMissions logic (1 per subject) + Sunday assessment
const oldDailyLogic = 'const dailyMissions = tasks.filter(t => !t.completed).slice(0, 4);';
const newDailyLogic = `  const isSunday = new Date().getDay() === 0;
  const uncompletedTasks = tasks.filter(t => !t.completed);
  let dailyMissions = [];
  
  if (isSunday) {
    // Group 1 task per subject but make it a 25-question test
    const subjectsAdded = new Set();
    for (const t of uncompletedTasks) {
      if (!subjectsAdded.has(t.subject)) {
        dailyMissions.push({ ...t, title: \`Weekly Mega Assessment: \${t.subject}\`, subtopic: "25 Questions", isSundayTest: true });
        subjectsAdded.add(t.subject);
      }
    }
  } else {
    // 1 sub lesson per subject
    const subjectsAdded = new Set();
    for (const t of uncompletedTasks) {
      if (!subjectsAdded.has(t.subject)) {
        dailyMissions.push(t);
        subjectsAdded.add(t.subject);
      }
    }
  }`;
appContent = appContent.replace(oldDailyLogic, newDailyLogic);


// 3. Fix sub-lesson titles
// Replace subtopicTitle resolution in App.jsx to ensure fallback works better
const oldTitleLogic = `        let subtopicTitle = \`Lesson \${lessonNum}\`;
        if (lessonInfo.lessons && lessonInfo.lessons[lessonNum - 1]) {
          subtopicTitle = lessonInfo.lessons[lessonNum - 1].title;
        } else if (lessonInfo.topics && lessonInfo.topics[lessonNum - 1]) {
          subtopicTitle = lessonInfo.topics[lessonNum - 1];
        } else if (lessonInfo.title) {
          subtopicTitle = lessonInfo.title;
        }`;

const newTitleLogic = `        let subtopicTitle = \`Lesson \${lessonNum}\`;
        if (lessonInfo.lessons && lessonInfo.lessons[lessonNum - 1]) {
          subtopicTitle = lessonInfo.lessons[lessonNum - 1].title;
        } else if (lessonInfo.topics && lessonInfo.topics[lessonNum - 1]) {
          subtopicTitle = lessonInfo.topics[lessonNum - 1];
        } else if (lessonInfo.title) {
          subtopicTitle = lessonInfo.title;
        }
        
        // Final fallback if undefined
        if (!subtopicTitle || subtopicTitle.includes("undefined")) {
           const defaultTopics = ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"];
           subtopicTitle = defaultTopics[lessonNum - 1] || \`Lesson \${lessonNum}\`;
        }`;

appContent = appContent.replace(oldTitleLogic, newTitleLogic);

fs.writeFileSync(appPath, appContent);
console.log('App.jsx updated with Classes 6-9, 1 subject per day, and Sunday test logic.');

// 4. Update curriculumData.js with placeholders for classes 6-9
let curriculumPath = 'src/curriculumData.js';
let curriculumContent = fs.readFileSync(curriculumPath, 'utf8');
let sIndex = curriculumContent.indexOf('const specificData = {');
if (sIndex !== -1) {
  let insertPos = sIndex + 'const specificData = {'.length;
  let placeholders = "";
  
  for (let cls in newSyllabus) {
    newSyllabus[cls].forEach(ch => {
      if (!curriculumContent.includes(`"${ch.title}":`)) {
        placeholders += `    "${ch.title}": {\n      content: "Welcome to the lesson on ${ch.title}! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",\n      quiz: [\n        { question: "What is a key concept in ${ch.title}?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },\n        { question: "What do we learn from ${ch.title}?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }\n      ],\n      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]\n    },\n`;
      }
    });
  }

  curriculumContent = curriculumContent.substring(0, insertPos) + '\n' + placeholders + curriculumContent.substring(insertPos);
  fs.writeFileSync(curriculumPath, curriculumContent);
  console.log('curriculumData.js updated with placeholders for Classes 6-9.');
}
