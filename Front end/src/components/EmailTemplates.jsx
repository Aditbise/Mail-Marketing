import { useState, useEffect } from "react";
import axios from "axios";
import EmailTemplateAdd from "../Models/EmailTemplateAdd.jsx";
export default function EmailTemplates() {
  const [templates, setTemplates] = useState([]);
  const [show, setShow] = useState(false);

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
  }, [show]);

  return (
    <div className="returndiv">
      <h1>Email Templates</h1>
      <button onClick={() => setShow(true)}>Add Template</button>
      {show && (
        <EmailTemplateAdd open={show} onClose={() => setShow(false)} />
      )}
      <div>
            <h2>Template List</h2>
        </div>
      <div>
        {templates.map((template) => (
          <div key={template._id} style={{ margin: "16px 0", padding: "12px", border: "1px solid #ccc", borderRadius: "8px" }}>
            <h3>Header: {template.header}</h3>
            <p>Body: {template.body}</p>
            <p>Footer: {template.footer}</p>
          </div>
        ))}
      </div>

    </div>
  );
}