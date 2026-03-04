import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import httpClient from "../services/httpClient";
import PDFViewer from "../components/PDFviwer";
import "./css/singleReport.css";

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

        const { diagnosticReport, labRequest, patient, encounter, observation } = res.data.data;

        setData({
          diagnosticReport: diagnosticReport || null,
          labRequest: labRequest || {},
          patient: patient || {},
          encounter: encounter || {},
          observation: observation || null,
        });

      } catch (e) {
        setError("Request failed: " + e.message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [reportId]);

  if (loading) return <div className="sr-loading">Loading...</div>;
  if (error) return <div className="sr-error">{error}</div>;
  // if (!data) return <div className="sr-error">No report data found</div>;

  const { diagnosticReport, labRequest, patient, observation } = data;

  const testType = labRequest.testType || diagnosticReport?.testType || "Unknown";
  const status = labRequest.status || "pending";
  const isPending = status === "pending";

  const resultText =
    labRequest.resultText || diagnosticReport?.resource?.conclusion || "";

  const mimeType = diagnosticReport?.resource?.presentedForm?.[0]?.contentType || "";
  const fileUrl =
    labRequest.fileUrl ||
    diagnosticReport?.resource?.presentedForm?.[0]?.url ||
    null;

  // Cloudinary URLs are absolute; legacy local paths need the API base prepended
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const resolvedUrl = fileUrl
    ? fileUrl.startsWith("http") ? fileUrl : apiUrl + fileUrl
    : null;

  const isPdf =
    mimeType === "application/pdf" ||
    resolvedUrl?.toLowerCase().includes(".pdf");

  // Parameters: from FHIRObservation components, or fallback to labRequest.parameters
  const paramComponents = observation?.resource?.component || [];
  const paramMap = labRequest.parameters || {};
  const hasParams = paramComponents.length > 0 || Object.keys(paramMap).length > 0;

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
        {isPending && (
          <p style={{ color: "#888", fontSize: "14px", marginTop: "4px" }}>
            Awaiting lab results upload.
          </p>
        )}
      </div>

      {/* Parameters / Test Results */}
      {!isPending && hasParams && (
        <div className="sr-card">
          <h3>Test Results</h3>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", padding: "6px 8px", borderBottom: "1px solid #ddd" }}>Parameter</th>
                <th style={{ textAlign: "left", padding: "6px 8px", borderBottom: "1px solid #ddd" }}>Value</th>
              </tr>
            </thead>
            <tbody>
              {paramComponents.length > 0
                ? paramComponents.map((c, i) => (
                    <tr key={i}>
                      <td style={{ padding: "6px 8px", borderBottom: "1px solid #f0f0f0" }}>
                        {c.code?.text || "-"}
                      </td>
                      <td style={{ padding: "6px 8px", borderBottom: "1px solid #f0f0f0" }}>
                        {c.valueString || "-"}
                      </td>
                    </tr>
                  ))
                : Object.entries(paramMap).map(([key, val]) => (
                    <tr key={key}>
                      <td style={{ padding: "6px 8px", borderBottom: "1px solid #f0f0f0" }}>{key}</td>
                      <td style={{ padding: "6px 8px", borderBottom: "1px solid #f0f0f0" }}>{val}</td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Report File */}
      {!isPending && (
        <div className="sr-card">
          <h3>Report File</h3>
          {resolvedUrl ? (
            <>
              {isPdf ? (
                <PDFViewer pdfUrl={resolvedUrl} />
              ) : (
                <img
                  src={resolvedUrl}
                  alt="Lab report"
                  style={{ maxWidth: "100%", borderRadius: "8px" }}
                />
              )}
              <a
                href={resolvedUrl}
                target="_blank"
                rel="noreferrer"
                style={{ display: "block", marginTop: "8px" }}
              >
                Open / Download
              </a>
            </>
          ) : (
            <p>No file attached</p>
          )}
        </div>
      )}

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
