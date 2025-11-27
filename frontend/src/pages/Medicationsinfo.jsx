import { useParams, useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import SegmentedControl from "../components/SegmentedControl";
import TableN1 from "../components/tableN1";
import SimpleButton from "../components/buttons";
import httpClient from "../services/httpClient";
import QRCode from "react-qr-code";
import "./css/style.css";

const MedicationsInfo = () => {
  const { id } = useParams(); // patient PHN
  const navigate = useNavigate();

  const filterOptions = [
    "Basic",
    "Report",
    "Allergies",
    "Medications",
    "Visit History",
  ];

  const [selectedFilter, setSelectedFilter] = useState("Medications");
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState(null);

  // ----------------------------------------------------
  // LOAD FROM BACKEND (FHIR BUNDLE)
  // ----------------------------------------------------
  useEffect(() => {
    const load = async () => {
      try {
        const res = await httpClient.get(`/fhir/MedicationRequest/${id}`);

        const entries = res?.data?.data?.entry || [];

        const mapped = entries.map((item) => {
          const r = item.resource;

          // Extract complaint
          let complaint = "-";
          if (r.note && r.note.length > 0) {
            // note looks like "Complaint: Headache"
            complaint = r.note[0].text.replace("Complaint:", "").trim();
          }

          // Extract doctor ID (Practitioner/MED12345 → MED12345)
          const doctorRef = r.requester?.reference || "-";
          const doctor = doctorRef.includes("/") ? doctorRef.split("/")[1] : doctorRef;

          // Extract visit type
          let visitType = "-";
          if (r.extension) {
            const visitExt = r.extension.find((e) =>
              e.url.includes("visit-type")
            );
            if (visitExt) visitType = visitExt.valueString;
          }

          return {
            prescriptionId: r.id,
            complaint,
            doctor,
            visitType,
            status: r.status || "-",
            date: r.authoredOn
              ? new Date(r.authoredOn).toLocaleDateString()
              : "-",
            full: r,
          };
        });

        setPrescriptions(mapped);
      } catch (err) {
        console.error("Error loading prescriptions:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  // ----------------------------------------------------
  // TABLE COLUMNS
  // ----------------------------------------------------
  const columns = [
    { label: "Prescription ID", key: "prescriptionId" },
    { label: "Complaint", key: "complaint" },
    { label: "Doctor", key: "doctor" },
    { label: "Visit Type", key: "visitType" },
    { label: "Date", key: "date" },
    { label: "Status", key: "status" },
    { label: "View", key: "view" },
  ];

  const data = prescriptions.map((p) => ({
    ...p,
    view: (
      <button onClick={() => {
        setSelectedPrescription(p.full);
        setShowModal(true);
      }}>
        View
      </button>
    ),
  }));

  // ----------------------------------------------------
  // TAB LOGIC
  // ----------------------------------------------------
  const handleTabChange = (option) => {
    setSelectedFilter(option);

    const base = `/doctor/patient/${id}`;

    const routes = {
      Basic: `/doctor/patient/${id}`,
      Report: `${base}/reportinfo`,
      Allergies: `${base}/allergiesinfo`,
      Medications: `${base}/medicationsinfo`,
      "Visit History": `${base}/historyinfo`,
    };

    navigate(routes[option] || base);
  };

  const handleIssuePrescription = () => {
    navigate(`/doctor/patient/${id}/medicationsinfo/newprescription`);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedPrescription(null);
  };

  return (
    <div className="patientDetailsMain">
      <h2 className="patientDetailsHeder">Patients - Medication Records</h2>

      <SegmentedControl
        options={filterOptions}
        selected={selectedFilter}
        onChange={handleTabChange}
      />

      {loading ? (
        <p>Loading prescriptions...</p>
      ) : (
        <TableN1
          columns={columns}
          data={data}
          showHeader={true}
          showActions={false}
        />
      )}

      <div className="inlineButton" style={{ justifyContent: "flex-end" }}>
        <SimpleButton
          label="Issue New Prescription"
          onClick={handleIssuePrescription}
        />
      </div>

      {showModal && selectedPrescription && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
          onClick={closeModal}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "2rem",
              borderRadius: "8px",
              maxWidth: "600px",
              maxHeight: "80vh",
              overflow: "auto",
              position: "relative",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeModal}
              style={{
                position: "absolute",
                top: "1rem",
                right: "1rem",
                border: "none",
                background: "#f44336",
                color: "white",
                padding: "0.5rem 1rem",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Close
            </button>

            <h3 style={{ marginBottom: "1rem" }}>Prescription Details</h3>

            <div style={{ marginBottom: "1.5rem" }}>
              <p><strong>Prescription ID:</strong> {selectedPrescription.id || '-'}</p>
              <p><strong>Status:</strong> {selectedPrescription.status || '-'}</p>
              <p><strong>Patient:</strong> {selectedPrescription.subject?.display || selectedPrescription.subject?.reference || '-'}</p>
              <p><strong>Doctor:</strong> {selectedPrescription.requester?.display || selectedPrescription.requester?.reference || '-'}</p>
              <p><strong>Medication:</strong> {selectedPrescription.medicationCodeableConcept?.text || '-'}</p>
              <p><strong>Date:</strong> {selectedPrescription.authoredOn ? new Date(selectedPrescription.authoredOn).toLocaleString() : '-'}</p>
              
              {selectedPrescription.dosageInstruction && selectedPrescription.dosageInstruction.length > 0 && (
                <p><strong>Dosage:</strong> {selectedPrescription.dosageInstruction[0].text || '-'}</p>
              )}
              
              {selectedPrescription.note && selectedPrescription.note.length > 0 && (
                <p><strong>Notes:</strong> {selectedPrescription.note[0].text || '-'}</p>
              )}
            </div>

            <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
              <h4 style={{ marginBottom: "1rem" }}>Prescription QR Code</h4>
              <div style={{ background: "white", padding: "1rem", display: "inline-block" }}>
                <QRCode
                  value={JSON.stringify(selectedPrescription)}
                  size={200}
                  level="M"
                />
              </div>
              <p style={{ marginTop: "0.5rem", fontSize: "0.85rem", color: "#666" }}>
                Scan to view full prescription details
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicationsInfo;
