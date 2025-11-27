import React from "react";
import "./css/PatientSummaryModal.css";

const PatientSummaryModal = ({ isOpen, onClose, patientData }) => {
  if (!isOpen) return null;

  const summary =
    typeof patientData === "string"
      ? patientData
      : patientData?.summary || "No summary available.";

  return (
    <div className="summaryModalBackdrop">
      <div className="summaryModal">
        <h2 className="summaryTitle">Patient Summary</h2>

        <div className="summaryContent">
          <p style={{ whiteSpace: "pre-line" }}>{summary}</p>
        </div>

        <button className="summaryCloseBtn" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};

export default PatientSummaryModal;
