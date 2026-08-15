const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const connectDB = require('../config/db');

dotenv.config();
connectDB();

const seedData = async () => {
  try {
    console.log('🌱 Seeding database...');
    
    // Clear existing data
    await User.deleteMany();
    console.log('✅ Cleared existing users');
    
    // Create SINGLE admin user (manually created, cannot register)
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@feedforward.org',
      password: 'admin123',
      role: 'admin',
      isEmailVerified: true // Admin is pre-verified
    });
    console.log('✅ Created admin user (Single admin - cannot be created via signup)');
    
    // Create sample donor
    const donor = await User.create({
      name: 'John Donor',
      email: 'donor@example.com',
      password: 'donor123',
      role: 'donor',
      isEmailVerified: true
    });
    console.log('✅ Created sample donor');
    
    // Create sample volunteer
    const volunteer = await User.create({
      name: 'Jane Volunteer',
      email: 'volunteer@example.com',
      password: 'volunteer123',
      role: 'volunteer',
      vehicleInfo: 'Honda Civic 2020',
      isEmailVerified: true
    });
    volunteer.generateVolunteerPin();
    await volunteer.save();
    console.log(`✅ Created sample volunteer with PIN: ${volunteer.volunteerPin}`);
    
    // Create sample food checker
    const checker = await User.create({
      name: 'Mike Checker',
      email: 'checker@example.com',
      password: 'checker123',
      role: 'foodChecker',
      location: '123 Main St, Quality Control Center',
      isEmailVerified: true
    });
    console.log('✅ Created sample food checker');
    
    // Create sample NGO
    const ngo = await User.create({
      name: 'Hope Orphanage Contact Person',
      email: 'ngo@example.com',
      password: 'ngo123',
      role: 'ngo',
      organizationName: 'Hope Orphanage',
      registrationNumber: 'ORG-2024-001',
      organizationType: 'orphanage',
      isEmailVerified: true
    });
    console.log('✅ Created sample NGO');
    
    console.log('\n🎉 Database seeded successfully!\n');
    console.log('📝 Sample Credentials:');
    console.log('─────────────────────────────────');
    console.log('Admin (Single - Cannot register):');
    console.log('  Email: admin@feedforward.org');
    console.log('  Password: admin123');
    console.log('\nDonor:');
    console.log('  Email: donor@example.com');
    console.log('  Password: donor123');
    console.log('\nVolunteer:');
    console.log('  Email: volunteer@example.com');
    console.log('  Password: volunteer123');
    console.log(`  PIN: ${volunteer.volunteerPin}`);
    console.log('\nFood Checker:');
    console.log('  Email: checker@example.com');
    console.log('  Password: checker123');
    console.log('\nNGO:');
    console.log('  Email: ngo@example.com');
    console.log('  Password: ngo123');
    console.log('  Organization: Hope Orphanage');
    console.log('─────────────────────────────────\n');
    console.log('⚠️  Note: All accounts are email-verified for testing');
    console.log('⚠️  Admin cannot be created via signup - only via database\n');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
