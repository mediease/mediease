import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import httpClient from "../services/httpClient";
import PDFViewer from "../components/PDFviwer";
import "./css/singleReport.css"; // 🔥 NEW CSS FILE

const SingleReport = () => {
  const params = useParams();
  const reportId = params.labId || params.id;

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!reportId) {
      setError("Report ID is missing from URL");
      setLoading(false);
      return;
    }

    const load = async () => {
      try {
        const res = await httpClient.get(`/api/lab/report/lab/${reportId}`);

        if (!res.data.success) {
          setError("Backend returned an error");
          return;
        }

        const { diagnosticReport, labRequest, patient, encounter } = res.data.data;

        setData({
          diagnosticReport: diagnosticReport || {},
          labRequest: labRequest || {},
          patient: patient || {},
          encounter: encounter || {},
        });

      } catch (e) {
        setError("Request failed: " + e.message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [reportId]);

  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

  if (loading) return <div className="sr-loading">Loading...</div>;
  if (error) return <div className="sr-error">{error}</div>;
  if (!data) return <div className="sr-error">No report data found</div>;

  const { diagnosticReport, labRequest, patient } = data;

  const testType = labRequest.testType || diagnosticReport.testType || "Unknown";
  const status = labRequest.status || diagnosticReport.status || "pending";
  const resultText =
    labRequest.resultText || diagnosticReport?.resource?.conclusion || "";
  const fileUrl =
    labRequest.fileUrl ||
    diagnosticReport?.resource?.presentedForm?.[0]?.url ||
    null;

  const fullPdfUrl = fileUrl ? apiUrl + fileUrl : null;

  return (
    <div className="sr-container">
      <h2 className="sr-title">{testType.toUpperCase()} Report</h2>

      <div className="sr-card">
        <h3>Patient Information</h3>
        <p><strong>Name:</strong> {patient.firstName || "N/A"} {patient.lastName || ""}</p>
        <p><strong>PHN:</strong> {patient.phn || "N/A"}</p>
      </div>

      <div className="sr-card">
        <h3>Status</h3>
        <p className={status === "completed" ? "sr-status-completed" : "sr-status-pending"}>
          {status}
        </p>
      </div>

      <div className="sr-card">
        <h3>Report File</h3>
        {fullPdfUrl ? (
          <PDFViewer url={fullPdfUrl} />
        ) : (
          <p>No file uploaded</p>
        )}
      </div>

      {resultText && (
        <div className="sr-card">
          <h3>Conclusion</h3>
          <p>{resultText}</p>
        </div>
      )}
    </div>
  );
};

export default SingleReport;
