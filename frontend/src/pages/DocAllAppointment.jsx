import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import SectionHeader from '../components/SectionHeader';
import SegmentedTable from '../components/SegmentedTable';
import httpClient from '../services/httpClient';
import './css/style.css';

const columns = [
  { label: "PHN", key: "phn" },
  { label: "Status", key: "status" },
  { label: "Date", key: "date" },
  { label: "Type", key: "type" }
];

const DocAllAppointment = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [doctorName, setDoctorName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const medicalLicenseId = localStorage.getItem('medicalLicenseId');
    const doctorRaw = localStorage.getItem('doctor');
    if (doctorRaw) {
      try {
        const doc = JSON.parse(doctorRaw);
        setDoctorName(doc.name || doc.fullName || '');
      } catch (_) {}
    }

    if (!medicalLicenseId) {
      setError('Doctor license not found. Please log in again.');
      setLoading(false);
      return;
    }

    const fetchAppointments = async () => {
      try {
        const res = await httpClient.get(`/fhir/appointments/${medicalLicenseId}`);
        const mapped = (res.data?.data || []).map(apt => ({
          phn: apt.metadata?.patientPhn || '-',
          status: apt.metadata?.status || '-',
          date: apt.metadata?.appointmentDate
            ? new Date(apt.metadata.appointmentDate).toLocaleDateString()
            : '-',
          type: apt.metadata?.type || '-',
          apid: apt.apid
        }));
        setData(mapped);
      } catch (err) {
        setError('Failed to load appointments');
        console.error('Appointments fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  const handleRowClick = (row) => {
    navigate(`/patient/${row.phn}`);
  };

  const title = doctorName
    ? `Appointments — ${doctorName}`
    : 'Appointments';

  return (
    <div>
      <SectionHeader title={title} />
      {loading && <p style={{ padding: '1rem' }}>Loading appointments…</p>}
      {error && <p style={{ padding: '1rem', color: 'red' }}>{error}</p>}
      {!loading && !error && (
        <SegmentedTable
          columns={columns}
          data={data}
          filterOptions={[]}
          handleRowClick={handleRowClick}
        />
      )}
    </div>
  );
};

export default DocAllAppointment;
