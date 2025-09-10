import axios from "axios";
import { useEffect, useState } from "react";
import Segmentsearch from "../Models/SegmentSearch";
import Segmentsearchupdate from "../Models/SegmentSearchUpdate";

export default function Segments() {
  const [segments, setSegments] = useState([]);
  const [show, setShow] = useState(false);
  const [showupdate, setShowUpdate] = useState(false);
  const [selectedSegmentIds, setSelectedSegmentIds] = useState([]);

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

  // Remove segment handler
  const handleRemoveSegments = async () => {
    if (selectedSegmentIds.length === 0) return;
    if (!window.confirm("Are you sure you want to delete the selected segments?")) return;
    try {
      await axios.post("http://localhost:3001/segments/delete-many", { ids: selectedSegmentIds });
      setSegments(prev => prev.filter(seg => !selectedSegmentIds.includes(seg._id)));
      setSelectedSegmentIds([]);
    } catch (error) {
      alert("Error deleting segments.");
    }
  };

  // Find the selected segment objects
  const selectedSegments = segments.filter(seg => selectedSegmentIds.includes(seg._id));

  return (
    <div className="returndiv">
      <h2>Email Segments</h2>

      {/* Open Modal Button */}
      <button onClick={() => setShow(true)}>Search and Create</button>
      <button
        onClick={() => setShowUpdate(true)}
        disabled={selectedSegmentIds.length !== 1}
        style={{
          marginLeft: "10px",
          background: selectedSegmentIds.length === 1 ? "#007bff" : "#ccc",
          color: "#fff",
          cursor: selectedSegmentIds.length === 1 ? "pointer" : "not-allowed",
          borderRadius: "6px",
          padding: "6px 16px",
          border: "none",
        }}
      >
        Update
      </button>
      <button
        onClick={handleRemoveSegments}
        disabled={selectedSegmentIds.length === 0}
        style={{
          marginLeft: "10px",
          background: selectedSegmentIds.length > 0 ? "#e74c3c" : "#ccc",
          color: "#fff",
          cursor: selectedSegmentIds.length > 0 ? "pointer" : "not-allowed",
          borderRadius: "6px",
          padding: "6px 16px",
          border: "none",
        }}
      >
        Remove Selected
      </button>

      {/* Popover modals */}
      <Segmentsearch open={show} onClose={() => setShow(false)} />
      <Segmentsearchupdate
        open={showupdate}
        onClose={() => setShowUpdate(false)}
        editingSegment={segments.find(seg => seg._id === selectedSegmentIds[0])}
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
                  type="checkbox"
                  checked={selectedSegmentIds.includes(segment._id)}
                  onChange={() => {
                    setSelectedSegmentIds(prev =>
                      prev.includes(segment._id)
                        ? prev.filter(id => id !== segment._id)
                        : [...prev, segment._id]
                    );
                  }}
                />
              </td>
              <td>{segment.name}</td>
              <td>{segment.description}</td>
              <td>
                <div className="segmentsearch">
                  {segment.contacts && segment.contacts.length > 0 ? (
                    <ul style={{ margin: 0, paddingLeft: "18px" }}>
                      {segment.contacts.map(email => (
                        <li key={email._id} style={{ color: "#7a7a7aff", fontWeight: "500" }}>
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

