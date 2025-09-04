import { useState, useEffect } from "react";
import axios from "axios";
import './styles.css';

export default function EmailLists() {
    const [form, setForm] = useState({
        email: "",
        name: "",
        position: "",
        company: ""
    });
    const [emailList, setEmailList] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [editId, setEditId] = useState(null);
    const [editForm, setEditForm] = useState({
        email: "",
        name: "",
        position: "",
        company: ""
    });

    useEffect(() => {
        fetchEmailList();
    }, []);

    const fetchEmailList = async () => {
        try {
            const res = await axios.get("http://localhost:3001/email-list");
            setEmailList(res.data);
        } catch (err) {
            console.error("Error fetching email list:", err);
        }
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = {
            ...form,
            dateAdded: new Date()
        };
        try {
            const res = await axios.post("http://localhost:3001/add-email", payload);
            alert(res.data.message || "Email added!");
            setForm({
                email: "",
                name: "",
                position: "",
                company: ""
            });
            fetchEmailList();
        } catch (err) {
            alert("Error adding email: " + (err.response?.data?.error || err.message));
        }
    };

    const handleSelect = (id) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter(_id => _id !== id) : [...prev, id]
        );
    };

    const handleSelectAll = () => {
        if (selectedIds.length === emailList.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(emailList.map(item => item._id));
        }
    };

    const handleDeleteSelected = async () => {
        if (selectedIds.length === 0) return;
        if (!window.confirm("Delete selected emails?")) return;
        try {
            await axios.post("http://localhost:3001/email-list/delete-many", { ids: selectedIds });
            setSelectedIds([]);
            fetchEmailList();
        } catch (err) {
            alert("Error deleting emails: " + (err.response?.data?.error || err.message));
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this email?")) return;
        try {
            await axios.delete(`http://localhost:3001/email-list/${id}`);
            fetchEmailList();
        } catch (err) {
            alert("Error deleting email: " + (err.response?.data?.error || err.message));
        }
    };

    // Edit logic
    const startEdit = (item) => {
        setEditId(item._id);
        setEditForm({
            email: item.email,
            name: item.name,
            position: item.position,
            company: item.company
        });
    };

    const handleEditChange = (e) => {
        setEditForm({ ...editForm, [e.target.name]: e.target.value });
    };

    const saveEdit = async () => {
        try {
            await axios.put(`http://localhost:3001/email-list/${editId}`, editForm);
            setEditId(null);
            fetchEmailList();
        } catch (err) {
            alert("Error updating email: " + (err.response?.data?.error || err.message));
        }
    };

    const cancelEdit = () => {
        setEditId(null);
    };

    return (
        <div className="returndiv">
            <h2>Email Lists</h2>
            <form className="mb-4" onSubmit={handleSubmit}>
                <input
                    className="border px-2 py-1 m-1"
                    name="email"
                    placeholder="Email"
                    value={form.email}
                    onChange={handleChange}
                    required
                />
                <input
                    className="border px-2 py-1 m-1"
                    name="name"
                    placeholder="Name"
                    value={form.name}
                    onChange={handleChange}
                    required
                />
                <input
                    className="border px-2 py-1 m-1"
                    name="position"
                    placeholder="Position"
                    value={form.position}
                    onChange={handleChange}
                />
                <input
                    className="border px-2 py-1 m-1"
                    name="company"
                    placeholder="Company"
                    value={form.company}
                    onChange={handleChange}
                />
                <button className="bg-teal-600 text-white px-4 py-1 rounded" type="submit">
                    Add Email
                </button>
                <button
                    className="bg-red-600 text-white px-4 py-1 rounded mb-2 ml-2"
                    onClick={handleDeleteSelected}
                    disabled={selectedIds.length === 0}
                    type="button"
                >
                    Delete Selected
                </button>
            </form>
            <table className="border border-gray-400 w-full">
                <thead>
                    <tr>
                        <th>
                            <input
                                type="checkbox"
                                checked={selectedIds.length === emailList.length && emailList.length > 0}
                                onChange={handleSelectAll}
                            />
                        </th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Position</th>
                        <th>Company</th>
                        <th>Date Added</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {emailList.map((item) => (
                        <tr key={item._id}>
                            <td>
                                <input
                                    type="checkbox"
                                    checked={selectedIds.includes(item._id)}
                                    onChange={() => handleSelect(item._id)}
                                />
                            </td>
                            {editId === item._id ? (
                                <>
                                    <td>
                                        <input
                                            name="name"
                                            value={editForm.name}
                                            onChange={handleEditChange}
                                            className="border px-2 py-1"
                                        />
                                    </td>
                                    <td>
                                        <input
                                            name="email"
                                            value={editForm.email}
                                            onChange={handleEditChange}
                                            className="border px-2 py-1"
                                        />
                                    </td>
                                    <td>
                                        <input
                                            name="position"
                                            value={editForm.position}
                                            onChange={handleEditChange}
                                            className="border px-2 py-1"
                                        />
                                    </td>
                                    <td>
                                        <input
                                            name="company"
                                            value={editForm.company}
                                            onChange={handleEditChange}
                                            className="border px-2 py-1"
                                        />
                                    </td>
                                    <td>{new Date(item.dateAdded).toLocaleString()}</td>
                                    <td>
                                        <button className="bg-green-600 text-white px-2 py-1 rounded" onClick={saveEdit}>Save</button>
                                        <button className="bg-gray-400 text-white px-2 py-1 rounded ml-2" onClick={cancelEdit}>Cancel</button>
                                    </td>
                                </>
                            ) : (
                                <>
                                    <td>{item.name}</td>
                                    <td>{item.email}</td>
                                    <td>{item.position}</td>
                                    <td>{item.company}</td>
                                    <td>{new Date(item.dateAdded).toLocaleString()}</td>
                                    <td>
                                        <button
                                            className="bg-blue-600 text-white px-2 py-1 rounded mr-2"
                                            onClick={() => startEdit(item)}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className="bg-red-600 text-white px-2 py-1 rounded"
                                            onClick={() => handleDelete(item._id)}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}