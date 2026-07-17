import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { DollarSign, FileText, Users, Search, CheckCircle, ChevronRight, X, Play, RefreshCcw } from 'lucide-react';

const Payroll = () => {
  const [employees, setEmployees] = useState([]);
  const [payrolls, setPayrolls] = useState([]);
  
  // Single Payroll State
  const [showModal, setShowModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [generating, setGenerating] = useState(false);
  
  // Bulk Payroll State
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkGenerating, setBulkGenerating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [lopData, setLopData] = useState({});
  const [bulkSummary, setBulkSummary] = useState(null);
  
  const [bulkMonth, setBulkMonth] = useState(new Date().getMonth() + 1);
  const [bulkYear, setBulkYear] = useState(new Date().getFullYear());
  const [bulkWorkingDays, setBulkWorkingDays] = useState(30);

  const { register, handleSubmit, reset } = useForm();

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const empRes = await axios.get(`${import.meta.env.VITE_API_URL}/employees`, config);
      setEmployees(empRes.data.filter(e => e.status === 'Active'));

      const payRes = await axios.get(`${import.meta.env.VITE_API_URL}/payroll`, config);
      setPayrolls(payRes.data);
    } catch (error) {
      console.error('Error fetching data', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- Single Generation Logic ---
  const openModal = (emp) => {
    setSelectedEmployee(emp);
    reset({ month: new Date().getMonth() + 1, year: new Date().getFullYear(), workingDays: 30, lopDays: 0 });
    setShowModal(true);
  };

  const onSubmit = async (data) => {
    try {
      setGenerating(true);
      const token = localStorage.getItem('token');
      await axios.post(`${import.meta.env.VITE_API_URL}/payroll/generate/${selectedEmployee._id}`, data, { headers: { Authorization: `Bearer ${token}` } });
      setShowModal(false);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Error generating payroll.');
    } finally {
      setGenerating(false);
    }
  };

  // --- Bulk Generation Logic ---
  const openBulkModal = () => {
    setLopData({});
    setSearchQuery('');
    setBulkSummary(null);
    setShowBulkModal(true);
  };

  const handleLopChange = (empId, days) => {
    setLopData(prev => ({ ...prev, [empId]: days === '' ? '' : Number(days) }));
  };

  const onBulkSubmit = async () => {
    try {
      setBulkGenerating(true);
      setBulkSummary(null);
      const token = localStorage.getItem('token');
      
      const employeeData = employees.map(emp => ({
        employeeId: emp._id,
        lopDays: Number(lopData[emp._id]) || 0
      }));

      const payload = { month: bulkMonth, year: bulkYear, workingDays: bulkWorkingDays, employeeData };
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/payroll/generate-all`, payload, { headers: { Authorization: `Bearer ${token}` } });
      
      setBulkSummary(res.data);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Error running bulk generation.');
    } finally {
      setBulkGenerating(false);
    }
  };

  const filteredEmployees = employees.filter(emp => 
    emp.employeeName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    emp.employeeId?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container-fluid py-4 px-4 px-md-5" style={{ backgroundColor: '#f9f9fb', minHeight: '100vh', fontFamily: '"Inter", "Segoe UI", sans-serif' }}>
      
      {/* Header Section */}
      <div className="d-flex justify-content-between align-items-end mb-4 pb-3 border-bottom">
        <div>
          <h3 className="fw-bold mb-1" style={{ color: '#1e293b', letterSpacing: '-0.5px' }}>Payroll Processing</h3>
          <p className="text-muted mb-0 small">Manage and generate monthly salary slips for all employees.</p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-primary d-flex align-items-center px-4 py-2" 
                  onClick={openBulkModal}
                  style={{ backgroundColor: '#0f62fe', borderColor: '#0f62fe', borderRadius: '4px', fontSize: '14px', fontWeight: '500' }}>
            <Play size={16} className="me-2" /> Run Payroll Batch
          </button>
        </div>
      </div>

      <div className="row g-4">
        {/* Left Column: Quick Generation List */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm rounded-3" style={{ backgroundColor: '#ffffff' }}>
            <div className="card-header bg-white border-bottom py-3 px-4">
              <h6 className="mb-0 fw-semibold" style={{ color: '#334155' }}>Individual Generation</h6>
            </div>
            <div className="card-body p-0">
              <div className="list-group list-group-flush" style={{ maxHeight: '65vh', overflowY: 'auto' }}>
                {employees.length === 0 ? (
                  <div className="p-4 text-center text-muted small">No active employees found.</div>
                ) : (
                  employees.map(emp => (
                    <div key={emp._id} className="list-group-item border-bottom py-3 px-4 d-flex justify-content-between align-items-center" style={{ transition: 'background-color 0.2s' }}>
                      <div className="d-flex align-items-center">
                        <div className="rounded-circle bg-light d-flex justify-content-center align-items-center text-primary fw-bold" style={{ width: '40px', height: '40px', fontSize: '14px' }}>
                          {emp.employeeName?.charAt(0) || 'E'}
                        </div>
                        <div className="ms-3">
                          <div className="fw-semibold text-dark" style={{ fontSize: '14px' }}>{emp.employeeName}</div>
                          <div className="text-muted" style={{ fontSize: '12px' }}>{emp.employeeId} • {emp.designation || 'N/A'}</div>
                        </div>
                      </div>
                      <button className="btn btn-light btn-sm text-primary d-flex align-items-center justify-content-center" 
                              onClick={() => openModal(emp)} 
                              style={{ width: '32px', height: '32px', borderRadius: '4px' }}>
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Payroll History */}
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm rounded-3" style={{ backgroundColor: '#ffffff' }}>
            <div className="card-header bg-white border-bottom py-3 px-4 d-flex justify-content-between align-items-center">
              <h6 className="mb-0 fw-semibold" style={{ color: '#334155' }}>Recent Payroll History</h6>
              <button className="btn btn-sm btn-link text-muted p-0 text-decoration-none d-flex align-items-center" onClick={fetchData}>
                <RefreshCcw size={14} className="me-1" /> Refresh
              </button>
            </div>
            <div className="table-responsive" style={{ maxHeight: '65vh', overflowY: 'auto' }}>
              <table className="table table-hover align-middle mb-0" style={{ fontSize: '14px' }}>
                <thead style={{ backgroundColor: '#f8fafc', position: 'sticky', top: 0, zIndex: 1 }}>
                  <tr>
                    <th className="py-3 px-4 text-uppercase text-muted fw-semibold" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>Employee</th>
                    <th className="py-3 px-4 text-uppercase text-muted fw-semibold" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>Period</th>
                    <th className="py-3 px-4 text-uppercase text-muted fw-semibold" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>Net Salary</th>
                    <th className="py-3 px-4 text-uppercase text-muted fw-semibold text-end" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>Document</th>
                  </tr>
                </thead>
                <tbody>
                  {payrolls.length === 0 ? (
                    <tr><td colSpan="4" className="text-center text-muted py-5">No payroll records found.</td></tr>
                  ) : (
                    payrolls.map(pay => (
                      <tr key={pay._id} style={{ cursor: 'default' }}>
                        <td className="py-3 px-4 fw-medium text-dark">
                          {pay.employee?.employeeName || 'Unknown Employee'}
                        </td>
                        <td className="py-3 px-4 text-muted">
                          {new Date(pay.year, pay.month - 1).toLocaleString('default', { month: 'short' })} {pay.year}
                        </td>
                        <td className="py-3 px-4 fw-semibold" style={{ color: '#16a34a' }}>
                          ₹{pay.netSalary.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 px-4 text-end">
                          <a href={pay.pdfUrl?.startsWith('http') ? pay.pdfUrl : `${import.meta.env.VITE_BACKEND_URL}${pay.pdfUrl}`} target="_blank" rel="noreferrer" 
                             className="btn btn-sm px-3 py-1 d-inline-flex align-items-center"
                             style={{ backgroundColor: '#f1f5f9', color: '#3b82f6', borderRadius: '4px', fontSize: '13px', fontWeight: '500', textDecoration: 'none' }}>
                            <FileText size={14} className="me-2" /> View PDF
                          </a>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* --- Single Generate Modal (Enterprise Style) --- */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(15, 23, 42, 0.4)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow" style={{ borderRadius: '8px' }}>
              <div className="modal-header border-bottom py-3 px-4">
                <h6 className="modal-title fw-semibold">Process Salary: {selectedEmployee?.employeeName}</h6>
                <button type="button" className="btn-close" onClick={() => !generating && setShowModal(false)} style={{ fontSize: '12px' }}></button>
              </div>
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="modal-body p-4">
                  <div className="row g-4">
                    <div className="col-md-6">
                      <label className="form-label text-muted fw-semibold mb-2" style={{ fontSize: '12px', textTransform: 'uppercase' }}>Month</label>
                      <select className="form-select" {...register('month', { required: true })} style={{ borderRadius: '4px', fontSize: '14px', padding: '10px 12px' }}>
                        {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                          <option key={m} value={m}>{new Date(2000, m - 1).toLocaleString('default', { month: 'long' })}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label text-muted fw-semibold mb-2" style={{ fontSize: '12px', textTransform: 'uppercase' }}>Year</label>
                      <input type="number" className="form-control" {...register('year', { required: true })} style={{ borderRadius: '4px', fontSize: '14px', padding: '10px 12px' }} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label text-muted fw-semibold mb-2" style={{ fontSize: '12px', textTransform: 'uppercase' }}>Working Days</label>
                      <input type="number" step="0.5" className="form-control" {...register('workingDays', { required: true })} style={{ borderRadius: '4px', fontSize: '14px', padding: '10px 12px' }} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label text-muted fw-semibold mb-2" style={{ fontSize: '12px', textTransform: 'uppercase' }}>Loss of Pay (Days)</label>
                      <input type="number" step="0.5" className="form-control" {...register('lopDays')} style={{ borderRadius: '4px', fontSize: '14px', padding: '10px 12px' }} />
                    </div>
                  </div>
                </div>
                <div className="modal-footer bg-light border-top py-3 px-4">
                  <button type="button" className="btn btn-link text-muted text-decoration-none fw-medium" onClick={() => !generating && setShowModal(false)} disabled={generating} style={{ fontSize: '14px' }}>Cancel</button>
                  <button type="submit" className="btn btn-primary px-4 fw-medium" disabled={generating} style={{ backgroundColor: '#0f62fe', borderColor: '#0f62fe', borderRadius: '4px', fontSize: '14px' }}>
                    {generating ? 'Processing...' : 'Run Payroll'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* --- Bulk Generate Wizard (Enterprise Style) --- */}
      {showBulkModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(15, 23, 42, 0.5)' }}>
          <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content border-0 shadow" style={{ borderRadius: '8px', overflow: 'hidden', height: '90vh' }}>
              <div className="modal-header bg-white border-bottom py-3 px-4 px-md-5 d-flex justify-content-between align-items-center">
                <h5 className="modal-title fw-bold" style={{ color: '#0f172a' }}>Batch Payroll Processing</h5>
                <button type="button" className="btn text-muted p-1" onClick={() => !bulkGenerating && setShowBulkModal(false)}>
                  <X size={20} />
                </button>
              </div>
              
              <div className="modal-body p-0 bg-white" style={{ display: 'flex', flexDirection: 'column' }}>
                {bulkSummary ? (
                  <div className="text-center py-5 my-auto">
                    <div className="d-inline-flex justify-content-center align-items-center rounded-circle mb-4" style={{ backgroundColor: '#dcfce7', width: '80px', height: '80px' }}>
                      <CheckCircle size={40} style={{ color: '#16a34a' }} />
                    </div>
                    <h4 className="fw-bold text-dark mb-2">Processing Completed</h4>
                    <p className="text-muted mb-4">{bulkSummary.message}</p>
                    
                    {bulkSummary.skippedDetails?.length > 0 && (
                      <div className="text-start bg-light p-4 rounded-3 d-inline-block mx-auto border" style={{ maxWidth: '600px', width: '100%', maxHeight: '300px', overflowY: 'auto' }}>
                        <h6 className="fw-semibold text-danger mb-3" style={{ fontSize: '13px', textTransform: 'uppercase' }}>Exceptions / Skipped Records</h6>
                        <ul className="mb-0 text-muted list-unstyled" style={{ fontSize: '14px' }}>
                          {bulkSummary.skippedDetails.map((s, i) => (
                            <li key={i} className="mb-2 pb-2 border-bottom border-light">
                              <span className="fw-medium text-dark">{s.name || s.employeeId}</span> — {s.reason}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="d-flex flex-column h-100">
                    <div className="bg-light border-bottom px-4 px-md-5 py-4">
                      <div className="row g-4 align-items-end">
                        <div className="col-md-3">
                          <label className="form-label text-muted fw-semibold mb-2" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Target Month</label>
                          <select className="form-select" value={bulkMonth} onChange={(e) => setBulkMonth(Number(e.target.value))} style={{ borderRadius: '4px', fontSize: '14px', padding: '10px 12px' }}>
                            {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                              <option key={m} value={m}>{new Date(2000, m - 1).toLocaleString('default', { month: 'long' })}</option>
                            ))}
                          </select>
                        </div>
                        <div className="col-md-3">
                          <label className="form-label text-muted fw-semibold mb-2" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Target Year</label>
                          <input type="number" className="form-control" value={bulkYear} onChange={(e) => setBulkYear(Number(e.target.value))} style={{ borderRadius: '4px', fontSize: '14px', padding: '10px 12px' }} />
                        </div>
                        <div className="col-md-3">
                          <label className="form-label text-muted fw-semibold mb-2" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Standard Working Days</label>
                          <input type="number" className="form-control" value={bulkWorkingDays} onChange={(e) => setBulkWorkingDays(Number(e.target.value))} style={{ borderRadius: '4px', fontSize: '14px', padding: '10px 12px' }} />
                        </div>
                        <div className="col-md-3 d-flex justify-content-end">
                          <div className="position-relative w-100">
                            <Search size={16} className="text-muted position-absolute" style={{ top: '12px', left: '12px' }} />
                            <input type="text" className="form-control ps-5" placeholder="Search employees..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ borderRadius: '4px', fontSize: '14px', padding: '10px 12px 10px 36px' }} />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex-grow-1 overflow-auto bg-white px-4 px-md-5 py-3">
                      <table className="table table-hover align-middle mb-0" style={{ fontSize: '14px' }}>
                        <thead className="table-light">
                          <tr>
                            <th className="py-3 px-3 text-uppercase text-muted fw-semibold border-bottom-0" style={{ fontSize: '11px', letterSpacing: '0.5px', borderRadius: '6px 0 0 6px' }}>Employee ID</th>
                            <th className="py-3 px-3 text-uppercase text-muted fw-semibold border-bottom-0" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>Full Name</th>
                            <th className="py-3 px-3 text-uppercase text-muted fw-semibold border-bottom-0" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>Designation</th>
                            <th className="py-3 px-3 text-uppercase text-muted fw-semibold border-bottom-0 text-center" style={{ fontSize: '11px', letterSpacing: '0.5px', width: '150px', borderRadius: '0 6px 6px 0' }}>LOP Days</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredEmployees.map(emp => (
                            <tr key={emp._id} className="border-bottom">
                              <td className="py-3 px-3 text-muted">{emp.employeeId}</td>
                              <td className="py-3 px-3 fw-medium text-dark">{emp.employeeName}</td>
                              <td className="py-3 px-3 text-muted">{emp.designation || 'N/A'}</td>
                              <td className="py-3 px-3">
                                <input 
                                  type="number" 
                                  min="0" 
                                  step="0.5" 
                                  className="form-control text-center mx-auto" 
                                  placeholder="0"
                                  value={lopData[emp._id] !== undefined ? lopData[emp._id] : ''}
                                  onChange={(e) => handleLopChange(emp._id, e.target.value)}
                                  style={{ width: '80px', borderRadius: '4px', padding: '6px' }}
                                />
                              </td>
                            </tr>
                          ))}
                          {filteredEmployees.length === 0 && (
                            <tr><td colSpan="4" className="text-center text-muted py-5">No employees found.</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="modal-footer bg-white border-top py-3 px-4 px-md-5 d-flex justify-content-between align-items-center">
                <span className="text-muted small">
                  {bulkSummary ? '' : `Total ${filteredEmployees.length} active employees selected for processing.`}
                </span>
                <div>
                  {bulkSummary ? (
                    <button type="button" className="btn btn-outline-secondary px-4 fw-medium" onClick={() => setShowBulkModal(false)} style={{ borderRadius: '4px', fontSize: '14px' }}>Close</button>
                  ) : (
                    <>
                      <button type="button" className="btn btn-link text-muted text-decoration-none fw-medium me-3" onClick={() => !bulkGenerating && setShowBulkModal(false)} disabled={bulkGenerating} style={{ fontSize: '14px' }}>Cancel</button>
                      <button type="button" className="btn btn-primary px-4 fw-medium d-inline-flex align-items-center" onClick={onBulkSubmit} disabled={bulkGenerating} style={{ backgroundColor: '#0f62fe', borderColor: '#0f62fe', borderRadius: '4px', fontSize: '14px' }}>
                        {bulkGenerating ? <span className="spinner-border spinner-border-sm me-2"></span> : <Play size={16} className="me-2" />}
                        {bulkGenerating ? 'Processing...' : 'Run Batch'}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payroll;
