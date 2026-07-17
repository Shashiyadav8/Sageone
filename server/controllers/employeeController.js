const Employee = require('../models/Employee');
const SalaryPackage = require('../models/SalaryPackage');
const bcrypt = require('bcrypt');
const { calculateSalaryStructure } = require('../services/salaryCalculator');

// @desc    Get all employees
// @route   GET /api/employees
// @access  Private/Admin
const getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find({}).select('-password');
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Helper function to auto-generate salary package based on Monthly Gross Salary
const autoGenerateSalaryPackage = async (employeeId, grossSalary) => {
  if (!grossSalary || isNaN(grossSalary)) return;
  
  const packageData = calculateSalaryStructure(grossSalary);
  packageData.employee = employeeId;

  await SalaryPackage.findOneAndUpdate(
    { employee: employeeId },
    packageData,
    { upsert: true, returnDocument: 'after' }
  );
};

// @desc    Create new employee
// @route   POST /api/employees
// @access  Private/Admin
const createEmployee = async (req, res) => {
  try {
    const { employeeId, employeeName, password, designation, uanNo, esicNo, location, grossSalary, status } = req.body;

    const employeeExists = await Employee.findOne({ employeeId });
    if (employeeExists) {
      return res.status(400).json({ message: 'Employee with this ID already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const employee = await Employee.create({
      employeeId,
      employeeName,
      password: hashedPassword,
      designation,
      uanNo,
      esicNo,
      location,
      grossSalary,
      status
    });

    if (employee) {
      // Auto-generate salary package based on Monthly Gross Salary
      if (grossSalary) {
        await autoGenerateSalaryPackage(employee._id, grossSalary);
      }

      res.status(201).json({
        _id: employee._id,
        employeeId: employee.employeeId,
        employeeName: employee.employeeName
      });
    } else {
      res.status(400).json({ message: 'Invalid employee data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get employee by ID
// @route   GET /api/employees/:id
// @access  Private
const getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id).select('-password');
    if (employee) {
      res.json(employee);
    } else {
      res.status(404).json({ message: 'Employee not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update employee
// @route   PUT /api/employees/:id
// @access  Private
const updateEmployee = async (req, res) => {
  try {
    // Only allow admin or the employee themselves to update
    if (req.userType !== 'admin' && req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ message: 'Not authorized to update this profile' });
    }

    const employee = await Employee.findById(req.params.id);

    if (employee) {
      // Employees can only update their password. Admins can update everything.
      if (req.userType === 'admin') {
        employee.employeeName = req.body.employeeName || employee.employeeName;
        employee.designation = req.body.designation || employee.designation;
        employee.uanNo = req.body.uanNo || employee.uanNo;
        employee.esicNo = req.body.esicNo || employee.esicNo;
        employee.location = req.body.location || employee.location;
        employee.status = req.body.status || employee.status;
        
        if (req.body.grossSalary !== undefined) {
          employee.grossSalary = req.body.grossSalary;
          if (req.body.grossSalary) {
            await autoGenerateSalaryPackage(employee._id, req.body.grossSalary);
          }
        }
      }

      if (req.body.password) {
        const salt = await bcrypt.genSalt(10);
        employee.password = await bcrypt.hash(req.body.password, salt);
      }

      const updatedEmployee = await employee.save();
      res.json({
        _id: updatedEmployee._id,
        employeeName: updatedEmployee.employeeName,
        status: updatedEmployee.status
      });
    } else {
      res.status(404).json({ message: 'Employee not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getEmployees, createEmployee, getEmployeeById, updateEmployee };
