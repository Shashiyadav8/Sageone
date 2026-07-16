const mongoose = require('mongoose');

const salaryPackageSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true,
  },
  basic: { type: Number, required: true },
  hra: { type: Number, required: true },
  specialAllowance: { type: Number, default: 0 },
  medical: { type: Number, default: 0 },
  conveyance: { type: Number, default: 0 },
  bonus: { type: Number, default: 0 },
  
  // Deductions
  pf: { type: Number, default: 0 },
  esi: { type: Number, default: 0 },
  professionalTax: { type: Number, default: 0 },
  otherDeductions: { type: Number, default: 0 },
}, { timestamps: true });

const SalaryPackage = mongoose.model('SalaryPackage', salaryPackageSchema);

module.exports = SalaryPackage;
