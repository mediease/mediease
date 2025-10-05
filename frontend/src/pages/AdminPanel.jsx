import React from 'react';
import AdminCard from '../components/admincard';
import { FaCalendarCheck } from 'react-icons/fa';
import { BiSolidReport } from "react-icons/bi";
import { MdAppRegistration } from "react-icons/md";
import { FaUserDoctor } from "react-icons/fa6";
import { FaUserNurse } from "react-icons/fa6";
import { FaUserInjured } from 'react-icons/fa'; 
const AdminPanel = () => {
  return (
    <div className='adminPanelContainer'>
        <h1>Welcome Back !</h1>
        <div className='panelRow'>
            <AdminCard
            title="Today Appointments"
            count={802}
            icon={FaCalendarCheck}
            link="/admin/allappointments"
            />
            <AdminCard
            title="Today Reports"
            count={110}
            icon={BiSolidReport}
            link="/admin"
            />
            <AdminCard
            title="User Registration"
            count={12}
            icon={MdAppRegistration}
            link="/admin/userregister"
            />
        </div>
        <div className='panelRow'>
            <AdminCard
            title="Doctors"
            count={'\u00A0'}
            icon={FaUserDoctor}
            link="/admin"
            />
            <AdminCard
            title="Nurses"
            count={'\u00A0'}
            icon={FaUserNurse}
            link="/admin"
            />
            <AdminCard
            title="Patients"
            count={'\u00A0'}
            icon={FaUserInjured}
            link="/admin"
            />
        </div>
    </div>
  );
};

export default AdminPanel;
