import { useState, useEffect } from "react";
import axios from "axios";
import EmailTemplateAdd from "../Models/EmailTemplateAdd.jsx";

export default function EmailTemplates() {
  const [templates, setTemplates] = useState([]);
  const [show, setShow] = useState(false);

  // Fetch templates from backend when component mounts or when modal closes
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const res = await axios.get("http://localhost:3001/email-templates");
        setTemplates(res.data);
      } catch (err) {
        console.error("Error fetching email templates:", err);
      }
    };
    fetchTemplates();
  }, [show]); // Re-fetch when modal closes (after adding new template)

  return (
    <div className="returndiv">
      <h1>Email Templates</h1>
      <button onClick={() => setShow(true)}>Add Template</button>
      {show && (
        <EmailTemplateAdd open={show} onClose={() => setShow(false)} />
      )}
      <div>
        <h2>Template List</h2>
        {templates.length === 0 ? (
          <p>No templates found.</p>
        ) : (
          templates.map((template) => (
            <div key={template._id} style={{ margin: "16px 0", padding: "12px", border: "1px solid #ccc", borderRadius: "8px" }}>
              <p>
                <strong>File Types:</strong>{" "}
                {Array.isArray(template.FileType) ? template.FileType.join(", ") : template.FileType}
              </p>
              <p>
                <strong>File Names:</strong>{" "}
                {Array.isArray(template.FileName) ? template.FileName.join(", ") : template.FileName}
              </p>
              {template.csvData && template.csvData.length > 0 && (
                <div>
                  <h4>CSV Content:</h4>
                  {template.csvData.map((csv, idx) => (
                    <pre key={idx} style={{ background: "#eee", padding: "8px" }}>
                      {csv}
                    </pre>
                  ))}
                </div>
              )}
              {template.pdfData && template.pdfData.length > 0 && (
                <div>
                  <h4>PDF Files:</h4>
                  {template.pdfData.map((pdf, idx) => {
                    const base64 =
                      pdf && pdf.data
                        ? `data:application/pdf;base64,${btoa(String.fromCharCode(...pdf.data))}`
                        : "";
                    return (
                      <div key={idx}>
                        <p>PDF File {idx + 1} ({pdf.data ? pdf.data.length : 0} bytes)</p>
                        {base64 && (
                          <>
                            <a href={base64} download={`file${idx + 1}.pdf`} target="_blank" rel="noopener noreferrer">
                              Download PDF
                            </a>
                            <div style={{ margin: "12px 0" }}>
                              <iframe
                                src={base64}
                                title={`PDF Preview ${idx + 1}`}
                                width="1000"
                                height="400"
                                style={{ border: "1px solid #ccc" }}
                              />
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}