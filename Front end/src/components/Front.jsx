import React from "react";
import { Link, useNavigate } from "react-router-dom";
import './Front.css';

function Front() {
  const navigate = useNavigate();

  const handleSignin = () => {
    navigate("/Signup");
  };
  const handleLogin = () => {
    navigate("/Login");
  };

  return (
    <div style={styles.container}>
      <div style={styles.hero}>
        <h1 style={styles.title}>Welcome to MailSonic</h1>
        <p style={styles.subtitle}>
          A simple and secure Email Marketing platform to manage your campaigns, templates,
          subscribers, and analytics – all in one place.
        </p>

        <div style={styles.buttons}>
          <div className="spaceinbetween">
          <button onClick={handleSignin} style={styles.primaryBtn}>
            Get Started
          </button>
          <button onClick={handleLogin} style={styles.primaryBtn}>
            Already Started
          </button>

          </div>
          <p style={styles.loginText}>
            Welcome to Mailing Site :)
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
   container: {
    minHeight: "100vh",
    background: "#121212", // deep dark background
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px",
  },
  hero: {
    maxWidth: "600px",
    textAlign: "center",
    padding: "40px",
    background: "#1e1e1e", // dark card background
    borderRadius: "12px",
    boxShadow: "0px 0px 20px rgba(0, 0, 0, 0.4)",
  },
  title: {
    fontSize: "2.5rem",
    marginBottom: "20px",
    color: "#028066ff", // teal accent
  },
  subtitle: {
    fontSize: "1.1rem",
    color: "#ccc", // light gray for readability
    lineHeight: 1.6,
  },
  buttons: {
    marginTop: "30px",
  },
  primaryBtn: {
    backgroundColor: "#028066ff", // light teal
    color: "#fff",
    border: "none",
    padding: "10px 24px",
    marginLeft:"100px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "1rem",
    transition: "background 0.3s ease",
  },
  loginText: {
    color: "#aaa",
    marginTop: "1rem",
    fontSize: "1rem",
  },
  loginLink: {
    color: "#74c0fc", // blue accent
    textDecoration: "underline",
  },
};

export default Front;


