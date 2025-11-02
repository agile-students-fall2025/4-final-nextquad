import React, { useState } from 'react';
import './ResetPassword.css';

export default function ResetPassword({ setActiveModule, setCurrentPage }) {
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");

  const handleReset = () => {
    if (!newPw || !confirmPw) {
      alert("Please fill in both password fields.");
      return;
    }

    if (newPw !== confirmPw) {
      alert("Passwords do not match.");
      return;
    }

    // TODO Sprint 2: Send new password to backend API
    console.log("New password set:", newPw);

    // Reset completed
    setActiveModule("auth");
    setCurrentPage("auth");
  };

  return (
    <div className="auth-container">
      <h2 className="auth-title">Set a new password</h2>
      <p className="auth-subtitle">
        Your verification code has been confirmed.
      </p>

      <input
        className="auth-input"
        type="password"
        placeholder="New Password"
        value={newPw}
        onChange={(e) => setNewPw(e.target.value)}
      />

      <input
        className="auth-input"
        type="password"
        placeholder="Confirm Password"
        value={confirmPw}
        onChange={(e) => setConfirmPw(e.target.value)}
      />

      <button className="auth-btn" onClick={handleReset}>
        Reset
      </button>
    </div>
  );
}