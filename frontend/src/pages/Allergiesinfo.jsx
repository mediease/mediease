import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SegmentedControl from "../components/SegmentedControl";
import httpClient from "../services/httpClient";
import "./css/allergiesinfo.css";

const resolveName = (p) => {
  if (p?.metadata?.firstName || p?.metadata?.lastName)
    return `${p.metadata.firstName || ""} ${p.metadata.lastName || ""}`.trim();

  const name = p?.resource?.name?.[0];
  return [name?.given?.[0], name?.family].filter(Boolean).join(" ") || "-";
};

const resolvePhn = (p) => {
  if (p?.metadata?.patientPhn) return p.metadata.patientPhn;
  const ids = p?.resource?.identifier || [];
  const obj = ids.find((i) => (i.system || "").includes("phn"));
  return obj?.value || "-";
};

const Allergiesinfo = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const filterOptions = [
    "Basic",
    "Report",
    "Allergies",
    "Medications",
    "Visit History",
  ];

  const [selectedFilter, setSelectedFilter] = useState("Allergies");

  const [patient, setPatient] = useState(null);
  const [loadingPatient, setLoadingPatient] = useState(true);

  const [allergies, setAllergies] = useState([]);
  const [loadingAllergies, setLoadingAllergies] = useState(true);

  const [substance, setSubstance] = useState("");
  const [category, setCategory] = useState("food");
  const [criticality, setCriticality] = useState("low");
  const [reaction, setReaction] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await httpClient.get(`/fhir/Patient/${id}`);
        setPatient(res.data.data);
      } finally {
        setLoadingPatient(false);
      }
    };
    load();
  }, [id]);

  const fetchAllergies = async () => {
    setLoadingAllergies(true);
    try {
      const res = await httpClient.get(
        `/fhir/AllergyIntolerance/summary/patient/${id}`
      );
      setAllergies(res.data.data || []);
    } finally {
      setLoadingAllergies(false);
    }
  };

  useEffect(() => {
    fetchAllergies();
  }, [id]);

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

  const handleSave = async (e) => {
    e.preventDefault();

    const doctor =
      JSON.parse(localStorage.getItem("doctor") || "{}") || {};
    const doctorLicense = doctor?.medicalLicenseId;

    const payload = {
      patientPhn: id,
      category,
      criticality,
      substance,
      reaction,
      recorder: doctorLicense,
      note: note || undefined,
    };

    try {
      setSaving(true);
      await httpClient.post("/fhir/AllergyIntolerance", payload);
      setSubstance("");
      setCategory("food");
      setCriticality("low");
      setReaction("");
      setNote("");
      fetchAllergies();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (allergyId) => {
    if (!window.confirm("Delete this allergy?")) return;

    await httpClient.delete(`/fhir/AllergyIntolerance/${allergyId}`);
    fetchAllergies();
  };

  if (loadingPatient) return <p>Loading...</p>;

  const fullName = resolveName(patient);
  const phn = resolvePhn(patient);

  return (
    <div className="patientDetailsMain">
      <h2 className="patientDetailsHeder">
        Patients – {fullName} ({phn})
      </h2>

      <SegmentedControl
        options={filterOptions}
        selected={selectedFilter}
        onChange={handleTabChange}
      />

      <div className="allergies-page-layout">

        {/* ---------- FORM CARD ---------- */}
        <div className="allergy-form-card">
          <h3 className="form-title">Add New Allergy</h3>

          <form onSubmit={handleSave} className="allergy-form">

            <div className="form-row">
              <label className="form-label">
                <span className="required-star">*</span> Allergen
              </label>
              <input
                type="text"
                value={substance}
                placeholder="E.g. Penicillin, Peanuts"
                onChange={(e) => setSubstance(e.target.value)}
              />
            </div>

            <div className="form-row">
              <label className="form-label">
                <span className="required-star">*</span> Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="food">Food</option>
                <option value="medication">Medication</option>
              </select>
            </div>

            <div className="form-row">
              <label className="form-label">
                <span className="required-star">*</span> Criticality
              </label>
              <select
                value={criticality}
                onChange={(e) => setCriticality(e.target.value)}
              >
                <option value="low">Low</option>
                <option value="high">High</option>
              </select>
            </div>

            <div className="form-row">
              <label className="form-label">
                <span className="required-star">*</span> Reaction
              </label>
              <textarea
                value={reaction}
                placeholder="Describe the reaction"
                onChange={(e) => setReaction(e.target.value)}
              />
            </div>

            <div className="form-row">
              <label className="form-label">Note</label>
              <textarea
                value={note}
                placeholder="Any additional notes"
                onChange={(e) => setNote(e.target.value)}
              />
            </div>

            <div className="form-hint">
              Fields marked with an asterisk must be filled
            </div>

            <div className="form-actions">
              <button className="save-btn" type="submit">
                Save Allergy
              </button>
              <button
                type="button"
                className="cancel-btn"
                onClick={() => {
                  setSubstance("");
                  setCategory("food");
                  setCriticality("low");
                  setReaction("");
                  setNote("");
                }}
              >
                Clear
              </button>
            </div>
          </form>
        </div>

        {/* ---------- LIST CARD ---------- */}
        <div className="allergy-list-card">
          <h3 className="form-title">Allergies for this Patient</h3>

          <table className="allergy-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Allergen</th>
                <th>Category</th>
                <th>Criticality</th>
                <th>Reaction</th>
                <th>Recorded</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {allergies.map((a) => (
                <tr key={a.allergyId}>
                  <td>{a.allergyId}</td>
                  <td>{a.substance}</td>
                  <td>{a.category}</td>
                  <td>{a.criticality}</td>
                  <td>{a.reaction}</td>
                  <td>
                    {a.recordedDate
                      ? new Date(a.recordedDate).toLocaleDateString()
                      : "-"}
                  </td>
                  <td>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(a.allergyId)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>

      </div>
    </div>
  );
};

export default Allergiesinfo;
