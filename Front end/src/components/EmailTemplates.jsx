import { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import EmailTemplateAdd from "../Models/emailtemplateadd.jsx";
import EmailTemplateUpdate from "../Models/EmailTemplateUpdate.jsx";

const URL = "http://localhost:3001";

export default function EmailTemplates() {
  const [templates, setTemplates] = useState([]);
  const [show, setShow] = useState(false);
  const [updateOpen, setUpdateOpen] = useState(false);
  const [updateId, setUpdateId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${URL}/email-templates`);
      setTemplates(res.data);
    } catch (err) {
      console.error("Error fetching email templates:", err);
      setError("Failed to load templates");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!show && !updateOpen) {
      fetchTemplates();
    }
  }, [show, updateOpen, fetchTemplates]);

  const handleDelete = useCallback(async (templateId) => {
    try {
      await axios.delete(`${URL}/email-templates/${templateId}`);
      setTemplates(prev => prev.filter(t => t._id !== templateId));
    } catch (err) {
      console.error("Error deleting template:", err);
      setError("Failed to delete template");
    }
  }, []);

  const handleUpdateOpen = useCallback((templateId) => {
    setUpdateId(templateId);
    setUpdateOpen(true);
  }, []);

  const handleUpdateClose = useCallback(() => {
    setUpdateOpen(false);
    setUpdateId(null);
  }, []);

  const tableHeaders = useMemo(() => (
    <thead>
      <tr>
        {["Action", "File Types", "File Names", "CSV Content", "PDF Files"].map(header => (
          <th key={header} style={{ border: "1px solid #333", padding: "8px" }}>
            {header}
          </th>
        ))}
      </tr>
    </thead>
  ), []);

  const convertPdfToBase64 = useCallback((pdf) => {
    if (!pdf?.data) return "";
    try {
      return "data:application/pdf;base64," +
        btoa(new Uint8Array(pdf.data).reduce((data, byte) => data + String.fromCharCode(byte), ""));
    } catch (err) {
      console.error("Error converting PDF:", err);
      return "";
    }
  }, []);

  const templateRows = useMemo(() => 
    templates.map((template) => (
      <tr key={template._id} style={{ borderBottom: "1px solid #ccc" }}>
        <td style={{ border: "1px solid #333", padding: "8px" }}>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={() => handleUpdateOpen(template._id)}
              style={{
                background: "#3498db",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                padding: "6px 12px",
                cursor: "pointer"
              }}
            >
              Update
            </button>
            <button
              onClick={() => handleDelete(template._id)}
              style={{
                background: "#e74c3c",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                padding: "6px 12px",
                cursor: "pointer"
              }}
            >
              Delete
            </button>
          </div>
        </td>
        <td style={{ border: "1px solid #333", padding: "8px" }}>
          {Array.isArray(template.FileType) ? template.FileType.join(", ") : template.FileType || "—"}
        </td>
        <td style={{ border: "1px solid #333", padding: "8px" }}>
          {Array.isArray(template.FileName) ? template.FileName.join(", ") : template.FileName || "—"}
        </td>
        <td style={{ border: "1px solid #333", padding: "8px" }}>
          {template.csvData?.length > 0
            ? template.csvData.map((csv, cidx) => (
                <pre key={cidx} style={{ background: "#eee", padding: "4px", margin: "4px 0", fontSize: "12px" }}>
                  {csv}
                </pre>
              ))
            : "—"}
        </td>
        <td style={{ border: "1px solid #333", padding: "8px" }}>
          {template.pdfData?.length > 0
            ? template.pdfData.map((pdf, pidx) => {
                const base64 = convertPdfToBase64(pdf);
                return (
                  <div key={pidx} style={{ marginBottom: "8px" }}>
                    {base64 && (
                      <>
                        <a
                          href={base64}
                          download={`file${pidx + 1}.pdf`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ fontSize: "12px" }}
                        >
                          Download PDF {pidx + 1}
                        </a>
                        <div style={{ margin: "4px 0" }}>
                          <iframe
                            src={base64}
                            title={`PDF Preview ${pidx + 1}`}
                            width="200"
                            height="100"
                            style={{ border: "1px solid #ccc" }}
                          />
                        </div>
                      </>
                    )}
                  </div>
                );
              })
            : "—"}
        </td>
      </tr>
    ))
  , [templates, handleDelete, handleUpdateOpen, convertPdfToBase64]);

  if (loading) return <div>Loading templates...</div>;

  return (
    <div className="returndiv">
      <h1>Email Templates</h1>
      
      {error && (
        <div style={{ background: "#ffe6e6", color: "#d00", padding: "8px", borderRadius: "4px", margin: "8px 0" }}>
          {error}
        </div>
      )}

      <button onClick={() => setShow(true)} style={{ marginBottom: "16px" }}>
        Add Template
      </button>

      {show && (
        <EmailTemplateAdd 
          open={show} 
          onClose={() => setShow(false)} 
        />
      )}

      <div>
        <h2>Template List</h2>
        {templates.length === 0 ? (
          <p>No templates found.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", border: "2px solid #333" }}>
            {tableHeaders}
            <tbody>
              {templateRows}
            </tbody>
          </table>
        )}
      </div>

      {updateOpen && (
        <EmailTemplateUpdate
          open={updateOpen}
          onClose={handleUpdateClose}
          templateId={updateId}
        />
      )}
    </div>
  );
}