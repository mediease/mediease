import React from 'react';
import TableN1 from '../components/tableN1';
import "./css/style.css";
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  const clickAppointment = () => navigate('/doctor/appointments');
  const clickPatient = () => navigate('/doctor/patients');
  const clickReports = () => navigate('/doctor/reports');

  const appointmentsData = [
    { id: "0102", phn: "1001", name: "Niluka", type: "Consultation", date: "01/01/2025", status: "Not Seen" },
    { id: "0103", phn: "1101", name: "Roshini", type: "Test", date: "01/01/2025", status: "Not Seen" },
    { id: "0104", phn: "1021", name: "Henry", type: "Consultation", date: "01/01/2025", status: "Not Seen" },
    { id: "0105", phn: "1022", name: "Sonali", type: "Consultation", date: "01/01/2025", status: "Not Seen" },
  ];

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
      <h1>Welcome Dr. Sugath!</h1>

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
