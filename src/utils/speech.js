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

export const speak = (text, language = 'en-US', voiceOverride = null) => {
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

  // Selection priority: Override > Global Preferred > Auto-find best
  if (voiceOverride) {
    utterance.voice = voiceOverride;
  } else if (preferredVoice && preferredVoice.lang.startsWith(targetLang.split('-')[0])) {
    utterance.voice = preferredVoice;
  } else {
    // Auto-find highest quality available (usually localService voices are better)
    const bestVoice = voices.find(v => v.lang.startsWith(targetLang.split('-')[0]) && (v.name.includes('Google') || v.localService));
    if (bestVoice) {
      utterance.voice = bestVoice;
    }
  }

  utterance.pitch = 1;
  utterance.rate = 0.95; 

  window.speechSynthesis.speak(utterance);
};

// Prefetch
if (typeof window !== 'undefined' && window.speechSynthesis) {
  window.speechSynthesis.getVoices();
  if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
  }
}
