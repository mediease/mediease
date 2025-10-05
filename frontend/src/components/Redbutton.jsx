import React from 'react';
import './css/buttons.css';


const RedButton = ({ label, onClick, type = "button" }) => {
  return (
    <button className="simple-btn-red" onClick={onClick} type={type}>
      {label}
    </button>
  );
};

export default RedButton ;