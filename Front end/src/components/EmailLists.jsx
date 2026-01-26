import { useState, useEffect } from "react";
import axios from "axios";
import { Plus, Trash2, Edit, X, Search } from "lucide-react";

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
        <div className="ml-0 h-screen w-screen bg-zinc-950 overflow-x-auto">
            <div className="ml-64 h-screen overflow-y-auto flex flex-col gap-6 px-6 py-8">
                {/* Header */}
                <div>
                    <h1 className="text-4xl font-bold text-white m-0 mb-1">Email Lists</h1>
                    <p className="text-zinc-400 text-sm m-0">Manage and organize your email contacts</p>
                </div>
            
            {/* Add Email Form */}
            <div className="bg-zinc-900 rounded-lg border border-zinc-800 p-6 shadow-xl flex-shrink-0">
                <h3 className="text-lg font-bold text-lime-400 m-0 mb-4 flex items-center gap-2"><Plus className="w-5 h-5" /> Add New Contact</h3>
                <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
                    <input
                        className="bg-zinc-800 border border-zinc-600 text-white px-4 py-2.5 rounded-lg focus:outline-none focus:border-lime-400 transition-colors text-sm"
                        name="email"
                        placeholder="Email *"
                        value={form.email}
                        onChange={handleChange}
                        required
                    />
                    <input
                        className="bg-zinc-800 border border-zinc-600 text-white px-4 py-2.5 rounded-lg focus:outline-none focus:border-lime-400 transition-colors text-sm"
                        name="name"
                        placeholder="Name *"
                        value={form.name}
                        onChange={handleChange}
                        required
                    />
                    <input
                        className="bg-zinc-800 border border-zinc-600 text-white px-4 py-2.5 rounded-lg focus:outline-none focus:border-lime-400 transition-colors text-sm"
                        name="position"
                        placeholder="Position"
                        value={form.position}
                        onChange={handleChange}
                    />
                    <input
                        className="bg-zinc-800 border border-zinc-600 text-white px-4 py-2.5 rounded-lg focus:outline-none focus:border-lime-400 transition-colors text-sm"
                        name="company"
                        placeholder="Company"
                        value={form.company}
                        onChange={handleChange}
                    />
                    <div className="flex gap-2">
                        <button 
                            className="flex-1 bg-lime-500 hover:bg-lime-600 disabled:bg-zinc-600 disabled:cursor-not-allowed text-white font-bold px-4 py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
                            type="submit"
                            disabled={loading}
                        >
                            <Plus className="w-4 h-4" /> {loading ? 'Adding...' : 'Add'}
                        </button>
                        <button
                            className="bg-red-600 hover:bg-red-700 disabled:bg-zinc-600 disabled:cursor-not-allowed text-white font-bold px-4 py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
                            onClick={handleDeleteSelected}
                            disabled={selectedIds.length === 0 || loading}
                            type="button"
                            title="Delete selected emails"
                        >
                            <Trash2 className="w-4 h-4" /> {selectedIds.length}
                        </button>
                    </div>
                </div>
                </form>
            </div>

            {/* Email List Section */}
            <div className="flex-1 flex flex-col min-h-0">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 flex-shrink-0">
                    <h3 className="text-xl font-bold text-white m-0">
                        Email List ({filteredEmails.length}{searchQuery && ` of ${emailList.length}`})
                    </h3>
                    
                    {/* Search Bar */}
                    <div className="flex gap-2 items-center w-full sm:w-auto">
                        <div className="relative flex-1 sm:flex-none">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search emails, names..."
                                className="w-full bg-zinc-800 border border-zinc-600 text-white px-10 py-2.5 rounded-lg focus:outline-none focus:border-lime-400 transition-colors text-sm"
                            />
                        </div>
                        {searchQuery && (
                            <button
                                onClick={clearSearch}
                                className="bg-red-600 hover:bg-red-700 text-white p-2.5 rounded-lg transition-colors"
                                title="Clear search"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>
                
                {/* Scrollable Table Container */}
                <div className="flex-1 overflow-y-auto border border-zinc-700 rounded-lg bg-zinc-900 shadow-xl">
                    {loading && (
                        <div className="text-center py-12 text-zinc-400">
                            <p className="text-base">Loading...</p>
                        </div>
                    )}
                    
                    {/* No Results */}
                    {searchQuery && filteredEmails.length === 0 && !loading && (
                        <div className="text-center py-12 text-zinc-400">
                            <p className="text-base">No emails found matching "{searchQuery}"</p>
                            <button
                                onClick={clearSearch}
                                className="bg-lime-500 hover:bg-lime-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors mt-4"
                            >
                                Clear Search
                            </button>
                        </div>
                    )}
                    
                    {/* Empty State */}
                    {!searchQuery && emailList.length === 0 && !loading && (
                        <div className="text-center py-16 text-zinc-400">
                            <div className="text-6xl mb-4">📧</div>
                            <h3 className="text-2xl font-bold text-white mb-2 m-0">No contacts yet</h3>
                            <p className="text-base m-0">Add your first contact using the form above!</p>
                        </div>
                    )}
                    
                    {/* Email Table */}
                    {filteredEmails.length > 0 && (
                        <table className="w-full border-collapse text-sm">
                            <thead className="bg-zinc-800 border-b border-zinc-700 sticky top-0 z-10">
                                <tr>
                                    <th className="p-3 text-left w-12">
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.length === filteredEmails.length && filteredEmails.length > 0}
                                            onChange={handleSelectAll}
                                            className="cursor-pointer accent-lime-500"
                                        />
                                    </th>
                                    <th className="p-3 text-left text-lime-400 font-bold">Name</th>
                                    <th className="p-3 text-left text-lime-400 font-bold">Email</th>
                                    <th className="p-3 text-left text-lime-400 font-bold">Position</th>
                                    <th className="p-3 text-left text-lime-400 font-bold">Company</th>
                                    <th className="p-3 text-left text-lime-400 font-bold">Date Added</th>
                                    <th className="p-3 text-center text-lime-400 font-bold w-32">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredEmails.map((item, index) => {
                                    const hasEmptyFields = !item.name || !item.email || !item.position || !item.company;
                                    
                                    return (
                                        <tr 
                                            key={item._id}
                                            className={`border-b border-zinc-700 ${editId === item._id ? 'bg-zinc-700' : hasEmptyFields ? 'bg-red-900/30' : index % 2 === 0 ? 'bg-zinc-800' : 'bg-zinc-900'}`}
                                        >
                                            <td className="p-3">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIds.includes(item._id)}
                                                    onChange={() => handleSelect(item._id)}
                                                    className="cursor-pointer accent-lime-500"
                                                />
                                            </td>
                                            {editId === item._id ? (
                                                <>
                                                    <td className="p-2">
                                                        <input
                                                            name="name"
                                                            value={editForm.name}
                                                            onChange={handleEditChange}
                                                            className="w-full bg-zinc-700 border border-zinc-600 text-white px-3 py-1 rounded text-sm focus:outline-none focus:border-lime-400"
                                                        />
                                                    </td>
                                                    <td className="p-2">
                                                        <input
                                                            name="email"
                                                            value={editForm.email}
                                                            onChange={handleEditChange}
                                                            className="w-full bg-zinc-700 border border-zinc-600 text-white px-3 py-1 rounded text-sm focus:outline-none focus:border-lime-400"
                                                        />
                                                    </td>
                                                    <td className="p-2">
                                                        <input
                                                            name="position"
                                                            value={editForm.position}
                                                            onChange={handleEditChange}
                                                            className="w-full bg-zinc-700 border border-zinc-600 text-white px-3 py-1 rounded text-sm focus:outline-none focus:border-lime-400"
                                                        />
                                                    </td>
                                                    <td className="p-2">
                                                        <input
                                                            name="company"
                                                            value={editForm.company}
                                                            onChange={handleEditChange}
                                                            className="w-full bg-zinc-700 border border-zinc-600 text-white px-3 py-1 rounded text-sm focus:outline-none focus:border-lime-400"
                                                        />
                                                    </td>
                                                    <td className="p-3 text-xs text-zinc-400">
                                                        {item.dateAdded ? new Date(item.dateAdded).toLocaleDateString() : 'Unknown'}
                                                    </td>
                                                    <td className="p-2 text-center">
                                                        <div className="flex gap-1 justify-center">
                                                            <button 
                                                                className="bg-lime-500 hover:bg-lime-600 disabled:bg-zinc-600 text-white px-3 py-1 rounded text-xs font-semibold transition-colors"
                                                                onClick={saveEdit}
                                                                disabled={loading}
                                                            >
                                                                Save
                                                            </button>
                                                            <button 
                                                                className="bg-zinc-600 hover:bg-zinc-700 text-white px-3 py-1 rounded text-xs font-semibold transition-colors"
                                                                onClick={cancelEdit}
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    </td>
                                                </>
                                            ) : (
                                                <>
                                                    <td className={`p-3 text-sm ${!item.name ? 'text-red-400 italic' : 'text-zinc-200'}`}>
                                                        {searchQuery && item.name ? (
                                                            <span dangerouslySetInnerHTML={{
                                                                __html: highlightText(item.name, searchQuery)
                                                            }} />
                                                        ) : (
                                                            item.name || '⚠️ No name'
                                                        )}
                                                    </td>
                                                    <td className={`p-3 text-sm ${!item.email ? 'text-red-400 italic' : 'text-zinc-200'}`}>
                                                        {searchQuery && item.email ? (
                                                            <span dangerouslySetInnerHTML={{
                                                                __html: highlightText(item.email, searchQuery)
                                                            }} />
                                                        ) : (
                                                            item.email || '⚠️ No email'
                                                        )}
                                                    </td>
                                                    <td className={`p-3 text-sm ${!item.position ? 'text-red-400 italic' : 'text-zinc-200'}`}>
                                                        {searchQuery && item.position ? (
                                                            <span dangerouslySetInnerHTML={{
                                                                __html: highlightText(item.position, searchQuery)
                                                            }} />
                                                        ) : (
                                                            item.position || '⚠️ No position'
                                                        )}
                                                    </td>
                                                    <td className={`p-3 text-sm ${!item.company ? 'text-red-400 italic' : 'text-zinc-200'}`}>
                                                        {searchQuery && item.company ? (
                                                            <span dangerouslySetInnerHTML={{
                                                                __html: highlightText(item.company, searchQuery)
                                                            }} />
                                                        ) : (
                                                            item.company || '⚠️ No company'
                                                        )}
                                                    </td>
                                                    <td className="p-3 text-xs text-zinc-400">
                                                        {item.dateAdded ? new Date(item.dateAdded).toLocaleDateString() : 'Unknown'}
                                                    </td>
                                                    <td className="p-2 text-center">
                                                        <div className="flex gap-1 justify-center">
                                                            <button
                                                                className={`${hasEmptyFields ? 'bg-orange-500 hover:bg-orange-600' : 'bg-lime-500 hover:bg-lime-600'} text-white px-3 py-1 rounded text-xs font-semibold transition-colors flex items-center gap-1`}
                                                                onClick={() => startEdit(item)}
                                                            >
                                                                <Edit className="w-3 h-3" /> {hasEmptyFields ? 'Fix' : 'Edit'}
                                                            </button>
                                                            <button
                                                                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs font-semibold transition-colors flex items-center gap-1"
                                                                onClick={() => handleDelete(item._id)}
                                                            >
                                                                <Trash2 className="w-3 h-3" />
                                                            </button>
                                                        </div>
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
        </div>
    );
}