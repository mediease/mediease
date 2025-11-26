import { useParams, useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import SegmentedControl from "../components/SegmentedControl";
import TableN1 from "../components/tableN1";
import httpClient from "../services/httpClient";
import "./css/style.css";

const ReportInfo = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const filterOptions = ["Basic", "Report", "Allergies", "Medications", "Visit History"];
  const [selectedFilter, setSelectedFilter] = useState("Report");

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const TEST_LABELS = {
    ecg: "ECG",
    blood_sugar: "Blood Sugar",
    cbc: "Complete Blood Count",
    xray: "X-Ray",
    lipid_profile: "Lipid Profile",
    urine: "Urine Test",
    lft: "Liver Function Test",
    kft: "Kidney Function Test"
  };

  const columns = [
    { label: "Lab ID", key: "labId" },
    { label: "Test", key: "testName" },
    { label: "Ordered By", key: "doctor" },
    { label: "Requested On", key: "requested" },
    { label: "Status", key: "status" },
    { label: "Last Update", key: "lastUpdate" },
    { label: "Reviewed By", key: "reviewedBy" },
  ];

  // Load reports
  useEffect(() => {
    const load = async () => {
      try {
        const res = await httpClient.get(`/api/lab/patient/${id}`);
        const { requests = [], reports = [] } = res.data.data;

        const list = requests.map(req => {
          const report = reports.find(r => r.labId === req.labId);

          return {
            labId: req.labId || "-",
            testName: TEST_LABELS[req.testType] || req.testType || "-",
            doctor: req.doctorLicense || "-",
            requested: req.createdAt
              ? new Date(req.createdAt).toLocaleDateString()
              : "-",
            status: req.status === "pending" ? "Pending" : "Completed",
            lastUpdate: report?.reviewedAt
              ? new Date(report.reviewedAt).toLocaleDateString()
              : req.completedAt
              ? new Date(req.completedAt).toLocaleDateString()
              : "-",
            reviewedBy: report?.reviewedBy || "-",
          };
        });

        setRows(list);
      } catch (err) {
        console.error("Load report info failed:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  const handleRowClick = (row) => {
    navigate(`/doctor/reports/${row.labId}`);
  };

  const handleTabChange = (option) => {
    setSelectedFilter(option);

    switch (option) {
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
      <h2 className="patientDetailsHeder">Patient Reports</h2>

      <SegmentedControl
        options={filterOptions}
        selected={selectedFilter}
        onChange={handleTabChange}
      />

      {loading ? (
        <p>Loading...</p>
      ) : (
        <TableN1
          columns={columns}
          data={rows}
          compact
          showHeader={true}
          showActions={false}
          handleRowClick={handleRowClick}
        />
      )}
    </div>
  );
};

export default ReportInfo;
