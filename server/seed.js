const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/attendance');
    console.log('Connected to MongoDB');

    // Check if an admin already exists
    const existingAdmin = await User.findOne({ employeeId: 'ADMIN001' });
    if (existingAdmin) {
      console.log('Admin user already exists!');
      process.exit();
    }

    // Create admin user
    const adminUser = new User({
      name: 'System Admin',
      employeeId: 'ADMIN001',
      password: 'adminpassword',
      role: 'Admin',
      department: 'Management',
      shift: 'General',
      isFieldWorker: false
    });

    await adminUser.save();
    console.log('Default Admin user created successfully!');
    console.log('-----------------------------');
    console.log('Employee ID: ADMIN001');
    console.log('Password: adminpassword');
    console.log('-----------------------------');

    process.exit();
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedAdmin();
