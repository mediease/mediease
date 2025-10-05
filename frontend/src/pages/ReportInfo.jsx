import { useParams, useNavigate } from "react-router-dom";
import React, { useState } from "react";
import SegmentedControl from "../components/SegmentedControl";
import './css/style.css'
import TableN1 from "../components/tableN1";
import SimpleButton from "../components/buttons";
const ReportInfo = () =>{
     const { id } = useParams();
      const navigate = useNavigate();
      const filterOptions = ["Basic", "Report", "Allergies", "Medications", "Visit History"];
      
      const [selectedFilter, setSelectedFilter] = useState("Report");
      const columns = [
        { label: 'ID', key: 'id' },
        { label: 'Name', key: 'name' },
        { label: 'Provide Doctor', key: 'providedoctor' },
        { label: 'Last Update', key: 'lastupdate' },
        { label: 'Last Updated By', key: 'lastupdatedby' },
      ];
      const data = [
        { id: '0102', name: 'Prolactin', providedoctor: 'Niluka', lastupdate: '20/12/2024', lastupdatedby: 'Nilani' },
        { id: '0103', name: 'Bilirubin', providedoctor: 'Roshini', lastupdate: '24/12/2024', lastupdatedby: 'Pathmawad' },
        { id: '0102', name: 'DHEA-sulphate', providedoctor: 'Lahiru', lastupdate: '21/12/2024', lastupdatedby: 'Ruwindi' },
        { id: '0098', name: 'FUC', providedoctor: 'Pathum', lastupdate: '26/12/2024', lastupdatedby: 'Ruwindi' },
        { id: '0085', name: 'Alcohol', providedoctor: 'Naduni', lastupdate: '28/12/2024', lastupdatedby: 'Padmawad' },
        { id: '0005', name: 'FBC', providedoctor: 'Deshan', lastupdate: '30/12/2024', lastupdatedby: 'Ruwindi' },
        { id: '0102', name: 'Prolactin', providedoctor: 'Niluka', lastupdate: '20/12/2024', lastupdatedby: 'Nilani' },
        { id: '0103', name: 'Bilirubin', providedoctor: 'Roshini', lastupdate: '24/12/2024', lastupdatedby: 'Pathmawad' },
        { id: '0102', name: 'DHEA-sulphate', providedoctor: 'Lahiru', lastupdate: '21/12/2024', lastupdatedby: 'Ruwindi' },
        { id: '0098', name: 'FUC', providedoctor: 'Pathum', lastupdate: '26/12/2024', lastupdatedby: 'Ruwindi' },
        { id: '0085', name: 'Alcohol', providedoctor: 'Naduni', lastupdate: '28/12/2024', lastupdatedby: 'Padmawad' },
        { id: '0005', name: 'FBC', providedoctor: 'Deshan', lastupdate: '30/12/2024', lastupdatedby: 'Ruwindi' },
      ];
      // Handle tab change with navigation
      const handleTabChange = (option) => {
        setSelectedFilter(option);
        
        // Navigate to the appropriate route based on selected tab
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
            compact
            showHeader={false}
            showActions={true}
            />
            <div className="inlineButton">
            
            </div>
            

        </div>
      )
}

export default ReportInfo;