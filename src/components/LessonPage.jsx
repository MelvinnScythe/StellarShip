import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle, AlertCircle, BookOpen } from 'lucide-react';
import { getLessonContent } from '../curriculumData';

import TTSButton from './TTSButton';

const LessonPage = ({ lesson, onBack, onComplete }) => {
  const { content, quiz, topics } = useMemo(() => getLessonContent(lesson.title, lesson.subject, lesson.lessonNum), [lesson.title, lesson.subject, lesson.lessonNum]);
  
  const [answers, setAnswers] = useState({});
  const [errorMsg, setErrorMsg] = useState("");

  const handleOptionSelect = (questionIdx, option) => {
    setAnswers(prev => ({ ...prev, [questionIdx]: option }));
    setErrorMsg(""); // Clear errors when they try again
  };

  const handleCompleteClick = () => {
    // Check if all questions are answered
    if (Object.keys(answers).length < quiz.length) {
      setErrorMsg("Please answer all questions before completing the mission.");
      return;
    }

    // Check if answers are correct
    let allCorrect = true;
    quiz.forEach((q, idx) => {
      if (answers[idx] !== q.answer) {
        allCorrect = false;
      }
    });

    if (!allCorrect) {
      setErrorMsg("Some answers are incorrect. Review the material and try again!");
      return;
    }

    // Success!
    onComplete();
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-primary)',
      color: 'var(--text-primary)',
      padding: '2rem'
    }}>
      <div className="container" style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        {/* Navigation */}
        <button 
          onClick={onBack}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'transparent',
            color: 'var(--text-secondary)',
            fontSize: '1rem',
            marginBottom: '3rem',
            padding: '0.5rem 0'
          }}
          onMouseOver={(e) => e.currentTarget.style.color = 'white'}
          onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
        >
          <ArrowLeft size={20} /> Back to Mission Control
        </button>

        {/* Lesson Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: '3rem' }}
        >
          <div style={{ 
            color: 'var(--accent-red)', 
            fontWeight: '600', 
            fontSize: '1rem',
            marginBottom: '1rem',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>
            {lesson.subject} Learning Module
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
            <h1 style={{ 
              fontSize: '3rem', 
              fontWeight: '700', 
              lineHeight: '1.2',
              marginBottom: '1rem',
              flex: 1
            }}>
              {lesson.title}
            </h1>
            <TTSButton text={lesson.title} language={lesson.subject} size={24} />
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem' }}>
            Master this topic to earn {lesson.xp} XP and progress in your journey.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}
        >
          {/* Curriculum Content */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid var(--glass-border)',
            borderRadius: '24px',
            padding: '2.5rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                < BookOpen size={24} color="var(--accent-red)" />
                <h2 style={{ fontSize: '1.5rem', fontWeight: '600' }}>Curriculum Material</h2>
              </div>
              <TTSButton text={content} language={lesson.subject} />
            </div>
            
            {topics && topics.length > 0 && (
              <div style={{ 
                marginBottom: '2rem', 
                padding: '1rem', 
                background: 'rgba(255, 255, 255, 0.05)', 
                borderRadius: '12px',
                borderLeft: '4px solid var(--accent-red)'
              }}>
                <p style={{ fontWeight: '600', fontSize: '0.9rem', marginBottom: '0.5rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Topics in this mission:</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {topics.map((t, i) => (
                    <span key={i} style={{ 
                      background: (i + 1 === lesson.lessonNum) ? 'var(--accent-red)' : 'rgba(255, 255, 255, 0.1)', 
                      color: (i + 1 === lesson.lessonNum) ? 'white' : 'var(--text-secondary)',
                      padding: '0.25rem 0.75rem', 
                      borderRadius: '100px',
                      fontSize: '0.85rem',
                      fontWeight: (i + 1 === lesson.lessonNum) ? '600' : '400',
                      border: (i + 1 === lesson.lessonNum) ? 'none' : '1px solid rgba(255,255,255,0.1)'
                    }}>{t}</span>
                  ))}
                </div>
              </div>
            )}

            <div style={{ color: 'var(--text-secondary)', lineHeight: '1.8', fontSize: '1.1rem' }} dangerouslySetInnerHTML={{ __html: content }} />
          </div>

          {/* Quiz Section */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid var(--glass-border)',
            borderRadius: '24px',
            padding: '2.5rem'
          }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1.5rem' }}>Knowledge Check</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Answer the following questions to complete your mission.</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {quiz.map((q, idx) => (
                <div key={idx}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '1rem' }}>
                    <p style={{ fontWeight: '600', fontSize: '1.1rem', flex: 1 }}>
                      {idx + 1}. {q.question}
                    </p>
                    <TTSButton text={q.question} language={lesson.subject} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {q.options.map((option, optIdx) => (
                      <label key={optIdx} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        padding: '1rem',
                        background: answers[idx] === option ? 'rgba(255, 51, 68, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                        border: `1px solid ${answers[idx] === option ? 'var(--accent-red)' : 'var(--glass-border)'}`,
                        borderRadius: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}>
                        <input 
                          type="radio" 
                          name={`question-${idx}`} 
                          value={option}
                          checked={answers[idx] === option}
                          onChange={() => handleOptionSelect(idx, option)}
                          style={{ accentColor: 'var(--accent-red)' }}
                        />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Error Message */}
        {errorMsg && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ 
              marginTop: '2rem', 
              padding: '1rem', 
              background: 'rgba(255, 51, 68, 0.1)', 
              border: '1px solid var(--accent-red)',
              borderRadius: '12px',
              color: '#ff8899',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              justifyContent: 'center'
            }}
          >
            <AlertCircle size={20} />
            {errorMsg}
          </motion.div>
        )}

        {/* Completion Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center' }}
        >
          <button 
            onClick={handleCompleteClick}
            style={{
              background: 'var(--accent-red)',
              color: 'white',
              padding: '1.25rem 3rem',
              borderRadius: '100px',
              fontSize: '1.2rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              boxShadow: '0 10px 25px rgba(255, 51, 68, 0.3)'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 15px 30px rgba(255, 51, 68, 0.4)';
            }} 
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 10px 25px rgba(255, 51, 68, 0.3)';
            }}
          >
            <CheckCircle size={24} />
            Submit Answers & Claim {lesson.xp} XP
          </button>
        </motion.div>

      </div>
    </div>
  );
};

export default LessonPage;
