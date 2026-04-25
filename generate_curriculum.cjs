const fs = require('fs');

const class1to3 = [
  // Class 1 English
  "A Happy Child", "Three Little Pigs", "After a Bath", "The Bubble, the Straw and the Shoe", "One Little Kitten", "Lalu and Peelu", "Once I Saw a Little Bird", "Mittu and the Yellow Mango", "Merry-Go-Round", "Circle", "If I Were an Apple", "Our Tree", "A Kite", "Sundari", "A Little Turtle", "The Tiger and the Mosquito", "Clouds", "Anandi’s Rainbow",
  // Class 1 Hindi
  "Jhoola", "Aam Ki Kahani", "Aam Ki Tokri", "Patte Hi Patte", "Pakodi", "Chhuk-Chhuk Gaadi", "Rasoighar", "Chuho! Myau So Rahi Hai", "Bandar Aur Gilhari", "Pagdi", "Patang", "Gend-Balla", "Bandar Gaya Khet Mein", "Ek Budhiya", "Main Bhi",
  // Class 1 Math
  "Shapes and Space", "Numbers from One to Nine", "Addition", "Subtraction", "Numbers from Ten to Twenty", "Time", "Measurement", "Numbers from Twenty-One to Fifty", "Data Handling", "Patterns",
  // Class 1 EVS
  "My Family", "My Body", "Food", "Water", "Animals", "Plants",
  
  // Class 2 English
  "First Day at School", "Haldi’s Adventure", "I Am Lucky", "I Want", "A Smile", "The Wind and the Sun", "Rain", "Storm in the Garden", "Zoo Manners", "Funny Bunny", "Mr Nobody", "Curlylocks and the Three Bears",
  // Class 2 Hindi
  "Oont Chala", "Bhalu Ne Kheli Football", "Mera Parivar", "Adhyapak Ji", "Andher Nagari", "Budhiya Ki Topi", "Meethe Bol", "Titli Aur Kali", "Bulbul", "Mera Khilauna",
  // Class 2 Math
  "What is Long, What is Round?", "Counting in Groups", "How Much Can You Carry?", "Counting in Tens", "Footprints", "Jugs and Mugs", "Tens and Ones", "My Funday", "Add Our Points", "Lines and Lines", "Give and Take", "The Longest Step", "Birds Come, Birds Go",
  // Class 2 EVS
  "Family", "Shelter", "Travel", "Plants and Animals",
  
  // Class 3 English
  "Good Morning", "The Magic Garden", "Bird Talk", "Nina and the Baby Sparrows", "Little by Little", "The Enormous Turnip", "Sea Song", "A Little Fish Story", "The Balloon Man", "The Yellow Butterfly",
  // Class 3 Hindi
  "Kakkoo", "Shekhibaz Makkhi", "Chand Wali Amma", "Mann Karta Hai", "Bahadur Bittu", "Humse Sab Kehte", "Tip Tipwa", "Bandar Bant", "Akbar Birbal",
  // Class 3 Math
  "Where to Look From", "Fun with Numbers", "Long and Short", "Shapes and Designs", "Fun with Give and Take", "Time Goes On", "Who is Heavier?", "How Many Times?", "Play with Patterns",
  // Class 3 EVS
  "Poonam’s Day Out", "The Plant Fairy", "Water O Water", "Our First School", "Chhotu’s House", "Foods We Eat", "Saying Without Speaking", "Flying High", "It’s Raining"
];

const oldContent = fs.readFileSync('src/curriculumData.js', 'utf8');

let newContent = oldContent.replace('export const getLessonContent = (title, subject) => {', "export const getLessonContent = (title, subject) => {\\n" +
"  const specificData = {\\n" +
class1to3.map(topic => {
  return "    \"" + topic + "\": {\\n" +
"      content: \"Welcome to the lesson on " + topic + "! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.\",\\n" +
"      quiz: [\\n" +
"        { question: \"What is a key concept in " + topic + "?\", options: [\"Option A\", \"Option B\", \"Option C\", \"Option D\"], answer: \"Option A\" },\\n" +
"        { question: \"What do we learn from " + topic + "?\", options: [\"Values\", \"Numbers\", \"Language\", \"Nature\"], answer: \"Values\" }\\n" +
"      ]\\n" +
"    }";
}).join(',\\n') +
"\\n  };\\n\\n" +
"  for (const key in specificData) {\\n" +
"    if (title.includes(key)) {\\n" +
"      return specificData[key];\\n" +
"    }\\n" +
"  }\\n"
);

fs.writeFileSync('src/curriculumData.js', newContent);
console.log('curriculumData.js updated');
