import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
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
  const navigate = useNavigate();
  const location = useLocation();

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

  const handleLogin = (user, token) => {
    setCurrentUser(user);
    if (user.selectedClass) setSelectedClass(user.selectedClass);
    if (user.xpEarned !== undefined) {
      setUserStats(prev => ({ ...prev, xpEarned: user.xpEarned, level: user.level || 1, streak: user.streak || 0 }));
    }
    localStorage.setItem('antigravity_current_user', JSON.stringify(user));
    if (token) localStorage.setItem('antigravity_token', token);
    navigate('/home');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('antigravity_current_user');
    localStorage.removeItem('antigravity_token');
    navigate('/');
  };

  const [userStats, setUserStats] = useState({
    studyTime: 0,
    lessonsCompleted: 0,
    xpEarned: currentUser?.xpEarned || 0,
    dailyXP: currentUser?.dailyXP || 0,
    sessionXP: 0,
    nextGoal: "3 days until Math Exam",
    streak: currentUser?.streak || 0,
    level: currentUser?.level || 1
  });

  useEffect(() => {
    const token = localStorage.getItem('antigravity_token');
    if (token && currentUser) {
      fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/users/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(user => {
        if (user && user.xpEarned !== undefined) {
          setCurrentUser(user);
          setUserStats(prev => ({
            ...prev,
            xpEarned: user.xpEarned,
            dailyXP: user.dailyXP || 0,
            level: user.level || 1,
            streak: user.streak || 0
          }));
          localStorage.setItem('antigravity_current_user', JSON.stringify(user));
        }
      })
      .catch(e => console.error("Failed to fetch profile", e));
    }
  }, []);

  useEffect(() => {
    if (currentUser) {
      const updatedUser = { 
        ...currentUser, 
        xpEarned: userStats.xpEarned, 
        dailyXP: userStats.dailyXP,
        level: userStats.level, 
        streak: userStats.streak,
        selectedClass 
      };
      localStorage.setItem('antigravity_current_user', JSON.stringify(updatedUser));
      if (JSON.stringify(updatedUser) !== JSON.stringify(currentUser)) {
        setCurrentUser(updatedUser);
      }
    }
  }, [userStats.xpEarned, userStats.dailyXP, userStats.level, userStats.streak, selectedClass]);

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
        })
        .then(res => res.json())
        .then(data => {
          if (data && data.dailyXP !== undefined) {
             setUserStats(prev => ({ ...prev, dailyXP: data.dailyXP }));
          }
        })
        .catch(e => console.error('Failed to sync progress:', e));
      }
    }
  }, [userStats.xpEarned, userStats.level, selectedClass, userStats.streak]);

  const getInitialSubjects = (classNum) => {
    const allSubjects = [
      { id: 1, name: "Mathematics", lessons: 0, totalLessons: 60, progress: 0, color: "#facc15" },
      { id: 7, name: "English", lessons: 0, totalLessons: 60, progress: 0, color: "#3b82f6" },
      { id: 8, name: "Hindi", lessons: 0, totalLessons: 90, progress: 0, color: "#ec4899" },
      { id: 9, name: "EVS", lessons: 0, totalLessons: 54, progress: 0, color: "#10b981" },
      { id: 10, name: "Science", lessons: 0, totalLessons: 60, progress: 0, color: "#2dd4bf" },
      { id: 11, name: "Social Studies", lessons: 0, totalLessons: 60, progress: 0, color: "#94a3b8" }
    ];
    if (classNum <= 3) return allSubjects.filter(s => ["Mathematics", "English", "Hindi", "EVS"].includes(s.name));
    if (classNum <= 5) return allSubjects.filter(s => ["Mathematics", "English", "Hindi", "EVS"].includes(s.name));
    return allSubjects.filter(s => ["Mathematics", "English", "Hindi", "Science", "Social Studies"].includes(s.name));
  };

  const [subjects, setSubjects] = useState(getInitialSubjects(selectedClass));

  const generateOrderedTasks = (classNum, board) => {
    const prefix = board === "NCERT" ? "NCERT" : "CBSE";
    const ncertData = {
      1: [
        { subject: "Mathematics", title: "Shapes and Space", xp: 15 },
        { subject: "Mathematics", title: "Numbers from One to Nine", xp: 15 },
        { subject: "Mathematics", title: "Addition", xp: 15 },
        { subject: "Mathematics", title: "Subtraction", xp: 15 },
        { subject: "Mathematics", title: "Numbers from Ten to Twenty", xp: 15 },
        { subject: "English", title: "My Family and Me", xp: 15 },
        { subject: "English", title: "Two Little Hands", xp: 15 },
        { subject: "English", title: "Greetings", xp: 15 },
        { subject: "English", title: "Picture Time", xp: 15 },
        { subject: "Hindi", title: "Meena’s Family", xp: 10 },
        { subject: "Hindi", title: "Grandparents", xp: 10 },
        { subject: "Hindi", title: "Welcoming Reema", xp: 10 },
        { subject: "EVS", title: "All About Me", xp: 10 },
        { subject: "EVS", title: "My Body and Sense Organs", xp: 10 },
        { subject: "EVS", title: "My Family and Home", xp: 10 }
      ],
      2: [
        {
                "subject": "Mathematics",
                "title": "What is Long, What is Round?",
                "xp": 15
        },
        {
                "subject": "Mathematics",
                "title": "Counting in Groups",
                "xp": 15
        },
        {
                "subject": "Mathematics",
                "title": "How Much Can You Carry?",
                "xp": 15
        },
        {
                "subject": "Mathematics",
                "title": "Counting in Tens",
                "xp": 15
        },
        {
                "subject": "Mathematics",
                "title": "Patterns",
                "xp": 15
        },
        {
                "subject": "Mathematics",
                "title": "Footprints",
                "xp": 15
        },
        {
                "subject": "Mathematics",
                "title": "Jugs and Mugs",
                "xp": 15
        },
        {
                "subject": "Mathematics",
                "title": "Tens and Ones",
                "xp": 15
        },
        {
                "subject": "Mathematics",
                "title": "My Funday",
                "xp": 15
        },
        {
                "subject": "Mathematics",
                "title": "Add Our Points",
                "xp": 15
        },
        {
                "subject": "Mathematics",
                "title": "Lines and Lines",
                "xp": 15
        },
        {
                "subject": "Mathematics",
                "title": "Give and Take",
                "xp": 15
        },
        {
                "subject": "Mathematics",
                "title": "The Longest Step",
                "xp": 15
        },
        {
                "subject": "Mathematics",
                "title": "Birds Come, Birds Go",
                "xp": 15
        },
        {
                "subject": "Mathematics",
                "title": "How Many Ponytails?",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "First Day at School",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "Haldi's Adventure",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "I am Lucky!",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "I Want",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "A Smile",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "The Wind and the Sun",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "Rain",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "Storm in the Garden",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "Zoo Manners",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "Funny Bunny",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "Mr. Nobody",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "Curlylocks and the Three Bears",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "On My Blackboard I can Draw",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "Make it Shorter",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "I am the Music Man",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "The Mumbai Musicians",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "Granny Granny Please Comb my Hair",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "The Magic Porridge Pot",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "Strange Talk",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "The Grasshopper and the Ant",
                "xp": 15
        },
        {
                "subject": "Hindi",
                "title": "ऊँट चला",
                "xp": 10
        },
        {
                "subject": "Hindi",
                "title": "भालू ने खेली फुटबॉल",
                "xp": 10
        },
        {
                "subject": "Hindi",
                "title": "म्याऊँ, म्याऊँ !!",
                "xp": 10
        },
        {
                "subject": "Hindi",
                "title": "अधिक बलवान कौन?",
                "xp": 10
        },
        {
                "subject": "Hindi",
                "title": "दोस्त की मदद",
                "xp": 10
        },
        {
                "subject": "Hindi",
                "title": "बहुत हुआ",
                "xp": 10
        },
        {
                "subject": "Hindi",
                "title": "मेरी किताब",
                "xp": 10
        },
        {
                "subject": "Hindi",
                "title": "तितली और कली",
                "xp": 10
        },
        {
                "subject": "Hindi",
                "title": "बुलबुल",
                "xp": 10
        },
        {
                "subject": "Hindi",
                "title": "मीठी सारंगी",
                "xp": 10
        },
        {
                "subject": "Hindi",
                "title": "टेसू राजा बीच बाजार",
                "xp": 10
        },
        {
                "subject": "Hindi",
                "title": "बस के नीचे बाघ",
                "xp": 10
        },
        {
                "subject": "Hindi",
                "title": "सूरज जल्दी आना जी",
                "xp": 10
        },
        {
                "subject": "Hindi",
                "title": "नटखट चूहा",
                "xp": 10
        },
        {
                "subject": "Hindi",
                "title": "एक्की-दोक्की",
                "xp": 10
        }
],
      3: [
        {
                "subject": "Mathematics",
                "title": "Where to Look From",
                "xp": 15
        },
        {
                "subject": "Mathematics",
                "title": "Fun With Numbers",
                "xp": 15
        },
        {
                "subject": "Mathematics",
                "title": "Give and Take",
                "xp": 15
        },
        {
                "subject": "Mathematics",
                "title": "Long and Short",
                "xp": 15
        },
        {
                "subject": "Mathematics",
                "title": "Shapes and Designs",
                "xp": 15
        },
        {
                "subject": "Mathematics",
                "title": "Fun With Give and Take",
                "xp": 15
        },
        {
                "subject": "Mathematics",
                "title": "Time Goes On",
                "xp": 15
        },
        {
                "subject": "Mathematics",
                "title": "Who is Heavier?",
                "xp": 15
        },
        {
                "subject": "Mathematics",
                "title": "How Many Times?",
                "xp": 15
        },
        {
                "subject": "Mathematics",
                "title": "Play With Patterns",
                "xp": 15
        },
        {
                "subject": "Mathematics",
                "title": "Jugs and Mugs",
                "xp": 15
        },
        {
                "subject": "Mathematics",
                "title": "Can We Share?",
                "xp": 15
        },
        {
                "subject": "Mathematics",
                "title": "Smart Charts",
                "xp": 15
        },
        {
                "subject": "Mathematics",
                "title": "Rupees and Paise",
                "xp": 15
        },
        {
                "subject": "EVS",
                "title": "Poonam's Day Out",
                "xp": 10
        },
        {
                "subject": "EVS",
                "title": "The Plant Fairy",
                "xp": 10
        },
        {
                "subject": "EVS",
                "title": "Water O' Water!",
                "xp": 10
        },
        {
                "subject": "EVS",
                "title": "Our First School",
                "xp": 10
        },
        {
                "subject": "EVS",
                "title": "Chhotu's House",
                "xp": 10
        },
        {
                "subject": "EVS",
                "title": "Foods We Eat",
                "xp": 10
        },
        {
                "subject": "EVS",
                "title": "Saying Without Speaking",
                "xp": 10
        },
        {
                "subject": "EVS",
                "title": "Flying High",
                "xp": 10
        },
        {
                "subject": "EVS",
                "title": "It's Raining",
                "xp": 10
        },
        {
                "subject": "EVS",
                "title": "What is Cooking",
                "xp": 10
        },
        {
                "subject": "EVS",
                "title": "From Here to There",
                "xp": 10
        },
        {
                "subject": "EVS",
                "title": "Work We Do",
                "xp": 10
        },
        {
                "subject": "EVS",
                "title": "Sharing Our Feelings",
                "xp": 10
        },
        {
                "subject": "EVS",
                "title": "The Story of Food",
                "xp": 10
        },
        {
                "subject": "EVS",
                "title": "Making Pots",
                "xp": 10
        },
        {
                "subject": "EVS",
                "title": "Games We Play",
                "xp": 10
        },
        {
                "subject": "EVS",
                "title": "Here Comes a Letter",
                "xp": 10
        },
        {
                "subject": "EVS",
                "title": "A House Like This!",
                "xp": 10
        },
        {
                "subject": "EVS",
                "title": "Our Friends - Animals",
                "xp": 10
        },
        {
                "subject": "EVS",
                "title": "Drop by Drop",
                "xp": 10
        },
        {
                "subject": "EVS",
                "title": "Families can be Different",
                "xp": 10
        },
        {
                "subject": "EVS",
                "title": "Left-Right",
                "xp": 10
        },
        {
                "subject": "EVS",
                "title": "A Beautiful Cloth",
                "xp": 10
        },
        {
                "subject": "EVS",
                "title": "Web of Life",
                "xp": 10
        },
        {
                "subject": "English",
                "title": "Good Morning",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "The Magic Garden",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "Bird Talk",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "Nina and the Baby Sparrows",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "Little by Little",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "The Enormous Turnip",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "Sea Song",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "A Little Fish Story",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "The Balloon Man",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "Yellow Butterfly",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "Trains",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "Story of the Road",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "Puppy and I",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "Little Tiger Big Tiger",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "What's in the Mailbox?",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "My Silly Sister",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "Don't Tell",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "He is My Brother",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "How Creatures Move",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "Ship of the Desert",
                "xp": 15
        },
        {
                "subject": "Hindi",
                "title": "कक्कू",
                "xp": 10
        },
        {
                "subject": "Hindi",
                "title": "शेखीबाज़ मक्खी",
                "xp": 10
        },
        {
                "subject": "Hindi",
                "title": "चाँद वाली अम्मा",
                "xp": 10
        },
        {
                "subject": "Hindi",
                "title": "मन करता है",
                "xp": 10
        },
        {
                "subject": "Hindi",
                "title": "बहादुर बित्तो",
                "xp": 10
        },
        {
                "subject": "Hindi",
                "title": "हमसे सब कहते",
                "xp": 10
        },
        {
                "subject": "Hindi",
                "title": "टिपटिपवा",
                "xp": 10
        },
        {
                "subject": "Hindi",
                "title": "बंदर बाँट",
                "xp": 10
        },
        {
                "subject": "Hindi",
                "title": "अक्ल बड़ी या भैंस",
                "xp": 10
        },
        {
                "subject": "Hindi",
                "title": "क्योंजीमल और कैसे-कैसलिया",
                "xp": 10
        },
        {
                "subject": "Hindi",
                "title": "मीरा बहन और बाघ",
                "xp": 10
        },
        {
                "subject": "Hindi",
                "title": "जब मुझे साँप ने काटा",
                "xp": 10
        },
        {
                "subject": "Hindi",
                "title": "मिर्च का मज़ा",
                "xp": 10
        },
        {
                "subject": "Hindi",
                "title": "सबसे अच्छा पेड़",
                "xp": 10
        }
],
      4: [
        {
                "subject": "Mathematics",
                "title": "Building with Bricks",
                "xp": 15
        },
        {
                "subject": "Mathematics",
                "title": "Long and Short",
                "xp": 15
        },
        {
                "subject": "Mathematics",
                "title": "A Trip to Bhopal",
                "xp": 15
        },
        {
                "subject": "Mathematics",
                "title": "Tick-Tick-Tick",
                "xp": 15
        },
        {
                "subject": "Mathematics",
                "title": "The Way The World Looks",
                "xp": 15
        },
        {
                "subject": "Mathematics",
                "title": "The Junk Seller",
                "xp": 15
        },
        {
                "subject": "Mathematics",
                "title": "Jugs and Mugs",
                "xp": 15
        },
        {
                "subject": "Mathematics",
                "title": "Carts and Wheels",
                "xp": 15
        },
        {
                "subject": "Mathematics",
                "title": "Halves and Quarters",
                "xp": 15
        },
        {
                "subject": "Mathematics",
                "title": "Play with Patterns",
                "xp": 15
        },
        {
                "subject": "Mathematics",
                "title": "Tables and Shares",
                "xp": 15
        },
        {
                "subject": "Mathematics",
                "title": "How Heavy? How Light?",
                "xp": 15
        },
        {
                "subject": "Mathematics",
                "title": "Fields and Fences",
                "xp": 15
        },
        {
                "subject": "Mathematics",
                "title": "Smart Charts",
                "xp": 15
        },
        {
                "subject": "EVS",
                "title": "Going to School",
                "xp": 10
        },
        {
                "subject": "EVS",
                "title": "Ear to Ear",
                "xp": 10
        },
        {
                "subject": "EVS",
                "title": "A Day with Nandu",
                "xp": 10
        },
        {
                "subject": "EVS",
                "title": "The Story of Amrita",
                "xp": 10
        },
        {
                "subject": "EVS",
                "title": "Anita and the Honeybees",
                "xp": 10
        },
        {
                "subject": "EVS",
                "title": "Omana's Journey",
                "xp": 10
        },
        {
                "subject": "EVS",
                "title": "From the Window",
                "xp": 10
        },
        {
                "subject": "EVS",
                "title": "Reaching Grandmother's House",
                "xp": 10
        },
        {
                "subject": "EVS",
                "title": "Changing Families",
                "xp": 10
        },
        {
                "subject": "EVS",
                "title": "Hu Tu Tu Hu Tu Tu",
                "xp": 10
        },
        {
                "subject": "EVS",
                "title": "The Valley of Flowers",
                "xp": 10
        },
        {
                "subject": "EVS",
                "title": "Changing Times",
                "xp": 10
        },
        {
                "subject": "EVS",
                "title": "A River's Tale",
                "xp": 10
        },
        {
                "subject": "EVS",
                "title": "Basva's Farm",
                "xp": 10
        },
        {
                "subject": "EVS",
                "title": "From Market to Home",
                "xp": 10
        },
        {
                "subject": "EVS",
                "title": "A Busy Month",
                "xp": 10
        },
        {
                "subject": "EVS",
                "title": "Nandita in Mumbai",
                "xp": 10
        },
        {
                "subject": "EVS",
                "title": "Too Much Water Too Little Water",
                "xp": 10
        },
        {
                "subject": "EVS",
                "title": "Abdul in the Garden",
                "xp": 10
        },
        {
                "subject": "EVS",
                "title": "Eating Together",
                "xp": 10
        },
        {
                "subject": "EVS",
                "title": "Food and Fun",
                "xp": 10
        },
        {
                "subject": "EVS",
                "title": "The World in my Home",
                "xp": 10
        },
        {
                "subject": "EVS",
                "title": "Pochampalli",
                "xp": 10
        },
        {
                "subject": "EVS",
                "title": "Home and Abroad",
                "xp": 10
        },
        {
                "subject": "EVS",
                "title": "Spicy Riddles",
                "xp": 10
        },
        {
                "subject": "EVS",
                "title": "Defence Officer: Wahida",
                "xp": 10
        },
        {
                "subject": "EVS",
                "title": "Chuskit Goes to School",
                "xp": 10
        },
        {
                "subject": "English",
                "title": "Wake Up!",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "Neha's Alarm Clock",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "Noses",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "The Little Fir Tree",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "Run!",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "Nasruddin's Aim",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "Why?",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "Alice in Wonderland",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "Don't be Afraid of the Dark",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "Helen Keller",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "The Donkey",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "I had a Little Pony",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "The Milkman's Cow",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "Hiawatha",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "The Scholar's Mother Tongue",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "A Watering Rhyme",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "The Giving Tree",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "Books",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "Going to Buy a Book",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "The Naughty Boy",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "Pinocchio",
                "xp": 15
        },
        {
                "subject": "Hindi",
                "title": "मन के भोले-भाले बादल",
                "xp": 10
        },
        {
                "subject": "Hindi",
                "title": "जैसा सवाल वैसा जवाब",
                "xp": 10
        },
        {
                "subject": "Hindi",
                "title": "किरमिच की गेंद",
                "xp": 10
        },
        {
                "subject": "Hindi",
                "title": "पापा जब बच्चे थे",
                "xp": 10
        },
        {
                "subject": "Hindi",
                "title": "दोस्त की पोशाक",
                "xp": 10
        },
        {
                "subject": "Hindi",
                "title": "नाव बनाओ नाव बनाओ",
                "xp": 10
        },
        {
                "subject": "Hindi",
                "title": "दान का हिसाब",
                "xp": 10
        },
        {
                "subject": "Hindi",
                "title": "कौन?",
                "xp": 10
        },
        {
                "subject": "Hindi",
                "title": "स्वतंत्रता की ओर",
                "xp": 10
        },
        {
                "subject": "Hindi",
                "title": "थप्प रोटी थप्प दाल",
                "xp": 10
        },
        {
                "subject": "Hindi",
                "title": "पढ़क्कू की सूझ",
                "xp": 10
        },
        {
                "subject": "Hindi",
                "title": "सुनीता की पहिया कुर्सी",
                "xp": 10
        },
        {
                "subject": "Hindi",
                "title": "हुदहुद",
                "xp": 10
        },
        {
                "subject": "Hindi",
                "title": "मुफ़्त ही मुफ़्त",
                "xp": 10
        }
],
      5: [
        {
                "subject": "Mathematics",
                "title": "The Fish Tale",
                "xp": 15
        },
        {
                "subject": "Mathematics",
                "title": "Shapes and Angles",
                "xp": 15
        },
        {
                "subject": "Mathematics",
                "title": "How Many Squares?",
                "xp": 15
        },
        {
                "subject": "Mathematics",
                "title": "Parts and Wholes",
                "xp": 15
        },
        {
                "subject": "Mathematics",
                "title": "Does it Look the Same?",
                "xp": 15
        },
        {
                "subject": "Mathematics",
                "title": "Be My Multiple I'll be Your Factor",
                "xp": 15
        },
        {
                "subject": "Mathematics",
                "title": "Can You See the Pattern?",
                "xp": 15
        },
        {
                "subject": "Mathematics",
                "title": "Mapping Your Way",
                "xp": 15
        },
        {
                "subject": "Mathematics",
                "title": "Boxes and Sketches",
                "xp": 15
        },
        {
                "subject": "Mathematics",
                "title": "Tenths and Hundredths",
                "xp": 15
        },
        {
                "subject": "Mathematics",
                "title": "Area and its Boundary",
                "xp": 15
        },
        {
                "subject": "Mathematics",
                "title": "Smart Charts",
                "xp": 15
        },
        {
                "subject": "Mathematics",
                "title": "Ways to Multiply and Divide",
                "xp": 15
        },
        {
                "subject": "Mathematics",
                "title": "How Big? How Heavy?",
                "xp": 15
        },
        {
                "subject": "EVS",
                "title": "Super Senses",
                "xp": 10
        },
        {
                "subject": "EVS",
                "title": "A Snake Charmer's Story",
                "xp": 10
        },
        {
                "subject": "EVS",
                "title": "From Tasting to Digesting",
                "xp": 10
        },
        {
                "subject": "EVS",
                "title": "Mangoes Round the Year",
                "xp": 10
        },
        {
                "subject": "EVS",
                "title": "Seeds and Seeds",
                "xp": 10
        },
        {
                "subject": "EVS",
                "title": "Every Drop Counts",
                "xp": 10
        },
        {
                "subject": "EVS",
                "title": "Experiments with Water",
                "xp": 10
        },
        {
                "subject": "EVS",
                "title": "A Treat for Mosquitoes",
                "xp": 10
        },
        {
                "subject": "EVS",
                "title": "Up You Go!",
                "xp": 10
        },
        {
                "subject": "EVS",
                "title": "Walls Tell Stories",
                "xp": 10
        },
        {
                "subject": "EVS",
                "title": "Sunita in Space",
                "xp": 10
        },
        {
                "subject": "EVS",
                "title": "What if it Finishes...",
                "xp": 10
        },
        {
                "subject": "EVS",
                "title": "A Shelter so High!",
                "xp": 10
        },
        {
                "subject": "EVS",
                "title": "When the Earth Shook!",
                "xp": 10
        },
        {
                "subject": "EVS",
                "title": "Blow Hot Blow Cold",
                "xp": 10
        },
        {
                "subject": "EVS",
                "title": "Who will do this Work?",
                "xp": 10
        },
        {
                "subject": "EVS",
                "title": "Across the Wall",
                "xp": 10
        },
        {
                "subject": "EVS",
                "title": "No Place for Us?",
                "xp": 10
        },
        {
                "subject": "EVS",
                "title": "A Seed tells a Farmer's Story",
                "xp": 10
        },
        {
                "subject": "EVS",
                "title": "Whose Forests?",
                "xp": 10
        },
        {
                "subject": "EVS",
                "title": "Like Father Like Daughter",
                "xp": 10
        },
        {
                "subject": "EVS",
                "title": "On the Move Again",
                "xp": 10
        },
        {
                "subject": "English",
                "title": "Ice-cream Man",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "Wonderful Waste!",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "Teamwork",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "Flying Together",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "My Shadow",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "Robinson Crusoe Discovers a footprint",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "Crying",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "My Elder Brother",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "The Lazy Frog",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "Rip Van Winkle",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "Class Discussion",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "The Talkative Barber",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "Topsy-turvy Land",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "Gulliver's Travels",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "Nobody's Friend",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "The Little Bully",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "Sing a Song of People",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "Around the World",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "Malu Bhalu",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "Who Will be Ningthou?",
                "xp": 15
        },
        {
                "subject": "Hindi",
                "title": "राख की रस्सी",
                "xp": 10
        },
        {
                "subject": "Hindi",
                "title": "फ़सलों के त्योहार",
                "xp": 10
        },
        {
                "subject": "Hindi",
                "title": "खिलौनेवाला",
                "xp": 10
        },
        {
                "subject": "Hindi",
                "title": "नन्हा फ़नकार",
                "xp": 10
        },
        {
                "subject": "Hindi",
                "title": "जहाँ चाह वहाँ राह",
                "xp": 10
        },
        {
                "subject": "Hindi",
                "title": "चिट्ठी का सफ़र",
                "xp": 10
        },
        {
                "subject": "Hindi",
                "title": "डाकिए की कहानी कंवरसिंह की जुबानी",
                "xp": 10
        },
        {
                "subject": "Hindi",
                "title": "वे दिन भी क्या दिन थे",
                "xp": 10
        },
        {
                "subject": "Hindi",
                "title": "एक माँ की बेबसी",
                "xp": 10
        },
        {
                "subject": "Hindi",
                "title": "एक दिन की बादशाहत",
                "xp": 10
        },
        {
                "subject": "Hindi",
                "title": "चावल की रोटियाँ",
                "xp": 10
        },
        {
                "subject": "Hindi",
                "title": "गुरु और चेला",
                "xp": 10
        },
        {
                "subject": "Hindi",
                "title": "स्वामी की दादी",
                "xp": 10
        },
        {
                "subject": "Hindi",
                "title": "बाघ आया उस रात",
                "xp": 10
        },
        {
                "subject": "Hindi",
                "title": "बिशन की दिलेरी",
                "xp": 10
        },
        {
                "subject": "Hindi",
                "title": "पानी रे पानी",
                "xp": 10
        },
        {
                "subject": "Hindi",
                "title": "छोटी-सी हमारी नदी",
                "xp": 10
        },
        {
                "subject": "Hindi",
                "title": "चुनौती हिमालय की",
                "xp": 10
        }
],
};
    const classData = ncertData[classNum] || ncertData[1];
    return classData.flatMap((chapter, index) => {
      return [1, 2, 3, 4, 5, 6].map(lessonNum => {
        const lessonInfo = getLessonContent(chapter.title, chapter.subject, lessonNum);
        let subtopicTitle = `Lesson ${lessonNum}`;
        if (lessonInfo.lessons && lessonInfo.lessons[lessonNum - 1]) {
          subtopicTitle = lessonInfo.lessons[lessonNum - 1].title;
        } else if (lessonInfo.topics && lessonInfo.topics[lessonNum - 1]) {
          subtopicTitle = lessonInfo.topics[lessonNum - 1];
        } else if (lessonInfo.title) {
          subtopicTitle = lessonInfo.title;
        }
        return {
          id: `${chapter.subject}-${chapter.title}-${lessonNum}`.replace(/\s+/g, '-'),
          title: `${prefix} Class ${classNum} ${chapter.subject} - ${chapter.title}: ${subtopicTitle}`,
          chapterTitle: chapter.title,
          subject: chapter.subject,
          completed: false,
          xp: Math.round(chapter.xp / 6),
          lessonNum: lessonNum,
          subtopic: subtopicTitle
        };
      });
    });
  };

  const [tasks, setTasks] = useState(generateOrderedTasks(selectedClass, "CBSE"));

  const toggleTask = (taskId) => {
    setTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        const newStatus = !task.completed;
        setUserStats(s => ({
          ...s,
          lessonsCompleted: s.lessonsCompleted + (newStatus ? 1 : -1),
          xpEarned: s.xpEarned + (newStatus ? task.xp : -task.xp),
          dailyXP: s.dailyXP + (newStatus ? task.xp : -task.xp),
          sessionXP: s.sessionXP + (newStatus ? task.xp : -task.xp),
          level: Math.floor((s.xpEarned + (newStatus ? task.xp : -task.xp)) / 500) + 1
        }));
        setSubjects(subs => subs.map(sub => {
          if (sub.name === task.subject) {
            const newL = sub.lessons + (newStatus ? 1 : -1);
            return { ...sub, lessons: newL, progress: Math.min(100, Math.round((newL / sub.totalLessons) * 100)) };
          }
          return sub;
        }));
        return { ...task, completed: newStatus };
      }
      return task;
    }));
  };

  function handleClassChange(newClass) {
    setSelectedClass(newClass);
    const newTasks = generateOrderedTasks(newClass, selectedBoard);
    setTasks(newTasks);
    setSubjects(getInitialSubjects(newClass));
    setUserStats(prev => ({ ...prev, lessonsCompleted: 0 }));
  }

  function handleBoardChange(newBoard) {
    setSelectedBoard(newBoard);
    const newTasks = generateOrderedTasks(selectedClass, newBoard);
    setTasks(newTasks);
    setSubjects(getInitialSubjects(selectedClass));
    setUserStats(prev => ({ ...prev, lessonsCompleted: 0 }));
  }

  const dailyMissions = tasks.filter(t => !t.completed).slice(0, 4);
  const isFullscreen = location.pathname.startsWith('/lesson') || location.pathname === '/speaking';

  return (
    <div className="app">
      <BackgroundStars />
      {!isFullscreen && <Navbar user={currentUser} onLogout={handleLogout} />}
      
      <Routes>
        <Route path="/" element={!currentUser ? <Auth onLogin={handleLogin} /> : <Navigate to="/home" />} />
        <Route path="/home" element={
          currentUser ? (
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
                onStartLesson={(l) => navigate(`/lesson/${l.id}`)}
                dailyMissions={dailyMissions}
              />
            </main>
          ) : <Navigate to="/" />
        } />
        <Route path="/lesson/:lessonId" element={
          currentUser ? (
            <LessonPage 
              lesson={tasks.find(t => t.id === location.pathname.split('/').pop()) || tasks[0]} 
              onBack={() => navigate('/home')} 
              onComplete={() => { toggleTask(location.pathname.split('/').pop()); navigate('/home'); }} 
            />
          ) : <Navigate to="/" />
        } />
        <Route path="/speaking" element={
          currentUser ? (
            <div style={{ padding: '2rem', minHeight: '100vh' }}>
               <button 
                onClick={() => navigate('/home')}
                style={{ 
                  marginBottom: '2rem', background: 'rgba(255,255,255,0.05)', color: 'white', 
                  border: '1px solid var(--glass-border)', padding: '0.75rem 1.5rem', 
                  borderRadius: '100px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem'
                }}
              >
                ← Back to Mission Control
              </button>
              <StudyTools userClass={selectedClass} initialTab="speaking" isFullscreen={true} />
            </div>
          ) : <Navigate to="/" />
        } />
      </Routes>

      {!isFullscreen && (
        <footer style={{ padding: '4rem 2rem', textAlign: 'center', borderTop: '1px solid var(--glass-border)', marginTop: '4rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          <p>© 2026 StellarStudy. Launching your potential into the cosmos.</p>
        </footer>
      )}
      {!isFullscreen && <AITutor userClass={selectedClass} />}
    </div>
  );
}

export default App;
