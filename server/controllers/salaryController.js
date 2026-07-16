const SalaryPackage = require('../models/SalaryPackage');
const Employee = require('../models/Employee');

// @desc    Get salary package for an employee
// @route   GET /api/salary/:employeeId
// @access  Private
const getSalaryPackage = async (req, res) => {
  try {
    const salaryPackage = await SalaryPackage.findOne({ employee: req.params.employeeId });
    if (salaryPackage) {
      res.json(salaryPackage);
    } else {
      res.status(404).json({ message: 'Salary package not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create or update salary package
// @route   POST /api/salary/:employeeId
// @access  Private/Admin
const upsertSalaryPackage = async (req, res) => {
  try {
    const { basic, hra, specialAllowance, medical, conveyance, bonus, pf, esi, professionalTax, otherDeductions } = req.body;
    
    let salaryPackage = await SalaryPackage.findOne({ employee: req.params.employeeId });

    if (salaryPackage) {
      // Update existing
      salaryPackage.basic = basic !== undefined ? basic : salaryPackage.basic;
      salaryPackage.hra = hra !== undefined ? hra : salaryPackage.hra;
      salaryPackage.specialAllowance = specialAllowance !== undefined ? specialAllowance : salaryPackage.specialAllowance;
      salaryPackage.medical = medical !== undefined ? medical : salaryPackage.medical;
      salaryPackage.conveyance = conveyance !== undefined ? conveyance : salaryPackage.conveyance;
      salaryPackage.bonus = bonus !== undefined ? bonus : salaryPackage.bonus;
      
      salaryPackage.pf = pf !== undefined ? pf : salaryPackage.pf;
      salaryPackage.esi = esi !== undefined ? esi : salaryPackage.esi;
      salaryPackage.professionalTax = professionalTax !== undefined ? professionalTax : salaryPackage.professionalTax;
      salaryPackage.otherDeductions = otherDeductions !== undefined ? otherDeductions : salaryPackage.otherDeductions;

      const updatedPackage = await salaryPackage.save();
      return res.json(updatedPackage);
    } else {
      // Create new
      const employee = await Employee.findById(req.params.employeeId);
      if (!employee) return res.status(404).json({ message: 'Employee not found' });

      salaryPackage = await SalaryPackage.create({
        employee: req.params.employeeId,
        basic, hra, specialAllowance, medical, conveyance, bonus, pf, esi, professionalTax, otherDeductions
      });
      return res.status(201).json(salaryPackage);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getSalaryPackage, upsertSalaryPackage };
