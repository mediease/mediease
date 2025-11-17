// src/pages/Settings.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaUser, 
  FaBell, 
  FaShieldAlt, 
  FaBox,
  FaEnvelope,
  FaSignOutAlt,
  FaPencilAlt,
  FaLock
} from 'react-icons/fa';
import './css/Settings.css';

const Settings = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('Account');
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: 'dr.smith@hospital.com'
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isPasswordUpdated, setIsPasswordUpdated] = useState(false);

  const handleLogout = () => {
    // Handle logout logic here
    navigate('/login');
  };

  const handleEditProfile = () => {
    setIsEditProfileOpen(true);
  };

  const handleCloseEditProfile = () => {
    setIsEditProfileOpen(false);
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdatePassword = (e) => {
    e.preventDefault();
    // Handle password update logic here
    console.log('Password update:', passwordData);
    // Reset password fields after update
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setIsPasswordUpdated(true);
  };

  useEffect(() => {
    if (!isPasswordUpdated) return;

    const timer = setTimeout(() => setIsPasswordUpdated(false), 3000);
    return () => clearTimeout(timer);
  }, [isPasswordUpdated]);

  const menuItems = [
    { id: 'Account', label: 'Account', icon: <FaUser /> },
    { id: 'Notification', label: 'Notification', icon: <FaBell /> },
    { id: 'Security', label: 'Security', icon: <FaShieldAlt /> },
    { id: 'Data', label: 'Data', icon: <FaBox /> },
  ];

  return (
    <div className="settings-page">
      {isPasswordUpdated && (
        <div className="password-success-overlay">
          <div className="password-success-card">
            <p className="password-success-message">Password has been updated.</p>
          </div>
        </div>
      )}
      <h1 className="settings-title">Settings</h1>
      
      <div className="settings-container">
        {/* Left Navigation Sidebar */}
        <div className="settings-sidebar">
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={`settings-nav-item ${activeSection === item.id ? 'active' : ''}`}
              onClick={() => setActiveSection(item.id)}
            >
              <span className="settings-nav-icon">{item.icon}</span>
              <span className="settings-nav-label">{item.label}</span>
            </button>
          ))}
        </div>

        {/* Right Content Area */}
        <div className="settings-content">
          {activeSection === 'Account' && (
            <div className="settings-section">
              {!isEditProfileOpen ? (
                <>
                  <h2 className="settings-section-title">Account Settings</h2>
                  
                  {/* Profile Information */}
                  <div className="settings-info-block">
                    <div className="settings-info-header">
                      <FaUser className="settings-info-icon" />
                      <h3 className="settings-info-title">Profile Information</h3>
                    </div>
                    <p className="settings-info-description">
                      Update your name, email, and profile picture
                    </p>
                    <div className="settings-divider"></div>
                  </div>

                  {/* Email Address */}
                  <div className="settings-info-block">
                    <div className="settings-info-header">
                      <FaEnvelope className="settings-info-icon" />
                      <h3 className="settings-info-title">Email Address</h3>
                    </div>
                    <p className="settings-email-text">
                      Your current email: <span className="settings-email-value">dr.smith@hospital.com</span>
                    </p>
                    <div className="settings-divider"></div>
                  </div>

                  {/* Action Buttons */}
                  <div className="settings-actions">
                    <button 
                      className="settings-edit-btn"
                      onClick={handleEditProfile}
                    >
                      Edit Profile →
                    </button>
                    <button 
                      className="settings-logout-btn"
                      onClick={handleLogout}
                    >
                      <FaSignOutAlt className="settings-logout-icon" />
                      Logout
                    </button>
                  </div>
                </>
              ) : (
                <div className="edit-profile-container">
                  {/* Edit Profile Section */}
                  <div className="edit-profile-section">
                    <div className="edit-profile-header">
                      <FaPencilAlt className="edit-profile-icon" />
                      <h3 className="edit-profile-title">Edit Profile</h3>
                    </div>
                    
                    <div className="edit-profile-form">
                      <div className="form-group">
                        <label className="form-label">First Name</label>
                        <div className="input-wrapper">
                          <FaUser className="input-icon" />
                          <input
                            type="text"
                            name="firstName"
                            className="form-input"
                            placeholder=" Enter First Name"
                            value={profileData. firstName}
                            onChange={handleProfileChange}
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Last Name</label>
                        <div className="input-wrapper no-icon">
                          <input
                            type="text"
                            name="lastName"
                            className="form-input"
                            placeholder="Last Name"
                            value={profileData.lastName}
                            onChange={handleProfileChange}
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <div className="input-wrapper">
                          <FaEnvelope className="input-icon" />
                          <input
                            type="email"
                            name="email"
                            className="form-input"
                            placeholder="Email"
                            value={profileData.email}
                            onChange={handleProfileChange}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Change Password Section */}
                  <div className="change-password-section">
                    <div className="change-password-header">
                      <FaLock className="change-password-icon" />
                      <h3 className="change-password-title">Change Password</h3>
                    </div>
                    
                    <form className="change-password-form" onSubmit={handleUpdatePassword}>
                      <div className="form-group">
                        <label className="form-label">Current Password</label>
                        <div className="input-wrapper">
                          <FaLock className="input-icon" />
                          <input
                            type="password"
                            name="currentPassword"
                            className="form-input"
                            placeholder="Password"
                            value={passwordData.currentPassword}
                            onChange={handlePasswordChange}
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="form-label">New Password</label>
                        <div className="input-wrapper">
                          <FaLock className="input-icon" />
                          <input
                            type="password"
                            name="newPassword"
                            className="form-input"
                            placeholder="Re-Enter Password"
                            value={passwordData.newPassword}
                            onChange={handlePasswordChange}
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Confirm Password</label>
                        <div className="input-wrapper">
                          <FaLock className="input-icon" />
                          <input
                            type="password"
                            name="confirmPassword"
                            className="form-input"
                            placeholder="Password"
                            value={passwordData.confirmPassword}
                            onChange={handlePasswordChange}
                          />
                        </div>
                      </div>

                      <button type="submit" className="update-password-btn">
                        Update Password
                      </button>
                    </form>
                  </div>

                  {/* Back Button */}
                  <button 
                    className="back-to-settings-btn"
                    onClick={handleCloseEditProfile}
                  >
                    ← Back to Settings
                  </button>
                </div>
              )}
            </div>
          )}

          {activeSection === 'Notification' && (
            <div className="settings-section">
              <h2 className="settings-section-title">Notification Settings</h2>
              <p className="settings-placeholder">Notification settings content will go here</p>
            </div>
          )}

          {activeSection === 'Security' && (
            <div className="settings-section">
              <h2 className="settings-section-title">Security Settings</h2>
              <p className="settings-placeholder">Security settings content will go here</p>
            </div>
          )}

          {activeSection === 'Data' && (
            <div className="settings-section">
              <h2 className="settings-section-title">Data Settings</h2>
              <p className="settings-placeholder">Data settings content will go here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
