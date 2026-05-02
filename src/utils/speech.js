// ---------------------------------------------------------------------------
// speech.js  –  TTS via Gemini Flash 2.5 Preview (direct from browser) with browser fallback
// ---------------------------------------------------------------------------

const GEMINI_TTS_API_KEY = import.meta.env.VITE_GEMINI_API_KEY_TTS;
const GEMINI_TTS_MODEL   = 'gemini-2.5-flash-preview-tts';
const GEMINI_TTS_URL     = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_TTS_MODEL}:generateContent`;

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
 * Convert raw Linear PCM (16-bit LE, mono) to a WAV Blob playable by <audio>.
 */
function pcmToWavBlob(pcmBase64, sampleRate = 24000) {
  const pcm = Uint8Array.from(atob(pcmBase64), c => c.charCodeAt(0));
  const numChannels  = 1;
  const bitsPerSample = 16;
  const byteRate     = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign   = (numChannels * bitsPerSample) / 8;
  const dataSize     = pcm.byteLength;

  const buf = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buf);

  const write = (offset, str) => {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
  };

  write(0,  'RIFF');
  view.setUint32(4,  36 + dataSize, true);
  write(8,  'WAVE');
  write(12, 'fmt ');
  view.setUint32(16, 16, true);           // PCM chunk size
  view.setUint16(20, 1,  true);           // PCM format
  view.setUint16(22, numChannels,   true);
  view.setUint32(24, sampleRate,    true);
  view.setUint32(28, byteRate,      true);
  view.setUint16(32, blockAlign,    true);
  view.setUint16(34, bitsPerSample, true);
  write(36, 'data');
  view.setUint32(40, dataSize, true);

  new Uint8Array(buf).set(pcm, 44);
  return new Blob([buf], { type: 'audio/wav' });
}

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

  if (!GEMINI_TTS_API_KEY) {
    console.warn('[TTS] VITE_GEMINI_API_KEY_TTS not set – using browser fallback');
    if (onStart) onStart();
    _browserFallback(cleanText, langTag, onEnd);
    return;
  }

  if (onStart) onStart();

  try {
    const response = await fetch(`${GEMINI_TTS_URL}?key=${GEMINI_TTS_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: cleanText.slice(0, 5000) }] }],
        generationConfig: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName }
            }
          }
        }
      })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err?.error?.message || `HTTP ${response.status}`);
    }

    const data = await response.json();
    const audioPart = data?.candidates?.[0]?.content?.parts?.find(
      p => p.inlineData?.mimeType?.startsWith('audio/')
    );
    if (!audioPart) throw new Error('No audio data in Gemini response');

    // Parse sample rate from mime type (e.g. "audio/L16;rate=24000")
    let sampleRate = 24000;
    const rateMatch = audioPart.inlineData.mimeType.match(/rate=(\d+)/);
    if (rateMatch) sampleRate = parseInt(rateMatch[1], 10);

    const wavBlob = pcmToWavBlob(audioPart.inlineData.data, sampleRate);
    const url = URL.createObjectURL(wavBlob);
    const audio = new Audio(url);
    currentAudio = audio;

    await new Promise((resolve, reject) => {
      audio.onended = () => {
        URL.revokeObjectURL(url);
        currentAudio = null;
        if (onEnd) onEnd();
        resolve();
      };
      audio.onerror = () => {
        URL.revokeObjectURL(url);
        currentAudio = null;
        reject(new Error('Audio playback error'));
      };
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
