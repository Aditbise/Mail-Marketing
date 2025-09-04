import React, { useState } from "react";
import "./styles.css";
export default function EmailTemplates() {
  const [headerelement,setHeaderElements]=useState([]);
  const predefinedHeaderElements = [
    { type: "poster", label: "Poster", content: <img src="/path/to/poster.jpg" alt="Poster" style={{ width: "100%" }} /> },
    { type: "logo", label: "Logo", content: <img src="/path/to/logo.png" alt="Logo" style={{ height: "50px" }} /> },
    // Add more as needed
  ];
  const addHeaderElement = (element) => {
    setHeaderElements(prev => [...prev, element]);
  };  
  return (
    <div
      className="returndiv"
    >
      <h1>Email Templates</h1>
      <div>
        <h2>Header</h2>
        <div>
          {predefinedHeaderElements.map(el => (
            <button key={el.type} onClick={() => addHeaderElement(el)} style={{ marginRight: "10px" }}>
              Add {el.label}
            </button>
          ))}
        </div>
        <div style={{ marginTop: "10px" }}>
          {headerelement.map((el, idx) => (
            <div key={idx}>{el.content}</div>
          ))}
        </div>
      </div>

      <div>
        <h2>Body</h2>
      </div>
      <div>
        <h2>Footer</h2>
      </div>
    </div>
  );
}
