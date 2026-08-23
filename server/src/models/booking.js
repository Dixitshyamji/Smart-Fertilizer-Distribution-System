const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  booking_ref: { type: String, required: true, unique: true },
  farmer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Farmer', required: true },
  godown_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Godown', required: true },
  urea_qty: { type: Number, default: 0 },
  dap_qty: { type: Number, default: 0 },
  npk_qty: { type: Number, default: 0 },
  status: { type: String, enum: ['BOOKED', 'COLLECTED', 'CANCELLED'], default: 'BOOKED' },
  payment_mode: { type: String, default: null },
  qr_code_data: { type: String },
  pickup_date: { type: String }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

module.exports = mongoose.model('Booking', bookingSchema);
