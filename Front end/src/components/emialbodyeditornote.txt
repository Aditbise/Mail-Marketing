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
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [keepExistingFiles, setKeepExistingFiles] = useState(false);
  const [expandedBodies, setExpandedBodies] = useState({});

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
      setError('Failed to load email bodies: ' + (error.response?.data?.message || error.message));
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
        const response = await axios.put(`http://localhost:3001/email-bodies/${editingId}`, {
          Name: currentName.trim(),
          bodyContent: currentBody.trim()
        });
        alert('Email body updated successfully!');
      } else {
        // CREATE new
        const response = await axios.post('http://localhost:3001/email-bodies', {
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
      alert('Failed to save email body: ' + (error.response?.data?.message || error.message));
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

  // Handle file selection
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(prevFiles => [...prevFiles, ...files]);
  };

  // Remove selected file
  const removeSelectedFile = (index) => {
    setSelectedFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };

  // Upload files
  const uploadFiles = async () => {
    if (selectedFiles.length === 0) {
      alert('No files selected for upload');
      return;
    }

    setLoading(true);
    setUploadProgress(0);
    try {
      const formData = new FormData();
      selectedFiles.forEach(file => {
        formData.append('files', file);
      });
      
      // If editing, include the email body ID
      if (editingId) {
        formData.append('emailBodyId', editingId);
      }
      
      const response = await axios.post('http://localhost:3001/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const { loaded, total } = progressEvent;
          const percent = Math.floor((loaded * 100) / total);
          setUploadProgress(percent);
        }
      });
      
      alert('Files uploaded successfully!');
      
      // If we just created a new body, refetch all bodies
      if (!editingId) {
        fetchEmailBodies();
      }
      
      // Reset file input
      setSelectedFiles([]);
      setUploadProgress(0);
    } catch (error) {
      console.error('Error uploading files:', error);
      alert('Failed to upload files');
    } finally {
      setLoading(false);
    }
  };

  // DELETE attachment
  const deleteAttachment = async (emailBodyId, attachmentId) => {
    if (window.confirm('Are you sure you want to delete this attachment?')) {
      setLoading(true);
      try {
        await axios.delete(`http://localhost:3001/attachments/${attachmentId}`, {
          data: { emailBodyId }
        });
        alert('Attachment deleted successfully!');
        fetchEmailBodies();
      } catch (error) {
        console.error('Error deleting attachment:', error);
        alert('Failed to delete attachment');
      } finally {
        setLoading(false);
      }
    }
  };

  // Cancel file upload
  const cancelUpload = () => {
    setSelectedFiles([]);
    setUploadProgress(0);
  };

  // Toggle content expansion
  const toggleBodyExpansion = (emailBodyId) => {
    setExpandedBodies(prev => ({
      ...prev,
      [emailBodyId]: !prev[emailBodyId]
    }));
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

      {/* File Upload Section */}
      <div style={{ marginBottom: '10px' }}>
        <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            fontWeight: 'bold',
            color: '#333'
        }}>
            Upload Files:
            <span style={{ 
              fontSize: '12px', 
              fontWeight: 'normal', 
              color: '#666',
              display: 'block',
              marginTop: '2px'
            }}>
              Supported: PDF, Images (JPG, PNG, GIF), Text files, Word docs, Excel files (Max 50MB each)
            </span>
        </label>
        
        <input
            type="file"
            multiple
            accept=".pdf,.jpg,.jpeg,.png,.gif,.webp,.txt,.html,.doc,.docx,.xls,.xlsx"
            onChange={handleFileSelect}
            style={{
                width: '100%',
                padding: '8px',
                border: '2px solid #ddd',
                borderRadius: '4px',
                backgroundColor: 'white',
                cursor: 'pointer'
            }}
        />
        
        {/* Rest of the file upload UI remains the same */}
        {selectedFiles.length > 0 && (
            <div style={{ marginTop: '10px' }}>
                <h5 style={{ margin: '0 0 8px 0', color: '#333' }}>Selected Files:</h5>
                {selectedFiles.map((file, index) => (
                    <div key={index} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '8px',
                        backgroundColor: '#f0f8ff',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        marginBottom: '4px'
                    }}>
                        <span style={{ fontSize: '14px' }}>
                            📎 {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                        <button
                            type="button"
                            onClick={() => removeSelectedFile(index)}
                            style={{
                                backgroundColor: '#f44336',
                                color: 'white',
                                border: 'none',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                fontSize: '12px',
                                cursor: 'pointer'
                            }}
                        >
                            Remove
                        </button>
                    </div>
                ))}
            </div>
        )}
        
        {editingId && (
            <div style={{ marginTop: '10px' }}>
                <label style={{ display: 'flex', alignItems: 'center', fontSize: '14px' }}>
                    <input
                        type="checkbox"
                        checked={keepExistingFiles}
                        onChange={(e) => setKeepExistingFiles(e.target.checked)}
                        style={{ marginRight: '8px' }}
                    />
                    Keep existing files when uploading new ones
                </label>
            </div>
        )}
        
        {uploadProgress > 0 && uploadProgress < 100 && (
            <div style={{ marginTop: '10px' }}>
                <div style={{ 
                    width: '100%', 
                    backgroundColor: '#f0f0f0', 
                    borderRadius: '4px',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        width: `${uploadProgress}%`,
                        backgroundColor: '#4caf50',
                        height: '20px',
                        transition: 'width 0.3s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '12px'
                    }}>
                        {uploadProgress}%
                    </div>
                </div>
            </div>
        )}
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
                        
                        {/* Content and Attachments Display */}
                        <div style={{
                          backgroundColor: hasEmptyContent ? '#ffebee' : '#f8f9fa',
                          padding: '10px',
                          borderRadius: '4px',
                          border: hasEmptyContent ? '1px solid #f44336' : '1px solid #e9ecef',
                          maxHeight: expandedBodies[emailBody._id] ? 'none' : '150px',
                          overflow: expandedBodies[emailBody._id] ? 'visible' : 'auto',
                          position: 'relative'
                        }}>
                          {/* Text Content */}
                          {emailBody.bodyContent && emailBody.bodyContent.trim() !== '' && (
                            <div style={{ marginBottom: emailBody.attachments?.length > 0 ? '10px' : '0' }}>
                              <p style={{ 
                                margin: 0, 
                                color: '#555',
                                fontSize: '14px',
                                lineHeight: '1.4'
                              }}>
                                {(() => {
                                  const isExpanded = expandedBodies[emailBody._id];
                                  const shouldTruncate = emailBody.bodyContent.length > 200;
                                  const displayContent = isExpanded || !shouldTruncate 
                                    ? emailBody.bodyContent 
                                    : emailBody.bodyContent.substring(0, 200) + '...';

                                  if (searchQuery) {
                                    return (
                                      <span dangerouslySetInnerHTML={{
                                        __html: displayContent.replace(
                                          new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'),
                                          '<mark style="background: yellow; padding: 2px 4px; border-radius: 2px;">$1</mark>'
                                        )
                                      }} />
                                    );
                                  } else {
                                    return displayContent;
                                  }
                                })()}
                              </p>
                              
                              {/* Show expand/collapse button if content is long */}
                              {emailBody.bodyContent.length > 200 && (
                                <button
                                  onClick={() => toggleBodyExpansion(emailBody._id)}
                                  style={{
                                    backgroundColor: 'transparent',
                                    border: '1px solid #2196f3',
                                    color: '#2196f3',
                                    padding: '4px 8px',
                                    borderRadius: '4px',
                                    fontSize: '12px',
                                    cursor: 'pointer',
                                    marginTop: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                  }}
                                  onMouseEnter={(e) => {
                                    e.target.style.backgroundColor = '#e3f2fd';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.target.style.backgroundColor = 'transparent';
                                  }}
                                >
                                  {expandedBodies[emailBody._id] ? (
                                    <>
                                      📄 Show Less
                                      <span style={{ fontSize: '10px' }}>▲</span>
                                    </>
                                  ) : (
                                    <>
                                      📄 Show Full Content ({Math.ceil((emailBody.bodyContent.length - 200) / 100)} more lines)
                                      <span style={{ fontSize: '10px' }}>▼</span>
                                    </>
                                  )}
                                </button>
                              )}
                            </div>
                          )}
                          
                          {/* Attachments */}
                          {emailBody.attachments && emailBody.attachments.length > 0 && (
                            <div style={{
                              backgroundColor: 'rgba(33, 150, 243, 0.1)',
                              padding: '8px',
                              borderRadius: '4px',
                              border: '1px solid rgba(33, 150, 243, 0.3)'
                            }}>
                              <div style={{ 
                                fontSize: '12px', 
                                fontWeight: 'bold', 
                                color: '#1976d2',
                                marginBottom: '6px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}>
                                📎 {emailBody.attachments.length} file{emailBody.attachments.length > 1 ? 's' : ''} attached
                              </div>
                              
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                {emailBody.attachments.map((attachment, idx) => {
                                  // Get file icon based on type
                                  const getFileIcon = (mimetype) => {
                                    if (mimetype === 'application/pdf') return '📄';
                                    if (mimetype.startsWith('image/')) return '🖼️';
                                    if (mimetype.includes('word')) return '📝';
                                    if (mimetype.includes('excel') || mimetype.includes('sheet')) return '📊';
                                    return '📎';
                                  };

                                  return (
                                    <div key={idx} style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '4px',
                                      backgroundColor: 'white',
                                      padding: '4px 6px',
                                      borderRadius: '3px',
                                      border: '1px solid #ddd',
                                      fontSize: '11px'
                                    }}>
                                      <span>{getFileIcon(attachment.mimetype)}</span>
                                      <span style={{ 
                                        maxWidth: '100px',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap'
                                      }}>
                                        {attachment.originalName}
                                      </span>
                                      <span style={{ color: '#666' }}>
                                        ({(attachment.size / 1024 / 1024).toFixed(1)}MB)
                                      </span>
                                      
                                      <div style={{ display: 'flex', gap: '2px', marginLeft: '4px' }}>
                                        <a
                                          href={`http://localhost:3001/uploads/email-bodies/${attachment.filename}`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          style={{
                                            color: '#2196f3',
                                            textDecoration: 'none',
                                            fontSize: '10px',
                                            padding: '2px 4px',
                                            backgroundColor: '#e3f2fd',
                                            borderRadius: '2px'
                                          }}
                                          title="View file"
                                        >
                                          View
                                        </a>
                                        <button
                                          onClick={() => deleteAttachment(emailBody._id, attachment._id)}
                                          style={{
                                            backgroundColor: '#ffebee',
                                            border: 'none',
                                            color: '#f44336',
                                            cursor: 'pointer',
                                            fontSize: '10px',
                                            padding: '2px 4px',
                                            borderRadius: '2px'
                                          }}
                                          title="Delete attachment"
                                        >
                                          ×
                                        </button>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                          
                          {/* Empty state */}
                          {(!emailBody.bodyContent || emailBody.bodyContent.trim() === '') && 
                           (!emailBody.attachments || emailBody.attachments.length === 0) && (
                            <span style={{ color: '#f44336', fontStyle: 'italic' }}>
                              ⚠️ [No content or files]
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginLeft: '15px' }}>
                        {/* Preview Button - only show if there's content to preview */}
                        {emailBody.bodyContent && emailBody.bodyContent.trim() !== '' && (
                          <button
                            onClick={() => toggleBodyExpansion(emailBody._id)}
                            style={{
                              backgroundColor: expandedBodies[emailBody._id] ? '#9e9e9e' : '#673ab7',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              padding: '6px 12px',
                              fontSize: '14px',
                              cursor: 'pointer',
                              minWidth: '70px'
                            }}
                            title={expandedBodies[emailBody._id] ? 'Collapse content' : 'Expand full content'}
                          >
                            {expandedBodies[emailBody._id] ? 'Collapse' : 'Preview'}
                          </button>
                        )}
                        
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