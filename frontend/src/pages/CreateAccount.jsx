import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { MdEmail, MdPerson, MdLocalHospital, MdPhone, MdBadge, MdVpnKey } from 'react-icons/md';
import { FaUserMd, FaUserTie, FaIdCard } from 'react-icons/fa';
import logo from '../assets/logo2.png';
import './css/CreateAccount.css';

function CreateAccount() {
  const [searchParams] = useSearchParams();
  const [userType, setUserType] = useState(searchParams.get('type') || 'doctor');
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    division: '',
    phone: '',
    nic: '',
    medicalLicenseId: '',
    password: '',
    confirmPassword: ''
  });

  const handleNext = (e) => {
    e.preventDefault();
    setStep(2);
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
  };

  const renderStaffForm = () => (
    <form className="create-form">
      <div className="back-link-container">
        <Link to="/login" className="back-link">
          ‹ Back to login
        </Link>
      </div>

      <div className="input-row">
        <div className="form-group">
          <label className="form-label"><strong>First Name</strong></label>
          <div className="input-with-icon">
            <MdPerson className="input-icon" />
            <input 
              type="text" 
              placeholder="First Name" 
              value={formData.firstName}
              onChange={(e) => setFormData({...formData, firstName: e.target.value})}
            />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label"><strong>Last Name</strong></label>
          <div className="input-with-icon">
            <MdPerson className="input-icon" />
            <input 
              type="text" 
              placeholder="Last Name" 
              value={formData.lastName}
              onChange={(e) => setFormData({...formData, lastName: e.target.value})}
            />
          </div>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label"><strong>Email Address</strong></label>
        <div className="input-with-icon">
          <MdEmail className="input-icon" />
          <input 
            type="email" 
            placeholder="Email" 
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label"><strong>Phone Number</strong></label>
        <div className="input-with-icon">
          <MdPhone className="input-icon" />
          <input 
            type="tel" 
            placeholder="Phone Number" 
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label"><strong>Password</strong></label>
        <div className="input-with-icon">
          <MdVpnKey className="input-icon" />
          <input 
            type="password" 
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label"><strong>Confirm Password</strong></label>
        <div className="input-with-icon">
          <MdVpnKey className="input-icon" />
          <input 
            type="password" 
            placeholder="Re-Enter Password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
          />
        </div>
      </div>

      <div className="terms-checkbox">
        <input type="checkbox" id="terms" />
        <label htmlFor="terms">I agree to the Terms of Service and Privacy Policy</label>
      </div>

      <button type="submit" className="next-button">Create an Account</button>
      <div className="support-text">
        Having Trouble to login? <a href="#" className="link">Contact Support</a>
      </div>
    </form>
  );

  return (
    <div className="container">
      <div className="create-card">
        <div className="header-center">
          <img src={logo} alt="MediEase Logo" className="logo" />
          <h1 className="brand-name">MediEase EHR</h1>
        </div>
        <h2 className="subtitle">Create New Account</h2>

        <div className="user-types">
          <div className={`user-type ${userType === 'doctor' ? 'active' : ''}`} onClick={() => setUserType('doctor')}>
            <FaUserMd className="user-type-icon" />
            <div className="user-type-label">Doctor</div>
          </div>
          <div className={`user-type ${userType === 'staff' ? 'active' : ''}`} onClick={() => setUserType('staff')}>
            <FaUserTie className="user-type-icon" />
            <div className="user-type-label">Staff</div>
          </div>
        </div>

        {userType === 'staff' ? (
          renderStaffForm()
        ) : (
          step === 1 ? (
            <form className="create-form">
              <div className="back-link-container">
                <Link to="/login" className="back-link">
                  ‹ Back to login
                </Link>
              </div>

              <div className="input-row">
                <div className="form-group">
                  <label className="form-label"><strong>First Name</strong></label>
                  <div className="input-with-icon">
                    <MdPerson className="input-icon" />
                    <input 
                      type="text" 
                      placeholder="First Name" 
                      value={formData.firstName}
                      onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label"><strong>Last Name</strong></label>
                  <div className="input-with-icon">
                    <MdPerson className="input-icon" />
                    <input 
                      type="text" 
                      placeholder="Last Name" 
                      value={formData.lastName}
                      onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label"><strong>Email Address</strong></label>
                <div className="input-with-icon">
                  <MdEmail className="input-icon" />
                  <input 
                    type="email" 
                    placeholder="Email Address" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label"><strong>Division</strong></label>
                <div className="input-with-icon">
                  <MdLocalHospital className="input-icon" />
                  <input 
                    type="text" 
                    placeholder="Your Hospital division" 
                    value={formData.division}
                    onChange={(e) => setFormData({...formData, division: e.target.value})}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label"><strong>Phone Number</strong></label>
                <div className="input-with-icon">
                  <MdPhone className="input-icon" />
                  <input 
                    type="tel" 
                    placeholder="Phone Number" 
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label"><strong>NIC</strong></label>
                <div className="input-with-icon">
                  <MdBadge className="input-icon" />
                  <input 
                    type="text" 
                    placeholder="NIC" 
                    value={formData.nic}
                    onChange={(e) => setFormData({...formData, nic: e.target.value})}
                  />
                </div>
              </div>

              <button type="button" className="next-button" onClick={handleNext}>Next</button>
            </form>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="back-link-container">
                <span className="back-link" onClick={handleBack}>
                  ‹ Back
                </span>
              </div>

              <div className="form-group">
                <label className="form-label"><strong>Medical License ID</strong></label>
                <div className="input-with-icon">
                  <FaIdCard className="input-icon" />
                  <input 
                    type="text" 
                    placeholder="Medical License ID" 
                    value={formData.medicalLicenseId}
                    onChange={(e) => setFormData({...formData, medicalLicenseId: e.target.value})}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label"><strong>Password</strong></label>
                <div className="input-with-icon">
                  <MdVpnKey className="input-icon" />
                  <input 
                    type="password" 
                    placeholder="Password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label"><strong>Confirm Password</strong></label>
                <div className="input-with-icon">
                  <MdVpnKey className="input-icon" />
                  <input 
                    type="password" 
                    placeholder="Re-Enter Password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  />
                </div>
              </div>

              <div className="terms-checkbox">
                <input type="checkbox" id="terms" />
                <label htmlFor="terms">I agree to the Terms of Service and Privacy Policy</label>
              </div>

              <button type="submit" className="next-button">Create an Account</button>
              <div className="support-text">
                Having Trouble to login? <a href="#" className="link">Contact Support</a>
              </div>
            </form>
          )
        )}
      </div>
    </div>
  );
}

export default CreateAccount;
