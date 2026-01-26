import React from "react";
import { useNavigate } from "react-router-dom";
import { Zap, Mail, BarChart3, Lock } from "lucide-react";

function Front() {
  const navigate = useNavigate();

  const handleSignin = () => {
    navigate("/Signup");
  };

  const handleLogin = () => {
    navigate("/Login");
  };

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 flex flex-col overflow-y-auto">
      {/* Hero Section */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          {/* Logo/Brand */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="p-3 bg-lime-500/20 rounded-lg">
              <Mail className="w-8 h-8 text-lime-400" />
            </div>
            <h2 className="text-2xl font-bold text-lime-400">MailSonic</h2>
          </div>

          {/* Heading */}
          <h1 className="text-5xl sm:text-6xl font-bold text-white mb-4">
            Welcome to MailSonic
          </h1>

          {/* Subtitle */}
          <p className="text-xl text-zinc-300 mb-10 leading-relaxed">
            A simple and secure Email Marketing platform to manage your campaigns, templates,
            subscribers, and analytics – all in one place.
          </p>

          {/* Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 flex items-center gap-3">
              <Zap className="w-5 h-5 text-lime-400 flex-shrink-0" />
              <span className="text-zinc-300">Fast & Reliable</span>
            </div>
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 flex items-center gap-3">
              <Lock className="w-5 h-5 text-lime-400 flex-shrink-0" />
              <span className="text-zinc-300">Secure Delivery</span>
            </div>
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 flex items-center gap-3">
              <BarChart3 className="w-5 h-5 text-lime-400 flex-shrink-0" />
              <span className="text-zinc-300">Real Analytics</span>
            </div>
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 flex items-center gap-3">
              <Mail className="w-5 h-5 text-lime-400 flex-shrink-0" />
              <span className="text-zinc-300">Easy Management</span>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <button
              onClick={handleSignin}
              className="px-8 py-3 bg-lime-500 hover:bg-lime-600 text-zinc-950 font-semibold rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
            >
              Get Started
            </button>
            <button
              onClick={handleLogin}
              className="px-8 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold rounded-lg transition-colors duration-200 border border-zinc-700 hover:border-zinc-600"
            >
              Already Started
            </button>
          </div>

          {/* Subtitle Text */}
          <p className="text-sm text-zinc-400">
            Welcome to Mailing Site :)
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-zinc-800 bg-zinc-950/50 px-4 sm:px-6 lg:px-8 py-6">
        <p className="text-center text-sm text-zinc-500">
          © 2024 MailSonic. All rights reserved. Secure & trusted by professionals.
        </p>
      </div>
    </div>
  );
}

export default Front;


