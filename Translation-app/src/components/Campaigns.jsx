
import React, { useEffect as fetchingData, useState } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { QuickAddContact } from './Models/CreateContact.jsx';
import CreateCampaigns from "./Models/CreateCampaigns.jsx";

export default function Campaigns() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showquickadd, setCampaignAdd] = useState(false);
  const [selectedContactId, setSelectedContactId] = useState([]);

  const navigate = useNavigate();

  const handleDelete = () => {
  if (selectedContactId.length === 0) {
    console.log("No contacts selected for deletion.");
    return;
  }

  const contactIds = selectedContactId.filter(Boolean);

  contactIds.forEach((id) => {
    fetch("http://localhost:5678/webhook/bbc905f8-da05-43a6-bd77-5c1d35a9cbbd", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "deletecontact",
        id: id
      })
    })
      .then((res) => {
        if (!res.ok) {
          return res.json().then((err) => {
            throw new Error(err.message || res.statusText);
          });
        }
        return res.json();
      })
      .then((data) => {
        console.log(`Contact with ID ${id} deleted successfully.`);
        setContacts((prev) =>
          prev.filter((contact) => contact.id?.toString() !== id)
        );
      })
      .catch((error) => {
        console.error(`Error deleting contact with ID ${id}:`, error);
      });
  });

  setSelectedContactId([]);
};

  fetchingData(() => {
    fetch("http://localhost:5678/webhook/bbc905f8-da05-43a6-bd77-5c1d35a9cbbd", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "getcontact" })
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Fetched contacts:", data);

        const sortedContacts = [...data].sort((a, b) => a.id - b.id);

        const filteredContacts = sortedContacts.filter((contact) => {
          const core = contact?.fields?.core || {};
          const id = contact.id?.toString().trim();
          const firstName = core.firstname?.value?.trim();
          const lastName = core.lastname?.value?.trim();
          const email = core.email?.value?.trim();
          const phone = core.mobile?.value?.trim();

          return id||firstName || lastName || email || phone;
        });

        setContacts(filteredContacts);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching contacts:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <h2>Loading campaign...</h2>;
  // if (contacts.length === 0) return <h2>No valid campaign found</h2>;

  return (
    <div className="contactlistpagediv">
      <div className="contactform">
        <h2>Contacts</h2>

          <button className="newcontactbutton" onClick={() => navigate("/campaigns/create-campaign")}>New Campaign</button>
          <button className="newcontactbutton" onClick={handleDelete} disabled={selectedContactId.length === 0}>Delete</button>

      </div><br />
      <QuickAddContact showQuickAdd={showquickadd} 
      setShowQuickAdd={setCampaignAdd}/>
      <br />
      <table className="table">
        <thead>
          <tr>
            <th>Select</th>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
          </tr>
        </thead>
        <tbody>
          {contacts.map((contact) => {
            const core = contact?.fields?.core || {};
            const id = contact?.id?.toString().trim();
            const firstName = core.firstname?.value?.trim() ?? "";
            const lastName = core.lastname?.value?.trim() ?? "";
            const email = core.email?.value ?? "";
            const phone = core.mobile?.value ?? "";
            
            return (
              <tr key={contact.id}>
                <td>
                  <input
                  type="checkbox"
                  name="contactCheckbox"
                  value={contact.id}
                  onChange={(e) => {
                    const id = e.target.value;
                    setSelectedContactId((prev) =>
                      e.target.checked
                        ? [...prev, id]
                        : prev.filter((selectedId) => selectedId !== id)
                    );
                  }}
                />
                </td>
                <td>{id || "-"}</td>
                <td>
                  <strong>
                    {firstName || lastName ? `${firstName} ${lastName}` : "Unnamed Contact"}
                  </strong>
                </td>
                <td>{email || "-"}</td>
                <td>{phone || "-"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}



