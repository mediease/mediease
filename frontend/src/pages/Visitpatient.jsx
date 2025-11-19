import { useParams, useNavigate } from "react-router-dom";
import React, { useState } from "react";
import PatientOverview from "../components/PatientOverview";
import SegmentedControl from "../components/SegmentedControl";
import HealthInfoCard from "../components/HealthInfoCard";
import SimpleButton from '../components/buttons';
import RedButton from "../components/Redbutton";
import PatientSummaryModal from "../components/PatientSummaryModal";
import './css/style.css'

const Visitpatient = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const filterOptions = ["Basic", "Report", "Allergies", "Medications", "Visit History"];

  const [selectedFilter, setSelectedFilter] = useState("Basic");
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);

  // Handle tab change with navigation
  const handleTabChange = (option) => {
    setSelectedFilter(option);
    
    // Navigate to the appropriate route based on selected tab
    switch(option) {
      case "Basic":
        navigate(`/doctor/patient/${id}`);
        break;
      case "Report":
        navigate(`/doctor/patient/${id}/reportinfo`);
        break;
      case "Allergies":
        navigate(`/doctor/patient/${id}/allergies`);
        break;
      case "Medications":
        navigate(`/doctor/patient/${id}/medications`);
        break;
      case "Visit History":
        navigate(`/doctor/patient/${id}/historyinfo`);
        break;
      default:
        navigate(`/doctor/patient/${id}`);
    }
  };

  const clickVisit = () => {
    navigate(`/doctor/patient/${id}/medicationsinfo/newprescription`);
  };

  const handleRequestSummary = () => {
    setIsSummaryModalOpen(true);
  };

  const handleCloseSummary = () => {
    setIsSummaryModalOpen(false);
  };

  // Patient summary data - in a real app, this would be fetched from an API
  const patientSummaryData = {
    demographics: {
      name: 'Bandarage Naveen Bimsara',
      age: 24,
      dob: '2000-06-12',
      mrn: id || '1001',
      bloodType: 'A+'
    },
    diagnoses: [
      { name: 'Hypertension', snomed: '3834100' },
      { name: 'Hyperlipidemia', snomed: '205890000' }
    ],
    medications: [
      { name: 'Amlodipine', dosage: '5mg', condition: 'Hypertension' },
      { name: 'Atorvastatin', dosage: '20mg', condition: 'Hyperlipidemia' }
    ],
    allergies: [
      { name: 'NSAIDS', severity: 'Moderate', reaction: 'GI upset' }
    ],
    labFindings: [
      { name: 'Blood Pressure', value: '110/70 mmHg' }
    ],
    assessment: 'This is a 24-year-old patient with 2 active medical conditions requiring ongoing management. Current medication regimen includes 2 medications. Notable allergies documented. Recent vital signs and laboratory parameters are available.',
    recommendation: 'Continue current management with regular monitoring and follow-up appointments.'
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
            dpUrl="" 
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
                label="Oder New Report" 
                onClick={clickVisit}
                />
                <div className="inlineButton"></div>
                <SimpleButton 
                label="Add Allergies" 
                onClick={clickVisit}
                />
            </div>
            <div className="inlineButton">
                <SimpleButton 
                label="Request Summary" 
                onClick={handleRequestSummary}
                />
                <div className="inlineButton"></div>
                <SimpleButton 
                label="New Prescription" 
                onClick={clickVisit}
                />
            </div>
            <div className="inlineButton">
                <RedButton
                label="Close the Visit" 
                onClick={clickVisit}
                />
            </div>
            </div>
        </div>
      </div>
      
      <PatientSummaryModal 
        isOpen={isSummaryModalOpen}
        onClose={handleCloseSummary}
        patientData={patientSummaryData}
      />
    </div>
  );
};

export default Visitpatient;