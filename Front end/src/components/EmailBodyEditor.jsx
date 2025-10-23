import { useState, useEffect } from 'react';
import axios from 'axios';

export default function EmailBodyEditor() {
  const [emailBodies, setEmailBodies] = useState([]);
  const [filteredBodies, setFilteredBodies] = useState([]);
  const [currentName, setCurrentName] = useState('');
  const [currentBody, setCurrentBody] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch all email bodies when component loads
  useEffect(() => {
    fetchEmailBodies();
  }, []);

  // Filter bodies based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredBodies(emailBodies);
    } else {
      const filtered = emailBodies.filter(body => {
        const name = body.Name || 'Untitled';
        const content = body.bodyContent || 'No content';
        return name.toLowerCase().includes(searchQuery.toLowerCase()) ||
               content.toLowerCase().includes(searchQuery.toLowerCase());
      });
      setFilteredBodies(filtered);
    }
  }, [emailBodies, searchQuery]);

  // GET all email bodies
  const fetchEmailBodies = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:3001/email-bodies');
      setEmailBodies(response.data);
      setError('');
    } catch (error) {
      console.error('Error fetching email bodies:', error);
      setError('Failed to load email bodies');
    } finally {
      setLoading(false);
    }
  };

  // CREATE or UPDATE email body
  const saveEmailBody = async () => {
    if (!currentName.trim() || !currentBody.trim()) {
      alert('Please enter both name and content');
      return;
    }

    setLoading(true);
    try {
      if (editingId) {
        // UPDATE existing
        await axios.put(`http://localhost:3001/email-bodies/${editingId}`, {
          Name: currentName.trim(),
          bodyContent: currentBody.trim()
        });
        alert('Email body updated successfully!');
      } else {
        // CREATE new
        await axios.post('http://localhost:3001/email-bodies', {
          Name: currentName.trim(),
          bodyContent: currentBody.trim()
        });
        alert('Email body created successfully!');
      }
      
      // Reset form and refresh list
      setCurrentName('');
      setCurrentBody('');
      setEditingId(null);
      fetchEmailBodies();
    } catch (error) {
      console.error('Error saving email body:', error);
      alert('Failed to save email body');
    } finally {
      setLoading(false);
    }
  };

  // DELETE email body
  const deleteEmailBody = async (id) => {
    if (window.confirm('Are you sure you want to delete this email body?')) {
      setLoading(true);
      try {
        await axios.delete(`http://localhost:3001/email-bodies/${id}`);
        alert('Email body deleted successfully!');
        fetchEmailBodies();
        
        // If we were editing this item, clear the form
        if (editingId === id) {
          setCurrentName('');
          setCurrentBody('');
          setEditingId(null);
        }
      } catch (error) {
        console.error('Error deleting email body:', error);
        alert('Failed to delete email body');
      } finally {
        setLoading(false);
      }
    }
  };

  // EDIT - Load email body into editor
  const editEmailBody = (emailBody) => {
    setCurrentName(emailBody.Name || '');
    setCurrentBody(emailBody.bodyContent || '');
    setEditingId(emailBody._id);
  };

  // Cancel editing
  const cancelEdit = () => {
    setCurrentName('');
    setCurrentBody('');
    setEditingId(null);
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <h1>Email Body Editor</h1>
      
      {/* Error Message */}
      {error && (
        <div style={{
          backgroundColor: '#ffebee',
          color: '#c62828',
          padding: '10px',
          borderRadius: '4px',
          marginBottom: '20px'
        }}>
          {error}
        </div>
      )}

      {/* Editor Section */}
      <div style={{ marginBottom: '30px', flexShrink: 0 }}>
        <h3>{editingId ? 'Edit Email Body' : 'Create New Email Body'}</h3>
        
        {/* Name Input */}
        <input
          type="text"
          value={currentName}
          onChange={(e) => setCurrentName(e.target.value)}
          placeholder="Enter email body name..."
          style={{
            width: '100%',
            padding: '12px',
            border: '2px solid #ddd',
            borderRadius: '4px',
            fontSize: '16px',
            marginBottom: '10px',
            outline: 'none',
            cursor: 'text'
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#4caf50';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#ddd';
          }}
        />
        
        {/* Content Textarea */}
        <textarea
          value={currentBody}
          onChange={(e) => setCurrentBody(e.target.value)}
          placeholder="Write what you want to save into the body"
          style={{
            width: '100%',
            height: '200px',
            backgroundColor: '#2c3e50',
            border: '2px solid #34495e',
            borderRadius: '4px',
            padding: '12px',
            color: '#ecf0f1',
            fontSize: '16px',
            resize: 'vertical',
            marginBottom: '10px',
            fontFamily: 'monospace',
            outline: 'none',
            cursor: 'text',
            caretColor: '#3498db'
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#3498db';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#34495e';
          }}
        />
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={saveEmailBody}
            disabled={loading}
            style={{
              backgroundColor: editingId ? '#ff9800' : '#4caf50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              padding: '10px 20px',
              fontSize: '16px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1
            }}
          >
            {loading ? 'Saving...' : (editingId ? 'Update Body' : 'Save Body')}
          </button>
          
          {editingId && (
            <button
              onClick={cancelEdit}
              style={{
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '10px 20px',
                fontSize: '16px',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Email Bodies List Section */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '20px',
          flexShrink: 0
        }}>
          <h3>Saved Email Bodies ({filteredBodies.length})</h3>
          
          {/* Search Bar */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or content..."
              style={{
                padding: '8px 12px',
                border: '2px solid #ddd',
                borderRadius: '20px',
                fontSize: '14px',
                outline: 'none',
                width: '250px',
                cursor: 'text'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#2196f3';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#ddd';
              }}
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
        
        {/* Scrollable Bodies Container */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          border: '1px solid #e0e0e0',
          borderRadius: '8px',
          padding: '15px',
          backgroundColor: '#fafafa'
        }}>
          {loading && <p style={{ textAlign: 'center', color: '#666' }}>Loading...</p>}
          
          {/* No Results */}
          {searchQuery && filteredBodies.length === 0 && !loading && (
            <div style={{
              textAlign: 'center',
              padding: '40px',
              color: '#666'
            }}>
              <p>No email bodies found matching "{searchQuery}"</p>
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
          {!searchQuery && emailBodies.length === 0 && !loading && (
            <div style={{
              textAlign: 'center',
              padding: '40px',
              color: '#666'
            }}>
              <p>No email bodies created yet.</p>
              <p>Create your first one above!</p>
            </div>
          )}
          
          {/* Bodies List */}
          {filteredBodies.length > 0 && (
            <div style={{ display: 'grid', gap: '15px' }}>
              {filteredBodies.map((emailBody) => {
                // Determine if this body has issues
                const hasEmptyName = !emailBody.Name || emailBody.Name.trim() === '';
                const hasEmptyContent = !emailBody.bodyContent || emailBody.bodyContent.trim() === '';
                const hasIssues = hasEmptyName || hasEmptyContent;
                
                return (
                  <div
                    key={emailBody._id}
                    style={{
                      border: editingId === emailBody._id 
                        ? '2px solid #ff9800' 
                        : hasIssues 
                          ? '2px solid #f44336' 
                          : '1px solid #ddd',
                      borderRadius: '8px',
                      padding: '15px',
                      backgroundColor: editingId === emailBody._id 
                        ? '#fff3e0' 
                        : hasIssues 
                          ? '#ffebee' 
                          : 'white',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        {/* Show warning icon for problematic bodies */}
                        {hasIssues && (
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            backgroundColor: '#ffcdd2',
                            color: '#c62828',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            marginBottom: '8px',
                            fontWeight: 'bold'
                          }}>
                            ⚠️ Issues Found: 
                            {hasEmptyName && <span style={{ marginLeft: '4px' }}>Missing Name</span>}
                            {hasEmptyName && hasEmptyContent && <span>, </span>}
                            {hasEmptyContent && <span style={{ marginLeft: hasEmptyName ? '0' : '4px' }}>Empty Content</span>}
                          </div>
                        )}
                        
                        <h4 style={{ margin: '0 0 10px 0', color: hasEmptyName ? '#f44336' : '#333' }}>
                          {/* Display name with highlighting or fallback */}
                          {searchQuery && emailBody.Name ? (
                            <span dangerouslySetInnerHTML={{
                              __html: emailBody.Name.replace(
                                new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'),
                                '<mark style="background: yellow; padding: 2px 4px; border-radius: 2px;">$1</mark>'
                              )
                            }} />
                          ) : (
                            <span style={{ 
                              fontStyle: hasEmptyName ? 'italic' : 'normal',
                              color: hasEmptyName ? '#f44336' : '#333'
                            }}>
                              {emailBody.Name || '⚠️ [Untitled - No Name]'}
                            </span>
                          )}
                          {editingId === emailBody._id && (
                            <span style={{ color: '#ff9800', fontSize: '14px', marginLeft: '10px' }}>
                              (Editing)
                            </span>
                          )}
                        </h4>
                        
                        <div style={{
                          backgroundColor: hasEmptyContent ? '#ffebee' : '#f8f9fa',
                          padding: '10px',
                          borderRadius: '4px',
                          border: hasEmptyContent ? '1px solid #f44336' : '1px solid #e9ecef',
                          maxHeight: '100px',
                          overflow: 'hidden',
                          position: 'relative'
                        }}>
                          <p style={{ 
                            margin: 0, 
                            color: hasEmptyContent ? '#f44336' : '#555',
                            fontSize: '14px',
                            lineHeight: '1.4',
                            fontStyle: hasEmptyContent ? 'italic' : 'normal'
                          }}>
                            {/* Display content with highlighting or fallback */}
                            {emailBody.bodyContent && emailBody.bodyContent.trim() !== '' ? (
                              searchQuery ? (
                                <span dangerouslySetInnerHTML={{
                                  __html: (emailBody.bodyContent.length > 200 
                                    ? emailBody.bodyContent.substring(0, 200) + '...' 
                                    : emailBody.bodyContent
                                  ).replace(
                                    new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'),
                                    '<mark style="background: yellow; padding: 2px 4px; border-radius: 2px;">$1</mark>'
                                  )
                                }} />
                              ) : (
                                emailBody.bodyContent.length > 200 
                                  ? emailBody.bodyContent.substring(0, 200) + '...' 
                                  : emailBody.bodyContent
                              )
                            ) : (
                              <span style={{ color: '#f44336' }}>
                                ⚠️ [Empty Content - No body text available]
                              </span>
                            )}
                          </p>
                        </div>
                        
                        <small style={{ color: '#666', marginTop: '8px', display: 'block' }}>
                          Created: {emailBody.createdAt ? new Date(emailBody.createdAt).toLocaleDateString() : 'Unknown'}
                          {emailBody.updatedAt && emailBody.createdAt && emailBody.updatedAt !== emailBody.createdAt && (
                            <span> • Updated: {new Date(emailBody.updatedAt).toLocaleDateString()}</span>
                          )}
                          {hasIssues && (
                            <span style={{ color: '#f44336', fontWeight: 'bold', marginLeft: '10px' }}>
                              • Needs Attention
                            </span>
                          )}
                        </small>
                      </div>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginLeft: '15px' }}>
                        <button
                          onClick={() => editEmailBody(emailBody)}
                          style={{
                            backgroundColor: hasIssues ? '#ff9800' : '#2196f3',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '6px 12px',
                            fontSize: '14px',
                            cursor: 'pointer',
                            minWidth: '70px'
                          }}
                        >
                          {hasIssues ? 'Fix' : 'Edit'}
                        </button>
                        
                        <button
                          onClick={() => deleteEmailBody(emailBody._id)}
                          style={{
                            backgroundColor: '#f44336',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '6px 12px',
                            fontSize: '14px',
                            cursor: 'pointer',
                            minWidth: '70px'
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}