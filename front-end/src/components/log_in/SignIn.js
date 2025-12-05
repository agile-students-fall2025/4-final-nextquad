// SignIn.js — cleaned version without Google login button
import React, { useState } from "react";
import "./SignIn.css";

export default function SignIn({ setActiveModule, setCurrentPage }) {
  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Error states
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [generalError, setGeneralError] = useState("");

  // Handle normal email/password login
  const handleLogin = async () => {
    // Reset previous errors
    setEmailError("");
    setPasswordError("");
    setGeneralError("");

    // Simple validation
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

      // Make login API request
      const res = await fetch(`${process.env.REACT_APP_API_URL}/auth/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      // Handle backend errors
      if (!res.ok) {
        const msg = data.message || data.error || "Login failed.";

        if (msg.toLowerCase().includes("email")) {
          setEmailError(msg);
        } else if (msg.toLowerCase().includes("password")) {
          setPasswordError(msg);
        } else {
          setGeneralError(msg);
        }
        return;
      }

      // Save token and user info
      if (data.token) {
        localStorage.setItem("jwt", data.token);
      }
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      // Redirect to main module
      setActiveModule("events");
    } catch (err) {
      setGeneralError(err.message || "Unexpected network error.");
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

      {/* General backend error */}
      {generalError && <p className="form-error">{generalError}</p>}

      {/* Email input */}
      <input
        className="auth-input"
        type="email"
        placeholder="Email address"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          setEmailError("");
        }}
        disabled={loading}
      />
      {emailError && <p className="form-error">{emailError}</p>}

      {/* Password input */}
      <input
        className="auth-input"
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => {
          setPassword(e.target.value);
          setPasswordError("");
        }}
        disabled={loading}
      />
      {passwordError && <p className="form-error">{passwordError}</p>}

      {/* Forgot password */}
      <p
        className="auth-link"
        onClick={() => !loading && setCurrentPage("forgot")}
      >
        Forgot password?
      </p>

      {/* Login button */}
      <button className="auth-btn" onClick={handleLogin} disabled={loading}>
        {loading ? "Logging in..." : "Log in"}
      </button>

      {/* Sign up link */}
      <p
        className="auth-link small"
        onClick={() => !loading && setCurrentPage("signup")}
      >
        Don’t have an account? Sign up here.
      </p>
    </div>
  );
}
