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
    <div className="segments-container">
      <h2>Email Segments</h2>

      {/* Button Group */}
      <div className="segments-button-group">
        <button onClick={() => setShow(true)} className="segments-button">
          ➕ Search and Create
        </button>
        <button
          onClick={() => setShowUpdate(true)}
          disabled={selectedSegmentIds.length !== 1}
          className="segments-button segments-button-update"
        >
          ✏️ Update
        </button>
        <button
          onClick={handleRemoveSegments}
          disabled={selectedSegmentIds.length === 0}
          className="segments-button segments-button-remove"
        >
          🗑️ Remove Selected
        </button>
      </div>

      {/* Popover modals */}
      <Segmentsearch open={show} onClose={() => setShow(false)} />
      <Segmentsearchupdate
        open={showupdate}
        onClose={() => setShowUpdate(false)}
        editingSegment={segments.find(seg => seg._id === selectedSegmentIds[0])}
        isEdit={true}
      />

      {/* Table Wrapper */}
      <div className="segments-table-wrapper">

      {/* Table */}
      <table className="segments-table">
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
                <div>
                  {segment.contacts && segment.contacts.length > 0 ? (
                    <ul className="segments-email-list">
                      {segment.contacts.map(email => (
                        <li key={email._id} className="segments-email-item">
                          {email.name} ({email.email})
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className="segments-empty-message">No emails</span>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}

