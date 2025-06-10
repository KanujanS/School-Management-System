import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';
import 'dotenv/config';

const adminAccounts = [
  {
    name: 'Admin One',
    email: 'admin1@mns.com',
    password: 'Admin1@MNS',
    role: 'admin',
    isActive: true
  },
  {
    name: 'Admin Two',
    email: 'admin2@mns.com',
    password: 'Admin2@MNS',
    role: 'admin',
    isActive: true
  },
  {
    name: 'Admin Three',
    email: 'admin3@mns.com',
    password: 'Admin3@MNS',
    role: 'admin',
    isActive: true
  }
];

const initializeAdmins = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mns');
    console.log('Connected to MongoDB');

    // First, delete any existing admin accounts
    const User = mongoose.model('User', new mongoose.Schema({
      name: String,
      email: String,
      password: String,
      role: String,
      isActive: Boolean
    }));

    await User.deleteMany({ role: 'admin' });
    console.log('Deleted existing admin accounts');

    // Create new admin accounts with properly hashed passwords
    for (const admin of adminAccounts) {
      // Hash password
      const salt = await bcryptjs.genSalt(10);
      const hashedPassword = await bcryptjs.hash(admin.password, salt);
      
      // Create admin with hashed password
      const newAdmin = await User.create({
        ...admin,
        password: hashedPassword
      });

      console.log(`Created admin account:`, {
        email: newAdmin.email,
        role: newAdmin.role,
        isActive: newAdmin.isActive,
        passwordHash: hashedPassword.substring(0, 10) + '...'
      });

      // Verify the password works
      const isMatch = await bcryptjs.compare(admin.password, hashedPassword);
      console.log('Password verification test:', {
        email: admin.email,
        isMatch,
        passwordLength: admin.password.length,
        hashLength: hashedPassword.length
      });
    }

    console.log('Admin initialization completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error initializing admins:', error);
    process.exit(1);
  }
};

initializeAdmins(); 