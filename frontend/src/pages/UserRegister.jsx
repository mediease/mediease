import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import SectionHeader from '../components/SectionHeader';
import SegmentedTable from '../components/SegmentedTable';
import './css/style.css';

const AdminDocAppointments = () => {
  const [selectedDate, setSelectedDate] = useState(null);
  const navigate = useNavigate();

  
  const handleRowClick = (row) => {
    navigate(`/admin/userregister/${row.doctorId}`); 
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  selectedDate ? selectedDate.toDateString() : 'None';

 
  const columns = [
    { label: "Doctor name", key: "doctorName" },
    { label: "Doctor ID", key: "doctorId" },
    { label: "Gender", key: "gender" },
    { label: "Request Date", key: "registeredDate" },
    { label: "Division", key: "division" },
  ];

  const data = [
    { doctorName: "Niluka", doctorId: "1001", gender: "Female", registeredDate: "2022-01-10", division: "Cardiology" },
    { doctorName: "Roshini", doctorId: "1002", gender: "Female", registeredDate: "2021-05-14", division: "Neurology" },
    { doctorName: "Lahiru", doctorId: "1003", gender: "Male", registeredDate: "2023-03-22", division: "Oncology" },
    { doctorName: "Pathum", doctorId: "1004", gender: "Male", registeredDate: "2020-09-11", division: "Pediatrics" },
    { doctorName: "Henry", doctorId: "1005", gender: "Male", registeredDate: "2019-11-06", division: "Orthopedics" },
    { doctorName: "Sonali", doctorId: "1006", gender: "Female", registeredDate: "2021-12-01", division: "Dermatology" }
  ];
  

  return (
    <div>
      <SectionHeader title="Requests" onDateChange={handleDateChange} />
      <div>
        <SegmentedTable
          columns={columns}
          data={data}
          filterOptions={["Doctor","Staff"]} 
          tableState={"Doctor"}
          handleRowClick={handleRowClick}
        />
        
      </div>
    </div>
  );
};

export default AdminDocAppointments;
