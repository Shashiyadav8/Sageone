const mongoose = require('mongoose');

const salaryPackageSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true,
  },
  grossSalary: { type: Number, required: true },
  basicSalary: { type: Number, required: true },
  hra: { type: Number, required: true },
  otherAllowances: { type: Number, default: 0 },
  pfWage: { type: Number, default: 0 },
  employerPF: { type: Number, default: 0 },
  employerESI: { type: Number, default: 0 },
  monthlyCTC: { type: Number, default: 0 },
  annualCTC: { type: Number, default: 0 },
  employeePF: { type: Number, default: 0 },
  employeeESI: { type: Number, default: 0 },
  professionalTax: { type: Number, default: 0 },
  totalDeductions: { type: Number, default: 0 },
  netSalary: { type: Number, default: 0 },
}, { timestamps: true });

const SalaryPackage = mongoose.model('SalaryPackage', salaryPackageSchema);

module.exports = SalaryPackage;
