import React, { useState } from 'react';
import './ForgotPassword.css';

export default function ForgotPassword({ setCurrentPage }) {
  const [email, setEmail] = useState("");

  const handleSendCode = () => {
    if (!email) {
      alert("Please enter your email.");
      return;
    }

    if (!email.includes("@") || !email.includes(".")) {
      alert("Please enter a valid email address.");
      return;
    }

    // TODO Sprint 2: Send verification code through backend API
    console.log("Sending reset code to:", email);

    setCurrentPage('verify');
  };

  return (
    <div className="auth-container">
      <h2 className="auth-title">Forgot your password?</h2>
      <p className="auth-subtitle">
        Please enter your email address to receive a verification code.
      </p>

      <input
        className="auth-input"
        type="email"
        placeholder="Email address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <button className="auth-btn" onClick={handleSendCode}>
        Send
      </button>
    </div>
  );
}