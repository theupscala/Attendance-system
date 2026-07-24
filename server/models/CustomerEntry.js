const mongoose = require('mongoose');

const customerEntrySchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  company: {
    type: String,
    default: '-'
  },
  email: {
    type: String,
    default: '-'
  },
  phone: {
    type: String,
    required: true
  },
  status: {
    type: String,
    default: 'NEW LEAD'
  },
  source: {
    type: String,
    default: 'WEBSITE'
  },
  serviceInterest: {
    type: String,
    default: '-'
  },
  budget: {
    type: String,
    default: '-'
  },
  priority: {
    type: String,
    enum: ['WARM', 'COLD', 'HOT'],
    default: 'WARM'
  },
  photo: {
    type: String,
    default: null
  },
  bills: [{
    url: String,
    originalName: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

const CustomerEntry = mongoose.model('CustomerEntry', customerEntrySchema);
module.exports = CustomerEntry;
