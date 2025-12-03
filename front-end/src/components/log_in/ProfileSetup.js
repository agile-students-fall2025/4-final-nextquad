import React, { useState, useRef } from 'react';
import './ProfileSetup.css';

export default function ProfileSetup({ setActiveModule }) {
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [nyuEmail, setNyuEmail] = useState("");
  const [gradYear, setGradYear] = useState("");
  const [profileImage, setProfileImage] = useState(null);

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
        setProfileImage(reader.result); // base64 URL
      };
      reader.readAsDataURL(file);
    }
  };

  const handleContinue = async () => {
    if (!first || !last || !nyuEmail || !gradYear) {
      alert("Please fill in all the fields.");
      return;
    }

    if (!nyuEmail.endsWith("@nyu.edu")) {
      alert("Please enter a valid NYU email address.");
      return;
    }

    const gradYearNum = parseInt(gradYear);
    if (isNaN(gradYearNum) || gradYearNum <= 2024) {
      alert("Please enter a valid graduation year (e.g. 2025).");
      return;
    }

    // Get the email from signup
    const signupEmail = localStorage.getItem("signupEmail");
    if (!signupEmail) {
      alert("Session expired. Please sign up again.");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${process.env.REACT_APP_API_URL}/auth/profile-setup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: signupEmail,
          firstName: first,
          lastName: last,
          nyuEmail,
          graduationYear: gradYear,
          profileImage: profileImage
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.message || "Profile setup failed.");
      }

      // Store JWT token and user info
      if (data.token) {
        localStorage.setItem("jwt", data.token);
      }
      if (data.data) {
        localStorage.setItem("user", JSON.stringify(data.data));
      }
      
      // Clean up signup email
      localStorage.removeItem("signupEmail");

      alert("Profile setup complete!");
      setActiveModule("events");
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-container">
      <h2 className="profile-title">Welcome to NextQuad!</h2>
      <p className="profile-subtitle">Let's finish setting up your profile.</p>

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

      <input
        className="profile-input"
        placeholder="First name"
        value={first}
        onChange={(e) => setFirst(e.target.value)}
        disabled={loading}
      />
      <input
        className="profile-input"
        placeholder="Last name"
        value={last}
        onChange={(e) => setLast(e.target.value)}
        disabled={loading}
      />
      <input
        className="profile-input"
        placeholder="NYU email"
        value={nyuEmail}
        onChange={(e) => setNyuEmail(e.target.value)}
        disabled={loading}
      />
      <input
        className="profile-input"
        placeholder="Graduation Year"
        value={gradYear}
        onChange={(e) => setGradYear(e.target.value)}
        disabled={loading}
      />

      <button className="profile-btn" onClick={handleContinue} disabled={loading}>
        {loading ? "Saving..." : "Continue"}
      </button>
    </div>
  );
}