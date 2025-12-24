import React, { useState, useEffect } from "react";
import axios from "axios";
import '../index.css';

const textToHtml = (text) => {
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
  return text.replace(/[&<>"']/g, (char) => map[char]).replace(/\n/g, '<br>');
};

const FORM_FIELDS = [
  { name: 'name', label: 'Template Name *', type: 'text', placeholder: 'e.g., Email Verification' },
  { name: 'subject', label: 'Email Subject *', type: 'text', placeholder: 'e.g., Verify your email' },
  { name: 'fromName', label: 'From Name *', type: 'text', placeholder: 'e.g., Company Name' },
  { name: 'fromEmail', label: 'From Email *', type: 'email', placeholder: 'e.g., noreply@company.com' },
  { name: 'replyTo', label: 'Reply-To', type: 'email', placeholder: 'e.g., support@company.com' },
  { name: 'description', label: 'Description', type: 'text', placeholder: 'Template purpose' },
  { name: 'tags', label: 'Tags', type: 'text', placeholder: 'e.g., welcome, verification' }
];

const STYLE = {
  input: { width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #444', backgroundColor: '#3a3a3a', color: 'white' },
  label: { display: 'block', marginBottom: '5px', fontWeight: 'bold', color: 'white', fontSize: '14px' },
  select: { width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #444', backgroundColor: '#3a3a3a', color: 'white' },
  textarea: { width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #444', backgroundColor: '#3a3a3a', color: 'white', resize: 'vertical' },
  modalHeader: { padding: '20px 30px', borderBottom: '1px solid #555', backgroundColor: '#2a2a2a', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  modalCloseBtn: { background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#999', transition: 'color 0.2s' },
  modalContainer: { backgroundColor: 'rgb(73, 73, 73)', borderRadius: '8px', boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)', width: '95vw', maxHeight: '90vh', display: 'flex', animation: 'slideIn 0.3s ease-out', overflow: 'hidden', flexDirection: 'column' },
  backBtn: { padding: '8px 16px', backgroundColor: '#666', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '14px' },
  deleteBtn: { padding: '8px 16px', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '14px' },
  cancelBtn: { flex: 1, padding: '10px', backgroundColor: '#666', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' },
  submitBtn: (isSaving) => ({ flex: 1, padding: '10px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: isSaving ? 'not-allowed' : 'pointer', fontWeight: 'bold', opacity: isSaving ? 0.6 : 1 })
};

const validateTemplateForm = (formData) => {
  if (!formData.name.trim()) return 'Please enter a template name';
  if (!formData.subject.trim()) return 'Please enter an email subject';
  if (!formData.fromName.trim()) return 'Please enter a sender name';
  if (!formData.fromEmail.trim()) return 'Please enter a sender email';
  if (!formData.content.trim()) return 'Please enter email content';
  return null;
};

const formatTags = (tags) => {
  if (Array.isArray(tags)) return tags;
  return tags ? tags.split(',').map(tag => tag.trim()).filter(Boolean) : [];
};

const generateTrackingPixel = (templateId, recipientEmail) => {
  return `<img src="http://localhost:3001/track/open/${templateId}/${encodeURIComponent(recipientEmail)}" width="1" height="1" alt="" style="display:none;" />`;
};

const wrapTrackingLink = (url, templateId, recipientEmail) => {
  return `http://localhost:3001/track/click/${templateId}/${encodeURIComponent(recipientEmail)}?redirect=${encodeURIComponent(url)}`;
};

// Reusable Modal Header Component
function ModalHeader({ title, onClose, rightContent }) {
  return (
    <div style={STYLE.modalHeader}>
      <h2 style={{ margin: 0, fontSize: '22px' }}>{title}</h2>
      {rightContent || (
        <button 
          onClick={onClose} 
          style={STYLE.modalCloseBtn}
          onMouseOver={(e) => e.target.style.color = '#fff'} 
          onMouseOut={(e) => e.target.style.color = '#999'}
        >
          ✕
        </button>
      )}
    </div>
  );
}

export default function EmailBodyEditor() {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [companyInfo, setCompanyInfo] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:3001/email-templates')
      .then(response => {
        setTemplates(response.data || []);
        if (response.data?.length > 0) setPreviewTemplate(response.data[0]);
      })
      .catch(error => console.error('Error loading templates:', error));

    axios.get('http://localhost:3001/company-info')
      .then(response => setCompanyInfo(response.data))
      .catch(error => console.error('Error fetching company info:', error));
  }, []);

  const handleCreateTemplate = async (newTemplate) => {
    const validationError = validateTemplateForm(newTemplate);
    if (validationError) {
      alert(validationError);
      return;
    }

    try {
      const response = await axios.post('http://localhost:3001/email-templates', {
        ...newTemplate,
        replyTo: newTemplate.replyTo || '',
        signature: newTemplate.signature || '',
        layout: newTemplate.layout || 'modern',
        preview: newTemplate.preview || '',
        description: newTemplate.description || '',
        category: newTemplate.category || 'promotional',
        tags: formatTags(newTemplate.tags),
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

// Reusable Email Preview Component
function EmailPreview({ formData, companyInfo }) {
  return (
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
            {(companyInfo?.companyName) || 'Company Name'}
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
              {companyInfo?.socialLinks?.facebook && <a href={companyInfo.socialLinks.facebook} style={{ color: '#0066cc', textDecoration: 'none', marginRight: '10px' }} target="_blank" rel="noopener noreferrer">Facebook</a>}
              {companyInfo?.socialLinks?.twitter && <a href={companyInfo.socialLinks.twitter} style={{ color: '#0066cc', textDecoration: 'none', marginRight: '10px' }} target="_blank" rel="noopener noreferrer">Twitter</a>}
              {companyInfo?.socialLinks?.linkedin && <a href={companyInfo.socialLinks.linkedin} style={{ color: '#0066cc', textDecoration: 'none', marginRight: '10px' }} target="_blank" rel="noopener noreferrer">LinkedIn</a>}
              {companyInfo?.socialLinks?.instagram && <a href={companyInfo.socialLinks.instagram} style={{ color: '#0066cc', textDecoration: 'none', marginRight: '10px' }} target="_blank" rel="noopener noreferrer">Instagram</a>}
              {companyInfo?.socialLinks?.youtube && <a href={companyInfo.socialLinks.youtube} style={{ color: '#0066cc', textDecoration: 'none', marginRight: '10px' }} target="_blank" rel="noopener noreferrer">YouTube</a>}
            </div>
            <div style={{ marginTop: '10px', fontSize: '10px', color: '#999' }}>
              © {new Date().getFullYear()} {companyInfo?.companyName || 'Company'}. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Reusable Template Form Component
function TemplateForm({ formData, handleChange, handleSubmit, isSaving, onCancel, submitLabel = "Create Template", isEditing = false }) {
  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '20px', borderRight: '1px solid #444' }}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {FORM_FIELDS.map(field => (
          <div key={field.name}>
            <label style={STYLE.label}>{field.label}</label>
            <input type={field.type} name={field.name} value={formData[field.name]} onChange={handleChange} placeholder={field.placeholder} style={STYLE.input} required={field.label.includes('*')} />
          </div>
        ))}
        
        <div>
          <label style={STYLE.label}>Category</label>
          <select name="category" value={formData.category} onChange={handleChange} style={STYLE.select}>
            <option value="promotional">Promotional</option>
            <option value="transactional">Transactional</option>
            <option value="newsletter">Newsletter</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label style={STYLE.label}>Email Content (HTML) *</label>
          <textarea name="content" value={formData.content} onChange={handleChange} placeholder="Enter email HTML..." rows="5" style={STYLE.textarea} required />
        </div>

        <div>
          <label style={STYLE.label}>Signature (plain text)</label>
          <textarea name="signature" value={formData.signature} onChange={handleChange} placeholder="e.g., Best regards, Your Name" rows="3" style={STYLE.textarea} />
        </div>

        <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
          <button type="button" onClick={onCancel} style={STYLE.cancelBtn}>Cancel</button>
          <button type="submit" disabled={isSaving} style={STYLE.submitBtn(isSaving)}>{isSaving ? 'Saving...' : submitLabel}</button>
        </div>
      </form>
    </div>
  );
}

// Create Template Modal - Split view with form and live preview
function CreateTemplateModal({ onClose, onCreate, companyInfo }) {
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '', subject: '', fromName: '', fromEmail: companyInfo?.email || '', replyTo: '',
    content: '<h2>Welcome to our service!</h2><p>Click the button below to get started.</p>',
    signature: 'Best regards,\nYour Company Team', category: 'promotional', description: '', tags: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateTemplateForm(formData);
    if (validationError) {
      alert(validationError);
      return;
    }

    setIsSaving(true);
    await onCreate({ ...formData, fromEmail: formData.fromEmail || companyInfo?.email });
    setIsSaving(false);
  };

  return (
    <div className="email-body-editor-modal-overlay">
      <div style={STYLE.modalContainer}>
        <ModalHeader title="Create New Template" onClose={onClose} />
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          <TemplateForm formData={formData} handleChange={handleChange} handleSubmit={handleSubmit} isSaving={isSaving} onCancel={onClose} submitLabel="Create Template" />
          <EmailPreview formData={formData} companyInfo={companyInfo} />
        </div>
      </div>
    </div>
  );
}

// Template Editor - Split view for editing templates
function TemplateEditor({ template, onBack, onDelete, companyInfo }) {
  const [formData, setFormData] = useState({
    name: template.name || '', subject: template.subject || '', fromName: template.fromName || '',
    fromEmail: template.fromEmail || '', replyTo: template.replyTo || '', content: template.content || '',
    signature: template.signature || '', category: template.category || 'promotional',
    description: template.description || '', tags: Array.isArray(template.tags) ? template.tags.join(', ') : template.tags || ''
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const validationError = validateTemplateForm(formData);
    if (validationError) {
      alert(validationError);
      return;
    }

    setIsSaving(true);
    try {
      await axios.put(`http://localhost:3001/email-templates/${template._id}`, {
        ...formData,
        tags: formatTags(formData.tags)
      });
      alert('Template saved successfully!');
      onBack();
    } catch (error) {
      alert('Error saving template: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteTemplate = () => {
    if (confirm(`Delete "${formData.name}"?`)) {
      onDelete(template._id);
      onBack();
    }
  };

  return (
    <div className="email-body-editor-modal-overlay">
      <div style={STYLE.modalContainer}>
        <div style={STYLE.modalHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flex: 1 }}>
            <button onClick={onBack} style={STYLE.backBtn}>← Back</button>
            <h2 style={{ margin: 0, fontSize: '22px' }}>Edit: {formData.name}</h2>
          </div>
          <button onClick={handleDeleteTemplate} style={STYLE.deleteBtn}>🗑️ Delete</button>
        </div>
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          <TemplateForm formData={formData} handleChange={handleChange} handleSubmit={handleSave} isSaving={isSaving} onCancel={onBack} submitLabel="Save Changes" />
          <EmailPreview formData={formData} companyInfo={companyInfo} />
        </div>
      </div>
    </div>
  );
}
