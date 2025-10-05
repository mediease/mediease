import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import SectionHeader from '../components/SectionHeader';
import SegmentedTable from '../components/SegmentedTable';
import './css/style.css';

const AdminDocAppointments = () => {
  const [selectedDate, setSelectedDate] = useState(null);
  const navigate = useNavigate();

  
  const handleRowClick = (row) => {
    navigate(`/admin/docappointments/${row.doctorId}`); 
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  selectedDate ? selectedDate.toDateString() : 'None';

 
  const columns = [
    { label: "Doctor name", key: "doctorName" },
    { label: "Doctor ID", key: "doctorId" },
    { label: "Date", key: "date" },
    { label: "All Appointment", key: "allAppointment" },
    { label: "Completed", key: "completed" },
    { label: "Incompleted", key: "incompleted" },
  ];
  

 
  const data = [
    { doctorName: "Niluka", doctorId: "1001", date: "20/12/2024", allAppointment: 30, completed: 10, incompleted: 20 },
    { doctorName: "Roshini", doctorId: "1001", date: "24/12/2024", allAppointment: 30, completed: 12, incompleted: 28 },
    { doctorName: "Lahiru", doctorId: "1001", date: "21/12/2024", allAppointment: 30, completed: 20, incompleted: 10 },
    { doctorName: "Pathum", doctorId: "1001", date: "26/12/2024", allAppointment: 30, completed: 30, incompleted: 0 },
    { doctorName: "Henry", doctorId: "1001", date: "21/12/2024", allAppointment: 30, completed: 4, incompleted: 26 },
    { doctorName: "Sonali", doctorId: "1001", date: "26/12/2024", allAppointment: 30, completed: 4, incompleted: 26 }
  ];
  

  return (
    <div>
      <SectionHeader title="Appointments" onDateChange={handleDateChange} />
      <div>
        <SegmentedTable
          columns={columns}
          data={data}
          filterOptions={[]} 
          tableState={"Today"}
          handleRowClick={handleRowClick}
        />
        
      </div>
    </div>
  );
};

export default AdminDocAppointments;
