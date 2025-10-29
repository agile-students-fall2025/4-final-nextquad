import React, { useState } from 'react';
import './VerifyCode.css';

export default function VerifyCode({ setCurrentPage }) {
  const [code, setCode] = useState(["", "", "", ""]);

  const updateDigit = (value, index) => {
    const updated = [...code];
    updated[index] = value.slice(-1);
    setCode(updated);
  };

  const handleVerify = () => {
    const enteredCode = code.join("");

    if (enteredCode.length < 4 || code.some(digit => digit.trim() === "")) {
      alert("Please enter the 4-digit verification code.");
      return;
    }

    // TODO Sprint 2: Verify the code with backend API
    console.log("Verification code entered:", enteredCode);

    setCurrentPage('reset');
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
          />
        ))}
      </div>

      <button className="auth-btn" onClick={handleVerify}>
        Verify
      </button>
    </div>
  );
}