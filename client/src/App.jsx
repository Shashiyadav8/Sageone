import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, NavLink } from 'react-router-dom';
import Login from './pages/Login';
import AdminDashboard from './pages/admin/AdminDashboard';
import Employees from './pages/admin/Employees';
import Payroll from './pages/admin/Payroll';
import AdminSettings from './pages/admin/AdminSettings';

import EmployeeDashboard from './pages/employee/EmployeeDashboard';
import Payslips from './pages/employee/Payslips';
import Settings from './pages/employee/Settings';

import logo from './assets/sagepath_navbar.png';

import { LogOut, LayoutDashboard, Users, CreditCard, FileText, Settings as SettingsIcon } from 'lucide-react';

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
          <div className="d-flex bg-transparent-glass">
            <div className="sidebar p-4 d-flex flex-column" style={{ width: '260px' }}>
              <div className="mb-5 mt-2 px-2">
                <img src={logo} alt="SagePath" className="sidebar-logo" />
              </div>
              <nav className="nav flex-column flex-grow-1 gap-2">
                <NavLink className="nav-link d-flex align-items-center" to="/admin/dashboard">
                  <LayoutDashboard size={18} className="me-3" /> Dashboard
                </NavLink>
                <NavLink className="nav-link d-flex align-items-center" to="/admin/employees">
                  <Users size={18} className="me-3" /> Directory
                </NavLink>
                <NavLink className="nav-link d-flex align-items-center" to="/admin/payroll">
                  <CreditCard size={18} className="me-3" /> Payroll
                </NavLink>
                <NavLink className="nav-link d-flex align-items-center" to="/admin/settings">
                  <SettingsIcon size={18} className="me-3" /> Settings
                </NavLink>
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
                <Route path="settings" element={<AdminSettings />} />
                <Route path="*" element={<Navigate to="dashboard" replace />} />
              </Routes>
            </div>
          </div>
        } />

        {/* Employee Routes */}
        <Route path="/employee/*" element={
          <div className="d-flex flex-column vh-100 bg-transparent-glass">
            <nav className="navbar navbar-expand-md navbar-light border-bottom px-3 px-md-4 py-2" style={{ zIndex: 10, background: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(16px)' }}>
              <div className="container-fluid p-0 d-flex justify-content-center justify-content-md-between">
                <Link className="navbar-brand py-0 me-0" to="/employee/dashboard">
                  <img src={logo} alt="SagePath" style={{ height: '32px', objectFit: 'contain' }} />
                </Link>
                
                {/* Desktop Nav */}
                <div className="d-none d-md-flex align-items-center">
                  <div className="navbar-nav gap-4">
                    <NavLink className="nav-link text-dark fw-medium px-2 d-flex align-items-center" to="/employee/dashboard" style={{ fontSize: '14px' }}>
                      Dashboard
                    </NavLink>
                    <NavLink className="nav-link text-dark fw-medium px-2 d-flex align-items-center" to="/employee/payslips" style={{ fontSize: '14px' }}>
                      My Payslips
                    </NavLink>
                    <NavLink className="nav-link text-dark fw-medium px-2 d-flex align-items-center" to="/employee/settings" style={{ fontSize: '14px' }}>
                      <SettingsIcon size={15} className="me-1" /> Settings
                    </NavLink>
                    <button onClick={handleLogout} className="btn btn-sm btn-light border text-secondary d-flex align-items-center justify-content-center ms-3" style={{ borderRadius: '6px', padding: '8px 16px' }}>
                      <LogOut size={14} className="me-2" /> Sign Out
                    </button>
                  </div>
                </div>
              </div>
            </nav>
            <main className="flex-grow-1 bg-transparent-glass" style={{ overflowY: 'auto', paddingBottom: '80px' }}>
              <Routes>
                <Route path="dashboard" element={<EmployeeDashboard />} />
                <Route path="payslips" element={<Payslips />} />
                <Route path="settings" element={<Settings />} />
                <Route path="*" element={<Navigate to="dashboard" replace />} />
              </Routes>
            </main>

            {/* Mobile Bottom Navigation */}
            <div className="d-md-none fixed-bottom border-top d-flex justify-content-around align-items-center py-2" style={{ background: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(16px)', zIndex: 1000, paddingBottom: 'env(safe-area-inset-bottom)' }}>
              <NavLink to="/employee/dashboard" className={({ isActive }) => `text-decoration-none d-flex flex-column align-items-center justify-content-center px-3 ${isActive ? 'text-primary' : 'text-muted'}`} style={{ fontSize: '11px', fontWeight: '500' }}>
                <LayoutDashboard size={20} className="mb-1" />
                Dashboard
              </NavLink>
              <NavLink to="/employee/payslips" className={({ isActive }) => `text-decoration-none d-flex flex-column align-items-center justify-content-center px-3 ${isActive ? 'text-primary' : 'text-muted'}`} style={{ fontSize: '11px', fontWeight: '500' }}>
                <FileText size={20} className="mb-1" />
                Payslips
              </NavLink>
              <NavLink to="/employee/settings" className={({ isActive }) => `text-decoration-none d-flex flex-column align-items-center justify-content-center px-3 ${isActive ? 'text-primary' : 'text-muted'}`} style={{ fontSize: '11px', fontWeight: '500' }}>
                <SettingsIcon size={20} className="mb-1" />
                Settings
              </NavLink>
              <div onClick={handleLogout} className="text-decoration-none d-flex flex-column align-items-center justify-content-center px-3 text-muted" style={{ fontSize: '11px', fontWeight: '500', cursor: 'pointer' }}>
                <LogOut size={20} className="mb-1" />
                Sign Out
              </div>
            </div>
          </div>
        } />

        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
