import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [emailBodies, setEmailBodies] = useState([]);
  const [selectedEmailBodies, setSelectedEmailBodies] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch email bodies on component mount
  useEffect(() => {
    fetchEmailBodies();
  }, []);

  const fetchEmailBodies = async () => {
    try {
      const response = await axios.get('http://localhost:3001/email-bodies');
      setEmailBodies(response.data);
    } catch (error) {
      console.error('Error fetching email bodies:', error);
    }
  };

  const handleCreateCampaign = () => {
    setShowCreateForm(true);
  };

  const handleCancelCreate = () => {
    setShowCreateForm(false);
    setSelectedEmailBodies([]);
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

  const handleSubmitCampaign = () => {
    if (selectedEmailBodies.length === 0) {
      alert('Please select at least one email body for the campaign');
      return;
    }
    
    const selectedBodies = emailBodies.filter(body => selectedEmailBodies.includes(body._id));
    console.log('Creating campaign with email bodies:', selectedBodies);
    alert(`Campaign will be created with ${selectedEmailBodies.length} email body(ies): ${selectedBodies.map(body => body.Name || 'Untitled').join(', ')}`);
    
    // Reset form
    setShowCreateForm(false);
    setSelectedEmailBodies([]);
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
              disabled={selectedEmailBodies.length === 0 || emailBodies.length === 0}
              style={{
                backgroundColor: selectedEmailBodies.length === 0 || emailBodies.length === 0 ? '#ccc' : '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                padding: '12px 24px',
                fontSize: '14px',
                cursor: selectedEmailBodies.length === 0 || emailBodies.length === 0 ? 'not-allowed' : 'pointer',
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
      
      {/* Empty State or Campaign List */}
      {!showCreateForm && (
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
      )}
    </div>
  );
}
