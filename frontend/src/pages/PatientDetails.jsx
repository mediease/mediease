import { useParams, useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import PatientOverview from "../components/PatientOverview";
import SegmentedControl from "../components/SegmentedControl";
import HealthInfoCard from "../components/HealthInfoCard";
import SimpleButton from '../components/buttons';
import './css/style.css'
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

  // Handle tab change with navigation
  const handleTabChange = (option) => {
    setSelectedFilter(option);
    
    
    switch(option) {
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

  const clickVisit = () => {
    navigate(`/doctor/patient/${id}/visit`);
  };

  // Helpers to extract fields from FHIR Patient resource
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
    const given = name?.given?.[0];
    const family = name?.family;
    return [given, family].filter(Boolean).join(' ') || '-';
  };
  const extractGender = (res) => res?.metadata?.gender || res?.resource?.gender || '-';
  const extractDob = (res) => res?.resource?.birthDate || '-';
  const extractContact = (res) => {
    const telecom = res?.resource?.telecom || [];
    const phone = telecom.find(t => t.system === 'phone');
    return phone?.value || res?.metadata?.contactNumber || res?.metadata?.contactNo || '-';
  };
  const extractAddress = (res) => {
    // Prefer explicit metadata address if supplied
    if (res?.metadata?.address) return res.metadata.address;
    const addr = res?.resource?.address?.[0];
    if (!addr) return '-';
    // Use text if available (FHIR address.text is a formatted string)
    if (addr.text) return addr.text;
    const parts = [ ...(addr.line || []), addr.city, addr.state, addr.postalCode ];
    return parts.filter(Boolean).join(', ') || '-';
  };
  const extractGuardian = (res) => {
    const contact = res?.resource?.contact?.[0];
    const nameObj = contact?.name;
    const guardianName = nameObj ? [nameObj.given?.[0], nameObj.family].filter(Boolean).join(' ') : (res?.metadata?.guardianName || '-');
    // Option 2 selected: use only metadata for guardian NIC, ignore contact extensions
    const guardianNIC = res?.metadata?.guardianNic || res?.metadata?.guardianNIC || '-';
    return { guardianName: guardianName || '-', guardianNIC: guardianNIC || '-' };
  };
  const extractHealthExtensions = (res) => {
    const exts = res?.resource?.extension || [];
    const getVal = (key) => {
      const ext = exts.find(e => (e.url || '').toLowerCase().includes(key));
      if (!ext) return '-';
      if (ext.valueQuantity) {
        const val = ext.valueQuantity.value;
        const unit = ext.valueQuantity.unit || ext.valueQuantity.code || '';
        return [val, unit].filter(Boolean).join(' ');
      }
      return ext.valueString || ext.valueDecimal || ext.valueInteger || '-';
    };
    const height = getVal('height');
    const weight = getVal('weight');
    const bmi = getVal('bmi');
    const bp = getVal('bloodpressure') || getVal('blood-pressure') || getVal('bp');
    const sugar = getVal('sugarlevel') || getVal('sugar') || getVal('glucose');
    return {
      height: height || '-',
      weight: weight || '-',
      bmi: bmi || '-',
      bloodPressure: bp || '-',
      sugarLevel: sugar || '-',
    };
  };

  useEffect(() => {
    let cancelled = false;
    const fetchPatient = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await httpClient.get(`/fhir/Patient/${id}`);
        const payload = res?.data?.data || res?.data || {};
        if (cancelled) return;
        const patient = {
          fullName: extractName(payload),
          phn: extractPhn(payload),
          nic: extractNic(payload),
          gender: extractGender(payload),
          dob: extractDob(payload),
          contactNo: extractContact(payload),
          address: extractAddress(payload),
          ...extractGuardian(payload),
        };
        setPatientData(patient);
        setHealthData(extractHealthExtensions(payload));
      } catch (err) {
        if (!cancelled) {
          console.error('Failed to load patient', err);
          setError('Unable to load patient data');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchPatient();
    return () => { cancelled = true; };
  }, [id]);

  // Guard: if an active clinic visit exists and is not closed, redirect to visit page
  useEffect(() => {
    let cancelled = false;
    const checkActiveVisit = async () => {
      try {
        const res = await httpClient.get(`/clinic/start/${encodeURIComponent(id)}`);
        const payload = res?.data?.data || res?.data || {};
        const status = (payload.status || payload.visitStatus || '').toLowerCase();
        if (!cancelled && status && status !== 'closed') {
          // Redirect doctor to ongoing visit handling page
          navigate(`/doctor/visitpatient/${id}`);
        }
      } catch (err) {
        // 404 (no active visit) -> allow staying; other errors ignored for now
        if (err.response?.status && err.response.status !== 404) {
          console.warn('Visit status check error', err.response.status);
        }
      }
    };
    checkActiveVisit();
    return () => { cancelled = true; };
  }, [id, navigate]);

  return (
    <div className="patientDetailsMain">
      <h2 className="patientDetailsHeder">Patients - {patientData?.fullName || (loading ? 'Loading...' : 'Unknown')}</h2>
      <SegmentedControl 
        options={filterOptions}
        selected={selectedFilter}
        onChange={handleTabChange}
      />
      {loading && (
        <p style={{ padding: '1rem' }}>Loading patient details...</p>
      )}
      {!loading && error && (
        <p style={{ padding: '1rem', color: 'red' }}>{error}</p>
      )}
      {!loading && !error && patientData && (
      <div className="table-row">
        <div className="table-half">
            <PatientOverview
            dpUrl=""
            fullName={patientData.fullName}
            phn={patientData.phn}
            nic={patientData.nic}
            gender={patientData.gender}
            dob={patientData.dob}
            contactNo={patientData.contactNo}
            address={patientData.address}
            guardianName={patientData.guardianName}
            guardianNIC={patientData.guardianNIC}
            />
        </div>
        <div className="table-half">
          <div>
          <HealthInfoCard
            height={healthData.height}
            weight={healthData.weight}
            bmi={healthData.bmi}
            bloodPressure={healthData.bloodPressure}
            sugarLevel={healthData.sugarLevel}
            />
          </div>
          <div className='buttonContainer'>
            <div className="inlineButton">
                <SimpleButton 
                label="Create A Cinic Visit" 
                onClick={clickVisit}
                />
                
            </div>
            
            </div>
        </div>
      </div>
      )}
    </div>
  );
};

export default PatientDetails;