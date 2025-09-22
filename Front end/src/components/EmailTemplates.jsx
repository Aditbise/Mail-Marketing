import { useState, useEffect } from "react";
import axios from "axios";
import EmailTemplateAdd from "../Models/EmailTemplateAdd.jsx";
import EmailTemplateUpdate from "../Models/EmailTemplateUpdate.jsx";

export default function EmailTemplates() {
  const [templates, setTemplates] = useState([]);
  const [show, setShow] = useState(false);
  const [updateOpen, setUpdateOpen] = useState(false);
  const [updateId, setUpdateId] = useState(null);

  // Fetch templates from backend when component mounts or when modal closes
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const res = await axios.get("http://localhost:3001/email-templates");
        // Add selected property
        setTemplates(res.data.map(t => ({ ...t, selected: false })));
      } catch (err) {
        console.error("Error fetching email templates:", err);
      }
    };
    fetchTemplates();
  }, [show]);

  const handleDelete = async () => {
    const selectedIds = templates.filter(t => t.selected).map(t => t._id);
    try {
      // Delete each selected template
      await Promise.all(selectedIds.map(id =>
        axios.delete(`http://localhost:3001/email-templates/${id}`)
      ));
      // Remove from local state
      setTemplates(templates.filter(t => !t.selected));
    } catch (err) {
      console.error("Error deleting email templates:", err);
    }
  }

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const formData = new FormData();
    files.forEach(file => {
      if (file.type === "text/csv") {
        formData.append("csvData", file, file.name);
      } else if (file.type === "application/pdf") {
        formData.append("pdfData", file, file.name);
      }
    });
    axios.post("http://localhost:3001/email-templates", formData)
      .then(() => {
        // Optionally refetch templates
      })
      .catch(err => {
        console.error("Error uploading file:", err);
      });
  };

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
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th>Action</th>
                <th>File Types</th>
                <th>File Names</th>
                <th>CSV Content</th>
                <th>PDF Files</th>
              </tr>
            </thead>
            <tbody>
              {templates.map((template, idx) => (
                <tr key={template._id} style={{ borderBottom: "1px solid #ccc" }}>
                  <td>
                    <button
                      onClick={async () => {
                        try {
                          await axios.delete(`http://localhost:3001/email-templates/${template._id}`);
                          setTemplates(templates.filter(t => t._id !== template._id));
                        } catch (err) {
                          console.error("Error deleting template:", err);
                        }
                      }}
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
                    <button
                      onClick={() => {
                        setUpdateId(template._id);
                        setUpdateOpen(true);
                      }}
                      style={{
                        background: "#3498db",
                        color: "#fff",
                        border: "none",
                        borderRadius: "4px",
                        padding: "6px 12px",
                        cursor: "pointer",
                        marginRight: "8px"
                      }}
                    >
                      Update
                    </button>
                  </td>
                  <td>
                    {Array.isArray(template.FileType)
                      ? template.FileType.join(", ")
                      : template.FileType}
                  </td>
                  <td>
                    {Array.isArray(template.FileName)
                      ? template.FileName.join(", ")
                      : template.FileName}
                  </td>
                  <td>
                    {template.csvData && template.csvData.length > 0
                      ? template.csvData.map((csv, cidx) => (
                          <pre key={cidx} style={{ background: "#eee", padding: "4px", margin: 0 }}>
                            {csv}
                          </pre>
                        ))
                      : "—"}
                  </td>
                  <td>
                    {template.pdfData && template.pdfData.length > 0
                      ? template.pdfData.map((pdf, pidx) => {
                          let base64 = "";
                          if (pdf && pdf.data) {
                            try {
                              base64 =
                                "data:application/pdf;base64," +
                                btoa(
                                  new Uint8Array(pdf.data)
                                    .reduce((data, byte) => data + String.fromCharCode(byte), "")
                                );
                            } catch (err) {
                              base64 = "";
                            }
                          }
                          return (
                            <div key={pidx}>
                              <a
                                href={base64}
                                download={`file${pidx + 1}.pdf`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                Download PDF
                              </a>
                              <div style={{ margin: "8px 0" }}>
                                {base64 && (
                                  <iframe
                                    src={base64}
                                    title={`PDF Preview ${pidx + 1}`}
                                    width="200"
                                    height="100"
                                    style={{ border: "1px solid #ccc" }}
                                  />
                                )}
                              </div>
                            </div>
                          );
                        })
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <input
        type="file"
        accept=".csv,.pdf"
        multiple
        onChange={handleFileUpload}
      />
      {updateOpen && (
        <EmailTemplateUpdate
          open={updateOpen}
          onClose={() => {
            setUpdateOpen(false);
            setUpdateId(null);
            // Optionally refetch templates after update
            axios.get("http://localhost:3001/email-templates").then(res => {
              setTemplates(res.data.map(t => ({ ...t, selected: false })));
            });
          }}
          templateId={updateId}
        />
      )}
    </div>
  );
}