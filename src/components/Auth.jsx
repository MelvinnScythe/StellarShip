import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, Shield, ArrowLeft } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';

const Auth = ({ onLogin }) => {
  const [view, setView] = useState('login'); // 'login', 'signup', 'forgot'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/auth';

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await fetch(`${API_URL}/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: credentialResponse.credential })
      });
      const data = await res.json();
      if (res.ok) {
        onLogin(data.user, data.token);
      } else {
        setError(data.msg || 'Google login failed');
      }
    } catch (err) {
      console.error(err);
      setError("Cannot connect to server.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      if (view === 'login') {
        const res = await fetch(`${API_URL}/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (res.ok) {
          onLogin(data.user, data.token);
        } else {
          setError(data.msg || 'Login failed');
        }
      } else if (view === 'signup') {
        const res = await fetch(`${API_URL}/signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password })
        });
        const data = await res.json();
        if (res.ok) {
          onLogin(data.user, data.token);
        } else {
          setError(data.msg || 'Signup failed');
        }
      } else if (view === 'forgot') {
        // ... simulated forgot logic ...
        const users = JSON.parse(localStorage.getItem('antigravity_users') || '[]');
        const userIdx = users.findIndex(u => u.email === email);
        if (userIdx !== -1) {
          setView('reset');
        } else {
          setError('No account found with this email');
        }
      } else if (view === 'reset') {
        // ... simulated reset logic ...
        setMessage('Password updated successfully! You can now sign in.');
        setView('login');
      }
    } catch (err) {
      console.error("Auth error", err);
      setError("Cannot connect to server. Make sure the backend is running!");
    }
  };

  const isLogin = view === 'login';

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      background: 'radial-gradient(circle at center, #1a1a2e 0%, #0a0a0c 100%)',
      position: 'relative',
      overflow: 'hidden',
      color: 'white'
    }}>
      <div style={{ position: 'absolute', top: '20%', left: '20%', width: '300px', height: '300px', background: 'rgba(255, 51, 68, 0.15)', filter: 'blur(100px)', borderRadius: '50%' }}></div>
      <div style={{ position: 'absolute', bottom: '20%', right: '20%', width: '300px', height: '300px', background: 'rgba(99, 102, 241, 0.15)', filter: 'blur(100px)', borderRadius: '50%' }}></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          width: '100%',
          maxWidth: '450px',
          background: 'rgba(255, 255, 255, 0.03)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '32px',
          padding: '3rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          position: 'relative',
          zIndex: 1
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ 
            width: '64px', height: '64px', background: 'linear-gradient(135deg, #ff3344, #ff8899)', 
            borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1.5rem', boxShadow: '0 10px 20px rgba(255, 51, 68, 0.3)'
          }}>
            <Shield color="white" size={32} />
          </div>
          <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '0.5rem' }}>
            {view === 'login' ? 'Welcome Back' : view === 'signup' ? 'Join the Mission' : 'Reset Password'}
          </h2>
          <p style={{ color: '#a1a1aa' }}>
            {view === 'login' ? 'Sign in to continue your progress' : view === 'signup' ? 'Create an account to start' : 'Enter your email to find your account'}
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <AnimatePresence>
            {view === 'signup' && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden' }}>
                <div style={{ position: 'relative' }}>
                  <User style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#a1a1aa' }} size={18} />
                  <input type="text" placeholder="Full Name" required value={name} onChange={(e) => setName(e.target.value)}
                    style={{ width: '100%', padding: '1rem 1rem 1rem 3rem', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', color: 'white', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div style={{ position: 'relative' }}>
            <Mail style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#a1a1aa' }} size={18} />
            <input type="email" placeholder="Email Address" required value={email} onChange={(e) => setEmail(e.target.value)} disabled={view === 'reset'}
              style={{ width: '100%', padding: '1rem 1rem 1rem 3rem', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', color: 'white', outline: 'none', boxSizing: 'border-box', opacity: view === 'reset' ? 0.6 : 1 }}
            />
          </div>

          {(view !== 'forgot') && (
            <div style={{ position: 'relative' }}>
              <Lock style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#a1a1aa' }} size={18} />
              <input type="password" placeholder={view === 'reset' ? "New Password" : "Password"} required value={password} onChange={(e) => setPassword(e.target.value)}
                style={{ width: '100%', padding: '1rem 1rem 1rem 3rem', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', color: 'white', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
          )}

          {isLogin && (
            <div style={{ textAlign: 'right' }}>
              <button type="button" onClick={() => setView('forgot')} style={{ background: 'none', border: 'none', color: '#a1a1aa', fontSize: '0.85rem', cursor: 'pointer' }}>
                Forgot Password?
              </button>
            </div>
          )}

          {error && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ color: '#ff4d4d', fontSize: '0.85rem', textAlign: 'center' }}>{error}</motion.p>}
          {message && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ color: '#4dff88', fontSize: '0.85rem', textAlign: 'center' }}>{message}</motion.p>}

          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit"
            style={{ padding: '1rem', background: 'linear-gradient(135deg, #ff3344, #ff8899)', border: 'none', borderRadius: '12px', color: 'white', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem', boxShadow: '0 10px 20px rgba(255, 51, 68, 0.2)' }}
          >
            {view === 'login' ? 'Sign In' : view === 'signup' ? 'Create Account' : view === 'forgot' ? 'Find Account' : 'Reset Password'} <ArrowRight size={18} />
          </motion.button>
        </form>

        {(view === 'login' || view === 'signup') && (
          <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', width: '100%', gap: '1rem' }}>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
              <span style={{ color: '#a1a1aa', fontSize: '0.85rem' }}>OR</span>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
            </div>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError('Google Login Failed')}
              theme="filled_black"
              shape="pill"
            />
          </div>
        )}

        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <p style={{ color: '#a1a1aa', fontSize: '0.9rem' }}>
            {view === 'forgot' || view === 'reset' ? (
              <button onClick={() => setView('login')} style={{ background: 'none', border: 'none', color: '#ff3344', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 auto' }}>
                <ArrowLeft size={16} /> Back to Login
              </button>
            ) : (
              <>
                {view === 'login' ? "Don't have an account?" : "Already have an account?"}{' '}
                <button onClick={() => setView(view === 'login' ? 'signup' : 'login')} style={{ background: 'none', border: 'none', color: '#ff3344', fontWeight: '600', cursor: 'pointer', padding: 0 }}>
                  {view === 'login' ? 'Sign Up' : 'Sign In'}
                </button>
              </>
            )}
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
