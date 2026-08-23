const mongoose = require('mongoose');

const farmerSchema = new mongoose.Schema({
  farmer_custom_id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  mobile: { type: String, required: true, unique: true },
  password_hash: { type: String, required: true },
  aadhaar_hash: { type: String, required: true },
  village: { type: String, default: 'Default Village' },
  district: { type: String, default: 'Hardoi' },
  state: { type: String, default: 'Uttar Pradesh' },
  land_area_acres: { type: Number, required: true, default: 1.0 },
  crop_type: { type: String, required: true, default: 'Paddy' }
}, { 
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

module.exports = mongoose.model('Farmer', farmerSchema);