import React, { useState } from "react";
import { User, Lock, Mail } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    axios
      .post("http://localhost:3001/login", { email, password })
      .then((result) => {
        console.log("Login response:", result.data);
        if (result.data.success) {
          // Store user data from database response
          localStorage.setItem('userEmail', result.data.user.email);
          localStorage.setItem('userName', result.data.user.name);
          localStorage.setItem('userId', result.data.user.id);
          localStorage.setItem('userSignedIn', 'true');
          localStorage.setItem('signInDate', new Date().toISOString());
          navigate("/Dashboard");
        } else {
          alert(result.data.message || "Invalid login credentials");
        }
      })
      .catch((error) => {
        console.error("Login error:", error);
        alert("An error occurred during login.");
      });
  };

  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-8 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Welcome Back</h1>
            <p className="text-zinc-400 text-sm">Sign in to your email marketing account</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Email Input */}
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-500" />
              <input
                type="email"
                placeholder="Email Address"
                className="w-full bg-zinc-800 border border-zinc-700 text-white pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:border-lime-500 focus:ring-1 focus:ring-lime-500 transition-colors text-sm"
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Password Input */}
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-500" />
              <input
                type="password"
                placeholder="Password"
                className="w-full bg-zinc-800 border border-zinc-700 text-white pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:border-lime-500 focus:ring-1 focus:ring-lime-500 transition-colors text-sm"
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded accent-lime-500 cursor-pointer" />
                <span className="text-zinc-400">Remember me</span>
              </label>
              <a href="#" className="text-lime-500 hover:text-lime-400 transition-colors">Forgot password?</a>
            </div>

            {/* Login Button */}
            <button 
              type="submit" 
              className="w-full bg-lime-500 hover:bg-lime-600 text-white font-bold py-3 rounded-lg transition-colors text-base mt-2"
            >
              Sign In
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-zinc-900 text-zinc-500">Don't have an account?</span>
            </div>
          </div>

          {/* Register Link */}
          <Link 
            to="/Signup"
            className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3 rounded-lg transition-colors text-base text-center block"
          >
            Create Account
          </Link>
        </div>

        {/* Footer Text */}
        <p className="text-center text-zinc-500 text-xs mt-6">
          Protected by bank-level encryption
        </p>
      </div>
    </div>
  );
}

export default Login;
