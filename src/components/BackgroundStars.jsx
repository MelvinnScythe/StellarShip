import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

const BackgroundStars = () => {
  const stars = useMemo(() => {
    return Array.from({ length: 150 }).map((_, i) => ({
      id: i,
      size: Math.random() * 2 + 1,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      duration: Math.random() * 3 + 2,
      delay: Math.random() * 5,
    }));
  }, []);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      zIndex: -1,
      background: 'radial-gradient(circle at center, #101018 0%, #050508 100%)',
      overflow: 'hidden'
    }}>
      {stars.map((star) => (
        <motion.div
          key={star.id}
          initial={{ opacity: 0.1 }}
          animate={{ opacity: [0.1, 0.6, 0.1] }}
          transition={{
            duration: star.duration,
            repeat: Infinity,
            delay: star.delay,
          }}
          style={{
            position: 'absolute',
            top: star.top,
            left: star.left,
            width: star.size,
            height: star.size,
            backgroundColor: '#ffffff',
            borderRadius: '50%',
            filter: 'blur(0.5px)',
          }}
        />
      ))}
      
      {/* Background Glows */}
      <div style={{
        position: 'absolute',
        top: '-10%',
        right: '-10%',
        width: '50%',
        height: '50%',
        background: 'radial-gradient(circle, rgba(255, 51, 68, 0.08) 0%, transparent 70%)',
        filter: 'blur(80px)',
      }} />
      <div style={{
        position: 'absolute',
        bottom: '20%',
        left: '10%',
        width: '40%',
        height: '40%',
        background: 'radial-gradient(circle, rgba(59, 130, 246, 0.06) 0%, transparent 70%)',
        filter: 'blur(100px)',
      }} />
      <div style={{
        position: 'absolute',
        top: '30%',
        left: '-10%',
        width: '30%',
        height: '30%',
        background: 'radial-gradient(circle, rgba(168, 85, 247, 0.05) 0%, transparent 70%)',
        filter: 'blur(80px)',
      }} />
    </div>
  );
};

export default BackgroundStars;
