import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [emailBodies, setEmailBodies] = useState([]);
  const [segments, setSegments] = useState([]);
  const [companyInfo, setCompanyInfo] = useState(null);
  const [selectedEmailBodies, setSelectedEmailBodies] = useState([]);
  const [selectedSegments, setSelectedSegments] = useState([]);
  const [campaignName, setCampaignName] = useState('');
  const [campaignDescription, setCampaignDescription] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sendingCampaign, setSendingCampaign] = useState(null);

  // Fetch data on component mount and load saved campaigns
  useEffect(() => {
    fetchEmailBodies();
    fetchSegments();
    fetchCompanyInfo();
    loadSavedCampaigns();
  }, []);

  // Save campaigns to localStorage whenever campaigns change
  useEffect(() => {
    if (campaigns.length > 0) {
      localStorage.setItem('emailCampaigns', JSON.stringify(campaigns));
    }
  }, [campaigns]);

  const loadSavedCampaigns = () => {
    try {
      const savedCampaigns = localStorage.getItem('emailCampaigns');
      if (savedCampaigns) {
        const parsedCampaigns = JSON.parse(savedCampaigns);
        setCampaigns(parsedCampaigns);
      }
    } catch (error) {
      console.error('Error loading saved campaigns:', error);
    }
  };

  const fetchEmailBodies = async () => {
    try {
      // Fetch email templates instead of email bodies
      const response = await axios.get('http://localhost:3001/email-templates');
      setEmailBodies(response.data || []);
    } catch (error) {
      console.error('Error fetching email templates:', error);
      setEmailBodies([]);
    }
  };

  const fetchSegments = async () => {
    try {
      const response = await axios.get('http://localhost:3001/segments');
      setSegments(response.data || []);
    } catch (error) {
      console.error('Error fetching segments:', error);
      setSegments([]);
    }
  };

  const fetchCompanyInfo = async () => {
    try {
      const response = await axios.get('http://localhost:3001/company-info');
      setCompanyInfo(response.data);
    } catch (error) {
      console.error('Error fetching company info:', error);
    }
  };

  // Calculate total unique recipients from selected segments
  const calculateTotalRecipients = (segmentIds = selectedSegments) => {
    const allContacts = [];
    segmentIds.forEach(segmentId => {
      const segment = segments.find(s => s._id === segmentId);
      if (segment && segment.contacts && Array.isArray(segment.contacts)) {
        segment.contacts.forEach(contact => {
          // Avoid duplicates by checking email
          if (contact && contact.email && !allContacts.find(c => c.email === contact.email)) {
            allContacts.push(contact);
          }
        });
      }
    });
    return allContacts;
  };

  const handleCreateCampaign = () => {
    setShowCreateForm(true);
  };

  const handleCancelCreate = () => {
    setShowCreateForm(false);
    setSelectedEmailBodies([]);
    setSelectedSegments([]);
    setCampaignName('');
    setCampaignDescription('');
  };

  const handleEmailBodyToggle = (bodyId) => {
    setSelectedEmailBodies(prev => 
      prev.includes(bodyId) 
        ? prev.filter(id => id !== bodyId)
        : [...prev, bodyId]
    );
  };

  const handleSegmentToggle = (segmentId) => {
    setSelectedSegments(prev => 
      prev.includes(segmentId) 
        ? prev.filter(id => id !== segmentId)
        : [...prev, segmentId]
    );
  };

  const handleSelectAllBodies = () => {
    if (selectedEmailBodies.length === emailBodies.length) {
      setSelectedEmailBodies([]);
    } else {
      setSelectedEmailBodies(emailBodies.map(body => body._id));
    }
  };

  const handleSelectAllSegments = () => {
    if (selectedSegments.length === segments.length) {
      setSelectedSegments([]);
    } else {
      setSelectedSegments(segments.map(segment => segment._id));
    }
  };

  const handleSubmitCampaign = () => {
    if (!campaignName.trim()) {
      alert('Please enter a campaign name');
      return;
    }
    
    if (selectedEmailBodies.length === 0) {
      alert('Please select at least one email body for the campaign');
      return;
    }

    if (selectedSegments.length === 0) {
      alert('Please select at least one segment for the campaign');
      return;
    }
    
    const selectedBodies = emailBodies.filter(body => selectedEmailBodies.includes(body._id));
    const selectedSegmentObjects = segments.filter(segment => selectedSegments.includes(segment._id));
    const totalRecipients = calculateTotalRecipients();
    
    // Create new campaign object
    const newCampaign = {
      id: Date.now().toString(),
      name: campaignName.trim(),
      description: campaignDescription.trim() || 'No description provided',
      emailBodies: selectedBodies,
      segments: selectedSegmentObjects,
      recipients: totalRecipients,
      createdAt: new Date(),
      status: 'Ready to Send',
      sentCount: 0,
      companyInfo: companyInfo
    };
    
    // Add to campaigns list
    setCampaigns(prev => [...prev, newCampaign]);
    
    console.log('Created campaign:', newCampaign);
    alert(`Campaign "${campaignName}" created successfully! Ready to send to ${totalRecipients.length} recipients across ${selectedSegments.length} segments.`);
    
    // Reset form
    setShowCreateForm(false);
    setSelectedEmailBodies([]);
    setSelectedSegments([]);
    setCampaignName('');
    setCampaignDescription('');
  };

  // ONE-CLICK CAMPAIGN SEND
  const handleSendCampaign = async (campaignId) => {
    const campaign = campaigns.find(c => c.id === campaignId);
    if (!campaign) return;

    if (campaign.status === 'Sent') {
      alert('This campaign has already been sent!');
      return;
    }

    if (!campaign.recipients || campaign.recipients.length === 0) {
      alert('No recipients found in the selected segments.');
      return;
    }

    if (!campaign.companyInfo) {
      alert('Company information is required to send campaigns. Please update your company info.');
      return;
    }

    // Confirm send
    const confirmMessage = `Send campaign "${campaign.name}" to ${campaign.recipients.length} recipients across ${campaign.segments.length} segments?`;
    if (!window.confirm(confirmMessage)) return;

    setSendingCampaign(campaignId);

    try {
      // Simulate campaign sending (replace with actual email sending logic)
      await simulateCampaignSend(campaign);
      
      // Update campaign status
      setCampaigns(prev => prev.map(c => 
        c.id === campaignId 
          ? { 
              ...c, 
              status: 'Sent', 
              sentCount: campaign.recipients.length,
              sentAt: new Date(),
              deliveryStatus: 'Completed'
            }
          : c
      ));

      alert(`✅ Campaign "${campaign.name}" sent successfully to ${campaign.recipients.length} recipients!`);
      
    } catch (error) {
      console.error('Campaign send error:', error);
      alert('❌ Failed to send campaign: ' + error.message);
    } finally {
      setSendingCampaign(null);
    }
  };

  // Simulate campaign sending (replace with actual email service)
  const simulateCampaignSend = async (campaign) => {
    try {
      console.log('🚀 Sending real campaign emails...');
      
      const response = await axios.post('http://localhost:3001/send-campaign', {
        campaign: campaign
      });
      
      if (response.data.success) {
        console.log('✅ Campaign sent successfully:', response.data.data.summary);
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Campaign sending failed');
      }
      
    } catch (error) {
      console.error('❌ Campaign send error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to send campaign');
    }
  };

  const handleSendTestEmail = async () => {
    const email = prompt('Enter test email address:');
    if (!email) return;
    
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:3001/send-test-email', {
        email: email,
        subject: 'Final Year Project - Email System Test'
      });
      
      if (response.data.success) {
        alert(`✅ Test email sent successfully to ${email}!`);
      } else {
        alert(`❌ Failed to send test email: ${response.data.message}`);
      }
    } catch (error) {
      alert(`❌ Error sending test email: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCampaign = (campaignId) => {
    const campaign = campaigns.find(c => c.id === campaignId);
    if (!campaign) return;
    
    if (window.confirm(`Are you sure you want to delete campaign "${campaign.name}"?`)) {
      setCampaigns(prev => prev.filter(c => c.id !== campaignId));
      // Also remove from localStorage
      const updatedCampaigns = campaigns.filter(c => c.id !== campaignId);
      if (updatedCampaigns.length === 0) {
        localStorage.removeItem('emailCampaigns');
      } else {
        localStorage.setItem('emailCampaigns', JSON.stringify(updatedCampaigns));
      }
    }
  };

  const handleDuplicateCampaign = (campaignId) => {
    const campaign = campaigns.find(c => c.id === campaignId);
    if (!campaign) return;

    const duplicatedCampaign = {
      ...campaign,
      id: Date.now().toString(),
      name: `${campaign.name} (Copy)`,
      status: 'Ready to Send',
      sentCount: 0,
      sentAt: null,
      deliveryStatus: null,
      createdAt: new Date()
    };

    setCampaigns(prev => [...prev, duplicatedCampaign]);
    alert(`Campaign duplicated as "${duplicatedCampaign.name}"`);
  };

  // Helper function to get contact count safely
  const getContactCount = (segment) => {
    return segment && segment.contacts && Array.isArray(segment.contacts) ? segment.contacts.length : 0;
  };

  return (
    <div className="campaign-container">
      <div className="campaign-header">
        <h1>Email Campaigns</h1>
        <div className="campaign-header-actions">
          {/* Quick Stats */}
          <div className="campaign-stats">
            📧 {emailBodies.length} Bodies | 🎯 {segments.length} Segments
          </div>
          
          <button
            onClick={handleCreateCampaign}
            className="campaign-btn campaign-btn-create"
          >
            <span>+</span>
            Create Campaign
          </button>

          <button
            onClick={handleSendTestEmail}
            className="campaign-btn campaign-btn-test"
          >
            📧 Send Test Email
          </button>
        </div>
      </div>

      {/* Create Campaign Form */}
      {showCreateForm && (
        <div className="campaign-form">
          <h3>🚀 Create New Campaign</h3>

          {/* Campaign Name & Description */}
          <div className="campaign-form-grid">
            <div>
              <label className="campaign-form-label">
                Campaign Name *:
              </label>
              <input
                type="text"
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                placeholder="Enter campaign name..."
                className="campaign-form-input"
              />
            </div>

            <div>
              <label className="campaign-form-label">
                Campaign Description:
              </label>
              <input
                type="text"
                value={campaignDescription}
                onChange={(e) => setCampaignDescription(e.target.value)}
                placeholder="Enter campaign description..."
                className="campaign-form-input"
              />
            </div>
          </div>
          
          {/* Email Bodies Selection */}
          <div className="campaign-form-section">
            <label className="campaign-form-label">
              📧 Select Email Bodies ({selectedEmailBodies.length} selected):
            </label>
            
            {emailBodies.length === 0 ? (
              <div className="campaign-warning-box">
                <p className="campaign-warning-text">
                  ⚠️ No email bodies found. Please create an email body first in the Email Body Editor.
                </p>
              </div>
            ) : (
              <div>
                <div className="campaign-button-container">
                  <button
                    type="button"
                    onClick={handleSelectAllBodies}
                    className="campaign-selection-btn-all"
                  >
                    {selectedEmailBodies.length === emailBodies.length ? 'Deselect All' : 'Select All'} Bodies
                  </button>
                </div>

                <div className="campaign-selection-list">
                  {emailBodies.map((body) => (
                    <div
                      key={body._id}
                      className="campaign-selection-item"
                      onClick={() => handleEmailBodyToggle(body._id)}
                    >
                      <div className="campaign-selection-checkbox">
                        <input
                          type="checkbox"
                          checked={selectedEmailBodies.includes(body._id)}
                          onChange={() => handleEmailBodyToggle(body._id)}
                          className="campaign-checkbox"
                        />
                      </div>
                      <div className="campaign-selection-content">
                        <div className="campaign-selection-title">
                          {body.name || 'Untitled'}
                        </div>
                        <div className="campaign-selection-preview">
                          {body.content ? 
                            body.content.substring(0, 100) + '...' : 
                            'No content available'
                          }
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Segments Selection */}
          <div className="campaign-form-section">
            <label className="campaign-form-label">
              🎯 Select Target Segments ({selectedSegments.length} selected):
            </label>
            
            {segments.length === 0 ? (
              <div className="campaign-warning-box">
                <p className="campaign-warning-text">
                  ⚠️ No segments found. Please create segments first in the Contact Manager.
                </p>
              </div>
            ) : (
              <div>
                <div className="campaign-segments-header">
                  <button
                    type="button"
                    onClick={handleSelectAllSegments}
                    className="campaign-selection-btn-segments"
                  >
                    {selectedSegments.length === segments.length ? 'Deselect All' : 'Select All'} Segments
                  </button>
                  
                  {selectedSegments.length > 0 && (
                    <div className="campaign-recipients-count">
                      📊 Total Recipients: {calculateTotalRecipients().length} (deduplicated)
                    </div>
                  )}
                </div>

                <div className="campaign-selection-list">
                  {segments.map((segment) => (
                    <div
                      key={segment._id}
                      className="campaign-selection-item"
                      onClick={() => handleSegmentToggle(segment._id)}
                    >
                      <div className="campaign-selection-checkbox">
                        <input
                          type="checkbox"
                          checked={selectedSegments.includes(segment._id)}
                          onChange={() => handleSegmentToggle(segment._id)}
                          className="campaign-checkbox"
                        />
                      </div>
                      <div className="campaign-selection-content">
                        <div className="campaign-segment-header-flex">
                          <div>
                            <div className="campaign-segment-name">
                              🎯 {segment.name}
                            </div>
                            <div className="campaign-segment-description">
                              {segment.description || 'No description'}
                            </div>
                          </div>
                          <div className="campaign-contacts-badge">
                            {getContactCount(segment)} contacts
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Campaign Summary */}
          {selectedEmailBodies.length > 0 && selectedSegments.length > 0 && (
            <div className="campaign-summary">
              <h4 className="campaign-summary-title">
                🎯 Campaign Summary
              </h4>
              <div className="campaign-summary-grid">
                <div className="campaign-summary-item">
                  <div className="campaign-summary-label">EMAIL BODIES</div>
                  <div className="campaign-summary-value">
                    {selectedEmailBodies.length}
                  </div>
                </div>
                <div className="campaign-summary-item">
                  <div className="campaign-summary-label">TARGET SEGMENTS</div>
                  <div className="campaign-summary-value">
                    {selectedSegments.length}
                  </div>
                </div>
                <div className="campaign-summary-item">
                  <div className="campaign-summary-label">TOTAL RECIPIENTS</div>
                  <div className="campaign-summary-value">
                    {calculateTotalRecipients().length}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="campaign-action-buttons">
            <button
              onClick={handleSubmitCampaign}
              disabled={!campaignName.trim() || selectedEmailBodies.length === 0 || selectedSegments.length === 0}
              className="campaign-btn-submit"
            >
              🚀 Create Campaign ({calculateTotalRecipients().length} recipients)
            </button>
            <button
              onClick={handleCancelCreate}
              className="campaign-btn-cancel"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Campaigns List */}
      {!showCreateForm && (
        <div>
          {campaigns.length === 0 ? (
            <div className="campaign-empty-state">
              <div className="campaign-empty-icon">🚀</div>
              <h3 className="campaign-empty-title">No campaigns yet</h3>
              <p className="campaign-empty-description">
                Create your first email campaign to start reaching your audience segments
              </p>
              <button
                onClick={handleCreateCampaign}
                className="campaign-empty-btn"
              >
                Get Started
              </button>
            </div>
          ) : (
            <div>
              <h3 className="campaign-list-title">
                Your Campaigns ({campaigns.length})
              </h3>
              
              {campaigns.map((campaign) => (
                <div key={campaign.id} className={`campaign-card${campaign.status === 'Sent' ? ' campaign-card-sent' : ''}`}>
                  {/* Campaign Header */}
                  <div className="campaign-card-header">
                    <div>
                      <h4 className="campaign-card-title">
                        🚀 {campaign.name}
                      </h4>
                      <p className="campaign-card-description">
                        {campaign.description}
                      </p>
                      <div className="campaign-card-meta">
                        <span>📅 Created: {new Date(campaign.createdAt).toLocaleDateString()}</span>
                        <span className={`campaign-card-status campaign-status-${campaign.status === 'Sent' ? 'sent' : campaign.status === 'Ready to Send' ? 'ready' : 'draft'}`}>
                          📊 Status: {campaign.status}
                        </span>
                        {campaign.sentCount > 0 && <span>📧 Sent to: {campaign.sentCount} recipients</span>}
                        {campaign.sentAt && <span>⏰ Sent: {new Date(campaign.sentAt).toLocaleDateString()}</span>}
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="campaign-card-actions">
                      {sendingCampaign === campaign.id ? (
                        <div className="campaign-card-sending">
                          📤 Sending...
                        </div>
                      ) : (
                        <button
                          onClick={() => handleSendCampaign(campaign.id)}
                          disabled={campaign.status === 'Sent' || !campaign.recipients || campaign.recipients.length === 0}
                          className="campaign-card-btn-send"
                        >
                          {campaign.status === 'Sent' ? '✅ Sent' : `📤 Send Now (${campaign.recipients ? campaign.recipients.length : 0})`}
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleDuplicateCampaign(campaign.id)}
                        className="campaign-card-btn-duplicate"
                      >
                        📋
                      </button>
                      
                      <button
                        onClick={() => handleDeleteCampaign(campaign.id)}
                        className="campaign-card-btn-delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                  {/* Campaign Content Grid */}
                  <div className="campaign-card-content-grid">
                    {/* Email Bodies */}
                    <div className="campaign-card-section">
                      <h5 className="campaign-card-section-title">
                        📧 Email Bodies ({campaign.emailBodies ? campaign.emailBodies.length : 0}):
                      </h5>
                      <div className="campaign-card-items-list">
                        {campaign.emailBodies && campaign.emailBodies.map((body) => (
                          <div key={body._id} className="campaign-card-item">
                            <div className="campaign-card-item-name">
                              {body.name || 'Untitled'}
                            </div>
                            <div className="campaign-card-item-preview">
                              {body.content ? 
                                body.content.substring(0, 80) + '...' : 
                                'No content'
                              }
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Target Segments */}
                    <div className="campaign-card-section">
                      <h5 className="campaign-card-section-title">
                        🎯 Target Segments ({campaign.segments ? campaign.segments.length : 0}):
                      </h5>
                      <div className="campaign-card-items-list">
                        {campaign.segments && campaign.segments.map((segment) => (
                          <div key={segment._id} className="campaign-segment-item">
                            <div>
                              <div className="campaign-segment-item-name">
                                {segment.name}
                              </div>
                              <div className="campaign-segment-item-desc">
                                {segment.description || 'No description'}
                              </div>
                            </div>
                            <div className="campaign-segment-item-count">
                              {getContactCount(segment)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Campaign Statistics */}
                  <div className="campaign-card-stats">
                    <div className="campaign-card-stats-grid">
                      <div className="campaign-card-stat-item">
                        <div className="campaign-card-stat-value">
                          {campaign.recipients ? campaign.recipients.length : 0}
                        </div>
                        <div className="campaign-card-stat-label">
                          Recipients
                        </div>
                      </div>
                      <div className="campaign-card-stat-item">
                        <div className="campaign-card-stat-value">
                          {campaign.emailBodies ? campaign.emailBodies.length : 0}
                        </div>
                        <div className="campaign-card-stat-label">
                          Email Bodies
                        </div>
                      </div>
                      <div className="campaign-card-stat-item">
                        <div className="campaign-card-stat-value">
                          {campaign.segments ? campaign.segments.length : 0}
                        </div>
                        <div className="campaign-card-stat-label">
                          Segments
                        </div>
                      </div>
                      {campaign.status === 'Sent' && (
                        <div className="campaign-card-stat-item">
                          <div className="campaign-card-stat-value">
                            100%
                          </div>
                          <div className="campaign-card-stat-label">
                            Delivered
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
