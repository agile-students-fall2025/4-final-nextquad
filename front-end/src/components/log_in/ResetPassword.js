import React, { useState } from 'react';
import './ResetPassword.css';

export default function ResetPassword({ setActiveModule, setCurrentPage }) {
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [loading, setLoading] = useState(false);
  const email = localStorage.getItem("resetEmail");

  const handleReset = async () => {
    if (!newPw.trim() || !confirmPw.trim()) {
      alert("Please fill in both password fields.");
      return;
    }

    if (newPw !== confirmPw) {
      alert("Passwords do not match.");
      return;
    }

    if (!email) {
      alert("Missing email. Please restart the password reset process.");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("http://localhost:3000/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          newPassword: newPw,
          confirmPassword: confirmPw,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.message || "Failed to reset password.");
      }

      alert("Password reset successful! Please log in again.");

   
      localStorage.removeItem("resetEmail");

      setActiveModule("auth");
      setCurrentPage("signin");
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h2 className="auth-title">Set a new password</h2>
      <p className="auth-subtitle">Your verification code has been confirmed.</p>

      <input
        className="auth-input"
        type="password"
        placeholder="New Password"
        value={newPw}
        onChange={(e) => setNewPw(e.target.value)}
        disabled={loading}
      />

      <input
        className="auth-input"
        type="password"
        placeholder="Confirm Password"
        value={confirmPw}
        onChange={(e) => setConfirmPw(e.target.value)}
        disabled={loading}
      />

      <button
        className="auth-btn"
        onClick={handleReset}
        disabled={loading}
      >
        {loading ? "Resetting..." : "Reset"}
      </button>
    </div>
  );
}