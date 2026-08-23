const mongoose = require('mongoose');

const fertilizerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  brand: { type: String, default: 'IFFCO' },
  bag_size_kg: { type: Number, default: 45 },
  price_per_bag: { type: Number, required: true },
  market_price: { type: Number, required: true },
  govt_subsidy_percent: { type: Number, required: true },
  max_bags_per_acre: { type: Number, required: true },
  image_url: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Fertilizer', fertilizerSchema);