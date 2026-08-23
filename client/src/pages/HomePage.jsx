import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const WORDS = [
  'Ensuring Transparent &',
  'Smart Fertilizer Distribution'
];

const Particle = ({ style }) => <div style={style} />;

function generateParticles(count) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    size: `${4 + Math.random() * 8}px`,
    delay: `${Math.random() * 8}s`,
    duration: `${6 + Math.random() * 8}s`,
    opacity: 0.15 + Math.random() * 0.35,
    color: Math.random() > 0.5 ? '#4ade80' : '#fbbf24',
  }));
}

const HomePage = () => {
  const navigate = useNavigate();
  const [displayText, setDisplayText] = useState('');
  const [lineIndex, setLineIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [lines, setLines] = useState([]);
  const [showButtons, setShowButtons] = useState(false);
  const [hoveredBtn, setHoveredBtn] = useState(null);
  const particles = useRef(generateParticles(28));
  const [tick, setTick] = useState(0);

  // Typewriter effect
  useEffect(() => {
    if (lineIndex >= WORDS.length) {
      setTimeout(() => setShowButtons(true), 400);
      return;
    }
    const currentWord = WORDS[lineIndex];
    if (charIndex < currentWord.length) {
      const t = setTimeout(() => {
        setDisplayText(prev => prev + currentWord[charIndex]);
        setCharIndex(c => c + 1);
      }, 48);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(() => {
        setLines(prev => [...prev, currentWord]);
        setDisplayText('');
        setCharIndex(0);
        setLineIndex(l => l + 1);
      }, 350);
      return () => clearTimeout(t);
    }
  }, [charIndex, lineIndex]);

  // Particle float tick
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 50);
    return () => clearInterval(interval);
  }, []);

  const portals = [
    {
      id: 'farmer',
      icon: '👨‍🌾',
      title: 'Farmer Portal',
      sub: 'Login or Register as a Farmer',
      gradient: 'linear-gradient(135deg, #065f46 0%, #047857 50%, #059669 100%)',
      glow: 'rgba(5,150,105,0.5)',
      border: 'rgba(52,211,153,0.4)',
      route: '/farmer/login',
      badge: 'Self Registration',
      badgeColor: '#6ee7b7',
    },
    {
      id: 'officer',
      icon: '👮',
      title: 'Officer Portal',
      sub: 'Token Verification & Distribution',
      gradient: 'linear-gradient(135deg, #1e3a5f 0%, #1d4ed8 50%, #3b82f6 100%)',
      glow: 'rgba(59,130,246,0.5)',
      border: 'rgba(96,165,250,0.4)',
      route: '/officer/login',
      badge: 'Admin Authorized',
      badgeColor: '#93c5fd',
    },
    {
      id: 'admin',
      icon: '🛡️',
      title: 'Admin Panel',
      sub: 'Manage System, Stock & Officers',
      gradient: 'linear-gradient(135deg, #4c1d95 0%, #6d28d9 50%, #7c3aed 100%)',
      glow: 'rgba(124,58,237,0.5)',
      border: 'rgba(167,139,250,0.4)',
      route: '/admin',
      badge: 'Restricted Access',
      badgeColor: '#c4b5fd',
    },
  ];

  return (
    <div style={styles.page}>
      {/* Animated background particles */}
      {particles.current.map(p => (
        <div
          key={p.id}
          style={{
            position: 'fixed',
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            borderRadius: '50%',
            background: p.color,
            opacity: p.opacity,
            animation: `floatParticle ${p.duration} ${p.delay} ease-in-out infinite`,
            pointerEvents: 'none',
            zIndex: 0,
            filter: 'blur(1px)',
          }}
        />
      ))}

      {/* Grid overlay */}
      <div style={styles.gridOverlay} />

      {/* Main content */}
      <div style={styles.content}>
        {/* Government badge */}
        <div style={styles.govBadge}>
          <span style={styles.govDot} />
          Ministry of Agriculture & Farmers Welfare — Govt. of India
        </div>

        {/* Hero emblem */}
        <div style={styles.emblem}>
          <span style={styles.emblemIcon}>🌾</span>
          <div style={styles.emblemRing} />
          <div style={styles.emblemRing2} />
        </div>

        {/* Animated Title */}
        <div style={styles.titleBox}>
          {lines.map((line, i) => (
            <div key={i} style={i === 0 ? styles.titleLine1 : styles.titleLine2}>
              {line}
            </div>
          ))}
          {lineIndex < WORDS.length && (
            <div style={lineIndex === 0 ? styles.titleLine1 : styles.titleLine2}>
              {displayText}
              <span style={styles.cursor}>|</span>
            </div>
          )}
        </div>

        {/* Sub text */}
        {showButtons && (
          <p style={styles.subText}>
            Direct-to-Farmer Fertilizer Allocation · Real-time Subsidy Tracking · Transparent Distribution
          </p>
        )}

        {/* Portal Buttons */}
        {showButtons && (
          <div style={styles.portalGrid}>
            {portals.map((portal, i) => (
              <div
                key={portal.id}
                onClick={() => navigate(portal.route)}
                onMouseEnter={() => setHoveredBtn(portal.id)}
                onMouseLeave={() => setHoveredBtn(null)}
                style={{
                  ...styles.portalCard,
                  background: portal.gradient,
                  border: `1.5px solid ${hoveredBtn === portal.id ? portal.border : 'rgba(255,255,255,0.08)'}`,
                  boxShadow: hoveredBtn === portal.id
                    ? `0 0 40px ${portal.glow}, 0 20px 60px rgba(0,0,0,0.5)`
                    : '0 8px 32px rgba(0,0,0,0.4)',
                  transform: hoveredBtn === portal.id ? 'translateY(-8px) scale(1.03)' : 'translateY(0) scale(1)',
                  animationDelay: `${i * 0.12}s`,
                }}
              >
                {/* Badge */}
                <div style={{ ...styles.portalBadge, color: portal.badgeColor, borderColor: portal.badgeColor + '55' }}>
                  {portal.badge}
                </div>

                {/* Icon */}
                <div style={styles.portalIconWrap}>
                  <span style={styles.portalIcon}>{portal.icon}</span>
                  <div style={{ ...styles.portalIconGlow, background: portal.glow }} />
                </div>

                {/* Text */}
                <h3 style={styles.portalTitle}>{portal.title}</h3>
                <p style={styles.portalSub}>{portal.sub}</p>

                {/* Arrow */}
                <div style={{
                  ...styles.portalArrow,
                  opacity: hoveredBtn === portal.id ? 1 : 0,
                  transform: hoveredBtn === portal.id ? 'translateX(0)' : 'translateX(-10px)',
                }}>
                  Enter Portal →
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Bottom stats */}
        {showButtons && (
          <div style={styles.statsRow}>
            {[
              { label: 'Districts Covered', value: '12+' },
              { label: 'Registered Farmers', value: '5,000+' },
              { label: 'Bags Distributed', value: '1.2L+' },
              { label: 'Verification Rate', value: '99.8%' },
            ].map((s, i) => (
              <div key={i} style={styles.statItem}>
                <div style={styles.statValue}>{s.value}</div>
                <div style={styles.statLabel}>{s.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes floatParticle {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-30px) scale(1.2); }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes pulseRing {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(1.8); opacity: 0; }
        }
        @keyframes spinSlow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes cardFadeIn {
          from { opacity: 0; transform: translateY(32px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes statsFade {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

const styles = {
  page: {
    minHeight: '100vh',
    background: 'radial-gradient(ellipse at 20% 10%, #0a2e1a 0%, #050d0a 50%, #0a0a1a 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: "'Inter', 'Poppins', sans-serif",
  },
  gridOverlay: {
    position: 'fixed',
    inset: 0,
    backgroundImage: `
      linear-gradient(rgba(52,211,153,0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(52,211,153,0.04) 1px, transparent 1px)
    `,
    backgroundSize: '60px 60px',
    pointerEvents: 'none',
    zIndex: 0,
  },
  content: {
    position: 'relative',
    zIndex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    padding: '40px 20px',
    maxWidth: '1100px',
    width: '100%',
  },
  govBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    background: 'rgba(52,211,153,0.08)',
    border: '1px solid rgba(52,211,153,0.2)',
    color: '#6ee7b7',
    padding: '8px 18px',
    borderRadius: '100px',
    fontSize: '12px',
    fontWeight: '600',
    letterSpacing: '0.3px',
    marginBottom: '32px',
    animation: 'fadeSlideUp 0.6s ease forwards',
    backdropFilter: 'blur(8px)',
  },
  govDot: {
    width: '7px',
    height: '7px',
    borderRadius: '50%',
    background: '#4ade80',
    boxShadow: '0 0 8px #4ade80',
    animation: 'blink 2s infinite',
  },
  emblem: {
    position: 'relative',
    width: '90px',
    height: '90px',
    marginBottom: '28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emblemIcon: {
    fontSize: '48px',
    filter: 'drop-shadow(0 0 20px rgba(74,222,128,0.7))',
    position: 'relative',
    zIndex: 2,
    animation: 'floatParticle 4s ease-in-out infinite',
  },
  emblemRing: {
    position: 'absolute',
    inset: 0,
    borderRadius: '50%',
    border: '2px solid rgba(74,222,128,0.3)',
    animation: 'pulseRing 2.5s ease-out infinite',
  },
  emblemRing2: {
    position: 'absolute',
    inset: '-15px',
    borderRadius: '50%',
    border: '1px solid rgba(74,222,128,0.15)',
    animation: 'pulseRing 2.5s 1.2s ease-out infinite',
  },
  titleBox: {
    marginBottom: '16px',
    lineHeight: '1.2',
  },
  titleLine1: {
    fontSize: 'clamp(28px, 5vw, 54px)',
    fontWeight: '800',
    color: 'rgba(255,255,255,0.92)',
    letterSpacing: '-1px',
    marginBottom: '4px',
  },
  titleLine2: {
    fontSize: 'clamp(28px, 5vw, 54px)',
    fontWeight: '900',
    background: 'linear-gradient(135deg, #4ade80 0%, #22d3ee 50%, #a78bfa 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    letterSpacing: '-1.5px',
  },
  cursor: {
    animation: 'blink 0.8s step-end infinite',
    color: '#4ade80',
    WebkitTextFillColor: '#4ade80',
    fontWeight: '300',
  },
  subText: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: '14px',
    marginBottom: '48px',
    letterSpacing: '0.2px',
    animation: 'fadeSlideUp 0.5s 0.2s ease forwards',
    opacity: 0,
    animationFillMode: 'forwards',
  },
  portalGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: '24px',
    width: '100%',
    maxWidth: '880px',
    marginBottom: '52px',
    animation: 'cardFadeIn 0.6s 0.1s ease forwards',
    opacity: 0,
    animationFillMode: 'forwards',
  },
  portalCard: {
    padding: '32px 28px',
    borderRadius: '20px',
    cursor: 'pointer',
    transition: 'all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
    position: 'relative',
    overflow: 'hidden',
    textAlign: 'left',
    backdropFilter: 'blur(12px)',
  },
  portalBadge: {
    display: 'inline-block',
    fontSize: '10px',
    fontWeight: '700',
    letterSpacing: '0.8px',
    textTransform: 'uppercase',
    border: '1px solid',
    padding: '3px 10px',
    borderRadius: '100px',
    marginBottom: '20px',
  },
  portalIconWrap: {
    position: 'relative',
    display: 'inline-block',
    marginBottom: '16px',
  },
  portalIcon: {
    fontSize: '40px',
    display: 'block',
    filter: 'drop-shadow(0 0 12px rgba(255,255,255,0.3))',
  },
  portalIconGlow: {
    position: 'absolute',
    inset: '-8px',
    borderRadius: '50%',
    filter: 'blur(16px)',
    opacity: 0.4,
    pointerEvents: 'none',
  },
  portalTitle: {
    margin: '0 0 8px 0',
    fontSize: '22px',
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: '-0.5px',
  },
  portalSub: {
    margin: '0 0 20px 0',
    fontSize: '13px',
    color: 'rgba(255,255,255,0.6)',
    lineHeight: '1.5',
  },
  portalArrow: {
    fontSize: '13px',
    fontWeight: '700',
    color: 'rgba(255,255,255,0.9)',
    transition: 'all 0.3s ease',
    letterSpacing: '0.3px',
  },
  statsRow: {
    display: 'flex',
    gap: '40px',
    flexWrap: 'wrap',
    justifyContent: 'center',
    animation: 'statsFade 0.8s 0.5s ease forwards',
    opacity: 0,
    animationFillMode: 'forwards',
  },
  statItem: {
    textAlign: 'center',
  },
  statValue: {
    fontSize: '26px',
    fontWeight: '800',
    color: '#4ade80',
    letterSpacing: '-0.5px',
  },
  statLabel: {
    fontSize: '11px',
    color: 'rgba(255,255,255,0.35)',
    marginTop: '2px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
};

export default HomePage;
