const Payroll = require('../models/Payroll');
const SalaryPackage = require('../models/SalaryPackage');
const Employee = require('../models/Employee');
// PDF generation logic has been moved to on-the-fly streaming

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
    const grossEarnings = salaryPackage.grossSalary;
    
    if (grossEarnings === undefined) {
      return res.status(400).json({ message: `Salary structure is missing or legacy for employee. Please update their Monthly Gross Salary first.` });
    }

    // Calculate LOP Deduction
    const perDaySalary = grossEarnings / workingDays;
    const lopDeduction = Math.round(perDaySalary * (lopDays || 0));

    // Calculate other Deductions
    const fixedDeductions = salaryPackage.employeePF + salaryPackage.employeeESI + salaryPackage.professionalTax;
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
          basic: salaryPackage.basicSalary,
          hra: salaryPackage.hra,
          otherAllowances: salaryPackage.otherAllowances,
        },
        deductions: {
          lopDeduction,
          employerPF: salaryPackage.employerPF,
          employerESI: salaryPackage.employerESI,
          employeePF: salaryPackage.employeePF,
          employeeESI: salaryPackage.employeeESI,
          professionalTax: salaryPackage.professionalTax,
        }
      }
    });

    // Set dynamic URL for on-the-fly PDF generation
    payroll.pdfUrl = `/api/payroll/download/${payroll._id}`;

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
    const payrolls = await Payroll.find({}).populate('employee', 'employeeName employeeId designation');
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

// Initialize a global memory store to track background jobs
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

    let generatedCount = 0;
    let skippedCount = 0;

    for (const data of employeeData) {
      const { employeeId, lopDays } = data;

      try {
        const employee = await Employee.findById(employeeId).lean();
        if (!employee) { skippedCount++; continue; }

        const salaryPackage = await SalaryPackage.findOne({ employee: employeeId }).lean();
        if (!salaryPackage || salaryPackage.grossSalary === undefined) { skippedCount++; continue; }

        const existingPayroll = await Payroll.findOne({ employee: employeeId, month, year }).lean();
        if (existingPayroll) { skippedCount++; continue; }

        const grossEarnings = salaryPackage.grossSalary;
        const perDaySalary = grossEarnings / workingDays;
        const lopDeduction = Math.round(perDaySalary * (lopDays || 0));

        const fixedDeductions = salaryPackage.employeePF + salaryPackage.employeeESI + salaryPackage.professionalTax;
        const totalDeductions = lopDeduction + fixedDeductions;
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
              basic: salaryPackage.basicSalary,
              hra: salaryPackage.hra,
              otherAllowances: salaryPackage.otherAllowances,
            },
            deductions: {
              lopDeduction,
              employerPF: salaryPackage.employerPF,
              employerESI: salaryPackage.employerESI,
              employeePF: salaryPackage.employeePF,
              employeeESI: salaryPackage.employeeESI,
              professionalTax: salaryPackage.professionalTax,
            }
          }
        });

        // Set dynamic URL for on-the-fly PDF generation
        payroll.pdfUrl = `/api/payroll/download/${payroll._id}`;

        await payroll.save();
        generatedCount++;
      } catch (err) {
        console.error(`Error processing employee ${employeeId}:`, err);
        skippedCount++;
      }
    }

    res.status(201).json({
      message: `Successfully generated ${generatedCount} payrolls. Skipped ${skippedCount}.`,
      generatedCount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Download PDF for a payroll record
// @route   GET /api/payroll/download/:id
// @access  Private
const downloadPayslipPDF = async (req, res) => {
  try {
    const payroll = await Payroll.findById(req.params.id);
    if (!payroll) {
      return res.status(404).json({ message: 'Payroll not found' });
    }

    const employee = await Employee.findById(payroll.employee);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // This will generate the PDF in ~50ms and pipe it straight to the browser
    const { streamPayslipPDF } = require('../utils/pdfGenerator');
    await streamPayslipPDF(payroll, employee, res);
  } catch (error) {
    console.error('Download Error:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { generatePayroll, generateBulkPayroll, getPayrolls, getEmployeePayrolls, downloadPayslipPDF };
