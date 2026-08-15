const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: ['donor', 'volunteer', 'foodChecker', 'ngo', 'admin'],
    required: [true, 'Role is required']
  },
  // Email verification
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  emailVerificationCode: String,
  emailVerificationCodeExpires: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  
  // Volunteer specific fields
  vehicleInfo: {
    type: String,
    required: function() {
      return this.role === 'volunteer';
    }
  },
  volunteerPin: {
    type: String,
    unique: true,
    sparse: true
  },
  
  // Food Checker specific field
  location: {
    type: String,
    required: function() {
      return this.role === 'foodChecker';
    }
  },
  
  // NGO specific fields
  organizationName: {
    type: String,
    required: function() {
      return this.role === 'ngo';
    }
  },
  registrationNumber: {
    type: String,
    required: function() {
      return this.role === 'ngo';
    }
  },
  organizationType: {
    type: String,
    enum: ['orphanage', 'oldAgeHome', 'other'],
    required: function() {
      return this.role === 'ngo';
    }
  },
  ngoLocation: {
    address: String,
    latitude: Number,
    longitude: Number
  },
  ngoNumberOfPeople: {
    type: Number,
    min: 1
  },

  // Donor specific fields
  donorLocation: {
    address: String,
    latitude: Number,
    longitude: Number
  },

  // Admin dashboard badge rank
  badge: {
    type: String,
    enum: ['bronze', 'silver', 'gold', 'platinum', null],
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Generate volunteer PIN
userSchema.methods.generateVolunteerPin = function() {
  const pin = Math.random().toString(36).substring(2, 10).toUpperCase();
  this.volunteerPin = pin;
  return pin;
};

// Generate email verification token
userSchema.methods.generateEmailVerificationToken = function() {
  const verificationToken = crypto.randomBytes(32).toString('hex');
  
  this.emailVerificationToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');
  
  this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  
  return verificationToken;
};

// Generate password reset token
userSchema.methods.generatePasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetExpires = Date.now() + 15 * 60 * 1000; // 15 minutes

  return resetToken;
};

// Compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON response
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  delete obj.emailVerificationToken;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
