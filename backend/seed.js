const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        // Check if admin exists
        const adminExists = await User.findOne({ email: 'admin@college.com' });
        if (adminExists) {
            console.log('Admin already exists');
            process.exit();
        }

        const admin = await User.create({
            name: 'System Admin',
            email: 'admin@college.com',
            password: 'password123',
            role: 'admin'
        });

        console.log('Admin User Created:', admin.email);
        console.log('Password: password123');
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

seed();
