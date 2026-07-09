const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const seedEmployee = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/attendance');
    
    // Check if employee exists
    const existingEmployee = await User.findOne({ employeeId: 'EMP001' });
    if (existingEmployee) {
      console.log('Employee already exists!');
      process.exit();
    }

    // Create dummy employee
    const employeeUser = new User({
      name: 'John Doe',
      employeeId: 'EMP001',
      password: 'password123',
      role: 'Employee',
      department: 'Engineering',
      shift: 'General',
      isFieldWorker: false
    });

    await employeeUser.save();
    
    console.log('-----------------------------');
    console.log('Employee Created Successfully!');
    console.log('Employee ID: EMP001');
    console.log('Password: password123');
    console.log('-----------------------------');

    process.exit();
  } catch (error) {
    console.error('Error seeding employee:', error);
    process.exit(1);
  }
};

seedEmployee();
