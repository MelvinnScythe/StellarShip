const fs = require('fs');

const class1English = ["A Happy Child", "Three Little Pigs", "After a Bath", "The Bubble, the Straw and the Shoe", "One Little Kitten", "Lalu and Peelu", "Once I Saw a Little Bird", "Mittu and the Yellow Mango", "Merry-Go-Round", "Circle", "If I Were an Apple", "Our Tree", "A Kite", "Sundari", "A Little Turtle", "The Tiger and the Mosquito", "Clouds", "Anandi’s Rainbow"];
const class1Hindi = ["Jhoola", "Aam Ki Kahani", "Aam Ki Tokri", "Patte Hi Patte", "Pakodi", "Chhuk-Chhuk Gaadi", "Rasoighar", "Chuho! Myau So Rahi Hai", "Bandar Aur Gilhari", "Pagdi", "Patang", "Gend-Balla", "Bandar Gaya Khet Mein", "Ek Budhiya", "Main Bhi"];
const class1Math = ["Shapes and Space", "Numbers from One to Nine", "Addition", "Subtraction", "Numbers from Ten to Twenty", "Time", "Measurement", "Numbers from Twenty-One to Fifty", "Data Handling", "Patterns"];
const class1EVS = ["My Family", "My Body", "Food", "Water", "Animals", "Plants"];

const class2English = ["First Day at School", "Haldi’s Adventure", "I Am Lucky", "I Want", "A Smile", "The Wind and the Sun", "Rain", "Storm in the Garden", "Zoo Manners", "Funny Bunny", "Mr Nobody", "Curlylocks and the Three Bears"];
const class2Hindi = ["Oont Chala", "Bhalu Ne Kheli Football", "Mera Parivar", "Adhyapak Ji", "Andher Nagari", "Budhiya Ki Topi", "Meethe Bol", "Titli Aur Kali", "Bulbul", "Mera Khilauna"];
const class2Math = ["What is Long, What is Round?", "Counting in Groups", "How Much Can You Carry?", "Counting in Tens", "Patterns", "Footprints", "Jugs and Mugs", "Tens and Ones", "My Funday", "Add Our Points", "Lines and Lines", "Give and Take", "The Longest Step", "Birds Come, Birds Go"];
const class2EVS = ["Family", "Food", "Shelter", "Travel", "Water", "Plants and Animals"];

const class3English = ["Good Morning", "The Magic Garden", "Bird Talk", "Nina and the Baby Sparrows", "Little by Little", "The Enormous Turnip", "Sea Song", "A Little Fish Story", "The Balloon Man", "The Yellow Butterfly"];
const class3Hindi = ["Kakkoo", "Shekhibaz Makkhi", "Chand Wali Amma", "Mann Karta Hai", "Bahadur Bittu", "Humse Sab Kehte", "Tip Tipwa", "Bandar Bant", "Akbar Birbal"];
const class3Math = ["Where to Look From", "Fun with Numbers", "Give and Take", "Long and Short", "Shapes and Designs", "Fun with Give and Take", "Time Goes On", "Who is Heavier?", "How Many Times?", "Play with Patterns"];
const class3EVS = ["Poonam’s Day Out", "The Plant Fairy", "Water O Water", "Our First School", "Chhotu’s House", "Foods We Eat", "Saying Without Speaking", "Flying High", "It’s Raining"];

const buildArr = (subName, arr, xp) => arr.map(t => `{ subject: "${subName}", title: "${t}", xp: ${xp} }`);

const c1 = [
  ...buildArr("English", class1English, 10),
  ...buildArr("Hindi", class1Hindi, 10),
  ...buildArr("Mathematics", class1Math, 15),
  ...buildArr("EVS", class1EVS, 10)
].join(',\\n          ');

const c2 = [
  ...buildArr("English", class2English, 15),
  ...buildArr("Hindi", class2Hindi, 15),
  ...buildArr("Mathematics", class2Math, 20),
  ...buildArr("EVS", class2EVS, 15)
].join(',\\n          ');

const c3 = [
  ...buildArr("English", class3English, 20),
  ...buildArr("Hindi", class3Hindi, 20),
  ...buildArr("Mathematics", class3Math, 25),
  ...buildArr("EVS", class3EVS, 20)
].join(',\\n          ');


const targetSubjects = `  const getInitialSubjects = () => [
    { id: 1, name: "Mathematics", lessons: 0, totalLessons: 48, progress: 0, color: "#facc15" },
    { id: 2, name: "Physics", lessons: 0, totalLessons: 32, progress: 0, color: "#a855f7" },
    { id: 3, name: "Chemistry", lessons: 0, totalLessons: 40, progress: 0, color: "#2dd4bf" },
    { id: 4, name: "Biology", lessons: 0, totalLessons: 36, progress: 0, color: "#f87171" },
    { id: 5, name: "Literature", lessons: 0, totalLessons: 28, progress: 0, color: "#fb923c" },
    { id: 6, name: "History", lessons: 0, totalLessons: 44, progress: 0, color: "#94a3b8" }
  ];`;

const replacementSubjects = `  const getInitialSubjects = () => [
    { id: 1, name: "Mathematics", lessons: 0, totalLessons: 150, progress: 0, color: "#facc15" },
    { id: 2, name: "Physics", lessons: 0, totalLessons: 50, progress: 0, color: "#a855f7" },
    { id: 3, name: "Chemistry", lessons: 0, totalLessons: 50, progress: 0, color: "#2dd4bf" },
    { id: 4, name: "Biology", lessons: 0, totalLessons: 50, progress: 0, color: "#f87171" },
    { id: 5, name: "Literature", lessons: 0, totalLessons: 50, progress: 0, color: "#fb923c" },
    { id: 6, name: "History", lessons: 0, totalLessons: 50, progress: 0, color: "#94a3b8" },
    { id: 7, name: "English", lessons: 0, totalLessons: 80, progress: 0, color: "#3b82f6" },
    { id: 8, name: "Hindi", lessons: 0, totalLessons: 80, progress: 0, color: "#ec4899" },
    { id: 9, name: "EVS", lessons: 0, totalLessons: 80, progress: 0, color: "#10b981" }
  ];`;


const targetNcert = `        1: [
          { subject: "Mathematics", title: "Shapes and Space", xp: 30 },
          { subject: "Mathematics", title: "Numbers from One to Nine", xp: 35 },
          { subject: "Mathematics", title: "Addition", xp: 40 },
          { subject: "Mathematics", title: "Subtraction", xp: 40 }
        ],
        2: [
          { subject: "Mathematics", title: "What is Long, What is Round?", xp: 40 },
          { subject: "Mathematics", title: "Counting in Groups", xp: 45 },
          { subject: "Mathematics", title: "How Much Can You Carry?", xp: 40 },
          { subject: "Mathematics", title: "Counting in Tens", xp: 50 }
        ],
        3: [
          { subject: "Mathematics", title: "Where to Look From", xp: 45 },
          { subject: "Mathematics", title: "Fun with Numbers", xp: 50 },
          { subject: "Biology", title: "Poonam's Day Out", xp: 45 },
          { subject: "Biology", title: "The Plant Fairy", xp: 45 }
        ],`;

const replacementNcert = `        1: [
          ${c1}
        ],
        2: [
          ${c2}
        ],
        3: [
          ${c3}
        ],`;

const appPath = 'src/App.jsx';
let appContent = fs.readFileSync(appPath, 'utf8');
appContent = appContent.replace(targetSubjects, replacementSubjects);
appContent = appContent.replace(targetNcert, replacementNcert);
fs.writeFileSync(appPath, appContent);
console.log('App.jsx updated');
