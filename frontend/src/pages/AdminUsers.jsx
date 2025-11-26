import React, { useState } from 'react';
import { FaSearch, FaPlus, FaTimes, FaTrash } from 'react-icons/fa';
import './css/AdminUsers.css';
import httpClient from '../services/httpClient'; // make sure this path is correct

const AdminUsers = () => {
  const [activeTab, setActiveTab] = useState('Doctors');
  const [searchQuery, setSearchQuery] = useState('');

  // ------- Doctor approve modal state -------
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [pendingDoctors, setPendingDoctors] = useState([]);
  const [pendingLoading, setPendingLoading] = useState(false);
  const [pendingError, setPendingError] = useState('');
  const [approvingId, setApprovingId] = useState(null);

  // ------- Nurse approve modal state -------
  const [isApproveNurseModalOpen, setIsApproveNurseModalOpen] = useState(false);
  const [pendingNurses, setPendingNurses] = useState([]);
  const [pendingNurseLoading, setPendingNurseLoading] = useState(false);
  const [pendingNurseError, setPendingNurseError] = useState('');
  const [approvingNurseId, setApprovingNurseId] = useState(null);

  // ------- Lab assistant approve modal state -------
  const [isApproveLabModalOpen, setIsApproveLabModalOpen] = useState(false);
  const [pendingLabAssistants, setPendingLabAssistants] = useState([]);
  const [pendingLabLoading, setPendingLabLoading] = useState(false);
  const [pendingLabError, setPendingLabError] = useState('');
  const [approvingLabId, setApprovingLabId] = useState(null);

  // Delete modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  // Sample data (your existing table data)
  const [doctorsData, setDoctorsData] = useState([
    { id: 1, name: 'Dr. Anya Sharma', speciality: 'Cardiology', email: 'anya.sharma@mediease.com', phone: 'Nentiom', status: 'Active' },
    { id: 2, name: 'Dr. Ben Carter', speciality: 'Neurology', email: '+1 (555) 123-4567', phone: 'Active', status: 'Active' },
    { id: 3, name: 'Ben Carter', speciality: 'Pedatics', email: '+1 (555) 123-4567', phone: 'Inactive', status: 'Active' },
    { id: 4, name: 'Chloe Lee', speciality: 'Pedatics', email: '+1 (555) 123-4567', phone: 'Active', status: 'Active' },
    { id: 5, name: 'David Chen', speciality: 'Oncology', email: '+1 (555) 123-4567', phone: 'Active', status: 'Active' },
    { id: 6, name: 'Dermology', speciality: 'Dermology', email: '+1 (555) 123-4567', phone: 'Active', status: 'Active' },
  ]);

  const [staffData, setStaffData] = useState([
    { id: 1, name: 'Nurse Sarah Johnson', speciality: 'Emergency', email: 'sarah.johnson@mediease.com', phone: '+1 (555) 234-5678', status: 'Active' },
    { id: 2, name: 'Nurse Michael Brown', speciality: 'ICU', email: 'michael.brown@mediease.com', phone: '+1 (555) 345-6789', status: 'Active' },
  ]);

  const [patientsData, setPatientsData] = useState([
    { id: 1, name: 'John Doe', speciality: 'N/A', email: 'john.doe@email.com', phone: '+1 (555) 456-7890', status: 'Active' },
    { id: 2, name: 'Jane Smith', speciality: 'N/A', email: 'jane.smith@email.com', phone: '+1 (555) 567-8901', status: 'Active' },
  ]);

  // ------------------ helpers for current tab table ------------------

  const getCurrentData = () => {
    switch (activeTab) {
      case 'Doctors':
        return doctorsData;
      case 'Staff':
        return staffData;
      case 'Patients':
        return patientsData;
      default:
        return doctorsData;
    }
  };

  const filteredData = getCurrentData().filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.speciality.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ------------------ generic helpers for pending data ------------------

  const getDoctorDisplayName = (doc) => {
    if (doc.user?.firstName || doc.user?.lastName) {
      return `Dr. ${doc.user.firstName || ''} ${doc.user.lastName || ''}`.trim();
    }
    if (doc.firstName || doc.lastName) {
      return `Dr. ${doc.firstName || ''} ${doc.lastName || ''}`.trim();
    }
    return doc.name || 'Unknown Doctor';
  };

  const getUserDisplayName = (u, prefix = '') => {
    if (u.user?.firstName || u.user?.lastName) {
      return `${prefix}${u.user.firstName || ''} ${u.user.lastName || ''}`.trim();
    }
    if (u.firstName || u.lastName) {
      return `${prefix}${u.firstName || ''} ${u.lastName || ''}`.trim();
    }
    return u.name || 'Unknown';
  };

  const getEmail = (u) => {
    if (u.user?.email) return u.user.email;
    if (u.email) return u.email;
    return 'N/A';
  };

  const getDoctorDivision = (doc) => {
    if (doc.division) return doc.division;

    const qual = doc.resource?.qualification?.[0];
    const divisionExt = qual?.extension?.find(
      (ext) => ext.url === 'urn:hospital:practitioner:division'
    );
    return divisionExt?.valueString || 'N/A';
  };

  const getDoctorMedicalLicenseId = (doc) => {
    if (doc.medicalLicenseId) return doc.medicalLicenseId;
    if (doc.user?.medicalLicenseId) return doc.user.medicalLicenseId;
    if (doc.practitioner?.medicalLicenseId) return doc.practitioner.medicalLicenseId;

    const identifiers = doc.resource?.identifier || [];
    const licenseId = identifiers.find(
      (id) => id.system === 'urn:hospital:practitioner:license'
    )?.value;

    return licenseId || null;
  };

  const getNurseId = (n) => {
    if (n.nurId) return n.nurId;
    if (n.user?.nurId) return n.user.nurId;

    const identifiers = n.resource?.identifier || [];
    const nur = identifiers.find(
      (id) => id.system === 'urn:hospital:nurse:nurid'
    )?.value;

    return nur || null;
  };

  const getLabAssistantId = (la) => {
    if (la.labId) return la.labId;
    if (la.user?.labId) return la.user.labId;
    return null;
  };

  // ------------------ approve DOCTORS flow ------------------

  const openApproveModal = async () => {
    setIsApproveModalOpen(true);
    setPendingLoading(true);
    setPendingError('');

    try {
      const res = await httpClient.get('/auth/pending-users');
      const raw = res.data?.data;
      let doctors = [];

      if (raw && Array.isArray(raw.doctors)) {
        doctors = raw.doctors;
      } else if (Array.isArray(raw)) {
        doctors = raw.filter((u) => u.role === 'doctor' || u.user?.role === 'doctor');
      } else {
        const arr = Array.isArray(raw?.users) ? raw.users : [];
        doctors = arr.filter((u) => u.role === 'doctor' || u.user?.role === 'doctor');
      }

      setPendingDoctors(doctors);
    } catch (err) {
      console.error('Error fetching pending doctors:', err);
      setPendingError(
        err?.response?.data?.message || 'Failed to load pending doctors.'
      );
    } finally {
      setPendingLoading(false);
    }
  };

  const closeApproveModal = () => {
    setIsApproveModalOpen(false);
    setPendingDoctors([]);
    setPendingError('');
    setApprovingId(null);
  };

  const handleApproveDoctor = async (doctor) => {
    const medicalLicenseId = getDoctorMedicalLicenseId(doctor);

    if (!medicalLicenseId) {
      alert('No medicalLicenseId found for this doctor.');
      return;
    }

    try {
      setApprovingId(medicalLicenseId);

      const res = await httpClient.put(
        `/auth/approve/doctor/${medicalLicenseId}`
      );

      const approved = res.data?.data;

      if (approved) {
        const { user, practitioner } = approved;

        setDoctorsData((prev) => [
          ...prev,
          {
            id: user.id,
            name: `Dr. ${user.firstName} ${user.lastName}`,
            speciality: getDoctorDivision(practitioner) || 'N/A',
            email: user.email,
            phone: 'N/A',
            status: user.status === 'approved' ? 'Active' : user.status,
          },
        ]);
      }

      setPendingDoctors((prev) =>
        prev.filter(
          (d) => getDoctorMedicalLicenseId(d) !== medicalLicenseId
        )
      );
    } catch (err) {
      console.error('Error approving doctor:', err);
      alert(
        err?.response?.data?.message ||
        'Failed to approve doctor. Please try again.'
      );
    } finally {
      setApprovingId(null);
    }
  };

  // ------------------ approve NURSES flow ------------------

  const openApproveNurseModal = async () => {
    setIsApproveNurseModalOpen(true);
    setPendingNurseLoading(true);
    setPendingNurseError('');

    try {
      const res = await httpClient.get('/auth/pending-users');
      const raw = res.data?.data;
      let nurses = [];

      if (raw && Array.isArray(raw.nurses)) {
        nurses = raw.nurses;
      } else if (Array.isArray(raw)) {
        nurses = raw.filter((u) => u.role === 'nurse' || u.user?.role === 'nurse');
      } else {
        const arr = Array.isArray(raw?.users) ? raw.users : [];
        nurses = arr.filter((u) => u.role === 'nurse' || u.user?.role === 'nurse');
      }

      setPendingNurses(nurses);
    } catch (err) {
      console.error('Error fetching pending nurses:', err);
      setPendingNurseError(
        err?.response?.data?.message || 'Failed to load pending nurses.'
      );
    } finally {
      setPendingNurseLoading(false);
    }
  };

  const closeApproveNurseModal = () => {
    setIsApproveNurseModalOpen(false);
    setPendingNurses([]);
    setPendingNurseError('');
    setApprovingNurseId(null);
  };

  const handleApproveNurse = async (nurse) => {
    const nurId = getNurseId(nurse);

    if (!nurId) {
      alert('No nurId found for this nurse.');
      return;
    }

    try {
      setApprovingNurseId(nurId);

      const res = await httpClient.put(
        `/auth/approve/nurse/${nurId}`
      );

      // response:
      // { success, message, data: { user, practitioner } }
      const approved = res.data?.data;

      if (approved) {
        const { user } = approved;

        setStaffData((prev) => [
          ...prev,
          {
            id: user.id,
            name: `Nurse ${user.firstName} ${user.lastName}`,
            speciality: 'Nurse',
            email: user.email,
            phone: 'N/A',
            status: user.status === 'approved' ? 'Active' : user.status,
          },
        ]);
      }

      setPendingNurses((prev) =>
        prev.filter((n) => getNurseId(n) !== nurId)
      );
    } catch (err) {
      console.error('Error approving nurse:', err);
      alert(
        err?.response?.data?.message ||
        'Failed to approve nurse. Please try again.'
      );
    } finally {
      setApprovingNurseId(null);
    }
  };

  // ------------------ approve LAB ASSISTANTS flow ------------------

  const openApproveLabModal = async () => {
    setIsApproveLabModalOpen(true);
    setPendingLabLoading(true);
    setPendingLabError('');

    try {
      const res = await httpClient.get('/auth/pending-users');
      const raw = res.data?.data;
      let labs = [];

      if (raw && Array.isArray(raw.labAssistants)) {
        labs = raw.labAssistants;
      } else if (Array.isArray(raw)) {
        labs = raw.filter((u) => u.role === 'lab_assistant' || u.user?.role === 'lab_assistant');
      } else {
        const arr = Array.isArray(raw?.users) ? raw.users : [];
        labs = arr.filter((u) => u.role === 'lab_assistant' || u.user?.role === 'lab_assistant');
      }

      setPendingLabAssistants(labs);
    } catch (err) {
      console.error('Error fetching pending lab assistants:', err);
      setPendingLabError(
        err?.response?.data?.message || 'Failed to load pending lab assistants.'
      );
    } finally {
      setPendingLabLoading(false);
    }
  };

  const closeApproveLabModal = () => {
    setIsApproveLabModalOpen(false);
    setPendingLabAssistants([]);
    setPendingLabError('');
    setApprovingLabId(null);
  };

  const handleApproveLabAssistant = async (lab) => {
    const labId = getLabAssistantId(lab);

    if (!labId) {
      alert('No labId found for this lab assistant.');
      return;
    }

    try {
      setApprovingLabId(labId);

      const res = await httpClient.put(
        `/auth/approve/lab-assistant/${labId}`
      );

      // response:
      // { success, message, data: { user } }
      const approved = res.data?.data;
      if (approved) {
        const { user } = approved;

        setStaffData((prev) => [
          ...prev,
          {
            id: user.id,
            name: `Lab Assistant ${user.firstName} ${user.lastName}`,
            speciality: 'Lab Assistant',
            email: user.email,
            phone: 'N/A',
            status: user.status === 'approved' ? 'Active' : user.status,
          },
        ]);
      }

      setPendingLabAssistants((prev) =>
        prev.filter((l) => getLabAssistantId(l) !== labId)
      );
    } catch (err) {
      console.error('Error approving lab assistant:', err);
      alert(
        err?.response?.data?.message ||
        'Failed to approve lab assistant. Please try again.'
      );
    } finally {
      setApprovingLabId(null);
    }
  };

  // ------------------ delete existing rows ------------------

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (userToDelete) {
      const userType = activeTab.toLowerCase();

      if (userType === 'doctors') {
        setDoctorsData((prev) => prev.filter((u) => u.id !== userToDelete.id));
      } else if (userType === 'staff') {
        setStaffData((prev) => prev.filter((u) => u.id !== userToDelete.id));
      } else if (userType === 'patients') {
        setPatientsData((prev) => prev.filter((u) => u.id !== userToDelete.id));
      }

      console.log(`Deleting ${userType}:`, userToDelete);
    }

    setIsDeleteModalOpen(false);
    setUserToDelete(null);
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setUserToDelete(null);
  };

  // ------------------ render ------------------

  return (
    <div className="admin-users-container">
      <h1 className="admin-users-title">Users</h1>

      {/* Tabs */}
      <div className="admin-users-tabs">
        <button
          className={`admin-users-tab ${activeTab === 'Doctors' ? 'active' : ''}`}
          onClick={() => setActiveTab('Doctors')}
        >
          Doctors
        </button>
        <button
          className={`admin-users-tab ${activeTab === 'Staff' ? 'active' : ''}`}
          onClick={() => setActiveTab('Staff')}
        >
          Staff
        </button>
        <button
          className={`admin-users-tab ${activeTab === 'Patients' ? 'active' : ''}`}
          onClick={() => setActiveTab('Patients')}
        >
          Patients
        </button>
      </div>

      {/* Search + Approve Buttons */}
      <div className="admin-users-actions">
        <div className="admin-users-search">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="admin-users-search-input"
          />
        </div>

        {/* Doctors tab: Approve Doctors */}
        {activeTab === 'Doctors' && (
          <button className="admin-users-add-btn" onClick={openApproveModal}>
            <FaPlus className="add-icon" />
            Approve Doctors
          </button>
        )}

        {/* Staff tab: Approve Nurse + Lab Assistant */}
        {activeTab === 'Staff' && (
          <div className="admin-users-approve-group">
            <button
              className="admin-users-add-btn"
              onClick={openApproveNurseModal}
            >
              <FaPlus className="add-icon" />
              Approve Nurses
            </button>
            <button
              className="admin-users-add-btn"
              onClick={openApproveLabModal}
            >
              <FaPlus className="add-icon" />
              Approve Lab Assistants
            </button>
          </div>
        )}
      </div>

      {/* Main Table */}
      <div className="admin-users-table-wrapper">
        <table className="admin-users-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Speciality</th>
              <th>Email</th>
              <th>Phone Number</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length > 0 ? (
              filteredData.map((row, index) => (
                <tr key={row.id || index} className={index % 2 === 0 ? 'even-row' : ''}>
                  <td>{row.name}</td>
                  <td>{row.speciality}</td>
                  <td>{row.email}</td>
                  <td>{row.phone}</td>
                  <td>
                    <span className={`status-badge status-${row.status.toLowerCase()}`}>
                      {row.status}
                    </span>
                  </td>
                  <td>
                    <button
                      className="admin-users-delete-btn"
                      onClick={() => handleDeleteClick(row)}
                      title={`Delete ${row.name}`}
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="no-data">No users found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ---- Approve Doctors Modal ---- */}
      {isApproveModalOpen && (
        <div className="admin-users-modal-overlay" onClick={closeApproveModal}>
          <div className="admin-users-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-users-modal-header">
              <h2 className="admin-users-modal-title">Pending Doctors for Approval</h2>
              <button className="admin-users-modal-close" onClick={closeApproveModal}>
                <FaTimes />
              </button>
            </div>

            <div className="admin-users-modal-body">
              {pendingLoading && <p>Loading pending doctors...</p>}
              {pendingError && <p className="error-text">{pendingError}</p>}
              {!pendingLoading && !pendingError && pendingDoctors.length === 0 && (
                <p>No pending doctors to approve.</p>
              )}

              {!pendingLoading && !pendingError && pendingDoctors.length > 0 && (
                <table className="admin-users-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Division</th>
                      <th>Medical License ID</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingDoctors.map((doc) => {
                      const license = getDoctorMedicalLicenseId(doc);
                      return (
                        <tr key={doc._id || license}>
                          <td>{getDoctorDisplayName(doc)}</td>
                          <td>{getEmail(doc)}</td>
                          <td>{getDoctorDivision(doc)}</td>
                          <td>{license || 'N/A'}</td>
                          <td>
                            <button
                              className="admin-users-approve-btn"
                              onClick={() => handleApproveDoctor(doc)}
                              disabled={approvingId === license}
                            >
                              {approvingId === license ? 'Approving...' : 'Approve'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ---- Approve Nurses Modal ---- */}
      {isApproveNurseModalOpen && (
        <div className="admin-users-modal-overlay" onClick={closeApproveNurseModal}>
          <div className="admin-users-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-users-modal-header">
              <h2 className="admin-users-modal-title">Pending Nurses for Approval</h2>
              <button className="admin-users-modal-close" onClick={closeApproveNurseModal}>
                <FaTimes />
              </button>
            </div>

            <div className="admin-users-modal-body">
              {pendingNurseLoading && <p>Loading pending nurses...</p>}
              {pendingNurseError && <p className="error-text">{pendingNurseError}</p>}
              {!pendingNurseLoading && !pendingNurseError && pendingNurses.length === 0 && (
                <p>No pending nurses to approve.</p>
              )}

              {!pendingNurseLoading && !pendingNurseError && pendingNurses.length > 0 && (
                <table className="admin-users-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Nurse ID</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingNurses.map((n) => {
                      const nurId = getNurseId(n);
                      return (
                        <tr key={n._id || nurId}>
                          <td>{getUserDisplayName(n, 'Nurse ')}</td>
                          <td>{getEmail(n)}</td>
                          <td>{nurId || 'N/A'}</td>
                          <td>
                            <button
                              className="admin-users-approve-btn"
                              onClick={() => handleApproveNurse(n)}
                              disabled={approvingNurseId === nurId}
                            >
                              {approvingNurseId === nurId ? 'Approving...' : 'Approve'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ---- Approve Lab Assistants Modal ---- */}
      {isApproveLabModalOpen && (
        <div className="admin-users-modal-overlay" onClick={closeApproveLabModal}>
          <div className="admin-users-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-users-modal-header">
              <h2 className="admin-users-modal-title">Pending Lab Assistants for Approval</h2>
              <button className="admin-users-modal-close" onClick={closeApproveLabModal}>
                <FaTimes />
              </button>
            </div>

            <div className="admin-users-modal-body">
              {pendingLabLoading && <p>Loading pending lab assistants...</p>}
              {pendingLabError && <p className="error-text">{pendingLabError}</p>}
              {!pendingLabLoading && !pendingLabError && pendingLabAssistants.length === 0 && (
                <p>No pending lab assistants to approve.</p>
              )}

              {!pendingLabLoading && !pendingLabError && pendingLabAssistants.length > 0 && (
                <table className="admin-users-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Lab Assistant ID</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingLabAssistants.map((l) => {
                      const labId = getLabAssistantId(l);
                      return (
                        <tr key={l._id || labId}>
                          <td>{getUserDisplayName(l, 'Lab Assistant ')}</td>
                          <td>{getEmail(l)}</td>
                          <td>{labId || 'N/A'}</td>
                          <td>
                            <button
                              className="admin-users-approve-btn"
                              onClick={() => handleApproveLabAssistant(l)}
                              disabled={approvingLabId === labId}
                            >
                              {approvingLabId === labId ? 'Approving...' : 'Approve'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="admin-users-modal-overlay" onClick={handleCancelDelete}>
          <div className="admin-users-delete-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-users-delete-modal-header">
              <h2 className="admin-users-delete-modal-title">Confirm Delete</h2>
              <button className="admin-users-modal-close" onClick={handleCancelDelete}>
                <FaTimes />
              </button>
            </div>

            <div className="admin-users-delete-modal-content">
              <p className="admin-users-delete-message">
                Are you sure you want to delete <strong>{userToDelete?.name}</strong>?
              </p>
              <p className="admin-users-delete-warning">
                This action cannot be undone.
              </p>
            </div>

            <div className="admin-users-modal-actions">
              <button
                type="button"
                className="admin-users-modal-cancel"
                onClick={handleCancelDelete}
              >
                Cancel
              </button>
              <button
                type="button"
                className="admin-users-delete-confirm-btn"
                onClick={handleConfirmDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminUsers;
