import { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';

// ============================================================================
// CONSTANTS & STYLES
// ============================================================================

const API_BASE_URL = 'http://localhost:3001';
const ENDPOINTS = {
  emailTemplates: `${API_BASE_URL}/email-templates`,
  segments: `${API_BASE_URL}/segments`,
  companyInfo: `${API_BASE_URL}/company-info`,
  sendCampaign: `${API_BASE_URL}/send-campaign`,
  sendTestEmail: `${API_BASE_URL}/send-test-email`
};

const CAMPAIGN_STATUS = {
  DRAFT: 'Draft',
  READY: 'Ready to Send',
  SENT: 'Sent'
};

const VALIDATION_MESSAGES = {
  campaignName: 'Please enter a campaign name',
  emailBodies: 'Please select at least one email body for the campaign',
  segments: 'Please select at least one segment for the campaign',
  recipients: 'No recipients found in the selected segments',
  companyInfo: 'Company information is required to send campaigns. Please update your company info.',
  testEmail: 'Please enter a valid email address'
};

const COLORS = {
  dark_bg: '#1a1a1a',
  dark_panel: '#2a3f3f',
  dark_light: '#1a2a2a',
  accent_blue: '#4299e1',
  danger_red: '#f56565',
  text_primary: '#ffffff',
  text_secondary: '#b0b0b0',
  text_tertiary: '#808080',
  text_disabled: '#444',
  border_color: '#333',
  border_light: '#444'
};

const SECTION_HEADER_STYLE = {
  color: COLORS.text_secondary,
  fontSize: '12px',
  textTransform: 'uppercase',
  fontWeight: '600',
  marginBottom: '12px'
};

const SEQUENCE_NUMBER_STYLE = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: '36px',
  height: '36px',
  backgroundColor: COLORS.accent_blue,
  color: COLORS.text_primary,
  borderRadius: '50%',
  fontSize: '14px',
  fontWeight: 'bold',
  flexShrink: 0
};

const SMALL_SEQUENCE_NUMBER_STYLE = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: '24px',
  height: '24px',
  backgroundColor: COLORS.accent_blue,
  color: COLORS.text_primary,
  borderRadius: '50%',
  fontSize: '11px',
  fontWeight: 'bold',
  flexShrink: 0
};

const EMPTY_STATE_STYLE = {
  backgroundColor: COLORS.dark_light,
  borderRadius: '8px',
  padding: '20px',
  textAlign: 'center',
  color: COLORS.text_tertiary,
  border: `1px dashed ${COLORS.border_light}`
};

const BUTTON_STYLE = {
  base: {
    padding: '6px 10px',
    color: COLORS.text_primary,
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '11px',
    fontWeight: '600'
  },
  primary: {
    backgroundColor: COLORS.accent_blue
  },
  danger: {
    backgroundColor: COLORS.danger_red
  },
  disabled: {
    backgroundColor: COLORS.text_disabled,
    cursor: 'not-allowed',
    opacity: 0.5
  }
};

const SEQUENCE_ITEM_STYLE = {
  backgroundColor: COLORS.dark_panel,
  border: `1px solid ${COLORS.accent_blue}`,
  borderRadius: '8px',
  padding: '16px',
  display: 'flex',
  alignItems: 'flex-start',
  gap: '12px'
};

export default function Campaigns() {
  // ========== STATE ==========
  const [campaigns, setCampaigns] = useState([]);
  const [emailBodies, setEmailBodies] = useState([]);
  const [segments, setSegments] = useState([]);
  const [companyInfo, setCompanyInfo] = useState(null);
  const [selectedEmailBodies, setSelectedEmailBodies] = useState([]);
  const [emailBodySequence, setEmailBodySequence] = useState([]);
  const [selectedSegments, setSelectedSegments] = useState([]);
  const [campaignName, setCampaignName] = useState('');
  const [campaignDescription, setCampaignDescription] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sendingCampaign, setSendingCampaign] = useState(null);
  const [error, setError] = useState(null);

  // ========== EFFECTS ==========
  useEffect(() => {
    initializeData();
  }, []);

  useEffect(() => {
    persistCampaigns();
  }, [campaigns]);

  // Clean up sequence duplicates if they exist
  useEffect(() => {
    // Remove any duplicates from emailBodySequence
    const seen = new Set();
    const cleanedSequence = emailBodySequence.filter(bodyId => {
      if (seen.has(bodyId)) {
        return false;
      }
      seen.add(bodyId);
      return true;
    });
    
    if (cleanedSequence.length !== emailBodySequence.length) {
      setEmailBodySequence(cleanedSequence);
    }
    
    // Sync selectedEmailBodies with sequence (remove items not in sequence)
    const validBodies = selectedEmailBodies.filter(bodyId => cleanedSequence.includes(bodyId));
    if (validBodies.length !== selectedEmailBodies.length) {
      setSelectedEmailBodies(validBodies);
    }
  }, [emailBodySequence, selectedEmailBodies]);

  // ========== API & DATA FUNCTIONS ==========
  const initializeData = useCallback(async () => {
    await Promise.all([
      fetchEmailBodies(),
      fetchSegments(),
      fetchCompanyInfo(),
      loadSavedCampaigns()
    ]);
  }, []);

  const loadSavedCampaigns = useCallback(() => {
    try {
      const savedCampaigns = localStorage.getItem('emailCampaigns');
      if (savedCampaigns) {
        setCampaigns(JSON.parse(savedCampaigns));
      }
    } catch (error) {
      console.error('Error loading saved campaigns:', error);
      setError('Failed to load campaigns');
    }
  }, []);

  const fetchEmailBodies = useCallback(async () => {
    try {
      const response = await axios.get(ENDPOINTS.emailTemplates);
      setEmailBodies(response.data || []);
    } catch (error) {
      console.error('Error fetching email templates:', error);
      setEmailBodies([]);
    }
  }, []);

  const fetchSegments = useCallback(async () => {
    try {
      const response = await axios.get(ENDPOINTS.segments);
      setSegments(response.data || []);
    } catch (error) {
      console.error('Error fetching segments:', error);
      setSegments([]);
    }
  }, []);

  const fetchCompanyInfo = useCallback(async () => {
    try {
      const response = await axios.get(ENDPOINTS.companyInfo);
      setCompanyInfo(response.data);
    } catch (error) {
      console.error('Error fetching company info:', error);
    }
  }, []);

  const persistCampaigns = useCallback(() => {
    if (campaigns.length > 0) {
      localStorage.setItem('emailCampaigns', JSON.stringify(campaigns));
    } else {
      localStorage.removeItem('emailCampaigns');
    }
  }, [campaigns]);

  // ========== MEMOIZED CALCULATIONS ==========
  const calculateTotalRecipients = useCallback((segmentIds = selectedSegments) => {
    const emailSet = new Set();
    const allContacts = [];
    
    segmentIds.forEach(segmentId => {
      const segment = segments.find(s => s._id === segmentId);
      if (segment?.contacts && Array.isArray(segment.contacts)) {
        segment.contacts.forEach(contact => {
          if (contact?.email && !emailSet.has(contact.email)) {
            emailSet.add(contact.email);
            allContacts.push(contact);
          }
        });
      }
    });
    return allContacts;
  }, [selectedSegments, segments]);

  const getContactCount = useCallback((segment) => {
    return segment?.contacts && Array.isArray(segment.contacts) ? segment.contacts.length : 0;
  }, []);

  const totalRecipients = useMemo(() => calculateTotalRecipients(), [calculateTotalRecipients]);

  const isFormValid = useMemo(() => ({
    name: campaignName.trim().length > 0,
    bodies: selectedEmailBodies.length > 0,
    segments: selectedSegments.length > 0
  }), [campaignName, selectedEmailBodies, selectedSegments]);

  // ========== FORM MANAGEMENT ==========
  const resetFormState = useCallback(() => {
    setSelectedEmailBodies([]);
    setSelectedSegments([]);
    setCampaignName('');
    setCampaignDescription('');
    setError(null);
  }, []);

  const validateCampaignForm = useCallback(() => {
    if (!campaignName.trim()) return VALIDATION_MESSAGES.campaignName;
    if (selectedEmailBodies.length === 0) return VALIDATION_MESSAGES.emailBodies;
    if (selectedSegments.length === 0) return VALIDATION_MESSAGES.segments;
    return null;
  }, [campaignName, selectedEmailBodies, selectedSegments]);

  const handleCreateCampaign = useCallback(() => {
    setShowCreateForm(true);
    setError(null);
  }, []);

  const handleCancelCreate = useCallback(() => {
    setShowCreateForm(false);
    resetFormState();
  }, [resetFormState]);

  // ========== SELECTION HANDLERS ==========
  const toggleSelection = useCallback((id, selected, setSelected) => {
    setSelected(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  }, []);

  const handleEmailBodyToggle = useCallback((bodyId) => {
    setSelectedEmailBodies(prev => {
      // Check if body is currently selected
      const isCurrentlySelected = prev.includes(bodyId);
      
      if (isCurrentlySelected) {
        // Remove from selected bodies
        const updatedBodies = prev.filter(id => id !== bodyId);
        // Also remove from sequence
        setEmailBodySequence(prevSeq => prevSeq.filter(id => id !== bodyId));
        return updatedBodies;
      } else {
        // Add to selected bodies (avoid duplicates)
        if (!prev.includes(bodyId)) {
          const updatedBodies = [...prev, bodyId];
          // Add to sequence (check for duplicates before adding)
          setEmailBodySequence(prevSeq => {
            // Ensure no duplicates exist
            if (!prevSeq.includes(bodyId)) {
              return [...prevSeq, bodyId];
            }
            return prevSeq;
          });
          return updatedBodies;
        }
        return prev;
      }
    });
  }, []);

  const handleMoveBodyUp = useCallback((bodyId) => {
    const currentIndex = emailBodySequence.indexOf(bodyId);
    if (currentIndex > 0) {
      const newSequence = [...emailBodySequence];
      [newSequence[currentIndex], newSequence[currentIndex - 1]] = 
      [newSequence[currentIndex - 1], newSequence[currentIndex]];
      setEmailBodySequence(newSequence);
    }
  }, [emailBodySequence]);

  const handleMoveBodyDown = useCallback((bodyId) => {
    const currentIndex = emailBodySequence.indexOf(bodyId);
    if (currentIndex < emailBodySequence.length - 1) {
      const newSequence = [...emailBodySequence];
      [newSequence[currentIndex], newSequence[currentIndex + 1]] = 
      [newSequence[currentIndex + 1], newSequence[currentIndex]];
      setEmailBodySequence(newSequence);
    }
  }, [emailBodySequence]);

  const getBodySequenceNumber = useCallback((bodyId) => {
    return emailBodySequence.indexOf(bodyId) + 1;
  }, [emailBodySequence]);

  const handleSelectAllBodies = useCallback(() => {
    const allBodyIds = emailBodies.map(body => body._id);
    
    if (selectedEmailBodies.length === emailBodies.length) {
      // Deselect all
      setSelectedEmailBodies([]);
      setEmailBodySequence([]);
    } else {
      // Select all - maintain existing sequence and add new ones
      setSelectedEmailBodies(allBodyIds);
      setEmailBodySequence(prevSeq => {
        // Add only new bodies to the sequence
        const newSequence = [...prevSeq];
        allBodyIds.forEach(bodyId => {
          if (!newSequence.includes(bodyId)) {
            newSequence.push(bodyId);
          }
        });
        return newSequence;
      });
    }
  }, [selectedEmailBodies.length, emailBodies]);

  const handleSelectAllSegments = useCallback(() => {
    const allSegmentIds = segments.map(segment => segment._id);
    setSelectedSegments(
      selectedSegments.length === segments.length ? [] : allSegmentIds
    );
  }, [selectedSegments, segments]);

  const handleSegmentToggle = useCallback((segmentId) => {
    setSelectedSegments(prev => 
      prev.includes(segmentId)
        ? prev.filter(id => id !== segmentId)
        : [...prev, segmentId]
    );
  }, []);

  // ========== CAMPAIGN CREATION ==========
  const handleSubmitCampaign = useCallback(() => {
    const validationError = validateCampaignForm();
    if (validationError) {
      setError(validationError);
      alert(validationError);
      return;
    }

    // Get email bodies in the selected sequence order
    const selectedBodies = emailBodySequence.map(bodyId => 
      emailBodies.find(body => body._id === bodyId)
    ).filter(Boolean);
    
    const selectedSegmentObjects = segments.filter(segment => selectedSegments.includes(segment._id));

    const newCampaign = {
      id: Date.now().toString(),
      name: campaignName.trim(),
      description: campaignDescription.trim() || 'No description provided',
      emailBodies: selectedBodies,
      emailBodySequence: emailBodySequence,
      segments: selectedSegmentObjects,
      recipients: totalRecipients,
      createdAt: new Date(),
      status: CAMPAIGN_STATUS.READY,
      sentCount: 0,
      companyInfo: companyInfo
    };

    setCampaigns(prev => [...prev, newCampaign]);
    alert(`Campaign "${campaignName}" created successfully! Email bodies will be sent in sequence (${emailBodySequence.length} emails per recipient).`);
    setShowCreateForm(false);
    resetFormState();
    setEmailBodySequence([]);
  }, [campaignName, campaignDescription, selectedEmailBodies, selectedSegments, emailBodies, emailBodySequence, segments, totalRecipients, companyInfo, validateCampaignForm, resetFormState]);

  // ========== CAMPAIGN SEND ==========
  const validateCampaignSend = useCallback((campaign) => {
    if (campaign.status === CAMPAIGN_STATUS.SENT) return 'This campaign has already been sent';
    if (!campaign.recipients?.length) return VALIDATION_MESSAGES.recipients;
    if (!campaign.companyInfo) return VALIDATION_MESSAGES.companyInfo;
    return null;
  }, []);

  const sendCampaignToServer = useCallback(async (campaign) => {
    const response = await axios.post(ENDPOINTS.sendCampaign, { campaign });
    if (!response.data.success) throw new Error(response.data.message || 'Campaign sending failed');
    return response.data.data;
  }, []);

  const updateCampaignStatus = useCallback((campaignId, recipientCount) => {
    setCampaigns(prev => prev.map(c => 
      c.id === campaignId 
        ? { 
            ...c, 
            status: CAMPAIGN_STATUS.SENT, 
            sentCount: recipientCount,
            sentAt: new Date(),
            deliveryStatus: 'Completed'
          }
        : c
    ));
  }, []);

  const handleSendCampaign = useCallback(async (campaignId) => {
    const campaign = campaigns.find(c => c.id === campaignId);
    if (!campaign) return;

    const validationError = validateCampaignSend(campaign);
    if (validationError) {
      alert(validationError);
      return;
    }

    const confirmMessage = `Send campaign "${campaign.name}" to ${campaign.recipients.length} recipients?`;
    if (!window.confirm(confirmMessage)) return;

    setSendingCampaign(campaignId);

    try {
      await sendCampaignToServer(campaign);
      updateCampaignStatus(campaignId, campaign.recipients.length);
      alert(`Campaign "${campaign.name}" sent successfully to ${campaign.recipients.length} recipients!`);
    } catch (error) {
      console.error('Campaign send error:', error);
      alert(`Failed to send campaign: ${error.message}`);
    } finally {
      setSendingCampaign(null);
    }
  }, [campaigns, validateCampaignSend, sendCampaignToServer, updateCampaignStatus]);

  // ========== TEST EMAIL & CAMPAIGN MANAGEMENT ==========
  const handleSendTestEmail = useCallback(async () => {
    const email = prompt('Enter test email address:');
    if (!email) return;
    
    setLoading(true);
    try {
      const response = await axios.post(ENDPOINTS.sendTestEmail, {
        email,
        subject: 'Final Year Project - Email System Test'
      });
      
      if (response.data.success) {
        alert(`Test email sent successfully to ${email}!`);
      } else {
        alert(`Failed to send test email: ${response.data.message}`);
      }
    } catch (error) {
      alert(`Error sending test email: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDeleteCampaign = useCallback((campaignId) => {
    const campaign = campaigns.find(c => c.id === campaignId);
    if (!campaign) return;
    
    if (window.confirm(`Are you sure you want to delete campaign "${campaign.name}"?`)) {
      setCampaigns(prev => prev.filter(c => c.id !== campaignId));
    }
  }, [campaigns]);

  const handleDuplicateCampaign = useCallback((campaignId) => {
    const campaign = campaigns.find(c => c.id === campaignId);
    if (!campaign) return;

    const duplicatedCampaign = {
      ...campaign,
      id: Date.now().toString(),
      name: `${campaign.name} (Copy)`,
      status: CAMPAIGN_STATUS.READY,
      sentCount: 0,
      sentAt: null,
      deliveryStatus: null,
      createdAt: new Date()
    };

    setCampaigns(prev => [...prev, duplicatedCampaign]);
    alert(`Campaign duplicated as "${duplicatedCampaign.name}"`);
  }, [campaigns]);

  return (
    <div className="campaign-container">
      <div className="campaign-header">
        <h1>Email Campaigns</h1>
        <div className="campaign-header-actions">
          <div className="campaign-stats">
            {emailBodies.length} Bodies | {segments.length} Segments
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
            Send Test Email
          </button>
        </div>
      </div>

      {/* Create Campaign Form */}
      {showCreateForm && (
        <div className="campaign-form">
          <h3>Create New Campaign</h3>

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
              Email Bodies ({selectedEmailBodies.length} selected):
            </label>
            
            {emailBodies.length === 0 ? (
              <div className="campaign-warning-box">
                <p className="campaign-warning-text">
                  No email bodies found. Please create an email body first in the Email Body Editor.
                </p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                {/* ===== LEFT: AVAILABLE BODIES ===== */}
                <div>
                  <h5 style={SECTION_HEADER_STYLE}>
                    Available Email Bodies
                  </h5>
                  <div className="campaign-button-container">
                    <button
                      type="button"
                      onClick={handleSelectAllBodies}
                      className="campaign-selection-btn-all"
                    >
                      {selectedEmailBodies.length === emailBodies.length ? 'Deselect All' : 'Select All'}
                    </button>
                  </div>

                  <div className="campaign-selection-list">
                    {emailBodies.map((body) => {
                      const isSelected = selectedEmailBodies.includes(body._id);
                      
                      return (
                        <div
                          key={body._id}
                          className="campaign-selection-item"
                          onClick={() => handleEmailBodyToggle(body._id)}
                          style={{
                            backgroundColor: isSelected ? COLORS.dark_panel : 'transparent',
                            borderLeft: isSelected ? `4px solid ${COLORS.accent_blue}` : 'none',
                            cursor: 'pointer',
                            opacity: isSelected ? 0.7 : 1
                          }}
                        >
                          <div className="campaign-selection-checkbox">
                            <input
                              type="checkbox"
                              checked={isSelected}
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
                                body.content.substring(0, 80) + '...' : 
                                'No content available'
                              }
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* ===== RIGHT: SELECTED SEQUENCE ===== */}
                <div>
                  <h5 style={SECTION_HEADER_STYLE}>
                    Email Send Sequence ({emailBodySequence.length})
                  </h5>
                  
                  {emailBodySequence.length === 0 ? (
                    <div style={EMPTY_STATE_STYLE}>
                      <p style={{ margin: '0', fontSize: '14px' }}>
                        Select email bodies from the left to add them to the sequence
                      </p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {emailBodySequence.map((bodyId, idx) => {
                        const body = emailBodies.find(b => b._id === bodyId);
                        const isFirst = idx === 0;
                        const isLast = idx === emailBodySequence.length - 1;
                        
                        return (
                          <div
                            key={bodyId}
                            style={SEQUENCE_ITEM_STYLE}
                          >
                            <div style={SEQUENCE_NUMBER_STYLE}>
                              {idx + 1}
                            </div>

                            <div style={{ flex: 1 }}>
                              <div style={{ color: COLORS.text_primary, fontWeight: '600', marginBottom: '4px' }}>
                                {body?.name || 'Untitled'}
                              </div>
                              <div style={{ fontSize: '12px', color: COLORS.text_tertiary }}>
                                {body?.content ? 
                                  body.content.substring(0, 60) + '...' : 
                                  'No content'
                                }
                              </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flexShrink: 0 }}>
                              <button
                                onClick={() => handleMoveBodyUp(bodyId)}
                                disabled={isFirst}
                                style={{
                                  ...BUTTON_STYLE.base,
                                  ...(isFirst ? BUTTON_STYLE.disabled : BUTTON_STYLE.primary)
                                }}
                                title="Move up in sequence"
                              >
                                Up
                              </button>
                              <button
                                onClick={() => handleMoveBodyDown(bodyId)}
                                disabled={isLast}
                                style={{
                                  ...BUTTON_STYLE.base,
                                  ...(isLast ? BUTTON_STYLE.disabled : BUTTON_STYLE.primary)
                                }}
                                title="Move down in sequence"
                              >
                                Down
                              </button>
                              <button
                                onClick={() => handleEmailBodyToggle(bodyId)}
                                style={{
                                  ...BUTTON_STYLE.base,
                                  ...BUTTON_STYLE.danger
                                }}
                                title="Remove from sequence"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Segments Selection */}
          <div className="campaign-form-section">
            <label className="campaign-form-label">
              Target Segments ({selectedSegments.length} selected):
            </label>
            
            {segments.length === 0 ? (
              <div className="campaign-warning-box">
                <p className="campaign-warning-text">
                  No segments found. Please create segments first in the Contact Manager.
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
                      Total Recipients: {totalRecipients.length} (deduplicated)
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
                              {segment.name}
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
                Campaign Summary
              </h4>
              
              {/* Email Bodies Sequence Display */}
              {emailBodySequence.length > 0 && (
                <div style={{
                  backgroundColor: COLORS.dark_light,
                  padding: '16px',
                  borderRadius: '8px',
                  marginBottom: '16px',
                  borderLeft: `4px solid ${COLORS.accent_blue}`
                }}>
                  <div style={SECTION_HEADER_STYLE}>
                    Email Send Sequence
                  </div>
                  {emailBodySequence.map((bodyId, idx) => {
                    const body = emailBodies.find(b => b._id === bodyId);
                    return (
                      <div key={bodyId} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '8px 0',
                        borderBottom: idx < emailBodySequence.length - 1 ? `1px solid ${COLORS.border_color}` : 'none'
                      }}>
                        <div style={SMALL_SEQUENCE_NUMBER_STYLE}>
                          {idx + 1}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ color: COLORS.text_primary, fontSize: '14px', fontWeight: '600' }}>
                            {body?.name || 'Untitled'}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              
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
                    {totalRecipients.length}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="campaign-action-buttons">
            <button
              onClick={handleSubmitCampaign}
              disabled={!isFormValid.name || !isFormValid.bodies || !isFormValid.segments}
              className="campaign-btn-submit"
            >
              Create Campaign ({totalRecipients.length} recipients)
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
              <div className="campaign-empty-icon">Campaigns</div>
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
                        {campaign.name}
                      </h4>
                      <p className="campaign-card-description">
                        {campaign.description}
                      </p>
                      <div className="campaign-card-meta">
                        <span>Created: {new Date(campaign.createdAt).toLocaleDateString()}</span>
                        <span className={`campaign-card-status campaign-status-${campaign.status === CAMPAIGN_STATUS.SENT ? 'sent' : campaign.status === CAMPAIGN_STATUS.READY ? 'ready' : 'draft'}`}>
                          Status: {campaign.status}
                        </span>
                        {campaign.sentCount > 0 && <span>Sent to: {campaign.sentCount} recipients</span>}
                        {campaign.sentAt && <span>Sent: {new Date(campaign.sentAt).toLocaleDateString()}</span>}
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
                          disabled={campaign.status === CAMPAIGN_STATUS.SENT || !campaign.recipients || campaign.recipients.length === 0}
                          className="campaign-card-btn-send"
                        >
                          {campaign.status === CAMPAIGN_STATUS.SENT ? 'Sent' : `Send Now (${campaign.recipients ? campaign.recipients.length : 0})`}
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleDuplicateCampaign(campaign.id)}
                        className="campaign-card-btn-duplicate"
                        title="Duplicate"
                      >
                        Copy
                      </button>
                      
                      <button
                        onClick={() => handleDeleteCampaign(campaign.id)}
                        className="campaign-card-btn-delete"
                        title="Delete"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {/* Campaign Content Grid */}
                  <div className="campaign-card-content-grid">
                    {/* Email Bodies */}
                    <div className="campaign-card-section">
                      <h5 className="campaign-card-section-title">
                        Email Bodies ({campaign.emailBodies ? campaign.emailBodies.length : 0}):
                      </h5>
                      <div className="campaign-card-items-list">
                        {campaign.emailBodies && campaign.emailBodies.map((body, idx) => (
                          <div key={body._id} className="campaign-card-item" style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '12px'
                          }}>
                            <div style={SMALL_SEQUENCE_NUMBER_STYLE}>
                              {idx + 1}
                            </div>
                            <div style={{ flex: 1 }}>
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
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Target Segments */}
                    <div className="campaign-card-section">
                      <h5 className="campaign-card-section-title">
                        Target Segments ({campaign.segments ? campaign.segments.length : 0}):
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
