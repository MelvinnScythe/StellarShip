import React, { useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { speak } from '../utils/speech';

const TTSButton = ({ text, language, size = 18, mood = 'friendly' }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleSpeak = (e) => {
    e.stopPropagation();
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      // Strip HTML if present
      const cleanText = text.replace(/<[^>]*>?/gm, '');
      speak(cleanText, language, { mood });
      setIsSpeaking(true);
      
      // Reset icon when speech finishes
      const checkStatus = setInterval(() => {
        if (!window.speechSynthesis.speaking) {
          setIsSpeaking(false);
          clearInterval(checkStatus);
        }
      }, 100);
    }
  };

  return (
    <button
      onClick={handleSpeak}
      title="Listen"
      style={{
        background: 'rgba(255, 255, 255, 0.1)',
        border: 'none',
        borderRadius: '50%',
        width: size + 12,
        height: size + 12,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        color: isSpeaking ? 'var(--accent-red)' : 'var(--text-secondary)',
        transition: 'all 0.2s',
        flexShrink: 0
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
        e.currentTarget.style.color = 'white';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
        e.currentTarget.style.color = isSpeaking ? 'var(--accent-red)' : 'var(--text-secondary)';
      }}
    >
      {isSpeaking ? <VolumeX size={size} /> : <Volume2 size={size} />}
    </button>
  );
};

export default TTSButton;
