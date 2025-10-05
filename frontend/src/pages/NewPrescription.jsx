import { useParams, useNavigate } from "react-router-dom";
import React, { useState } from "react";
import SegmentedControl from "../components/SegmentedControl";
import './css/style.css'
import PrescriptionPage from "../components/Prescription";
const NewPrescription = () =>{
     const { id } = useParams();
      const navigate = useNavigate();
      const filterOptions = ["Basic", "Report", "Allergies", "Medications", "Visit History"];
      
      const [selectedFilter, setSelectedFilter] = useState("Medications");
         

      const handleTabChange = (option) => {
        setSelectedFilter(option);
    
        switch(option) {
          case "Basic":
            navigate(`/doctor/patient/${id}`);
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
            <PrescriptionPage/>
            
        </div>
      )
}

export default NewPrescription;