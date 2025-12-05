import React, { useState } from 'react';
import './AdminSignIn.css';

export default function SignIn({ setActiveModule, setCurrentPage }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [generalError, setGeneralError] = useState("");

  const handleLogin = async () => {
    setEmailError("");
    setPasswordError("");
    setGeneralError("");

    if (!email.trim()) {
      setEmailError("Please enter your email.");
      return;
    }

    if (!password.trim()) {
      setPasswordError("Please enter your password.");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${process.env.REACT_APP_API_URL}/admin/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.message || "Login failed.");
      }

      localStorage.setItem("jwt", data.data.token);
      setActiveModule("admin");
      setCurrentPage("dashboard");
    } catch (err) {
      setGeneralError(err.message);
    } finally {
      setLoading(false);
    }
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
        disabled={loading}
      />
      {emailError && <p className="form-error">{emailError}</p>}

      <input
        className="auth-input"
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        disabled={loading}
      />
      {passwordError && <p className="form-error">{passwordError}</p>}

      {generalError && <p className="form-error">{generalError}</p>}

      <p className="auth-link" onClick={() => !loading && setCurrentPage('forgot')}>
        Forgot password?
      </p>

      <button className="auth-btn" onClick={handleLogin} disabled={loading}>
        {loading ? "Logging in..." : "Log in"}
      </button>

      <p className="auth-link" onClick={() => !loading && setCurrentPage('userSignIn')}>
        Not an admin? Go back
      </p>
    </div>
  );
}