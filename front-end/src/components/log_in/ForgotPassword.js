import React, { useState } from 'react';
import './ForgotPassword.css';

export default function ForgotPassword({ setCurrentPage }) {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");     
  const [generalError, setGeneralError] = useState(""); 
  const [loading, setLoading] = useState(false);

  const handleSendCode = async () => {
    setEmailError("");
    setGeneralError("");

    if (!email.trim()) {
      setEmailError("Please enter your email.");
      return;
    }

    if (!email.toLowerCase().endsWith("@nyu.edu")) {
      setEmailError("Only @nyu.edu email addresses are allowed.");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${process.env.REACT_APP_API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.message || "Failed to send code.");
      }

      localStorage.setItem("resetEmail", email);
      setCurrentPage("verify");
    } catch (err) {
      setGeneralError(err.message);
    } finally {
      setLoading(false);
    }
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
        onChange={(e) => {
          setEmail(e.target.value);
          setEmailError("");
          setGeneralError("");
        }}
        disabled={loading}
      />
      {emailError && <p className="form-error">{emailError}</p>}
      {generalError && <p className="form-error">{generalError}</p>}

      <button
        className="auth-btn"
        onClick={handleSendCode}
        disabled={loading}
      >
        {loading ? "Sending..." : "Send"}
      </button>
    </div>
  );
}