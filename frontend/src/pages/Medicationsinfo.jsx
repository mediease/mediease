import { useParams, useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import SegmentedControl from "../components/SegmentedControl";
import TableN1 from "../components/tableN1";
import SimpleButton from "../components/buttons";
import httpClient from "../services/httpClient";
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
      <button onClick={() => alert(JSON.stringify(p.full, null, 2))}>
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
    </div>
  );
};

export default MedicationsInfo;
