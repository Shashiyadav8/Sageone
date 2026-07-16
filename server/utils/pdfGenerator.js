const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const generatePayslipPDF = async (payroll, employee) => {
  const uploadsDir = path.join(__dirname, '..', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const fileName = `payslip-${employee.employeeId}-${payroll.month}-${payroll.year}.pdf`;
  const filePath = path.join(uploadsDir, fileName);

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Payslip</title>
      <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; margin: 40px; }
        .header { text-align: center; border-bottom: 2px solid #2563EB; padding-bottom: 20px; margin-bottom: 20px; }
        .logo { font-size: 28px; font-weight: bold; color: #0F172A; }
        .logo span { color: #2563EB; }
        .title { font-size: 18px; color: #64748B; margin-top: 5px; }
        .details-table { width: 100%; margin-bottom: 30px; border-collapse: collapse; }
        .details-table td { padding: 8px; border: 1px solid #E2E8F0; }
        .details-table td:nth-child(odd) { font-weight: bold; background-color: #F8FAFC; width: 25%; }
        .details-table td:nth-child(even) { width: 25%; }
        
        .salary-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        .salary-table th { background-color: #2563EB; color: white; padding: 10px; text-align: left; }
        .salary-table td { padding: 10px; border: 1px solid #E2E8F0; }
        
        .net-pay { font-size: 20px; font-weight: bold; text-align: right; margin-top: 20px; color: #2563EB; }
        .footer { text-align: center; margin-top: 50px; font-size: 12px; color: #94A3B8; border-top: 1px solid #E2E8F0; padding-top: 20px;}
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">Sage<span>One</span></div>
        <div class="title">Payslip for ${payroll.month}/${payroll.year}</div>
      </div>
      
      <table class="details-table">
        <tr>
          <td>Employee Name</td><td>${employee.firstName} ${employee.lastName}</td>
          <td>Employee ID</td><td>${employee.employeeId}</td>
        </tr>
        <tr>
          <td>Department</td><td>${employee.department || 'N/A'}</td>
          <td>Designation</td><td>${employee.designation || 'N/A'}</td>
        </tr>
        <tr>
          <td>Bank Name</td><td>${employee.banking?.bankName || 'N/A'}</td>
          <td>Account Number</td><td>${employee.banking?.accountNumber || 'N/A'}</td>
        </tr>
        <tr>
          <td>Working Days</td><td>${payroll.workingDays}</td>
          <td>LOP Days</td><td>${payroll.lopDays}</td>
        </tr>
      </table>

      <table class="salary-table">
        <tr>
          <th>Earnings</th>
          <th>Amount (₹)</th>
          <th>Deductions</th>
          <th>Amount (₹)</th>
        </tr>
        <tr>
          <td>Basic</td><td>${payroll.breakdown.earnings.basic.toFixed(2)}</td>
          <td>PF</td><td>${payroll.breakdown.deductions.pf.toFixed(2)}</td>
        </tr>
        <tr>
          <td>HRA</td><td>${payroll.breakdown.earnings.hra.toFixed(2)}</td>
          <td>ESI</td><td>${payroll.breakdown.deductions.esi.toFixed(2)}</td>
        </tr>
        <tr>
          <td>Special Allowance</td><td>${payroll.breakdown.earnings.specialAllowance.toFixed(2)}</td>
          <td>Professional Tax</td><td>${payroll.breakdown.deductions.professionalTax.toFixed(2)}</td>
        </tr>
        <tr>
          <td>Medical</td><td>${payroll.breakdown.earnings.medical.toFixed(2)}</td>
          <td>LOP Deduction</td><td>${payroll.breakdown.deductions.lopDeduction.toFixed(2)}</td>
        </tr>
        <tr>
          <td>Conveyance</td><td>${payroll.breakdown.earnings.conveyance.toFixed(2)}</td>
          <td>Other Deductions</td><td>${payroll.breakdown.deductions.otherDeductions.toFixed(2)}</td>
        </tr>
        <tr>
          <td>Bonus</td><td>${payroll.breakdown.earnings.bonus.toFixed(2)}</td>
          <td></td><td></td>
        </tr>
        <tr style="font-weight:bold; background-color: #F8FAFC;">
          <td>Gross Earnings</td><td>${payroll.grossSalary.toFixed(2)}</td>
          <td>Total Deductions</td><td>${(payroll.grossSalary - payroll.netSalary).toFixed(2)}</td>
        </tr>
      </table>

      <div class="net-pay">Net Salary Payable: ₹ ${payroll.netSalary.toFixed(2)}</div>
      
      <div class="footer">
        <p>This is a computer-generated document. No signature is required.</p>
        <p>Generated on ${new Date().toLocaleDateString()}</p>
      </div>
    </body>
    </html>
  `;

  try {
    const browser = await puppeteer.launch({ 
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setContent(htmlContent);
    await page.pdf({ path: filePath, format: 'A4', printBackground: true });
    await browser.close();
    
    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: 'raw',
      folder: 'sageone/payslips',
      public_id: `payslip-${employee.employeeId}-${payroll.month}-${payroll.year}`
    });

    // Optionally delete the local file after upload
    fs.unlinkSync(filePath);

    return result.secure_url;
  } catch (error) {
    console.error('PDF Generation/Upload Error:', error);
    throw error;
  }
};

module.exports = { generatePayslipPDF };
