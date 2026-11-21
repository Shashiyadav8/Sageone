import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { UserPlus, Edit, Search, MapPin, Briefcase, Hash } from 'lucide-react';

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/employees`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEmployees(res.data);
    } catch (error) {
      console.error('Error fetching employees', error);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const openModal = (emp = null) => {
    setEditingEmployee(emp);
    if (emp) {
      Object.keys(emp).forEach(key => {
        if (key === 'banking' || key === 'documents') {
          Object.keys(emp[key]).forEach(subKey => {
            setValue(`${key}.${subKey}`, emp[key][subKey]);
          });
        } else {
          setValue(key, emp[key]);
        }
      });
      // Don't set password when editing unless they want to change it
      setValue('password', '');
    } else {
      reset();
    }
    setShowModal(true);
  };

  const onSubmit = async (data) => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      if (editingEmployee) {
        // If password is blank on edit, remove it so we don't overwrite with empty string
        if (!data.password) delete data.password;
        await axios.put(`${import.meta.env.VITE_API_URL}/employees/${editingEmployee._id}`, data, config);
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL}/employees`, data, config);
      }

      setShowModal(false);
      fetchEmployees();
    } catch (error) {
      alert(error.response?.data?.message || 'Error saving employee');
    }
  };

  const filteredEmployees = employees.filter(emp => 
    emp.employeeName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    emp.employeeId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.designation?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container-fluid py-4 px-4 px-md-5">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-end mb-4 pb-3 border-bottom">
        <div>
          <h3 className="fw-bold mb-1" style={{ color: '#1e293b', letterSpacing: '-0.5px' }}>Employee Directory</h3>
          <p className="text-muted mb-0 small">Manage employee records and configurations.</p>
        </div>
        <div className="d-flex gap-3 align-items-center">
          <div className="input-group input-group-sm" style={{ width: '250px' }}>
            <span className="input-group-text bg-white border-end-0"><Search size={14} className="text-muted" /></span>
            <input
              type="text"
              className="form-control border-start-0 bg-white"
              placeholder="Search employees..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ boxShadow: 'none' }}
            />
          </div>
          <button
            className="btn btn-primary d-flex align-items-center px-4 py-2"
            onClick={() => openModal()}
            style={{ backgroundColor: '#0f62fe', borderColor: '#0f62fe', borderRadius: '4px', fontSize: '14px', fontWeight: '500', whiteSpace: 'nowrap' }}
          >
            <UserPlus size={16} className="me-2" /> Add Employee
          </button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="mb-4">
        <span className="text-muted small">
          Showing <strong>{filteredEmployees.length}</strong> of <strong>{employees.length}</strong> employees
        </span>
      </div>

      {/* Card Grid */}
      {filteredEmployees.length === 0 ? (
        <div className="text-center text-muted py-5">
          <UserPlus size={40} className="mb-3 opacity-25" />
          <p>No employees found.</p>
        </div>
      ) : (
        <div className="row g-3">
          {filteredEmployees.map(emp => {
            const initials = emp.employeeName
              ? emp.employeeName.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
              : '?';

            const avatarColors = [
              ['#e0f2fe', '#0369a1'], ['#fce7f3', '#be185d'], ['#dcfce7', '#15803d'],
              ['#fef3c7', '#b45309'], ['#ede9fe', '#7c3aed'], ['#fee2e2', '#dc2626'],
              ['#f0fdf4', '#16a34a'], ['#fff7ed', '#ea580c'],
            ];
            const colorIdx = (emp.employeeId?.charCodeAt(0) || 0) % avatarColors.length;
            const [bgColor, textColor] = avatarColors[colorIdx];

            const statusColors = {
              'Active':   { bg: '#f0fdf4', text: '#16a34a', border: '#86efac' },
              'Inactive': { bg: '#f8fafc', text: '#64748b', border: '#cbd5e1' },
              'On Leave': { bg: '#fff7ed', text: '#ea580c', border: '#fdba74' },
            };
            const sc = statusColors[emp.status] || statusColors['Inactive'];

            return (
              <div key={emp._id} className="col-xl-3 col-lg-4 col-md-6 col-sm-6">
                <div
                  className="h-100"
                  style={{
                    background: 'rgba(255,255,255,0.85)',
                    backdropFilter: 'blur(12px)',
                    borderRadius: '12px',
                    border: '1px solid rgba(226,232,240,0.8)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                    transition: 'box-shadow 0.2s, transform 0.2s',
                    overflow: 'hidden',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  {/* Card top accent bar */}
                  <div style={{ height: '4px', background: 'linear-gradient(90deg, #0f62fe, #7c3aed)' }} />

                  <div className="p-3">
                    {/* Avatar + Status + Edit */}
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div
                        className="d-flex align-items-center justify-content-center fw-bold"
                        style={{
                          width: 48, height: 48, borderRadius: '12px',
                          background: bgColor, color: textColor,
                          fontSize: '16px', flexShrink: 0,
                        }}
                      >
                        {initials}
                      </div>
                      <div className="d-flex align-items-center gap-2">
                        <span
                          className="badge"
                          style={{
                            fontSize: '11px', fontWeight: '500', padding: '4px 8px',
                            borderRadius: '20px', border: `1px solid ${sc.border}`,
                            background: sc.bg, color: sc.text,
                          }}
                        >
                          {emp.status}
                        </span>
                        <button
                          className="btn btn-sm d-flex align-items-center justify-content-center"
                          onClick={() => openModal(emp)}
                          title="Edit"
                          style={{
                            width: 30, height: 30, borderRadius: '8px', padding: 0,
                            background: '#f1f5f9', border: '1px solid #e2e8f0', color: '#0f62fe',
                          }}
                        >
                          <Edit size={13} />
                        </button>
                      </div>
                    </div>

                    {/* Name */}
                    <h6
                      className="fw-bold mb-1"
                      style={{ color: '#0f172a', fontSize: '14px', lineHeight: '1.3',
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                      title={emp.employeeName}
                    >
                      {emp.employeeName}
                    </h6>

                    {/* Designation */}
                    <p className="text-muted mb-3" style={{ fontSize: '12px', minHeight: '16px',
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {emp.designation || 'No designation'}
                    </p>

                    {/* Info rows */}
                    <div className="d-flex flex-column gap-1" style={{ borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                      <div className="d-flex align-items-center gap-2">
                        <Hash size={12} style={{ color: '#94a3b8', flexShrink: 0 }} />
                        <span style={{ fontSize: '12px', color: '#475569', fontFamily: 'monospace' }}>
                          {emp.employeeId}
                        </span>
                      </div>
                      {emp.location && (
                        <div className="d-flex align-items-center gap-2">
                          <MapPin size={12} style={{ color: '#94a3b8', flexShrink: 0 }} />
                          <span style={{ fontSize: '12px', color: '#475569',
                            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {emp.location}
                          </span>
                        </div>
                      )}
                      {emp.grossSalary ? (
                        <div className="d-flex align-items-center gap-2">
                          <Briefcase size={12} style={{ color: '#94a3b8', flexShrink: 0 }} />
                          <span style={{ fontSize: '12px', color: '#16a34a', fontWeight: '600' }}>
                            {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(emp.grossSalary)}/mo
                          </span>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(15, 23, 42, 0.4)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <form className="modal-content border-0 shadow" onSubmit={handleSubmit(onSubmit)} style={{ borderRadius: '8px', overflow: 'hidden' }}>
              <div className="modal-header bg-white border-bottom py-3 px-4 px-md-5">
                <h5 className="modal-title fw-bold" style={{ color: '#0f172a' }}>{editingEmployee ? 'Edit Employee Record' : 'Create Employee Record'}</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)} style={{ fontSize: '12px' }}></button>
              </div>

              <div className="modal-body p-4 p-md-5 bg-white">
                <h6 className="fw-semibold mb-4 text-uppercase text-muted" style={{ fontSize: '12px', letterSpacing: '0.5px' }}>Basic Information</h6>
                <div className="row g-4 mb-5">
                  <div className="col-md-6">
                    <label className="form-label text-muted fw-semibold mb-2" style={{ fontSize: '12px', textTransform: 'uppercase' }}>Employee ID</label>
                    <input type="text" className="form-control" {...register('employeeId', { required: true })} disabled={!!editingEmployee} style={{ borderRadius: '4px', fontSize: '14px', padding: '10px 12px' }} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-muted fw-semibold mb-2" style={{ fontSize: '12px', textTransform: 'uppercase' }}>Employee Name</label>
                    <input type="text" className="form-control" {...register('employeeName', { required: true })} style={{ borderRadius: '4px', fontSize: '14px', padding: '10px 12px' }} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-muted fw-semibold mb-2" style={{ fontSize: '12px', textTransform: 'uppercase' }}>Password {editingEmployee && '(Leave blank to keep)'}</label>
                    <input type="password" className="form-control" {...register('password', { required: !editingEmployee })} style={{ borderRadius: '4px', fontSize: '14px', padding: '10px 12px' }} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-muted fw-semibold mb-2" style={{ fontSize: '12px', textTransform: 'uppercase' }}>Designation</label>
                    <input type="text" className="form-control" {...register('designation')} style={{ borderRadius: '4px', fontSize: '14px', padding: '10px 12px' }} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-muted fw-semibold mb-2" style={{ fontSize: '12px', textTransform: 'uppercase' }}>UAN No</label>
                    <input type="text" className="form-control" {...register('uanNo')} style={{ borderRadius: '4px', fontSize: '14px', padding: '10px 12px' }} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-muted fw-semibold mb-2" style={{ fontSize: '12px', textTransform: 'uppercase' }}>ESIC No</label>
                    <input type="text" className="form-control" {...register('esicNo')} style={{ borderRadius: '4px', fontSize: '14px', padding: '10px 12px' }} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-muted fw-semibold mb-2" style={{ fontSize: '12px', textTransform: 'uppercase' }}>Location</label>
                    <input type="text" className="form-control" {...register('location')} style={{ borderRadius: '4px', fontSize: '14px', padding: '10px 12px' }} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-muted fw-semibold mb-2" style={{ fontSize: '12px', textTransform: 'uppercase' }}>Monthly Gross Salary (₹)</label>
                    <input type="number" className="form-control" {...register('grossSalary')} placeholder="e.g. 101800" style={{ borderRadius: '4px', fontSize: '14px', padding: '10px 12px' }} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-muted fw-semibold mb-2" style={{ fontSize: '12px', textTransform: 'uppercase' }}>Status</label>
                    <select className="form-select" {...register('status')} style={{ borderRadius: '4px', fontSize: '14px', padding: '10px 12px' }}>
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                      <option value="On Leave">On Leave</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="modal-footer bg-light border-top py-3 px-4 px-md-5 d-flex justify-content-end">
                <button type="button" className="btn btn-link text-muted text-decoration-none fw-medium me-3" onClick={() => setShowModal(false)} style={{ fontSize: '14px' }}>Cancel</button>
                <button type="submit" className="btn btn-primary px-4 fw-medium" style={{ backgroundColor: '#0f62fe', borderColor: '#0f62fe', borderRadius: '4px', fontSize: '14px' }}>
                  {editingEmployee ? 'Update Record' : 'Save Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;
