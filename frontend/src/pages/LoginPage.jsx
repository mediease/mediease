import React, { useState } from 'react';
import { MdEmail, MdLock, MdAdminPanelSettings } from 'react-icons/md';
import { FaUserMd, FaUserTie } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom'; // 👈 import useNavigate
import './css/LoginPage.css';
import logo from '../assets/logo2.png';

function LoginPage() {
  const [userType, setUserType] = useState('doctor');
  const navigate = useNavigate(); // 👈 useNavigate hook

  const handleSubmit = (e) => {
    e.preventDefault(); // prevent default form submission
    // You can add login logic here (authentication, validation, etc.)

    // Navigate based on user type
    if (userType === 'doctor') {
      navigate('/doctor');
    } else if (userType === 'admin') {
      navigate('/admin');
    } else if (userType === 'staff') {
      navigate('/staff');
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

        <form onSubmit={handleSubmit}> {/* 👈 attach handler here */}
          <div className="form-group">
            <label className="form-label"><strong>Email Address</strong></label>
            <div className="input-with-icon">
              <MdEmail className="input-icon" />
              <input type="email" placeholder="Enter your email" required />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label"><strong>Password</strong></label>
            <div className="input-with-icon">
              <MdLock className="input-icon" />
              <input type="password" placeholder="Enter your password" required />
            </div>
          </div>

          <div className="remember-forgot">
            <label className="remember-me">
              <input type="checkbox" /> Remember me
            </label>
            <a href="#" className="link">Forgot Password?</a>
          </div>

          <button type="submit" className="signin-button">Sign in</button>
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
