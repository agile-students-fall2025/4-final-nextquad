import React, { useState, useRef } from 'react';
import './VerifyCode.css';

export default function VerifyCode({ setCurrentPage }) {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const email = localStorage.getItem("resetEmail");

  const inputRefs = useRef([]);

  const updateDigit = (value, index) => {
    const updated = [...code];
    updated[index] = value.slice(-1);
    setCode(updated);

    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleVerify = async () => {
    setError(""); // clear previous error
    const enteredCode = code.join("");

    if (enteredCode.length < 6 || code.some((digit) => digit.trim() === "")) {
      setError("Please enter the 6-digit verification code.");
      return;
    }

    if (!email) {
      setError("Missing email. Please restart the password reset process.");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${process.env.REACT_APP_API_URL}/auth/verify-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: enteredCode }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.message || "Verification failed.");
      }

      localStorage.setItem("resetCode", enteredCode);
      setCurrentPage("reset");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h2 className="auth-title">Verification Code</h2>
      <p className="auth-subtitle">
        We have sent a 6-digit verification code to your email.
      </p>

      <div className="code-inputs">
        {code.map((digit, index) => (
          <input
            key={index}
            className="code-input"
            type="text"
            maxLength={1}
            value={digit}
            ref={(el) => (inputRefs.current[index] = el)}
            onChange={(e) => updateDigit(e.target.value, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            disabled={loading}
          />
        ))}
      </div>

      {error && <div className="form-error">{error}</div>}

      <button className="auth-btn" onClick={handleVerify} disabled={loading}>
        {loading ? "Verifying..." : "Verify"}
      </button>
    </div>
  );
}