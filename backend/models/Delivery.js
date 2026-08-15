const mongoose = require('mongoose');

const deliverySchema = new mongoose.Schema({
  volunteer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  donation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Donation',
    required: true
  },
  destinationType: {
    type: String,
    enum: ['street', 'ngo'],
    default: 'street'
  },
  destinationNGO: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  routeData: {
    type: Object
  },
  status: {
    type: String,
    enum: ['assigned', 'picked_up', 'delivered', 'cancelled'],
    default: 'assigned'
  },
  assignedAt: {
    type: Date,
    default: Date.now
  },
  pickedUpAt: Date,
  deliveredAt: Date,
  notes: String
});

deliverySchema.index({ volunteer: 1, status: 1 });
deliverySchema.index({ donation: 1 });

module.exports = mongoose.model('Delivery', deliverySchema);
