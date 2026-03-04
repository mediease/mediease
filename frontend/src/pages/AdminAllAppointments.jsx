import React, { useState, useEffect } from 'react';
import SectionHeader from '../components/SectionHeader';
import SegmentedTable from "../components/SegmentedTable";
import httpClient from '../services/httpClient';

const columns = [
  { label: "ID", key: "id" },
  { label: "PHN", key: "phn" },
  { label: "Doctor", key: "doctor" },
  { label: "Status", key: "status" },
  { label: "Date", key: "date" },
  { label: "Type", key: "type" }
];

const AdminAllAppointments = () => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState("Daily");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await httpClient.get('/fhir/appointments');
        const mapped = (res.data?.data || []).map(apt => ({
          id: apt.apid,
          phn: apt.metadata?.patientPhn || '-',
          doctor: apt.metadata?.doctorLicense || '-',
          status: apt.metadata?.status || '-',
          date: apt.metadata?.appointmentDate
            ? new Date(apt.metadata.appointmentDate).toLocaleDateString()
            : '-',
          type: apt.metadata?.type || '-'
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

  return (
    <div>
      <SectionHeader title="Appointments" onDateChange={setSelectedDate} />
      {loading && <p style={{ padding: '1rem' }}>Loading appointments…</p>}
      {error && <p style={{ padding: '1rem', color: 'red' }}>{error}</p>}
      {!loading && !error && (
        <SegmentedTable
          columns={columns}
          data={data}
          filterOptions={["Today", "This Week", "This Month"]}
          tableState={"Today"}
          onFilterChange={setSelectedFilter}
        />
      )}
    </div>
  );
};

export default AdminAllAppointments;
