const express = require('express');
const router = express.Router();
const { loginUser, seedAdmin } = require('../controllers/authController');

router.post('/login', loginUser);
router.post('/seed', seedAdmin); // Should ideally be protected or removed in prod

module.exports = router;
