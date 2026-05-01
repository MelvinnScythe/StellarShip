import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, BookOpen, Star, Calendar, CheckCircle2, Circle, Flame, Trophy, Crown } from 'lucide-react';

const Dashboard = ({ stats, tasks, onToggleTask, selectedClass, onClassChange, selectedBoard, onBoardChange, onStartLesson, dailyMissions }) => {
  const statCards = [
    { label: "Study Time", value: `${stats.studyTime}h`, sub: "This week", icon: <Clock size={18} /> },
    { label: "Lessons", value: stats.lessonsCompleted, sub: "Completed", icon: <BookOpen size={18} /> },
    { label: "XP Earned", value: stats.xpEarned.toLocaleString(), sub: "This month", icon: <Star size={18} /> },
    { label: "Next Goal", value: stats.nextGoal.split(' ')[0] + ' ' + stats.nextGoal.split(' ')[1], sub: stats.nextGoal.split(' ').slice(2).join(' '), icon: <Calendar size={18} /> }
  ];

  const [leaderboard, setLeaderboard] = React.useState([]);

  React.useEffect(() => {
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
            isCurrentUser: currentUser && u.name === currentUser.name
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

  return (
    <section id="progress" style={{ padding: '8rem 2rem' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '1rem' }}>
            Your <span style={{ color: 'var(--accent-red)' }}>Mission Control</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
            A powerful dashboard to track your learning journey and stay motivated.
          </p>
        </div>

        <div style={{
          background: 'var(--glass-bg)',
          border: '1px solid var(--glass-border)',
          borderRadius: '32px',
          padding: '3rem',
          maxWidth: '1000px',
          margin: '0 auto',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Header Stats */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '3rem', flexWrap: 'wrap', gap: '2rem' }}>
            <div>
              <h3 style={{ fontSize: '1.75rem', fontWeight: '700', marginBottom: '0.5rem' }}>Welcome back, Explorer!</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>You're making great progress this week</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Board:</label>
                  <select 
                    value={selectedBoard} 
                    onChange={(e) => onBoardChange(e.target.value)}
                    style={{
                      background: 'var(--bg-secondary)',
                      color: 'white',
                      border: '1px solid var(--glass-border)',
                      padding: '0.5rem 1rem',
                      borderRadius: '8px',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="CBSE">CBSE</option>
                    <option value="NCERT">NCERT</option>
                    <option value="ICSE">ICSE</option>
                  </select>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Class:</label>
                  <select 
                    value={selectedClass} 
                    onChange={(e) => onClassChange(parseInt(e.target.value))}
                    style={{
                      background: 'var(--bg-secondary)',
                      color: 'white',
                      border: '1px solid var(--glass-border)',
                      padding: '0.5rem 1rem',
                      borderRadius: '8px',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
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
                  borderRadius: '20px', border: '1px solid var(--glass-border)'
                }}
              >
                <div style={{ color: 'var(--text-secondary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {s.icon} <span style={{ fontSize: '0.85rem' }}>{s.label}</span>
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
                  borderBottom: user.rank !== 5 ? '1px solid var(--glass-border)' : 'none',
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

          {/* Daily Missions */}
          <div style={{ marginBottom: '4rem' }}>
            <h4 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Calendar size={20} color="var(--accent-red)" />
              Daily Targets <span style={{ fontSize: '0.9rem', fontWeight: '400', color: 'var(--text-secondary)', marginLeft: '0.5rem' }}>(1 per subject)</span>
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
              {dailyMissions.map((t) => (
                <motion.div 
                  key={`daily-${t.id}`}
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
              {dailyMissions.length === 0 && (
                <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '2rem', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', color: 'var(--text-secondary)' }}>
                  🎉 All daily targets completed! Great job!
                </div>
              )}
            </div>
          </div>

          {/* All Missions */}
          <div>
            <h4 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1.5rem' }}>Full Curriculum Mission Log</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '400px', overflowY: 'auto', paddingRight: '0.5rem' }} className="custom-scrollbar">
              {tasks.map((t) => (
                <motion.div 
                  key={t.id}
                  onClick={() => {
                    if (!t.completed) {
                      onStartLesson(t);
                    } else {
                      onToggleTask(t.id);
                    }
                  }}
                  style={{
                    padding: '1rem 1.5rem',
                    background: t.completed ? 'rgba(255, 51, 68, 0.03)' : 'rgba(255, 255, 255, 0.01)',
                    border: `1px solid ${t.completed ? 'rgba(255, 51, 68, 0.1)' : 'var(--glass-border)'}`,
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    opacity: t.completed ? 0.7 : 1
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    {t.completed ? 
                      <CheckCircle2 size={20} color="var(--accent-red)" /> : 
                      <Circle size={20} color="var(--text-secondary)" />
                    }
                    <div>
                      <div style={{ 
                        fontSize: '0.9rem',
                        fontWeight: '500', 
                        textDecoration: t.completed ? 'line-through' : 'none',
                        color: t.completed ? 'var(--text-secondary)' : 'var(--text-primary)'
                      }}>{t.title}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{t.xp} XP</div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Dashboard;
