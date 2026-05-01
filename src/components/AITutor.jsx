import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot, User, Loader2, Maximize2, Minimize2, Settings, Volume2 } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import TTSButton from './TTSButton';
import { getAvailableVoices, setPreferredVoice } from '../utils/speech';

// Initialize the Gemini API
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

const AITutor = ({ userClass }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);
  const [voices, setVoices] = useState([]);
  const [selectedVoiceName, setSelectedVoiceName] = useState('');
  
  const [messages, setMessages] = useState([
    { role: 'model', text: "Hi there! I'm your AI Study Buddy. Ask me any doubts you have about your subjects!" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const loadVoices = () => {
      const available = getAvailableVoices();
      setVoices(available);
      // Try to find a default good voice
      const defaultVoice = available.find(v => v.lang.startsWith('en') && (v.name.includes('Google') || v.localService));
      if (defaultVoice) setSelectedVoiceName(defaultVoice.name);
    };

    loadVoices();
    if (window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  const handleVoiceChange = (voiceName) => {
    const voice = voices.find(v => v.name === voiceName);
    if (voice) {
      setSelectedVoiceName(voiceName);
      setPreferredVoice(voice);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim()) return;
    
    const userMsg = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // Using the latest flash model since 1.5 models are deprecated for new keys
      const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
      
      const prompt = `You are a friendly, encouraging AI tutor for a student in Class ${userClass || 'elementary/middle'}. 
IMPORTANT FORMATTING RULES:
1. Use markdown formatting freely.
2. IMPORTANT: You MUST use LaTeX for math equations. Wrap inline math with a single dollar sign (e.g. $F = ma$) and block math with double dollar signs.
3. Keep answers simple, easy to understand, and perfectly suited for their grade level.

MOOD DETECTION:
At the very beginning of your response, start with a mood tag in brackets. Choose ONE from: [MOOD: excited], [MOOD: happy], [MOOD: sad], [MOOD: serious], [MOOD: friendly], [MOOD: neutral], [MOOD: encouraging].
Example: "[MOOD: encouraging] That's a great question! Let's solve it together..."

Student: ${input}`;
      
      const result = await model.generateContent(prompt);
      const fullText = result.response.text();
      
      // Parse mood
      let mood = 'friendly';
      let cleanText = fullText;
      const moodMatch = fullText.match(/^\[MOOD: (.*?)\]/);
      if (moodMatch) {
        mood = moodMatch[1].toLowerCase();
        cleanText = fullText.replace(/^\[MOOD: .*?\]\s*/, '');
      }
      
      setMessages(prev => [...prev, { role: 'model', text: cleanText, mood }]);
    } catch (error) {
      console.error("AI Error:", error);
      setMessages(prev => [...prev, { role: 'model', text: `Connection Error: ${error.message}. Please check if the Generative Language API is enabled for this key.`, mood: 'serious' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          color: 'white',
          border: 'none',
          boxShadow: '0 10px 25px rgba(99, 102, 241, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 999,
          display: isOpen ? 'none' : 'flex'
        }}
      >
        <MessageCircle size={28} />
      </motion.button>

      {/* Chat Window Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            style={{
              position: 'fixed',
              bottom: window.innerWidth < 768 ? '0' : '2rem',
              right: window.innerWidth < 768 ? '0' : '2rem',
              width: window.innerWidth < 768 ? '100%' : (isExpanded ? '800px' : '350px'),
              height: window.innerWidth < 768 ? '100%' : (isExpanded ? '600px' : '500px'),
              maxWidth: '100vw',
              maxHeight: '100vh',
              background: 'rgba(5, 5, 8, 0.95)',
              backdropFilter: 'blur(30px)',
              border: window.innerWidth < 768 ? 'none' : '1px solid var(--glass-border)',
              borderRadius: window.innerWidth < 768 ? '0' : '24px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              zIndex: 1000
            }}
          >
            {/* Header */}
            <div style={{
              padding: '1rem',
              background: 'rgba(255, 255, 255, 0.05)',
              borderBottom: '1px solid var(--glass-border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Bot size={18} color="white" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>AI Tutor</h3>
                  <span style={{ fontSize: '0.75rem', color: '#4dff88' }}>● Online</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <button 
                  onClick={() => setShowVoiceSettings(!showVoiceSettings)} 
                  style={{ background: 'none', border: 'none', color: showVoiceSettings ? 'var(--accent-red)' : 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                  title="Voice Settings"
                >
                  <Settings size={18} />
                </button>
                {window.innerWidth > 768 && (
                  <button onClick={() => setIsExpanded(!isExpanded)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                    {isExpanded ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                  </button>
                )}
                <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Voice Settings Panel ... */}
            <AnimatePresence>
              {showVoiceSettings && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    borderBottom: '1px solid var(--glass-border)',
                    overflow: 'hidden',
                    padding: '1rem'
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                      <Volume2 size={14} />
                      <span>Select preferred learning voice:</span>
                    </div>
                    <select 
                      value={selectedVoiceName}
                      onChange={(e) => handleVoiceChange(e.target.value)}
                      style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        color: 'white',
                        border: '1px solid var(--glass-border)',
                        padding: '0.6rem 1rem',
                        borderRadius: '12px',
                        fontSize: '0.8rem',
                        width: '100%',
                        outline: 'none',
                        cursor: 'pointer',
                        appearance: 'none',
                        backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'16\' height=\'16\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'rgba(255,255,255,0.5)\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'%3E%3C/polyline%3E%3C/svg%3E")',
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 0.75rem center',
                        paddingRight: '2.5rem'
                      }}
                    >
                      <optgroup label="English Voices">
                        {voices.filter(v => v.lang.startsWith('en')).map(v => (
                          <option key={v.name} value={v.name}>{v.name} {v.localService ? '(HD)' : ''}</option>
                        ))}
                      </optgroup>
                      <optgroup label="Hindi Voices">
                        {voices.filter(v => v.lang.startsWith('hi')).map(v => (
                          <option key={v.name} value={v.name}>{v.name}</option>
                        ))}
                      </optgroup>
                      <optgroup label="Other Voices">
                        {voices.filter(v => !v.lang.startsWith('en') && !v.lang.startsWith('hi')).map(v => (
                          <option key={v.name} value={v.name}>{v.name} ({v.lang})</option>
                        ))}
                      </optgroup>
                    </select>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Messages Area */}
            <div style={{
              flex: 1,
              padding: '1rem',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              {messages.map((msg, idx) => (
                <div key={idx} style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.5rem',
                  alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%'
                }}>
                  {msg.role === 'model' && (
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Bot size={14} color="#8b5cf6" />
                    </div>
                  )}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                    <div style={{
                      padding: '0.75rem 1rem',
                      borderRadius: '16px',
                      background: msg.role === 'user' ? 'linear-gradient(135deg, #ff3344, #ff8899)' : 'rgba(255, 255, 255, 0.05)',
                      color: 'white',
                      border: msg.role === 'user' ? 'none' : '1px solid var(--glass-border)',
                      borderBottomRightRadius: msg.role === 'user' ? '4px' : '16px',
                      borderBottomLeftRadius: msg.role === 'model' ? '4px' : '16px',
                      fontSize: '0.9rem',
                      lineHeight: '1.6',
                      overflowX: 'auto',
                      maxWidth: '100%'
                    }} className="ai-markdown">
                      {msg.role === 'user' ? (
                        <div style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</div>
                      ) : (
                        <ReactMarkdown
                          remarkPlugins={[remarkMath]}
                          rehypePlugins={[rehypeKatex]}
                        >
                          {msg.text}
                        </ReactMarkdown>
                      )}
                    </div>
                    {msg.role === 'model' && (
                      <div style={{ marginLeft: '4px' }}>
                        <TTSButton text={msg.text} size={14} mood={msg.mood} />
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem' }}>
                  <Loader2 size={16} className="spinner" style={{ animation: 'spin 2s linear infinite', color: '#8b5cf6' }} />
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Thinking...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div style={{
              padding: '1rem',
              borderTop: '1px solid var(--glass-border)',
              background: 'rgba(0, 0, 0, 0.2)'
            }}>
              <form onSubmit={handleSend} style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask a question..."
                  style={{
                    flex: 1,
                    padding: '0.75rem 1rem',
                    borderRadius: '24px',
                    border: '1px solid var(--glass-border)',
                    background: 'rgba(255, 255, 255, 0.05)',
                    color: 'white',
                    outline: 'none',
                    fontSize: '0.9rem'
                  }}
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    border: 'none',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: isLoading || !input.trim() ? 'not-allowed' : 'pointer',
                    opacity: isLoading || !input.trim() ? 0.5 : 1
                  }}
                >
                  <Send size={16} style={{ marginLeft: '-2px' }} />
                </motion.button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin { 100% { transform: rotate(360deg); } }
        .ai-markdown p:first-child { margin-top: 0; }
        .ai-markdown p:last-child { margin-bottom: 0; }
        .ai-markdown p { margin: 0.5em 0; }
        .ai-markdown ul, .ai-markdown ol { padding-left: 1.5em; margin: 0.5em 0; }
        .ai-markdown .katex-display { margin: 1em 0; overflow-x: auto; overflow-y: hidden; }
      `}} />
    </>
  );
};

export default AITutor;
