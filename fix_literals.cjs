const fs = require('fs');

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(/\\n/g, '\n');
  fs.writeFileSync(filePath, content);
  console.log('Fixed', filePath);
}

fixFile('src/App.jsx');
fixFile('src/curriculumData.js');
