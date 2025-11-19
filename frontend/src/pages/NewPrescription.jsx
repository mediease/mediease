import { useParams, useNavigate } from "react-router-dom";
import React, { useMemo, useState } from "react";
import SegmentedControl from "../components/SegmentedControl";
import "./css/style.css";

const doseOptions = ["1 drop", "2 drops", "5 ml", "10 ml", "After meal", "Before meal", "As directed"];
const frequencyOptions = ["OD", "BD", "TDS", "QID", "PRN", "Mane", "Nocte"];
const periodOptions = ["For 3 days", "For 5 days", "1 week", "2 weeks", "1 month", "Until review"];

const allDrugList = [
  "Paracetamol 500mg Tablet",
  "Ibuprofen 200mg Tablet",
  "Amoxicillin 250mg Capsule",
  "Salbutamol Inhaler",
  "Cetirizine 10mg",
  "Omeprazole 20mg",
  "Metformin 500mg",
  "Lisinopril 10mg",
  "Atorvastatin 20mg",
  "Vitamin D Drops",
];

const initialFavouriteDrugs = ["Paracetamol 500mg Tablet", "Salbutamol Inhaler", "Omeprazole 20mg"];

const initialGroups = [
  {
    name: "Fever",
    drugs: ["Paracetamol 500mg Tablet", "Ibuprofen 200mg Tablet"],
  },
  {
    name: "Asthma",
    drugs: ["Salbutamol Inhaler", "Budesonide Inhaler"],
  },
];

const NewPrescription = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const filterOptions = ["Basic", "Report", "Allergies", "Medications", "Visit History"];

  const [selectedFilter, setSelectedFilter] = useState("Medications");
  const [prescriptionItems, setPrescriptionItems] = useState([]);
  const [prescriptionMeta, setPrescriptionMeta] = useState({
    complaint: "Fever",
    onsetDate: "2020-12-11",
    visitType: "OPD",
    status: "Draft",
    doctor: "Dr. Nisanshan",
    prescribeDate: new Date().toISOString().slice(0, 10),
  });
  const [selectMode, setSelectMode] = useState("byName");

  const [selectedDrug, setSelectedDrug] = useState(allDrugList[0]);
  const [selectedDose, setSelectedDose] = useState(doseOptions[0]);
  const [selectedFrequency, setSelectedFrequency] = useState(frequencyOptions[0]);
  const [selectedPeriod, setSelectedPeriod] = useState(periodOptions[0]);
  const [selectedDoseComment, setSelectedDoseComment] = useState("");
  const [drugSearch, setDrugSearch] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  const [favouriteDrugs, setFavouriteDrugs] = useState(initialFavouriteDrugs);
  const [favouriteGroups, setFavouriteGroups] = useState(initialGroups);
  const [selectedGroup, setSelectedGroup] = useState(initialGroups[0]?.name ?? "");

  const currentGroup = useMemo(
    () => favouriteGroups.find((group) => group.name === selectedGroup),
    [favouriteGroups, selectedGroup]
  );
  const filteredDrugList = useMemo(() => {
    if (!drugSearch.trim()) return allDrugList;
    return allDrugList.filter((drug) => drug.toLowerCase().includes(drugSearch.toLowerCase()));
  }, [drugSearch]);

  const handleTabChange = (option) => {
    setSelectedFilter(option);

    switch (option) {
      case "Basic":
        navigate(`/doctor/patient/${id}`);
        break;
      case "Report":
        navigate(`/doctor/patient/${id}/reportinfo`);
        break;
      case "Allergies":
        navigate(`/doctor/patient/${id}/allergiesinfo`);
        break;
      case "Medications":
        navigate(`/doctor/patient/${id}/medicationsinfo`);
        break;
      case "Visit History":
        navigate(`/doctor/patient/${id}/historyinfo`);
        break;
      default:
        navigate(`/doctor/patient/${id}`);
    }
  };

  const handleMetaChange = (field, value) => {
    setPrescriptionMeta((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddPrescriptionItem = (drugName, overrides = {}) => {
    if (!drugName) return;
    setPrescriptionItems((prev) => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        name: drugName,
        dose: overrides.dose ?? selectedDose,
        frequency: overrides.frequency ?? selectedFrequency,
        period: overrides.period ?? selectedPeriod,
        doseComment: overrides.doseComment ?? selectedDoseComment,
      },
    ]);
    if (!overrides.doseComment) {
      setSelectedDoseComment("");
    }
  };

  const handleDeleteItem = (itemId) => {
    setPrescriptionItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  const handleItemChange = (itemId, field, value) => {
    setPrescriptionItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, [field]: value } : item))
    );
  };

  const handleAddFavourite = () => {
    if (!selectedDrug) return;
    setFavouriteDrugs((prev) => (prev.includes(selectedDrug) ? prev : [...prev, selectedDrug]));
  };

  const handlePrescribeAll = () => {
    if (!currentGroup) return;
    const payload = currentGroup.drugs.map((drug) => ({
      dose: doseOptions[0],
      frequency: frequencyOptions[0],
      period: periodOptions[0],
      doseComment: "",
      drugName: drug,
    }));
    payload.forEach((entry) => handleAddPrescriptionItem(entry.drugName, entry));
  };

  const handleCreateGroupFromCurrent = () => {
    if (!currentGroup) return;
    const name = window.prompt("Enter a name for the new favourite group:");
    if (!name) return;
    setFavouriteGroups((prev) => [...prev, { name, drugs: [...currentGroup.drugs] }]);
  };

  const handleSavePrescription = () => {
    const payload = {
      meta: prescriptionMeta,
      items: prescriptionItems,
      savedAt: new Date().toISOString(),
    };
    try {
      const key = `prescription_${id}_${Date.now()}`;
      localStorage.setItem(key, JSON.stringify(payload));
      alert("Prescription saved locally.");
      navigate(`/doctor/patient/${id}/medicationsinfo`);
    } catch (err) {
      console.error("Failed to save prescription", err);
      alert("Failed to save prescription. See console for details.");
    }
  };

  const handleViewPrescriptions = () => {
    // open preview modal showing current prescription items
    setShowPreview(true);
  };

  const handleClosePreview = () => {
    setShowPreview(false);
  };

  const renderSelectionPanel = () => {
    switch (selectMode) {
      case "byName":
        return (
          <div className="selection-panel">
            <div className="selection-list">
              <h4>All Drugs</h4>
              <div className="selection-search">
                <input
                  type="text"
                  placeholder="Search medicine..."
                  value={drugSearch}
                  onChange={(e) => setDrugSearch(e.target.value)}
                />
              </div>
              <div className="selection-scroll">
                {filteredDrugList.map((drug) => (
                  <button
                    key={drug}
                    className={`pill-button ${drug === selectedDrug ? "active" : ""}`}
                    onClick={() => setSelectedDrug(drug)}
                  >
                    {drug}
                  </button>
                ))}
                {filteredDrugList.length === 0 && (
                  <p className="selection-helper">No drugs match “{drugSearch}”.</p>
                )}
              </div>
            </div>
            <div className="selection-form">
              <div className="selection-grid">
                <div>
                  <label>Dose</label>
                  <select value={selectedDose} onChange={(e) => setSelectedDose(e.target.value)}>
                    {doseOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label>Frequency</label>
                  <select value={selectedFrequency} onChange={(e) => setSelectedFrequency(e.target.value)}>
                    {frequencyOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label>Period</label>
                  <select value={selectedPeriod} onChange={(e) => setSelectedPeriod(e.target.value)}>
                    {periodOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label>Dose Comment</label>
                  <input
                    type="text"
                    value={selectedDoseComment}
                    onChange={(e) => setSelectedDoseComment(e.target.value)}
                    placeholder="e.g. After meals"
                  />
                </div>
              </div>
              <button className="selection-add-btn" onClick={() => handleAddPrescriptionItem(selectedDrug)}>
                + Add
              </button>
            </div>
          </div>
        );
      case "favouriteList":
        return (
          <div className="selection-panel">
            <div className="selection-list">
              <div className="selection-list-header">
                <h4>My Favourite</h4>
                <button className="selection-secondary-btn" onClick={handleAddFavourite}>
                  Add above list to My favourites
                </button>
              </div>
              <div className="selection-scroll">
                {favouriteDrugs.map((drug) => (
                  <button
                    key={drug}
                    className={`pill-button ${drug === selectedDrug ? "active" : ""}`}
                    onClick={() => setSelectedDrug(drug)}
                  >
                    {drug}
                  </button>
                ))}
              </div>
            </div>
            <div className="selection-form">
              <p className="selection-helper">Selected drug: {selectedDrug || "Pick a drug"}</p>
              <button className="selection-add-btn" onClick={() => handleAddPrescriptionItem(selectedDrug)}>
                Add to prescription
              </button>
            </div>
          </div>
        );
      case "favouriteGroup":
        return (
          <div className="selection-panel">
            <div className="selection-list">
              <div className="selection-list-header">
                <h4>Favourite Groups</h4>
                <button className="selection-secondary-btn" onClick={handleCreateGroupFromCurrent}>
                  Add above list to My favourites
                </button>
              </div>
              <div className="selection-scroll">
                {favouriteGroups.map((group) => (
                  <button
                    key={group.name}
                    className={`pill-button ${group.name === selectedGroup ? "active" : ""}`}
                    onClick={() => setSelectedGroup(group.name)}
                  >
                    {group.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="selection-form">
              <h4>{selectedGroup || "Select a group"}</h4>
              <div className="selection-scroll">
                {(currentGroup?.drugs ?? []).map((drug) => (
                  <div key={drug} className="group-drug-row">
                    <span>{drug}</span>
                    <button className="inline-add-btn" onClick={() => handleAddPrescriptionItem(drug)}>
                      + Add
                    </button>
                  </div>
                ))}
                {(currentGroup?.drugs?.length ?? 0) === 0 && <p className="selection-helper">No drugs in this group.</p>}
              </div>
              <button className="selection-add-btn" onClick={handlePrescribeAll} disabled={!currentGroup}>
                Prescribe All
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="patientDetailsMain">
      <h2 className="patientDetailsHeder">Issuing a Prescription - Naveen Bimsara</h2>
      <SegmentedControl options={filterOptions} selected={selectedFilter} onChange={handleTabChange} />

      <div className="prescription-card">
        <div className="prescription-meta">
          <div className="meta-row">
            <div>
              <label>Complaint / Injuries</label>
              <input
                type="text"
                value={prescriptionMeta.complaint}
                onChange={(e) => handleMetaChange("complaint", e.target.value)}
              />
            </div>
            <div>
              <label>Onset Date</label>
              <input
                type="date"
                value={prescriptionMeta.onsetDate}
                onChange={(e) => handleMetaChange("onsetDate", e.target.value)}
              />
            </div>
            <div>
              <label>Visit Type</label>
              <select value={prescriptionMeta.visitType} onChange={(e) => handleMetaChange("visitType", e.target.value)}>
                <option value="OPD">OPD</option>
                <option value="IPD">IPD</option>
                <option value="Clinic">Clinic</option>
              </select>
            </div>
          </div>

          <div className="meta-row">
            <div>
              <label>Status</label>
              <select value={prescriptionMeta.status} onChange={(e) => handleMetaChange("status", e.target.value)}>
                <option value="Draft">Draft</option>
                <option value="Pending">Pending</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
            <div>
              <label>Doctor</label>
              <input
                type="text"
                value={prescriptionMeta.doctor}
                onChange={(e) => handleMetaChange("doctor", e.target.value)}
              />
            </div>
            <div>
              <label>Prescribe Date</label>
              <input
                type="date"
                value={prescriptionMeta.prescribeDate}
                onChange={(e) => handleMetaChange("prescribeDate", e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="prescription-table-wrapper">
          <table className="prescription-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Dose</th>
                <th>Frequency</th>
                <th>Period</th>
                <th>Dose Comment</th>
                <th>Delete</th>
                <th>Print</th>
              </tr>
            </thead>
            <tbody>
              {prescriptionItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="empty-row">
                    No prescriptions added yet. Use the selector below to add items.
                  </td>
                </tr>
              ) : (
                prescriptionItems.map((item) => (
                  <tr key={item.id}>
                    <td>{item.name}</td>
                    <td>
                      <select
                        value={item.dose}
                        onChange={(e) => handleItemChange(item.id, "dose", e.target.value)}
                      >
                        {doseOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <select
                        value={item.frequency}
                        onChange={(e) => handleItemChange(item.id, "frequency", e.target.value)}
                      >
                        {frequencyOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <select
                        value={item.period}
                        onChange={(e) => handleItemChange(item.id, "period", e.target.value)}
                      >
                        {periodOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <textarea
                        rows={1}
                        value={item.doseComment}
                        onChange={(e) => handleItemChange(item.id, "doseComment", e.target.value)}
                        placeholder="Add instructions..."
                      />
                    </td>
                    <td>
                      <button className="danger-link" onClick={() => handleDeleteItem(item.id)}>
                        Delete
                      </button>
                    </td>
                    <td>
                      <input type="checkbox" disabled />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="select-mode-tabs">
          {[
            { key: "byName", label: "By name" },
            { key: "favouriteList", label: "My favourite drugs list" },
            { key: "favouriteGroup", label: "My favourite group" },
          ].map((mode) => (
            <button
              key={mode.key}
              className={`select-mode-btn ${selectMode === mode.key ? "active" : ""}`}
              onClick={() => setSelectMode(mode.key)}
            >
              {mode.label}
            </button>
          ))}
        </div>

        {renderSelectionPanel()}
        <div className="action-bar">
          <button className="action-btn secondary" onClick={handleViewPrescriptions} type="button">
            View
          </button>
          <button className="action-btn primary" onClick={handleSavePrescription} type="button">
            Save
          </button>
        </div>
        {showPreview && (
          <div className="modal-overlay" role="dialog" aria-modal="true">
            <div className="modal-content">
              <div className="modal-header">
                <h3>Prescription Preview</h3>
                <button className="modal-close-btn" onClick={handleClosePreview} aria-label="Close preview">×</button>
              </div>
              <div className="modal-body">
                <div className="preview-meta">
                  <div><strong>Complaint:</strong> {prescriptionMeta.complaint}</div>
                  <div><strong>Doctor:</strong> {prescriptionMeta.doctor}</div>
                  <div><strong>Prescribe Date:</strong> {prescriptionMeta.prescribeDate}</div>
                  <div><strong>Status:</strong> {prescriptionMeta.status}</div>
                </div>

                <div className="modal-table-wrapper">
                  <table className="modal-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Dose</th>
                        <th>Frequency</th>
                        <th>Period</th>
                        <th>Instructions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {prescriptionItems.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="empty-row">No medicines added yet.</td>
                        </tr>
                      ) : (
                        prescriptionItems.map((it) => (
                          <tr key={it.id}>
                            <td>{it.name}</td>
                            <td>{it.dose}</td>
                            <td>{it.frequency}</td>
                            <td>{it.period}</td>
                            <td>{it.doseComment || '-'}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <button className="action-btn secondary" onClick={handleClosePreview}>Close</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewPrescription;