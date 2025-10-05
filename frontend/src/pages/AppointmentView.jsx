import React from 'react';
import {  useNavigate } from "react-router-dom";
import './css/appointmentview.css';
import SimpleButton from '../components/buttons';
const AppointmentView = () => {
  const navigate = useNavigate();
  const clickVisit = () => {
    navigate(`/doctor/patient/1001`);
  };
  return (
    <div className="appointment-page">
      <h1 className="main-header">Appointment</h1>
      
      <div className="appointment-view">
        <div className="appointment-details">
          <div className="detail-row">
            <h3 className="patient-name">Niluka Herath</h3>
            <span className="status-badge in-progress">In Progress</span>
          </div>

          <table className="detail-table">
            <tbody>
              <tr>
                <td><label>Date:</label></td>
                <td className="bold-text">20/12/2024</td>
              </tr>
              <tr>
                <td><label>ID:</label></td>
                <td className="bold-text">1001</td>
              </tr>
              <tr>
                <td><label>Room No:</label></td>
                <td className="bold-text">Clinic A, Room 5</td>
              </tr>
              <tr>
                <td><label>Type:</label></td>
                <td className="bold-text">Consultation</td>
              </tr>
              <tr>
                <td><label>Doctor:</label></td>
                <td className="bold-text">Dr. Michel Smith</td>
              </tr>
            </tbody>
          </table>

          <div className="attachments-section">
            <h4>Attachments (Important Documents)</h4>
            <ul className="attachment-list">
              <li>
                <a href="#" className="bold-text">Lab Results aug_2020.pdf</a>
              </li>
              <li>
                <a href="#" className="bold-text">Prescription</a>
              </li>
            </ul>
          </div>
          <SimpleButton 
                label="View Patient Details" 
                onClick={clickVisit}
                />
        </div>
      </div>
    </div>
  );
};

export default AppointmentView;
