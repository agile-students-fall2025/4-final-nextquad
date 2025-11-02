// copied from user sign in
import React, { useState } from 'react';
import './AdminSignIn.css';
import googleIcon from '../../assets/log_in/google_icon.png';

export default function SignIn({ setActiveModule, setCurrentPage }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    if (!email.trim() || !password.trim()) {
      alert("Please enter both email and password.");
      return;
    }

    // TODO Sprint 2: replace with backend API call
    console.log("Logging in:", email, password);

    setActiveModule('admin');
    setCurrentPage('dashboard');

  };

  return (
    <div className="auth-container">
      <h2 className="auth-title">Admin Sign in</h2>
      <p className="auth-subtitle">Log in by entering your email address and password.</p>

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

      <p className="auth-link"
         onClick={() => setCurrentPage('forgot')}>
        Forgot password?
      </p>

      <button className="auth-btn" onClick={handleLogin}>
        Log in
      </button>

      <div className="auth-divider">
        <span></span>
        <p>or</p>
        <span></span>
      </div>

      <button className="google-btn">
        <img src={googleIcon} alt="Google" className="google-icon" />
        Continue with Google
      </button>

      <p
        className="auth-link"
        onClick={() => setCurrentPage('userSignIn')} 
      >
        Not an admin? Go back
      </p>

      
    </div>
  );
}