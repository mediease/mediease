import React, { useState } from 'react';
import { FaHeart, FaTimes, FaPrint, FaPlus } from 'react-icons/fa';
import './css/PrescriptionPage.css';

const doseOptions = [
  '0.5 drop',
  '1 drop',
  '2 drops',
  '5 drops',
  '1 tablet',
  '2 tablets',
  '5 ml',
  '10 ml',
  'As directed',
];

const frequencyOptions = [
  'Once daily',
  'BID',
  'TID',
  'QID',
  'Mane',
  'Nocte',
  'PRN',
  'As needed',
];

const periodOptions = [
  'For 3 days',
  'For 4 days',
  '1 week',
  '2 weeks',
  '1 month',
  'Until next visit',
];

const getOptionsWithValue = (options, value) => {
  if (!value) return options;
  return options.includes(value) ? options : [...options, value];
};

const PrescriptionPage = () => {
  // Sample prescription data
  const [prescriptions, setPrescriptions] = useState([
    { id: 1, name: 'Adapalene Gel 0.1%, 45g-other', dose: '2 drops', frequency: 'Mane', period: 'For 4 days', doseComment: '', pharmacistComment: '' },
    { id: 2, name: 'Adapalene Gel 0.1%, 45g-other', dose: '2 drops', frequency: 'Mane', period: 'For 4 days', doseComment: '', pharmacistComment: '' },
    { id: 3, name: 'Adapalene Gel 0.1%, 45g-other', dose: '2 drops', frequency: 'Mane', period: 'For 4 days', doseComment: '', pharmacistComment: '' },
    { id: 4, name: 'Adapalene Gel 0.1%, 45g-other', dose: '2 drops', frequency: 'Mane', period: 'For 4 days', doseComment: '', pharmacistComment: '' },
    { id: 5, name: 'Adapalene Gel 0.1%, 45g-other', dose: '2 drops', frequency: 'Mane', period: 'For 4 days', doseComment: '', pharmacistComment: '' },
    { id: 6, name: 'Adapalene Gel 0.1%, 45g-other', dose: '2 drops', frequency: 'Mane', period: 'For 4 days', doseComment: '', pharmacistComment: '' },
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

  const duplicatePrescription = (id) => {
    setPrescriptions(prev => {
      const index = prev.findIndex(prescription => prescription.id === id);
      if (index === -1) return prev;
      const copy = { ...prev[index], id: Date.now() };
      const updated = [...prev];
      updated.splice(index + 1, 0, copy);
      return updated;
    });
  };

  const handlePrescriptionChange = (id, field, value) => {
    setPrescriptions(prev =>
      prev.map(prescription =>
        prescription.id === id ? { ...prescription, [field]: value } : prescription
      )
    );
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
                  <select
                    value={prescription.dose}
                    onChange={(e) => handlePrescriptionChange(prescription.id, 'dose', e.target.value)}
                  >
                    {getOptionsWithValue(doseOptions, prescription.dose).map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                 
                </div>
              </td>
              <td>
                <div className="select-wrapper">
                  <select
                    value={prescription.frequency}
                    onChange={(e) => handlePrescriptionChange(prescription.id, 'frequency', e.target.value)}
                  >
                    {getOptionsWithValue(frequencyOptions, prescription.frequency).map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  
                </div>
              </td>
              <td>
                <div className="select-wrapper">
                  <select
                    value={prescription.period}
                    onChange={(e) => handlePrescriptionChange(prescription.id, 'period', e.target.value)}
                  >
                    {getOptionsWithValue(periodOptions, prescription.period).map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                 
                </div>
              </td>
              <td>
                <textarea
                  className="comment-input"
                  rows={2}
                  value={prescription.doseComment}
                  onChange={(e) => handlePrescriptionChange(prescription.id, 'doseComment', e.target.value)}
                  placeholder="Add note..."
                />
              </td>
              <td>
                <textarea
                  className="comment-input"
                  rows={2}
                  value={prescription.pharmacistComment}
                  onChange={(e) => handlePrescriptionChange(prescription.id, 'pharmacistComment', e.target.value)}
                  placeholder="Add pharmacist note..."
                />
              </td>
              <td>
                <button className="duplicate-button" onClick={() => duplicatePrescription(prescription.id)}>
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