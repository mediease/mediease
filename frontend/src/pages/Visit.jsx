import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import VisitForm from '../components/VisitForm';
import httpClient from '../services/httpClient';

function Visit() {
  const { id } = useParams();
  const [patientName, setPatientName] = useState('');

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const res = await httpClient.get(`/fhir/Patient/${id}`);
        const p = res.data?.data;
        if (p) {
          const name = p.metadata
            ? `${p.metadata.firstName || ''} ${p.metadata.lastName || ''}`.trim()
            : (p.resource?.name?.[0]?.given?.[0] || '') + ' ' + (p.resource?.name?.[0]?.family || '');
          setPatientName(name.trim());
        }
      } catch {
        // silently ignore — patient name is non-critical here
      }
    };

    if (id) fetchPatient();
  }, [id]);

  return (
    <div className="patientDetailsMain">
      <h2 className="patientDetailsHeder">
        Patients {patientName ? `- ${patientName}` : ''}
      </h2>
      <VisitForm />
    </div>
  );
}

export default Visit;
