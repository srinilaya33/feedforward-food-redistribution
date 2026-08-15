const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Donation = require('../models/Donation');
const Delivery = require('../models/Delivery');
const NGORequest = require('../models/NGORequest');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/admin/stats
// @desc    Get platform statistics
// @access  Private (Admin only)
router.get('/stats', protect, authorize('admin'), async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const donors = await User.countDocuments({ role: 'donor' });
    const volunteers = await User.countDocuments({ role: 'volunteer' });
    const checkers = await User.countDocuments({ role: 'foodChecker' });
    const ngos = await User.countDocuments({ role: 'ngo' });
    
    const totalDonations = await Donation.countDocuments();
    const approvedDonations = await Donation.countDocuments({ status: 'approved' });
    const rejectedDonations = await Donation.countDocuments({ status: 'rejected' });
    const deliveredDonations = await Donation.countDocuments({ status: 'delivered' });
    const ngoLockedDonations = await Donation.countDocuments({ status: 'locked_by_ngo' });
    
    const totalDeliveries = await Delivery.countDocuments();
    const pendingNGORequests = await NGORequest.countDocuments({ status: 'requested' });
    
    res.status(200).json({
      success: true,
      totalUsers,
      donors,
      volunteers,
      checkers,
      ngos,
      totalDonations,
      approvedDonations,
      rejectedDonations,
      deliveredDonations,
      ngoLockedDonations,
      totalDeliveries,
      pendingNGORequests
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: error.message
    });
  }
});

// @route   GET /api/admin/ngo-requests
// @desc    Get all NGO requests
// @access  Private (Admin only)
router.get('/ngo-requests', protect, authorize('admin'), async (req, res) => {
  try {
    const requests = await NGORequest.find()
      .sort({ requestedAt: -1 })
      .populate('ngo', 'organizationName organizationType email')
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
      message: 'Error fetching NGO requests',
      error: error.message
    });
  }
});

// @route   PUT /api/admin/ngo-requests/:id/approve
// @desc    Approve NGO request and assign volunteer
// @access  Private (Admin only)
router.put('/ngo-requests/:id/approve', protect, authorize('admin'), async (req, res) => {
  try {
    const { volunteerId } = req.body;
    
    const ngoRequest = await NGORequest.findById(req.params.id)
      .populate('donation')
      .populate('ngo');
    
    if (!ngoRequest) {
      return res.status(404).json({
        success: false,
        message: 'NGO request not found'
      });
    }
    
    if (ngoRequest.status !== 'requested') {
      return res.status(400).json({
        success: false,
        message: 'This request has already been processed'
      });
    }
    
    // Update NGO request status
    ngoRequest.status = 'approved';
    ngoRequest.approvedAt = Date.now();
    await ngoRequest.save();
    
    // If volunteer is provided, create delivery
    if (volunteerId) {
      const delivery = await Delivery.create({
        volunteer: volunteerId,
        donation: ngoRequest.donation._id,
        destinationType: 'ngo',
        destinationNGO: ngoRequest.ngo._id,
        status: 'assigned'
      });
      
      // Update donation status
      ngoRequest.donation.status = 'assigned';
      await ngoRequest.donation.save();
      
      ngoRequest.status = 'assigned';
      await ngoRequest.save();
    }
    
    res.status(200).json({
      success: true,
      message: 'NGO request approved successfully',
      request: ngoRequest
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error approving NGO request',
      error: error.message
    });
  }
});

// @route   PUT /api/admin/ngo-requests/:id/reject
// @desc    Reject NGO request and unlock donation
// @access  Private (Admin only)
router.put('/ngo-requests/:id/reject', protect, authorize('admin'), async (req, res) => {
  try {
    const ngoRequest = await NGORequest.findById(req.params.id)
      .populate('donation');
    
    if (!ngoRequest) {
      return res.status(404).json({
        success: false,
        message: 'NGO request not found'
      });
    }
    
    // Update NGO request status
    ngoRequest.status = 'rejected';
    await ngoRequest.save();
    
    // Unlock the donation
    const donation = await Donation.findById(ngoRequest.donation._id);
    if (donation) {
      donation.lockedByNGO = null;
      donation.lockedAt = null;
      donation.status = 'approved'; // Back to approved
      await donation.save();
    }
    
    res.status(200).json({
      success: true,
      message: 'NGO request rejected and donation unlocked',
      request: ngoRequest
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error rejecting NGO request',
      error: error.message
    });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Private (Admin only)
router.get('/users', protect, authorize('admin'), async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: users.length,
      users
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
});

// @route   PUT /api/admin/donations/:id/approve
// @desc    Approve a donation
// @access  Private (Admin only)
router.put('/donations/:id/approve', protect, authorize('admin'), async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    
    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Donation not found'
      });
    }
    
    if (donation.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Donation is not in pending status'
      });
    }
    
    donation.status = 'approved';
    await donation.save();
    
    res.status(200).json({
      success: true,
      message: 'Donation approved successfully',
      donation
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error approving donation',
      error: error.message
    });
  }
});

// @route   PUT /api/admin/donations/:id/reject
// @desc    Reject a donation
// @access  Private (Admin only)
router.put('/donations/:id/reject', protect, authorize('admin'), async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    
    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Donation not found'
      });
    }
    
    if (donation.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Donation is not in pending status'
      });
    }
    
    donation.status = 'rejected';
    await donation.save();
    
    res.status(200).json({
      success: true,
      message: 'Donation rejected',
      donation
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error rejecting donation',
      error: error.message
    });
  }
});

// @route   GET /api/admin/donations
router.get('/donations', protect, authorize('admin'), async (req, res) => {
  try {
    const donations = await Donation.find()
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

// @route   GET /api/admin/areas
// @desc    Get high-need areas (for dashboard tab)
// @access  Private (Admin only)
router.get('/areas', protect, authorize('admin'), async (req, res) => {
  try {
    // Placeholder data while area model is not defined
    const areas = [
  {
    _id: '1',
    areaName: 'Tenali Railway Station Road',
    beggarCount: 120,
    handicappedCount: 20,
    coordinates: { lat: 16.2425, lng: 80.6400 }
  },
  {
    _id: '2',
    areaName: 'Guntur Railway Station Road',
    beggarCount: 90,
    handicappedCount: 15,
    coordinates: { lat: 16.3067, lng: 80.4365 }
  },
  {
    _id: '3',
    areaName: 'Tenali Bus Stand',
    beggarCount: 70,
    handicappedCount: 10,
    coordinates: { lat: 16.2430, lng: 80.6450 }
  },
  {
    _id: '4',
    areaName: 'Footpath near Tenali Market',
    beggarCount: 60,
    handicappedCount: 12,
    coordinates: { lat: 16.2400, lng: 80.6380 }
  }
];

    res.status(200).json({ success: true, areas });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching areas',
      error: error.message
    });
  }
});

// @route   POST /api/admin/assign-badge
// @desc    Assign donor badge level (placeholder)
// @access  Private (Admin only)
router.post('/assign-badge', protect, authorize('admin'), async (req, res) => {
  try {
    const { donorId, badgeLevel } = req.body;

    const donor = await User.findById(donorId);
    if (!donor) {
      return res.status(404).json({ success: false, message: 'Donor not found' });
    }

    // Add/update badge info on user (non-persistent if no schema field)
    donor.badge = badgeLevel;
    await donor.save();

    res.status(200).json({ success: true, message: 'Badge assigned', badgeLevel });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error assigning badge',
      error: error.message
    });
  }
});

module.exports = router;
