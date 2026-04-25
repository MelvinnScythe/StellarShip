import React from 'react';
import { Rocket, LogOut, User } from 'lucide-react';
import { motion } from 'framer-motion';

const Navbar = ({ user, onLogout }) => {
  return (
    <nav style={{
      padding: '1.5rem 2rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      position: 'fixed',
      top: 0,
      width: '100%',
      zIndex: 100,
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid var(--glass-border)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{
          background: 'var(--accent-red)',
          padding: '0.5rem',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 15px rgba(255, 51, 68, 0.4)'
        }}>
          <Rocket size={20} color="white" fill="white" />
        </div>
        <span style={{ fontSize: '1.5rem', fontWeight: '700', letterSpacing: '-0.5px' }}>
          Stellar<span style={{ color: 'var(--text-secondary)' }}>Study</span>
        </span>
      </div>

      <div style={{ display: 'flex', gap: '2.5rem', alignItems: 'center' }}>
        {['Features', 'Subjects', 'Progress'].map((item) => (
          <a key={item} href={`#${item.toLowerCase()}`} style={{
            fontSize: '0.9rem',
            fontWeight: '500',
            color: 'var(--text-secondary)',
            transition: 'color 0.3s'
          }} onMouseOver={(e) => e.target.style.color = 'white'} 
             onMouseOut={(e) => e.target.style.color = 'var(--text-secondary)'}>
            {item}
          </a>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ 
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.05)',
              borderRadius: '100px', border: '1px solid var(--glass-border)'
            }}>
              <User size={16} color="var(--accent-red)" />
              <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>{user.name}</span>
            </div>
            <button 
              onClick={onLogout}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.9rem'
              }}
              onMouseOver={(e) => e.target.style.color = 'var(--accent-red)'}
              onMouseOut={(e) => e.target.style.color = 'var(--text-secondary)'}
            >
              <LogOut size={18} /> Logout
            </button>
          </div>
        ) : (
          <>
            <button style={{
              background: 'transparent',
              color: 'var(--text-primary)',
              fontSize: '0.9rem',
              fontWeight: '500'
            }}>Sign In</button>
            <button style={{
              background: 'var(--accent-red)',
              color: 'white',
              padding: '0.75rem 1.5rem',
              borderRadius: '100px',
              fontSize: '0.9rem',
              fontWeight: '600',
              boxShadow: '0 4px 15px rgba(255, 51, 68, 0.2)'
            }} onMouseOver={(e) => e.target.style.background = 'var(--accent-red-hover)'}
               onMouseOut={(e) => e.target.style.background = 'var(--accent-red)'}>
              Get Started
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
