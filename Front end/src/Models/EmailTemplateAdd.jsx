import React, { useState } from "react";
import axios from "axios";
import { readString } from "react-papaparse";

export default function Emailtemplateadd({ open, onClose, children }) {
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
    // Optionally, preview CSV or PDF here
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert("No file selected!");
      return;
    }
    const formData = new FormData();
    if (selectedFile.type === "text/csv") {
      formData.append("csvData", selectedFile, selectedFile.name);
      formData.append("FileType", "csv");
      formData.append("FileName", selectedFile.name);
    } else if (selectedFile.type === "application/pdf") {
      formData.append("pdfData", selectedFile, selectedFile.name);
      formData.append("FileType", "pdf");
      formData.append("FileName", selectedFile.name);
    } else {
      alert("Unsupported file type!");
      return;
    }
    try {
      await axios.post("http://localhost:3001/email-templates", formData);
      alert("File uploaded successfully!");
    } catch (err) {
      alert("Upload failed!");
      console.error(err);
    }
  };

  if (!open) return null;
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0,0,0,0.35)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: "#575757ff",
          borderRadius: "12px",
          padding: "32px",
          minWidth: "350px",
          position: "relative",
        }}
      >
        <h2>Add CSV or PDF File to continue</h2>
        <input
          type="file"
          accept=".csv,.pdf"
          onChange={handleFileUpload}
        />
        <button
          onClick={onClose}
          style={{
            background: "transparent",
            border: "none",
            position: "absolute",
            top: "12px",
            right: "12px",
            cursor: "pointer",
          }}
        >
          ✕
        </button>
        {children}
        <button onClick={handleUpload}>Upload</button>
        <h3>Preview</h3>
      </div>
    </div>
  );
}
