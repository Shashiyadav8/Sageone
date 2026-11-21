const express = require('express');
const router = express.Router();
const { loginUser, seedAdmin, changeAdminPassword } = require('../controllers/authController');
const { protect, adminOnly } = require('../middleware/auth');

router.post('/login', loginUser);
router.post('/seed', seedAdmin); // Should ideally be protected or removed in prod
router.put('/change-password', protect, adminOnly, changeAdminPassword);

module.exports = router;
