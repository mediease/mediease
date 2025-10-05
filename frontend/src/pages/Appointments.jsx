import React, { useState } from 'react';
import SectionHeader from '../components/SectionHeader';
import SegmentedTable from "../components/SegmentedTable";
import { useNavigate } from "react-router-dom";

const columns = [
  { label: "ID", key: "id" },
  { label: "PHN", key: "phn" },
  { label: "Patient Name", key: "patient name" },
  { label: "Status", key: "status" },
  { label: "Date", key: "date" },
  { label: "Type", key: "type" }
];


const data = [
  { id: "0102", phn: "1001", "patient name": "Niluka", status: "In Progress", date: "20/12/2024", type: "Consultation" },
  { id: "0103", phn: "1102", "patient name": "Roshini", status: "Completed", date: "24/12/2024", type: "Lab Test" },
  { id: "0102", phn: "1258", "patient name": "Lahiru", status: "In Progress", date: "21/12/2024", type: "Emergency Visit" },
  { id: "0098", phn: "890", "patient name": "Pathum", status: "In Progress", date: "26/12/2024", type: "Follow-up" },
  { id: "0104", phn: "251", "patient name": "Henry", status: "Completed", date: "21/12/2024", type: "Vaccination" },
  { id: "0105", phn: "899", "patient name": "Sonali", status: "In Progress", date: "26/12/2024", type: "Follow-up" }
];



const Appointment = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(null);
  
  const [selectedFilter, setSelectedFilter] = useState("Daily");

  console.log("Selected Filter:", selectedFilter);
  
  
  const handleDateChange = (date) => {
    setSelectedDate(date);
  };
  selectedDate ? selectedDate.toDateString() : 'None'
  const handleRowClick = (row) => {
    navigate(`/doctor/appointments/${row.id}`);
  };

  return (
    <div>
      <SectionHeader title="Appointments" onDateChange={handleDateChange} />
      <SegmentedTable
      columns={columns}
      data={data}
      filterOptions={["Today","This Week","This Month"]} 
      tableState={"Today"}
      handleRowClick={handleRowClick}
      onFilterChange={setSelectedFilter} 
    />
    
    
    </div>
  );
};

export default Appointment;
