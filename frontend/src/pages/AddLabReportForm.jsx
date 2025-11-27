import React, { useEffect, useState } from "react";
import httpClient from "../services/httpClient";
import { useParams, useNavigate } from "react-router-dom";
import "./css/AddLabReportForm.css";

// ---------------------------
// TEST CONFIG
// ---------------------------
const TEST_CONFIG = {
  ecg: {
    fileRequired: true,
    fileTypes: ["pdf"],
    parameters: [],
    optionalText: true,
  },
  blood_sugar: {
    fileRequired: false,
    fileTypes: [],
    parameters: ["value"],
    optionalText: false,
  },
  cbc: {
    fileRequired: false,
    fileTypes: ["pdf", "image"],
    parameters: [
      "hemoglobin", "rbc", "hematocrit", "mcv", "mch", "mchc",
      "wbc", "neutrophils", "lymphocytes", "monocytes",
      "eosinophils", "basophils", "platelets",
    ],
    optionalText: false,
  },
  xray: {
    fileRequired: true,
    fileTypes: ["pdf", "image"],
    parameters: [],
    optionalText: true,
  },
  lipid_profile: {
    fileRequired: false,
    fileTypes: ["pdf", "image"],
    parameters: [
      "totalCholesterol", "ldl", "hdl", "triglycerides", "vldl",
    ],
    optionalText: false,
  },
  urine_test: {
    fileRequired: false,
    fileTypes: ["pdf", "image"],
    parameters: [
      "color", "clarity", "pH", "specificGravity", "protein", "glucose",
      "ketones", "bilirubin", "nitrites", "leukocytes", "rbc",
      "wbc", "epithelialCells", "bacteria",
    ],
    optionalText: false,
  },
  lft: {
    fileRequired: false,
    fileTypes: ["pdf", "image"],
    parameters: [
      "alt", "ast", "alp", "ggt", "totalBilirubin",
      "directBilirubin", "indirectBilirubin", "albumin", "totalProtein",
    ],
    optionalText: false,
  },
  kft: {
    fileRequired: false,
    fileTypes: ["pdf", "image"],
    parameters: [
      "creatinine", "urea", "bun", "egfr",
      "uricAcid", "sodium", "potassium", "chloride",
    ],
    optionalText: false,
  },
};

// ---------------------------
// COMPONENT
// ---------------------------
const AddLabReportForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState(null);
  const [params, setParams] = useState({});
  const [resultText, setResultText] = useState("");

  // Fetch order details from /pending
  useEffect(() => {
    fetchOrderDetails();
  }, []);

  const fetchOrderDetails = async () => {
    try {
      const res = await httpClient.get(`/api/lab/pending`);
      const list = res.data?.data || [];
      const found = list.find(item => item._id === id);
      setOrder(found);
    } catch (error) {
      console.error("Error fetching pending order:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleParamChange = (key, value) => {
    setParams({ ...params, [key]: value });
  };

  // ---------------------------
  // SUBMIT REPORT
  // ---------------------------
  const handleSubmit = async () => {
    const config = TEST_CONFIG[order.testType];

    if (config.fileRequired && !file) {
      alert("This test requires a file upload!");
      return;
    }

    const formData = new FormData();
    formData.append("testType", order.testType);

    // Add parameters
    if (config.parameters.length > 0) {
      formData.append("parameters", JSON.stringify(params));
    }

    // Optional text
    if (config.optionalText && resultText.trim()) {
      formData.append("resultText", resultText.trim());
    }

    // File
    if (file) {
      formData.append("file", file);
    }

    try {
      await httpClient.post(`/api/lab/upload/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Report uploaded successfully!");
      navigate("/lab-assistant/add-report");

    } catch (error) {
      console.error("Submit failed:", error);
      alert("Error submitting report.");
    }
  };

  // ---------------------------
  // LOADING UI
  // ---------------------------
  if (loading) return <p>Loading...</p>;
  if (!order) return <p>Order not found.</p>;

  const config = TEST_CONFIG[order.testType];

  return (
    <div className="lab-report-form-container">

      <h2>Add Report — {order.testType.toUpperCase()}</h2>
      <p><strong>Patient PHN:</strong> {order.patientPhn}</p>
      <p><strong>Doctor:</strong> {order.doctorLicense}</p>
      <br />

      {/* ---------------------- */}
      {/* FILE UPLOAD SECTION    */}
      {/* ---------------------- */}
      {config.fileTypes.length > 0 && (
        <div className="form-section">
          <label><strong>Upload File {config.fileRequired ? "(Required)" : "(Optional)"}</strong></label>

          <input
            type="file"
            accept={
              config.fileTypes.includes("image")
                ? "image/*,application/pdf"
                : "application/pdf"
            }
            onChange={(e) => setFile(e.target.files[0])}
          />

          {config.fileRequired && (
            <p style={{ color: "red", fontSize: "14px" }}>
              * File must be uploaded for this test.
            </p>
          )}
        </div>
      )}

      {/* ---------------------- */}
      {/* PARAMETERS SECTION     */}
      {/* ---------------------- */}
      {config.parameters.length > 0 && (
        <div className="form-section">
          <label><strong>Test Parameters</strong></label>

          <div className="parameter-grid">
            {config.parameters.map((key) => (
              <div key={key} className="param-input">
                <label>{key}</label>
                <input
                  type="text"
                  onChange={(e) => handleParamChange(key, e.target.value)}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ---------------------- */}
      {/* OPTIONAL RESULT TEXT   */}
      {/* ---------------------- */}
      {config.optionalText && (
        <div className="form-section">
          <label><strong>Result Summary (Optional)</strong></label>
          <textarea
            placeholder="Add comments, findings, or interpretations..."
            onChange={(e) => setResultText(e.target.value)}
          />
        </div>
      )}

      {/* ---------------------- */}
      {/* SUBMIT BUTTON          */}
      {/* ---------------------- */}
      <button className="submit-btn" onClick={handleSubmit}>
        Submit Report
      </button>

    </div>
  );
};

export default AddLabReportForm;
