import { useParams, useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import PatientOverview from "../components/PatientOverview";
import SegmentedControl from "../components/SegmentedControl";
import HealthInfoCard from "../components/HealthInfoCard";
import SimpleButton from '../components/buttons';
import './css/style.css';
import httpClient from '../services/httpClient';

const PatientDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const filterOptions = ["Basic", "Report", "Allergies", "Medications", "Visit History"];

  const [selectedFilter, setSelectedFilter] = useState("Basic");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [patientData, setPatientData] = useState(null);
  const [healthData, setHealthData] = useState({
    height: '-',
    weight: '-',
    bmi: '-',
    bloodPressure: '-',
    sugarLevel: '-',
  });

  // ---------- TAB NAVIGATION ----------
  const handleTabChange = (option) => {
    setSelectedFilter(option);

    switch(option) {
      case "Basic": navigate(`/doctor/patient/${id}`); break;
      case "Report": navigate(`/doctor/patient/${id}/reportinfo`); break;
      case "Allergies": navigate(`/doctor/patient/${id}/allergiesinfo`); break;
      case "Medications": navigate(`/doctor/patient/${id}/medicationsinfo`); break;
      case "Visit History": navigate(`/doctor/patient/${id}/historyinfo`); break;
      default: navigate(`/doctor/patient/${id}`);
    }
  };

  const clickVisit = () => {
    navigate(`/doctor/patient/${id}/visit`);
  };

  // ---------- FHIR EXTRACTORS ----------
  const extractPhn = (res) => {
    const metaPhn = res?.metadata?.patientPhn;
    if (metaPhn) return metaPhn;
    const identifiers = res?.resource?.identifier || [];
    const phnObj = identifiers.find(i => (i.system || '').includes('phn'));
    return phnObj?.value || id;
  };

  const extractNic = (res) => {
    const identifiers = res?.resource?.identifier || [];
    const nicObj = identifiers.find(i => (i.system || '').includes('nic'));
    return nicObj?.value || '-';
  };

  const extractName = (res) => {
    const first = res?.metadata?.firstName;
    const last = res?.metadata?.lastName;
    if (first || last) return `${first || ''} ${last || ''}`.trim() || '-';

    const name = res?.resource?.name?.[0];
    return [name?.given?.[0], name?.family].filter(Boolean).join(' ') || '-';
  };

  const extractGender = (res) => res?.metadata?.gender || res?.resource?.gender || '-';
  const extractDob = (res) => res?.resource?.birthDate || '-';

  const extractContact = (res) => {
    const telecom = res?.resource?.telecom || [];
    const phone = telecom.find(t => t.system === 'phone');
    return phone?.value || res?.metadata?.contactNumber || '-';
  };

  const extractAddress = (res) => {
    if (res?.metadata?.address) return res.metadata.address;

    const addr = res?.resource?.address?.[0];
    if (!addr) return '-';

    if (addr.text) return addr.text;

    const parts = [...(addr.line || []), addr.city, addr.state, addr.postalCode];
    return parts.filter(Boolean).join(', ') || '-';
  };

  const extractGuardian = (res) => {
    const contact = res?.resource?.contact?.[0];
    const nameObj = contact?.name;

    const guardianName = nameObj
      ? [nameObj.given?.[0], nameObj.family].filter(Boolean).join(' ')
      : (res?.metadata?.guardianName || '-');

    const guardianNIC = res?.metadata?.guardianNic || '-';

    return { guardianName, guardianNIC };
  };

  const extractHealthExtensions = (res) => {
    const exts = res?.resource?.extension || [];
    const getVal = (key) => {
      const ext = exts.find(e => (e.url || '').toLowerCase().includes(key));
      if (!ext) return '-';
      return (
        ext.valueQuantity?.value ||
        ext.valueString ||
        ext.valueDecimal ||
        ext.valueInteger ||
        '-'
      );
    };

    return {
      height: getVal('height'),
      weight: getVal('weight'),
      bmi: getVal('bmi'),
      bloodPressure: getVal('blood-pressure'),
      sugarLevel: getVal('sugar'),
    };
  };

  // ---------- LOAD PATIENT ----------
  useEffect(() => {
    let cancelled = false;

    const fetchPatient = async () => {
      setLoading(true);
      try {
        const res = await httpClient.get(`/fhir/Patient/${id}`);
        const payload = res?.data?.data || res?.data;

        if (cancelled) return;

        setPatientData({
          fullName: extractName(payload),
          phn: extractPhn(payload),
          nic: extractNic(payload),
          gender: extractGender(payload),
          dob: extractDob(payload),
          contactNo: extractContact(payload),
          address: extractAddress(payload),
          ...extractGuardian(payload),
        });

        setHealthData(extractHealthExtensions(payload));

      } catch (err) {
        setError("Failed to load patient");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchPatient();
    return () => (cancelled = true);
  }, [id]);

  // ---------- ACTIVE VISIT CHECK ----------
  useEffect(() => {
    let cancelled = false;

    const checkActiveVisit = async () => {
      try {
        let doctorLicense = null;
        try {
          const raw = localStorage.getItem("doctor");
          const obj = raw ? JSON.parse(raw) : null;
          doctorLicense = obj?.medicalLicenseId;
        } catch {}

        if (!doctorLicense) return;

        const encRes = await httpClient.get("/fhir/Encounter", {
          params: { patient: id }
        });

        const encounters = encRes?.data?.data || [];

        const active = encounters.some(enc => {
          const sameDoc = enc.metadata?.doctorLicense === doctorLicense;
          const status = enc.metadata?.status || enc.resource?.status;
          return sameDoc && status === "in-progress";
        });

        if (!cancelled && active) {
          navigate(`/doctor/visitpatient/${id}`);
        }

      } catch {}
    };

    checkActiveVisit();
    return () => (cancelled = true);
  }, [id, navigate]);

  // ---------- UI ----------
  return (
    <div className="patientDetailsMain">
      <h2 className="patientDetailsHeder">
        Patients - {patientData?.fullName || "Loading..."}
      </h2>

      <SegmentedControl
        options={filterOptions}
        selected={selectedFilter}
        onChange={handleTabChange}
      />

      {loading && <p>Loading patient details...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && patientData && (
        <div className="table-row">
          <div className="table-half">
            <PatientOverview {...patientData} />
          </div>

          <div className="table-half">
            <HealthInfoCard {...healthData} />
            <div className="buttonContainer">
              <SimpleButton label="Create A Clinic Visit" onClick={clickVisit} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientDetails;
