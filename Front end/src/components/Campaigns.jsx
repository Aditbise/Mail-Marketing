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
      const response = await axios.get('http://localhost:3001/email-bodies');
      setEmailBodies(response.data || []);
    } catch (error) {
      console.error('Error fetching email bodies:', error);
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
    <div style={{ padding: '20px', minHeight: '100vh', backgroundColor: '#1a1a1a' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '20px' 
      }}>
        <h1 style={{ color: 'white' }}>Email Campaigns</h1>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {/* Quick Stats */}
          <div style={{ 
            backgroundColor: 'rgba(255,255,255,0.1)', 
            padding: '8px 12px', 
            borderRadius: '4px', 
            fontSize: '14px',
            color: 'white'
          }}>
            📧 {emailBodies.length} Bodies | 🎯 {segments.length} Segments
          </div>
          
          <button
            onClick={handleCreateCampaign}
            style={{
              backgroundColor: '#4caf50',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              padding: '12px 20px',
              fontSize: '16px',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              transition: 'all 0.2s ease'
            }}
          >
            <span style={{ fontSize: '18px', fontWeight: 'bold' }}>+</span>
            Create Campaign
          </button>

          <button
            onClick={handleSendTestEmail}
            style={{
              backgroundColor: '#17a2b8',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              padding: '12px 20px',
              fontSize: '16px',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            📧 Send Test Email
          </button>
        </div>
      </div>

      {/* Create Campaign Form */}
      {showCreateForm && (
        <div style={{
          backgroundColor: 'white',
          border: '2px solid #e3f2fd',
          borderRadius: '8px',
          padding: '30px',
          marginBottom: '20px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ marginTop: 0, color: '#000', marginBottom: '20px' }}>
            🚀 Create New Campaign
          </h3>

          {/* Campaign Name & Description */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: '500', 
                color: '#000' 
              }}>
                Campaign Name *:
              </label>
              <input
                type="text"
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                placeholder="Enter campaign name..."
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '14px',
                  backgroundColor: 'white',
                  color: '#000'
                }}
              />
            </div>

            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: '500', 
                color: '#000' 
              }}>
                Campaign Description:
              </label>
              <input
                type="text"
                value={campaignDescription}
                onChange={(e) => setCampaignDescription(e.target.value)}
                placeholder="Enter campaign description..."
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '14px',
                  backgroundColor: 'white',
                  color: '#000'
                }}
              />
            </div>
          </div>
          
          {/* Email Bodies Selection */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: '500', 
              color: '#000' 
            }}>
              📧 Select Email Bodies ({selectedEmailBodies.length} selected):
            </label>
            
            {emailBodies.length === 0 ? (
              <div style={{
                backgroundColor: '#fff3cd',
                border: '1px solid #ffeaa7',
                borderRadius: '4px',
                padding: '12px',
                color: '#856404'
              }}>
                <p style={{ margin: 0 }}>
                  ⚠️ No email bodies found. Please create an email body first in the Email Body Editor.
                </p>
              </div>
            ) : (
              <div>
                <div style={{ marginBottom: '15px' }}>
                  <button
                    type="button"
                    onClick={handleSelectAllBodies}
                    style={{
                      backgroundColor: '#17a2b8',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '8px 16px',
                      fontSize: '12px',
                      cursor: 'pointer',
                      fontWeight: '500'
                    }}
                  >
                    {selectedEmailBodies.length === emailBodies.length ? 'Deselect All' : 'Select All'} Bodies
                  </button>
                </div>

                <div style={{
                  maxHeight: '200px',
                  overflowY: 'auto',
                  border: '2px solid #ddd',
                  borderRadius: '6px',
                  backgroundColor: 'white'
                }}>
                  {emailBodies.map((body) => (
                    <div
                      key={body._id}
                      style={{
                        padding: '12px',
                        borderBottom: '1px solid #eee',
                        cursor: 'pointer',
                        backgroundColor: selectedEmailBodies.includes(body._id) ? '#e3f2fd' : 'white'
                      }}
                      onClick={() => handleEmailBodyToggle(body._id)}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                        <input
                          type="checkbox"
                          checked={selectedEmailBodies.includes(body._id)}
                          onChange={() => handleEmailBodyToggle(body._id)}
                          style={{ 
                            marginTop: '2px',
                            cursor: 'pointer',
                            transform: 'scale(1.2)'
                          }}
                        />
                        <div style={{ flex: 1, color: '#000' }}>
                          <div style={{ fontWeight: '600', fontSize: '14px', marginBottom: '4px' }}>
                            {body.Name || 'Untitled'}
                          </div>
                          <div style={{ fontSize: '12px', color: '#666', lineHeight: '1.4' }}>
                            {body.bodyContent ? 
                              body.bodyContent.substring(0, 100) + '...' : 
                              'No content available'
                            }
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Segments Selection */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: '500', 
              color: '#000' 
            }}>
              🎯 Select Target Segments ({selectedSegments.length} selected):
            </label>
            
            {segments.length === 0 ? (
              <div style={{
                backgroundColor: '#fff3cd',
                border: '1px solid #ffeaa7',
                borderRadius: '4px',
                padding: '12px',
                color: '#856404'
              }}>
                <p style={{ margin: 0 }}>
                  ⚠️ No segments found. Please create segments first in the Contact Manager.
                </p>
              </div>
            ) : (
              <div>
                <div style={{ marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <button
                    type="button"
                    onClick={handleSelectAllSegments}
                    style={{
                      backgroundColor: '#17a2b8',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '8px 16px',
                      fontSize: '12px',
                      cursor: 'pointer',
                      fontWeight: '500'
                    }}
                  >
                    {selectedSegments.length === segments.length ? 'Deselect All' : 'Select All'} Segments
                  </button>
                  
                  {selectedSegments.length > 0 && (
                    <div style={{ fontSize: '14px', color: '#4caf50', fontWeight: 'bold' }}>
                      📊 Total Recipients: {calculateTotalRecipients().length} (deduplicated)
                    </div>
                  )}
                </div>

                <div style={{
                  maxHeight: '250px',
                  overflowY: 'auto',
                  border: '2px solid #ddd',
                  borderRadius: '6px',
                  backgroundColor: 'white'
                }}>
                  {segments.map((segment) => (
                    <div
                      key={segment._id}
                      style={{
                        padding: '12px',
                        borderBottom: '1px solid #eee',
                        cursor: 'pointer',
                        backgroundColor: selectedSegments.includes(segment._id) ? '#e8f5e8' : 'white'
                      }}
                      onClick={() => handleSegmentToggle(segment._id)}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <input
                          type="checkbox"
                          checked={selectedSegments.includes(segment._id)}
                          onChange={() => handleSegmentToggle(segment._id)}
                          style={{ 
                            cursor: 'pointer',
                            transform: 'scale(1.2)'
                          }}
                        />
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <div style={{ fontWeight: '600', fontSize: '14px', color: '#000', marginBottom: '2px' }}>
                                🎯 {segment.name}
                              </div>
                              <div style={{ fontSize: '12px', color: '#666' }}>
                                {segment.description || 'No description'}
                              </div>
                            </div>
                            <div style={{ 
                              backgroundColor: '#4caf50', 
                              color: 'white', 
                              padding: '4px 8px', 
                              borderRadius: '12px',
                              fontSize: '12px',
                              fontWeight: 'bold'
                            }}>
                              {getContactCount(segment)} contacts
                            </div>
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
            <div style={{
              backgroundColor: '#f0f8f0',
              border: '2px solid #4caf50',
              borderRadius: '8px',
              padding: '20px',
              marginBottom: '20px'
            }}>
              <h4 style={{ margin: '0 0 15px 0', color: '#2e7d32' }}>
                🎯 Campaign Summary
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
                <div>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>EMAIL BODIES</div>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#2e7d32' }}>
                    {selectedEmailBodies.length}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>TARGET SEGMENTS</div>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#2e7d32' }}>
                    {selectedSegments.length}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>TOTAL RECIPIENTS</div>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#2e7d32' }}>
                    {calculateTotalRecipients().length}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={handleSubmitCampaign}
              disabled={!campaignName.trim() || selectedEmailBodies.length === 0 || selectedSegments.length === 0}
              style={{
                backgroundColor: !campaignName.trim() || selectedEmailBodies.length === 0 || selectedSegments.length === 0 ? '#ccc' : '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                padding: '12px 24px',
                fontSize: '14px',
                cursor: !campaignName.trim() || selectedEmailBodies.length === 0 || selectedSegments.length === 0 ? 'not-allowed' : 'pointer',
                fontWeight: '500'
              }}
            >
              🚀 Create Campaign ({calculateTotalRecipients().length} recipients)
            </button>
            <button
              onClick={handleCancelCreate}
              style={{
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                padding: '12px 24px',
                fontSize: '14px',
                cursor: 'pointer',
                fontWeight: '500'
              }}
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
            <div style={{ 
              backgroundColor: '#f8f9fa', 
              padding: '40px', 
              borderRadius: '8px', 
              textAlign: 'center',
              border: '2px dashed #dee2e6'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚀</div>
              <h3 style={{ margin: '0 0 12px 0', color: '#000' }}>No campaigns yet</h3>
              <p style={{ margin: '0 0 20px 0', color: '#000', fontSize: '16px' }}>
                Create your first email campaign to start reaching your audience segments
              </p>
              <button
                onClick={handleCreateCampaign}
                style={{
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '10px 24px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                Get Started
              </button>
            </div>
          ) : (
            <div>
              <h3 style={{ color: 'white', marginBottom: '20px' }}>
                Your Campaigns ({campaigns.length})
              </h3>
              
              {campaigns.map((campaign) => (
                <div key={campaign.id} style={{
                  backgroundColor: 'white',
                  border: campaign.status === 'Sent' ? '2px solid #28a745' : '1px solid #e0e0e0',
                  borderRadius: '8px',
                  padding: '20px',
                  marginBottom: '20px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                  {/* Campaign Header */}
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'flex-start',
                    marginBottom: '15px' 
                  }}>
                    <div>
                      <h4 style={{ margin: '0 0 5px 0', color: '#000', fontSize: '18px' }}>
                        🚀 {campaign.name}
                      </h4>
                      <p style={{ margin: '0 0 10px 0', color: '#666', fontSize: '14px' }}>
                        {campaign.description}
                      </p>
                      <div style={{ fontSize: '12px', color: '#888', display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                        <span>📅 Created: {new Date(campaign.createdAt).toLocaleDateString()}</span>
                        <span>📊 Status: <span style={{ 
                          color: campaign.status === 'Sent' ? '#28a745' : campaign.status === 'Ready to Send' ? '#007bff' : '#ffc107',
                          fontWeight: '500'
                        }}>{campaign.status}</span></span>
                        {campaign.sentCount > 0 && <span>📧 Sent to: {campaign.sentCount} recipients</span>}
                        {campaign.sentAt && <span>⏰ Sent: {new Date(campaign.sentAt).toLocaleDateString()}</span>}
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                      {sendingCampaign === campaign.id ? (
                        <div style={{
                          backgroundColor: '#ff9800',
                          color: 'white',
                          padding: '8px 16px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: '500'
                        }}>
                          📤 Sending...
                        </div>
                      ) : (
                        <button
                          onClick={() => handleSendCampaign(campaign.id)}
                          disabled={campaign.status === 'Sent' || !campaign.recipients || campaign.recipients.length === 0}
                          style={{
                            backgroundColor: campaign.status === 'Sent' || !campaign.recipients || campaign.recipients.length === 0 ? '#ccc' : '#28a745',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '8px 16px',
                            fontSize: '12px',
                            cursor: campaign.status === 'Sent' || !campaign.recipients || campaign.recipients.length === 0 ? 'not-allowed' : 'pointer',
                            fontWeight: '500'
                          }}
                        >
                          {campaign.status === 'Sent' ? '✅ Sent' : `📤 Send Now (${campaign.recipients ? campaign.recipients.length : 0})`}
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleDuplicateCampaign(campaign.id)}
                        style={{
                          backgroundColor: '#6f42c1',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '8px 12px',
                          fontSize: '12px',
                          cursor: 'pointer',
                          fontWeight: '500'
                        }}
                      >
                        📋
                      </button>
                      
                      <button
                        onClick={() => handleDeleteCampaign(campaign.id)}
                        style={{
                          backgroundColor: '#dc3545',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '8px 12px',
                          fontSize: '12px',
                          cursor: 'pointer',
                          fontWeight: '500'
                        }}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                  {/* Campaign Content Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    {/* Email Bodies */}
                    <div>
                      <h5 style={{ margin: '0 0 10px 0', color: '#000', fontSize: '14px' }}>
                        📧 Email Bodies ({campaign.emailBodies ? campaign.emailBodies.length : 0}):
                      </h5>
                      <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
                        {campaign.emailBodies && campaign.emailBodies.map((body) => (
                          <div key={body._id} style={{
                            backgroundColor: '#f8f9fa',
                            border: '1px solid #e9ecef',
                            borderRadius: '4px',
                            padding: '8px',
                            fontSize: '12px',
                            marginBottom: '8px'
                          }}>
                            <div style={{ fontWeight: '600', color: '#000', marginBottom: '2px' }}>
                              {body.Name || 'Untitled'}
                            </div>
                            <div style={{ color: '#666', lineHeight: '1.4' }}>
                              {body.bodyContent ? 
                                body.bodyContent.substring(0, 80) + '...' : 
                                'No content'
                              }
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Target Segments */}
                    <div>
                      <h5 style={{ margin: '0 0 10px 0', color: '#000', fontSize: '14px' }}>
                        🎯 Target Segments ({campaign.segments ? campaign.segments.length : 0}):
                      </h5>
                      <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
                        {campaign.segments && campaign.segments.map((segment) => (
                          <div key={segment._id} style={{
                            backgroundColor: '#e8f5e8',
                            border: '1px solid #4caf50',
                            borderRadius: '4px',
                            padding: '8px',
                            fontSize: '12px',
                            marginBottom: '8px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}>
                            <div>
                              <div style={{ fontWeight: '600', color: '#2e7d32' }}>
                                {segment.name}
                              </div>
                              <div style={{ color: '#4caf50', fontSize: '11px' }}>
                                {segment.description || 'No description'}
                              </div>
                            </div>
                            <div style={{ 
                              backgroundColor: '#4caf50', 
                              color: 'white', 
                              padding: '2px 6px', 
                              borderRadius: '8px',
                              fontSize: '10px',
                              fontWeight: 'bold'
                            }}>
                              {getContactCount(segment)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Campaign Statistics */}
                  <div style={{
                    marginTop: '15px',
                    padding: '15px',
                    backgroundColor: campaign.status === 'Sent' ? '#d4edda' : '#e3f2fd',
                    borderRadius: '6px',
                    border: `1px solid ${campaign.status === 'Sent' ? '#4caf50' : '#2196f3'}`
                  }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '15px' }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '18px', fontWeight: 'bold', color: campaign.status === 'Sent' ? '#2e7d32' : '#1976d2' }}>
                          {campaign.recipients ? campaign.recipients.length : 0}
                        </div>
                        <div style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase' }}>
                          Recipients
                        </div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '18px', fontWeight: 'bold', color: campaign.status === 'Sent' ? '#2e7d32' : '#1976d2' }}>
                          {campaign.emailBodies ? campaign.emailBodies.length : 0}
                        </div>
                        <div style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase' }}>
                          Email Bodies
                        </div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '18px', fontWeight: 'bold', color: campaign.status === 'Sent' ? '#2e7d32' : '#1976d2' }}>
                          {campaign.segments ? campaign.segments.length : 0}
                        </div>
                        <div style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase' }}>
                          Segments
                        </div>
                      </div>
                      {campaign.status === 'Sent' && (
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#2e7d32' }}>
                            100%
                          </div>
                          <div style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase' }}>
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
