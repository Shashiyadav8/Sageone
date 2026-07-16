const express = require('express');
const router = express.Router();
const { getEmployees, createEmployee, getEmployeeById, updateEmployee } = require('../controllers/employeeController');
const { protect, adminOnly } = require('../middleware/auth');

router.route('/')
  .get(protect, adminOnly, getEmployees)
  .post(protect, adminOnly, createEmployee);

router.route('/:id')
  .get(protect, getEmployeeById)
  .put(protect, updateEmployee);

module.exports = router;
