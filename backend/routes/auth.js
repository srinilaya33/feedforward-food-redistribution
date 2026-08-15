const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { sendVerificationEmail, sendVerificationCodeEmail, sendPasswordResetEmail } = require('../utils/emailService');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '24h'
  });
};

const geocodeAddress = async (address) => {
  if (!address) return null;

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) return null;

  const encoded = encodeURIComponent(address);
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encoded}&key=${apiKey}`;

  const res = await fetch(url);
  const data = await res.json();

  if (data.status !== 'OK' || !data.results?.length) {
    return null;
  }

  const location = data.results[0].geometry.location;
  return {
    address: data.results[0].formatted_address,
    latitude: location.lat,
    longitude: location.lng
  };
};

// @route   POST /api/auth/register
// @desc    Register a new user (NOT for admin)
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, vehicleInfo, location, organizationName, registrationNumber, organizationType } = req.body;
    
    // Prevent admin registration via API
    if (role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin accounts cannot be created through registration'
      });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }
    
    // Create user object
    const userData = {
      name,
      email,
      password,
      role,
      isEmailVerified: !!req.body.isGoogleSignup
    };
    
    // Add role-specific fields
    if (role === 'volunteer') {
      if (!vehicleInfo) {
        return res.status(400).json({
          success: false,
          message: 'Vehicle information is required for volunteers'
        });
      }
      userData.vehicleInfo = vehicleInfo;
    }
    
    if (role === 'foodChecker') {
      if (!location) {
        return res.status(400).json({
          success: false,
          message: 'Location is required for food quality checkers'
        });
      }
      userData.location = location;
    }
    
    if (role === 'ngo') {
      if (!organizationName || !registrationNumber || !organizationType) {
        return res.status(400).json({
          success: false,
          message: 'Organization details are required for NGOs'
        });
      }
      userData.organizationName = organizationName;
      userData.registrationNumber = registrationNumber;
      userData.organizationType = organizationType;
    }
    
    // Create user
    const user = await User.create(userData);
    
    // Generate volunteer PIN if volunteer
    let volunteerPin = null;
    if (role === 'volunteer') {
      volunteerPin = user.generateVolunteerPin();
    }

    if (user.isEmailVerified) {
      await user.save();
    } else {
      // Generate email verification token for manual signup
      const verificationToken = user.generateEmailVerificationToken();
      await user.save();

      // Send verification email for manual signup
      try {
        await sendVerificationEmail(user, verificationToken);
      } catch (emailError) {
        console.error('Error sending verification email:', emailError);
        // Continue registration even if email fails
      }
    }
    
    // Generate JWT token
    const token = generateToken(user._id);
    
    // Response
    const response = {
      success: true,
      message: 'Registration successful! Please check your email to verify your account.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified
      }
    };
    
    if (volunteerPin) {
      response.volunteerPin = volunteerPin;
      response.user.volunteerPin = volunteerPin;
    }
    
    res.status(201).json(response);
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Error in registration',
      error: error.message
    });
  }
});

// @route   GET /api/auth/verify-email/:token
// @desc    Request verification code (send code to user email)
// @access  Public
router.get('/verify-email/:token', async (req, res) => {
  try {
    const token = req.params.token;
    console.log('📧 Verify email request received. Token length:', token.length);
    
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');
    
    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      console.log('❌ User not found or token expired. Hashed token:', hashedToken.substring(0, 10) + '...');
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token. Please request a new verification email.',
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email already verified. Please log in.',
      });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    user.emailVerificationCode = code;
    user.emailVerificationCodeExpires = Date.now() + 15 * 60 * 1000; // 15 minutes
    await user.save();

    await sendVerificationCodeEmail(user, code);

    res.status(200).json({
      success: true,
      message: 'Verification code sent to your email. Please enter the code to complete verification.',
      email: user.email
    });
  } catch (error) {
    console.error('❌ Error sending verification code:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending verification code',
      error: error.message
    });
  }
});

// @route   POST /api/auth/verify-email/:token
// @desc    Confirm verification code
// @access  Public
router.post('/verify-email/:token', async (req, res) => {
  try {
    const token = req.params.token;
    const { code } = req.body;

    if (!code || code.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Verification code is required.'
      });
    }

    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: Date.now() },
      emailVerificationCode: code,
      emailVerificationCodeExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid code or token expired. Please request a new verification code.'
      });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    user.emailVerificationCode = undefined;
    user.emailVerificationCodeExpires = undefined;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Email verified successfully! You can now log in.'
    });
  } catch (error) {
    console.error('❌ Error confirming verification code:', error);
    res.status(500).json({
      success: false,
      message: 'Error confirming verification code',
      error: error.message
    });
  }
});

// @route   POST /api/auth/resend-verification
// @desc    Resend verification email
// @access  Private
router.post('/resend-verification', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified'
      });
    }
    
    const verificationToken = user.generateEmailVerificationToken();
    await user.save();
    
    await sendVerificationEmail(user, verificationToken);
    
    res.status(200).json({
      success: true,
      message: 'Verification email sent! Please check your inbox.'
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error sending verification email',
      error: error.message
    });
  }
});

// @route   POST /api/auth/forgot-password
// @desc    Send password reset email
// @access  Public
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your email address'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'If an account exists for this email, a password reset link has been sent.'
      });
    }

    const resetToken = user.generatePasswordResetToken();
    await user.save();

    try {
      await sendPasswordResetEmail(user, resetToken);
    } catch (emailError) {
      console.error('Error sending password reset email:', emailError);
      return res.status(500).json({
        success: false,
        message: 'Unable to send password reset email right now. Please try again later.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'If an account exists for this email, a password reset link has been sent.'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing password reset request'
    });
  }
});

// @route   POST /api/auth/reset-password/:token
// @desc    Reset user password
// @access  Public
router.post('/reset-password/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match'
      });
    }

    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired password reset token'
      });
    }

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successful. Please log in with your new password.'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Error resetting password'
    });
  }
});

// @route   POST /api/auth/google/verify
// @desc    Verify Google credential for signup without creating an account
// @access  Public
router.post('/google/verify', async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        success: false,
        message: 'Google credential is required'
      });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    if (!payload?.email) {
      return res.status(400).json({
        success: false,
        message: 'Google account email not available'
      });
    }

    const email = payload.email.toLowerCase();
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'This Google email is already registered. Please log in or use a different email.'
      });
    }

    return res.status(200).json({
      success: true,
      email,
      name: payload.name || payload.given_name || '',
      message: 'Google email verified. Complete the form to finish signup.'
    });
  } catch (error) {
    console.error('Google verify error:', error);
    res.status(500).json({
      success: false,
      message: 'Google verification failed'
    });
  }
});

// @route   POST /api/auth/google
// @desc    Authenticate user with Google
// @access  Public
router.post('/google', async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        success: false,
        message: 'Google credential is required'
      });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    if (!payload?.email) {
      return res.status(400).json({
        success: false,
        message: 'Google account email not available'
      });
    }

    const email = payload.email.toLowerCase();
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'No account found for this Google email. Please sign up first.'
      });
    }

    if (!user.isEmailVerified) {
      user.isEmailVerified = true;
      await user.save();
    }

    const token = generateToken(user._id);
    user.password = undefined;

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified
      }
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({
      success: false,
      message: 'Google authentication failed'
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }
    
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    const isPasswordMatch = await user.comparePassword(password);
    
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Check if email is verified (except for admin)
    console.log('User found:', user.email, 'isEmailVerified:', user.isEmailVerified, 'role:', user.role);
    if (!user.isEmailVerified && user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Please verify your email before logging in',
        requiresVerification: true
      });
    }
    
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated'
      });
    }
    
    const token = generateToken(user._id);
    user.password = undefined;
    
    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        vehicleInfo: user.vehicleInfo,
        volunteerPin: user.volunteerPin,
        location: user.location,
        organizationName: user.organizationName,
        donorLocation: user.donorLocation,
        ngoLocation: user.ngoLocation
      }
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error in login',
      error: error.message
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current logged in user
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: error.message
    });
  }
});

// @route   PUT /api/auth/update-location
// @desc    Update user location (donor or ngo)
// @access  Private
router.put('/update-location', protect, async (req, res) => {
  try {
    const { donorLocation, ngoLocation } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (donorLocation && user.role === 'donor') {
      let locationToSave = donorLocation;
      if (donorLocation.address && (!donorLocation.latitude || !donorLocation.longitude)) {
        const geo = await geocodeAddress(donorLocation.address);
        if (geo) {
          locationToSave = geo;
        }
      }
      user.donorLocation = locationToSave;
    }

    if (ngoLocation && user.role === 'ngo') {
      let locationToSave = ngoLocation;
      if (ngoLocation.address && (!ngoLocation.latitude || !ngoLocation.longitude)) {
        const geo = await geocodeAddress(ngoLocation.address);
        if (geo) {
          locationToSave = geo;
        }
      }
      user.ngoLocation = locationToSave;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Location updated successfully',
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating location',
      error: error.message
    });
  }
});

// @route   GET /api/auth/geocode
// @desc    Geocode an address (protected) or reverse geocode coordinates
// @access  Private
router.get('/geocode', protect, async (req, res) => {
  try {
    const { address, lat, lng } = req.query;

    if (address) {
      const geo = await geocodeAddress(address);
      if (!geo) {
        return res.status(200).json({
          success: false,
          message: 'Unable to geocode the provided address',
          location: null
        });
      }
      return res.status(200).json({ success: true, location: geo });
    }

    if (lat && lng) {
      const apiKey = process.env.GOOGLE_MAPS_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ success: false, message: 'Google Maps API key not configured' });
      }
      const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.status !== 'OK' || !data.results?.length) {
        return res.status(200).json({
          success: false,
          message: 'Unable to reverse geocode coordinates',
          location: null
        });
      }

      const result = data.results[0];
      return res.status(200).json({
        success: true,
        location: {
          address: result.formatted_address,
          latitude: parseFloat(lat),
          longitude: parseFloat(lng)
        }
      });
    }

    return res.status(400).json({ success: false, message: 'Address or lat/lng required' });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Geocoding error',
      error: error.message
    });
  }
});

module.exports = router;
