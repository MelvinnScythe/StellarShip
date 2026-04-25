const fs = require('fs');

// 1. Update App.jsx
let appContent = fs.readFileSync('src/App.jsx', 'utf8');

const oldEnglishStart = '{ subject: "English", title: "My Family and Me", xp: 15 },';
const oldEnglishEnd = '{ subject: "English", title: "Anandi’s Rainbow", xp: 10 },';

const startIndex = appContent.indexOf(oldEnglishStart);
const endIndex = appContent.indexOf(oldEnglishEnd) + oldEnglishEnd.length;

if (startIndex !== -1 && endIndex !== -1) {
  const newEnglishChapters = [
    '          { subject: "English", title: "Two Little Hands", xp: 15 },',
    '          { subject: "English", title: "Greetings", xp: 15 },',
    '          { subject: "English", title: "Picture Time", xp: 15 },',
    '          { subject: "English", title: "The Cap-seller and the Monkeys", xp: 15 },',
    '          { subject: "English", title: "A Farm", xp: 15 },',
    '          { subject: "English", title: "Fun with Pictures", xp: 15 },',
    '          { subject: "English", title: "The Food We Eat", xp: 15 },',
    '          { subject: "English", title: "The Four Seasons", xp: 15 },',
    '          { subject: "English", title: "Anandi’s Rainbow", xp: 15 },'
  ].join('\\n');

  appContent = appContent.substring(0, startIndex) + newEnglishChapters + appContent.substring(endIndex);
  fs.writeFileSync('src/App.jsx', appContent);
  console.log('App.jsx updated with new Class 1 English chapters');
} else {
  console.log('Could not find the block in App.jsx');
}

// 2. Update curriculumData.js
const chaptersData = {
  "Two Little Hands": {
    content: "<h3><strong>Main focus: Body parts, actions, hygiene</strong></h3>\\n<p><strong>Detailed explanation:</strong> This poem helps children learn about their own body in a fun and gentle way. It talks about hands, feet, eyes, and other parts that we use every day. Children understand that hands clap, feet move, and eyes help us see. The poem also reminds us to keep our body clean and healthy. It is a good first chapter because children can point to their own body while reading, so the words become easy to remember.</p>\\n<h3><strong>Grammar focus:</strong></h3>\\n<ul>\\n<li><strong>Naming words:</strong> hand, eye, leg, face, body</li>\\n<li><strong>Action words:</strong> clap, blink, walk, run, smile</li>\\n<li><strong>Simple sentence:</strong> I clap with my hands.</li>\\n<li><strong>This is / These are</strong> for talking about body parts.</li>\\n</ul>\\n<h3><strong>Activities:</strong></h3>\\n<ul>\\n<li>Touch and name body parts in front of a mirror.</li>\\n<li>Play a simple action game: clap, blink, walk, smile.</li>\\n<li>Draw a child and label the body parts.</li>\\n</ul>",
    quiz: [
      { question: "Name a body part used for seeing.", options: ["Hands", "Feet", "Eyes", "Nose"], answer: "Eyes" },
      { question: "What action can we do with our hands?", options: ["Walk", "Clap", "Blink", "Smile"], answer: "Clap" }
    ]
  },
  "Greetings": {
    content: "<h3><strong>Main focus: Polite language and speaking to others</strong></h3>\\n<p><strong>Detailed explanation:</strong> This chapter teaches children how to greet people politely. A greeting is the first kind word we say when we meet someone. Children learn words like good morning, good afternoon, and good night. They also learn that a smile and polite behaviour make people feel happy. The lesson builds good habits, because speaking politely is an important part of daily life. Children can use these words at school, at home, and with friends.</p>\\n<h3><strong>Grammar focus:</strong></h3>\\n<ul>\\n<li><strong>Polite words:</strong> hello, good morning, thank you, please</li>\\n<li>Capital letters at the beginning of sentences</li>\\n<li>Use of full stops at the end of simple sentences</li>\\n<li>Talking to one person politely</li>\\n</ul>\\n<h3><strong>Activities:</strong></h3>\\n<ul>\\n<li>Role-play meeting a teacher, friend, or elder.</li>\\n<li>Say different greetings at different times of day.</li>\\n<li>Make greeting cards for family members.</li>\\n</ul>",
    quiz: [
      { question: "What do you say in the morning?", options: ["Good night", "Good afternoon", "Good morning", "Goodbye"], answer: "Good morning" },
      { question: "Which of the following is a polite word?", options: ["Run", "Please", "Jump", "Loud"], answer: "Please" }
    ]
  },
  "Picture Time": {
    content: "<h3><strong>Main focus: Observation, speaking, naming pictures</strong></h3>\\n<p><strong>Detailed explanation:</strong> This chapter uses pictures to help children think and speak. Pictures are very helpful for young learners because they can see and understand quickly. Children learn to look carefully, notice small details, and say what they see. They may talk about people, animals, things, and actions in the pictures. This builds both vocabulary and speaking confidence. It also trains the child to observe before answering, which is an important learning skill.</p>\\n<h3><strong>Grammar focus:</strong></h3>\\n<ul>\\n<li><strong>Naming words from pictures:</strong> dog, tree, ball, child</li>\\n<li>Use of 'a' and 'an' before singular nouns</li>\\n<li>Simple describing words: big, small, happy, red</li>\\n<li>Speaking in complete sentences</li>\\n</ul>\\n<h3><strong>Activities:</strong></h3>\\n<ul>\\n<li>Look at a picture and say five things you can see.</li>\\n<li>Color a picture and name the objects in it.</li>\\n<li>Match words with picture cards.</li>\\n</ul>",
    quiz: [
      { question: "Which article is used before a singular noun starting with a consonant sound?", options: ["An", "A", "The", "Some"], answer: "A" },
      { question: "Which of these is a describing word?", options: ["Tree", "Big", "Dog", "Child"], answer: "Big" }
    ]
  },
  "The Cap-seller and the Monkeys": {
    content: "<h3><strong>Main focus: Story, problem solving, listening</strong></h3>\\n<p><strong>Detailed explanation:</strong> This story is about a cap-seller who carries caps on his head and walks through a forest. The monkeys watch him and take the caps when he sleeps. The cap-seller becomes worried, but he uses his thinking power to solve the problem. He shows the monkeys that copying him will not help them. The story is interesting because it teaches children that calm thinking is better than panic. It also shows that smart ideas can solve difficult situations.</p>\\n<h3><strong>Grammar focus:</strong></h3>\\n<ul>\\n<li><strong>Story words:</strong> cap-seller, monkeys, forest, sleep</li>\\n<li><strong>Action words:</strong> carry, take, throw, sleep</li>\\n<li>Use of past action in simple storytelling</li>\\n<li>Naming people and animals</li>\\n</ul>\\n<h3><strong>Activities:</strong></h3>\\n<ul>\\n<li>Act out the story in class or at home.</li>\\n<li>Draw the cap-seller and the monkeys.</li>\\n<li>Talk about a time when you solved a small problem.</li>\\n</ul>",
    quiz: [
      { question: "Who took the caps from the cap-seller?", options: ["Birds", "Lions", "Monkeys", "Children"], answer: "Monkeys" },
      { question: "What did the cap-seller use to solve his problem?", options: ["Panic", "Thinking power", "Running away", "Shouting"], answer: "Thinking power" }
    ]
  },
  "A Farm": {
    content: "<h3><strong>Main focus: Farm life, animals, food, places</strong></h3>\\n<p><strong>Detailed explanation:</strong> This chapter takes children to a farm, which is a place where crops are grown and animals live. Children learn that farms give us food like vegetables, grains, milk, and eggs. They also see that farmers work very hard to grow food for everyone. The chapter helps children understand the connection between nature, food, and the people who grow it. It is useful because it builds respect for farmers and for the food on our plate. Children can relate this to their own meals and the world around them.</p>\\n<h3><strong>Grammar focus:</strong></h3>\\n<ul>\\n<li><strong>Naming words:</strong> farm, farmer, cow, goat, crop</li>\\n<li><strong>Plural forms:</strong> cow/cows, crop/crops</li>\\n<li><strong>Describing words:</strong> green field, big farm</li>\\n<li><strong>Sentence:</strong> The farmer grows crops.</li>\\n</ul>\\n<h3><strong>Activities:</strong></h3>\\n<ul>\\n<li>Draw a farm scene with animals and crops.</li>\\n<li>Name foods that come from farms.</li>\\n<li>Sort food into plant food and animal food.</li>\\n</ul>",
    quiz: [
      { question: "Who works on a farm to grow food?", options: ["Teacher", "Farmer", "Doctor", "Pilot"], answer: "Farmer" },
      { question: "Which of these is the plural form of cow?", options: ["Cow", "Cowes", "Cows", "Cowen"], answer: "Cows" }
    ]
  },
  "Fun with Pictures": {
    content: "<h3><strong>Main focus: Vocabulary building through visual learning</strong></h3>\\n<p><strong>Detailed explanation:</strong> This chapter helps children learn through pictures, which makes reading easier and more enjoyable. Young learners often understand better when they can see objects and actions before reading the words. The chapter may include animals, toys, fruits, or daily life objects. Children learn to connect each picture with its name and meaning. This helps them remember words for a longer time. It also prepares them to read independently because they begin to recognize patterns in what they see.</p>\\n<h3><strong>Grammar focus:</strong></h3>\\n<ul>\\n<li>Naming words from visual objects</li>\\n<li>Singular and plural recognition</li>\\n<li>Word-picture association</li>\\n<li>Basic sentence building</li>\\n</ul>\\n<h3><strong>Activities:</strong></h3>\\n<ul>\\n<li>Make flashcards with pictures and words.</li>\\n<li>Tell a story from a set of pictures.</li>\\n<li>Point to objects and say their names.</li>\\n</ul>",
    quiz: [
      { question: "What does visual learning involve?", options: ["Reading text only", "Learning through pictures", "Listening to a song", "Writing numbers"], answer: "Learning through pictures" },
      { question: "What does word-picture association help with?", options: ["Forgetting words", "Remembering words longer", "Drawing faster", "Running faster"], answer: "Remembering words longer" }
    ]
  },
  "The Food We Eat": {
    content: "<h3><strong>Main focus: Food, health, and daily habits</strong></h3>\\n<p><strong>Detailed explanation:</strong> This chapter teaches children about the food we eat every day. It shows that food gives us energy, helps us grow, and keeps us healthy. Children can learn to name fruits, vegetables, grains, milk, and other simple foods. The chapter also helps them understand that clean and healthy food is better for the body. It may also encourage children to eat a variety of foods rather than only one kind. This makes the chapter important for both language learning and health awareness.</p>\\n<h3><strong>Grammar focus:</strong></h3>\\n<ul>\\n<li><strong>Food names:</strong> apple, rice, milk, banana, chapati</li>\\n<li>Singular and plural food words</li>\\n<li><strong>Describing words:</strong> tasty, fresh, hot, sweet</li>\\n<li><strong>Sentence:</strong> I eat an apple.</li>\\n</ul>\\n<h3><strong>Activities:</strong></h3>\\n<ul>\\n<li>Make a healthy food chart.</li>\\n<li>Sort foods into fruits, vegetables, and grains.</li>\\n<li>Talk about your favorite healthy breakfast.</li>\\n</ul>",
    quiz: [
      { question: "Why do we eat food?", options: ["To stay hungry", "To get energy and grow", "To sleep all day", "To fly"], answer: "To get energy and grow" },
      { question: "Which is a describing word for food?", options: ["Chair", "Tasty", "Run", "Milk"], answer: "Tasty" }
    ]
  },
  "The Four Seasons": {
    content: "<h3><strong>Main focus: Nature, weather, seasonal change</strong></h3>\\n<p><strong>Detailed explanation:</strong> This chapter introduces children to the idea that weather changes during the year. Some days are hot, some are cold, some bring rain, and some feel pleasant. Children learn that different seasons need different clothes, food, and habits. This is a useful chapter because it connects English with real life. Children can understand that nature changes in a cycle and that we should observe the sky and weather. The lesson also builds vocabulary related to rain, sun, wind, and cold.</p\\n<h3><strong>Grammar focus:</strong></h3>\\n<ul>\\n<li><strong>Season words:</strong> summer, winter, rainy, spring</li>\\n<li><strong>Weather words:</strong> hot, cold, windy, sunny</li>\\n<li>Use of 'is' and 'are' in simple sentences</li>\\n<li>Describing the weather</li>\\n</ul>\\n<h3><strong>Activities:</strong></h3>\\n<ul>\\n<li>Make a seasons wheel with drawings.</li>\\n<li>Say what clothes we wear in each season.</li>\\n<li>Draw a rainy day and a sunny day.</li>\\n</ul>",
    quiz: [
      { question: "Which of the following is a season word?", options: ["Sun", "Cold", "Summer", "Wind"], answer: "Summer" },
      { question: "What kind of clothes do we wear in winter?", options: ["Cotton clothes", "Raincoats", "Warm clothes", "Swimsuits"], answer: "Warm clothes" }
    ]
  },
  "Anandi’s Rainbow": {
    content: "<h3><strong>Main focus: Colours, beauty of nature, observation</strong></h3>\\n<p><strong>Detailed explanation:</strong> This chapter shows the beauty of a rainbow in the sky. A rainbow appears when sunlight and rain come together in the right way. Children enjoy learning the names of colours because colours are easy to see and remember. The story encourages children to look at nature carefully and feel happy about it. It also builds curiosity because children often ask when and why a rainbow appears. This makes science, language, and imagination come together in one lovely chapter.</p>\\n<h3><strong>Grammar focus:</strong></h3>\\n<ul>\\n<li><strong>Colour words:</strong> red, blue, green, yellow, orange</li>\\n<li><strong>Describing words:</strong> bright, beautiful, colourful</li>\\n<li><strong>Simple sentence:</strong> The rainbow is colourful.</li>\\n<li>Using 'looks' and 'is' in short sentences</li>\\n</ul>\\n<h3><strong>Activities:</strong></h3>\\n<ul>\\n<li>Draw and colour a rainbow.</li>\\n<li>Name colours around you in the room.</li>\\n<li>Make a colour matching game.</li>\\n</ul>",
    quiz: [
      { question: "When does a rainbow appear?", options: ["At night", "When sunlight and rain come together", "When it snows", "When it is very hot and dry"], answer: "When sunlight and rain come together" },
      { question: "Which is a describing word for a rainbow?", options: ["Boring", "Colourful", "Small", "Invisible"], answer: "Colourful" }
    ]
  }
};

let curriculumData = fs.readFileSync('src/curriculumData.js', 'utf8');

let insertedData = "";
for (const [title, data] of Object.entries(chaptersData)) {
  const contentSafe = data.content.replace(/\\n/g, '\\\\n').replace(/"/g, '\\\\"');
  const quizSafe = JSON.stringify(data.quiz);
  insertedData += '    "' + title + '": {\\n      content: "' + contentSafe + '",\\n      quiz: ' + quizSafe + '\\n    },\\n';
}

if (!curriculumData.includes("Two Little Hands")) {
  curriculumData = curriculumData.replace('const specificData = {', 'const specificData = {\\n' + insertedData);
  fs.writeFileSync('src/curriculumData.js', curriculumData);
  console.log('curriculumData.js updated with new chapters');
} else {
  console.log('curriculumData.js already contains new chapters');
}
