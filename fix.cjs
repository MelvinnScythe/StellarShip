const fs = require('fs');

let path = 'src/curriculumData.js';
let content = fs.readFileSync(path, 'utf8');

// 1. Update the signature
if (content.includes('export const getLessonContent = (title, subject, lessonNum = 1) => {')) {
  content = content.replace(
    'export const getLessonContent = (title, subject, lessonNum = 1) => {', 
    'export const getLessonContent = (title, subject, lessonNum = 1, isSundayTest = false) => {'
  );
}

// 2. We need to intercept the returned object to modify the quiz if isSundayTest is true.
// The function has multiple return statements. 
// Instead of replacing all of them, let's wrap the function body.
// But it's easier to just do a string replacement on the whole function body or rename the original function.

if (!content.includes('const getLessonContentOriginal')) {
  content = content.replace(
    'export const getLessonContent = (title, subject, lessonNum = 1, isSundayTest = false) => {',
    'const getLessonContentOriginal = (title, subject, lessonNum = 1) => {'
  );
  content = content.replace(
    'export const getLessonContent = (title, subject, lessonNum = 1) => {',
    'const getLessonContentOriginal = (title, subject, lessonNum = 1) => {'
  );
  
  // Append the wrapper at the very end
  content += `

export const getLessonContent = (title, subject, lessonNum = 1, isSundayTest = false) => {
  const result = getLessonContentOriginal(title, subject, lessonNum);
  
  if (isSundayTest) {
    let megaQuiz = [];
    let baseQuiz = result.quiz && result.quiz.length > 0 ? result.quiz : [
      { question: \`What is a key concept in \${title}?\`, options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" }
    ];
    
    // Duplicate and modify to reach 25 questions
    for (let i = 0; i < 25; i++) {
      let q = baseQuiz[i % baseQuiz.length];
      megaQuiz.push({
        question: \`(Q\${i + 1}) \${q.question}\`,
        options: q.options,
        answer: q.answer
      });
    }
    
    result.quiz = megaQuiz;
    result.content = \`<div style="padding: 1rem; background: rgba(255, 51, 68, 0.1); border-radius: 16px; margin-bottom: 2rem; text-align: center;">
      <h2 style="font-size: 2rem; margin-bottom: 0.5rem; color: var(--accent-red);">🏆 Weekly Mega Assessment</h2>
      <p>This is your Sunday test for \${subject}. Answer all 25 questions correctly to pass!</p>
    </div>\` + result.content;
  }
  
  return result;
};
`;
}

fs.writeFileSync(path, content);
console.log('curriculumData.js updated with isSundayTest logic.');
