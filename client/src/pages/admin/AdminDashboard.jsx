import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Users, FileText, CheckCircle, Clock } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ totalEmployees: 0, recentPayrolls: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${token}` } };
        
        // Fetch employees for total count
        const empRes = await axios.get(`${import.meta.env.VITE_API_URL}/employees`, config);
        // Fetch payrolls for recent list
        const payRes = await axios.get(`${import.meta.env.VITE_API_URL}/payroll`, config);
        
        setStats({
          totalEmployees: empRes.data.length,
          recentPayrolls: payRes.data.slice(0, 5) // Get latest 5
        });
      } catch (error) {
        console.error('Error fetching dashboard data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return <div className="p-4">Loading dashboard...</div>;

  return (
    <div className="container-fluid py-4 px-4 px-md-5">
      <div className="mb-4 pb-3 border-bottom">
        <h3 className="fw-bold mb-1" style={{ color: '#1e293b', letterSpacing: '-0.5px' }}>Dashboard</h3>
        <p className="text-muted mb-0 small">Overview of company personnel and payroll activity.</p>
      </div>
      
      <div className="row g-4 mb-5">
        <div className="col-md-4">
          <div className="card border-0 shadow-sm rounded-3 h-100" style={{ backgroundColor: '#ffffff' }}>
            <div className="card-body p-4 d-flex align-items-center">
              <div className="bg-light p-3 rounded-circle me-4">
                <Users size={24} style={{ color: '#0f62fe' }} />
              </div>
              <div>
                <p className="text-muted mb-1 fw-semibold" style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Employees</p>
                <h2 className="mb-0 fw-bold" style={{ color: '#1e293b' }}>{stats.totalEmployees}</h2>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-sm rounded-3 h-100" style={{ backgroundColor: '#ffffff' }}>
            <div className="card-body p-4 d-flex align-items-center">
              <div className="bg-light p-3 rounded-circle me-4">
                <FileText size={24} style={{ color: '#16a34a' }} />
              </div>
              <div>
                <p className="text-muted mb-1 fw-semibold" style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Payrolls Generated</p>
                <h2 className="mb-0 fw-bold" style={{ color: '#1e293b' }}>{stats.recentPayrolls.length}</h2>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm rounded-3 mb-4" style={{ backgroundColor: '#ffffff' }}>
        <div className="card-header bg-white border-bottom py-3 px-4">
          <h6 className="mb-0 fw-semibold d-flex align-items-center" style={{ color: '#334155' }}>
            <Clock className="me-2 text-muted" size={18} />
            Recent Payrolls
          </h6>
        </div>
        
        <div className="card-body p-0">
          {stats.recentPayrolls.length === 0 ? (
            <div className="p-5 text-center text-muted">No payroll records found.</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0" style={{ fontSize: '14px' }}>
                <thead style={{ backgroundColor: '#f8fafc' }}>
                  <tr>
                    <th className="py-3 px-4 text-uppercase text-muted fw-semibold border-bottom" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>Employee</th>
                    <th className="py-3 px-4 text-uppercase text-muted fw-semibold border-bottom" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>Period</th>
                    <th className="py-3 px-4 text-uppercase text-muted fw-semibold border-bottom" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>Gross Salary</th>
                    <th className="py-3 px-4 text-uppercase text-muted fw-semibold border-bottom" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>Net Pay</th>
                    <th className="py-3 px-4 text-uppercase text-muted fw-semibold border-bottom" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentPayrolls.map((payroll) => (
                    <tr key={payroll._id}>
                      <td className="py-3 px-4">
                        <div className="fw-medium text-dark">{payroll.employee?.employeeName || 'Unknown Employee'}</div>
                        <div className="text-muted" style={{ fontSize: '12px' }}>{payroll.employee?.employeeId}</div>
                      </td>
                      <td className="py-3 px-4 text-muted">{new Date(payroll.year, payroll.month - 1).toLocaleString('default', { month: 'short' })} {payroll.year}</td>
                      <td className="py-3 px-4 text-muted">₹{payroll.grossSalary?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                      <td className="py-3 px-4 fw-semibold" style={{ color: '#16a34a' }}>₹{payroll.netSalary?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                      <td className="py-3 px-4">
                        <span className="badge bg-light text-success border d-inline-flex align-items-center px-2 py-1" style={{ fontSize: '12px', fontWeight: '500' }}>
                          <CheckCircle size={12} className="me-1"/> Generated
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
