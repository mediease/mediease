import { useParams, useNavigate } from "react-router-dom";
import React, { useState } from "react";
import SegmentedControl from "../components/SegmentedControl";
import './css/style.css'
import TableN1 from "../components/tableN1";
import SimpleButton from "../components/buttons";
const MedicationsInfo = () =>{
     const { id } = useParams();
      const navigate = useNavigate();
      const filterOptions = ["Basic", "Report", "Allergies", "Medications", "Visit History"];
     
      const [selectedFilter, setSelectedFilter] = useState("Medications");
      const handleIssuePrescription = () => {
        navigate(`/doctor/patient/${id}/medicationsinfo/newprescription`);
      };
      // Load prescriptions from localStorage
      const [prescriptions, setPrescriptions] = useState([]);
      React.useEffect(() => {
        const keys = Object.keys(localStorage).filter(k => k.startsWith(`prescription_${id}_`));
        const loaded = keys.map(k => {
          try {
            return JSON.parse(localStorage.getItem(k));
          } catch {
            return null;
          }
        }).filter(Boolean);
        setPrescriptions(loaded);
      }, [id]);

      const columns = [
        { label: 'Complaint', key: 'complaint' },
        { label: 'Doctor', key: 'doctor' },
        { label: 'Prescribe Date', key: 'prescribeDate' },
        { label: 'Status', key: 'status' },
        { label: 'View', key: 'view' }
      ];

      // Map prescriptions to table rows
      const data = prescriptions.map((p, idx) => ({
        complaint: p.meta.complaint,
        doctor: p.meta.doctor,
        prescribeDate: p.meta.prescribeDate,
        status: p.meta.status,
        view: <button onClick={() => alert(JSON.stringify(p, null, 2))}>View</button>
      }));
  
      const handleTabChange = (option) => {
        setSelectedFilter(option);
    
        
        switch(option) {
          case "Basic":
            navigate(`/doctor/visitpatient/${id}`);
            break;
          case "Report":
            navigate(`/doctor/patient/${id}/reportinfo`);
            break;
          case "Allergies":
            navigate(`/doctor/patient/${id}/allergiesinfo`);
            break;
          case "Medications":
            navigate(`/doctor/patient/${id}/medicationsinfo`);
            break;
          case "Visit History":
            navigate(`/doctor/patient/${id}/historyinfo`);
            break;
          default:
            navigate(`/doctor/patient/${id}`);
        }
      };
      return(
        <div  className="patientDetailsMain">
            <h2 className="patientDetailsHeder">Patients - Naveen Bimsara</h2>
            <SegmentedControl 
            options={filterOptions}
            selected={selectedFilter}
            onChange={handleTabChange}
            />
            <TableN1
              columns={columns}
              data={data}
              showHeader={true}
              showActions={false}
            />
            <div className="inlineButton" style={{ justifyContent: "flex-end" }}>
                <SimpleButton 
                label="Issue New Prescription" 
                onClick={handleIssuePrescription}
                />
            </div>
        </div>
      )
}

export default MedicationsInfo;