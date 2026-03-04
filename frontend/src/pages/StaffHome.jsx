// ======================= STAFF HOME PAGE =======================
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "./css/StaffHome.css";
import { FaPlus } from "react-icons/fa";
import { FaRegCalendarCheck } from "react-icons/fa";
import httpClient from '../services/httpClient';

const StaffHome = () => {
  const navigate = useNavigate();
  const [staffName, setStaffName] = useState("Staff");
  const [appointmentCount, setAppointmentCount] = useState(0);

  useEffect(() => {
    // Determine which localStorage key to use based on role
    try {
      const role = localStorage.getItem("userRole");
      let raw = null;
      if (role === "nurse") {
        raw = localStorage.getItem("nurse");
      } else if (role === "lab_assistant") {
        raw = localStorage.getItem("labAssistant");
      }
      const staff = raw ? JSON.parse(raw) : null;
      if (staff) {
        const name = `${staff.firstName || ""} ${staff.lastName || ""}`.trim();
        setStaffName(name || "Staff");
      }
    } catch {
      setStaffName("Staff");
    }

    // Load appointment count using the staff/nurse endpoint
    const loadAppointmentCount = async () => {
      try {
        const res = await httpClient.get('/fhir/staff/appointments');
        const total = res.data?.total ?? (Array.isArray(res.data?.data) ? res.data.data.length : 0);
        setAppointmentCount(total);
      } catch {
        setAppointmentCount(0);
      }
    };

    loadAppointmentCount();
  }, []);

  return (
    <div className="staff-home-container">
      <h1 className="staff-welcome">Welcome Back, {staffName}!</h1>

      <div className="staff-action-cards">
        {/* Add New Patient Card */}
        <div className="staff-action-card">
          <h3 className="card-title">Add New Patient</h3>
          <div className="card-icon-large">
            <FaPlus />
          </div>
          <button className="staff-action-btn" onClick={() => navigate('/staff/patients/new')}>
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
          <button className="staff-action-btn" onClick={() => navigate('/staff/appointments/new')}>
            Create
          </button>
        </div>
      </div>
    </div>
  );
};

export default StaffHome;
