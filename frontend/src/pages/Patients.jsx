import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import SectionHeader from '../components/SectionHeader';
import SegmentedTable from '../components/SegmentedTable';
import './css/style.css'
import SimpleButton from '../components/buttons';

const Patients = () => {
  
  const [selectedDate, setSelectedDate] = useState(null);
  const navigate = useNavigate();
  const handleAddNewPatient = () => {
    navigate('/doctor/patients/new');
  };
  const handleRowClick = (row) => {
    navigate(`/doctor/patient/${row.phn}`);
  };
  const handleDateChange = (date) => {
    setSelectedDate(date);
  };
  selectedDate ? selectedDate.toDateString() : 'None'
    const columns = [
      { label: "PHN", key: "phn" },
      { label: "Patient Name", key: "patient name" },
      { label: "Gender", key: "gender" },
      { label: "NIC", key: "nic" },
      { label: "Nearest Visit Date", key: "nearest visit date" }
    ];
  
  const data = [
    {  phn: "1001", "patient name": "Naveen",gender:"Male" ,nic: "200016489950", "nearest visit date": "01/01/2025", type: "Clinic Visit" },
    {  phn: "1101", "patient name": "Roshini", gender:"Female" ,nic: "8916348825V", "nearest visit date": "01/01/2025", type: "Clinic Visit" },
    {  phn: "1021", "patient name": "Henry",gender:"Male" , nic: "9216348825V", "nearest visit date": "01/01/2025", type: "Clinic Visit" },
    {  phn: "1022", "patient name": "Sonali",gender:"Female" , nic: "200016348825", "nearest visit date": "01/01/2025", type: "Wards" },
    {  phn: "251", "patient name": "Henry", gender:"Male" ,nic: "200516348825", "nearest visit date": "01/01/2025", type: "Wards" },
    {  phn: "899", "patient name": "Sonali", gender:"Female" ,nic: "200016348825", "nearest visit date": "01/01/2025", type: "Wards" },
    {  phn: "1001", "patient name": "Naveen",gender:"Male" , nic: "200016489950", "nearest visit date": "01/01/2025", type: "Clinic Visit" },
    {  phn: "1101", "patient name": "Roshini",gender:"Female" , nic: "8916348825V", "nearest visit date": "01/01/2025", type: "Clinic Visit" },
    {  phn: "1021", "patient name": "Henry", gender:"Male" ,nic: "9216348825V", "nearest visit date": "01/01/2025", type: "Clinic Visit" },
    {  phn: "1022", "patient name": "Sonali", gender:"Female" ,nic: "200016348825", "nearest visit date": "01/01/2025", type: "Wards" },
    {  phn: "251", "patient name": "Henry", gender:"Male" ,nic: "200516348825", "nearest visit date": "01/01/2025", type: "Wards" },
    {  phn: "899", "patient name": "Sonali",gender:"Female" , nic: "200016348825", "nearest visit date": "01/01/2025", type: "Wards" }
  ];

  return (
    <div>
      <SectionHeader title="Patients" onDateChange={handleDateChange} />
      <div>
      <SegmentedTable
      columns={columns}
      data={data}
      filterOptions={["All", "Clinic Visit", "Wards"]}
      handleRowClick = {handleRowClick}
      tableState={"All"}
    />
     <div className='buttonContainer'>
     <SimpleButton label="Add a New Patient" onClick={handleAddNewPatient} />
     </div>
    </div>
    </div>
    
  );
};

export default Patients;
