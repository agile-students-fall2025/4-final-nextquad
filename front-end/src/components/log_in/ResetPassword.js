import React, { useState } from 'react';
import './ResetPassword.css';

export default function ResetPassword({ setActiveModule, setCurrentPage }) {
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const email = localStorage.getItem("resetEmail");
  const code = localStorage.getItem("resetCode");

  const handleReset = async () => {
    setError(""); // clear previous error

    if (!newPw.trim() || !confirmPw.trim()) {
      setError("Please fill in both password fields.");
      return;
    }

    // Password must be at least 6 characters
    if (newPw.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (newPw !== confirmPw) {
      setError("Passwords do not match.");
      return;
    }

    if (!email) {
      setError("Missing email. Please restart the password reset process.");
      return;
    }

    if (!code || code.length !== 6) {
      setError("Missing or invalid verification code.");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${process.env.REACT_APP_API_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          code,
          newPassword: newPw,
          confirmPassword: confirmPw,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.message || "Failed to reset password.");
      }

      // Clear reset data
      localStorage.removeItem("resetEmail");
      localStorage.removeItem("resetCode");

      setActiveModule("auth");
      setCurrentPage("signin");
    } catch (err) {
      setError(err.message);
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

      {error && <div className="form-error">{error}</div>}

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