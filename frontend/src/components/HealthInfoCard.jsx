import React from 'react';
import './css/HealthInfoCard.css';

const HealthInfoCard = ({ height, weight, bmi, bloodPressure, sugarLevel }) => {
  const info = [
    { label: 'Height', value: `${height} cm` },
    { label: 'Weight', value: `${weight} kg` },
    { label: 'BMI', value: bmi },
    { label: 'Blood Pressure', value: bloodPressure },
    { label: 'Sugar Level', value: `${sugarLevel} mg/dL` },
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
