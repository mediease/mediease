// ======================= STAFF HOME PAGE =======================
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "./css/StaffHome.css";
import { FaPlus } from "react-icons/fa";
import { FaRegCalendarCheck } from "react-icons/fa";
import httpClient from '../services/httpClient';

const StaffHome = () => {
  const navigate = useNavigate();
  const [nurseName, setNurseName] = useState("Nurse");
  const [appointmentCount, setAppointmentCount] = useState(0);

  useEffect(() => {
    // Load nurse name from localStorage
    try {
      const raw = localStorage.getItem("staff");
      const staff = raw ? JSON.parse(raw) : null;
      if (staff) {
        const name = `${staff.firstName || ""} ${staff.lastName || ""}`.trim();
        setNurseName(name || "Nurse");
      }
    } catch {
      setNurseName("Nurse");
    }

    // Load appointment count
    const loadAppointmentCount = async () => {
      try {
        // Note: GET /fhir/Appointment requires an ID, so we can't get all appointments
        // Try admin endpoint as fallback (may not work for staff)
        try {
          const res = await httpClient.get('/admin/appointments');
          const appointments = res.data?.data || [];
          setAppointmentCount(Array.isArray(appointments) ? appointments.length : 0);
        } catch (adminErr) {
          // If admin endpoint doesn't work, set a default or leave at 0
          setAppointmentCount(0);
        }
      } catch (err) {
        console.error("Error loading appointment count:", err);
        setAppointmentCount(0);
      }
    };

    loadAppointmentCount();
  }, []);

  const handleAddPatient = () => {
    navigate('/staff/patients/new');
  };

  const handleCreateAppointment = () => {
    navigate('/staff/appointments/new');
  };

  return (
    <div className="staff-home-container">
      <h1 className="staff-welcome">Welcome Back, {nurseName}!</h1>
      
      <div className="staff-action-cards">
        {/* Add New Patient Card */}
        <div className="staff-action-card">
          <h3 className="card-title">Add New Patient</h3>
          <div className="card-icon-large">
            <FaPlus />
          </div>
          <button className="staff-action-btn" onClick={handleAddPatient}>
            Add
          </button>
        </div>

        {/* Appointment Card */}
        <div className="staff-action-card">
          <h3 className="card-title">Appointment</h3>
          <div className="card-content-row">
            <div className="appointment-number">{appointmentCount}</div>
            <div className="card-icon-right">
              <FaRegCalendarCheck />
            </div>
          </div>
          <button className="staff-action-btn" onClick={handleCreateAppointment}>
            Create
          </button>
        </div>
      </div>
    </div>
  );
};

export default StaffHome;


