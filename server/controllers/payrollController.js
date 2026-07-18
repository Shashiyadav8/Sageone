const Payroll = require('../models/Payroll');
const SalaryPackage = require('../models/SalaryPackage');
const Employee = require('../models/Employee');
const { generatePayslipPDF } = require('../utils/pdfGenerator');
const puppeteer = require('puppeteer');

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
global.bulkJobs = global.bulkJobs || {};

// Background worker for bulk payroll to prevent HTTP timeouts and memory crashes
const processBulkPayrollInBackground = async (jobId, month, year, workingDays, employeeData) => {
  const CHUNK_SIZE = 5; // Reduced to 5 to prevent Node.js and Chromium memory bloat on 512MB instances
  let generatedCount = 0;
  let skippedDetails = [];

  for (let i = 0; i < employeeData.length; i += CHUNK_SIZE) {
    const chunk = employeeData.slice(i, i + CHUNK_SIZE);
    let browser = null;

    try {
      // Launch a new browser instance per chunk to free up memory heavily
      browser = await puppeteer.launch({
        headless: 'new',
        args: [
          '--no-sandbox', 
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--no-zygote'
        ]
      });

      for (const data of chunk) {
        const { employeeId, lopDays } = data;

        try {
          const employee = await Employee.findById(employeeId);
          if (!employee) continue;

          const salaryPackage = await SalaryPackage.findOne({ employee: employeeId });
          if (!salaryPackage || salaryPackage.grossSalary === undefined) continue;

          const existingPayroll = await Payroll.findOne({ employee: employeeId, month, year });
          if (existingPayroll) continue;

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

          const pdfUrl = await generatePayslipPDF(payroll, employee, browser);
          payroll.pdfUrl = pdfUrl;

          await payroll.save();
          generatedCount++;
          
          if (global.bulkJobs[jobId]) {
            global.bulkJobs[jobId].processed += 1;
          }
        } catch (err) {
          console.error(`Error generating PDF for ${employeeId}:`, err);
          skippedDetails.push({ employeeId, reason: err.message });
          if (global.bulkJobs[jobId]) {
            global.bulkJobs[jobId].processed += 1;
            global.bulkJobs[jobId].errors.push({ employeeId, reason: err.message });
          }
        }
      }
    } catch (chunkError) {
      console.error(`Error processing chunk at index ${i}:`, chunkError);
    } finally {
      if (browser) {
        await browser.close();
      }
      // Force a tiny pause to allow Node.js Garbage Collector to clear PDF buffers before next chunk
      await new Promise(resolve => setTimeout(resolve, 1500));
    }
  }
  
  if (global.bulkJobs[jobId]) {
    global.bulkJobs[jobId].status = 'completed';
    global.bulkJobs[jobId].generatedCount = generatedCount;
  }
  console.log(`Background bulk payroll finished for job ${jobId}. Successfully generated ${generatedCount} payrolls.`);
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

    const jobId = Date.now().toString();
    global.bulkJobs[jobId] = {
      status: 'processing',
      total: employeeData.length,
      processed: 0,
      errors: []
    };

    // Fire and forget the background job
    processBulkPayrollInBackground(jobId, month, year, workingDays, employeeData).catch(console.error);

    // Immediately respond to the client so Render doesn't timeout (100s limit)
    res.status(202).json({
      message: 'Bulk payroll processing has started in the background.',
      jobId,
      totalEmployees: employeeData.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get bulk payroll job status
// @route   GET /api/payroll/bulk-status/:jobId
// @access  Private/Admin
const getBulkPayrollStatus = async (req, res) => {
  try {
    const { jobId } = req.params;
    const job = global.bulkJobs[jobId];
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found or expired.' });
    }
    
    res.json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { generatePayroll, generateBulkPayroll, getPayrolls, getEmployeePayrolls, getBulkPayrollStatus };
