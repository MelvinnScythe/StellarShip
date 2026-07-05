// ---------------------------------------------------------------------------
// speech.js  –  TTS via backend Gemini route with browser fallback
// ---------------------------------------------------------------------------

const API_ROOT = import.meta.env.VITE_API_URL || '';

// Subject name → BCP-47 language tag
const SUBJECT_LANG_MAP = {
  'English':       'en-US',
  'Hindi':         'hi-IN',
  'Mathematics':   'en-US',
  'EVS':           'en-US',
  'Science':       'en-US',
  'Social Studies':'en-US',
};

// BCP-47 language tag → default Gemini prebuilt voice name
const LANG_VOICE_MAP = {
  'en-US': 'Aoede',
  'en-GB': 'Fenrir',
  'hi-IN': 'Kore',
};

// Available Gemini TTS voices the user can choose from
export const GEMINI_VOICES = [
  { id: 'Orus',      label: 'Orus',      desc: 'Warm & clear' },
  { id: 'Enceladus', label: 'Enceladus', desc: 'Calm & steady' },
  { id: 'Aoede',     label: 'Aoede',     desc: 'Bright & lively' },
  { id: 'Fenrir',    label: 'Fenrir',    desc: 'Deep & resonant' },
  { id: 'Kore',      label: 'Kore',      desc: 'Gentle & soft' },
];

// Currently playing Audio instance (allows stopping mid-playback)
let currentAudio = null;

// Cache for generated audio blob URLs to prevent re-fetching the same sentence/voice
const audioCache = new Map();

/** Stop any currently playing TTS audio. */
export const stopSpeaking = () => {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.src = '';
    currentAudio = null;
  }
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
};

/** Returns true if Gemini TTS audio or browser TTS is currently active. */
export const isSpeakingNow = () => {
  if (currentAudio && !currentAudio.paused) return true;
  if (typeof window !== 'undefined' && window.speechSynthesis?.speaking) return true;
  return false;
};

/**
 * Speak text using Gemini Flash 2.5 TTS Preview.
 * Falls back to browser SpeechSynthesis on error.
 *
 * @param {string} text       - Raw or HTML text to speak.
 * @param {string} language   - Subject name (e.g. 'English') or BCP-47 tag (e.g. 'hi-IN').
 * @param {object} options    - { onStart, onEnd, onError, voiceName }
 */
export const speak = async (text, language = 'en-US', options = {}) => {
  const { onStart, onEnd, onError, voiceName: overrideVoice } = options;

  // Strip HTML tags
  const cleanText = text.replace(/<[^>]*>?/gm, '').trim();
  if (!cleanText) return;

  // Resolve to a BCP-47 tag
  const langTag   = SUBJECT_LANG_MAP[language] || language;
  const voiceName = overrideVoice || LANG_VOICE_MAP[langTag] || 'Aoede';

  // Stop any previous speech
  stopSpeaking();

  const cacheKey = `${voiceName}|${cleanText}`;

  if (audioCache.has(cacheKey)) {
    if (onStart) onStart();
    const url = audioCache.get(cacheKey);
    const audio = new Audio(url);
    currentAudio = audio;
    await new Promise((resolve, reject) => {
      audio.onended = () => {
        currentAudio = null;
        if (onEnd) onEnd();
        resolve();
      };
      audio.onerror = () => {
        currentAudio = null;
        reject(new Error('Audio playback error'));
      };
      audio.play().catch(reject);
    });
    return;
  }

  try {
    const response = await fetch(`${API_ROOT}/api/tts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: cleanText.slice(0, 5000),
        language: langTag,
        voiceName
      })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err?.error?.message || `HTTP ${response.status}`);
    }

    const wavBlob = await response.blob();
    const url = URL.createObjectURL(wavBlob);
    audioCache.set(cacheKey, url);
    
    const audio = new Audio(url);
    currentAudio = audio;

    await new Promise((resolve, reject) => {
      audio.onended = () => {
        currentAudio = null;
        if (onEnd) onEnd();
        resolve();
      };
      audio.onerror = () => {
        currentAudio = null;
        reject(new Error('Audio playback error'));
      };
      if (onStart) onStart(); // Signal UI that speaking is starting *now*
      audio.play().catch(reject);
    });

  } catch (err) {
    console.warn('[TTS] Gemini TTS failed, falling back to browser TTS:', err.message);
    if (onError) onError(err);
    _browserFallback(cleanText, langTag, onEnd);
  }
};

// ---------------------------------------------------------------------------
// Browser SpeechSynthesis fallback
// ---------------------------------------------------------------------------
let preferredVoice = null;

export const getAvailableVoices = (langPrefix = '') => {
  if (typeof window === 'undefined' || !window.speechSynthesis) return [];
  const voices = window.speechSynthesis.getVoices();
  return langPrefix ? voices.filter(v => v.lang.startsWith(langPrefix)) : voices;
};

export const setPreferredVoice = (voice) => { preferredVoice = voice; };

function _browserFallback(text, langTag, onEnd) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = langTag;
  const voices = window.speechSynthesis.getVoices();
  const langBase = langTag.split('-')[0];
  if (preferredVoice && preferredVoice.lang.startsWith(langBase)) {
    utterance.voice = preferredVoice;
  } else {
    const best = voices.find(
      v => v.lang.startsWith(langBase) && (v.name.includes('Google') || v.localService)
    );
    if (best) utterance.voice = best;
  }
  utterance.pitch = 1.05;
  utterance.rate  = 1.0;
  if (onEnd) utterance.onend = onEnd;
  window.speechSynthesis.speak(utterance);
}

// Prefetch voices
if (typeof window !== 'undefined' && window.speechSynthesis) {
  window.speechSynthesis.getVoices();
  if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
  }
}
