import axios from "axios";
import { useEffect, useState } from "react";
import Segmentsearch from "../Models/Segmentsearch";
import Segmentsearchupdate from "../Models/Segmentsearchupdate";

export default function Segments() {
  const [segments, setSegments] = useState([]);
  const [show, setShow] = useState(false);
  const [showupdate, setShowUpdate] = useState(false);
  const [selectedSegmentId, setSelectedSegmentId] = useState(null);

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

  // Find the selected segment object
  const selectedSegment = segments.find(seg => seg._id === selectedSegmentId);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Email Segments</h2>

      {/* Open Modal Button */}
      <button onClick={() => setShow(true)}>Search</button>
      <button
        onClick={() => setShowUpdate(true)}
        disabled={!selectedSegmentId}
        style={{
          marginLeft: "10px",
          background: selectedSegmentId ? "#007bff" : "#ccc",
          color: "#fff",
          cursor: selectedSegmentId ? "pointer" : "not-allowed",
          borderRadius: "6px",
          padding: "6px 16px",
          border: "none",
        }}
      >
        Update
      </button>

      {/* Popover modals */}
      <Segmentsearch open={show} onClose={() => setShow(false)} />
      <Segmentsearchupdate
        open={showupdate}
        onClose={() => setShowUpdate(false)}
        editingSegment={selectedSegment}
        isEdit={true}
      />

      {/* Table */}
      <table border="1" cellPadding="10" style={{ marginTop: "20px", width: "100%" }}>
        <thead>
          <tr>
            <th>Select</th>
            <th>Name</th>
            <th>Description</th>
            <th>Emails</th>
          </tr>
        </thead>
        <tbody>
          {segments.map((segment) => (
            <tr key={segment._id}>
              <td>
                <input
                  type="radio"
                  name="segmentSelect"
                  checked={selectedSegmentId === segment._id}
                  onChange={() => setSelectedSegmentId(segment._id)}
                />
              </td>
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
                  {segment.contacts && segment.contacts.length > 0 ? (
                    <ul style={{ margin: 0, paddingLeft: "18px" }}>
                      {segment.contacts.map(email => (
                        <li key={email._id} style={{ color: "#222", fontWeight: "500" }}>
                          {email.name} ({email.email})
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