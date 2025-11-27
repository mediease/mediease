// ======================= STAFF PATIENTS PAGE =======================
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SectionHeader from "../components/SectionHeader";
import SegmentedTable from "../components/SegmentedTable";
import httpClient from "../services/httpClient";
import "./css/style.css";

const StaffPatients = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [displayData, setDisplayData] = useState([]);
  const [rawPatients, setRawPatients] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState("All");

  // ------------------ FETCH PATIENTS ------------------
  useEffect(() => {
    const loadPatients = async () => {
      setLoading(true);

      try {
        const pRes = await httpClient.get("/fhir/Patient/");
        const pList = pRes.data?.data || [];

        const shaped = pList.map((p) => ({
          phn:
            p?.metadata?.patientPhn ||
            p?.phn ||
            p?.resource?.identifier?.find((i) => i.system?.includes("phn"))?.value ||
            "-",
          name:
            `${p?.metadata?.firstName || ""} ${p?.metadata?.lastName || ""}`.trim() ||
            `${p?.resource?.name?.[0]?.given?.[0] || ""} ${p?.resource?.name?.[0]?.family || ""}`.trim() ||
            "Unknown",
          gender: p?.metadata?.gender || p?.resource?.gender || "-",
          age: p?.metadata?.age || "-",
          contact: p?.metadata?.contactNumber || p?.resource?.telecom?.[0]?.value || "-",
        }));

        setRawPatients(shaped);
      } catch (err) {
        console.error("Staff Patients Load Error:", err);
        setRawPatients([]);
      } finally {
        setLoading(false);
      }
    };

    loadPatients();
  }, []);

  // ------------------ FILTERS ------------------
  useEffect(() => {
    let filtered = rawPatients;

    if (selectedFilter === "Male") {
      filtered = rawPatients.filter((p) => p.gender?.toLowerCase() === "male");
    }

    if (selectedFilter === "Female") {
      filtered = rawPatients.filter((p) => p.gender?.toLowerCase() === "female");
    }

    setDisplayData(filtered);
  }, [selectedFilter, rawPatients]);

  // ------------------ ON CLICK ------------------
  const handleRowClick = (row) => {
    // Could navigate to patient details if needed
    // navigate(`/staff/patients/${row.phn}`);
  };

  const columns = [
    { label: "PHN", key: "phn" },
    { label: "Name", key: "name" },
    { label: "Gender", key: "gender" },
    { label: "Age", key: "age" },
    { label: "Contact", key: "contact" },
  ];

  return (
    <div>
      <SectionHeader title="Patients" />
      <div style={{ marginTop: "20px", marginBottom: "20px" }}>
        <button
          onClick={() => navigate('/staff/patients/new')}
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
          Add New Patient
        </button>
      </div>
      <SegmentedTable
        columns={columns}
        data={displayData}
        filterOptions={["All", "Male", "Female"]}
        tableState={selectedFilter}
        setTableState={setSelectedFilter}
        loading={loading}
        handleRowClick={handleRowClick}
      />
    </div>
  );
};

export default StaffPatients;


