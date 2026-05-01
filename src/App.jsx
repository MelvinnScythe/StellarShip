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
      // Add more classes as needed
    };
    const classData = ncertData[classNum] || ncertData[1];
    return classData.flatMap((chapter, index) => {
      return [1, 2, 3, 4, 5, 6].map(lessonNum => {
        const lessonInfo = getLessonContent(chapter.title, chapter.subject, lessonNum);
        const subtopicTitle = lessonInfo.title || lessonInfo.topics?.[lessonNum - 1] || `Lesson ${lessonNum}`;
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
