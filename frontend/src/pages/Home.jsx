import React, { useEffect, useState } from 'react';
import TableN1 from '../components/tableN1';
import "./css/style.css";
import { useNavigate } from 'react-router-dom';
import httpClient from '../services/httpClient';

const Home = () => {
  const navigate = useNavigate();

  const clickAppointment = () => navigate('/doctor/appointments');
  const clickPatient = () => navigate('/doctor/patients');
  const clickReports = () => navigate('/doctor/reports');

  const [appointmentsData, setAppointmentsData] = useState([]);
  const [doctorName, setDoctorName] = useState(''); // dynamic doctor name

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        // 1️⃣ Get doctor info from localStorage (safe parse)
        let doctorData = null;
        try {
          const raw = localStorage.getItem('doctor');
          doctorData = raw ? JSON.parse(raw) : null;
        } catch (e) {
          console.warn('Failed to parse doctor from localStorage:', e);
        }

        if (doctorData?.firstName || doctorData?.lastName) {
          setDoctorName(`${doctorData.firstName || ''} ${doctorData.lastName || ''}`.trim());
        } else {
          setDoctorName('Doctor');
        }

        // 2️⃣ Figure out medicalLicenseId from doctor object or legacy key
        const medicalLicenseId = doctorData?.medicalLicenseId || localStorage.getItem('medicalLicenseId');
        console.log('Resolved medicalLicenseId:', medicalLicenseId);
        if (!medicalLicenseId) {
          console.warn('No medicalLicenseId available; skipping appointments fetch');
          setAppointmentsData([]);
          return;
        }

        // 2️⃣ Fetch pending appointments
        const res = await httpClient.get(`/doctor/appointments/${medicalLicenseId}`, {
          params: { status: 'pending' },
        });

        console.log("Appointments API response:", res.data);

        const rawList = res.data?.data || [];
        if (!Array.isArray(rawList) || rawList.length === 0) {
          setAppointmentsData([]);
          return;
        }

        // Fetch patient names concurrently
        const mappedAppointments = await Promise.all(
          rawList.map(async (item) => {
            const apid = item.apid || '-';
            const patientPhn = item.metadata?.patientPhn || '-';
            let fullName = patientPhn; // default fallback

            if (patientPhn && patientPhn !== '-') {
              try {
                const patientRes = await httpClient.get(`/fhir/Patient/${patientPhn}`);
                const pData = patientRes?.data?.data;
                const pMeta = pData?.metadata || patientRes?.data?.metadata || {};
                const firstName = pMeta?.firstName || pData?.firstName || '';
                const lastName = pMeta?.lastName || pData?.lastName || '';
                if (firstName || lastName) {
                  fullName = `${firstName} ${lastName}`.trim();
                }
              } catch (e) {
                console.warn(`Failed to fetch patient ${patientPhn} details:`, e);
                // keep fallback fullName = patientPhn
              }
            }

            return {
              id: apid,
              phn: patientPhn,
              name: fullName || patientPhn,
              type: item.metadata?.type || '-',
              date: item.metadata?.appointmentDate
                ? new Date(item.metadata.appointmentDate).toLocaleString()
                : '-',
              status: item.metadata?.status || '-',
            };
          })
        );

        console.log('Mapped Appointments with patient names:', mappedAppointments);
        setAppointmentsData(mappedAppointments);
      } catch (err) {
        console.error("Error fetching appointments:", err);
        setAppointmentsData([]);
      }
    };

    fetchAppointments();
  }, []);

  // Temporary static data for patients and lab reports
  const patientData = [
    { phn: "1001", name: "Niluka", gender: "Female", age: "25" },
    { phn: "1002", name: "Ruwan", gender: "Male", age: "25" },
    { phn: "1003", name: "Thilini", gender: "Female", age: "25" },
  ];

  const testData = [
    { id: "T001", test: "Blood Test", name: "Niluka", phn: 20 },
    { id: "T002", test: "X-Ray", name: "Ruwan", phn: 20 },
    { id: "T003", test: "MRI", name: "Ruwan", phn: 20 },
  ];

  return (
    <div className="dashboard-container">
      <h1>Welcome Dr. {doctorName || 'Doctor'}!</h1>

      <div className="table-wrapper">
        <TableN1
          title="Upcoming Appointments"
          buttonLink={clickAppointment}
          columns={[
            { label: "ID", key: "id" },
            { label: "PHN", key: "phn" },
            { label: "Name", key: "name" },
            { label: "Type", key: "type" },
            { label: "Date", key: "date" },
            { label: "Status", key: "status" }
          ]}
          data={appointmentsData}
        />
      </div>

      <div className="table-row">
        <div className="table-half">
          <TableN1
            title="Recent Patients"
            buttonLink={clickPatient}
            compact
            columns={[
              { label: "PHN", key: "phn" },
              { label: "Name", key: "name" },
              { label: "Gender", key: "gender" },
              { label: "Age", key: "age" }
            ]}
            data={patientData}
          />
        </div>
        <div className="table-half">
          <TableN1
            title="Pending Lab Reports"
            buttonLink={clickReports}
            compact
            columns={[
              { label: "ID", key: "id" },
              { label: "PHN", key: "phn" },
              { label: "Name", key: "name" },
              { label: "Test", key: "test" }
            ]}
            data={testData}
          />
        </div>
      </div>
    </div>
  );
};

export default Home;
