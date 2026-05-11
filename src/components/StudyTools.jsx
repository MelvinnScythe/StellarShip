import { Calculator, ArrowRightLeft, Clock, Book, Loader2, Sparkles, ClipboardList, Volume2, Mic, StopCircle, Play, AlertCircle, Loader } from 'lucide-react';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { speak, stopSpeaking, GEMINI_VOICES } from '../utils/speech';

const SpeakingTab = ({ userClass }) => {
  const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY_SPEAKING || import.meta.env.VITE_GEMINI_API_KEY);
  const [targetText, setTargetText] = useState("The quick brown fox jumps over the lazy dog.");
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [audioUrl, setAudioUrl] = useState(null);
  const [audioData, setAudioData] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [targetAnalysis, setTargetAnalysis] = useState(null);
  const [isListeningForAnalysis, setIsListeningForAnalysis] = useState(false);
  const [isAnalyzingTarget, setIsAnalyzingTarget] = useState(false);
  const analysisRecognitionRef = React.useRef(null);
  const [selectedVoice, setSelectedVoice] = useState('Orus');
  const [isTTSSpeaking, setIsTTSSpeaking] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState('English');
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const audioRef = React.useRef(null);
  
  const recognitionRef = React.useRef(null);
  const mediaRecorderRef = React.useRef(null);
  const audioChunksRef = React.useRef([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      mediaRecorderRef.current = new MediaRecorder(stream);
      
      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const mimeType = mediaRecorderRef.current.mimeType || 'audio/webm';
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        setAudioUrl(URL.createObjectURL(audioBlob));

        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64 = reader.result.split(',')[1];
          const payload = { base64, mimeType };
          setAudioData(payload);
        };
      };

      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.onresult = (event) => {
          let finalTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            finalTranscript += event.results[i][0].transcript;
          }
          setTranscript(finalTranscript);
        };
        recognitionRef.current.onend = () => {
          // Trigger analysis after recognition ends to ensure we have the full text
          setIsRecording(false);
        };
        recognitionRef.current.start();
      }

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setFeedback(null);
      setTranscript('');
      setAudioData(null);
    } catch (err) {
      console.error("Mic error:", err);
      alert("Please allow microphone access to practice speaking.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) mediaRecorderRef.current.stop();
    if (recognitionRef.current) recognitionRef.current.stop();
    setIsRecording(false);
  };

  const analyzeSpeech = async (audioPayload = null) => {
    const audioToUse = audioPayload || audioData;
    if (!audioToUse && !transcript) {
      console.warn("No audio or transcript to analyze");
      return;
    }
    setIsAnalyzing(true);
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
      const prompt = `Role: You are an advanced, patient Language Coach specializing in English and Hindi phonetics. Your goal is to help the user achieve native-like pronunciation through a repetitive "Challenge-Feedback-Adapt" loop.

Task: Analyze the provided audio recording of the user reading the Target Sentence. DO NOT rely on any text transcript, you must listen to the exact phonetic sounds they make.

Target Sentence: "${targetText}"

Workflow:
1. Analysis: Analyze the audio for phonetic accuracy, matras (vowels), varnamala (consonants), word stress, and rhythm.
2. Feedback: Compare the exact sounds the user made to the target sentence. Point out specific errors.
    - For Hindi: Use Devanagari script. Identify specific Matras (e.g., mistaken 'ि' for 'ी') or Vyanjan.
    - For English: Use "Sounds-like" spelling. E.g., "You said it wrong, it's pronounced 'foks' not 'fawks'".
    - Physical Tips: ALWAYS provide a "Mouth Position" tip (e.g., "Keep your tongue between your teeth for the 'th' sound").
3. Adapt: Based on the errors, give a new task (drill for a letter, or harder sentence if perfect).

Return ONLY a raw JSON object with this exact structure:
{
  "score": 85,
  "feedback": "Encouraging summary",
  "mistakes": [
    {
      "word": "word with error",
      "error": "You said it wrong, it's pronounced 'X' not 'Y'. (Explain the exact sound difference)",
      "tip": "Mouth Position tip...",
      "drill": "Specific drill for this sound..."
    }
  ],
  "newSentence": "A slightly harder or drill sentence based on the mistakes."
}
Strictly JSON. No extra text or markdown.`;

      const contents = [prompt];
      if (audioToUse) {
        contents.push({
          inlineData: {
            data: audioToUse.base64,
            mimeType: audioToUse.mimeType
          }
        });
      }

      const result = await model.generateContent(contents);
      let text = result.response.text();
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        setFeedback(parsed);
        if (parsed.newSentence) {
          setTargetText(parsed.newSentence);
        }
      } else {
        throw new Error("Invalid response format");
      }
    } catch (e) {
      console.error("Speech Analysis Error:", e);
      alert("AI Coach failed to analyze speech. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const analyzeTargetText = async () => {
    if (!targetText) return;
    setIsAnalyzingTarget(true);
    setTargetAnalysis(null);
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
      const prompt = `Analyze this sentence for a Class ${userClass || 'elementary'} student: "${targetText}".
      Provide:
      1. Simple meaning.
      2. Grammar points explained simply.
      3. Key vocabulary words and meanings.
      
      Return ONLY a raw JSON object:
      {
        "meaning": "string",
        "grammar": ["string"],
        "vocabulary": [{"word": "string", "meaning": "string"}]
      }
      Strictly JSON. No extra text.`;
      
      const result = await model.generateContent(prompt);
      let text = result.response.text();
      // More robust JSON extraction
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        setTargetAnalysis(JSON.parse(jsonMatch[0]));
      } else {
        throw new Error("Invalid response format");
      }
    } catch (e) {
      console.error("Target Analysis Error:", e);
      alert("AI analysis failed. Please try again.");
    } finally {
      setIsAnalyzingTarget(false);
    }
  };

  const generateNewSentence = async () => {
    setIsAnalyzing(true);
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
      const prompt = `Generate a single short sentence in ${targetLanguage} for a Class ${userClass} student to practice speaking and pronunciation. Keep it simple and age-appropriate. Just the text, no quotes. If Hindi, use Devanagari script.`;
      const result = await model.generateContent(prompt);
      setTargetText(result.response.text().trim());
      setTranscript('');
      setAudioUrl(null);
      setFeedback(null);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAudioTimeUpdate = () => {
    if (audioRef.current) {
      const progress = (audioRef.current.currentTime / audioRef.current.duration) * 100;
      setAudioProgress(progress || 0);
    }
  };

  const skipAudio = (seconds) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, Math.min(audioRef.current.duration, audioRef.current.currentTime + seconds));
    }
  };

  const togglePlayback = () => {
    if (audioRef.current) {
      if (isPlaying) audioRef.current.pause();
      else audioRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ background: 'rgba(255,255,255,0.02)', padding: '2rem', borderRadius: '24px', border: '1px solid var(--glass-border)', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <button onClick={() => setTargetLanguage('English')} style={{ background: targetLanguage === 'English' ? 'rgba(99,102,241,0.2)' : 'transparent', border: targetLanguage === 'English' ? '1px solid #8b5cf6' : '1px solid var(--glass-border)', color: targetLanguage === 'English' ? '#8b5cf6' : 'var(--text-secondary)', padding: '0.3rem 0.8rem', borderRadius: '8px', fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.2s' }}>English</button>
          <button onClick={() => setTargetLanguage('Hindi')} style={{ background: targetLanguage === 'Hindi' ? 'rgba(99,102,241,0.2)' : 'transparent', border: targetLanguage === 'Hindi' ? '1px solid #8b5cf6' : '1px solid var(--glass-border)', color: targetLanguage === 'Hindi' ? '#8b5cf6' : 'var(--text-secondary)', padding: '0.3rem 0.8rem', borderRadius: '8px', fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.2s' }}>Hindi</button>
        </div>
        
        <h5 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Target Sentence</h5>
        <p style={{ fontSize: '1.5rem', fontWeight: '700', color: 'white', lineHeight: '1.4', marginBottom: '1rem' }}>"{targetText}"</p>
        
        {/* Voice selector */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '700' }}>Voice</span>
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            {GEMINI_VOICES.map(v => (
              <button
                key={v.id}
                onClick={() => setSelectedVoice(v.id)}
                title={v.desc}
                style={{
                  background: selectedVoice === v.id ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255,255,255,0.04)',
                  border: selectedVoice === v.id ? '1px solid rgba(99,102,241,0.4)' : '1px solid var(--glass-border)',
                  color: selectedVoice === v.id ? '#8b5cf6' : 'var(--text-secondary)',
                  padding: '0.35rem 0.85rem', borderRadius: '100px', fontSize: '0.78rem', cursor: 'pointer',
                  fontWeight: selectedVoice === v.id ? '700' : '500',
                  transition: 'all 0.2s'
                }}
              >
                {v.label}
              </button>
            ))}
          </div>
          <button
            onClick={async () => {
              if (isTTSSpeaking) { stopSpeaking(); setIsTTSSpeaking(false); return; }
              setIsTTSSpeaking(true);
              await speak(targetText, 'en-US', {
                voiceName: selectedVoice,
                onStart: () => setIsTTSSpeaking(true),
                onEnd: () => setIsTTSSpeaking(false),
                onError: () => setIsTTSSpeaking(true),
              });
              setIsTTSSpeaking(false);
            }}
            style={{
              background: isTTSSpeaking ? 'rgba(255, 51, 68, 0.15)' : 'rgba(16, 185, 129, 0.1)',
              border: isTTSSpeaking ? '1px solid rgba(255,51,68,0.3)' : '1px solid rgba(16,185,129,0.25)',
              color: isTTSSpeaking ? 'var(--accent-red)' : '#10b981',
              padding: '0.35rem 0.85rem', borderRadius: '100px', fontSize: '0.78rem', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: '600',
              transition: 'all 0.2s'
            }}
          >
            {isTTSSpeaking ? <><StopCircle size={13} /> Stop</> : <><Volume2 size={13} /> Listen</>}
          </button>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button 
            onClick={generateNewSentence}
            style={{ background: 'transparent', border: '1px solid var(--glass-border)', color: 'var(--text-secondary)', padding: '0.5rem 1rem', borderRadius: '100px', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <ArrowRightLeft size={14} /> New Sentence
          </button>
          <button 
            onClick={analyzeTargetText}
            disabled={isAnalyzingTarget}
            style={{ background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.2)', color: '#8b5cf6', padding: '0.5rem 1rem', borderRadius: '100px', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            {isAnalyzingTarget ? <Loader2 size={14} className="spin" /> : <Sparkles size={14} />}
            Analyze Sentence
          </button>
        </div>

        {targetAnalysis && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            style={{ marginTop: '1.5rem', textAlign: 'left', padding: '1.5rem', background: 'rgba(0,0,0,0.2)', borderRadius: '16px', border: '1px solid var(--glass-border)' }}
          >
            <div style={{ fontSize: '0.85rem', color: '#8b5cf6', fontWeight: '700', marginBottom: '0.5rem' }}>Sentence Meaning</div>
            <p style={{ fontSize: '0.95rem', color: 'white', marginBottom: '1rem' }}>{targetAnalysis.meaning}</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '700', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Grammar</div>
                <ul style={{ paddingLeft: '1rem', margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  {targetAnalysis.grammar?.map((g, i) => <li key={i}>{g}</li>)}
                </ul>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '700', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Vocabulary</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {targetAnalysis.vocabulary?.map((v, i) => (
                    <div key={i} style={{ fontSize: '0.85rem' }}>
                      <span style={{ color: 'white', fontWeight: '600' }}>{v.word}:</span> <span style={{ color: 'var(--text-secondary)' }}>{v.meaning}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={isRecording ? stopRecording : startRecording}
            style={{
              width: '80px', height: '80px', borderRadius: '50%', border: 'none', cursor: 'pointer',
              background: isRecording ? 'rgba(255, 51, 68, 0.2)' : 'var(--accent-red)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: isRecording ? '0 0 30px rgba(255, 51, 68, 0.3)' : '0 10px 25px rgba(255, 51, 68, 0.4)',
              color: 'white', position: 'relative'
            }}
          >
            {isRecording ? <StopCircle size={32} /> : <Mic size={32} />}
            {isRecording && (
              <motion.div 
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                style={{ position: 'absolute', width: '100%', height: '100%', borderRadius: '50%', border: '2px solid var(--accent-red)' }}
              />
            )}
          </motion.button>

          {!isRecording && transcript && !feedback && !isAnalyzing && (
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() => analyzeSpeech()}
              style={{
                background: 'var(--accent-red)', color: 'white', border: 'none',
                padding: '1rem 2rem', borderRadius: '100px', fontWeight: '700',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem',
                boxShadow: '0 10px 20px rgba(255, 51, 68, 0.2)'
              }}
            >
              <Sparkles size={20} /> Analyze My Speech
            </motion.button>
          )}
        </div>

        <p style={{ fontWeight: '600', color: isRecording ? 'var(--accent-red)' : 'var(--text-secondary)' }}>
          {isRecording ? "Listening... Speak now!" : (transcript ? "Recording captured! Click Analyze below." : "Tap to record your pronunciation")}
        </p>

        {isAnalyzing && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--accent-red)', fontWeight: '700', marginBottom: '1rem' }}>
            <Loader2 className="spin" size={20} />
            🚀 AI Coach is analyzing...
          </div>
        )}

        {transcript && (
          <div style={{ width: '100%', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--glass-border)', textAlign: 'center' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>You said:</div>
            <div style={{ fontStyle: 'italic', color: 'white' }}>"{transcript}"</div>
          </div>
        )}

        {audioUrl && (
          <div style={{ width: '100%', background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '24px', border: '1px solid var(--glass-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <button 
                onClick={togglePlayback} 
                style={{ background: 'var(--accent-red)', border: 'none', color: 'white', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              >
                {isPlaying ? <StopCircle size={20} fill="white" /> : <Play size={20} fill="white" />}
              </button>
              
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', position: 'relative', cursor: 'pointer' }} onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const percent = (e.clientX - rect.left) / rect.width;
                  if (audioRef.current) audioRef.current.currentTime = audioRef.current.duration * percent;
                }}>
                  <div style={{ position: 'absolute', height: '100%', background: 'var(--accent-red)', width: `${audioProgress}%`, borderRadius: '2px' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  <span>{audioRef.current ? Math.floor(audioRef.current.currentTime) : 0}s</span>
                  <span>{audioRef.current ? Math.floor(audioRef.current.duration || 0) : 0}s</span>
                </div>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button onClick={() => skipAudio(-5)} style={{ background: 'transparent', border: '1px solid var(--glass-border)', color: 'var(--text-secondary)', padding: '0.4rem 0.8rem', borderRadius: '8px', fontSize: '0.75rem', cursor: 'pointer' }}>-5s</button>
              <button onClick={() => skipAudio(5)} style={{ background: 'transparent', border: '1px solid var(--glass-border)', color: 'var(--text-secondary)', padding: '0.4rem 0.8rem', borderRadius: '8px', fontSize: '0.75rem', cursor: 'pointer' }}>+5s</button>
            </div>
            
            <audio 
              ref={audioRef} 
              src={audioUrl} 
              onTimeUpdate={handleAudioTimeUpdate}
              onEnded={() => setIsPlaying(false)}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />
          </div>
        )}

        {isAnalyzing && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--accent-red)' }}>
            <Loader2 size={20} style={{ animation: 'spin 2s linear infinite' }} />
            <span style={{ fontWeight: '600' }}>AI Coach is analyzing...</span>
          </div>
        )}

        {feedback && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ width: '100%', background: 'rgba(255, 51, 68, 0.05)', padding: '1.5rem', borderRadius: '24px', border: '1px solid rgba(255, 51, 68, 0.2)' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h6 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700' }}>Analysis Result</h6>
              <div style={{ background: 'var(--accent-red)', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '100px', fontWeight: '800', fontSize: '0.9rem' }}>
                {feedback.score}%
              </div>
            </div>
            
            <p style={{ fontSize: '0.95rem', marginBottom: '2rem', lineHeight: '1.6', color: 'var(--text-secondary)' }}>{feedback.feedback}</p>
            
            {/* Mistakes Spotted */}
            {feedback.mistakes?.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--accent-red)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Feedback & Adapt</div>
                {feedback.mistakes.map((m, i) => (
                  <div key={i} style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', borderRadius: '16px', padding: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                      <span style={{ background: 'rgba(255, 51, 68, 0.15)', color: 'var(--accent-red)', padding: '0.25rem 0.75rem', borderRadius: '100px', fontSize: '0.85rem', fontWeight: '700' }}>{m.word}</span>
                      <span style={{ color: 'white', fontSize: '0.9rem', fontWeight: '500' }}>{m.error}</span>
                    </div>
                    
                    {m.tip && (
                      <div style={{ display: 'flex', gap: '0.75rem', background: 'rgba(16, 185, 129, 0.05)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.1)', marginBottom: '0.75rem' }}>
                        <div style={{ color: '#10b981', fontWeight: '900', fontSize: '1.2rem' }}>👄</div>
                        <div>
                          <div style={{ color: '#10b981', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Mouth Position</div>
                          <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>{m.tip}</div>
                        </div>
                      </div>
                    )}

                    {m.drill && (
                      <div style={{ display: 'flex', gap: '0.75rem', background: 'rgba(99, 102, 241, 0.05)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(99, 102, 241, 0.1)' }}>
                        <div style={{ color: '#8b5cf6', fontWeight: '900', fontSize: '1.2rem' }}>🎯</div>
                        <div>
                          <div style={{ color: '#8b5cf6', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', marginBottom: '0.25rem' }}>New Drill</div>
                          <div style={{ fontSize: '0.9rem', color: 'white', lineHeight: '1.4', fontStyle: 'italic' }}>{m.drill}</div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ marginBottom: '2rem', padding: '1.5rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '16px', border: '1px solid rgba(16, 185, 129, 0.2)', textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎉</div>
                <div style={{ color: '#10b981', fontWeight: '700', fontSize: '1.1rem' }}>Perfect Pronunciation!</div>
                <p style={{ color: 'var(--text-secondary)', margin: '0.5rem 0 0 0', fontSize: '0.9rem' }}>You nailed every word in the sentence.</p>
              </div>
            )}
            
            {/* New Challenge Sentence */}
            {feedback.newSentence && (
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#10b981', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Up Next: New Challenge</div>
                <div style={{ 
                  background: 'rgba(0,0,0,0.3)', padding: '1.25rem', borderRadius: '16px', border: '1px solid var(--glass-border)',
                  fontSize: '1.1rem', lineHeight: '1.6', color: 'white', textAlign: 'center', fontStyle: 'italic',
                  boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.2)'
                }}>
                  "{feedback.newSentence}"
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.75rem', textAlign: 'center' }}>
                  This sentence has been updated as your new Target Sentence above!
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

const StudyTools = ({ userClass, initialTab = 'calculator', isFullscreen = false }) => {
  const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY_TEXT || import.meta.env.VITE_GEMINI_API_KEY);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [calcInput, setCalcInput] = useState('');
  const [unitValue, setUnitValue] = useState('');
  const [unitType, setUnitType] = useState('cmToM');

  // Timer State
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [timerRunning, setTimerRunning] = useState(false);
  
  // Flashcards State
  const [flashcards, setFlashcards] = useState([
    { q: "What is the capital of France?", a: "Paris" },
    { q: "What is 7 x 8?", a: "56" },
    { q: "What is the powerhouse of the cell?", a: "Mitochondria" },
    { q: "Who wrote Romeo and Juliet?", a: "William Shakespeare" }
  ]);
  const [cardIndex, setCardIndex] = useState(0);
  const [cardFlipped, setCardFlipped] = useState(false);
  const [flashcardTopic, setFlashcardTopic] = useState('');
  const [flashcardCount, setFlashcardCount] = useState(5);
  const [flashcardDifficulty, setFlashcardDifficulty] = useState('Medium');
  const [isGeneratingCards, setIsGeneratingCards] = useState(false);

  const generateFlashcards = async () => {
    if (!flashcardTopic.trim()) return;
    setIsGeneratingCards(true);
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
      const prompt = `Generate ${flashcardCount} educational flashcards about "${flashcardTopic}" for a student in Class ${userClass || 'elementary/middle'}. The difficulty level should be ${flashcardDifficulty}. Return ONLY a raw JSON array of objects, each with a 'q' (question) and 'a' (answer) field. Do not wrap it in markdown code blocks. Just the raw JSON.`;
      const result = await model.generateContent(prompt);
      let text = result.response.text();
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(text);
      setFlashcards(parsed);
      setCardIndex(0);
      setCardFlipped(false);
      setFlashcardTopic('');
    } catch (e) {
      console.error(e);
      alert("Failed to generate flashcards. Please try another topic.");
    } finally {
      setIsGeneratingCards(false);
    }
  };

  // Exam State
  const [examTopic, setExamTopic] = useState('');
  const [isGeneratingExam, setIsGeneratingExam] = useState(false);
  const [examQuestions, setExamQuestions] = useState([]);
  const [examAnswers, setExamAnswers] = useState({});
  const [examScore, setExamScore] = useState(null);

  const generateExam = async () => {
    if (!examTopic.trim()) return;
    setIsGeneratingExam(true);
    try {
      const chapters = examTopic.split(',').map(c => c.trim()).filter(c => c);
      let numQuestions = 20;
      if (chapters.length === 2) numQuestions = 30;
      else if (chapters.length === 3) numQuestions = 45;
      else if (chapters.length > 3) numQuestions = 45 + ((chapters.length - 3) * 5);

      const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
      const prompt = `Generate a ${numQuestions}-question multiple choice exam based on the following chapters/topics: "${examTopic}". The student is in Class ${userClass || 'elementary/middle'}. Return ONLY a raw JSON array of objects. Each object must have: 'q' (the question), 'options' (an array of 4 string choices), and 'a' (the exact string of the correct option). Do not wrap in markdown. Just the JSON.`;
      const result = await model.generateContent(prompt);
      let text = result.response.text();
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(text);
      setExamQuestions(parsed);
      setExamAnswers({});
      setExamScore(null);
      setExamTopic('');
    } catch (e) {
      console.error(e);
      alert("Failed to generate exam. Please try another topic combination.");
    } finally {
      setIsGeneratingExam(false);
    }
  };

  const submitExam = () => {
    let score = 0;
    examQuestions.forEach((q, idx) => {
      if (examAnswers[idx] === q.a) score++;
    });
    setExamScore(score);
  };

  React.useEffect(() => {
    let interval = null;
    if (timerRunning && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(t => t - 1), 1000);
    } else if (timeLeft === 0) {
      setTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [timerRunning, timeLeft]);

  const toggleTimer = () => setTimerRunning(!timerRunning);
  const resetTimer = () => { setTimerRunning(false); setTimeLeft(25 * 60); };
  
  const nextCard = () => { setCardFlipped(false); setCardIndex((prev) => (prev + 1) % flashcards.length); };
  const prevCard = () => { setCardFlipped(false); setCardIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length); };

  const handleCalcClick = (val) => {
    if (val === '=') {
      try {
        // Safe-ish eval for simple math
        // eslint-disable-next-line no-eval
        setCalcInput(eval(calcInput).toString());
      } catch (e) {
        setCalcInput('Error');
      }
    } else if (val === 'C') {
      setCalcInput('');
    } else {
      setCalcInput(prev => prev + val);
    }
  };

  const calculateUnit = () => {
    const val = parseFloat(unitValue);
    if (isNaN(val)) return '-';
    if (unitType === 'cmToM') return (val / 100).toFixed(2) + ' m';
    if (unitType === 'mToCm') return (val * 100).toFixed(2) + ' cm';
    if (unitType === 'gToKg') return (val / 1000).toFixed(2) + ' kg';
    if (unitType === 'kgToG') return (val * 1000).toFixed(2) + ' g';
    return '-';
  };

  return (
    <section id="study-tools" style={{ padding: isFullscreen ? '0' : '4rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
      {!isFullscreen && (
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: 'clamp(2rem, 5vw, 2.5rem)', fontWeight: '800', marginBottom: '1rem', background: 'linear-gradient(135deg, #fff, #a1a1aa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Study Tools
          </h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
            Quick utilities to help you solve problems faster.
          </p>
        </div>
      )}

      <div style={{ 
        background: 'rgba(255, 255, 255, 0.03)', 
        backdropFilter: 'blur(20px)', 
        border: '1px solid var(--glass-border)', 
        borderRadius: '24px', 
        padding: 'clamp(1rem, 5vw, 2rem)',
        maxWidth: isFullscreen ? '100%' : '500px',
        margin: '0 auto'
      }}>
        <div style={{ 
          display: 'flex', 
          gap: '0.5rem', 
          marginBottom: '2rem', 
          overflowX: 'auto', 
          paddingBottom: '0.5rem',
          scrollbarWidth: 'none'
        }} className="no-scrollbar">
          <button 
            onClick={() => setActiveTab('calculator')}
            style={{ 
              flex: '0 0 auto', padding: '0.75rem 1rem', borderRadius: '12px', border: 'none', cursor: 'pointer',
              background: activeTab === 'calculator' ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
              color: activeTab === 'calculator' ? '#8b5cf6' : 'var(--text-secondary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              transition: 'all 0.3s'
            }}
          >
            <Calculator size={18} /> <span className="desktop-only">Math</span>
          </button>
          <button 
            onClick={() => setActiveTab('converter')}
            style={{ 
              flex: '0 0 auto', padding: '0.75rem 1rem', borderRadius: '12px', border: 'none', cursor: 'pointer',
              background: activeTab === 'converter' ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
              color: activeTab === 'converter' ? '#8b5cf6' : 'var(--text-secondary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              transition: 'all 0.3s'
            }}
          >
            <ArrowRightLeft size={18} /> <span className="desktop-only">Units</span>
          </button>
          <button 
            onClick={() => setActiveTab('timer')}
            style={{ 
              flex: '0 0 auto', padding: '0.75rem 1rem', borderRadius: '12px', border: 'none', cursor: 'pointer',
              background: activeTab === 'timer' ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
              color: activeTab === 'timer' ? '#8b5cf6' : 'var(--text-secondary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              transition: 'all 0.3s'
            }}
          >
            <Clock size={18} /> <span className="desktop-only">Timer</span>
          </button>
          <button 
            onClick={() => setActiveTab('flashcards')}
            style={{ 
              flex: '0 0 auto', padding: '0.75rem 1rem', borderRadius: '12px', border: 'none', cursor: 'pointer',
              background: activeTab === 'flashcards' ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
              color: activeTab === 'flashcards' ? '#8b5cf6' : 'var(--text-secondary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              transition: 'all 0.3s'
            }}
          >
            <Book size={18} /> <span className="desktop-only">Cards</span>
          </button>
          <button 
            onClick={() => setActiveTab('exam')}
            style={{ 
              flex: '0 0 auto', padding: '0.75rem 1rem', borderRadius: '12px', border: 'none', cursor: 'pointer',
              background: activeTab === 'exam' ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
              color: activeTab === 'exam' ? '#8b5cf6' : 'var(--text-secondary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              transition: 'all 0.3s'
            }}
          >
            <ClipboardList size={18} /> <span className="desktop-only">Exams</span>
          </button>
          <button 
            onClick={() => setActiveTab('speaking')}
            style={{ 
              flex: '0 0 auto', padding: '0.75rem 1rem', borderRadius: '12px', border: 'none', cursor: 'pointer',
              background: activeTab === 'speaking' ? 'rgba(255, 51, 68, 0.2)' : 'transparent',
              color: activeTab === 'speaking' ? 'var(--accent-red)' : 'var(--text-secondary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              transition: 'all 0.3s'
            }}
          >
            <Volume2 size={18} /> <span className="desktop-only">Speaking</span>
          </button>
        </div>

        {activeTab === 'speaking' && <SpeakingTab userClass={userClass} />}

        {activeTab === 'calculator' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ 
              background: 'rgba(0,0,0,0.3)', padding: '1.5rem', borderRadius: '12px', 
              textAlign: 'right', fontSize: '1.5rem', color: 'white', minHeight: '36px',
              border: '1px solid var(--glass-border)', marginBottom: '1rem'
            }}>
              {calcInput || '0'}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
              {['7','8','9','/','4','5','6','*','1','2','3','-','C','0','=','+'].map(btn => (
                <button 
                  key={btn}
                  onClick={() => handleCalcClick(btn)}
                  style={{
                    padding: '1rem', borderRadius: '12px', border: 'none', cursor: 'pointer',
                    background: btn === '=' ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'rgba(255,255,255,0.05)',
                    color: 'white', fontSize: '1.2rem', fontWeight: 'bold'
                  }}
                >
                  {btn}
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'converter' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Conversion Type</label>
              <select 
                value={unitType} 
                onChange={(e) => setUnitType(e.target.value)}
                style={{ 
                  padding: '1rem', borderRadius: '12px', background: 'rgba(0,0,0,0.3)', 
                  border: '1px solid var(--glass-border)', color: 'white', outline: 'none' 
                }}
              >
                <option value="cmToM">Centimeters to Meters</option>
                <option value="mToCm">Meters to Centimeters</option>
                <option value="gToKg">Grams to Kilograms</option>
                <option value="kgToG">Kilograms to Grams</option>
              </select>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <input 
                type="number" 
                value={unitValue}
                onChange={(e) => setUnitValue(e.target.value)}
                placeholder="Enter value..."
                style={{ 
                  flex: 1, padding: '1rem', borderRadius: '12px', background: 'rgba(0,0,0,0.3)', 
                  border: '1px solid var(--glass-border)', color: 'white', outline: 'none' 
                }}
              />
              <ArrowRightLeft size={24} color="var(--text-secondary)" />
              <div style={{ 
                flex: 1, padding: '1rem', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.1)', 
                border: '1px solid rgba(99, 102, 241, 0.3)', color: '#8b5cf6', fontWeight: 'bold', textAlign: 'center' 
              }}>
                {calculateUnit()}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'timer' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ 
              fontSize: '4rem', fontWeight: 'bold', fontFamily: 'monospace', color: 'white',
              background: 'rgba(0,0,0,0.3)', padding: '2rem', borderRadius: '50%',
              width: '200px', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '4px solid', borderColor: timerRunning ? '#8b5cf6' : 'var(--glass-border)',
              boxShadow: timerRunning ? '0 0 30px rgba(139, 92, 246, 0.3)' : 'none',
              transition: 'all 0.3s'
            }}>
              {String(Math.floor(timeLeft / 60)).padStart(2, '0')}:{String(timeLeft % 60).padStart(2, '0')}
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={toggleTimer} style={{
                padding: '0.75rem 2rem', borderRadius: '24px', border: 'none', cursor: 'pointer',
                background: timerRunning ? 'rgba(255, 51, 68, 0.2)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color: timerRunning ? '#ff3344' : 'white', fontWeight: 'bold', fontSize: '1rem'
              }}>
                {timerRunning ? 'Pause' : 'Start Focus'}
              </button>
              <button onClick={resetTimer} style={{
                padding: '0.75rem 2rem', borderRadius: '24px', border: '1px solid var(--glass-border)', cursor: 'pointer',
                background: 'transparent', color: 'var(--text-secondary)', fontWeight: 'bold', fontSize: '1rem'
              }}>
                Reset
              </button>
            </div>
          </div>
        )}

        {activeTab === 'flashcards' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem', width: '100%', flexWrap: 'wrap' }}>
              <input 
                type="text" 
                value={flashcardTopic}
                onChange={(e) => setFlashcardTopic(e.target.value)}
                placeholder="Topic (e.g. Solar System)"
                style={{ flex: 1, minWidth: '200px', padding: '0.75rem 1rem', borderRadius: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--glass-border)', color: 'white', outline: 'none' }}
                onKeyDown={(e) => { if (e.key === 'Enter') generateFlashcards(); }}
              />
              <select value={flashcardCount} onChange={e => setFlashcardCount(parseInt(e.target.value))} style={{ padding: '0.75rem', borderRadius: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--glass-border)', color: 'white', outline: 'none' }}>
                <option value={5}>5 Cards</option>
                <option value={10}>10 Cards</option>
                <option value={15}>15 Cards</option>
                <option value={20}>20 Cards</option>
              </select>
              <select value={flashcardDifficulty} onChange={e => setFlashcardDifficulty(e.target.value)} style={{ padding: '0.75rem', borderRadius: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--glass-border)', color: 'white', outline: 'none' }}>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
              <button 
                onClick={generateFlashcards}
                disabled={isGeneratingCards || !flashcardTopic.trim()}
                style={{ padding: '0.75rem 1.5rem', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', cursor: isGeneratingCards || !flashcardTopic.trim() ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', opacity: isGeneratingCards || !flashcardTopic.trim() ? 0.7 : 1 }}
              >
                {isGeneratingCards ? <Loader2 size={18} style={{ animation: 'spin 2s linear infinite' }} /> : <Sparkles size={18} />}
                Generate
              </button>
            </div>
            
            {flashcards.length > 0 ? (
              <>
                <motion.div 
                  onClick={() => setCardFlipped(!cardFlipped)}
                  animate={{ rotateY: cardFlipped ? 180 : 0 }}
                  transition={{ duration: 0.6, type: "spring" }}
                  style={{
                    width: '100%', height: '200px', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1))',
                    border: '1px solid rgba(139, 92, 246, 0.3)', borderRadius: '16px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem',
                    cursor: 'pointer', textAlign: 'center', transformStyle: 'preserve-3d', position: 'relative'
                  }}
                >
                  <div style={{ 
                    position: 'absolute', backfaceVisibility: 'hidden', 
                    fontSize: '1.2rem', color: 'white', fontWeight: 'bold',
                    opacity: cardFlipped ? 0 : 1
                  }}>
                    {flashcards[cardIndex].q}
                  </div>
                  <div style={{ 
                    position: 'absolute', backfaceVisibility: 'hidden', transform: 'rotateY(180deg)',
                    fontSize: '1.5rem', color: '#8b5cf6', fontWeight: 'bold',
                    opacity: cardFlipped ? 1 : 0
                  }}>
                    {flashcards[cardIndex].a}
                  </div>
                </motion.div>
                
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
                  <button onClick={prevCard} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer' }}>Previous</button>
                  <span style={{ color: 'var(--text-secondary)' }}>{cardIndex + 1} / {flashcards.length}</span>
                  <button onClick={nextCard} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer' }}>Next</button>
                </div>
              </>
            ) : (
              <div style={{ color: 'var(--text-secondary)', padding: '2rem' }}>No flashcards available.</div>
            )}
          </div>
        )}

        {activeTab === 'exam' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {examQuestions.length === 0 ? (
              <>
                <div style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '1rem' }}>
                  Create a custom exam by entering up to 3 chapters or topics.
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
                  <input 
                    type="text" 
                    value={examTopic}
                    onChange={(e) => setExamTopic(e.target.value)}
                    placeholder="E.g. Fractions, Geometry, Decimals"
                    style={{ flex: 1, padding: '0.75rem 1rem', borderRadius: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--glass-border)', color: 'white', outline: 'none' }}
                    onKeyDown={(e) => { if (e.key === 'Enter') generateExam(); }}
                  />
                  <button 
                    onClick={generateExam}
                    disabled={isGeneratingExam || !examTopic.trim()}
                    style={{ padding: '0.75rem 1.5rem', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', cursor: isGeneratingExam || !examTopic.trim() ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', opacity: isGeneratingExam || !examTopic.trim() ? 0.7 : 1 }}
                  >
                    {isGeneratingExam ? <Loader2 size={18} style={{ animation: 'spin 2s linear infinite' }} /> : <Sparkles size={18} />}
                    Generate
                  </button>
                </div>
              </>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {examScore !== null && (
                  <div style={{ background: 'rgba(99, 102, 241, 0.1)', border: '1px solid #8b5cf6', padding: '1.5rem', borderRadius: '16px', textAlign: 'center' }}>
                    <h3 style={{ fontSize: '1.5rem', color: '#8b5cf6', marginBottom: '0.5rem' }}>Exam Completed!</h3>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white' }}>{examScore} / {examQuestions.length}</div>
                    <button onClick={() => setExamQuestions([])} style={{ marginTop: '1rem', background: '#8b5cf6', color: 'white', border: 'none', padding: '0.5rem 1.5rem', borderRadius: '8px', cursor: 'pointer' }}>New Exam</button>
                  </div>
                )}
                {examQuestions.map((q, qIdx) => (
                  <div key={qIdx} style={{ background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
                    <h4 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'white', lineHeight: '1.5' }}>{qIdx + 1}. {q.q}</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {q.options.map((opt, oIdx) => {
                        const isSelected = examAnswers[qIdx] === opt;
                        const isCorrect = examScore !== null && q.a === opt;
                        const isWrong = examScore !== null && isSelected && q.a !== opt;
                        
                        let bgColor = 'rgba(0,0,0,0.3)';
                        let borderColor = isSelected ? '#8b5cf6' : 'var(--glass-border)';
                        if (isCorrect) { bgColor = 'rgba(16, 185, 129, 0.2)'; borderColor = '#10b981'; }
                        else if (isWrong) { bgColor = 'rgba(239, 68, 68, 0.2)'; borderColor = '#ef4444'; }
                        else if (isSelected) { bgColor = 'rgba(99, 102, 241, 0.2)'; }

                        return (
                          <button
                            key={oIdx}
                            onClick={() => { if (examScore === null) setExamAnswers(prev => ({ ...prev, [qIdx]: opt })) }}
                            style={{
                              padding: '1rem', textAlign: 'left', borderRadius: '12px', cursor: examScore === null ? 'pointer' : 'default',
                              background: bgColor, border: `1px solid ${borderColor}`, color: 'white', transition: 'all 0.2s'
                            }}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
                {examScore === null && (
                  <button onClick={submitExam} disabled={Object.keys(examAnswers).length < examQuestions.length} style={{ padding: '1rem', background: Object.keys(examAnswers).length < examQuestions.length ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', border: 'none', borderRadius: '12px', cursor: Object.keys(examAnswers).length < examQuestions.length ? 'not-allowed' : 'pointer', fontWeight: 'bold', fontSize: '1.1rem' }}>
                    Submit Exam
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default StudyTools;