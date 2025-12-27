import { useState, useEffect } from 'react';
import axios from 'axios';

// ============================================================================
// CONSTANTS & STYLES
// ============================================================================

/**
 * Color Scheme for Dark Mode
 * Used throughout the dashboard for consistent theming
 */
const COLORS = {
  bg: '#1a1a1a',           // Main background
  cardBg: '#2a2a2a',       // Card backgrounds
  border: '#444',          // Border color
  text: '#ffffff',         // Primary text
  textSecondary: '#b0b0b0',// Secondary text
  textMuted: '#808080',    // Muted/dimmed text
  accent: '#4299e1',       // Primary accent (blue)
  success: '#38a169',      // Success color (green)
  warning: '#ecc94b',      // Warning color (yellow)
  danger: '#f56565'        // Danger color (red)
};

/**
 * Reusable Style Objects
 * Centralized styles for consistent component appearance
 */
const STYLE = {
  container: { 
    padding: '40px 50px', 
    minHeight: '100vh', 
    backgroundColor: COLORS.bg, 
    width: '100%', 
    boxSizing: 'border-box', 
    overflowX: 'hidden' 
  },
  card: { 
    backgroundColor: COLORS.cardBg, 
    borderRadius: '12px', 
    padding: '24px', 
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)', 
    border: `1px solid ${COLORS.border}` 
  },
  heading1: { 
    color: COLORS.text, 
    fontSize: '32px', 
    fontWeight: 'bold', 
    marginBottom: '8px', 
    margin: 0 
  },
  heading2: { 
    color: COLORS.text, 
    fontSize: '20px', 
    fontWeight: '600', 
    margin: '0 0 20px 0' 
  },
  heading3: { 
    color: COLORS.text, 
    margin: '0 0 20px 0' 
  },
  label: { 
    color: COLORS.textSecondary, 
    fontSize: '14px', 
    margin: '0 0 8px 0', 
    textTransform: 'uppercase' 
  },
  largeText: { 
    color: COLORS.text, 
    fontSize: '32px', 
    fontWeight: 'bold', 
    margin: 0 
  },
  smallText: { 
    color: COLORS.success, 
    fontSize: '12px', 
    margin: '4px 0 0 0' 
  },
  badge: { 
    backgroundColor: '#e6fffa', 
    color: '#234e52', 
    padding: '4px 8px', 
    borderRadius: '12px', 
    fontSize: '10px', 
    fontWeight: '600' 
  }
};

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

/**
 * LoadingState Component
 * Displays a loading indicator while fetching analytics data
 * Shows: Icon + Loading message + Instructions
 */
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

/**
 * StatCard Component
 * Displays a single statistic with icon, value, and subtitle
 * Props:
 *  - label: Card title
 *  - value: Main number to display
 *  - subtitle: Additional info below value
 *  - icon: Emoji or icon to display
 *  - bgColor: Background color for icon section
 */
function StatCard({ label, value, subtitle, icon, bgColor }) {
  return (
    <div style={STYLE.card}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Left side: Text content */}
        <div>
          <p style={STYLE.label}>{label}</p>
          <p style={STYLE.largeText}>{typeof value === 'number' ? value.toLocaleString() : value}</p>
          <p style={STYLE.smallText}>{subtitle}</p>
        </div>
        {/* Right side: Icon */}
        <div style={{ backgroundColor: bgColor, borderRadius: '12px', padding: '12px', fontSize: '24px' }}>
          {icon}
        </div>
      </div>
    </div>
  );
}

/**
 * ActivityItem Component
 * Displays a single activity entry in the activity feed
 * Shows: Icon + Description + Timestamp + Badge
 * Props:
 *  - activity: Object with icon, description, timestamp
 *  - isLast: Boolean to determine if border should be shown
 */
function ActivityItem({ activity, isLast }) {
  return (
    <div style={{ padding: '16px', borderBottom: !isLast ? `1px solid ${COLORS.border}` : 'none', display: 'flex', alignItems: 'center', gap: '12px' }}>
      {/* Activity Icon */}
      <div style={{ fontSize: '24px' }}>{activity.icon}</div>
      
      {/* Activity Content */}
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: '600', color: COLORS.text }}>{activity.description}</div>
        <div style={{ fontSize: '12px', color: COLORS.textMuted }}>{new Date(activity.timestamp).toLocaleString()}</div>
      </div>
      
      {/* Badge */}
      <div style={{ ...STYLE.badge, backgroundColor: '#444', color: COLORS.text }}>REAL DATA</div>
    </div>
  );
}

/**
 * ChartBar Component
 * Displays a single bar in the contact growth chart
 * Bar height is proportional to data value
 * Props:
 *  - data: Numeric value for bar height
 *  - maxCount: Maximum value for scaling
 *  - month: Label for the bar
 */
function ChartBar({ data, maxCount, month }) {
  const height = maxCount > 0 ? (data / maxCount) * 160 : 20;
  return (
    <div style={{ textAlign: 'center', flex: 1 }}>
      {/* Bar */}
      <div style={{ backgroundColor: data > 0 ? COLORS.accent : COLORS.border, height: `${height}px`, borderRadius: '4px 4px 0 0', marginBottom: '8px', display: 'flex', alignItems: 'end', justifyContent: 'center', color: 'white', fontSize: '12px', fontWeight: 'bold', paddingBottom: '4px' }}>
        {data > 0 ? data : '0'}
      </div>
      {/* Label */}
      <div style={{ fontSize: '12px', color: COLORS.textMuted }}>{month}</div>
    </div>
  );
}

// ============================================================================
// MAIN DASHBOARD COMPONENT
// ============================================================================

export default function Dashboard() {
  // ========== STATE ==========
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

  // ========== EFFECTS ==========
  useEffect(() => {
    fetchRealAnalytics();
  }, []);

  // ========== FUNCTIONS ==========
  /**
   * Fetches analytics data from backend API
   * Combines API data with campaign data from localStorage
   * Updates state with fetched data or handles errors gracefully
   */
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

  // ========== RENDER ==========
  if (analytics.loading) return <LoadingState />;

  const maxContactGrowth = analytics.contactGrowth.length > 0 ? Math.max(...analytics.contactGrowth.map(d => d.count)) : 0;

  return (
    <div style={STYLE.container}>
      
      {/* ===== HEADER SECTION ===== */}
      <div style={{ marginBottom: '30px' }}>
        <h1 style={STYLE.heading1}>📊 Real-Time Analytics Dashboard</h1>
        <p style={{ color: COLORS.textMuted, fontSize: '16px' }}>
          Live data from your email marketing platform • Updated: {new Date().toLocaleString()}
        </p>
      </div>

      {/* ===== STATS GRID SECTION ===== */}
      {/* Displays 4 key metrics: Contacts, Segments, Campaigns, Emails */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '40px' }}>
        <StatCard 
          label="Database Contacts" 
          value={analytics.totalContacts} 
          subtitle="✅ Live from MongoDB" 
          icon="👥" 
          bgColor="#333" 
        />
        <StatCard 
          label="Active Segments" 
          value={analytics.totalSegments} 
          subtitle="✅ Real segments created" 
          icon="🎯" 
          bgColor="#333" 
        />
        <StatCard 
          label="Campaigns Created" 
          value={analytics.totalCampaigns} 
          subtitle="✅ User-created campaigns" 
          icon="🚀" 
          bgColor="#333" 
        />
        <StatCard 
          label="Emails Delivered" 
          value={analytics.emailsSent} 
          subtitle="✅ Via Brevo API" 
          icon="📧" 
          bgColor="#333" 
        />
      </div>

      {/* ===== CONTACT GROWTH CHART SECTION ===== */}
      {/* Bar chart showing contact growth over time */}
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

      {/* ===== RECENT ACTIVITY SECTION ===== */}
      {/* Shows recent system activities or empty state */}
      <div style={STYLE.card}>
        <h3 style={STYLE.heading2}>🕒 Live Activity Feed</h3>
        {analytics.recentActivity.length === 0 ? (
          // Empty state when no activities
          <div style={{ textAlign: 'center', padding: '40px', color: COLORS.textMuted }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📝</div>
            <p>No recent activity - start by adding contacts or creating segments!</p>
          </div>
        ) : (
          // Activity list
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