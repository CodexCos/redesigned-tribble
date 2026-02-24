const Subject = require('../models/Subject');
const User = require('../models/User');

// @desc    Get all subjects (optionally filter by semester)
// @route   GET /api/v1/subjects
// @access  Private/Admin/Teacher
exports.getSubjects = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const startIndex = (page - 1) * limit;

        let query = {};

        if (req.query.semester) {
            query.semester = req.query.semester;
        }

        if (req.user.role === 'teacher') {
            query.teacher = req.user.id;
        } else if (req.user.role === 'student') {
            query.enrolledStudents = req.user.id;
        }

        const subjects = await Subject.find(query)
            .populate('teacher', 'name email')
            .populate('enrolledStudents', 'name email enrollmentId')
            .skip(startIndex)
            .limit(limit);

        const total = await Subject.countDocuments(query);

        res.status(200).json({
            success: true,
            count: subjects.length,
            pagination: {
                total,
                page,
                pages: Math.ceil(total / limit)
            },
            data: subjects
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Create subject (Admin or Teacher for their assigned semesters)
// @route   POST /api/v1/subjects
// @access  Private/Admin/Teacher
exports.createSubject = async (req, res, next) => {
    try {
        const { name, semester } = req.body;

        if (!semester || semester < 1 || semester > 8) {
            return res.status(400).json({ success: false, message: 'Please provide a valid semester (1-8)' });
        }

        // Teacher logic: only allow creation for assigned semesters
        if (req.user.role === 'teacher') {
            if (!req.user.semesters.includes(Number(semester))) {
                return res.status(403).json({ success: false, message: 'You are not assigned to this semester' });
            }
            req.body.teacher = req.user.id;
        }

        const subject = await Subject.create(req.body);
        res.status(201).json({ success: true, data: subject });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Update subject
// @route   PUT /api/v1/subjects/:id
// @access  Private/Admin/Teacher
exports.updateSubject = async (req, res, next) => {
    try {
        let subject = await Subject.findById(req.params.id);
        if (!subject) return res.status(404).json({ success: false, message: 'Subject not found' });

        // Teacher logic: only allow updating their own subjects
        if (req.user.role === 'teacher' && subject.teacher.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Not authorized to update this subject' });
        }

        subject = await Subject.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({ success: true, data: subject });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Delete subject
// @route   DELETE /api/v1/subjects/:id
// @access  Private/Admin/Teacher
exports.deleteSubject = async (req, res, next) => {
    try {
        const subject = await Subject.findById(req.params.id);
        if (!subject) return res.status(404).json({ success: false, message: 'Subject not found' });

        // Teacher logic: only allow deleting their own subjects
        if (req.user.role === 'teacher' && subject.teacher.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Not authorized to delete this subject' });
        }

        // Delete associated attendance records
        const Attendance = require('../models/Attendance');
        await Attendance.deleteMany({ subject: req.params.id });

        await subject.deleteOne();
        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Enroll student into subject
// @route   POST /api/v1/subjects/:id/enroll
// @access  Private/Admin/Teacher
exports.enrollStudent = async (req, res, next) => {
    try {
        const subject = await Subject.findById(req.params.id);
        if (!subject) return res.status(404).json({ success: false, message: 'Subject not found' });

        // Teacher logic: only allow enrollment for their subjects
        if (req.user.role === 'teacher' && subject.teacher.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Not authorized to enroll students in this subject' });
        }

        const { studentId } = req.body;
        const student = await User.findById(studentId);

        if (!student || student.role !== 'student') {
            return res.status(400).json({ success: false, message: 'Invalid student ID' });
        }

        // Optional: Check if student belongs to the same semester
        if (student.semester !== subject.semester) {
            return res.status(400).json({ success: false, message: `Student is in semester ${student.semester} but subject is for semester ${subject.semester}` });
        }

        if (subject.enrolledStudents.includes(studentId)) {
            return res.status(400).json({ success: false, message: 'Student already enrolled' });
        }

        subject.enrolledStudents.push(studentId);
        await subject.save();

        res.status(200).json({ success: true, data: subject });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
