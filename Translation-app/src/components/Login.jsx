import React, { useState } from "react";
import { FaUser, FaLock } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    axios
      .post("http://localhost:3001/Login", { email, password })
      .then((result) => {
        console.log("Login response:", result.data);
        if (result.data === "Success") {
          navigate("/Dashboard");
        } else {
          alert("Invalid login credentials");
        }
      })
      .catch((error) => {
        console.error("Login error:", error);
        alert("An error occurred during login.");
      });
  };

  return (
    <>
      <div className="logindv">
        <form onSubmit={handleSubmit}>
          <h1>Login</h1>

          <div className="spaceinbetween">
            <input
              type="email"
              placeholder="Email"
              className="logintextfi"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <FaUser className="icon" />
          </div>
          <br />

          <div className="spaceinbetween">
            <input
              type="password"
              placeholder="Password"
              className="logintextfi"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <FaLock className="icon" />
          </div>
          <br />

          <div className="spaceinbetween">
            <label>
              <input type="checkbox" /> Remember me
            </label>
            <a href="#">Forget password</a>
          </div>
          <br />

          <button type="submit">Login</button>
          <br />

          <div className="spaceinbetween">
            <p>
              Don't have an account? <Link to="/Signup">Register</Link>
            </p>
          </div>
        </form>
      </div>
    </>
  );
}

export default Login;
