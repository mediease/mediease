import React, { useState } from 'react';
import { FaHeart, FaTimes, FaPrint, FaPlus } from 'react-icons/fa';
import './css/PrescriptionPage.css';

const PrescriptionPage = () => {
  // Sample prescription data
  const [prescriptions, setPrescriptions] = useState([
    { id: 1, name: 'Adapalene Gel 0.1%, 45g-other', dose: '2 drops', frequency: 'Mane', period: 'For 4 days', hasComment: true, hasPharmacistComment: true },
    { id: 2, name: 'Adapalene Gel 0.1%, 45g-other', dose: '2 drops', frequency: 'Mane', period: 'For 4 days', hasComment: true, hasPharmacistComment: true },
    { id: 3, name: 'Adapalene Gel 0.1%, 45g-other', dose: '2 drops', frequency: 'Mane', period: 'For 4 days', hasComment: true, hasPharmacistComment: true },
    { id: 4, name: 'Adapalene Gel 0.1%, 45g-other', dose: '2 drops', frequency: 'Mane', period: 'For 4 days', hasComment: true, hasPharmacistComment: false },
    { id: 5, name: 'Adapalene Gel 0.1%, 45g-other', dose: '2 drops', frequency: 'Mane', period: 'For 4 days', hasComment: true, hasPharmacistComment: true },
    { id: 6, name: 'Adapalene Gel 0.1%, 45g-other', dose: '2 drops', frequency: 'Mane', period: 'For 4 days', hasComment: true, hasPharmacistComment: true },
  ]);
  
  // Favorite drugs data
  const [favoriteDrugs] = useState([
    { id: 1, name: 'Balanced salt solution 500ml–other', favorite: true },
    { id: 2, name: 'Carmellose 0.5% with polyvinyl 2% Eye drops 10ml–Other', favorite: true },
    { id: 3, name: 'Carmellose ear drops--other', favorite: true },
    { id: 4, name: 'Oralbalance oral drops--Other', favorite: true },
    { id: 5, name: 'Tropicamide 0.5% with phenylephine hydrochloride 5% eye drop', favorite: true },
    { id: 6, name: '0.2% Fluoride Mouth Wash 60-100ml bot 60-100ml Liquid', favorite: false },
    { id: 7, name: '1 Alpha Cholecalciferol 0.25mcg--Capsule', favorite: false },
    { id: 8, name: '1% Chlorhexidine Gluconate-15g-other', favorite: false }
  ]);

  const [activeTab, setActiveTab] = useState('favorites');
  const [searchTerm, setSearchTerm] = useState('');

  // Remove a prescription
  const removePrescription = (id) => {
    setPrescriptions(prescriptions.filter(prescription => prescription.id !== id));
  };

  // Filter drugs based on search term and active tab
  const filteredDrugs = favoriteDrugs.filter(drug => {
    const matchesSearch = drug.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === 'all' || (activeTab === 'favorites' && drug.favorite);
    return matchesSearch && matchesTab;
  });

  return (
    <div className="prescription-page">
      <table className="prescription-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Dose</th>
            <th>Frequency</th>
            <th>Period</th>
            <th>Dose Comment</th>
            <th>Pharmacist Comment</th>
            <th>Duplicate</th>
            <th>Remove</th>
            <th>Print</th>
          </tr>
        </thead>
        <tbody>
          {prescriptions.map((prescription, index) => (
            <tr key={prescription.id}>
              <td>{index + 1}</td>
              <td>{prescription.name}</td>
              <td>
                <div className="select-wrapper">
                  {prescription.dose}
                  <span className="arrow">▼</span>
                </div>
              </td>
              <td>
                <div className="select-wrapper">
                  {prescription.frequency}
                  <span className="arrow">▼</span>
                </div>
              </td>
              <td>
                <div className="select-wrapper">
                  {prescription.period}
                  <span className="arrow">▼</span>
                </div>
              </td>
              <td>
                <button className="icon-button comment-button">
                  {prescription.hasComment && '✓'}
                </button>
              </td>
              <td>
                <button className={`pharmacist-comment ${prescription.hasPharmacistComment ? 'has-comment' : ''}`}>
                  {prescription.hasPharmacistComment && '✓'}
                </button>
              </td>
              <td>
                <button className="duplicate-button">
                  <FaPlus className="icon green" />
                </button>
              </td>
              <td>
                <button className="remove-button" onClick={() => removePrescription(prescription.id)}>
                  <FaTimes className="icon red" />
                </button>
              </td>
              <td>
                <input type="checkbox" className="print-checkbox" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      <div className="remarks-section">
        <label>Remarks:</label>
        <textarea rows={1}></textarea>
      </div>
      
      <div className="action-buttons">
        <button className="cancel-button">Cancel this prescription</button>
        <button className="done-button">Done</button>
      </div>
      
      <div className="favorites-section">
        <div className="favorites-header">
          <button className={`sort-button ${activeTab === 'favorites' ? 'active' : ''}`} onClick={() => setActiveTab('favorites')}>
            <FaHeart /> My Favorite Group
          </button>
          <button className="add-to-favorites">
            + Add above list to My Favorite Group
          </button>
        </div>
        
        <div className="favorites-tabs">
          <button className={`tab ${activeTab === 'favorites' ? 'active' : ''}`} onClick={() => setActiveTab('favorites')}>
            My Favorite Drugs
          </button>
          <button className={`tab ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>
            All Drugs
          </button>
          <div className="tab-actions">
            <button className="add-remove-button">Add/Remove</button>
          </div>
        </div>
        
        <div className="search-container1">
          <input 
            type="text" 
            placeholder="Search..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="drugs-list">
          {filteredDrugs.map(drug => (
            <div key={drug.id} className="drug-item">
              {drug.favorite && <span className="favorite-indicator">*</span>}
              {drug.name}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PrescriptionPage;