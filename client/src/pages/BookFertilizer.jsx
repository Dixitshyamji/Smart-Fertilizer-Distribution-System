import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const FERTILIZER_PRICES = {
  urea: 266.50,  // per bag (45kg)
  dap: 1350.00,  // per bag (50kg)
  npk: 1470.00   // per bag (50kg)
};

const BookFertilizer = () => {
  const [godowns, setGodowns] = useState([]);
  const [selectedGodown, setSelectedGodown] = useState('');
  const [quota, setQuota] = useState({
    urea: 0, dap: 0, npk: 0,
    urea_total: 0, dap_total: 0, npk_total: 0
  });
  const [selectedQty, setSelectedQty] = useState({ urea: 0, dap: 0, npk: 0 });
  const [myBookings, setMyBookings] = useState([]);
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const navigate = useNavigate();

  const [farmer, setFarmer] = useState(null);
  const [receiptModal, setReceiptModal] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/farmer/login');
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };

      const [userRes, godownRes, quotaRes, bookingsRes] = await Promise.all([
        api.get('/auth/me', { headers }).catch(() => ({ data: {} })),
        api.get('/allocation/godowns', { headers }),
        api.get('/allocation/quota', { headers }),
        api.get('/booking/my-bookings', { headers }).catch(() => ({ data: { bookings: [] } }))
      ]);

      if (userRes.data?.user) setFarmer(userRes.data.user);
      if (godownRes.data.godowns) setGodowns(godownRes.data.godowns);
      
      if (quotaRes.data.allocation) {
        const alloc = quotaRes.data.allocation;
        setQuota({
          urea: alloc.urea_remaining,
          dap: alloc.dap_remaining,
          npk: alloc.npk_remaining,
          urea_total: alloc.urea_allocated,
          dap_total: alloc.dap_allocated,
          npk_total: alloc.npk_allocated
        });
        // Default selected quantity to available remaining quota
        setSelectedQty({
          urea: Math.min(10, alloc.urea_remaining || 0),
          dap: Math.min(10, alloc.dap_remaining || 0),
          npk: Math.min(5, alloc.npk_remaining || 0)
        });
      }

      if (bookingsRes.data.bookings) {
        setMyBookings(bookingsRes.data.bookings);
      }
    } catch (err) {
      setMsg({ type: 'error', text: 'Failed to load booking details. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleQtyChange = (type, value) => {
    const val = parseInt(value, 10);
    const maxVal = quota[type] || 0;
    const validVal = isNaN(val) ? 0 : Math.max(0, Math.min(val, maxVal));

    setSelectedQty((prev) => ({
      ...prev,
      [type]: validVal
    }));
  };

  const calculateTotalCost = () => {
    return (
      (selectedQty.urea || 0) * FERTILIZER_PRICES.urea +
      (selectedQty.dap || 0) * FERTILIZER_PRICES.dap +
      (selectedQty.npk || 0) * FERTILIZER_PRICES.npk
    );
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    setMsg({ type: '', text: '' });

    if (!selectedGodown) {
      setMsg({ type: 'error', text: 'Please select a distribution godown center.' });
      return;
    }

    const totalBags = (selectedQty.urea || 0) + (selectedQty.dap || 0) + (selectedQty.npk || 0);
    if (totalBags === 0) {
      setMsg({ type: 'error', text: 'Please select at least 1 bag to confirm your booking.' });
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await api.post(
        '/booking/create',
        {
          godown_id: selectedGodown,
          urea_qty: selectedQty.urea,
          dap_qty: selectedQty.dap,
          npk_qty: selectedQty.npk,
          total_price: calculateTotalCost()
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.status === 'SUCCESS') {
        setConfirmedBooking(res.data.booking);
        setMsg({ type: 'success', text: '🎉 Booking confirmed successfully!' });
        fetchData();
      }
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Booking failed.' });
    }
  };

  if (loading) return <div style={styles.loading}>Loading booking parameters...</div>;

  return (
    <div style={styles.container}>
      
      {/* Top Banner Notice: Multiple Installment Allocation */}
      <div style={styles.infoBanner} className="">
        <div>
          <h3 style={styles.infoTitle}>🌾 Multiple Installment Allocation Allowed</h3>
          <p style={styles.infoDesc}>
            You do <strong>not</strong> need to collect all your allocated fertilizer at once! Large farmers allocated 50 bags Urea and 50 bags DAP can book partial quantities over multiple visits (e.g. 10 bags today, 15 bags next week) until your total remaining stock reaches 0.
          </p>
        </div>
      </div>

      {msg.text && (
        <div style={msg.type === 'error' ? styles.error : styles.success}>
          {msg.text}
        </div>
      )}

      {/* Confirmed Token Display */}
      {confirmedBooking ? (
        <div className="animated-card glow-card" style={styles.tokenCard}>
          <div style={styles.tokenHeader}>
            <span style={styles.successBadge}>✅ QR TOKEN GENERATED SUCCESSFULLY</span>
            <h2>Booking Reference: {confirmedBooking.booking_ref}</h2>
          </div>

          <div style={styles.qrWrapper}>
            <img src={confirmedBooking.qr_code} alt="QR Code Token" style={styles.qrImg} />
            <p style={{ margin: '8px 0 0 0', fontSize: '13px', color: '#1b5e20', fontWeight: 'bold' }}>
              Valid for Pickup Till: {confirmedBooking.pickup_date}
            </p>
          </div>

          <div style={styles.tokenDetails}>
            <p><strong>Urea (45kg):</strong> {confirmedBooking.urea_qty} Bags</p>
            <p><strong>DAP (50kg):</strong> {confirmedBooking.dap_qty} Bags</p>
            <p><strong>NPK (50kg):</strong> {confirmedBooking.npk_qty} Bags</p>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '16px' }}>
            <button onClick={() => setConfirmedBooking(null)} style={styles.btnSecondary}>
              ➕ Make Another Partial Booking
            </button>
            <button onClick={() => navigate('/farmer/dashboard')} style={styles.btnPrimary}>
              🏠 Return to Dashboard
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleBooking} className="animated-card" style={styles.card}>
          <h2 style={styles.title}>🎫 Reserve Fertilizer Bags</h2>
          <p style={styles.subText}>Select distribution center and partial bag quantities below.</p>

          <div style={styles.group}>
            <label style={styles.label}>1. Select Distribution Godown Center *</label>
            <select
              value={selectedGodown}
              onChange={(e) => setSelectedGodown(e.target.value)}
              required
              style={styles.select}
            >
              <option value="">-- Choose Nearby Store / Godown --</option>
              {godowns.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name} ({g.location}, {g.district})
                </option>
              ))}
            </select>
          </div>

          {/* Quota Remaining Summary Cards */}
          <div style={styles.quotaGrid}>
            <div style={styles.quotaBox}>
              <span style={styles.quotaLabel}>🌾 Urea (45kg)</span>
              <div style={styles.quotaNum}>
                {quota.urea} <small style={{ fontSize: '12px', color: '#666' }}>/ {quota.urea_total} Bags Left</small>
              </div>
            </div>
            <div style={styles.quotaBox}>
              <span style={styles.quotaLabel}>🌱 DAP (50kg)</span>
              <div style={styles.quotaNum}>
                {quota.dap} <small style={{ fontSize: '12px', color: '#666' }}>/ {quota.dap_total} Bags Left</small>
              </div>
            </div>
            <div style={styles.quotaBox}>
              <span style={styles.quotaLabel}>🌿 NPK (50kg)</span>
              <div style={styles.quotaNum}>
                {quota.npk} <small style={{ fontSize: '12px', color: '#666' }}>/ {quota.npk_total} Bags Left</small>
              </div>
            </div>
          </div>

          {/* Quantity Selectors */}
          <div style={styles.summaryCard}>
            <h3 style={styles.subTitle}>2. Enter Quantity to Book for this Visit</h3>

            <div style={styles.itemRow}>
              <div>
                <strong>🌾 Urea Bags</strong>
                <small style={styles.smallNote}>Rate: ₹{FERTILIZER_PRICES.urea.toFixed(2)}/bag (Max: {quota.urea})</small>
              </div>
              <input
                type="number"
                min="0"
                max={quota.urea}
                value={selectedQty.urea}
                onChange={(e) => handleQtyChange('urea', e.target.value)}
                style={styles.numberInput}
              />
            </div>

            <div style={styles.itemRow}>
              <div>
                <strong>🌱 DAP Bags </strong>
                <small style={styles.smallNote}>Rate: ₹{FERTILIZER_PRICES.dap.toFixed(2)}/bag (Max: {quota.dap})</small>
              </div>
              <input
                type="number"
                min="0"
                max={quota.dap}
                value={selectedQty.dap}
                onChange={(e) => handleQtyChange('dap', e.target.value)}
                style={styles.numberInput}
              />
            </div>

            <div style={styles.itemRow}>
              <div>
                <strong>🌿 NPK Bags</strong>
                <small style={styles.smallNote}>Rate: ₹{FERTILIZER_PRICES.npk.toFixed(2)}/bag (Max: {quota.npk})</small>
              </div>
              <input
                type="number"
                min="0"
                max={quota.npk}
                value={selectedQty.npk}
                onChange={(e) => handleQtyChange('npk', e.target.value)}
                style={styles.numberInput}
              />
            </div>

            <hr style={styles.hr} />

            <div style={styles.calcBreakdown}>
              <p>Urea Cost: {selectedQty.urea} × ₹{FERTILIZER_PRICES.urea.toFixed(2)} = ₹{(selectedQty.urea * FERTILIZER_PRICES.urea).toFixed(2)}</p>
              <p>DAP Cost: {selectedQty.dap} × ₹{FERTILIZER_PRICES.dap.toFixed(2)} = ₹{(selectedQty.dap * FERTILIZER_PRICES.dap).toFixed(2)}</p>
              <p>NPK Cost: {selectedQty.npk} × ₹{FERTILIZER_PRICES.npk.toFixed(2)} = ₹{(selectedQty.npk * FERTILIZER_PRICES.npk).toFixed(2)}</p>
            </div>

            <hr style={styles.hr} />

            <div style={styles.totalRow}>
              <span>Subsidized Amount Payable:</span>
              <span style={{ color: '#0f5013', fontSize: '22px', fontWeight: 'bold' }}>
                ₹{calculateTotalCost().toFixed(2)}
              </span>
            </div>
          </div>

          <button type="submit" style={styles.btnPrimary}>
            🎟️ Generate Pickup QR Token
          </button>
        </form>
      )}

      {/* Previous Bookings History Table */}
      {myBookings.length > 0 && (
        <div className="animated-card" style={{ ...styles.card, marginTop: '30px' }}>
          <h3 style={styles.title}>📜 Your Previous Booking Tokens</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Token Ref</th>
                  <th style={styles.th}>Godown</th>
                  <th style={styles.th}>Urea</th>
                  <th style={styles.th}>DAP</th>
                  <th style={styles.th}>NPK</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Pickup Date</th>
                  <th style={styles.th}>Receipt</th>
                </tr>
              </thead>
              <tbody>
                {myBookings.map((b) => (
                  <tr key={b.id}>
                    <td style={styles.td}><strong>{b.booking_ref}</strong></td>
                    <td style={styles.td}>{b.godown_name || 'Central Store'}</td>
                    <td style={styles.td}>{b.urea_qty} Bags</td>
                    <td style={styles.td}>{b.dap_qty} Bags</td>
                    <td style={styles.td}>{b.npk_qty} Bags</td>
                    <td style={styles.td}>
                      <span style={b.status === 'COLLECTED' ? styles.badgeCollected : styles.badgeBooked}>
                        {b.status === 'COLLECTED' ? '✅ COLLECTED' : '⏳ BOOKED'}
                      </span>
                    </td>
                    <td style={styles.td}>{b.pickup_date || 'Active'}</td>
                    <td style={styles.td}>
                      {b.status === 'COLLECTED' ? (
                        <button
                          type="button"
                          onClick={() => setReceiptModal(b)}
                          style={{
                            padding: '6px 12px',
                            background: 'linear-gradient(135deg, #15803d, #22c55e)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            boxShadow: '0 2px 8px rgba(34,197,94,0.3)'
                          }}
                        >
                          📄 Download Receipt
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setReceiptModal(b)}
                          style={{
                            padding: '6px 10px',
                            background: 'rgba(255,255,255,0.1)',
                            color: '#e2e8f0',
                            border: '1px solid rgba(255,255,255,0.2)',
                            borderRadius: '6px',
                            fontSize: '11px',
                            cursor: 'pointer'
                          }}
                        >
                          👁️ View Token
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Official Printable Receipt Modal */}
      {receiptModal && (
        <div style={modalStyles.overlay}>
          <div style={modalStyles.modalCard} className="printable-receipt">
            <div style={{ textAlign: 'center', marginBottom: '14px', borderBottom: '2px solid #166534', paddingBottom: '12px' }}>
              <div style={{ fontSize: '28px', marginBottom: '4px' }}>🏛️</div>
              <h2 style={{ margin: 0, color: '#14532d', fontSize: '20px', fontWeight: '800' }}>
                MINISTRY OF AGRICULTURE & FARMERS WELFARE
              </h2>
              <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#15803d', fontWeight: '700' }}>
                Official Fertilizer Distribution Receipt & Acknowledgment
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '13px', background: '#f0fdf4', padding: '12px', borderRadius: '10px', border: '1px solid #bbf7d0', marginBottom: '16px', color: '#14532d' }}>
              <div><strong>Token Ref:</strong> <span style={{ fontFamily: 'monospace', fontWeight: '700' }}>{receiptModal.booking_ref}</span></div>
              <div><strong>Status:</strong> <span style={{ color: receiptModal.status === 'COLLECTED' ? '#15803d' : '#ca8a04', fontWeight: '700' }}>{receiptModal.status}</span></div>
              <div><strong>Farmer Name:</strong> {farmer?.name || 'Registered Farmer'}</div>
              <div><strong>Farmer ID:</strong> {farmer?.farmer_custom_id || `FRM-${receiptModal.farmer_id}`}</div>
              <div><strong>Mobile:</strong> {farmer?.mobile || 'N/A'}</div>
              <div><strong>Village/District:</strong> {farmer?.village || 'N/A'}, {farmer?.district || 'Hardoi'}</div>
              <div style={{ gridColumn: 'span 2' }}><strong>Distribution Godown:</strong> {receiptModal.godown_name || 'Central Store'}</div>
              {receiptModal.payment_mode && (
                <div style={{ gridColumn: 'span 2', marginTop: '4px' }}>
                  <strong>💳 Payment Mode:</strong>{' '}
                  <span style={{
                    display: 'inline-block',
                    background: receiptModal.payment_mode === 'Cash' ? '#dcfce7' : receiptModal.payment_mode === 'UPI' ? '#dbeafe' : '#ede9fe',
                    color: receiptModal.payment_mode === 'Cash' ? '#15803d' : receiptModal.payment_mode === 'UPI' ? '#1d4ed8' : '#7c3aed',
                    border: `1px solid ${receiptModal.payment_mode === 'Cash' ? '#86efac' : receiptModal.payment_mode === 'UPI' ? '#93c5fd' : '#c4b5fd'}`,
                    padding: '2px 10px',
                    borderRadius: '100px',
                    fontWeight: '800',
                    fontSize: '12px',
                    marginLeft: '4px',
                  }}>
                    {receiptModal.payment_mode === 'Cash' ? '💵' : receiptModal.payment_mode === 'UPI' ? '📱' : '🟣'} {receiptModal.payment_mode}
                  </span>
                </div>
              )}
            </div>

            <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#166534' }}>📦 Allocated Items & Cost Breakdown</h4>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '16px', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#dcfce7', color: '#14532d' }}>
                  <th style={{ padding: '8px', textAlign: 'left', borderBottom: '2px solid #86efac' }}>Item Description</th>
                  <th style={{ padding: '8px', textAlign: 'center', borderBottom: '2px solid #86efac' }}>Bags</th>
                  <th style={{ padding: '8px', textAlign: 'right', borderBottom: '2px solid #86efac' }}>Price / Bag</th>
                  <th style={{ padding: '8px', textAlign: 'right', borderBottom: '2px solid #86efac' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {receiptModal.urea_qty > 0 && (
                  <tr style={{ borderBottom: '1px solid #f0fdf4', color: '#1e293b' }}>
                    <td style={{ padding: '8px' }}>Urea (45kg Bag)</td>
                    <td style={{ padding: '8px', textAlign: 'center' }}>{receiptModal.urea_qty}</td>
                    <td style={{ padding: '8px', textAlign: 'right' }}>₹266.50</td>
                    <td style={{ padding: '8px', textAlign: 'right' }}>₹{(receiptModal.urea_qty * 266.50).toFixed(2)}</td>
                  </tr>
                )}
                {receiptModal.dap_qty > 0 && (
                  <tr style={{ borderBottom: '1px solid #f0fdf4', color: '#1e293b' }}>
                    <td style={{ padding: '8px' }}>DAP (50kg Bag)</td>
                    <td style={{ padding: '8px', textAlign: 'center' }}>{receiptModal.dap_qty}</td>
                    <td style={{ padding: '8px', textAlign: 'right' }}>₹1350.00</td>
                    <td style={{ padding: '8px', textAlign: 'right' }}>₹{(receiptModal.dap_qty * 1350.00).toFixed(2)}</td>
                  </tr>
                )}
                {receiptModal.npk_qty > 0 && (
                  <tr style={{ borderBottom: '1px solid #f0fdf4', color: '#1e293b' }}>
                    <td style={{ padding: '8px' }}>NPK (50kg Bag)</td>
                    <td style={{ padding: '8px', textAlign: 'center' }}>{receiptModal.npk_qty}</td>
                    <td style={{ padding: '8px', textAlign: 'right' }}>₹1470.00</td>
                    <td style={{ padding: '8px', textAlign: 'right' }}>₹{(receiptModal.npk_qty * 1470.00).toFixed(2)}</td>
                  </tr>
                )}
                <tr style={{ background: '#f0fdf4', fontWeight: '800', color: '#14532d' }}>
                  <td colSpan="3" style={{ padding: '10px', textAlign: 'right', borderTop: '2px solid #86efac' }}>Total Paid Amount:</td>
                  <td style={{ padding: '10px', textAlign: 'right', borderTop: '2px solid #86efac', fontSize: '16px' }}>
                    ₹{(
                      (receiptModal.urea_qty || 0) * 266.50 +
                      (receiptModal.dap_qty || 0) * 1350.00 +
                      (receiptModal.npk_qty || 0) * 1470.00
                    ).toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', paddingTop: '12px', borderTop: '1px dashed #cbd5e1', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <div style={{ padding: '6px 14px', background: receiptModal.status === 'COLLECTED' ? '#dcfce7' : '#fef9c3', color: receiptModal.status === 'COLLECTED' ? '#15803d' : '#a16207', border: `1px solid ${receiptModal.status === 'COLLECTED' ? '#86efac' : '#fde047'}`, borderRadius: '100px', fontSize: '12px', fontWeight: '800', marginBottom: '6px', display: 'inline-block' }}>
                  {receiptModal.status === 'COLLECTED' ? '✅ SUCCESSFUL COLLECTION CERTIFIED' : '⏳ PENDING PICKUP'}
                </div>
                {receiptModal.payment_mode && (
                  <div style={{ fontSize: '12px', color: '#374151', marginTop: '4px' }}>
                    💳 <strong>Payment Mode:</strong>{' '}
                    <span style={{
                      display: 'inline-block',
                      background: receiptModal.payment_mode === 'Cash' ? '#dcfce7' : receiptModal.payment_mode === 'UPI' ? '#dbeafe' : '#ede9fe',
                      color: receiptModal.payment_mode === 'Cash' ? '#15803d' : receiptModal.payment_mode === 'UPI' ? '#1d4ed8' : '#7c3aed',
                      border: `1px solid ${receiptModal.payment_mode === 'Cash' ? '#86efac' : receiptModal.payment_mode === 'UPI' ? '#93c5fd' : '#c4b5fd'}`,
                      padding: '2px 10px', borderRadius: '100px', fontWeight: '800', fontSize: '12px',
                    }}>
                      {receiptModal.payment_mode === 'Cash' ? '💵' : receiptModal.payment_mode === 'UPI' ? '📱' : '🟣'} {receiptModal.payment_mode}
                    </span>
                  </div>
                )}
              </div>
              <div style={{ textAlign: 'right', fontSize: '11px', color: '#64748b' }}>
                Distribution Officer Signatory<br />
                <strong style={{ color: '#0f172a' }}>Smart Fertilizer System</strong>
              </div>
            </div>

            <div className="no-print" style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '24px' }}>
              <button
                type="button"
                onClick={() => window.print()}
                style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #15803d, #22c55e)', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 14px rgba(34,197,94,0.3)' }}
              >
                🖨️ Print / Download PDF
              </button>
              <button
                type="button"
                onClick={() => setReceiptModal(null)}
                style={{ padding: '10px 18px', background: '#475569', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
              >
                ✕ Close
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media print {
          body * { visibility: hidden; }
          .printable-receipt, .printable-receipt * { visibility: visible; }
          .printable-receipt { position: absolute; left: 0; top: 0; width: 100%; max-width: 100% !important; background: #fff !important; color: #000 !important; box-shadow: none !important; border: none !important; padding: 20px !important; }
          .no-print { display: none !important; }
        }
      `}</style>
    </div>
  );
};

const modalStyles = {
  overlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 9999, padding: '20px'
  },
  modalCard: {
    background: '#ffffff', color: '#0f172a', borderRadius: '16px',
    padding: '24px 28px', maxWidth: '560px', width: '100%',
    boxShadow: '0 20px 50px rgba(0,0,0,0.5)', maxHeight: '90vh', overflowY: 'auto'
  }
};

const styles = {
  container: { maxWidth: '780px', margin: '30px auto', padding: '0 20px 40px' },
  loading: { textAlign: 'center', padding: '60px', color: '#fff', fontSize: '18px', fontWeight: 'bold' },
  card: { padding: '28px', borderRadius: '16px', boxShadow: '0 12px 32px rgba(0,0,0,0.2)', marginBottom: '24px', textAlign: 'left' },
  infoBanner: {
    background: 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%)',
    color: '#ffffff',
    padding: '16px 20px',
    borderRadius: '12px',
    marginBottom: '20px',
    textAlign: 'left',
    boxShadow: '0 4px 16px rgba(0,0,0,0.2)'
  },
  infoTitle: { margin: '0 0 6px 0', fontSize: '16px', color: '#fbc02d' },
  infoDesc: { margin: 0, fontSize: '13px', lineHeight: '1.5', color: '#e8f5e9' },
  title: { margin: '0 0 8px 0', color: 'white', fontSize: '24px' },
  subText: { margin: '0 0 20px 0', color: 'white', fontSize: '16px' },
  group: { marginBottom: '20px' },
  label: { fontWeight: 'bold', display: 'block', marginBottom: '8px', color: 'white', fontSize: '18px' },
  select: { width: '100%', padding: '12px 14px', borderRadius: '8px', border: '2px solid #a5d6a7', fontSize: '16px', fontWeight: '600', color: '#1b5e20', outline: 'none' },
  quotaGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '20px' },
  quotaBox: { background: '#e8f5e9', padding: '12px', borderRadius: '8px', borderLeft: '4px solid #2e7d32', textAlign: 'left' },
  quotaLabel: { display: 'block', fontSize: '18px', fontWeight: 'bold', color: '#2e7d32' },
  quotaNum: { fontSize: '18px', fontWeight: 'bold', color: '#1b5e20', marginTop: '4px' },
  summaryCard: { background: '#f9fbe7', padding: '18px', borderRadius: '12px', border: '1px solid #33ca47', marginBottom: '20px' },
  subTitle: { margin: '0 0 16px 0', fontSize: '20px', color: 'green', borderBottom: '1px solid #000', paddingBottom: '8px' },
  itemRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '14px 0' ,color: '#1b5e20', fontSize: '16px', fontWeight: '600' },
  smallNote: { display: 'block', color: 'green', fontSize: '16px', marginTop: '2px' },
  numberInput: { width: '85px', padding: '10px', borderRadius: '8px', border: '2px solid #1fe911', textAlign: 'center', fontSize: '16px', fontWeight: 'bold', color: '#33691e' },
  calcBreakdown: { fontSize: '16px', color: 'green', lineHeight: '1.5' },
  hr: { margin: '14px 0', border: 'none', borderTop: '1px solid #000000' },
  totalRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: 0, fontSize: '16px', fontWeight: 'bold' },
  btnPrimary: { width: '100%', padding: '14px', background: 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%)', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 14px rgba(46,125,50,0.4)' },
  btnSecondary: { padding: '14px 20px', background: '#fbc02d', color: '#1b5e20', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer' },
  tokenCard: { textAlign: 'center', padding: '30px' },
  tokenHeader: { marginBottom: '20px' },
  successBadge: { display: 'inline-block', background: '#e8f5e9', color: '#2e7d32', padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', marginBottom: '10px' },
  qrWrapper: { background: '#ffffff', padding: '16px', borderRadius: '12px', display: 'inline-block', border: '2px solid #a5d6a7', marginBottom: '20px' },
  qrImg: { width: '220px', height: '220px' },
  tokenDetails: { display: 'flex', justifyContent: 'center', gap: '20px', background: '#f1f8e9', padding: '12px', borderRadius: '8px', fontSize: '14px', fontWeight: '600' },
  error: { color: '#c62828', padding: '12px 16px', background: '#ffebee', borderRadius: '8px', marginBottom: '20px', fontWeight: 'bold', borderLeft: '4px solid #c62828' },
  success: { color: '#1b5e20', padding: '12px 16px', background: '#e8f5e9', borderRadius: '8px', marginBottom: '20px', fontWeight: 'bold', borderLeft: '4px solid #2e7d32' },
  table: { width: '100%', borderCollapse: 'collapse', marginTop: '10px' },
  th: { background: '#e8f5e9', color: 'black', padding: '10px', fontSize: '12px', textAlign: 'left', borderBottom: '2px solid #a5d6a7' },
  td: { padding: '10px', fontSize: '13px', borderBottom: '1px solid #eee', color: 'white' },
  badgeBooked: { background: '#fff9c4', color: '#f51782', padding: '3px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' },
  badgeCollected: { background: '#c8e6c9', color: '#2e7d32', padding: '3px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }
};

export default BookFertilizer;
