import React, { useState } from 'react';
import axios from 'axios';

/**
 * Recipient Engagement Viewer Component
 * Shows detailed tracking data for each recipient
 * Displays: opens, clicks, interest level, timeline
 */

export function RecipientEngagementViewer({ templateId, templateName, onClose }) {
  const [recipients, setRecipients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [filter, setFilter] = useState('all'); // all, interested, engaged, notInterested

  React.useEffect(() => {
    fetchRecipientData();
  }, [templateId]);

  const fetchRecipientData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:3001/template-recipients/${templateId}`);
      setRecipients(response.data.recipients);
      setStats(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching recipient data:', error);
      setLoading(false);
    }
  };

  const getInterestLevel = (recipient) => {
    if (recipient.clicked) return { level: 'VERY_INTERESTED', emoji: '🔥', color: '#4CAF50' };
    if (recipient.opened) return { level: 'ENGAGED', emoji: '👀', color: '#FF9800' };
    return { level: 'NOT_INTERESTED', emoji: '❌', color: '#f44336' };
  };

  const getFilteredRecipients = () => {
    if (filter === 'interested') return recipients.filter(r => r.clicked);
    if (filter === 'engaged') return recipients.filter(r => r.opened && !r.clicked);
    if (filter === 'notInterested') return recipients.filter(r => !r.opened);
    return recipients;
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>Loading recipient data...</p>
      </div>
    );
  }

  const filtered = getFilteredRecipients();

  return (
    <div style={{ backgroundColor: '#1a1a1a', borderRadius: '8px', padding: '20px', color: 'white' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ margin: '0 0 8px 0', fontSize: '24px' }}>📧 {templateName}</h2>
          <p style={{ margin: 0, color: '#999', fontSize: '14px' }}>Recipient Engagement Tracking</p>
        </div>
        <button 
          onClick={onClose}
          style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#999' }}
        >
          ✕
        </button>
      </div>

      {/* Stats Summary */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
          <div style={{ backgroundColor: '#2a2a2a', padding: '12px', borderRadius: '6px', borderLeft: '3px solid #2196F3' }}>
            <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#999' }}>Total Recipients</p>
            <p style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>{stats.total}</p>
          </div>
          <div style={{ backgroundColor: '#2a2a2a', padding: '12px', borderRadius: '6px', borderLeft: '3px solid #4CAF50' }}>
            <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#999' }}>🔥 Interested (Clicked)</p>
            <p style={{ margin: 0, fontSize: '20px', fontWeight: 'bold', color: '#4CAF50' }}>{stats.interested}</p>
          </div>
          <div style={{ backgroundColor: '#2a2a2a', padding: '12px', borderRadius: '6px', borderLeft: '3px solid #FF9800' }}>
            <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#999' }}>👀 Engaged (Opened)</p>
            <p style={{ margin: 0, fontSize: '20px', fontWeight: 'bold', color: '#FF9800' }}>{stats.engaged}</p>
          </div>
          <div style={{ backgroundColor: '#2a2a2a', padding: '12px', borderRadius: '6px', borderLeft: '3px solid #f44336' }}>
            <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#999' }}>❌ Not Interested</p>
            <p style={{ margin: 0, fontSize: '20px', fontWeight: 'bold', color: '#f44336' }}>{stats.notInterested}</p>
          </div>
        </div>
      )}

      {/* Filter Buttons */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '15px', flexWrap: 'wrap' }}>
        {[
          { label: 'All', value: 'all', emoji: '👥' },
          { label: '🔥 Interested', value: 'interested' },
          { label: '👀 Engaged', value: 'engaged' },
          { label: '❌ Not Interested', value: 'notInterested' }
        ].map(btn => (
          <button
            key={btn.value}
            onClick={() => setFilter(btn.value)}
            style={{
              padding: '8px 14px',
              borderRadius: '4px',
              border: 'none',
              backgroundColor: filter === btn.value ? '#4CAF50' : '#3a3a3a',
              color: 'white',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: filter === btn.value ? 'bold' : 'normal'
            }}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Recipients List */}
      <div style={{ overflowY: 'auto', maxHeight: '500px' }}>
        {filtered.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#999', padding: '20px' }}>No recipients in this category</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {filtered.map((recipient, idx) => {
              const interest = getInterestLevel(recipient);
              return (
                <div
                  key={idx}
                  style={{
                    backgroundColor: '#2a2a2a',
                    padding: '12px',
                    borderRadius: '6px',
                    borderLeft: `3px solid ${interest.color}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <p style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: '500' }}>{recipient.email}</p>
                    <div style={{ fontSize: '12px', color: '#999' }}>
                      {recipient.opened && <span style={{ marginRight: '10px' }}>👁️ Opened</span>}
                      {recipient.clicked && <span>🔗 Clicked ({recipient.events.filter(e => e.eventType === 'click').length})</span>}
                      {!recipient.opened && <span>Never opened</span>}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: 'bold', color: interest.color }}>
                      {interest.emoji} {interest.level}
                    </p>
                    <p style={{ margin: 0, fontSize: '12px', color: '#999' }}>
                      {new Date(recipient.lastActivity).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Legend */}
      <div style={{ backgroundColor: '#2a2a2a', padding: '12px', borderRadius: '6px', marginTop: '15px', fontSize: '12px', color: '#b0b0b0' }}>
        <p style={{ margin: '0 0 8px 0', fontWeight: 'bold' }}>📊 How Interest is Measured:</p>
        <p style={{ margin: '4px 0' }}>🔥 <span style={{ color: '#4CAF50' }}>Very Interested</span>: Opened email AND clicked a link</p>
        <p style={{ margin: '4px 0' }}>👀 <span style={{ color: '#FF9800' }}>Engaged</span>: Opened email but didn't click</p>
        <p style={{ margin: '4px 0' }}>❌ <span style={{ color: '#f44336' }}>Not Interested</span>: Never opened email</p>
      </div>
    </div>
  );
}

export default RecipientEngagementViewer;
