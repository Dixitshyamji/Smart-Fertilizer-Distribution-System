require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const Farmer = require('../models/farmer');
const Allocation = require('../models/allocation');
const Godown = require('../models/godown');
const Booking = require('../models/booking');
const Officer = require('../models/officer');

const defaultGodowns = [
  {
    name: 'Aamtara Fertilizer Store',
    location: 'Main Market Aamtara',
    district: 'Hardoi',
    state: 'Uttar Pradesh',
    contact_no: '9876541100',
    urea_stock: 800,
    dap_stock: 600,
    npk_stock: 500,
    is_active: true
  },
  {
    name: 'Shahabad Fertilizer Store',
    location: 'Near tehsil office, Shahabad',
    district: 'Hardoi',
    state: 'Uttar Pradesh',
    contact_no: '9876542200',
    urea_stock: 500,
    dap_stock: 400,
    npk_stock: 300,
    is_active: true
  },
  {
    name: 'Lucknow Regional Warehouse',
    location: 'Transport Nagar, Lucknow',
    district: 'Lucknow',
    state: 'Uttar Pradesh',
    contact_no: '9876543300',
    urea_stock: 1000,
    dap_stock: 800,
    npk_stock: 700,
    is_active: true
  }
];

const seedDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('MONGODB_URI missing in .env');
    }

    await mongoose.connect(uri, {
      dbName: process.env.DB_NAME || 'smart_fertilizer_db'
    });
    console.log('🔄 Connected to MongoDB Atlas. Resetting collections...');

    // Clear existing data
    await Farmer.deleteMany({});
    await Allocation.deleteMany({});
    await Godown.deleteMany({});
    await Booking.deleteMany({});
    await Officer.deleteMany({});
    console.log('🗑️ Cleared old database collections.');

    // 1. Seed Godowns
    await Godown.insertMany(defaultGodowns);
    console.log('📦 Seeded 3 Godowns.');

    // 2. Seed Officer
    await Officer.create({
      name: 'Ram Singh (District Officer)',
      username: 'officer',
      password: 'officer123',
      badge: 'OFF-001'
    });
    console.log('👮 Seeded default Officer (officer / officer123).');

    // 3. Seed Passwords & Sample Farmers
    const salt = await bcrypt.genSalt(10);
    const passHash = await bcrypt.hash('Password123', salt);
    const aadhHash1 = await bcrypt.hash('123456789012', salt);
    const aadhHash2 = await bcrypt.hash('987654321098', salt);

    // Large Farmer
    const farmer1 = await Farmer.create({
      farmer_custom_id: 'FRM-2026-1001',
      name: 'Rameshwar Singh (Large Farmer)',
      mobile: '9876543210',
      password_hash: passHash,
      aadhaar_hash: aadhHash1,
      village: 'Pipri',
      district: 'Hardoi',
      state: 'Uttar Pradesh',
      land_area_acres: 25.0,
      crop_type: 'Paddy'
    });

    await Allocation.create({
      farmer_id: farmer1._id,
      urea_allocated: 50,
      dap_allocated: 50,
      npk_allocated: 25,
      urea_remaining: 50,
      dap_remaining: 50,
      npk_remaining: 25,
      season: '2026-Kharif'
    });

    // Medium Farmer
    const farmer2 = await Farmer.create({
      farmer_custom_id: 'FRM-2026-1002',
      name: 'Suresh Kumar',
      mobile: '9123456789',
      password_hash: passHash,
      aadhaar_hash: aadhHash2,
      village: 'Bilgram',
      district: 'Hardoi',
      state: 'Uttar Pradesh',
      land_area_acres: 5.0,
      crop_type: 'Wheat'
    });

    await Allocation.create({
      farmer_id: farmer2._id,
      urea_allocated: 10,
      dap_allocated: 5,
      npk_allocated: 5,
      urea_remaining: 10,
      dap_remaining: 5,
      npk_remaining: 5,
      season: '2026-Kharif'
    });

    console.log('🎉 MongoDB Atlas Data Reset & Seeded Successfully!');
    console.log('----------------------------------------------------');
    console.log('👨‍🌾 Sample Farmer:');
    console.log('   Farmer ID : FRM-2026-1001');
    console.log('   Mobile    : 9876543210');
    console.log('   Password  : Password123');
    console.log('----------------------------------------------------');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

seedDB();