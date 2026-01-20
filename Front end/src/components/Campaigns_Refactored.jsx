import { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';

// ============================================================================
// 1. CONFIGURATION & CONSTANTS
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
  SCHEDULED: 'Scheduled',
  SENT: 'Sent'
};

const VALIDATION_MESSAGES = {
  campaignName: 'Please enter a campaign name',
  emailBodies: 'Please select at least one email body for the campaign',
  segments: 'Please select at least one segment for the campaign',
  recipients: 'No recipients found in the selected segments',
  companyInfo: 'Company information is required to send campaigns. Please update your company info.',
  testEmail: 'Please enter a valid email address',
  scheduledTime: 'Please select a valid date and time for scheduling'
};

// Color palette for dark theme
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

// Reusable style objects
const STYLES = {
  sectionHeader: {
    color: COLORS.text_secondary,
    fontSize: '12px',
    textTransform: 'uppercase',
    fontWeight: '600',
    marginBottom: '12px'
  },
  sequenceNumber: {
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
  },
  smallSequenceNumber: {
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
  },
  emptyState: {
    backgroundColor: COLORS.dark_light,
    borderRadius: '8px',
    padding: '20px',
    textAlign: 'center',
    color: COLORS.text_tertiary,
    border: `1px dashed ${COLORS.border_light}`
  },
  button: {
    base: {
      padding: '6px 10px',
      color: COLORS.text_primary,
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '11px',
      fontWeight: '600'
    },
    primary: { backgroundColor: COLORS.accent_blue },
    danger: { backgroundColor: COLORS.danger_red },
    disabled: {
      backgroundColor: COLORS.text_disabled,
      cursor: 'not-allowed',
      opacity: 0.5
    }
  },
  sequenceItem: {
    backgroundColor: COLORS.dark_panel,
    border: `1px solid ${COLORS.accent_blue}`,
    borderRadius: '8px',
    padding: '16px',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px'
  }
};

// ============================================================================
// 2. MAIN COMPONENT
// ============================================================================

export default function Campaigns() {
  // ========== STATE: FORM DATA ==========
  const [campaignName, setCampaignName] = useState('');
  const [campaignDescription, setCampaignDescription] = useState('');
  const [selectedEmailBodies, setSelectedEmailBodies] = useState([]);
  const [emailBodySequence, setEmailBodySequence] = useState([]);
  const [selectedSegments, setSelectedSegments] = useState([]);

  // ========== STATE: SCHEDULING ==========
  const [scheduleMode, setScheduleMode] = useState('immediate');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');

  // ========== STATE: DATA FROM SERVER ==========
  const [campaigns, setCampaigns] = useState([]);
  const [emailBodies, setEmailBodies] = useState([]);
  const [segments, setSegments] = useState([]);
  const [companyInfo, setCompanyInfo] = useState(null);

  // ========== STATE: UI CONTROL ==========
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sendingCampaign, setSendingCampaign] = useState(null);
  const [error, setError] = useState(null);

  // ========== EFFECTS: INITIALIZATION & DATA FETCHING ==========
  useEffect(() => {
    initializeData();
  }, []);

  useEffect(() => {
    persistCampaigns();
  }, [campaigns]);

  // Auto-send scheduled campaigns when their time arrives
  useEffect(() => {
    const checkScheduledCampaigns = () => {
      const now = new Date();
      const campaignsToSend = campaigns.filter(campaign => 
        campaign.status === CAMPAIGN_STATUS.SCHEDULED && 
        new Date(campaign.scheduledFor) <= now
      );
      campaignsToSend.forEach(campaign => {
        handleAutoSendScheduledCampaign(campaign.id);
      });
    };

    const interval = setInterval(checkScheduledCampaigns, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [campaigns]);

  // Clean up duplicates in email sequence
  useEffect(() => {
    const seen = new Set();
    const cleanedSequence = emailBodySequence.filter(bodyId => {
      if (seen.has(bodyId)) return false;
      seen.add(bodyId);
      return true;
    });

    if (cleanedSequence.length !== emailBodySequence.length) {
      setEmailBodySequence(cleanedSequence);
    }

    const validBodies = selectedEmailBodies.filter(bodyId => 
      cleanedSequence.includes(bodyId)
    );
    if (validBodies.length !== selectedEmailBodies.length) {
      setSelectedEmailBodies(validBodies);
    }
  }, [emailBodySequence, selectedEmailBodies]);

  // ========== API FUNCTIONS ==========

  const initializeData = useCallback(async () => {
    await Promise.all([
      fetchEmailBodies(),
      fetchSegments(),
      fetchCompanyInfo(),
      loadSavedCampaigns()
    ]);
  }, []);

  const fetchEmailBodies = useCallback(async () => {
    try {
      const response = await axios.get(ENDPOINTS.emailTemplates);
      setEmailBodies(response.data || []);
    } catch (error) {
      console.error('❌ Error fetching email templates:', error);
      setEmailBodies([]);
    }
  }, []);

  const fetchSegments = useCallback(async () => {
    try {
      const response = await axios.get(ENDPOINTS.segments);
      setSegments(response.data || []);
    } catch (error) {
      console.error('❌ Error fetching segments:', error);
      setSegments([]);
    }
  }, []);

  const fetchCompanyInfo = useCallback(async () => {
    try {
      const response = await axios.get(ENDPOINTS.companyInfo);
      setCompanyInfo(response.data);
    } catch (error) {
      console.error('❌ Error fetching company info:', error);
    }
  }, []);

  const loadSavedCampaigns = useCallback(() => {
    try {
      const savedCampaigns = localStorage.getItem('emailCampaigns');
      if (savedCampaigns) {
        setCampaigns(JSON.parse(savedCampaigns));
      }
    } catch (error) {
      console.error('❌ Error loading saved campaigns:', error);
      setError('Failed to load campaigns');
    }
  }, []);

  const persistCampaigns = useCallback(() => {
    if (campaigns.length > 0) {
      localStorage.setItem('emailCampaigns', JSON.stringify(campaigns));
    } else {
      localStorage.removeItem('emailCampaigns');
    }
  }, [campaigns]);

  const sendCampaignToServer = useCallback(async (campaign) => {
    const response = await axios.post(ENDPOINTS.sendCampaign, { campaign });
    if (!response.data.success) {
      throw new Error(response.data.message || 'Campaign sending failed');
    }
    return response.data.data;
  }, []);

  // ========== FORM VALIDATION & HELPER FUNCTIONS ==========

  const validateCampaignForm = useCallback(() => {
    if (!campaignName.trim()) return VALIDATION_MESSAGES.campaignName;
    if (selectedEmailBodies.length === 0) return VALIDATION_MESSAGES.emailBodies;
    if (selectedSegments.length === 0) return VALIDATION_MESSAGES.segments;
    if (scheduleMode === 'scheduled' && (!scheduledDate || !scheduledTime)) {
      return VALIDATION_MESSAGES.scheduledTime;
    }
    return null;
  }, [campaignName, selectedEmailBodies, selectedSegments, scheduleMode, scheduledDate, scheduledTime]);

  const validateCampaignSend = useCallback((campaign) => {
    if (campaign.status === CAMPAIGN_STATUS.SENT) {
      return 'This campaign has already been sent';
    }
    if (!campaign.recipients?.length) {
      return VALIDATION_MESSAGES.recipients;
    }
    if (!campaign.companyInfo) {
      return VALIDATION_MESSAGES.companyInfo;
    }
    return null;
  }, []);

  const formatScheduleDateTime = (dateString, timeString) => {
    if (!dateString || !timeString) return null;
    return new Date(`${dateString}T${timeString}`);
  };

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

  const totalRecipients = useMemo(
    () => calculateTotalRecipients(),
    [calculateTotalRecipients]
  );

  const isFormValid = useMemo(() => ({
    name: campaignName.trim().length > 0,
    bodies: selectedEmailBodies.length > 0,
    segments: selectedSegments.length > 0
  }), [campaignName, selectedEmailBodies, selectedSegments]);

  // ========== FORM STATE MANAGEMENT ==========

  const resetFormState = useCallback(() => {
    setSelectedEmailBodies([]);
    setSelectedSegments([]);
    setCampaignName('');
    setCampaignDescription('');
    setError(null);
    setScheduleMode('immediate');
    setScheduledDate('');
    setScheduledTime('');
    setEmailBodySequence([]);
  }, []);

  const handleCreateCampaign = useCallback(() => {
    setShowCreateForm(true);
    setError(null);
  }, []);

  const handleCancelCreate = useCallback(() => {
    setShowCreateForm(false);
    resetFormState();
  }, [resetFormState]);

  // ========== EMAIL BODY SELECTION HANDLERS ==========

  const handleEmailBodyToggle = useCallback((bodyId) => {
    setSelectedEmailBodies(prev => {
      const isSelected = prev.includes(bodyId);

      if (isSelected) {
        setEmailBodySequence(prevSeq => prevSeq.filter(id => id !== bodyId));
        return prev.filter(id => id !== bodyId);
      } else {
        setEmailBodySequence(prevSeq => 
          prevSeq.includes(bodyId) ? prevSeq : [...prevSeq, bodyId]
        );
        return [...prev, bodyId];
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

  const handleSelectAllBodies = useCallback(() => {
    const allBodyIds = emailBodies.map(body => body._id);

    if (selectedEmailBodies.length === emailBodies.length) {
      setSelectedEmailBodies([]);
      setEmailBodySequence([]);
    } else {
      setSelectedEmailBodies(allBodyIds);
      setEmailBodySequence(prevSeq => {
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

  // ========== SEGMENT SELECTION HANDLERS ==========

  const handleSegmentToggle = useCallback((segmentId) => {
    setSelectedSegments(prev =>
      prev.includes(segmentId)
        ? prev.filter(id => id !== segmentId)
        : [...prev, segmentId]
    );
  }, []);

  const handleSelectAllSegments = useCallback(() => {
    const allSegmentIds = segments.map(segment => segment._id);
    setSelectedSegments(
      selectedSegments.length === segments.length ? [] : allSegmentIds
    );
  }, [selectedSegments, segments]);

  const getContactCount = useCallback((segment) => {
    return segment?.contacts && Array.isArray(segment.contacts) 
      ? segment.contacts.length 
      : 0;
  }, []);

  // ========== CAMPAIGN SUBMISSION & SENDING ==========

  const handleSubmitCampaign = useCallback(() => {
    const validationError = validateCampaignForm();
    if (validationError) {
      setError(validationError);
      alert(validationError);
      return;
    }

    const selectedBodies = emailBodySequence
      .map(bodyId => emailBodies.find(body => body._id === bodyId))
      .filter(Boolean);

    const selectedSegmentObjects = segments.filter(segment =>
      selectedSegments.includes(segment._id)
    );

    const newCampaign = {
      id: Date.now().toString(),
      name: campaignName.trim(),
      description: campaignDescription.trim() || 'No description provided',
      emailBodies: selectedBodies,
      emailBodySequence: emailBodySequence,
      segments: selectedSegmentObjects,
      recipients: totalRecipients,
      createdAt: new Date(),
      status: scheduleMode === 'scheduled' 
        ? CAMPAIGN_STATUS.SCHEDULED 
        : CAMPAIGN_STATUS.READY,
      scheduledFor: scheduleMode === 'scheduled'
        ? formatScheduleDateTime(scheduledDate, scheduledTime)
        : null,
      sentCount: 0,
      companyInfo: companyInfo
    };

    setCampaigns(prev => [...prev, newCampaign]);
    const scheduleMsg = scheduleMode === 'scheduled'
      ? ` Campaign scheduled for ${new Date(newCampaign.scheduledFor).toLocaleString()}`
      : '';
    
    alert(
      `Campaign "${campaignName}" created successfully!${scheduleMsg}\n` +
      `Email bodies will be sent in sequence (${emailBodySequence.length} emails per recipient).`
    );
    
    setShowCreateForm(false);
    resetFormState();
  }, [campaignName, campaignDescription, selectedEmailBodies, selectedSegments, 
      emailBodies, emailBodySequence, segments, totalRecipients, companyInfo, 
      validateCampaignForm, resetFormState, scheduleMode, scheduledDate, scheduledTime]);

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
      setCampaigns(prev => prev.map(c =>
        c.id === campaignId
          ? {
              ...c,
              status: CAMPAIGN_STATUS.SENT,
              sentCount: campaign.recipients.length,
              sentAt: new Date(),
              deliveryStatus: 'Completed'
            }
          : c
      ));
      alert(`Campaign "${campaign.name}" sent successfully to ${campaign.recipients.length} recipients!`);
    } catch (error) {
      console.error('❌ Campaign send error:', error);
      alert(`Failed to send campaign: ${error.message}`);
    } finally {
      setSendingCampaign(null);
    }
  }, [campaigns, validateCampaignSend, sendCampaignToServer]);

  const handleAutoSendScheduledCampaign = useCallback(async (campaignId) => {
    const campaign = campaigns.find(c => c.id === campaignId);
    if (!campaign || campaign.status !== CAMPAIGN_STATUS.SCHEDULED) return;

    try {
      await sendCampaignToServer(campaign);
      setCampaigns(prev => prev.map(c =>
        c.id === campaignId
          ? { ...c, status: CAMPAIGN_STATUS.SENT, sentCount: campaign.recipients.length }
          : c
      ));
      console.log(`✅ Auto-sent scheduled campaign: ${campaign.name}`);
    } catch (error) {
      console.error('❌ Error auto-sending scheduled campaign:', error);
    }
  }, [campaigns, sendCampaignToServer]);

  // ========== CAMPAIGN MANAGEMENT ==========

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
        alert(`✅ Test email sent successfully to ${email}!`);
      } else {
        alert(`❌ Failed to send test email: ${response.data.message}`);
      }
    } catch (error) {
      alert(`❌ Error sending test email: ${error.response?.data?.message || error.message}`);
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
    alert(`✅ Campaign duplicated as "${duplicatedCampaign.name}"`);
  }, [campaigns]);

  // ========== RENDER ==========

  return (
    <div className="campaign-container">
      {/* Header */}
      <HeaderSection
        emailBodiesCount={emailBodies.length}
        segmentsCount={segments.length}
        onCreateClick={handleCreateCampaign}
        onTestEmailClick={handleSendTestEmail}
      />

      {/* Create Campaign Form */}
      {showCreateForm && (
        <FormSection
          campaignName={campaignName}
          setCampaignName={setCampaignName}
          campaignDescription={campaignDescription}
          setCampaignDescription={setCampaignDescription}
          emailBodies={emailBodies}
          selectedEmailBodies={selectedEmailBodies}
          emailBodySequence={emailBodySequence}
          onEmailBodyToggle={handleEmailBodyToggle}
          onSelectAllBodies={handleSelectAllBodies}
          onMoveUp={handleMoveBodyUp}
          onMoveDown={handleMoveBodyDown}
          segments={segments}
          selectedSegments={selectedSegments}
          onSegmentToggle={handleSegmentToggle}
          onSelectAllSegments={handleSelectAllSegments}
          getContactCount={getContactCount}
          totalRecipients={totalRecipients}
          scheduleMode={scheduleMode}
          setScheduleMode={setScheduleMode}
          scheduledDate={scheduledDate}
          setScheduledDate={setScheduledDate}
          scheduledTime={scheduledTime}
          setScheduledTime={setScheduledTime}
          isFormValid={isFormValid}
          onSubmit={handleSubmitCampaign}
          onCancel={handleCancelCreate}
        />
      )}

      {/* Campaigns List */}
      {!showCreateForm && (
        <CampaignsList
          campaigns={campaigns}
          sendingCampaign={sendingCampaign}
          onSendCampaign={handleSendCampaign}
          onDeleteCampaign={handleDeleteCampaign}
          onDuplicateCampaign={handleDuplicateCampaign}
          emailBodies={emailBodies}
          segments={segments}
          getContactCount={getContactCount}
          onCreateClick={handleCreateCampaign}
        />
      )}
    </div>
  );
}

// ============================================================================
// 3. SUB-COMPONENTS
// ============================================================================

function HeaderSection({ emailBodiesCount, segmentsCount, onCreateClick, onTestEmailClick }) {
  return (
    <div className="campaign-header">
      <h1>Email Campaigns</h1>
      <div className="campaign-header-actions">
        <div className="campaign-stats">
          {emailBodiesCount} Bodies | {segmentsCount} Segments
        </div>
        <button onClick={onCreateClick} className="campaign-btn campaign-btn-create">
          <span>+</span> Create Campaign
        </button>
        <button onClick={onTestEmailClick} className="campaign-btn campaign-btn-test">
          Send Test Email
        </button>
      </div>
    </div>
  );
}

function FormSection(props) {
  return (
    <div className="campaign-form">
      <h3>Create New Campaign</h3>

      {/* Campaign Name & Description */}
      <div className="campaign-form-grid">
        <div>
          <label className="campaign-form-label">Campaign Name *:</label>
          <input
            type="text"
            value={props.campaignName}
            onChange={(e) => props.setCampaignName(e.target.value)}
            placeholder="Enter campaign name..."
            className="campaign-form-input"
          />
        </div>
        <div>
          <label className="campaign-form-label">Campaign Description:</label>
          <input
            type="text"
            value={props.campaignDescription}
            onChange={(e) => props.setCampaignDescription(e.target.value)}
            placeholder="Enter campaign description..."
            className="campaign-form-input"
          />
        </div>
      </div>

      {/* Email Bodies Section */}
      <EmailBodiesSection
        emailBodies={props.emailBodies}
        selectedEmailBodies={props.selectedEmailBodies}
        emailBodySequence={props.emailBodySequence}
        onToggle={props.onEmailBodyToggle}
        onSelectAll={props.onSelectAllBodies}
        onMoveUp={props.onMoveUp}
        onMoveDown={props.onMoveDown}
      />

      {/* Segments Section */}
      <SegmentsSection
        segments={props.segments}
        selectedSegments={props.selectedSegments}
        onToggle={props.onSegmentToggle}
        onSelectAll={props.onSelectAllSegments}
        getContactCount={props.getContactCount}
        totalRecipients={props.totalRecipients}
      />

      {/* Scheduling Section */}
      <SchedulingSection
        scheduleMode={props.scheduleMode}
        setScheduleMode={props.setScheduleMode}
        scheduledDate={props.scheduledDate}
        setScheduledDate={props.setScheduledDate}
        scheduledTime={props.scheduledTime}
        setScheduledTime={props.setScheduledTime}
      />

      {/* Campaign Summary */}
      {props.selectedEmailBodies.length > 0 && props.selectedSegments.length > 0 && (
        <CampaignSummary
          selectedEmailBodies={props.selectedEmailBodies}
          selectedSegments={props.selectedSegments}
          totalRecipients={props.totalRecipients}
          emailBodySequence={props.emailBodySequence}
          emailBodies={props.emailBodies}
        />
      )}

      {/* Action Buttons */}
      <div className="campaign-action-buttons">
        <button
          onClick={props.onSubmit}
          disabled={!props.isFormValid.name || !props.isFormValid.bodies || !props.isFormValid.segments}
          className="campaign-btn-submit"
        >
          Create Campaign ({props.totalRecipients.length} recipients)
        </button>
        <button onClick={props.onCancel} className="campaign-btn-cancel">
          Cancel
        </button>
      </div>
    </div>
  );
}

function EmailBodiesSection(props) {
  if (props.emailBodies.length === 0) {
    return (
      <div className="campaign-form-section">
        <label className="campaign-form-label">
          Email Bodies ({props.selectedEmailBodies.length} selected):
        </label>
        <div className="campaign-warning-box">
          <p className="campaign-warning-text">
            No email bodies found. Please create an email body first in the Email Body Editor.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="campaign-form-section">
      <label className="campaign-form-label">
        Email Bodies ({props.selectedEmailBodies.length} selected):
      </label>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Available Bodies */}
        <div>
          <h5 style={STYLES.sectionHeader}>Available Email Bodies</h5>
          <div className="campaign-button-container">
            <button
              type="button"
              onClick={props.onSelectAll}
              className="campaign-selection-btn-all"
            >
              {props.selectedEmailBodies.length === props.emailBodies.length 
                ? 'Deselect All' 
                : 'Select All'}
            </button>
          </div>

          <div className="campaign-selection-list">
            {props.emailBodies.map((body) => {
              const isSelected = props.selectedEmailBodies.includes(body._id);
              return (
                <div
                  key={body._id}
                  className="campaign-selection-item"
                  onClick={() => props.onToggle(body._id)}
                  style={{
                    backgroundColor: isSelected ? COLORS.dark_panel : 'transparent',
                    borderLeft: isSelected ? `4px solid ${COLORS.accent_blue}` : 'none',
                    cursor: 'pointer',
                    opacity: isSelected ? 0.7 : 1
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => props.onToggle(body._id)}
                    className="campaign-checkbox"
                  />
                  <div className="campaign-selection-content">
                    <div className="campaign-selection-title">{body.name || 'Untitled'}</div>
                    <div className="campaign-selection-preview">
                      {body.content ? body.content.substring(0, 80) + '...' : 'No content available'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sequence */}
        <div>
          <h5 style={STYLES.sectionHeader}>Email Send Sequence ({props.emailBodySequence.length})</h5>

          {props.emailBodySequence.length === 0 ? (
            <div style={STYLES.emptyState}>
              <p style={{ margin: '0', fontSize: '14px' }}>
                Select email bodies from the left to add them to the sequence
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {props.emailBodySequence.map((bodyId, idx) => {
                const body = props.emailBodies.find(b => b._id === bodyId);
                const isFirst = idx === 0;
                const isLast = idx === props.emailBodySequence.length - 1;

                return (
                  <div key={bodyId} style={STYLES.sequenceItem}>
                    <div style={STYLES.sequenceNumber}>{idx + 1}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ color: COLORS.text_primary, fontWeight: '600', marginBottom: '4px' }}>
                        {body?.name || 'Untitled'}
                      </div>
                      <div style={{ fontSize: '12px', color: COLORS.text_tertiary }}>
                        {body?.content ? body.content.substring(0, 60) + '...' : 'No content'}
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flexShrink: 0 }}>
                      <button
                        onClick={() => props.onMoveUp(bodyId)}
                        disabled={isFirst}
                        style={{ ...STYLES.button.base, ...(isFirst ? STYLES.button.disabled : STYLES.button.primary) }}
                      >
                        Up
                      </button>
                      <button
                        onClick={() => props.onMoveDown(bodyId)}
                        disabled={isLast}
                        style={{ ...STYLES.button.base, ...(isLast ? STYLES.button.disabled : STYLES.button.primary) }}
                      >
                        Down
                      </button>
                      <button
                        onClick={() => props.onToggle(bodyId)}
                        style={{ ...STYLES.button.base, ...STYLES.button.danger }}
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
    </div>
  );
}

function SegmentsSection(props) {
  if (props.segments.length === 0) {
    return (
      <div className="campaign-form-section">
        <label className="campaign-form-label">
          Target Segments ({props.selectedSegments.length} selected):
        </label>
        <div className="campaign-warning-box">
          <p className="campaign-warning-text">
            No segments found. Please create segments first in the Contact Manager.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="campaign-form-section">
      <label className="campaign-form-label">
        Target Segments ({props.selectedSegments.length} selected):
      </label>

      <div className="campaign-segments-header">
        <button type="button" onClick={props.onSelectAll} className="campaign-selection-btn-segments">
          {props.selectedSegments.length === props.segments.length ? 'Deselect All' : 'Select All'} Segments
        </button>

        {props.selectedSegments.length > 0 && (
          <div className="campaign-recipients-count">
            Total Recipients: {props.totalRecipients.length} (deduplicated)
          </div>
        )}
      </div>

      <div className="campaign-selection-list">
        {props.segments.map((segment) => (
          <div
            key={segment._id}
            className="campaign-selection-item"
            onClick={() => props.onToggle(segment._id)}
          >
            <input
              type="checkbox"
              checked={props.selectedSegments.includes(segment._id)}
              onChange={() => props.onToggle(segment._id)}
              className="campaign-checkbox"
            />
            <div className="campaign-selection-content">
              <div className="campaign-segment-header-flex">
                <div>
                  <div className="campaign-segment-name">{segment.name}</div>
                  <div className="campaign-segment-description">
                    {segment.description || 'No description'}
                  </div>
                </div>
                <div className="campaign-contacts-badge">
                  {props.getContactCount(segment)} contacts
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SchedulingSection(props) {
  return (
    <div className="campaign-form-section">
      <label className="campaign-form-label">Send Timing:</label>

      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <input
            type="radio"
            name="scheduleMode"
            value="immediate"
            checked={props.scheduleMode === 'immediate'}
            onChange={(e) => props.setScheduleMode(e.target.value)}
          />
          <span style={{ color: COLORS.text_primary }}>Send Immediately</span>
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <input
            type="radio"
            name="scheduleMode"
            value="scheduled"
            checked={props.scheduleMode === 'scheduled'}
            onChange={(e) => props.setScheduleMode(e.target.value)}
          />
          <span style={{ color: COLORS.text_primary }}>Schedule for Later</span>
        </label>
      </div>

      {props.scheduleMode === 'scheduled' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '16px',
          padding: '16px',
          backgroundColor: COLORS.dark_light,
          borderRadius: '8px',
          borderLeft: `4px solid ${COLORS.accent_blue}`
        }}>
          <div>
            <label style={{ color: COLORS.text_secondary, fontSize: '12px', fontWeight: '600' }}>Date:</label>
            <input
              type="date"
              value={props.scheduledDate}
              onChange={(e) => props.setScheduledDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              style={{
                width: '100%',
                padding: '8px',
                marginTop: '6px',
                backgroundColor: COLORS.dark_panel,
                color: COLORS.text_primary,
                border: `1px solid ${COLORS.border_light}`,
                borderRadius: '4px',
                fontFamily: 'inherit'
              }}
            />
          </div>

          <div>
            <label style={{ color: COLORS.text_secondary, fontSize: '12px', fontWeight: '600' }}>Time:</label>
            <input
              type="time"
              value={props.scheduledTime}
              onChange={(e) => props.setScheduledTime(e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                marginTop: '6px',
                backgroundColor: COLORS.dark_panel,
                color: COLORS.text_primary,
                border: `1px solid ${COLORS.border_light}`,
                borderRadius: '4px',
                fontFamily: 'inherit'
              }}
            />
          </div>

          {props.scheduledDate && props.scheduledTime && (
            <div style={{
              gridColumn: '1 / -1',
              padding: '12px',
              backgroundColor: COLORS.dark_panel,
              borderRadius: '4px',
              borderLeft: `3px solid ${COLORS.accent_blue}`
            }}>
              <div style={{ color: COLORS.text_secondary, fontSize: '12px', marginBottom: '4px' }}>
                Scheduled Send Time:
              </div>
              <div style={{ color: COLORS.text_primary, fontSize: '14px', fontWeight: '600' }}>
                {new Date(`${props.scheduledDate}T${props.scheduledTime}`).toLocaleString()}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function CampaignSummary(props) {
  return (
    <div className="campaign-summary">
      <h4 className="campaign-summary-title">Campaign Summary</h4>

      {props.emailBodySequence.length > 0 && (
        <div style={{
          backgroundColor: COLORS.dark_light,
          padding: '16px',
          borderRadius: '8px',
          marginBottom: '16px',
          borderLeft: `4px solid ${COLORS.accent_blue}`
        }}>
          <div style={STYLES.sectionHeader}>Email Send Sequence</div>
          {props.emailBodySequence.map((bodyId, idx) => {
            const body = props.emailBodies.find(b => b._id === bodyId);
            return (
              <div key={bodyId} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '8px 0',
                borderBottom: idx < props.emailBodySequence.length - 1 ? `1px solid ${COLORS.border_color}` : 'none'
              }}>
                <div style={STYLES.smallSequenceNumber}>{idx + 1}</div>
                <div style={{ color: COLORS.text_primary, fontSize: '14px', fontWeight: '600' }}>
                  {body?.name || 'Untitled'}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="campaign-summary-grid">
        <div className="campaign-summary-item">
          <div className="campaign-summary-label">EMAIL BODIES</div>
          <div className="campaign-summary-value">{props.selectedEmailBodies.length}</div>
        </div>
        <div className="campaign-summary-item">
          <div className="campaign-summary-label">TARGET SEGMENTS</div>
          <div className="campaign-summary-value">{props.selectedSegments.length}</div>
        </div>
        <div className="campaign-summary-item">
          <div className="campaign-summary-label">TOTAL RECIPIENTS</div>
          <div className="campaign-summary-value">{props.totalRecipients.length}</div>
        </div>
      </div>
    </div>
  );
}

function CampaignsList(props) {
  if (props.campaigns.length === 0) {
    return (
      <div className="campaign-empty-state">
        <div className="campaign-empty-icon">Campaigns</div>
        <h3 className="campaign-empty-title">No campaigns yet</h3>
        <p className="campaign-empty-description">
          Create your first email campaign to start reaching your audience segments
        </p>
        <button onClick={props.onCreateClick} className="campaign-empty-btn">
          Get Started
        </button>
      </div>
    );
  }

  return (
    <div>
      <h3 className="campaign-list-title">Your Campaigns ({props.campaigns.length})</h3>
      {props.campaigns.map((campaign) => (
        <CampaignCard
          key={campaign.id}
          campaign={campaign}
          isSending={props.sendingCampaign === campaign.id}
          onSend={() => props.onSendCampaign(campaign.id)}
          onDelete={() => props.onDeleteCampaign(campaign.id)}
          onDuplicate={() => props.onDuplicateCampaign(campaign.id)}
          emailBodies={props.emailBodies}
          segments={props.segments}
          getContactCount={props.getContactCount}
        />
      ))}
    </div>
  );
}

function CampaignCard(props) {
  const { campaign, isSending, onSend, onDelete, onDuplicate, emailBodies, segments, getContactCount } = props;

  return (
    <div className={`campaign-card${campaign.status === 'Sent' ? ' campaign-card-sent' : ''}`}>
      {/* Header */}
      <div className="campaign-card-header">
        <div>
          <h4 className="campaign-card-title">{campaign.name}</h4>
          <p className="campaign-card-description">{campaign.description}</p>
          <div className="campaign-card-meta">
            <span>Created: {new Date(campaign.createdAt).toLocaleDateString()}</span>
            <span className={`campaign-card-status campaign-status-${
              campaign.status === CAMPAIGN_STATUS.SENT ? 'sent' : 
              campaign.status === CAMPAIGN_STATUS.READY ? 'ready' : 
              campaign.status === CAMPAIGN_STATUS.SCHEDULED ? 'scheduled' : 'draft'
            }`}>
              Status: {campaign.status}
            </span>
            {campaign.status === CAMPAIGN_STATUS.SCHEDULED && campaign.scheduledFor && (
              <span title={new Date(campaign.scheduledFor).toLocaleString()}>
                📅 Scheduled for {new Date(campaign.scheduledFor).toLocaleDateString()}
              </span>
            )}
            {campaign.sentCount > 0 && <span>Sent to: {campaign.sentCount} recipients</span>}
          </div>
        </div>

        {/* Actions */}
        <div className="campaign-card-actions">
          {isSending ? (
            <div className="campaign-card-sending">📤 Sending...</div>
          ) : (
            <button
              onClick={onSend}
              disabled={campaign.status === CAMPAIGN_STATUS.SENT || !campaign.recipients?.length}
              className="campaign-card-btn-send"
            >
              {campaign.status === CAMPAIGN_STATUS.SENT 
                ? 'Sent' 
                : `Send Now (${campaign.recipients?.length || 0})`}
            </button>
          )}
          <button onClick={onDuplicate} className="campaign-card-btn-duplicate" title="Duplicate">
            Copy
          </button>
          <button onClick={onDelete} className="campaign-card-btn-delete" title="Delete">
            Delete
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="campaign-card-content-grid">
        <div className="campaign-card-section">
          <h5 className="campaign-card-section-title">
            Email Bodies ({campaign.emailBodies?.length || 0}):
          </h5>
          <div className="campaign-card-items-list">
            {campaign.emailBodies?.map((body, idx) => (
              <div key={body._id} className="campaign-card-item" style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px'
              }}>
                <div style={STYLES.smallSequenceNumber}>{idx + 1}</div>
                <div style={{ flex: 1 }}>
                  <div className="campaign-card-item-name">{body.name || 'Untitled'}</div>
                  <div className="campaign-card-item-preview">
                    {body.content ? body.content.substring(0, 80) + '...' : 'No content'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="campaign-card-section">
          <h5 className="campaign-card-section-title">
            Target Segments ({campaign.segments?.length || 0}):
          </h5>
          <div className="campaign-card-items-list">
            {campaign.segments?.map((segment) => (
              <div key={segment._id} className="campaign-segment-item">
                <div>
                  <div className="campaign-segment-item-name">{segment.name}</div>
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

      {/* Stats */}
      <div className="campaign-card-stats">
        <div className="campaign-card-stats-grid">
          <div className="campaign-card-stat-item">
            <div className="campaign-card-stat-value">{campaign.recipients?.length || 0}</div>
            <div className="campaign-card-stat-label">Recipients</div>
          </div>
          <div className="campaign-card-stat-item">
            <div className="campaign-card-stat-value">{campaign.emailBodies?.length || 0}</div>
            <div className="campaign-card-stat-label">Email Bodies</div>
          </div>
          <div className="campaign-card-stat-item">
            <div className="campaign-card-stat-value">{campaign.segments?.length || 0}</div>
            <div className="campaign-card-stat-label">Segments</div>
          </div>
          {campaign.status === 'Sent' && (
            <div className="campaign-card-stat-item">
              <div className="campaign-card-stat-value">100%</div>
              <div className="campaign-card-stat-label">Delivered</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
