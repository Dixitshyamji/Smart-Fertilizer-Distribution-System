import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

// ─── Admin Login Screen ─────────────────────────────────────────
const AdminLogin = ({ onLogin }) => {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setTimeout(() => {
      setLoading(false);
      if (user === 'admin' && pass === 'admin123') {
        onLogin();
      } else {
        setError('Invalid Admin credentials.');
      }
    }, 800);
  };

  return (
    <div style={loginStyles.page}>
      <div style={loginStyles.glowBg} />
      <div style={loginStyles.card}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={loginStyles.iconWrap}>
            <span style={{ fontSize: '52px', filter: 'drop-shadow(0 0 16px rgba(167,139,250,0.7))' }}>🛡️</span>
          </div>
          <div style={loginStyles.badge}>Restricted Access</div>
          <h1 style={loginStyles.title}>Admin Panel</h1>
          <p style={loginStyles.subtitle}>Enter admin credentials to access the control panel</p>
          <p style={{ fontSize: '11px', color: 'rgba(167,139,250,0.5)', marginTop: '4px' }}>
            Demo: admin / admin123
          </p>
        </div>

        {error && (
          <div style={loginStyles.error}>⚠️ {error}</div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={loginStyles.field}>
            <label style={loginStyles.label}>👤 Admin Username</label>
            <input
              type="text"
              required
              value={user}
              onChange={e => setUser(e.target.value)}
              placeholder="admin"
              style={loginStyles.input}
            />
          </div>
          <div style={loginStyles.field}>
            <label style={loginStyles.label}>🔒 Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPass ? 'text' : 'password'}
                required
                value={pass}
                onChange={e => setPass(e.target.value)}
                placeholder="••••••••"
                style={{ ...loginStyles.input, paddingRight: '72px' }}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                style={loginStyles.eyeBtn}
              >{showPass ? 'Hide' : 'Show'}</button>
            </div>
          </div>
          <button type="submit" disabled={loading} style={loginStyles.btn}>
            {loading ? 'Authenticating...' : '🔓 Access Admin Panel'}
          </button>
        </form>
      </div>
      <style>{`
        @keyframes glowPulse2 {
          0%,100% { opacity:0.3; transform:scale(1); }
          50% { opacity:0.6; transform:scale(1.08); }
        }
        @keyframes cardSlideIn {
          from { opacity:0; transform:translateY(28px); }
          to { opacity:1; transform:translateY(0); }
        }
        input:focus { outline:none; border-color:#7c3aed !important; box-shadow:0 0 0 3px rgba(124,58,237,0.15) !important; }
      `}</style>
    </div>
  );
};

const loginStyles = {
  page: {
    minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'radial-gradient(ellipse at 30% 20%, #1a0a2e 0%, #0d0514 60%, #0a0a1a 100%)',
    padding: '20px', position: 'relative', overflow: 'hidden', fontFamily: "'Inter', sans-serif",
  },
  glowBg: {
    position: 'fixed', top: '20%', left: '50%', transform: 'translateX(-50%)',
    width: '600px', height: '600px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(124,58,237,0.18) 0%, transparent 70%)',
    animation: 'glowPulse2 4s ease-in-out infinite', pointerEvents: 'none',
  },
  card: {
    position: 'relative', zIndex: 1,
    background: 'rgba(20, 10, 40, 0.88)',
    border: '1px solid rgba(167,139,250,0.2)',
    borderRadius: '24px', padding: '40px 36px', maxWidth: '420px', width: '100%',
    backdropFilter: 'blur(20px)',
    boxShadow: '0 0 60px rgba(124,58,237,0.15), 0 24px 80px rgba(0,0,0,0.7)',
    animation: 'cardSlideIn 0.5s ease forwards',
  },
  iconWrap: { marginBottom: '14px' },
  badge: {
    display: 'inline-block', fontSize: '10px', fontWeight: '700', letterSpacing: '1px',
    textTransform: 'uppercase', color: '#c4b5fd', border: '1px solid rgba(196,181,253,0.3)',
    padding: '4px 12px', borderRadius: '100px', marginBottom: '10px', background: 'rgba(124,58,237,0.12)',
  },
  title: { margin: '0 0 6px', fontSize: '28px', fontWeight: '800', color: '#fff', letterSpacing: '-0.5px' },
  subtitle: { margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.4)', lineHeight: '1.5' },
  error: {
    background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)',
    color: '#fca5a5', padding: '11px 14px', borderRadius: '10px', fontSize: '13px', marginBottom: '16px',
  },
  field: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '12px', fontWeight: '700', color: '#c4b5fd', letterSpacing: '0.3px' },
  input: {
    padding: '13px 16px', background: 'rgba(255,255,255,0.05)', border: '1.5px solid rgba(167,139,250,0.2)',
    borderRadius: '10px', fontSize: '14px', color: '#e2e8f0', width: '100%', boxSizing: 'border-box',
    transition: 'all 0.2s ease',
  },
  eyeBtn: {
    position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
    background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(167,139,250,0.3)',
    color: '#c4b5fd', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '700', cursor: 'pointer',
  },
  btn: {
    padding: '15px', background: 'linear-gradient(135deg, #4c1d95 0%, #7c3aed 50%, #a78bfa 100%)',
    color: '#fff', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: '800',
    cursor: 'pointer', boxShadow: '0 4px 20px rgba(124,58,237,0.4)', marginTop: '4px', transition: 'all 0.2s',
  },
};

// ─── Dashboard Tab ───────────────────────────────────────────────
const DashboardTab = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/analytics/summary')
      .then(res => { if (res.data.status === 'SUCCESS') setMetrics(res.data.data); })
      .catch(() => setError('Failed to load analytics.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={tabStyles.center}><div style={tabStyles.spinner} /><p style={{ color: 'rgba(255,255,255,0.5)', marginTop: '16px' }}>Loading Real-Time Analytics...</p></div>;
  if (error) return <div style={tabStyles.errorMsg}>{error}</div>;

  const kpis = [
    { icon: '👨‍🌾', label: 'Total Farmers', value: metrics.total_farmers, color: '#4ade80', glow: 'rgba(74,222,128,0.3)' },
    { icon: '📑', label: 'Total Bookings', value: metrics.bookings.total, color: '#60a5fa', glow: 'rgba(96,165,250,0.3)' },
    { icon: '🚚', label: 'Handed Over', value: metrics.bookings.collected, color: '#fbbf24', glow: 'rgba(251,191,36,0.3)' },
    { icon: '⏳', label: 'Pending Pickup', value: metrics.bookings.pending, color: '#f87171', glow: 'rgba(248,113,113,0.3)' },
  ];

  const stocks = [
    { icon: '🌾', name: 'Urea (45kg)', avail: metrics.inventory.urea, booked: metrics.bookings.urea_booked, color: '#4ade80' },
    { icon: '🌱', name: 'DAP (50kg)', avail: metrics.inventory.dap, booked: metrics.bookings.dap_booked, color: '#60a5fa' },
    { icon: '🌿', name: 'NPK (50kg)', avail: metrics.inventory.npk, booked: metrics.bookings.npk_booked, color: '#a78bfa' },
  ];

  return (
    <div style={tabStyles.container}>
      <div style={tabStyles.sectionHead}>
        <h2 style={tabStyles.sectionTitle}>📈 District Dashboard</h2>
        <p style={tabStyles.sectionSub}>Live monitoring of warehouse inventory and distribution metrics.</p>
      </div>

      {/* KPI Cards */}
      <div style={tabStyles.kpiGrid}>
        {kpis.map((k, i) => (
          <div key={i} style={{ ...tabStyles.kpiCard, boxShadow: `0 0 24px ${k.glow}`, borderColor: k.glow }}>
            <div style={{ ...tabStyles.kpiIcon, background: k.glow }}>{k.icon}</div>
            <p style={{ ...tabStyles.kpiValue, color: k.color }}>{k.value}</p>
            <p style={tabStyles.kpiLabel}>{k.label}</p>
          </div>
        ))}
      </div>

      {/* Stock Cards */}
      <h3 style={tabStyles.subHead}>📦 Real-time Warehouse Inventory</h3>
      <div style={tabStyles.stockGrid}>
        {stocks.map((s, i) => {
          const total = s.avail + s.booked;
          const pct = total > 0 ? Math.round((s.avail / total) * 100) : 100;
          return (
            <div key={i} style={tabStyles.stockCard}>
              <div style={tabStyles.stockTop}>
                <span style={{ fontSize: '24px' }}>{s.icon}</span>
                <div>
                  <p style={tabStyles.stockName}>{s.name}</p>
                  <p style={{ ...tabStyles.stockAvail, color: s.color }}>{s.avail} Bags Available</p>
                </div>
              </div>
              <div style={tabStyles.progressBg}>
                <div style={{ ...tabStyles.progressFill, width: `${pct}%`, background: s.color }} />
              </div>
              <div style={tabStyles.stockMeta}>
                <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>Booked: {s.booked}</span>
                <span style={{ color: s.color, fontSize: '12px', fontWeight: '700' }}>{pct}% available</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Godown Table */}
      <h3 style={tabStyles.subHead}>🏬 Distribution Center Wise Stock</h3>
      <div style={tabStyles.tableWrap}>
        <table style={tabStyles.table}>
          <thead>
            <tr>
              {['Godown Name', 'Location', 'Urea', 'DAP', 'NPK'].map(h => (
                <th key={h} style={tabStyles.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {metrics.godowns.map((g) => (
              <tr key={g.id} style={tabStyles.tr}>
                <td style={tabStyles.td}><strong style={{ color: '#fff' }}>{g.name}</strong></td>
                <td style={tabStyles.td}>{g.location}</td>
                <td style={{ ...tabStyles.td, color: '#4ade80', fontWeight: '700' }}>{g.urea_stock}</td>
                <td style={{ ...tabStyles.td, color: '#60a5fa', fontWeight: '700' }}>{g.dap_stock}</td>
                <td style={{ ...tabStyles.td, color: '#a78bfa', fontWeight: '700' }}>{g.npk_stock}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ─── Farmer Management Tab ──────────────────────────────────────
const FarmerTab = () => {
  const navigate = useNavigate();
  const [view, setView] = useState('menu'); // menu | login | register
  const [loginData, setLoginData] = useState({ identifier: '', password: '', mode: 'mobile' });
  const [regData, setRegData] = useState({ name: '', mobile: '', password: '', aadhaar_number: '', village: '', district: '', state: '', land_area_acres: '', crop_type: 'Paddy' });
  const [loginLoading, setLoginLoading] = useState(false);
  const [regLoading, setRegLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [regError, setRegError] = useState('');
  const [showPass, setShowPass] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true); setLoginError('');
    try {
      const res = await api.post('/auth/farmer/login', { identifier: loginData.identifier.trim(), mobile: loginData.identifier.trim(), password: loginData.password });
      if (res.data.status === 'SUCCESS') {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('farmer', JSON.stringify(res.data.farmer));
        navigate('/farmer/dashboard');
      }
    } catch (err) { setLoginError(err.response?.data?.message || 'Login failed.'); }
    finally { setLoginLoading(false); }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegLoading(true); setRegError('');
    try {
      const res = await api.post('/auth/farmer/register', regData);
      if (res.data.status === 'SUCCESS') {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('farmer', JSON.stringify(res.data.farmer));
        alert(`🎉 Registration Successful!\nFarmer ID: ${res.data.farmer.farmer_custom_id}`);
        navigate('/farmer/dashboard');
      }
    } catch (err) { setRegError(err.response?.data?.message || 'Registration failed.'); }
    finally { setRegLoading(false); }
  };

  if (view === 'menu') {
    return (
      <div style={tabStyles.container}>
        <div style={tabStyles.sectionHead}>
          <h2 style={tabStyles.sectionTitle}>👨‍🌾 Farmer Management</h2>
          <p style={tabStyles.sectionSub}>Manage farmer accounts, login sessions, and registrations.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', maxWidth: '620px', margin: '0 auto' }}>
          {[
            { icon: '🔑', title: 'Farmer Login', sub: 'Login as a registered farmer to access their dashboard', color: '#4ade80', glow: 'rgba(74,222,128,0.2)', action: () => setView('login') },
            { icon: '📝', title: 'Register New Farmer', sub: 'Self-register a new farmer in the system', color: '#fbbf24', glow: 'rgba(251,191,36,0.2)', action: () => setView('register') },
          ].map((card, i) => (
            <div key={i} onClick={card.action} style={{ ...tabStyles.menuCard, borderColor: card.color + '33', boxShadow: `0 0 20px ${card.glow}` }}>
              <span style={{ fontSize: '40px', display: 'block', marginBottom: '14px' }}>{card.icon}</span>
              <h3 style={{ color: card.color, margin: '0 0 8px', fontSize: '18px', fontWeight: '800' }}>{card.title}</h3>
              <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '13px', margin: 0, lineHeight: '1.5' }}>{card.sub}</p>
              <div style={{ ...tabStyles.cardArrow, color: card.color }}>→</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (view === 'login') {
    return (
      <div style={tabStyles.container}>
        <button onClick={() => setView('menu')} style={tabStyles.backBtn}>← Back</button>
        <div style={{ ...tabStyles.formCard, borderColor: 'rgba(74,222,128,0.2)' }}>
          <h3 style={{ ...tabStyles.formTitle, color: '#4ade80' }}>🔑 Farmer Login</h3>
          {loginError && <div style={tabStyles.errorBox}>{loginError}</div>}
          <div style={tabStyles.tabRow}>
            {['mobile', 'farmer_id', 'aadhaar'].map(m => (
              <button key={m} onClick={() => { setLoginData({ ...loginData, mode: m, identifier: '' }); }} style={{ ...tabStyles.modeBtn, ...(loginData.mode === m ? tabStyles.modeBtnActive : {}) }}>
                {m === 'mobile' ? '📱 Mobile' : m === 'farmer_id' ? '🆔 Farmer ID' : '🪪 Aadhaar'}
              </button>
            ))}
          </div>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={tabStyles.field}>
              <label style={{ ...tabStyles.label, color: '#4ade80' }}>
                {loginData.mode === 'mobile' ? '📱 Mobile Number' : loginData.mode === 'farmer_id' ? '🆔 Farmer ID' : '🪪 Aadhaar'}
              </label>
              <input type="text" required value={loginData.identifier} onChange={e => setLoginData({ ...loginData, identifier: e.target.value })} placeholder={loginData.mode === 'mobile' ? '10-digit mobile' : loginData.mode === 'farmer_id' ? 'FRM-2026-XXXX' : '12-digit Aadhaar'} style={{ ...tabStyles.input, borderColor: 'rgba(74,222,128,0.3)' }} />
            </div>
            <div style={tabStyles.field}>
              <label style={{ ...tabStyles.label, color: '#4ade80' }}>🔒 Password</label>
              <div style={{ position: 'relative' }}>
                <input type={showPass ? 'text' : 'password'} required value={loginData.password} onChange={e => setLoginData({ ...loginData, password: e.target.value })} placeholder="Enter password" style={{ ...tabStyles.input, borderColor: 'rgba(74,222,128,0.3)', paddingRight: '70px' }} />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{ ...tabStyles.eyeBtn, color: '#4ade80', borderColor: 'rgba(74,222,128,0.3)' }}>{showPass ? 'Hide' : 'Show'}</button>
              </div>
            </div>
            <button type="submit" disabled={loginLoading} style={{ ...tabStyles.submitBtn, background: 'linear-gradient(135deg, #065f46, #059669)' }}>
              {loginLoading ? 'Logging in...' : 'Login to Farmer Portal 🚀'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (view === 'register') {
    const hasMin = regData.password.length >= 6;
    const hasLetter = /[A-Za-z]/.test(regData.password);
    const hasNum = /\d/.test(regData.password);
    const strong = hasMin && hasLetter && hasNum;
    return (
      <div style={tabStyles.container}>
        <button onClick={() => setView('menu')} style={tabStyles.backBtn}>← Back</button>
        <div style={{ ...tabStyles.formCard, borderColor: 'rgba(251,191,36,0.2)', maxWidth: '560px' }}>
          <h3 style={{ ...tabStyles.formTitle, color: '#fbbf24' }}>📝 Register New Farmer</h3>
          {regError && <div style={tabStyles.errorBox}>{regError}</div>}
          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={tabStyles.field}>
              <label style={{ ...tabStyles.label, color: '#fbbf24' }}>Full Name *</label>
              <input type="text" required value={regData.name} onChange={e => setRegData({ ...regData, name: e.target.value })} placeholder="e.g. Ramesh Kumar" style={{ ...tabStyles.input, borderColor: 'rgba(251,191,36,0.3)' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div style={tabStyles.field}>
                <label style={{ ...tabStyles.label, color: '#fbbf24' }}>Mobile *</label>
                <input type="tel" required maxLength={10} value={regData.mobile} onChange={e => setRegData({ ...regData, mobile: e.target.value })} placeholder="10-digit" style={{ ...tabStyles.input, borderColor: 'rgba(251,191,36,0.3)' }} />
              </div>
              <div style={tabStyles.field}>
                <label style={{ ...tabStyles.label, color: '#fbbf24' }}>Password *</label>
                <input type="password" required value={regData.password} onChange={e => setRegData({ ...regData, password: e.target.value })} placeholder="Min 6 chars" style={{ ...tabStyles.input, borderColor: 'rgba(251,191,36,0.3)' }} />
              </div>
            </div>
            {regData.password.length > 0 && (
              <div style={{ background: 'rgba(251,191,36,0.05)', border: '1px solid rgba(251,191,36,0.15)', borderRadius: '8px', padding: '10px 12px' }}>
                <span style={{ fontSize: '12px', fontWeight: '700', color: strong ? '#4ade80' : '#f87171' }}>{strong ? '🔒 Strong Password' : '⚠️ Weak Password'}</span>
                <div style={{ display: 'flex', gap: '12px', marginTop: '6px', fontSize: '11px' }}>
                  <span style={{ color: hasMin ? '#4ade80' : '#6b7280' }}>{hasMin ? '✔' : '✖'} 6+ chars</span>
                  <span style={{ color: hasLetter ? '#4ade80' : '#6b7280' }}>{hasLetter ? '✔' : '✖'} Letter</span>
                  <span style={{ color: hasNum ? '#4ade80' : '#6b7280' }}>{hasNum ? '✔' : '✖'} Number</span>
                </div>
              </div>
            )}
            <div style={tabStyles.field}>
              <label style={{ ...tabStyles.label, color: '#fbbf24' }}>Aadhaar Number *</label>
              <input type="text" required maxLength={12} value={regData.aadhaar_number} onChange={e => setRegData({ ...regData, aadhaar_number: e.target.value })} placeholder="12-digit Aadhaar" style={{ ...tabStyles.input, borderColor: 'rgba(251,191,36,0.3)' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div style={tabStyles.field}>
                <label style={{ ...tabStyles.label, color: '#fbbf24' }}>Village *</label>
                <input type="text" required value={regData.village} onChange={e => setRegData({ ...regData, village: e.target.value })} placeholder="Village name" style={{ ...tabStyles.input, borderColor: 'rgba(251,191,36,0.3)' }} />
              </div>
              <div style={tabStyles.field}>
                <label style={{ ...tabStyles.label, color: '#fbbf24' }}>District</label>
                <input type="text" value={regData.district} onChange={e => setRegData({ ...regData, district: e.target.value })} placeholder="District" style={{ ...tabStyles.input, borderColor: 'rgba(251,191,36,0.3)' }} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div style={tabStyles.field}>
                <label style={{ ...tabStyles.label, color: '#fbbf24' }}>Land Area (Acres) *</label>
                <input type="number" step="0.1" required value={regData.land_area_acres} onChange={e => setRegData({ ...regData, land_area_acres: e.target.value })} placeholder="e.g. 3.5" style={{ ...tabStyles.input, borderColor: 'rgba(251,191,36,0.3)' }} />
              </div>
              <div style={tabStyles.field}>
                <label style={{ ...tabStyles.label, color: '#fbbf24' }}>Primary Crop *</label>
                <select value={regData.crop_type} onChange={e => setRegData({ ...regData, crop_type: e.target.value })} style={{ ...tabStyles.input, borderColor: 'rgba(251,191,36,0.3)' }}>
                  {['Paddy', 'Wheat', 'Sugarcane', 'Mustard', 'Potato'].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <button type="submit" disabled={regLoading} style={{ ...tabStyles.submitBtn, background: 'linear-gradient(135deg, #78350f, #d97706)' }}>
              {regLoading ? 'Registering...' : 'Complete Registration 🚀'}
            </button>
          </form>
        </div>
      </div>
    );
  }
};

const DEFAULT_OFFICERS = [
  { id: 1, name: 'Ram Singh (District Officer)', username: 'officer', password: 'officer123', badge: 'OFF-001', createdAt: '13/08/2026' }
];

const getStoredOfficers = () => {
  try {
    const raw = localStorage.getItem('officerAccounts');
    if (!raw) {
      // Sirf pehli baar — seed karo default officer se
      localStorage.setItem('officerAccounts', JSON.stringify(DEFAULT_OFFICERS));
      return DEFAULT_OFFICERS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      // Corrupt data — reset karo
      localStorage.setItem('officerAccounts', JSON.stringify(DEFAULT_OFFICERS));
      return DEFAULT_OFFICERS;
    }
    // ✅ FIX: Empty array allowed — admin ne delete kiya hai deliberately
    return parsed;
  } catch (e) {
    return DEFAULT_OFFICERS;
  }
};

// ─── Officer Management Tab ──────────────────────────────────────
const OfficerTab = () => {
  const [officers, setOfficers] = useState(getStoredOfficers);
  const [form, setForm] = useState({ username: '', password: '', name: '', badge: '' });
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const saveOfficers = (list) => {
    setOfficers(list);
    localStorage.setItem('officerAccounts', JSON.stringify(list));
  };

  const handleCreate = (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (officers.find(o => o.username === form.username)) {
      setError('Username already exists.');
      return;
    }
    const newOfficer = { ...form, id: Date.now(), createdAt: new Date().toLocaleDateString() };
    saveOfficers([...officers, newOfficer]);
    setSuccess(`✅ Officer "${form.name}" created successfully!`);
    setForm({ username: '', password: '', name: '', badge: '' });
    setShowForm(false);
  };

  const deleteOfficer = (id) => {
    if (window.confirm('Remove this officer account?')) {
      saveOfficers(officers.filter(o => o.id !== id));
    }
  };

  return (
    <div style={tabStyles.container}>
      <div style={tabStyles.sectionHead}>
        <h2 style={tabStyles.sectionTitle}>👮 Officer Management</h2>
        <p style={tabStyles.sectionSub}>Create and manage officer accounts. Officers can only login with admin-provided credentials.</p>
      </div>

      {success && <div style={{ ...tabStyles.successBox, marginBottom: '16px' }}>{success}</div>}
      {error && <div style={{ ...tabStyles.errorBox, marginBottom: '16px' }}>{error}</div>}

      {/* Create Officer Button */}
      {!showForm && (
        <button onClick={() => setShowForm(true)} style={{ ...tabStyles.submitBtn, background: 'linear-gradient(135deg, #1e3a5f, #3b82f6)', maxWidth: '260px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
          ➕ Create New Officer
        </button>
      )}

      {/* Create Form */}
      {showForm && (
        <div style={{ ...tabStyles.formCard, borderColor: 'rgba(96,165,250,0.3)', maxWidth: '480px', marginBottom: '28px' }}>
          <h3 style={{ ...tabStyles.formTitle, color: '#60a5fa' }}>➕ New Officer Account</h3>
          <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div style={tabStyles.field}>
                <label style={{ ...tabStyles.label, color: '#60a5fa' }}>Officer Name *</label>
                <input type="text" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Ram Singh" style={{ ...tabStyles.input, borderColor: 'rgba(96,165,250,0.3)' }} />
              </div>
              <div style={tabStyles.field}>
                <label style={{ ...tabStyles.label, color: '#60a5fa' }}>Badge / ID</label>
                <input type="text" value={form.badge} onChange={e => setForm({ ...form, badge: e.target.value })} placeholder="e.g. OFF-001" style={{ ...tabStyles.input, borderColor: 'rgba(96,165,250,0.3)' }} />
              </div>
            </div>
            <div style={tabStyles.field}>
              <label style={{ ...tabStyles.label, color: '#60a5fa' }}>Username *</label>
              <input type="text" required value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} placeholder="e.g. officer_ram" style={{ ...tabStyles.input, borderColor: 'rgba(96,165,250,0.3)' }} />
            </div>
            <div style={tabStyles.field}>
              <label style={{ ...tabStyles.label, color: '#60a5fa' }}>Password (Admin Sets) *</label>
              <input type="text" required value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Set a secure password" style={{ ...tabStyles.input, borderColor: 'rgba(96,165,250,0.3)' }} />
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button type="submit" style={{ ...tabStyles.submitBtn, background: 'linear-gradient(135deg, #1e3a5f, #3b82f6)', flex: 1 }}>Create Officer</button>
              <button type="button" onClick={() => { setShowForm(false); setError(''); }} style={{ ...tabStyles.submitBtn, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', flex: 0.4 }}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Officer List */}
      {officers.length === 0 ? (
        <div style={tabStyles.emptyState}>
          <span style={{ fontSize: '40px', display: 'block', marginBottom: '12px' }}>👮</span>
          <p style={{ color: 'rgba(255,255,255,0.4)', margin: 0 }}>No officers created yet. Create one above.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {officers.map(o => (
            <div key={o.id} style={tabStyles.officerRow}>
              <div style={tabStyles.officerAvatar}>👮</div>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontWeight: '700', color: '#fff', fontSize: '15px' }}>{o.name}</p>
                <p style={{ margin: '2px 0 0', color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>
                  @{o.username} · Badge: {o.badge || 'N/A'} · Created: {o.createdAt}
                </p>
              </div>
              <div style={tabStyles.passTag}>
                🔑 {o.password}
              </div>
              <button onClick={() => deleteOfficer(o.id)} style={tabStyles.deleteBtn}>🗑️</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Shared Tab Styles ───────────────────────────────────────────
const tabStyles = {
  container: { padding: '8px 0' },
  center: { textAlign: 'center', padding: '60px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  spinner: { width: '36px', height: '36px', border: '3px solid rgba(255,255,255,0.1)', borderTop: '3px solid #a78bfa', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
  errorMsg: { color: '#f87171', textAlign: 'center', padding: '20px' },
  sectionHead: { marginBottom: '28px' },
  sectionTitle: { margin: '0 0 6px', fontSize: '22px', fontWeight: '800', color: '#fff' },
  sectionSub: { margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.4)' },
  kpiGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '32px' },
  kpiCard: { background: 'rgba(255,255,255,0.04)', border: '1px solid', borderRadius: '16px', padding: '20px', textAlign: 'center', backdropFilter: 'blur(8px)', transition: 'all 0.2s' },
  kpiIcon: { fontSize: '28px', width: '52px', height: '52px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' },
  kpiValue: { fontSize: '32px', fontWeight: '900', margin: '0 0 4px', letterSpacing: '-1px' },
  kpiLabel: { fontSize: '12px', color: 'rgba(255,255,255,0.45)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' },
  subHead: { margin: '0 0 16px', fontSize: '16px', fontWeight: '700', color: 'rgba(255,255,255,0.7)', borderLeft: '3px solid rgba(167,139,250,0.6)', paddingLeft: '10px' },
  stockGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '32px' },
  stockCard: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', padding: '18px' },
  stockTop: { display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '14px' },
  stockName: { margin: 0, fontWeight: '700', color: '#fff', fontSize: '14px' },
  stockAvail: { margin: '2px 0 0', fontSize: '13px', fontWeight: '700' },
  progressBg: { height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '100px', marginBottom: '8px', overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: '100px', transition: 'width 0.5s ease' },
  stockMeta: { display: 'flex', justifyContent: 'space-between' },
  tableWrap: { overflowX: 'auto', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)' },
  table: { width: '100%', borderCollapse: 'collapse', background: 'rgba(255,255,255,0.02)' },
  th: { background: 'rgba(167,139,250,0.15)', color: 'rgba(255,255,255,0.7)', padding: '13px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid rgba(255,255,255,0.06)' },
  tr: { borderBottom: '1px solid rgba(255,255,255,0.04)' },
  td: { padding: '13px 16px', fontSize: '14px', color: 'rgba(255,255,255,0.65)' },
  menuCard: { background: 'rgba(255,255,255,0.04)', border: '1px solid', borderRadius: '18px', padding: '28px 24px', cursor: 'pointer', transition: 'all 0.25s ease', position: 'relative', overflow: 'hidden' },
  cardArrow: { fontSize: '22px', fontWeight: '900', marginTop: '16px', transition: 'transform 0.2s' },
  formCard: { background: 'rgba(255,255,255,0.04)', border: '1px solid', borderRadius: '18px', padding: '28px 24px', maxWidth: '480px' },
  formTitle: { margin: '0 0 20px', fontSize: '18px', fontWeight: '800' },
  field: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '12px', fontWeight: '700', letterSpacing: '0.3px' },
  input: { padding: '12px 14px', background: 'rgba(255,255,255,0.05)', border: '1.5px solid', borderRadius: '10px', fontSize: '14px', color: '#e2e8f0', width: '100%', boxSizing: 'border-box', transition: 'all 0.2s' },
  eyeBtn: { position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.06)', border: '1px solid', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '700', cursor: 'pointer' },
  submitBtn: { padding: '13px 20px', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', width: '100%', transition: 'all 0.2s', letterSpacing: '0.2px' },
  backBtn: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', marginBottom: '20px', fontSize: '13px' },
  errorBox: { background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', padding: '11px 14px', borderRadius: '10px', fontSize: '13px' },
  successBox: { background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.3)', color: '#86efac', padding: '11px 14px', borderRadius: '10px', fontSize: '13px' },
  tabRow: { display: 'flex', gap: '6px', marginBottom: '18px', background: 'rgba(255,255,255,0.04)', padding: '4px', borderRadius: '10px' },
  modeBtn: { flex: 1, padding: '8px 4px', border: 'none', borderRadius: '7px', fontSize: '11px', fontWeight: '600', color: 'rgba(255,255,255,0.45)', background: 'transparent', cursor: 'pointer', transition: 'all 0.2s' },
  modeBtnActive: { background: 'rgba(74,222,128,0.15)', color: '#4ade80', fontWeight: '700' },
  officerRow: { display: 'flex', alignItems: 'center', gap: '14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '14px 18px' },
  officerAvatar: { fontSize: '24px', width: '44px', height: '44px', background: 'rgba(96,165,250,0.15)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  passTag: { fontSize: '12px', fontWeight: '700', color: '#60a5fa', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(96,165,250,0.2)', padding: '5px 12px', borderRadius: '8px', letterSpacing: '0.3px' },
  deleteBtn: { background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', padding: '6px 10px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' },
  emptyState: { textAlign: 'center', padding: '50px 20px', background: 'rgba(255,255,255,0.02)', borderRadius: '14px', border: '1px dashed rgba(255,255,255,0.08)' },
};

// ─── Main Admin Panel ────────────────────────────────────────────
const AdminPanel = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem('adminLoggedIn'));
  const [activeTab, setActiveTab] = useState('dashboard');
  const [hoveredTab, setHoveredTab] = useState(null);

  const handleLogin = () => {
    localStorage.setItem('adminLoggedIn', 'true');
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminLoggedIn');
    setIsLoggedIn(false);
  };

  if (!isLoggedIn) return <AdminLogin onLogin={handleLogin} />;

  const tabs = [
    { id: 'dashboard', icon: '📊', label: 'Dashboard', color: '#a78bfa' },
    { id: 'farmers', icon: '👨‍🌾', label: 'Farmer Mgmt', color: '#4ade80' },
    { id: 'officers', icon: '👮', label: 'Officer Mgmt', color: '#60a5fa' },
  ];

  return (
    <div style={panelStyles.page}>
      <div style={panelStyles.glowBg1} />
      <div style={panelStyles.glowBg2} />

      <div style={panelStyles.shell}>
        {/* Sidebar */}
        <aside style={panelStyles.sidebar}>
          <div style={panelStyles.sidebarHeader}>
            <div style={panelStyles.sideLogoWrap}>
              <span style={{ fontSize: '28px' }}>🛡️</span>
            </div>
            <div>
              <p style={panelStyles.sideTitle}>Admin Panel</p>
              <p style={panelStyles.sideVersion}>Smart Fertilizer System</p>
            </div>
          </div>

          <div style={panelStyles.adminBadge}>
            <span style={{ fontSize: '16px' }}>👤</span>
            <div>
              <p style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: '#fff' }}>Administrator</p>
              <p style={{ margin: 0, fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>Full Access</p>
            </div>
          </div>

          <nav style={panelStyles.nav}>
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                onMouseEnter={() => setHoveredTab(tab.id)}
                onMouseLeave={() => setHoveredTab(null)}
                style={{
                  ...panelStyles.navItem,
                  ...(activeTab === tab.id ? { background: `rgba(${tab.id === 'dashboard' ? '167,139,250' : tab.id === 'farmers' ? '74,222,128' : '96,165,250'},0.15)`, borderColor: `${tab.color}44`, color: tab.color } : {}),
                  ...(hoveredTab === tab.id && activeTab !== tab.id ? { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.8)' } : {}),
                }}
              >
                <span style={{ fontSize: '18px' }}>{tab.icon}</span>
                {tab.label}
                {activeTab === tab.id && <div style={{ ...panelStyles.navActiveBar, background: tab.color }} />}
              </button>
            ))}
          </nav>

          <div style={panelStyles.sideActions}>
            <button onClick={() => navigate('/')} style={panelStyles.homeBtn}>🏠 Home</button>
            <button onClick={handleLogout} style={panelStyles.logoutBtn}>🚪 Logout</button>
          </div>
        </aside>

        {/* Main Content */}
        <main style={panelStyles.main}>
          <div style={panelStyles.topbar}>
            <div>
              <h1 style={panelStyles.pageTitle}>
                {tabs.find(t => t.id === activeTab)?.icon} {tabs.find(t => t.id === activeTab)?.label}
              </h1>
              <p style={panelStyles.pageSub}>Smart Fertilizer Distribution System · Admin Control Panel</p>
            </div>
            <div style={panelStyles.liveBadge}>
              <span style={panelStyles.liveDot} />
              Live System
            </div>
          </div>

          <div style={panelStyles.content}>
            {activeTab === 'dashboard' && <DashboardTab />}
            {activeTab === 'farmers' && <FarmerTab />}
            {activeTab === 'officers' && <OfficerTab />}
          </div>
        </main>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes glowBg1 { 0%,100%{opacity:0.3;} 50%{opacity:0.5;} }
        @keyframes glowBg2 { 0%,100%{opacity:0.2;} 50%{opacity:0.4;} }
        input:focus,select:focus { outline:none; border-color:rgba(167,139,250,0.5) !important; box-shadow:0 0 0 3px rgba(167,139,250,0.1) !important; }
      `}</style>
    </div>
  );
};

const panelStyles = {
  page: {
    minHeight: '100vh', display: 'flex', alignItems: 'stretch', justifyContent: 'center',
    background: 'radial-gradient(ellipse at 0% 0%, #1a0a2e 0%, #050a14 50%, #0a0a05 100%)',
    fontFamily: "'Inter', sans-serif", position: 'relative', overflow: 'hidden',
  },
  glowBg1: { position: 'fixed', top: '-100px', left: '-100px', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)', animation: 'glowBg1 6s ease-in-out infinite', pointerEvents: 'none' },
  glowBg2: { position: 'fixed', bottom: '-100px', right: '-100px', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)', animation: 'glowBg2 8s ease-in-out infinite', pointerEvents: 'none' },
  shell: { display: 'flex', width: '100%', minHeight: '100vh', position: 'relative', zIndex: 1 },
  sidebar: { width: '240px', flexShrink: 0, background: 'rgba(255,255,255,0.03)', borderRight: '1px solid rgba(255,255,255,0.06)', padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: '0', backdropFilter: 'blur(20px)' },
  sidebarHeader: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.06)' },
  sideLogoWrap: { width: '44px', height: '44px', borderRadius: '12px', background: 'linear-gradient(135deg, #4c1d95, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 0 16px rgba(124,58,237,0.4)' },
  sideTitle: { margin: '0', fontSize: '14px', fontWeight: '800', color: '#fff' },
  sideVersion: { margin: '2px 0 0', fontSize: '10px', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.3px' },
  adminBadge: { display: 'flex', gap: '10px', alignItems: 'center', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '12px', marginBottom: '20px' },
  nav: { display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 },
  navItem: { display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px', border: '1px solid transparent', borderRadius: '10px', color: 'rgba(255,255,255,0.4)', fontSize: '13px', fontWeight: '600', cursor: 'pointer', background: 'transparent', width: '100%', textAlign: 'left', transition: 'all 0.2s ease', position: 'relative', letterSpacing: '0.2px' },
  navActiveBar: { position: 'absolute', right: '-1px', top: '25%', height: '50%', width: '3px', borderRadius: '3px' },
  sideActions: { borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px', marginTop: 'auto' },
  homeBtn: { padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', color: 'rgba(255,255,255,0.5)', fontSize: '12px', cursor: 'pointer', fontWeight: '600' },
  logoutBtn: { padding: '10px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px', color: '#f87171', fontSize: '12px', cursor: 'pointer', fontWeight: '600' },
  main: { flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 },
  topbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 28px', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)' },
  pageTitle: { margin: '0 0 4px', fontSize: '20px', fontWeight: '800', color: '#fff' },
  pageSub: { margin: 0, fontSize: '12px', color: 'rgba(255,255,255,0.3)' },
  liveBadge: { display: 'flex', alignItems: 'center', gap: '7px', background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)', borderRadius: '100px', padding: '6px 14px', fontSize: '12px', fontWeight: '700', color: '#4ade80' },
  liveDot: { width: '7px', height: '7px', borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 8px #4ade80', animation: 'glowBg1 1.5s ease-in-out infinite' },
  content: { flex: 1, padding: '28px', overflowY: 'auto' },
};

export default AdminPanel;
