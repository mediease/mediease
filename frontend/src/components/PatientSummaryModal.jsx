import React from 'react';
import './css/PatientSummaryModal.css';
import { FaDownload } from 'react-icons/fa';

const PatientSummaryModal = ({ isOpen, onClose, patientData }) => {
  if (!isOpen) return null;

  // Default patient data structure
  const defaultData = {
    demographics: {
      name: 'John Doe',
      age: 52,
      dob: '1972-08-22',
      mrn: '1002',
      bloodType: 'A+'
    },
    diagnoses: [
      { name: 'Hypertension', snomed: '3834100' },
      { name: 'Hyperlipidemia', snomed: '205890000' }
    ],
    medications: [
      { name: 'Amlodipine', dosage: '5mg', condition: 'Hypertension' },
      { name: 'Atorvastatin', dosage: '20mg', condition: 'Hyperlipidemia' }
    ],
    allergies: [
      { name: 'NSAIDS', severity: 'Moderate', reaction: 'GI upset' }
    ],
    labFindings: [
      { name: 'Blood Pressure', value: '150/92 mmHg' }
    ],
    assessment: 'This is a 52-year-old patient with 2 active medical conditions requiring ongoing management. Current medication regimen includes 2 medications. Notable allergies documented. Recent vital signs and laboratory parameters are available.',
    recommendation: 'Continue current management with regular monitoring and follow-up appointments.'
  };

  const data = patientData || defaultData;

  const handleDownload = () => {
    // Create a text representation of the summary
    const summaryText = `
PATIENT MEDICAL HISTORY SUMMARY
AI-Generated Summarization Report

PATIENT DEMOGRAPHICS:
Name: ${data.demographics.name}
Age: ${data.demographics.age} years
DOB: ${data.demographics.dob}
MRN: ${data.demographics.mrn}
Blood Type: ${data.demographics.bloodType}

ACTIVE DIAGNOSES (${data.diagnoses.length}):
${data.diagnoses.map((d, i) => `${i + 1}. ${d.name} (SNOMED: ${d.snomed})`).join('\n')}

CURRENT MEDICATIONS (${data.medications.length}):
${data.medications.map((m, i) => `${i + 1}. ${m.name} ${m.dosage} for ${m.condition}`).join('\n')}

KNOWN ALLERGIES (${data.allergies.length}):
${data.allergies.map((a, i) => `${i + 1}. ${a.name} (${a.severity} - ${a.reaction})`).join('\n')}

RECENT LABORATORY FINDINGS:
${data.labFindings.map((l, i) => `${i + 1}. ${l.name}: ${l.value}`).join('\n')}

CLINICAL ASSESSMENT:
${data.assessment}

RECOMMENDATION:
${data.recommendation}
    `.trim();

    // Create a blob and download
    const blob = new Blob([summaryText], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Patient_Summary_${data.demographics.mrn}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="summary-modal-overlay" onClick={onClose}>
      <div className="summary-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="summary-modal-header">
          <h2 className="summary-modal-title">Patient Medical History Summary</h2>
          <p className="summary-modal-subtitle">AI-Generated Summarization Report</p>
        </div>

        <div className="summary-modal-body">
          {/* Patient Demographics */}
          <div className="summary-section">
            <h3 className="summary-section-title">PATIENT DEMOGRAPHICS:</h3>
            <div className="summary-details">
              <div className="summary-detail-row">
                <span className="summary-label">Name:</span>
                <span className="summary-value">{data.demographics.name}</span>
              </div>
              <div className="summary-detail-row">
                <span className="summary-label">Age:</span>
                <span className="summary-value">{data.demographics.age} years</span>
              </div>
              <div className="summary-detail-row">
                <span className="summary-label">DOB:</span>
                <span className="summary-value">{data.demographics.dob}</span>
              </div>
              <div className="summary-detail-row">
                <span className="summary-label">MRN:</span>
                <span className="summary-value">{data.demographics.mrn}</span>
              </div>
              <div className="summary-detail-row">
                <span className="summary-label">Blood Type:</span>
                <span className="summary-value">{data.demographics.bloodType}</span>
              </div>
            </div>
          </div>

          {/* Active Diagnoses */}
          <div className="summary-section">
            <h3 className="summary-section-title">ACTIVE DIAGNOSES ({data.diagnoses.length}):</h3>
            <ol className="summary-list">
              {data.diagnoses.map((diagnosis, index) => (
                <li key={index} className="summary-list-item">
                  {diagnosis.name} (SNOMED: {diagnosis.snomed})
                </li>
              ))}
            </ol>
          </div>

          {/* Current Medications */}
          <div className="summary-section">
            <h3 className="summary-section-title">CURRENT MEDICATIONS ({data.medications.length}):</h3>
            <ol className="summary-list">
              {data.medications.map((medication, index) => (
                <li key={index} className="summary-list-item">
                  {medication.name} {medication.dosage} for {medication.condition}
                </li>
              ))}
            </ol>
          </div>

          {/* Known Allergies */}
          <div className="summary-section">
            <h3 className="summary-section-title">KNOWN ALLERGIES ({data.allergies.length}):</h3>
            <ol className="summary-list">
              {data.allergies.map((allergy, index) => (
                <li key={index} className="summary-list-item">
                  {allergy.name} ({allergy.severity} - {allergy.reaction})
                </li>
              ))}
            </ol>
          </div>

          {/* Recent Laboratory Findings */}
          <div className="summary-section">
            <h3 className="summary-section-title">RECENT LABORATORY FINDINGS:</h3>
            <ol className="summary-list">
              {data.labFindings.map((finding, index) => (
                <li key={index} className="summary-list-item">
                  {finding.name}: {finding.value}
                </li>
              ))}
            </ol>
          </div>

          {/* Clinical Assessment */}
          <div className="summary-section">
            <h3 className="summary-section-title">CLINICAL ASSESSMENT:</h3>
            <p className="summary-text">{data.assessment}</p>
          </div>

          {/* Recommendation */}
          <div className="summary-section">
            <h3 className="summary-section-title">RECOMMENDATION:</h3>
            <p className="summary-text">{data.recommendation}</p>
          </div>
        </div>

        <div className="summary-modal-footer">
          <button className="summary-btn-close" onClick={onClose}>
            Close
          </button>
          <button className="summary-btn-download" onClick={handleDownload}>
            <FaDownload className="download-icon" />
            Download
          </button>
        </div>
      </div>
    </div>
  );
};

export default PatientSummaryModal;

