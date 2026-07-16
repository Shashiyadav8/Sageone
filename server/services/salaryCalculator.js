const constants = require('../config/salaryConstants');

/**
 * Executes the 14-step salary calculation based strictly on Monthly Gross Salary.
 * @param {Number} grossSalary - Monthly Standard Gross Salary
 * @returns {Object} Complete 14-field salary structure
 */
const calculateSalaryStructure = (grossSalary) => {
  if (!grossSalary || isNaN(grossSalary) || grossSalary <= 0) {
    throw new Error('Invalid Monthly Gross Salary. Must be a positive number.');
  }

  // STEP 1: Calculate Basic Salary
  const basicSalary = Math.round(Math.max(grossSalary * constants.BASIC_PERCENTAGE, constants.MIN_BASIC));

  // STEP 2: Calculate Remaining Salary
  const remainingSalary = grossSalary - basicSalary;

  // STEP 3: Calculate HRA
  let hra = Math.round(Math.min(remainingSalary, basicSalary * constants.HRA_PERCENTAGE));
  if (hra < 0) hra = 0;

  // STEP 4: Calculate Other Allowances
  let otherAllowances = Math.round(grossSalary - basicSalary - hra);
  if (otherAllowances < 0) otherAllowances = 0;

  // STEP 5: Calculate PF Wage
  const pfWage = Math.min(basicSalary + otherAllowances, constants.PF_WAGE_LIMIT);

  // STEP 6: Employer PF
  const employerPF = Math.round(pfWage * constants.EMPLOYER_PF_RATE);

  // STEP 7: Employer ESI
  const employerESI = grossSalary <= constants.ESI_LIMIT 
    ? Math.round(grossSalary * constants.EMPLOYER_ESI_RATE) 
    : 0;

  // STEP 8: Monthly CTC
  const monthlyCTC = grossSalary + employerPF + employerESI;

  // STEP 9: Annual CTC
  const annualCTC = monthlyCTC * 12;

  // STEP 10: Employee PF
  const employeePF = Math.round(pfWage * constants.EMPLOYEE_PF_RATE);

  // STEP 11: Employee ESI
  const employeeESI = grossSalary <= constants.ESI_LIMIT 
    ? Math.round(grossSalary * constants.EMPLOYEE_ESI_RATE) 
    : 0;

  // STEP 12: Professional Tax
  let professionalTax = constants.PT_AMOUNT_1;
  if (grossSalary > constants.PT_SLAB_1_MAX && grossSalary <= constants.PT_SLAB_2_MAX) {
    professionalTax = constants.PT_AMOUNT_2;
  } else if (grossSalary > constants.PT_SLAB_2_MAX) {
    professionalTax = constants.PT_AMOUNT_3;
  }

  // STEP 13: Total Employee Deductions
  const totalDeductions = employeePF + employeeESI + professionalTax;

  // STEP 14: Net Salary
  const netSalary = grossSalary - totalDeductions;

  return {
    grossSalary,
    basicSalary,
    hra,
    otherAllowances,
    pfWage,
    employerPF,
    employerESI,
    monthlyCTC,
    annualCTC,
    employeePF,
    employeeESI,
    professionalTax,
    totalDeductions,
    netSalary
  };
};

module.exports = { calculateSalaryStructure };
