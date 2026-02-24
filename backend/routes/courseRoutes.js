const express = require('express');
const {
    getCourses,
    createCourse,
    updateCourse,
    deleteCourse
} = require('../controllers/courseController');

const router = express.Router();

const { protect, isAdmin } = require('../middleware/authMiddleware');

router.get('/', getCourses);
router.post('/', protect, isAdmin, createCourse);
router.put('/:id', protect, isAdmin, updateCourse);
router.delete('/:id', protect, isAdmin, deleteCourse);

module.exports = router;
