const Payroll = require('../models/Payroll');
const SalaryPackage = require('../models/SalaryPackage');
const Employee = require('../models/Employee');
const { generatePayslipPDF } = require('../utils/pdfGenerator');

// @desc    Generate payroll for an employee
// @route   POST /api/payroll/generate/:employeeId
// @access  Private/Admin
const generatePayroll = async (req, res) => {
  try {
    const { month, year, workingDays, lopDays } = req.body;
    const employeeId = req.params.employeeId;

    const employee = await Employee.findById(employeeId);
    if (!employee) return res.status(404).json({ message: 'Employee not found' });

    const salaryPackage = await SalaryPackage.findOne({ employee: employeeId });
    if (!salaryPackage) return res.status(404).json({ message: 'Salary package not configured' });

    // Check if payroll already exists
    const existingPayroll = await Payroll.findOne({ employee: employeeId, month, year });
    if (existingPayroll) {
      return res.status(400).json({ message: `Payroll for ${month}/${year} already generated` });
    }

    // Calculate Earnings
    const grossEarnings = salaryPackage.basic + salaryPackage.hra + salaryPackage.specialAllowance + 
                          salaryPackage.medical + salaryPackage.conveyance + salaryPackage.bonus;

    // Calculate LOP Deduction
    const perDaySalary = grossEarnings / workingDays;
    const lopDeduction = perDaySalary * (lopDays || 0);

    // Calculate other Deductions
    const fixedDeductions = salaryPackage.pf + salaryPackage.esi + salaryPackage.professionalTax + salaryPackage.otherDeductions;
    const totalDeductions = lopDeduction + fixedDeductions;

    // Calculate Net
    const netSalary = grossEarnings - totalDeductions;

    const payroll = new Payroll({
      employee: employeeId,
      month,
      year,
      workingDays,
      lopDays: lopDays || 0,
      grossSalary: grossEarnings,
      netSalary,
      breakdown: {
        earnings: {
          basic: salaryPackage.basic,
          hra: salaryPackage.hra,
          specialAllowance: salaryPackage.specialAllowance,
          medical: salaryPackage.medical,
          conveyance: salaryPackage.conveyance,
          bonus: salaryPackage.bonus,
        },
        deductions: {
          lopDeduction,
          pf: salaryPackage.pf,
          esi: salaryPackage.esi,
          professionalTax: salaryPackage.professionalTax,
          otherDeductions: salaryPackage.otherDeductions,
        }
      }
    });

    // Generate PDF
    const pdfUrl = await generatePayslipPDF(payroll, employee);
    payroll.pdfUrl = pdfUrl;

    await payroll.save();
    res.status(201).json(payroll);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all payrolls
// @route   GET /api/payroll
// @access  Private/Admin
const getPayrolls = async (req, res) => {
  try {
    const payrolls = await Payroll.find({}).populate('employee', 'firstName lastName employeeId');
    res.json(payrolls);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get payrolls for specific employee
// @route   GET /api/payroll/employee/:employeeId
// @access  Private
const getEmployeePayrolls = async (req, res) => {
  try {
    // Only allow employee to view their own, or admin to view any
    if (req.userType === 'employee' && req.user._id.toString() !== req.params.employeeId) {
      return res.status(403).json({ message: 'Not authorized to view these records' });
    }

    const payrolls = await Payroll.find({ employee: req.params.employeeId }).sort({ year: -1, month: -1 });
    res.json(payrolls);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Generate payroll for multiple employees at once (Bulk Wizard)
// @route   POST /api/payroll/generate-all
// @access  Private/Admin
const generateBulkPayroll = async (req, res) => {
  try {
    const { month, year, workingDays, employeeData } = req.body;
    // employeeData is expected to be an array of objects: { employeeId, lopDays }

    if (!employeeData || !Array.isArray(employeeData) || employeeData.length === 0) {
      return res.status(400).json({ message: 'No employee data provided for bulk generation' });
    }

    const generatedPayrolls = [];
    const skippedPayrolls = [];

    // Process sequentially to ensure PDF generation works without overloading memory/puppeteer
    for (const data of employeeData) {
      const { employeeId, lopDays } = data;
      
      try {
        const employee = await Employee.findById(employeeId);
        if (!employee) {
          skippedPayrolls.push({ employeeId, reason: 'Employee not found' });
          continue;
        }

        const salaryPackage = await SalaryPackage.findOne({ employee: employeeId });
        if (!salaryPackage) {
          skippedPayrolls.push({ name: `${employee.firstName} ${employee.lastName}`, reason: 'Salary package not configured' });
          continue;
        }

        const existingPayroll = await Payroll.findOne({ employee: employeeId, month, year });
        if (existingPayroll) {
          skippedPayrolls.push({ name: `${employee.firstName} ${employee.lastName}`, reason: 'Already generated' });
          continue;
        }

        // Calculate Earnings
        const grossEarnings = salaryPackage.basic + salaryPackage.hra + salaryPackage.specialAllowance + 
                              salaryPackage.medical + salaryPackage.conveyance + salaryPackage.bonus;

        // Calculate LOP Deduction
        const perDaySalary = grossEarnings / workingDays;
        const lopDeduction = perDaySalary * (lopDays || 0);

        // Calculate other Deductions
        const fixedDeductions = salaryPackage.pf + salaryPackage.esi + salaryPackage.professionalTax + salaryPackage.otherDeductions;
        const totalDeductions = lopDeduction + fixedDeductions;

        // Calculate Net
        const netSalary = grossEarnings - totalDeductions;

        const payroll = new Payroll({
          employee: employeeId,
          month,
          year,
          workingDays,
          lopDays: lopDays || 0,
          grossSalary: grossEarnings,
          netSalary,
          breakdown: {
            earnings: {
              basic: salaryPackage.basic,
              hra: salaryPackage.hra,
              specialAllowance: salaryPackage.specialAllowance,
              medical: salaryPackage.medical,
              conveyance: salaryPackage.conveyance,
              bonus: salaryPackage.bonus,
            },
            deductions: {
              lopDeduction,
              pf: salaryPackage.pf,
              esi: salaryPackage.esi,
              professionalTax: salaryPackage.professionalTax,
              otherDeductions: salaryPackage.otherDeductions,
            }
          }
        });

        const pdfUrl = await generatePayslipPDF(payroll, employee);
        payroll.pdfUrl = pdfUrl;

        await payroll.save();
        generatedPayrolls.push(payroll);
      } catch (err) {
        skippedPayrolls.push({ employeeId, reason: err.message });
      }
    }

    res.status(201).json({
      message: `Successfully generated ${generatedPayrolls.length} payrolls. Skipped ${skippedPayrolls.length}.`,
      generatedCount: generatedPayrolls.length,
      skippedCount: skippedPayrolls.length,
      skippedDetails: skippedPayrolls
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { generatePayroll, generateBulkPayroll, getPayrolls, getEmployeePayrolls };
