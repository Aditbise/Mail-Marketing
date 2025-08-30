import axios from "axios";
import { useEffect, useState } from "react";
import Segmentsearch from "../Models/Segmentsearch";

export default function Segments() {
  const [segments, setSegments] = useState([]);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const fetchSegments = async () => {
      try {
        const response = await axios.get("http://localhost:3001/segments");
        setSegments(response.data);
      } catch (error) {
        console.error("Error fetching segments:", error);
      }
    };
    fetchSegments();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Email Segments</h2>

      {/* Open Modal Button */}
      <button onClick={() => setShow(true)}>Search</button>

      {/* Popover modal */}
      <Segmentsearch open={show} onClose={() => setShow(false)} />

      {/* Table */}
      <table border="1" cellPadding="10" style={{ marginTop: "20px", width: "100%" }}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th>Emails</th>
          </tr>
        </thead>
        <tbody>
          {segments.map((segment) => (
            <tr key={segment._id}>
              <td>{segment.name}</td>
              <td>{segment.description}</td>
              <td>
                <div
                  style={{
                    maxHeight: "120px",
                    overflowY: "auto",
                    minWidth: "180px",
                    border: "1px solid #eee",
                    padding: "4px",
                    background: "#fafafa",
                  }}
                >
                  {segment.emails && segment.emails.length > 0 ? (
                    <ul style={{ margin: 0, paddingLeft: "18px" }}>
                      {segment.emails.map((email, idx) => (
                        <li key={email._id || email}>
                          {email.name ? `${email.name} (${email.email})` : email.email || email}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span style={{ color: "#888" }}>No emails</span>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}