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
      
      {/* Simple Visit History Table */}
      <div className="visit-history-table-wrapper">
        <table className="visit-history-table">
          <thead>
            <tr>
              <th>Last Visit Date</th>
              <th>Reason for Visit</th>
              <th>Last Medicine</th>
              <th>Doctor</th>
              <th>Next Appointment</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>2025-04-15</td>
              <td>Blood pressure monitoring</td>
              <td>Lisinopril 20mg</td>
              <td>Dr. Sarah Johnson</td>
              <td>2025-05-10</td>
              <td>
                <button onClick={() => navigate(`/doctor/patient/${id}/reportinfo`)}>View Report</button>
                <button onClick={() => navigate(`/doctor/patient/${id}/medicationsinfo`)} style={{marginLeft:8}}>View Prescriptions</button>
              </td>
            </tr>
            {/* Add more rows as needed */}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default HistoryInfo;