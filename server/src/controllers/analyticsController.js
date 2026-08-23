const Godown = require('../models/godown');
const Booking = require('../models/booking');
const Farmer = require('../models/farmer');

// @desc    Get Overall System Distribution & Inventory Metrics
// @route   GET /api/analytics/summary
exports.getSummaryMetrics = async (req, res) => {
  try {
    // 1. Total inventory stock across all godowns
    const godownsList = await Godown.find().sort({ name: 1 });

    let total_urea_stock = 0;
    let total_dap_stock = 0;
    let total_npk_stock = 0;

    for (const g of godownsList) {
      total_urea_stock += (g.urea_stock || 0);
      total_dap_stock += (g.dap_stock || 0);
      total_npk_stock += (g.npk_stock || 0);
    }

    // 2. Booking statistics
    const bookings = await Booking.find();

    let total_bookings = bookings.length;
    let collected_bookings = 0;
    let pending_bookings = 0;
    let total_urea_booked = 0;
    let total_dap_booked = 0;
    let total_npk_booked = 0;

    for (const b of bookings) {
      if (b.status === 'COLLECTED') {
        collected_bookings++;
      } else if (b.status === 'BOOKED') {
        pending_bookings++;
      }
      total_urea_booked += (b.urea_qty || 0);
      total_dap_booked += (b.dap_qty || 0);
      total_npk_booked += (b.npk_qty || 0);
    }

    // 3. Registered farmers count
    const total_farmers = await Farmer.countDocuments();

    res.status(200).json({
      status: 'SUCCESS',
      data: {
        total_farmers,
        inventory: {
          urea: total_urea_stock,
          dap: total_dap_stock,
          npk: total_npk_stock
        },
        bookings: {
          total: total_bookings,
          collected: collected_bookings,
          pending: pending_bookings,
          urea_booked: total_urea_booked,
          dap_booked: total_dap_booked,
          npk_booked: total_npk_booked
        },
        godowns: godownsList.map(g => ({
          id: g._id,
          _id: g._id,
          name: g.name,
          location: g.location,
          district: g.district,
          state: g.state,
          urea_stock: g.urea_stock,
          dap_stock: g.dap_stock,
          npk_stock: g.npk_stock
        }))
      }
    });
  } catch (error) {
    console.error('Analytics Summary Error:', error);
    res.status(500).json({ status: 'ERROR', message: error.message || 'Failed to fetch analytics metrics.' });
  }
};