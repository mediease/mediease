import React, { useState } from 'react';
import './css/VisitForm.css';
import { useNavigate } from 'react-router-dom';
import { useParams } from "react-router-dom";


const VisitForm = () => {

    const { id } = useParams();
  const backendData = {
    dateTime: '2024-12-28T12:05:46',
    doctor: 'Dr. Clinic Doctor',
    division: 'OPD',
  };
const navigate = useNavigate();
  const handleSave = () => {
    navigate(`/doctor/visitpatient/${id}`);
  };

  const [formData, setFormData] = useState({
    weight: '',
    complaint: '',
    visitNote: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalData = { ...backendData, ...formData };
    console.log('Submitted:', finalData);
    alert('Visit saved!');
  };

  const handleCancel = () => {
    navigate(`/doctor/patients`);
  };

  return (
    <div className="visit-form-container">
      <form className="visit-form" onSubmit={handleSubmit}>
        

        <div className="form-row">
          <label>Date and time of visit:</label>
          <span className="readonly-value">{backendData.dateTime}</span>
        </div>

        <div className="form-row">
          <label>Doctor:</label>
          <span className="readonly-value">{backendData.doctor}</span>
        </div>

        <div className="form-row">
          <label>Division:</label>
          <span className="readonly-value">{backendData.division}</span>
        </div>

        <div className="form-row">
          <label>Weight in kg:</label>
          <input type="number" name="weight" value={formData.weight} onChange={handleChange} />
        </div>

        <div className="form-row">
          <label>Complaint / Injury:</label>
          <input type="text" name="complaint" value={formData.complaint} onChange={handleChange} />
        </div>

        <div className="form-row">
          <label>Visit Note:</label>
          <textarea name="visitNote" value={formData.visitNote} onChange={handleChange} required />
        </div>

        

        <div className="button-group">
          <button type="submit" className="btn-save" onClick={handleSave}>Save</button>
          <button type="button" className="btn-cancel" onClick={handleCancel}>Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default VisitForm;
