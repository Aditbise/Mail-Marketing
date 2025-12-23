import React, { useState, useEffect } from "react";
import axios from "axios";
import '../index.css';

const escapeHtml = (text) => {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
};

const textToHtml = (text) => {
  return escapeHtml(text).replace(/\n/g, '<br>');
};

export default function EmailBodyEditor() {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [companyInfo, setCompanyInfo] = useState(null);

  // Load templates from backend
  useEffect(() => {
    axios.get('http://localhost:3001/email-templates')
      .then(response => {
        setTemplates(response.data || []);
        if (response.data?.length > 0) setPreviewTemplate(response.data[0]);
      })
      .catch(error => console.error('Error loading templates:', error));
  }, []);

  // Fetch company info
  useEffect(() => {
    axios.get('http://localhost:3001/company-info')
      .then(response => {
        console.log('Company Info loaded:', response.data);
        setCompanyInfo(response.data);
      })
      .catch(error => console.error('Error fetching company info:', error));
  }, []);

  const handleCreateTemplate = async (newTemplate) => {
    try {
      const response = await axios.post('http://localhost:3001/email-templates', {
        name: newTemplate.name,
        subject: newTemplate.subject,
        fromName: newTemplate.fromName,
        fromEmail: newTemplate.fromEmail,
        replyTo: newTemplate.replyTo || '',
        content: newTemplate.content,
        signature: newTemplate.signature || '',
        layout: newTemplate.layout || 'modern',
        preview: newTemplate.preview || '',
        heroImage: newTemplate.heroImage || null,
        description: newTemplate.description || '',
        category: newTemplate.category || 'promotional',
        tags: newTemplate.tags ? newTemplate.tags.split(',').map(tag => tag.trim()) : [],
        isDefault: false
      });
      
      setTemplates([...templates, response.data.template]);
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating template:', error);
      alert('Error creating template: ' + error.message);
    }
  };

  const handleDeleteTemplate = (templateId) => {
    if (!templateId) return;

    axios.delete(`http://localhost:3001/email-templates/${templateId}`)
      .then(() => {
        setTemplates(templates.filter(t => t._id !== templateId));
        setSelectedTemplate(null);
        setPreviewTemplate(templates.find(t => t._id !== templateId) || null);
        alert('Template deleted successfully!');
      })
      .catch(error => alert('Error deleting template: ' + error.message));
  };

  if (selectedTemplate) {
    return (
      <TemplateEditor 
        template={selectedTemplate} 
        onBack={() => setSelectedTemplate(null)}
        onDelete={handleDeleteTemplate}
        companyInfo={companyInfo}
      />
    );
  }

  return (
    <div className="email-body-editor-main-container">
      <div className="email-body-editor-templates-layout-wrapper">
        <div className="email-body-editor-templates-list-sidebar">
          <div className="email-body-editor-templates-list-header">
            <h3>Available Templates</h3>
            <button 
              className="email-body-editor-create-template-btn-small"
              onClick={() => setShowCreateModal(true)}
              title="Create New Template"
            >
              +
            </button>
          </div>
          
          <div className="email-body-editor-templates-list-container">
            {templates.map(template => (
              <div
                key={template._id}
                onClick={() => setPreviewTemplate(template)}
                className={`email-body-editor-templates-list-item ${template._id === previewTemplate?._id ? 'active' : ''}`}
              >
                <div className="email-body-editor-templates-list-info">
                  <p className="email-body-editor-templates-list-name">{template.name}</p>
                  <p className="email-body-editor-templates-list-desc">{template.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {previewTemplate && (
          <div className="email-body-editor-templates-preview-container">
            <div className="email-body-editor-templates-preview-card">
              <h2>{previewTemplate.name}</h2>
              <p style={{ margin: '10px 0', color: '#999' }}><strong>Subject:</strong> {previewTemplate.subject}</p>
              <p style={{ margin: '10px 0', color: '#bbb', fontSize: '13px' }}>
                <strong>Description:</strong> {previewTemplate.description ? (previewTemplate.description.length > 80 ? previewTemplate.description.substring(0, 80) + '...' : previewTemplate.description) : 'No description'}
              </p>
              
              <div className="email-body-editor-template-card-actions">
                <button 
                  className="email-body-editor-template-card-button-large"
                  onClick={() => setSelectedTemplate(previewTemplate)}
                >
                  ✏️ Edit Template
                </button>
                <button 
                  className="email-body-editor-template-card-button-large delete"
                  onClick={() => {
                    if (confirm(`Delete "${previewTemplate.name}"?`)) {
                      handleDeleteTemplate(previewTemplate._id);
                    }
                  }}
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="email-body-editor-templates-table-section">
        <h3>All Templates</h3>
        <div className="email-body-editor-templates-table-wrapper">
          <table className="email-body-editor-templates-data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Subject</th>
                <th>From Email</th>
                <th>Category</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {templates.map(template => (
                <tr key={template._id} className="email-body-editor-template-table-row">
                  <td>{template.name}</td>
                  <td>{template.subject}</td>
                  <td>{template.fromEmail}</td>
                  <td>{template.category}</td>
                  <td className="email-body-editor-table-cell-actions">
                    <button 
                      className="email-body-editor-table-action-btn edit-btn"
                      onClick={() => setSelectedTemplate(template)}
                    >
                      ✏️ Edit
                    </button>
                    <button 
                      className="email-body-editor-table-action-btn delete-btn"
                      onClick={() => {
                        if (confirm(`Delete "${template.name}"?`)) {
                          handleDeleteTemplate(template._id);
                        }
                      }}
                    >
                      🗑️ Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showCreateModal && (
        <CreateTemplateModal 
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateTemplate}
          companyInfo={companyInfo}
        />
      )}
    </div>
  );
}

// Create Template Modal - Split view with form and live preview
function CreateTemplateModal({ onClose, onCreate, companyInfo }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    preview: '',
    layout: 'modern',
    subject: '',
    fromName: '',
    fromEmail: '',
    replyTo: '',
    content: '<h2>Welcome to our service!</h2><p>Click the button below to get started.</p>',
    signature: 'Best regards,\nYour Company Team',
    category: 'promotional',
    tags: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return alert('Please enter a template name');
    if (!formData.subject.trim()) return alert('Please enter an email subject');
    if (!formData.fromName.trim()) return alert('Please enter a sender name');
    if (!formData.fromEmail.trim()) return alert('Please enter a sender email');
    if (!formData.content.trim()) return alert('Please enter email content');
    
    onCreate(formData);
  };

  return (
    <div className="email-body-editor-modal-overlay">
      <div style={{ backgroundColor: 'rgb(73, 73, 73)', borderRadius: '8px', boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)', width: '95vw', maxHeight: '90vh', display: 'flex', animation: 'slideIn 0.3s ease-out', overflow: 'hidden', flexDirection: 'column' }}>
        
        <div style={{ padding: '20px 30px', borderBottom: '1px solid #555', backgroundColor: '#2a2a2a', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: '22px' }}>Create New Template</h2>
          <button 
            onClick={onClose}
            style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#999', transition: 'color 0.2s' }}
            onMouseOver={(e) => e.target.style.color = '#fff'}
            onMouseOut={(e) => e.target.style.color = '#999'}
          >
            ✕
          </button>
        </div>

        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px', borderRight: '1px solid #444' }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: 'white', fontSize: '14px' }}>Template Name *</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="e.g., Email Verification" style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #444', backgroundColor: '#3a3a3a', color: 'white' }} required />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: 'white', fontSize: '14px' }}>Email Subject *</label>
                <input type="text" name="subject" value={formData.subject} onChange={handleChange} placeholder="e.g., Verify your email" style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #444', backgroundColor: '#3a3a3a', color: 'white' }} required />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: 'white', fontSize: '14px' }}>From Name *</label>
                <input type="text" name="fromName" value={formData.fromName} onChange={handleChange} placeholder="e.g., Company Name" style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #444', backgroundColor: '#3a3a3a', color: 'white' }} required />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: 'white', fontSize: '14px' }}>From Email *</label>
                <input type="email" name="fromEmail" value={formData.fromEmail} onChange={handleChange} placeholder="e.g., noreply@company.com" style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #444', backgroundColor: '#3a3a3a', color: 'white' }} required />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: 'white', fontSize: '14px' }}>Reply-To</label>
                <input type="email" name="replyTo" value={formData.replyTo} onChange={handleChange} placeholder="e.g., support@company.com" style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #444', backgroundColor: '#3a3a3a', color: 'white' }} />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: 'white', fontSize: '14px' }}>Category</label>
                <select name="category" value={formData.category} onChange={handleChange} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #444', backgroundColor: '#3a3a3a', color: 'white' }}>
                  <option value="promotional">Promotional</option>
                  <option value="transactional">Transactional</option>
                  <option value="newsletter">Newsletter</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: 'white', fontSize: '14px' }}>Description</label>
                <input type="text" name="description" value={formData.description} onChange={handleChange} placeholder="Template purpose" style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #444', backgroundColor: '#3a3a3a', color: 'white' }} />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: 'white', fontSize: '14px' }}>Email Content (HTML) *</label>
                <textarea name="content" value={formData.content} onChange={handleChange} placeholder="Enter email HTML..." rows="5" style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #444', backgroundColor: '#3a3a3a', color: 'white', resize: 'vertical' }} required />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: 'white', fontSize: '14px' }}>Signature (plain text)</label>
                <textarea name="signature" value={formData.signature} onChange={handleChange} placeholder="e.g., Best regards, Your Name" rows="3" style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #444', backgroundColor: '#3a3a3a', color: 'white', resize: 'vertical' }} />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: 'white', fontSize: '14px' }}>Tags</label>
                <input type="text" name="tags" value={formData.tags} onChange={handleChange} placeholder="e.g., welcome, verification" style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #444', backgroundColor: '#3a3a3a', color: 'white' }} />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                <button type="button" onClick={onClose} style={{ flex: 1, padding: '10px', backgroundColor: '#666', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Cancel</button>
                <button type="submit" style={{ flex: 1, padding: '10px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Create Template</button>
              </div>
            </form>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '20px', backgroundColor: '#2a2a2a', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h3 style={{ color: '#90caf9', marginTop: 0, marginBottom: '15px', alignSelf: 'flex-start', fontSize: '14px' }}>📧 Email Preview (600px)</h3>
            
            <div style={{ width: '600px', maxWidth: '100%', backgroundColor: '#ffffff', borderRadius: '6px', border: '1px solid #ddd', boxShadow: '0 2px 12px rgba(0,0,0,0.15)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div style={{ backgroundColor: '#f9f9f9', padding: '20px', textAlign: 'center', borderBottom: '1px solid #e0e0e0' }}>
                {companyInfo?.logo ? (
                  <img src={companyInfo.logo.startsWith('http') ? companyInfo.logo : `http://localhost:3001${companyInfo.logo}`} alt="Company Logo" style={{ maxHeight: '50px', maxWidth: '200px', marginBottom: '10px' }} />
                ) : (
                  <div style={{ fontSize: '24px', marginBottom: '10px' }}>📧 {!companyInfo ? '(No company info)' : '(No logo)'}</div>
                )}
                <p style={{ margin: '5px 0', fontSize: '16px', fontWeight: 'bold', color: '#333' }}>
                  {(companyInfo && companyInfo.companyName) || 'Company Name'}
                </p>
              </div>
              
              <div style={{ backgroundColor: '#f5f5f5', padding: '15px 20px', borderBottom: '1px solid #e0e0e0', fontSize: '12px', color: '#666' }}>
                <div style={{ marginBottom: '8px' }}><strong>From:</strong> {formData.fromName || 'Sender'} &lt;{formData.fromEmail || 'email@example.com'}&gt;</div>
                <div><strong>Subject:</strong> {formData.subject || 'Email Subject'}</div>
              </div>
              
              <div style={{ padding: '30px 20px', flex: 1, overflowY: 'auto', maxHeight: '400px', fontFamily: 'Arial, sans-serif' }}>
                <div style={{ color: '#333', fontSize: '14px', lineHeight: '1.6' }} dangerouslySetInnerHTML={{ __html: formData.content || '<p>Email content will appear here</p>' }} />
              </div>
              
              <div style={{ backgroundColor: '#f0f0f0', padding: '20px', borderTop: '1px solid #e0e0e0', fontSize: '11px', color: '#666', textAlign: 'center' }}>
                {formData.signature && (
                  <div style={{ marginBottom: '15px', paddingBottom: '15px', borderBottom: '1px solid #ddd' }}>
                    <div dangerouslySetInnerHTML={{ __html: textToHtml(formData.signature) }} />
                  </div>
                )}
                
                <div style={{ lineHeight: '1.8' }}>
                  {companyInfo?.website && (
                    <div style={{ marginBottom: '8px' }}>
                      <a href={companyInfo.website.startsWith('http') ? companyInfo.website : (companyInfo.website.startsWith('/') ? `http://localhost:3001${companyInfo.website}` : `https://${companyInfo.website}`)} style={{ color: '#0066cc', textDecoration: 'none' }} target="_blank" rel="noopener noreferrer">{companyInfo.website}</a>
                    </div>
                  )}
                  {companyInfo?.email && (
                    <div style={{ marginBottom: '8px' }}>
                      <a href={`mailto:${companyInfo.email}`} style={{ color: '#0066cc', textDecoration: 'none' }}>{companyInfo.email}</a>
                    </div>
                  )}
                  <div style={{ marginTop: '10px', marginBottom: '10px', fontSize: '12px' }}>
                    {companyInfo?.socialLinks?.facebook && (
                      <a href={companyInfo.socialLinks.facebook} style={{ color: '#0066cc', textDecoration: 'none', marginRight: '10px' }} target="_blank" rel="noopener noreferrer">Facebook</a>
                    )}
                    {companyInfo?.socialLinks?.twitter && (
                      <a href={companyInfo.socialLinks.twitter} style={{ color: '#0066cc', textDecoration: 'none', marginRight: '10px' }} target="_blank" rel="noopener noreferrer">Twitter</a>
                    )}
                    {companyInfo?.socialLinks?.linkedin && (
                      <a href={companyInfo.socialLinks.linkedin} style={{ color: '#0066cc', textDecoration: 'none', marginRight: '10px' }} target="_blank" rel="noopener noreferrer">LinkedIn</a>
                    )}
                    {companyInfo?.socialLinks?.instagram && (
                      <a href={companyInfo.socialLinks.instagram} style={{ color: '#0066cc', textDecoration: 'none', marginRight: '10px' }} target="_blank" rel="noopener noreferrer">Instagram</a>
                    )}
                    {companyInfo?.socialLinks?.youtube && (
                      <a href={companyInfo.socialLinks.youtube} style={{ color: '#0066cc', textDecoration: 'none', marginRight: '10px' }} target="_blank" rel="noopener noreferrer">YouTube</a>
                    )}
                  </div>
                  <div style={{ marginTop: '10px', fontSize: '10px', color: '#999' }}>
                    © {new Date().getFullYear()} {companyInfo?.companyName || 'Company'}. All rights reserved.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Template Editor - Split view for editing templates
function TemplateEditor({ template, onBack, onDelete, companyInfo }) {
  const [formData, setFormData] = useState({
    name: template.name || '',
    description: template.description || '',
    preview: template.preview || '',
    layout: template.layout || 'modern',
    subject: template.subject || '',
    fromName: template.fromName || '',
    fromEmail: template.fromEmail || '',
    replyTo: template.replyTo || '',
    content: template.content || '',
    signature: template.signature || '',
    category: template.category || 'promotional',
    tags: Array.isArray(template.tags) ? template.tags.join(', ') : template.tags || ''
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      await axios.put(`http://localhost:3001/email-templates/${template._id}`, {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim())
      });
      alert('Template saved successfully!');
      onBack();
    } catch (error) {
      alert('Error saving template: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="email-body-editor-modal-overlay">
      <div style={{ backgroundColor: 'rgb(73, 73, 73)', borderRadius: '8px', boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)', width: '95vw', maxHeight: '90vh', display: 'flex', animation: 'slideIn 0.3s ease-out', overflow: 'hidden', flexDirection: 'column' }}>
      
      <div style={{ padding: '20px 30px', borderBottom: '1px solid #555', backgroundColor: '#2a2a2a', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flex: 1 }}>
          <button onClick={onBack} style={{ padding: '8px 16px', backgroundColor: '#666', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '14px' }}>← Back</button>
          <h2 style={{ margin: 0, fontSize: '22px' }}>Edit: {formData.name}</h2>
        </div>
        <button onClick={() => { if (confirm(`Delete "${formData.name}"?`)) { onDelete(template._id); onBack(); } }} style={{ padding: '8px 16px', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '14px' }}>🗑️ Delete</button>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px', borderRight: '1px solid #444' }}>
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: 'white', fontSize: '14px' }}>Template Name *</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #444', backgroundColor: '#3a3a3a', color: 'white' }} required />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: 'white', fontSize: '14px' }}>Email Subject *</label>
              <input type="text" name="subject" value={formData.subject} onChange={handleChange} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #444', backgroundColor: '#3a3a3a', color: 'white' }} required />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: 'white', fontSize: '14px' }}>From Name *</label>
              <input type="text" name="fromName" value={formData.fromName} onChange={handleChange} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #444', backgroundColor: '#3a3a3a', color: 'white' }} required />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: 'white', fontSize: '14px' }}>From Email *</label>
              <input type="email" name="fromEmail" value={formData.fromEmail} onChange={handleChange} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #444', backgroundColor: '#3a3a3a', color: 'white' }} required />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: 'white', fontSize: '14px' }}>Reply-To</label>
              <input type="email" name="replyTo" value={formData.replyTo} onChange={handleChange} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #444', backgroundColor: '#3a3a3a', color: 'white' }} />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: 'white', fontSize: '14px' }}>Category</label>
              <select name="category" value={formData.category} onChange={handleChange} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #444', backgroundColor: '#3a3a3a', color: 'white' }}>
                <option value="promotional">Promotional</option>
                <option value="transactional">Transactional</option>
                <option value="newsletter">Newsletter</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: 'white', fontSize: '14px' }}>Description</label>
              <input type="text" name="description" value={formData.description} onChange={handleChange} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #444', backgroundColor: '#3a3a3a', color: 'white' }} />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: 'white', fontSize: '14px' }}>Email Content (HTML) *</label>
              <textarea name="content" value={formData.content} onChange={handleChange} rows="5" style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #444', backgroundColor: '#3a3a3a', color: 'white', resize: 'vertical' }} required />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: 'white', fontSize: '14px' }}>Signature (plain text)</label>
              <textarea name="signature" value={formData.signature} onChange={handleChange} rows="3" style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #444', backgroundColor: '#3a3a3a', color: 'white', resize: 'vertical' }} />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: 'white', fontSize: '14px' }}>Tags</label>
              <input type="text" name="tags" value={formData.tags} onChange={handleChange} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #444', backgroundColor: '#3a3a3a', color: 'white' }} />
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
              <button type="button" onClick={onBack} style={{ flex: 1, padding: '10px', backgroundColor: '#666', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Cancel</button>
              <button type="submit" disabled={isSaving} style={{ flex: 1, padding: '10px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', opacity: isSaving ? 0.6 : 1 }}>{isSaving ? 'Saving...' : 'Save Changes'}</button>
            </div>
          </form>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '20px', backgroundColor: '#2a2a2a', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h3 style={{ color: '#90caf9', marginTop: 0, marginBottom: '15px', alignSelf: 'flex-start', fontSize: '14px' }}>📧 Email Preview (600px)</h3>
          
          <div style={{ width: '600px', maxWidth: '100%', backgroundColor: '#ffffff', borderRadius: '6px', border: '1px solid #ddd', boxShadow: '0 2px 12px rgba(0,0,0,0.15)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ backgroundColor: '#f9f9f9', padding: '20px', textAlign: 'center', borderBottom: '1px solid #e0e0e0' }}>
              {companyInfo?.logo ? (
                <img src={companyInfo.logo.startsWith('http') ? companyInfo.logo : `http://localhost:3001${companyInfo.logo}`} alt="Company Logo" style={{ maxHeight: '50px', maxWidth: '200px', marginBottom: '10px' }} />
              ) : (
                <div style={{ fontSize: '24px', marginBottom: '10px' }}>📧 {!companyInfo ? '(No company info)' : '(No logo)'}</div>
              )}
              <p style={{ margin: '5px 0', fontSize: '16px', fontWeight: 'bold', color: '#333' }}>
                {(companyInfo && companyInfo.companyName) || 'Company Name'}
              </p>
            </div>
            
            <div style={{ backgroundColor: '#f5f5f5', padding: '15px 20px', borderBottom: '1px solid #e0e0e0', fontSize: '12px', color: '#666' }}>
              <div style={{ marginBottom: '8px' }}><strong>From:</strong> {formData.fromName || 'Sender'} &lt;{formData.fromEmail || 'email@example.com'}&gt;</div>
              <div><strong>Subject:</strong> {formData.subject || 'Email Subject'}</div>
            </div>
            
            <div style={{ padding: '30px 20px', flex: 1, overflowY: 'auto', maxHeight: '400px', fontFamily: 'Arial, sans-serif' }}>
              <div style={{ color: '#333', fontSize: '14px', lineHeight: '1.6' }} dangerouslySetInnerHTML={{ __html: formData.content || '<p>Email content will appear here</p>' }} />
            </div>
            
            <div style={{ backgroundColor: '#f0f0f0', padding: '20px', borderTop: '1px solid #e0e0e0', fontSize: '11px', color: '#666', textAlign: 'center' }}>
              {formData.signature && (
                <div style={{ marginBottom: '15px', paddingBottom: '15px', borderBottom: '1px solid #ddd' }}>
                  <div dangerouslySetInnerHTML={{ __html: textToHtml(formData.signature) }} />
                </div>
              )}
              
              <div style={{ lineHeight: '1.8' }}>
                {companyInfo && companyInfo.website ? (
                  <div style={{ marginBottom: '8px' }}>
                    <a href={companyInfo.website.startsWith('http') ? companyInfo.website : (companyInfo.website.startsWith('/') ? `http://localhost:3001${companyInfo.website}` : `https://${companyInfo.website}`)} style={{ color: '#0066cc', textDecoration: 'none' }} target="_blank" rel="noopener noreferrer">{companyInfo.website}</a>
                  </div>
                ) : null}
                {companyInfo && companyInfo.email ? (
                  <div style={{ marginBottom: '8px' }}>
                    <a href={`mailto:${companyInfo.email}`} style={{ color: '#0066cc', textDecoration: 'none' }}>{companyInfo.email}</a>
                  </div>
                ) : null}
                <div style={{ marginTop: '10px', marginBottom: '10px', fontSize: '12px' }}>
                  {companyInfo?.socialLinks?.facebook && (
                    <a href={companyInfo.socialLinks.facebook} style={{ color: '#0066cc', textDecoration: 'none', marginRight: '10px' }} target="_blank" rel="noopener noreferrer">Facebook</a>
                  )}
                  {companyInfo?.socialLinks?.twitter && (
                    <a href={companyInfo.socialLinks.twitter} style={{ color: '#0066cc', textDecoration: 'none', marginRight: '10px' }} target="_blank" rel="noopener noreferrer">Twitter</a>
                  )}
                  {companyInfo?.socialLinks?.linkedin && (
                    <a href={companyInfo.socialLinks.linkedin} style={{ color: '#0066cc', textDecoration: 'none', marginRight: '10px' }} target="_blank" rel="noopener noreferrer">LinkedIn</a>
                  )}
                  {companyInfo?.socialLinks?.instagram && (
                    <a href={companyInfo.socialLinks.instagram} style={{ color: '#0066cc', textDecoration: 'none', marginRight: '10px' }} target="_blank" rel="noopener noreferrer">Instagram</a>
                  )}
                  {companyInfo?.socialLinks?.youtube && (
                    <a href={companyInfo.socialLinks.youtube} style={{ color: '#0066cc', textDecoration: 'none', marginRight: '10px' }} target="_blank" rel="noopener noreferrer">YouTube</a>
                  )}
                </div>
                <div style={{ marginTop: '10px', fontSize: '10px', color: '#999' }}>
                  © {new Date().getFullYear()} {(companyInfo && companyInfo.companyName) || 'Company'}. All rights reserved.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
