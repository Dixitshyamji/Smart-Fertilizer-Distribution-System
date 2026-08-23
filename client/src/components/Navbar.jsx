import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Hide navbar on homepage
  if (location.pathname === '/') return null;

  // Only show minimal branding on admin/officer routes
  const isAdmin = location.pathname.startsWith('/admin');
  const isOfficer = location.pathname.startsWith('/officer');

  // On farmer pages, show the full navbar
  const isFarmer = location.pathname.startsWith('/farmer');

  const token = localStorage.getItem('token');
  const farmer = localStorage.getItem('farmer') ? JSON.parse(localStorage.getItem('farmer')) : null;

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  // Simplified branding-only navbar for admin/officer pages (they have their own UI)
  if (isAdmin || isOfficer) {
    return null; // Admin and Officer have their own headers
  }

  return (
    <header style={styles.header}>
      <div style={styles.brand} onClick={() => navigate('/')}>
        <div style={styles.logoBox}>
          <span style={styles.logoIcon}>🌾</span>
        </div>
        <div>
          <h1 style={styles.brandTitle}>Smart Fertilizer Portal</h1>
          <p style={styles.brandSub}>Govt. Direct Distribution & Subsidy System</p>
        </div>
      </div>

      <nav style={styles.nav}>
        {token ? (
          <>
            <button
              onClick={() => navigate('/farmer/dashboard')}
              style={{ ...styles.navBtn, ...(location.pathname === '/farmer/dashboard' ? styles.activeNavBtn : {}) }}
            >
              🏠 Dashboard
            </button>
            <button
              onClick={() => navigate('/farmer/book')}
              style={{ ...styles.navBtn, ...(location.pathname === '/farmer/book' ? styles.activeNavBtn : {}) }}
            >
              🎟️ Book Fertilizer
            </button>
            <div style={styles.userInfo}>
              <span style={styles.userGreet}>👨‍🌾 {farmer?.name || 'Farmer'}</span>
              <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
            </div>
          </>
        ) : (
          <>
            <button onClick={() => navigate('/')} style={styles.homeBtn}>🏠 Home</button>
            <button
              onClick={() => navigate('/farmer/login')}
              style={{ ...styles.navBtn, ...(location.pathname === '/farmer/login' ? styles.activeNavBtn : {}) }}
            >
              🔑 Farmer Login
            </button>
          </>
        )}
      </nav>
    </header>
  );
};

const styles = {
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    background: 'rgba(5, 20, 10, 0.85)',
    borderBottom: '1px solid rgba(74,222,128,0.12)',
    color: '#ffffff', padding: '12px 24px',
    backdropFilter: 'blur(20px)',
    position: 'sticky', top: 0, zIndex: 1000, flexWrap: 'wrap', gap: '12px',
    fontFamily: "'Inter', sans-serif",
  },
  brand: { display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' },
  logoBox: { width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg, #065f46, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 16px rgba(5,150,105,0.4)' },
  logoIcon: { fontSize: '20px' },
  brandTitle: { margin: 0, fontSize: '17px', fontWeight: '800', letterSpacing: '0.2px', color: '#fff' },
  brandSub: { margin: 0, fontSize: '10px', color: 'rgba(74,222,128,0.6)', letterSpacing: '0.3px' },
  nav: { display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' },
  navBtn: {
    textDecoration: 'none', color: 'rgba(255,255,255,0.6)', padding: '8px 14px', borderRadius: '8px',
    fontSize: '13px', fontWeight: '600', transition: 'all 0.2s ease', background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.06)', cursor: 'pointer',
  },
  activeNavBtn: { background: 'rgba(74,222,128,0.15)', color: '#4ade80', borderColor: 'rgba(74,222,128,0.3)', fontWeight: '700' },
  homeBtn: {
    padding: '8px 14px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '8px', color: 'rgba(255,255,255,0.5)', fontSize: '13px', fontWeight: '600', cursor: 'pointer',
  },
  userInfo: { display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.05)', padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' },
  userGreet: { fontSize: '13px', color: 'rgba(255,255,255,0.7)', fontWeight: '600' },
  logoutBtn: { background: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)', padding: '4px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: '700', fontSize: '12px' },
};

export default Navbar;
