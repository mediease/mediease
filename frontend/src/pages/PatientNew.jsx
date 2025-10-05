import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './css/PatientNew.css';

function PatientNew() {
  const navigate = useNavigate();
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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add your submit logic here
    console.log(formData);
  };

  return (
    <div className="patient-new">
      <h2>Patient-New</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-section">
          <div className="input-group">
            <label>NIC</label>
            <input
              type="text"
              name="nic"
              value={formData.nic}
              onChange={handleChange}
            />
          </div>
          <div className="input-group">
            <label>Full Name</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
            />
          </div>
          <div className="input-group">
            <label>Gender</label>
            <select name="gender" value={formData.gender} onChange={handleChange}>
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          <div className="input-group">
            <label>DOB</label>
            <input
              type="date"
              name="dob"
              value={formData.dob}
              onChange={handleChange}
            />
          </div>
          <div className="input-group">
            <label>Contact No</label>
            <input
              type="tel"
              name="contactNo"
              value={formData.contactNo}
              onChange={handleChange}
            />
          </div>
          <div className="input-group">
            <label>Address</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
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

        <div className="form-section">
          <h3>General Health Information</h3>
          <div className="input-group">
            <label>Height</label>
            <input
              type="text"
              name="height"
              value={formData.height}
              onChange={handleChange}
            />
          </div>
          <div className="input-group">
            <label>Weight</label>
            <input
              type="text"
              name="weight"
              value={formData.weight}
              onChange={handleChange}
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

        <div className="form-actions">
          <button type="button" className="cancel-btn" onClick={() => navigate('/doctor/patients')}>
            Cancel
          </button>
          <button type="submit" className="save-btn">
            Save
          </button>
        </div>
      </form>
    </div>
  );
}

export default PatientNew;
