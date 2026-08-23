const QRCode = require('qrcode');
const Booking = require('../models/booking');
const Allocation = require('../models/allocation');
const Godown = require('../models/godown');
const Farmer = require('../models/farmer');

// @desc    Get List of Active Fertilizer Godowns
// @route   GET /api/booking/godowns
exports.getGodowns = async (req, res) => {
  try {
    const godowns = await Godown.find({ is_active: true }).sort({ name: 1 });
    res.status(200).json({
      status: 'SUCCESS',
      godowns: godowns.map(g => ({
        id: g._id,
        _id: g._id,
        name: g.name,
        location: g.location,
        district: g.district,
        state: g.state,
        contact_no: g.contact_no,
        urea_stock: g.urea_stock,
        dap_stock: g.dap_stock,
        npk_stock: g.npk_stock
      }))
    });
  } catch (error) {
    console.error('Fetch Godowns Error:', error);
    res.status(500).json({ status: 'ERROR', message: 'Failed to fetch godowns list.' });
  }
};

// @desc    Create a Fertilizer Booking & Generate QR Code Token
// @route   POST /api/booking/create
exports.createBooking = async (req, res) => {
  try {
    const farmerId = req.user.id;
    const { godown_id, urea_qty, dap_qty, npk_qty } = req.body;

    const uQty = parseInt(urea_qty, 10) || 0;
    const dQty = parseInt(dap_qty, 10) || 0;
    const nQty = parseInt(npk_qty, 10) || 0;

    if (uQty === 0 && dQty === 0 && nQty === 0) {
      return res.status(400).json({ status: 'FAIL', message: 'Please select at least 1 bag to book.' });
    }

    if (!godown_id) {
      return res.status(400).json({ status: 'FAIL', message: 'Please select a distribution godown.' });
    }

    // 1. Fetch total allocation for farmer
    const quota = await Allocation.findOne({ farmer_id: farmerId });
    if (!quota) {
      return res.status(400).json({ status: 'FAIL', message: 'No allocation record found.' });
    }

    // 2. Calculate how much farmer has already booked (BOOKED + COLLECTED)
    const existingBookings = await Booking.find({
      farmer_id: farmerId,
      status: { $in: ['BOOKED', 'COLLECTED'] }
    });

    let ureaUsed = 0;
    let dapUsed = 0;
    let npkUsed = 0;

    for (const b of existingBookings) {
      ureaUsed += (b.urea_qty || 0);
      dapUsed += (b.dap_qty || 0);
      npkUsed += (b.npk_qty || 0);
    }

    // 3. True remaining
    const ureaLeft = Math.max(0, quota.urea_allocated - ureaUsed);
    const dapLeft = Math.max(0, quota.dap_allocated - dapUsed);
    const npkLeft = Math.max(0, quota.npk_allocated - npkUsed);

    if (uQty > ureaLeft || dQty > dapLeft || nQty > npkLeft) {
      return res.status(400).json({
        status: 'FAIL',
        message: `Requested quantity exceeds your remaining quota. Available: Urea=${ureaLeft}, DAP=${dapLeft}, NPK=${npkLeft} bags.`
      });
    }

    // 4. Generate Unique Booking Reference & Pickup Date (3 days from now)
    const booking_ref = `TKN-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;
    const pickup_date = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // 5. Generate QR Code
    const qrPayload = JSON.stringify({
      token: booking_ref,
      farmer_id: farmerId,
      farmer_code: req.user.custom_id,
      urea: uQty,
      dap: dQty,
      npk: nQty,
      valid_till: pickup_date
    });
    const qr_code_base64 = await QRCode.toDataURL(qrPayload);

    // 6. Save Booking Record
    const booking = await Booking.create({
      booking_ref,
      farmer_id: farmerId,
      godown_id,
      urea_qty: uQty,
      dap_qty: dQty,
      npk_qty: nQty,
      status: 'BOOKED',
      qr_code_data: qr_code_base64,
      pickup_date
    });

    res.status(201).json({
      status: 'SUCCESS',
      message: 'Booking confirmed! QR Token generated.',
      booking: {
        id: booking._id,
        _id: booking._id,
        booking_ref,
        urea_qty: uQty,
        dap_qty: dQty,
        npk_qty: nQty,
        qr_code: qr_code_base64,
        qr_code_data: qr_code_base64,
        pickup_date
      }
    });
  } catch (error) {
    console.error('Booking Creation Error:', error);
    res.status(500).json({ status: 'ERROR', message: error.message || 'Failed to complete booking request.' });
  }
};

// @desc    Get All Bookings for Logged-in Farmer
// @route   GET /api/booking/my-bookings
exports.getMyBookings = async (req, res) => {
  try {
    const farmerId = req.user.id;
    const bookings = await Booking.find({ farmer_id: farmerId })
      .populate('godown_id')
      .sort({ created_at: -1 });

    const formattedBookings = bookings.map(b => ({
      id: b._id,
      _id: b._id,
      booking_ref: b.booking_ref,
      farmer_id: b.farmer_id,
      godown_id: b.godown_id?._id,
      godown_name: b.godown_id?.name || 'Central Store',
      godown_location: b.godown_id?.location || '',
      urea_qty: b.urea_qty,
      dap_qty: b.dap_qty,
      npk_qty: b.npk_qty,
      status: b.status,
      payment_mode: b.payment_mode,
      qr_code_data: b.qr_code_data,
      pickup_date: b.pickup_date,
      created_at: b.created_at,
      updated_at: b.updated_at
    }));

    res.status(200).json({ status: 'SUCCESS', bookings: formattedBookings });
  } catch (error) {
    console.error('Fetch Bookings Error:', error);
    res.status(500).json({ status: 'ERROR', message: error.message || 'Failed to fetch bookings history.' });
  }
};