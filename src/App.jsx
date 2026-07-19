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
import Messages from './components/Messages';
import Friends from './components/Friends';
import { useUnreadMessages } from './hooks/useUnreadMessages';
import { useFriendRequests } from './hooks/useFriendRequests';
import SiteAlertBar from './components/SiteAlertBar';

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
      6: [
        {
                "subject": "Mathematics",
                "title": "Knowing Our Numbers",
                "xp": 15
        },
        {
                "subject": "Mathematics",
                "title": "Whole Numbers",
                "xp": 15
        },
        {
                "subject": "Mathematics",
                "title": "Playing With Numbers",
                "xp": 15
        },
        {
                "subject": "Mathematics",
                "title": "Basic Geometrical Ideas",
                "xp": 15
        },
        {
                "subject": "Mathematics",
                "title": "Understanding Elementary Shapes",
                "xp": 15
        },
        {
                "subject": "Mathematics",
                "title": "Integers",
                "xp": 15
        },
        {
                "subject": "Mathematics",
                "title": "Fractions",
                "xp": 15
        },
        {
                "subject": "Mathematics",
                "title": "Decimals",
                "xp": 15
        },
        {
                "subject": "Mathematics",
                "title": "Data Handling",
                "xp": 15
        },
        {
                "subject": "Mathematics",
                "title": "Mensuration",
                "xp": 15
        },
        {
                "subject": "Mathematics",
                "title": "Algebra",
                "xp": 15
        },
        {
                "subject": "Mathematics",
                "title": "Ratio and Proportion",
                "xp": 15
        },
        {
                "subject": "Science",
                "title": "Components of Food",
                "xp": 15
        },
        {
                "subject": "Science",
                "title": "Sorting Materials into Groups",
                "xp": 15
        },
        {
                "subject": "Science",
                "title": "Separation of Substances",
                "xp": 15
        },
        {
                "subject": "Science",
                "title": "Getting to Know Plants",
                "xp": 15
        },
        {
                "subject": "Science",
                "title": "Body Movements",
                "xp": 15
        },
        {
                "subject": "Science",
                "title": "The Living Organisms and Their Surroundings",
                "xp": 15
        },
        {
                "subject": "Science",
                "title": "Motion and Measurement of Distances",
                "xp": 15
        },
        {
                "subject": "Science",
                "title": "Light Shadows and Reflections",
                "xp": 15
        },
        {
                "subject": "Science",
                "title": "Electricity and Circuits",
                "xp": 15
        },
        {
                "subject": "Science",
                "title": "Fun with Magnets",
                "xp": 15
        },
        {
                "subject": "Science",
                "title": "Air Around Us",
                "xp": 15
        },
        {
                "subject": "Social Studies",
                "title": "What Where How and When?",
                "xp": 15
        },
        {
                "subject": "Social Studies",
                "title": "From Hunting-Gathering to Growing Food",
                "xp": 15
        },
        {
                "subject": "Social Studies",
                "title": "In the Earliest Cities",
                "xp": 15
        },
        {
                "subject": "Social Studies",
                "title": "What Books and Burials Tell Us",
                "xp": 15
        },
        {
                "subject": "Social Studies",
                "title": "Kingdoms Kings and an Early Republic",
                "xp": 15
        },
        {
                "subject": "Social Studies",
                "title": "New Questions and Ideas",
                "xp": 15
        },
        {
                "subject": "Social Studies",
                "title": "From a Kingdom to an Empire",
                "xp": 15
        },
        {
                "subject": "Social Studies",
                "title": "Villages Towns and Trade",
                "xp": 15
        },
        {
                "subject": "Social Studies",
                "title": "New Empires and Kingdoms",
                "xp": 15
        },
        {
                "subject": "Social Studies",
                "title": "Buildings Paintings and Books",
                "xp": 15
        },
        {
                "subject": "Social Studies",
                "title": "The Earth in the Solar System",
                "xp": 15
        },
        {
                "subject": "Social Studies",
                "title": "Globe: Latitudes and Longitudes",
                "xp": 15
        },
        {
                "subject": "Social Studies",
                "title": "Motions of the Earth",
                "xp": 15
        },
        {
                "subject": "Social Studies",
                "title": "Maps",
                "xp": 15
        },
        {
                "subject": "Social Studies",
                "title": "Major Domains of the Earth",
                "xp": 15
        },
        {
                "subject": "Social Studies",
                "title": "Our Country - India",
                "xp": 15
        },
        {
                "subject": "Social Studies",
                "title": "Understanding Diversity",
                "xp": 15
        },
        {
                "subject": "Social Studies",
                "title": "Diversity and Discrimination",
                "xp": 15
        },
        {
                "subject": "Social Studies",
                "title": "What is Government?",
                "xp": 15
        },
        {
                "subject": "Social Studies",
                "title": "Panchayati Raj",
                "xp": 15
        },
        {
                "subject": "Social Studies",
                "title": "Rural Administration",
                "xp": 15
        },
        {
                "subject": "Social Studies",
                "title": "Urban Administration",
                "xp": 15
        },
        {
                "subject": "Social Studies",
                "title": "Rural Livelihoods",
                "xp": 15
        },
        {
                "subject": "Social Studies",
                "title": "Urban Livelihoods",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "Who Did Patrick's Homework?",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "How the Dog Found Himself a New Master!",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "Taro's Reward",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "An Indian - American Woman in Space: Kalpana Chawla",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "A Different Kind of School",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "Who I Am",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "Fair Play",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "A Game of Chance",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "Desert Animals",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "The Banyan Tree",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "A Tale of Two Birds",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "The Friendly Mongoose",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "The Shepherd's Treasure",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "The Old-Clock Shop",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "Tansen",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "The Monkey and the Crocodile",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "The Wonder Called Sleep",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "A Pact with the Sun",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "What Happened to the Reptiles",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "A Strange Wrestling Match",
                "xp": 15
        },
        {
                "subject": "Hindi",
                "title": "वह चिड़िया जो",
                "xp": 15
        },
        {
                "subject": "Hindi",
                "title": "बचपन",
                "xp": 15
        },
        {
                "subject": "Hindi",
                "title": "नादान दोस्त",
                "xp": 15
        },
        {
                "subject": "Hindi",
                "title": "चाँद से थोड़ी-सी गप्पें",
                "xp": 15
        },
        {
                "subject": "Hindi",
                "title": "अक्षरों का महत्व",
                "xp": 15
        },
        {
                "subject": "Hindi",
                "title": "पार नज़र के",
                "xp": 15
        },
        {
                "subject": "Hindi",
                "title": "साथी हाथ बढ़ाना",
                "xp": 15
        },
        {
                "subject": "Hindi",
                "title": "ऐसे-ऐसे",
                "xp": 15
        },
        {
                "subject": "Hindi",
                "title": "टिकट अलबम",
                "xp": 15
        },
        {
                "subject": "Hindi",
                "title": "झाँसी की रानी",
                "xp": 15
        },
        {
                "subject": "Hindi",
                "title": "जो देखकर भी नहीं देखते",
                "xp": 15
        },
        {
                "subject": "Hindi",
                "title": "संसार पुस्तक है",
                "xp": 15
        },
        {
                "subject": "Hindi",
                "title": "मैं सबसे छोटी होऊँ",
                "xp": 15
        },
        {
                "subject": "Hindi",
                "title": "लोकगीत",
                "xp": 15
        },
        {
                "subject": "Hindi",
                "title": "नौकर",
                "xp": 15
        },
        {
                "subject": "Hindi",
                "title": "वन के मार्ग में",
                "xp": 15
        },
        {
                "subject": "Hindi",
                "title": "साँस-साँस में बाँस",
                "xp": 15
        }
],
      7: [
        {
                "subject": "Mathematics",
                "title": "Integers",
                "xp": 15
        },
        {
                "subject": "Mathematics",
                "title": "Fractions and Decimals",
                "xp": 15
        },
        {
                "subject": "Mathematics",
                "title": "Data Handling",
                "xp": 15
        },
        {
                "subject": "Mathematics",
                "title": "Simple Equations",
                "xp": 15
        },
        {
                "subject": "Mathematics",
                "title": "Lines and Angles",
                "xp": 15
        },
        {
                "subject": "Mathematics",
                "title": "The Triangle and its Properties",
                "xp": 15
        },
        {
                "subject": "Mathematics",
                "title": "Congruence of Triangles",
                "xp": 15
        },
        {
                "subject": "Mathematics",
                "title": "Comparing Quantities",
                "xp": 15
        },
        {
                "subject": "Mathematics",
                "title": "Rational Numbers",
                "xp": 15
        },
        {
                "subject": "Mathematics",
                "title": "Practical Geometry",
                "xp": 15
        },
        {
                "subject": "Mathematics",
                "title": "Perimeter and Area",
                "xp": 15
        },
        {
                "subject": "Mathematics",
                "title": "Algebraic Expressions",
                "xp": 15
        },
        {
                "subject": "Mathematics",
                "title": "Exponents and Powers",
                "xp": 15
        },
        {
                "subject": "Mathematics",
                "title": "Symmetry",
                "xp": 15
        },
        {
                "subject": "Mathematics",
                "title": "Visualising Solid Shapes",
                "xp": 15
        },
        {
                "subject": "Science",
                "title": "Nutrition in Plants",
                "xp": 15
        },
        {
                "subject": "Science",
                "title": "Nutrition in Animals",
                "xp": 15
        },
        {
                "subject": "Science",
                "title": "Heat",
                "xp": 15
        },
        {
                "subject": "Science",
                "title": "Acids Bases and Salts",
                "xp": 15
        },
        {
                "subject": "Science",
                "title": "Physical and Chemical Changes",
                "xp": 15
        },
        {
                "subject": "Science",
                "title": "Respiration in Organisms",
                "xp": 15
        },
        {
                "subject": "Science",
                "title": "Transportation in Animals and Plants",
                "xp": 15
        },
        {
                "subject": "Science",
                "title": "Reproduction in Plants",
                "xp": 15
        },
        {
                "subject": "Science",
                "title": "Motion and Time",
                "xp": 15
        },
        {
                "subject": "Science",
                "title": "Electric Current and its Effects",
                "xp": 15
        },
        {
                "subject": "Science",
                "title": "Light",
                "xp": 15
        },
        {
                "subject": "Science",
                "title": "Forests: Our Lifeline",
                "xp": 15
        },
        {
                "subject": "Science",
                "title": "Wastewater Story",
                "xp": 15
        },
        {
                "subject": "Social Studies",
                "title": "Introduction: Tracing Changes Through a Thousand Years",
                "xp": 15
        },
        {
                "subject": "Social Studies",
                "title": "New Kings and Kingdoms",
                "xp": 15
        },
        {
                "subject": "Social Studies",
                "title": "Delhi: 12th to 15th Century",
                "xp": 15
        },
        {
                "subject": "Social Studies",
                "title": "The Mughals (16th to 17th Century)",
                "xp": 15
        },
        {
                "subject": "Social Studies",
                "title": "Rulers and Buildings",
                "xp": 15
        },
        {
                "subject": "Social Studies",
                "title": "Towns Traders and Craftspersons",
                "xp": 15
        },
        {
                "subject": "Social Studies",
                "title": "Tribes Nomads and Settled Communities",
                "xp": 15
        },
        {
                "subject": "Social Studies",
                "title": "Devotional Paths to the Divine",
                "xp": 15
        },
        {
                "subject": "Social Studies",
                "title": "The Making of Regional Cultures",
                "xp": 15
        },
        {
                "subject": "Social Studies",
                "title": "18th-Century Political Formations",
                "xp": 15
        },
        {
                "subject": "Social Studies",
                "title": "Environment",
                "xp": 15
        },
        {
                "subject": "Social Studies",
                "title": "Inside Our Earth",
                "xp": 15
        },
        {
                "subject": "Social Studies",
                "title": "Our Changing Earth",
                "xp": 15
        },
        {
                "subject": "Social Studies",
                "title": "Air",
                "xp": 15
        },
        {
                "subject": "Social Studies",
                "title": "Water",
                "xp": 15
        },
        {
                "subject": "Social Studies",
                "title": "Natural Vegetation and Wildlife",
                "xp": 15
        },
        {
                "subject": "Social Studies",
                "title": "Human Environment - Settlement Transport and Communication",
                "xp": 15
        },
        {
                "subject": "Social Studies",
                "title": "Human Environment Interactions - The Tropical and Subtropical R...",
                "xp": 15
        },
        {
                "subject": "Social Studies",
                "title": "Life in the Deserts",
                "xp": 15
        },
        {
                "subject": "Social Studies",
                "title": "On Equality",
                "xp": 15
        },
        {
                "subject": "Social Studies",
                "title": "Role of the Government in Health",
                "xp": 15
        },
        {
                "subject": "Social Studies",
                "title": "How the State Government Works",
                "xp": 15
        },
        {
                "subject": "Social Studies",
                "title": "Growing up as Boys and Girls",
                "xp": 15
        },
        {
                "subject": "Social Studies",
                "title": "Women Change the World",
                "xp": 15
        },
        {
                "subject": "Social Studies",
                "title": "Understanding Media",
                "xp": 15
        },
        {
                "subject": "Social Studies",
                "title": "Markets Around Us",
                "xp": 15
        },
        {
                "subject": "Social Studies",
                "title": "A Shirt in the Market",
                "xp": 15
        },
        {
                "subject": "Social Studies",
                "title": "Struggles for Equality",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "Three Questions",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "A Gift of Chappals",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "Gopal and the Hilsa Fish",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "The Ashes That Made Trees Bloom",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "Quality",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "Expert Detectives",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "The Invention of Vita-Wonk",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "Fire: Friend and Foe",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "A Bicycle in Good Repair",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "The Story of Cricket",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "The Tiny Teacher",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "Bringing up Kari",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "The Desert",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "The Cop and the Anthem",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "Golu Grows a Nose",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "I Want Something in a Cage",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "Chandni",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "The Bear Story",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "A Tiger in the House",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "An Alien Hand",
                "xp": 15
        },
        {
                "subject": "Hindi",
                "title": "हम पंछी उन्मुक्त गगन के",
                "xp": 15
        },
        {
                "subject": "Hindi",
                "title": "दादी माँ",
                "xp": 15
        },
        {
                "subject": "Hindi",
                "title": "हिमालय की बेटियां",
                "xp": 15
        },
        {
                "subject": "Hindi",
                "title": "कठपुतली",
                "xp": 15
        },
        {
                "subject": "Hindi",
                "title": "मिठाईवाला",
                "xp": 15
        },
        {
                "subject": "Hindi",
                "title": "रक्त और हमारा शरीर",
                "xp": 15
        },
        {
                "subject": "Hindi",
                "title": "पापा खो गए",
                "xp": 15
        },
        {
                "subject": "Hindi",
                "title": "शाम-एक किसान",
                "xp": 15
        },
        {
                "subject": "Hindi",
                "title": "चिड़िया की बच्ची",
                "xp": 15
        },
        {
                "subject": "Hindi",
                "title": "अपूर्व अनुभव",
                "xp": 15
        },
        {
                "subject": "Hindi",
                "title": "रहीम की दोहे",
                "xp": 15
        },
        {
                "subject": "Hindi",
                "title": "कंचा",
                "xp": 15
        },
        {
                "subject": "Hindi",
                "title": "एक तिनका",
                "xp": 15
        },
        {
                "subject": "Hindi",
                "title": "खानपान की बदलती तस्वीर",
                "xp": 15
        },
        {
                "subject": "Hindi",
                "title": "नीलकंठ",
                "xp": 15
        },
        {
                "subject": "Hindi",
                "title": "भोर और बरखा",
                "xp": 15
        },
        {
                "subject": "Hindi",
                "title": "वीर कुंवर सिंह",
                "xp": 15
        },
        {
                "subject": "Hindi",
                "title": "संघर्ष के कारण मैं तुनुकमिज़ाज हो गया: धनराज",
                "xp": 15
        },
        {
                "subject": "Hindi",
                "title": "आश्रम का अनुमानित व्यय",
                "xp": 15
        },
        {
                "subject": "Hindi",
                "title": "विप्लव गायन",
                "xp": 15
        }
],
      8: [
        {
                "subject": "Mathematics",
                "title": "Rational Numbers",
                "xp": 15
        },
        {
                "subject": "Mathematics",
                "title": "Linear Equations in One Variable",
                "xp": 15
        },
        {
                "subject": "Mathematics",
                "title": "Understanding Quadrilaterals",
                "xp": 15
        },
        {
                "subject": "Mathematics",
                "title": "Practical Geometry",
                "xp": 15
        },
        {
                "subject": "Mathematics",
                "title": "Data Handling",
                "xp": 15
        },
        {
                "subject": "Mathematics",
                "title": "Squares and Square Roots",
                "xp": 15
        },
        {
                "subject": "Mathematics",
                "title": "Cubes and Cube Roots",
                "xp": 15
        },
        {
                "subject": "Mathematics",
                "title": "Comparing Quantities",
                "xp": 15
        },
        {
                "subject": "Mathematics",
                "title": "Algebraic Expressions and Identities",
                "xp": 15
        },
        {
                "subject": "Mathematics",
                "title": "Visualising Solid Shapes",
                "xp": 15
        },
        {
                "subject": "Mathematics",
                "title": "Mensuration",
                "xp": 15
        },
        {
                "subject": "Mathematics",
                "title": "Exponents and Powers",
                "xp": 15
        },
        {
                "subject": "Mathematics",
                "title": "Direct and Inverse Proportions",
                "xp": 15
        },
        {
                "subject": "Mathematics",
                "title": "Factorisation",
                "xp": 15
        },
        {
                "subject": "Mathematics",
                "title": "Introduction to Graphs",
                "xp": 15
        },
        {
                "subject": "Mathematics",
                "title": "Playing with Numbers",
                "xp": 15
        },
        {
                "subject": "Science",
                "title": "Crop Production and Management",
                "xp": 15
        },
        {
                "subject": "Science",
                "title": "Microorganisms: Friend and Foe",
                "xp": 15
        },
        {
                "subject": "Science",
                "title": "Synthetic Fibres and Plastics",
                "xp": 15
        },
        {
                "subject": "Science",
                "title": "Materials: Metals and Non-Metals",
                "xp": 15
        },
        {
                "subject": "Science",
                "title": "Coal and Petroleum",
                "xp": 15
        },
        {
                "subject": "Science",
                "title": "Combustion and Flame",
                "xp": 15
        },
        {
                "subject": "Science",
                "title": "Conservation of Plants and Animals",
                "xp": 15
        },
        {
                "subject": "Science",
                "title": "Cell — Structure and Functions",
                "xp": 15
        },
        {
                "subject": "Science",
                "title": "Reproduction in Animals",
                "xp": 15
        },
        {
                "subject": "Science",
                "title": "Reaching the Age of Adolescence",
                "xp": 15
        },
        {
                "subject": "Science",
                "title": "Force and Pressure",
                "xp": 15
        },
        {
                "subject": "Science",
                "title": "Friction",
                "xp": 15
        },
        {
                "subject": "Science",
                "title": "Sound",
                "xp": 15
        },
        {
                "subject": "Science",
                "title": "Chemical Effects of Electric Current",
                "xp": 15
        },
        {
                "subject": "Science",
                "title": "Some Natural Phenomena",
                "xp": 15
        },
        {
                "subject": "Science",
                "title": "Light",
                "xp": 15
        },
        {
                "subject": "Science",
                "title": "Stars and the Solar System",
                "xp": 15
        },
        {
                "subject": "Science",
                "title": "Pollution of Air and Water",
                "xp": 15
        },
        {
                "subject": "Social Studies",
                "title": "How When and Where",
                "xp": 15
        },
        {
                "subject": "Social Studies",
                "title": "From Trade to Territory",
                "xp": 15
        },
        {
                "subject": "Social Studies",
                "title": "Ruling the Countryside",
                "xp": 15
        },
        {
                "subject": "Social Studies",
                "title": "Tribals Dikus and the Vision of a Golden Age",
                "xp": 15
        },
        {
                "subject": "Social Studies",
                "title": "When People Rebel",
                "xp": 15
        },
        {
                "subject": "Social Studies",
                "title": "Colonialism and the City",
                "xp": 15
        },
        {
                "subject": "Social Studies",
                "title": "Weavers Iron Smelters and Factory Owners",
                "xp": 15
        },
        {
                "subject": "Social Studies",
                "title": "Civilising the Native Educating the Nation",
                "xp": 15
        },
        {
                "subject": "Social Studies",
                "title": "Women Caste and Reform",
                "xp": 15
        },
        {
                "subject": "Social Studies",
                "title": "The Changing World of Visual Arts",
                "xp": 15
        },
        {
                "subject": "Social Studies",
                "title": "The Making of the National Movement: 1870s-1947",
                "xp": 15
        },
        {
                "subject": "Social Studies",
                "title": "India After Independence",
                "xp": 15
        },
        {
                "subject": "Social Studies",
                "title": "Resources",
                "xp": 15
        },
        {
                "subject": "Social Studies",
                "title": "Land Soil Water Natural Vegetation and Wildlife Resources",
                "xp": 15
        },
        {
                "subject": "Social Studies",
                "title": "Mineral and Power Resources",
                "xp": 15
        },
        {
                "subject": "Social Studies",
                "title": "Agriculture",
                "xp": 15
        },
        {
                "subject": "Social Studies",
                "title": "Industries",
                "xp": 15
        },
        {
                "subject": "Social Studies",
                "title": "Human Resources",
                "xp": 15
        },
        {
                "subject": "Social Studies",
                "title": "The Indian Constitution",
                "xp": 15
        },
        {
                "subject": "Social Studies",
                "title": "Understanding Secularism",
                "xp": 15
        },
        {
                "subject": "Social Studies",
                "title": "Why do we need a Parliament?",
                "xp": 15
        },
        {
                "subject": "Social Studies",
                "title": "Understanding Laws",
                "xp": 15
        },
        {
                "subject": "Social Studies",
                "title": "Judiciary",
                "xp": 15
        },
        {
                "subject": "Social Studies",
                "title": "Understanding Our Criminal Justice System",
                "xp": 15
        },
        {
                "subject": "Social Studies",
                "title": "Understanding Marginalisation",
                "xp": 15
        },
        {
                "subject": "Social Studies",
                "title": "Confronting Marginalisation",
                "xp": 15
        },
        {
                "subject": "Social Studies",
                "title": "Public Facilities",
                "xp": 15
        },
        {
                "subject": "Social Studies",
                "title": "Law and Social Justice",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "The Best Christmas Present in the World",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "The Tsunami",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "Glimpses of the Past",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "Bepin Choudhury's Lapse of Memory",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "The Summit Within",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "This is Jody's Fawn",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "A Visit to Cambridge",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "A Short Monsoon Diary",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "The Great Stone Face - I",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "The Great Stone Face - II",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "How the Camel got his hump",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "Children at work",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "The Selfish Giant",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "The treasure within",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "Princess September",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "The fight",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "The open window",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "Jalebis",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "The comet - I",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "The comet - II",
                "xp": 15
        },
        {
                "subject": "Hindi",
                "title": "ध्वनि",
                "xp": 15
        },
        {
                "subject": "Hindi",
                "title": "लाख की चूड़ियाँ",
                "xp": 15
        },
        {
                "subject": "Hindi",
                "title": "बस की यात्रा",
                "xp": 15
        },
        {
                "subject": "Hindi",
                "title": "दीवानों की हस्ती",
                "xp": 15
        },
        {
                "subject": "Hindi",
                "title": "चिट्ठियों की अनूठी दुनिया",
                "xp": 15
        },
        {
                "subject": "Hindi",
                "title": "भगवान के डाकिए",
                "xp": 15
        },
        {
                "subject": "Hindi",
                "title": "क्या निराश हुआ जाए",
                "xp": 15
        },
        {
                "subject": "Hindi",
                "title": "यह सबसे कठिन समय नहीं",
                "xp": 15
        },
        {
                "subject": "Hindi",
                "title": "कबीर की साखियाँ",
                "xp": 15
        },
        {
                "subject": "Hindi",
                "title": "कामचोर",
                "xp": 15
        },
        {
                "subject": "Hindi",
                "title": "जब सिनेमा ने बोलना सीखा",
                "xp": 15
        },
        {
                "subject": "Hindi",
                "title": "सुदामा चरित",
                "xp": 15
        },
        {
                "subject": "Hindi",
                "title": "जहाँ पहिया है",
                "xp": 15
        },
        {
                "subject": "Hindi",
                "title": "अकबरी लोटा",
                "xp": 15
        },
        {
                "subject": "Hindi",
                "title": "सूर के पद",
                "xp": 15
        },
        {
                "subject": "Hindi",
                "title": "पानी की कहानी",
                "xp": 15
        },
        {
                "subject": "Hindi",
                "title": "बाज और साँप",
                "xp": 15
        },
        {
                "subject": "Hindi",
                "title": "टोपी",
                "xp": 15
        }
],
      9: [
        {
                "subject": "Mathematics",
                "title": "Number Systems",
                "xp": 15
        },
        {
                "subject": "Mathematics",
                "title": "Polynomials",
                "xp": 15
        },
        {
                "subject": "Mathematics",
                "title": "Coordinate Geometry",
                "xp": 15
        },
        {
                "subject": "Mathematics",
                "title": "Linear Equations in Two Variables",
                "xp": 15
        },
        {
                "subject": "Mathematics",
                "title": "Introduction to Euclid's Geometry",
                "xp": 15
        },
        {
                "subject": "Mathematics",
                "title": "Lines and Angles",
                "xp": 15
        },
        {
                "subject": "Mathematics",
                "title": "Triangles",
                "xp": 15
        },
        {
                "subject": "Mathematics",
                "title": "Quadrilaterals",
                "xp": 15
        },
        {
                "subject": "Mathematics",
                "title": "Areas of Parallelograms and Triangles",
                "xp": 15
        },
        {
                "subject": "Mathematics",
                "title": "Circles",
                "xp": 15
        },
        {
                "subject": "Mathematics",
                "title": "Constructions",
                "xp": 15
        },
        {
                "subject": "Mathematics",
                "title": "Heron's Formula",
                "xp": 15
        },
        {
                "subject": "Mathematics",
                "title": "Surface Areas and Volumes",
                "xp": 15
        },
        {
                "subject": "Mathematics",
                "title": "Statistics",
                "xp": 15
        },
        {
                "subject": "Mathematics",
                "title": "Probability",
                "xp": 15
        },
        {
                "subject": "Science",
                "title": "Matter in Our Surroundings",
                "xp": 15
        },
        {
                "subject": "Science",
                "title": "Is Matter Around Us Pure",
                "xp": 15
        },
        {
                "subject": "Science",
                "title": "Atoms and Molecules",
                "xp": 15
        },
        {
                "subject": "Science",
                "title": "Structure of the Atom",
                "xp": 15
        },
        {
                "subject": "Science",
                "title": "The Fundamental Unit of Life",
                "xp": 15
        },
        {
                "subject": "Science",
                "title": "Tissues",
                "xp": 15
        },
        {
                "subject": "Science",
                "title": "Diversity in Living Organisms",
                "xp": 15
        },
        {
                "subject": "Science",
                "title": "Motion",
                "xp": 15
        },
        {
                "subject": "Science",
                "title": "Force and Laws of Motion",
                "xp": 15
        },
        {
                "subject": "Science",
                "title": "Gravitation",
                "xp": 15
        },
        {
                "subject": "Science",
                "title": "Work and Energy",
                "xp": 15
        },
        {
                "subject": "Science",
                "title": "Sound",
                "xp": 15
        },
        {
                "subject": "Science",
                "title": "Why Do We Fall Ill",
                "xp": 15
        },
        {
                "subject": "Science",
                "title": "Natural Resources",
                "xp": 15
        },
        {
                "subject": "Science",
                "title": "Improvement in Food Resources",
                "xp": 15
        },
        {
                "subject": "Social Studies",
                "title": "The French Revolution",
                "xp": 15
        },
        {
                "subject": "Social Studies",
                "title": "Socialism in Europe and the Russian Revolution",
                "xp": 15
        },
        {
                "subject": "Social Studies",
                "title": "Nazism and the Rise of Hitler",
                "xp": 15
        },
        {
                "subject": "Social Studies",
                "title": "Forest Society and Colonialism",
                "xp": 15
        },
        {
                "subject": "Social Studies",
                "title": "Pastoralists in the Modern World",
                "xp": 15
        },
        {
                "subject": "Social Studies",
                "title": "India - Size and Location",
                "xp": 15
        },
        {
                "subject": "Social Studies",
                "title": "Physical Features of India",
                "xp": 15
        },
        {
                "subject": "Social Studies",
                "title": "Drainage",
                "xp": 15
        },
        {
                "subject": "Social Studies",
                "title": "Climate",
                "xp": 15
        },
        {
                "subject": "Social Studies",
                "title": "Natural Vegetation and Wild Life",
                "xp": 15
        },
        {
                "subject": "Social Studies",
                "title": "Population",
                "xp": 15
        },
        {
                "subject": "Social Studies",
                "title": "What is Democracy? Why Democracy?",
                "xp": 15
        },
        {
                "subject": "Social Studies",
                "title": "Constitutional Design",
                "xp": 15
        },
        {
                "subject": "Social Studies",
                "title": "Electoral Politics",
                "xp": 15
        },
        {
                "subject": "Social Studies",
                "title": "Working of Institutions",
                "xp": 15
        },
        {
                "subject": "Social Studies",
                "title": "Democratic Rights",
                "xp": 15
        },
        {
                "subject": "Social Studies",
                "title": "The Story of Village Palampur",
                "xp": 15
        },
        {
                "subject": "Social Studies",
                "title": "People as Resource",
                "xp": 15
        },
        {
                "subject": "Social Studies",
                "title": "Poverty as a Challenge",
                "xp": 15
        },
        {
                "subject": "Social Studies",
                "title": "Food Security in India",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "The Fun They Had",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "The Sound of Music",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "The Little Girl",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "A Truly Beautiful Mind",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "The Snake and the Mirror",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "My Childhood",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "Packing",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "Reach for the Top",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "The Bond of Love",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "Kathmandu",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "If I Were You",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "The Lost Child",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "The Adventures of Toto",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "Iswaran the Storyteller",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "In the Kingdom of Fools",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "The Happy Prince",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "Weathering the Storm in Ersama",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "The Last Leaf",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "A House Is Not a Home",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "The Accidental Tourist",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "The Beggar",
                "xp": 15
        },
        {
                "subject": "Hindi",
                "title": "दो बैलों की कथा",
                "xp": 15
        },
        {
                "subject": "Hindi",
                "title": "ल्हासा की ओर",
                "xp": 15
        },
        {
                "subject": "Hindi",
                "title": "उपभोक्तावाद की संस्कृति",
                "xp": 15
        },
        {
                "subject": "Hindi",
                "title": "साँवले सपनों की याद",
                "xp": 15
        },
        {
                "subject": "Hindi",
                "title": "नाना साहब की पुत्री देवी मैना को भस्म कर दिया गया",
                "xp": 15
        },
        {
                "subject": "Hindi",
                "title": "प्रेमचंद के फटे जूते",
                "xp": 15
        },
        {
                "subject": "Hindi",
                "title": "मेरे बचपन के दिन",
                "xp": 15
        },
        {
                "subject": "Hindi",
                "title": "एक कुत्ता और एक मैना",
                "xp": 15
        },
        {
                "subject": "Hindi",
                "title": "साखियाँ एवं सबद",
                "xp": 15
        },
        {
                "subject": "Hindi",
                "title": "वाख",
                "xp": 15
        },
        {
                "subject": "Hindi",
                "title": "सवैया",
                "xp": 15
        },
        {
                "subject": "Hindi",
                "title": "कैदी और कोकिला",
                "xp": 15
        },
        {
                "subject": "Hindi",
                "title": "ग्राम श्री",
                "xp": 15
        },
        {
                "subject": "Hindi",
                "title": "चंद्र गहना से लौटती बेर",
                "xp": 15
        },
        {
                "subject": "Hindi",
                "title": "मेघ आए",
                "xp": 15
        },
        {
                "subject": "Hindi",
                "title": "यमराज की दिशा",
                "xp": 15
        },
        {
                "subject": "Hindi",
                "title": "बच्चे काम पर जा रहे हैं",
                "xp": 15
        }
],
      10: [
        {
                "subject": "English",
                "title": "A Letter to God",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "Nelson Mandela: Long Walk to Freedom",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "Two Stories about Flying",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "From the Diary of Anne Frank",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "The Hundred Dresses - I",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "The Hundred Dresses - II",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "Glimpses of India",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "Mijbil the Otter",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "Madam Rides the Bus",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "The Sermon at Benares",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "The Proposal",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "A Triumph of Surgery",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "The Thief's Story",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "The Midnight Visitor",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "A Question of Trust",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "Footprints without Feet",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "The Making of a Scientist",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "The Necklace",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "The Hack Driver",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "Bholi",
                "xp": 15
        },
        {
                "subject": "English",
                "title": "The Book That Saved the Earth",
                "xp": 15
        },
        {
                "subject": "Hindi",
                "title": "पद (सूरदास)",
                "xp": 15
        },
        {
                "subject": "Hindi",
                "title": "राम-लक्ष्मण-परशुराम संवाद",
                "xp": 15
        },
        {
                "subject": "Hindi",
                "title": "सवैया और कवित्त",
                "xp": 15
        },
        {
                "subject": "Hindi",
                "title": "आत्मकथ्य",
                "xp": 15
        },
        {
                "subject": "Hindi",
                "title": "उत्साह और अट नहीं रही है",
                "xp": 15
        },
        {
                "subject": "Hindi",
                "title": "यह दंतुरित मुसकान और फसल",
                "xp": 15
        },
        {
                "subject": "Hindi",
                "title": "छाया मत छूना",
                "xp": 15
        },
        {
                "subject": "Hindi",
                "title": "कन्यादान",
                "xp": 15
        },
        {
                "subject": "Hindi",
                "title": "संगतकार",
                "xp": 15
        },
        {
                "subject": "Hindi",
                "title": "नेताजी का चश्मा",
                "xp": 15
        },
        {
                "subject": "Hindi",
                "title": "बालगोबिन भगत",
                "xp": 15
        },
        {
                "subject": "Hindi",
                "title": "लखनवी अंदाज़",
                "xp": 15
        },
        {
                "subject": "Hindi",
                "title": "मानवीय करुणा की दिव्या चमक",
                "xp": 15
        },
        {
                "subject": "Hindi",
                "title": "एक कहानी यह भी",
                "xp": 15
        },
        {
                "subject": "Hindi",
                "title": "स्त्री शिक्षा के विरोधी कुतर्कों का खंडन",
                "xp": 15
        },
        {
                "subject": "Hindi",
                "title": "नौबतखाने में इबादत",
                "xp": 15
        },
        {
                "subject": "Hindi",
                "title": "संस्कृति",
                "xp": 15
        }
]
    };
    const classData = ncertData[classNum] || ncertData[1];
    return classData.flatMap((chapter) => {
      return [1, 2, 3, 4, 5].map(lessonNum => {
        const lessonInfo = getLessonContent(chapter.title, chapter.subject, lessonNum, false, classNum);
        let subtopicTitle = `Lesson ${lessonNum}`;
        if (lessonInfo.lessons && lessonInfo.lessons[lessonNum - 1]) {
          subtopicTitle = lessonInfo.lessons[lessonNum - 1].title;
        } else if (lessonInfo.topics && lessonInfo.topics[lessonNum - 1]) {
          subtopicTitle = lessonInfo.topics[lessonNum - 1];
        } else if (lessonInfo.title) {
          subtopicTitle = lessonInfo.title;
        }
        
        // Final fallback if undefined
        if (!subtopicTitle || subtopicTitle.includes("undefined")) {
           const defaultTopics = ["Introduction & Concept Deep-Dive", "Key Concepts - Part 1", "Key Concepts - Part 2", "Key Concepts - Part 3 & Activities", "Final Assessment"];
           subtopicTitle = defaultTopics[lessonNum - 1] || `Lesson ${lessonNum}`;
        }
        return {
          id: `${chapter.subject}-${chapter.title}-${lessonNum}`.replace(/\s+/g, '-'),
          title: `${prefix} Class ${classNum} ${chapter.subject} - ${chapter.title}: ${subtopicTitle}`,
          chapterTitle: chapter.title,
          subject: chapter.subject,
          classNum: classNum,
          completed: false,
          xp: Math.round(chapter.xp / 5),
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
        
        let earnedXp = (selectedClass * 2) + 10;
        const isSunday = new Date().getDay() === 0;
        if (isSunday) {
          earnedXp = Math.round(earnedXp * 2.5);
        } else {
          try {
            const lessonInfo = getLessonContent(task.title, task.subject, 1, false, selectedClass);
            if (lessonInfo && lessonInfo.content && lessonInfo.content.length > 1500) {
              earnedXp += 5; // Long reading bonus
            }
          } catch(e) {}
        }
        
        if (newStatus) {
          const todayStr = new Date().toISOString().split('T')[0];
          const completedTodayKey = `antigravity_completed_today_${todayStr}`;
          let completedToday = [];
          try { completedToday = JSON.parse(localStorage.getItem(completedTodayKey)) || []; } catch(e){}
          if (!completedToday.includes(task.subject)) {
            completedToday.push(task.subject);
            localStorage.setItem(completedTodayKey, JSON.stringify(completedToday));
          }
        }

        setUserStats(s => ({
          ...s,
          lessonsCompleted: s.lessonsCompleted + (newStatus ? 1 : -1),
          xpEarned: s.xpEarned + (newStatus ? earnedXp : -earnedXp),
          dailyXP: s.dailyXP + (newStatus ? earnedXp : -earnedXp),
          sessionXP: s.sessionXP + (newStatus ? earnedXp : -earnedXp),
          level: Math.floor((s.xpEarned + (newStatus ? earnedXp : -earnedXp)) / 500) + 1
        }));
        setSubjects(subs => subs.map(sub => {
          if (sub.name === task.subject) {
            const newL = sub.lessons + (newStatus ? 1 : -1);
            return { ...sub, lessons: newL, progress: Math.min(100, Math.round((newL / sub.totalLessons) * 100)) };
          }
          return sub;
        }));
        return { ...task, completed: newStatus, xp: earnedXp };
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

  const isSunday = new Date().getDay() === 0;
  const todayStr = new Date().toISOString().split('T')[0];
  const completedTodayKey = `antigravity_completed_today_${todayStr}`;
  const getCompletedToday = () => {
    try { return JSON.parse(localStorage.getItem(completedTodayKey)) || []; }
    catch { return []; }
  };
  
  const uncompletedTasks = tasks.filter(t => !t.completed);
  let dailyMissions = [];
  const completedToday = getCompletedToday();
  
  if (isSunday) {
    // Group 1 task per subject but make it a Skill Test
    const subjectsAdded = new Set();
    for (const t of uncompletedTasks) {
      if (!subjectsAdded.has(t.subject) && !completedToday.includes(t.subject)) {
        dailyMissions.push({ ...t, title: `Skill Test: ${t.subject}`, subtopic: "Skill Test", isSkillTest: true });
        subjectsAdded.add(t.subject);
      }
    }
  } else {
    // 1 sub lesson per subject
    const subjectsAdded = new Set();
    for (const t of uncompletedTasks) {
      if (!subjectsAdded.has(t.subject) && !completedToday.includes(t.subject)) {
        dailyMissions.push(t);
        subjectsAdded.add(t.subject);
      }
    }
  }
  const isFullscreen = location.pathname.startsWith('/lesson') || location.pathname === '/speaking';
  const isMessaging = location.pathname === '/messages' || location.pathname === '/friends';
  const { unreadCount, refreshUnread } = useUnreadMessages(Boolean(currentUser));
  const { pendingCount: pendingFriendRequests } = useFriendRequests(Boolean(currentUser));
  const [siteAlertVisible, setSiteAlertVisible] = useState(false);

  return (
    <div className={`app${siteAlertVisible ? ' has-site-alert' : ''}`}>
      <BackgroundStars />
      {!isFullscreen && (
        <>
          <Navbar
            user={currentUser}
            onLogout={handleLogout}
            unreadMessages={unreadCount}
            pendingFriendRequests={pendingFriendRequests}
          />
          {currentUser && (
            <SiteAlertBar
              isEnabled
              onVisibilityChange={setSiteAlertVisible}
            />
          )}
        </>
      )}
      
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
              lesson={dailyMissions.find(t => t.id === location.pathname.split('/').pop()) || tasks.find(t => t.id === location.pathname.split('/').pop()) || tasks[0]} 
              onBack={() => navigate('/home')} 
              onComplete={() => { toggleTask(location.pathname.split('/').pop()); navigate('/home'); }} 
              currentUser={currentUser}
              selectedClass={selectedClass}
            />
          ) : <Navigate to="/" />
        } />
        <Route path="/tools" element={
          currentUser ? (
            <div style={{ paddingTop: '80px', height: '100vh', display: 'flex', flexDirection: 'column' }}>
              <StudyTools userClass={selectedClass} initialTab="speaking" isFullscreen={true} />
            </div>
          ) : <Navigate to="/" />
        } />
        <Route path="/messages" element={
          currentUser ? (
            <Messages currentUser={currentUser} onUnreadChange={refreshUnread} />
          ) : <Navigate to="/" />
        } />
        <Route path="/friends" element={
          currentUser ? (
            <Friends currentUser={currentUser} />
          ) : <Navigate to="/" />
        } />
      </Routes>

      <div className="star-field" />
      {/* Floating AI Tutor Chatbot */}
      {currentUser && <AITutor userClass={selectedClass} />}

      {!isFullscreen && (
        <footer style={{ padding: '4rem 2rem', textAlign: 'center', borderTop: '1px solid var(--glass-border)', marginTop: '4rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          <p>© 2026 StellarStudy. Launching your potential into the cosmos.</p>
        </footer>
      )}
    </div>
  );
}

export default App;
