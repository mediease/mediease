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
  const [notificationPrefs, setNotificationPrefs] = useState({
    appointments: { push: true, email: true },
    labReports: { push: true, email: true },
    prescriptions: { push: true, email: true }
  });
  const [securityPrefs, setSecurityPrefs] = useState({
    twoFactor: true,
    autoLogout: true
  });
  const [dataPrefs, setDataPrefs] = useState({
    autoBackup: true
  });
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isDeleteScheduledOpen, setIsDeleteScheduledOpen] = useState(false);

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

  const handleToggleNotification = (section, channel) => {
    setNotificationPrefs(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [channel]: !prev[section][channel]
      }
    }));
  };

  const handleSaveNotifications = () => {
    console.log('Notification preferences:', notificationPrefs);
  };

  const handleToggleSecurity = (key) => {
    setSecurityPrefs(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleToggleData = (key) => {
    setDataPrefs(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleExportData = () => {
    console.log('Export data clicked');
  };

  const handleDeleteAccount = () => {
    setIsDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    setIsDeleteConfirmOpen(false);
    setIsDeleteScheduledOpen(true);
    // Here you would also call your delete API
  };

  const handleCancelDelete = () => {
    setIsDeleteConfirmOpen(false);
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
      {isDeleteConfirmOpen && (
        <div className="data-modal-overlay">
          <div className="data-modal-card">
            <p className="data-modal-text">Are you really want to delete you account?</p>
            <div className="data-modal-actions">
              <button
                type="button"
                className="data-modal-yes"
                onClick={handleConfirmDelete}
              >
                Yes
              </button>
              <button
                type="button"
                className="data-modal-no"
                onClick={handleCancelDelete}
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
      {isDeleteScheduledOpen && (
        <div className="data-modal-overlay">
          <div className="data-modal-card">
            <p className="data-modal-text">Your account will delete in 24 hours.</p>
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
            <div className="settings-section notification-section">
              <div className="notification-header">
                <h2 className="notification-title">Notification Preferences</h2>
                <p className="notification-subtitle">
                  Manage how you receive alerts for medication and patient updates
                </p>
              </div>

              <div className="notification-card">
                {/* Appointments */}
                <div className="notification-row-group">
                  <div className="notification-row-header">
                    <span className="notification-row-label">                   </span>
                    <span className="notification-row-caption">Push Notifications</span>
                    <span className="notification-row-caption">Email Notifications</span>
                  </div>
                  <div className="notification-row-body">
                    <span className="notification-row-label">Appointments</span>
                    <div className="notification-toggle-group">
                      <button
                        type="button"
                        className={`notification-toggle ${notificationPrefs.appointments.push ? 'on' : 'off'}`}
                        onClick={() => handleToggleNotification('appointments', 'push')}
                      >
                        <span className="toggle-label-on">On</span>
                        <span className="toggle-label-off">Off</span>
                      </button>
                      <button
                        type="button"
                        className={`notification-toggle ${notificationPrefs.appointments.email ? 'on' : 'off'}`}
                        onClick={() => handleToggleNotification('appointments', 'email')}
                      >
                        <span className="toggle-label-on">On</span>
                        <span className="toggle-label-off">Off</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Lab Reports */}
                <div className="notification-row-group">
                  <div className="notification-row-body">
                    <span className="notification-row-label">Lab Reports</span>
                    <div className="notification-toggle-group">
                      <button
                        type="button"
                        className={`notification-toggle ${notificationPrefs.labReports.push ? 'on' : 'off'}`}
                        onClick={() => handleToggleNotification('labReports', 'push')}
                      >
                        <span className="toggle-label-on">On</span>
                        <span className="toggle-label-off">Off</span>
                      </button>
                      <button
                        type="button"
                        className={`notification-toggle ${notificationPrefs.labReports.email ? 'on' : 'off'}`}
                        onClick={() => handleToggleNotification('labReports', 'email')}
                      >
                        <span className="toggle-label-on">On</span>
                        <span className="toggle-label-off">Off</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Prescriptions */}
                <div className="notification-row-group">
                  <div className="notification-row-body">
                    <span className="notification-row-label">Prescriptions</span>
                    <div className="notification-toggle-group">
                      <button
                        type="button"
                        className={`notification-toggle ${notificationPrefs.prescriptions.push ? 'on' : 'off'}`}
                        onClick={() => handleToggleNotification('prescriptions', 'push')}
                      >
                        <span className="toggle-label-on">On</span>
                        <span className="toggle-label-off">Off</span>
                      </button>
                      <button
                        type="button"
                        className={`notification-toggle ${notificationPrefs.prescriptions.email ? 'on' : 'off'}`}
                        onClick={() => handleToggleNotification('prescriptions', 'email')}
                      >
                        <span className="toggle-label-on">On</span>
                        <span className="toggle-label-off">Off</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="notification-actions">
                  <button type="button" className="notification-cancel-btn">
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="notification-save-btn"
                    onClick={handleSaveNotifications}
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'Security' && (
            <div className="settings-section security-section">
              <div className="security-header">
                <h2 className="security-title">Security &amp; Privacy</h2>
                <p className="security-subtitle">
                  Add an extra layer of protection to your account and manage session security
                </p>
              </div>

              <div className="security-card">
                {/* Two-Factor Authentication */}
                <div className="security-row">
                  <div className="security-row-text">
                    <span className="security-row-title">Two-Factor Authentication</span>
                    <span className="security-row-description">
                      Add an extra layer of security to your account
                    </span>
                  </div>
                  <div className="security-row-toggle">
                    <button
                      type="button"
                      className={`notification-toggle ${securityPrefs.twoFactor ? 'on' : 'off'}`}
                      onClick={() => handleToggleSecurity('twoFactor')}
                    >
                      <span className="toggle-label-on">On</span>
                      <span className="toggle-label-off">Off</span>
                    </button>
                  </div>
                </div>

                {/* Auto Logout */}
                <div className="security-row">
                  <div className="security-row-text">
                    <span className="security-row-title">Auto Logout</span>
                    <span className="security-row-description">
                      Automatically log out after 30 minutes of inactivity
                    </span>
                  </div>
                  <div className="security-row-toggle">
                    <button
                      type="button"
                      className={`notification-toggle ${securityPrefs.autoLogout ? 'on' : 'off'}`}
                      onClick={() => handleToggleSecurity('autoLogout')}
                    >
                      <span className="toggle-label-on">On</span>
                      <span className="toggle-label-off">Off</span>
                    </button>
                    
                  </div>
                </div>

                <p className="security-last-login">
                  Last login: Today at 9:30 AM from Chrome on Windows
                </p>
              </div>
            </div>
          )}

          {activeSection === 'Data' && (
            <div className="settings-section data-section">
              <div className="data-header">
                <h2 className="data-title">Data Management</h2>
                <p className="data-subtitle">
                  Control how your data is backed up, exported, and removed from the system
                </p>
              </div>

              <div className="data-card">
                {/* Automatic Backup */}
                <div className="data-row">
                  <div className="data-row-text">
                    <span className="data-row-title">Automatic Backup</span>
                    <span className="data-row-description">
                      Enable automatic daily backup of your data
                    </span>
                  </div>
                  <div className="data-row-toggle">
                    <button
                      type="button"
                      className={`notification-toggle ${dataPrefs.autoBackup ? 'on' : 'off'}`}
                      onClick={() => handleToggleData('autoBackup')}
                    >
                      <span className="toggle-label-on">On</span>
                      <span className="toggle-label-off">Off</span>
                    </button>
                  </div>
                </div>

                {/* Export Data */}
                <div className="data-row">
                  <div className="data-row-text">
                    <span className="data-row-title">Export Data</span>
                    <span className="data-row-description">
                      Download your patient and medication records
                    </span>
                  </div>
                  <div className="data-row-actions">
                    <button
                      type="button"
                      className="data-export-btn"
                      onClick={handleExportData}
                    >
                      export
                    </button>
                  </div>
                </div>

                {/* Delete Account */}
                <div className="data-row">
                  <div className="data-row-text">
                    <span className="data-row-title">Delete Account</span>
                    <span className="data-row-description">
                      Permanently delete your account from this site
                    </span>
                  </div>
                  <div className="data-row-actions">
                    <button
                      type="button"
                      className="data-delete-btn"
                      onClick={handleDeleteAccount}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
