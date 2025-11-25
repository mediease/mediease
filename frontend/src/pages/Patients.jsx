import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import SectionHeader from "../components/SectionHeader";
import SegmentedTable from "../components/SegmentedTable";
import SimpleButton from "../components/buttons";
import httpClient from "../services/httpClient";
import "./css/style.css";

// ---------- Helper Functions ----------
const resolvePhn = (p) => {
  if (p?.metadata?.patientPhn) return p.metadata.patientPhn;
  if (p?.phn) return p.phn;
  const ids = p?.resource?.identifier;
  if (Array.isArray(ids)) {
    const found = ids.find((id) => (id.system || "").includes("phn"));
    if (found?.value) return found.value;
  }
  return null;
};

const resolveName = (p) => {
  if (p?.metadata?.firstName || p?.metadata?.lastName) {
    return `${p.metadata.firstName || ""} ${p.metadata.lastName || ""}`.trim();
  }
  const n = p?.resource?.name?.[0];
  if (!n) return "Unknown";
  return `${n?.given?.[0] || ""} ${n?.family || ""}`.trim();
};

const resolveNic = (p) => {
  const ids = p?.resource?.identifier;
  if (Array.isArray(ids)) {
    const found = ids.find((id) => (id.system || "").includes("nic"));
    return found?.value || "-";
  }
  return "-";
};

const findLatestEncounterDate = (encs) => {
  if (!Array.isArray(encs)) return null;
  let latest = null;
  encs.forEach((enc) => {
    const date = enc.metadata?.startTime || enc.resource?.period?.start;
    if (!date) return;
    const d = new Date(date);
    if (!latest || d > latest) latest = d;
  });
  return latest;
};

const Patients = () => {
  const navigate = useNavigate();
  const mountedRef = useRef(true);
  const [loading, setLoading] = useState(true);
  const [allPatients, setAllPatients] = useState([]);
  const [visitedPatients, setVisitedPatients] = useState([]);
  const [displayData, setDisplayData] = useState([]);
  const [tableState, setTableState] = useState("All");

  // Logged-in doctor license
  let doctorLicense = null;
  try {
    const doctorRaw = localStorage.getItem("doctor");
    const doctorObj = doctorRaw ? JSON.parse(doctorRaw) : null;
    doctorLicense = doctorObj?.medicalLicenseId || null;
  } catch {}

  const handleAddNewPatient = () => navigate("/doctor/patients/new");

  // ---------- CLICK ON PATIENT: CHECK ACTIVE VISIT ----------
  const handleRowClick = async (row) => {
    const phn = row.phn;
    if (!phn) return;

    try {
      const encRes = await httpClient.get("/fhir/Encounter", {
        params: { patient: phn }
      });
      const encounters = encRes?.data?.data || [];

      const hasActiveVisit = encounters.some((enc) => {
        const sameDoctor = enc.metadata?.doctorLicense === doctorLicense;
        const status = enc.metadata?.status || enc.resource?.status;
        return sameDoctor && status === "in-progress";
      });

      if (hasActiveVisit) {
        navigate(`/doctor/visitpatient/${phn}`);
      } else {
        navigate(`/doctor/patient/${phn}`);
      }

    } catch (err) {
      console.error("Error checking active visit:", err);
      navigate(`/doctor/patient/${phn}`);
    }
  };

  // ---------- LOAD PATIENTS ----------
  useEffect(() => {
    mountedRef.current = true;
    const load = async () => {
      setLoading(true);
      try {
        const patientRes = await httpClient.get("/fhir/Patient/");
        const rawPatients = patientRes?.data?.data || [];

        const shapedAll = rawPatients.map((p) => {
          const phn = resolvePhn(p) || "-";
          return {
            phn,
            name: resolveName(p),
            gender: p.metadata?.gender || p.resource?.gender || "-",
            nic: resolveNic(p),
            nearestVisitDate: "-",
            _raw: p,
          };
        });

        if (mountedRef.current) setAllPatients(shapedAll);

        // ---------- ENCOUNTER MATCHING FOR VISITED LIST ----------
        if (doctorLicense) {
          const visitPromises = rawPatients.map(async (p) => {
            const phn = resolvePhn(p);
            if (!phn) return null;

            try {
              const encRes = await httpClient.get("/fhir/Encounter", {
                params: { patient: phn }
              });

              const encounters = encRes?.data?.data || [];
              const visited = encounters.some(
                (enc) => enc.metadata?.doctorLicense === doctorLicense
              );

              if (!visited) return null;

              const latestDate = findLatestEncounterDate(encounters);

              return {
                phn,
                name: resolveName(p),
                gender: p.metadata?.gender || p.resource?.gender || "-",
                nic: resolveNic(p),
                nearestVisitDate: latestDate
                  ? latestDate.toLocaleDateString()
                  : "-",
              };
            } catch {
              return null;
            }
          });

          const visitedResults = await Promise.all(visitPromises);
          const filteredVisited = visitedResults.filter(Boolean);

          if (mountedRef.current) {
            setVisitedPatients(filteredVisited);
            setAllPatients((prev) =>
              prev.map((ap) => {
                const match = filteredVisited.find((v) => v.phn === ap.phn);
                return match
                  ? { ...ap, nearestVisitDate: match.nearestVisitDate }
                  : ap;
              })
            );
          }
        }
      } catch (err) {
        if (mountedRef.current) {
          setAllPatients([]);
          setVisitedPatients([]);
        }
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    };

    load();
    return () => {
      mountedRef.current = false;
    };
  }, [doctorLicense]);

  // ---------- SET TABLE ----------
  useEffect(() => {
    if (tableState === "All") {
      setDisplayData(allPatients);
    } else {
      setDisplayData(visitedPatients);
    }
  }, [tableState, allPatients, visitedPatients]);

  const columns = [
    { label: "PHN", key: "phn" },
    { label: "Patient Name", key: "name" },
    { label: "Gender", key: "gender" },
    { label: "NIC", key: "nic" },
    { label: "Nearest Visit Date", key: "nearestVisitDate" },
  ];

  return (
    <div>
      <SectionHeader title="Patients" />
      <SegmentedTable
        columns={columns}
        data={displayData}
        filterOptions={["All", "Clinic Visit"]}
        handleRowClick={handleRowClick}
        tableState={tableState}
        setTableState={setTableState}
        loading={loading}
      />
      <div className="buttonContainer">
        <SimpleButton label="Add a New Patient" onClick={handleAddNewPatient} />
      </div>
    </div>
  );
};

export default Patients;
