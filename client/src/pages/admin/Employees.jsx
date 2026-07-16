import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { UserPlus, Edit, Trash2 } from 'lucide-react';

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  
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

  return (
    <div className="container-fluid py-4 px-4 px-md-5">
      <div className="d-flex justify-content-between align-items-end mb-4 pb-3 border-bottom">
        <div>
          <h3 className="fw-bold mb-1" style={{ color: '#1e293b', letterSpacing: '-0.5px' }}>Employee Directory</h3>
          <p className="text-muted mb-0 small">Manage employee records and configurations.</p>
        </div>
        <button className="btn btn-primary d-flex align-items-center px-4 py-2" onClick={() => openModal()} style={{ backgroundColor: '#0f62fe', borderColor: '#0f62fe', borderRadius: '4px', fontSize: '14px', fontWeight: '500' }}>
          <UserPlus size={16} className="me-2" /> Add Employee
        </button>
      </div>

      <div className="card border-0 shadow-sm rounded-3" style={{ backgroundColor: '#ffffff' }}>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0" style={{ fontSize: '14px' }}>
              <thead style={{ backgroundColor: '#f8fafc' }}>
                <tr>
                  <th className="py-3 px-4 text-uppercase text-muted fw-semibold border-bottom" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>ID</th>
                  <th className="py-3 px-4 text-uppercase text-muted fw-semibold border-bottom" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>Name</th>
                  <th className="py-3 px-4 text-uppercase text-muted fw-semibold border-bottom" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>Email</th>
                  <th className="py-3 px-4 text-uppercase text-muted fw-semibold border-bottom" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>Department</th>
                  <th className="py-3 px-4 text-uppercase text-muted fw-semibold border-bottom" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>LPA</th>
                  <th className="py-3 px-4 text-uppercase text-muted fw-semibold border-bottom" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>Status</th>
                  <th className="py-3 px-4 text-uppercase text-muted fw-semibold border-bottom text-end" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.length === 0 ? (
                  <tr><td colSpan="7" className="text-center text-muted py-5">No employees found.</td></tr>
                ) : (
                  employees.map(emp => (
                    <tr key={emp._id}>
                      <td className="py-3 px-4 fw-medium text-dark">{emp.employeeId}</td>
                      <td className="py-3 px-4 fw-semibold text-dark">{emp.firstName} {emp.lastName}</td>
                      <td className="py-3 px-4 text-muted">{emp.email}</td>
                      <td className="py-3 px-4 text-muted">{emp.department || '-'}</td>
                      <td className="py-3 px-4 fw-medium text-dark">{emp.lpa ? `₹${emp.lpa}L` : '-'}</td>
                      <td className="py-3 px-4">
                        <span className={`badge border d-inline-flex align-items-center px-2 py-1 ${emp.status === 'Active' ? 'bg-light text-success border-success' : 'bg-light text-secondary border-secondary'}`} style={{ fontSize: '12px', fontWeight: '500' }}>
                          {emp.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-end">
                        <button className="btn btn-sm btn-light border text-primary" onClick={() => openModal(emp)} style={{ borderRadius: '4px' }}>
                          <Edit size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

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
                      <input type="text" className="form-control" {...register('employeeId', { required: true })} readOnly={!!editingEmployee} style={{ borderRadius: '4px', fontSize: '14px', padding: '10px 12px' }} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label text-muted fw-semibold mb-2" style={{ fontSize: '12px', textTransform: 'uppercase' }}>Email Address</label>
                      <input type="email" className="form-control" {...register('email', { required: true })} style={{ borderRadius: '4px', fontSize: '14px', padding: '10px 12px' }} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label text-muted fw-semibold mb-2" style={{ fontSize: '12px', textTransform: 'uppercase' }}>First Name</label>
                      <input type="text" className="form-control" {...register('firstName', { required: true })} style={{ borderRadius: '4px', fontSize: '14px', padding: '10px 12px' }} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label text-muted fw-semibold mb-2" style={{ fontSize: '12px', textTransform: 'uppercase' }}>Last Name</label>
                      <input type="text" className="form-control" {...register('lastName', { required: true })} style={{ borderRadius: '4px', fontSize: '14px', padding: '10px 12px' }} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label text-muted fw-semibold mb-2" style={{ fontSize: '12px', textTransform: 'uppercase' }}>Password {editingEmployee && '(Leave blank to keep)'}</label>
                      <input type="password" className="form-control" {...register('password', { required: !editingEmployee })} style={{ borderRadius: '4px', fontSize: '14px', padding: '10px 12px' }} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label text-muted fw-semibold mb-2" style={{ fontSize: '12px', textTransform: 'uppercase' }}>Department</label>
                      <input type="text" className="form-control" {...register('department')} style={{ borderRadius: '4px', fontSize: '14px', padding: '10px 12px' }} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label text-muted fw-semibold mb-2" style={{ fontSize: '12px', textTransform: 'uppercase' }}>Designation</label>
                      <input type="text" className="form-control" {...register('designation')} style={{ borderRadius: '4px', fontSize: '14px', padding: '10px 12px' }} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label text-muted fw-semibold mb-2" style={{ fontSize: '12px', textTransform: 'uppercase' }}>LPA (Lakhs Per Annum)</label>
                      <input type="number" step="0.01" className="form-control" {...register('lpa')} placeholder="e.g. 12.5" style={{ borderRadius: '4px', fontSize: '14px', padding: '10px 12px' }} />
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
                  
                  <h6 className="fw-semibold mb-4 text-uppercase text-muted border-top pt-4" style={{ fontSize: '12px', letterSpacing: '0.5px' }}>Banking Details</h6>
                  <div className="row g-4">
                    <div className="col-md-3">
                      <label className="form-label text-muted fw-semibold mb-2" style={{ fontSize: '12px', textTransform: 'uppercase' }}>Bank Name</label>
                      <input type="text" className="form-control" {...register('banking.bankName')} style={{ borderRadius: '4px', fontSize: '14px', padding: '10px 12px' }} />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label text-muted fw-semibold mb-2" style={{ fontSize: '12px', textTransform: 'uppercase' }}>Account No</label>
                      <input type="text" className="form-control" {...register('banking.accountNumber')} style={{ borderRadius: '4px', fontSize: '14px', padding: '10px 12px' }} />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label text-muted fw-semibold mb-2" style={{ fontSize: '12px', textTransform: 'uppercase' }}>IFSC Code</label>
                      <input type="text" className="form-control" {...register('banking.ifscCode')} style={{ borderRadius: '4px', fontSize: '14px', padding: '10px 12px' }} />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label text-muted fw-semibold mb-2" style={{ fontSize: '12px', textTransform: 'uppercase' }}>UAN No</label>
                      <input type="text" className="form-control" {...register('documents.uan')} placeholder="PF UAN" style={{ borderRadius: '4px', fontSize: '14px', padding: '10px 12px' }} />
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
