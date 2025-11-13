import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [emailBodies, setEmailBodies] = useState([]);
  const [emailLists, setEmailLists] = useState([]);
  const [selectedEmailBodies, setSelectedEmailBodies] = useState([]);
  const [campaignName, setCampaignName] = useState('');
  const [campaignDescription, setCampaignDescription] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showSendForm, setShowSendForm] = useState(false);
  const [currentCampaign, setCurrentCampaign] = useState(null);
  const [selectedEmails, setSelectedEmails] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch data on component mount
  useEffect(() => {
    fetchEmailBodies();
    fetchEmailLists();
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const response = await axios.get('http://localhost:3001/campaigns');
      setCampaigns(response.data);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      alert('Failed to load campaigns. Please refresh the page.');
    }
  };

  const fetchEmailBodies = async () => {
    try {
      const response = await axios.get('http://localhost:3001/email-bodies');
      setEmailBodies(response.data);
    } catch (error) {
      console.error('Error fetching email bodies:', error);
    }
  };

  const fetchEmailLists = async () => {
    try {
      const response = await axios.get('http://localhost:3001/email-list');
      setEmailLists(response.data);
    } catch (error) {
      console.error('Error fetching email lists:', error);
    }
  };

  const handleCreateCampaign = () => {
    setShowCreateForm(true);
  };

  const handleCancelCreate = () => {
    setShowCreateForm(false);
    setSelectedEmailBodies([]);
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

  const handleSelectAll = () => {
    if (selectedEmailBodies.length === emailBodies.length) {
      setSelectedEmailBodies([]);
    } else {
      setSelectedEmailBodies(emailBodies.map(body => body._id));
    }
  };

  const handleSubmitCampaign = async () => {
    if (!campaignName.trim()) {
      alert('Please enter a campaign name');
      return;
    }
    
    if (selectedEmailBodies.length === 0) {
      alert('Please select at least one email body for the campaign');
      return;
    }
    
    setLoading(true);
    try {
      const selectedBodies = emailBodies.filter(body => selectedEmailBodies.includes(body._id));
      
      const campaignData = {
        name: campaignName.trim(),
        description: campaignDescription.trim() || 'No description provided',
        emailBodies: selectedBodies,
        createdBy: 'user'
      };
      
      const response = await axios.post('http://localhost:3001/campaigns', campaignData);
      
      // Refresh campaigns list
      await fetchCampaigns();
      
      alert(`Campaign "${campaignName}" created successfully with ${selectedEmailBodies.length} email body(ies)!`);
      
      // Reset form
      setShowCreateForm(false);
      setSelectedEmailBodies([]);
      setCampaignName('');
      setCampaignDescription('');
    } catch (error) {
      console.error('Error creating campaign:', error);
      alert('Failed to create campaign: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleSendCampaign = (campaignId) => {
    const campaign = campaigns.find(c => c._id === campaignId);
    if (!campaign) {
      alert('Campaign not found');
      return;
    }
    
    if (emailLists.length === 0) {
      alert('No email lists found. Please create email lists first.');
      return;
    }
    
    setCurrentCampaign(campaign);
    setSelectedEmails([]);
    setShowSendForm(true);
  };

  const handleEmailToggle = (emailId) => {
    setSelectedEmails(prev => 
      prev.includes(emailId) 
        ? prev.filter(id => id !== emailId)
        : [...prev, emailId]
    );
  };

  const handleSelectAllEmails = () => {
    if (selectedEmails.length === emailLists.length) {
      setSelectedEmails([]);
    } else {
      setSelectedEmails(emailLists.map(email => email._id));
    }
  };

  const handleConfirmSend = async () => {
    if (selectedEmails.length === 0) {
      alert('Please select at least one email to send the campaign to.');
      return;
    }

    setLoading(true);
    try {
      const selectedEmailsData = emailLists.filter(email => selectedEmails.includes(email._id));
      
      if (selectedEmailsData.length === 0) {
        alert('No valid email recipients found. Please check your selection.');
        setLoading(false);
        return;
      }

      const response = await axios.post(`http://localhost:3001/campaigns/${currentCampaign._id}/send`, {
        recipients: selectedEmailsData
      });

      // Refresh campaigns list
      await fetchCampaigns();

      alert(`Campaign "${currentCampaign.name}" sent successfully to ${selectedEmails.length} recipients!`);
      
      // Reset send form
      setShowSendForm(false);
      setCurrentCampaign(null);
      setSelectedEmails([]);
    } catch (error) {
      console.error('Error sending campaign:', error);
      console.error('Error response:', error.response?.data);
      alert('Failed to send campaign: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSend = () => {
    setShowSendForm(false);
    setCurrentCampaign(null);
    setSelectedEmails([]);
  };

  const handleDeleteCampaign = async (campaignId) => {
    const campaign = campaigns.find(c => c._id === campaignId);
    if (!campaign) return;
    
    if (window.confirm(`Are you sure you want to delete campaign "${campaign.name}"?`)) {
      setLoading(true);
      try {
        await axios.delete(`http://localhost:3001/campaigns/${campaignId}`);
        await fetchCampaigns();
        alert('Campaign deleted successfully');
      } catch (error) {
        console.error('Error deleting campaign:', error);
        alert('Failed to delete campaign: ' + (error.response?.data?.message || error.message));
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="returndiv">
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '20px' 
      }}>
        <h1 style={{ color: 'white' }}>Campaigns</h1>
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
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#45a049';
            e.target.style.transform = 'translateY(-1px)';
            e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = '#4caf50';
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
          }}
        >
          <span style={{ fontSize: '18px', fontWeight: 'bold' }}>+</span>
          Create Campaign
        </button>
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
            Create New Campaign
          </h3>

          {/* Campaign Name */}
          <div style={{ marginBottom: '20px' }}>
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

          {/* Campaign Description */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: '500', 
              color: '#000' 
            }}>
              Campaign Description:
            </label>
            <textarea
              value={campaignDescription}
              onChange={(e) => setCampaignDescription(e.target.value)}
              placeholder="Enter campaign description (optional)..."
              rows={3}
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px',
                backgroundColor: 'white',
                color: '#000',
                resize: 'vertical'
              }}
            />
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: '500', 
              color: '#000' 
            }}>
              Select Email Bodies ({selectedEmailBodies.length} selected):
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
                {/* Select All/None Button */}
                <div style={{ marginBottom: '15px' }}>
                  <button
                    type="button"
                    onClick={handleSelectAll}
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
                    {selectedEmailBodies.length === emailBodies.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>

                {/* Email Bodies List */}
                <div style={{
                  maxHeight: '300px',
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
                        backgroundColor: selectedEmailBodies.includes(body._id) ? '#e3f2fd' : 'white',
                        ':hover': { backgroundColor: '#f5f5f5' }
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

          {/* Selected Email Bodies Summary */}
          {selectedEmailBodies.length > 0 && (
            <div style={{
              backgroundColor: '#f8f9fa',
              border: '1px solid #dee9ecef',
              borderRadius: '6px',
              padding: '15px',
              marginBottom: '20px'
            }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#000' }}>
                Selected Email Bodies ({selectedEmailBodies.length}):
              </h4>
              <div style={{ color: '#000' }}>
                {selectedEmailBodies.map((bodyId) => {
                  const body = emailBodies.find(b => b._id === bodyId);
                  return (
                    <div key={bodyId} style={{ 
                      marginBottom: '8px', 
                      padding: '8px', 
                      backgroundColor: 'white', 
                      borderRadius: '4px',
                      border: '1px solid #dee2e6'
                    }}>
                      <strong>{body?.Name || 'Untitled'}</strong>
                      <br />
                      <span style={{ fontSize: '12px', color: '#666' }}>
                        {body?.bodyContent ? 
                          body.bodyContent.substring(0, 150) + '...' : 
                          'No content'
                        }
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={handleSubmitCampaign}
              disabled={!campaignName.trim() || selectedEmailBodies.length === 0 || emailBodies.length === 0}
              style={{
                backgroundColor: !campaignName.trim() || selectedEmailBodies.length === 0 || emailBodies.length === 0 ? '#ccc' : '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                padding: '12px 24px',
                fontSize: '14px',
                cursor: !campaignName.trim() || selectedEmailBodies.length === 0 || emailBodies.length === 0 ? 'not-allowed' : 'pointer',
                fontWeight: '500'
              }}
            >
              Create Campaign ({selectedEmailBodies.length} bodies)
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

      {/* Send Campaign Form */}
      {showSendForm && currentCampaign && (
        <div style={{
          backgroundColor: 'white',
          border: '2px solid #28a745',
          borderRadius: '8px',
          padding: '30px',
          marginBottom: '20px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ marginTop: 0, color: '#000', marginBottom: '20px' }}>
            Send Campaign: "{currentCampaign.name}"
          </h3>
          
          {/* Debug Info */}
          <div style={{ 
            backgroundColor: '#f0f8ff', 
            padding: '10px', 
            marginBottom: '15px', 
            borderRadius: '4px',
            fontSize: '12px',
            color: '#333'
          }}>
            <strong>Debug Info:</strong><br />
            Campaign ID: {currentCampaign._id}<br />
            Campaign Status: {currentCampaign.status}<br />
            Email Lists Count: {emailLists.length}<br />
            Selected Emails: {selectedEmails.length}
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: '500', 
              color: '#000' 
            }}>
              Select Recipients ({selectedEmails.length} selected):
            </label>
            
            {emailLists.length === 0 ? (
              <div style={{
                backgroundColor: '#fff3cd',
                border: '1px solid #ffeaa7',
                borderRadius: '4px',
                padding: '12px',
                color: '#856404'
              }}>
                <p style={{ margin: 0 }}>
                  ⚠️ No email contacts found. Please add contacts to your email list first.
                </p>
              </div>
            ) : (
              <div>
                {/* Select All/None Button */}
                <div style={{ marginBottom: '15px' }}>
                  <button
                    type="button"
                    onClick={handleSelectAllEmails}
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
                    {selectedEmails.length === emailLists.length ? 'Deselect All' : 'Select All'}
                  </button>
                  <span style={{ marginLeft: '10px', fontSize: '14px', color: '#666' }}>
                    {emailLists.length} total contacts available
                  </span>
                </div>

                {/* Email Recipients List */}
                <div style={{
                  maxHeight: '400px',
                  overflowY: 'auto',
                  border: '2px solid #ddd',
                  borderRadius: '6px',
                  backgroundColor: 'white'
                }}>
                  {emailLists.map((email) => (
                    <div
                      key={email._id}
                      style={{
                        padding: '12px',
                        borderBottom: '1px solid #eee',
                        cursor: 'pointer',
                        backgroundColor: selectedEmails.includes(email._id) ? '#d4edda' : 'white',
                        ':hover': { backgroundColor: '#f5f5f5' }
                      }}
                      onClick={() => handleEmailToggle(email._id)}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <input
                          type="checkbox"
                          checked={selectedEmails.includes(email._id)}
                          onChange={() => handleEmailToggle(email._id)}
                          style={{ 
                            cursor: 'pointer',
                            transform: 'scale(1.2)'
                          }}
                        />
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <div style={{ fontWeight: '600', fontSize: '14px', color: '#000', marginBottom: '2px' }}>
                                {email.name || 'No Name'}
                              </div>
                              <div style={{ fontSize: '13px', color: '#666' }}>
                                {email.email}
                              </div>
                            </div>
                            <div style={{ textAlign: 'right', fontSize: '12px', color: '#888' }}>
                              <div>{email.position || 'No Position'}</div>
                              <div>{email.company || 'No Company'}</div>
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

          {/* Selected Recipients Summary */}
          {selectedEmails.length > 0 && (
            <div style={{
              backgroundColor: '#d4edda',
              border: '1px solid #c3e6cb',
              borderRadius: '6px',
              padding: '15px',
              marginBottom: '20px'
            }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#155724' }}>
                Ready to Send to {selectedEmails.length} Recipients:
              </h4>
              <div style={{ fontSize: '12px', color: '#155724' }}>
                {selectedEmails.slice(0, 3).map(emailId => {
                  const email = emailLists.find(e => e._id === emailId);
                  return email ? `${email.name} (${email.email})` : '';
                }).join(', ')}
                {selectedEmails.length > 3 && ` and ${selectedEmails.length - 3} more...`}
              </div>
            </div>
          )}

          {/* Campaign Details Preview */}
          <div style={{
            backgroundColor: '#f8f9fa',
            border: '1px solid #e9ecef',
            borderRadius: '6px',
            padding: '15px',
            marginBottom: '20px'
          }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#000' }}>Campaign Details:</h4>
            <div style={{ fontSize: '13px', color: '#000' }}>
              <strong>Name:</strong> {currentCampaign.name}<br />
              <strong>Description:</strong> {currentCampaign.description}<br />
              <strong>Email Bodies:</strong> {currentCampaign.emailBodies.length} bodies<br />
              <strong>Created:</strong> {new Date(currentCampaign.createdAt).toLocaleDateString()}
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={handleConfirmSend}
              disabled={selectedEmails.length === 0 || loading}
              style={{
                backgroundColor: selectedEmails.length === 0 || loading ? '#ccc' : '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                padding: '12px 24px',
                fontSize: '14px',
                cursor: selectedEmails.length === 0 || loading ? 'not-allowed' : 'pointer',
                fontWeight: '500'
              }}
            >
              {loading ? 'Sending...' : `Send Campaign (${selectedEmails.length} recipients)`}
            </button>
            <button
              onClick={handleCancelSend}
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

      {/* Campaigns List or Empty State */}
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
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📧</div>
              <h3 style={{ margin: '0 0 12px 0', color: '#000' }}>No campaigns yet</h3>
              <p style={{ margin: '0 0 20px 0', color: '#000', fontSize: '16px' }}>
                Create your first email campaign to start reaching your audience
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
                <div key={campaign._id} style={{
                  backgroundColor: 'white',
                  border: '1px solid #e0e0e0',
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
                        {campaign.name}
                      </h4>
                      <p style={{ margin: '0 0 10px 0', color: '#666', fontSize: '14px' }}>
                        {campaign.description}
                      </p>
                      <div style={{ fontSize: '12px', color: '#888' }}>
                        Created: {new Date(campaign.createdAt).toLocaleDateString()} | 
                        Status: <span style={{ 
                          color: campaign.status === 'Sent' ? '#28a745' : '#ffc107',
                          fontWeight: '500'
                        }}>{campaign.status}</span>
                        {campaign.sentCount > 0 && ` | Sent to ${campaign.sentCount} recipients`}
                        {campaign.sentAt && ` | Sent on ${new Date(campaign.sentAt).toLocaleDateString()}`}
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => handleSendCampaign(campaign._id)}
                        disabled={campaign.status === 'Sent' || loading}
                        style={{
                          backgroundColor: campaign.status === 'Sent' || loading ? '#ccc' : '#007bff',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '6px 12px',
                          fontSize: '12px',
                          cursor: campaign.status === 'Sent' || loading ? 'not-allowed' : 'pointer',
                          fontWeight: '500'
                        }}
                      >
                        {campaign.status === 'Sent' ? 'Sent' : 'Send to Email Lists'}
                      </button>
                      <button
                        onClick={() => handleDeleteCampaign(campaign._id)}
                        disabled={loading}
                        style={{
                          backgroundColor: loading ? '#999' : '#dc3545',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '6px 12px',
                          fontSize: '12px',
                          cursor: loading ? 'not-allowed' : 'pointer',
                          fontWeight: '500'
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  
                  {/* Email Bodies List */}
                  <div>
                    <h5 style={{ margin: '0 0 10px 0', color: '#000', fontSize: '14px' }}>
                      Email Bodies ({campaign.emailBodies.length}):
                    </h5>
                    <div style={{ display: 'grid', gap: '8px' }}>
                      {campaign.emailBodies.map((body) => (
                        <div key={body._id} style={{
                          backgroundColor: '#f8f9fa',
                          border: '1px solid #e9ecef',
                          borderRadius: '4px',
                          padding: '10px',
                          fontSize: '13px'
                        }}>
                          <div style={{ fontWeight: '600', color: '#000', marginBottom: '4px' }}>
                            {body.Name || 'Untitled'}
                          </div>
                          <div style={{ color: '#666', lineHeight: '1.4' }}>
                            {body.bodyContent ? 
                              body.bodyContent.substring(0, 120) + '...' : 
                              'No content'
                            }
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Sent Recipients Info */}
                  {campaign.status === 'Sent' && campaign.sentTo ? (
                    <div style={{ 
                      marginTop: '15px', 
                      padding: '10px', 
                      backgroundColor: '#d4edda', 
                      borderRadius: '4px',
                      fontSize: '13px',
                      color: '#155724'
                    }}>
                      <strong>Sent to {campaign.sentCount} Recipients:</strong>
                      <div style={{ marginTop: '5px', maxHeight: '100px', overflowY: 'auto' }}>
                        {campaign.sentTo.slice(0, 5).map((recipient, index) => (
                          <div key={index} style={{ fontSize: '11px', marginBottom: '1px' }}>
                            • {recipient.name} ({recipient.email}) - {recipient.company || 'No Company'}
                          </div>
                        ))}
                        {campaign.sentTo.length > 5 && (
                          <div style={{ fontSize: '11px', fontStyle: 'italic' }}>
                            ... and {campaign.sentTo.length - 5} more recipients
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div style={{ 
                      marginTop: '15px', 
                      padding: '10px', 
                      backgroundColor: '#e3f2fd', 
                      borderRadius: '4px',
                      fontSize: '13px',
                      color: '#000'
                    }}>
                      <strong>Available Email Contacts:</strong> {emailLists.length} contacts ready to receive campaigns
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
