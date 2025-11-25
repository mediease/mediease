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

const Visitpatient = () => {
  const { id } = useParams(); // PHN
  const navigate = useNavigate();

  const filterOptions = ["Basic", "Report", "Allergies", "Medications", "Visit History"];
  const [selectedFilter, setSelectedFilter] = useState("Basic");

  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);

  // ---------- LOAD PATIENT ----------
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

  // ---------- TAB NAVIGATION ----------
  const handleTabChange = (option) => {
    setSelectedFilter(option);
    navigate(`/doctor/patient/${id}/${option.toLowerCase().replace(" ", "")}`);
  };

  // ---------- CLOSE VISIT BUTTON ----------
  const handleCloseVisit = async () => {
    try {
      // 1. Get doctor license
      let doctorLicense = null;
      const raw = localStorage.getItem("doctor");
      if (raw) doctorLicense = JSON.parse(raw).medicalLicenseId;

      // 2. Load all encounters for this patient
      const encRes = await httpClient.get("/fhir/Encounter", {
        params: { patient: id }
      });
      const encounters = encRes.data.data || [];

      // 3. Find the active encounter
      const activeEncounter = encounters.find(enc =>
        enc.metadata?.status === "in-progress" &&
        enc.metadata?.doctorLicense === doctorLicense
      );

      if (!activeEncounter) {
        alert("No active visit found.");
        return;
      }

      const encounterId = activeEncounter.id;

      // 4. Send PUT to close
      await httpClient.put(`/fhir/Encounter/${encounterId}`, {
        metadata: {
          status: "finished",
          endTime: new Date().toISOString()
        }
      });

      alert("Visit successfully closed.");
      navigate("/doctor/patients");

    } catch (error) {
      console.error("Error closing visit:", error);
      alert("Failed to close visit.");
    }
  };

  // ---------- OTHER BUTTONS ----------
  const clickVisit = () => navigate(`/doctor/patient/${id}/medicationsinfo/newprescription`);
  const handleAddAllergy = () => navigate(`/doctor/patient/${id}/allergiesinfo`);
  const handleOrderNewReport = () => navigate(`/doctor/visitpatient/${id}/order-report`);
  const handleRequestSummary = () => setIsSummaryModalOpen(true);
  const handleCloseSummary = () => setIsSummaryModalOpen(false);

  if (loading) return <p>Loading...</p>;

  const name = resolveName(patient);
  const phn = resolvePhn(patient);
  const nic = resolveNic(patient);
  const gender = patient?.resource?.gender || "-";
  const dob = patient?.resource?.birthDate || "-";

  return (
    <div className="patientDetailsMain">
      <h2 className="patientDetailsHeder">Patients - {name}</h2>

      <SegmentedControl
        options={filterOptions}
        selected={selectedFilter}
        onChange={handleTabChange}
      />

      <div className="table-row">
        <div className="table-half">
          <PatientOverview
            dpUrl=""
            fullName={name}
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
