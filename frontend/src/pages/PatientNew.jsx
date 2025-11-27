// src/pages/PatientNew.js (or wherever this file lives)
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './css/PatientNew.css';
import httpClient from '../services/httpClient';

function PatientNew() {
  const navigate = useNavigate();
  const location = useLocation();
  const isStaffRoute = location.pathname.startsWith('/staff');

  const [formData, setFormData] = useState({
    nic: '',
    fullName: '',
    gender: '',
    dob: '',
    contactNo: '',
    address: '',
    guardianNic: '',
    guardianName: '',
    height: '',
    weight: '',
    bmi: '',
    bloodPressure: '',
    sugarLevel: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    // Client-side validation
    if (!formData.nic.trim()) {
      setErrorMessage('NIC is required');
      return;
    }
    if (!formData.fullName.trim()) {
      setErrorMessage('Full Name is required');
      return;
    }
    if (!formData.gender) {
      setErrorMessage('Gender is required');
      return;
    }
    if (!formData.dob) {
      setErrorMessage('Date of Birth is required');
      return;
    }
    const contactNo = formData.contactNo.trim();
    if (!contactNo || contactNo.includes('xxxxx')) {
      setErrorMessage('Please enter a valid contact number (not the placeholder)');
      return;
    }
    if (!formData.address.trim()) {
      setErrorMessage('Address is required');
      return;
    }

    // Split fullName → firstName + lastName for backend
    const trimmedName = formData.fullName.trim();
    const nameParts = trimmedName.split(' ').filter(part => part.trim());
    const firstName = nameParts[0] || '';
    // If only one name provided, use "N/A" for lastName, otherwise use the rest
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : 'N/A';

    // Build request body exactly like your backend expects
    // Trim all string values to remove whitespace
    const payload = {
      nic: formData.nic.trim(),
      firstName: firstName.trim() || '',
      lastName: lastName.trim() || '',
      gender: formData.gender.trim(),
      contactNumber: formData.contactNo.trim(),
      dob: formData.dob,
      address: formData.address.trim(),
      // Only include guardian fields if they have values
      ...(formData.guardianNic?.trim() && { guardianNIC: formData.guardianNic.trim() }),
      ...(formData.guardianName?.trim() && { guardianName: formData.guardianName.trim() }),
      // Include health info if provided
      ...(formData.height?.trim() && { height: formData.height.trim() }),
      ...(formData.weight?.trim() && { weight: formData.weight.trim() }),
      ...(formData.bloodPressure?.trim() && { bloodPressure: formData.bloodPressure.trim() }),
      ...(formData.sugarLevel?.trim() && { sugarLevel: formData.sugarLevel.trim() }),
    };

    try {
      setIsSubmitting(true);

      // This uses the same httpClient pattern as your Home page
      const res = await httpClient.post('/fhir/Patient', payload);
      console.log('Create Patient response:', res.data);

      if (!res.data?.success) {
        throw new Error(res.data?.message || 'Failed to create patient');
      }

      const created = res.data.data;
      // created.phn and created.id are available here if you want
      setSuccessMessage('Patient created successfully');

      // Navigate based on route
      if (isStaffRoute) {
        navigate('/staff/patients');
      } else {
        navigate('/doctor/patients');
      }

      // Option 2 (if you later add a details page):
      // navigate(`/doctor/patient/${created.phn}`);
    } catch (err) {
      console.error('Error creating patient:', err);
      console.error('Error response:', err.response?.data);
      console.error('Payload sent:', payload);
      
      const errorMsg = err.response?.data?.message || 
                       err.response?.data?.error || 
                       err.message || 
                       'Something went wrong while creating patient';
      
      // Show missing fields if provided by backend
      if (err.response?.data?.missingFields && Array.isArray(err.response.data.missingFields)) {
        const missingFields = err.response.data.missingFields;
        setErrorMessage(`${errorMsg}. Missing or invalid fields: ${missingFields.join(', ')}`);
      } else {
        setErrorMessage(errorMsg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="patient-new">
      <h2>Patient - New</h2>

      {errorMessage && (
        <div className="alert alert-error">
          {errorMessage}
        </div>
      )}
      {successMessage && (
        <div className="alert alert-success">
          {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Basic details */}
        <div className="form-section">
          <div className="input-group">
            <label>NIC</label>
            <input
              type="text"
              name="nic"
              value={formData.nic}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label>Full Name</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Jane Smith"
              required
            />
          </div>

          <div className="input-group">
            <label>Gender</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              required
            >
              <option value="">Select Gender</option>
              <option value="female">Female</option>
              <option value="male">Male</option>
            </select>
          </div>

          <div className="input-group">
            <label>DOB</label>
            <input
              type="date"
              name="dob"
              value={formData.dob}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label>Contact No</label>
            <input
              type="tel"
              name="contactNo"
              value={formData.contactNo}
              onChange={handleChange}
              placeholder="+9477xxxxxxx"
              required
            />
          </div>

          <div className="input-group">
            <label>Address</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label>Guardian NIC</label>
            <input
              type="text"
              name="guardianNic"
              value={formData.guardianNic}
              onChange={handleChange}
            />
          </div>

          <div className="input-group">
            <label>Guardian Name</label>
            <input
              type="text"
              name="guardianName"
              value={formData.guardianName}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Health info (currently just UI – not sent in payload) */}
        <div className="form-section">
          <h3>General Health Information</h3>

          <div className="input-group">
            <label>Height</label>
            <input
              type="text"
              name="height"
              value={formData.height}
              onChange={handleChange}
              placeholder="cm"
            />
          </div>

          <div className="input-group">
            <label>Weight</label>
            <input
              type="text"
              name="weight"
              value={formData.weight}
              onChange={handleChange}
              placeholder="kg"
            />
          </div>

          <div className="input-group">
            <label>BMI</label>
            <input
              type="text"
              name="bmi"
              value={formData.bmi}
              onChange={handleChange}
            />
          </div>

          <div className="input-group">
            <label>Blood Pressure</label>
            <input
              type="text"
              name="bloodPressure"
              value={formData.bloodPressure}
              onChange={handleChange}
            />
          </div>

          <div className="input-group">
            <label>Sugar Level</label>
            <input
              type="text"
              name="sugarLevel"
              value={formData.sugarLevel}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="form-actions">
          <button
            type="button"
            className="cancel-btn"
            onClick={() => navigate(isStaffRoute ? '/staff/patients' : '/doctor/patients')}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="save-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default PatientNew;
