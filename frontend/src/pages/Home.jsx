// ======================= HOME PAGE (FULL + CONNECTED) =======================
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
  const [patientsData, setPatientsData] = useState([]);
  const [reportsData, setReportsData] = useState([]);
  const [doctorName, setDoctorName] = useState("");

  // ------------------ LOAD ALL HOME DATA ------------------
  useEffect(() => {
    const loadAll = async () => {
      // ------------------ LOAD DOCTOR NAME ------------------
      try {
        const raw = localStorage.getItem("doctor");
        const doc = raw ? JSON.parse(raw) : null;
        setDoctorName(`${doc?.firstName || ""} ${doc?.lastName || ""}`.trim());
      } catch {
        setDoctorName("Doctor");
      }

      // ------------------ LOAD APPOINTMENTS ------------------
      try {
        let doctorData = null;
        const raw = localStorage.getItem("doctor");
        doctorData = raw ? JSON.parse(raw) : null;

        const medicalLicenseId =
          doctorData?.medicalLicenseId || localStorage.getItem('medicalLicenseId');

        if (medicalLicenseId) {
          const res = await httpClient.get(`/doctor/appointments/${medicalLicenseId}`, {
            params: { status: "pending" }
          });

          const list = res.data?.data || [];

          // Fetch patient names and shape table rows
          const mapped = await Promise.all(
            list.map(async (item) => {
              const patientPhn = item.metadata?.patientPhn || "-";
              let fullName = patientPhn;

              if (patientPhn !== "-") {
                try {
                  const patientRes = await httpClient.get(`/fhir/Patient/${patientPhn}`);
                  const p = patientRes.data?.data;
                  const meta = p?.metadata || {};
                  const first = meta.firstName || p?.firstName || "";
                  const last = meta.lastName || p?.lastName || "";
                  fullName = `${first} ${last}`.trim();
                } catch {}
              }

              return {
                id: item.apid || "-",
                phn: patientPhn,
                name: fullName,
                type: item.metadata?.type || "-",
                date: item.metadata?.appointmentDate
                  ? new Date(item.metadata.appointmentDate).toLocaleString()
                  : "-",
                status: item.metadata?.status || "-",
              };
            })
          );

          setAppointmentsData(mapped);
        }
      } catch (err) {
        console.error("HOME: Appointment Error", err);
        setAppointmentsData([]);
      }

      // ------------------ LOAD RECENT PATIENTS ------------------
      try {
        const pRes = await httpClient.get("/fhir/Patient/");
        const pList = pRes.data?.data || [];

        const shaped = pList.slice(0, 5).map((p) => ({
          phn:
            p?.metadata?.patientPhn ||
            p?.phn ||
            p?.resource?.identifier?.find((i) => i.system.includes("phn"))?.value ||
            "-",
          name:
            `${p?.metadata?.firstName || ""} ${p?.metadata?.lastName || ""}`.trim() ||
            p?.resource?.name?.[0]?.given?.[0] ||
            "Unknown",
          gender: p?.metadata?.gender || p?.resource?.gender || "-",
          age: p?.metadata?.age || "-",
        }));

        setPatientsData(shaped);
      } catch (err) {
        setPatientsData([]);
      }

      // ------------------ LOAD PENDING LAB REPORTS ------------------
      try {
        const rRes = await httpClient.get("/api/lab/doctor/reports");

        const { requests = [] } = rRes.data.data;

        const shaped = requests
          .filter((r) => r.status === "pending")
          .slice(0, 5)
          .map((r) => {
            return {
              id: r.labId || r._id,
              phn: r.patientPhn,
              name: r.patientName || "Unknown",
              test: r.testType,
            };
          });

        setReportsData(shaped);
      } catch (err) {
        setReportsData([]);
      }
    };

    loadAll();
  }, []);

  return (
    <div className="dashboard-container">
      <h1>Welcome Dr. {doctorName || "Doctor"}!</h1>

      {/* ---- Appointments Section ---- */}
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
            { label: "Status", key: "status" },
          ]}
          data={appointmentsData}
        />
      </div>

      {/* ---- Patients & Reports ---- */}
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
            
            ]}
            data={patientsData}
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
              { label: "Test", key: "test" },
            ]}
            data={reportsData}
          />
        </div>
      </div>
    </div>
  );
};

export default Home;
