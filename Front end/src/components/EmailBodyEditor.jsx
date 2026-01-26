import React, { useState, useEffect } from "react";
import axios from "axios";
import { Mail, Edit, Trash2, BookOpen, Sparkles, Tag, User } from 'lucide-react';
import '../index.css';

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
    <div className="ml-0 min-h-screen bg-zinc-950 overflow-x-auto">
      <div className="ml-64 px-6 py-8 flex flex-col gap-8 min-h-screen">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-white m-0 mb-1">Email Templates</h1>
          <p className="text-zinc-400 text-sm m-0">Create and manage email templates with live preview</p>
        </div>
        <button 
          className="px-6 py-3 rounded-lg bg-lime-500 hover:bg-lime-600 text-white font-bold text-lg transition-all transform hover:scale-105 shadow-lg flex items-center gap-2"
          onClick={() => setShowCreateModal(true)}
          title="Create New Template"
        >
          <Sparkles className="w-5 h-5" /> New Template
        </button>
      </div>

      {/* Debug Info */}
      <div className="bg-yellow-100 border border-yellow-400 rounded-lg px-4 py-3 text-xs text-yellow-800">
        <strong>Debug - Company Info:</strong> {companyInfo ? (
          <span>
            ✓ Loaded - {companyInfo.companyName} | {companyInfo.email} | Logo: {companyInfo.logo ? '✓' : '✗'}
          </span>
        ) : (
          <span>Loading or not available...</span>
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 flex-1 min-h-0 w-full">
        
        {/* Left Sidebar - Templates List */}
        <div className="col-span-1 bg-zinc-900 rounded-lg border border-zinc-800 p-5 flex flex-col overflow-hidden shadow-xl">
          <div className="flex justify-between items-center mb-5 pb-4 border-b border-zinc-800">
            <h2 className="text-lg font-bold text-white m-0">Templates</h2>
            <span className="text-xs bg-lime-500 text-white px-2 py-1 rounded-full">{templates.length}</span>
          </div>
          
          <div className="flex-1 overflow-y-auto flex flex-col gap-2">
            {templates.length === 0 ? (
              <div className="text-center py-8 text-zinc-500 text-sm">
                <p>No templates yet</p>
                <p className="text-xs">Create your first template</p>
              </div>
            ) : (
              templates.map(template => (
                <div
                  key={template._id}
                  onClick={() => setPreviewTemplate(template)}
                  className={`p-3 rounded-lg cursor-pointer transition-all border-l-4 ${template._id === previewTemplate?._id ? 'bg-lime-500 border-lime-400 text-white' : 'bg-zinc-800 border-transparent hover:bg-zinc-700 text-zinc-200 hover:border-lime-400'}`}
                >
                  <p className="m-0 text-sm font-semibold truncate">{template.name}</p>
                  <p className="m-0 text-xs mt-1 opacity-75 truncate">{template.category}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Center - Preview Card */}
        <div className="col-span-2 bg-zinc-900 rounded-lg border border-zinc-800 p-6 flex flex-col overflow-hidden shadow-xl">
          {previewTemplate ? (
            <>
              <div className="mb-4 pb-4 border-b border-zinc-800">
                <h2 className="text-2xl font-bold text-white m-0">{previewTemplate.name}</h2>
                <p className="text-zinc-400 text-sm mt-1">{previewTemplate.description}</p>
              </div>

              {previewTemplate.preview && (
                <div className="mb-4 p-4 bg-zinc-800 rounded-lg border-l-4 border-lime-500 text-sm text-zinc-200 leading-relaxed flex-1 overflow-y-auto">
                  {previewTemplate.preview}
                </div>
              )}
              
              <div className="flex gap-3 mt-4">
                <button 
                  className="flex-1 px-4 py-3 bg-lime-500 hover:bg-lime-600 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2"
                  onClick={() => setSelectedTemplate(previewTemplate)}
                >
                  <Edit className="w-4 h-4" /> Edit
                </button>
                <button 
                  className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2"
                  onClick={() => {
                    if (confirm(`Delete "${previewTemplate.name}"?`)) {
                      handleDeleteTemplate(previewTemplate._id);
                    }
                  }}
                >
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-center">
              <div>
                <Mail className="w-12 h-12 mx-auto mb-2 text-zinc-400" />
                <p className="text-zinc-400 font-semibold">Select a template to preview</p>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar - Stats / Info */}
        <div className="col-span-1 bg-zinc-900 rounded-lg border border-zinc-800 p-6 flex flex-col gap-4 shadow-xl">
          <div className="bg-gradient-to-br from-lime-500 to-lime-600 rounded-lg p-4 text-white">
            <p className="text-sm opacity-90 m-0">Total Templates</p>
            <p className="text-3xl font-bold m-0">{templates.length}</p>
          </div>

          <div className="bg-zinc-800 rounded-lg p-4">
            <p className="text-sm text-zinc-400 m-0 mb-2">Categories</p>
            <div className="flex flex-wrap gap-2">
              {['promotional', 'transactional', 'newsletter', 'other'].map(cat => {
                const count = templates.filter(t => t.category === cat).length;
                return (
                  <span key={cat} className="text-xs bg-zinc-700 px-2 py-1 rounded text-zinc-200">
                    {cat}: {count}
                  </span>
                );
              })}
            </div>
          </div>

          <div className="bg-zinc-800 rounded-lg p-4 flex-1">
            <p className="text-sm text-zinc-400 m-0 mb-3">Quick Actions</p>
            <button 
              className="w-full py-2 text-sm bg-lime-500 hover:bg-lime-600 text-white font-bold rounded transition-all flex items-center justify-center gap-2"
              onClick={() => setShowCreateModal(true)}
            >
              <Sparkles className="w-4 h-4" /> Create Template
            </button>
          </div>
        </div>
      </div>

      {/* Templates Table - Full Width */}
      <div className="bg-zinc-900 rounded-lg border border-zinc-800 p-6 shadow-xl overflow-hidden w-full">
        <h2 className="text-xl font-bold text-white m-0 mb-4">All Templates</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-zinc-800 sticky top-0">
                <th className="px-4 py-3 text-left text-lime-400 font-bold text-sm">Name</th>
                <th className="px-4 py-3 text-left text-lime-400 font-bold text-sm">Subject</th>
                <th className="px-4 py-3 text-left text-lime-400 font-bold text-sm">From</th>
                <th className="px-4 py-3 text-left text-lime-400 font-bold text-sm">Category</th>
                <th className="px-4 py-3 text-left text-lime-400 font-bold text-sm">Description</th>
                <th className="px-4 py-3 text-center text-lime-400 font-bold text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {templates.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-zinc-500">
                    No templates created yet. Create your first one to get started.
                  </td>
                </tr>
              ) : (
                templates.map(template => (
                  <tr key={template._id} className="border-b border-zinc-800 hover:bg-zinc-800 transition-colors">
                    <td className="px-4 py-3 text-zinc-200 font-semibold">{template.name}</td>
                    <td className="px-4 py-3 text-zinc-300 text-sm">{template.subject}</td>
                    <td className="px-4 py-3 text-zinc-400 text-sm">{template.fromEmail}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs bg-zinc-700 text-zinc-200 px-2 py-1 rounded">{template.category}</span>
                    </td>
                    <td className="px-4 py-3 text-zinc-400 text-sm truncate">{template.description || '-'}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex gap-2 justify-center">
                        <button 
                          className="px-3 py-1.5 bg-lime-500 hover:bg-lime-600 text-white text-xs font-bold rounded transition-all flex items-center gap-1"
                          onClick={() => setSelectedTemplate(template)}
                        >
                          <Edit className="w-3 h-3" />
                        </button>
                        <button 
                          className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded transition-all flex items-center gap-1"
                          onClick={() => {
                            if (confirm(`Delete "${template.name}"?`)) {
                              handleDeleteTemplate(template._id);
                            }
                          }}
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
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
    signature: 'Best regards,<br><strong>Your Company Team</strong>',
    category: 'promotional',
    tags: ''
  });

  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const generateEmailContent = async () => {
    if (!aiPrompt.trim()) {
      setAiError('Please enter a prompt for email generation');
      return;
    }

    setAiLoading(true);
    setAiError('');

    try {
      const response = await axios.post('http://localhost:3001/ai-generate-email', {
        prompt: aiPrompt.trim()
      });

      setFormData(prev => ({
        ...prev,
        subject: response.data.subject,
        content: response.data.content
      }));
      setAiPrompt('');
    } catch (err) {
      setAiError(err.response?.data?.error || 'Failed to generate email. Please try again.');
      console.error('AI Generation Error:', err);
    } finally {
      setAiLoading(false);
    }
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
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-zinc-700 rounded-lg shadow-2xl w-11/12 max-w-6xl max-h-[90vh] flex overflow-hidden flex-col" style={{animation: 'slideIn 0.3s ease-out'}}>
        
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-zinc-600 bg-zinc-900 text-white flex justify-between items-center">
          <h2 className="m-0 text-2xl font-bold">Create New Template</h2>
          <button 
            onClick={onClose}
            className="bg-none border-none text-2xl cursor-pointer text-zinc-400 transition-colors hover:text-lime-400"
          >
            ✕
          </button>
        </div>

        {/* Modal Content - Split Layout */}
        <div className="flex flex-1 overflow-hidden">
          
          {/* Left Side - Form */}
          <div className="flex-1 overflow-y-auto p-6 border-r border-zinc-700">
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              
              {/* Basic Information Section */}
              <div className="border-b border-zinc-700 pb-5">
                <h3 className="text-lg font-bold text-lime-400 m-0 mb-4 flex items-center gap-2"><BookOpen className="w-5 h-5" /> Basic Information</h3>
                
                <div>
                  <label className="block mb-2 font-bold text-white text-sm">Template Name *</label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="e.g., Welcome Email" className="w-full px-3 py-2 rounded-lg border border-zinc-600 bg-zinc-800 text-white focus:border-lime-400 focus:outline-none text-sm" required />
                </div>

                <div className="mt-3">
                  <label className="block mb-2 font-bold text-white text-sm">Description</label>
                  <input type="text" name="description" value={formData.description} onChange={handleChange} placeholder="What is this template for?" className="w-full px-3 py-2 rounded-lg border border-zinc-600 bg-zinc-800 text-white focus:border-lime-400 focus:outline-none text-sm" />
                </div>

                <div className="mt-3">
                  <label className="block mb-2 font-bold text-white text-sm">Category</label>
                  <select name="category" value={formData.category} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border border-zinc-600 bg-zinc-800 text-white focus:border-lime-400 focus:outline-none text-sm">
                    <option value="promotional">Promotional</option>
                    <option value="transactional">Transactional</option>
                    <option value="newsletter">Newsletter</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              {/* Sender Information Section */}
              <div className="border-b border-zinc-700 pb-5">
                <h3 className="text-lg font-bold text-lime-400 m-0 mb-4 flex items-center gap-2"><Mail className="w-5 h-5" /> Sender Information</h3>
                
                <div>
                  <label className="block mb-2 font-bold text-white text-sm">From Name *</label>
                  <input type="text" name="fromName" value={formData.fromName} onChange={handleChange} placeholder="e.g., Support Team" className="w-full px-3 py-2 rounded-lg border border-zinc-600 bg-zinc-800 text-white focus:border-lime-400 focus:outline-none text-sm" required />
                </div>

                <div className="mt-3">
                  <label className="block mb-2 font-bold text-white text-sm">From Email *</label>
                  <input type="email" name="fromEmail" value={formData.fromEmail} onChange={handleChange} placeholder="noreply@company.com" className="w-full px-3 py-2 rounded-lg border border-zinc-600 bg-zinc-800 text-white focus:border-lime-400 focus:outline-none text-sm" required />
                </div>

                <div className="mt-3">
                  <label className="block mb-2 font-bold text-white text-sm">Reply-To Email</label>
                  <input type="email" name="replyTo" value={formData.replyTo} onChange={handleChange} placeholder="support@company.com" className="w-full px-3 py-2 rounded-lg border border-zinc-600 bg-zinc-800 text-white focus:border-lime-400 focus:outline-none text-sm" />
                </div>
              </div>

              {/* Email Content Section */}
              <div className="border-b border-zinc-700 pb-5">
                <h3 className="text-lg font-bold text-lime-400 m-0 mb-4 flex items-center gap-2"><Mail className="w-5 h-5" /> Email Content</h3>
                
                <div>
                  <label className="block mb-2 font-bold text-white text-sm">Subject Line *</label>
                  <input type="text" name="subject" value={formData.subject} onChange={handleChange} placeholder="Email subject" className="w-full px-3 py-2 rounded-lg border border-zinc-600 bg-zinc-800 text-white focus:border-lime-400 focus:outline-none text-sm" required />
                </div>

                <div className="mt-3">
                  <label className="block mb-2 font-bold text-white text-sm">Email Body (HTML) *</label>
                  <textarea name="content" value={formData.content} onChange={handleChange} placeholder="Enter HTML content..." rows="6" className="w-full px-3 py-2 rounded-lg border border-zinc-600 bg-zinc-800 text-white focus:border-lime-400 focus:outline-none text-sm resize-vertical" required />
                  <p className="text-xs text-zinc-400 mt-1">💡 Supports HTML tags for formatting</p>
                </div>

                <div className="mt-3">
                  <label className="block mb-2 font-bold text-white text-sm">Signature</label>
                  <textarea name="signature" value={formData.signature} onChange={handleChange} placeholder="Email signature (HTML supported)" rows="3" className="w-full px-3 py-2 rounded-lg border border-zinc-600 bg-zinc-800 text-white focus:border-lime-400 focus:outline-none text-sm resize-vertical" />
                </div>
              </div>

              {/* AI Generation Section */}
              <div className="bg-gradient-to-br from-zinc-800 to-zinc-900 p-4 rounded-lg border border-zinc-700">
                <h3 className="m-0 mb-3 text-lime-400 text-base font-bold flex items-center gap-2"><Sparkles className="w-5 h-5" /> AI Email Generator</h3>
                
                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="Describe what you want: e.g., 'Write a friendly welcome email with 20% discount'"
                  className="w-full px-3 py-2 rounded-lg border border-zinc-600 bg-zinc-800 text-white focus:border-lime-400 focus:outline-none text-sm min-h-16 resize-vertical"
                />

                {aiError && (
                  <div className="px-3 py-2 bg-red-600 text-white rounded-lg text-xs mt-2">
                    ⚠️ {aiError}
                  </div>
                )}

                <button
                  type="button"
                  onClick={generateEmailContent}
                  disabled={aiLoading}
                  className={`w-full py-2.5 text-white border-none rounded-lg font-bold text-sm transition-all mt-2 flex items-center justify-center gap-2 ${aiLoading ? 'bg-lime-600 opacity-70 cursor-not-allowed' : 'bg-lime-500 hover:bg-lime-600 cursor-pointer'}`}
                >
                  <Sparkles className="w-4 h-4" /> {aiLoading ? 'Generating...' : 'Generate Email'}
                </button>
              </div>

              {/* Tags Section */}
              <div>
                <label className="block mb-2 font-bold text-white text-sm">Tags</label>
                <input type="text" name="tags" value={formData.tags} onChange={handleChange} placeholder="welcome, promotional, new-customer" className="w-full px-3 py-2 rounded-lg border border-zinc-600 bg-zinc-800 text-white focus:border-lime-400 focus:outline-none text-sm" />
                <p className="text-xs text-zinc-400 mt-1">Separate with commas for organization</p>
              </div>

              {/* Form Actions */}
              <div className="flex gap-3 mt-5 pt-5 border-t border-zinc-700">
                <button type="button" onClick={onClose} className="flex-1 py-2.5 bg-zinc-700 hover:bg-zinc-600 text-white border-none rounded-lg cursor-pointer font-bold transition-colors text-sm">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 bg-lime-500 hover:bg-lime-600 text-white border-none rounded-lg cursor-pointer font-bold transition-colors text-sm">Create Template</button>
              </div>
            </form>
          </div>

          {/* Right Side - Live Email Preview */}
          <div className="flex-1 overflow-y-auto p-6 bg-zinc-800 flex flex-col">
            <h3 className="text-lime-400 m-0 mb-4 text-lg font-bold flex items-center gap-2"><Mail className="w-5 h-5" /> Live Preview</h3>
            
            <div className="bg-white rounded-lg border border-zinc-700 shadow-2xl overflow-hidden flex flex-col flex-1 max-h-full">
              
              {/* Email Top Banner */}
              <div className="bg-gradient-to-r from-zinc-100 to-zinc-200 p-5 text-center border-b border-zinc-300">
                {companyInfo?.logo ? (
                  <img src={companyInfo.logo.startsWith('http') ? companyInfo.logo : `http://localhost:3001${companyInfo.logo}`} alt="Company Logo" className="max-h-12 max-w-48 mx-auto mb-2" />
                ) : (
                  <Mail className="w-8 h-8 mx-auto mb-2 text-zinc-400" />
                )}
                <p className="font-bold text-zinc-900 text-sm m-0">
                  {(companyInfo && companyInfo.companyName) || 'Your Company'}
                </p>
              </div>
              
              {/* Email Metadata */}
              <div className="bg-zinc-50 px-5 py-3 border-b border-zinc-200 text-xs text-zinc-700 space-y-1">
                <div><strong>From:</strong> {formData.fromName || 'Sender'} &lt;{formData.fromEmail || 'email@example.com'}&gt;</div>
                <div><strong>Subject:</strong> {formData.subject || '(No subject)'}</div>
              </div>
              
              {/* Email Body */}
              <div className="px-6 py-5 flex-1 overflow-y-auto font-sans">
                <div 
                  className="text-zinc-900 text-sm leading-relaxed prose prose-sm max-w-none" 
                  dangerouslySetInnerHTML={{ __html: formData.content || '<p style="color: #999; text-align: center;">Email content will appear here</p>' }} 
                />
              </div>
              
              {/* Email Footer */}
              <div className="bg-zinc-50 px-6 py-4 border-t border-zinc-200 text-center">
                {formData.signature && (
                  <div className="pb-4 border-b border-zinc-200 mb-4 text-xs text-zinc-700">
                    <div dangerouslySetInnerHTML={{ __html: formData.signature }} />
                  </div>
                )}
                
                {/* Company Links */}
                <div className="space-y-2 text-xs">
                  {companyInfo?.website && (
                    <div>
                      <a href={companyInfo.website} className="text-lime-600 font-semibold no-underline hover:underline">{companyInfo.website}</a>
                    </div>
                  )}
                  {companyInfo?.email && (
                    <div>
                      <a href={`mailto:${companyInfo.email}`} className="text-lime-600 font-semibold no-underline hover:underline">{companyInfo.email}</a>
                    </div>
                  )}
                  {(companyInfo?.socialLinks?.facebook || companyInfo?.socialLinks?.twitter) && (
                    <div className="flex justify-center gap-3 text-lime-600 font-semibold pt-2">
                      {companyInfo?.socialLinks?.facebook && <a href={companyInfo.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="no-underline hover:underline">f</a>}
                      {companyInfo?.socialLinks?.twitter && <a href={companyInfo.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="no-underline hover:underline">𝕏</a>}
                      {companyInfo?.socialLinks?.linkedin && <a href={companyInfo.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="no-underline hover:underline">in</a>}
                    </div>
                  )}
                  <div className="text-zinc-500 text-xs pt-2">© {new Date().getFullYear()} {companyInfo?.companyName || 'Company'}</div>
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
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const generateEmailContent = async () => {
    if (!aiPrompt.trim()) {
      setAiError('Please enter a prompt for email generation');
      return;
    }

    setAiLoading(true);
    setAiError('');

    try {
      const response = await axios.post('http://localhost:3001/ai-generate-email', {
        prompt: aiPrompt.trim()
      });

      setFormData(prev => ({
        ...prev,
        subject: response.data.subject,
        content: response.data.content
      }));
      setAiPrompt('');
    } catch (err) {
      setAiError(err.response?.data?.error || 'Failed to generate email. Please try again.');
      console.error('AI Generation Error:', err);
    } finally {
      setAiLoading(false);
    }
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
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-zinc-700 rounded-lg shadow-2xl w-11/12 max-w-6xl max-h-[90vh] flex overflow-hidden flex-col" style={{animation: 'slideIn 0.3s ease-out'}}>
      
      {/* Modal Header */}
      <div className="px-6 py-5 border-b border-zinc-600 bg-zinc-900 text-white flex justify-between items-center">
        <div className="flex items-center gap-3 flex-1">
          <button onClick={onBack} className="px-4 py-2 bg-zinc-600 hover:bg-zinc-700 text-white border-none rounded cursor-pointer text-sm font-bold transition-colors flex items-center gap-1">← Back</button>
          <h2 className="m-0 text-2xl font-bold truncate">Edit: {formData.name}</h2>
        </div>
        <button onClick={() => { if (confirm(`Delete "${formData.name}"?`)) { onDelete(template._id); onBack(); } }} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white border-none rounded cursor-pointer text-sm font-bold transition-colors flex items-center gap-1"><Trash2 className="w-4 h-4" /> Delete</button>
      </div>

      {/* Modal Content - Split Layout */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Left Side - Form */}
        <div className="flex-1 overflow-y-auto px-6 py-6 border-r border-zinc-700 bg-zinc-800">
          <form onSubmit={handleSave} className="flex flex-col gap-5">
            
            {/* Basic Information Section */}
            <div>
              <h3 className="text-lg font-bold text-lime-400 m-0 mb-4 flex items-center gap-2"><BookOpen className="w-5 h-5" /> Basic Information</h3>
              <div className="space-y-4 pb-4 border-b border-zinc-700">
                <div>
                  <label className="block mb-2 font-bold text-white text-sm">Template Name *</label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border border-zinc-600 bg-zinc-700 text-white focus:border-lime-400 focus:outline-none transition-colors" required />
                </div>
                <div>
                  <label className="block mb-2 font-bold text-white text-sm">Description</label>
                  <input type="text" name="description" value={formData.description} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border border-zinc-600 bg-zinc-700 text-white focus:border-lime-400 focus:outline-none transition-colors" placeholder="Optional: Describe this template's purpose" />
                </div>
                <div>
                  <label className="block mb-2 font-bold text-white text-sm">Category</label>
                  <select name="category" value={formData.category} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border border-zinc-600 bg-zinc-700 text-white focus:border-lime-400 focus:outline-none transition-colors">
                    <option value="promotional">Promotional</option>
                    <option value="transactional">Transactional</option>
                    <option value="newsletter">Newsletter</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Sender Information Section */}
            <div>
              <h3 className="text-lg font-bold text-lime-400 m-0 mb-4 flex items-center gap-2"><User className="w-5 h-5" /> Sender Information</h3>
              <div className="space-y-4 pb-4 border-b border-zinc-700">
                <div>
                  <label className="block mb-2 font-bold text-white text-sm">From Name *</label>
                  <input type="text" name="fromName" value={formData.fromName} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border border-zinc-600 bg-zinc-700 text-white focus:border-lime-400 focus:outline-none transition-colors" required />
                </div>
                <div>
                  <label className="block mb-2 font-bold text-white text-sm">From Email *</label>
                  <input type="email" name="fromEmail" value={formData.fromEmail} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border border-zinc-600 bg-zinc-700 text-white focus:border-lime-400 focus:outline-none transition-colors" required />
                </div>
                <div>
                  <label className="block mb-2 font-bold text-white text-sm">Reply-To</label>
                  <input type="email" name="replyTo" value={formData.replyTo} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border border-zinc-600 bg-zinc-700 text-white focus:border-lime-400 focus:outline-none transition-colors" placeholder="Optional: Where should replies go?" />
                </div>
              </div>
            </div>

            {/* Email Content Section */}
            <div>
              <h3 className="text-lg font-bold text-lime-400 m-0 mb-4 flex items-center gap-2"><Mail className="w-5 h-5" /> Email Content</h3>
              <div className="space-y-4 pb-4 border-b border-zinc-700">
                <div>
                  <label className="block mb-2 font-bold text-white text-sm">Email Subject *</label>
                  <input type="text" name="subject" value={formData.subject} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border border-zinc-600 bg-zinc-700 text-white focus:border-lime-400 focus:outline-none transition-colors" required />
                </div>
                <div>
                  <label className="block mb-2 font-bold text-white text-sm">Email Body (HTML) *</label>
                  <textarea name="content" value={formData.content} onChange={handleChange} rows="6" className="w-full px-3 py-2 rounded-lg border border-zinc-600 bg-zinc-700 text-white focus:border-lime-400 focus:outline-none resize-vertical transition-colors text-xs" required />
                </div>
                <div>
                  <label className="block mb-2 font-bold text-white text-sm">Signature</label>
                  <textarea name="signature" value={formData.signature} onChange={handleChange} rows="3" className="w-full px-3 py-2 rounded-lg border border-zinc-600 bg-zinc-700 text-white focus:border-lime-400 focus:outline-none resize-vertical transition-colors text-xs" placeholder="Optional: Add your email signature" />
                </div>
              </div>
            </div>

            {/* AI Email Generator Section */}
            <div>
              <h3 className="text-lg font-bold text-lime-400 m-0 mb-4 flex items-center gap-2"><Sparkles className="w-5 h-5" /> AI Email Generator</h3>
              <div className="space-y-4 pb-4 border-b border-zinc-700">
                <div>
                  <label className="block mb-2 font-bold text-white text-sm">Enter Prompt</label>
                  <textarea
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="e.g., Write a friendly welcome email for new customers. Include a discount code and encourage them to explore products."
                    className="w-full px-3 py-2 rounded-lg border border-zinc-600 bg-zinc-700 text-white focus:border-lime-400 focus:outline-none min-h-24 resize-vertical transition-colors text-xs"
                  />
                </div>
                {aiError && (
                  <div className="px-3 py-2 bg-red-600 text-white rounded-lg text-xs">
                    ⚠️ {aiError}
                  </div>
                )}
                <button
                  type="button"
                  onClick={generateEmailContent}
                  disabled={aiLoading}
                  className={`w-full py-2.5 text-white border-none rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 ${aiLoading ? 'bg-lime-600 opacity-70 cursor-not-allowed' : 'bg-lime-500 hover:bg-lime-600 cursor-pointer'}`}
                >
                  <Sparkles className="w-4 h-4" /> {aiLoading ? 'Generating...' : 'Generate Email'}
                </button>
              </div>
            </div>

            {/* Tags Section */}
            <div>
              <h3 className="text-lg font-bold text-lime-400 m-0 mb-4 flex items-center gap-2"><Tag className="w-5 h-5" /> Tags</h3>
              <div className="space-y-4">
                <div>
                  <label className="block mb-2 font-bold text-white text-sm">Tags (comma-separated)</label>
                  <input type="text" name="tags" value={formData.tags} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border border-zinc-600 bg-zinc-700 text-white focus:border-lime-400 focus:outline-none transition-colors" placeholder="e.g., welcome, onboarding, promotion" />
                  <p className="text-xs text-zinc-400 mt-1">Optional: Add tags to organize and categorize your templates</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6 pt-4 border-t border-zinc-700">
              <button type="button" onClick={onBack} className="flex-1 py-2.5 bg-zinc-600 hover:bg-zinc-700 text-white border-none rounded-lg cursor-pointer font-bold transition-colors flex items-center justify-center gap-1">← Back</button>
              <button type="submit" disabled={isSaving} className={`flex-1 py-2.5 bg-lime-500 hover:bg-lime-600 text-white border-none rounded-lg cursor-pointer font-bold transition-colors flex items-center justify-center gap-1 ${isSaving ? 'opacity-60' : ''}`}>{isSaving ? 'Saving...' : 'Save Changes'}</button>
            </div>
          </form>
        </div>

        {/* Right Side - Live Email Preview */}
        <div className="flex-1 overflow-y-auto px-6 py-6 bg-zinc-900 flex flex-col items-center">
          <h3 className="text-lime-400 m-0 mb-4 self-start text-lg font-bold flex items-center gap-2"><Mail className="w-5 h-5" /> Email Preview</h3>
          
          <div className="w-full max-w-md bg-white rounded-lg border border-zinc-300 shadow-xl overflow-hidden flex flex-col flex-1 max-h-full">
            
            {/* Email Top Banner with Logo */}
            <div className="bg-gradient-to-br from-zinc-100 to-zinc-200 p-6 text-center border-b border-zinc-200">
              {companyInfo?.logo ? (
                <img src={companyInfo.logo.startsWith('http') ? companyInfo.logo : `http://localhost:3001${companyInfo.logo}`} alt="Company Logo" className="max-h-16 max-w-56 mx-auto mb-3" />
              ) : (
                <Mail className="w-10 h-10 mx-auto mb-3 text-zinc-400" />
              )}
              <p className="m-0 text-lg font-bold text-zinc-900">
                {(companyInfo && companyInfo.companyName) || 'Company Name'}
              </p>
            </div>
            
            {/* Email Header */}
            <div className="bg-zinc-50 px-6 py-4 border-b border-zinc-200 text-xs text-zinc-600 space-y-2">
              <div><strong>From:</strong> {formData.fromName || 'Sender'} &lt;{formData.fromEmail || 'email@example.com'}&gt;</div>
              <div><strong>Subject:</strong> {formData.subject || 'Email Subject'}</div>
            </div>
            
            {/* Email Body */}
            <div className="px-6 py-5 flex-1 overflow-y-auto font-sans">
              <div className="text-zinc-900 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: formData.content || '<p>Email content will appear here</p>' }} />
            </div>
            
            {/* Email Footer */}
            <div className="bg-zinc-50 px-6 py-6 border-t border-zinc-200 text-xs text-zinc-600 text-center space-y-4">
              {formData.signature && (
                <div className="pb-4 border-b border-zinc-300">
                  <div dangerouslySetInnerHTML={{ __html: formData.signature }} />
                </div>
              )}
              
              {/* Company Info Links */}
              <div className="space-y-2">
                {companyInfo && companyInfo.website ? (
                  <div>
                    <a href={companyInfo.website.startsWith('http') ? companyInfo.website : (companyInfo.website.startsWith('/') ? `http://localhost:3001${companyInfo.website}` : `https://${companyInfo.website}`)} className="text-lime-600 no-underline hover:underline" target="_blank" rel="noopener noreferrer">{companyInfo.website}</a>
                  </div>
                ) : null}
                {companyInfo && companyInfo.email ? (
                  <div>
                    <a href={`mailto:${companyInfo.email}`} className="text-lime-600 no-underline hover:underline">{companyInfo.email}</a>
                  </div>
                ) : null}
              </div>

              {/* Social Links */}
              {(companyInfo?.socialLinks?.facebook || companyInfo?.socialLinks?.twitter || companyInfo?.socialLinks?.linkedin || companyInfo?.socialLinks?.instagram || companyInfo?.socialLinks?.youtube) && (
                <div className="flex justify-center flex-wrap gap-3 text-xs">
                  {companyInfo?.socialLinks?.facebook && (
                    <a href={companyInfo.socialLinks.facebook} className="text-lime-600 no-underline hover:underline" target="_blank" rel="noopener noreferrer">Facebook</a>
                  )}
                  {companyInfo?.socialLinks?.twitter && (
                    <a href={companyInfo.socialLinks.twitter} className="text-lime-600 no-underline hover:underline" target="_blank" rel="noopener noreferrer">Twitter</a>
                  )}
                  {companyInfo?.socialLinks?.linkedin && (
                    <a href={companyInfo.socialLinks.linkedin} className="text-lime-600 no-underline hover:underline" target="_blank" rel="noopener noreferrer">LinkedIn</a>
                  )}
                  {companyInfo?.socialLinks?.instagram && (
                    <a href={companyInfo.socialLinks.instagram} className="text-lime-600 no-underline hover:underline" target="_blank" rel="noopener noreferrer">Instagram</a>
                  )}
                  {companyInfo?.socialLinks?.youtube && (
                    <a href={companyInfo.socialLinks.youtube} className="text-lime-600 no-underline hover:underline" target="_blank" rel="noopener noreferrer">YouTube</a>
                  )}
                </div>
              )}

              <div className="text-xs text-zinc-500 pt-2 border-t border-zinc-200">
                © {new Date().getFullYear()} {(companyInfo && companyInfo.companyName) || 'Company'}. All rights reserved.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
