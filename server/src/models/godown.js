const mongoose = require('mongoose');

const godownSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String, required: true },
  district: { type: String, default: 'Hardoi' },
  state: { type: String, default: 'Uttar Pradesh' },
  contact_no: { type: String, default: '9999999999' },
  urea_stock: { type: Number, required: true, default: 500 },
  dap_stock: { type: Number, required: true, default: 500 },
  npk_stock: { type: Number, required: true, default: 500 },
  is_active: { type: Boolean, default: true }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

module.exports = mongoose.model('Godown', godownSchema);
