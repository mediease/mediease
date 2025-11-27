// ======================= STAFF APPOINTMENT CREATION PAGE =======================
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './css/StaffAppointmentNew.css';
import httpClient from '../services/httpClient';

const StaffAppointmentNew = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    patientPhn: '',
    doctorLicense: '',
    nurseId: '',
    roomNo: '',
    type: 'general',
    appointmentDate: new Date().toISOString().slice(0, 16), // Format for datetime-local input
  });

  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Helper function to decode JWT token
  const decodeJWT = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (err) {
      console.error('Error decoding JWT:', err);
      return null;
    }
  };

  // Load nurse ID and available patients/doctors
  useEffect(() => {
    const loadInitialData = async () => {
      // Get nurse ID from JWT token first (most reliable - matches backend check)
      try {
        let nurseIdValue = null;
        
        // 1. Try to get from JWT token (most reliable - this is what backend checks)
        const token = localStorage.getItem('authToken');
        if (token) {
          try {
            const decoded = decodeJWT(token);
            if (decoded && decoded.nurId) {
              nurseIdValue = decoded.nurId;
              console.log('Nurse ID from JWT token:', nurseIdValue);
            }
          } catch (err) {
            console.warn('Could not decode JWT token:', err);
          }
        }
        
        // 2. Fallback to localStorage if JWT doesn't have it
        if (!nurseIdValue) {
          const nurseRaw = localStorage.getItem('nurse');
          if (nurseRaw) {
            try {
              const nurse = JSON.parse(nurseRaw);
              if (nurse && nurse.nurId) {
                nurseIdValue = nurse.nurId;
              }
            } catch (e) {
              console.warn('Error parsing nurse object:', e);
            }
          }
        }
        
        // 3. Try direct nurId from localStorage
        if (!nurseIdValue) {
          const nurId = localStorage.getItem('nurId');
          if (nurId && nurId !== 'NUR_UNKNOWN') {
            nurseIdValue = nurId;
          }
        }
        
        // 4. Try from staff object (if exists)
        if (!nurseIdValue) {
          const raw = localStorage.getItem('staff');
          if (raw) {
            try {
              const staff = JSON.parse(raw);
              if (staff && staff.nurId) {
                nurseIdValue = staff.nurId;
              }
            } catch (e) {
              console.warn('Error parsing staff object:', e);
            }
          }
        }

        // Set nurse ID - use exact value from JWT/localStorage (no formatting)
        if (nurseIdValue) {
          const nurIdStr = String(nurseIdValue).trim();
          setFormData(prev => ({ ...prev, nurseId: nurIdStr }));
          console.log('Nurse ID auto-filled:', nurIdStr);
        } else {
          console.warn('Nurse ID not found in localStorage or JWT token');
        }
      } catch (err) {
        console.error('Error loading nurse ID:', err);
        setErrorMessage('Error loading nurse ID. Please log in again.');
      }

      // Load patients
      try {
        const pRes = await httpClient.get('/fhir/Patient');
        let patientList = [];
        
        // Handle different response formats
        if (Array.isArray(pRes.data?.data)) {
          patientList = pRes.data.data;
        } else if (pRes.data?.data) {
          patientList = [pRes.data.data];
        }

        const formattedPatients = patientList.map(p => ({
          phn: p.phn || p.metadata?.patientPhn || p.resource?.identifier?.[0]?.value || '',
          name: `${p.metadata?.firstName || ''} ${p.metadata?.lastName || ''}`.trim() || 
                `${p.resource?.name?.[0]?.given?.[0] || ''} ${p.resource?.name?.[0]?.family || ''}`.trim() ||
                'Unknown Patient'
        })).filter(p => p.phn);
        setPatients(formattedPatients);
      } catch (err) {
        console.error('Error loading patients:', err);
        setErrorMessage('Failed to load patients. Please refresh the page.');
      }

      // Load doctors
      try {
        const dRes = await httpClient.get('/fhir/Practitioner', {
          params: { role: 'doctor' }
        });
        let doctorList = [];
        
        // Handle different response formats
        if (Array.isArray(dRes.data?.data)) {
          doctorList = dRes.data.data;
        } else if (dRes.data?.data) {
          doctorList = [dRes.data.data];
        }

        const formattedDoctors = doctorList.map(d => ({
          license: d.medicalLicenseId || d.metadata?.medicalLicenseId || '',
          name: `${d.metadata?.firstName || ''} ${d.metadata?.lastName || ''}`.trim() ||
                `${d.resource?.name?.[0]?.given?.[0] || ''} ${d.resource?.name?.[0]?.family || ''}`.trim() ||
                'Unknown Doctor'
        })).filter(d => d.license);
        setDoctors(formattedDoctors);
      } catch (err) {
        console.error('Error loading doctors:', err);
        setErrorMessage('Failed to load doctors. Please refresh the page.');
      }
    };

    loadInitialData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    // Validation
    if (!formData.patientPhn || !formData.doctorLicense || !formData.nurseId || !formData.roomNo || !formData.appointmentDate) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    // Get the exact nurse ID from JWT token (what backend will compare against)
    // Use the exact value from form or JWT - no formatting needed
    let finalNurseId = String(formData.nurseId).trim();
    
    // If form is empty, try to get from JWT
    if (!finalNurseId) {
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          const decoded = decodeJWT(token);
          if (decoded && decoded.nurId) {
            finalNurseId = String(decoded.nurId).trim();
            console.log('Using Nurse ID from JWT:', finalNurseId);
          }
        } catch (err) {
          console.warn('Could not decode JWT for nurse ID:', err);
        }
      }
    }
    
    if (!finalNurseId) {
      setErrorMessage('Nurse ID is required.');
      return;
    }

    // Validate Patient PHN format (PH followed by 5 digits)
    const patientPhnStr = String(formData.patientPhn).trim().toUpperCase();
    if (!/^PH\d{5}$/.test(patientPhnStr)) {
      setErrorMessage('Invalid Patient PHN format. Must be PH followed by 5 digits (e.g., PH00001)');
      return;
    }

    try {
      setIsSubmitting(true);

      // Convert datetime-local to ISO string
      const appointmentDateISO = new Date(formData.appointmentDate).toISOString();

      const payload = {
        patientPhn: patientPhnStr,
        doctorLicense: formData.doctorLicense.trim(),
        nurseId: finalNurseId,
        roomNo: formData.roomNo.trim(),
        type: formData.type || 'general',
        appointmentDate: appointmentDateISO
      };

      console.log('Creating appointment with payload:', payload);
      console.log('Nurse ID being sent:', payload.nurseId);
      console.log('Patient PHN being sent:', payload.patientPhn);

      const res = await httpClient.post('/fhir/Appointment', payload);

      if (!res.data?.success) {
        throw new Error(res.data?.message || 'Failed to create appointment');
      }

      setSuccessMessage('Appointment created successfully!');
      
      // Redirect after a short delay
      setTimeout(() => {
        navigate('/staff/appointments');
      }, 1500);

    } catch (err) {
      console.error('Error creating appointment:', err);
      console.error('Error response:', err.response?.data);
      setErrorMessage(
        err.response?.data?.message || 
        err.message || 
        'Something went wrong while creating the appointment'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="staff-appointment-new">
      <h2>Create New Appointment</h2>

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
        <div className="form-section">
          <div className="input-group">
            <label>Patient PHN <span className="required">*</span></label>
            <select
              name="patientPhn"
              value={formData.patientPhn}
              onChange={handleChange}
              required
            >
              <option value="">Select Patient</option>
              {patients.map((patient, idx) => (
                <option key={idx} value={patient.phn}>
                  {patient.phn} - {patient.name}
                </option>
              ))}
            </select>
          </div>

          <div className="input-group">
            <label>Doctor License <span className="required">*</span></label>
            <select
              name="doctorLicense"
              value={formData.doctorLicense}
              onChange={handleChange}
              required
            >
              <option value="">Select Doctor</option>
              {doctors.map((doctor, idx) => (
                <option key={idx} value={doctor.license}>
                  {doctor.license} - {doctor.name}
                </option>
              ))}
            </select>
          </div>

          <div className="input-group">
            <label>Nurse ID <span className="required">*</span></label>
            <input
              type="text"
              name="nurseId"
              value={formData.nurseId}
              onChange={handleChange}
              placeholder="Enter Nurse ID"
              required
            />
          </div>

          <div className="input-group">
            <label>Room Number <span className="required">*</span></label>
            <input
              type="text"
              name="roomNo"
              value={formData.roomNo}
              onChange={handleChange}
              placeholder="e.g., 101"
              required
            />
          </div>

          <div className="input-group">
            <label>Appointment Type</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
            >
              <option value="general">General</option>
              <option value="consultation">Consultation</option>
              <option value="follow-up">Follow-up</option>
              <option value="emergency">Emergency</option>
            </select>
          </div>

          <div className="input-group">
            <label>Appointment Date & Time <span className="required">*</span></label>
            <input
              type="datetime-local"
              name="appointmentDate"
              value={formData.appointmentDate}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="cancel-btn"
            onClick={() => navigate('/staff')}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="save-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating...' : 'Create Appointment'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default StaffAppointmentNew;

