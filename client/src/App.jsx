import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import Login from './pages/Login';
import AdminDashboard from './pages/admin/AdminDashboard';
import Employees from './pages/admin/Employees';
import Payroll from './pages/admin/Payroll';

import EmployeeDashboard from './pages/employee/EmployeeDashboard';
import Payslips from './pages/employee/Payslips';
import Settings from './pages/employee/Settings';

import logo from './assets/sagepath_navbar.png';

import { LogOut } from 'lucide-react';

function App() {
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Admin Routes */}
        <Route path="/admin/*" element={
          <div className="d-flex" style={{ backgroundColor: 'var(--bg-color)' }}>
            <div className="sidebar p-4 d-flex flex-column" style={{ width: '260px' }}>
              <div className="mb-5 mt-2 px-2">
                <img src={logo} alt="SagePath" className="sidebar-logo" />
              </div>
              <nav className="nav flex-column flex-grow-1">
                <Link className="nav-link" to="/admin/dashboard">Dashboard</Link>
                <Link className="nav-link" to="/admin/employees">Directory</Link>
                <Link className="nav-link" to="/admin/payroll">Payroll</Link>
              </nav>
              <button onClick={handleLogout} className="btn btn-light text-secondary mt-auto d-flex align-items-center justify-content-center border" style={{ borderRadius: '4px', fontSize: '14px', fontWeight: '500' }}>
                <LogOut size={16} className="me-2" /> Sign Out
              </button>
            </div>
            <div className="flex-grow-1 p-0" style={{ height: '100vh', overflowY: 'auto' }}>
              <Routes>
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="employees" element={<Employees />} />
                <Route path="payroll" element={<Payroll />} />
                <Route path="*" element={<Navigate to="dashboard" replace />} />
              </Routes>
            </div>
          </div>
        } />

        {/* Employee Routes */}
        <Route path="/employee/*" element={
          <div className="d-flex flex-column vh-100">
            <nav className="navbar navbar-expand-md navbar-light bg-white border-bottom px-3 px-md-4 py-2" style={{ zIndex: 10 }}>
              <div className="container-fluid p-0">
                <Link className="navbar-brand py-0 me-0" to="/employee/dashboard">
                  <img src={logo} alt="SagePath" style={{ height: '32px', objectFit: 'contain' }} />
                </Link>
                <button className="navbar-toggler border-0 px-0" type="button" data-bs-toggle="collapse" data-bs-target="#employeeNavbar">
                  <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse justify-content-end mt-3 mt-md-0" id="employeeNavbar">
                  <div className="navbar-nav align-items-md-center gap-2 gap-md-4">
                    <Link className="nav-link text-dark fw-medium px-0 px-md-2" to="/employee/dashboard" style={{ fontSize: '14px' }}>Dashboard</Link>
                    <Link className="nav-link text-dark fw-medium px-0 px-md-2" to="/employee/payslips" style={{ fontSize: '14px' }}>My Payslips</Link>
                    <Link className="nav-link text-dark fw-medium px-0 px-md-2" to="/employee/settings" style={{ fontSize: '14px' }}>Settings</Link>
                    <button onClick={handleLogout} className="btn btn-sm btn-light border text-secondary d-flex align-items-center w-100 w-md-auto mt-2 mt-md-0 justify-content-center" style={{ borderRadius: '4px' }}>
                      <LogOut size={14} className="me-2" /> Sign Out
                    </button>
                  </div>
                </div>
              </div>
            </nav>
            <main className="flex-grow-1 p-0" style={{ backgroundColor: 'var(--bg-color)', overflowY: 'auto' }}>
              <Routes>
                <Route path="dashboard" element={<EmployeeDashboard />} />
                <Route path="payslips" element={<Payslips />} />
                <Route path="settings" element={<Settings />} />
                <Route path="*" element={<Navigate to="dashboard" replace />} />
              </Routes>
            </main>
          </div>
        } />

        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
