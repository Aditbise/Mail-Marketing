import { useState } from "react";

function EmailLists() {
  const [emails, setEmails] = useState([]);
  const [newEmail, setNewEmail] = useState("");

  // ✅ Handle form submit
  const handleSubmit = (e) => {
    e.preventDefault(); // prevent page reload

    // Avoid duplicates
    if (emails.includes(newEmail)) {
      alert("This email is already in the list!");
      return;
    }

    setEmails([...emails, newEmail]);
    setNewEmail(""); // clear input after adding
  };

  const removeEmail = (emailToRemove) => {
    setEmails(emails.filter((email) => email !== emailToRemove));
  };

  return (
    <div>
      <h2>Email Lists</h2>

      {/* ✅ Email adding form */}
      <form onSubmit={handleSubmit} style={{ marginBottom: "1rem" }}>
        <input
          type="email"
          required
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
          placeholder="Enter Email Address"
          style={{ width: "400px", height: "30px", marginRight: "10px" }}
        />
        <button type="submit" style={{ color: "#646cff" }}>
          Add Email
        </button>
      </form>

      {/* ✅ Uploaded Excel option */}
      <div style={{ marginBottom: "1rem" }}>
        <label>Upload Excel (optional):</label>
        <input
          type="file"
          accept=".xlsx, .xls"
          style={{ marginLeft: "10px" }}
          onChange={(e) => console.log("TODO: Handle Excel", e.target.files)}
        />
      </div>

      {/* ✅ Display saved emails */}
      {emails.length === 0 ? (
        <p>No emails added yet.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {emails.map((email, index) => (
              <tr key={index}>
                <td>{email}</td>
                <td>
                  <button
                    style={{ color: "red" }}
                    onClick={() => removeEmail(email)}>
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default EmailLists;
