// src/components/StaffSidebar.jsx
import { useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import "./css/Sidebar.css";
import logo from '../assets/logo.jpg';
import { IoMdHome } from "react-icons/io";
import { FaUserFriends } from "react-icons/fa";
import { TbReport } from "react-icons/tb";
import { FaRegCalendarCheck } from "react-icons/fa";
import { IoSettingsOutline } from "react-icons/io5";
import { IoLogOutOutline } from "react-icons/io5";

const StaffSidebar = () => {
  const location = useLocation();

  const LogoPlaceholder = () => (
    <div className="logo-container">
      <img src={logo} alt="Logo" className="sidebar-logo" />
    </div>
  );

  const menuItems = [
    { title: 'Home', path: '/staff', icon: <IoMdHome /> },
    { title: 'Patients', path: '/staff/patients', icon: <FaUserFriends /> },
    { title: 'Appointments', path: '/staff/appointments', icon: <FaRegCalendarCheck /> },
    { title: 'Settings', path: '/staff/settings', icon: <IoSettingsOutline /> },
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <LogoPlaceholder />
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item, index) => (
          <Link 
            key={index} 
            to={item.path} 
            className={`nav-item1 ${location.pathname === item.path ? 'active' : ''}`}
          >
            <span className="icon">{item.icon}</span>
            <span className="title">{item.title}</span>
          </Link>
        ))}
        <Link 
          to="/login"
          className="nav-item1"
          onClick={() => {
            localStorage.removeItem('token');
            localStorage.removeItem('staff');
            localStorage.removeItem('nurId');
          }}
        >
          <span className="icon"><IoLogOutOutline /></span>
          <span className="title">Logout</span>
        </Link>
      </nav>
    </div>
  );
};

export default StaffSidebar;


