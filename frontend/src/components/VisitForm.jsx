import React, { useState, useRef } from 'react';
import './css/VisitForm.css';
import { useNavigate, useParams } from 'react-router-dom';
import httpClient from '../services/httpClient';

const VisitForm = () => {
    const { id } = useParams(); // patient PHN
    const navigate = useNavigate();

    // Capture a stable start timestamp
    const startTimeRef = useRef(new Date());
    const startDateTimeDisplay = startTimeRef.current.toLocaleString();
    const isoStart = startTimeRef.current.toISOString();

    // Doctor name from localStorage
    let doctorName = 'Unknown Doctor';
    try {
        const docRaw = localStorage.getItem('doctor');
        if (docRaw) {
            const docObj = JSON.parse(docRaw);
            doctorName = docObj.fullName || [docObj.firstName, docObj.lastName].filter(Boolean).join(' ') || doctorName;
        }
    } catch (_) {}

    const division = 'OPD';

    // Form state (collect data BEFORE starting encounter)
    const [formData, setFormData] = useState({
        weight: '',
        complaint: '',
        visitNote: '',
    });
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState(null);
    const [saveSuccess, setSaveSuccess] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setSaveError(null);
        setSaveSuccess(null);
        try {
            const body = {
                weight: Number(formData.weight),
                complaint: formData.complaint.trim(),
                notes: formData.visitNote.trim(),
            };
            // Basic client validation safeguard
            if (!body.complaint || !body.notes || !(body.weight > 0)) {
                throw new Error('Please provide weight (>0), complaint and notes before saving.');
            }
            await httpClient.post(`/clinic/start/${encodeURIComponent(id)}`, body);
            setSaveSuccess('Visit saved successfully. Redirecting...');
            // Brief delay to allow user to see success
            setTimeout(() => navigate(`/doctor/visitpatient/${id}`), 600);
        } catch (err) {
            console.error('Save visit failed', err);
            const apiMsg = err.response?.data?.message || err.response?.data?.error;
            setSaveError(apiMsg || err.message || 'Failed to save visit. Please retry.');
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        navigate(`/doctor/patients`);
    };

    return (
        <div className="visit-form-container">
            <form className="visit-form" onSubmit={handleSubmit}>
                <div className="form-row">
                    <label>Date and time of visit:</label>
                    <span className="readonly-value" title={isoStart}>{startDateTimeDisplay}</span>
                </div>
                <div className="form-row">
                    <label>Doctor:</label>
                    <span className="readonly-value">{doctorName}</span>
                </div>
                <div className="form-row">
                    <label>Division:</label>
                    <span className="readonly-value">{division}</span>
                </div>

                <div className="form-row">
                    <label>Weight in kg:</label>
                    <input
                        type="number"
                        name="weight"
                        value={formData.weight}
                        onChange={handleChange}
                        disabled={saving}
                    />
                </div>
                <div className="form-row">
                    <label>Complaint / Injury:</label>
                    <input
                        type="text"
                        name="complaint"
                        value={formData.complaint}
                        onChange={handleChange}
                        disabled={saving}
                    />
                </div>
                <div className="form-row">
                    <label>Visit Note:</label>
                    <textarea
                        name="visitNote"
                        value={formData.visitNote}
                        onChange={handleChange}
                        required
                        disabled={saving}
                    />
                </div>

                {saveError && (
                    <p className="error-msg" style={{ color: 'red' }}>{saveError}</p>
                )}
                {saveSuccess && (
                    <p className="success-msg" style={{ color: 'green' }}>{saveSuccess}</p>
                )}

                <div className="button-group">
                    <button
                        type="submit"
                        className="btn-save"
                        disabled={saving || !formData.weight || !(Number(formData.weight) > 0) || !formData.complaint.trim() || !formData.visitNote.trim()}
                        title={!formData.weight || !(Number(formData.weight) > 0) || !formData.complaint.trim() || !formData.visitNote.trim() ? 'Fill all required fields' : ''}
                    >
                        {saving ? 'Saving...' : 'Start & Save Visit'}
                    </button>
                    <button type="button" className="btn-cancel" onClick={handleCancel} disabled={saving}>Cancel</button>
                </div>
            </form>
        </div>
    );
};

export default VisitForm;
