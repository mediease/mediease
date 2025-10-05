import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SegmentedControl from "../components/SegmentedControl";
import './css/HistoryInfo.css';

function HistoryInfo() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState('Clinical Notes');
  const filterOptions = ["Basic", "Report", "Allergies", "Medications", "Visit History"];

  const handleTabChange = (option) => {
    switch(option) {
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
        selected="Visit History"
        onChange={handleTabChange}
      />
      
      <div className="visit-container">
        <div className="visit-sidebar">
          <div className="visit-info-header">
            <div className="visit-date">April 15, 2025</div>
            <div className="visit-status status-completed">Completed</div>
          </div>
          
          <div className="visit-basic-info">
            <div className="info-item">
              <div className="info-label">Provider</div>
              <div className="info-value">Dr. Sarah Johnson</div>
            </div>
            <div className="info-item">
              <div className="info-label">Department</div>
              <div className="info-value">Internal Medicine</div>
            </div>
            <div className="info-item">
              <div className="info-label">Visit Type</div>
              <div className="info-value">Follow-up</div>
            </div>
            <div className="info-item">
              <div className="info-label">Chief Complaint</div>
              <div className="info-value">Blood pressure monitoring</div>
            </div>
          </div>
          
          <div className="info-item">
            <div className="info-label">Next Appointment</div>
            <div className="info-value">May 10, 2025</div>
          </div>
          
          <div className="visit-actions">
            <button className="visit-action-btn primary-btn">Print Summary</button>
            <button className="visit-action-btn secondary-btn">Send to Patient</button>
            <button className="visit-action-btn secondary-btn">Schedule Follow-up</button>
          </div>
        </div>
        
        <div className="visit-content">
          <div className="visit-nav">
            {['Clinical Notes'].map(tab => (
              <div 
                key={tab}
                className={`visit-nav-item ${selectedTab === tab ? 'active' : ''}`}
                onClick={() => setSelectedTab(tab)}
              >
                {tab}
              </div>
            ))}
          </div>
          
          <div className="visit-section">
            <div className="section-title">Subjective</div>
            <div className="form-group">
              <textarea className="form-control" readOnly value="Patient is a 42-year-old male who presents for follow-up of hypertension. He reports generally feeling well. He has been taking his medications as prescribed. He reports occasional headaches but denies chest pain, shortness of breath, dizziness, or swelling. He has been checking his blood pressure at home with readings averaging 135/85 mmHg." />
            </div>
          </div>
          
          <div className="visit-section">
            <div className="section-title">Vital Signs</div>
            <div className="vital-signs">
              {[
                { label: 'Temperature', value: '98.6', unit: '°F' },
                { label: 'Heart Rate', value: '72', unit: 'bpm' },
                { label: 'Respiratory Rate', value: '16', unit: 'rpm' },
                { label: 'Blood Pressure', value: '138/82', unit: 'mmHg' },
                { label: 'O2 Saturation', value: '98', unit: '%' },
                { label: 'Weight', value: '178', unit: 'lbs' }
              ].map((vital, index) => (
                <div key={index} className="vital-item">
                  <div className="vital-label">{vital.label}</div>
                  <div className="vital-value">
                    {vital.value}<span className="vital-unit">{vital.unit}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="visit-section">
            <div className="section-title">Objective</div>
            <div className="form-group">
              <textarea className="form-control" readOnly value="Patient is alert and oriented. Skin is warm and dry. No distress. Heart: Regular rate and rhythm, no murmurs or gallops. Lungs: Clear to auscultation bilaterally. Abdomen: Soft, non-tender, non-distended. Extremities: No edema." />
            </div>
          </div>

          <div className="visit-section">
            <div className="section-title">Assessment</div>
            <div className="form-group">
              <textarea className="form-control" readOnly value="1. Essential Hypertension (I10) - Suboptimally controlled&#13;&#10;2. Hyperlipidemia (E78.5) - Stable" />
            </div>
          </div>

          <div className="visit-section">
            <div className="section-title">Plan</div>
            <div className="form-group">
              <textarea className="form-control" readOnly value="1. Hypertension: Increase Lisinopril from 10mg to 20mg daily. Continue monitoring blood pressure at home.&#13;&#10;2. Hyperlipidemia: Continue Atorvastatin 10mg daily.&#13;&#10;3. Labs: Order basic metabolic panel and lipid panel.&#13;&#10;4. Follow-up in 1 month to reassess blood pressure control.&#13;&#10;5. Dietary counseling provided regarding low sodium diet." />
            </div>
          </div>

          <div className="visit-section">
            <div className="section-title">Medications</div>
            <table className="medication-table">
              <thead>
                <tr>
                  <th>Medication</th>
                  <th>Dosage</th>
                  <th>Route</th>
                  <th>Frequency</th>
                  <th>Refills</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Lisinopril</td>
                  <td>20mg</td>
                  <td>Oral</td>
                  <td>Once daily</td>
                  <td>3</td>
                </tr>
                <tr>
                  <td>Atorvastatin</td>
                  <td>10mg</td>
                  <td>Oral</td>
                  <td>Once daily at bedtime</td>
                  <td>3</td>
                </tr>
                <tr>
                  <td>Aspirin</td>
                  <td>81mg</td>
                  <td>Oral</td>
                  <td>Once daily</td>
                  <td>3</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HistoryInfo;