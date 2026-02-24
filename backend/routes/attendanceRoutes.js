const express = require('express');
const {
    markAttendance,
    getAttendance,
    getStudentStats,
    getOverallSummary,
    deleteAttendance
} = require('../controllers/attendanceController');

const router = express.Router();

const { protect, authorize, isStudent } = require('../middleware/authMiddleware');
const { validateAttendance } = require('../middleware/validator');

router.use(protect);

// Mark attendance (Teachers and Admin)
router.post('/', authorize('teacher', 'admin'), validateAttendance, markAttendance);

// Get specific attendance records
router.get('/', getAttendance);

// Attendance summary and stats
router.get('/summary', isStudent, getOverallSummary);
router.get('/stats', isStudent, getStudentStats);

// Specific records by ID
router.route('/:id').delete(authorize('admin'), deleteAttendance);

// Admin/Teacher can view specific student stats
router.get('/summary/:studentId', authorize('teacher', 'admin'), getOverallSummary);
router.get('/stats/:studentId', authorize('teacher', 'admin'), getStudentStats);

module.exports = router;
