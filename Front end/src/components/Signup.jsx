import React from "react";
import { useState } from "react";
import { FaUser, FaLock, FaArchive } from "react-icons/fa";
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
        <>
            <div className="logindv">
                <form action="" onSubmit={handleSubmit}>
                    <h1>Signup</h1>
                    <div className="spaceinbetween">
                        <input type="text" 
                        placeholder="Username" 
                        className="logintextfi" 
                        onChange={(e)=>setName(e.target.value)}
                        required />
                        <FaUser className="icon" />
                    </div><br />
                    <div className="spaceinbetween">
                        <input type="email" 
                        placeholder="Email" 
                        className="logintextfi"
                        onChange={(e)=>setEmail(e.target.value)}
                        required />
                        <FaArchive className="icon" />
                    </div>
                    <br />
                    <div className="spaceinbetween">
                        <input type="password" 
                        placeholder="Password" 
                        className="logintextfi" 
                        onChange={(e)=>setPassword(e.target.value)}
                        required />
                        <FaLock className="icon" />
                    </div>
                    <br />
                    <button type="submit">Register</button>
                </form>
                <br />
                <p>Already have an account?{" "}
                <Link to="/login">Login</Link>
                </p>
            </div>
        </>
    );
}

export default Signup;
