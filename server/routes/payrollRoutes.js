const express = require('express');
const router = express.Router();
const { generatePayroll, generateBulkPayroll, getPayrolls, getEmployeePayrolls, getBulkPayrollStatus } = require('../controllers/payrollController');
const { protect, adminOnly } = require('../middleware/auth');

router.route('/')
  .get(protect, adminOnly, getPayrolls);

router.route('/generate-all')
  .post(protect, adminOnly, generateBulkPayroll);

router.route('/bulk-status/:jobId')
  .get(protect, adminOnly, getBulkPayrollStatus);

router.route('/generate/:employeeId')
  .post(protect, adminOnly, generatePayroll);

router.route('/employee/:employeeId')
  .get(protect, getEmployeePayrolls);

module.exports = router;
