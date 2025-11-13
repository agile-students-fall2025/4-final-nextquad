import React, { useState } from 'react';
import './SignIn.css';
import googleIcon from '../../assets/log_in/google_icon.png';

export default function SignIn({ setActiveModule, setCurrentPage }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      alert("Please enter both email and password.");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("http://localhost:3000/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.message || "Login failed.");
      }

      alert(`Welcome back, ${data.data.name}!`);
      setActiveModule("events"); // Redirect to events module
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h2 className="auth-title">Sign in</h2>
      <p className="auth-subtitle">
        Log in by entering your email address and password.
      </p>

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

      <p
        className="auth-link"
        onClick={() => !loading && setCurrentPage("forgot")}
      >
        Forgot password?
      </p>

      <button
        className="auth-btn"
        onClick={handleLogin}
        disabled={loading}
      >
        {loading ? "Logging in..." : "Log in"}
      </button>

      <div className="auth-divider">
        <span></span>
        <p>or</p>
        <span></span>
      </div>

      <button className="google-btn" disabled={loading}>
        <img src={googleIcon} alt="Google" className="google-icon" />
        Continue with Google
      </button>

      <p
        className="auth-link small"
        onClick={() => !loading && setCurrentPage("signup")}
      >
        Don’t have an account? Sign up here.
      </p>
    </div>
  );
}