import React, { useState } from 'react';
import { FaSearch, FaPlus, FaTimes, FaTrash } from 'react-icons/fa';
import './css/AdminUsers.css';

const AdminUsers = () => {
  const [activeTab, setActiveTab] = useState('Doctors');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    speciality: '',
    phoneNumber: '+1 (555) 245-38869',
    dateOfBirth: '',
    status: ''
  });

  // Sample data based on the image - converted to state for deletion
  const [doctorsData, setDoctorsData] = useState([
    { id: 1, name: 'Dr. Anya Sharma', speciality: 'Cardiology', email: 'anya.sharma@mediease.com', phone: 'Nentiom', status: 'Active' },
    { id: 2, name: 'Dr. Ben Carter', speciality: 'Neurology', email: '+1 (555) 123-4567', phone: 'Active', status: 'Active' },
    { id: 3, name: 'Ben Carter', speciality: 'Pedatics', email: '+1 (555) 123-4567', phone: 'Inactive', status: 'Active' },
    { id: 4, name: 'Chloe Lee', speciality: 'Pedatrics', email: '+1 (555) 123-4567', phone: 'Active', status: 'Active' },
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

  const handleAddNew = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    // Reset form data
    setFormData({
      fullName: '',
      email: '',
      speciality: '',
      phoneNumber: '+1 (555) 245-38869',
      dateOfBirth: '',
      status: ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveDoctor = (e) => {
    e.preventDefault();
    // Handle save doctor logic here
    console.log('Saving doctor:', formData);
    // Add the new doctor to the list (you would typically make an API call here)
    handleCloseModal();
  };

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (userToDelete) {
      const userType = activeTab.toLowerCase();
      
      if (userType === 'doctors') {
        setDoctorsData(prev => prev.filter(user => user.id !== userToDelete.id));
      } else if (userType === 'staff') {
        setStaffData(prev => prev.filter(user => user.id !== userToDelete.id));
      } else if (userType === 'patients') {
        setPatientsData(prev => prev.filter(user => user.id !== userToDelete.id));
      }
      
      // You would typically make an API call here to delete from backend
      console.log(`Deleting ${userType}:`, userToDelete);
    }
    
    setIsDeleteModalOpen(false);
    setUserToDelete(null);
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setUserToDelete(null);
  };

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

      {/* Search and Add Button */}
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
        <button className="admin-users-add-btn" onClick={handleAddNew}>
          <FaPlus className="add-icon" />
          Add New {activeTab === 'Doctors' ? 'Doctor' : activeTab === 'Staff' ? 'Staff' : 'Patient'}
        </button>
      </div>

      {/* Table */}
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

      {/* Add New Doctor Modal */}
      {isModalOpen && (
        <div className="admin-users-modal-overlay" onClick={handleCloseModal}>
          <div className="admin-users-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-users-modal-header">
              <h2 className="admin-users-modal-title">Add New Doctor</h2>
              <button className="admin-users-modal-close" onClick={handleCloseModal}>
                <FaTimes />
              </button>
            </div>
            
            <form className="admin-users-modal-form" onSubmit={handleSaveDoctor}>
              <div className="admin-users-form-group">
                <label className="admin-users-form-label">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="admin-users-form-input"
                  placeholder="Enter full name"
                  required
                />
              </div>

              <div className="admin-users-form-group">
                <label className="admin-users-form-label">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="admin-users-form-input"
                  placeholder="Enter email"
                  required
                />
              </div>

              <div className="admin-users-form-group">
                <label className="admin-users-form-label">Speciality</label>
                <input
                  type="text"
                  name="speciality"
                  value={formData.speciality}
                  onChange={handleInputChange}
                  className="admin-users-form-input"
                  placeholder="Enter speciality"
                  required
                />
              </div>

              <div className="admin-users-form-group">
                <label className="admin-users-form-label">Phone Number</label>
                <input
                  type="text"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  className="admin-users-form-input"
                  placeholder="Enter phone number"
                  required
                />
              </div>

              <div className="admin-users-form-group">
                <label className="admin-users-form-label">Date of Birth</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  className="admin-users-form-input"
                  required
                />
              </div>

              <div className="admin-users-form-group">
                <label className="admin-users-form-label">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="admin-users-form-select"
                  required
                >
                  <option value="">Select Status</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="admin-users-modal-actions">
                <button
                  type="button"
                  className="admin-users-modal-cancel"
                  onClick={handleCloseModal}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="admin-users-modal-save"
                >
                  Save Doctor
                </button>
              </div>
            </form>
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

