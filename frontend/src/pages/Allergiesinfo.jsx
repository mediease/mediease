import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SegmentedControl from "../components/SegmentedControl";
import './css/allergiesinfo.css';

const Allergiesinfo = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const filterOptions = ["Basic", "Report", "Allergies", "Medications", "Visit History"];
  const [selectedFilter, setSelectedFilter] = useState("Allergies");
  const [selectedTab, setSelectedTab] = useState('Drugs');

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

  return (
    <div className="patientDetailsMain">
      <h2 className="patientDetailsHeder">Patients - Naveen Bimsara</h2>
      <SegmentedControl 
        options={filterOptions}
        selected={selectedFilter}
        onChange={handleTabChange}
      />

      <div className="allergies-main">
        <div className="allergies-categories">
          <div className="category-tabs">
            {['Drugs', 'Food', 'Environmental'].map(tab => (
              <button 
                key={tab}
                className={`category-tab ${selectedTab === tab ? 'active' : ''}`}
                onClick={() => setSelectedTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="categories-section">
            <h3>Categories</h3>
            <div className="category-list">
              <div className="category-item active">Antibiotics</div>
              <div className="category-item">Pain Medication</div>
              <div className="category-item">Anti-inflammatory</div>
              <div className="category-item">Biologic</div>
              <div className="category-item">Anesthetics</div>
              <div className="category-item">Contrast Agent</div>
            </div>

            <div className="antibiotic-section">
              <h4>Antibiotics</h4>
              <div className="allergy-items">
                <div className="allergy-item">
                  <div className="allergy-header">
                    <span>Penicillin</span>
                    <span className="severity severe">Severe</span>
                  </div>
                  <div className="reaction-text">
                    Reaction: Anaphylaxis - Confirmed 21/12/2024
                  </div>
                </div>
                <div className="allergy-item">
                  <div className="allergy-header">
                    <span>Amoxicillin</span>
                    <span className="severity moderate">Moderate</span>
                  </div>
                  <div className="reaction-text">
                    Reaction: Rash - Reported by patient 06/12/2024
                  </div>
                </div>
              </div>

              <div className="available-selections">
                <h4>Available Selections:</h4>
                <div className="selection-chips">
                  <div className="chip">Cephalosporins</div>
                  <div className="chip">Erythromycin</div>
                  <div className="chip">Tetracyclines</div>
                  <div className="chip add-custom">+ Add Custom</div>
                </div>
              </div>

              <div className="action-buttons">
                <button className="save-btn">Save</button>
                <button className="cancel-btn">Cancel</button>
              </div>
            </div>
          </div>
        </div>

        <div className="allergic-details">
          <div className="detail-header">
            <h3>Allergic Details</h3>
          </div>
          
          <div className="detail-item">
            <div className="detail-title">
              <span>Penicillin</span>
              <span className="update-date">Updated: 21/12/2024</span>
              <span className="severity severe">Severe</span>
            </div>
            <div className="detail-content">
              <p><strong>Reaction:</strong> Anaphylaxis with difficulty breathing, hives, and facial swelling</p>
              <p><strong>Verification method:</strong> Positive skin test performed by Dr. Roberts</p>
            </div>
          </div>
          
          {/* Additional allergy details... */}
        </div>
      </div>
    </div>
  );
};

export default Allergiesinfo;