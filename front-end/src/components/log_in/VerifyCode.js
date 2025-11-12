import React, { useState } from 'react';
import './VerifyCode.css';

export default function VerifyCode({ setCurrentPage }) {
  const [code, setCode] = useState(["", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const email = localStorage.getItem("resetEmail"); 

  const updateDigit = (value, index) => {
    const updated = [...code];
    updated[index] = value.slice(-1);
    setCode(updated);
  };

  const handleVerify = async () => {
    const enteredCode = code.join("");

    if (enteredCode.length < 4 || code.some((digit) => digit.trim() === "")) {
      alert("Please enter the 4-digit verification code.");
      return;
    }

    if (!email) {
      alert("Missing email. Please restart the password reset process.");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("http://localhost:3000/api/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: enteredCode }), 
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.message || "Verification failed.");
      }

      alert("Verification successful!");
      setCurrentPage("reset");
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h2 className="auth-title">Verification Code</h2>
      <p className="auth-subtitle">
        We have sent a 4-digit verification code to your email.
      </p>

      <div className="code-inputs">
        {code.map((digit, index) => (
          <input
            key={index}
            className="code-input"
            type="text"
            maxLength={1}
            value={digit}
            onChange={(e) => updateDigit(e.target.value, index)}
            disabled={loading}
          />
        ))}
      </div>

      <button className="auth-btn" onClick={handleVerify} disabled={loading}>
        {loading ? "Verifying..." : "Verify"}
      </button>
    </div>
  );
}