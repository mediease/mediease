import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import SectionHeader from "../components/SectionHeader";
import SegmentedTable from "../components/SegmentedTable";
import httpClient from "../services/httpClient";
import "./css/style.css";

const Reports = () => {
  const navigate = useNavigate();
  const mountedRef = useRef(true);

  const [loading, setLoading] = useState(true);
  const [displayData, setDisplayData] = useState([]);
  const [tableState, setTableState] = useState("All");

  // Test type display names
  const TEST_LABELS = {
    ecg: "ECG",
    blood_sugar: "Blood Sugar",
    cbc: "Complete Blood Count",
    xray: "X-Ray",
    lipid_profile: "Lipid Profile",
    urine: "Urine Test",
    lft: "Liver Function Test",
    kft: "Kidney Function Test",
  };

  // ------------------ FETCH REPORTS ------------------
  useEffect(() => {
    mountedRef.current = true;

    const loadReports = async () => {
      setLoading(true);
      try {
        const res = await httpClient.get("/api/lab/doctor/reports");

        const { requests = [], reports = [] } = res.data.data;

        // Shape aggregated rows
        const shaped = requests.map((req) => {
          const report = reports.find((r) => r.labRequestId === req._id);

          return {
            labId: req.labId,
            phn: req.patientPhn,
            type: TEST_LABELS[req.testType] || req.testType,
            status: req.status === "pending" ? "Pending" : "Completed",
            date: req.completedAt
              ? new Date(req.completedAt).toLocaleDateString()
              : "-",
            reviewedBy: report?.reviewedBy || "Not Reviewed",
            rawRequest: req,
            rawReport: report
          };
        });

        if (mountedRef.current) {
          setDisplayData(shaped);
        }
      } catch (err) {
        console.error("Report Load Error:", err);
        if (mountedRef.current) setDisplayData([]);
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    };

    loadReports();
    return () => (mountedRef.current = false);
  }, []);

  // ------------------ ON ROW CLICK ------------------
  const handleRowClick = (row) => {
    navigate(`/doctor/reports/${row.labId}`);
  };

  // ------------------ TABLE COLUMNS (NO ACTION COLUMN) ------------------
  const columns = [
    { label: "Lab ID", key: "labId" },
    { label: "PHN", key: "phn" },
    { label: "Test Type", key: "type" },
    { label: "Status", key: "status" },
    { label: "Completed Date", key: "date" },
    { label: "Reviewed By (Doctor ID)", key: "reviewedBy" }
  ];

  return (
    <div>
      <SectionHeader title="Reports Ordered by You" />

      <SegmentedTable
        columns={columns}
        data={displayData}
        filterOptions={["All"]}
        tableState={tableState}
        setTableState={setTableState}
        loading={loading}
        handleRowClick={handleRowClick}
      />
    </div>
  );
};

export default Reports;
