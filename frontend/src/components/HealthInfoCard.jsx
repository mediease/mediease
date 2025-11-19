import React from 'react';
import './css/HealthInfoCard.css';

const HealthInfoCard = ({ height, weight, bmi, bloodPressure, sugarLevel }) => {
  const formatVal = (val, suffix) => {
    if (!val || val === '-' ) return '-';
    // If already contains a unit (space or slash), leave as-is
    if (/\d.*[a-zA-Z%]/.test(val) || /\//.test(val)) return val;
    return suffix ? `${val} ${suffix}` : val;
  };
  const info = [
    { label: 'Height', value: formatVal(height, 'cm') },
    { label: 'Weight', value: formatVal(weight, 'kg') },
    { label: 'BMI', value: formatVal(bmi, '') },
    { label: 'Blood Pressure', value: formatVal(bloodPressure, '') },
    { label: 'Sugar Level', value: formatVal(sugarLevel, 'mg/dL') },
  ];

  return (
    <div className="card">
      <h3 className="title">General Health Information</h3>
      {info.map((item, index) => (
        <div className="info-row" key={index}>
          <span className="label">{item.label}</span>
          <div className="value-box">{item.value}</div>
        </div>
      ))}
    </div>
  );
};

export default HealthInfoCard;
