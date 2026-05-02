import React, { useState, useRef } from 'react';
import { Volume2, VolumeX, Loader } from 'lucide-react';
import { speak, stopSpeaking, isSpeakingNow } from '../utils/speech';

const TTSButton = ({ text, language, size = 18, mood = 'friendly', voice }) => {
  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'speaking'
  const isMounted = useRef(true);

  // Clean up on unmount
  React.useEffect(() => {
    return () => { isMounted.current = false; };
  }, []);

  const handleClick = async (e) => {
    e.stopPropagation();

    if (status === 'speaking' || status === 'loading') {
      stopSpeaking();
      if (isMounted.current) setStatus('idle');
      return;
    }

    const cleanText = text?.replace(/<[^>]*>?/gm, '').trim();
    if (!cleanText) return;

    if (isMounted.current) setStatus('loading');

    await speak(cleanText, language, {
      voiceName: voice,
      onStart: () => { if (isMounted.current) setStatus('speaking'); },
      onEnd:   () => { if (isMounted.current) setStatus('idle'); },
      onError: () => { if (isMounted.current) setStatus('speaking'); }, // fallback running
    });

    if (isMounted.current) setStatus('idle');
  };

  const isActive = status === 'speaking';
  const isLoading = status === 'loading';

  return (
    <button
      onClick={handleClick}
      title={isLoading ? 'Generating audio…' : isActive ? 'Stop' : 'Listen'}
      style={{
        background: isActive
          ? 'rgba(255, 80, 80, 0.15)'
          : 'rgba(255, 255, 255, 0.1)',
        border: isActive ? '1px solid rgba(255,80,80,0.4)' : 'none',
        borderRadius: '50%',
        width: size + 12,
        height: size + 12,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: isLoading ? 'wait' : 'pointer',
        color: isActive
          ? 'var(--accent-red, #ff5050)'
          : isLoading
          ? 'var(--accent-blue, #4fc3f7)'
          : 'var(--text-secondary)',
        transition: 'all 0.2s',
        flexShrink: 0,
        animation: isLoading ? 'tts-pulse 1s ease-in-out infinite' : 'none',
      }}
      onMouseOver={(e) => {
        if (isLoading) return;
        e.currentTarget.style.background = isActive
          ? 'rgba(255, 80, 80, 0.25)'
          : 'rgba(255, 255, 255, 0.2)';
        e.currentTarget.style.color = 'white';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.background = isActive
          ? 'rgba(255, 80, 80, 0.15)'
          : 'rgba(255, 255, 255, 0.1)';
        e.currentTarget.style.color = isActive
          ? 'var(--accent-red, #ff5050)'
          : isLoading
          ? 'var(--accent-blue, #4fc3f7)'
          : 'var(--text-secondary)';
      }}
    >
      {isLoading
        ? <Loader size={size} style={{ animation: 'spin 0.8s linear infinite' }} />
        : isActive
        ? <VolumeX size={size} />
        : <Volume2 size={size} />
      }

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes tts-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(79, 195, 247, 0.3); }
          50%       { box-shadow: 0 0 0 6px rgba(79, 195, 247, 0); }
        }
      `}</style>
    </button>
  );
};

export default TTSButton;
