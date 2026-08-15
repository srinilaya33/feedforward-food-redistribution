const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Donation = require('../models/Donation');
const Delivery = require('../models/Delivery');
const NGORequest = require('../models/NGORequest');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/analytics
// @desc    Get comprehensive analytics
// @access  Private (Admin only)
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const totalDonors = await User.countDocuments({ role: 'donor' });
    const totalVolunteers = await User.countDocuments({ role: 'volunteer' });
    const totalCheckers = await User.countDocuments({ role: 'foodChecker' });
    const totalNGOs = await User.countDocuments({ role: 'ngo' });
    
    const totalDonations = await Donation.countDocuments();
    const approvedDonations = await Donation.countDocuments({ status: 'approved' });
    const rejectedDonations = await Donation.countDocuments({ status: 'rejected' });
    const deliveredDonations = await Donation.countDocuments({ status: 'delivered' });
    
    // Calculate total food packets saved
    const deliveredDonationsData = await Donation.find({ status: 'delivered' });
    const totalPacketsSaved = deliveredDonationsData.reduce((sum, donation) => {
      return sum + donation.numberOfPackets;
    }, 0);
    
    // NGO statistics
    const ngoDeliveries = await Delivery.countDocuments({ destinationType: 'ngo', status: 'delivered' });
    const streetDeliveries = await Delivery.countDocuments({ destinationType: 'street', status: 'delivered' });
    
    // Estimate people reached (average 1 person per packet)
    const peopleReached = totalPacketsSaved;
    
    res.status(200).json({
      success: true,
      totalDonors,
      totalVolunteers,
      totalCheckers,
      totalNGOs,
      totalDonations,
      approvedDonations,
      rejectedDonations,
      deliveredDonations,
      totalPacketsSaved,
      ngoDeliveries,
      streetDeliveries,
      peopleReached
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching analytics',
      error: error.message
    });
  }
});

module.exports = router;
