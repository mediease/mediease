import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SegmentedControl from "../components/SegmentedControl";
import httpClient from '../services/httpClient';
import './css/HistoryInfo.css';

function HistoryInfo() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patientName, setPatientName] = useState('');
  const [encounters, setEncounters] = useState([]);
  const [loading, setLoading] = useState(true);

  const filterOptions = ["Basic", "Report", "Allergies", "Medications", "Visit History"];

  const handleTabChange = (option) => {
    switch(option) {
      case "Basic":
        navigate(`/doctor/visitpatient/${id}`);
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [patientRes, encounterRes] = await Promise.all([
          httpClient.get(`/fhir/Patient/${id}`),
          httpClient.get(`/fhir/Encounter?patient=${id}`)
        ]);

        const p = patientRes.data?.data;
        if (p) {
          const name = p.metadata
            ? `${p.metadata.firstName || ''} ${p.metadata.lastName || ''}`.trim()
            : (p.resource?.name?.[0]?.given?.[0] || '') + ' ' + (p.resource?.name?.[0]?.family || '');
          setPatientName(name.trim());
        }

        const encList = encounterRes.data?.data || [];
        setEncounters(Array.isArray(encList) ? encList : []);
      } catch (err) {
        console.error('HistoryInfo fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  return (
    <div className="patientDetailsMain">
      <h2 className="patientDetailsHeder">
        Patients {patientName ? `- ${patientName}` : ''}
      </h2>
      <SegmentedControl
        options={filterOptions}
        selected="Visit History"
        onChange={handleTabChange}
      />

      {loading && <p style={{ padding: '1rem' }}>Loading visit history…</p>}

      {!loading && (
        <div className="visit-history-table-wrapper">
          <table className="visit-history-table">
            <thead>
              <tr>
                <th>Visit Date</th>
                <th>Reason for Visit</th>
                <th>Diagnosis</th>
                <th>Doctor</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {encounters.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '1rem' }}>
                    No visit history found.
                  </td>
                </tr>
              ) : (
                encounters.map((enc, i) => {
                  const meta = enc.metadata || enc;
                  const encId = meta.encId || enc.encId || enc._id || i;
                  const date = meta.createdAt || enc.createdAt
                    ? new Date(meta.createdAt || enc.createdAt).toLocaleDateString()
                    : '-';
                  return (
                    <tr key={encId}>
                      <td>{date}</td>
                      <td>{meta.complaint || enc.complaint || '-'}</td>
                      <td>{meta.diagnosis || enc.diagnosis || '-'}</td>
                      <td>{meta.doctorLicense || enc.doctorLicense || '-'}</td>
                      <td>{meta.status || enc.status || '-'}</td>
                      <td>
                        <button onClick={() => navigate(`/doctor/patient/${id}/reportinfo`)}>
                          View Report
                        </button>
                        <button
                          onClick={() => navigate(`/doctor/patient/${id}/medicationsinfo`)}
                          style={{ marginLeft: 8 }}
                        >
                          View Prescriptions
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default HistoryInfo;
