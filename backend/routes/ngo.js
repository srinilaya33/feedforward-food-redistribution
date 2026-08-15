const express = require('express');
const router = express.Router();
const Donation = require('../models/Donation');
const NGORequest = require('../models/NGORequest');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/ngo/available-donations
// @desc    Get large donations eligible for NGOs (>=50 packets)
// @access  Private (NGO only)
router.post('/request', protect, authorize('ngo'), async (req, res) => {
  try {
    const { donationId } = req.body;
    
    if (!donationId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide donation ID'
      });
    }
    
    // Find the donation
    const donation = await Donation.findById(donationId);
    
    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Donation not found'
      });
    }
    
    // Check if donation is approved
    if (donation.status !== 'approved') {
      return res.status(400).json({
        success: false,
        message: 'This donation is not available for request'
      });
    }
    
    // Check if donation meets NGO eligibility (>=50 packets)
    if (!donation.isEligibleForNGO) {
      return res.status(400).json({
        success: false,
        message: 'This donation does not meet NGO eligibility criteria (minimum 50 packets)'
      });
    }
    
    // Check if already locked by another NGO
    if (donation.lockedByNGO) {
      return res.status(400).json({
        success: false,
        message: 'This donation has already been requested by another NGO'
      });
    }
    
    // Check if this NGO has already requested this donation
    const existingRequest = await NGORequest.findOne({
      ngo: req.user.id,
      donation: donationId
    });
    
    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: 'You have already requested this donation'
      });
    }
    
    // Lock the donation for this NGO
    donation.lockedByNGO = req.user.id;
    donation.lockedAt = Date.now();
    donation.status = 'locked_by_ngo';
    await donation.save();
    
    // Create NGO request record
    const ngoRequest = await NGORequest.create({
      ngo: req.user.id,
      donation: donationId,
      status: 'requested'
    });
    
    const populatedRequest = await NGORequest.findById(ngoRequest._id)
      .populate('donation')
      .populate('ngo', 'organizationName organizationType');
    
    res.status(201).json({
      success: true,
      message: 'Donation requested successfully. Waiting for admin approval.',
      request: populatedRequest
    });
    
  } catch (error) {
    console.error('NGO request error:', error);
    res.status(500).json({
      success: false,
      message: 'Error requesting donation',
      error: error.message
    });
  }
});

// @route   GET /api/ngo/my-requests
// @desc    Get NGO's own requests
// @access  Private (NGO only)
router.get('/my-requests', protect, authorize('ngo'), async (req, res) => {
  try {
    const requests = await NGORequest.find({ ngo: req.user.id })
      .sort({ requestedAt: -1 })
      .populate({
        path: 'donation',
        populate: {
          path: 'donor',
          select: 'name email'
        }
      });
    
    res.status(200).json({
      success: true,
      count: requests.length,
      requests
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching requests',
      error: error.message
    });
  }
});

// @route   GET /api/ngo/available-donations
// @desc    Get large donations available for NGO request
// @access  Private (NGO only)
router.get('/available-donations', protect, authorize('ngo'), async (req, res) => {
  try {
    const donations = await Donation.find({
      status: 'approved',
      isEligibleForNGO: true,
      lockedByNGO: null
    })
    .sort({ createdAt: -1 })
    .populate('donor', 'name email');
    
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

// @route   GET /api/ngo/high-need-areas
// @desc    Get nearby high-need areas for volunteer delivery
// @access  Private (Volunteer and NGO)
router.get('/high-need-areas', protect, authorize('volunteer','ngo'), async (req, res) => {
  try {
    const areas = [
      { id: 'a1', name: 'Tenali Railway Station Road', address: 'Near Tenali Railway Station, Tenali', latitude: 16.2408, longitude: 80.6400 },
      { id: 'a2', name: 'Guntur Railway Station Road', address: 'Near Guntur Railway Station, Guntur', latitude: 16.3067, longitude: 80.4365 },
      { id: 'a3', name: 'Tenali Bus Stand', address: 'Tenali Bus Stand, Tenali', latitude: 16.2455, longitude: 80.6406 },
      { id: 'a4', name: 'Footpath near Tenali Market', address: 'Tenali Market Footpath, Tenali', latitude: 16.2480, longitude: 80.6419 },
      { id: 'a5', name: 'Downtown Slum', address: 'Downtown Slum, City', latitude: 28.6200, longitude: 77.2200 }
    ];

    res.status(200).json({ success: true, areas });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching high-need areas', error: error.message });
  }
});

module.exports = router;
