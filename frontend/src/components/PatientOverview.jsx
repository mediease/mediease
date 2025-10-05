import React from "react";
import './css/PatientOverview.css'

const PatientOverview = ({ dpUrl, fullName, phn, nic, gender, dob, contactNo, address, guardianName, guardianNIC }) => {
  const getInitials = (name) => {
    if (!name) return "DP";
    const parts = name.trim().split(" ");
    return parts.length >= 2
      ? parts[0][0] + parts[1][0]
      : parts[0].substring(0, 2);
  };

  return (
    <div className="patient-card">
      <h2 className="patient-title">Patient Overview</h2>
      <div className="patient-profile-row">
        {dpUrl ? (
          <img src={dpUrl} alt="Profile" className="patient-image" />
        ) : (
          <div className="patient-placeholder">
            {getInitials(fullName)}
          </div>
        )}
        <div className="patient-info-block">
          <DataRow label="*PHN" value={phn} />
          <DataRow label="*NIC" value={nic} />
        </div>
      </div>
      <DataRow label="*Full Name" value={fullName} />
      <DataRow label="*Gender" value={gender} />
      <DataRow label="*DOB" value={dob} />
      <DataRow label="Contact NO" value={contactNo} />
      <DataRow label="Address" value={address} />
      <DataRow label="Guardian Info" value={guardianName} />
      <DataRow label="Guardian NIC" value={guardianNIC} />
    </div>
  );
};

const DataRow = ({ label, value }) => (
    <div className="data-row">
      <span className="data-label">{label}</span>
      <span className="data-value">{value}</span>
    </div>
  );

export default PatientOverview;
