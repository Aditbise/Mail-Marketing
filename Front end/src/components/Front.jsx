import React from "react";
import { Link, useNavigate } from "react-router-dom";

function Front() {
  const navigate = useNavigate();

  const handleSignin = () => {
    navigate("/Signup");
  };
  const handleLogin = () => {
    navigate("/Login");
  };

  return (
    <div className="front-container">
      <div></div>
      <div className="front-hero">
          <h1 className="front-title">Welcome to MailSonic</h1>
          <p className="front-subtitle">
            A simple and secure Email Marketing platform to manage your campaigns, templates,
            subscribers, and analytics – all in one place.
          </p>
        <div className="front-buttons-and-logintext">
          <div className="front-buttons">
            <div className="front-button-div">
            <button onClick={handleSignin} className="front-button">
              Get Started
            </button>
            </div>
            <div className="front-button-div">
            <button onClick={handleLogin} className="front-button">
              Already Started
            </button>
            </div>
          </div>
          <div>
          <p className="front-logintext">
            Welcome to Mailing Site :)
          </p>

          </div>
        </div>
      </div>
    </div>
  );
}

export default Front;


