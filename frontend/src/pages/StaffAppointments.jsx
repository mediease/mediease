// ======================= STAFF APPOINTMENTS PAGE =======================
import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import SectionHeader from "../components/SectionHeader";
import SegmentedTable from "../components/SegmentedTable";
import httpClient from "../services/httpClient";
import "./css/style.css";

const StaffAppointments = () => {
  const navigate = useNavigate();
  const mountedRef = useRef(true);

  const [loading, setLoading] = useState(true);
  const [displayData, setDisplayData] = useState([]);
  const [rawAppointments, setRawAppointments] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState("Today");

  // Helper function to decode JWT token
  const decodeJWT = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (err) {
      console.error('Error decoding JWT:', err);
      return null;
    }
  };

  // ------------------ FETCH APPOINTMENTS ------------------
  useEffect(() => {
    mountedRef.current = true;

    const loadAppointments = async () => {
      setLoading(true);

      try {
        // Get nurse ID from JWT token or localStorage
        let nurseId = null;
        
        // 1. Try to get from JWT token (most reliable)
        const token = localStorage.getItem('authToken');
        if (token) {
          try {
            const decoded = decodeJWT(token);
            if (decoded && decoded.nurId) {
              nurseId = String(decoded.nurId).trim();
            }
          } catch (err) {
            console.warn('Could not decode JWT token:', err);
          }
        }
        
        // 2. Fallback to localStorage if JWT doesn't have it
        if (!nurseId) {
          const nurseRaw = localStorage.getItem('nurse');
          if (nurseRaw) {
            try {
              const nurse = JSON.parse(nurseRaw);
              if (nurse && nurse.nurId) {
                nurseId = String(nurse.nurId).trim();
              }
            } catch (e) {
              console.warn('Error parsing nurse object:', e);
            }
          }
        }
        
        // 3. Try direct nurId from localStorage
        if (!nurseId) {
          const nurId = localStorage.getItem('nurId');
          if (nurId && nurId !== 'NUR_UNKNOWN') {
            nurseId = String(nurId).trim();
          }
        }

        // Get appointments for the logged-in nurse/staff member using /fhir/Appointment?nurseId=...
        let list = [];
        
        if (nurseId) {
          try {
            const res = await httpClient.get('/fhir/Appointment', {
              params: { nurseId: nurseId }
            });
            // Handle both single appointment and array response
            if (Array.isArray(res.data?.data)) {
              list = res.data.data;
            } else if (res.data?.data) {
              list = [res.data.data];
            }
          } catch (err) {
            console.error('Error loading staff appointments:', err);
            // If endpoint fails, show empty list
          }
        } else {
          console.warn('Nurse ID not found, cannot load appointments');
        }

        // Shape rows
        const shaped = await Promise.all(
          list.map(async (item) => {
            const phn = item.metadata?.patientPhn || item.patientPhn || "-";
            let fullName = phn;

            // Fetch patient name
            if (phn !== "-") {
              try {
                const pRes = await httpClient.get(`/fhir/Patient/${phn}`);
                const p = pRes.data?.data?.metadata || {};
                fullName = `${p.firstName || ""} ${p.lastName || ""}`.trim() || fullName;
              } catch {}
            }

            return {
              id: item.apid || item.metadata?.apid || "-",
              phn,
              "patient name": fullName,
              status: item.metadata?.status || item.status || "-",
              date: item.metadata?.appointmentDate || item.appointmentDate
                ? new Date(item.metadata?.appointmentDate || item.appointmentDate).toLocaleDateString()
                : "-",
              type: item.metadata?.type || item.type || "-",
              "room no": item.metadata?.roomNo || item.roomNo || "-",
            };
          })
        );

        if (mountedRef.current) setRawAppointments(shaped);
      } catch (err) {
        console.error("Staff Appointments Load Error:", err);
        if (mountedRef.current) setRawAppointments([]);
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    };

    loadAppointments();
    return () => (mountedRef.current = false);
  }, []);

  // ------------------ FILTERS ------------------
  useEffect(() => {
    const today = new Date();

    let filtered = rawAppointments;

    if (selectedFilter === "Today") {
      filtered = rawAppointments.filter((a) => {
        return a.date === today.toLocaleDateString();
      });
    }

    if (selectedFilter === "This Week") {
      const start = new Date(today.setDate(today.getDate() - today.getDay()));
      const end = new Date(start);
      end.setDate(start.getDate() + 7);

      filtered = rawAppointments.filter((a) => {
        const d = new Date(a.date);
        return d >= start && d <= end;
      });
    }

    if (selectedFilter === "This Month") {
      const month = new Date().getMonth();
      filtered = rawAppointments.filter((a) => {
        return new Date(a.date).getMonth() === month;
      });
    }

    setDisplayData(filtered);
  }, [selectedFilter, rawAppointments]);

  // ------------------ ON CLICK ------------------
  const handleRowClick = (row) => {
    // Navigate to appointment view if needed
    // navigate(`/staff/appointments/${row.id}`);
  };

  const columns = [
    { label: "ID", key: "id" },
    { label: "PHN", key: "phn" },
    { label: "Patient Name", key: "patient name" },
    { label: "Status", key: "status" },
    { label: "Date", key: "date" },
    { label: "Type", key: "type" },
    { label: "Room No", key: "room no" },
  ];

  return (
    <div>
      <SectionHeader title="Appointments" />
      <div style={{ marginTop: "20px", marginBottom: "20px" }}>
        <button
          onClick={() => navigate('/staff/appointments/new')}
          style={{
            padding: "10px 20px",
            backgroundColor: "#2563eb",
            color: "#ffffff",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "16px",
            fontWeight: "600"
          }}
        >
          Create New Appointment
        </button>
      </div>
      <SegmentedTable
        columns={columns}
        data={displayData}
        filterOptions={["Today", "This Week", "This Month"]}
        tableState={selectedFilter}
        setTableState={setSelectedFilter}
        loading={loading}
        handleRowClick={handleRowClick}
      />
    </div>
  );
};

export default StaffAppointments;


