const bcrypt = require('bcryptjs');
const Farmer = require('../models/farmer');
const Allocation = require('../models/allocation');
const { generateFarmerId, generateToken } = require('../utils/authUtils');
const { calculateQuota } = require('../utils/fertilizerCalculator');

// @desc    Register a new Farmer
// @route   POST /api/auth/farmer/register
exports.registerFarmer = async (req, res) => {
  try {
    const {
      name,
      mobile,
      password,
      aadhaar_number,
      village,
      district,
      state,
      land_area_acres,
      crop_type
    } = req.body;

    // 1. Basic validation
    if (!name || !mobile || !password || !aadhaar_number || !land_area_acres || !crop_type) {
      return res.status(400).json({
        status: 'FAIL',
        message: 'Please fill all required fields.'
      });
    }

    // 2. Strong Password Validation
    const strongPasswordRegex = /^(?=.*[A-Za-z])(?=.*\d).{6,}$/;
    if (!strongPasswordRegex.test(password)) {
      return res.status(400).json({
        status: 'FAIL',
        message: 'Password must be at least 6 characters long and contain both letters and numbers.'
      });
    }

    // 3. Check if farmer already exists by mobile
    const existing = await Farmer.findOne({ mobile: mobile.trim() });
    if (existing) {
      return res.status(400).json({
        status: 'FAIL',
        message: 'A farmer with this mobile number is already registered.'
      });
    }

    // 4. Hash Password & Aadhaar for security
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);
    const aadhaar_hash = await bcrypt.hash(aadhaar_number.trim(), salt);

    // 5. Generate unique Farmer Custom ID
    const farmer_custom_id = generateFarmerId();

    // 6. Insert into MongoDB Atlas
    const landNum = parseFloat(land_area_acres) || 1.0;
    const farmer = await Farmer.create({
      farmer_custom_id,
      name: name.trim(),
      mobile: mobile.trim(),
      password_hash,
      aadhaar_hash,
      village: village?.trim() || 'Default Village',
      district: district?.trim() || 'Hardoi',
      state: state?.trim() || 'Uttar Pradesh',
      land_area_acres: landNum,
      crop_type: crop_type.trim()
    });

    // 7. Auto-calculate and create quota allocation
    const calculated = calculateQuota(landNum, crop_type);
    await Allocation.create({
      farmer_id: farmer._id,
      urea_allocated: calculated.urea_bags,
      dap_allocated: calculated.dap_bags,
      npk_allocated: calculated.npk_bags,
      urea_remaining: calculated.urea_bags,
      dap_remaining: calculated.dap_bags,
      npk_remaining: calculated.npk_bags,
      season: '2026-Kharif'
    });

    // 8. Generate JWT
    const token = generateToken({
      id: farmer._id.toString(),
      custom_id: farmer_custom_id,
      role: 'FARMER'
    });

    res.status(201).json({
      status: 'SUCCESS',
      message: 'Farmer registered successfully on MongoDB Atlas!',
      token,
      farmer: {
        id: farmer._id,
        farmer_custom_id,
        name: farmer.name,
        mobile: farmer.mobile,
        village: farmer.village,
        district: farmer.district,
        state: farmer.state,
        land_area_acres: farmer.land_area_acres,
        crop_type: farmer.crop_type
      }
    });
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({
      status: 'ERROR',
      message: error.message || 'Server error during farmer registration.'
    });
  }
};

// @desc    Farmer Login
// @route   POST /api/auth/farmer/login
exports.loginFarmer = async (req, res) => {
  try {
    const { identifier, mobile, password } = req.body;
    const loginId = (identifier || mobile || '').trim();

    if (!loginId || !password) {
      return res.status(400).json({
        status: 'FAIL',
        message: 'Farmer ID / Aadhaar / Mobile number and password are required.'
      });
    }

    // 0. Auto-handle Demo Farmer credentials for instant presentations/testing
    const isDemoId = ['9876543210', 'FRM-2026-1001', '123456789012'].includes(loginId);
    const isDemoPass = ['Password123', 'password123', 'Password@123'].includes(password);

    if (isDemoId && isDemoPass) {
      let demoFarmer = await Farmer.findOne({
        $or: [
          { farmer_custom_id: 'FRM-2026-1001' },
          { mobile: '9876543210' }
        ]
      });

      if (!demoFarmer) {
        const salt = await bcrypt.genSalt(10);
        const passHash = await bcrypt.hash('Password123', salt);
        const aadhHash = await bcrypt.hash('123456789012', salt);

        demoFarmer = await Farmer.create({
          farmer_custom_id: 'FRM-2026-1001',
          name: 'Rameshwar Singh (Large Farmer)',
          mobile: '9876543210',
          password_hash: passHash,
          aadhaar_hash: aadhHash,
          village: 'Pipri',
          district: 'Hardoi',
          state: 'Uttar Pradesh',
          land_area_acres: 25.0,
          crop_type: 'Paddy'
        });

        await Allocation.create({
          farmer_id: demoFarmer._id,
          urea_allocated: 50,
          dap_allocated: 50,
          npk_allocated: 25,
          urea_remaining: 50,
          dap_remaining: 50,
          npk_remaining: 25,
          season: '2026-Kharif'
        });
      }

      const token = generateToken({
        id: demoFarmer._id.toString(),
        custom_id: demoFarmer.farmer_custom_id,
        role: 'FARMER'
      });

      return res.status(200).json({
        status: 'SUCCESS',
        message: 'Login successful (Demo Account)!',
        token,
        farmer: {
          id: demoFarmer._id,
          farmer_custom_id: demoFarmer.farmer_custom_id,
          name: demoFarmer.name,
          mobile: demoFarmer.mobile,
          village: demoFarmer.village,
          district: demoFarmer.district,
          state: demoFarmer.state,
          land_area_acres: demoFarmer.land_area_acres,
          crop_type: demoFarmer.crop_type
        }
      });
    }

    // 1. Check farmer by custom ID OR mobile
    let farmer = await Farmer.findOne({
      $or: [
        { farmer_custom_id: loginId },
        { mobile: loginId }
      ]
    });

    // 2. If not found and loginId is 12 digits, check Aadhaar hash
    if (!farmer && loginId.length === 12 && /^\d+$/.test(loginId)) {
      const allFarmers = await Farmer.find();
      for (const f of allFarmers) {
        if (f.aadhaar_hash) {
          const matchAadhaar = await bcrypt.compare(loginId, f.aadhaar_hash);
          if (matchAadhaar) {
            farmer = f;
            break;
          }
        }
      }
    }

    if (!farmer) {
      return res.status(401).json({
        status: 'FAIL',
        message: 'Invalid Farmer ID / Mobile / Aadhaar or password.'
      });
    }

    // 3. Verify Password
    const isMatch = await bcrypt.compare(password, farmer.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        status: 'FAIL',
        message: 'Invalid Farmer ID / Mobile / Aadhaar or password.'
      });
    }

    // 4. Generate JWT
    const token = generateToken({
      id: farmer._id.toString(),
      custom_id: farmer.farmer_custom_id,
      role: 'FARMER'
    });

    res.status(200).json({
      status: 'SUCCESS',
      message: 'Login successful!',
      token,
      farmer: {
        id: farmer._id,
        farmer_custom_id: farmer.farmer_custom_id,
        name: farmer.name,
        mobile: farmer.mobile,
        village: farmer.village,
        district: farmer.district,
        state: farmer.state,
        land_area_acres: farmer.land_area_acres,
        crop_type: farmer.crop_type
      }
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({
      status: 'ERROR',
      message: error.message || 'Server error during login.'
    });
  }
};

// @desc    Get Current Logged in User Profile
// @route   GET /api/auth/me
exports.getMe = async (req, res) => {
  try {
    if (req.user.role === 'FARMER') {
      const farmer = await Farmer.findById(req.user.id).select('-password_hash -aadhaar_hash');
      if (!farmer) {
        return res.status(404).json({ status: 'FAIL', message: 'User not found.' });
      }
      return res.status(200).json({
        status: 'SUCCESS',
        user: {
          id: farmer._id,
          ...farmer.toJSON(),
          role: 'FARMER'
        }
      });
    }

    res.status(400).json({ status: 'FAIL', message: 'Invalid role.' });
  } catch (error) {
    console.error('Get Me Error:', error);
    res.status(500).json({ status: 'ERROR', message: 'Server error.' });
  }
};