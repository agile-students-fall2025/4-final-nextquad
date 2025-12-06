import React, { useState, useRef } from 'react';
import './ProfileSetup.css';

export default function ProfileSetup({ setActiveModule }) {
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [gradYear, setGradYear] = useState("");
  const [profileImage, setProfileImage] = useState(null);

  const [firstError, setFirstError] = useState("");
  const [lastError, setLastError] = useState("");
  const [gradYearError, setGradYearError] = useState("");
  const [generalError, setGeneralError] = useState("");

  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleContinue = async () => {
    // Reset all field errors
    setFirstError("");
    setLastError("");
    setGradYearError("");
    setGeneralError("");

    let hasError = false;

    if (!first.trim()) {
      setFirstError("Please enter your first name.");
      hasError = true;
    }
    if (!last.trim()) {
      setLastError("Please enter your last name.");
      hasError = true;
    }

    if (!gradYear.trim()) {
      setGradYearError("Please enter your graduation year.");
      hasError = true;
    } else {
      const yr = parseInt(gradYear);
      if (isNaN(yr) || yr <= 2024) {
        setGradYearError("Graduation year must be 2025 or later.");
        hasError = true;
      }
    }

    const signupEmail = localStorage.getItem("signupEmail");
    if (!signupEmail) {
      setGeneralError("Session expired. Please sign up again.");
      hasError = true;
    }

    if (hasError) return;

    try {
      setLoading(true);

      const res = await fetch(`${process.env.REACT_APP_API_URL}/auth/profile-setup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: signupEmail,
          firstName: first,
          lastName: last,
          graduationYear: gradYear,
          profileImage: profileImage
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setGeneralError(data.error || "Profile setup failed.");
        return;
      }

      if (data.token) {
        sessionStorage.setItem("jwt", data.token);
      }
      if (data.data) {
        sessionStorage.setItem("user", JSON.stringify(data.data));
      }

      localStorage.removeItem("signupEmail");

      setActiveModule("events");
    } catch (err) {
      setGeneralError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-container">
      <h2 className="profile-title">Welcome to NextQuad!</h2>
      <p className="profile-subtitle">Let's finish setting up your profile.</p>

      {/* Profile image picker */}
      <div className="profile-image" onClick={handleImageClick}>
        {profileImage ? (
          <img src={profileImage} alt="Profile" className="preview-image" />
        ) : (
          "📷"
        )}
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleImageChange}
          style={{ display: "none" }}
        />
      </div>

      {/* First name */}
      <input
        className="profile-input"
        placeholder="First name"
        value={first}
        onChange={(e) => setFirst(e.target.value)}
        disabled={loading}
      />
      {firstError && <p className="form-error">{firstError}</p>}

      {/* Last name */}
      <input
        className="profile-input"
        placeholder="Last name"
        value={last}
        onChange={(e) => setLast(e.target.value)}
        disabled={loading}
      />
      {lastError && <p className="form-error">{lastError}</p>}

      {/* Grad year */}
      <input
        className="profile-input"
        placeholder="Graduation Year"
        value={gradYear}
        onChange={(e) => setGradYear(e.target.value)}
        disabled={loading}
      />
      {gradYearError && <p className="form-error">{gradYearError}</p>}

      {/* General error (API / missing session) */}
      {generalError && <p className="form-error">{generalError}</p>}

      {/* Continue Button */}
      <button className="profile-btn" onClick={handleContinue} disabled={loading}>
        {loading ? "Saving..." : "Continue"}
      </button>
    </div>
  );
}