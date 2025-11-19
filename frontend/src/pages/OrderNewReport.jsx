import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FaRegCalendarAlt } from 'react-icons/fa';
import './css/OrderNewReport.css';

const OrderNewReport = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    requestDate: new Date('2024-12-28'),
    doctor: 'Dr.Clinic Doctor',
    reportDetails: 'Lipid Profile',
    priority: 'Medium',
    additionalNotes: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleDateChange = (date) => {
    setFormData({
      ...formData,
      requestDate: date
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add your submit logic here
    console.log('Form submitted:', formData);
    // Navigate back to visit patient page after save
    navigate(`/doctor/visitpatient/${id}`);
  };

  const handleCancel = () => {
    navigate(`/doctor/visitpatient/${id}`);
  };

  // Report options for dropdown
  const reportOptions = [
    'Lipid Profile',
    'Complete Blood Count (CBC)',
    'Blood Glucose',
    'Liver Function Test',
    'Kidney Function Test',
    'Thyroid Function Test',
    'Urine Analysis',
    'X-Ray',
    'CT Scan',
    'MRI',
    'Ultrasound',
    'ECG'
  ];

  // Priority options
  const priorityOptions = ['Low', 'Medium', 'High', 'Urgent'];

  return (
    <div className="order-report-container">
      <h2 className="order-report-title">Patients- Mr.Naveen Bimsara</h2>
      <div className="order-report-content">
        <h3 className="patient-name-header">Order New Report</h3>
        
        <form className="order-report-form" onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="requestDate">
              Request Date <span className="required-asterisk">*</span>
            </label>
            <div className="datepicker-wrapper">
              <DatePicker
                id="requestDate"
                selected={formData.requestDate}
                onChange={handleDateChange}
                dateFormat="yyyy/MM/dd"
                className="date-input-field"
                calendarClassName="custom-calendar"
                popperPlacement="bottom-start"
              />
              <FaRegCalendarAlt className="calendar-icon-field" />
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="doctor">
              Doctor <span className="required-asterisk">*</span>
            </label>
            <input
              type="text"
              id="doctor"
              name="doctor"
              value={formData.doctor}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="reportDetails">
              Report Details <span className="required-asterisk">*</span>
            </label>
            <div className="select-wrapper">
              <select
                id="reportDetails"
                name="reportDetails"
                value={formData.reportDetails}
                onChange={handleChange}
                className="form-select"
                required
              >
                {reportOptions.map((option, index) => (
                  <option key={index} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="priority">Priority</label>
            <div className="select-wrapper">
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="form-select"
              >
                {priorityOptions.map((option, index) => (
                  <option key={index} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="additionalNotes">Additional Notes</label>
            <textarea
              id="additionalNotes"
              name="additionalNotes"
              value={formData.additionalNotes}
              onChange={handleChange}
              className="form-textarea"
              rows="4"
              placeholder="Enter any additional notes or instructions..."
            />
          </div>

          <p className="required-note">* Fields marked with an asterisk must be filled</p>

          <div className="form-actions">
            <button type="button" className="cancel-button" onClick={handleCancel}>
              Cancel
            </button>
            <button type="submit" className="save-button">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrderNewReport;

