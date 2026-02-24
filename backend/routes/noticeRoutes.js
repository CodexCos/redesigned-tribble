const express = require('express');
const {
    getNotices,
    getNotice,
    createNotice,
    updateNotice,
    deleteNotice
} = require('../controllers/noticeController');

const router = express.Router();

const { protect, authorize } = require('../middleware/authMiddleware');
const { validateNotice } = require('../middleware/validator');

router.use(protect);

router
    .route('/')
    .get(getNotices)
    .post(authorize('admin', 'teacher'), validateNotice, createNotice);

router
    .route('/:id')
    .get(getNotice)
    .put(authorize('admin', 'teacher'), updateNotice)
    .delete(authorize('admin', 'teacher'), deleteNotice);

module.exports = router;
