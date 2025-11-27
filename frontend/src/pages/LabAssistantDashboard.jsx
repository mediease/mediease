import React from "react";
import AdminCard from "../components/admincard";
import { BiSolidReport } from "react-icons/bi";
import { MdAppRegistration } from "react-icons/md";
import { FaUserInjured } from "react-icons/fa";
import "../pages/css/LabAssistantDashboard.css";

const LabAssistantDashboard = () => {
  return (
    <div className="lab-dashboard-container">

      <h2 className="lab-dashboard-title">
        Welcome Back, Lab Area!
      </h2>

      <div className="lab-dashboard-row">
        <AdminCard
          title="Add Report"
          count={" "}
          icon={BiSolidReport}
          link="/lab-assistant/add-report"
        />

        <AdminCard
          title="Update Report"
          count={100}
          icon={MdAppRegistration}
          link="/lab-assistant/update-report"
        />
      </div>

    </div>
  );
};

export default LabAssistantDashboard;
