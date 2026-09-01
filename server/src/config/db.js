const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const Godown = require('../models/godown');

const initialGodowns = [
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

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      console.error('❌ MONGODB_URI is not set in server/.env');
      return;
    }

    const conn = await mongoose.connect(uri, {
      dbName: process.env.DB_NAME || 'smart_fertilizer_db',
      serverSelectionTimeoutMS: 7000,
      maxPoolSize: 10,
      socketTimeoutMS: 45000,
      autoIndex: process.env.NODE_ENV !== 'production'
    });

    console.log(`✅ MongoDB Atlas Connected: ${conn.connection.host} / Database: ${conn.connection.name}`);

    // Auto-seed default godowns if empty
    const count = await Godown.countDocuments();
    if (count === 0) {
      await Godown.insertMany(initialGodowns);
      console.log('📦 Auto-seeded default Godowns to MongoDB Atlas.');
    }

    // Auto-seed demo farmer if not present
    const Farmer = require('../models/farmer');
    const Allocation = require('../models/allocation');
    const bcrypt = require('bcryptjs');

    const demoFarmerExists = await Farmer.findOne({ mobile: '9876543210' });
    if (!demoFarmerExists) {
      const salt = await bcrypt.genSalt(10);
      const passHash = await bcrypt.hash('Password123', salt);
      const aadhHash = await bcrypt.hash('123456789012', salt);

      const demoFarmer = await Farmer.create({
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
      console.log('👨‍🌾 Auto-seeded Demo Farmer (Mobile: 9876543210 / Password: Password123 / ID: FRM-2026-1001)');
    }
  } catch (error) {
    console.error(`❌ MongoDB Atlas Connection Error: ${error.message}`);
    console.error(`👉 TIP: Make sure your IP is whitelisted in MongoDB Atlas Network Access (0.0.0.0/0).`);
  }
};

module.exports = connectDB;