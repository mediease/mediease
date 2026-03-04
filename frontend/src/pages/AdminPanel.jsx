import React, { useEffect, useState } from 'react';
import AdminCard from '../components/admincard';
import { FaCalendarCheck } from 'react-icons/fa';
import { BiSolidReport } from "react-icons/bi";
import { MdAppRegistration } from "react-icons/md";
import { FaUserDoctor } from "react-icons/fa6";
import { FaUserNurse } from "react-icons/fa6";
import { FaUserInjured } from 'react-icons/fa';
import httpClient from '../services/httpClient';

const AdminPanel = () => {
  const [counts, setCounts] = useState({
    appointments: '…',
    patients: '…',
    doctors: '…',
    nurses: '…'
  });

  useEffect(() => {
    const fetchCounts = async () => {
      const results = await Promise.allSettled([
        httpClient.get('/fhir/appointments?limit=1'),
        httpClient.get('/fhir/Patient?limit=1'),
        httpClient.get('/fhir/Practitioner?role=doctor'),
        httpClient.get('/fhir/Practitioner?role=nurse')
      ]);

      const get = (res) => res.status === 'fulfilled'
        ? (res.value.data?.total ?? res.value.data?.data?.length ?? '-')
        : '-';

      setCounts({
        appointments: get(results[0]),
        patients: get(results[1]),
        doctors: get(results[2]),
        nurses: get(results[3])
      });
    };

    fetchCounts();
  }, []);

  return (
    <div className='adminPanelContainer'>
      <h1>Welcome Back!</h1>
      <div className='panelRow'>
        <AdminCard
          title="Appointments"
          count={counts.appointments}
          icon={FaCalendarCheck}
          link="/admin/allappointments"
        />
        <AdminCard
          title="User Registration"
          count={'\u00A0'}
          icon={MdAppRegistration}
          link="/admin/userregister"
        />
        <AdminCard
          title="Patients"
          count={counts.patients}
          icon={FaUserInjured}
          link="/admin/users"
        />
      </div>
      <div className='panelRow'>
        <AdminCard
          title="Doctors"
          count={counts.doctors}
          icon={FaUserDoctor}
          link="/admin/docappointments"
        />
        <AdminCard
          title="Nurses"
          count={counts.nurses}
          icon={FaUserNurse}
          link="/admin/users"
        />
        <AdminCard
          title="Reports"
          count={'\u00A0'}
          icon={BiSolidReport}
          link="/admin"
        />
      </div>
    </div>
  );
};

export default AdminPanel;
