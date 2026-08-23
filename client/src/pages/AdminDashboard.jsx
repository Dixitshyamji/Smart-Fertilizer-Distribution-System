import React, { useEffect, useState } from 'react';
import api from '../services/api';

const AdminDashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      const res = await api.get('/analytics/summary');
      if (res.data.status === 'SUCCESS') {
        setMetrics(res.data.data);
      }
    } catch (err) {
      setError('Failed to load analytics metrics.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={styles.center}>Loading Real-Time Analytics...</div>;
  if (error) return <div style={styles.error}>{error}</div>;

  return (
    <div style={styles.container}>
      <h2>📈 District Fertilizer Stock & Distribution Dashboard</h2>
      <p style={{ color: '#666' }}>Live monitoring of warehouse inventory and distribution metrics.</p>

      {/* Summary KPI Cards */}
      <div style={styles.kpiGrid}>
        <div style={{ ...styles.card, borderTop: '4px solid #1976d2' }}>
          <h3>👨‍🌾 Total Farmers</h3>
          <p style={styles.kpiVal}>{metrics.total_farmers}</p>
        </div>
        <div style={{ ...styles.card, borderTop: '4px solid #2e7d32' }}>
          <h3>📑 Total Bookings</h3>
          <p style={styles.kpiVal}>{metrics.bookings.total}</p>
        </div>
        <div style={{ ...styles.card, borderTop: '4px solid #ed6c02' }}>
          <h3>🚚 Handed Over</h3>
          <p style={styles.kpiVal}>{metrics.bookings.collected}</p>
        </div>
        <div style={{ ...styles.card, borderTop: '4px solid #d32f2f' }}>
          <h3>⏳ Pending Pickup</h3>
          <p style={styles.kpiVal}>{metrics.bookings.pending}</p>
        </div>
      </div>

      {/* Inventory Stock Breakdown */}
      <h3 style={{ marginTop: '30px' }}>📦 Real-time Warehouse Inventory (Bags Available)</h3>
      <div style={styles.stockGrid}>
        <div style={styles.stockCard}>
          <h4>🌾 Urea Available</h4>
          <p style={styles.stockVal}>{metrics.inventory.urea} Bags</p>
          <small>Total Booked: {metrics.bookings.urea_booked} Bags</small>
        </div>
        <div style={styles.stockCard}>
          <h4>🌱 DAP Available</h4>
          <p style={styles.stockVal}>{metrics.inventory.dap} Bags</p>
          <small>Total Booked: {metrics.bookings.dap_booked} Bags</small>
        </div>
        <div style={styles.stockCard}>
          <h4>🌿 NPK Available</h4>
          <p style={styles.stockVal}>{metrics.inventory.npk} Bags</p>
          <small>Total Booked: {metrics.bookings.npk_booked} Bags</small>
        </div>
      </div>

      {/* Godowns Inventory Table */}
      <h3 style={{ marginTop: '30px' }}>🏬 Distribution Center Wise Stock</h3>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Godown Name</th>
            <th style={styles.th}>Location</th>
            <th style={styles.th}>Urea Stock</th>
            <th style={styles.th}>DAP Stock</th>
            <th style={styles.th}>NPK Stock</th>
          </tr>
        </thead>
        <tbody>
          {metrics.godowns.map((g) => (
            <tr key={g.id}>
              <td style={styles.td}><strong>{g.name}</strong></td>
              <td style={styles.td}>{g.location}</td>
              <td style={styles.td}>{g.urea_stock}</td>
              <td style={styles.td}>{g.dap_stock}</td>
              <td style={styles.td}>{g.npk_stock}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const styles = {
  container: { maxWidth: '1000px', margin: '30px auto', padding: '20px' },
  center: { textAlign: 'center', padding: '50px', fontSize: '18px' },
  error: { color: 'red', textAlign: 'center', padding: '20px' },
  kpiGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginTop: '20px' },
  stockGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginTop: '15px' },
  card: { background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
  stockCard: { background: '#f8f9fa', padding: '20px', borderRadius: '8px', border: '1px solid #e0e0e0' },
  kpiVal: { fontSize: '28px', fontWeight: 'bold', margin: '10px 0 0 0', color: '#333' },
  stockVal: { fontSize: '22px', fontWeight: 'bold', color: '#2e7d32', margin: '10px 0 5px 0' },
  table: { width: '100%', borderCollapse: 'collapse', marginTop: '15px', background: '#fff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
  th: { background: '#1976d2', color: '#fff', padding: '12px', textAlign: 'left' },
  td: { padding: '12px', borderBottom: '1px solid #eee' }
};

export default AdminDashboard;