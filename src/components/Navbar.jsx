import React, { useState } from 'react';
import { Rocket, LogOut, User, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  const navLinks = ['Features', 'Subjects', 'Progress'];
  return (
    <nav style={{
      padding: '1rem 1.5rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      position: 'fixed',
      top: 0,
      width: '100%',
      zIndex: 100,
      backdropFilter: 'blur(15px)',
      background: 'rgba(5, 5, 8, 0.8)',
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
        <span style={{ fontSize: '1.4rem', fontWeight: '700', letterSpacing: '-0.5px' }}>
          Stellar<span style={{ color: 'var(--text-secondary)' }}>Study</span>
        </span>
      </div>

      {/* Desktop Links */}
      <div className="desktop-only" style={{ display: 'flex', gap: '2.5rem', alignItems: 'center' }}>
        {navLinks.map((item) => (
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

      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div className="desktop-only" style={{ 
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.05)',
              borderRadius: '100px', border: '1px solid var(--glass-border)'
            }}>
              <User size={16} color="var(--accent-red)" />
              <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>{user.name.split(' ')[0]}</span>
            </div>
            <button className="desktop-only"
              onClick={onLogout}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.85rem'
              }}
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        ) : (
          <div className="desktop-only">
             <button style={{
              background: 'var(--accent-red)',
              color: 'white',
              padding: '0.6rem 1.2rem',
              borderRadius: '100px',
              fontSize: '0.85rem',
              fontWeight: '600',
            }}>Get Started</button>
          </div>
        )}

        {/* Mobile Toggle */}
        <button 
          onClick={toggleMenu}
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid var(--glass-border)',
            padding: '0.5rem',
            borderRadius: '10px',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 101
          }}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              width: '80%',
              height: '100vh',
              background: 'rgba(10, 10, 15, 0.98)',
              backdropFilter: 'blur(20px)',
              padding: '6rem 2rem 2rem',
              zIndex: 99,
              display: 'flex',
              flexDirection: 'column',
              gap: '2rem',
              borderLeft: '1px solid var(--glass-border)'
            }}
          >
            {navLinks.map((item) => (
              <a 
                key={item} 
                href={`#${item.toLowerCase()}`} 
                onClick={() => setIsOpen(false)}
                style={{
                  fontSize: '1.5rem',
                  fontWeight: '600',
                  color: 'white'
                }}
              >
                {item}
              </a>
            ))}
            
            <div style={{ marginTop: 'auto', borderTop: '1px solid var(--glass-border)', paddingTop: '2rem' }}>
              {user ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ padding: '0.75rem', background: 'var(--accent-red)', borderRadius: '12px' }}>
                      <User size={24} color="white" />
                    </div>
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '1.1rem' }}>{user.name}</div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{user.email}</div>
                    </div>
                  </div>
                  <button 
                    onClick={() => { onLogout(); setIsOpen(false); }}
                    style={{
                      width: '100%',
                      padding: '1rem',
                      background: 'rgba(255, 51, 68, 0.1)',
                      border: '1px solid rgba(255, 51, 68, 0.2)',
                      borderRadius: '12px',
                      color: 'var(--accent-red)',
                      fontWeight: '700',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.75rem'
                    }}
                  >
                    <LogOut size={20} /> Logout Mission
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => setIsOpen(false)}
                  style={{
                    width: '100%',
                    padding: '1.25rem',
                    background: 'var(--accent-red)',
                    borderRadius: '16px',
                    color: 'white',
                    fontWeight: '700',
                    fontSize: '1.1rem'
                  }}
                >
                  Start Mission
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
