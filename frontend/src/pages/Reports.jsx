import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import SectionHeader from '../components/SectionHeader';
import SegmentedTable from '../components/SegmentedTable';

const HomePage = () => {
  const [selectedDate, setSelectedDate] = useState(null);
  const navigate = useNavigate();
  const handleRowClick = (row) => {
    navigate(`/doctor/reports/${row.id}`);
  };
  const handleDateChange = (date) => {
    setSelectedDate(date);
  };
  selectedDate ? selectedDate.toDateString() : 'None'

  const columns = [
    { label: "ID", key: "id" },
    { label: "PHN", key: "phn" },
    { label: "Type", key: "type" },
    { label: "Patient Name", key: "patient name" },
    { label: "Status", key: "status" },
    { label: "Date", key: "date" },
    { label: "Action", key: "action" }
  ];
  

  const Data = [
    { id: "0102", phn: "1001", type: "Consultation", "patient name": "Niluka", status: "In Progress", date: "20/12/2024" },
    { id: "0103", phn: "1102", type: "Lab Test", "patient name": "Roshini", status: "Completed", date: "24/12/2024" },
    { id: "0102", phn: "1256", type: "Emergency Visit", "patient name": "Lahiru", status: "In Progress", date: "21/12/2024" },
    { id: "0098", phn: "890", type: "Follow-up", "patient name": "Pathum", status: "Completed", date: "26/12/2024" },
    { id: "0085", phn: "451", type: "Vaccination", "patient name": "Naduni", status: "In Progress", date: "28/12/2024" },
    { id: "0005", phn: "753", type: "Lab Test", "patient name": "Deshan", status: "Completed", date: "30/12/2024" }
  ];

  return (
    <div>
      <SectionHeader title="Reports" onDateChange={handleDateChange} />
      <SegmentedTable
      columns={columns}
      data={Data}
      filterOptions={["All", "Clinic Visit", "Wards"]}
      handleRowClick = {handleRowClick}
      tableState={"All"}
      renderCell={(col, value) => {
        if (col === "Action") {
          return (
            <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
              <span role="img" aria-label="view">👁️</span>
              <span role="img" aria-label="download">⬇️</span>
              <span role="img" aria-label="print">🖨️</span>
            </div>
          );
        }
        return value;
      }}
    />
    </div>
  );
};

export default HomePage;
