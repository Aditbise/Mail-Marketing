import { useState, useEffect } from 'react';
import axios from 'axios';

// Dark Mode Color Scheme
const COLORS = {
  bg: '#1a1a1a',
  cardBg: '#2a2a2a',
  border: '#444',
  text: '#ffffff',
  textSecondary: '#b0b0b0',
  textMuted: '#808080',
  accent: '#4299e1',
  success: '#38a169',
  warning: '#ecc94b',
  danger: '#f56565'
};

// Reusable Styles
const STYLE = {
  container: { padding: '40px 50px', minHeight: '100vh', backgroundColor: COLORS.bg, width: '100%', boxSizing: 'border-box', overflowX: 'hidden' },
  card: { backgroundColor: COLORS.cardBg, borderRadius: '12px', padding: '24px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)', border: `1px solid ${COLORS.border}` },
  heading1: { color: COLORS.text, fontSize: '32px', fontWeight: 'bold', marginBottom: '8px', margin: 0 },
  heading2: { color: COLORS.text, fontSize: '20px', fontWeight: '600', margin: '0 0 20px 0' },
  heading3: { color: COLORS.text, margin: '0 0 20px 0' },
  label: { color: COLORS.textSecondary, fontSize: '14px', margin: '0 0 8px 0', textTransform: 'uppercase' },
  largeText: { color: COLORS.text, fontSize: '32px', fontWeight: 'bold', margin: 0 },
  smallText: { color: COLORS.success, fontSize: '12px', margin: '4px 0 0 0' },
  badge: { backgroundColor: '#e6fffa', color: '#234e52', padding: '4px 8px', borderRadius: '12px', fontSize: '10px', fontWeight: '600' }
};

// Loading State Component
function LoadingState() {
  return (
    <div style={{ padding: '20px', textAlign: 'center', minHeight: '100vh', backgroundColor: COLORS.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
        <h2 style={{ color: COLORS.text, margin: '0 0 8px 0' }}>Loading Real Analytics...</h2>
        <p style={{ color: COLORS.textMuted }}>Calculating data from your database</p>
      </div>
    </div>
  );
}

// Reusable Stat Card Component
function StatCard({ label, value, subtitle, icon, bgColor }) {
  return (
    <div style={STYLE.card}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <p style={STYLE.label}>{label}</p>
          <p style={STYLE.largeText}>{typeof value === 'number' ? value.toLocaleString() : value}</p>
          <p style={STYLE.smallText}>{subtitle}</p>
        </div>
        <div style={{ backgroundColor: bgColor, borderRadius: '12px', padding: '12px', fontSize: '24px' }}>
          {icon}
        </div>
      </div>
    </div>
  );
}

// Activity Item Component
function ActivityItem({ activity, isLast }) {
  return (
    <div style={{ padding: '16px', borderBottom: !isLast ? `1px solid ${COLORS.border}` : 'none', display: 'flex', alignItems: 'center', gap: '12px' }}>
      <div style={{ fontSize: '24px' }}>{activity.icon}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: '600', color: COLORS.text }}>{activity.description}</div>
        <div style={{ fontSize: '12px', color: COLORS.textMuted }}>{new Date(activity.timestamp).toLocaleString()}</div>
      </div>
      <div style={{ ...STYLE.badge, backgroundColor: '#444', color: COLORS.text }}>REAL DATA</div>
    </div>
  );
}

// Chart Bar Component
function ChartBar({ data, maxCount, month }) {
  const height = maxCount > 0 ? (data / maxCount) * 160 : 20;
  return (
    <div style={{ textAlign: 'center', flex: 1 }}>
      <div style={{ backgroundColor: data > 0 ? COLORS.accent : COLORS.border, height: `${height}px`, borderRadius: '4px 4px 0 0', marginBottom: '8px', display: 'flex', alignItems: 'end', justifyContent: 'center', color: 'white', fontSize: '12px', fontWeight: 'bold', paddingBottom: '4px' }}>
        {data > 0 ? data : '0'}
      </div>
      <div style={{ fontSize: '12px', color: COLORS.textMuted }}>{month}</div>
    </div>
  );
}

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
      const response = await axios.get('http://localhost:3001/analytics');
      const campaigns = JSON.parse(localStorage.getItem('emailCampaigns') || '[]');
      const emailsSent = campaigns.reduce((total, campaign) => total + (campaign.sentCount || 0), 0);
      
      setAnalytics({ ...response.data.data, totalCampaigns: campaigns.length, emailsSent, loading: false });
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setAnalytics(prev => ({ ...prev, loading: false }));
    }
  };

  if (analytics.loading) return <LoadingState />;

  const maxContactGrowth = analytics.contactGrowth.length > 0 ? Math.max(...analytics.contactGrowth.map(d => d.count)) : 0;

  return (
    <div style={STYLE.container}>
      {/* Header */}
      <div style={{ marginBottom: '30px' }}>
        <h1 style={STYLE.heading1}>📊 Real-Time Analytics Dashboard</h1>
        <p style={{ color: COLORS.textMuted, fontSize: '16px' }}>
          Live data from your email marketing platform • Updated: {new Date().toLocaleString()}
        </p>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '40px' }}>
        <StatCard label="Database Contacts" value={analytics.totalContacts} subtitle="✅ Live from MongoDB" icon="👥" bgColor="#333" />
        <StatCard label="Active Segments" value={analytics.totalSegments} subtitle="✅ Real segments created" icon="🎯" bgColor="#333" />
        <StatCard label="Campaigns Created" value={analytics.totalCampaigns} subtitle="✅ User-created campaigns" icon="🚀" bgColor="#333" />
        <StatCard label="Emails Delivered" value={analytics.emailsSent} subtitle="✅ Via Brevo API" icon="📧" bgColor="#333" />
      </div>

      {/* Contact Growth Chart */}
      <div style={{ ...STYLE.card, marginBottom: '30px' }}>
        <h3 style={STYLE.heading3}>📈 Real Contact Growth (From Your Database)</h3>
        <div style={{ display: 'flex', alignItems: 'end', gap: '12px', height: '220px' }}>
          {analytics.contactGrowth.map((data, idx) => (
            <ChartBar key={idx} data={data.count} maxCount={maxContactGrowth} month={data.month} />
          ))}
        </div>
        <p style={{ fontSize: '12px', color: COLORS.textMuted, marginTop: '10px', textAlign: 'center' }}>
          📊 Based on actual contact creation dates in your database
        </p>
      </div>

      {/* Recent Activity */}
      <div style={STYLE.card}>
        <h3 style={STYLE.heading2}>🕒 Live Activity Feed</h3>
        {analytics.recentActivity.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: COLORS.textMuted }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📝</div>
            <p>No recent activity - start by adding contacts or creating segments!</p>
          </div>
        ) : (
          <div>
            {analytics.recentActivity.map((activity, idx) => (
              <ActivityItem key={idx} activity={activity} isLast={idx === analytics.recentActivity.length - 1} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}