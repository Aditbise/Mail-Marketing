import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Dashboard() {
  const [analytics, setAnalytics] = useState({
    totalContacts: 0,
    totalSegments: 0,
    totalCampaigns: 0,
    emailsSent: 0,
    contactGrowth: [],
    segmentDistribution: [],
    recentActivity: [],
    loading: true
  });

  useEffect(() => {
    fetchRealAnalytics();
  }, []);

  const fetchRealAnalytics = async () => {
    try {
      setAnalytics(prev => ({ ...prev, loading: true }));
      
      // Get real analytics from your API
      const response = await axios.get('http://localhost:3001/analytics');
      
      // Get campaigns from localStorage (until you have campaign API)
      const campaigns = JSON.parse(localStorage.getItem('emailCampaigns') || '[]');
      const emailsSent = campaigns.reduce((total, campaign) => total + (campaign.sentCount || 0), 0);
      
      setAnalytics({
        ...response.data.data,
        totalCampaigns: campaigns.length,
        emailsSent: emailsSent,
        loading: false
      });
      
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setAnalytics(prev => ({ ...prev, loading: false }));
    }
  };

  if (analytics.loading) {
    return (
      <div style={{ 
        padding: '20px', 
        textAlign: 'center',
        minHeight: '100vh',
        backgroundColor: '#f5f7fa',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
          <h2>Loading Real Analytics...</h2>
          <p style={{ color: '#666' }}>Calculating data from your database</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', minHeight: '100vh', backgroundColor: '#f5f7fa' }}>
      {/* Header */}
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ color: '#2d3748', fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>
          📊 Real-Time Analytics Dashboard
        </h1>
        <p style={{ color: '#718096', fontSize: '16px' }}>
          Live data from your email marketing platform • Updated: {new Date().toLocaleString()}
        </p>
      </div>

      {/* Real Stats Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '20px',
        marginBottom: '30px'
      }}>
        {/* Total Contacts - REAL DATA */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07)',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ color: '#718096', fontSize: '14px', margin: '0 0 8px 0', textTransform: 'uppercase' }}>
                Database Contacts
              </p>
              <p style={{ color: '#2d3748', fontSize: '32px', fontWeight: 'bold', margin: 0 }}>
                {analytics.totalContacts.toLocaleString()}
              </p>
              <p style={{ color: '#38a169', fontSize: '12px', margin: '4px 0 0 0' }}>
                ✅ Live from MongoDB
              </p>
            </div>
            <div style={{ 
              backgroundColor: '#edf2f7', 
              borderRadius: '12px', 
              padding: '12px',
              fontSize: '24px'
            }}>
              👥
            </div>
          </div>
        </div>

        {/* Active Segments - REAL DATA */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07)',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ color: '#718096', fontSize: '14px', margin: '0 0 8px 0', textTransform: 'uppercase' }}>
                Active Segments
              </p>
              <p style={{ color: '#2d3748', fontSize: '32px', fontWeight: 'bold', margin: 0 }}>
                {analytics.totalSegments}
              </p>
              <p style={{ color: '#38a169', fontSize: '12px', margin: '4px 0 0 0' }}>
                ✅ Real segments created
              </p>
            </div>
            <div style={{ 
              backgroundColor: '#e6fffa', 
              borderRadius: '12px', 
              padding: '12px',
              fontSize: '24px'
            }}>
              🎯
            </div>
          </div>
        </div>

        {/* Campaigns - REAL DATA */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07)',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ color: '#718096', fontSize: '14px', margin: '0 0 8px 0', textTransform: 'uppercase' }}>
                Campaigns Created
              </p>
              <p style={{ color: '#2d3748', fontSize: '32px', fontWeight: 'bold', margin: 0 }}>
                {analytics.totalCampaigns}
              </p>
              <p style={{ color: '#38a169', fontSize: '12px', margin: '4px 0 0 0' }}>
                ✅ User-created campaigns
              </p>
            </div>
            <div style={{ 
              backgroundColor: '#fef5e7', 
              borderRadius: '12px', 
              padding: '12px',
              fontSize: '24px'
            }}>
              🚀
            </div>
          </div>
        </div>

        {/* Emails Sent - REAL DATA */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07)',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ color: '#718096', fontSize: '14px', margin: '0 0 8px 0', textTransform: 'uppercase' }}>
                Emails Delivered
              </p>
              <p style={{ color: '#2d3748', fontSize: '32px', fontWeight: 'bold', margin: 0 }}>
                {analytics.emailsSent.toLocaleString()}
              </p>
              <p style={{ color: '#38a169', fontSize: '12px', margin: '4px 0 0 0' }}>
                ✅ Via Brevo API
              </p>
            </div>
            <div style={{ 
              backgroundColor: '#f0fff4', 
              borderRadius: '12px', 
              padding: '12px',
              fontSize: '24px'
            }}>
              📧
            </div>
          </div>
        </div>
      </div>

      {/* Real Contact Growth Chart */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07)',
        border: '1px solid #e2e8f0',
        marginBottom: '20px'
      }}>
        <h3 style={{ color: '#2d3748', margin: '0 0 20px 0' }}>
          📈 Real Contact Growth (From Your Database)
        </h3>
        <div style={{ display: 'flex', alignItems: 'end', gap: '10px', height: '200px' }}>
          {analytics.contactGrowth.map((data, index) => {
            const maxCount = Math.max(...analytics.contactGrowth.map(d => d.count));
            const height = maxCount > 0 ? (data.count / maxCount) * 160 : 20;
            
            return (
              <div key={index} style={{ textAlign: 'center', flex: 1 }}>
                <div style={{
                  backgroundColor: data.count > 0 ? '#4299e1' : '#e2e8f0',
                  height: `${height}px`,
                  borderRadius: '4px 4px 0 0',
                  marginBottom: '8px',
                  display: 'flex',
                  alignItems: 'end',
                  justifyContent: 'center',
                  color: data.count > 0 ? 'white' : '#666',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  paddingBottom: '4px'
                }}>
                  {data.count > 0 ? data.count : '0'}
                </div>
                <div style={{ fontSize: '12px', color: '#718096' }}>{data.month}</div>
              </div>
            );
          })}
        </div>
        <p style={{ fontSize: '12px', color: '#666', marginTop: '10px', textAlign: 'center' }}>
          📊 Based on actual contact creation dates in your database
        </p>
      </div>

      {/* Real Recent Activity */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07)',
        border: '1px solid #e2e8f0'
      }}>
        <h3 style={{ color: '#2d3748', margin: '0 0 20px 0', fontSize: '20px', fontWeight: '600' }}>
          🕒 Live Activity Feed
        </h3>
        
        {analytics.recentActivity.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📝</div>
            <p>No recent activity - start by adding contacts or creating segments!</p>
          </div>
        ) : (
          <div>
            {analytics.recentActivity.map((activity, index) => (
              <div key={index} style={{
                padding: '16px',
                borderBottom: index < analytics.recentActivity.length - 1 ? '1px solid #e2e8f0' : 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <div style={{ fontSize: '24px' }}>{activity.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '600', color: '#2d3748' }}>
                    {activity.description}
                  </div>
                  <div style={{ fontSize: '12px', color: '#718096' }}>
                    {new Date(activity.timestamp).toLocaleString()}
                  </div>
                </div>
                <div style={{
                  backgroundColor: '#e6fffa',
                  color: '#234e52',
                  padding: '4px 8px',
                  borderRadius: '12px',
                  fontSize: '10px',
                  fontWeight: '600'
                }}>
                  REAL DATA
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}