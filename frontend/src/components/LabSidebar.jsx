import { useLocation, Link } from "react-router-dom";
import "./css/Sidebar.css";
import logo from '../assets/logo.jpg';
import { IoMdHome } from "react-icons/io";
import { BiSolidReport } from "react-icons/bi";
import { MdAppRegistration } from "react-icons/md";
import { IoSettingsOutline } from "react-icons/io5";
import { IoLogOutOutline } from "react-icons/io5";

const LabSidebar = () => {
  const location = useLocation();

  const menuItems = [
    { title: 'Home', path: '/lab-assistant', icon: <IoMdHome /> },
    { title: 'Add Report', path: '/lab-assistant/add-report', icon: <BiSolidReport /> },
    { title: 'Update Report', path: '/lab-assistant/update-report', icon: <MdAppRegistration /> },
    { title: 'Settings', path: '/lab-assistant/settings', icon: <IoSettingsOutline /> },
  ];

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('labId');
    localStorage.removeItem('labAssistant');
    localStorage.removeItem('token');
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="logo-container">
          <img src={logo} alt="Logo" className="sidebar-logo" />
        </div>
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
          onClick={handleLogout}
        >
          <span className="icon"><IoLogOutOutline /></span>
          <span className="title">Logout</span>
        </Link>
      </nav>
    </div>
  );
};

export default LabSidebar;
