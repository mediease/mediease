import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { MdEmail, MdPerson, MdLocalHospital, MdPhone, MdBadge, MdVpnKey } from 'react-icons/md';
import httpClient from '../services/httpClient';
import { FaUserMd, FaUserTie, FaIdCard } from 'react-icons/fa';
import logo from '../assets/logo2.png';
import './css/CreateAccount.css';

function CreateAccount() {
  const [searchParams] = useSearchParams();
  const [userType, setUserType] = useState(searchParams.get('type') || 'doctor');
  const [step, setStep] = useState(1);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [termsAgreed, setTermsAgreed] = useState(false);

  const [staffRole, setStaffRole] = useState('nurse'); // nurse | lab_assistant

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    division: '',
    phone: '',
    nic: '',
    medicalLicenseId: '',
    password: '',
    confirmPassword: '',
    staffId: '' // nurId or labId depending on staffRole
  });

  const handleNext = (e) => {
    e.preventDefault();

    // Validate required fields for step 1 (doctor)
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.division ||
      !formData.phone ||
      !formData.nic
    ) {
      setMessage({ type: 'error', text: 'Please fill in all required fields' });
      return;
    }

    setMessage({ type: '', text: '' });
    setStep(2);
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    // Check terms agreement
    if (!termsAgreed) {
      setMessage({
        type: 'error',
        text: 'You must agree to the Terms of Service and Privacy Policy'
      });
      return;
    }

    // Validate required fields based on userType
    if (userType === 'doctor') {
      if (!formData.medicalLicenseId || !formData.password || !formData.confirmPassword) {
        setMessage({ type: 'error', text: 'Please fill in all required fields' });
        return;
      }
    } else if (userType === 'staff') {
      if (
        !formData.firstName ||
        !formData.lastName ||
        !formData.email ||
        !formData.phone ||
        !formData.nic ||
        !formData.password ||
        !formData.confirmPassword ||
        !formData.staffId
      ) {
        setMessage({ type: 'error', text: 'Please fill in all required fields' });
        return;
      }
    }

    // Build request body based on userType
    let requestBody;
    if (userType === 'doctor') {
      requestBody = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        role: 'doctor',
        medicalLicenseId: formData.medicalLicenseId,
        nic: formData.nic,
        division: formData.division
      };
    } else if (userType === 'staff') {
      if (staffRole === 'nurse') {
        // Nurse payload
        requestBody = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          role: 'nurse',
          nurId: formData.staffId,
          nic: formData.nic
        };
      } else if (staffRole === 'lab_assistant') {
        // Lab assistant payload
        requestBody = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          role: 'lab_assistant',
          labId: formData.staffId,
          nic: formData.nic
        };
      }
    }

    try {
      await httpClient.post('/auth/register', requestBody);
      setMessage({ type: 'success', text: 'Account created successfully! Awaiting admin approval.' });
    } catch (error) {
      const msg = error.response?.data?.message || 'Registration failed. Please try again.';
      setMessage({ type: 'error', text: msg });
    }
  };

  const renderStaffForm = () => (
    <form className="create-form" onSubmit={handleSubmit}>
      <div className="back-link-container">
        <Link to="/login" className="back-link">
          ‹ Back to login
        </Link>
      </div>

      <div className="input-row">
        <div className="form-group">
          <label className="form-label">
            <strong>First Name</strong>
          </label>
          <div className="input-with-icon">
            <MdPerson className="input-icon" />
            <input
              type="text"
              placeholder="First Name"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              required
            />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">
            <strong>Last Name</strong>
          </label>
          <div className="input-with-icon">
            <MdPerson className="input-icon" />
            <input
              type="text"
              placeholder="Last Name"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              required
            />
          </div>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">
          <strong>Email Address</strong>
        </label>
        <div className="input-with-icon">
          <MdEmail className="input-icon" />
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">
          <strong>Phone Number</strong>
        </label>
        <div className="input-with-icon">
          <MdPhone className="input-icon" />
          <input
            type="tel"
            placeholder="Phone Number"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">
          <strong>NIC</strong>
        </label>
        <div className="input-with-icon">
          <MdBadge className="input-icon" />
          <input
            type="text"
            placeholder="NIC"
            value={formData.nic}
            onChange={(e) => setFormData({ ...formData, nic: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">
          <strong>Role</strong>
        </label>
        <div className="input-with-icon">
          <FaUserTie className="input-icon" />
          <select
            value={staffRole}
            onChange={(e) => {
              setStaffRole(e.target.value);
              // Clear staffId when changing role to avoid mixing IDs
              setFormData({ ...formData, staffId: '' });
            }}
            required
          >
            <option value="nurse">Nurse</option>
            <option value="lab_assistant">Lab Assistant</option>
          </select>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">
          <strong>{staffRole === 'nurse' ? 'Nurse ID (nurId)' : 'Lab Assistant ID (labId)'}</strong>
        </label>
        <div className="input-with-icon">
          <FaIdCard className="input-icon" />
          <input
            type="text"
            placeholder={staffRole === 'nurse' ? 'Nurse ID' : 'Lab Assistant ID'}
            value={formData.staffId}
            onChange={(e) => setFormData({ ...formData, staffId: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">
          <strong>Password</strong>
        </label>
        <div className="input-with-icon">
          <MdVpnKey className="input-icon" />
          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">
          <strong>Confirm Password</strong>
        </label>
        <div className="input-with-icon">
          <MdVpnKey className="input-icon" />
          <input
            type="password"
            placeholder="Re-Enter Password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="terms-checkbox">
        <input
          type="checkbox"
          id="terms-staff"
          checked={termsAgreed}
          onChange={(e) => setTermsAgreed(e.target.checked)}
        />
        <label htmlFor="terms-staff">
          I agree to the Terms of Service and Privacy Policy
        </label>
      </div>

      <button type="submit" className="next-button">
        Create an Account
      </button>
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

        {message.text && (
          <div
            style={{
              padding: '10px 15px',
              marginBottom: '15px',
              borderRadius: '5px',
              backgroundColor: message.type === 'success' ? '#d4edda' : '#f8d7da',
              color: message.type === 'success' ? '#155724' : '#721c24',
              border: `1px solid ${
                message.type === 'success' ? '#c3e6cb' : '#f5c6cb'
              }`,
              textAlign: 'center'
            }}
          >
            {message.text}
          </div>
        )}

        <div className="user-types">
          <div
            className={`user-type ${userType === 'doctor' ? 'active' : ''}`}
            onClick={() => {
              setUserType('doctor');
              setStep(1);
              setTermsAgreed(false);
              setMessage({ type: '', text: '' });
            }}
          >
            <FaUserMd className="user-type-icon" />
            <div className="user-type-label">Doctor</div>
          </div>
          <div
            className={`user-type ${userType === 'staff' ? 'active' : ''}`}
            onClick={() => {
              setUserType('staff');
              setStep(1);
              setTermsAgreed(false);
              setMessage({ type: '', text: '' });
            }}
          >
            <FaUserTie className="user-type-icon" />
            <div className="user-type-label">Staff</div>
          </div>
        </div>

        {userType === 'staff' ? (
          renderStaffForm()
        ) : step === 1 ? (
          <form className="create-form">
            <div className="back-link-container">
              <Link to="/login" className="back-link">
                ‹ Back to login
              </Link>
            </div>

            <div className="input-row">
              <div className="form-group">
                <label className="form-label">
                  <strong>First Name</strong>
                </label>
                <div className="input-with-icon">
                  <MdPerson className="input-icon" />
                  <input
                    type="text"
                    placeholder="First Name"
                    value={formData.firstName}
                    onChange={(e) =>
                      setFormData({ ...formData, firstName: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">
                  <strong>Last Name</strong>
                </label>
                <div className="input-with-icon">
                  <MdPerson className="input-icon" />
                  <input
                    type="text"
                    placeholder="Last Name"
                    value={formData.lastName}
                    onChange={(e) =>
                      setFormData({ ...formData, lastName: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                <strong>Email Address</strong>
              </label>
              <div className="input-with-icon">
                <MdEmail className="input-icon" />
                <input
                  type="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                <strong>Division</strong>
              </label>
              <div className="input-with-icon">
                <MdLocalHospital className="input-icon" />
                <input
                  type="text"
                  placeholder="Your Hospital division"
                  value={formData.division}
                  onChange={(e) =>
                    setFormData({ ...formData, division: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                <strong>Phone Number</strong>
              </label>
              <div className="input-with-icon">
                <MdPhone className="input-icon" />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                <strong>NIC</strong>
              </label>
              <div className="input-with-icon">
                <MdBadge className="input-icon" />
                <input
                  type="text"
                  placeholder="NIC"
                  value={formData.nic}
                  onChange={(e) =>
                    setFormData({ ...formData, nic: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <button type="button" className="next-button" onClick={handleNext}>
              Next
            </button>
          </form>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="back-link-container">
              <span className="back-link" onClick={handleBack}>
                ‹ Back
              </span>
            </div>

            <div className="form-group">
              <label className="form-label">
                <strong>Medical License ID</strong>
              </label>
              <div className="input-with-icon">
                <FaIdCard className="input-icon" />
                <input
                  type="text"
                  placeholder="Medical License ID"
                  value={formData.medicalLicenseId}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      medicalLicenseId: e.target.value
                    })
                  }
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                <strong>Password</strong>
              </label>
              <div className="input-with-icon">
                <MdVpnKey className="input-icon" />
                <input
                  type="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                <strong>Confirm Password</strong>
              </label>
              <div className="input-with-icon">
                <MdVpnKey className="input-icon" />
                <input
                  type="password"
                  placeholder="Re-Enter Password"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confirmPassword: e.target.value
                    })
                  }
                  required
                />
              </div>
            </div>

            <div className="terms-checkbox">
              <input
                type="checkbox"
                id="terms-doctor"
                checked={termsAgreed}
                onChange={(e) => setTermsAgreed(e.target.checked)}
              />
              <label htmlFor="terms-doctor">
                I agree to the Terms of Service and Privacy Policy
              </label>
            </div>

            <button type="submit" className="next-button">
              Create an Account
            </button>
            <div className="support-text">
              Having Trouble to login? <a href="#" className="link">Contact Support</a>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default CreateAccount;
