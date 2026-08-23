const Farmer = require('../models/farmer');
const Allocation = require('../models/allocation');
const Booking = require('../models/booking');
const Godown = require('../models/godown');
const { calculateQuota } = require('../utils/fertilizerCalculator');

// @desc    Get Calculated Quota and Remaining Allowance for Farmer
// @route   GET /api/allocation/quota (or /api/allocation/my-quota)
exports.getQuota = async (req, res) => {
  try {
    const farmerId = req.user.id;

    // 1. Fetch farmer details
    const farmer = await Farmer.findById(farmerId);
    if (!farmer) {
      return res.status(404).json({ status: 'FAIL', message: 'Farmer record not found.' });
    }

    // 2. Fetch or create allocation record
    let quotaData = await Allocation.findOne({ farmer_id: farmerId });

    const calculated = calculateQuota(farmer.land_area_acres, farmer.crop_type);
    const ureaAlloc = calculated.urea_bags;
    const dapAlloc = calculated.dap_bags;
    const npkAlloc = calculated.npk_bags;

    if (quotaData) {
      if (
        quotaData.urea_allocated !== ureaAlloc ||
        quotaData.dap_allocated !== dapAlloc ||
        quotaData.npk_allocated !== npkAlloc
      ) {
        quotaData.urea_allocated = ureaAlloc;
        quotaData.dap_allocated = dapAlloc;
        quotaData.npk_allocated = npkAlloc;
        await quotaData.save();
      }
    } else {
      quotaData = await Allocation.create({
        farmer_id: farmerId,
        urea_allocated: ureaAlloc,
        dap_allocated: dapAlloc,
        npk_allocated: npkAlloc,
        urea_remaining: ureaAlloc,
        dap_remaining: dapAlloc,
        npk_remaining: npkAlloc,
        season: '2026-Kharif'
      });
    }

    // 3. Compute accurate usage from bookings
    const bookings = await Booking.find({ farmer_id: farmerId });

    let urea_collected = 0;
    let dap_collected = 0;
    let npk_collected = 0;
    let urea_pending = 0;
    let dap_pending = 0;
    let npk_pending = 0;

    for (const b of bookings) {
      if (b.status === 'COLLECTED') {
        urea_collected += (b.urea_qty || 0);
        dap_collected += (b.dap_qty || 0);
        npk_collected += (b.npk_qty || 0);
      } else if (b.status === 'BOOKED') {
        urea_pending += (b.urea_qty || 0);
        dap_pending += (b.dap_qty || 0);
        npk_pending += (b.npk_qty || 0);
      }
    }

    const trueUreaRemaining = Math.max(0, quotaData.urea_allocated - urea_collected - urea_pending);
    const trueDapRemaining = Math.max(0, quotaData.dap_allocated - dap_collected - dap_pending);
    const trueNpkRemaining = Math.max(0, quotaData.npk_allocated - npk_collected - npk_pending);

    res.status(200).json({
      status: 'SUCCESS',
      crop_type: farmer.crop_type,
      land_area_acres: farmer.land_area_acres,
      allocation: {
        id: quotaData._id,
        _id: quotaData._id,
        farmer_id: farmerId,
        urea_allocated: quotaData.urea_allocated,
        dap_allocated: quotaData.dap_allocated,
        npk_allocated: quotaData.npk_allocated,
        urea_remaining: trueUreaRemaining,
        dap_remaining: trueDapRemaining,
        npk_remaining: trueNpkRemaining,
        urea_collected,
        dap_collected,
        npk_collected,
        urea_pending,
        dap_pending,
        npk_pending,
      },
      data: {
        land_area: farmer.land_area_acres,
        quota: {
          urea: trueUreaRemaining,
          dap: trueDapRemaining,
          npk: trueNpkRemaining,
          urea_total: quotaData.urea_allocated,
          dap_total: quotaData.dap_allocated,
          npk_total: quotaData.npk_allocated
        }
      }
    });
  } catch (error) {
    console.error('Fetch Quota Error:', error);
    res.status(500).json({ status: 'ERROR', message: error.message || 'Failed to calculate quota.' });
  }
};

// @desc    Get List of Active Godowns for Dropdown Selection
// @route   GET /api/allocation/godowns
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
    res.status(500).json({ status: 'ERROR', message: error.message || 'Failed to fetch godowns list.' });
  }
};