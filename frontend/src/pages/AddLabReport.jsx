import React, { useEffect, useState } from "react";
import SegmentedTable from "../components/SegmentedTable";
import httpClient from "../services/httpClient";
import { useNavigate } from "react-router-dom";
import "./css/AddLabReport.css";

const AddLabReport = () => {
  const navigate = useNavigate();
  const [pendingReports, setPendingReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tableState, setTableState] = useState("Pending");

  const columns = [
    { key: "patientPhn", label: "Patient PHN" },
    { key: "testType", label: "Test Type" },
    { key: "doctorLicense", label: "Requested By" },
    { key: "createdAt", label: "Requested On" },
  ];

  const filterOptions = ["Pending"];

  useEffect(() => {
    fetchPendingReports();
  }, []);

  const fetchPendingReports = async () => {
    setLoading(true);
    try {
      const res = await httpClient.get("/api/lab/pending");
      const items = res.data?.data || [];
      setPendingReports(items);
    } catch (error) {
      console.error("Error fetching pending lab tests:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderCell = (key, value) => {
    if (key === "createdAt") {
      return new Date(value).toLocaleString();
    }
    if (key === "testType") {
      return value.toUpperCase();
    }
    return value;
  };

  const handleRowClick = (row) => {
    navigate(`/lab-assistant/add-report/${row._id}`);
  };

  return (
    <div className="add-lab-report-container">
      <h2 className="title">Pending Lab Orders</h2>

      <SegmentedTable
        columns={columns}
        data={pendingReports}
        filterOptions={filterOptions}
        renderCell={renderCell}
        handleRowClick={handleRowClick}
        tableState={tableState}
        setTableState={setTableState}
        loading={loading}
      />
    </div>
  );
};

export default AddLabReport;
