import React from "react";
import './css/SegmentedControl.css';

const SegmentedControl = ({ options, selected, onChange }) => {
  

  return (
    <div className="segmented-control">
      {options.map((option) => (
        <button
          key={option}
          className={`segmented-control-button ${
            selected === option ? "selected" : ""
          }`}
          onClick={() => {
            
            onChange(option);
          }}
        >
          {option}
        </button>
      ))}
    </div>
  );
};

export default SegmentedControl;
