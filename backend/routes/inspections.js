const express = require('express');
const router = express.Router();
const Inspection = require('../models/Inspection');
const Donation = require('../models/Donation');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/inspections/pending
// @desc    Get all pending donations for inspection
// @access  Private (Food Checker only)
router.get('/pending', protect, authorize('foodChecker'), async (req, res) => {
  try {
    const donations = await Donation.find({ status: 'pending' })
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
      message: 'Error fetching pending inspections',
      error: error.message
    });
  }
});

// @route   POST /api/inspections/submit
// @desc    Submit inspection result
// @access  Private (Food Checker only)
router.post('/submit', protect, authorize('foodChecker'), async (req, res) => {
  try {
    const { donationId, result, remarks } = req.body;
    
    // Validate input
    if (!donationId || !result) {
      return res.status(400).json({
        success: false,
        message: 'Please provide donation ID and result'
      });
    }
    
    if (!['approved', 'rejected'].includes(result)) {
      return res.status(400).json({
        success: false,
        message: 'Result must be either approved or rejected'
      });
    }
    
    // Find donation
    const donation = await Donation.findById(donationId);
    
    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Donation not found'
      });
    }
    
    if (donation.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Donation has already been inspected'
      });
    }
    
    // Create inspection record
    const inspection = await Inspection.create({
      donation: donationId,
      checker: req.user.id,
      result,
      remarks
    });
    
    // Update donation status
    donation.status = result;
    await donation.save();
    
    res.status(201).json({
      success: true,
      message: `Donation ${result} successfully`,
      inspection
    });
    
  } catch (error) {
    console.error('Inspection submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting inspection',
      error: error.message
    });
  }
});

// @route   GET /api/inspections/my-history
// @desc    Get inspection history for logged-in checker
// @access  Private (Food Checker only)
router.get('/my-history', protect, authorize('foodChecker'), async (req, res) => {
  try {
    const inspections = await Inspection.find({ checker: req.user.id })
      .sort({ createdAt: -1 })
      .populate({
        path: 'donation',
        populate: {
          path: 'donor',
          select: 'name email'
        }
      });
    
    res.status(200).json({
      success: true,
      count: inspections.length,
      inspections
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching inspection history',
      error: error.message
    });
  }
});

// @route   GET /api/inspections/:donationId
// @desc    Get inspection for a specific donation
// @access  Private
router.get('/:donationId', protect, async (req, res) => {
  try {
    const inspection = await Inspection.findOne({ donation: req.params.donationId })
      .populate('checker', 'name email')
      .populate('donation');
    
    if (!inspection) {
      return res.status(404).json({
        success: false,
        message: 'Inspection not found for this donation'
      });
    }
    
    res.status(200).json({
      success: true,
      inspection
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching inspection',
      error: error.message
    });
  }
});

module.exports = router;
