// src/components/Header.jsx
import React from 'react';
import logo from '../assets/logo.jpg';
import './css/Header.css'
import { FaRegBell } from "react-icons/fa";
import { IoMail } from "react-icons/io5";
import { FiSearch } from "react-icons/fi";
import { FaUser } from "react-icons/fa6";

const Header = () => {
  const currentDate = new Date();
  const hours = currentDate.getHours();
  const minutes = currentDate.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  const timeString = `${displayHours}:${minutes} ${ampm} today ${currentDate.getMonth() + 1}/${currentDate.getDate()}/${currentDate.getFullYear()}`;
    const LogoPlaceholder = () => (
    <div className="logo-container">
      
      <img src={logo} alt="Logo" className="sidebar-logo" />
    </div>
  );
  return (
    <header className="header">
      <div className="search-container">
        <input type="text" placeholder="Search.." className="search-input" />
        <button className="search-button">
        <FiSearch />
        </button>
      </div>

      <div className="date-time">
        {timeString}
      </div>

      <div className="header-icons">
        <div className="icon-container notification-icon">
        <FaRegBell />
          <span className="notification-dot"></span>
        </div>
        
        <div className="icon-container message-icon">
        <IoMail />
          <span className="notification-badge">3</span>
        </div>
        
        <div className="profile">
        <FaUser />
        </div>
      </div>
    </header>
  );
};

export default Header;