import { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';

// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================

const API_BASE_URL = 'http://localhost:3001';
const ENDPOINTS = {
  analytics: `${API_BASE_URL}/analytics`
};

const STORAGE_KEYS = {
  emailCampaigns: 'emailCampaigns'
};

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

// Component-specific styles
const LOADING_STYLES = {
  wrapper: { 
    padding: '20px', 
    textAlign: 'center', 
    minHeight: '100vh', 
    backgroundColor: COLORS.bg, 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  content: { textAlign: 'center' },
  icon: { fontSize: '48px', marginBottom: '16px' },
  title: { color: COLORS.text, margin: '0 0 8px 0' },
  subtitle: { color: COLORS.textMuted }
};

const ERROR_STYLES = {
  wrapper: {
    padding: '40px 50px',
    minHeight: '100vh',
    backgroundColor: COLORS.bg,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  content: { textAlign: 'center' },
  title: { color: COLORS.danger },
  message: { color: COLORS.textMuted },
  button: {
    marginTop: '20px',
    padding: '10px 20px',
    backgroundColor: COLORS.accent,
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600'
  }
};

const ACTIVITY_ITEM_STYLES = {
  container: (isLast) => ({
    padding: '16px',
    borderBottom: !isLast ? `1px solid ${COLORS.border}` : 'none',
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  }),
  content: { flex: 1 },
  description: { fontWeight: '600', color: COLORS.text },
  timestamp: { fontSize: '12px', color: COLORS.textMuted },
  badge: { ...STYLE.badge, backgroundColor: '#444', color: COLORS.text }
};

const CHART_BAR_STYLES = {
  container: { textAlign: 'center', flex: 1 },
  bar: (bgColor, height) => ({
    backgroundColor: bgColor,
    height: `${height}px`,
    borderRadius: '4px 4px 0 0',
    marginBottom: '8px',
    display: 'flex',
    alignItems: 'end',
    justifyContent: 'center',
    color: 'white',
    fontSize: '12px',
    fontWeight: 'bold',
    paddingBottom: '4px'
  }),
  label: { fontSize: '12px', color: COLORS.textMuted }
};

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

/**
 * LoadingState Component
 * Displays a loading indicator while fetching analytics data
 */
function LoadingState() {
  return (
    <div style={LOADING_STYLES.wrapper}>
      <div style={LOADING_STYLES.content}>
        <div style={LOADING_STYLES.icon}>Loading</div>
        <h2 style={LOADING_STYLES.title}>Loading Real Analytics...</h2>
        <p style={LOADING_STYLES.subtitle}>Calculating data from your database</p>
      </div>
    </div>
  );
}

/**
 * StatCard Component
 * Displays a single statistic with value and subtitle
 * Props:
 *  - label: Card title
 *  - value: Main number to display
 *  - subtitle: Additional info below value
 */
function StatCard({ label, value, subtitle }) {
  return (
    <div style={STYLE.card}>
      <div>
        <p style={STYLE.label}>{label}</p>
        <p style={STYLE.largeText}>{typeof value === 'number' ? value.toLocaleString() : value}</p>
        <p style={STYLE.smallText}>{subtitle}</p>
      </div>
    </div>
  );
}

/**
 * ActivityItem Component
 * Displays a single activity entry in the activity feed
 * Props:
 *  - activity: Object with description, timestamp
 *  - isLast: Boolean to determine if border should be shown
 */
function ActivityItem({ activity, isLast }) {
  return (
    <div style={ACTIVITY_ITEM_STYLES.container(isLast)}>
      <div style={ACTIVITY_ITEM_STYLES.content}>
        <div style={ACTIVITY_ITEM_STYLES.description}>{activity.description}</div>
        <div style={ACTIVITY_ITEM_STYLES.timestamp}>{activity.timestamp}</div>
      </div>
      <div style={ACTIVITY_ITEM_STYLES.badge}>REAL DATA</div>
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
  const barColor = data > 0 ? COLORS.accent : COLORS.border;
  
  return (
    <div style={CHART_BAR_STYLES.container}>
      <div style={CHART_BAR_STYLES.bar(barColor, height)}>
        {data > 0 ? data : '0'}
      </div>
      <div style={CHART_BAR_STYLES.label}>{month}</div>
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
    recentActivity: [],
    loading: true,
    error: null
  });

  // ========== EFFECTS ==========
  useEffect(() => {
    fetchRealAnalytics();
  }, []);

  // ========== API FUNCTIONS ==========
  /**
   * Fetches analytics data from backend API
   * Combines API data with campaign data from localStorage
   * Updates state with fetched data or handles errors gracefully
   */
  const fetchRealAnalytics = useCallback(async () => {
    try {
      setAnalytics(prev => ({ ...prev, loading: true, error: null }));
      
      // Fetch analytics from server
      const response = await axios.get(ENDPOINTS.analytics);
      
      // Get campaign data from localStorage
      const campaigns = JSON.parse(localStorage.getItem(STORAGE_KEYS.emailCampaigns) || '[]');
      const emailsSent = campaigns.reduce((total, campaign) => total + (campaign.sentCount || 0), 0);
      
      // Update state with combined data
      setAnalytics({
        ...response.data.data,
        totalCampaigns: campaigns.length,
        emailsSent,
        loading: false,
        error: null
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setAnalytics(prev => ({ ...prev, loading: false, error: 'Failed to load analytics' }));
    }
  }, []);

  // ========== MEMOIZED CALCULATIONS ==========
  const maxContactGrowth = useMemo(
    () => analytics.contactGrowth.length > 0 
      ? Math.max(...analytics.contactGrowth.map(d => d.count))
      : 0,
    [analytics.contactGrowth]
  );

  const statsData = useMemo(() => [
    { 
      label: 'Database Contacts', 
      value: analytics.totalContacts, 
      subtitle: 'Live from MongoDB' 
    },
    { 
      label: 'Active Segments', 
      value: analytics.totalSegments, 
      subtitle: 'Real segments created' 
    },
    { 
      label: 'Campaigns Created', 
      value: analytics.totalCampaigns, 
      subtitle: 'User-created campaigns' 
    },
    { 
      label: 'Emails Delivered', 
      value: analytics.emailsSent, 
      subtitle: 'Via Brevo API' 
    }
  ], [analytics.totalContacts, analytics.totalSegments, analytics.totalCampaigns, analytics.emailsSent]);

  const lastUpdated = useMemo(() => new Date().toLocaleString(), []);

  // ========== RENDER ==========
  if (analytics.loading) return <LoadingState />;

  if (analytics.error) {
    return (
      <div style={ERROR_STYLES.wrapper}>
        <div style={ERROR_STYLES.content}>
          <h2 style={ERROR_STYLES.title}>Error Loading Analytics</h2>
          <p style={ERROR_STYLES.message}>{analytics.error}</p>
          <button onClick={fetchRealAnalytics} style={ERROR_STYLES.button}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={STYLE.container}>
      {/* ===== HEADER SECTION ===== */}
      <div style={{ marginBottom: '30px' }}>
        <h1 style={STYLE.heading1}>Real-Time Analytics Dashboard</h1>
        <p style={{ color: COLORS.textMuted, fontSize: '16px' }}>
          Live data from your email marketing platform • Updated: {lastUpdated}
        </p>
      </div>

      {/* ===== STATS GRID SECTION ===== */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '40px' }}>
        {statsData.map((stat, idx) => (
          <StatCard 
            key={idx}
            label={stat.label} 
            value={stat.value} 
            subtitle={stat.subtitle} 
          />
        ))}
      </div>

      {/* ===== CONTACT GROWTH CHART SECTION ===== */}
      <div style={{ ...STYLE.card, marginBottom: '30px' }}>
        <h3 style={STYLE.heading3}>Real Contact Growth (From Your Database)</h3>
        <div style={{ display: 'flex', alignItems: 'end', gap: '12px', height: '220px' }}>
          {analytics.contactGrowth.length > 0 ? (
            analytics.contactGrowth.map((data, idx) => (
              <ChartBar key={idx} data={data.count} maxCount={maxContactGrowth} month={data.month} />
            ))
          ) : (
            <div style={{ width: '100%', textAlign: 'center', color: COLORS.textMuted, padding: '20px' }}>
              No data available
            </div>
          )}
        </div>
        <p style={{ fontSize: '12px', color: COLORS.textMuted, marginTop: '10px', textAlign: 'center' }}>
          Based on actual contact creation dates in your database
        </p>
      </div>

      {/* ===== RECENT ACTIVITY SECTION ===== */}
      <div style={STYLE.card}>
        <h3 style={STYLE.heading2}>Live Activity Feed</h3>
        {analytics.recentActivity.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: COLORS.textMuted }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>No Activity</div>
            <p>No recent activity - start by adding contacts or creating segments!</p>
          </div>
        ) : (
          <div>
            {analytics.recentActivity.map((activity, idx) => (
              <ActivityItem 
                key={idx} 
                activity={activity} 
                isLast={idx === analytics.recentActivity.length - 1} 
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}