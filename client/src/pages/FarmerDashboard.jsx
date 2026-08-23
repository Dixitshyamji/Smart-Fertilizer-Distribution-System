
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const FarmerDashboard = () => {
  const navigate = useNavigate();
  const [farmer, setFarmer] = useState(null);
  const [quota, setQuota] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await api.get('/auth/me');
        if (userRes.data.status === 'SUCCESS') {
          setFarmer(userRes.data.user);
        }

        const quotaRes = await api.get('/allocation/quota');
        if (quotaRes.data.status === 'SUCCESS') {
          setQuota(quotaRes.data.allocation);
        }
      } catch (error) {
        localStorage.clear();
        navigate('/farmer/login');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/farmer/login');
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '60px', color: '#fff', fontSize: '18px', fontWeight: 'bold' }}>Loading Dashboard & Quotas...</div>;

  return (
    <div style={styles.container}>
      {/* Header Card */}
      <div className="animated-card glow-card" style={styles.headerCard}>
        <div>
          <span style={styles.idBadge}>🌾 OFFICIAL FARMER PORTAL</span>
          <h2 style={styles.welcomeTitle}>Welcome, {farmer?.name} 👋</h2>
          <p style={styles.idText}>
            Farmer Custom ID: <strong>{farmer?.farmer_custom_id}</strong>
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button
            onClick={() => navigate('/farmer/book')}
            style={styles.bookBtn}
          >
            🎟️ Reserve Quota & Download Receipts
          </button>
          <button onClick={handleLogout} style={styles.logoutBtn}>
            Logout
          </button>
        </div>
      </div>

      {/* Info Notice Banner */}
      <div style={styles.noticeBanner} className="float-element">
        💡 <strong>Multiple Partial Bookings Allowed:</strong> You can book part of your quota today (e.g. 10 bags) and book remaining bags later whenever required!
      </div>

      {/* Dashboard Cards */}
      <div style={styles.grid}>
        <div className="animated-card" style={styles.card}>
          <h3 style={styles.cardTitle}>📍 Profile & Land Records</h3>
          <div style={styles.infoRow}><strong>Registered Mobile:</strong> {farmer?.mobile}</div>
          <div style={styles.infoRow}><strong>Location:</strong> {farmer?.village}, {farmer?.district}</div>
          <div style={styles.infoRow}><strong>Total Land Area:</strong> {farmer?.land_area_acres} Acres</div>
          <div style={styles.infoRow}><strong>Primary Crop:</strong> {farmer?.crop_type}</div>
        </div>

        <div className="animated-card" style={styles.card}>
          <h3 style={styles.cardTitle}>🌱 Allocated Fertilizer Quota (Bags)</h3>

          {quota ? (
            <div style={styles.quotaBox}>
              <div style={styles.badge}>
                <span>🌾 Urea (यूरिया)</span>
                <strong>
                  {quota.urea_remaining} / {quota.urea_allocated} Bags Left
                </strong>
              </div>

              <div style={styles.badge}>
                <span>🌱 DAP (डीएपी)</span>
                <strong>
                  {quota.dap_remaining} / {quota.dap_allocated} Bags Left
                </strong>
              </div>

              <div style={styles.badge}>
                <span>🌿 NPK (एनपीके)</span>
                <strong>
                  {quota.npk_remaining} / {quota.npk_allocated} Bags Left
                </strong>
              </div>
            </div>
          ) : (
            <p>No quota calculated yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '30px 20px',
    maxWidth: '1000px',
    margin: '0 auto'
  },

  headerCard: {
    padding: '24px 30px',
    borderRadius: '16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '15px'
  },

  idBadge: {
    fontSize: '11px',
    fontWeight: 'bold',
    color: '#1b5e20',
    background: '#e8f5e9',
    padding: '4px 10px',
    borderRadius: '12px',
    display: 'inline-block',
    marginBottom: '6px'
  },

  welcomeTitle: {
    margin: '0 0 4px 0',
    fontSize: '24px',
    color: 'white',
    fontWeight: 'bold'
  },

  idText: {
    margin: 0,
    color: 'white',
    fontSize: '18px'
  },

  bookBtn: {
    padding: '12px 20px',
    background: 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '14px',
    boxShadow: '0 4px 12px rgba(46,125,50,0.3)'
  },

  logoutBtn: {
    padding: '12px 18px',
    background: '#d32f2f',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '14px'
  },

  noticeBanner: {
    background: '#fffde7',
    border: '1px solid #ffe082',
    color: '#f57f17',
    padding: '12px 18px',
    borderRadius: '10px',
    fontSize: '13px',
    marginBottom: '24px',
    textAlign: 'left'
  },

  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px'
  },

  card: {
    padding: '24px',
    borderRadius: '16px',
    textAlign: 'left'
  },

  cardTitle: {
    margin: '0 0 16px 0',
    fontSize: '18px',
    color: '#f1f908',
    borderBottom: '2px solid #e8f5e9',
    paddingBottom: '8px'
  },

  infoRow: {
    padding: '8px 0',
    borderBottom: '1px solid #f1f8e9',
    fontSize: '18px',
    color: 'white'
  },

  quotaBox: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginTop: '10px'
  },

  badge: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '12px 16px',
    background: 'black',
    borderLeft: '4px solid #2e7d32',
    borderRadius: '8px',
    fontSize: '18px'
  }
};

export default FarmerDashboard;