import react from "react";
import {useState} from "react";
import {readString} from "react-papaparse";
import "pdfjs-dist";
const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file.type==="text/csv"){
        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target.result;
            const results = readString(text, { header: true });
            console.log(results.data);
            
        };
    }
    else if(file.type==="application/pdf"){

    }
}
export default function Emailtemplateadd({open ,onClose,children}){
    const [csvdata,setCsvData] =useState([]);
    

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
        <h2>Add CSV or PDF File to continue</h2>
        <input type="file" accept=".csv,.pdf" onChange={handleFileUpload}/>
        <button onClick={onClose} style={{background: "transparent", 
            border: "none", 
            position: "absolute", 
            top: "12px", 
            right: "12px", 
            cursor: "pointer"
            }}>✕</button>
        {children}
        <button>Upload</button>
        <h3>Preview</h3>
        </div>
        
        </div>
    )
}