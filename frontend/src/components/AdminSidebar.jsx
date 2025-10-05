// src/components/AdminSidebar.jsx
import { useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import "./css/Sidebar.css";
import logo from '../assets/logo.jpg';
import { MdOutlineDashboard } from "react-icons/md";
import { FaUserFriends } from "react-icons/fa";  
import { TbReport } from "react-icons/tb";
import { FaRegCalendarCheck } from "react-icons/fa";
import { IoSettingsOutline } from "react-icons/io5";

const AdminSidebar = () => {
  const location = useLocation();

  const LogoPlaceholder = () => (
    <div className="logo-container">
      <img src={logo} alt="Logo" className="sidebar-logo" />
    </div>
  );

  const adminMenuItems = [
    { title: 'Dashbord', path: '/admin', icon: <MdOutlineDashboard /> },
    { title: 'Users', path: '/admin/users', icon: <FaUserFriends /> },  
    { title: 'Reports', path: '/admin/reports', icon: <TbReport /> },
    { title: 'Appointments', path: '/admin/docappointments', icon: <FaRegCalendarCheck /> },
    { title: 'Settings', path: '/admin/settings', icon: <IoSettingsOutline /> },
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <LogoPlaceholder />
      </div>

      <nav className="sidebar-nav">
        {adminMenuItems.map((item, index) => (
          <Link 
            key={index} 
            to={item.path} 
            className={`nav-item1 ${location.pathname === item.path ? 'active' : ''}`}
          >
            <span className="icon">{item.icon}</span>
            <span className="title">{item.title}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default AdminSidebar;
