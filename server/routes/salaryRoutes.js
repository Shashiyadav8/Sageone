const express = require('express');
const router = express.Router();
const { getSalaryPackage, upsertSalaryPackage } = require('../controllers/salaryController');
const { protect, adminOnly } = require('../middleware/auth');

router.route('/:employeeId')
  .get(protect, getSalaryPackage)
  .post(protect, adminOnly, upsertSalaryPackage);

module.exports = router;
