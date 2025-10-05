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
      const data = [
        { id: '001', name: 'Albuterol HFA', dose: '2 puffs', frequency: 'q4h prn', quantity: '-', refills: '12', condition: 'Asthma', provider: 'Dr.Nisal Rajeev', prescribed: '20/12/2024' },
        { id: '002', name: 'Aspirin', dose: '80 mg', frequency: '1 daily', quantity: '-', refills: '12', condition: 'Diabetes', provider: 'Dr.Nisal Rajeev', prescribed: '10/12/2024' },
        { id: '003', name: 'Beclometha. HFA', dose: '2 puffs', frequency: '1 bid', quantity: '-', refills: '12', condition: 'Asthma', provider: 'Dr.Nisal Rajeev', prescribed: '20/12/2024' },
        { id: '004', name: 'Carvedilol', dose: '12.5 mg', frequency: '1 daily', quantity: '90', refills: '3', condition: 'Hypertension', provider: 'Dr.Nisal Rajeev', prescribed: '26/12/2024' },
        { id: '005', name: 'Clorthalidone', dose: '25 mg', frequency: '1 daily', quantity: '90', refills: '3', condition: 'Hypertension', provider: 'Dr.Nisal Rajeev', prescribed: '21/12/2024' },
        { id: '006', name: 'Citalopram', dose: '25 mg', frequency: '1 daily', quantity: '90', refills: '3', condition: 'Depression', provider: 'Dr.John Peris', prescribed: '26/12/2024' }
      ];
      const columns = [
        { label: 'ID', key: 'id' },
        { label: 'Name', key: 'name' },
        { label: 'Dose', key: 'dose' },
        { label: 'Frequency', key: 'frequency' },
        { label: 'Quantity', key: 'quantity' },
        { label: 'Refills', key: 'refills' },
        { label: 'Condition', key: 'condition' },
        { label: 'Provider', key: 'provider' },
        { label: 'Prescribed', key: 'prescribed' }
      ];      
  
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
            showHeader={false}
            showActions={false}
            />
            <div className="inlineButton">
            
            </div>
        </div>
      )
}

export default MedicationsInfo;