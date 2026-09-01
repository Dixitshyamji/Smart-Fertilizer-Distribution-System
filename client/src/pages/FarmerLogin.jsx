import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

const FarmerLogin = () => {
  const navigate = useNavigate();
  const [loginMode, setLoginMode] = useState('mobile'); // 'mobile' | 'farmer_id' | 'aadhaar'
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/farmer/login', {
        identifier: identifier.trim(),
        mobile: identifier.trim(),
        password
      });
      if (response.data.status === 'SUCCESS') {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('farmer', JSON.stringify(response.data.farmer));
        navigate('/farmer/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please verify your details and password.');
    } finally {
      setLoading(false);
    }
  };

  const autofillDemoLargeFarmer = () => {
    setLoginMode('mobile');
    setIdentifier('9876543210');
    setPassword('Password123');
    setError('');
  };

  return (
    <div style={styles.container}>
      <div className="animated-card glow-card" style={styles.card}>
        
        {/* Header */}
        <div style={styles.cardHeader}>
          <div style={{ textAlign: 'left' }}>
            <span style={styles.topBadge} className="float-element">🌾 Direct Farmer Portal</span>
            <h2 style={styles.title}>Farmer Login</h2>
          </div>
          <Link to="/farmer/dashboard" style={styles.homeBadge}>
            🏠 Main Page
          </Link>
        </div>

        <p style={styles.subtitle}>
          Select your preferred login method below to access your allocated fertilizer quota.
        </p>

        {/* Demo Fast Login Helper */}
        <div style={styles.demoBox}>
          <span style={styles.demoTitle}>💡 Quick Demo Account (50 Bags Urea/DAP Quota):</span>
          <button type="button" onClick={autofillDemoLargeFarmer} style={styles.demoBtn}>
            ⚡ Auto-Fill Large Farmer (Mobile: 9876543210)
          </button>
        </div>

        {/* 3 Tab Method Selector */}
        <div style={styles.tabContainer}>
          <button
            type="button"
            style={{ ...styles.tab, ...(loginMode === 'mobile' ? styles.activeTab : {}) }}
            onClick={() => { setLoginMode('mobile'); setIdentifier(''); }}
          >
            📱 Mobile Number
          </button>
          <button
            type="button"
            style={{ ...styles.tab, ...(loginMode === 'farmer_id' ? styles.activeTab : {}) }}
            onClick={() => { setLoginMode('farmer_id'); setIdentifier(''); }}
          >
            🆔 Farmer ID
          </button>
          <button
            type="button"
            style={{ ...styles.tab, ...(loginMode === 'aadhaar' ? styles.activeTab : {}) }}
            onClick={() => { setLoginMode('aadhaar'); setIdentifier(''); }}
          >
            🪪 Aadhaar Number
          </button>
        </div>

        {error && <div style={styles.errorBanner}>⚠️ {error}</div>}

        {/* Form */}
        <form onSubmit={handleLogin} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>
              {loginMode === 'mobile' && '📱 Enter Registered 10-Digit Mobile Number *'}
              {loginMode === 'farmer_id' && '🆔 Enter Assigned Farmer Custom ID *'}
              {loginMode === 'aadhaar' && '🪪 Enter 12-Digit Aadhaar Number *'}
            </label>
            <input
              type={loginMode === 'mobile' ? 'tel' : 'text'}
              required
              maxLength={loginMode === 'mobile' ? 10 : loginMode === 'aadhaar' ? 12 : 30}
              placeholder={
                loginMode === 'mobile' ? 'e.g. 9876543210' :
                loginMode === 'farmer_id' ? 'e.g. FRM-2026-1001' :
                'e.g. 123456789012'
              }
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>🔒 Account Password *</label>
            <div style={styles.passwordWrapper}>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ ...styles.input, width: '100%', boxSizing: 'border-box' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={styles.eyeBtn}
              >
                {showPassword ? '👁️ Hide' : '👁️ Show'}
              </button>
            </div>
          </div>

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? 'Authenticating Portal...' : 'Login to Farmer Portal 🚀'}
          </button>
        </form>

        <div style={styles.footerRow}>
          <p style={styles.footerText}>
            Don't have an account yet?{' '}
            <Link to="/farmer/register" style={styles.linkText}>
              Register New Farmer 📝
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '85vh',
    padding: '20px'
  },
  card: {
    padding: '32px',
    borderRadius: '16px',
    maxWidth: '460px',
    width: '100%',
    boxSizing: 'border-box',
    boxShadow: '0 20px 40px rgba(0,0,0,0.25)'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '8px'
  },
  topBadge: {
    display: 'inline-block',
    fontSize: '11px',
    fontWeight: 'bold',
    color: '#1b5e20',
    background: '#e8f5e9',
    padding: '4px 10px',
    borderRadius: '12px',
    marginBottom: '4px'
  },
  title: {
    margin: 0,
    fontSize: '24px',
    fontWeight: '800',
    color: '#1b5e20',
    letterSpacing: '-0.5px'
  },
  homeBadge: {
    background: 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%)',
    color: '#ffffff',
    textDecoration: 'none',
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 'bold',
    boxShadow: '0 2px 8px rgba(46,125,50,0.3)'
  },
  subtitle: {
    color: '#444',
    fontSize: '13px',
    marginBottom: '16px',
    lineHeight: '1.5',
    textAlign: 'left'
  },
  demoBox: {
    background: '#fffde7',
    border: '1px solid #ffe082',
    borderRadius: '8px',
    padding: '10px 12px',
    marginBottom: '18px',
    textAlign: 'left'
  },
  demoTitle: {
    display: 'block',
    fontSize: '11px',
    fontWeight: 'bold',
    color: '#f57f17',
    marginBottom: '6px'
  },
  demoBtn: {
    background: '#fbc02d',
    color: '#1b5e20',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: 'bold',
    cursor: 'pointer',
    width: '100%'
  },
  tabContainer: {
    display: 'flex',
    gap: '6px',
    background: '#f1f8e9',
    padding: '4px',
    borderRadius: '10px',
    marginBottom: '20px'
  },
  tab: {
    flex: 1,
    padding: '8px 4px',
    border: 'none',
    borderRadius: '8px',
    fontSize: '11px',
    fontWeight: '600',
    color: '#558b2f',
    background: 'transparent',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  activeTab: {
    background: '#ffffff',
    color: '#1b5e20',
    fontWeight: 'bold',
    boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    textAlign: 'left'
  },
  label: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#2e7d32',
    marginBottom: '6px'
  },
  input: {
    padding: '11px 14px',
    border: '2px solid #a5d6a7',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    color: '#1b5e20',
    fontWeight: '600',
    background: '#ffffff'
  },
  passwordWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  },
  eyeBtn: {
    position: 'absolute',
    right: '10px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: 'bold',
    color: '#2e7d32'
  },
  errorBanner: {
    padding: '10px 14px',
    background: '#ffebee',
    color: '#c62828',
    borderRadius: '8px',
    marginBottom: '16px',
    fontSize: '13px',
    textAlign: 'left',
    fontWeight: 'bold',
    borderLeft: '4px solid #c62828'
  },
  button: {
    padding: '14px',
    background: 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%)',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    cursor: 'pointer',
    fontWeight: 'bold',
    boxShadow: '0 4px 14px rgba(46,125,50,0.4)',
    marginTop: '6px',
    transition: 'transform 0.1s ease'
  },
  footerRow: {
    marginTop: '20px',
    borderTop: '1px solid #e8f5e9',
    paddingTop: '16px'
  },
  footerText: {
    margin: 0,
    fontSize: '13px',
    color: '#555'
  },
  linkText: {
    color: '#1b5e20',
    fontWeight: 'bold',
    textDecoration: 'none'
  }
};

export default FarmerLogin;
// import React, { useState } from 'react';
// // 1. services folder se api helper import karein
// import api from '../services/api';

// const FarmerLogin = () => {
//   const [formData, setFormData] = useState({
//     identifier: '',
//     password: ''
//   });
//   const [loading, setLoading] = useState(false);
//   const [errorMessage, setErrorMessage] = useState('');

//   const handleChange = (e) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value
//     });
//   };

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setErrorMessage('');

//     try {
//       // 2. api.post automatically baseURL (Render backend) par request bhejega
//       const response = await api.post('/auth/farmer/login', {
//         identifier: formData.identifier.trim(),
//         password: formData.password.trim()
//       });

//       if (response.data && response.data.token) {
//         localStorage.setItem('token', response.data.token);
//         localStorage.setItem('farmer', JSON.stringify(response.data.farmer));
//         alert('Farmer Login Successful!');
//         window.location.href = '/farmer-dashboard';
//       }
//     } catch (err) {
//       console.error('Login error:', err);
//       setErrorMessage(
//         err.response?.data?.message || 'Server se connect nahi ho paya. Please check credentials.'
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
//       <h2>Farmer Login</h2>
      
//       {errorMessage && (
//         <div style={{ color: 'red', marginBottom: '10px', fontSize: '14px' }}>
//           {errorMessage}
//         </div>
//       )}

//       <form onSubmit={handleLogin}>
//         <div style={{ marginBottom: '15px' }}>
//           <label style={{ display: 'block', marginBottom: '5px' }}>Farmer ID / Mobile / Unique ID:</label>
//           <input
//             type="text"
//             name="identifier"
//             value={formData.identifier}
//             onChange={handleChange}
//             placeholder="Enter Mobile or ID"
//             required
//             style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
//           />
//         </div>

//         <div style={{ marginBottom: '15px' }}>
//           <label style={{ display: 'block', marginBottom: '5px' }}>Password:</label>
//           <input
//             type="password"
//             name="password"
//             value={formData.password}
//             onChange={handleChange}
//             placeholder="Enter Password"
//             required
//             style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
//           />
//         </div>

//         <button
//           type="submit"
//           disabled={loading}
//           style={{
//             width: '100%',
//             padding: '10px',
//             backgroundColor: '#2e7d32',
//             color: '#fff',
//             border: 'none',
//             borderRadius: '4px',
//             cursor: loading ? 'not-allowed' : 'pointer'
//           }}
//         >
//           {loading ? 'Logging in...' : 'Login'}
//         </button>
//       </form>
//     </div>
//   );
// };

// export default FarmerLogin;