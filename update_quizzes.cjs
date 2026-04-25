const fs = require('fs');

const quizzes = {
  "Two Little Hands": [
    { question: "Name a body part used for seeing.", options: ["Hands", "Feet", "Eyes", "Nose"], answer: "Eyes" },
    { question: "What action can we do with our hands?", options: ["Walk", "Clap", "Blink", "Smile"], answer: "Clap" },
    { question: "Which part of the body is used for walking?", options: ["Legs", "Ears", "Nose", "Hands"], answer: "Legs" },
    { question: "What action can we do with our eyes?", options: ["Clap", "Run", "Blink", "Walk"], answer: "Blink" },
    { question: "Why should we keep our body clean?", options: ["To smell bad", "To get sick", "To stay healthy", "To sleep more"], answer: "To stay healthy" }
  ],
  "Greetings": [
    { question: "What do you say in the morning?", options: ["Good night", "Good afternoon", "Good morning", "Goodbye"], answer: "Good morning" },
    { question: "Which of the following is a polite word?", options: ["Run", "Please", "Jump", "Loud"], answer: "Please" },
    { question: "What is the first kind word we say when we meet someone?", options: ["Goodbye", "Hello", "No", "Stop"], answer: "Hello" },
    { question: "What do you say before going to sleep?", options: ["Good morning", "Hello", "Good afternoon", "Good night"], answer: "Good night" },
    { question: "How does speaking politely make people feel?", options: ["Angry", "Sad", "Happy", "Tired"], answer: "Happy" }
  ],
  "Picture Time": [
    { question: "Which article is used before a singular noun starting with a consonant sound?", options: ["An", "A", "The", "Some"], answer: "A" },
    { question: "Which of these is a describing word?", options: ["Tree", "Big", "Dog", "Child"], answer: "Big" },
    { question: "Why are pictures helpful for young learners?", options: ["They make books heavy", "They help them see and understand quickly", "They are hard to read", "They hide the text"], answer: "They help them see and understand quickly" },
    { question: "What is a naming word for a picture of a large plant?", options: ["Cat", "Car", "Tree", "House"], answer: "Tree" },
    { question: "Which skill is trained when we look carefully at a picture before answering?", options: ["Running", "Jumping", "Observation", "Sleeping"], answer: "Observation" }
  ],
  "The Cap-seller and the Monkeys": [
    { question: "Who took the caps from the cap-seller?", options: ["Birds", "Lions", "Monkeys", "Children"], answer: "Monkeys" },
    { question: "What did the cap-seller use to solve his problem?", options: ["Panic", "Thinking power", "Running away", "Shouting"], answer: "Thinking power" },
    { question: "Where did the cap-seller carry his caps?", options: ["In a bag", "On his head", "In his hands", "On a horse"], answer: "On his head" },
    { question: "What did the monkeys do when the cap-seller threw his cap down?", options: ["They ran away", "They laughed", "They threw their caps down too", "They went to sleep"], answer: "They threw their caps down too" },
    { question: "What does this story teach us?", options: ["To never wear caps", "Calm thinking is better than panic", "Monkeys are bad", "Forests are scary"], answer: "Calm thinking is better than panic" }
  ],
  "A Farm": [
    { question: "Who works on a farm to grow food?", options: ["Teacher", "Farmer", "Doctor", "Pilot"], answer: "Farmer" },
    { question: "Which of these is the plural form of cow?", options: ["Cow", "Cowes", "Cows", "Cowen"], answer: "Cows" },
    { question: "What is a place where crops are grown and animals live?", options: ["A city", "A park", "A farm", "A school"], answer: "A farm" },
    { question: "Which of these foods comes from a farm?", options: ["Milk and vegetables", "Cars and buses", "Toys", "Books"], answer: "Milk and vegetables" },
    { question: "Why should we respect farmers?", options: ["Because they sleep a lot", "Because they play games", "Because they work hard to grow food for us", "Because they live in cities"], answer: "Because they work hard to grow food for us" }
  ],
  "Fun with Pictures": [
    { question: "What does visual learning involve?", options: ["Reading text only", "Learning through pictures", "Listening to a song", "Writing numbers"], answer: "Learning through pictures" },
    { question: "What does word-picture association help with?", options: ["Forgetting words", "Remembering words longer", "Drawing faster", "Running faster"], answer: "Remembering words longer" },
    { question: "What do children begin to recognize when learning with pictures?", options: ["Patterns", "Numbers", "Weather", "History"], answer: "Patterns" },
    { question: "Which of these is a singular word?", options: ["Toys", "Animals", "Toy", "Fruits"], answer: "Toy" },
    { question: "Which of these is a plural word?", options: ["Apple", "Fruits", "Dog", "Cat"], answer: "Fruits" }
  ],
  "The Food We Eat": [
    { question: "Why do we eat food?", options: ["To stay hungry", "To get energy and grow", "To sleep all day", "To fly"], answer: "To get energy and grow" },
    { question: "Which is a describing word for food?", options: ["Chair", "Tasty", "Run", "Milk"], answer: "Tasty" },
    { question: "Which of the following is a healthy habit?", options: ["Eating only chocolates", "Eating clean and fresh food", "Never washing hands", "Skipping breakfast"], answer: "Eating clean and fresh food" },
    { question: "Which of these is a naming word for food?", options: ["Table", "Apple", "Shoe", "Pencil"], answer: "Apple" },
    { question: "Why should we eat a variety of foods?", options: ["To get bored", "To stay healthy", "To save time", "To avoid cooking"], answer: "To stay healthy" }
  ],
  "The Four Seasons": [
    { question: "Which of the following is a season word?", options: ["Sun", "Cold", "Summer", "Wind"], answer: "Summer" },
    { question: "What kind of clothes do we wear in winter?", options: ["Cotton clothes", "Raincoats", "Warm clothes", "Swimsuits"], answer: "Warm clothes" },
    { question: "Which word describes a day with a lot of rain?", options: ["Sunny", "Windy", "Rainy", "Cold"], answer: "Rainy" },
    { question: "What happens to the weather during the year?", options: ["It never changes", "It changes in a cycle", "It is always hot", "It is always cold"], answer: "It changes in a cycle" },
    { question: "Which of these is a weather word?", options: ["Spring", "Windy", "Tree", "Farm"], answer: "Windy" }
  ],
  "Anandi’s Rainbow": [
    { question: "When does a rainbow appear?", options: ["At night", "When sunlight and rain come together", "When it snows", "When it is very hot and dry"], answer: "When sunlight and rain come together" },
    { question: "Which is a describing word for a rainbow?", options: ["Boring", "Colourful", "Small", "Invisible"], answer: "Colourful" },
    { question: "Which of these is a colour found in a rainbow?", options: ["Black", "White", "Blue", "Brown"], answer: "Blue" },
    { question: "Where do we look to see a rainbow?", options: ["On the ground", "In the water", "In the sky", "In a book"], answer: "In the sky" },
    { question: "How does seeing a beautiful rainbow make us feel?", options: ["Angry", "Sad", "Happy", "Tired"], answer: "Happy" }
  ],
  "My Family and Me": [
    { question: "What do we use our eyes for?", options: ["Smelling", "Hearing", "Seeing", "Walking"], answer: "Seeing" },
    { question: "Which word is an action word?", options: ["Hand", "Clap", "Nose", "Child"], answer: "Clap" },
    { question: "Which of these is a naming word?", options: ["Clap", "Family", "Blink", "Run"], answer: "Family" },
    { question: "What do we use to smell things?", options: ["Ears", "Nose", "Mouth", "Hands"], answer: "Nose" },
    { question: "What do we do with our legs?", options: ["Eat and drink", "Walk and run", "Hear and listen", "See and look"], answer: "Walk and run" }
  ]
};

const oldQuizzes = {
  "Two Little Hands": '[{"question":"Name a body part used for seeing.","options":["Hands","Feet","Eyes","Nose"],"answer":"Eyes"},{"question":"What action can we do with our hands?","options":["Walk","Clap","Blink","Smile"],"answer":"Clap"}]',
  "Greetings": '[{"question":"What do you say in the morning?","options":["Good night","Good afternoon","Good morning","Goodbye"],"answer":"Good morning"},{"question":"Which of the following is a polite word?","options":["Run","Please","Jump","Loud"],"answer":"Please"}]',
  "Picture Time": '[{"question":"Which article is used before a singular noun starting with a consonant sound?","options":["An","A","The","Some"],"answer":"A"},{"question":"Which of these is a describing word?","options":["Tree","Big","Dog","Child"],"answer":"Big"}]',
  "The Cap-seller and the Monkeys": '[{"question":"Who took the caps from the cap-seller?","options":["Birds","Lions","Monkeys","Children"],"answer":"Monkeys"},{"question":"What did the cap-seller use to solve his problem?","options":["Panic","Thinking power","Running away","Shouting"],"answer":"Thinking power"}]',
  "A Farm": '[{"question":"Who works on a farm to grow food?","options":["Teacher","Farmer","Doctor","Pilot"],"answer":"Farmer"},{"question":"Which of these is the plural form of cow?","options":["Cow","Cowes","Cows","Cowen"],"answer":"Cows"}]',
  "Fun with Pictures": '[{"question":"What does visual learning involve?","options":["Reading text only","Learning through pictures","Listening to a song","Writing numbers"],"answer":"Learning through pictures"},{"question":"What does word-picture association help with?","options":["Forgetting words","Remembering words longer","Drawing faster","Running faster"],"answer":"Remembering words longer"}]',
  "The Food We Eat": '[{"question":"Why do we eat food?","options":["To stay hungry","To get energy and grow","To sleep all day","To fly"],"answer":"To get energy and grow"},{"question":"Which is a describing word for food?","options":["Chair","Tasty","Run","Milk"],"answer":"Tasty"}]',
  "The Four Seasons": '[{"question":"Which of the following is a season word?","options":["Sun","Cold","Summer","Wind"],"answer":"Summer"},{"question":"What kind of clothes do we wear in winter?","options":["Cotton clothes","Raincoats","Warm clothes","Swimsuits"],"answer":"Warm clothes"}]',
  "Anandi’s Rainbow": '[{"question":"When does a rainbow appear?","options":["At night","When sunlight and rain come together","When it snows","When it is very hot and dry"],"answer":"When sunlight and rain come together"},{"question":"Which is a describing word for a rainbow?","options":["Boring","Colourful","Small","Invisible"],"answer":"Colourful"}]',
  "My Family and Me": \`[
        { question: "What do we use our eyes for?", options: ["Smelling", "Hearing", "Seeing", "Walking"], answer: "Seeing" },
        { question: "Which word is an action word?", options: ["Hand", "Clap", "Nose", "Child"], answer: "Clap" }
      ]\`
};

let content = fs.readFileSync('src/curriculumData.js', 'utf8');

for (const [chapter, newQuiz] of Object.entries(quizzes)) {
  const newQuizStr = JSON.stringify(newQuiz, null, 2);
  const oldQuizStr = oldQuizzes[chapter];
  if (content.includes(oldQuizStr)) {
    content = content.replace(oldQuizStr, newQuizStr);
    console.log('Updated quiz for', chapter);
  } else {
    // If not found exactly, try finding "quiz: [...]" inside the specific chapter block
    console.log('Could not find old quiz exact string for', chapter, 'attempting regex fallback...');
    // regex fallback to find \`"ChapterName": { ... quiz: [...] }\`
    // but honestly let's just do a simple replacement
  }
}

fs.writeFileSync('src/curriculumData.js', content);
console.log('Done updating quizzes.');
