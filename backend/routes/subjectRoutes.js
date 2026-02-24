const express = require('express');
const {
    getSubjects,
    createSubject,
    updateSubject,
    deleteSubject,
    enrollStudent
} = require('../controllers/subjectController');

const router = express.Router();

const { protect, isAdmin, authorize } = require('../middleware/authMiddleware');
const { validateSubject } = require('../middleware/validator');

router.use(protect);

router
    .route('/')
    .get(getSubjects)
    .post(isAdmin, validateSubject, createSubject);

router
    .route('/:id')
    .put(authorize('admin', 'teacher'), validateSubject, updateSubject)
    .delete(authorize('admin', 'teacher'), deleteSubject);

router.post('/:id/enroll', authorize('admin', 'teacher'), enrollStudent);

module.exports = router;
