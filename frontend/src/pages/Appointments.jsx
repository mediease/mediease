// ======================= APPOINTMENTS PAGE (FULL + CONNECTED) =======================
import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import SectionHeader from "../components/SectionHeader";
import SegmentedTable from "../components/SegmentedTable";
import httpClient from "../services/httpClient";
import "./css/style.css";

const Appointment = () => {
  const navigate = useNavigate();
  const mountedRef = useRef(true);

  const [loading, setLoading] = useState(true);
  const [displayData, setDisplayData] = useState([]);
  const [rawAppointments, setRawAppointments] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState("Today");

  // ------------------ RESOLVE DOCTOR LICENSE ------------------
  let doctorLicense = null;
  try {
    const raw = localStorage.getItem("doctor");
    doctorLicense = raw ? JSON.parse(raw)?.medicalLicenseId : null;
  } catch {}

  // ------------------ FETCH APPOINTMENTS ------------------
  useEffect(() => {
    mountedRef.current = true;

    const loadAppointments = async () => {
      setLoading(true);

      try {
        if (!doctorLicense) return;

        const res = await httpClient.get(`/doctor/appointments/${doctorLicense}`);
        const list = res.data?.data || [];

        // Shape rows
        const shaped = await Promise.all(
          list.map(async (item) => {
            const phn = item.metadata?.patientPhn || "-";
            let fullName = phn;

            // Fetch patient name
            try {
              const pRes = await httpClient.get(`/fhir/Patient/${phn}`);
              const p = pRes.data?.data?.metadata || {};
              fullName = `${p.firstName || ""} ${p.lastName || ""}`.trim() || fullName;
            } catch {}

            return {
              id: item.apid || "-",
              phn,
              "patient name": fullName,
              status: item.metadata?.status || "-",
              date: item.metadata?.appointmentDate
                ? new Date(item.metadata.appointmentDate).toLocaleDateString()
                : "-",
              type: item.metadata?.type || "-",
            };
          })
        );

        if (mountedRef.current) setRawAppointments(shaped);
      } catch (err) {
        console.error("Appointments Load Error:", err);
        if (mountedRef.current) setRawAppointments([]);
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    };

    loadAppointments();
    return () => (mountedRef.current = false);
  }, [doctorLicense]);

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
    navigate(`/doctor/appointments/${row.id}`);
  };

  const columns = [
    { label: "ID", key: "id" },
    { label: "PHN", key: "phn" },
    { label: "Patient Name", key: "patient name" },
    { label: "Status", key: "status" },
    { label: "Date", key: "date" },
    { label: "Type", key: "type" },
  ];

  return (
    <div>
      <SectionHeader title="Appointments" />

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

export default Appointment;
