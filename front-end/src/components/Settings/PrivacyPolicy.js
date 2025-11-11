import React, { useEffect, useState } from "react";
import { getPrivacyPolicy } from '../../services/api';
import './PrivacyPolicy.css';

export default function PrivacyPolicy({ navigateTo }) {
  const [policy, setPolicy] = useState("");

  useEffect(() => {
    getPrivacyPolicy()
      .then(data => {
        if (data) setPolicy(data.data.content || "");
      })
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="privacy-container">
      <div className="privacy-content">
        <h1 className="privacy-header">Privacy Policy</h1>

        <p className="privacy-text">{policy}</p>

        <button className="back-button" onClick={() => navigateTo('settings')}>
          Back to Settings
        </button>
      </div>
    </div>
  );
}
