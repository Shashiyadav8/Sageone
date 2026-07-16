import React, { useState } from 'react';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { Settings as SettingsIcon, Shield } from 'lucide-react';

const Settings = () => {
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const password = watch('password');

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setMessage('');
      
      const userStr = localStorage.getItem('user');
      if (!userStr) return;
      
      const employee = JSON.parse(userStr);
      const token = localStorage.getItem('token');
      
      await axios.put(`${import.meta.env.VITE_API_URL}/employees/${employee._id}`, 
        { password: data.password },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setMessage('Password updated successfully!');
      reset();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid py-4 px-3 px-md-5" style={{ backgroundColor: '#f9f9fb', minHeight: '100vh', fontFamily: '"Inter", "Segoe UI", sans-serif' }}>
      
      {/* Header Section */}
      <div className="mb-4 pb-3 border-bottom">
        <h3 className="fw-bold mb-1" style={{ color: '#1e293b', letterSpacing: '-0.5px' }}>Account Settings</h3>
        <p className="text-muted mb-0 small">Manage your security preferences and profile settings.</p>
      </div>

      <div className="row">
        <div className="col-lg-5 col-md-8">
          <div className="card border-0 shadow-sm rounded-3" style={{ backgroundColor: '#ffffff' }}>
            <div className="card-header bg-white border-bottom py-3 px-4 d-flex align-items-center">
              <Shield size={18} style={{ color: '#0f62fe' }} className="me-2" />
              <h6 className="mb-0 fw-semibold" style={{ color: '#334155' }}>Security Settings</h6>
            </div>
            
            <div className="card-body p-4">
              {message && (
                <div className={`alert ${message.includes('success') ? 'alert-success border-success text-success' : 'alert-danger border-danger text-danger'} p-2 d-flex align-items-center`} style={{ fontSize: '13px', borderRadius: '4px', backgroundColor: message.includes('success') ? '#f0fdf4' : '#fef2f2' }}>
                  {message}
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="mb-3">
                  <label className="form-label text-muted fw-semibold mb-2" style={{ fontSize: '12px', textTransform: 'uppercase' }}>New Password</label>
                  <input 
                    type="password" 
                    className="form-control"
                    {...register('password', { 
                      required: 'Password is required',
                      minLength: { value: 6, message: 'Password must be at least 6 characters' }
                    })}
                    style={{ borderRadius: '4px', fontSize: '14px', padding: '10px 12px' }}
                  />
                  {errors.password && <small className="text-danger mt-1 d-block" style={{ fontSize: '12px' }}>{errors.password.message}</small>}
                </div>

                <div className="mb-4">
                  <label className="form-label text-muted fw-semibold mb-2" style={{ fontSize: '12px', textTransform: 'uppercase' }}>Confirm New Password</label>
                  <input 
                    type="password" 
                    className="form-control"
                    {...register('confirmPassword', { 
                      required: 'Please confirm your password',
                      validate: value => value === password || 'Passwords do not match'
                    })}
                    style={{ borderRadius: '4px', fontSize: '14px', padding: '10px 12px' }}
                  />
                  {errors.confirmPassword && <small className="text-danger mt-1 d-block" style={{ fontSize: '12px' }}>{errors.confirmPassword.message}</small>}
                </div>

                <button type="submit" className="btn btn-primary w-100 fw-medium" disabled={loading} style={{ backgroundColor: '#0f62fe', borderColor: '#0f62fe', borderRadius: '4px', padding: '10px 0', fontSize: '14px' }}>
                  {loading ? (
                    <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Updating...</>
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

export default Settings;
