import React, { useState } from 'react';
import axios from 'axios';
import { Shield } from 'lucide-react';

const AdminSettings = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    if (form.newPassword !== form.confirmPassword) {
      return setMessage('New passwords do not match');
    }
    if (form.newPassword.length < 6) {
      return setMessage('New password must be at least 6 characters');
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      await axios.put(
        `${import.meta.env.VITE_API_URL}/auth/change-password`,
        { currentPassword: form.currentPassword, newPassword: form.newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage('success: Password updated successfully!');
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const isSuccess = message.startsWith('success:');
  const displayMessage = isSuccess ? message.replace('success: ', '') : message;

  return (
    <div className="container-fluid py-4 px-3 px-md-5">
      <div className="mb-4 pb-3 border-bottom">
        <h3 className="fw-bold mb-1" style={{ color: '#1e293b', letterSpacing: '-0.5px' }}>Account Settings</h3>
        <p className="text-muted mb-0 small">Manage your admin account security preferences.</p>
      </div>

      <div className="row">
        <div className="col-lg-5 col-md-8">
          <div className="glass-card">
            <div className="card-header bg-transparent-glass border-bottom py-3 px-4 d-flex align-items-center">
              <Shield size={18} style={{ color: '#0f62fe' }} className="me-2" />
              <h6 className="mb-0 fw-semibold" style={{ color: '#334155' }}>Change Password</h6>
            </div>

            <div className="card-body p-4">
              {message && (
                <div
                  className={`alert p-2 d-flex align-items-center ${isSuccess ? 'alert-success border-success text-success' : 'alert-danger border-danger text-danger'}`}
                  style={{ fontSize: '13px', borderRadius: '4px', backgroundColor: isSuccess ? '#f0fdf4' : '#fef2f2' }}
                >
                  {displayMessage}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label text-muted fw-semibold mb-2" style={{ fontSize: '12px', textTransform: 'uppercase' }}>
                    Current Password
                  </label>
                  <input
                    type="password"
                    name="currentPassword"
                    className="form-control"
                    value={form.currentPassword}
                    onChange={handleChange}
                    required
                    style={{ borderRadius: '4px', fontSize: '14px', padding: '10px 12px' }}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label text-muted fw-semibold mb-2" style={{ fontSize: '12px', textTransform: 'uppercase' }}>
                    New Password
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    className="form-control"
                    value={form.newPassword}
                    onChange={handleChange}
                    required
                    style={{ borderRadius: '4px', fontSize: '14px', padding: '10px 12px' }}
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label text-muted fw-semibold mb-2" style={{ fontSize: '12px', textTransform: 'uppercase' }}>
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    className="form-control"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    required
                    style={{ borderRadius: '4px', fontSize: '14px', padding: '10px 12px' }}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-100 fw-medium"
                  disabled={loading}
                  style={{ backgroundColor: '#0f62fe', borderColor: '#0f62fe', borderRadius: '4px', padding: '10px 0', fontSize: '14px' }}
                >
                  {loading ? (
                    <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Updating...</>
                  ) : 'Update Password'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
