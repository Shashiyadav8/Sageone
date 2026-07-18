
const fs = require('fs');
const path = require('path');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const fonts = {
  Helvetica: {
    normal: 'Helvetica',
    bold: 'Helvetica-Bold',
    italics: 'Helvetica-Oblique',
    bolditalics: 'Helvetica-BoldOblique'
  }
};
const pdfmake = require('pdfmake');
pdfmake.setFonts(fonts);

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

const streamPayslipPDF = async (payroll, employee, res) => {
  const logoPath = path.join(__dirname, '..', '..', 'client', 'src', 'assets', 'sagepath_navbar.png');
  let logoImage = null;
  if (fs.existsSync(logoPath)) {
    const bitmap = fs.readFileSync(logoPath);
    logoImage = `data:image/png;base64,${bitmap.toString('base64')}`;
  }

  const docDefinition = {
    defaultStyle: { font: 'Helvetica', fontSize: 10, color: '#333' },
    content: [
      {
        columns: [
          { text: `${new Date().toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' })}`, fontSize: 9 },
          { text: 'Payslip', alignment: 'right', fontSize: 9 }
        ],
        margin: [0, 0, 0, 10]
      },
      {
        columns: [
          logoImage ? { image: logoImage, width: 120 } : { text: 'SagePath Labs', fontSize: 16, bold: true, color: '#0F172A' },
          {
            stack: [
              { text: 'SagePath Labs Pvt Ltd', bold: true, fontSize: 14, color: '#000', margin: [0, 0, 0, 4] },
              { text: 'Address: first floor, Plot No.564, Budha Nagar,\nBuddha Nagar Colony, Mallikarjuna Nagar,\nBoduppal, Hyderabad, Telangana 500092', fontSize: 8, color: '#555' }
            ],
            alignment: 'center'
          },
          {
            text: [
              { text: 'Payslip for the month\n', fontSize: 10 },
              { text: `${payroll.month} ${payroll.year}`, bold: true, fontSize: 12, color: '#000' }
            ],
            alignment: 'center'
          }
        ],
        margin: [0, 0, 0, 15]
      },
      // Employee Details Table
      {
        table: {
          widths: ['15%', '35%', '15%', '35%'],
          body: [
            [ {text: 'Employee No', bold: true}, employee.employeeId, {text: 'Name', bold: true}, employee.employeeName ],
            [ {text: 'Location', bold: true}, employee.location || '', {text: 'Designation', bold: true}, employee.designation || '' ],
            [ {text: 'ESIC No', bold: true}, employee.esicNo || '', {text: 'Payable Days', bold: true}, payroll.workingDays.toString() ],
            [ {text: 'UAN No', bold: true}, employee.uanNo || '', {text: 'Status', bold: true}, employee.status || 'Active' ],
            [ {text: 'Month Days', bold: true}, (payroll.workingDays + payroll.lopDays).toString(), '', '' ]
          ]
        },
        layout: {
          hLineWidth: () => 1, vLineWidth: () => 1,
          hLineColor: () => '#666', vLineColor: () => '#666',
          paddingLeft: () => 6, paddingRight: () => 6, paddingTop: () => 4, paddingBottom: () => 4
        },
        margin: [0, 0, 0, 15]
      },
      // Salary Breakdown Table
      {
        table: {
          widths: ['35%', '15%', '35%', '15%'],
          body: [
            [
              { text: 'Earnings', colSpan: 2, alignment: 'center', bold: true }, {},
              { text: 'Deductions', colSpan: 2, alignment: 'center', bold: true }, {}
            ],
            [
              { text: 'Particulars', alignment: 'center', bold: true },
              { text: 'Amount', alignment: 'center', bold: true },
              { text: 'Particulars', alignment: 'center', bold: true },
              { text: 'Amount', alignment: 'center', bold: true }
            ],
            [ 'Basic', { text: (payroll.breakdown?.earnings?.basic || 0).toFixed(2), alignment: 'right' }, 'Provident Fund (Employee)', { text: (payroll.breakdown?.deductions?.employeePF || 0).toFixed(2), alignment: 'right' } ],
            [ 'House Rent Allowance', { text: (payroll.breakdown?.earnings?.hra || 0).toFixed(2), alignment: 'right' }, 'ESI Employee', { text: (payroll.breakdown?.deductions?.employeeESI || 0).toFixed(2), alignment: 'right' } ],
            [ 'Other Allowances', { text: (payroll.breakdown?.earnings?.otherAllowances || 0).toFixed(2), alignment: 'right' }, 'Professional Tax', { text: (payroll.breakdown?.deductions?.professionalTax || 0).toFixed(2), alignment: 'right' } ],
            [ '', '', 'LOP Deduction', { text: (payroll.breakdown?.deductions?.lopDeduction || 0).toFixed(2), alignment: 'right' } ],
            [ '', '', 'Provident Fund (Employer)', { text: (payroll.breakdown?.deductions?.employerPF || 0).toFixed(2), alignment: 'right' } ],
            [ '', '', 'ESI Employer', { text: (payroll.breakdown?.deductions?.employerESI || 0).toFixed(2), alignment: 'right' } ],
            [ 
              { text: 'Total Earnings', bold: true }, 
              { text: payroll.grossSalary.toFixed(2), alignment: 'right', bold: true }, 
              { text: 'Total Deductions', bold: true }, 
              { text: (payroll.grossSalary - payroll.netSalary).toFixed(2), alignment: 'right', bold: true } 
            ]
          ]
        },
        layout: {
          hLineWidth: () => 1, vLineWidth: () => 1,
          hLineColor: () => '#666', vLineColor: () => '#666',
          paddingLeft: () => 6, paddingRight: () => 6, paddingTop: () => 4, paddingBottom: () => 4
        },
        margin: [0, 0, 0, 15]
      },
      // Net Pay Row
      {
        table: {
          widths: ['100%'],
          body: [
            [ { text: `Net Pay : Rs.${payroll.netSalary.toFixed(2)}/- (${numberToWords(Math.round(payroll.netSalary))})`, bold: true, margin: [0, 5, 0, 5] } ]
          ]
        },
        layout: {
          hLineWidth: () => 1, vLineWidth: () => 1,
          hLineColor: () => '#666', vLineColor: () => '#666',
          paddingLeft: () => 6, paddingRight: () => 6
        }
      }
    ]
  };

  try {
    const pdfDoc = pdfmake.createPdf(docDefinition);
    
    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=payslip-${employee.employeeId}-${payroll.month}-${payroll.year}.pdf`);
    
    // Pipe to the Express response stream
    const stream = pdfDoc.getStream();
    stream.pipe(res);
    stream.end();
  } catch (error) {
    console.error('PDF Generation Error:', error);
    if (!res.headersSent) {
      res.status(500).send('Error generating PDF');
    }
  }
};

module.exports = { streamPayslipPDF };
