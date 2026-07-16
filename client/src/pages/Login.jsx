import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/sagepath_navbar.png';
import loginBg from '../assets/login_bg.png';

const Login = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setErrorMsg('');
      
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/login`, data);
      
      const { token, role, ...userData } = response.data;
      
      // Store auth data
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('role', role);

      // Redirect based on role returned from backend
      if (role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/employee/dashboard');
      }
    } catch (error) {
      setErrorMsg(error.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid p-0 vh-100" style={{ backgroundColor: '#ffffff', fontFamily: '"Inter", "Segoe UI", sans-serif' }}>
      <div className="row g-0 h-100">
        {/* Left Side - Image (Hidden on mobile) */}
        <div className="col-lg-6 d-none d-lg-block position-relative h-100">
          <div className="position-absolute w-100 h-100" style={{ 
            backgroundImage: `url(${loginBg})`, 
            backgroundSize: 'cover', 
            backgroundPosition: 'center' 
          }}>
            <div className="position-absolute w-100 h-100" style={{ backgroundColor: 'rgba(15, 23, 42, 0.4)' }}></div>
          </div>
          <div className="position-absolute p-5 w-100 d-flex flex-column justify-content-end h-100" style={{ zIndex: 1, paddingBottom: '10%' }}>
            <h1 className="text-white fw-bold mb-3 display-5" style={{ letterSpacing: '-1px' }}>Elevate Your Workforce.</h1>
            <p className="text-white opacity-75 fs-5">Seamless payroll and employee management tailored for enterprise scale.</p>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="col-12 col-lg-6 d-flex align-items-center justify-content-center h-100" style={{ backgroundColor: '#ffffff' }}>
          <div className="w-100 p-4 p-md-5" style={{ maxWidth: '480px' }}>
            <div className="text-center mb-5">
              <img src={logo} alt="SagePath" style={{ maxWidth: '200px', height: 'auto' }} className="mb-4" />
              <h3 className="fw-bold" style={{ color: '#0f172a', letterSpacing: '-0.5px' }}>Sign in to your account</h3>
              <p className="text-muted" style={{ fontSize: '15px' }}>Welcome back! Please enter your details.</p>
            </div>

            {errorMsg && (
              <div className="alert alert-danger p-3 mb-4 d-flex align-items-center" style={{ fontSize: '14px', borderRadius: '6px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-exclamation-circle-fill me-2 flex-shrink-0" viewBox="0 0 16 16">
                  <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8 4a.905.905 0 0 0-.9.995l.35 3.507a.552.552 0 0 0 1.1 0l.35-3.507A.905.905 0 0 0 8 4zm.002 6a1 1 0 1 0 0 2 1 1 0 0 0 0-2z"/>
                </svg>
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="mb-4">
                <label className="form-label fw-semibold" style={{ fontSize: '13px', color: '#475569' }}>Email or Employee ID</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Enter your email or ID"
                  {...register('email', { required: 'This field is required' })}
                  style={{ borderRadius: '6px', fontSize: '15px', padding: '12px 16px', border: '1px solid #cbd5e1' }}
                />
                {errors.email && <small className="text-danger mt-1 d-block" style={{ fontSize: '13px' }}>{errors.email.message}</small>}
              </div>

              <div className="mb-5">
                <label className="form-label fw-semibold" style={{ fontSize: '13px', color: '#475569' }}>Password</label>
                <input 
                  type="password" 
                  className="form-control" 
                  placeholder="••••••••"
                  {...register('password', { required: 'Password is required' })}
                  style={{ borderRadius: '6px', fontSize: '15px', padding: '12px 16px', border: '1px solid #cbd5e1' }}
                />
                {errors.password && <small className="text-danger mt-1 d-block" style={{ fontSize: '13px' }}>{errors.password.message}</small>}
              </div>

              <button 
                type="submit" 
                className="btn btn-primary w-100 d-flex justify-content-center align-items-center fw-medium shadow-sm"
                disabled={loading}
                style={{ backgroundColor: '#0f62fe', borderColor: '#0f62fe', borderRadius: '6px', padding: '12px 0', fontSize: '15px' }}
              >
                {loading ? <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> : null}
                {loading ? 'Authenticating...' : 'Sign In'}
              </button>
            </form>
            
            <div className="text-center mt-4">
              <p className="text-muted small">© {new Date().getFullYear()} SagePath Labs. All rights reserved.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
