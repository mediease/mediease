import React from 'react';
import { Link } from 'react-router-dom';
import './css/AdminCard.css';

const AdminCard = ({ title, count, icon: Icon, link }) => {
  return (
    <div className="info-card">
      <div className="info-text">
        <h3 className="info-title">{title}</h3>
        <p className="info-count">{count}</p>
        <Link to={link}>
          <button className="info-button">View</button>
        </Link>
      </div>
      <div className="info-icon">
        {Icon && <Icon className="icon-svg" />}
      </div>
    </div>
  );
};

export default AdminCard;
