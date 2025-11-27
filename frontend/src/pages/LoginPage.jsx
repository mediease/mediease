import React, { useState } from "react";
import { MdEmail, MdLock, MdAdminPanelSettings } from "react-icons/md";
import { FaUserMd, FaUserTie } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import httpClient from "../services/httpClient";
import "./css/LoginPage.css";
import logo from "../assets/logo2.png";

function LoginPage() {
  const [userType, setUserType] = useState("doctor"); // doctor | admin | staff
  const [staffRole, setStaffRole] = useState("nurse"); // nurse | lab_assistant
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const roleToSend =
      userType === "staff" ? staffRole : userType; // nurse/lab or doctor/admin

    try {
      const response = await httpClient.post("/auth/login", {
        email,
        password,
        role: roleToSend,
      });

      const data = response.data?.data || {};
      const user = data.user || data;

      const token =
        data.token ||
        response.data?.token ||
        response.data?.accessToken ||
        response.data?.jwt;

      if (token) {
        localStorage.setItem("authToken", token);
      }

      // Save role
      localStorage.setItem("userRole", user.role || roleToSend);

      // Doctor extra info
      if (roleToSend === "doctor") {
        const medicalLicenseId = user.medicalLicenseId || "MED_UNKNOWN";
        localStorage.setItem("medicalLicenseId", String(medicalLicenseId));
        localStorage.setItem(
          "doctor",
          JSON.stringify({
            firstName: user.firstName || "Doctor",
            lastName: user.lastName || "",
            medicalLicenseId,
          })
        );
      }

      // Nurse extra info
      if (roleToSend === "nurse") {
        const nurId = user.nurId || "NUR_UNKNOWN";
        localStorage.setItem("nurId", String(nurId));
        localStorage.setItem(
          "nurse",
          JSON.stringify({
            firstName: user.firstName || "Nurse",
            lastName: user.lastName || "",
            nurId,
          })
        );
      }

      // Lab Assistant extra info
      if (roleToSend === "lab_assistant") {
        const labId = user.labId || "LAB_UNKNOWN";
        localStorage.setItem("labId", String(labId));
        localStorage.setItem(
          "labAssistant",
          JSON.stringify({
            firstName: user.firstName || "Lab",
            lastName: user.lastName || "Assistant",
            labId,
          })
        );
      }

      // -------------------------------
      // 🔥 Redirect Logic
      // -------------------------------
      if (userType === "doctor") {
        navigate("/doctor");

      } else if (userType === "admin") {
        navigate("/admin");

      } else if (userType === "staff") {
        if (staffRole === "lab_assistant") {
          navigate("/lab-assistant"); // ✅ Correct redirect
        } else if (staffRole === "nurse") {
          navigate("/nurse");
        }
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Login failed. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUserTypeClick = (type) => {
    setUserType(type);
    if (type !== "staff") {
      setStaffRole("nurse");
    }
  };

  return (
    <div className="container">
      <div className="login-card">
        <img src={logo} alt="MediEase Logo" className="logo" />
        <h1 className="brand-name">MediEase EHR</h1>
        <p className="login-subtitle">Sign in to access your dashboard</p>

        <div className="user-types">
          <div
            className={`user-type ${userType === "doctor" ? "active" : ""}`}
            onClick={() => handleUserTypeClick("doctor")}
          >
            <FaUserMd className="user-type-icon" />
            <div className="user-type-label">Doctor</div>
          </div>

          <div
            className={`user-type ${userType === "admin" ? "active" : ""}`}
            onClick={() => handleUserTypeClick("admin")}
          >
            <MdAdminPanelSettings className="user-type-icon" />
            <div className="user-type-label">Admin</div>
          </div>

          <div
            className={`user-type ${userType === "staff" ? "active" : ""}`}
            onClick={() => handleUserTypeClick("staff")}
          >
            <FaUserTie className="user-type-icon" />
            <div className="user-type-label">Staff</div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div
              style={{
                color: "#dc3545",
                marginBottom: "15px",
                padding: "10px",
                backgroundColor: "#f8d7da",
                borderRadius: "5px",
                border: "1px solid #f5c6cb",
              }}
            >
              {error}
            </div>
          )}

          {userType === "staff" && (
            <div className="form-group">
              <label className="form-label">
                <strong>Staff Role</strong>
              </label>
              <div className="input-with-icon no-icon">
                <select
                  className="staff-role-select"
                  value={staffRole}
                  onChange={(e) => setStaffRole(e.target.value)}
                >
                  <option value="nurse">Nurse</option>
                  <option value="lab_assistant">Lab Assistant</option>
                </select>
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">
              <strong>Email Address</strong>
            </label>
            <div className="input-with-icon">
              <MdEmail className="input-icon" />
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              <strong>Password</strong>
            </label>
            <div className="input-with-icon">
              <MdLock className="input-icon" />
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="signin-button" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        {userType !== "admin" && (
          <div className="create-account">
            Don't have an account?{" "}
            <Link to={`/create-account?type=${userType}`} className="link">
              Create new account
            </Link>
          </div>
        )}

        <div className="support-text">
          Having Trouble to login?{" "}
          <a href="#" className="link">
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
