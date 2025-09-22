import React, { useState } from "react";
import axios from "axios";
import { readString } from "react-papaparse";

export default function Emailtemplateadd({ open, onClose, children }) {
  const [selectedFiles, setSelectedFiles] = useState([]);

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    setSelectedFiles(files);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      alert("No files selected!");
      return;
    }
    const formData = new FormData();
    selectedFiles.forEach((file) => {
      if (file.type === "text/csv") {
        formData.append("csvData", file, file.name);
      } else if (file.type === "application/pdf") {
        formData.append("pdfData", file, file.name);
      }
    });
    // You can also append FileType and FileName arrays if needed
    try {
      await axios.post("http://localhost:3001/email-templates", formData);
      alert("Files uploaded successfully!");
    } catch (err) {
      alert("Upload failed!");
      console.error(err);
    }
  };

  function CSVPreview({ file }) {
    const [content, setContent] = useState("");
    React.useEffect(() => {
      const reader = new FileReader();
      reader.onload = (e) => setContent(e.target.result);
      reader.readAsText(file);
    }, [file]);
    return (
      <pre style={{ background: "#eee", padding: "8px" }}>
        {content}
      </pre>
    );
  }

  function PDFPreview({ file }) {
    const [url, setUrl] = useState("");
    React.useEffect(() => {
      const objectUrl = URL.createObjectURL(file);
      setUrl(objectUrl);
      return () => {
        URL.revokeObjectURL(objectUrl);
      };
    }, [file]);
    return (
      <iframe
        src={url}
        title={file.name}
        width="300"
        height="200"
        style={{ border: "1px solid #ccc" }}
      />
    );
  }

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
          multiple
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
        <div>
          <h3>Preview</h3>
          {selectedFiles.length === 0 ? (
            <p>No files selected.</p>
          ) : (
            selectedFiles.map((file, idx) => (
              <div key={idx} style={{ marginBottom: "12px" }}>
                <strong>{file.name}</strong>
                {file.type === "text/csv" ? (
                  <CSVPreview file={file} />
                ) : file.type === "application/pdf" ? (
                  <PDFPreview file={file} />
                ) : (
                  <span> (Unsupported type)</span>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
