const express = require('express');
const {
    getUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser
} = require('../controllers/userController');

const router = express.Router();

const { protect, isAdmin, authorize } = require('../middleware/authMiddleware');
const { validateUser } = require('../middleware/validator');

router.use(protect);

router
    .route('/')
    .get(authorize('admin', 'teacher'), getUsers)
    .post(isAdmin, validateUser, createUser);

router
    .route('/:id')
    .get(authorize('admin', 'teacher'), getUser)
    .put(isAdmin, updateUser)
    .delete(isAdmin, deleteUser);

module.exports = router;
