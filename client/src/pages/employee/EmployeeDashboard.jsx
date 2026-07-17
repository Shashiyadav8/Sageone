import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { User, Briefcase, CreditCard, Award } from 'lucide-react';

const EmployeeDashboard = () => {
  const [employee, setEmployee] = useState(null);
  const [salaryPackage, setSalaryPackage] = useState(null);

  useEffect(() => {
    const fetchEmployeeDetails = async () => {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        try {
          const token = localStorage.getItem('token');
          const res = await axios.get(`${import.meta.env.VITE_API_URL}/employees/${user._id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setEmployee(res.data);
        } catch (error) {
          console.error('Error fetching full employee details', error);
          setEmployee(user); // Fallback to local storage if API fails
        }
      }
    };

    fetchEmployeeDetails();
  }, []);

  useEffect(() => {
    const fetchSalaryPackage = async () => {
      if (!employee?._id) return;
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/salary/${employee._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSalaryPackage(res.data);
      } catch (error) {
        // If it's a 404, it just means the admin hasn't created a package yet - this is completely normal.
        if (error.response && error.response.status === 404) {
          setSalaryPackage(null);
        } else {
          console.error('Error fetching salary package', error);
        }
      }
    };
    fetchSalaryPackage();
  }, [employee]);

  if (!employee) return (
    <div className="d-flex justify-content-center align-items-center" style={{ height: '70vh' }}>
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );

  return (
    <div className="container-fluid py-4 px-3 px-md-5" style={{ backgroundColor: '#f9f9fb', minHeight: '100vh', fontFamily: '"Inter", "Segoe UI", sans-serif' }}>

      {/* Header Section */}
      <div className="mb-4 pb-3 border-bottom d-flex justify-content-between align-items-end">
        <div>
          <h3 className="fw-bold mb-1" style={{ color: '#1e293b', letterSpacing: '-0.5px' }}>Dashboard</h3>
          <p className="text-muted mb-0 small">Welcome back, {employee.employeeName}. Here is your employment overview.</p>
        </div>
      </div>

      <div className="row g-4 mb-4">
        {/* Profile Card */}
        <div className="col-lg-6">
          <div className="card border-0 shadow-sm rounded-3 h-100" style={{ backgroundColor: '#ffffff' }}>
            <div className="card-header bg-white border-bottom py-3 px-4 d-flex align-items-center">
              <User size={18} style={{ color: '#0f62fe' }} className="me-2" />
              <h6 className="mb-0 fw-semibold" style={{ color: '#334155' }}>Personal Profile</h6>
            </div>
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center py-2 border-bottom border-light">
                <span className="text-muted fw-medium" style={{ fontSize: '13px' }}>Employee ID</span>
                <span className="fw-semibold text-dark" style={{ fontSize: '14px' }}>{employee.employeeId}</span>
              </div>
              <div className="d-flex justify-content-between align-items-center py-2 border-bottom border-light mt-2">
                <span className="text-muted fw-medium" style={{ fontSize: '13px' }}>Full Name</span>
                <span className="fw-semibold text-dark" style={{ fontSize: '14px' }}>{employee.employeeName}</span>
              </div>
              <div className="d-flex justify-content-between align-items-center py-2 border-bottom border-light mt-2">
                <span className="text-muted fw-medium" style={{ fontSize: '13px' }}>UAN No</span>
                <span className="fw-semibold text-dark" style={{ fontSize: '14px' }}>{employee.uanNo || '-'}</span>
              </div>
              <div className="d-flex justify-content-between align-items-center py-2 border-bottom border-light mt-2">
                <span className="text-muted fw-medium" style={{ fontSize: '13px' }}>ESIC No</span>
                <span className="fw-semibold text-dark" style={{ fontSize: '14px' }}>{employee.esicNo || '-'}</span>
              </div>
              <div className="d-flex justify-content-between align-items-center py-2 mt-2">
                <span className="text-muted fw-medium" style={{ fontSize: '13px' }}>Status</span>
                <span className={`badge border ${employee.status === 'Active' ? 'bg-light text-success border-success' : 'bg-light text-secondary border-secondary'}`} style={{ fontSize: '11px', fontWeight: '500', padding: '4px 8px' }}>
                  {employee.status || 'Active'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Employment Card */}
        <div className="col-lg-6">
          <div className="card border-0 shadow-sm rounded-3 h-100" style={{ backgroundColor: '#ffffff' }}>
            <div className="card-header bg-white border-bottom py-3 px-4 d-flex align-items-center">
              <Briefcase size={18} style={{ color: '#0f62fe' }} className="me-2" />
              <h6 className="mb-0 fw-semibold" style={{ color: '#334155' }}>Employment Details</h6>
            </div>
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center py-2 border-bottom border-light">
                <span className="text-muted fw-medium" style={{ fontSize: '13px' }}>Location</span>
                <span className="fw-semibold text-dark" style={{ fontSize: '14px' }}>{employee.location || 'Not Assigned'}</span>
              </div>
              <div className="d-flex justify-content-between align-items-center py-2 border-bottom border-light mt-2">
                <span className="text-muted fw-medium" style={{ fontSize: '13px' }}>Designation</span>
                <span className="fw-semibold text-dark" style={{ fontSize: '14px' }}>{employee.designation || 'Not Assigned'}</span>
              </div>
              <div className="d-flex justify-content-between align-items-center py-2 mt-2">
                <span className="text-muted fw-medium" style={{ fontSize: '13px' }}>Monthly Gross Salary</span>
                <span className="fw-semibold text-dark" style={{ fontSize: '14px' }}>{employee.grossSalary ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(employee.grossSalary) : 'Not Configured'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Salary Package Section */}
      <h6 className="fw-semibold mb-3 mt-5 d-flex align-items-center text-uppercase text-muted" style={{ fontSize: '12px', letterSpacing: '0.5px' }}>
        <Award size={16} className="me-2" /> Current Salary Structure
      </h6>

      {!salaryPackage ? (
        <div className="card border-0 shadow-sm rounded-3 text-center py-5" style={{ backgroundColor: '#ffffff' }}>
          <div className="mb-3">
            <CreditCard size={32} className="text-muted opacity-50" />
          </div>
          <h6 className="fw-semibold text-dark">Configuration Pending</h6>
          <p className="text-muted small mb-0">Your detailed salary breakdown has not been assigned by HR.</p>
        </div>
      ) : (
        <div className="row g-4">
          <div className="col-lg-6">
            <div className="card border-0 shadow-sm rounded-3 h-100" style={{ backgroundColor: '#ffffff', borderTop: '3px solid #16a34a' }}>
              <div className="card-header bg-white border-bottom py-3 px-4">
                <h6 className="mb-0 fw-semibold text-success" style={{ fontSize: '14px' }}>Monthly Earnings</h6>
              </div>
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-center py-2 border-bottom border-light">
                  <span className="text-muted fw-medium" style={{ fontSize: '13px' }}>Basic Salary</span>
                  <span className="fw-semibold text-dark" style={{ fontSize: '14px' }}>₹{(salaryPackage.basicSalary || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="d-flex justify-content-between align-items-center py-2 border-bottom border-light mt-2">
                  <span className="text-muted fw-medium" style={{ fontSize: '13px' }}>House Rent Allowance (HRA)</span>
                  <span className="fw-semibold text-dark" style={{ fontSize: '14px' }}>₹{(salaryPackage.hra || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="d-flex justify-content-between align-items-center py-2 mt-2">
                  <span className="text-muted fw-medium" style={{ fontSize: '13px' }}>Other Allowances</span>
                  <span className="fw-semibold text-dark" style={{ fontSize: '14px' }}>₹{(salaryPackage.otherAllowances || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-6">
            <div className="card border-0 shadow-sm rounded-3 h-100" style={{ backgroundColor: '#ffffff', borderTop: '3px solid #ef4444' }}>
              <div className="card-header bg-white border-bottom py-3 px-4">
                <h6 className="mb-0 fw-semibold text-danger" style={{ fontSize: '14px' }}>Monthly Deductions</h6>
              </div>
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-center py-2 border-bottom border-light">
                  <span className="text-muted fw-medium" style={{ fontSize: '13px' }}>Provident Fund (Employee)</span>
                  <span className="fw-semibold text-dark" style={{ fontSize: '14px' }}>₹{(salaryPackage.employeePF || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="d-flex justify-content-between align-items-center py-2 border-bottom border-light mt-2">
                  <span className="text-muted fw-medium" style={{ fontSize: '13px' }}>ESI (Employee)</span>
                  <span className="fw-semibold text-dark" style={{ fontSize: '14px' }}>₹{(salaryPackage.employeeESI || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="d-flex justify-content-between align-items-center py-2 mt-2">
                  <span className="text-muted fw-medium" style={{ fontSize: '13px' }}>Professional Tax</span>
                  <span className="fw-semibold text-dark" style={{ fontSize: '14px' }}>₹{(salaryPackage.professionalTax || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeDashboard;
