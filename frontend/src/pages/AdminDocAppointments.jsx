import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import SectionHeader from '../components/SectionHeader';
import SegmentedTable from '../components/SegmentedTable';
import httpClient from '../services/httpClient';
import './css/style.css';

const AdminDocAppointments = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all appointments and aggregate by doctor
        const res = await httpClient.get('/fhir/appointments?limit=500');
        const appointments = res.data?.data || [];

        // Group by doctorLicense
        const byDoctor = {};
        for (const apt of appointments) {
          const license = apt.metadata?.doctorLicense || 'Unknown';
          if (!byDoctor[license]) {
            byDoctor[license] = { total: 0, completed: 0, incomplete: 0, lastDate: null };
          }
          byDoctor[license].total += 1;
          const status = (apt.metadata?.status || '').toLowerCase();
          if (status === 'completed' || status === 'fulfilled') {
            byDoctor[license].completed += 1;
          } else if (status !== 'cancelled') {
            byDoctor[license].incomplete += 1;
          }
          const d = apt.metadata?.appointmentDate;
          if (d && (!byDoctor[license].lastDate || new Date(d) > new Date(byDoctor[license].lastDate))) {
            byDoctor[license].lastDate = d;
          }
        }

        const rows = Object.entries(byDoctor).map(([license, stats]) => ({
          doctorName: license,
          doctorId: license,
          date: stats.lastDate ? new Date(stats.lastDate).toLocaleDateString() : '-',
          allAppointment: stats.total,
          completed: stats.completed,
          incompleted: stats.incomplete
        }));

        setData(rows);
      } catch (err) {
        setError('Failed to load appointments');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const columns = [
    { label: "Doctor ID", key: "doctorName" },
    { label: "Date", key: "date" },
    { label: "All Appointments", key: "allAppointment" },
    { label: "Completed", key: "completed" },
    { label: "Incomplete", key: "incompleted" },
  ];

  const handleRowClick = (row) => {
    navigate(`/admin/docappointments/${row.doctorId}`);
  };

  return (
    <div>
      <SectionHeader title="Appointments by Doctor" />
      {loading && <p style={{ padding: '1rem' }}>Loading…</p>}
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

export default AdminDocAppointments;
