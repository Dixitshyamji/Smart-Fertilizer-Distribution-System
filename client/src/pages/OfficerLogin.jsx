import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const FERTILIZER_PRICES = {
  urea: 266.50,
  dap: 1350.00,
  npk: 1470.00,
};

const OfficerLogin = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Admin-created officer accounts from localStorage
    let officerAccounts = [];
    try {
      const stored = localStorage.getItem('officerAccounts');
      if (!stored) {
        // Pehli baar — seed karo
        officerAccounts = [
          { id: 1, name: 'Ram Singh (District Officer)', username: 'officer', password: 'officer123', badge: 'OFF-001', createdAt: '13/08/2026' }
        ];
        localStorage.setItem('officerAccounts', JSON.stringify(officerAccounts));
      } else {
        const parsed = JSON.parse(stored);
        officerAccounts = Array.isArray(parsed) ? parsed : [];
        // ✅ FIX: Agar admin ne sab delete kar diye toh empty rehne do — auto-reset nahi
      }
    } catch (e) {
      officerAccounts = [];
    }

    const found = officerAccounts.find(
      (o) => o.username.trim() === username.trim() && o.password === password
    );

    setTimeout(() => {
      setLoading(false);
      if (found) {
        localStorage.setItem('officerLoggedIn', JSON.stringify(found));
        navigate('/officer/verify');
      } else if (officerAccounts.length === 0) {
        setError('Koi officer account nahi hai. Admin se account create karwayein.');
      } else {
        setError('Invalid credentials. Please check your username & password or contact Admin.');
      }
    }, 900);
  };

  return (
    <div style={styles.page}>
      <div style={styles.glowBg} />
      <div style={styles.card}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.iconWrap}>
            <span style={styles.icon}>👮</span>
            <div style={styles.iconGlow} />
          </div>
          <div style={styles.badge}>Admin Authorized Portal</div>
          <h1 style={styles.title}>Officer Login</h1>
          <p style={styles.subtitle}>
            Your login credentials are provided by the Admin. Contact your district administrator if you don't have access.
          </p>
        </div>

        {error && (
          <div style={styles.errorBox}>
            <span>⚠️</span> {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>👤 Officer Username</label>
            <input
              type="text"
              required
              placeholder="e.g. officer_ram"
              value={username}
              onChange={e => setUsername(e.target.value)}
              style={styles.input}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>🔐 Password (Admin Provided)</label>
            <div style={styles.passWrap}>
              <input
                type={showPass ? 'text' : 'password'}
                required
                placeholder="Enter your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={{ ...styles.input, paddingRight: '80px' }}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                style={styles.eyeBtn}
              >
                {showPass ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} style={styles.btn}>
            {loading ? (
              <span style={styles.loadingDots}>Authenticating<span className="dots">...</span></span>
            ) : (
              '🔓 Login to Officer Portal'
            )}
          </button>
        </form>

        <div style={styles.infoBox}>
          <span style={styles.infoIcon}>ℹ️</span>
          <span style={styles.infoText}>
            Officers can only verify tokens after Admin has created their account.
          </span>
        </div>

        <button onClick={() => navigate('/')} style={styles.backBtn}>
          ← Back to Home
        </button>
      </div>

      <style>{`
        @keyframes glowPulse {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.1); }
        }
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(30px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes iconFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        input:focus { outline: none; border-color: #3b82f6 !important; box-shadow: 0 0 0 3px rgba(59,130,246,0.15) !important; }
      `}</style>
    </div>
  );
};

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'radial-gradient(ellipse at 30% 20%, #0f1f3d 0%, #050a14 60%, #0a0a1a 100%)',
    padding: '20px',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: "'Inter', sans-serif",
  },
  glowBg: {
    position: 'fixed',
    top: '20%',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '600px',
    height: '600px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)',
    animation: 'glowPulse 4s ease-in-out infinite',
    pointerEvents: 'none',
  },
  card: {
    position: 'relative',
    zIndex: 1,
    background: 'rgba(15, 30, 60, 0.85)',
    border: '1px solid rgba(96,165,250,0.2)',
    borderRadius: '24px',
    padding: '40px 36px',
    maxWidth: '440px',
    width: '100%',
    backdropFilter: 'blur(20px)',
    boxShadow: '0 0 60px rgba(59,130,246,0.12), 0 24px 80px rgba(0,0,0,0.6)',
    animation: 'cardIn 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards',
  },
  header: {
    textAlign: 'center',
    marginBottom: '28px',
  },
  iconWrap: {
    position: 'relative',
    display: 'inline-block',
    marginBottom: '16px',
  },
  icon: {
    fontSize: '52px',
    display: 'block',
    animation: 'iconFloat 3s ease-in-out infinite',
    filter: 'drop-shadow(0 0 16px rgba(96,165,250,0.6))',
  },
  iconGlow: {
    position: 'absolute',
    inset: '-12px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(59,130,246,0.3) 0%, transparent 70%)',
    animation: 'glowPulse 3s ease-in-out infinite',
  },
  badge: {
    display: 'inline-block',
    fontSize: '10px',
    fontWeight: '700',
    letterSpacing: '1px',
    textTransform: 'uppercase',
    color: '#93c5fd',
    border: '1px solid rgba(147,197,253,0.3)',
    padding: '4px 12px',
    borderRadius: '100px',
    marginBottom: '12px',
    background: 'rgba(59,130,246,0.1)',
  },
  title: {
    margin: '0 0 8px',
    fontSize: '30px',
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: '-0.5px',
  },
  subtitle: {
    margin: 0,
    fontSize: '13px',
    color: 'rgba(255,255,255,0.45)',
    lineHeight: '1.6',
  },
  errorBox: {
    background: 'rgba(239,68,68,0.12)',
    border: '1px solid rgba(239,68,68,0.3)',
    color: '#fca5a5',
    padding: '12px 16px',
    borderRadius: '10px',
    fontSize: '13px',
    marginBottom: '20px',
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#93c5fd',
    letterSpacing: '0.3px',
  },
  input: {
    padding: '13px 16px',
    background: 'rgba(255,255,255,0.05)',
    border: '1.5px solid rgba(96,165,250,0.2)',
    borderRadius: '10px',
    fontSize: '14px',
    color: '#e2e8f0',
    transition: 'all 0.2s ease',
    width: '100%',
    boxSizing: 'border-box',
  },
  passWrap: {
    position: 'relative',
  },
  eyeBtn: {
    position: 'absolute',
    right: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'rgba(59,130,246,0.2)',
    border: '1px solid rgba(96,165,250,0.3)',
    color: '#93c5fd',
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: '700',
    cursor: 'pointer',
  },
  btn: {
    padding: '15px',
    background: 'linear-gradient(135deg, #1d4ed8 0%, #3b82f6 50%, #60a5fa 100%)',
    color: '#ffffff',
    border: 'none',
    borderRadius: '12px',
    fontSize: '15px',
    fontWeight: '800',
    cursor: 'pointer',
    letterSpacing: '0.3px',
    boxShadow: '0 4px 20px rgba(59,130,246,0.4)',
    transition: 'all 0.2s ease',
    marginTop: '4px',
  },
  infoBox: {
    marginTop: '20px',
    background: 'rgba(59,130,246,0.06)',
    border: '1px solid rgba(96,165,250,0.12)',
    borderRadius: '10px',
    padding: '12px 14px',
    display: 'flex',
    gap: '8px',
    alignItems: 'flex-start',
  },
  infoIcon: { fontSize: '14px', flexShrink: 0 },
  infoText: { fontSize: '12px', color: 'rgba(255,255,255,0.4)', lineHeight: '1.5' },
  backBtn: {
    marginTop: '20px',
    width: '100%',
    padding: '11px',
    background: 'transparent',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '10px',
    color: 'rgba(255,255,255,0.4)',
    fontSize: '13px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
};

export default OfficerLogin;
