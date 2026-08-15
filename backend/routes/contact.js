const express = require('express');
const router = express.Router();
const { sendContactNotification } = require('../utils/emailService');

// @route   POST /api/contact
// @desc    Send contact form message to admin
// @access  Public
console.log("CONTACT API HIT");
console.log("CALLING EMAIL FUNCTION");
router.post('/', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    
    // Validation
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }
    
    // Send email to admin
    await sendContactNotification(name, email, subject, message);
    
    res.status(200).json({
      success: true,
      message: 'Your message has been sent successfully! We will get back to you soon.'
    });
    
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending message. Please try again later.',
      error: error.message
    });
  }
});

module.exports = router;
