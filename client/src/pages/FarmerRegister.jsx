// import React, { useState } from 'react';
// import { useNavigate, Link } from 'react-router-dom';
// import api from '../services/api';

// const FarmerRegister = () => {
//   const navigate = useNavigate();
//   const [formData, setFormData] = useState({
//     name: '',
//     mobile: '',
//     password: '',
//     aadhaar_number: '',
//     village: '',
//     district: '',
//     state: '',
//     land_area_acres: '',
//     crop_type: 'Paddy',
//   });

//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');

//   // Password Strength Rules
//   const hasMinLength = formData.password.length >= 6;
//   const hasLetter = /[A-Za-z]/.test(formData.password);
//   const hasNumber = /\d/.test(formData.password);
//   const isStrongPassword = hasMinLength && hasLetter && hasNumber;

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError('');

//     if (!isStrongPassword) {
//       setError('Please provide a strong password (minimum 6 characters with both letters and numbers).');
//       return;
//     }

//     setLoading(true);

//     try {
//       const response = await api.post('/auth/farmer/register', formData);
//       if (response.data.status === 'SUCCESS') {
//         localStorage.setItem('token', response.data.token);
//         localStorage.setItem('farmer', JSON.stringify(response.data.farmer));
//         alert(`🎉 Registration Successful! Your Farmer Custom ID is: ${response.data.farmer.farmer_custom_id}\n\nYou can use this Farmer ID, your Aadhaar, or your Mobile number to log in!`);
//         navigate('/farmer/dashboard');
//       }
//     } catch (err) {
//       setError(err.response?.data?.message || 'Registration failed. Try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div style={styles.container}>
//       <div style={styles.card}>
//         <div style={styles.cardHeader}>
//           <h2>🌾 Farmer Registration Portal</h2>
//           <Link to="/farmer/dashboard" style={styles.homeBadge}>
//             🏠 Main Page
//           </Link>
//         </div>
//         <p style={styles.subtitle}>Register to apply for quota-based fertilizer allocations</p>

//         {error && <div style={styles.errorBanner}>{error}</div>}

//         <form onSubmit={handleSubmit} style={styles.form}>
//           <div style={styles.inputGroup}>
//             <label style={styles.label}>Full Name *</label>
//             <input
//               type="text"
//               name="name"
//               required
//               placeholder="e.g. Ramesh Kumar"
//               value={formData.name}
//               onChange={handleChange}
//               style={styles.input}
//             />
//           </div>

//           <div style={styles.row}>
//             <div style={styles.inputGroup}>
//               <label style={styles.label}>Mobile Number *</label>
//               <input
//                 type="tel"
//                 name="mobile"
//                 required
//                 maxLength="10"
//                 placeholder="10-digit mobile"
//                 value={formData.mobile}
//                 onChange={handleChange}
//                 style={styles.input}
//               />
//             </div>
//             <div style={styles.inputGroup}>
//               <label style={styles.label}>Password * (Strong)</label>
//               <input
//                 type="password"
//                 name="password"
//                 required
//                 placeholder="Min 6 chars (letters & numbers)"
//                 value={formData.password}
//                 onChange={handleChange}
//                 style={styles.input}
//               />
//             </div>
//           </div>

//           {/* Password Strength Indicator */}
//           {formData.password.length > 0 && (
//             <div style={styles.strengthBox}>
//               <span style={{ fontSize: '12px', fontWeight: 'bold', color: isStrongPassword ? '#2e7d32' : '#c62828' }}>
//                 {isStrongPassword ? '🔒 Strong Password' : '⚠️ Weak Password'}
//               </span>
//               <div style={styles.criteriaRow}>
//                 <span style={{ color: hasMinLength ? '#2e7d32' : '#999' }}>
//                   {hasMinLength ? '✔' : '✖'} At least 6 chars
//                 </span>
//                 <span style={{ color: hasLetter ? '#2e7d32' : '#999' }}>
//                   {hasLetter ? '✔' : '✖'} Contains letter
//                 </span>
//                 <span style={{ color: hasNumber ? '#2e7d32' : '#999' }}>
//                   {hasNumber ? '✔' : '✖'} Contains number
//                 </span>
//               </div>
//             </div>
//           )}

//           <div style={styles.inputGroup}>
//             <label style={styles.label}>Aadhaar Number *</label>
//             <input
//               type="text"
//               name="aadhaar_number"
//               required
//               maxLength="12"
//               placeholder="12-digit Aadhaar"
//               value={formData.aadhaar_number}
//               onChange={handleChange}
//               style={styles.input}
//             />
//           </div>

//           <div style={styles.row}>
//             <div style={styles.inputGroup}>
//               <label style={styles.label}>Village *</label>
//               <input
//                 type="text"
//                 name="village"
//                 required
//                 placeholder="e.g. Pipri"
//                 value={formData.village}
//                 onChange={handleChange}
//                 style={styles.input}
//               />
//             </div>
//             <div style={styles.inputGroup}>
//               <label style={styles.label}>District</label>
//               <input type="text" name="district" value={formData.district} onChange={handleChange} style={styles.input} />
//             </div>
//           </div>

//           <div style={styles.row}>
//             <div style={styles.inputGroup}>
//               <label style={styles.label}>Land Area (Acres) *</label>
//               <input
//                 type="number"
//                 step="0.1"
//                 name="land_area_acres"
//                 required
//                 placeholder="e.g. 3.5"
//                 value={formData.land_area_acres}
//                 onChange={handleChange}
//                 style={styles.input}
//               />
//             </div>
//             <div style={styles.inputGroup}>
//               <label style={styles.label}>Primary Crop *</label>
//               <select name="crop_type" value={formData.crop_type} onChange={handleChange} style={styles.input}>
//                 <option value="Paddy">Paddy (धान)</option>
//                 <option value="Wheat">Wheat (गेहूं)</option>
//                 <option value="Sugarcane">Sugarcane (गन्ना)</option>
//                 <option value="Mustard">Mustard (सरसों)</option>
//                 <option value="Potato">Potato (आलू)</option>
//               </select>
//             </div>
//           </div>

//           <button type="submit" style={styles.button} disabled={loading}>
//             {loading ? 'Registering...' : 'Complete Registration 🚀'}
//           </button>
//         </form>

//         <p style={styles.footerText}>
//           Already registered? <Link to="/farmer/login" style={{ color: '#2e7d32', fontWeight: 'bold' }}>Login here</Link>
//         </p>
//       </div>
//     </div>
//   );
// };

// const styles = {
//   container: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '90vh', padding: '20px' },
//   card: { background: '#ffffff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', maxWidth: '550px', width: '100%' },
//   cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' },
//   homeBadge: { background: '#1a9a22', color: '#fff', textDecoration: 'none', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' },
//   subtitle: { color: '#666', fontSize: '14px', marginBottom: '20px', textAlign: 'left' },
//   form: { display: 'flex', flexDirection: 'column', gap: '15px' },
//   row: { display: 'flex', gap: '15px' },
//   inputGroup: { display: 'flex', flexDirection: 'column', flex: 1, textAlign: 'left' },
//   label: { fontSize: '13px', fontWeight: '600', color: '#2e7d32', marginBottom: '4px' },
//   input: { padding: '9px 12px', border: '1px solid #ccc', borderRadius: '6px', fontSize: '14px' },
//   strengthBox: { background: '#f5f5f5', padding: '8px 12px', borderRadius: '6px', textAlign: 'left' },
//   criteriaRow: { display: 'flex', gap: '15px', fontSize: '11px', marginTop: '4px' },
//   errorBanner: { padding: '10px', background: '#ffebee', color: '#c62828', borderRadius: '6px', marginBottom: '15px', fontSize: '14px', textAlign: 'left' },
//   button: { padding: '12px', background: '#2e7d32', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '16px', cursor: 'pointer', fontWeight: 'bold', marginTop: '10px' },
//   footerText: { marginTop: '20px', fontSize: '14px' }
// };

// export default FarmerRegister;


import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

const FarmerRegister = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    password: '',
    aadhaar_number: '',
    village: '',
    district: '',
    state: '',
    land_area_acres: '',
    crop_type: 'Paddy',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Password Strength Rules
  const hasMinLength = formData.password.length >= 6;
  const hasLetter = /[A-Za-z]/.test(formData.password);
  const hasNumber = /\d/.test(formData.password);
  const isStrongPassword = hasMinLength && hasLetter && hasNumber;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isStrongPassword) {
      setError('Please provide a strong password (minimum 6 characters with both letters and numbers).');
      return;
    }

    setLoading(true);

    try {
      // >>> CHANGED: '/auth/farmer/register' → '/api/auth/farmer/register' <
      const response = await api.post('/api/auth/farmer/register', formData);
      if (response.data.status === 'SUCCESS') {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('farmer', JSON.stringify(response.data.farmer));
        alert(`🎉 Registration Successful! Your Farmer Custom ID is: ${response.data.farmer.farmer_custom_id}\n\nYou can use this Farmer ID, your Aadhaar, or your Mobile number to log in!`);
        navigate('/farmer/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <h2>🌾 Farmer Registration Portal</h2>
          <Link to="/farmer/dashboard" style={styles.homeBadge}>
            🏠 Main Page
          </Link>
        </div>
        <p style={styles.subtitle}>Register to apply for quota-based fertilizer allocations</p>

        {error && <div style={styles.errorBanner}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Full Name *</label>
            <input
              type="text"
              name="name"
              required
              placeholder="e.g. Ramesh Kumar"
              value={formData.name}
              onChange={handleChange}
              style={styles.input}
            />
          </div>

          <div style={styles.row}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Mobile Number *</label>
              <input
                type="tel"
                name="mobile"
                required
                maxLength="10"
                placeholder="10-digit mobile"
                value={formData.mobile}
                onChange={handleChange}
                style={styles.input}
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Password * (Strong)</label>
              <input
                type="password"
                name="password"
                required
                placeholder="Min 6 chars (letters & numbers)"
                value={formData.password}
                onChange={handleChange}
                style={styles.input}
              />
            </div>
          </div>

          {/* Password Strength Indicator */}
          {formData.password.length > 0 && (
            <div style={styles.strengthBox}>
              <span style={{ fontSize: '12px', fontWeight: 'bold', color: isStrongPassword ? '#2e7d32' : '#c62828' }}>
                {isStrongPassword ? '🔒 Strong Password' : '⚠️ Weak Password'}
              </span>
              <div style={styles.criteriaRow}>
                <span style={{ color: hasMinLength ? '#2e7d32' : '#999' }}>
                  {hasMinLength ? '✔' : '✖'} At least 6 chars
                </span>
                <span style={{ color: hasLetter ? '#2e7d32' : '#999' }}>
                  {hasLetter ? '✔' : '✖'} Contains letter
                </span>
                <span style={{ color: hasNumber ? '#2e7d32' : '#999' }}>
                  {hasNumber ? '✔' : '✖'} Contains number
                </span>
              </div>
            </div>
          )}

          <div style={styles.inputGroup}>
            <label style={styles.label}>Aadhaar Number *</label>
            <input
              type="text"
              name="aadhaar_number"
              required
              maxLength="12"
              placeholder="12-digit Aadhaar"
              value={formData.aadhaar_number}
              onChange={handleChange}
              style={styles.input}
            />
          </div>

          <div style={styles.row}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Village *</label>
              <input
                type="text"
                name="village"
                required
                placeholder="e.g. Pipri"
                value={formData.village}
                onChange={handleChange}
                style={styles.input}
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>District</label>
              <input type="text" name="district" value={formData.district} onChange={handleChange} style={styles.input} />
            </div>
          </div>

          <div style={styles.row}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Land Area (Acres) *</label>
              <input
                type="number"
                step="0.1"
                name="land_area_acres"
                required
                placeholder="e.g. 3.5"
                value={formData.land_area_acres}
                onChange={handleChange}
                style={styles.input}
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Primary Crop *</label>
              <select name="crop_type" value={formData.crop_type} onChange={handleChange} style={styles.input}>
                <option value="Paddy">Paddy (धान)</option>
                <option value="Wheat">Wheat (गेहूं)</option>
                <option value="Sugarcane">Sugarcane (गन्ना)</option>
                <option value="Mustard">Mustard (सरसों)</option>
                <option value="Potato">Potato (आलू)</option>
              </select>
            </div>
          </div>

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? 'Registering...' : 'Complete Registration 🚀'}
          </button>
        </form>

        <p style={styles.footerText}>
          Already registered? <Link to="/farmer/login" style={{ color: '#2e7d32', fontWeight: 'bold' }}>Login here</Link>
        </p>
      </div>
    </div>
  );
};

const styles = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '90vh', padding: '20px' },
  card: { background: '#ffffff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', maxWidth: '550px', width: '100%' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' },
  homeBadge: { background: '#1a9a22', color: '#fff', textDecoration: 'none', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' },
  subtitle: { color: '#666', fontSize: '14px', marginBottom: '20px', textAlign: 'left' },
  form: { display: 'flex', flexDirection: 'column', gap: '15px' },
  row: { display: 'flex', gap: '15px' },
  inputGroup: { display: 'flex', flexDirection: 'column', flex: 1, textAlign: 'left' },
  label: { fontSize: '13px', fontWeight: '600', color: '#2e7d32', marginBottom: '4px' },
  input: { padding: '9px 12px', border: '1px solid #ccc', borderRadius: '6px', fontSize: '14px' },
  strengthBox: { background: '#f5f5f5', padding: '8px 12px', borderRadius: '6px', textAlign: 'left' },
  criteriaRow: { display: 'flex', gap: '15px', fontSize: '11px', marginTop: '4px' },
  errorBanner: { padding: '10px', background: '#ffebee', color: '#c62828', borderRadius: '6px', marginBottom: '15px', fontSize: '14px', textAlign: 'left' },
  button: { padding: '12px', background: '#2e7d32', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '16px', cursor: 'pointer', fontWeight: 'bold', marginTop: '10px' },
  footerText: { marginTop: '20px', fontSize: '14px' }
};

export default FarmerRegister;