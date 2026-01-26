import React from "react";
import { useState } from "react";
import { User, Lock, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Signup(){
    const [name,setName]=useState("");
    const [email,setEmail]=useState("");
    const [password,setPassword]=useState("");
    const navigate=useNavigate();

    const handleSubmit=(e)=>{
        e.preventDefault()
        axios.post('http://localhost:3001/signup',{name,email,password})
        .then(result=>{console.log(result)
            // Don't store user data here - it will be fetched from database during login
            alert('Account created successfully! Please login with your credentials.');
            navigate('/login');
        })
        .catch(error=>console.log(error))
    }
    return (
        <div className="min-h-screen w-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                {/* Card */}
                <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-8 shadow-2xl">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold text-white mb-2">Create Account</h1>
                        <p className="text-zinc-400 text-sm">Join our email marketing platform</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        {/* Username Input */}
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-500" />
                            <input 
                                type="text" 
                                placeholder="Full Name" 
                                className="w-full bg-zinc-800 border border-zinc-700 text-white pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:border-lime-500 focus:ring-1 focus:ring-lime-500 transition-colors text-sm"
                                onChange={(e) => setName(e.target.value)}
                                required 
                            />
                        </div>

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

                        {/* Register Button */}
                        <button 
                            type="submit" 
                            className="w-full bg-lime-500 hover:bg-lime-600 text-white font-bold py-3 rounded-lg transition-colors text-base mt-2"
                        >
                            Create Account
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-zinc-700"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-zinc-900 text-zinc-500">Already have an account?</span>
                        </div>
                    </div>

                    {/* Login Link */}
                    <Link 
                        to="/login"
                        className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3 rounded-lg transition-colors text-base text-center block"
                    >
                        Sign In
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

export default Signup;
