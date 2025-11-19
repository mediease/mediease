import React, { useState } from 'react';
import { MdEmail, MdLock, MdAdminPanelSettings } from 'react-icons/md';
import { FaUserMd, FaUserTie } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import httpClient from '../services/httpClient';
import './css/LoginPage.css';
import logo from '../assets/logo2.png';

function LoginPage() {
  const [userType, setUserType] = useState('doctor');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await httpClient.post('/auth/login', {
        email,
        password,
        role: userType,
      });
      console.log('Login response raw:', response.data);

      // Save token & role
      const token = response.data?.token || response.data?.accessToken || response.data?.jwt || response.data?.data?.token;
      if (token) {
        localStorage.setItem('authToken', token);
      } else {
        console.warn('No token field found in login response');
      }
      localStorage.setItem('userRole', userType);

      // Extract doctor related info from various possible response shapes
      const userPayload = response.data?.user || response.data?.data?.user || response.data?.data || response.data;
      const meta = userPayload?.metadata || response.data?.metadata || response.data?.data?.metadata || {};
      const medicalLicenseId = userPayload?.medicalLicenseId || meta?.medicalLicenseId || response.data?.medicalLicenseId || 'MED_UNKNOWN';
      const firstName = userPayload?.firstName || meta?.firstName || 'Doctor';
      const lastName = userPayload?.lastName || meta?.lastName || '';

      if (medicalLicenseId) {
        localStorage.setItem('medicalLicenseId', String(medicalLicenseId));
      } else {
        console.warn('medicalLicenseId missing in login response');
      }

      // Only store doctor object if logging in as doctor
      if (userType === 'doctor') {
        const doctorObj = {
          firstName: firstName || 'Doctor',
          lastName: lastName || '',
          medicalLicenseId: medicalLicenseId || 'MED_UNKNOWN',
        };
        localStorage.setItem('doctor', JSON.stringify(doctorObj));
        console.log('Stored doctor object:', doctorObj);
      }

      // Navigate based on user type
      if (userType === 'doctor') {
        navigate('/doctor');
      } else if (userType === 'admin') {
        navigate('/admin');
      } else if (userType === 'staff') {
        navigate('/staff');
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'Login failed. Please check your credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="login-card">
        <img src={logo} alt="MediEase Logo" className="logo" />
        <h1 className="brand-name">MediEase EHR</h1>
        <p className="login-subtitle">Sign in to access your dashboard</p>

        <div className="user-types">
          <div className={`user-type ${userType === 'doctor' ? 'active' : ''}`} onClick={() => setUserType('doctor')}>
            <FaUserMd className="user-type-icon" />
            <div className="user-type-label">Doctor</div>
          </div>
          <div className={`user-type ${userType === 'admin' ? 'active' : ''}`} onClick={() => setUserType('admin')}>
            <MdAdminPanelSettings className="user-type-icon" />
            <div className="user-type-label">Admin</div>
          </div>
          <div className={`user-type ${userType === 'staff' ? 'active' : ''}`} onClick={() => setUserType('staff')}>
            <FaUserTie className="user-type-icon" />
            <div className="user-type-label">Staff</div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div style={{ color: '#dc3545', marginBottom: '15px', padding: '10px', backgroundColor: '#f8d7da', borderRadius: '5px', border: '1px solid #f5c6cb' }}>
              {error}
            </div>
          )}
          <div className="form-group">
            <label className="form-label"><strong>Email Address</strong></label>
            <div className="input-with-icon">
              <MdEmail className="input-icon" />
              <input 
                type="email" 
                placeholder="Enter your email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label"><strong>Password</strong></label>
            <div className="input-with-icon">
              <MdLock className="input-icon" />
              <input 
                type="password" 
                placeholder="Enter your password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
            </div>
          </div>

          <button type="submit" className="signin-button" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        {userType !== 'admin' && (
          <div className="create-account">
            Don't have an account? <Link to={`/create-account?type=${userType}`} className="link">Create new account</Link>
          </div>
        )}

        <div className="support-text">
          Having Trouble to login? <a href="#" className="link">Contact Support</a>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
