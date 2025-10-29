import React, { useState, useRef } from 'react';
import './ProfileSetup.css';

export default function ProfileSetup({ setActiveModule }) {
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [nyuEmail, setNyuEmail] = useState("");
  const [gradYear, setGradYear] = useState("");
  const [profileImage, setProfileImage] = useState(null);

  const fileInputRef = useRef(null);

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result); // base64 url for preview
      };
      reader.readAsDataURL(file);
    }
  };

  const handleContinue = () => {
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

    // TODO Sprint 2: Replace with backend API request
    console.log("Profile Setup:", {
      first,
      last,
      nyuEmail,
      gradYear,
      profileImage, // preview URL
    });

    setActiveModule('events');
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
      />
      <input
        className="profile-input"
        placeholder="Last name"
        value={last}
        onChange={(e) => setLast(e.target.value)}
      />
      <input
        className="profile-input"
        placeholder="NYU email"
        value={nyuEmail}
        onChange={(e) => setNyuEmail(e.target.value)}
      />
      <input
        className="profile-input"
        placeholder="Graduation Year"
        value={gradYear}
        onChange={(e) => setGradYear(e.target.value)}
      />

      <button className="profile-btn" onClick={handleContinue}>
        Continue
      </button>
    </div>
  );
}