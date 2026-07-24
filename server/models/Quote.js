const mongoose = require('mongoose');

const quoteSchema = new mongoose.Schema({
  leadId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CustomerEntry',
    required: true
  },
  product: {
    type: String,
    required: true
  },
  model: {
    type: String,
    required: true
  },
  mrp: {
    type: Number,
    required: true
  },
  discountedPrice: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const Quote = mongoose.model('Quote', quoteSchema);
module.exports = Quote;
