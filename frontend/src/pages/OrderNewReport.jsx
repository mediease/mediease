import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FaRegCalendarAlt } from 'react-icons/fa';
import httpClient from '../services/httpClient';
import './css/OrderNewReport.css';

const OrderNewReport = () => {
  const { id } = useParams();        // patient PHN from URL
  const navigate = useNavigate();

  // ---------------------- Test Types Supported by Backend ----------------------
  const testTypeMapping = {
    "ECG": "ecg",
    "Blood Sugar": "blood_sugar",
    "Complete Blood Count (CBC)": "cbc",
    "X-ray": "xray",
    "Lipid Profile": "lipid_profile",
    "Urine Test": "urine",
    "Liver Function Test (LFT)": "lft",
    "Kidney Function Test (KFT)": "kft"
  };

  const reportOptions = Object.keys(testTypeMapping);
  const priorityOptions = ['Low', 'Medium', 'High', 'Urgent'];

  // ---------------------- Form State ----------------------
  const [formData, setFormData] = useState({
    requestDate: new Date(),
    doctor: '',
    reportDetails: 'Lipid Profile',
    priority: 'Medium',
    additionalNotes: ''
  });

  // ---------------------- Auto-load doctor name ----------------------
  useEffect(() => {
    const doctorRaw = localStorage.getItem("doctor");
    if (doctorRaw) {
      const doc = JSON.parse(doctorRaw);

      const fullName = `${doc.firstName || ""} ${doc.lastName || ""}`.trim();

      setFormData(prev => ({
        ...prev,
        doctor: fullName || "Doctor"
      }));
    }
  }, []);

  // ---------------------- Input Handlers ----------------------
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date) => {
    setFormData(prev => ({ ...prev, requestDate: date }));
  };

  // ---------------------- Submit Handler ----------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // 1️⃣ Get doctor license
      const doctorRaw = localStorage.getItem("doctor");
      const doctor = doctorRaw ? JSON.parse(doctorRaw) : {};
      const doctorLicense = doctor?.medicalLicenseId;

      if (!doctorLicense) {
        alert("Doctor login information missing.");
        return;
      }

      // 2️⃣ Fetch active encounter
      const encRes = await httpClient.get("/fhir/Encounter", {
        params: { patient: id }
      });

      const encounters = encRes?.data?.data || [];
      const activeEncounter = encounters.find(enc =>
        enc.metadata?.status === "in-progress" &&
        enc.metadata?.doctorLicense === doctorLicense
      );

      if (!activeEncounter) {
        alert("No active encounter found for this patient.");
        return;
      }

      const encounterId = activeEncounter.encId;
      const testType = testTypeMapping[formData.reportDetails];

      // 3️⃣ Send request to backend
      await httpClient.post("/api/lab/request", {
        patientPhn: id,
        encounterId,
        testType
      });

      alert("Lab report request submitted successfully!");
      navigate(`/doctor/visitpatient/${id}`);

    } catch (error) {
      console.error("Error creating lab request:", error);
      alert(error.response?.data?.message || "Failed to create lab request");
    }
  };

  // ---------------------- Cancel ----------------------
  const handleCancel = () => navigate(`/doctor/visitpatient/${id}`);

  return (
    <div className="order-report-container">
      <h2 className="order-report-title">Order New Report</h2>

      <div className="order-report-content">
        <form className="order-report-form" onSubmit={handleSubmit}>

          {/* Request Date */}
          <div className="form-field">
            <label>Request Date *</label>
            <div className="datepicker-wrapper">
              <DatePicker
                selected={formData.requestDate}
                onChange={handleDateChange}
                dateFormat="yyyy/MM/dd"
                className="date-input-field"
              />
              <FaRegCalendarAlt className="calendar-icon-field" />
            </div>
          </div>

          {/* Doctor Name (Auto-filled & Read-only) */}
          <div className="form-field">
            <label>Doctor *</label>
            <input
              type="text"
              className="form-input"
              value={formData.doctor}
              disabled     // <-- doctor name cannot be changed
            />
          </div>

          {/* Report Type */}
          <div className="form-field">
            <label>Report Details *</label>
            <select
              name="reportDetails"
              value={formData.reportDetails}
              onChange={handleChange}
              className="form-select"
            >
              {reportOptions.map((option, index) => (
                <option key={index} value={option}>{option}</option>
              ))}
            </select>
          </div>

          {/* Priority */}
          <div className="form-field">
            <label>Priority</label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="form-select"
            >
              {priorityOptions.map((p, i) => (
                <option key={i} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* Additional Notes */}
          <div className="form-field">
            <label>Additional Notes</label>
            <textarea
              name="additionalNotes"
              className="form-textarea"
              rows="4"
              value={formData.additionalNotes}
              onChange={handleChange}
              placeholder="Any comments or instructions…"
            />
          </div>

          {/* Buttons */}
          <div className="form-actions">
            <button type="button" className="cancel-button" onClick={handleCancel}>
              Cancel
            </button>
            <button type="submit" className="save-button">
              Submit Request
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default OrderNewReport;
