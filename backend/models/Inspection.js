const mongoose = require('mongoose');

const inspectionSchema = new mongoose.Schema({
  donation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Donation',
    required: true,
    unique: true
  },
  checker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  result: {
    type: String,
    enum: ['approved', 'rejected'],
    required: true
  },
  remarks: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

inspectionSchema.index({ donation: 1 });
inspectionSchema.index({ checker: 1, createdAt: -1 });

module.exports = mongoose.model('Inspection', inspectionSchema);
