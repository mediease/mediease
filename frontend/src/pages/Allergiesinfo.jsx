import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SegmentedControl from "../components/SegmentedControl";
import './css/allergiesinfo.css';

const Allergiesinfo = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const filterOptions = ["Basic", "Report", "Allergies", "Medications", "Visit History"];
  const [selectedFilter, setSelectedFilter] = useState("Allergies");

  const [allergyValue, setAllergyValue] = useState('');
  const [statusValue, setStatusValue] = useState('current');
  const [remarksValue, setRemarksValue] = useState('');

  const handleSave = (e) => {
    e.preventDefault();
    // do your save logic here
    console.log({ allergy: allergyValue, status: statusValue, remarks: remarksValue });
  };

  const handleCancel = () => {
    setAllergyValue('');
    setStatusValue('current');
    setRemarksValue('');
  };

  const handleTabChange = (option) => {
    setSelectedFilter(option);
    switch (option) {
      case "Basic":
        navigate(`/doctor/visitpatient/${id}`);
        break;
      case "Report":
        navigate(`/doctor/patient/${id}/reportinfo`);
        break;
      case "Allergies":
        navigate(`/doctor/patient/${id}/allergiesinfo`);
        break;
      case "Medications":
        navigate(`/doctor/patient/${id}/medicationsinfo`);
        break;
      case "Visit History":
        navigate(`/doctor/patient/${id}/historyinfo`);
        break;
      default:
        navigate(`/doctor/patient/${id}`);
    }
  };

  return (
    <div className="patientDetailsMain">
      <h2 className="patientDetailsHeder">Patients - Naveen Bimsara</h2>

      <SegmentedControl
        options={filterOptions}
        selected={selectedFilter}
        onChange={handleTabChange}
      />

      <div className="allergies-main">
        <div className="allergy-card-wrapper">
          <div className="allergy-card">
            <h3 className="allergy-card-title">Allergy</h3>

            <form className="allergy-form" onSubmit={handleSave}>
              {/* Allergy text field */}
              <div className="form-row">
                <label htmlFor="allergy" className="required-label">
                  <span className="required-star">*</span> Allergy
                </label>
                <input
                  id="allergy"
                  name="allergy"
                  type="text"
                  placeholder="Allergy"
                  required
                  value={allergyValue}
                  onChange={(e) => setAllergyValue(e.target.value)}
                />
              </div>

              {/* Status radio buttons */}
              <div className="form-row">
                <label className="status-label">Status</label>
                <div className="radio-group">
                  <label className="radio-item">
                    <input
                      type="radio"
                      name="status"
                      value="current"
                      checked={statusValue === 'current'}
                      onChange={() => setStatusValue('current')}
                    />
                    Current
                  </label>
                  <label className="radio-item">
                    <input
                      type="radio"
                      name="status"
                      value="past"
                      checked={statusValue === 'past'}
                      onChange={() => setStatusValue('past')}
                    />
                    Past
                  </label>
                </div>
              </div>

              {/* Remarks textarea */}
              <div className="form-row">
                <label htmlFor="remarks">Remarks</label>
                <textarea
                  id="remarks"
                  name="remarks"
                  placeholder="Any remarks"
                  value={remarksValue}
                  onChange={(e) => setRemarksValue(e.target.value)}
                />
              </div>

              {/* Hint text */}
              <div className="form-hint">
                Fields marked with an asterisk must be filled
              </div>

              {/* Buttons */}
              <div className="form-actions">
                <button type="submit" className="save-btn">Save</button>
                <button type="button" className="cancel-btn" onClick={handleCancel}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Allergiesinfo;
