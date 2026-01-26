import { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { Mail, BookOpen, Users, Clock, BarChart3, Send, Calendar, Check, Trash2, Play, Sparkles } from 'lucide-react';

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
  const [emailGap, setEmailGap] = useState(10); // Gap between emails in seconds
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sendingCampaign, setSendingCampaign] = useState(null);
  const [sendProgress, setSendProgress] = useState({ current: 0, total: 0 });
  const [error, setError] = useState(null);
  
  // ========== SCHEDULING STATE ==========
  const [scheduleMode, setScheduleMode] = useState('immediate'); // 'immediate' or 'scheduled'
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [scheduledCampaigns, setScheduledCampaigns] = useState([]);
  const [countdowns, setCountdowns] = useState({});

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
    setEmailGap(10);
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
        emailGap: emailGap,
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
      alert(`Campaign "${campaignName}" created successfully!${scheduleMsg} Email bodies will be sent in sequence (${emailBodySequence.length} emails per recipient with ${emailGap}s gap between each).`);
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
      totalEmailsToSend: (campaignWithReplacedContent.recipients?.length || 0) * campaignWithReplacedContent.emailBodies?.length || 0,
      estimatedTime: ((campaignWithReplacedContent.recipients?.length || 0) * campaignWithReplacedContent.emailBodies?.length * 10) / 60 + ' minutes'
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

    const totalEmails = (campaign.recipients?.length || 0) * (campaign.emailBodies?.length || 0);
    const gap = campaign.emailGap || 10; // Use campaign's gap or default to 10
    const estimatedMinutes = Math.ceil((totalEmails * gap) / 60);
    
    const confirmMessage = `Send campaign "${campaign.name}" to ${campaign.recipients.length} recipients with ${campaign.emailBodies?.length || 0} email bodies each?\n\nTotal emails: ${totalEmails}\nEmail gap: ${gap}s\nEstimated time: ~${estimatedMinutes} minutes`;
    if (!window.confirm(confirmMessage)) return;

    setSendingCampaign(campaignId);
    setSendProgress({ current: 0, total: totalEmails });

    try {
      await sendCampaignToServer(campaignWithInfo);
      updateCampaignStatus(campaignId, campaign.recipients.length);
      alert(`Campaign "${campaign.name}" sent successfully!\n${totalEmails} emails sent over ~${estimatedMinutes} minutes (${gap}s gap between each)`);
    } catch (error) {
      console.error('Campaign send error:', error);
      alert(`Failed to send campaign: ${error.message}`);
    } finally {
      setSendingCampaign(null);
      setSendProgress({ current: 0, total: 0 });
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
        campaign.scheduledAt &&
        new Date(campaign.scheduledAt) <= now
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

  // ========== COUNTDOWN TIMER EFFECT ==========
  useEffect(() => {
    const updateCountdowns = () => {
      const newCountdowns = {};
      const now = new Date();
      
      campaigns.forEach(campaign => {
        if (campaign.status === CAMPAIGN_STATUS.SCHEDULED && campaign.scheduledAt) {
          const scheduledTime = new Date(campaign.scheduledAt);
          const diff = scheduledTime - now;
          
          if (diff > 0) {
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);
            
            newCountdowns[campaign._id] = {
              days,
              hours,
              minutes,
              seconds,
              formatted: days > 0 
                ? `${days}d ${hours}h ${minutes}m` 
                : hours > 0 
                ? `${hours}h ${minutes}m ${seconds}s`
                : `${minutes}m ${seconds}s`
            };
          }
        }
      });
      
      setCountdowns(newCountdowns);
    };
    
    updateCountdowns();
    const interval = setInterval(updateCountdowns, 1000);
    return () => clearInterval(interval);
  }, [campaigns]);

  return (
    <div className="ml-0 h-screen w-screen bg-zinc-950 overflow-x-auto">
      <div className="ml-64 px-6 py-8 flex flex-col gap-8 h-screen overflow-y-auto">

        {/* Header Section */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-white m-0 mb-1">Email Campaigns</h1>
            <p className="text-zinc-400 text-sm m-0">Create, schedule, and manage email campaigns across your segments</p>
          </div>
          <button 
            className="px-6 py-3 rounded-lg bg-lime-500 hover:bg-lime-600 text-white font-bold text-lg transition-all transform hover:scale-105 shadow-lg flex items-center gap-2"
            onClick={handleCreateCampaign}
            title="Create New Campaign"
          >
            <Sparkles className="w-5 h-5" /> New Campaign
          </button>
        </div>

        {/* Create Campaign Form */}
        {showCreateForm && (
          <div className="bg-zinc-900 rounded-lg border border-zinc-800 p-8 shadow-xl">
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-lime-400 m-0 mb-2 flex items-center gap-2"><Mail className="w-6 h-6" /> Create New Campaign</h3>
            <p className="text-zinc-400 text-sm m-0">Set up your campaign details and select target segments</p>
          </div>

            {/* Basic Campaign Information Section */}
            <div className="mb-8 pb-8 border-b border-zinc-700">
              <h4 className="text-lg font-bold text-lime-400 m-0 mb-4 flex items-center gap-2"><BookOpen className="w-5 h-5" /> Campaign Details</h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-white text-sm font-bold mb-3">
                  Campaign Name *
                </label>
                <input
                  type="text"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  placeholder="e.g., Summer Sale Campaign"
                  className="w-full bg-zinc-800 border border-zinc-600 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-lime-400 transition-colors text-base"
                />
              </div>

              <div>
                <label className="block text-white text-sm font-bold mb-3">
                  Description
                </label>
                <input
                  type="text"
                  value={campaignDescription}
                  onChange={(e) => setCampaignDescription(e.target.value)}
                  placeholder="Optional: describe your campaign purpose"
                  className="w-full bg-zinc-800 border border-zinc-600 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-lime-400 transition-colors text-base"
                />
              </div>

              <div>
                <label className="block text-white text-sm font-bold mb-3">
                  Email Gap (seconds)
                </label>
                <div className="flex gap-3 items-center">
                  <input
                    type="number"
                    value={emailGap}
                    onChange={(e) => setEmailGap(Math.max(1, parseInt(e.target.value) || 1))}
                    min="1"
                    max="300"
                    step="1"
                    className="flex-1 bg-zinc-800 border border-zinc-600 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-lime-400 transition-colors text-base"
                  />
                  <span className="text-lime-400 text-sm font-bold whitespace-nowrap">{emailGap}s</span>
                </div>
                <p className="text-zinc-400 text-xs mt-2">
                  Smaller = faster, Larger = slower
                </p>
              </div>
            </div>
          </div>
          
          {/* Email Bodies Selection Section */}
          <div className="mb-8 pb-8 border-b border-zinc-700">
            <h4 className="text-lg font-bold text-lime-400 m-0 mb-4 flex items-center gap-2"><Mail className="w-5 h-5" /> Select Email Bodies ({selectedEmailBodies.length} selected)</h4>
            
            {emailBodies.length === 0 ? (
              <div className="bg-lime-900/20 border border-lime-700 rounded-lg p-4 text-lime-300 text-sm">
                <p className="m-0"><Mail className="inline-block w-4 h-4 mr-1" /> No email bodies found. Create an email body first in the Email Body Editor.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* ===== LEFT: AVAILABLE BODIES ===== */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <label className="text-white text-base font-bold">Available Email Bodies</label>
                    <button
                      type="button"
                      onClick={handleSelectAllBodies}
                      className="bg-lime-500 hover:bg-lime-600 text-black px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
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
                          className={`p-3 rounded-lg cursor-pointer transition border ${
                            isSelected 
                              ? 'bg-lime-900/30 border-lime-500 text-white' 
                              : 'bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-white'
                          }`}
                          onClick={() => handleEmailBodyToggle(body._id)}
                        >
                          <div className="flex gap-3">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleEmailBodyToggle(body._id)}
                              className="mt-1 cursor-pointer accent-lime-500"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="text-white font-semibold truncate">
                                {body.name || 'Untitled'}
                              </div>
                              <div className="text-zinc-400 text-xs mt-1 line-clamp-2">
                                {body.content ? 
                                  body.content.replace(/<[^>]*>/g, '').substring(0, 80) + '...' : 
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
                  <label className="text-white text-sm font-bold mb-4 block">Email Send Sequence ({emailBodySequence.length})</label>
                  
                  {emailBodySequence.length === 0 ? (
                    <div className="bg-zinc-800 border-2 border-dashed border-zinc-600 rounded-lg p-6 text-center text-zinc-400">
                      <Mail className="w-8 h-8 mb-2 mx-auto" />
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
                            className="bg-zinc-800 border-l-4 border-lime-500 rounded-lg p-4 flex gap-3 items-start transition-colors hover:bg-zinc-700"
                          >
                            <div className="flex items-center justify-center min-w-9 h-9 bg-lime-500 text-black rounded-full text-sm font-bold flex-shrink-0">
                              {idx + 1}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="text-white font-semibold mb-1 truncate">
                                {body?.name || 'Untitled'}
                              </div>
                              <div className="text-zinc-400 text-xs line-clamp-2">
                                {body?.content ? 
                                  body.content.replace(/<[^>]*>/g, '').substring(0, 60) + '...' : 
                                  'No content'
                                }
                              </div>
                            </div>

                            <div className="flex flex-col gap-2 flex-shrink-0">
                              <button
                                onClick={() => handleMoveBodyUp(bodyId)}
                                disabled={isFirst}
                                className={`px-2 py-1 text-xs font-semibold rounded-lg transition-colors ${
                                  isFirst 
                                    ? 'bg-zinc-600 text-zinc-400 cursor-not-allowed' 
                                    : 'bg-lime-500 hover:bg-lime-600 text-black'
                                }`}
                                title="Move up in sequence"
                              >
                                <span className="flex items-center justify-center">↑</span>
                              </button>
                              <button
                                onClick={() => handleMoveBodyDown(bodyId)}
                                disabled={isLast}
                                className={`px-2 py-1 text-xs font-semibold rounded-lg transition-colors ${
                                  isLast 
                                    ? 'bg-zinc-600 text-zinc-400 cursor-not-allowed' 
                                    : 'bg-lime-500 hover:bg-lime-600 text-black'
                                }`}
                                title="Move down in sequence"
                              >
                                <span className="flex items-center justify-center">↓</span>
                              </button>
                              <button
                                onClick={() => handleEmailBodyToggle(bodyId)}
                                className="px-2 py-1 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                                title="Remove from sequence"
                              >
                                <Trash2 className="w-3 h-3" />
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
          <div className="mb-8 pb-8 border-b border-zinc-700">
            <h4 className="text-lg font-bold text-lime-400 m-0 mb-4 flex items-center gap-2"><Users className="w-5 h-5" /> Target Segments ({selectedSegments.length} selected)</h4>
            
            {segments.length === 0 ? (
              <div className="bg-lime-900/20 border border-lime-700 rounded-lg p-4 text-lime-300 text-sm">
                <p className="m-0"><Users className="inline-block w-4 h-4 mr-1" /> No segments found. Create segments first in the Contact Manager.</p>
              </div>
            ) : (
              <div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                  <button
                    type="button"
                    onClick={handleSelectAllSegments}
                    className="bg-lime-500 hover:bg-lime-600 text-black px-6 py-3 rounded-lg font-semibold text-base transition-colors"
                  >
                    {selectedSegments.length === segments.length ? 'Deselect All' : 'Select All'} Segments
                  </button>
                  
                  {selectedSegments.length > 0 && (
                    <div className="text-lime-300 text-base font-semibold">
                      <Users className="inline-block w-4 h-4 mr-2" /> Total Recipients: <span className="text-lime-400 text-lg">{totalRecipients.length}</span> (deduplicated)
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  {segments.map((segment) => (
                    <div
                      key={segment._id}
                      className="bg-zinc-800 border border-zinc-700 p-3 rounded-lg cursor-pointer hover:bg-zinc-700 transition"
                      onClick={() => handleSegmentToggle(segment._id)}
                    >
                      <div className="flex gap-3 items-start">
                        <input
                          type="checkbox"
                          checked={selectedSegments.includes(segment._id)}
                          onChange={() => handleSegmentToggle(segment._id)}
                          className="mt-1 cursor-pointer accent-lime-500"
                        />
                        <div className="flex-1">
                          <div className="text-white font-semibold">
                            {segment.name}
                          </div>
                          <div className="text-zinc-400 text-sm mt-1">
                            {segment.description || 'No description'}
                          </div>
                        </div>
                        <div className="bg-lime-500 text-black text-xs px-3 py-1 rounded-lg font-semibold flex-shrink-0 whitespace-nowrap">
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
          <div className="mb-8 pb-8 border-b border-zinc-700">
            <h4 className="text-lg font-bold text-lime-400 m-0 mb-4 flex items-center gap-2"><Clock className="w-5 h-5" /> Send Timing</h4>
            
            <div className="flex flex-col sm:flex-row gap-5 mb-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="scheduleMode"
                  value="immediate"
                  checked={scheduleMode === 'immediate'}
                  onChange={(e) => setScheduleMode(e.target.value)}
                  className="cursor-pointer accent-lime-500"
                />
                <span className="text-white font-medium">Send Immediately</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="scheduleMode"
                  value="scheduled"
                  checked={scheduleMode === 'scheduled'}
                  onChange={(e) => setScheduleMode(e.target.value)}
                  className="cursor-pointer accent-lime-500"
                />
                <span className="text-white font-medium">Schedule for Later</span>
              </label>
            </div>

            {scheduleMode === 'scheduled' && (
              <div className="bg-zinc-800 border-l-4 border-lime-500 rounded-lg p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-white text-sm font-bold mb-2 block">
                    Date:
                  </label>
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full bg-zinc-700 border border-zinc-600 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-lime-400 transition-colors placeholder-zinc-400"
                  />
                </div>
                
                <div>
                  <label className="text-white text-sm font-bold mb-2 block">
                    Time:
                  </label>
                  <input
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="w-full bg-zinc-700 border border-zinc-600 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-lime-400 transition-colors placeholder-zinc-400"
                  />
                </div>

                {scheduledDate && scheduledTime && (
                  <div className="md:col-span-2 bg-lime-900/20 border border-lime-700 rounded-lg p-3">
                    <div className="text-lime-400 text-xs uppercase font-bold mb-1">
                      <Calendar className="inline-block w-3 h-3 mr-1" /> Scheduled Send Time:
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
            <div className="bg-zinc-800 rounded-lg p-6 mb-8 border border-zinc-700 shadow-lg">
              <h4 className="text-xl font-bold mb-6 text-lime-400 m-0 flex items-center gap-2">
                <BarChart3 className="w-5 h-5" /> Campaign Summary
              </h4>
              
              {/* Email Gap & Timing Info */}
              <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-4 mb-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-zinc-400 text-xs uppercase font-semibold mb-2">Email Gap</div>
                    <div className="text-lime-400 text-2xl font-bold">{emailGap}s</div>
                  </div>
                  <div className="text-center">
                    <div className="text-zinc-400 text-xs uppercase font-semibold mb-2">Total Emails</div>
                    <div className="text-lime-400 text-2xl font-bold">{totalRecipients.length * selectedEmailBodies.length}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-zinc-400 text-xs uppercase font-semibold mb-2">Est. Delivery Time</div>
                    <div className="text-lime-400 text-2xl font-bold">~{Math.ceil((totalRecipients.length * selectedEmailBodies.length * emailGap) / 60)} min</div>
                  </div>
                </div>
              </div>
              
              {/* Email Bodies Sequence Display */}
              {emailBodySequence.length > 0 && (
                <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-4 mb-4">
                  <div className="text-zinc-400 text-xs uppercase font-semibold mb-3">
                    <Mail className="inline-block w-3 h-3 mr-1" /> Email Sequence
                  </div>
                  {emailBodySequence.map((bodyId, idx) => {
                    const body = emailBodies.find(b => b._id === bodyId);
                    return (
                      <div key={bodyId} className={`flex items-center gap-3 py-2 ${idx < emailBodySequence.length - 1 ? 'border-b border-zinc-700' : ''}`}>
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
              
              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-gradient-to-br from-lime-500 to-lime-600 rounded-lg p-4 text-center">
                  <div className="text-black text-xs uppercase font-bold mb-2">Email Bodies</div>
                  <div className="text-black text-2xl font-bold">
                    {selectedEmailBodies.length}
                  </div>
                </div>
                <div className="bg-gradient-to-br from-lime-500 to-lime-600 rounded-lg p-4 text-center">
                  <div className="text-black text-xs uppercase font-bold mb-2">Segments</div>
                  <div className="text-black text-2xl font-bold">
                    {selectedSegments.length}
                  </div>
                </div>
                <div className="bg-gradient-to-br from-lime-500 to-lime-600 rounded-lg p-4 text-center">
                  <div className="text-black text-xs uppercase font-bold mb-2">Recipients</div>
                  <div className="text-black text-2xl font-bold">
                    {totalRecipients.length}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 flex-col sm:flex-row">
            <button
              onClick={handleSubmitCampaign}
              disabled={!isFormValid.name || !isFormValid.bodies || !isFormValid.segments}
              className="flex-1 px-6 py-4 rounded-lg font-semibold text-black bg-lime-500 hover:bg-lime-600 disabled:text-white disabled:bg-zinc-600 disabled:cursor-not-allowed transition-colors text-base"
            >
              <Check className="inline-block w-5 h-5 mr-2" /> Create Campaign ({totalRecipients.length} recipients)
            </button>
            <button
              onClick={handleCancelCreate}
              className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-white px-6 py-4 rounded-lg font-semibold transition-colors text-base"
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
          <div className="text-center py-24 bg-zinc-900 rounded-lg border border-zinc-800 shadow-lg">
              <Mail className="w-24 h-24 mb-6 mx-auto text-zinc-600" />
              <h3 className="text-3xl font-bold text-white mb-4">No campaigns yet</h3>
              <p className="text-zinc-400 mb-8 text-lg">
                Create your first email campaign to start reaching your audience
              </p>
              <button
                onClick={handleCreateCampaign}
                className="bg-lime-500 hover:bg-lime-600 text-black px-8 py-3 rounded-lg font-semibold cursor-pointer transition-colors text-base"
              >
                + Create Campaign
              </button>
            </div>
          ) : (
            <div>
              <h3 className="text-3xl font-bold mb-8 text-white">
                <Mail className="inline-block w-8 h-8 mr-3" /> Your Campaigns ({campaigns.length})
              </h3>
              
              {campaigns.map((campaign) => (
                <div key={campaign._id} className={`bg-zinc-900 rounded-lg p-8 mb-8 border border-zinc-800 shadow-lg transition-opacity ${campaign.status === 'Sent' ? 'opacity-75' : ''}`}>
                  {/* Campaign Header */}
                  <div className="flex flex-col lg:flex-row justify-between items-start gap-8 mb-8 pb-8 border-b border-zinc-700">
                    <div className="flex-1 w-full">
                      <h4 className="text-3xl font-bold text-lime-400 mb-3 m-0">
                        {campaign.name}
                      </h4>
                      <p className="text-zinc-300 mb-4 m-0 text-base">
                        {campaign.description}
                      </p>
                      <div className="flex flex-wrap gap-4 text-base text-zinc-400">
                        <span><Calendar className="inline-block w-3 h-3 mr-1" />{new Date(campaign.createdAt).toLocaleDateString()}</span>
                        <span className={`px-3 py-1 rounded-lg font-semibold ${
                          campaign.status === CAMPAIGN_STATUS.SENT 
                            ? 'bg-green-900 text-green-300' 
                            : campaign.status === CAMPAIGN_STATUS.READY 
                            ? 'bg-lime-900 text-lime-300' 
                            : campaign.status === CAMPAIGN_STATUS.SCHEDULED 
                            ? 'bg-yellow-900 text-yellow-300' 
                            : 'bg-zinc-800 text-zinc-300'
                        }`}>
                          {campaign.status}
                        </span>
                        {campaign.status === CAMPAIGN_STATUS.SCHEDULED && campaign.scheduledAt && (
                          <div className="flex flex-col gap-1">
                            <span title={new Date(campaign.scheduledAt).toLocaleString()} className="text-xs">
                              <Calendar className="inline-block w-3 h-3 mr-1" />{new Date(campaign.scheduledAt).toLocaleDateString()} @ {new Date(campaign.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {countdowns[campaign._id] && (
                              <span className="text-xs font-bold text-yellow-400">
                                <Clock className="inline-block w-3 h-3 mr-1" />{countdowns[campaign._id].formatted}
                              </span>
                            )}
                          </div>
                        )}
                        {campaign.sentCount > 0 && <span><Check className="inline-block w-3 h-3 mr-1" />Sent to {campaign.sentCount} recipients</span>}
                        {campaign.sentAt && <span><Send className="inline-block w-3 h-3 mr-1" />{new Date(campaign.sentAt).toLocaleDateString()}</span>}
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                      {sendingCampaign === campaign._id ? (
                        <div className="bg-zinc-800 text-white px-4 py-2 rounded-lg font-semibold text-center w-full flex flex-col gap-2">
                          <div>⏳ Sending... ({sendProgress.current}/{sendProgress.total})</div>
                          <div className="w-full bg-zinc-700 rounded-full h-2 overflow-hidden">
                            <div 
                              className="bg-lime-500 h-2 rounded-full transition-all duration-300 block"
                              style={{width: sendProgress.total > 0 ? `${(sendProgress.current / sendProgress.total) * 100}%` : '0%'}}
                            />
                          </div>
                        </div>
                      ) : (
                        <>
                          {campaign.status === CAMPAIGN_STATUS.SCHEDULED ? (
                            <button
                              onClick={() => handleSendCampaign(campaign._id)}
                              className="bg-lime-500 hover:bg-lime-600 text-black px-4 py-2 rounded-lg font-semibold flex-1 transition-colors"
                              title={`Send now or wait until ${new Date(campaign.scheduledFor).toLocaleString()}`}
                            >
                              <Play className="inline-block w-4 h-4 mr-1" /> Send Now ({campaign.recipients ? campaign.recipients.length : 0})
                            </button>
                          ) : (
                            <button
                              onClick={() => handleSendCampaign(campaign._id)}
                              disabled={campaign.status === CAMPAIGN_STATUS.SENT || !campaign.recipients || campaign.recipients.length === 0}
                              className="flex-1 px-4 py-2 rounded-lg font-semibold text-black bg-lime-500 hover:bg-lime-600 disabled:text-white disabled:bg-zinc-600 disabled:cursor-not-allowed transition-colors"
                            >
                              {campaign.status === CAMPAIGN_STATUS.SENT ? <><Check className="inline-block w-4 h-4 mr-1" /> Sent</> : <><Play className="inline-block w-4 h-4 mr-1" /> Send Now ({campaign.recipients ? campaign.recipients.length : 0})</> }
                            </button>
                          )}
                        </>
                      )}
                      
                      <button
                        onClick={() => handleDuplicateCampaign(campaign._id)}
                        className="bg-zinc-700 hover:bg-zinc-600 text-white px-4 py-2 rounded-lg font-semibold flex-1 transition-colors"
                        title="Duplicate campaign"
                      >
                        <BookOpen className="inline-block w-4 h-4 mr-1" /> Copy
                      </button>
                      
                      <button
                        onClick={() => handleDeleteCampaign(campaign._id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold flex-1 transition-colors"
                        title="Delete campaign"
                      >
                        <Trash2 className="inline-block w-4 h-4 mr-1" /> Delete
                      </button>
                    </div>
                  </div>

                  {/* Campaign Content Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Email Bodies */}
                    <div>
                      <h5 className="text-lime-400 text-xs uppercase font-bold mb-4 m-0">
                        <Mail className="inline-block w-3 h-3 mr-1" /> Email Bodies ({campaign.emailBodies ? campaign.emailBodies.length : 0})
                      </h5>
                      <div className="space-y-2">
                        {campaign.emailBodies && campaign.emailBodies.map((body, idx) => (
                          <div key={body._id} className="bg-zinc-800 border border-zinc-700 rounded-lg p-3">
                            <div className="flex items-start gap-3">
                              <div className="flex items-center justify-center min-w-6 h-6 bg-lime-500 text-black rounded-full text-xs font-bold flex-shrink-0">
                                {idx + 1}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-white font-semibold truncate">
                                  {body.name || 'Untitled'}
                                </div>
                                <div className="text-zinc-400 text-xs mt-1 line-clamp-2">
                                  {body.content ? 
                                    body.content.replace(/<[^>]*>/g, '').substring(0, 80) + '...' : 
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
                      <h5 className="text-lime-400 text-xs uppercase font-bold mb-4 m-0">
                        <Users className="inline-block w-3 h-3 mr-1" /> Target Segments ({campaign.targetSegments ? campaign.targetSegments.length : 0})
                      </h5>
                      <div className="space-y-2">
                        {campaign.targetSegments && campaign.targetSegments.map((segment) => (
                          <div key={segment._id} className="bg-zinc-800 border border-zinc-700 rounded-lg p-3 flex justify-between items-start gap-3">
                            <div className="min-w-0 flex-1">
                              <div className="text-white font-semibold truncate">
                                {segment.name}
                              </div>
                              <div className="text-zinc-400 text-xs mt-1 line-clamp-2">
                                {segment.description || 'No description'}
                              </div>
                            </div>
                            <div className="bg-lime-500 text-black text-xs px-3 py-1 rounded-lg font-bold flex-shrink-0 whitespace-nowrap">
                              {getContactCount(segment)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Campaign Statistics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-gradient-to-br from-lime-500 to-lime-600 rounded-lg p-4 text-center">
                      <div className="text-black text-2xl font-bold mb-1">
                        {campaign.recipients ? campaign.recipients.length : 0}
                      </div>
                      <div className="text-black text-xs uppercase font-bold">
                        Recipients
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-lime-500 to-lime-600 rounded-lg p-4 text-center">
                      <div className="text-black text-2xl font-bold mb-1">
                        {campaign.emailBodies ? campaign.emailBodies.length : 0}
                      </div>
                      <div className="text-black text-xs uppercase font-bold">
                        Email Bodies
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-lime-500 to-lime-600 rounded-lg p-4 text-center">
                      <div className="text-black text-2xl font-bold mb-1">
                        {campaign.targetSegments ? campaign.targetSegments.length : 0}
                      </div>
                      <div className="text-black text-xs uppercase font-bold">
                        Segments
                      </div>
                    </div>
                    {campaign.status === 'Sent' && (
                      <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-4 text-center">
                        <div className="text-white text-2xl font-bold mb-1">
                          100%
                        </div>
                        <div className="text-white text-xs uppercase font-bold">
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
    </div>
  );
}
