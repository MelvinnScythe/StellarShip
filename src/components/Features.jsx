import React from 'react';
import { motion } from 'framer-motion';
import { Book, Brain, Target, Trophy, Zap, Clock } from 'lucide-react';

const Features = () => {
  const features = [
    {
      icon: <Book size={24} />,
      title: "Smart Flashcards",
      description: "AI-powered flashcards that adapt to your learning pace and help you memorize faster."
    },
    {
      icon: <Brain size={24} />,
      title: "Adaptive Learning",
      description: "Personalized study paths that evolve based on your strengths and areas for improvement."
    },
    {
      icon: <Target size={24} />,
      title: "Goal Tracking",
      description: "Set study goals and track your progress with visual milestones and achievements."
    },
    {
      icon: <Trophy size={24} />,
      title: "Achievements",
      description: "Earn badges and rewards as you complete courses and master new subjects."
    },
    {
      icon: <Zap size={24} />,
      title: "Quick Quizzes",
      description: "Test your knowledge with instant quizzes and get detailed performance insights."
    },
    {
      icon: <Clock size={24} />,
      title: "Study Timer",
      description: "Pomodoro-style timers to maximize focus and maintain healthy study habits."
    }
  ];

  return (
    <section id="features" style={{ padding: '8rem 2rem' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '1rem' }}>
            Powerful Features for <span style={{ color: 'var(--accent-red)' }}>Stellar Learning</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '700px', margin: '0 auto' }}>
            Everything you need to transform your study sessions into productive, engaging experiences.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1.5rem'
        }}>
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -5, borderColor: 'rgba(255, 51, 68, 0.3)' }}
              style={{
                padding: '2rem',
                background: 'var(--glass-bg)',
                border: '1px solid var(--glass-border)',
                borderRadius: '20px',
                textAlign: 'left'
              }}
            >
              <div style={{
                color: 'var(--accent-red)',
                marginBottom: '1.25rem',
                background: 'rgba(255, 51, 68, 0.1)',
                width: 'fit-content',
                padding: '0.75rem',
                borderRadius: '12px'
              }}>
                {f.icon}
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.75rem' }}>{f.title}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6' }}>{f.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
