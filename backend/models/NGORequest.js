const mongoose = require('mongoose');

const ngoRequestSchema = new mongoose.Schema({
  ngo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  donation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Donation',
    required: true
  },
  status: {
    type: String,
    enum: ['requested', 'approved', 'assigned', 'delivered', 'rejected'],
    default: 'requested'
  },
  requestedAt: {
    type: Date,
    default: Date.now
  },
  approvedAt: Date,
  notes: String
});

// Compound index to prevent duplicate requests
ngoRequestSchema.index({ ngo: 1, donation: 1 }, { unique: true });

module.exports = mongoose.model('NGORequest', ngoRequestSchema);
