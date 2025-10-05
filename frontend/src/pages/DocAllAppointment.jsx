import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import SectionHeader from '../components/SectionHeader';
import SegmentedTable from '../components/SegmentedTable';
import './css/style.css';

const DocAllAppointment = () => {
  const [selectedDate, setSelectedDate] = useState(null);
  const navigate = useNavigate();

  
  const handleRowClick = (row) => {
    navigate(`/admin/allappointments/${row.doctorId}`); 
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  selectedDate ? selectedDate.toDateString() : 'None';

 
  const columns = [
    { label: "Patient Name", key: "patientName" },
    { label: "PHN", key: "phn" },
    { label: "Status", key: "status" },
    { label: "Date", key: "date" },
    { label: "Type", key: "type" }
  ];
  
  
  

 
  const data = [
    { patientName: "Niluka", phn: "1001", status: "In Progress", date: "20/12/2024", type: "Consultation" },
    { patientName: "Roshini", phn: "1102", status: "Completed", date: "24/12/2024", type: "Lab Test" },
    { patientName: "Lahiru", phn: "1256", status: "In Progress", date: "21/12/2024", type: "Emergency Visit" },
    { patientName: "Pathum", phn: "890", status: "In Progress", date: "26/12/2024", type: "Follow-up" },
    { patientName: "Henry", phn: "251", status: "Completed", date: "21/12/2024", type: "Vaccination" },
    { patientName: "Sonali", phn: "899", status: "In Progress", date: "26/12/2024", type: "Follow-up" }
  ];
  
  
  

  return (
    <div>
      <SectionHeader title="Appointments &nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Doctor - Niluka Piris" onDateChange={handleDateChange} />
      <div>
        
        <SegmentedTable
          columns={columns}
          data={data}
          filterOptions={[]} 
          handleRowClick={handleRowClick}
        />
        
      </div>
    </div>
  );
};

export default DocAllAppointment;
