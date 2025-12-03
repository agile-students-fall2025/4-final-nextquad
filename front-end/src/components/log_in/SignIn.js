import React, { useState } from "react";
import "./SignIn.css";
import googleIcon from "../../assets/log_in/google_icon.png";

export default function SignIn({ setActiveModule, setCurrentPage }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [generalError, setGeneralError] = useState("");

  const handleLogin = async () => {
    // Reset all errors
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

      const res = await fetch(`${process.env.REACT_APP_API_URL}/auth/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

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

<<<<<<< HEAD
      // Store JWT token and user info
      if (data.token) {
        localStorage.setItem("jwt", data.token);
=======
      // Login successful - Store token and user info
      if (data.token) {
        localStorage.setItem("token", data.token);
>>>>>>> 4c1edc4e2e63bb50d1734d5c58498aa093f1b114
      }
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }
<<<<<<< HEAD

      // Login successful
=======
      
>>>>>>> 4c1edc4e2e63bb50d1734d5c58498aa093f1b114
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

      {generalError && <p className="form-error">{generalError}</p>}

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

      <p
        className="auth-link"
        onClick={() => !loading && setCurrentPage("forgot")}
      >
        Forgot password?
      </p>

      <button className="auth-btn" onClick={handleLogin} disabled={loading}>
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
