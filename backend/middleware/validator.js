const { body, validationResult } = require('express-validator');

exports.validateLogin = [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }
        next();
    }
];

exports.validateUser = [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').isIn(['admin', 'student', 'teacher']).withMessage('Invalid role'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }
        next();
    }
];

exports.validateAttendance = [
    body('subjectId').isMongoId().withMessage('Invalid Subject ID'),
    body('date').isISO8601().withMessage('Invalid date format'),
    body('entries').isArray({ min: 1 }).withMessage('Attendance entries are required'),
    body('entries.*.studentId').isMongoId().withMessage('Invalid Student ID in entry'),
    body('entries.*.status').isIn(['present', 'absent']).withMessage('Status must be present or absent'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }
        next();
    }
];

exports.validateNotice = [
    body('title').notEmpty().withMessage('Notice title is required').isLength({ max: 100 }).withMessage('Title too long'),
    body('content').notEmpty().withMessage('Notice content is required'),
    body('type').isIn(['general', 'exam', 'holiday', 'event']).withMessage('Invalid notice type'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }
        next();
    }
];

exports.validateSubject = [
    body('name').notEmpty().withMessage('Subject name is required'),
    body('semester').isInt({ min: 1, max: 8 }).withMessage('Semester must be between 1 and 8'),
    body('teacher').isMongoId().withMessage('Invalid Teacher ID'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }
        next();
    }
];
