const express = require('express');
const router = express.Router();
const Delivery = require('../models/Delivery');
const Donation = require('../models/Donation');
const { protect, authorize } = require('../middleware/auth');

// @route   POST /api/deliveries/accept
// @desc    Accept a donation for delivery
// @access  Private (Volunteer only)
router.post('/accept', protect, authorize('volunteer'), async (req, res) => {
  try {
    const { donationId } = req.body;
    
    if (!donationId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide donation ID'
      });
    }
    
    // Atomically assign donation (prevents race condition)
    const donation = await Donation.findOneAndUpdate(
      { _id: donationId, status: 'approved' },
      { status: 'assigned' },
      { new: true }
    );

    if (!donation) {
      return res.status(400).json({
        success: false,
        message: 'This donation is either not available or already assigned'
      });
    }

    // Prevent duplicate active delivery entries
    const existingDelivery = await Delivery.findOne({ 
      donation: donationId, 
      status: { $in: ['assigned', 'picked_up'] }
    });

    if (existingDelivery) {
      return res.status(400).json({
        success: false,
        message: 'This donation is already assigned to a volunteer'
      });
    }

    // Create delivery
    const delivery = await Delivery.create({
      volunteer: req.user.id,
      donation: donationId
    });
    
    const populatedDelivery = await Delivery.findById(delivery._id)
      .populate('donation')
      .populate('volunteer', 'name email volunteerPin');
    
    res.status(201).json({
      success: true,
      message: 'Donation accepted for delivery',
      delivery: populatedDelivery
    });
    
  } catch (error) {
    console.error('Accept delivery error:', error);
    res.status(500).json({
      success: false,
      message: 'Error accepting delivery',
      error: error.message
    });
  }
});

// @route   GET /api/deliveries/my-deliveries
// @desc    Get deliveries for logged-in volunteer
// @access  Private (Volunteer only)
router.get('/my-deliveries', protect, authorize('volunteer'), async (req, res) => {
  try {
    const deliveries = await Delivery.find({ volunteer: req.user.id })
      .sort({ assignedAt: -1 })
      .populate({
        path: 'donation',
        populate: {
          path: 'donor',
          select: 'name email'
        }
      });
    
    res.status(200).json({
      success: true,
      count: deliveries.length,
      deliveries
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching deliveries',
      error: error.message
    });
  }
});

// @route   PUT /api/deliveries/:id/status
// @desc    Update delivery status
// @access  Private (Volunteer only)
router.put('/:id/status', protect, authorize('volunteer'), async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['picked_up', 'delivered', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }
    
    const delivery = await Delivery.findById(req.params.id);
    
    if (!delivery) {
      return res.status(404).json({
        success: false,
        message: 'Delivery not found'
      });
    }
    
    // Check if volunteer owns this delivery
    if (delivery.volunteer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this delivery'
      });
    }
    
    // Update delivery status
    delivery.status = status;
    
    if (status === 'picked_up') {
      delivery.pickedUpAt = Date.now();
    } else if (status === 'delivered') {
      delivery.deliveredAt = Date.now();
    }
    
    await delivery.save();
    
    // Update donation status
    const donation = await Donation.findById(delivery.donation);
    if (donation) {
      donation.status = status;
      await donation.save();
    }
    
    res.status(200).json({
      success: true,
      message: `Delivery marked as ${status}`,
      delivery
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating delivery status',
      error: error.message
    });
  }
});

// @route   GET /api/deliveries
// @desc    Get all deliveries (Admin only)
// @access  Private (Admin)
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const deliveries = await Delivery.find()
      .sort({ assignedAt: -1 })
      .populate('volunteer', 'name email volunteerPin')
      .populate({
        path: 'donation',
        populate: {
          path: 'donor',
          select: 'name email'
        }
      });
    
    res.status(200).json({
      success: true,
      count: deliveries.length,
      deliveries
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching deliveries',
      error: error.message
    });
  }
});

module.exports = router;
