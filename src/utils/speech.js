export const speak = (text, language = 'en-US') => {
  if (!window.speechSynthesis) {
    console.error('Speech synthesis not supported');
    return;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  
  // Try to find a voice matching the language
  const voices = window.speechSynthesis.getVoices();
  
  // Mapping of simple language codes to common speech synthesis codes
  const langMap = {
    'English': 'en-US',
    'Hindi': 'hi-IN',
    'Mathematics': 'en-US', // Default to English for other subjects
    'EVS': 'en-US',
    'Science': 'en-US',
    'Social Studies': 'en-US'
  };

  const targetLang = langMap[language] || language;
  utterance.lang = targetLang;

  // Attempt to find a higher quality voice if available
  const preferredVoice = voices.find(v => v.lang.startsWith(targetLang.split('-')[0]) && v.localService);
  if (preferredVoice) {
    utterance.voice = preferredVoice;
  }

  // Adjust pitch and rate for educational clarity
  utterance.pitch = 1;
  utterance.rate = 0.9; // Slightly slower for better learning

  window.speechSynthesis.speak(utterance);
};

// Prefetch voices (some browsers need this)
if (typeof window !== 'undefined' && window.speechSynthesis) {
  window.speechSynthesis.getVoices();
  if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
  }
}
