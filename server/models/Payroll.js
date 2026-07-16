const mongoose = require('mongoose');

const payrollSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true,
  },
  month: {
    type: Number,
    required: true,
  },
  year: {
    type: Number,
    required: true,
  },
  workingDays: {
    type: Number,
    required: true,
  },
  lopDays: {
    type: Number,
    default: 0,
  },
  
  // Stored values (frozen in time)
  grossSalary: { type: Number, required: true },
  netSalary: { type: Number, required: true },
  
  breakdown: {
    earnings: {
      basic: Number,
      hra: Number,
      specialAllowance: Number,
      medical: Number,
      conveyance: Number,
      bonus: Number,
    },
    deductions: {
      lopDeduction: Number,
      pf: Number,
      esi: Number,
      professionalTax: Number,
      otherDeductions: Number,
    }
  },
  
  pdfUrl: { type: String }, // Path to generated PDF
}, { timestamps: true });

const Payroll = mongoose.model('Payroll', payrollSchema);

module.exports = Payroll;
