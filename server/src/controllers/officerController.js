const Booking = require('../models/booking');
const Farmer = require('../models/farmer');
const Godown = require('../models/godown');
const Allocation = require('../models/allocation');
const { sendSMS } = require('../utils/smsService');

// @desc    Verify Booking Token by Reference or QR Code Data
// @route   POST /api/officer/verify-token
exports.verifyToken = async (req, res) => {
  try {
    let { token } = req.body;

    if (!token) {
      return res.status(400).json({ status: 'FAIL', message: 'Token reference is required.' });
    }

    token = String(token).trim();

    // If token string is JSON from scanned QR Code, parse it
    if (token.startsWith('{') && token.endsWith('}')) {
      try {
        const parsed = JSON.parse(token);
        if (parsed.token) token = parsed.token.trim();
      } catch (e) {
        // ignore parse error, use raw string
      }
    }

    // 1. Search by exact booking_ref
    let bookings = await Booking.find({ booking_ref: token })
      .populate('farmer_id')
      .populate('godown_id');

    // 2. If not found by booking_ref, search if token is farmer_custom_id or mobile
    if (bookings.length === 0) {
      const farmer = await Farmer.findOne({
        $or: [{ farmer_custom_id: token }, { mobile: token }]
      });

      if (farmer) {
        bookings = await Booking.find({ farmer_id: farmer._id })
          .populate('farmer_id')
          .populate('godown_id')
          .sort({ status: 1, created_at: -1 });
      }
    }

    if (bookings.length === 0) {
      return res.status(404).json({
        status: 'FAIL',
        message: 'Invalid token reference or farmer record not found.'
      });
    }

    // Sort: BOOKED before COLLECTED, newest first
    bookings.sort((a, b) => {
      if (a.booking_ref === token) return -1;
      if (b.booking_ref === token) return 1;
      if (a.status === 'BOOKED' && b.status !== 'BOOKED') return -1;
      if (b.status === 'BOOKED' && a.status !== 'BOOKED') return 1;
      return new Date(b.created_at) - new Date(a.created_at);
    });

    const formatBookingObj = (b) => {
      const f = b.farmer_id || {};
      const g = b.godown_id || {};
      return {
        id: b._id,
        _id: b._id,
        booking_ref: b.booking_ref,
        farmer_id: f._id || b.farmer_id,
        godown_id: g._id || b.godown_id,
        urea_qty: b.urea_qty,
        dap_qty: b.dap_qty,
        npk_qty: b.npk_qty,
        status: b.status,
        payment_mode: b.payment_mode,
        qr_code_data: b.qr_code_data,
        pickup_date: b.pickup_date,
        created_at: b.created_at,
        updated_at: b.updated_at,
        farmer_name: f.name || 'Registered Farmer',
        farmer_custom_id: f.farmer_custom_id || `FRM-${b.farmer_id}`,
        mobile_no: f.mobile || '',
        mobile: f.mobile || '',
        village: f.village || '',
        district: f.district || '',
        state: f.state || '',
        land_area_acres: f.land_area_acres || 0,
        crop_type: f.crop_type || 'Paddy',
        godown_name: g.name || 'Central Store',
        godown_location: g.location || ''
      };
    };

    const primaryBooking = formatBookingObj(bookings[0]);
    const allBookings = bookings.map(formatBookingObj);

    res.status(200).json({
      status: 'SUCCESS',
      booking: primaryBooking,
      all_bookings: allBookings
    });
  } catch (error) {
    console.error('Verify Token Error:', error);
    res.status(500).json({ status: 'ERROR', message: error.message || 'Verification failed.' });
  }
};

// @desc    Complete Distribution & Deduct Real-Time Stock
// @route   POST /api/officer/fulfill-booking
exports.fulfillBooking = async (req, res) => {
  try {
    const { booking_id, payment_mode } = req.body;

    const validModes = ['Cash', 'UPI', 'PhonePe'];
    const payMode = validModes.includes(payment_mode) ? payment_mode : 'Cash';

    // 1. Fetch current booking details
    const booking = await Booking.findById(booking_id);
    if (!booking) {
      return res.status(404).json({ status: 'FAIL', message: 'Booking not found.' });
    }

    if (booking.status === 'COLLECTED') {
      return res.status(400).json({ status: 'FAIL', message: 'This token has already been fulfilled/collected!' });
    }

    // 2. Update booking status to COLLECTED and save payment mode
    booking.status = 'COLLECTED';
    booking.payment_mode = payMode;
    await booking.save();

    // 3. Deduct stock from Godown inventory
    if (booking.godown_id) {
      const godown = await Godown.findById(booking.godown_id);
      if (godown) {
        godown.urea_stock = Math.max(0, (godown.urea_stock || 0) - (booking.urea_qty || 0));
        godown.dap_stock  = Math.max(0, (godown.dap_stock  || 0) - (booking.dap_qty  || 0));
        godown.npk_stock  = Math.max(0, (godown.npk_stock  || 0) - (booking.npk_qty  || 0));
        await godown.save();
      }
    }

    // 4. Update the farmer's allocations remaining
    if (booking.farmer_id) {
      const allocation = await Allocation.findOne({ farmer_id: booking.farmer_id });
      if (allocation) {
        allocation.urea_remaining = Math.max(0, (allocation.urea_remaining || 0) - (booking.urea_qty || 0));
        allocation.dap_remaining  = Math.max(0, (allocation.dap_remaining  || 0) - (booking.dap_qty  || 0));
        allocation.npk_remaining  = Math.max(0, (allocation.npk_remaining  || 0) - (booking.npk_qty  || 0));
        await allocation.save();
      }
    }

    // 5. Send SMS notification to farmer registered mobile
    let smsSent = false;
    try {
      const farmer = await Farmer.findById(booking.farmer_id);
      if (farmer && farmer.mobile) {
        const itemParts = [];
        if (booking.urea_qty > 0) itemParts.push(`Urea: ${booking.urea_qty} bags`);
        if (booking.dap_qty  > 0) itemParts.push(`DAP: ${booking.dap_qty} bags`);
        if (booking.npk_qty  > 0) itemParts.push(`NPK: ${booking.npk_qty} bags`);
        const itemSummary = itemParts.join(', ');

        const smsMessage =
          `Dear ${farmer.name || 'Farmer'}, your fertilizer stock (${itemSummary}) has been successfully collected against token ${booking.booking_ref}. Payment mode: ${payMode}. Thank you for using Smart Fertilizer System - Ministry of Agriculture.`;

        smsSent = await sendSMS(farmer.mobile, smsMessage);
      }
    } catch (smsErr) {
      console.error('SMS notification error (non-critical):', smsErr.message);
    }

    res.status(200).json({
      status: 'SUCCESS',
      message: '✅ Fertilizer successfully collected! Stock updated on MongoDB Atlas.',
      payment_mode: payMode,
      sms_sent: smsSent
    });
  } catch (error) {
    console.error('Fulfill Booking Error:', error);
    res.status(500).json({ status: 'ERROR', message: error.message || 'Failed to process distribution.' });
  }
};