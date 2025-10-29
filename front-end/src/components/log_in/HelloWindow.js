import React from 'react';
import './HelloWindow.css';

export default function HelloWindow({ setActiveModule, setCurrentPage }) {

  const goToSignIn = () => {
    setActiveModule('auth');
    setCurrentPage('signin');
  };

  const goToSignUp = () => {
    setActiveModule('auth');
    setCurrentPage('signup');
  };

  return (
    <div className="hello-container">
      <h1 className="hello-title">NextQuad</h1>

      <button className="hello-btn" onClick={goToSignIn}>
        Log in
      </button>

      <button className="hello-btn" onClick={goToSignUp}>
        Sign up
      </button>
    </div>
  );
}