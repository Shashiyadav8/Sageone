const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const numberToWords = (num) => {
  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  if ((num = num.toString()).length > 9) return 'overflow';
  let n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
  if (!n) return; let str = '';
  str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'Crore ' : '';
  str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'Lakh ' : '';
  str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'Thousand ' : '';
  str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'Hundred ' : '';
  str += (n[5] != 0) ? ((str != '') ? 'And ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) : '';
  return str.trim();
};

const generatePayslipPDF = async (payroll, employee) => {
  const uploadsDir = path.join(__dirname, '..', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const fileName = `payslip-${employee.employeeId}-${payroll.month}-${payroll.year}.pdf`;
  const filePath = path.join(uploadsDir, fileName);

  const logoPath = path.join(__dirname, '..', '..', 'client', 'src', 'assets', 'sagepath_navbar.png');
  let logoHtml = `<div class="logo">Sage<span>Path</span></div>`;
  if (fs.existsSync(logoPath)) {
    const bitmap = fs.readFileSync(logoPath);
    const logoBase64 = `data:image/png;base64,${bitmap.toString('base64')}`;
    logoHtml = `<img src="${logoBase64}" style="max-height: 55px; max-width: 200px; margin-left: 20px; object-fit: contain;" />`;
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Payslip</title>
      <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; margin: 30px; font-size: 11px; }
        .header-table { width: 100%; margin-bottom: 10px; }
        .logo-td { width: 30%; }
        .logo { font-size: 28px; font-weight: bold; color: #0F172A; margin-left: 20px; }
        .logo span { color: #2563EB; }
        .address-td { width: 40%; text-align: center; }
        .company-name { font-size: 16px; font-weight: bold; margin-bottom: 5px; }
        .company-address { font-size: 10px; color: #555; }
        .title-td { width: 30%; text-align: center; }
        .title-text { font-size: 12px; color: #333; }
        .title-month { font-size: 14px; font-weight: bold; margin-top: 5px; }

        .main-table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
        .main-table td, .main-table th { border: 1px solid #666; padding: 4px 6px; }
        .col-label { font-weight: bold; width: 15%; }
        .col-value { width: 35%; }
        
        .salary-header th { background-color: #fff; text-align: center; font-weight: bold; }
        .amount-col { text-align: right; width: 15%; }
        .desc-col { width: 35%; }
        
        .net-pay-row { font-weight: bold; }
      </style>
    </head>
    <body>
      <div style="text-align: left; font-size: 10px; margin-bottom: 5px;">${new Date().toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' })} <span style="float: right;">Payslip</span></div>
      
      <table class="header-table">
        <tr>
          <td class="logo-td">
            ${logoHtml}
          </td>
          <td class="address-td">
            <div class="company-name">SagePath Labs Pvt Ltd</div>
            <div class="company-address">
              Address: first floor, Plot No.564, Budha Nagar,<br/>
              Buddha Nagar Colony, Mallikarjuna Nagar,<br/>
              Boduppal, Hyderabad, Telangana 500092
            </div>
          </td>
          <td class="title-td">
            <div class="title-text">Payslip for the month</div>
            <div class="title-month">${payroll.month} ${payroll.year}</div>
          </td>
        </tr>
      </table>
      
      <table class="main-table">
        <tr>
          <td class="col-label">Employee No</td>
          <td class="col-value">${employee.employeeId}</td>
          <td class="col-label">Name</td>
          <td class="col-value">${employee.employeeName}</td>
          <td class="col-label">Location</td>
          <td class="col-value">${employee.location || ''}</td>
        </tr>
        <tr>
          <td class="col-label">Designation</td>
          <td class="col-value">${employee.designation || ''}</td>
          <td class="col-label">ESIC No</td>
          <td class="col-value">${employee.esicNo || ''}</td>
          <td class="col-label">Payable Days</td>
          <td class="col-value">${payroll.workingDays}</td>
        </tr>
        <tr>
          <td class="col-label">UAN No</td>
          <td class="col-value">${employee.uanNo || ''}</td>
          <td class="col-label">Status</td>
          <td class="col-value">${employee.status || 'Active'}</td>
          <td class="col-label">Month Days</td>
          <td class="col-value">${payroll.workingDays + payroll.lopDays}</td>
        </tr>
      </table>

      <table class="main-table">
        <tr class="salary-header">
          <th colspan="2">Earnings</th>
          <th colspan="2">Deductions</th>
        </tr>
        <tr class="salary-header">
          <th>Particulars</th>
          <th>Amount</th>
          <th>Particulars</th>
          <th>Amount</th>
        </tr>
        <tr>
          <td class="desc-col">Basic</td>
          <td class="amount-col">${(payroll.breakdown?.earnings?.basic || 0).toFixed(2)}</td>
          <td class="desc-col">Provident Fund (Employee)</td>
          <td class="amount-col">${(payroll.breakdown?.deductions?.employeePF || 0).toFixed(2)}</td>
        </tr>
        <tr>
          <td class="desc-col">House Rent Allowance</td>
          <td class="amount-col">${(payroll.breakdown?.earnings?.hra || 0).toFixed(2)}</td>
          <td class="desc-col">ESI Employee</td>
          <td class="amount-col">${(payroll.breakdown?.deductions?.employeeESI || 0).toFixed(2)}</td>
        </tr>
        <tr>
          <td class="desc-col">Other Allowances</td>
          <td class="amount-col">${(payroll.breakdown?.earnings?.otherAllowances || 0).toFixed(2)}</td>
          <td class="desc-col">Professional Tax</td>
          <td class="amount-col">${(payroll.breakdown?.deductions?.professionalTax || 0).toFixed(2)}</td>
        </tr>
        <tr>
          <td class="desc-col"></td>
          <td class="amount-col"></td>
          <td class="desc-col">LOP Deduction</td>
          <td class="amount-col">${(payroll.breakdown?.deductions?.lopDeduction || 0).toFixed(2)}</td>
        </tr>
        <tr>
          <td class="desc-col"></td>
          <td class="amount-col"></td>
          <td class="desc-col">Provident Fund (Employer)</td>
          <td class="amount-col">${(payroll.breakdown?.deductions?.employerPF || 0).toFixed(2)}</td>
        </tr>
        <tr>
          <td class="desc-col"></td>
          <td class="amount-col"></td>
          <td class="desc-col">ESI Employer</td>
          <td class="amount-col">${(payroll.breakdown?.deductions?.employerESI || 0).toFixed(2)}</td>
        </tr>
        <tr style="font-weight: bold;">
          <td>Total Earnings</td>
          <td class="amount-col">${payroll.grossSalary.toFixed(2)}</td>
          <td>Total Deductions</td>
          <td class="amount-col">${(payroll.grossSalary - payroll.netSalary).toFixed(2)}</td>
        </tr>
      </table>

      <table class="main-table">
        <tr>
          <td class="net-pay-row">
            Net Pay : Rs.${payroll.netSalary.toFixed(2)}/- (${numberToWords(Math.round(payroll.netSalary))})
          </td>
        </tr>
      </table>
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
