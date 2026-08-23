import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';
import api from '../services/api';

const FERTILIZER_PRICES = {
  urea: 266.50,
  dap: 1350.00,
  npk: 1470.00,
};

const PAYMENT_MODES = [
  {
    id: 'Cash',
    icon: '💵',
    label: 'Cash',
    desc: 'Physical cash payment',
    color: '#22c55e',
    bg: 'rgba(34,197,94,0.12)',
    border: 'rgba(34,197,94,0.4)',
  },
  {
    id: 'UPI',
    icon: '📱',
    label: 'UPI',
    desc: 'Any UPI App (GPay, Paytm, etc.)',
    color: '#60a5fa',
    bg: 'rgba(96,165,250,0.12)',
    border: 'rgba(96,165,250,0.4)',
  },
  {
    id: 'PhonePe',
    icon: '🟣',
    label: 'PhonePe',
    desc: 'Pay via PhonePe app',
    color: '#a78bfa',
    bg: 'rgba(167,139,250,0.12)',
    border: 'rgba(167,139,250,0.4)',
  },
];

const OfficerPortal = () => {
  const navigate = useNavigate();
  const [officer, setOfficer] = useState(null);
  const [tokenInput, setTokenInput] = useState('');
  const [bookingData, setBookingData] = useState(null);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  // Payment modal states
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedPayMode, setSelectedPayMode] = useState('');
  const [cashConfirmed, setCashConfirmed] = useState(false);
  const [collectedSuccess, setCollectedSuccess] = useState(false);
  const [collectedPayMode, setCollectedPayMode] = useState('');

  // UPI/PhonePe simulation states
  const [upiStep, setUpiStep] = useState('select'); // 'select' | 'qr' | 'processing' | 'done'
  const [upiId, setUpiId] = useState('');
  const [upiError, setUpiError] = useState('');

  // Receipt print modal state
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [receiptData, setReceiptData] = useState(null);

  // QR Scanner States
  const [isScanning, setIsScanning] = useState(false);
  const [scannerError, setScannerError] = useState('');
  const scannerInstanceRef = useRef(null);

  useEffect(() => {
    const loggedIn = localStorage.getItem('officerLoggedIn');
    if (!loggedIn) {
      navigate('/officer/login');
      return;
    }
    setOfficer(JSON.parse(loggedIn));
  }, [navigate]);

  const [allBookings, setAllBookings] = useState([]);

  // Core verification function
  const verifyTokenValue = async (val) => {
    const targetToken = (val || '').trim();
    if (!targetToken) return;

    setStatusMsg({ type: '', text: '' });
    setBookingData(null);
    setAllBookings([]);
    setCollectedSuccess(false);
    setCollectedPayMode('');
    setLoading(true);
    try {
      const res = await api.post('/officer/verify-token', { token: targetToken });
      if (res.data.status === 'SUCCESS') {
        setBookingData(res.data.booking);
        if (res.data.all_bookings) setAllBookings(res.data.all_bookings);
      }
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.response?.data?.message || 'Token verification failed.' });
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    if (e) e.preventDefault();
    verifyTokenValue(tokenInput);
  };

  // QR Scanner Handler
  const handleScanSuccess = async (scannedRawText) => {
    let cleanToken = scannedRawText.trim();
    if (cleanToken.startsWith('{') && cleanToken.endsWith('}')) {
      try {
        const parsed = JSON.parse(cleanToken);
        if (parsed.token) cleanToken = parsed.token.trim();
      } catch (e) {}
    }

    setTokenInput(cleanToken);

    // Stop camera
    if (scannerInstanceRef.current) {
      try {
        if (scannerInstanceRef.current.isScanning) {
          await scannerInstanceRef.current.stop();
        }
        scannerInstanceRef.current.clear();
      } catch (e) {}
    }
    setIsScanning(false);
    verifyTokenValue(cleanToken);
  };

  // File Upload QR Scan Handler
  const handleFileUploadScan = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setScannerError('');
    setLoading(true);
    try {
      const html5QrCode = new Html5Qrcode('qr-file-temp-box');
      const decodedResult = await html5QrCode.scanFile(file, true);
      handleScanSuccess(decodedResult);
    } catch (err) {
      console.error('File scan error:', err);
      setScannerError('Could not find a valid QR code in this image. Please try another image or manual entry.');
    } finally {
      setLoading(false);
    }
  };

  // Lifecycle for Camera Scanner Modal
  useEffect(() => {
    let html5QrCode = null;

    if (isScanning) {
      setScannerError('');
      const timer = setTimeout(() => {
        try {
          const readerElem = document.getElementById('qr-reader-live');
          if (!readerElem) return;

          html5QrCode = new Html5Qrcode('qr-reader-live');
          scannerInstanceRef.current = html5QrCode;

          html5QrCode.start(
            { facingMode: 'environment' },
            {
              fps: 10,
              qrbox: { width: 240, height: 240 },
              aspectRatio: 1.0
            },
            (decodedText) => {
              handleScanSuccess(decodedText);
            },
            (errorMessage) => {
              // scanning frame
            }
          ).catch(err => {
            console.error('Camera start error:', err);
            setScannerError('Camera access not granted or no camera found. You can upload a QR image below.');
          });
        } catch (e) {
          console.error('Scanner init error:', e);
          setScannerError('Failed to initialize camera scanner. Please use image upload below.');
        }
      }, 300);

      return () => {
        clearTimeout(timer);
        if (scannerInstanceRef.current) {
          try {
            if (scannerInstanceRef.current.isScanning) {
              scannerInstanceRef.current.stop().catch(console.error);
            }
            scannerInstanceRef.current.clear();
          } catch (e) {}
        }
      };
    }
  }, [isScanning]);

  // Opens payment modal
  const handlePayAndCollect = () => {
    if (!bookingData) return;
    setSelectedPayMode('');
    setCashConfirmed(false);
    setUpiStep('select');
    setUpiId('');
    setUpiError('');
    setShowPayModal(true);
  };

  // Called after payment mode chosen and confirmed
  const handleFulfill = async () => {
    if (!bookingData || !selectedPayMode) return;
    setLoading(true);
    try {
      const res = await api.post('/officer/fulfill-booking', {
        booking_id: bookingData.id,
        payment_mode: selectedPayMode,
      });
      if (res.data.status === 'SUCCESS') {
        setShowPayModal(false);
        setCollectedSuccess(true);
        setCollectedPayMode(selectedPayMode);
        const updatedBooking = { ...bookingData, status: 'COLLECTED', payment_mode: selectedPayMode, updated_at: new Date().toISOString() };
        setBookingData(updatedBooking);
        setAllBookings(prev =>
          prev.map(b =>
            b.id === bookingData.id ? { ...b, status: 'COLLECTED', payment_mode: selectedPayMode } : b
          )
        );
        setStatusMsg({ type: '', text: '' });
        // Auto open receipt after collection
        setReceiptData(updatedBooking);
        setShowReceiptModal(true);
      }
    } catch (err) {
      setShowPayModal(false);
      setStatusMsg({ type: 'error', text: err.response?.data?.message || 'Fulfillment failed.' });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('officerLoggedIn');
    navigate('/officer/login');
  };

  const calcTotal = (data) =>
    (data.urea_qty || 0) * FERTILIZER_PRICES.urea +
    (data.dap_qty || 0) * FERTILIZER_PRICES.dap +
    (data.npk_qty || 0) * FERTILIZER_PRICES.npk;

  const getPayModeInfo = (mode) => PAYMENT_MODES.find(p => p.id === mode) || PAYMENT_MODES[0];

  const openReceipt = (data) => {
    setReceiptData(data);
    setShowReceiptModal(true);
  };

  if (!officer) return null;

  return (
    <div style={styles.page}>
      <div style={styles.glowBg} />

      <div style={styles.wrapper}>
        {/* Header card */}
        <div style={styles.headerCard}>
          <div style={styles.headerLeft}>
            <div style={styles.officerAvatar}>👮</div>
            <div>
              <div style={styles.officerBadge}>Distribution Officer Portal</div>
              <h1 style={styles.officerName}>{officer.name}</h1>
              <p style={styles.officerMeta}>Badge: {officer.badge || 'N/A'} · @{officer.username}</p>
            </div>
          </div>
          <div style={styles.headerRight}>
            <button onClick={() => navigate('/')} style={styles.homeBtn}>🏠 Home</button>
            <button onClick={handleLogout} style={styles.logoutBtn}>🚪 Logout</button>
          </div>
        </div>

        {/* Token Verify Card */}
        <div style={styles.verifyCard}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
            <div>
              <h2 style={styles.verifyTitle}>🔍 Token Verification</h2>
              <p style={styles.verifySub}>Enter or scan the farmer's QR Token Reference to issue bags.</p>
            </div>
            <button
              type="button"
              onClick={() => setIsScanning(true)}
              style={styles.scanQrBtn}
            >
              📷 Scan QR Code
            </button>
          </div>

          <form onSubmit={handleVerify} style={styles.verifyForm}>
            <div style={styles.inputWrap}>
              <span style={styles.inputIcon}>🎟️</span>
              <input
                type="text"
                placeholder="Enter Token Ref (e.g. TKN-123456-7890)"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                required
                style={styles.tokenInput}
              />
            </div>
            <button type="submit" disabled={loading} style={styles.verifyBtn}>
              {loading ? '⏳ Verifying...' : '🔍 Verify Token'}
            </button>
          </form>

          {statusMsg.text && (
            <div style={statusMsg.type === 'error' ? styles.errorBox : styles.successBox}>
              {statusMsg.text}
            </div>
          )}
        </div>

        {/* ✅ Collected Successfully Banner */}
        {collectedSuccess && (
          <div style={styles.collectedSuccessBanner}>
            <div style={styles.collectedSuccessIcon}>✅</div>
            <div>
              <div style={styles.collectedSuccessTitle}>Collected Successfully!</div>
              <div style={styles.collectedSuccessSub}>
                Fertilizer bags have been handed over to the farmer.&nbsp;
                Payment received via&nbsp;
                <span style={{
                  background: getPayModeInfo(collectedPayMode).bg,
                  color: getPayModeInfo(collectedPayMode).color,
                  border: `1px solid ${getPayModeInfo(collectedPayMode).border}`,
                  padding: '2px 10px',
                  borderRadius: '100px',
                  fontWeight: '800',
                  fontSize: '13px',
                }}>
                  {getPayModeInfo(collectedPayMode).icon} {collectedPayMode}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Booking Details */}
        {bookingData && (
          <div style={styles.detailCard}>
            {allBookings.length > 1 && (
              <div style={{ marginBottom: '16px', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(96,165,250,0.2)' }}>
                <span style={{ fontSize: '12px', color: '#93c5fd', display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                  📋 Farmer Has Multiple Tokens ({allBookings.length}): Select Token to Process:
                </span>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {allBookings.map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => {
                        setBookingData(b);
                        setCollectedSuccess(false);
                        setCollectedPayMode('');
                      }}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '8px',
                        border: '1px solid',
                        borderColor: bookingData.id === b.id ? '#60a5fa' : 'rgba(255,255,255,0.1)',
                        background: bookingData.id === b.id ? 'rgba(59,130,246,0.25)' : 'rgba(255,255,255,0.05)',
                        color: b.status === 'COLLECTED' ? '#4ade80' : '#fbbf24',
                        fontSize: '12px',
                        fontWeight: '700',
                        cursor: 'pointer'
                      }}
                    >
                      {b.booking_ref} ({b.status === 'COLLECTED' ? '✅ Collected' : '⏳ Pending'})
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Farmer Info */}
            <div style={styles.detailSection}>
              <h3 style={styles.detailSectionTitle}>👨‍🌾 Farmer Details</h3>
              <div style={styles.infoGrid}>
                <div style={styles.infoItem}>
                  <span style={styles.infoLabel}>Name</span>
                  <span style={styles.infoValue}>{bookingData.farmer_name}</span>
                </div>
                <div style={styles.infoItem}>
                  <span style={styles.infoLabel}>Farmer ID</span>
                  <span style={{ ...styles.infoValue, color: '#4ade80' }}>{bookingData.farmer_custom_id}</span>
                </div>
                <div style={styles.infoItem}>
                  <span style={styles.infoLabel}>Mobile</span>
                  <span style={styles.infoValue}>
                    {bookingData.mobile_no || bookingData.mobile || bookingData.phone || 'N/A'}
                  </span>
                </div>
                <div style={styles.infoItem}>
                  <span style={styles.infoLabel}>Status</span>
                  <span style={{
                    ...styles.statusBadge,
                    background: bookingData.status === 'COLLECTED' ? 'rgba(74,222,128,0.15)' : 'rgba(251,191,36,0.15)',
                    color: bookingData.status === 'COLLECTED' ? '#4ade80' : '#fbbf24',
                    borderColor: bookingData.status === 'COLLECTED' ? 'rgba(74,222,128,0.3)' : 'rgba(251,191,36,0.3)',
                  }}>
                    {bookingData.status === 'COLLECTED' ? '✅ Collected' : '⏳ Pending'}
                  </span>
                </div>
              </div>
            </div>

            <div style={styles.divider} />

            {/* Order Items */}
            <div style={styles.detailSection}>
              <h3 style={styles.detailSectionTitle}>📦 Order Items & Billing</h3>
              <div style={styles.orderTable}>
                {[
                  { icon: '🌾', name: 'Urea (45kg)', qty: bookingData.urea_qty, price: FERTILIZER_PRICES.urea },
                  { icon: '🌱', name: 'DAP (50kg)', qty: bookingData.dap_qty, price: FERTILIZER_PRICES.dap },
                  { icon: '🌿', name: 'NPK (50kg)', qty: bookingData.npk_qty, price: FERTILIZER_PRICES.npk },
                ].map((item, i) => (
                  <div key={i} style={styles.orderRow}>
                    <span style={styles.orderIcon}>{item.icon}</span>
                    <span style={styles.orderName}>{item.name}</span>
                    <span style={styles.orderQty}>{item.qty} bags @ ₹{item.price.toFixed(2)}</span>
                    <span style={styles.orderAmt}>₹{(item.qty * item.price).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div style={styles.totalRow}>
                <span style={styles.totalLabel}>Total Collectible Amount</span>
                <span style={styles.totalAmt}>₹{calcTotal(bookingData).toFixed(2)}</span>
              </div>
            </div>

            {bookingData.status === 'BOOKED' ? (
              <button onClick={handlePayAndCollect} disabled={loading} style={styles.fulfillBtn}>
                {loading ? '⏳ Processing...' : '✅ Approve & Collect'}
              </button>
            ) : (
              /* ── CLICKABLE COLLECTED NOTE ── */
              <button
                type="button"
                onClick={() => openReceipt(bookingData)}
                style={styles.collectedNote}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <span>✅ This order was collected on {new Date(bookingData.updated_at || bookingData.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}.</span>
                  {bookingData.payment_mode ? (
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '4px',
                      background: getPayModeInfo(bookingData.payment_mode).bg,
                      color: getPayModeInfo(bookingData.payment_mode).color,
                      border: `1.5px solid ${getPayModeInfo(bookingData.payment_mode).border}`,
                      padding: '3px 12px', borderRadius: '100px',
                      fontWeight: '800', fontSize: '13px',
                    }}>
                      💳 Paid via {getPayModeInfo(bookingData.payment_mode).icon} {bookingData.payment_mode}
                    </span>
                  ) : (
                    <span style={{ fontSize: '12px', color: 'rgba(74,222,128,0.5)', fontStyle: 'italic' }}>
                      (Payment mode not recorded)
                    </span>
                  )}
                </div>
                <div style={styles.printHint}>🖨️ Click here to Print Final Receipt</div>
              </button>
            )}
          </div>
        )}
      </div>

      {/* ========== QR SCANNER MODAL ========== */}
      {isScanning && (
        <div style={scannerStyles.overlay}>
          <div style={scannerStyles.card}>
            <div style={scannerStyles.header}>
              <div style={scannerStyles.headerLeft}>
                <span style={{ fontSize: '28px' }}>📷</span>
                <div>
                  <h3 style={scannerStyles.title}>Scan Farmer QR Token</h3>
                  <p style={scannerStyles.subtitle}>Align the QR code within the frame to verify automatically.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsScanning(false)}
                style={scannerStyles.closeBtn}
              >
                ✕
              </button>
            </div>

            {scannerError && (
              <div style={scannerStyles.errorMsg}>
                ⚠️ {scannerError}
              </div>
            )}

            {/* Camera Viewfinder Box */}
            <div style={scannerStyles.viewfinderWrap}>
              <div id="qr-reader-live" style={{ width: '100%', borderRadius: '14px', overflow: 'hidden' }} />
              <div className="laser-scanning-line" />
            </div>

            {/* Upload image alternative */}
            <div style={scannerStyles.uploadSection}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
                <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontWeight: '700' }}>OR SCAN FROM IMAGE FILE</span>
                <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
              </div>

              <label style={scannerStyles.fileUploadBtn}>
                <span>📁 Upload QR Code Photo / Screenshot</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUploadScan}
                  style={{ display: 'none' }}
                />
              </label>
              {/* Hidden element for file scanning */}
              <div id="qr-file-temp-box" style={{ display: 'none' }} />
            </div>

            <button
              type="button"
              onClick={() => setIsScanning(false)}
              style={scannerStyles.cancelBtn}
            >
              Cancel & Enter Manually
            </button>
          </div>
        </div>
      )}

      {/* ========== PAYMENT MODE MODAL ========== */}
      {showPayModal && (
        <div style={modalStyles.overlay}>
          <div style={modalStyles.card}>
            <div style={modalStyles.header}>
              <div style={modalStyles.headerIcon}>💳</div>
              <div>
                <h2 style={modalStyles.title}>Select Payment Mode</h2>
                <p style={modalStyles.subtitle}>
                  Choose how the farmer will pay ₹{calcTotal(bookingData).toFixed(2)}
                </p>
              </div>
            </div>

            {!cashConfirmed && (
              <div style={modalStyles.optionsGrid}>
                {PAYMENT_MODES.map((mode) => (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => { setSelectedPayMode(mode.id); setCashConfirmed(false); }}
                    style={{
                      ...modalStyles.optionBtn,
                      background: selectedPayMode === mode.id ? mode.bg : 'rgba(255,255,255,0.04)',
                      borderColor: selectedPayMode === mode.id ? mode.border : 'rgba(255,255,255,0.1)',
                      color: selectedPayMode === mode.id ? mode.color : 'rgba(255,255,255,0.7)',
                      transform: selectedPayMode === mode.id ? 'scale(1.03)' : 'scale(1)',
                      boxShadow: selectedPayMode === mode.id ? `0 0 0 2px ${mode.border}` : 'none',
                    }}
                  >
                    <span style={{ fontSize: '28px', marginBottom: '6px', display: 'block' }}>{mode.icon}</span>
                    <span style={{ fontWeight: '800', fontSize: '15px' }}>{mode.label}</span>
                    <span style={{ fontSize: '11px', opacity: 0.7, marginTop: '3px', display: 'block' }}>{mode.desc}</span>
                    {selectedPayMode === mode.id && (
                      <span style={{
                        position: 'absolute', top: '8px', right: '8px',
                        background: mode.color, color: '#fff', borderRadius: '50%',
                        width: '20px', height: '20px', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', fontSize: '12px', fontWeight: '800'
                      }}>✓</span>
                    )}
                  </button>
                ))}
              </div>
            )}

            {selectedPayMode === 'Cash' && !cashConfirmed && (
              <div style={modalStyles.cashBox}>
                <div style={modalStyles.cashIcon}>💵</div>
                <p style={modalStyles.cashText}>
                  Officer confirms that <strong>₹{calcTotal(bookingData).toFixed(2)}</strong> has been received in <strong>Cash</strong> from the farmer.
                </p>
                <div style={modalStyles.cashNote}>
                  ⚠️ Please physically verify the cash amount before proceeding.
                </div>
                <button type="button" onClick={() => setCashConfirmed(true)} style={modalStyles.agreeBtn}>
                  ✅ Agree & Continue
                </button>
              </div>
            )}

            {/* ── UPI / PhonePe PAYMENT SIMULATION ── */}
            {(selectedPayMode === 'UPI' || selectedPayMode === 'PhonePe') && upiStep === 'select' && (
              <div style={{ animation: 'slideIn 0.3s ease' }}>
                {/* QR Code Card */}
                <div style={{
                  background: '#fff', borderRadius: '16px', padding: '16px',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px',
                  marginBottom: '16px', border: `2px solid ${getPayModeInfo(selectedPayMode).border}`,
                }}>
                  <div style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a' }}>
                    {selectedPayMode === 'PhonePe' ? '🟣 PhonePe Merchant QR Code' : '📱 Official UPI QR Code'}
                  </div>
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=upi://pay?pa=smartfertilizer@upi%26pn=SmartFertilizer%26am=${calcTotal(bookingData).toFixed(2)}%26cu=INR%26tn=Fertilizer`}
                    alt="UPI QR Code"
                    style={{ width: '160px', height: '160px', display: 'block', borderRadius: '8px' }}
                    onError={(e) => { e.target.style.display='none'; }}
                  />
                  <div style={{ fontSize: '12px', color: '#64748b', textAlign: 'center' }}>
                    Payable Collectible Amount:<br/>
                    <strong style={{ color: '#0f172a', fontSize: '16px' }}>₹{calcTotal(bookingData).toFixed(2)}</strong>
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b', background: '#f1f5f9', padding: '5px 12px', borderRadius: '6px' }}>
                    VPA: <strong style={{ color: '#0f172a', fontFamily: 'monospace' }}>smartfertilizer@upi</strong>
                  </div>
                </div>

                {/* Instant Verification Notice */}
                <div style={{
                  background: getPayModeInfo(selectedPayMode).bg,
                  border: `1px solid ${getPayModeInfo(selectedPayMode).border}`,
                  borderRadius: '12px', padding: '12px 14px', marginBottom: '16px',
                  fontSize: '12px', color: 'rgba(255,255,255,0.85)', textAlign: 'center', lineHeight: '1.5'
                }}>
                  ℹ️ <strong>Direct Digital Payment:</strong> Ask the farmer to scan this QR code or pay via {selectedPayMode}. Click below to confirm receipt.
                </div>

                {/* Direct Confirm Button - No typing needed */}
                <button
                  type="button"
                  onClick={() => {
                    setUpiStep('processing');
                    setTimeout(() => setUpiStep('done'), 2200);
                  }}
                  style={{
                    width: '100%', padding: '15px',
                    background: selectedPayMode === 'PhonePe'
                      ? 'linear-gradient(135deg, #5f189e, #7c3aed)'
                      : 'linear-gradient(135deg, #1d4ed8, #3b82f6)',
                    color: '#fff', border: 'none', borderRadius: '12px',
                    fontSize: '15px', fontWeight: '800', cursor: 'pointer',
                    boxShadow: `0 4px 16px ${getPayModeInfo(selectedPayMode).border}`,
                    transition: 'all 0.2s ease',
                  }}
                >
                  {selectedPayMode === 'PhonePe' ? '🟣 Confirm PhonePe Receipt' : '📱 Confirm UPI Receipt'} (₹{calcTotal(bookingData).toFixed(2)})
                </button>
              </div>
            )}

            {/* ── PROCESSING SCREEN ── */}
            {(selectedPayMode === 'UPI' || selectedPayMode === 'PhonePe') && upiStep === 'processing' && (
              <div style={{ textAlign: 'center', padding: '30px 10px', animation: 'slideIn 0.3s ease' }}>
                <div style={{
                  width: '64px', height: '64px', margin: '0 auto 20px',
                  border: `4px solid ${getPayModeInfo(selectedPayMode).border}`,
                  borderTopColor: getPayModeInfo(selectedPayMode).color,
                  borderRadius: '50%', animation: 'spin 0.9s linear infinite',
                }} />
                <div style={{ fontSize: '18px', fontWeight: '800', color: '#fff', marginBottom: '8px' }}>
                  Processing Transaction...
                </div>
                <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.65)' }}>
                  Authorizing <strong>₹{calcTotal(bookingData).toFixed(2)}</strong> via {selectedPayMode} Gateway
                </div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', marginTop: '8px' }}>
                  Please wait, communicating with payment network...
                </div>
              </div>
            )}

            {/* ── PAYMENT SUCCESS SCREEN ── */}
            {(selectedPayMode === 'UPI' || selectedPayMode === 'PhonePe') && upiStep === 'done' && (
              <div style={{ textAlign: 'center', padding: '20px 10px', animation: 'bounceIn 0.4s ease' }}>
                <div style={{
                  width: '72px', height: '72px', background: 'rgba(34,197,94,0.15)',
                  border: '2px solid rgba(34,197,94,0.5)', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '36px', margin: '0 auto 16px',
                }}>✅</div>
                <div style={{ fontSize: '20px', fontWeight: '900', color: '#4ade80', marginBottom: '6px' }}>
                  Payment Received & Verified!
                </div>
                <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', marginBottom: '18px' }}>
                  Amount of <strong style={{ color: '#fff' }}>₹{calcTotal(bookingData).toFixed(2)}</strong> successfully received via {selectedPayMode}.
                </div>
                <div style={{
                  background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)',
                  borderRadius: '12px', padding: '12px 16px', fontSize: '12px',
                  color: 'rgba(255,255,255,0.55)', marginBottom: '16px', textAlign: 'left',
                  lineHeight: '1.6'
                }}>
                  <div><strong>Transaction Reference:</strong> <span style={{ color: '#86efac', fontFamily: 'monospace' }}>TXN{Date.now().toString().slice(-10)}</span></div>
                  <div><strong>Payment Mode:</strong> {selectedPayMode} (Instant Settlement)</div>
                  <div><strong>Timestamp:</strong> {new Date().toLocaleString('en-IN')}</div>
                  <div><strong>Status:</strong> <span style={{ color: '#4ade80', fontWeight: '700' }}>AUTHORIZED & CLEARED</span></div>
                </div>
              </div>
            )}

            {selectedPayMode && (selectedPayMode !== 'Cash' || cashConfirmed) &&
              (selectedPayMode === 'Cash' || upiStep === 'done') && (
              <button
                type="button"
                onClick={handleFulfill}
                disabled={loading}
                style={modalStyles.collectBtn}
              >
                {loading ? '⏳ Processing...' : `🎉 Confirm & Mark Collected (${selectedPayMode})`}
              </button>
            )}

            {!loading && (
              <button
                type="button"
                onClick={() => { setShowPayModal(false); setSelectedPayMode(''); setCashConfirmed(false); setUpiStep('select'); setUpiId(''); setUpiError(''); }}
                style={modalStyles.cancelBtn}
              >
                ✕ Cancel
              </button>
            )}
          </div>
        </div>
      )}

      {/* ========== RECEIPT PRINT MODAL ========== */}
      {showReceiptModal && receiptData && (
        <div style={receiptStyles.overlay}>
          <div style={receiptStyles.modalCard} className="officer-printable-receipt">

            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '14px', borderBottom: '2px solid #166534', paddingBottom: '12px' }}>
              <div style={{ fontSize: '28px', marginBottom: '4px' }}>🏛️</div>
              <h2 style={{ margin: 0, color: '#14532d', fontSize: '18px', fontWeight: '800' }}>
                MINISTRY OF AGRICULTURE & FARMERS WELFARE
              </h2>
              <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#15803d', fontWeight: '700' }}>
                Official Fertilizer Distribution Receipt & Acknowledgment
              </p>
            </div>

            {/* Booking & Farmer Info */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px', background: '#f0fdf4', padding: '12px', borderRadius: '10px', border: '1px solid #bbf7d0', marginBottom: '14px', color: '#14532d' }}>
              <div><strong>Token Ref:</strong> <span style={{ fontFamily: 'monospace', fontWeight: '700' }}>{receiptData.booking_ref}</span></div>
              <div>
                <strong>Status:</strong>{' '}
                <span style={{ color: '#15803d', fontWeight: '700' }}>✅ COLLECTED</span>
              </div>
              <div><strong>Farmer Name:</strong> {receiptData.farmer_name || 'Registered Farmer'}</div>
              <div><strong>Farmer ID:</strong> {receiptData.farmer_custom_id || `FRM-${receiptData.farmer_id}`}</div>
              <div><strong>Mobile:</strong> {receiptData.mobile_no || receiptData.mobile || 'N/A'}</div>
              <div><strong>Village:</strong> {receiptData.village || 'N/A'}, {receiptData.district || 'N/A'}</div>
              <div style={{ gridColumn: 'span 2' }}>
                <strong>Distribution Godown:</strong> {receiptData.godown_name || 'Central Store'}
                {receiptData.godown_location ? ` — ${receiptData.godown_location}` : ''}
              </div>
              <div style={{ gridColumn: 'span 2', marginTop: '4px' }}>
                <strong>Officer Name:</strong> {officer.name}&nbsp;&nbsp;
                <strong>Badge:</strong> {officer.badge || 'N/A'}&nbsp;&nbsp;
                <strong>Username:</strong> @{officer.username}
              </div>
              {/* PAYMENT MODE — prominently shown */}
              <div style={{ gridColumn: 'span 2', marginTop: '6px' }}>
                <strong>💳 Payment Mode:</strong>{' '}
                <span style={{
                  display: 'inline-block',
                  background:
                    receiptData.payment_mode === 'Cash' ? '#dcfce7'
                    : receiptData.payment_mode === 'UPI' ? '#dbeafe'
                    : '#ede9fe',
                  color:
                    receiptData.payment_mode === 'Cash' ? '#15803d'
                    : receiptData.payment_mode === 'UPI' ? '#1d4ed8'
                    : '#7c3aed',
                  border: `1.5px solid ${
                    receiptData.payment_mode === 'Cash' ? '#86efac'
                    : receiptData.payment_mode === 'UPI' ? '#93c5fd'
                    : '#c4b5fd'
                  }`,
                  padding: '3px 14px', borderRadius: '100px',
                  fontWeight: '800', fontSize: '13px', marginLeft: '4px',
                }}>
                  {receiptData.payment_mode === 'Cash' ? '💵'
                    : receiptData.payment_mode === 'UPI' ? '📱'
                    : receiptData.payment_mode === 'PhonePe' ? '🟣' : '💳'
                  }{' '}
                  {receiptData.payment_mode || 'Not Recorded'}
                </span>
              </div>
            </div>

            {/* Items Table */}
            <h4 style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#166534' }}>📦 Allocated Items & Cost Breakdown</h4>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '14px', fontSize: '12px' }}>
              <thead>
                <tr style={{ background: '#dcfce7', color: '#14532d' }}>
                  <th style={{ padding: '8px', textAlign: 'left', borderBottom: '2px solid #86efac' }}>Item Description</th>
                  <th style={{ padding: '8px', textAlign: 'center', borderBottom: '2px solid #86efac' }}>Bags</th>
                  <th style={{ padding: '8px', textAlign: 'right', borderBottom: '2px solid #86efac' }}>Price / Bag</th>
                  <th style={{ padding: '8px', textAlign: 'right', borderBottom: '2px solid #86efac' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {receiptData.urea_qty > 0 && (
                  <tr style={{ borderBottom: '1px solid #f0fdf4', color: '#1e293b' }}>
                    <td style={{ padding: '8px' }}>🌾 Urea (45kg Bag)</td>
                    <td style={{ padding: '8px', textAlign: 'center' }}>{receiptData.urea_qty}</td>
                    <td style={{ padding: '8px', textAlign: 'right' }}>₹266.50</td>
                    <td style={{ padding: '8px', textAlign: 'right' }}>₹{(receiptData.urea_qty * 266.50).toFixed(2)}</td>
                  </tr>
                )}
                {receiptData.dap_qty > 0 && (
                  <tr style={{ borderBottom: '1px solid #f0fdf4', color: '#1e293b' }}>
                    <td style={{ padding: '8px' }}>🌱 DAP (50kg Bag)</td>
                    <td style={{ padding: '8px', textAlign: 'center' }}>{receiptData.dap_qty}</td>
                    <td style={{ padding: '8px', textAlign: 'right' }}>₹1350.00</td>
                    <td style={{ padding: '8px', textAlign: 'right' }}>₹{(receiptData.dap_qty * 1350.00).toFixed(2)}</td>
                  </tr>
                )}
                {receiptData.npk_qty > 0 && (
                  <tr style={{ borderBottom: '1px solid #f0fdf4', color: '#1e293b' }}>
                    <td style={{ padding: '8px' }}>🌿 NPK (50kg Bag)</td>
                    <td style={{ padding: '8px', textAlign: 'center' }}>{receiptData.npk_qty}</td>
                    <td style={{ padding: '8px', textAlign: 'right' }}>₹1470.00</td>
                    <td style={{ padding: '8px', textAlign: 'right' }}>₹{(receiptData.npk_qty * 1470.00).toFixed(2)}</td>
                  </tr>
                )}
                <tr style={{ background: '#f0fdf4', fontWeight: '800', color: '#14532d' }}>
                  <td colSpan="3" style={{ padding: '10px', textAlign: 'right', borderTop: '2px solid #86efac' }}>
                    Total Amount Paid ({receiptData.payment_mode || 'N/A'}):
                  </td>
                  <td style={{ padding: '10px', textAlign: 'right', borderTop: '2px solid #86efac', fontSize: '15px' }}>
                    ₹{calcTotal(receiptData).toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Footer */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: '12px', borderTop: '1px dashed #cbd5e1', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <div style={{ display: 'inline-block', padding: '5px 14px', background: '#dcfce7', color: '#15803d', border: '1px solid #86efac', borderRadius: '100px', fontSize: '11px', fontWeight: '800', marginBottom: '6px' }}>
                  ✅ SUCCESSFUL COLLECTION CERTIFIED
                </div>
                <div style={{ fontSize: '11px', color: '#374151' }}>
                  Date:{' '}
                  {new Date(receiptData.updated_at || receiptData.created_at).toLocaleDateString('en-IN', {
                    day: '2-digit', month: 'long', year: 'numeric'
                  })}
                </div>
              </div>
              <div style={{ textAlign: 'right', fontSize: '11px', color: '#64748b' }}>
                Distribution Officer Signatory<br />
                <strong style={{ color: '#0f172a' }}>Smart Fertilizer System</strong><br />
                <span style={{ fontSize: '10px' }}>Ministry of Agriculture & Farmers Welfare</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="no-print" style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button
                type="button"
                onClick={() => window.print()}
                style={{ padding: '10px 22px', background: 'linear-gradient(135deg, #15803d, #22c55e)', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 14px rgba(34,197,94,0.3)' }}
              >
                🖨️ Print / Download PDF
              </button>
              <button
                type="button"
                onClick={() => setShowReceiptModal(false)}
                style={{ padding: '10px 18px', background: '#475569', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
              >
                ✕ Close
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes glowPulse { 0%,100%{opacity:0.3;} 50%{opacity:0.5;} }
        @keyframes slideIn { from{opacity:0;transform:translateY(20px);} to{opacity:1;transform:translateY(0);} }
        @keyframes bounceIn { 0%{opacity:0;transform:scale(0.8);} 60%{transform:scale(1.05);} 100%{opacity:1;transform:scale(1);} }
        @keyframes successPop { 0%{opacity:0;transform:translateY(-16px);} 100%{opacity:1;transform:translateY(0);} }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes scanLaser {
          0% { top: 8%; opacity: 0.7; }
          50% { top: 88%; opacity: 1; }
          100% { top: 8%; opacity: 0.7; }
        }
        .laser-scanning-line {
          position: absolute; left: 10%; right: 10%; height: 3px;
          background: #10b981; box-shadow: 0 0 14px #10b981, 0 0 28px #10b981;
          animation: scanLaser 2s ease-in-out infinite; pointer-events: none; z-index: 10;
        }
        #qr-reader-live video {
          border-radius: 12px !important;
          object-fit: cover !important;
        }
        #qr-reader-live__scan_region {
          background: transparent !important;
        }
        #qr-reader-live__dashboard_section_csr button {
          background: rgba(16,185,129,0.2) !important;
          color: #10b981 !important;
          border: 1px solid rgba(16,185,129,0.4) !important;
          padding: 6px 12px !important;
          border-radius: 8px !important;
          font-size: 12px !important;
          cursor: pointer !important;
        }
        input:focus { outline:none; border-color:#3b82f6 !important; box-shadow:0 0 0 3px rgba(59,130,246,0.1) !important; }

        @media print {
          body * { visibility: hidden; }
          .officer-printable-receipt, .officer-printable-receipt * { visibility: visible; }
          .officer-printable-receipt {
            position: absolute; left: 0; top: 0; width: 100%;
            max-width: 100% !important; background: #fff !important;
            color: #000 !important; box-shadow: none !important;
            border: none !important; padding: 20px !important;
            border-radius: 0 !important;
          }
          .no-print { display: none !important; }
        }
      `}</style>
    </div>
  );
};

const styles = {
  page: {
    minHeight: '100vh', background: 'radial-gradient(ellipse at 30% 10%, #0f1f3d 0%, #050a14 60%, #0a0a1a 100%)',
    padding: '24px 20px', fontFamily: "'Inter', sans-serif", position: 'relative',
  },
  glowBg: {
    position: 'fixed', top: '10%', left: '50%', transform: 'translateX(-50%)',
    width: '700px', height: '400px', borderRadius: '50%',
    background: 'radial-gradient(ellipse, rgba(59,130,246,0.08) 0%, transparent 70%)',
    animation: 'glowPulse 5s ease-in-out infinite', pointerEvents: 'none',
  },
  wrapper: { maxWidth: '760px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative', zIndex: 1 },
  headerCard: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(96,165,250,0.15)', borderRadius: '18px', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', backdropFilter: 'blur(16px)' },
  headerLeft: { display: 'flex', alignItems: 'center', gap: '16px' },
  officerAvatar: { fontSize: '36px', width: '58px', height: '58px', background: 'rgba(59,130,246,0.15)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(96,165,250,0.2)', filter: 'drop-shadow(0 0 12px rgba(59,130,246,0.3))' },
  officerBadge: { fontSize: '10px', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase', color: '#93c5fd', marginBottom: '4px' },
  officerName: { margin: '0 0 2px', fontSize: '20px', fontWeight: '800', color: '#fff' },
  officerMeta: { margin: 0, fontSize: '12px', color: 'rgba(255,255,255,0.35)' },
  headerRight: { display: 'flex', gap: '10px' },
  homeBtn: { padding: '8px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'rgba(255,255,255,0.5)', fontSize: '12px', cursor: 'pointer', fontWeight: '600' },
  logoutBtn: { padding: '8px 16px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', color: '#f87171', fontSize: '12px', cursor: 'pointer', fontWeight: '600' },
  verifyCard: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '18px', padding: '28px', backdropFilter: 'blur(12px)' },
  verifyTitle: { margin: '0 0 6px', fontSize: '20px', fontWeight: '800', color: '#fff' },
  verifySub: { margin: '0 0 22px', fontSize: '13px', color: 'rgba(255,255,255,0.4)' },
  verifyForm: { display: 'flex', gap: '12px', flexWrap: 'wrap' },
  inputWrap: { flex: 1, minWidth: '220px', position: 'relative' },
  inputIcon: { position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '16px' },
  tokenInput: { width: '100%', padding: '14px 14px 14px 42px', background: 'rgba(255,255,255,0.05)', border: '1.5px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '14px', color: '#e2e8f0', boxSizing: 'border-box', fontFamily: 'monospace', letterSpacing: '0.5px' },
  scanQrBtn: {
    padding: '11px 18px',
    background: 'linear-gradient(135deg, #059669, #10b981)',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    fontSize: '13px',
    fontWeight: '800',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    boxShadow: '0 4px 14px rgba(16,185,129,0.35)',
    transition: 'all 0.2s ease',
  },
  verifyBtn: { padding: '14px 24px', background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', whiteSpace: 'nowrap', boxShadow: '0 4px 16px rgba(59,130,246,0.35)' },
  errorBox: { marginTop: '14px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', padding: '12px 16px', borderRadius: '10px', fontSize: '13px' },
  successBox: { marginTop: '14px', background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.3)', color: '#86efac', padding: '12px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: '700' },
  collectedSuccessBanner: {
    display: 'flex', alignItems: 'center', gap: '16px',
    background: 'rgba(34,197,94,0.1)', border: '1.5px solid rgba(34,197,94,0.4)',
    borderRadius: '16px', padding: '20px 24px',
    animation: 'successPop 0.5s ease forwards',
  },
  collectedSuccessIcon: { fontSize: '40px', flexShrink: 0 },
  collectedSuccessTitle: { fontSize: '18px', fontWeight: '800', color: '#4ade80', marginBottom: '4px' },
  collectedSuccessSub: { fontSize: '13px', color: 'rgba(255,255,255,0.65)', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' },
  detailCard: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '18px', padding: '28px', backdropFilter: 'blur(12px)', animation: 'slideIn 0.4s ease forwards' },
  detailSection: { marginBottom: '0' },
  detailSectionTitle: { margin: '0 0 16px', fontSize: '15px', fontWeight: '700', color: 'rgba(255,255,255,0.7)', borderLeft: '3px solid rgba(96,165,250,0.5)', paddingLeft: '10px' },
  infoGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' },
  infoItem: { display: 'flex', flexDirection: 'column', gap: '4px', background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.04)' },
  infoLabel: { fontSize: '10px', fontWeight: '700', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.5px' },
  infoValue: { fontSize: '14px', fontWeight: '700', color: '#fff' },
  statusBadge: { display: 'inline-block', fontSize: '12px', fontWeight: '700', padding: '4px 10px', borderRadius: '100px', border: '1px solid', width: 'fit-content' },
  divider: { height: '1px', background: 'rgba(255,255,255,0.05)', margin: '20px 0' },
  orderTable: { display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' },
  orderRow: { display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.04)' },
  orderIcon: { fontSize: '18px', flexShrink: 0 },
  orderName: { flex: 1, fontSize: '14px', fontWeight: '600', color: '#fff' },
  orderQty: { fontSize: '12px', color: 'rgba(255,255,255,0.4)' },
  orderAmt: { fontSize: '14px', fontWeight: '700', color: '#4ade80' },
  totalRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.15)', borderRadius: '10px', marginTop: '4px' },
  totalLabel: { fontSize: '14px', fontWeight: '700', color: 'rgba(255,255,255,0.7)' },
  totalAmt: { fontSize: '22px', fontWeight: '900', color: '#4ade80', letterSpacing: '-0.5px' },
  fulfillBtn: { width: '100%', padding: '16px', background: 'linear-gradient(135deg, #065f46, #059669)', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '800', cursor: 'pointer', marginTop: '20px', boxShadow: '0 4px 20px rgba(5,150,105,0.4)', letterSpacing: '0.3px' },
  collectedNote: {
    marginTop: '20px', padding: '14px 16px',
    background: 'rgba(74,222,128,0.08)', border: '1.5px solid rgba(74,222,128,0.25)',
    borderRadius: '12px', color: '#4ade80', fontSize: '14px', fontWeight: '600',
    textAlign: 'center', width: '100%', cursor: 'pointer',
    transition: 'all 0.2s ease',
    outline: 'none',
  },
  printHint: {
    marginTop: '8px', fontSize: '12px', color: 'rgba(74,222,128,0.55)',
    fontWeight: '500', letterSpacing: '0.2px',
  },
};

const scannerStyles = {
  overlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 9999, padding: '20px',
  },
  card: {
    background: 'linear-gradient(145deg, #0f1f3d, #0a0a1a)',
    border: '1px solid rgba(16,185,129,0.3)',
    borderRadius: '24px', padding: '28px',
    maxWidth: '440px', width: '100%',
    boxShadow: '0 24px 60px rgba(0,0,0,0.8), 0 0 30px rgba(16,185,129,0.15)',
    animation: 'bounceIn 0.35s ease forwards',
    fontFamily: "'Inter', sans-serif",
    position: 'relative',
  },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' },
  headerLeft: { display: 'flex', alignItems: 'center', gap: '12px' },
  title: { margin: '0 0 4px', fontSize: '18px', fontWeight: '800', color: '#fff' },
  subtitle: { margin: 0, fontSize: '12px', color: 'rgba(255,255,255,0.45)' },
  closeBtn: { background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' },
  errorMsg: { background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', padding: '10px 14px', borderRadius: '10px', fontSize: '12px', marginBottom: '14px' },
  viewfinderWrap: {
    position: 'relative', width: '100%', minHeight: '260px',
    background: '#000', borderRadius: '16px', overflow: 'hidden',
    border: '2px solid rgba(16,185,129,0.4)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    marginBottom: '16px',
  },
  uploadSection: { marginBottom: '16px' },
  fileUploadBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
    padding: '12px 16px', background: 'rgba(255,255,255,0.06)',
    border: '1.5px dashed rgba(255,255,255,0.2)', borderRadius: '12px',
    color: '#93c5fd', fontSize: '13px', fontWeight: '600', cursor: 'pointer',
    textAlign: 'center', transition: 'all 0.2s ease', width: '100%', boxSizing: 'border-box'
  },
  cancelBtn: { width: '100%', padding: '12px', background: 'transparent', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }
};

const modalStyles = {
  overlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(12px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 9999, padding: '20px',
  },
  card: {
    background: 'linear-gradient(145deg, #0f1f3d, #0a0a1a)',
    border: '1px solid rgba(96,165,250,0.25)',
    borderRadius: '24px', padding: '32px',
    maxWidth: '480px', width: '100%',
    boxShadow: '0 24px 60px rgba(0,0,0,0.7)',
    animation: 'bounceIn 0.35s ease forwards',
    fontFamily: "'Inter', sans-serif",
    position: 'relative',
  },
  header: { display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' },
  headerIcon: { fontSize: '36px', background: 'rgba(59,130,246,0.15)', padding: '10px', borderRadius: '14px', border: '1px solid rgba(96,165,250,0.2)' },
  title: { margin: '0 0 4px', fontSize: '20px', fontWeight: '800', color: '#fff' },
  subtitle: { margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.45)' },
  optionsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '20px' },
  optionBtn: {
    position: 'relative',
    padding: '16px 10px', border: '2px solid',
    borderRadius: '14px', cursor: 'pointer',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    transition: 'all 0.2s ease', textAlign: 'center',
  },
  cashBox: {
    background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.3)',
    borderRadius: '14px', padding: '18px', marginBottom: '16px',
    animation: 'slideIn 0.3s ease',
  },
  cashIcon: { fontSize: '28px', textAlign: 'center', marginBottom: '8px' },
  cashText: { margin: '0 0 10px', fontSize: '14px', color: 'rgba(255,255,255,0.8)', textAlign: 'center', lineHeight: '1.5' },
  cashNote: { fontSize: '12px', color: '#fbbf24', background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: '8px', padding: '8px 12px', marginBottom: '14px', textAlign: 'center' },
  agreeBtn: { width: '100%', padding: '14px', background: 'linear-gradient(135deg, #065f46, #059669)', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '800', cursor: 'pointer', boxShadow: '0 4px 16px rgba(5,150,105,0.4)' },
  collectBtn: { width: '100%', padding: '16px', background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: '800', cursor: 'pointer', marginBottom: '10px', boxShadow: '0 4px 20px rgba(59,130,246,0.4)', animation: 'slideIn 0.3s ease' },
  cancelBtn: { width: '100%', padding: '12px', background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' },
};

const receiptStyles = {
  overlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 9999, padding: '20px',
  },
  modalCard: {
    background: '#ffffff', color: '#0f172a', borderRadius: '16px',
    padding: '24px 28px', maxWidth: '580px', width: '100%',
    boxShadow: '0 20px 50px rgba(0,0,0,0.5)', maxHeight: '90vh', overflowY: 'auto',
    animation: 'bounceIn 0.3s ease forwards',
  },
};

export default OfficerPortal;