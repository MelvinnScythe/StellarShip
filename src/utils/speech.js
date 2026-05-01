let preferredVoice = null;

export const getAvailableVoices = (langPrefix = '') => {
  if (typeof window === 'undefined' || !window.speechSynthesis) return [];
  const voices = window.speechSynthesis.getVoices();
  if (langPrefix) {
    return voices.filter(v => v.lang.startsWith(langPrefix));
  }
  return voices;
};

export const setPreferredVoice = (voice) => {
  preferredVoice = voice;
};

const MOOD_PROSODY = {
  'excited': { pitch: 1.2, rate: 1.1 },
  'happy': { pitch: 1.1, rate: 1.05 },
  'sad': { pitch: 0.8, rate: 0.8 },
  'serious': { pitch: 0.9, rate: 0.9 },
  'friendly': { pitch: 1.05, rate: 1.0 },
  'neutral': { pitch: 1.0, rate: 0.95 },
  'encouraging': { pitch: 1.1, rate: 0.95 }
};

export const speak = (text, language = 'en-US', options = {}) => {
  const { voiceOverride = null, mood = 'friendly' } = options;
  
  if (!window.speechSynthesis) {
    console.error('Speech synthesis not supported');
    return;
  }

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  const voices = window.speechSynthesis.getVoices();
  
  const langMap = {
    'English': 'en-US',
    'Hindi': 'hi-IN',
    'Mathematics': 'en-US',
    'EVS': 'en-US',
    'Science': 'en-US',
    'Social Studies': 'en-US'
  };

  const targetLang = langMap[language] || language;
  utterance.lang = targetLang;

  // Voice Selection
  if (voiceOverride) {
    utterance.voice = voiceOverride;
  } else if (preferredVoice && preferredVoice.lang.startsWith(targetLang.split('-')[0])) {
    utterance.voice = preferredVoice;
  } else {
    const bestVoice = voices.find(v => v.lang.startsWith(targetLang.split('-')[0]) && (v.name.includes('Google') || v.localService));
    if (bestVoice) {
      utterance.voice = bestVoice;
    }
  }

  // Mood/Emotion Simulation
  const prosody = MOOD_PROSODY[mood] || MOOD_PROSODY['neutral'];
  utterance.pitch = prosody.pitch;
  utterance.rate = prosody.rate;

  window.speechSynthesis.speak(utterance);
};

// Prefetch
if (typeof window !== 'undefined' && window.speechSynthesis) {
  window.speechSynthesis.getVoices();
  if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
  }
}
