import React, { useState } from 'react';
import './SignUp.css';
import googleIcon from '../../assets/log_in/google_icon.png';

export default function SignUp({ setActiveModule, setCurrentPage }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agree, setAgree] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleCreateAccount = () => {
    if (!email.trim() || !password.trim()) {
      alert("Please enter both email and password.");
      return;
    }

    if (!agree) {
      alert("Please agree to the Terms & Privacy Policy.");
      return;
    }

    // TODO Sprint 2: replace with backend API call
    console.log("Creating account:", email, password);

    setActiveModule('auth');
    setCurrentPage('profilesetup');
  };

  return (
    <div className="auth-container">
      <h2 className="auth-title signup-title">Create Your Account</h2>

      <button className="google-btn">
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
      />

      <input
        className="auth-input"
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <label className="checkbox-box">
        <input
          type="checkbox"
          checked={agree}
          onChange={() => setAgree(!agree)}
        />
        <span>
          I agree to the
          <span className="terms-link" onClick={() => setShowModal(true)}> Terms & Privacy Policy</span>
        </span>
      </label>

      <button className="auth-btn" onClick={handleCreateAccount}>
        Create Account
      </button>

      <p className="auth-link small" onClick={() => setCurrentPage('signin')}>
        Already have an account? Log in here.
      </p>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Terms & Privacy Policy</h3>
            <p>
              By using this application, you agree to our collection and use of information 
              in accordance with this policy. This includes how we store, protect, and 
              utilize your personal data in accordance with industry standards...
            </p>
            <button className="close-modal" onClick={() => setShowModal(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}