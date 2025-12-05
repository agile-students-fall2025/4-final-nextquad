import React, { useState } from "react";
import "./SignUp.css";
import { getPrivacyPolicy } from "../../services/api";  // Load privacy text from backend

export default function SignUp({ setActiveModule, setCurrentPage }) {
  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agree, setAgree] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Error + success states
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [checkboxError, setCheckboxError] = useState("");
  const [success, setSuccess] = useState("");

  // Privacy Policy text loaded from backend
  const [policyText, setPolicyText] = useState("Loading...");

  /**
   * Open Terms & Privacy Policy modal
   * and fetch the privacy policy content from the backend.
   */
  const openTermsModal = async () => {
    setShowModal(true); // Show the modal immediately (prevents UX delay)

    try {
      const res = await getPrivacyPolicy();

      // Successfully loaded from backend
      if (res?.data?.content) {
        setPolicyText(res.data.content);
      } else {
        setPolicyText("Unable to load privacy policy content.");
      }
    } catch (err) {
      // Network or backend error
      setPolicyText("Error loading privacy policy.");
    }
  };

  /**
   * Handle user account creation
   * Validates input fields, sends request to backend, and redirects.
   */
  const handleCreateAccount = async () => {
    // Reset error states
    setEmailError("");
    setPasswordError("");
    setCheckboxError("");
    setSuccess("");

    // Must agree to terms before creating an account
    if (!agree) {
      setCheckboxError("Please agree to the Terms & Privacy Policy.");
      return;
    }

    // Form validation
    let hasError = false;

    if (!email.trim()) {
      setEmailError("Please enter your email.");
      hasError = true;
    } else if (!email.endsWith("@nyu.edu")) {
      setEmailError("Only @nyu.edu email addresses are allowed.");
      hasError = true;
    }

    if (!password.trim()) {
      setPasswordError("Please enter your password.");
      hasError = true;
    } else if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters.");
      hasError = true;
    }

    if (hasError) return;

    try {
      setLoading(true);

      // Send signup request to backend
      const res = await fetch(`${process.env.REACT_APP_API_URL}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      // Handle backend validation errors
      if (!res.ok) {
        if (data.message?.toLowerCase().includes("email")) {
          setEmailError(data.message);
        } else {
          setCheckboxError(data.message || "Signup failed.");
        }
        return;
      }

      // Save user's email for profile setup flow
      localStorage.setItem("signupEmail", email);

      // Show success message
      setSuccess("Account created successfully!");

      // Redirect to profile setup page
      setTimeout(() => {
        setActiveModule("auth");
        setCurrentPage("profilesetup");
      }, 800);
    } catch (err) {
      // Network/server error
      setCheckboxError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h2 className="auth-title signup-title">Create Your Account</h2>


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
      {!checkboxError && emailError && (
        <p className="form-error">{emailError}</p>
      )}

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
      {!checkboxError && passwordError && (
        <p className="form-error">{passwordError}</p>
      )}

      {/* Checkbox for accepting terms */}
      <label className="checkbox-box">
        <input
          type="checkbox"
          checked={agree}
          onChange={() => setAgree(!agree)}
          disabled={loading}
        />
        <span>
          I agree to the{" "}
          <span
            className="terms-link"
            onClick={() => !loading && openTermsModal()}
          >
            Terms & Privacy Policy
          </span>
        </span>
      </label>

      {checkboxError && <p className="form-error">{checkboxError}</p>}

      {/* Success message */}
      {success && <p className="form-success">{success}</p>}

      {/* Submit button */}
      <button
        className="auth-btn"
        onClick={handleCreateAccount}
        disabled={loading}
      >
        {loading ? "Creating..." : "Create Account"}
      </button>

      {/* Link to Sign In page */}
      <p
        className="auth-link small"
        onClick={() => !loading && setCurrentPage("signin")}
      >
        Already have an account? Log in here.
      </p>

      {/* Modal showing Terms & Privacy Policy text */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()} // Prevent modal close on inner click
          >
            <h3>Terms & Privacy Policy</h3>

            {/* Content loaded from backend */}
            <p>{policyText}</p>

            <button className="close-modal" onClick={() => setShowModal(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
