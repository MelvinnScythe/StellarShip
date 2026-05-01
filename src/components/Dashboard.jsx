import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, BookOpen, Star, Calendar, CheckCircle2, Circle, Flame, Trophy, Crown } from 'lucide-react';

const Dashboard = ({ stats, tasks, onToggleTask, selectedClass, onClassChange, selectedBoard, onBoardChange, onStartLesson, dailyMissions }) => {
  const [xpType, setXpType] = useState('total'); // 'total', 'today', 'session'
  const [missionFilter, setMissionFilter] = useState('total'); // 'total', 'completed', 'not_completed'
  const [continueToday, setContinueToday] = useState(false);

  const getXPValue = () => {
    switch(xpType) {
      case 'today': return stats.dailyXP;
      case 'session': return stats.sessionXP;
      default: return stats.xpEarned;
    }
  };

  const getXPSub = () => {
    switch(xpType) {
      case 'today': return "Earned Today";
      case 'session': return "This Session";
      default: return "All Time";
    }
  };

  const statCards = [
    { label: "Study Time", value: `${stats.studyTime}h`, sub: "This week", icon: <Clock size={18} /> },
    { label: "Lessons", value: stats.lessonsCompleted, sub: "Completed", icon: <BookOpen size={18} /> },
    { 
      label: "XP", 
      value: getXPValue().toLocaleString(), 
      sub: getXPSub(), 
      icon: <Star size={18} />,
      isXP: true
    },
    { label: "Next Goal", value: stats.nextGoal.split(' ')[0] + ' ' + stats.nextGoal.split(' ')[1], sub: stats.nextGoal.split(' ').slice(2).join(' '), icon: <Calendar size={18} /> }
  ];

  const filteredTasks = tasks.filter(t => {
    if (missionFilter === 'completed') return t.completed;
    if (missionFilter === 'not_completed') return !t.completed;
    return true;
  });

  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/users/leaderboard`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const currentUser = JSON.parse(localStorage.getItem('antigravity_current_user'));
          const formatted = data.map((u, i) => ({
            rank: i + 1,
            name: u.name,
            level: u.level || 1,
            xp: u.xpEarned || 0,
            avatar: ['👨‍🚀', '👩‍🚀', '👽', '🤖', '👾'][i % 5],
            isCurrentUser: currentUser && (u.email === currentUser.email || u.name === currentUser.name)
          }));
          
          if (currentUser && !formatted.some(u => u.isCurrentUser)) {
             formatted.push({
               rank: formatted.length + 1,
               name: "You",
               level: stats.level,
               xp: stats.xpEarned,
               avatar: "👽",
               isCurrentUser: true
             });
          }
          
          formatted.sort((a,b) => b.xp - a.xp).forEach((u,i) => u.rank = i+1);
          setLeaderboard(formatted.slice(0, 10));
        }
      })
      .catch(e => console.error("Leaderboard fetch error", e));
  }, [stats.xpEarned]);

  const achievements = [
    { id: 'lessons-10', title: 'Novice Scholar', desc: 'Complete 10 lessons', target: 10, current: stats.lessonsCompleted, icon: '📚' },
    { id: 'xp-100', title: 'Fast Learner', desc: 'Earn 100 XP', target: 100, current: stats.xpEarned, icon: '⚡' },
    { id: 'streak-3', title: 'Consistent', desc: '3 Day Streak', target: 3, current: stats.streak, icon: '🔥' },
    { id: 'level-5', title: 'Rising Star', desc: 'Reach Level 5', target: 5, current: stats.level, icon: '⭐' }
  ];

  const selectStyle = {
    background: 'rgba(255, 51, 68, 0.05)',
    color: 'white',
    border: '1px solid rgba(255, 51, 68, 0.2)',
    padding: '0.6rem 1.2rem',
    borderRadius: '12px',
    outline: 'none',
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontWeight: '600',
    appearance: 'none',
    backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'16\' height=\'16\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'rgba(255, 51, 68, 0.8)\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'%3E%3C/polyline%3E%3C/svg%3E")',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 1rem center',
    paddingRight: '2.5rem',
    transition: 'all 0.3s',
    boxShadow: '0 4px 15px rgba(255, 51, 68, 0.05)'
  };

  return (
    <section id="progress" style={{ padding: '8rem 2rem' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h2 style={{ fontSize: 'clamp(2rem, 5vw, 2.5rem)', fontWeight: '700', marginBottom: '1rem' }}>
            Your <span style={{ color: 'var(--accent-red)' }}>Mission Control</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'clamp(0.9rem, 3vw, 1.1rem)', padding: '0 1rem' }}>
            A powerful dashboard to track your learning journey and stay motivated.
          </p>
        </div>

        <div style={{
          background: 'var(--glass-bg)',
          border: '1px solid var(--glass-border)',
          borderRadius: 'clamp(20px, 5vw, 32px)',
          padding: 'clamp(1.5rem, 5vw, 3rem)',
          maxWidth: '1000px',
          margin: '0 auto',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Header Stats */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '3rem', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div style={{ flex: '1 1 300px' }}>
              <h3 style={{ fontSize: '1.75rem', fontWeight: '700', marginBottom: '0.5rem' }}>Welcome back, Explorer!</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>You're making great progress this week</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Board:</label>
                  <select value={selectedBoard} onChange={(e) => onBoardChange(e.target.value)} style={selectStyle}>
                    <option value="CBSE">CBSE</option>
                    <option value="NCERT">NCERT</option>
                    <option value="ICSE">ICSE</option>
                  </select>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Class:</label>
                  <select value={selectedClass} onChange={(e) => onClassChange(parseInt(e.target.value))} style={selectStyle}>
                    {[...Array(12)].map((_, i) => (
                      <option key={i+1} value={i+1}>Class {i+1}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <div style={{ 
                display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 1rem', 
                background: 'rgba(255, 51, 68, 0.1)', border: '1px solid rgba(255, 51, 68, 0.2)', 
                borderRadius: '100px', fontSize: '0.8rem', color: '#ff8899'
              }}>
                <Flame size={14} fill={stats.streak > 0 ? "#ff8899" : "none"} /> {stats.streak} Day Streak
              </div>
              <div style={{ 
                display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 1rem', 
                background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.2)', 
                borderRadius: '100px', fontSize: '0.8rem', color: '#818cf8'
              }}>
                <Trophy size={14} /> Level {stats.level}
              </div>
            </div>
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '1.5rem',
            marginBottom: '4rem'
          }}>
            {statCards.map((s, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                style={{ 
                  padding: '1.5rem', background: 'rgba(255, 255, 255, 0.02)', 
                  borderRadius: '20px', border: '1px solid var(--glass-border)',
                  position: 'relative'
                }}
              >
                <div style={{ color: 'var(--text-secondary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {s.icon} <span style={{ fontSize: '0.85rem' }}>{s.label}</span>
                  </div>
                  {s.isXP && (
                    <select 
                      value={xpType}
                      onChange={(e) => setXpType(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        background: 'transparent',
                        color: 'var(--accent-red)',
                        border: 'none',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        outline: 'none',
                        cursor: 'pointer',
                        padding: '0'
                      }}
                    >
                      <option value="total">Total</option>
                      <option value="today">Today</option>
                      <option value="session">Session</option>
                    </select>
                  )}
                </div>
                <motion.div 
                  key={s.value}
                  initial={{ scale: 1.1, color: 'var(--accent-red)' }}
                  animate={{ scale: 1, color: 'var(--text-primary)' }}
                  style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.25rem' }}
                >
                  {s.value}
                </motion.div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{s.sub}</div>
              </motion.div>
            ))}
          </div>

          {/* Daily Missions */}
          <div style={{ marginBottom: '4rem' }}>
            <h4 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Calendar size={20} color="var(--accent-red)" />
              Daily Targets <span style={{ fontSize: '0.9rem', fontWeight: '400', color: 'var(--text-secondary)', marginLeft: '0.5rem' }}>(1 per subject)</span>
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
              <AnimatePresence>
                {dailyMissions.map((t) => (
                  <motion.div 
                    key={`daily-${t.id}`}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8, x: 20 }}
                    transition={{ duration: 0.3 }}
                    onClick={() => onStartLesson(t)}
                    whileHover={{ y: -5, borderColor: 'var(--accent-red)' }}
                    style={{
                      padding: '1.5rem',
                      background: 'rgba(255, 51, 68, 0.05)',
                      border: '1px solid rgba(255, 51, 68, 0.2)',
                      borderRadius: '24px',
                      cursor: 'pointer',
                      transition: 'all 0.3s'
                    }}
                  >
                    <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--accent-red)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                      {t.subject}
                    </div>
                    <div style={{ fontWeight: '600', marginBottom: '1rem', height: '2.5rem', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                      {t.subtopic || t.title.split(': ').pop()}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{t.xp} XP</div>
                      <div style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--accent-red)' }}>Start →</div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {dailyMissions.length === 0 && !continueToday && (
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  style={{ 
                    gridColumn: '1/-1', textAlign: 'center', padding: '3rem', 
                    background: 'rgba(255,255,255,0.02)', borderRadius: '24px', 
                    border: '1px solid var(--glass-border)', display: 'flex', 
                    flexDirection: 'column', alignItems: 'center', gap: '1.5rem' 
                  }}
                >
                  <div style={{ fontSize: '3rem' }}>🚀</div>
                  <div>
                    <h5 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>All daily targets completed!</h5>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>You've hit your goals for today. What would you like to do next?</p>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <button 
                      onClick={() => setContinueToday(true)}
                      style={{ 
                        padding: '0.75rem 1.5rem', background: 'var(--accent-red)', 
                        color: 'white', border: 'none', borderRadius: '12px', 
                        fontWeight: '600', cursor: 'pointer' 
                      }}
                    >
                      Continue Today
                    </button>
                    <button 
                      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                      style={{ 
                        padding: '0.75rem 1.5rem', background: 'rgba(255,255,255,0.05)', 
                        color: 'white', border: '1px solid var(--glass-border)', 
                        borderRadius: '12px', fontWeight: '600', cursor: 'pointer' 
                      }}
                    >
                      Continue Tomorrow
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* Achievements */}
          <div style={{ marginBottom: '4rem' }}>
            <h4 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Trophy size={20} color="var(--accent-red)" />
              Mission Achievements
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              {achievements.map((a) => {
                const progress = Math.min(100, (a.current / a.target) * 100);
                const isUnlocked = progress === 100;
                return (
                  <div key={a.id} style={{
                    padding: '1.5rem',
                    background: isUnlocked ? 'rgba(255, 215, 0, 0.05)' : 'rgba(255, 255, 255, 0.02)',
                    border: `1px solid ${isUnlocked ? 'rgba(255, 215, 0, 0.3)' : 'var(--glass-border)'}`,
                    borderRadius: '24px',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>{isUnlocked ? '🏆' : a.icon}</div>
                    <div style={{ fontWeight: '700', marginBottom: '0.25rem', color: isUnlocked ? '#ffd700' : 'white' }}>{a.title}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>{a.desc}</div>
                    
                    <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px', overflow: 'hidden' }}>
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        style={{ height: '100%', background: isUnlocked ? '#ffd700' : 'var(--accent-red)', boxShadow: isUnlocked ? '0 0 10px #ffd700' : 'none' }}
                      />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.75rem', fontWeight: '600' }}>
                      <span style={{ color: isUnlocked ? '#ffd700' : 'var(--text-secondary)' }}>{a.current} / {a.target}</span>
                      {isUnlocked && <span style={{ color: '#ffd700' }}>Unlocked!</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Leaderboard */}
          <div style={{ marginBottom: '4rem' }}>
            <h4 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Crown size={20} color="var(--accent-red)" />
              Global Leaderboard
            </h4>
            <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: '1px solid var(--glass-border)', overflow: 'hidden' }}>
              {leaderboard.map((user) => (
                <div key={user.name} style={{ 
                  display: 'flex', alignItems: 'center', padding: '1rem 1.5rem', 
                  borderBottom: '1px solid var(--glass-border)',
                  background: user.isCurrentUser ? 'rgba(99, 102, 241, 0.1)' : 'transparent'
                }}>
                  <div style={{ width: '40px', fontWeight: 'bold', color: user.rank <= 3 ? 'var(--accent-red)' : 'var(--text-secondary)' }}>
                    #{user.rank}
                  </div>
                  <div style={{ fontSize: '1.5rem', marginRight: '1rem' }}>{user.avatar}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '600', color: user.isCurrentUser ? '#8b5cf6' : 'white' }}>{user.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Level {user.level}</div>
                  </div>
                  <div style={{ fontWeight: '700', color: 'white' }}>{user.xp.toLocaleString()} XP</div>
                </div>
              ))}
            </div>
          </div>

          {/* Mission Log with Filters */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h4 style={{ fontSize: '1.25rem', fontWeight: '700', margin: 0 }}>Mission Log</h4>
              <select 
                value={missionFilter} 
                onChange={(e) => setMissionFilter(e.target.value)} 
                style={selectStyle}
              >
                <option value="total">Total Syllabus</option>
                <option value="completed">Completed</option>
                <option value="not_completed">Not Completed</option>
              </select>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '500px', overflowY: 'auto', paddingRight: '0.5rem' }} className="custom-scrollbar">
              {filteredTasks.map((t) => (
                <motion.div 
                  key={t.id}
                  layout
                  onClick={() => {
                    if (!t.completed) {
                      onStartLesson(t);
                    } else {
                      onToggleTask(t.id);
                    }
                  }}
                  style={{
                    padding: '1.25rem 1.5rem',
                    background: t.completed ? 'rgba(255, 51, 68, 0.05)' : 'rgba(255, 255, 255, 0.02)',
                    border: `1px solid ${t.completed ? 'rgba(255, 51, 68, 0.3)' : 'var(--glass-border)'}`,
                    borderRadius: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    transition: 'all 0.3s'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{
                      width: '24px', height: '24px', borderRadius: '50%', 
                      border: `2px solid ${t.completed ? 'var(--accent-red)' : 'var(--text-secondary)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: t.completed ? 'var(--accent-red)' : 'transparent',
                      transition: 'all 0.3s'
                    }}>
                      {t.completed && <CheckCircle2 size={16} color="white" />}
                    </div>
                    <div>
                      <div style={{ 
                        fontSize: '0.95rem',
                        fontWeight: '600', 
                        color: t.completed ? 'white' : 'var(--text-primary)',
                        opacity: t.completed ? 0.9 : 1
                      }}>{t.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{t.subject}</div>
                    </div>
                  </div>
                  <div style={{ 
                    fontSize: '0.85rem', fontWeight: '700',
                    color: t.completed ? 'var(--accent-red)' : 'var(--text-secondary)'
                  }}>+{t.xp} XP</div>
                </motion.div>
              ))}
              {filteredTasks.length === 0 && (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                  No missions found in this category.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Dashboard;
