import { useParams, useNavigate } from "react-router-dom";
import React, { useMemo, useState, useEffect } from "react";
import SegmentedControl from "../components/SegmentedControl";
import httpClient from "../services/httpClient";
import PrescriptionQRModal from "../components/PrescriptionQRModal";
import "./css/style.css";

const DOSE_OPTIONS = ["1 drop", "2 drops", "5 ml", "10 ml", "After meal", "Before meal", "As directed"];
const FREQUENCY_OPTIONS = ["OD", "BD", "TDS", "QID", "PRN", "Mane", "Nocte"];
const PERIOD_OPTIONS = ["For 3 days", "For 5 days", "1 week", "2 weeks", "1 month", "Until review"];

const INITIAL_FAVOURITE_DRUGS = [
  "Paracetamol 500mg Tablet",
  "Salbutamol Inhaler",
  "Omeprazole 20mg",
];

const INITIAL_GROUPS = [
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
  const { id: patientPhn } = useParams();
  const navigate = useNavigate();
  const filterOptions = ["Basic", "Report", "Allergies", "Medications", "Visit History"];

  // --- Tabs ---
  const [selectedFilter, setSelectedFilter] = useState("Medications");

  // --- Patient / Doctor context ---
  const [patientName, setPatientName] = useState("Loading...");
  const [doctorLicense, setDoctorLicense] = useState(null);
  const [doctorDisplayName, setDoctorDisplayName] = useState("");

  // --- Prescription meta & items ---
  const [prescriptionMeta, setPrescriptionMeta] = useState({
    complaint: "",
    onsetDate: "",
    visitType: "OPD",
    status: "Draft",
    doctor: "",
    prescribeDate: new Date().toISOString().slice(0, 10),
  });
  const [prescriptionItems, setPrescriptionItems] = useState([]);

  // --- Drug selection state ---
  const [selectMode, setSelectMode] = useState("byName"); // "byName" | "favouriteList" | "favouriteGroup"
  const [allDrugList] = useState([]); // reserved if you later want static list

  const [selectedDrug, setSelectedDrug] = useState("");
  const [selectedDose, setSelectedDose] = useState(DOSE_OPTIONS[0]);
  const [selectedFrequency, setSelectedFrequency] = useState(FREQUENCY_OPTIONS[0]);
  const [selectedPeriod, setSelectedPeriod] = useState(PERIOD_OPTIONS[0]);
  const [selectedDoseComment, setSelectedDoseComment] = useState("");

  const [drugSearch, setDrugSearch] = useState("");
  const [filteredDrugList, setFilteredDrugList] = useState(allDrugList);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);

  // --- Favourites / Groups ---
  const [favouriteDrugs, setFavouriteDrugs] = useState(INITIAL_FAVOURITE_DRUGS);
  const [favouriteGroups, setFavouriteGroups] = useState(INITIAL_GROUPS);
  const [selectedGroup, setSelectedGroup] = useState(INITIAL_GROUPS[0]?.name ?? "");

  const currentGroup = useMemo(
    () => favouriteGroups.find((group) => group.name === selectedGroup),
    [favouriteGroups, selectedGroup]
  );

  // --- Preview & QR ---
  const [showPreview, setShowPreview] = useState(false);
  const [qrUrl, setQrUrl] = useState("");

  // --- AI validation modal ---
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [validationResult, setValidationResult] = useState(null);
  const [isValidating, setIsValidating] = useState(false);

  // --- QR validation modal (shown after prescription is saved + validated) ---
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrData, setQrData] = useState(null);         // { prescriptionId, validatedAt, qrCodeData }
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);

  // ============================
  //  LOAD PATIENT + DOCTOR DATA
  // ============================
  useEffect(() => {
    const loadContext = async () => {
      // doctor from localStorage
      try {
        const doctorRaw = localStorage.getItem("doctor");
        if (doctorRaw) {
          const doctorObj = JSON.parse(doctorRaw);
          setDoctorLicense(doctorObj?.medicalLicenseId || null);
          const name = doctorObj?.name || doctorObj?.fullName || "";
          setDoctorDisplayName(name);
          setPrescriptionMeta((prev) => ({
            ...prev,
            doctor: name || prev.doctor || "Doctor",
          }));
        }
      } catch (e) {
        console.warn("Failed to parse doctor from localStorage", e);
      }

      // patient from backend
      try {
        const res = await httpClient.get(`/fhir/Patient/${patientPhn}`);
        const payload = res?.data?.data || res?.data || {};
        const nameRes = payload?.metadata?.firstName || payload?.metadata?.lastName
          ? `${payload.metadata.firstName || ""} ${payload.metadata.lastName || ""}`.trim()
          : (() => {
              const name = payload?.resource?.name?.[0];
              return [name?.given?.[0], name?.family].filter(Boolean).join(" ");
            })();
        setPatientName(nameRes || patientPhn);
      } catch (err) {
        console.error("Failed to load patient", err);
        setPatientName(patientPhn);
      }
    };

    loadContext();
  }, [patientPhn]);

  // ============================
  //  MEDICATION SEARCH (FHIR)
  // ============================
  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    if (!drugSearch.trim()) {
      setIsSearching(false);
      setSearchError(null);
      setFilteredDrugList(allDrugList);
      return () => controller.abort();
    }

    setIsSearching(true);
    setSearchError(null);

    const timer = setTimeout(async () => {
      try {
        const res = await httpClient.get("/fhir/Medication/search", {
          params: { query: drugSearch.trim() },
          signal: controller.signal,
        });
        const bundle = res?.data?.data || res?.data || {};
        const entries = Array.isArray(bundle.entry) ? bundle.entry : [];
        const names = entries
          .map((e) => e?.resource?.code?.text)
          .filter((v) => typeof v === "string" && v.trim().length > 0);
        if (!cancelled) {
          setFilteredDrugList(names);
          if (!selectedDrug && names.length > 0) setSelectedDrug(names[0]);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Medicine search error", err);
          setSearchError("Failed to fetch medicines");
          setFilteredDrugList([]);
        }
      } finally {
        if (!cancelled) setIsSearching(false);
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      controller.abort();
    };
  }, [drugSearch, allDrugList, selectedDrug]);

  // ============================
  //  GENERAL HELPERS
  // ============================
  const handleTabChange = (option) => {
    setSelectedFilter(option);
    switch (option) {
      case "Basic":
        navigate(`/doctor/patient/${patientPhn}`);
        break;
      case "Report":
        navigate(`/doctor/patient/${patientPhn}/reportinfo`);
        break;
      case "Allergies":
        navigate(`/doctor/patient/${patientPhn}/allergiesinfo`);
        break;
      case "Medications":
        navigate(`/doctor/patient/${patientPhn}/medicationsinfo`);
        break;
      case "Visit History":
        navigate(`/doctor/patient/${patientPhn}/historyinfo`);
        break;
      default:
        navigate(`/doctor/patient/${patientPhn}`);
    }
  };

  const handleMetaChange = (field, value) => {
    setPrescriptionMeta((prev) => ({ ...prev, [field]: value }));
  };

  // ============================
  //  PRESCRIPTION ITEMS HELPERS
  // ============================
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

  // ============================
  //  FAVOURITES / GROUPS
  // ============================
  const handleAddFavourite = () => {
    if (!selectedDrug) return;
    setFavouriteDrugs((prev) => (prev.includes(selectedDrug) ? prev : [...prev, selectedDrug]));
  };

  const handlePrescribeAllFromGroup = () => {
    if (!currentGroup) return;
    currentGroup.drugs.forEach((drug) =>
      handleAddPrescriptionItem(drug, {
        dose: DOSE_OPTIONS[0],
        frequency: FREQUENCY_OPTIONS[0],
        period: PERIOD_OPTIONS[0],
        doseComment: "",
      })
    );
  };

  const handleCreateGroupFromCurrent = () => {
    if (!prescriptionItems.length) {
      alert("Add some medicines to prescription first to create a group.");
      return;
    }
    const name = window.prompt("Enter a name for the new favourite group:");
    if (!name) return;
    const uniqueDrugNames = [
      ...new Set(prescriptionItems.map((p) => p.name).filter(Boolean)),
    ];
    setFavouriteGroups((prev) => [...prev, { name, drugs: uniqueDrugNames }]);
    setSelectedGroup(name);
  };

  // ============================
  //  BACKEND: VALIDATE PRESCRIPTION (AI only)
  // ============================
  const handleValidatePrescription = async () => {
    try {
      if (!doctorLicense) {
        alert("Doctor license not found. Please login again.");
        return;
      }

      if (!prescriptionItems.length) {
        alert("Add at least one medicine before validating.");
        return;
      }

      const itemsPayload = prescriptionItems.map((item) => ({
        name: item.name,
        dose: item.dose,
        frequency: item.frequency,
        period: item.period,
        doseComment: item.doseComment,
      }));

      const payload = {
        patientPhn,
        medicalLicenseId: doctorLicense,
        visitType: prescriptionMeta.visitType,
        status: prescriptionMeta.status,
        complaint: prescriptionMeta.complaint,
        prescriptionItems: itemsPayload,
      };

      setIsValidating(true);
      const res = await httpClient.post(
        "/fhir/MedicationRequest/validate",
        payload
      );

      setValidationResult(res.data?.aiValidation || null);
      setShowValidationModal(true);
    } catch (err) {
      console.error("Failed to validate prescription", err?.response?.data || err);
      alert("Failed to validate prescription.");
    } finally {
      setIsValidating(false);
    }
  };

  // ============================
  //  BACKEND: SAVE PRESCRIPTION (actual DB save)
  // ============================
  const handleSavePrescription = async () => {
    try {
      if (!doctorLicense) {
        alert("Doctor license not found. Please login again.");
        return;
      }

      if (!prescriptionItems.length) {
        alert("Add at least one medicine before saving.");
        return;
      }

      // Find active encounter for this doctor + patient
      const encRes = await httpClient.get("/fhir/Encounter", {
        params: { patient: patientPhn },
      });

      const encounters = encRes?.data?.data || [];
      const activeEncounter = encounters.find(
        (enc) =>
          enc.metadata?.status === "in-progress" &&
          enc.metadata?.doctorLicense === doctorLicense
      );

      if (!activeEncounter) {
        alert("No active clinic visit found. Please start a visit first.");
        return;
      }

      const encounterId = activeEncounter.encId; // FHIR encounter identifier

      const itemsPayload = prescriptionItems.map((item) => ({
        name: item.name,
        dose: item.dose,
        frequency: item.frequency,
        period: item.period,
        doseComment: item.doseComment,
        comment: item.doseComment,
      }));

      const payload = {
        patientPhn,
        medicalLicenseId: doctorLicense,
        visitType: prescriptionMeta.visitType,
        status: prescriptionMeta.status,
        complaint: prescriptionMeta.complaint,
        encounterId,
        prescriptionItems: itemsPayload,
      };

      const res = await httpClient.post("/fhir/MedicationRequest", payload);
      const savedPrescriptionId = res.data?.data?.id;

      setShowValidationModal(false);

      // Validate the saved prescription and generate QR
      if (savedPrescriptionId) {
        setIsGeneratingQR(true);
        try {
          const qrRes = await httpClient.post(
            `/fhir/MedicationRequest/${savedPrescriptionId}/validate`
          );
          if (qrRes.data?.success) {
            setQrData(qrRes.data.data);
            setShowQRModal(true);
          } else {
            alert("Prescription saved. QR generation failed — you can retry from the medications list.");
            navigate(`/doctor/patient/${patientPhn}/medicationsinfo`);
          }
        } catch {
          alert("Prescription saved successfully.");
          navigate(`/doctor/patient/${patientPhn}/medicationsinfo`);
        } finally {
          setIsGeneratingQR(false);
        }
      } else {
        alert("Prescription created successfully.");
        navigate(`/doctor/patient/${patientPhn}/medicationsinfo`);
      }
    } catch (err) {
      console.error("Failed to save prescription", err?.response?.data || err);
      alert("Failed to create prescription.");
    }
  };

  // ============================
  //  PREVIEW & QR
  // ============================
  const handleViewPrescriptions = () => setShowPreview(true);
  const handleClosePreview = () => setShowPreview(false);

  const generateQRCode = () => {
    try {
      const payload = {
        meta: prescriptionMeta,
        items: prescriptionItems,
        patientPhn,
        doctor: doctorDisplayName,
      };
      const encoded = encodeURIComponent(JSON.stringify(payload));
      const size = 300;
      const url = `https://chart.googleapis.com/chart?cht=qr&chs=${size}x${size}&chl=${encoded}`;
      setQrUrl(url);
    } catch (err) {
      console.error("Failed to generate QR", err);
      alert("Failed to generate QR code.");
    }
  };

  // ============================
  //  RENDER SELECTION PANEL
  // ============================
  const renderSelectionPanel = () => {
    if (selectMode === "byName") {
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
              {isSearching && <div className="selection-helper">Searching...</div>}
              {!isSearching && searchError && (
                <div className="selection-helper">{searchError}</div>
              )}
              {!isSearching &&
                !searchError &&
                filteredDrugList.map((drug) => (
                  <button
                    key={drug}
                    className={`pill-button ${drug === selectedDrug ? "active" : ""}`}
                    onClick={() => setSelectedDrug(drug)}
                  >
                    {drug}
                  </button>
                ))}
              {!isSearching &&
                !searchError &&
                filteredDrugList.length === 0 && (
                  <p className="selection-helper">
                    No drugs match “{drugSearch}”.
                  </p>
                )}
            </div>
          </div>

          <div className="selection-form">
            <div className="selection-grid">
              <div>
                <label>Dose</label>
                <select
                  value={selectedDose}
                  onChange={(e) => setSelectedDose(e.target.value)}
                >
                  {DOSE_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label>Frequency</label>
                <select
                  value={selectedFrequency}
                  onChange={(e) => setSelectedFrequency(e.target.value)}
                >
                  {FREQUENCY_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label>Period</label>
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                >
                  {PERIOD_OPTIONS.map((option) => (
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

            <button
              className="selection-add-btn"
              onClick={() => handleAddPrescriptionItem(selectedDrug)}
              disabled={!selectedDrug}
            >
              + Add
            </button>
          </div>
        </div>
      );
    }

    if (selectMode === "favouriteList") {
      return (
        <div className="selection-panel">
          <div className="selection-list">
            <div className="selection-list-header">
              <h4>My Favourite</h4>
              <button
                className="selection-secondary-btn"
                onClick={handleAddFavourite}
              >
                Add above drug to favourites
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
            <p className="selection-helper">
              Selected drug: {selectedDrug || "Pick a drug"}
            </p>
            <button
              className="selection-add-btn"
              onClick={() => handleAddPrescriptionItem(selectedDrug)}
              disabled={!selectedDrug}
            >
              Add to prescription
            </button>
          </div>
        </div>
      );
    }

    if (selectMode === "favouriteGroup") {
      return (
        <div className="selection-panel">
          <div className="selection-list">
            <div className="selection-list-header">
              <h4>Favourite Groups</h4>
              <button
                className="selection-secondary-btn"
                onClick={handleCreateGroupFromCurrent}
              >
                Create group from current prescription
              </button>
            </div>
            <div className="selection-scroll">
              {favouriteGroups.map((group) => (
                <button
                  key={group.name}
                  className={`pill-button ${
                    group.name === selectedGroup ? "active" : ""
                  }`}
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
                  <button
                    className="inline-add-btn"
                    onClick={() => handleAddPrescriptionItem(drug)}
                  >
                    + Add
                  </button>
                </div>
              ))}
              {(currentGroup?.drugs?.length ?? 0) === 0 && (
                <p className="selection-helper">No drugs in this group.</p>
              )}
            </div>
            <button
              className="selection-add-btn"
              onClick={handlePrescribeAllFromGroup}
              disabled={!currentGroup}
            >
              Prescribe All
            </button>
          </div>
        </div>
      );
    }

    return null;
  };

  // ============================
  //  MAIN RENDER
  // ============================
  return (
    <div className="patientDetailsMain">
      <h2 className="patientDetailsHeder">
        Issuing a Prescription - {patientName}
      </h2>

      <SegmentedControl
        options={filterOptions}
        selected={selectedFilter}
        onChange={handleTabChange}
      />

      <div className="prescription-card">
        {/* Meta */}
        <div className="prescription-meta">
          <div className="meta-row">
            <div>
              <label>Complaint / Injuries</label>
              <input
                type="text"
                value={prescriptionMeta.complaint}
                onChange={(e) =>
                  handleMetaChange("complaint", e.target.value)
                }
              />
            </div>
            <div>
              <label>Onset Date</label>
              <input
                type="date"
                value={prescriptionMeta.onsetDate}
                onChange={(e) =>
                  handleMetaChange("onsetDate", e.target.value)
                }
              />
            </div>
            <div>
              <label>Visit Type</label>
              <select
                value={prescriptionMeta.visitType}
                onChange={(e) =>
                  handleMetaChange("visitType", e.target.value)
                }
              >
                <option value="OPD">OPD</option>
                <option value="IPD">IPD</option>
                <option value="Clinic">Clinic</option>
              </select>
            </div>
          </div>

          <div className="meta-row">
            <div>
              <label>Status</label>
              <select
                value={prescriptionMeta.status}
                onChange={(e) =>
                  handleMetaChange("status", e.target.value)
                }
              >
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
                onChange={(e) =>
                  handleMetaChange("doctor", e.target.value)
                }
              />
            </div>
            <div>
              <label>Prescribe Date</label>
              <input
                type="date"
                value={prescriptionMeta.prescribeDate}
                onChange={(e) =>
                  handleMetaChange("prescribeDate", e.target.value)
                }
              />
            </div>
          </div>
        </div>

        {/* Table */}
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
                    No prescriptions added yet. Use the selector below to add
                    items.
                  </td>
                </tr>
              ) : (
                prescriptionItems.map((item) => (
                  <tr key={item.id}>
                    <td>{item.name}</td>
                    <td>
                      <select
                        value={item.dose}
                        onChange={(e) =>
                          handleItemChange(item.id, "dose", e.target.value)
                        }
                      >
                        {DOSE_OPTIONS.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <select
                        value={item.frequency}
                        onChange={(e) =>
                          handleItemChange(
                            item.id,
                            "frequency",
                            e.target.value
                          )
                        }
                      >
                        {FREQUENCY_OPTIONS.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <select
                        value={item.period}
                        onChange={(e) =>
                          handleItemChange(item.id, "period", e.target.value)
                        }
                      >
                        {PERIOD_OPTIONS.map((option) => (
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
                        onChange={(e) =>
                          handleItemChange(
                            item.id,
                            "doseComment",
                            e.target.value
                          )
                        }
                        placeholder="Add instructions..."
                      />
                    </td>
                    <td>
                      <button
                        className="danger-link"
                        onClick={() => handleDeleteItem(item.id)}
                      >
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

        {/* Mode Tabs */}
        <div className="select-mode-tabs">
          {[
            { key: "byName", label: "By name" },
            { key: "favouriteList", label: "My favourite drugs list" },
            { key: "favouriteGroup", label: "My favourite group" },
          ].map((mode) => (
            <button
              key={mode.key}
              className={`select-mode-btn ${
                selectMode === mode.key ? "active" : ""
              }`}
              onClick={() => setSelectMode(mode.key)}
            >
              {mode.label}
            </button>
          ))}
        </div>

        {/* Selector */}
        {renderSelectionPanel()}

        {/* Actions */}
        <div className="action-bar">
          <button
            className="action-btn secondary"
            onClick={handleViewPrescriptions}
            type="button"
          >
            View
          </button>
          <button
            className="action-btn primary"
            onClick={handleValidatePrescription}
            type="button"
            disabled={isValidating}
          >
            {isValidating ? "Validating..." : "Validate"}
          </button>
        </div>

        {/* AI Validation Modal */}
        {showValidationModal && (
          <div className="modal-overlay" role="dialog" aria-modal="true">
            <div className="modal-content">
              <div className="modal-header">
                <h3>AI Validation Result</h3>
                <button
                  className="modal-close-btn"
                  onClick={() => setShowValidationModal(false)}
                  aria-label="Close validation"
                >
                  ×
                </button>
              </div>
              <div className="modal-body">
                {!validationResult ? (
                  <p>Loading...</p>
                ) : (
                  <>
                    <p>
                      <strong>Status:</strong>{" "}
                      {validationResult.safe
                        ? "No high-risk side effects detected"
                        : "High-risk side effects detected — review carefully"}
                    </p>

                    {validationResult.warnings &&
                      validationResult.warnings.length > 0 && (
                        <div className="modal-table-wrapper">
                          <table className="modal-table">
                            <thead>
                              <tr>
                                <th>Medicine</th>
                                <th>Drug Class</th>
                                <th>Type</th>
                                <th>Severity</th>
                                <th>Details</th>
                              </tr>
                            </thead>
                            <tbody>
                              {validationResult.warnings.map((w, idx) => (
                                <tr key={idx}>
                                  <td>{w.medicineName}</td>
                                  <td>{w.drugClass}</td>
                                  <td>{w.relatedCondition}</td>
                                  <td
                                    style={{
                                      color:
                                        w.severity === "high"
                                          ? "#c0392b"
                                          : w.severity === "medium"
                                          ? "#e67e22"
                                          : "#27ae60",
                                      fontWeight: "bold",
                                      textTransform: "capitalize",
                                    }}
                                  >
                                    {w.severity}
                                  </td>
                                  <td style={{ whiteSpace: "pre-wrap" }}>
                                    {w.message}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                    {(!validationResult.warnings ||
                      validationResult.warnings.length === 0) && (
                      <p className="selection-helper">
                        No known side effects found for the prescribed medicines.
                      </p>
                    )}
                  </>
                )}
              </div>
              <div
                className="modal-footer"
                style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}
              >
                <button
                  className="action-btn secondary"
                  onClick={() => setShowValidationModal(false)}
                >
                  Edit Prescription
                </button>
                <button
                  className="action-btn primary"
                  onClick={handleSavePrescription}
                  type="button"
                >
                  Save Prescription
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Preview Modal */}
        {showPreview && (
          <div className="modal-overlay" role="dialog" aria-modal="true">
            <div className="modal-content">
              <div className="modal-header">
                <h3>Prescription Preview</h3>
                <button
                  className="modal-close-btn"
                  onClick={handleClosePreview}
                  aria-label="Close preview"
                >
                  ×
                </button>
              </div>
              <div className="modal-body">
                <div className="preview-meta">
                  <div>
                    <strong>Patient:</strong> {patientName} ({patientPhn})
                  </div>
                  <div>
                    <strong>Complaint:</strong> {prescriptionMeta.complaint}
                  </div>
                  <div>
                    <strong>Doctor:</strong> {prescriptionMeta.doctor}
                  </div>
                  <div>
                    <strong>Prescribe Date:</strong>{" "}
                    {prescriptionMeta.prescribeDate}
                  </div>
                  <div>
                    <strong>Status:</strong> {prescriptionMeta.status}
                  </div>
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
                          <td colSpan={5} className="empty-row">
                            No medicines added yet.
                          </td>
                        </tr>
                      ) : (
                        prescriptionItems.map((it) => (
                          <tr key={it.id}>
                            <td>{it.name}</td>
                            <td>{it.dose}</td>
                            <td>{it.frequency}</td>
                            <td>{it.period}</td>
                            <td>{it.doseComment || "-"}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {qrUrl && (
                  <div className="qr-container">
                    <h4>Generated QR Code</h4>
                    <img src={qrUrl} alt="Prescription QR" className="qr-image" />
                    <p className="selection-helper">
                      Scan this QR to view prescription details.
                    </p>
                  </div>
                )}
              </div>
              <div
                className="modal-footer"
                style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}
              >
                <button className="action-btn primary" onClick={generateQRCode}>
                  Generate QR code
                </button>
              </div>
            </div>
          </div>
        )}

        {/* QR Validation Modal — shown after prescription is saved + validated */}
        {showQRModal && qrData && (
          <PrescriptionQRModal
            prescriptionId={qrData.prescriptionId}
            validatedAt={qrData.validatedAt}
            qrCodeData={qrData.qrCodeData}
            patientName={patientName}
            patientPhn={patientPhn}
            doctorName={doctorDisplayName}
            medicines={prescriptionItems.map((i) => i.name).filter(Boolean)}
            onClose={() => {
              setShowQRModal(false);
              navigate(`/doctor/patient/${patientPhn}/medicationsinfo`);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default NewPrescription;
