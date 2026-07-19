import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FileText, Download } from 'lucide-react';

const Payslips = () => {
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayrolls = async () => {
      try {
        const userStr = localStorage.getItem('user');
        if (!userStr) return;
        
        const employee = JSON.parse(userStr);
        const token = localStorage.getItem('token');
        
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/payroll/employee/${employee._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setPayrolls(res.data);
      } catch (error) {
        console.error('Error fetching payrolls', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPayrolls();
  }, []);

  if (loading) return <div className="p-4">Loading payslips...</div>;

  return (
    <div className="container-fluid py-4 px-3 px-md-5" style={{ backgroundColor: '#f9f9fb', minHeight: '100vh', fontFamily: '"Inter", "Segoe UI", sans-serif' }}>
      
      {/* Header Section */}
      <div className="mb-4 pb-3 border-bottom">
        <h3 className="fw-bold mb-1" style={{ color: '#1e293b', letterSpacing: '-0.5px' }}>My Payslips</h3>
        <p className="text-muted mb-0 small">View and download your monthly salary slips.</p>
      </div>

      <div className="card border-0 shadow-sm rounded-3" style={{ backgroundColor: '#ffffff' }}>
        {payrolls.length === 0 ? (
          <div className="text-center text-muted py-5">
            <FileText size={48} className="mb-3 opacity-25" />
            <p className="mb-0">No payslips have been generated for you yet.</p>
          </div>
        ) : (
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0" style={{ fontSize: '14px' }}>
                <thead style={{ backgroundColor: '#f8fafc' }}>
                  <tr>
                    <th className="py-3 px-3 px-md-4 text-uppercase text-muted fw-semibold border-bottom" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>Period</th>
                    <th className="py-3 px-4 text-uppercase text-muted fw-semibold border-bottom d-none d-md-table-cell" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>Gross Salary</th>
                    <th className="py-3 px-4 text-uppercase text-muted fw-semibold border-bottom d-none d-md-table-cell" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>Deductions</th>
                    <th className="py-3 px-3 px-md-4 text-uppercase text-muted fw-semibold border-bottom" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>Net Pay</th>
                    <th className="py-3 px-4 text-uppercase text-muted fw-semibold border-bottom d-none d-sm-table-cell" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>Status</th>
                    <th className="py-3 px-3 px-md-4 text-uppercase text-muted fw-semibold border-bottom text-end" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {payrolls.map((pay) => (
                    <tr key={pay._id}>
                      <td className="py-3 px-3 px-md-4 fw-medium text-dark">
                        {new Date(pay.year, pay.month - 1).toLocaleString('default', { month: 'short' })} {pay.year}
                      </td>
                      <td className="py-3 px-4 text-muted d-none d-md-table-cell">₹{pay.grossSalary?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                      <td className="py-3 px-4 text-muted text-danger d-none d-md-table-cell">₹{(pay.grossSalary - pay.netSalary)?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                      <td className="py-3 px-3 px-md-4 fw-semibold" style={{ color: '#16a34a' }}>₹{pay.netSalary?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                      <td className="py-3 px-4 d-none d-sm-table-cell">
                        <span className="badge bg-light text-success border d-inline-flex align-items-center px-2 py-1" style={{ fontSize: '12px', fontWeight: '500' }}>
                          Paid
                        </span>
                      </td>
                      <td className="py-3 px-4 text-end">
                        <a 
                          href={pay.pdfUrl?.startsWith('http') ? pay.pdfUrl : `${import.meta.env.VITE_BACKEND_URL}${pay.pdfUrl}?token=${localStorage.getItem('token')}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="btn btn-sm btn-light border text-primary d-inline-flex align-items-center"
                          style={{ borderRadius: '4px' }}
                        >
                          <Download size={14} className="me-2" /> PDF
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Payslips;
