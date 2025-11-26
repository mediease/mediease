import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import httpClient from "../services/httpClient";
import PDFViewer from "../components/PDFviwer";

const SingleReport = () => {
  const { labId } = useParams(); // URL: /doctor/report/LAB00006
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState(null);
  const [error, setError] = useState("");
  const [debugInfo, setDebugInfo] = useState(""); // For debugging

  useEffect(() => {
    const loadReport = async () => {
      try {
        console.log("Loading report for labId:", labId);
        
        // ✔ Correct backend endpoint
        const res = await httpClient.get(`/api/lab/report/${labId}`);
        
        // Debug: Log the full response
        console.log("Full API Response:", res.data);
        setDebugInfo(JSON.stringify(res.data, null, 2));

        // Check if response is successful
        if (!res.data.success) {
          console.error("Response success is false");
          setError("Report request failed - success: false");
          return;
        }

        // Check if data exists
        if (!res.data.data) {
          console.error("res.data.data is null or undefined");
          setError("Report data is missing from response");
          return;
        }

        // Check if report exists
        if (!res.data.data.report) {
          console.error("res.data.data.report is null or undefined");
          setError("Report not found.");
          return;
        }

        console.log("Report data loaded successfully:", res.data.data);
        setReportData(res.data.data);
        setError("");
      } catch (err) {
        console.error("Report Load Error:", err);
        console.error("Error message:", err.message);
        console.error("Error response:", err.response?.data);
        
        if (err.response?.status === 404) {
          setError("Report not found (404)");
        } else if (err.response?.status === 401) {
          setError("Unauthorized - Please login again");
        } else if (err.response?.status === 403) {
          setError("Forbidden - You don't have access to this report");
        } else {
          setError("Failed to load report: " + err.message);
        }
        
        setDebugInfo("Error: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    if (!labId) {
      setError("Lab ID is missing from URL");
      setLoading(false);
      return;
    }

    loadReport();
  }, [labId]);

  if (loading) {
    return <div style={{ padding: "20px" }}>Loading report...</div>;
  }

  if (error) {
    return (
      <div style={{ padding: "20px", color: "red" }}>
        <h3>Error</h3>
        <p>{error}</p>
        <details style={{ marginTop: "20px" }}>
          <summary>Debug Information</summary>
          <pre style={{ backgroundColor: "#f5f5f5", padding: "10px", overflow: "auto" }}>
            {debugInfo}
          </pre>
        </details>
      </div>
    );
  }

  // If no error but still no data
  if (!reportData) {
    return (
      <div style={{ padding: "20px", color: "orange" }}>
        <p>No report data available</p>
        <details>
          <summary>Debug Information</summary>
          <pre style={{ backgroundColor: "#f5f5f5", padding: "10px" }}>
            {debugInfo}
          </pre>
        </details>
      </div>
    );
  }

  const { report, request } = reportData;

  // Validate required data
  if (!request) {
    return (
      <div style={{ padding: "20px", color: "red" }}>
        <p>Request data is missing</p>
      </div>
    );
  }

  // Extract file URL if exists
  const fileUrl = report?.resource?.presentedForm?.[0]?.url;
  console.log("File URL:", fileUrl);

  // Build full URL for PDF viewer
  const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";
  const fullPdfUrl = fileUrl ? `${apiUrl}${fileUrl}` : null;
  console.log("Full PDF URL:", fullPdfUrl);

  return (
    <div style={{ padding: "20px", maxWidth: "900px", margin: "0 auto" }}>
      <h2>{request.testType?.toUpperCase() || "Unknown"} Report</h2>

      {/* STATUS */}
      <div style={{ marginBottom: "20px", padding: "10px", backgroundColor: "#f0f0f0" }}>
        <strong>Status:</strong>{" "}
        <span style={{ color: request.status === "completed" ? "green" : "orange" }}>
          {request.status === "completed" ? "Completed" : "Pending - Report is not uploaded yet"}
        </span>
      </div>

      {/* PDF VIEW */}
      <div style={{ marginBottom: "20px" }}>
        <h3>Report File</h3>
        {fileUrl ? (
          <>
            <p>File URL found: {fileUrl}</p>
            <PDFViewer url={fullPdfUrl} />
          </>
        ) : (
          <p style={{ color: "orange" }}>No file uploaded for this report.</p>
        )}
      </div>

      {/* PARAMETERS */}
      {request.parameters && Object.keys(request.parameters).length > 0 && (
        <div style={{ marginBottom: "20px" }}>
          <h3>Report Parameters</h3>
          <ul>
            {Object.entries(request.parameters).map(([key, value]) => (
              <li key={key}>
                <strong>{key}:</strong> {String(value)}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* RESULT TEXT */}
      {request.resultText && (
        <div style={{ marginBottom: "20px", padding: "10px", backgroundColor: "#fafafa" }}>
          <h3>Conclusion / Notes</h3>
          <p>{request.resultText}</p>
        </div>
      )}

      {/* DEBUG INFO */}
      <details style={{ marginTop: "30px", borderTop: "1px solid #ccc", paddingTop: "10px" }}>
        <summary style={{ cursor: "pointer" }}>Debug Information</summary>
        <pre style={{ backgroundColor: "#f5f5f5", padding: "10px", overflow: "auto", fontSize: "12px" }}>
          {JSON.stringify(
            { labId, reportData, debugInfo },
            null,
            2
          )}
        </pre>
      </details>
    </div>
  );
};

export default SingleReport;