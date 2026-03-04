import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import './css/appointmentview.css';
import SimpleButton from '../components/buttons';
import httpClient from '../services/httpClient';

const AppointmentView = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        const res = await httpClient.get(`/fhir/Appointment/${id}`);
        setAppointment(res.data?.data || null);
      } catch (err) {
        setError('Appointment not found');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchAppointment();
  }, [id]);

  const meta = appointment?.metadata || {};
  const patientPhn = meta.patientPhn || '';
  const status = meta.status || '-';
  const date = meta.appointmentDate
    ? new Date(meta.appointmentDate).toLocaleDateString()
    : '-';

  if (loading) return <div style={{ padding: '2rem' }}>Loading appointment…</div>;
  if (error) return <div style={{ padding: '2rem', color: 'red' }}>{error}</div>;

  return (
    <div className="appointment-page">
      <h1 className="main-header">Appointment</h1>

      <div className="appointment-view">
        <div className="appointment-details">
          <div className="detail-row">
            <h3 className="patient-name">Patient: {patientPhn || '—'}</h3>
            <span className={`status-badge ${status.toLowerCase().replace(' ', '-')}`}>
              {status}
            </span>
          </div>

          <table className="detail-table">
            <tbody>
              <tr>
                <td><label>Date:</label></td>
                <td className="bold-text">{date}</td>
              </tr>
              <tr>
                <td><label>ID:</label></td>
                <td className="bold-text">{appointment?.apid || '-'}</td>
              </tr>
              <tr>
                <td><label>Room No:</label></td>
                <td className="bold-text">{meta.roomNo || '-'}</td>
              </tr>
              <tr>
                <td><label>Type:</label></td>
                <td className="bold-text">{meta.type || '-'}</td>
              </tr>
              <tr>
                <td><label>Doctor:</label></td>
                <td className="bold-text">{meta.doctorLicense || '-'}</td>
              </tr>
            </tbody>
          </table>

          <SimpleButton
            label="View Patient Details"
            onClick={() => patientPhn && navigate(`/doctor/patient/${patientPhn}`)}
          />
        </div>
      </div>
    </div>
  );
};

export default AppointmentView;
