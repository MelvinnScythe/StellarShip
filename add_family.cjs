const fs = require('fs');

// 1. Update App.jsx
let appContent = fs.readFileSync('src/App.jsx', 'utf8');
const searchString = `1: [
          { subject: "English", title: "A Happy Child", xp: 10 },`;
const replaceString = `1: [
          { subject: "English", title: "My Family and Me", xp: 15 },
          { subject: "English", title: "A Happy Child", xp: 10 },`;
appContent = appContent.replace(searchString, replaceString);
fs.writeFileSync('src/App.jsx', appContent);
console.log('App.jsx updated');

// 2. Update LessonPage.jsx
let lessonContent = fs.readFileSync('src/components/LessonPage.jsx', 'utf8');
lessonContent = lessonContent.replace(
  '<p>{content}</p>',
  '</div><div dangerouslySetInnerHTML={{ __html: content }} style={{ width: "100%" }}></div><div>'
);
// Or cleaner replace:
lessonContent = fs.readFileSync('src/components/LessonPage.jsx', 'utf8');
const searchLesson = `<div style={{ color: 'var(--text-secondary)', lineHeight: '1.8', fontSize: '1.1rem' }}>
              <p>{content}</p>
            </div>`;
const replaceLesson = `<div style={{ color: 'var(--text-secondary)', lineHeight: '1.8', fontSize: '1.1rem' }} dangerouslySetInnerHTML={{ __html: content }} />`;
lessonContent = lessonContent.replace(searchLesson, replaceLesson);
fs.writeFileSync('src/components/LessonPage.jsx', lessonContent);
console.log('LessonPage.jsx updated');

// 3. Update curriculumData.js
const htmlContent = `
<h3><strong>What this chapter is about</strong></h3>
<p>This chapter begins Class 1 English with the child’s own world: the body, simple actions, cleanliness, and the people around them. It helps children learn the names of body parts and understand why each part is useful. It also introduces the idea that we should keep ourselves clean and healthy. The lesson is designed in a very gentle way so children can learn by seeing, saying, doing, and repeating. The chapter also builds confidence because children talk about themselves, their family, and the things they do every day. NCERT’s Class 1 English introduction shows that the book is built around familiar themes like family, body parts, politeness, animals, and plants, so children connect language to real life.</p>

<h3><strong>Detailed explanation</strong></h3>
<p>A small child learns first from the things closest to them. This chapter uses that idea very well. Children look at their own hands, eyes, legs, nose, mouth, ears, and other body parts. They slowly understand that each part has a job. Hands help us hold, clap, write, and eat. Eyes help us see. Ears help us hear. Legs help us walk and run. Nose helps us smell. Mouth helps us speak and eat. The chapter also teaches that body parts should be kept clean and cared for, because cleanliness is part of good health. This makes the lesson useful in daily life, not just in the classroom.</p>
<p>The chapter is also important because it connects language with movement. When a child says “clap,” they can clap. When they say “blink,” they can blink. When they say “walk,” they can walk. This is how young children learn better: by doing the action while saying the word.</p>
<p>Another important idea in this chapter is self-awareness. Children begin to notice that their body is special and valuable. They understand that they should wash hands, brush teeth, bathe, comb hair, and keep their nails clean.</p>

<h3><strong>Word meanings</strong></h3>
<p><strong>Body parts</strong></p>
<ul>
<li><strong>hand</strong> — part of the body used for holding and doing work</li>
<li><strong>eye</strong> — part of the body used for seeing</li>
<li><strong>ear</strong> — part of the body used for hearing</li>
<li><strong>nose</strong> — part of the body used for smelling</li>
<li><strong>mouth</strong> — part of the body used for eating and speaking</li>
<li><strong>leg</strong> — part of the body used for walking and running</li>
</ul>

<p><strong>Action words</strong></p>
<ul>
<li><strong>clap</strong> — to strike hands together</li>
<li><strong>blink</strong> — to close and open eyes quickly</li>
<li><strong>walk</strong> — to move on feet</li>
<li><strong>run</strong> — to move fast on feet</li>
<li><strong>smile</strong> — to show happiness on the face</li>
</ul>

<p><strong>Cleanliness words</strong></p>
<ul>
<li><strong>clean</strong> — free from dirt</li>
<li><strong>wash</strong> — to remove dirt using water</li>
<li><strong>healthy</strong> — strong and well</li>
<li><strong>neat</strong> — tidy and well kept</li>
</ul>

<h3><strong>Grammar for kids</strong></h3>
<p><strong>1. Naming words</strong><br/>
These are words that name people, places, animals, or things.<br/>
Examples: hand, eye, leg, child, family</p>

<p><strong>2. Action words</strong><br/>
These are words that show what we do.<br/>
Examples: clap, run, walk, blink, smile</p>

<p><strong>3. Describing words</strong><br/>
These tell us more about a noun.<br/>
Examples: clean hands, big eyes, little child, healthy body</p>

<p><strong>4. Simple sentence pattern</strong><br/>
I + action word + body part<br/>
Examples: I clap my hands. I blink my eyes.</p>

<p><strong>5. “This is” and “These are”</strong><br/>
This is my hand. This is my nose. These are my eyes. These are my legs.</p>

<h3><strong>Subtopics in this chapter</strong></h3>
<ul>
<li>body parts</li>
<li>actions of body parts</li>
<li>cleanliness and hygiene</li>
<li>speaking about self</li>
<li>simple sentence building</li>
<li>observation and identification</li>
</ul>

<h3><strong>Step-by-step understanding</strong></h3>
<ol>
<li>First, children look at a picture or their own body and identify parts one by one.</li>
<li>Then they repeat the words aloud so they remember them.</li>
<li>After that, they connect each body part with its job, such as seeing, hearing, walking, or writing.</li>
<li>Next, they learn why staying clean is important.</li>
<li>Finally, they use full simple sentences to talk about themselves.</li>
</ol>

<h3><strong>Activity ideas</strong></h3>
<ul>
<li>You can ask the child to stand in front of a mirror and point to each body part.</li>
<li>You can also play a simple game: say “touch your eyes,” “clap your hands,” or “stamp your feet.”</li>
<li>Another useful activity is drawing a child and labeling the body parts.</li>
<li>A hygiene chart can also be made showing brush teeth, wash hands, bathe, comb hair, and trim nails.</li>
</ul>

<h3><strong>Teacher or parent note</strong></h3>
<p>This chapter should be taught with actions, not only reading. The child should point, touch, repeat, and speak. That makes learning easier and more fun. Praise the child when they say complete sentences, even if the sentence is very small. Gentle repetition works best here.</p>
`.replace(/\n/g, '\\n').replace(/"/g, '\\"');

const familyData = `
    "My Family and Me": {
      content: "${htmlContent}",
      quiz: [
        { question: "What do we use our eyes for?", options: ["Smelling", "Hearing", "Seeing", "Walking"], answer: "Seeing" },
        { question: "Which word is an action word?", options: ["Hand", "Clap", "Nose", "Child"], answer: "Clap" }
      ]
    },
`;

let curriculumData = fs.readFileSync('src/curriculumData.js', 'utf8');
curriculumData = curriculumData.replace('const specificData = {', 'const specificData = {' + familyData);
fs.writeFileSync('src/curriculumData.js', curriculumData);
console.log('curriculumData.js updated');
