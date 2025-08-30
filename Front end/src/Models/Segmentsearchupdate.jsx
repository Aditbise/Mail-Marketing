import { useState, useEffect } from "react";
import axios from "axios";

export default function Segmentsearchupdate({ open, onClose, editingSegment, isEdit }) {
  const [emailList, setEmailList] = useState([]);
  const [filters, setFilters] = useState({
    name: "",
    email: "",
    position: "",
    company: "",
    date: "",
  });
  const [filteredList, setFilteredList] = useState([]);
  const [searching, setSearching] = useState(false);

  // Segment creation states
  const [segmentName, setSegmentName] = useState("");
  const [segmentDescription, setSegmentDescription] = useState("");
  const [selectedEmailIds, setSelectedEmailIds] = useState([]);
  const [segmentEmails, setSegmentEmails] = useState([]);
  // Preview old segment data before editing
  const oldSegmentData = isEdit && editingSegment ? {
    name: editingSegment.name,
    description: editingSegment.description,
    contacts: editingSegment.contacts || [],
  } : null;

  useEffect(() => {
    fetchEmailList();
  }, []);

  useEffect(() => {
    if (!searching) {
      setFilteredList(emailList);
    }
  }, [emailList, searching]);

  // Load segment data for editing
  useEffect(() => {
    if (isEdit && editingSegment) {
      setSegmentName(editingSegment.name || "");
      setSegmentDescription(editingSegment.description || "");
      // If contacts are populated objects, use their _id; if just IDs, use as is
      setSelectedEmailIds(
        editingSegment.contacts
          ? editingSegment.contacts.map(e => e._id || e)
          : []
      );
      setSegmentEmails(editingSegment.contacts || []);
    } else {
      setSegmentName("");
      setSegmentDescription("");
      setSelectedEmailIds([]);
      setSegmentEmails([]);
    }
  }, [editingSegment, isEdit, open]);

  const fetchEmailList = async () => {
    try {
      const res = await axios.get("http://localhost:3001/email-list");
      setEmailList(res.data);
      setFilteredList(res.data);
    } catch (err) {
      console.error("Error fetching email list:", err);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSearch = () => {
    setSearching(true);
    let list = emailList.filter((item) => {
      const nameMatch = item.name.toLowerCase().includes(filters.name.toLowerCase());
      const emailMatch = item.email.toLowerCase().includes(filters.email.toLowerCase());
      const positionMatch = item.position.toLowerCase().includes(filters.position.toLowerCase());
      const companyMatch = item.company.toLowerCase().includes(filters.company.toLowerCase());
      const dateMatch = filters.date
        ? new Date(item.dateAdded).toLocaleDateString().includes(filters.date)
        : true;

      return (
        nameMatch &&
        emailMatch &&
        positionMatch &&
        companyMatch &&
        dateMatch
      );
    });
    setFilteredList(list);
  };

  const handleClear = () => {
    setFilters({
      name: "",
      email: "",
      position: "",
      company: "",
      date: "",
    });
    setFilteredList(emailList);
    setSearching(false);
  };

  // Selection logic
  const handleEmailSelect = (id) => {
    setSelectedEmailIds((prev) =>
      prev.includes(id) ? prev.filter((eid) => eid !== id) : [...prev, id]
    );
  };

  const handleAddToSegment = () => {
    const selectedEmails = emailList.filter((item) =>
      selectedEmailIds.includes(item._id)
    );
    setSegmentEmails(selectedEmails);
  };

  // Handle segment creation or update
  const handleSaveSegment = async () => {
    if (!segmentName || !segmentDescription || segmentEmails.length === 0) {
      alert("Please provide segment name, description, and select emails.");
      return;
    }
    try {
      if (isEdit && editingSegment) {
        await axios.put(`http://localhost:3001/segments/${editingSegment._id}`, {
          name: segmentName,
          description: segmentDescription,
          contacts: segmentEmails.map((e) => e._id),
        });
        alert("Segment updated!");
      } else {
        await axios.post("http://localhost:3001/segments", {
          name: segmentName,
          description: segmentDescription,
          contacts: segmentEmails.map((e) => e._id),
        });
        alert("Segment created!");
      }
      setSegmentName("");
      setSegmentDescription("");
      setSegmentEmails([]);
      setSelectedEmailIds([]);
      onClose();
    } catch (err) {
      alert("Error saving segment.");
    }
  };

  if (!open) return null;

  return (
    <>
      <div
        style={{
          position: "fixed",
          padding: "10px",
          top: 0,
          left: 0,
          margin: 10,
          width: "100vw",
          height: "100vh",
          backgroundColor: "rgba(0, 0, 0, 0.35)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000,
        }}
      >
        <div
          style={{
            background: "#5f5f5fff",
            borderRadius: "14px",
            padding: "40px 32px 32px 32px",
            width: "98%",
            maxWidth: "700px",
            minHeight: "400px",
            boxShadow: "0 12px 40px rgba(0,0,0,0.22)",
            position: "relative",
            maxHeight: "90vh",
            overflowY: "auto",
          }}
        >
          <button
            onClick={onClose}
            style={{
              position: "absolute",
              top: "14px",
              right: "14px",
              border: "none",
              background: "transparent",
              fontSize: "22px",
              fontWeight: "bold",
              cursor: "pointer",
              color: "#888",
              transition: "color 0.2s",
            }}
            onMouseOver={(e) => (e.target.style.color = "#e74c3c")}
            onMouseOut={(e) => (e.target.style.color = "#888")}
            aria-label="Close"
          >
            ✕
          </button>

          <h2
            style={{
              marginBottom: "18px",
              fontWeight: 600,
              fontSize: "1.3rem",
            }}
          >
            {isEdit ? "Edit Segment" : "Search and Create Segments"}
          </h2>
          {/* Filter/Search Section */}
          <div style={{ display: "flex", gap: "10px", marginBottom: "10px", flexWrap: "wrap" }}>
            <input
              type="text"
              name="name"
              value={filters.name}
              onChange={handleFilterChange}
              placeholder="Name"
              style={{
                flex: "1",
                minWidth: "120px",
                padding: "8px",
                borderRadius: "8px",
                border: "1px solid #bbb",
                fontSize: "1rem",
              }}
            />
            <input
              type="text"
              name="email"
              value={filters.email}
              onChange={handleFilterChange}
              placeholder="Email"
              style={{
                flex: "1",
                minWidth: "120px",
                padding: "8px",
                borderRadius: "8px",
                border: "1px solid #bbb",
                fontSize: "1rem",
              }}
            />
            <input
              type="text"
              name="position"
              value={filters.position}
              onChange={handleFilterChange}
              placeholder="Position"
              style={{
                flex: "1",
                minWidth: "120px",
                padding: "8px",
                borderRadius: "8px",
                border: "1px solid #bbb",
                fontSize: "1rem",
              }}
            />
            <input
              type="text"
              name="company"
              value={filters.company}
              onChange={handleFilterChange}
              placeholder="Company"
              style={{
                flex: "1",
                minWidth: "120px",
                padding: "8px",
                borderRadius: "8px",
                border: "1px solid #bbb",
                fontSize: "1rem",
              }}
            />
            <input
              type="text"
              name="date"
              value={filters.date}
              onChange={handleFilterChange}
              placeholder="Date (YYYY-MM-DD)"
              style={{
                flex: "1",
                minWidth: "120px",
                padding: "8px",
                borderRadius: "8px",
                border: "1px solid #bbb",
                fontSize: "1rem",
              }}
            />
            <button
              onClick={handleSearch}
              style={{
                padding: "8px 18px",
                borderRadius: "8px",
                border: "none",
                background: "#007bff",
                color: "#fff",
                fontWeight: 500,
                fontSize: "1rem",
                cursor: "pointer",
                marginLeft: "10px",
                boxShadow: "0 2px 8px rgba(0,123,255,0.08)",
                transition: "background 0.2s",
              }}
              onMouseOver={e => (e.target.style.background = "#0056b3")}
              onMouseOut={e => (e.target.style.background = "#007bff")}
            >
              Search
            </button>
            <button
              onClick={handleClear}
              style={{
                padding: "8px 18px",
                borderRadius: "8px",
                border: "none",
                background: "#888",
                color: "#fff",
                fontWeight: 500,
                fontSize: "1rem",
                cursor: "pointer",
                marginLeft: "5px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                transition: "background 0.2s",
              }}
              onMouseOver={e => (e.target.style.background = "#555")}
              onMouseOut={e => (e.target.style.background = "#888")}
            >
              Clear
            </button>
          </div>
          {/* Div 2: Segment Name & Description */}
          <div style={{ marginBottom: "18px", padding: "10px 0", borderBottom: "1px solid #ccc" }}>
            <h3 style={{ marginBottom: "8px" }}>Segment Details</h3>
            <input
              type="text"
              value={segmentName}
              onChange={e => setSegmentName(e.target.value)}
              placeholder="Segment Name"
              style={{
                width: "48%",
                padding: "8px",
                borderRadius: "8px",
                border: "1px solid #bbb",
                fontSize: "1rem",
                marginRight: "2%",
                marginBottom: "8px",
              }}
            />
            <input
              type="text"
              value={segmentDescription}
              onChange={e => setSegmentDescription(e.target.value)}
              placeholder="Segment Description"
              style={{
                width: "48%",
                padding: "8px",
                borderRadius: "8px",
                border: "1px solid #bbb",
                fontSize: "1rem",
                marginBottom: "8px",
              }}
            />
          </div>
          {/* Div 3: Selected Emails and Preview */}
          <div style={{ marginBottom: "18px", padding: "10px 0", borderBottom: "1px solid #ccc" }}>
            <h3 style={{ marginBottom: "8px" }}>Assign Emails to Segment</h3>
            <button
              onClick={handleAddToSegment}
              style={{
                padding: "6px 16px",
                borderRadius: "8px",
                border: "none",
                background: "#28a745",
                color: "#fff",
                fontWeight: 500,
                fontSize: "1rem",
                cursor: "pointer",
                marginBottom: "10px",
                boxShadow: "0 2px 8px rgba(40,167,69,0.08)",
                transition: "background 0.2s",
              }}
              onMouseOver={e => (e.target.style.background = "#218838")}
              onMouseOut={e => (e.target.style.background = "#28a745")}
            >
              Add Selected Emails
            </button>
            <div style={{ marginTop: "10px" }}>
              <strong>Selected Emails:</strong>
              {segmentEmails.length === 0 ? (
                <span style={{ marginLeft: "10px", color: "#e74c3c" }}>None</span>
              ) : (
                <ul>
                  {segmentEmails.map(email => (
                    <li key={email._id}>
                      {email.name} ({email.email})
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <button
              onClick={handleSaveSegment}
              style={{
                padding: "8px 18px",
                borderRadius: "8px",
                border: "none",
                background: "#007bff",
                color: "#fff",
                fontWeight: 500,
                fontSize: "1rem",
                cursor: "pointer",
                marginTop: "10px",
                boxShadow: "0 2px 8px rgba(0,123,255,0.08)",
                transition: "background 0.2s",
              }}
              onMouseOver={e => (e.target.style.background = "#0056b3")}
              onMouseOut={e => (e.target.style.background = "#007bff")}
            >
              {isEdit ? "Update Segment" : "Create Segment"}
            </button>
          </div>
          {/* Preview Old Segment Data */}
          {isEdit && oldSegmentData && (
            <div style={{
              marginBottom: "18px",
              padding: "10px",
              background: "#f8f8f8",
              borderRadius: "8px",
              border: "1px solid #ddd"
            }}>
              <h4 style={{ marginBottom: "8px" }}>Old Segment Data</h4>
              <div><strong>Name:</strong> {oldSegmentData.name}</div>
              <div><strong>Description:</strong> {oldSegmentData.description}</div>
              <div>
                <strong>Emails:</strong>
                {oldSegmentData.contacts.length === 0 ? (
                  <span style={{ marginLeft: "10px", color: "#e74c3c" }}>None</span>
                ) : (
                  <ul style={{ margin: 0, paddingLeft: "18px" }}>
                    {oldSegmentData.contacts.map(email => (
                      <li key={email._id} style={{ color: "#222", fontWeight: "500" }}>
                        {email.name} ({email.email})
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
          {/* Email List Table with Selection */}
          <table style={{ width: "100%", marginTop: "10px" }}>
            <thead>
              <tr>
                <th>Select</th>
                <th>Name</th>
                <th>Email</th>
                <th>Position</th>
                <th>Company</th>
                <th>Date Added</th>
              </tr>
            </thead>
            <tbody>
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", fontWeight: "bold", color: "#e74c3c", fontSize: "1.1rem" }}>
                    Not Found
                  </td>
                </tr>
              ) : (
                filteredList.map((item) => (
                  <tr key={item._id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedEmailIds.includes(item._id)}
                        onChange={() => handleEmailSelect(item._id)}
                      />
                    </td>
                    <td>{item.name}</td>
                    <td>{item.email}</td>
                    <td>{item.position}</td>
                    <td>{item.company}</td>
                    <td>{new Date(item.dateAdded).toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}