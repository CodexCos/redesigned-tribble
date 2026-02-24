const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes
exports.protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        // Set token from Bearer token in header
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies?.token) {
        // Set token from cookie
        token = req.cookies.token;
    }

    // Make sure token exists
    if (!token) {
        return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Token verified, decoded id:', decoded.id);

        req.user = await User.findById(decoded.id);

        if (!req.user) {
            console.log('User not found in DB for id:', decoded.id);
            return res.status(401).json({ success: false, message: 'User no longer exists' });
        }

        console.log('User authenticated:', req.user.email);
        next();
    } catch (err) {
        console.error('Token verification failed:', err.message);
        return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
    }
};

// Generic Role-based access control
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `User role ${req.user.role} is not authorized to access this route`
            });
        }
        next();
    };
};

// Specific Role Middleware
exports.isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        return res.status(403).json({ success: false, message: 'Admin access required' });
    }
};

exports.isTeacher = (req, res, next) => {
    if (req.user && req.user.role === 'teacher') {
        next();
    } else {
        return res.status(403).json({ success: false, message: 'Teacher access required' });
    }
};

exports.isStudent = (req, res, next) => {
    if (req.user && req.user.role === 'student') {
        next();
    } else {
        return res.status(403).json({ success: false, message: 'Student access required' });
    }
};
