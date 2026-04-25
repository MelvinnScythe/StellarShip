import React from 'react';
import { motion } from 'framer-motion';
import { Ruler, Atom, Beaker, Dna, BookOpen, Building2 } from 'lucide-react';

const iconMap = {
  "Mathematics": <Ruler size={20} />,
  "Physics": <Atom size={20} />,
  "Chemistry": <Beaker size={20} />,
  "Biology": <Dna size={20} />,
  "Literature": <BookOpen size={20} />,
  "History": <Building2 size={20} />
};

const Subjects = ({ subjects }) => {
  return (
    <section id="subjects" style={{ padding: '8rem 2rem', background: 'rgba(255, 255, 255, 0.01)' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '1rem' }}>
            Explore <span style={{ color: 'var(--accent-red)' }}>Subjects</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
            Dive into a galaxy of subjects and track your progress across different fields of study.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1.5rem'
        }}>
          {subjects.map((s, i) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              style={{
                padding: '2rem',
                background: 'var(--glass-bg)',
                border: '1px solid var(--glass-border)',
                borderRadius: '20px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ color: s.color }}>{iconMap[s.name]}</div>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '600' }}>{s.name}</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{s.lessons}/{s.totalLessons} lessons</p>
                  </div>
                </div>
                <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>{s.progress}%</span>
              </div>
              
              <div style={{
                height: '6px',
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '100px',
                overflow: 'hidden'
              }}>
                <motion.div
                  animate={{ width: `${s.progress}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  style={{
                    height: '100%',
                    background: 'var(--accent-red)',
                    boxShadow: '0 0 10px rgba(255, 51, 68, 0.5)'
                  }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Subjects;
