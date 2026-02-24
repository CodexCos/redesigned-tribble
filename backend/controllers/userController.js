const User = require('../models/User');
const Attendance = require('../models/Attendance');
const Subject = require('../models/Subject');

// @desc    Get all users
// @route   GET /api/v1/users
// @access  Private/Admin
exports.getUsers = async (req, res, next) => {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    // Build query from allowed filters only
    const filter = {};
    if (req.query.role && req.query.role !== '') filter.role = req.query.role;
    if (req.query.semester) filter.semester = parseInt(req.query.semester);
    if (req.query.enrollmentId) filter.enrollmentId = { $regex: req.query.enrollmentId, $options: 'i' };

    const users = await User.find(filter)
        .skip(startIndex)
        .limit(limit);

    const total = await User.countDocuments(filter);

    res.status(200).json({
        success: true,
        count: users.length,
        pagination: {
            total,
            page,
            pages: Math.ceil(total / limit)
        },
        data: users
    });
};


// @desc    Get single user
// @route   GET /api/v1/users/:id
// @access  Private/Admin
exports.getUser = async (req, res, next) => {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.status(200).json({ success: true, data: user });
};

// @desc    Create user (Student/Teacher/Admin)
// @route   POST /api/v1/users
// @access  Private/Admin
exports.createUser = async (req, res, next) => {
    try {
        const { role, semester, semesters } = req.body;

        // Validation for Student
        if (role === 'student' && (!semester || semester < 1 || semester > 8)) {
            return res.status(400).json({ success: false, message: 'Please provide a valid semester (1-8) for students' });
        }

        // Validation for Teacher
        if (role === 'teacher' && (!semesters || !Array.isArray(semesters))) {
            return res.status(400).json({ success: false, message: 'Please provide a semesters array for teachers' });
        }

        const user = await User.create(req.body);
        res.status(201).json({ success: true, data: user });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Update user
// @route   PUT /api/v1/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res, next) => {
    try {
        const { password, ...fieldsToUpdate } = req.body;

        // Step 1: If password is being changed, do it via save() to trigger the bcrypt hook
        if (password && password.trim().length >= 6) {
            const userForPassword = await User.findById(req.params.id).select('+password');
            if (!userForPassword) return res.status(404).json({ success: false, message: 'User not found' });
            userForPassword.password = password;
            await userForPassword.save();
        }

        // Step 2: Update all other fields with findByIdAndUpdate (skips validators to allow partial updates)
        const cleanFields = {};
        if (fieldsToUpdate.name) cleanFields.name = fieldsToUpdate.name;
        if (fieldsToUpdate.email) cleanFields.email = fieldsToUpdate.email;
        if (fieldsToUpdate.role) cleanFields.role = fieldsToUpdate.role;
        if (fieldsToUpdate.semester !== undefined && fieldsToUpdate.semester !== null && fieldsToUpdate.semester !== 0) {
            cleanFields.semester = fieldsToUpdate.semester;
        }
        if (Array.isArray(fieldsToUpdate.semesters)) cleanFields.semesters = fieldsToUpdate.semesters;

        const user = await User.findByIdAndUpdate(
            req.params.id,
            cleanFields,
            { new: true, runValidators: false }
        );

        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        res.status(200).json({ success: true, data: user });
    } catch (err) {
        console.error('Update user error:', err.message);
        res.status(400).json({ success: false, message: err.message });
    }
};


// @desc    Delete user
// @route   DELETE /api/v1/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res, next) => {
    const Attendance = require('../models/Attendance');
    const Subject = require('../models/Subject');

    // Delete student attendance
    await Attendance.deleteMany({ student: req.params.id });

    // Remove student from all subject enrollments
    await Subject.updateMany(
        { enrolledStudents: req.params.id },
        { $pull: { enrolledStudents: req.params.id } }
    );

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.status(200).json({ success: true, data: {} });
};
