import React from 'react';
import './css/buttons.css';

const SimpleButton = ({ label, onClick, type = "button" }) => {
  return (
    <button className="simple-btn" onClick={onClick} type={type}>
      {label}
    </button>
  );
};


export  default SimpleButton ;