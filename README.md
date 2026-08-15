# 🍽️ FeedForward v2.0 - Complete Full-Stack Application

## Smart Food Waste Redistribution Platform with NGO Integration

A comprehensive MERN stack platform connecting food donors, volunteers, and NGOs to redistribute excess food to vulnerable populations with **email verification**, **NGO locking system**, and **cloud-based image storage**.

---

## ✨ NEW FEATURES IN V2.0

### 🔐 **Email Verification System**
- All users must verify their email before accessing the platform
- Automated verification emails sent via Nodemailer
- Secure token-based verification

### 🏢 **NGO Role & Locking System**
- NGOs can request large donations (≥50 packets)
- **First-come locking**: First NGO to request locks the donation
- Other NGOs cannot request locked donations
- Admin approves/rejects NGO requests

### ☁️ **Cloudinary Image Upload**
- Camera-based image capture for donors
- Secure cloud storage via Cloudinary
- Multiple image support per donation

### 📧 **Email Notifications**
- Contact form messages sent directly to admin email
- Donation status updates via email
- Welcome and verification emails

### 👑 **Single Admin System**
- Only ONE admin exists (created manually in database)
- Admin cannot register via signup page
- Pre-configured admin account

---

## 📦 What's Included

### **Frontend (React + Vite + Tailwind CSS)**
- ✅ 11 fully functional pages
- ✅ 5 role-based dashboards (Donor, Volunteer, Food Checker, NGO, Admin)
- ✅ Email verification flow
- ✅ Camera-based image upload
- ✅ NGO dashboard with request system
- ✅ Custom food donation background image
- ✅ Responsive design

### **Backend (Node.js + Express + MongoDB)**
- ✅ 8 Mongoose models
- ✅ 8 API route files with 40+ endpoints
- ✅ Email service (Nodemailer)
- ✅ Cloudinary integration
- ✅ NGO locking mechanism
- ✅ JWT + Email verification
- ✅ Complete error handling

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js** v16+ ([Download](https://nodejs.org/))
- **MongoDB** v5+ ([Download](https://www.mongodb.com/try/download/community)) OR MongoDB Atlas account
- **Gmail account** (for sending emails)
- **Cloudinary account** ([Sign up free](https://cloudinary.com/))

### Step 1: Extract the Project
```bash
# Extract the zip file
# Navigate to the project directory
cd feedforward-final
```

### Step 2: Install Backend Dependencies
```bash
cd backend
npm install
```

### Step 3: Install Frontend Dependencies
```bash
cd ../frontend
npm install
```

### Step 4: Configure Backend Environment

1. **Create `.env` file** in the `backend` folder:
```bash
cd ../backend
copy .env.example .env    # Windows
cp .env.example .env      # Mac/Linux
```

2. **Edit `.env` file** with your details:

```env
# Server
NODE_ENV=development
PORT=5000

# Database (choose one)
# Option 1: Local MongoDB
MONGODB_URI=mongodb://localhost:27017/feedforward

# Option 2: MongoDB Atlas (recommended)
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/feedforward

# JWT
JWT_SECRET=your_super_secret_random_string_here
JWT_EXPIRE=24h

# Cloudinary (get from cloudinary.com/console)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Gmail SMTP (for sending emails)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM=FeedForward <noreply@feedforward.org>
ADMIN_EMAIL=admin@feedforward.org

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

#### 📧 How to Get Gmail App Password:
1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Security → 2-Step Verification → App passwords
3. Generate new app password
4. Copy the 16-character password to `EMAIL_PASSWORD`

#### ☁️ How to Get Cloudinary Credentials:
1. Sign up at [Cloudinary](https://cloudinary.com/)
2. Go to Dashboard
3. Copy Cloud Name, API Key, and API Secret

### Step 5: Seed the Database
```bash
# Make sure you're in the backend folder
npm run seed
```

This creates:
- ✅ Admin account (admin@feedforward.org / admin123)
- ✅ Sample donor, volunteer, food checker, and NGO accounts
- ✅ All accounts pre-verified for testing

### Step 6: Start the Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
Backend runs on: `http://localhost:5000`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
Frontend runs on: `http://localhost:3000`

### Step 7: Login & Test

Open `http://localhost:3000` in your browser and login with:

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@feedforward.org | admin123 |
| **Donor** | donor@example.com | donor123 |
| **Volunteer** | volunteer@example.com | volunteer123 |
| **Food Checker** | checker@example.com | checker123 |
| **NGO** | ngo@example.com | ngo123 |

---

## 🎯 Key Features Explained

### **Email Verification Flow**
1. User registers → Email sent automatically
2. User clicks verification link in email
3. Email verified → User can now login
4. Unverified users cannot login

### **NGO Locking System**
1. Donor posts donation with ≥50 packets
2. Donation eligible for NGO requests
3. First NGO clicks "Request" → Donation LOCKED
4. Other NGOs see "Already Requested"
5. Admin approves → Assigns volunteer → Delivered to NGO

### **Camera-Based Upload**
1. Donor clicks "Upload Image"
2. Can choose camera or file
3. Image uploaded to Cloudinary
4. Secure URL stored in database

### **Contact Email System**
1. User fills contact form
2. Email sent directly to admin
3. Admin receives notification

---

## 📂 Project Structure

```
feedforward-final/
├── backend/
│   ├── models/
│   │   ├── User.js              (with email verification)
│   │   ├── Donation.js          (with packet count & NGO eligibility)
│   │   ├── NGORequest.js        (NEW - locking system)
│   │   ├── Delivery.js
│   │   ├── Inspection.js
│   │   └── ...
│   ├── routes/
│   │   ├── auth.js              (with email verification)
│   │   ├── donations.js         (with Cloudinary upload)
│   │   ├── ngo.js               (NEW - NGO endpoints)
│   │   ├── contact.js           (NEW - email to admin)
│   │   ├── admin.js             (with NGO approval)
│   │   └── ...
│   ├── config/
│   │   ├── db.js
│   │   └── cloudinary.js        (NEW)
│   ├── utils/
│   │   ├── emailService.js      (NEW)
│   │   └── seed.js
│   ├── server.js
│   ├── package.json
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── pages/
    │   │   ├── LandingPage.jsx   (with custom background)
    │   │   ├── SignupPage.jsx    (with NGO fields)
    │   │   ├── NGODashboard.jsx  (NEW)
    │   │   └── ...
    │   └── ...
    ├── public/
    │   └── food-donation-bg.jpg  (Your background image)
    └── package.json
```

---

## 🔧 API Endpoints

### Authentication
```
POST   /api/auth/register              - Register (no admin)
GET    /api/auth/verify-email/:token   - Verify email
POST   /api/auth/login                 - Login
GET    /api/auth/me                    - Get current user
```

### Donations
```
POST   /api/donations/create           - Create with images
GET    /api/donations/my-donations     - Donor's donations
GET    /api/donations/available        - For volunteers
```

### NGO
```
GET    /api/ngo/available-donations    - Large donations (≥50)
POST   /api/ngo/request                - Request & lock donation
GET    /api/ngo/my-requests            - NGO's requests
```

### Admin
```
GET    /api/admin/ngo-requests         - All NGO requests
PUT    /api/admin/ngo-requests/:id/approve  - Approve request
PUT    /api/admin/ngo-requests/:id/reject   - Reject & unlock
```

### Contact
```
POST   /api/contact                    - Send email to admin
```

---

## 🔐 Security Features

- ✅ JWT authentication
- ✅ Email verification mandatory
- ✅ Password hashing (bcrypt)
- ✅ Role-based access control
- ✅ Single admin restriction
- ✅ Secure image upload
- ✅ Environment variables

---

## 🐛 Troubleshooting

### **Email not sending**
- Check Gmail app password is correct
- Enable "Less secure app access" if needed
- Check spam folder

### **Cloudinary upload fails**
- Verify API credentials
- Check image size (<5MB)
- Ensure file is an image

### **MongoDB connection error**
- Check MongoDB is running (if local)
- Verify connection string (if Atlas)

### **Port already in use**
- Change PORT in .env
- Kill process: `npx kill-port 5000`

---

## 📊 Database Models

### Users
- Donor, Volunteer, Food Checker, NGO, Admin
- Email verification fields
- Role-specific fields (vehicle, location, organization)

### Donations
- `numberOfPackets` (integer)
- `isEligibleForNGO` (auto-calculated if ≥50)
- `lockedByNGO` (reference to NGO user)
- Cloudinary image URLs

### NGORequests
- `ngo` (reference)
- `donation` (reference)
- `status` (requested, approved, rejected)
- First-come locking mechanism

---

## 🎨 Frontend Features

- ✅ Custom food donation background
- ✅ Email verification messages
- ✅ NGO dashboard with request UI
- ✅ Camera upload interface
- ✅ Admin NGO approval panel
- ✅ Responsive design

---

## 📝 Important Notes

1. **Admin Account**: Only created via seed script, cannot register
2. **Email Verification**: Required for all non-admin users
3. **NGO Eligibility**: Donations must have ≥50 packets
4. **Locking System**: First NGO to request locks the donation
5. **Image Upload**: Max 5 images, 5MB each

---

## 🆘 Support

For issues or questions:
- Check this README
- Review .env.example for configuration
- Check browser console for frontend errors
- Check terminal for backend errors

---

## 🙏 Credits

Built with ❤️ for fighting food waste and supporting communities in need.

**Technologies**: MongoDB, Express.js, React.js, Node.js, Cloudinary, Nodemailer

---

**FeedForward v2.0** - From Surplus to Plate. Quick. Fair. Safe. 🚀
