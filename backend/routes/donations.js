const express = require('express');
const router = express.Router();
const Donation = require('../models/Donation');
const { protect, authorize } = require('../middleware/auth');

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
const { upload, uploadToCloudinary } = require('../config/cloudinary');

// @route   POST /api/donations/create
// @desc    Create a new donation with image upload
// @access  Private (Donor only)
router.post('/create', protect, authorize('donor'), upload.array('images', 5), async (req, res) => {
  try {
    const { foodType, numberOfPackets, expiryTime, location, description } = req.body;
    
    if (!foodType || !numberOfPackets || !expiryTime || !location) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }
    
    // Upload images to Cloudinary
    const imageUploads = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        try {
          const result = await uploadToCloudinary(file.buffer, 'donations');
          imageUploads.push(result);
        } catch (error) {
          console.error('Image upload error:', error);
        }
      }
    }
    
    // Parse location if it's a string
    let locationData = location;
    if (typeof location === 'string') {
      try {
        locationData = JSON.parse(location);
      } catch (e) {
        locationData = { address: location };
      }
    }

    if (locationData && locationData.address && (!locationData.latitude || !locationData.longitude)) {
      const geo = await geocodeAddress(locationData.address);
      if (geo) {
        locationData = geo;
      }
    }

    // Guarantee non-empty coordinates for map rendering
    if (locationData && locationData.address && (!locationData.latitude || !locationData.longitude)) {
      const geo = await geocodeAddress(locationData.address);
      if (geo) {
        locationData.latitude = geo.latitude;
        locationData.longitude = geo.longitude;
      }
    }

    // Create donation
    const donation = await Donation.create({
      donor: req.user.id,
      foodType,
      numberOfPackets: parseInt(numberOfPackets),
      expiryTime,
      location: {
        address: locationData.address,
        latitude: locationData.latitude,
        longitude: locationData.longitude
      },
      description,
      images: imageUploads
    });
    
    res.status(201).json({
      success: true,
      donation
    });
    
  } catch (error) {
    console.error('Create donation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating donation',
      error: error.message
    });
  }
});

// @route   GET /api/donations/my-donations
// @desc    Get donations by logged-in donor
// @access  Private (Donor only)
router.get('/my-donations', protect, authorize('donor'), async (req, res) => {
  try {
    const donations = await Donation.find({ donor: req.user.id })
      .sort({ createdAt: -1 })
      .populate('donor', 'name email')
      .populate('lockedByNGO', 'organizationName');
    
    res.status(200).json({
      success: true,
      count: donations.length,
      donations
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching donations',
      error: error.message
    });
  }
});

// @route   GET /api/donations/available
// @desc    Get all approved donations for volunteers (not locked by NGO and not eligible for NGO or NGO not booked)
// @access  Private (Volunteer only)
router.get('/available', protect, authorize('volunteer'), async (req, res) => {
  try {
    const donations = await Donation.find({ 
      status: 'approved',
      isEligibleForNGO: false
    })
    .sort({ createdAt: -1 })
    .populate('donor', 'name email location');
    
    res.status(200).json({
      success: true,
      count: donations.length,
      donations
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching available donations',
      error: error.message
    });
  }
});

// @route   GET /api/donations/:id
// @desc    Get single donation
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id)
      .populate('donor', 'name email')
      .populate('lockedByNGO', 'organizationName');
    
    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Donation not found'
      });
    }
    
    res.status(200).json({
      success: true,
      donation
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching donation',
      error: error.message
    });
  }
});

module.exports = router;
