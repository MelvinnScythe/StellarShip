import React from 'react';
import { motion } from 'framer-motion';
import { Rocket, ArrowRight } from 'lucide-react';

const Hero = () => {
  return (
    <section style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '6rem 2rem 2rem 2rem',
      textAlign: 'center',
      position: 'relative'
    }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.5rem 1rem',
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid var(--glass-border)',
          borderRadius: '100px',
          marginBottom: '2.5rem',
          fontSize: '0.85rem',
          color: 'var(--text-secondary)'
        }}
      >
        <Rocket size={14} color="var(--accent-red)" />
        <span>Launch your learning journey</span>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        style={{
          fontSize: 'clamp(3rem, 8vw, 5.5rem)',
          fontWeight: '700',
          lineHeight: '1.1',
          maxWidth: '900px',
          marginBottom: '1.5rem',
          letterSpacing: '-2px'
        }}
      >
        Study Smarter, <br />
        <span style={{ color: 'var(--accent-red)' }}>Reach for the Stars</span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        style={{
          fontSize: 'clamp(1.1rem, 2vw, 1.25rem)',
          color: 'var(--text-secondary)',
          maxWidth: '650px',
          lineHeight: '1.6',
          marginBottom: '3rem'
        }}
      >
        Your mission control for academic success. Track progress, master subjects, and launch yourself into a universe of knowledge.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', justifyContent: 'center' }}
      >
        <button style={{
          background: 'var(--accent-red)',
          color: 'white',
          padding: '1rem 2rem',
          borderRadius: '100px',
          fontSize: '1rem',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          boxShadow: '0 10px 25px rgba(255, 51, 68, 0.3)'
        }} onMouseOver={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 15px 30px rgba(255, 51, 68, 0.4)';
        }} onMouseOut={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 10px 25px rgba(255, 51, 68, 0.3)';
        }}>
          <Rocket size={18} fill="white" />
          Start Learning
        </button>
        
        <button style={{
          background: 'transparent',
          color: 'var(--text-primary)',
          padding: '1rem 2rem',
          borderRadius: '100px',
          fontSize: '1rem',
          fontWeight: '600',
          border: '1px solid var(--glass-border)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }} onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
           onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
          Explore Features
          <ArrowRight size={18} />
        </button>
      </motion.div>

      {/* Decorative Planet */}
      <motion.div
        animate={{
          y: [0, -20, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        style={{
          position: 'absolute',
          bottom: '10%',
          right: '5%',
          width: '150px',
          height: '150px',
          background: 'radial-gradient(circle at 30% 30%, #ff3344, #300)',
          borderRadius: '50%',
          opacity: 0.1,
          filter: 'blur(20px)',
          zIndex: -1
        }}
      />
    </section>
  );
};

export default Hero;
