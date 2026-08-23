const mongoose = require('mongoose');

const allocationSchema = new mongoose.Schema({
  farmer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Farmer', required: true, unique: true },
  urea_allocated: { type: Number, default: 0 },
  dap_allocated: { type: Number, default: 0 },
  npk_allocated: { type: Number, default: 0 },
  urea_remaining: { type: Number, default: 0 },
  dap_remaining: { type: Number, default: 0 },
  npk_remaining: { type: Number, default: 0 },
  season: { type: String, default: '2026-Kharif' }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

module.exports = mongoose.model('Allocation', allocationSchema);
