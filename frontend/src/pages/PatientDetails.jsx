import { useParams, useNavigate } from "react-router-dom";
import React, { useState } from "react";
import PatientOverview from "../components/PatientOverview";
import SegmentedControl from "../components/SegmentedControl";
import HealthInfoCard from "../components/HealthInfoCard";
import SimpleButton from '../components/buttons';
import './css/style.css'

const PatientDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const filterOptions = ["Basic", "Report", "Allergies", "Medications", "Visit History"];

  const [selectedFilter, setSelectedFilter] = useState("Basic");

  // Handle tab change with navigation
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

  const clickVisit = () => {
    navigate(`/doctor/patient/${id}/visit`);
  };

  return (
    <div className="patientDetailsMain">
      <h2 className="patientDetailsHeder">Patients - Naveen Bimsara</h2>
      <SegmentedControl 
        options={filterOptions}
        selected={selectedFilter}
        onChange={handleTabChange}
      />
      
      <div className="table-row">
        <div className="table-half">
            <PatientOverview
            dpUrl="" // or provide a valid image URL
            fullName="Bandarage Naveen Bimsara"
            phn={id}
            nic="200016489950"
            gender="Male"
            dob="June 12, 2000"
            contactNo="074 1234 589"
            address="NO:10/A, 2nd Lane, Meepe, Padukka"
            guardianName="M.R.M. Nayomi"
            guardianNIC="8945678125V"
            />
        </div>
        <div className="table-half">
          <div>
          <HealthInfoCard
            height={168}
            weight={65}
            bmi={23.03}
            bloodPressure="110/70"
            sugarLevel={120}
            />
          </div>
          <div className='buttonContainer'>
            <div className="inlineButton">
                <SimpleButton 
                label="Create A Cinic Visit" 
                onClick={clickVisit}
                />
                
            </div>
            
            </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDetails;