import { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001';
const ENDPOINTS = {
  emailTemplates: `${API_BASE_URL}/email-templates`,
  segments: `${API_BASE_URL}/segments`,
  companyInfo: `${API_BASE_URL}/company-info`,
  sendCampaign: `${API_BASE_URL}/send-campaign`,
  sendTestEmail: `${API_BASE_URL}/send-test-email`,
  emailCampaigns: `${API_BASE_URL}/email-campaigns`
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
  
  // ========== SCHEDULING STATE ==========
  const [scheduleMode, setScheduleMode] = useState('immediate'); // 'immediate' or 'scheduled'
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [scheduledCampaigns, setScheduledCampaigns] = useState([]);

  // ========== API & DATA FUNCTIONS ==========
  const fetchEmailBodies = useCallback(async () => {
    try {
      const response = await axios.get(ENDPOINTS.emailTemplates);
      console.log('✅ Fetched email templates:', {
        count: response.data?.length || 0,
        templates: response.data?.map(t => ({
          id: t._id,
          name: t.name,
          subject: t.subject,
          hasContent: !!t.content
        })) || []
      });
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

  const initializeData = useCallback(async () => {
    console.log('🔄 Initializing component data...');
    await Promise.all([
      fetchEmailBodies(),
      fetchSegments(),
      fetchCompanyInfo()
    ]);
  }, [fetchEmailBodies, fetchSegments, fetchCompanyInfo]);

  const loadSavedCampaigns = useCallback(async () => {
    try {
      const response = await axios.get(ENDPOINTS.emailCampaigns);
      console.log('📥 Fetched campaigns from database:', response.data?.length || 0);
      
      // Populate email bodies for each campaign using current emailBodies state
      const campaignsWithBodies = (response.data || []).map(campaign => {
        // If emailBodies is empty but emailBodySequence has IDs, populate from local state
        if ((!campaign.emailBodies || campaign.emailBodies.length === 0) && 
            campaign.emailBodySequence && campaign.emailBodySequence.length > 0) {
          campaign.emailBodies = campaign.emailBodySequence
            .map(bodyId => {
              // Handle both ObjectId and string comparisons
              return emailBodies.find(b => 
                b._id?.toString?.() === bodyId?.toString?.() ||
                b._id === bodyId ||
                b._id?.toString?.() === bodyId?.id?.toString?.()
              );
            })
            .filter(Boolean);
          console.log(`  Campaign "${campaign.name}": Populated ${campaign.emailBodies.length} email bodies`);
        }
        return campaign;
      });
      
      setCampaigns(campaignsWithBodies);
    } catch (error) {
      console.error('❌ Error loading campaigns from server:', error);
      setCampaigns([]);
    }
  }, [emailBodies]);

  // ========== EFFECTS ==========
  useEffect(() => {
    initializeData();
  }, [initializeData]);

  // Load campaigns after email bodies are fetched
  useEffect(() => {
    if (emailBodies.length > 0) {
      loadSavedCampaigns();
    }
  }, [emailBodies, loadSavedCampaigns]);

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

  // ========== TEMPLATE VARIABLE REPLACEMENT ==========
  const replaceTemplateVariables = useCallback((template, data) => {
    if (!template) return '';
    
    let content = template;
    const variables = {
      '{{companyName}}': data?.companyName || 'Company',
      '{{companyEmail}}': data?.companyEmail || 'contact@company.com',
      '{{companyPhone}}': data?.companyPhone || '+1-800-0000',
      '{{companyWebsite}}': data?.companyWebsite || 'www.company.com',
      '{{companyAddress}}': data?.companyAddress || 'Company Address',
      '{{logo}}': data?.logo || '[Company Logo]',
      '{{socialLinks}}': data?.socialLinks || '',
      '{{footerText}}': data?.footerText || 'Best regards, ' + (data?.companyName || 'Company'),
      '{{currentYear}}': new Date().getFullYear().toString(),
      '{{currentDate}}': new Date().toLocaleDateString(),
      '{{recipientName}}': '[Recipient Name]'
    };

    Object.entries(variables).forEach(([placeholder, value]) => {
      const regex = new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      content = content.replace(regex, value || '');
    });

    return content;
  }, []);

  // ========== SCHEDULING HELPER FUNCTIONS ==========
  const getScheduledCountdown = useCallback((scheduledTime) => {
    const now = new Date();
    const scheduled = new Date(scheduledTime);
    const diff = scheduled - now;
    
    if (diff < 0) return 'Ready to send';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  }, []);

  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 5); // Minimum 5 minutes in future
    return now.toISOString().slice(0, 16);
  };

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
    setScheduleMode('immediate');
    setScheduledDate('');
    setScheduledTime('');
  }, []);

  const validateCampaignForm = useCallback(() => {
    if (!campaignName.trim()) return VALIDATION_MESSAGES.campaignName;
    if (selectedEmailBodies.length === 0) return VALIDATION_MESSAGES.emailBodies;
    if (selectedSegments.length === 0) return VALIDATION_MESSAGES.segments;
    if (scheduleMode === 'scheduled' && (!scheduledDate || !scheduledTime)) {
      return VALIDATION_MESSAGES.scheduledTime;
    }
    return null;
  }, [campaignName, selectedEmailBodies, selectedSegments, scheduleMode, scheduledDate, scheduledTime]);

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
  const handleSubmitCampaign = useCallback(async () => {
    const validationError = validateCampaignForm();
    if (validationError) {
      setError(validationError);
      alert(validationError);
      return;
    }

    setLoading(true);
    try {
      // Get email bodies in the selected sequence order
      const selectedBodies = emailBodySequence.map(bodyId => 
        emailBodies.find(body => body._id === bodyId)
      ).filter(Boolean);
      
      const selectedSegmentObjects = segments.filter(segment => selectedSegments.includes(segment._id));

      const campaignData = {
        name: campaignName.trim(),
        description: campaignDescription.trim() || 'No description provided',
        emailBodies: emailBodySequence,
        emailBodySequence: emailBodySequence,
        targetSegments: selectedSegments,
        recipients: totalRecipients,
        totalRecipients: totalRecipients.length,
        status: scheduleMode === 'scheduled' ? CAMPAIGN_STATUS.SCHEDULED : CAMPAIGN_STATUS.READY,
        scheduledAt: scheduleMode === 'scheduled' ? formatScheduleDateTime(scheduledDate, scheduledTime) : null
      };

      console.log('📧 Sending campaign data:', {
        emailBodyIds: emailBodySequence,
        segmentIds: selectedSegments,
        recipientCount: totalRecipients.length
      });

      const response = await axios.post(ENDPOINTS.emailCampaigns, campaignData);
      let newCampaign = response.data.campaign || response.data;
      
      console.log('✅ Campaign created with data:', {
        emailBodies: newCampaign.emailBodies?.length || 0,
        targetSegments: newCampaign.targetSegments?.length || 0,
        emailBodySequence: newCampaign.emailBodySequence?.length || 0,
        fullCampaign: newCampaign
      });
      
      // Populate email bodies for newly created campaign
      if ((!newCampaign.emailBodies || newCampaign.emailBodies.length === 0) && 
          newCampaign.emailBodySequence && newCampaign.emailBodySequence.length > 0) {
        newCampaign.emailBodies = newCampaign.emailBodySequence
          .map(bodyId => {
            const idStr = bodyId?._id?.toString?.() || bodyId?.toString?.() || bodyId;
            return emailBodies.find(b => 
              b._id?.toString?.() === idStr || 
              b._id === idStr ||
              b._id?.toString?.() === bodyId?.toString?.()
            );
          })
          .filter(Boolean);
        console.log(`✅ Populated ${newCampaign.emailBodies.length} email bodies for new campaign`);
      }
      
      setCampaigns(prev => [...prev, newCampaign]);
      const scheduleMsg = scheduleMode === 'scheduled' 
        ? ` Campaign scheduled for ${new Date(campaignData.scheduledAt).toLocaleString()}`
        : '';
      alert(`Campaign "${campaignName}" created successfully!${scheduleMsg} Email bodies will be sent in sequence (${emailBodySequence.length} emails per recipient).`);
      setShowCreateForm(false);
      resetFormState();
      setEmailBodySequence([]);
    } catch (error) {
      console.error('Error creating campaign:', error);
      const errorMsg = error.response?.data?.message || error.message;
      alert(`Failed to create campaign: ${errorMsg}`);
      setError(`Failed to create campaign: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  }, [campaignName, campaignDescription, emailBodySequence, selectedSegments, emailBodies, totalRecipients, companyInfo, validateCampaignForm, resetFormState, scheduleMode, scheduledDate, scheduledTime]);

  // ========== CAMPAIGN SEND ==========
  const validateCampaignSend = useCallback((campaign) => {
    if (campaign.status === CAMPAIGN_STATUS.SENT) return 'This campaign has already been sent';
    if (!campaign.recipients?.length) return VALIDATION_MESSAGES.recipients;
    if (!campaign.companyInfo) return VALIDATION_MESSAGES.companyInfo;
    return null;
  }, []);

  const sendCampaignToServer = useCallback(async (campaign) => {
    console.log('🔍 DEBUG - Campaign data:', {
      name: campaign.name,
      emailBodies: campaign.emailBodies,
      emailBodySequence: campaign.emailBodySequence,
      recipients: campaign.recipients?.length
    });
    
    // Get email bodies - they might be full objects or just IDs from database
    let emailBodiesToSend = [];
    
    // Try to use emailBodySequence IDs first (correct order)
    if (campaign.emailBodySequence && campaign.emailBodySequence.length > 0) {
      console.log('📥 Using emailBodySequence to fetch bodies...');
      emailBodiesToSend = campaign.emailBodySequence
        .map(bodyId => {
          // Handle both ObjectId and string
          const idStr = bodyId?._id?.toString?.() || bodyId?.toString?.() || bodyId;
          const body = emailBodies.find(b => 
            b._id?.toString?.() === idStr || 
            b._id === idStr ||
            b._id?.toString?.() === bodyId?.toString?.() ||
            b._id === bodyId
          );
          console.log('  Searching for:', { bodyId, idStr, found: !!body });
          return body;
        })
        .filter(Boolean);
    }
    
    // Fallback: try emailBodies array if sequence didn't work
    if (emailBodiesToSend.length === 0 && campaign.emailBodies && campaign.emailBodies.length > 0) {
      console.log('📥 Fallback: Using emailBodies array...');
      emailBodiesToSend = campaign.emailBodies
        .filter(body => body && (body.name || body.content)); // Only include full objects
    }

    console.log('✅ Email bodies found:', emailBodiesToSend.length);

    if (emailBodiesToSend.length === 0) {
      console.error('❌ No email bodies available:', {
        emailBodies: campaign.emailBodies,
        emailBodySequence: campaign.emailBodySequence,
        localEmailBodiesCount: emailBodies.length
      });
      throw new Error('No email bodies found for this campaign');
    }

    const campaignWithReplacedContent = {
      ...campaign,
      emailBodies: emailBodiesToSend.map(body => ({
        ...body,
        content: replaceTemplateVariables(body.content, campaign.companyInfo),
        subject: replaceTemplateVariables(body.subject || '', campaign.companyInfo)
      }))
    };

    console.log('Sending campaign to server:', {
      name: campaignWithReplacedContent.name,
      recipientsCount: campaignWithReplacedContent.recipients?.length || 0,
      emailBodiesCount: campaignWithReplacedContent.emailBodies?.length || 0,
      companyInfoInCampaign: campaignWithReplacedContent.companyInfo
    });

    const response = await axios.post(ENDPOINTS.sendCampaign, { campaign: campaignWithReplacedContent });
    
    console.log('✅ Server response:', response.data);
    
    if (!response.data.success) throw new Error(response.data.message || 'Campaign sending failed');
    return response.data.data;
  }, [emailBodies, replaceTemplateVariables]);

  const updateCampaignStatus = useCallback((campaignId, recipientCount) => {
    setCampaigns(prev => prev.map(c => 
      c._id === campaignId 
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
    const campaign = campaigns.find(c => c._id === campaignId);
    if (!campaign) return;

    // Attach company info to campaign before validation
    const campaignWithInfo = { ...campaign, companyInfo };

    const validationError = validateCampaignSend(campaignWithInfo);
    if (validationError) {
      alert(validationError);
      return;
    }

    const confirmMessage = `Send campaign "${campaign.name}" to ${campaign.recipients.length} recipients?`;
    if (!window.confirm(confirmMessage)) return;

    setSendingCampaign(campaignId);

    try {
      await sendCampaignToServer(campaignWithInfo);
      updateCampaignStatus(campaignId, campaign.recipients.length);
      alert(`Campaign "${campaign.name}" sent successfully to ${campaign.recipients.length} recipients!`);
    } catch (error) {
      console.error('Campaign send error:', error);
      alert(`Failed to send campaign: ${error.message}`);
    } finally {
      setSendingCampaign(null);
    }
  }, [campaigns, companyInfo, validateCampaignSend, sendCampaignToServer, updateCampaignStatus]);

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
    const campaign = campaigns.find(c => c._id === campaignId);
    if (!campaign) return;
    
    if (window.confirm(`Are you sure you want to delete campaign "${campaign.name}"?`)) {
      setLoading(true);
      axios.delete(`${ENDPOINTS.emailCampaigns}/${campaignId}`)
        .then(() => {
          setCampaigns(prev => prev.filter(c => c._id !== campaignId));
          alert('Campaign deleted successfully');
        })
        .catch(error => {
          console.error('Error deleting campaign:', error);
          alert('Failed to delete campaign: ' + (error.response?.data?.message || error.message));
        })
        .finally(() => setLoading(false));
    }
  }, [campaigns]);

  const handleDeleteMultipleCampaigns = useCallback((campaignIds) => {
    if (!Array.isArray(campaignIds) || campaignIds.length === 0) {
      alert('Please select at least one campaign to delete');
      return;
    }

    const count = campaignIds.length;
    if (window.confirm(`Are you sure you want to delete ${count} campaign${count > 1 ? 's' : ''}? This action cannot be undone.`)) {
      setLoading(true);
      axios.post(`${ENDPOINTS.emailCampaigns}/delete-many`, { ids: campaignIds })
        .then((response) => {
          const deletedCount = response.data.deletedCount || count;
          setCampaigns(prev => prev.filter(c => !campaignIds.includes(c._id)));
          alert(`${deletedCount} campaign${deletedCount > 1 ? 's' : ''} deleted successfully`);
        })
        .catch(error => {
          console.error('Error deleting campaigns:', error);
          alert('Failed to delete campaigns: ' + (error.response?.data?.message || error.message));
        })
        .finally(() => setLoading(false));
    }
  }, []);

  const handleDuplicateCampaign = useCallback((campaignId) => {
    const campaign = campaigns.find(c => c._id === campaignId);
    if (!campaign) return;

    const duplicatedCampaign = {
      ...campaign,
      _id: undefined, // Let server generate new ID
      name: `${campaign.name} (Copy)`,
      status: CAMPAIGN_STATUS.READY,
      sentCount: 0,
      sentAt: null,
      deliveryStatus: null,
      createdAt: new Date()
    };

    // Extract email body IDs - prefer emailBodySequence, fallback to emailBodies
    const emailBodyIds = campaign.emailBodySequence?.length > 0 
      ? campaign.emailBodySequence.map(b => b?._id || b)
      : campaign.emailBodies?.map(b => b?._id || b) || [];
    
    // Extract segment IDs
    const segmentIds = campaign.targetSegments?.map(s => s?._id || s) || [];

    console.log('📋 Duplicating campaign:', {
      originalName: campaign.name,
      emailBodyIds,
      segmentIds,
      recipientCount: campaign.recipients?.length || 0
    });

    // Save to database instead of just local state
    axios.post(ENDPOINTS.emailCampaigns, {
      name: duplicatedCampaign.name,
      description: duplicatedCampaign.description,
      emailBodies: emailBodyIds,
      emailBodySequence: emailBodyIds,
      targetSegments: segmentIds,
      recipients: duplicatedCampaign.recipients || [],
      totalRecipients: duplicatedCampaign.totalRecipients || duplicatedCampaign.recipients?.length || 0,
      status: CAMPAIGN_STATUS.READY,
      scheduledAt: null
    }).then(response => {
      let newCampaign = response.data.campaign;
      
      console.log('✅ Campaign duplicated:', {
        newName: newCampaign.name,
        emailBodiesCount: newCampaign.emailBodySequence?.length || 0,
        segmentsCount: newCampaign.targetSegments?.length || 0
      });
      
      // Populate email bodies for duplicated campaign
      if ((!newCampaign.emailBodies || newCampaign.emailBodies.length === 0) && 
          newCampaign.emailBodySequence && newCampaign.emailBodySequence.length > 0) {
        newCampaign.emailBodies = newCampaign.emailBodySequence
          .map(bodyId => {
            const idStr = bodyId?._id?.toString?.() || bodyId?.toString?.() || bodyId;
            return emailBodies.find(b => 
              b._id?.toString?.() === idStr || 
              b._id === idStr ||
              b._id?.toString?.() === bodyId?.toString?.()
            );
          })
          .filter(Boolean);
        console.log(`✅ Populated ${newCampaign.emailBodies.length} email bodies for duplicated campaign`);
      }
      
      setCampaigns(prev => [...prev, newCampaign]);
      alert(`Campaign duplicated as "${newCampaign.name}"`);
    }).catch(error => {
      console.error('Error duplicating campaign:', error);
      alert(`Failed to duplicate campaign: ${error.message}`);
    });
  }, [campaigns, emailBodies]);

  // ========== SCHEDULED CAMPAIGNS CHECK ==========
  useEffect(() => {
    const checkScheduledCampaigns = async () => {
      const now = new Date();
      const campaignsToSend = campaigns.filter(campaign => 
        campaign.status === CAMPAIGN_STATUS.SCHEDULED && 
        campaign.scheduledFor &&
        new Date(campaign.scheduledFor) <= now
      );
      
      for (const campaign of campaignsToSend) {
        try {
          const campaignWithReplacedContent = {
            ...campaign,
            emailBodies: campaign.emailBodies?.map(body => ({
              ...body,
              content: replaceTemplateVariables(body.content, campaign.companyInfo),
              subject: replaceTemplateVariables(body.subject || '', campaign.companyInfo)
            })) || []
          };
          await axios.post(ENDPOINTS.sendCampaign, { campaign: campaignWithReplacedContent });
          setCampaigns(prev => prev.map(c => 
            c._id === campaign._id 
              ? { 
                  ...c, 
                  status: CAMPAIGN_STATUS.SENT, 
                  sentCount: campaign.recipients?.length || 0,
                  sentAt: new Date(),
                  deliveryStatus: 'Completed'
                }
              : c
          ));
        } catch (error) {
          console.error('Error auto-sending scheduled campaign:', error);
        }
      }
    };

    const interval = setInterval(checkScheduledCampaigns, 60000);
    checkScheduledCampaigns(); // Check immediately on mount
    return () => clearInterval(interval);
  }, [campaigns, replaceTemplateVariables]);

  return (
    <div className="w-full bg-zinc-950 text-white p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-4xl font-bold text-white">Email Campaigns</h1>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="bg-zinc-800 px-4 py-2 rounded text-sm text-white font-medium">
            {emailBodies.length} Bodies | {segments.length} Segments
          </div>
          
          <button
            onClick={handleCreateCampaign}
            className="bg-lime-500 hover:bg-lime-600 text-black px-4 py-2 rounded font-semibold flex items-center gap-2 justify-center cursor-pointer"
          >
            <span>+</span>
            Create Campaign
          </button>

          <button
            onClick={handleSendTestEmail}
            className="bg-zinc-700 hover:bg-zinc-600 text-white px-4 py-2 rounded font-semibold"
          >
            Send Test Email
          </button>
        </div>
      </div>

      {/* Create Campaign Form */}
      {showCreateForm && (
        <div className="bg-zinc-800 rounded-lg p-6 mb-6 border border-lime-500">
          <h3 className="text-2xl font-bold mb-6 text-lime-400">Create New Campaign</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-lime-300 text-sm font-semibold mb-2">
                Campaign Name *:
              </label>
              <input
                type="text"
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                placeholder="Enter campaign name..."
                className="w-full bg-zinc-700 border border-lime-600 text-white px-3 py-2 rounded focus:outline-none focus:border-lime-400"
              />
            </div>

            <div>
              <label className="block text-lime-300 text-sm font-semibold mb-2">
                Campaign Description:
              </label>
              <input
                type="text"
                value={campaignDescription}
                onChange={(e) => setCampaignDescription(e.target.value)}
                placeholder="Enter campaign description..."
                className="w-full bg-zinc-700 border border-lime-600 text-white px-3 py-2 rounded focus:outline-none focus:border-lime-400"
              />
            </div>
          </div>
          
          {/* Email Bodies Selection */}
          <div className="mb-6">
            <label className="block text-lime-300 text-sm font-semibold mb-3">
              Email Bodies ({selectedEmailBodies.length} selected):
            </label>
            
            {emailBodies.length === 0 ? (
              <div className="bg-lime-900 border border-lime-700 rounded p-3 text-lime-200 text-sm">
                <p className="m-0">
                  No email bodies found. Please create an email body first in the Email Body Editor.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* ===== LEFT: AVAILABLE BODIES ===== */}
                <div>
                  <h5 className="text-lime-300 text-xs uppercase font-semibold mb-3">
                    Available Email Bodies
                  </h5>
                  <div className="mb-3">
                    <button
                      type="button"
                      onClick={handleSelectAllBodies}
                      className="w-full bg-lime-500 hover:bg-lime-600 text-black px-3 py-2 rounded text-sm font-semibold"
                    >
                      {selectedEmailBodies.length === emailBodies.length ? 'Deselect All' : 'Select All'}
                    </button>
                  </div>

                  <div className="space-y-2">
                    {emailBodies.map((body) => {
                      const isSelected = selectedEmailBodies.includes(body._id);
                      
                      return (
                        <div
                          key={body._id}
                          className={`p-3 rounded cursor-pointer transition ${
                            isSelected 
                              ? 'bg-lime-900 border-l-4 border-lime-400 text-white' 
                              : 'bg-zinc-700 hover:bg-zinc-600 text-white'
                          }`}
                          onClick={() => handleEmailBodyToggle(body._id)}
                        >
                          <div className="flex gap-3">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleEmailBodyToggle(body._id)}
                              className="mt-1 cursor-pointer"
                            />
                            <div className="flex-1">
                              <div className="text-white font-semibold">
                                {body.name || 'Untitled'}
                              </div>
                              <div className="text-zinc-300 text-sm mt-1">
                                {body.content ? 
                                  body.content.substring(0, 80) + '...' : 
                                  'No content available'
                                }
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* ===== RIGHT: SELECTED SEQUENCE ===== */}
                <div>
                  <h5 className="text-lime-300 text-xs uppercase font-semibold mb-3">
                    Email Send Sequence ({emailBodySequence.length})
                  </h5>
                  
                  {emailBodySequence.length === 0 ? (
                    <div className="bg-zinc-700 border-2 border-dashed border-lime-500 rounded p-5 text-center text-zinc-300">
                      <p className="m-0 text-sm">
                        Select email bodies from the left to add them to the sequence
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {emailBodySequence.map((bodyId, idx) => {
                        const body = emailBodies.find(b => b._id === bodyId);
                        const isFirst = idx === 0;
                        const isLast = idx === emailBodySequence.length - 1;
                        
                        return (
                          <div
                            key={bodyId}
                            className="bg-zinc-700 border-l-4 border-lime-500 rounded p-4 flex gap-3 items-start"
                          >
                            <div className="flex items-center justify-center min-w-9 h-9 bg-lime-500 text-black rounded-full text-sm font-bold flex-shrink-0">
                              {idx + 1}
                            </div>

                            <div className="flex-1">
                              <div className="text-white font-semibold mb-1">
                                {body?.name || 'Untitled'}
                              </div>
                              <div className="text-zinc-300 text-xs">
                                {body?.content ? 
                                  body.content.substring(0, 60) + '...' : 
                                  'No content'
                                }
                              </div>
                            </div>

                            <div className="flex flex-col gap-2 flex-shrink-0">
                              <button
                                onClick={() => handleMoveBodyUp(bodyId)}
                                disabled={isFirst}
                                className={`px-2 py-1 text-xs font-semibold rounded ${
                                  isFirst 
                                    ? 'bg-zinc-400 text-white cursor-not-allowed opacity-75' 
                                    : 'bg-lime-500 hover:bg-lime-600 text-black'
                                }`}
                                title="Move up in sequence"
                              >
                                Up
                              </button>
                              <button
                                onClick={() => handleMoveBodyDown(bodyId)}
                                disabled={isLast}
                                className={`px-2 py-1 text-xs font-semibold rounded ${
                                  isLast 
                                    ? 'bg-zinc-400 text-white cursor-not-allowed opacity-75' 
                                    : 'bg-lime-500 hover:bg-lime-600 text-black'
                                }`}
                                title="Move down in sequence"
                              >
                                Down
                              </button>
                              <button
                                onClick={() => handleEmailBodyToggle(bodyId)}
                                className="px-2 py-1 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white rounded"
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
          <div className="mb-6">
            <label className="block text-lime-300 text-sm font-semibold mb-3">
              Target Segments ({selectedSegments.length} selected):
            </label>
            
            {segments.length === 0 ? (
              <div className="bg-lime-900 border-2 border-lime-500 rounded p-3 text-lime-100 text-sm">
                <p className="m-0">
                  No segments found. Please create segments first in the Contact Manager.
                </p>
              </div>
            ) : (
              <div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                  <button
                    type="button"
                    onClick={handleSelectAllSegments}
                    className="bg-lime-500 hover:bg-lime-600 text-black px-4 py-2 rounded font-semibold text-sm"
                  >
                    {selectedSegments.length === segments.length ? 'Deselect All' : 'Select All'} Segments
                  </button>
                  
                  {selectedSegments.length > 0 && (
                    <div className="text-lime-300 text-sm font-semibold">
                      Total Recipients: {totalRecipients.length} (deduplicated)
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  {segments.map((segment) => (
                    <div
                      key={segment._id}
                      className="bg-zinc-700 p-3 rounded cursor-pointer hover:bg-zinc-600 transition"
                      onClick={() => handleSegmentToggle(segment._id)}
                    >
                      <div className="flex gap-3 items-start">
                        <input
                          type="checkbox"
                          checked={selectedSegments.includes(segment._id)}
                          onChange={() => handleSegmentToggle(segment._id)}
                          className="mt-1 cursor-pointer"
                        />
                        <div className="flex-1">
                          <div className="text-white font-semibold">
                            {segment.name}
                          </div>
                          <div className="text-zinc-300 text-sm mt-1">
                            {segment.description || 'No description'}
                          </div>
                        </div>
                        <div className="bg-lime-500 text-black text-xs px-2 py-1 rounded font-semibold flex-shrink-0">
                          {getContactCount(segment)} contacts
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Scheduling Section */}
          <div className="mb-6">
            <label className="block text-lime-300 text-sm font-semibold mb-3">
              Send Timing:
            </label>
            
            <div className="flex flex-col sm:flex-row gap-5 mb-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="scheduleMode"
                  value="immediate"
                  checked={scheduleMode === 'immediate'}
                  onChange={(e) => setScheduleMode(e.target.value)}
                  className="cursor-pointer"
                />
                <span className="text-white">Send Immediately</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="scheduleMode"
                  value="scheduled"
                  checked={scheduleMode === 'scheduled'}
                  onChange={(e) => setScheduleMode(e.target.value)}
                  className="cursor-pointer"
                />
                <span className="text-white">Schedule for Later</span>
              </label>
            </div>

            {scheduleMode === 'scheduled' && (
              <div className="bg-zinc-700 border-l-4 border-lime-500 rounded p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-lime-300 text-xs uppercase font-semibold mb-2">
                    Date:
                  </label>
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full bg-zinc-700 border border-lime-600 text-white px-3 py-2 rounded font-inherit focus:outline-none focus:border-lime-400"
                  />
                </div>
                
                <div>
                  <label className="text-lime-300 text-xs uppercase font-semibold mb-2">
                    Time:
                  </label>
                  <input
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="w-full bg-zinc-700 border border-lime-600 text-white px-3 py-2 rounded font-inherit focus:outline-none focus:border-lime-400"
                  />
                </div>

                {scheduledDate && scheduledTime && (
                  <div className="md:col-span-2 bg-zinc-700 border-l-4 border-lime-500 rounded p-3">
                    <div className="text-lime-300 text-xs uppercase font-semibold mb-1">
                      Scheduled Send Time:
                    </div>
                    <div className="text-white text-sm font-semibold">
                      {new Date(`${scheduledDate}T${scheduledTime}`).toLocaleString()}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Campaign Summary */}
          {selectedEmailBodies.length > 0 && selectedSegments.length > 0 && (
            <div className="bg-gray-800 rounded-lg p-6 mb-6 border border-lime-500">
              <h4 className="text-xl font-bold mb-4 text-lime-400">
                Campaign Summary
              </h4>
              
              {/* Template Variables Info */}
              <div className="bg-zinc-700 border-l-4 border-lime-500 rounded p-3 mb-4 text-xs text-lime-300 font-semibold">
                <strong>Available Template Variables:</strong>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <div>{"{"}companyName{"}, {"}companyEmail{"}, {"}companyPhone{"}"}</div>
                  <div>{"{"}companyWebsite{"}, {"}companyAddress{"}, {"}logo{"}"}</div>
                  <div>{"{"}socialLinks{"}, {"}footerText{"}, {"}currentYear{"}"}</div>
                  <div>{"{"}currentDate{"}, {"}recipientName{"}"}</div>
                </div>
              </div>
              
              {/* Email Bodies Sequence Display */}
              {emailBodySequence.length > 0 && (
                <div className="bg-zinc-700 border-l-4 border-lime-500 rounded p-4 mb-4">
                  <div className="text-lime-300 text-xs uppercase font-semibold mb-3">
                    Email Send Sequence
                  </div>
                  {emailBodySequence.map((bodyId, idx) => {
                    const body = emailBodies.find(b => b._id === bodyId);
                    return (
                      <div key={bodyId} className={`flex items-center gap-3 py-2 ${idx < emailBodySequence.length - 1 ? 'border-b border-gray-600' : ''}`}>
                        <div className="flex items-center justify-center min-w-6 h-6 bg-lime-500 text-black rounded-full text-xs font-bold flex-shrink-0">
                          {idx + 1}
                        </div>
                        <div className="flex-1">
                          <div className="text-white text-sm font-semibold">
                            {body?.name || 'Untitled'}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-lime-500 rounded p-3 text-center">
                  <div className="text-black text-xs uppercase font-semibold mb-2">EMAIL BODIES</div>
                  <div className="text-black text-2xl font-bold">
                    {selectedEmailBodies.length}
                  </div>
                </div>
                <div className="bg-lime-500 rounded p-3 text-center">
                  <div className="text-black text-xs uppercase font-semibold mb-2">TARGET SEGMENTS</div>
                  <div className="text-black text-2xl font-bold">
                    {selectedSegments.length}
                  </div>
                </div>
                <div className="bg-lime-500 rounded p-3 text-center">
                  <div className="text-black text-xs uppercase font-semibold mb-2">TOTAL RECIPIENTS</div>
                  <div className="text-black text-2xl font-bold">
                    {totalRecipients.length}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleSubmitCampaign}
              disabled={!isFormValid.name || !isFormValid.bodies || !isFormValid.segments}
              className="flex-1 px-4 py-3 rounded font-semibold text-black bg-lime-500 hover:bg-lime-600 disabled:text-white disabled:bg-zinc-400 disabled:cursor-not-allowed"
            >
              Create Campaign ({totalRecipients.length} recipients)
            </button>
            <button
              onClick={handleCancelCreate}
              className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-white px-4 py-3 rounded font-semibold"
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
          <div className="text-center py-12 bg-zinc-800 rounded-lg border border-lime-500">
              <div className="text-6xl mb-4">✉️</div>
              <h3 className="text-2xl font-bold text-white mb-2">No campaigns yet</h3>
              <p className="text-zinc-300 mb-6">
                Create your first email campaign to start reaching your audience segments
              </p>
              <button
                onClick={handleCreateCampaign}
                className="bg-lime-500 hover:bg-lime-600 text-black px-6 py-3 rounded font-semibold cursor-pointer"
              >
                Get Started
              </button>
            </div>
          ) : (
            <div>
              <h3 className="text-2xl font-bold mb-6">
                Your Campaigns ({campaigns.length})
              </h3>
              
              {campaigns.map((campaign) => (
                <div key={campaign._id} className={`bg-zinc-800 rounded-lg p-6 mb-6 border border-lime-500 ${campaign.status === 'Sent' ? 'opacity-75' : ''}`}>
                  {/* Campaign Header */}
                  <div className="flex flex-col lg:flex-row justify-between items-start gap-6 mb-6 pb-6 border-b border-lime-600">
                    <div className="flex-1">
                      <h4 className="text-2xl font-bold text-lime-400 mb-2">
                        {campaign.name}
                      </h4>
                      <p className="text-zinc-300 mb-3">
                        {campaign.description}
                      </p>
                      <div className="flex flex-wrap gap-3 text-sm text-zinc-300">
                        <span>Created: {new Date(campaign.createdAt).toLocaleDateString()}</span>
                        <span className={`px-2 py-1 rounded font-semibold ${
                          campaign.status === CAMPAIGN_STATUS.SENT 
                            ? 'bg-green-900 text-green-200' 
                            : campaign.status === CAMPAIGN_STATUS.READY 
                            ? 'bg-lime-900 text-lime-200' 
                            : campaign.status === CAMPAIGN_STATUS.SCHEDULED 
                            ? 'bg-yellow-900 text-yellow-200' 
                            : 'bg-zinc-700 text-zinc-300'
                        }`}>
                          Status: {campaign.status}
                        </span>
                        {campaign.status === CAMPAIGN_STATUS.SCHEDULED && campaign.scheduledFor && (
                          <span title={new Date(campaign.scheduledFor).toLocaleString()}>
                            📅 Scheduled for {new Date(campaign.scheduledFor).toLocaleDateString()} at {new Date(campaign.scheduledFor).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                        {campaign.sentCount > 0 && <span>Sent to: {campaign.sentCount} recipients</span>}
                        {campaign.sentAt && <span>Sent: {new Date(campaign.sentAt).toLocaleDateString()}</span>}
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
                      {sendingCampaign === campaign._id ? (
                        <div className="bg-zinc-700 text-white px-4 py-2 rounded font-semibold text-center">
                          Sending...
                        </div>
                      ) : (
                        <>
                          {campaign.status === CAMPAIGN_STATUS.SCHEDULED ? (
                            <button
                              onClick={() => handleSendCampaign(campaign._id)}
                              className="bg-lime-500 hover:bg-lime-600 text-black px-4 py-2 rounded font-semibold flex-1"
                              title={`Send campaign now or wait until ${new Date(campaign.scheduledFor).toLocaleString()}`}
                            >
                              Send Now ({campaign.recipients ? campaign.recipients.length : 0})
                            </button>
                          ) : (
                            <button
                              onClick={() => handleSendCampaign(campaign._id)}
                              disabled={campaign.status === CAMPAIGN_STATUS.SENT || !campaign.recipients || campaign.recipients.length === 0}
                              className="flex-1 px-4 py-2 rounded font-semibold text-black bg-lime-500 hover:bg-lime-600 disabled:text-white disabled:bg-zinc-400 disabled:cursor-not-allowed"
                            >
                              {campaign.status === CAMPAIGN_STATUS.SENT ? 'Sent' : `Send Now (${campaign.recipients ? campaign.recipients.length : 0})`}
                            </button>
                          )}
                        </>
                      )}
                      
                      <button
                        onClick={() => handleDuplicateCampaign(campaign._id)}
                        className="bg-zinc-700 hover:bg-zinc-600 text-white px-4 py-2 rounded font-semibold flex-1"
                        title="Duplicate"
                      >
                        Copy
                      </button>
                      
                      <button
                        onClick={() => handleDeleteCampaign(campaign._id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-semibold flex-1"
                        title="Delete"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {/* Campaign Content Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Email Bodies */}
                    <div>
                      <h5 className="text-lime-300 text-xs uppercase font-semibold mb-3">
                        Email Bodies ({campaign.emailBodies ? campaign.emailBodies.length : 0}):
                      </h5>
                      <div className="space-y-2">
                        {campaign.emailBodies && campaign.emailBodies.map((body, idx) => (
                          <div key={body._id} className="bg-zinc-700 rounded p-3">
                            <div className="flex items-start gap-3">
                              <div className="flex items-center justify-center min-w-6 h-6 bg-lime-500 text-black rounded-full text-xs font-bold flex-shrink-0">
                                {idx + 1}
                              </div>
                              <div className="flex-1">
                                <div className="text-white font-semibold">
                                  {body.name || 'Untitled'}
                                </div>
                                <div className="text-zinc-300 text-xs mt-1">
                                  {body.content ? 
                                    body.content.substring(0, 80) + '...' : 
                                    'No content'
                                  }
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Target Segments */}
                    <div>
                      <h5 className="text-lime-300 text-xs uppercase font-semibold mb-3">
                        Target Segments ({campaign.targetSegments ? campaign.targetSegments.length : 0}):
                      </h5>
                      <div className="space-y-2">
                        {campaign.targetSegments && campaign.targetSegments.map((segment) => (
                          <div key={segment._id} className="bg-zinc-700 rounded p-3 flex justify-between items-start gap-3">
                            <div>
                              <div className="text-white font-semibold">
                                {segment.name}
                              </div>
                              <div className="text-zinc-300 text-xs mt-1">
                                {segment.description || 'No description'}
                              </div>
                            </div>
                            <div className="bg-lime-500 text-black text-xs px-2 py-1 rounded font-semibold flex-shrink-0">
                              {getContactCount(segment)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Campaign Statistics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-lime-500 rounded p-4 text-center">
                      <div className="text-black text-2xl font-bold mb-1">
                        {campaign.recipients ? campaign.recipients.length : 0}
                      </div>
                      <div className="text-black text-xs uppercase font-semibold">
                        Recipients
                      </div>
                    </div>
                    <div className="bg-lime-500 rounded p-4 text-center">
                      <div className="text-black text-2xl font-bold mb-1">
                        {campaign.emailBodies ? campaign.emailBodies.length : 0}
                      </div>
                      <div className="text-black text-xs uppercase font-semibold">
                        Email Bodies
                      </div>
                    </div>
                    <div className="bg-lime-500 rounded p-4 text-center">
                      <div className="text-black text-2xl font-bold mb-1">
                        {campaign.targetSegments ? campaign.targetSegments.length : 0}
                      </div>
                      <div className="text-black text-xs uppercase font-semibold">
                        Segments
                      </div>
                    </div>
                    {campaign.status === 'Sent' && (
                      <div className="bg-green-900 rounded p-4 text-center">
                        <div className="text-green-300 text-2xl font-bold mb-1">
                          100%
                        </div>
                        <div className="text-green-400 text-xs uppercase font-semibold">
                          Delivered
                        </div>
                      </div>
                    )}
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
