// src/pages/Settings.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaUser, 
  FaBell, 
  FaShieldAlt, 
  FaBox,
  FaEnvelope,
  FaSignOutAlt
} from 'react-icons/fa';
import './css/Settings.css';

const Settings = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('Account');

  const handleLogout = () => {
    // Handle logout logic here
    navigate('/login');
  };

  const handleEditProfile = () => {
    // Handle edit profile logic here
    console.log('Edit profile clicked');
  };

  const menuItems = [
    { id: 'Account', label: 'Account', icon: <FaUser /> },
    { id: 'Notification', label: 'Notification', icon: <FaBell /> },
    { id: 'Security', label: 'Security', icon: <FaShieldAlt /> },
    { id: 'Data', label: 'Data', icon: <FaBox /> },
  ];

  return (
    <div className="settings-page">
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
