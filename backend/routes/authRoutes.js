const express = require('express');
const { login, logout, getMe, updatePassword } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { validateLogin } = require('../middleware/validator');

const router = express.Router();

router.post('/login', validateLogin, login);
router.get('/logout', logout);
router.get('/me', protect, getMe);
router.put('/updatepassword', protect, updatePassword);

module.exports = router;
