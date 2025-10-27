import { useState, useEffect } from "react";
import axios from "axios";

export default function EmailLists() {
    const [form, setForm] = useState({
        email: "",
        name: "",
        position: "",
        company: ""
    });
    const [emailList, setEmailList] = useState([]);
    const [filteredEmails, setFilteredEmails] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedIds, setSelectedIds] = useState([]);
    const [editId, setEditId] = useState(null);
    const [editForm, setEditForm] = useState({
        email: "",
        name: "",
        position: "",
        company: ""
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchEmailList();
    }, []);

    // Filter emails based on search query
    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredEmails(emailList);
        } else {
            const filtered = emailList.filter(item => {
                const name = item.name || '';
                const email = item.email || '';
                const position = item.position || '';
                const company = item.company || '';
                
                return name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       position.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       company.toLowerCase().includes(searchQuery.toLowerCase());
            });
            setFilteredEmails(filtered);
        }
    }, [emailList, searchQuery]);

    const fetchEmailList = async () => {
        setLoading(true);
        try {
            const res = await axios.get("http://localhost:3001/email-list");
            setEmailList(res.data);
        } catch (err) {
            console.error("Error fetching email list:", err);
        } finally {
            setLoading(false);
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
        setLoading(true);
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
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = (id) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter(_id => _id !== id) : [...prev, id]
        );
    };

    const handleSelectAll = () => {
        if (selectedIds.length === filteredEmails.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredEmails.map(item => item._id));
        }
    };

    const handleDeleteSelected = async () => {
        if (selectedIds.length === 0) return;
        if (!window.confirm("Delete selected emails?")) return;
        setLoading(true);
        try {
            await axios.post("http://localhost:3001/email-list/delete-many", { ids: selectedIds });
            setSelectedIds([]);
            fetchEmailList();
        } catch (err) {
            alert("Error deleting emails: " + (err.response?.data?.error || err.message));
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this email?")) return;
        setLoading(true);
        try {
            await axios.delete(`http://localhost:3001/email-list/${id}`);
            fetchEmailList();
        } catch (err) {
            alert("Error deleting email: " + (err.response?.data?.error || err.message));
        } finally {
            setLoading(false);
        }
    };

    const startEdit = (item) => {
        setEditId(item._id);
        setEditForm({
            email: item.email || '',
            name: item.name || '',
            position: item.position || '',
            company: item.company || ''
        });
    };

    const handleEditChange = (e) => {
        setEditForm({ ...editForm, [e.target.name]: e.target.value });
    };

    const saveEdit = async () => {
        setLoading(true);
        try {
            await axios.put(`http://localhost:3001/email-list/${editId}`, editForm);
            setEditId(null);
            fetchEmailList();
        } catch (err) {
            alert("Error updating email: " + (err.response?.data?.error || err.message));
        } finally {
            setLoading(false);
        }
    };

    const cancelEdit = () => {
        setEditId(null);
    };

    const clearSearch = () => {
        setSearchQuery('');
    };

    // Helper function to highlight search terms
    const highlightText = (text, query) => {
        if (!query || !text) return text;
        
        const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
        return text.replace(regex, '<mark style="background: yellow; padding: 1px 2px; border-radius: 2px;">$1</mark>');
    };

    return (
        <div style={{ 
            padding: '20px', 
            maxWidth: '1400px', 
            margin: '0 auto', 
            height: '100vh', 
            display: 'flex', 
            flexDirection: 'column' 
        }}>
            <h2 style={{ marginBottom: '20px', color: '#333' }}>Email Lists</h2>
            
            {/* Add Email Form */}
            <div style={{ marginBottom: '20px', flexShrink: 0 }}>
                <form style={{ 
                    display: 'flex', 
                    flexWrap: 'wrap', 
                    gap: '10px', 
                    alignItems: 'center',
                    padding: '20px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '8px',
                    border: '1px solid #e0e0e0'
                }} onSubmit={handleSubmit}>
                    <input
                        style={{
                            border: '2px solid #ddd',
                            padding: '8px 12px',
                            borderRadius: '4px',
                            fontSize: '14px',
                            minWidth: '200px',
                            outline: 'none'
                        }}
                        name="email"
                        placeholder="Email"
                        value={form.email}
                        onChange={handleChange}
                        required
                        onFocus={(e) => e.target.style.borderColor = '#4caf50'}
                        onBlur={(e) => e.target.style.borderColor = '#ddd'}
                    />
                    <input
                        style={{
                            border: '2px solid #ddd',
                            padding: '8px 12px',
                            borderRadius: '4px',
                            fontSize: '14px',
                            minWidth: '150px',
                            outline: 'none'
                        }}
                        name="name"
                        placeholder="Name"
                        value={form.name}
                        onChange={handleChange}
                        required
                        onFocus={(e) => e.target.style.borderColor = '#4caf50'}
                        onBlur={(e) => e.target.style.borderColor = '#ddd'}
                    />
                    <input
                        style={{
                            border: '2px solid #ddd',
                            padding: '8px 12px',
                            borderRadius: '4px',
                            fontSize: '14px',
                            minWidth: '150px',
                            outline: 'none'
                        }}
                        name="position"
                        placeholder="Position"
                        value={form.position}
                        onChange={handleChange}
                        onFocus={(e) => e.target.style.borderColor = '#4caf50'}
                        onBlur={(e) => e.target.style.borderColor = '#ddd'}
                    />
                    <input
                        style={{
                            border: '2px solid #ddd',
                            padding: '8px 12px',
                            borderRadius: '4px',
                            fontSize: '14px',
                            minWidth: '150px',
                            outline: 'none'
                        }}
                        name="company"
                        placeholder="Company"
                        value={form.company}
                        onChange={handleChange}
                        onFocus={(e) => e.target.style.borderColor = '#4caf50'}
                        onBlur={(e) => e.target.style.borderColor = '#ddd'}
                    />
                    <button 
                        style={{
                            backgroundColor: '#4caf50',
                            color: 'white',
                            border: 'none',
                            padding: '10px 20px',
                            borderRadius: '4px',
                            fontSize: '14px',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            opacity: loading ? 0.6 : 1
                        }}
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? 'Adding...' : 'Add Email'}
                    </button>
                    <button
                        style={{
                            backgroundColor: '#f44336',
                            color: 'white',
                            border: 'none',
                            padding: '10px 20px',
                            borderRadius: '4px',
                            fontSize: '14px',
                            cursor: selectedIds.length === 0 || loading ? 'not-allowed' : 'pointer',
                            opacity: selectedIds.length === 0 || loading ? 0.6 : 1
                        }}
                        onClick={handleDeleteSelected}
                        disabled={selectedIds.length === 0 || loading}
                        type="button"
                    >
                        Delete Selected ({selectedIds.length})
                    </button>
                </form>
            </div>

            {/* Email List Section */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    marginBottom: '15px',
                    flexShrink: 0
                }}>
                    <h3 style={{ margin: 0 }}>
                        Email List ({filteredEmails.length} 
                        {searchQuery && ` of ${emailList.length}`})
                    </h3>
                    
                    {/* Search Bar */}
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search emails, names, positions, companies..."
                            style={{
                                padding: '8px 12px',
                                border: '2px solid #ddd',
                                borderRadius: '20px',
                                fontSize: '14px',
                                outline: 'none',
                                width: '300px',
                                cursor: 'text'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#2196f3'}
                            onBlur={(e) => e.target.style.borderColor = '#ddd'}
                        />
                        {searchQuery && (
                            <button
                                onClick={clearSearch}
                                style={{
                                    backgroundColor: '#f44336',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '50%',
                                    width: '30px',
                                    height: '30px',
                                    cursor: 'pointer',
                                    fontSize: '16px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                                title="Clear search"
                            >
                                ×
                            </button>
                        )}
                    </div>
                </div>
                
                {/* Scrollable Table Container */}
                <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    border: '1px solid #838383ff',
                    borderRadius: '8px',
                    backgroundColor: '#505050ff'  // Light gray instead of white
                }}>
                    {loading && (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                            <p>Loading...</p>
                        </div>
                    )}
                    
                    {/* No Results */}
                    {searchQuery && filteredEmails.length === 0 && !loading && (
                        <div style={{
                            textAlign: 'center',
                            padding: '40px',
                            color: '#666'
                        }}>
                            <p>No emails found matching "{searchQuery}"</p>
                            <button
                                onClick={clearSearch}
                                style={{
                                    backgroundColor: '#2196f3',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    padding: '8px 16px',
                                    cursor: 'pointer',
                                    marginTop: '10px'
                                }}
                            >
                                Clear Search
                            </button>
                        </div>
                    )}
                    
                    {/* Empty State */}
                    {!searchQuery && emailList.length === 0 && !loading && (
                        <div style={{
                            textAlign: 'center',
                            padding: '60px 20px',
                            color: '#666'
                        }}>
                            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📧</div>
                            <h3 style={{ margin: '0 0 12px 0', color: '#333' }}>No emails in your list yet</h3>
                            <p style={{ margin: 0, fontSize: '16px' }}>
                                Add your first email contact using the form above!
                            </p>
                        </div>
                    )}
                    
                    {/* Email Table */}
                    {filteredEmails.length > 0 && (
                        <table style={{ 
                            width: '100%', 
                            borderCollapse: 'collapse',
                            fontSize: '14px'
                        }}>
                            <thead style={{ 
                                backgroundColor: '#535353ff',  // Darker gray header
                                borderBottom: '2px solid #808080ff',
                                position: 'sticky',
                                top: 0,
                                zIndex: 10
                            }}>
                                <tr>
                                    <th style={{ padding: '12px 8px', textAlign: 'left', width: '50px' }}>
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.length === filteredEmails.length && filteredEmails.length > 0}
                                            onChange={handleSelectAll}
                                            style={{ cursor: 'pointer' }}
                                        />
                                    </th>
                                    <th style={{ padding: '12px 8px', textAlign: 'left' }}>Name</th>
                                    <th style={{ padding: '12px 8px', textAlign: 'left' }}>Email</th>
                                    <th style={{ padding: '12px 8px', textAlign: 'left' }}>Position</th>
                                    <th style={{ padding: '12px 8px', textAlign: 'left' }}>Company</th>
                                    <th style={{ padding: '12px 8px', textAlign: 'left' }}>Date Added</th>
                                    <th style={{ padding: '12px 8px', textAlign: 'center', width: '140px' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredEmails.map((item, index) => {
                                    const hasEmptyFields = !item.name || !item.email || !item.position || !item.company;
                                    
                                    return (
                                        <tr 
                                            key={item._id}
                                            style={{ 
                                                borderBottom: '1px solid #e0e0e0',
                                                backgroundColor: editId === item._id 
                                                    ? '#fff3e0' 
                                                    : hasEmptyFields 
                                                        ? '#ffebee' 
                                                        : index % 2 === 0 ? '#f5f5f5' : '#e8e8e8'  // Alternating grays
                                            }}
                                        >
                                            <td style={{ padding: '12px 8px' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIds.includes(item._id)}
                                                    onChange={() => handleSelect(item._id)}
                                                    style={{ cursor: 'pointer' }}
                                                />
                                            </td>
                                            {editId === item._id ? (
                                                <>
                                                    <td style={{ padding: '8px' }}>
                                                        <input
                                                            name="name"
                                                            value={editForm.name}
                                                            onChange={handleEditChange}
                                                            style={{
                                                                border: '1px solid #ddd',
                                                                padding: '6px 8px',
                                                                borderRadius: '4px',
                                                                width: '100%',
                                                                fontSize: '14px'
                                                            }}
                                                        />
                                                    </td>
                                                    <td style={{ padding: '8px' }}>
                                                        <input
                                                            name="email"
                                                            value={editForm.email}
                                                            onChange={handleEditChange}
                                                            style={{
                                                                border: '1px solid #ddd',
                                                                padding: '6px 8px',
                                                                borderRadius: '4px',
                                                                width: '100%',
                                                                fontSize: '14px'
                                                            }}
                                                        />
                                                    </td>
                                                    <td style={{ padding: '8px' }}>
                                                        <input
                                                            name="position"
                                                            value={editForm.position}
                                                            onChange={handleEditChange}
                                                            style={{
                                                                border: '1px solid #ddd',
                                                                padding: '6px 8px',
                                                                borderRadius: '4px',
                                                                width: '100%',
                                                                fontSize: '14px'
                                                            }}
                                                        />
                                                    </td>
                                                    <td style={{ padding: '8px' }}>
                                                        <input
                                                            name="company"
                                                            value={editForm.company}
                                                            onChange={handleEditChange}
                                                            style={{
                                                                border: '1px solid #ddd',
                                                                padding: '6px 8px',
                                                                borderRadius: '4px',
                                                                width: '100%',
                                                                fontSize: '14px'
                                                            }}
                                                        />
                                                    </td>
                                                    <td style={{ padding: '12px 8px', fontSize: '12px', color: '#666' }}>
                                                        {item.dateAdded ? new Date(item.dateAdded).toLocaleDateString() : 'Unknown'}
                                                    </td>
                                                    <td style={{ padding: '8px', textAlign: 'center' }}>
                                                        <button 
                                                            style={{
                                                                backgroundColor: '#4caf50',
                                                                color: 'white',
                                                                border: 'none',
                                                                padding: '4px 8px',
                                                                borderRadius: '4px',
                                                                fontSize: '12px',
                                                                cursor: 'pointer',
                                                                marginRight: '4px'
                                                            }}
                                                            onClick={saveEdit}
                                                            disabled={loading}
                                                        >
                                                            Save
                                                        </button>
                                                        <button 
                                                            style={{
                                                                backgroundColor: '#6c757d',
                                                                color: 'white',
                                                                border: 'none',
                                                                padding: '4px 8px',
                                                                borderRadius: '4px',
                                                                fontSize: '12px',
                                                                cursor: 'pointer'
                                                            }}
                                                            onClick={cancelEdit}
                                                        >
                                                            Cancel
                                                        </button>
                                                    </td>
                                                </>
                                            ) : (
                                                <>
                                                    <td style={{ 
                                                        padding: '12px 8px',
                                                        color: !item.name ? '#f44336' : '#333',
                                                        fontStyle: !item.name ? 'italic' : 'normal'
                                                    }}>
                                                        {searchQuery && item.name ? (
                                                            <span dangerouslySetInnerHTML={{
                                                                __html: highlightText(item.name, searchQuery)
                                                            }} />
                                                        ) : (
                                                            item.name || '⚠️ No name'
                                                        )}
                                                    </td>
                                                    <td style={{ 
                                                        padding: '12px 8px',
                                                        color: !item.email ? '#f44336' : '#333',
                                                        fontStyle: !item.email ? 'italic' : 'normal'
                                                    }}>
                                                        {searchQuery && item.email ? (
                                                            <span dangerouslySetInnerHTML={{
                                                                __html: highlightText(item.email, searchQuery)
                                                            }} />
                                                        ) : (
                                                            item.email || '⚠️ No email'
                                                        )}
                                                    </td>
                                                    <td style={{ 
                                                        padding: '12px 8px',
                                                        color: !item.position ? '#f44336' : '#333',
                                                        fontStyle: !item.position ? 'italic' : 'normal'
                                                    }}>
                                                        {searchQuery && item.position ? (
                                                            <span dangerouslySetInnerHTML={{
                                                                __html: highlightText(item.position, searchQuery)
                                                            }} />
                                                        ) : (
                                                            item.position || '⚠️ No position'
                                                        )}
                                                    </td>
                                                    <td style={{ 
                                                        padding: '12px 8px',
                                                        color: !item.company ? '#f44336' : '#333',
                                                        fontStyle: !item.company ? 'italic' : 'normal'
                                                    }}>
                                                        {searchQuery && item.company ? (
                                                            <span dangerouslySetInnerHTML={{
                                                                __html: highlightText(item.company, searchQuery)
                                                            }} />
                                                        ) : (
                                                            item.company || '⚠️ No company'
                                                        )}
                                                    </td>
                                                    <td style={{ padding: '12px 8px', fontSize: '12px', color: '#666' }}>
                                                        {item.dateAdded ? new Date(item.dateAdded).toLocaleDateString() : 'Unknown'}
                                                    </td>
                                                    <td style={{ padding: '8px', textAlign: 'center' }}>
                                                        <button
                                                            style={{
                                                                backgroundColor: hasEmptyFields ? '#ff9800' : '#2196f3',
                                                                color: 'white',
                                                                border: 'none',
                                                                padding: '4px 8px',
                                                                borderRadius: '4px',
                                                                fontSize: '12px',
                                                                cursor: 'pointer',
                                                                marginRight: '4px'
                                                            }}
                                                            onClick={() => startEdit(item)}
                                                        >
                                                            {hasEmptyFields ? 'Fix' : 'Edit'}
                                                        </button>
                                                        <button
                                                            style={{
                                                                backgroundColor: '#f44336',
                                                                color: 'white',
                                                                border: 'none',
                                                                padding: '4px 8px',
                                                                borderRadius: '4px',
                                                                fontSize: '12px',
                                                                cursor: 'pointer'
                                                            }}
                                                            onClick={() => handleDelete(item._id)}
                                                        >
                                                            Delete
                                                        </button>
                                                    </td>
                                                </>
                                            )}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}