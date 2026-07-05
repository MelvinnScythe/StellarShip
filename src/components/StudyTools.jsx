import { Calculator, ArrowRightLeft, Clock, Book, Loader2, Sparkles, ClipboardList, Volume2, Mic, StopCircle, Play, AlertCircle, Loader } from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { speak, stopSpeaking, GEMINI_VOICES } from '../utils/speech';

const API_ROOT = import.meta.env.VITE_API_URL || '';

const parseSpeechApiError = async (response) => {
  const data = await response.json().catch(() => ({}));
  if (response.status === 429 || data.rateLimited) {
    return data.error || 'Gemini rate limit reached. Wait about a minute and try again.';
  }
  return data.error || `Server error: ${response.status}`;
};

const speechAnalysisHint = (msg) => {
  if (/rate limit|quota/i.test(msg)) return '';
  if (/fetch|failed|network/i.test(msg)) {
    return '\n\nStart the backend in another terminal: npm run dev:server';
  }
  return '';
};

const SpeakingTab = ({ userClass }) => {
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
  const [coachMode, setCoachMode] = useState('regular');
  
  const [drillSession, setDrillSession] = useState(null);
  const [currentDrillIndex, setCurrentDrillIndex] = useState(0);
  const [drillFeedback, setDrillFeedback] = useState(null);
  const [isAnalyzingDrill, setIsAnalyzingDrill] = useState(false);
  
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
          // Do nothing. The user will manually click 'Stop Recording' which stops both the mic and the UI state.
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
    if (!audioToUse) {
      alert('No recording found. Please record yourself first, then click Analyze.');
      return;
    }
    setIsAnalyzing(true);
    try {
      // Convert base64 back to Blob
      const byteChars = atob(audioToUse.base64);
      const byteNums = new Uint8Array(byteChars.length);
      for (let i = 0; i < byteChars.length; i++) byteNums[i] = byteChars.charCodeAt(i);
      const mimeType = audioToUse.mimeType || 'audio/webm';
      const audioBlob = new Blob([byteNums], { type: mimeType });

      const formData = new FormData();
      formData.append('audio', audioBlob, `recording.${mimeType.includes('mp4') ? 'm4a' : 'webm'}`);
      formData.append('mimeType', mimeType);
      formData.append('targetText', targetText);
      formData.append('mode', coachMode);

      const apiUrl = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${apiUrl}/api/analyze-speech`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        let errMsg = 'Speech analysis failed.';
        try {
          const errJson = await response.json();
          errMsg = errJson.error || errMsg;
        } catch (e) {
          errMsg = await response.text();
        }
        throw new Error(errMsg);
      }

      const feedback = await response.json();
      setFeedback(feedback);
      if (feedback.newSentence) {
        setTargetText(feedback.newSentence);
      }
    } catch (e) {
      console.error('Speech Analysis Error:', e);
      const msg = e.message || 'Unknown error';
      alert(`Analysis failed: ${msg}${speechAnalysisHint(msg)}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const startDrillSession = (mistakes) => {
    if (!mistakes || mistakes.length === 0) return;
    const drills = mistakes.filter(m => m.drill).map(m => m.drill);
    if (drills.length > 0) {
      setDrillSession(drills);
      setCurrentDrillIndex(0);
      setDrillFeedback(null);
      setAudioUrl(null);
      setAudioData(null);
      setTranscript('');
    }
  };

  const analyzeDrill = async () => {
    if (!audioData) {
      alert('Please record your drill attempt first.');
      return;
    }
    setIsAnalyzingDrill(true);
    try {
      const byteChars = atob(audioData.base64);
      const byteNums = new Uint8Array(byteChars.length);
      for (let i = 0; i < byteChars.length; i++) byteNums[i] = byteChars.charCodeAt(i);
      const mimeType = audioData.mimeType || 'audio/webm';
      const audioBlob = new Blob([byteNums], { type: mimeType });

      const formData = new FormData();
      formData.append('audio', audioBlob, `recording.${mimeType.includes('mp4') ? 'm4a' : 'webm'}`);
      formData.append('mimeType', mimeType);
      formData.append('drillText', drillSession[currentDrillIndex]);

      const apiUrl = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${apiUrl}/api/analyze-speech/drill`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(await parseSpeechApiError(response));
      }

      const result = await response.json();
      setDrillFeedback(result);

      if (result.passed) {
        setTimeout(() => {
          if (currentDrillIndex + 1 < drillSession.length) {
            setCurrentDrillIndex(prev => prev + 1);
            setDrillFeedback(null);
            setAudioUrl(null);
            setAudioData(null);
          } else {
            alert('🎉 You completed all drills successfully!');
            setDrillSession(null);
          }
        }, 3000);
      }
    } catch (e) {
      console.error('Drill Analysis Error:', e);
      const msg = e.message || 'Unknown error';
      alert(`Drill analysis failed: ${msg}${speechAnalysisHint(msg)}`);
    } finally {
      setIsAnalyzingDrill(false);
    }
  };

  const analyzeTargetText = async () => {
    if (!targetText) return;
    setIsAnalyzingTarget(true);
    setTargetAnalysis(null);
    try {
      const response = await fetch(`${API_ROOT}/api/ai/speaking/target-analysis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetText, userClass }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || `Server error: ${response.status}`);
      }

      setTargetAnalysis(await response.json());
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
      const response = await fetch(`${API_ROOT}/api/ai/speaking/sentence`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetLanguage, userClass }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || `Server error: ${response.status}`);
      }

      const { text } = await response.json();
      setTargetText(text.trim());
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
      {drillSession ? (
        <div style={{ background: 'rgba(0,0,0,0.2)', padding: '2rem', borderRadius: '24px', border: '1px solid var(--glass-border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h5 style={{ color: '#8b5cf6', margin: 0 }}>Drill Session ({currentDrillIndex + 1} / {drillSession.length})</h5>
            <button onClick={() => setDrillSession(null)} style={{ background: 'transparent', border: '1px solid var(--glass-border)', color: 'white', padding: '0.3rem 0.8rem', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
          </div>
          
          <h5 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>Target Drill</h5>
          <p style={{ fontSize: '1.5rem', fontWeight: '700', color: 'white', lineHeight: '1.4', marginBottom: '2rem', textAlign: 'center' }}>"{drillSession[currentDrillIndex]}"</p>

          {drillFeedback && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginBottom: '2rem', padding: '1.5rem', borderRadius: '16px', background: drillFeedback.passed ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255, 51, 68, 0.1)', border: drillFeedback.passed ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(255, 51, 68, 0.3)' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: drillFeedback.passed ? '#10b981' : 'var(--accent-red)', marginBottom: '0.5rem', textAlign: 'center' }}>
                {drillFeedback.passed ? '✅ Passed!' : '❌ Needs Work'} (Score: {drillFeedback.score}%)
              </div>
              <div style={{ fontStyle: 'italic', color: 'var(--text-secondary)', marginBottom: '1rem', textAlign: 'center' }}>Heard: "{drillFeedback.heardTranscript}"</div>
              <p style={{ color: 'white', marginBottom: drillFeedback.tip ? '1rem' : 0, textAlign: 'center' }}>{drillFeedback.feedback}</p>
              {!drillFeedback.passed && drillFeedback.tip && (
                <div style={{ display: 'flex', gap: '0.75rem', background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '12px' }}>
                  <div style={{ color: '#10b981', fontSize: '1.2rem' }}>👄</div>
                  <div style={{ textAlign: 'left', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{drillFeedback.tip}</div>
                </div>
              )}
            </motion.div>
          )}

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
              </motion.button>

              {!isRecording && audioUrl && !isAnalyzingDrill && (!drillFeedback || !drillFeedback.passed) && (
                <motion.button
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  onClick={() => analyzeDrill()}
                  style={{ background: '#8b5cf6', color: 'white', border: 'none', padding: '1rem 2rem', borderRadius: '100px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem' }}
                >
                  <Sparkles size={20} /> Analyze Drill
                </motion.button>
              )}
            </div>

            <p style={{ fontWeight: '600', color: isRecording ? 'var(--accent-red)' : 'var(--text-secondary)' }}>
              {isRecording ? 'Listening...' : (audioUrl ? 'Recording ready. Click Analyze Drill.' : 'Record your attempt.')}
            </p>

            {isAnalyzingDrill && <div style={{ color: '#8b5cf6', fontWeight: 'bold' }}>Analyzing drill...</div>}
          </div>
        </div>
      ) : (
      <>
      <div style={{ background: 'rgba(255,255,255,0.02)', padding: '2rem', borderRadius: '24px', border: '1px solid var(--glass-border)', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <button onClick={() => setTargetLanguage('English')} style={{ background: targetLanguage === 'English' ? 'rgba(99,102,241,0.2)' : 'transparent', border: targetLanguage === 'English' ? '1px solid #8b5cf6' : '1px solid var(--glass-border)', color: targetLanguage === 'English' ? '#8b5cf6' : 'var(--text-secondary)', padding: '0.3rem 0.8rem', borderRadius: '8px', fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.2s' }}>English</button>
          <button onClick={() => setTargetLanguage('Hindi')} style={{ background: targetLanguage === 'Hindi' ? 'rgba(99,102,241,0.2)' : 'transparent', border: targetLanguage === 'Hindi' ? '1px solid #8b5cf6' : '1px solid var(--glass-border)', color: targetLanguage === 'Hindi' ? '#8b5cf6' : 'var(--text-secondary)', padding: '0.3rem 0.8rem', borderRadius: '8px', fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.2s' }}>Hindi</button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '700', alignSelf: 'center', marginRight: '0.5rem' }}>Coach Mode:</span>
          <button onClick={() => setCoachMode('regular')} style={{ background: coachMode === 'regular' ? 'rgba(16, 185, 129, 0.2)' : 'transparent', border: coachMode === 'regular' ? '1px solid #10b981' : '1px solid var(--glass-border)', color: coachMode === 'regular' ? '#10b981' : 'var(--text-secondary)', padding: '0.3rem 0.8rem', borderRadius: '8px', fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.2s' }}>Regular</button>
          <button onClick={() => setCoachMode('harsh')} style={{ background: coachMode === 'harsh' ? 'rgba(255, 51, 68, 0.2)' : 'transparent', border: coachMode === 'harsh' ? '1px solid var(--accent-red)' : '1px solid var(--glass-border)', color: coachMode === 'harsh' ? 'var(--accent-red)' : 'var(--text-secondary)', padding: '0.3rem 0.8rem', borderRadius: '8px', fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.2s' }}>Harsh (Strict)</button>
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

          {!isRecording && audioUrl && !feedback && !isAnalyzing && (
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
          {isRecording ? 'Listening... Speak now!' : (audioUrl ? 'Recording ready! Click Analyze My Speech.' : 'Tap the mic to record your pronunciation')}
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
            
            {feedback.heardTranscript && (
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem', fontWeight: '700' }}>What AI Heard:</div>
                <div style={{ color: 'white', fontStyle: 'italic', fontSize: '1rem' }}>"{feedback.heardTranscript}"</div>
              </div>
            )}
            
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
            
            {feedback.mistakes?.length > 0 && feedback.mistakes.some(m => m.drill) && (
              <button 
                onClick={() => startDrillSession(feedback.mistakes)}
                style={{ width: '100%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', padding: '1rem', borderRadius: '16px', border: 'none', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', marginBottom: '2rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
              >
                <Sparkles size={20} /> Start Follow-up Drills
              </button>
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
      </>
      )}
    </div>
  );
};

const StudyTools = ({ userClass, initialTab = 'speaking', isFullscreen = false }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(initialTab);
  const [layoutMode, setLayoutMode] = useState('sidebar'); // 'sidebar' or 'box'
  const [calcInput, setCalcInput] = useState('');
  const [unitValue, setUnitValue] = useState('');
  const [unitType, setUnitType] = useState('cmToM');

  // AI Math State
  const [aiMathInput, setAiMathInput] = useState('');
  const [aiMathSolution, setAiMathSolution] = useState(null);
  const [isSolvingMath, setIsSolvingMath] = useState(false);

  const solveMath = async () => {
    if (!aiMathInput.trim()) return;
    setIsSolvingMath(true);
    setAiMathSolution(null);
    try {
      const response = await fetch(`${API_ROOT}/api/ai/math-solver`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problem: aiMathInput, userClass }),
      });
      const data = await response.json();
      if (response.ok) {
        setAiMathSolution(data.solution);
      } else {
        setAiMathSolution('Error: ' + data.error);
      }
    } catch (e) {
      setAiMathSolution('Sorry, could not connect to the AI solver.');
    } finally {
      setIsSolvingMath(false);
    }
  };

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
      const response = await fetch(`${API_ROOT}/api/ai/flashcards`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: flashcardTopic,
          count: flashcardCount,
          difficulty: flashcardDifficulty,
          userClass,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || `Server error: ${response.status}`);
      }

      const parsed = await response.json();
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
      const response = await fetch(`${API_ROOT}/api/ai/exam`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: examTopic, userClass }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || `Server error: ${response.status}`);
      }

      const parsed = await response.json();
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
    <section id="study-tools" style={isFullscreen ? (
      layoutMode === 'sidebar' 
        ? { display: 'flex', flex: 1, width: '100%', overflow: 'hidden' }
        : { padding: '5rem 2rem 2rem', maxWidth: '1400px', width: '100%', margin: '0 auto', height: '100vh', display: 'flex', flexDirection: 'column' }
    ) : { padding: '4rem 2rem', maxWidth: '1200px', margin: '0 auto', height: 'auto' }}>
      
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

      {isFullscreen && layoutMode === 'box' && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', flexShrink: 0 }}>
          <button onClick={() => navigate('/home')} style={{ background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid var(--glass-border)', padding: '0.75rem 1.5rem', borderRadius: '100px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold' }}>
            ← Back to Mission Control
          </button>
          <button onClick={() => setLayoutMode('sidebar')} style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', border: '1px solid var(--glass-border)', padding: '0.75rem 1.5rem', borderRadius: '100px', cursor: 'pointer', fontWeight: 'bold' }}>
            Attach Sidebar →
          </button>
        </div>
      )}

      <div style={isFullscreen ? (
        layoutMode === 'sidebar' ? {
          display: 'flex',
          width: '100%',
          height: '100%',
          background: 'transparent',
        } : {
          background: 'rgba(255, 255, 255, 0.03)', 
          backdropFilter: 'blur(20px)', 
          border: '1px solid var(--glass-border)', 
          borderRadius: '24px', 
          display: 'flex',
          height: '100%',
          width: '100%',
          overflow: 'hidden',
          flex: 1
        }
      ) : { 
        background: 'rgba(255, 255, 255, 0.03)', 
        backdropFilter: 'blur(20px)', 
        border: '1px solid var(--glass-border)', 
        borderRadius: '24px', 
        padding: 'clamp(1rem, 5vw, 2rem)',
        maxWidth: '500px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        height: 'auto',
        overflow: 'hidden'
      }}>
        {/* Sidebar (Only shown when full screen) */}
        {isFullscreen && (
          <div style={{ 
            width: '280px', 
            borderRight: '1px solid var(--glass-border)', 
            padding: '2rem 1.5rem', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '0.5rem',
            background: 'rgba(10, 10, 15, 0.98)',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
              {layoutMode === 'sidebar' && (
                <>
                  <button onClick={() => navigate('/home')} style={{ flex: 1, background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid var(--glass-border)', padding: '0.75rem', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: 'bold' }}>
                    ← Back
                  </button>
                  <button onClick={() => setLayoutMode('box')} title="Float Window" style={{ flex: '0 0 auto', background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', border: '1px solid var(--glass-border)', padding: '0.75rem', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    Float
                  </button>
                </>
              )}
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem', paddingLeft: '0.5rem' }}>AI Tutors</div>
            <button onClick={() => setActiveTab('speaking')} style={{ width: '100%', textAlign: 'left', padding: '0.75rem 1rem', borderRadius: '12px', border: 'none', cursor: 'pointer', background: activeTab === 'speaking' ? 'rgba(255, 51, 68, 0.1)' : 'transparent', color: activeTab === 'speaking' ? 'var(--accent-red)' : 'white', display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: activeTab === 'speaking' ? '700' : '500', fontSize: '1rem', transition: 'all 0.2s' }}>
              <Volume2 size={20} /> Speaking Coach
            </button>
            <button onClick={() => setActiveTab('aimath')} style={{ width: '100%', textAlign: 'left', padding: '0.75rem 1rem', borderRadius: '12px', border: 'none', cursor: 'pointer', background: activeTab === 'aimath' ? 'rgba(99, 102, 241, 0.1)' : 'transparent', color: activeTab === 'aimath' ? '#8b5cf6' : 'white', display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: activeTab === 'aimath' ? '700' : '500', fontSize: '1rem', transition: 'all 0.2s' }}>
              <Sparkles size={20} /> AI Math Solver
            </button>

            <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '1.5rem', marginBottom: '0.5rem', paddingLeft: '0.5rem' }}>Calculators</div>
            <button onClick={() => setActiveTab('calculator')} style={{ width: '100%', textAlign: 'left', padding: '0.75rem 1rem', borderRadius: '12px', border: 'none', cursor: 'pointer', background: activeTab === 'calculator' ? 'rgba(255, 255, 255, 0.05)' : 'transparent', color: activeTab === 'calculator' ? 'white' : 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: activeTab === 'calculator' ? '700' : '500', fontSize: '1rem', transition: 'all 0.2s' }}>
              <Calculator size={20} /> Math Calculator
            </button>
            <button onClick={() => setActiveTab('converter')} style={{ width: '100%', textAlign: 'left', padding: '0.75rem 1rem', borderRadius: '12px', border: 'none', cursor: 'pointer', background: activeTab === 'converter' ? 'rgba(255, 255, 255, 0.05)' : 'transparent', color: activeTab === 'converter' ? 'white' : 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: activeTab === 'converter' ? '700' : '500', fontSize: '1rem', transition: 'all 0.2s' }}>
              <ArrowRightLeft size={20} /> Unit Converter
            </button>

            <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '1.5rem', marginBottom: '0.5rem', paddingLeft: '0.5rem' }}>Study Tools</div>
            <button onClick={() => setActiveTab('timer')} style={{ width: '100%', textAlign: 'left', padding: '0.75rem 1rem', borderRadius: '12px', border: 'none', cursor: 'pointer', background: activeTab === 'timer' ? 'rgba(16, 185, 129, 0.1)' : 'transparent', color: activeTab === 'timer' ? '#10b981' : 'white', display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: activeTab === 'timer' ? '700' : '500', fontSize: '1rem', transition: 'all 0.2s' }}>
              <Clock size={20} /> Focus Timer
            </button>
            <button onClick={() => setActiveTab('flashcards')} style={{ width: '100%', textAlign: 'left', padding: '0.75rem 1rem', borderRadius: '12px', border: 'none', cursor: 'pointer', background: activeTab === 'flashcards' ? 'rgba(236, 72, 153, 0.1)' : 'transparent', color: activeTab === 'flashcards' ? '#ec4899' : 'white', display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: activeTab === 'flashcards' ? '700' : '500', fontSize: '1rem', transition: 'all 0.2s' }}>
              <Book size={20} /> Flashcards
            </button>
            <button onClick={() => setActiveTab('exam')} style={{ width: '100%', textAlign: 'left', padding: '0.75rem 1rem', borderRadius: '12px', border: 'none', cursor: 'pointer', background: activeTab === 'exam' ? 'rgba(245, 158, 11, 0.1)' : 'transparent', color: activeTab === 'exam' ? '#f59e0b' : 'white', display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: activeTab === 'exam' ? '700' : '500', fontSize: '1rem', transition: 'all 0.2s' }}>
              <ClipboardList size={20} /> Practice Exams
            </button>
          </div>
        )}

        {/* Top bar (Only shown when not full screen) */}
        {!isFullscreen && (
          <div style={{ 
            display: 'flex', 
            gap: '0.5rem', 
            marginBottom: '2rem', 
            overflowX: 'auto', 
            paddingBottom: '0.5rem',
            scrollbarWidth: 'none',
            flexShrink: 0
          }} className="no-scrollbar">
            <button onClick={() => setActiveTab('speaking')} style={{ flex: '0 0 auto', padding: '0.75rem 1rem', borderRadius: '12px', border: 'none', cursor: 'pointer', background: activeTab === 'speaking' ? 'rgba(255, 51, 68, 0.2)' : 'transparent', color: activeTab === 'speaking' ? 'var(--accent-red)' : 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.3s' }}>
              <Volume2 size={18} /> <span className="desktop-only">Speaking</span>
            </button>
            <button onClick={() => setActiveTab('aimath')} style={{ flex: '0 0 auto', padding: '0.75rem 1rem', borderRadius: '12px', border: 'none', cursor: 'pointer', background: activeTab === 'aimath' ? 'rgba(99, 102, 241, 0.2)' : 'transparent', color: activeTab === 'aimath' ? '#8b5cf6' : 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.3s' }}>
              <Sparkles size={18} /> <span className="desktop-only">AI Math</span>
            </button>
            <button onClick={() => setActiveTab('calculator')} style={{ flex: '0 0 auto', padding: '0.75rem 1rem', borderRadius: '12px', border: 'none', cursor: 'pointer', background: activeTab === 'calculator' ? 'rgba(255, 255, 255, 0.1)' : 'transparent', color: activeTab === 'calculator' ? 'white' : 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.3s' }}>
              <Calculator size={18} /> <span className="desktop-only">Calc</span>
            </button>
            <button onClick={() => setActiveTab('converter')} style={{ flex: '0 0 auto', padding: '0.75rem 1rem', borderRadius: '12px', border: 'none', cursor: 'pointer', background: activeTab === 'converter' ? 'rgba(255, 255, 255, 0.1)' : 'transparent', color: activeTab === 'converter' ? 'white' : 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.3s' }}>
              <ArrowRightLeft size={18} /> <span className="desktop-only">Units</span>
            </button>
            <button onClick={() => setActiveTab('timer')} style={{ flex: '0 0 auto', padding: '0.75rem 1rem', borderRadius: '12px', border: 'none', cursor: 'pointer', background: activeTab === 'timer' ? 'rgba(16, 185, 129, 0.2)' : 'transparent', color: activeTab === 'timer' ? '#10b981' : 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.3s' }}>
              <Clock size={18} /> <span className="desktop-only">Timer</span>
            </button>
            <button onClick={() => setActiveTab('flashcards')} style={{ flex: '0 0 auto', padding: '0.75rem 1rem', borderRadius: '12px', border: 'none', cursor: 'pointer', background: activeTab === 'flashcards' ? 'rgba(236, 72, 153, 0.2)' : 'transparent', color: activeTab === 'flashcards' ? '#ec4899' : 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.3s' }}>
              <Book size={18} /> <span className="desktop-only">Cards</span>
            </button>
          </div>
        )}

        <div style={{ flex: 1, padding: isFullscreen ? '2rem 3rem' : '0', overflowY: 'auto' }}>
          {activeTab === 'speaking' && <SpeakingTab userClass={userClass} />}

          {activeTab === 'aimath' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
              <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.5rem', color: 'white', marginBottom: '0.5rem' }}>AI Math Solver</h3>
                <p style={{ color: 'var(--text-secondary)' }}>Type any math problem and get a step-by-step solution.</p>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
                <input 
                  type="text" 
                  value={aiMathInput}
                  onChange={(e) => setAiMathInput(e.target.value)}
                  placeholder="e.g. Solve 2x + 5 = 15 or What is the area of a circle with radius 4?"
                  style={{ flex: 1, padding: '1rem', borderRadius: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--glass-border)', color: 'white', outline: 'none', fontSize: '1rem' }}
                  onKeyDown={(e) => { if (e.key === 'Enter') solveMath(); }}
                />
                <button 
                  onClick={solveMath}
                  disabled={isSolvingMath || !aiMathInput.trim()}
                  style={{ padding: '0 1.5rem', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', cursor: isSolvingMath || !aiMathInput.trim() ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', opacity: isSolvingMath || !aiMathInput.trim() ? 0.7 : 1 }}
                >
                  {isSolvingMath ? <Loader2 size={20} className="spin" /> : <Sparkles size={20} />}
                  Solve
                </button>
              </div>
              
              {aiMathSolution && (
                <div style={{ background: 'rgba(99, 102, 241, 0.05)', padding: '2rem', borderRadius: '16px', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                  <div style={{ color: '#8b5cf6', fontWeight: 'bold', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Sparkles size={18} /> Step-by-Step Solution
                  </div>
                  <div style={{ color: 'white', lineHeight: '1.6', fontSize: '1.05rem' }}>
                    <ReactMarkdown 
                      remarkPlugins={[remarkMath]} 
                      rehypePlugins={[rehypeKatex]}
                      components={{
                        p: ({node, ...props}) => <p style={{ marginBottom: '1rem' }} {...props} />,
                        ul: ({node, ...props}) => <ul style={{ marginLeft: '1.5rem', marginBottom: '1rem' }} {...props} />,
                        ol: ({node, ...props}) => <ol style={{ marginLeft: '1.5rem', marginBottom: '1rem' }} {...props} />,
                        li: ({node, ...props}) => <li style={{ marginBottom: '0.5rem' }} {...props} />
                      }}
                    >
                      {aiMathSolution}
                    </ReactMarkdown>
                  </div>
                </div>
              )}

            </div>
          )}

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
      </div>
    </section>
  );
};

export default StudyTools;
