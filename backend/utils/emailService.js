const nodemailer = require('nodemailer');

// ================= TRANSPORTER =================
const createTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail", // ✅ FIXED (instead of host/port)
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};

// ✅ FIX: always use EMAIL_USER as sender
const FROM_EMAIL = process.env.EMAIL_USER || 'noreply@feedforward.com';
const FRONTEND_BASE_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log("EMAIL_PASSWORD:", process.env.EMAIL_PASSWORD);
// ================= EMAIL VERIFICATION =================
exports.sendVerificationEmail = async (user, verificationToken) => {
  try {
    const transporter = createTransporter();
    
    const verificationUrl = `${FRONTEND_BASE_URL}/verify-email/${verificationToken}`;
    
    const mailOptions = {
      from: FROM_EMAIL,
      to: user.email,
      subject: '🍽️ Verify Your Email - FeedForward',
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08); }
            .header { background: linear-gradient(135deg, #FFC000 0%, #FFD700 100%); color: white; padding: 30px 25px; text-align: center; }
            .header h1 { font-size: 28px; margin-bottom: 8px; }
            .header p { font-size: 14px; opacity: 0.95; }
            .content { padding: 30px; }
            .title { font-size: 20px; font-weight: 700; color: #333; margin-bottom: 12px; }
            .body { color: #555; line-height: 1.7; margin-bottom: 20px; }
            .cta { display: block; margin: 20px auto; width: fit-content; background: #FFB21C; color: #fff; padding: 13px 28px; border-radius: 8px; text-decoration: none; font-weight: 700; }
            .note { background: #f4f4f4; border-left: 4px solid #FFC000; padding: 14px 16px; border-radius: 6px; margin-top: 16px; color: #777; font-size: 13px; }
            .footer { padding: 18px 24px; font-size: 12px; color: #999; text-align: center; }
            .link { word-break: break-all; color: #FFB21C; font-size: 13px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🍽️ FeedForward Email Verification</h1>
              <p>Secure your account with a unique code</p>
            </div>
            <div class="content">
              <p class="title">Hi ${user.name},</p>
              <p class="body">Thanks for signing up! Click the button below to request your verification code (sent to your registered email).</p>
              <a href="${verificationUrl}" class="cta">Get Verification Code</a>
              <div class="note">
                This link is valid for 24 hours. After clicking, you'll receive a 6-digit code.
                <br />
                Then enter the code at the verification page to complete account activation.
              </div>
              <div class="note" style="margin-top: 10px;">
                Can’t click the button? Copy-paste this link in your browser:<br/>
                <span class="link">${verificationUrl}</span>
              </div>
            </div>
            <div class="footer">© 2026 FeedForward - Fighting food waste, one meal at a time</div>
          </div>
        </body>
        </html>
      `
    };
    const info = await transporter.sendMail(mailOptions);
    console.log('Verification email sent to:', user.email, 'Response:', info.response);
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw error;
  }
};

exports.sendPasswordResetEmail = async (user, resetToken) => {
  try {
    const transporter = createTransporter();
    const resetUrl = `${FRONTEND_BASE_URL}/reset-password/${resetToken}`;

    const mailOptions = {
      from: FROM_EMAIL,
      to: user.email,
      subject: '🔐 Reset your FeedForward password',
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <style>
            body { font-family: Arial, sans-serif; background: #f8fafc; margin: 0; padding: 24px; }
            .card { max-width: 560px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 8px 24px rgba(0,0,0,0.08); }
            .header { background: linear-gradient(135deg, #FFC000 0%, #FFD700 100%); color: white; padding: 24px; text-align: center; }
            .content { padding: 24px; color: #374151; line-height: 1.7; }
            .button { display: inline-block; margin-top: 16px; padding: 12px 20px; background: #FFB21C; color: white; text-decoration: none; border-radius: 8px; font-weight: 700; }
            .footer { padding: 16px 24px; font-size: 12px; color: #6b7280; background: #f9fafb; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="header">
              <h1>Reset your password</h1>
            </div>
            <div class="content">
              <p>Hello ${user.name},</p>
              <p>We received a request to reset your FeedForward password. Click the button below to create a new password.</p>
              <a href="${resetUrl}" class="button">Reset Password</a>
              <p style="margin-top: 18px; font-size: 13px; color: #6b7280;">This link will expire in 15 minutes. If you didn’t request this, you can safely ignore this email.</p>
            </div>
            <div class="footer">© 2026 FeedForward</div>
          </div>
        </body>
        </html>
      `
    };
    const info = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent to:', user.email, 'Response:', info.response);
    return info;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
};

exports.sendVerificationCodeEmail = async (user, code) => {
  try {
    const transporter = createTransporter();
    const mailOptions = {
      from: FROM_EMAIL,
      to: user.email,
      subject: '🔐 Your FeedForward verification code',
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f4f6fb; }
            .card { max-width: 520px; margin: 30px auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 12px 30px rgba(0,0,0,0.10); }
            .header { background: #0d6efd; color: #fff; padding: 18px 20px; text-align: center; }
            .header h1 { font-size: 24px; margin-bottom: 4px; }
            .content { padding: 24px; }
            .body { color: #374151; margin-bottom: 24px; font-size: 14px; line-height: 1.7; }
            .code-box { background: #f3f7ff; border: 1px dashed #0d6efd; padding: 22px 16px; border-radius: 8px; text-align: center; margin-bottom: 24px; }
            .code { font-size: 28px; font-weight: 800; letter-spacing: 0.25em; color: #0d6efd; }
            .footer { padding: 16px 20px; font-size: 12px; color: #6b7280; background: #f8fafc; border-top: 1px solid #e5e7eb; text-align: center; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="header">
              <h1>Verification code sent</h1>
            </div>
            <div class="content">
              <p class="body">Hello ${user.name},</p>
              <p class="body">Use the code below to verify your email address for FeedForward. Enter it on the verification page to finish setup.</p>
              <div class="code-box">
                <span class="code">${code}</span>
              </div>
              <p class="body">This code is valid for 15 minutes. If you didn’t request this code, please ignore this email or contact support.</p>
            </div>
            <div class="footer">Thanks for helping us fight food waste 🚀</div>
          </div>
        </body>
        </html>
      `
    };
    const info = await transporter.sendMail(mailOptions);
    console.log('Verification code email sent to:', user.email, 'Response:', info.response);
    return info;
  } catch (error) {
    console.error('Error sending verification code email:', error);
    throw error;
  }
};


// ================= CONTACT EMAIL =================
exports.sendContactNotification = async (name, email, subject, message) => {
  try {
    const transporter = createTransporter();
    
    // Verify SMTP connection
    try {
      await transporter.verify();
      console.log("✅ SMTP connection verified successfully");
    } catch (verifyError) {
      console.warn("⚠️ SMTP verification warning (email may still send):", verifyError.message);
    }
    
    const mailOptions = {
      from: FROM_EMAIL, // ✅ FIXED
      to: process.env.ADMIN_EMAIL,
      replyTo: email,
      subject: `[FeedForward Query] ${subject}`,
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background: white; }
            .header { background: linear-gradient(135deg, #d9534f 0%, #c9302c 100%); color: white; padding: 40px 20px; text-align: center; }
            .header h1 { font-size: 28px; margin-bottom: 10px; }
            .badge { display: inline-block; background: #fff; color: #d9534f; padding: 5px 15px; border-radius: 20px; font-size: 12px; font-weight: 600; margin-bottom: 10px; }
            .content { padding: 40px 30px; }
            .section { margin-bottom: 25px; }
            .info-box { background: #f9f9f9; padding: 20px; border-left: 4px solid #d9534f; border-radius: 4px; margin-bottom: 20px; }
            .info-row { margin-bottom: 15px; }
            .label { color: #d9534f; font-weight: 600; display: inline-block; width: 100px; }
            .value { color: #333; }
            .email-link { color: #d9534f; text-decoration: none; font-weight: 500; }
            .message-box { background: white; border: 2px solid #f0f0f0; padding: 20px; border-radius: 4px; line-height: 1.8; color: #555; white-space: pre-wrap; word-wrap: break-word; font-size: 14px; }
            .action-box { background: #fffacd; border: 1px solid #f4d03f; padding: 20px; border-radius: 4px; margin-top: 30px; text-align: center; }
            .reply-button { display: inline-block; padding: 12px 35px; background: #d9534f; color: white; text-decoration: none; border-radius: 4px; font-weight: 600; margin-top: 15px; }
            .footer { background-color: #f9f9f9; padding: 20px; text-align: center; color: #999; font-size: 12px; border-top: 1px solid #ddd; }
            .meta { color: #aaa; font-size: 12px; margin-top: 15px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="badge">⚡ NEW INQUIRY</div>
              <h1>📬 User Query Received</h1>
            </div>
            
            <div class="content">
              <div class="section">
                <h2 style="color: #333; margin-bottom: 20px; font-size: 18px;">Query Details</h2>
                <div class="info-box">
                  <div class="info-row">
                    <span class="label">Sender:</span>
                    <span class="value"><strong>${name}</strong></span>
                  </div>
                  <div class="info-row">
                    <span class="label">Email:</span>
                    <span class="value"><a href="mailto:${email}" class="email-link">${email}</a></span>
                  </div>
                  <div class="info-row">
                    <span class="label">Subject:</span>
                    <span class="value"><strong style="color: #d9534f;">${subject}</strong></span>
                  </div>
                  <div class="meta">
                    📅 Received on ${new Date().toLocaleString()}
                  </div>
                </div>
              </div>
              
              <div class="section">
                <h2 style="color: #333; margin-bottom: 15px; font-size: 18px;">Message</h2>
                <div class="message-box">${message}</div>
              </div>
              
              <div class="action-box">
                <p style="margin-bottom: 15px; color: #333;"><strong>💡 Quick Action:</strong></p>
                <p style="color: #666; margin-bottom: 15px; font-size: 13px;">Click "Reply" to respond directly to ${name}</p>
                <a href="mailto:${email}?subject=Re: ${encodeURIComponent(subject)}" class="reply-button">📧 Reply to ${name}</a>
              </div>
            </div>
            
            <div class="footer">
              <p><strong>ℹ️ Note:</strong> This is an automated notification from FeedForward Admin Panel</p>
              <p>© 2026 FeedForward - Admin Notification</p>
            </div>
          </div>
        </body>
        </html>
      `
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Contact email sent successfully to:', process.env.ADMIN_EMAIL);
    console.log('Response:', info.response);
    return info;

  } catch (error) {
    console.error('❌ Error sending contact email:', error);
    throw error;
  }
};

// ================= DONATION STATUS =================
exports.sendDonationStatusEmail = async (user, donation, status) => {
  try {
    const transporter = createTransporter();
    
    let statusMessage = '';
    let statusColor = '#FFC000';
    
    switch(status) {
      case 'approved':
        statusMessage = 'Your donation has been approved!';
        statusColor = '#28a745';
        break;
      case 'rejected':
        statusMessage = 'Your donation was rejected.';
        statusColor = '#dc3545';
        break;
      case 'picked_up':
        statusMessage = 'Your donation has been picked up!';
        statusColor = '#007bff';
        break;
      case 'delivered':
        statusMessage = 'Your donation has been delivered!';
        statusColor = '#28a745';
        break;
    }
    
    const mailOptions = {
      from: FROM_EMAIL, // ✅ FIXED
      to: user.email,
      subject: `Donation Update - ${donation.foodType}`,
      html: `
        <!DOCTYPE html>
        <html>
        <body>
          <h2 style="color:${statusColor}">Donation Status Update</h2>
          <p>${statusMessage}</p>
          <ul>
            <li>Food: ${donation.foodType}</li>
            <li>Packets: ${donation.numberOfPackets}</li>
            <li>Status: ${status}</li>
          </ul>
        </body>
        </html>
      `
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log('Donation email sent:', info.response);

  } catch (error) {
    console.error('Error sending donation email:', error);
  }
  
};

module.exports = exports;