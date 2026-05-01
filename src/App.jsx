import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import Subjects from './components/Subjects';
import Dashboard from './components/Dashboard';
import BackgroundStars from './components/BackgroundStars';
import LessonPage from './components/LessonPage';
import Auth from './components/Auth';
import { getLessonContent } from './curriculumData';
import AITutor from './components/AITutor';
import StudyTools from './components/StudyTools';

function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('antigravity_current_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.error("Failed to parse user", e);
      return null;
    }
  });
  const [selectedClass, setSelectedClass] = useState(currentUser?.selectedClass || 1);
  const [selectedBoard, setSelectedBoard] = useState("CBSE");
  const [activeLesson, setActiveLesson] = useState(null);

  const handleLogin = (user, token) => {
    setCurrentUser(user);
    if (user.selectedClass) setSelectedClass(user.selectedClass);
    if (user.xpEarned !== undefined) {
      setUserStats(prev => ({ ...prev, xpEarned: user.xpEarned, level: user.level || 1, streak: user.streak || 0 }));
    }
    localStorage.setItem('antigravity_current_user', JSON.stringify(user));
    if (token) localStorage.setItem('antigravity_token', token);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('antigravity_current_user');
    localStorage.removeItem('antigravity_token');
  };

  // Global User State
  const [userStats, setUserStats] = useState({
    studyTime: 0,
    lessonsCompleted: 0,
    xpEarned: currentUser?.xpEarned || 0,
    nextGoal: "3 days until Math Exam",
    streak: currentUser?.streak || 0,
    level: currentUser?.level || 1
  });

  // Sync Progress to Backend
  useEffect(() => {
    if (currentUser) {
      const token = localStorage.getItem('antigravity_token');
      if (token) {
        fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/users/progress`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            xpEarned: userStats.xpEarned,
            level: userStats.level,
            selectedClass: selectedClass,
            streak: userStats.streak
          })
        }).catch(e => console.error('Failed to sync progress:', e));
      }
    }
  }, [userStats.xpEarned, userStats.level, selectedClass, userStats.streak, currentUser]);

  const getInitialSubjects = (classNum) => {
    const allSubjects = [
      { id: 1, name: "Mathematics", lessons: 0, totalLessons: 20, progress: 0, color: "#facc15" },
      { id: 2, name: "Physics", lessons: 0, totalLessons: 15, progress: 0, color: "#a855f7" },
      { id: 3, name: "Chemistry", lessons: 0, totalLessons: 15, progress: 0, color: "#2dd4bf" },
      { id: 4, name: "Biology", lessons: 0, totalLessons: 15, progress: 0, color: "#f87171" },
      { id: 5, name: "Literature", lessons: 0, totalLessons: 15, progress: 0, color: "#fb923c" },
      { id: 6, name: "History", lessons: 0, totalLessons: 15, progress: 0, color: "#94a3b8" },
      { id: 7, name: "English", lessons: 0, totalLessons: 30, progress: 0, color: "#3b82f6" },
      { id: 8, name: "Hindi", lessons: 0, totalLessons: 25, progress: 0, color: "#ec4899" },
      { id: 9, name: "EVS", lessons: 0, totalLessons: 25, progress: 0, color: "#10b981" },
      { id: 10, name: "Science", lessons: 0, totalLessons: 20, progress: 0, color: "#2dd4bf" },
      { id: 11, name: "Social Studies", lessons: 0, totalLessons: 20, progress: 0, color: "#94a3b8" }
    ];

    if (classNum <= 3) {
      // Primary classes (1-3)
      return allSubjects.filter(s => ["Mathematics", "English", "Hindi", "EVS"].includes(s.name))
        .map(s => {
          if (s.name === "EVS") return { ...s, totalLessons: 54 }; // 9 chapters * 6
          if (s.name === "English") return { ...s, totalLessons: 60 }; // 10 chapters * 6
          if (s.name === "Mathematics") return { ...s, totalLessons: 60 }; // 10 chapters * 6
          if (s.name === "Hindi") return { ...s, totalLessons: 90 }; // 15 chapters * 6
          return s;
        });
    } else if (classNum <= 5) {
      // Upper primary (4-5) - using EVS instead of Bio/Physics
      return allSubjects.filter(s => ["Mathematics", "English", "Hindi", "EVS"].includes(s.name));
    } else if (classNum <= 8) {
      return allSubjects.filter(s => ["Mathematics", "English", "Hindi", "Science", "Social Studies"].includes(s.name));
    } else {
      return allSubjects.filter(s => ["Mathematics", "Physics", "Chemistry", "Biology", "English", "Hindi", "History"].includes(s.name));
    }
  };

  const [subjects, setSubjects] = useState(getInitialSubjects(selectedClass));

  // Generate ordered lessons based on the selected class and board
  const generateOrderedTasks = (classNum, board) => {
    if (board === "ICSE") {
      if (classNum <= 5) {
        return [
          { id: 1, title: `ICSE Class ${classNum} Math - Sets and Venn Diagrams`, subject: "Mathematics", completed: false, xp: 50 },
          { id: 2, title: `ICSE Class ${classNum} Science - Flora and Fauna`, subject: "Physics", completed: false, xp: 55 },
          { id: 3, title: `ICSE Class ${classNum} English - Active & Passive Voice`, subject: "Literature", completed: false, xp: 40 },
          { id: 4, title: `ICSE Class ${classNum} History - Harappan Civilization`, subject: "History", completed: false, xp: 30 }
        ];
      } else if (classNum <= 8) {
        return [
          { id: 1, title: `ICSE Class ${classNum} Math - Rational Numbers`, subject: "Mathematics", completed: false, xp: 60 },
          { id: 2, title: `ICSE Class ${classNum} Physics - Measurement and Experimentation`, subject: "Physics", completed: false, xp: 50 },
          { id: 3, title: `ICSE Class ${classNum} Chemistry - Matter and its Composition`, subject: "Chemistry", completed: false, xp: 50 },
          { id: 4, title: `ICSE Class ${classNum} Literature - Merchant of Venice Extract`, subject: "Literature", completed: false, xp: 45 }
        ];
      } else {
        return [
          { id: 1, title: `ICSE Class ${classNum} Math - Commercial Mathematics (GST)`, subject: "Mathematics", completed: false, xp: 80 },
          { id: 2, title: `ICSE Class ${classNum} Physics - Current Electricity`, subject: "Physics", completed: false, xp: 75 },
          { id: 3, title: `ICSE Class ${classNum} Chemistry - Metallurgy`, subject: "Chemistry", completed: false, xp: 70 },
          { id: 4, title: `ICSE Class ${classNum} Literature - Tempest Act 1`, subject: "Literature", completed: false, xp: 60 }
        ];
      }
    } else { // CBSE/NCERT
      const prefix = board === "NCERT" ? "NCERT" : "CBSE";
      
      const ncertData = {
        1: [
          { subject: "Mathematics", title: "Shapes and Space", xp: 15 },
          { subject: "Mathematics", title: "Numbers from One to Nine", xp: 15 },
          { subject: "Mathematics", title: "Addition", xp: 15 },
          { subject: "Mathematics", title: "Subtraction", xp: 15 },
          { subject: "Mathematics", title: "Numbers from Ten to Twenty", xp: 15 },
          { subject: "Mathematics", title: "Time", xp: 15 },
          { subject: "Mathematics", title: "Measurement", xp: 15 },
          { subject: "Mathematics", title: "Numbers from Twenty-One to Fifty", xp: 15 },
          { subject: "Mathematics", title: "Data Handling", xp: 15 },
          { subject: "Mathematics", title: "Patterns", xp: 15 },
          { subject: "English", title: "My Family and Me", xp: 15 },
          { subject: "English", title: "Two Little Hands", xp: 15 },
          { subject: "English", title: "Greetings", xp: 15 },
          { subject: "English", title: "Picture Time", xp: 15 },
          { subject: "English", title: "The Cap-seller and the Monkeys", xp: 15 },
          { subject: "English", title: "A Farm", xp: 15 },
          { subject: "English", title: "Fun with Pictures", xp: 15 },
          { subject: "English", title: "The Food We Eat", xp: 15 },
          { subject: "English", title: "The Four Seasons", xp: 15 },
          { subject: "English", title: "Anandi’s Rainbow", xp: 15 },
          { subject: "Hindi", title: "Meena’s Family", xp: 10 },
          { subject: "Hindi", title: "Grandparents", xp: 10 },
          { subject: "Hindi", title: "Welcoming Reema", xp: 10 },
          { subject: "Hindi", title: "Wow! My Shoes", xp: 10 },
          { subject: "Hindi", title: "Mithai", xp: 10 },
          { subject: "Hindi", title: "Teen Saathi", xp: 10 },
          { subject: "Hindi", title: "Mera Ghao", xp: 10 },
          { subject: "Hindi", title: "Baarish", xp: 10 },
          { subject: "Hindi", title: "Chidiya", xp: 10 },
          { subject: "Hindi", title: "Ghar", xp: 10 },
          { subject: "Hindi", title: "Patang", xp: 10 },
          { subject: "Hindi", title: "Gend-Balla", xp: 10 },
          { subject: "Hindi", title: "Bandar Gaya Khet Mein", xp: 10 },
          { subject: "Hindi", title: "Ek Budhiya", xp: 10 },
          { subject: "Hindi", title: "Main Bhi", xp: 10 },
          { subject: "EVS", title: "All About Me", xp: 10 },
          { subject: "EVS", title: "My Body and Sense Organs", xp: 10 },
          { subject: "EVS", title: "My Family and Home", xp: 10 },
          { subject: "EVS", title: "Food We Eat", xp: 10 },
          { subject: "EVS", title: "Plants Around Us", xp: 10 },
          { subject: "EVS", title: "Animals Around Us", xp: 10 },
          { subject: "EVS", title: "Water and Air", xp: 10 },
          { subject: "EVS", title: "People Who Help Us", xp: 10 },
          { subject: "EVS", title: "Good Habits and Safety", xp: 10 }
        ],
        2: [
          { subject: "English", title: "First Day at School", xp: 15 },
          { subject: "English", title: "Haldi’s Adventure", xp: 15 },
          { subject: "English", title: "I Am Lucky", xp: 15 },
          { subject: "English", title: "I Want", xp: 15 },
          { subject: "English", title: "A Smile", xp: 15 },
          { subject: "English", title: "The Wind and the Sun", xp: 15 },
          { subject: "English", title: "Rain", xp: 15 },
          { subject: "English", title: "Storm in the Garden", xp: 15 },
          { subject: "English", title: "Zoo Manners", xp: 15 },
          { subject: "English", title: "Funny Bunny", xp: 15 },
          { subject: "English", title: "Mr Nobody", xp: 15 },
          { subject: "English", title: "Curlylocks and the Three Bears", xp: 15 },
          { subject: "Hindi", title: "Oont Chala", xp: 15 },
          { subject: "Hindi", title: "Bhalu Ne Kheli Football", xp: 15 },
          { subject: "Hindi", title: "Mera Parivar", xp: 15 },
          { subject: "Hindi", title: "Adhyapak Ji", xp: 15 },
          { subject: "Hindi", title: "Andher Nagari", xp: 15 },
          { subject: "Hindi", title: "Budhiya Ki Topi", xp: 15 },
          { subject: "Hindi", title: "Meethe Bol", xp: 15 },
          { subject: "Hindi", title: "Titli Aur Kali", xp: 15 },
          { subject: "Hindi", title: "Bulbul", xp: 15 },
          { subject: "Hindi", title: "Mera Khilauna", xp: 15 },
          { subject: "Mathematics", title: "What is Long, What is Round?", xp: 20 },
          { subject: "Mathematics", title: "Counting in Groups", xp: 20 },
          { subject: "Mathematics", title: "How Much Can You Carry?", xp: 20 },
          { subject: "Mathematics", title: "Counting in Tens", xp: 20 },
          { subject: "Mathematics", title: "Patterns", xp: 20 },
          { subject: "Mathematics", title: "Footprints", xp: 20 },
          { subject: "Mathematics", title: "Jugs and Mugs", xp: 20 },
          { subject: "Mathematics", title: "Tens and Ones", xp: 20 },
          { subject: "Mathematics", title: "My Funday", xp: 20 },
          { subject: "Mathematics", title: "Add Our Points", xp: 20 },
          { subject: "Mathematics", title: "Lines and Lines", xp: 20 },
          { subject: "Mathematics", title: "Give and Take", xp: 20 },
          { subject: "Mathematics", title: "The Longest Step", xp: 20 },
          { subject: "Mathematics", title: "Birds Come, Birds Go", xp: 20 },
          { subject: "EVS", title: "Family", xp: 15 },
          { subject: "EVS", title: "Food", xp: 15 },
          { subject: "EVS", title: "Shelter", xp: 15 },
          { subject: "EVS", title: "Travel", xp: 15 },
          { subject: "EVS", title: "Water", xp: 15 },
          { subject: "EVS", title: "Plants and Animals", xp: 15 }
        ],
        3: [
          { subject: "English", title: "Good Morning", xp: 20 },
          { subject: "English", title: "The Magic Garden", xp: 20 },
          { subject: "English", title: "Bird Talk", xp: 20 },
          { subject: "English", title: "Nina and the Baby Sparrows", xp: 20 },
          { subject: "English", title: "Little by Little", xp: 20 },
          { subject: "English", title: "The Enormous Turnip", xp: 20 },
          { subject: "English", title: "Sea Song", xp: 20 },
          { subject: "English", title: "A Little Fish Story", xp: 20 },
          { subject: "English", title: "The Balloon Man", xp: 20 },
          { subject: "English", title: "The Yellow Butterfly", xp: 20 },
          { subject: "Hindi", title: "Kakkoo", xp: 20 },
          { subject: "Hindi", title: "Shekhibaz Makkhi", xp: 20 },
          { subject: "Hindi", title: "Chand Wali Amma", xp: 20 },
          { subject: "Hindi", title: "Mann Karta Hai", xp: 20 },
          { subject: "Hindi", title: "Bahadur Bittu", xp: 20 },
          { subject: "Hindi", title: "Humse Sab Kehte", xp: 20 },
          { subject: "Hindi", title: "Tip Tipwa", xp: 20 },
          { subject: "Hindi", title: "Bandar Bant", xp: 20 },
          { subject: "Hindi", title: "Akbar Birbal", xp: 20 },
          { subject: "Mathematics", title: "Where to Look From", xp: 25 },
          { subject: "Mathematics", title: "Fun with Numbers", xp: 25 },
          { subject: "Mathematics", title: "Give and Take", xp: 25 },
          { subject: "Mathematics", title: "Long and Short", xp: 25 },
          { subject: "Mathematics", title: "Shapes and Designs", xp: 25 },
          { subject: "Mathematics", title: "Fun with Give and Take", xp: 25 },
          { subject: "Mathematics", title: "Time Goes On", xp: 25 },
          { subject: "Mathematics", title: "Who is Heavier?", xp: 25 },
          { subject: "Mathematics", title: "How Many Times?", xp: 25 },
          { subject: "Mathematics", title: "Play with Patterns", xp: 25 },
          { subject: "EVS", title: "Poonam’s Day Out", xp: 20 },
          { subject: "EVS", title: "The Plant Fairy", xp: 20 },
          { subject: "EVS", title: "Water O Water", xp: 20 },
          { subject: "EVS", title: "Our First School", xp: 20 },
          { subject: "EVS", title: "Chhotu’s House", xp: 20 },
          { subject: "EVS", title: "Foods We Eat", xp: 20 },
          { subject: "EVS", title: "Saying Without Speaking", xp: 20 },
          { subject: "EVS", title: "Flying High", xp: 20 },
          { subject: "EVS", title: "It’s Raining", xp: 20 }
        ],
        4: [
          { subject: "Mathematics", title: "Building with Bricks", xp: 50 },
          { subject: "Mathematics", title: "Long and Short", xp: 55 },
          { subject: "EVS", title: "Going to School", xp: 50 },
          { subject: "EVS", title: "Ear to Ear", xp: 50 }
        ],
        5: [
          { subject: "Mathematics", title: "The Fish Tale", xp: 55 },
          { subject: "Mathematics", title: "Shapes and Angles", xp: 60 },
          { subject: "EVS", title: "Super Senses", xp: 55 },
          { subject: "EVS", title: "A Snake Charmer's Story", xp: 55 }
        ],
        6: [
          { subject: "Mathematics", title: "Knowing Our Numbers", xp: 60 },
          { subject: "Mathematics", title: "Whole Numbers", xp: 65 },
          { subject: "Biology", title: "Food: Where Does it Come From?", xp: 60 },
          { subject: "Chemistry", title: "Sorting Materials into Groups", xp: 60 }
        ],
        7: [
          { subject: "Mathematics", title: "Integers", xp: 65 },
          { subject: "Mathematics", title: "Fractions and Decimals", xp: 70 },
          { subject: "Biology", title: "Nutrition in Plants", xp: 65 },
          { subject: "Physics", title: "Heat", xp: 65 }
        ],
        8: [
          { subject: "Mathematics", title: "Rational Numbers", xp: 70 },
          { subject: "Mathematics", title: "Linear Equations in One Variable", xp: 75 },
          { subject: "Biology", title: "Microorganisms: Friend and Foe", xp: 70 },
          { subject: "Chemistry", title: "Synthetic Fibres and Plastics", xp: 70 }
        ],
        9: [
          { subject: "Mathematics", title: "Number Systems", xp: 75 },
          { subject: "Mathematics", title: "Polynomials", xp: 80 },
          { subject: "Chemistry", title: "Matter in Our Surroundings", xp: 75 },
          { subject: "Physics", title: "Motion", xp: 75 }
        ],
        10: [
          { subject: "Mathematics", title: "Real Numbers", xp: 80 },
          { subject: "Mathematics", title: "Quadratic Equations", xp: 85 },
          { subject: "Chemistry", title: "Chemical Reactions and Equations", xp: 80 },
          { subject: "Physics", title: "Light - Reflection and Refraction", xp: 80 }
        ],
        11: [
          { subject: "Mathematics", title: "Sets", xp: 90 },
          { subject: "Physics", title: "Units and Measurements", xp: 90 },
          { subject: "Chemistry", title: "Some Basic Concepts of Chemistry", xp: 90 },
          { subject: "Biology", title: "The Living World", xp: 90 }
        ],
        12: [
          { subject: "Mathematics", title: "Relations and Functions", xp: 100 },
          { subject: "Physics", title: "Electric Charges and Fields", xp: 100 },
          { subject: "Chemistry", title: "The Solid State", xp: 100 },
          { subject: "Biology", title: "Reproduction in Organisms", xp: 100 }
        ]
      };

      const classData = ncertData[classNum] || ncertData[10]; // Fallback
      
      return classData.flatMap((chapter, index) => {
        // Generate 6 lessons per chapter
        return [1, 2, 3, 4, 5, 6].map(lessonNum => {
          const lessonInfo = getLessonContent(chapter.title, chapter.subject, lessonNum);
          let subtopicTitle = lessonInfo.title || `Lesson ${lessonNum}`;
          
          if (!lessonInfo.title && lessonInfo.topics && lessonInfo.topics[lessonNum - 1]) {
            subtopicTitle = lessonInfo.topics[lessonNum - 1];
          }

          const lessonTitle = `${prefix} Class ${classNum} ${chapter.subject} - ${chapter.title}: ${subtopicTitle}`;
          return {
            id: `${index + 1}-${lessonNum}`,
            title: lessonTitle,
            chapterTitle: chapter.title,
            subject: chapter.subject,
            completed: false,
            xp: Math.round(chapter.xp / 6),
            lessonNum: lessonNum,
            subtopic: subtopicTitle
          };
        });
      });
    }
  };

  const [tasks, setTasks] = useState(generateOrderedTasks(selectedClass, "CBSE"));

  const handleClassChange = (newClass) => {
    setSelectedClass(newClass);
    setTasks(generateOrderedTasks(newClass, selectedBoard));
    setSubjects(getInitialSubjects(newClass)); // Reset progress for the new class
    setUserStats(prev => ({
      ...prev,
      lessonsCompleted: 0 // Reset lessons for new class, keep global XP
    }));
  };

  const handleBoardChange = (newBoard) => {
    setSelectedBoard(newBoard);
    setTasks(generateOrderedTasks(selectedClass, newBoard));
    setSubjects(getInitialSubjects(selectedClass));
    setUserStats(prev => ({ ...prev, lessonsCompleted: 0 }));
  };

  // Handle Task Toggling
  const toggleTask = (taskId) => {
    const updatedTasks = tasks.map(task => {
      if (task.id === taskId) {
        const newStatus = !task.completed;
        
        // Update Stats
        setUserStats(prev => ({
          ...prev,
          lessonsCompleted: prev.lessonsCompleted + (newStatus ? 1 : -1),
          xpEarned: prev.xpEarned + (newStatus ? task.xp : -task.xp),
          level: Math.floor((prev.xpEarned + (newStatus ? task.xp : -task.xp)) / 500) + 1
        }));

        // Update Subjects
        setSubjects(prevSubjects => prevSubjects.map(sub => {
          if (sub.name === task.subject) {
            const newLessons = sub.lessons + (newStatus ? 1 : -1);
            return {
              ...sub,
              lessons: newLessons,
              progress: Math.min(100, Math.round((newLessons / sub.totalLessons) * 100))
            };
          }
          return sub;
        }));

        return { ...task, completed: newStatus };
      }
      return task;
    });

    setTasks(updatedTasks);
  };

  if (!currentUser) {
    return <Auth onLogin={handleLogin} />;
  }

  const renderContent = () => {
    if (activeLesson) {
      return (
        <main style={{ paddingTop: '80px' }}>
          <LessonPage 
            lesson={activeLesson} 
            onBack={() => setActiveLesson(null)} 
            onComplete={() => {
              toggleTask(activeLesson.id);
              setActiveLesson(null);
            }} 
          />
        </main>
      );
    }

    return (
      <main>
        <Hero />
        <Features />
        <Subjects subjects={subjects} />
        <StudyTools userClass={selectedClass} />
        <Dashboard 
          stats={userStats} 
          tasks={tasks} 
          onToggleTask={toggleTask} 
          selectedClass={selectedClass}
          onClassChange={handleClassChange}
          selectedBoard={selectedBoard}
          onBoardChange={handleBoardChange}
          onStartLesson={setActiveLesson}
          dailyMissions={(() => {
            const missions = [];
            const subjectsSeen = new Set();
            for (const task of tasks) {
              if (!task.completed && !subjectsSeen.has(task.subject)) {
                missions.push(task);
                subjectsSeen.add(task.subject);
              }
              if (missions.length >= 4) break; // Suggest 4 subjects max per day
            }
            return missions;
          })()}
        />
      </main>
    );
  };

  return (
    <div className="app">
      <BackgroundStars />
      <Navbar user={currentUser} onLogout={handleLogout} />
      {renderContent()}
      <footer style={{
        padding: '4rem 2rem',
        textAlign: 'center',
        borderTop: '1px solid var(--glass-border)',
        marginTop: '4rem',
        color: 'var(--text-secondary)',
        fontSize: '0.9rem'
      }}>
        <p>© 2026 StellarStudy. Launching your potential into the cosmos.</p>
      </footer>
      <AITutor userClass={selectedClass} />
    </div>
  );
}

export default App;
