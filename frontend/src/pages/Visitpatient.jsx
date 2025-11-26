import { useParams, useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import PatientOverview from "../components/PatientOverview";
import SegmentedControl from "../components/SegmentedControl";
import HealthInfoCard from "../components/HealthInfoCard";
import SimpleButton from "../components/buttons";
import RedButton from "../components/Redbutton";
import PatientSummaryModal from "../components/PatientSummaryModal";
import httpClient from "../services/httpClient";
import "./css/style.css";

// ------------------ Helper Extractors ------------------
const resolvePhn = (p) => {
  if (p?.metadata?.patientPhn) return p.metadata.patientPhn;
  const ids = p?.resource?.identifier || [];
  const obj = ids.find(i => (i.system || "").includes("phn"));
  return obj?.value || "-";
};

const resolveNic = (p) => {
  const ids = p?.resource?.identifier || [];
  const obj = ids.find(i => (i.system || "").includes("nic"));
  return obj?.value || "-";
};

const resolveName = (p) => {
  if (p?.metadata?.firstName || p?.metadata?.lastName)
    return `${p.metadata.firstName || ""} ${p.metadata.lastName || ""}`.trim();

  const name = p?.resource?.name?.[0];
  return [name?.given?.[0], name?.family].filter(Boolean).join(" ") || "-";
};

// ------------------ Component ------------------
const Visitpatient = () => {
  const { id } = useParams(); // PHN
  const navigate = useNavigate();

  const filterOptions = [
    "Basic",
    "Report",
    "Allergies",
    "Medications",
    "Visit History"
  ];

  const [selectedFilter, setSelectedFilter] = useState("Basic");
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);

  // ------------------ Load Patient ------------------
  useEffect(() => {
    const load = async () => {
      try {
        const res = await httpClient.get(`/fhir/Patient/${id}`);
        setPatient(res.data.data);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  // ------------------ FIXED Navigation ------------------
  const handleTabChange = (option) => {
    setSelectedFilter(option);

    switch (option) {
      case "Basic":
        navigate(`/doctor/patient/${id}`);
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

  // ------------------ Close Visit Handler ------------------
  const handleCloseVisit = async () => {
    try {
      const doctorRaw = localStorage.getItem("doctor");
      const doctor = doctorRaw ? JSON.parse(doctorRaw) : {};
      const doctorLicense = doctor?.medicalLicenseId;

      if (!doctorLicense) {
        alert("Doctor license missing.");
        return;
      }

      const encRes = await httpClient.get("/fhir/Encounter", {
        params: { patient: id }
      });

      const encounters = encRes?.data?.data || [];

      const activeEncounter = encounters.find(enc =>
        enc.metadata?.status === "in-progress" &&
        enc.metadata?.doctorLicense === doctorLicense
      );

      if (!activeEncounter) {
        alert("No active encounter found.");
        return;
      }

      const encounterId = activeEncounter.id;

      await httpClient.put(`/fhir/Encounter/${encounterId}`, {
        status: "finished",
        endTime: new Date().toISOString()
      });

      alert("Visit closed successfully.");
      navigate("/doctor/patients");

    } catch (error) {
      console.error("Close visit failed:", error);
      alert("Failed to close visit.");
    }
  };

  const clickVisit = () =>
    navigate(`/doctor/patient/${id}/medicationsinfo/newprescription`);

  const handleAddAllergy = () =>
    navigate(`/doctor/patient/${id}/allergiesinfo`);

  const handleOrderNewReport = () =>
    navigate(`/doctor/visitpatient/${id}/order-report`);

  const handleRequestSummary = () => setIsSummaryModalOpen(true);
  const handleCloseSummary = () => setIsSummaryModalOpen(false);

  if (loading) return <p>Loading...</p>;

  const fullName = resolveName(patient);
  const phn = resolvePhn(patient);
  const nic = resolveNic(patient);
  const gender = patient?.resource?.gender || "-";
  const dob = patient?.resource?.birthDate || "-";

  return (
    <div className="patientDetailsMain">
      <h2 className="patientDetailsHeder">Patients - {fullName}</h2>

      <SegmentedControl
        options={filterOptions}
        selected={selectedFilter}
        onChange={handleTabChange}
      />

      <div className="table-row">
        <div className="table-half">
          <PatientOverview
            dpUrl=""
            fullName={fullName}
            phn={phn}
            nic={nic}
            gender={gender}
            dob={dob}
            contactNo="-"
            address="-"
            guardianName="-"
            guardianNIC="-"
          />
        </div>

        <div className="table-half">
          <HealthInfoCard
            height={170}
            weight={70}
            bmi={23}
            bloodPressure="120/80"
            sugarLevel={110}
          />

          <div className="buttonContainer">
            <div className="inlineButton">
              <SimpleButton label="Order New Report" onClick={handleOrderNewReport} />
              <SimpleButton label="Add Allergies" onClick={handleAddAllergy} />
            </div>

            <div className="inlineButton">
              <SimpleButton label="Request Summary" onClick={handleRequestSummary} />
              <SimpleButton label="New Prescription" onClick={clickVisit} />
            </div>

            <div className="inlineButton">
              <RedButton label="Close the Visit" onClick={handleCloseVisit} />
            </div>
          </div>
        </div>
      </div>

      <PatientSummaryModal
        isOpen={isSummaryModalOpen}
        onClose={handleCloseSummary}
        patientData={{}}
      />
    </div>
  );
};

export default Visitpatient;
