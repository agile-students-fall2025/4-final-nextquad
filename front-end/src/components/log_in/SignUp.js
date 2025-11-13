import React, { useState } from 'react';
import { faker } from '@faker-js/faker';
import './SignUp.css';
import googleIcon from '../../assets/log_in/google_icon.png';

export default function SignUp({ setActiveModule, setCurrentPage }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agree, setAgree] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const fakeTerms = faker.lorem.paragraphs(4);

  const handleCreateAccount = async () => {
    if (!email.trim() || !password.trim()) {
      alert("Please enter both email and password.");
      return;
    }

    if (!agree) {
      alert("Please agree to the Terms & Privacy Policy.");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("http://localhost:3000/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.message || "Signup failed.");
      }

      alert("Account created successfully!");
      setActiveModule("auth");
      setCurrentPage("profilesetup");
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h2 className="auth-title signup-title">Create Your Account</h2>

      <button className="google-btn" disabled={loading}>
        <img src={googleIcon} alt="Google" className="google-icon" />
        Continue with Google
      </button>

      <div className="auth-divider">
        <span></span>
        <p>or</p>
        <span></span>
      </div>

      <input
        className="auth-input"
        type="email"
        placeholder="Email address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={loading}
      />

      <input
        className="auth-input"
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        disabled={loading}
      />

      <label className="checkbox-box">
        <input
          type="checkbox"
          checked={agree}
          onChange={() => setAgree(!agree)}
          disabled={loading}
        />
        <span>
          I agree to the
          <span
            className="terms-link"
            onClick={() => !loading && setShowModal(true)}
          >
            {" "}
            Terms & Privacy Policy
          </span>
        </span>
      </label>

      <button
        className="auth-btn"
        onClick={handleCreateAccount}
        disabled={loading}
      >
        {loading ? "Creating..." : "Create Account"}
      </button>

      <p
        className="auth-link small"
        onClick={() => !loading && setCurrentPage("signin")}
      >
        Already have an account? Log in here.
      </p>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Terms & Privacy Policy</h3>
            <p>{fakeTerms}</p>
            <button
              className="close-modal"
              onClick={() => setShowModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}