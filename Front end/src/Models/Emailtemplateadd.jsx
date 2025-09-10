import react from "react";
import {useState} from "react";
export default function Emailtemplateadd({open ,onClose,children}){
    if(!open) return null;
    return(
        <div style={{
            position: "fixed",
            top: 0, left: 0,
            width: "100vw", height: "100vh",
            background: "rgba(0,0,0,0.35)",
            display: "flex", justifyContent: "center", alignItems: "center",
            zIndex: 1000 
        }}>
        <div style={{
            background: "#575757ff", borderRadius: "12px", padding: "32px",
            minWidth: "350px", position: "relative"
        }}>
            <h2>Add CSV File to continue</h2>
        <input type="file"/>
        <button onClick={onClose} style={{background: "transparent", 
            border: "none", 
            position: "absolute", 
            top: "12px", 
            right: "12px", 
            cursor: "pointer"
            }}>✕</button>
        {children}
        </div>
        </div>
    )
}