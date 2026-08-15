const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  donor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  foodType: {
    type: String,
    required: [true, 'Food type is required']
  },
  numberOfPackets: {
    type: Number,
    required: [true, 'Number of packets is required'],
    min: 1
  },
  expiryTime: {
    type: Date,
    required: [true, 'Expiry time is required']
  },
  location: {
    address: {
      type: String,
      required: [true, 'Location is required']
    },
    latitude: {
      type: Number,
      required: false
    },
    longitude: {
      type: Number,
      required: false
    }
  },
  description: {
    type: String,
    trim: true
  },
  images: [{
    url: String,
    public_id: String
  }],
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'assigned', 'picked_up', 'delivered', 'locked_by_ngo'],
    default: 'pending'
  },
  // NGO eligibility flag
  isEligibleForNGO: {
    type: Boolean,
    default: function() {
      return this.numberOfPackets >= 50;
    }
  },
  // Locked by NGO
  lockedByNGO: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  lockedAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
donationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  // Set NGO eligibility based on packet count
  this.isEligibleForNGO = this.numberOfPackets >= 50;
  next();
});

// Virtual populate for inspections
donationSchema.virtual('inspection', {
  ref: 'Inspection',
  localField: '_id',
  foreignField: 'donation',
  justOne: true
});

module.exports = mongoose.model('Donation', donationSchema);
