import { useState, useEffect, useCallback, useMemo, memo } from 'react';
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

// Magic numbers extracted as constants
const CHART_BAR_MAX_HEIGHT = 160;
const CHART_BAR_MIN_HEIGHT = 20;

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
    backgroundColor: COLORS.bg,
    className: 'px-3 sm:px-6 md:px-12 py-5 sm:py-7 md:py-10 min-h-screen w-full box-border overflow-x-hidden'
  },
  card: { 
    backgroundColor: COLORS.cardBg,
    borderColor: COLORS.border,
    className: 'rounded-lg p-4 sm:p-5 md:p-6 shadow-lg border'
  },
  heading1: { 
    color: COLORS.text,
    className: 'text-2xl sm:text-3xl md:text-4xl font-bold mb-2'
  },
  heading2: { 
    color: COLORS.text,
    className: 'text-lg sm:text-xl md:text-xl font-semibold mb-3 sm:mb-5'
  },
  heading3: { 
    color: COLORS.text,
    className: 'text-base sm:text-lg mb-3 sm:mb-5'
  },
  label: { 
    color: COLORS.textSecondary,
    className: 'text-xs sm:text-sm mb-1 sm:mb-2 uppercase'
  },
  largeText: { 
    color: COLORS.text,
    className: 'text-2xl sm:text-3xl md:text-4xl font-bold m-0'
  },
  smallText: { 
    color: COLORS.success,
    className: 'text-xs mt-1'
  },
  badge: { 
    className: 'px-2 py-1 rounded-full text-xs font-semibold',
    backgroundColor: '#e6fffa',
    color: '#234e52'
  }
};

// Component-specific styles
const LOADING_STYLES = {
  wrapper: { 
    backgroundColor: COLORS.bg,
    className: 'px-3 sm:px-6 py-5 sm:py-10 text-center min-h-screen flex items-center justify-center'
  },
  content: { className: 'text-center' },
  icon: { className: 'text-4xl sm:text-5xl mb-3 sm:mb-4' },
  title: { color: COLORS.text, className: 'text-xl sm:text-2xl mb-2' },
  subtitle: { color: COLORS.textMuted, className: 'text-sm sm:text-base' }
};

const ERROR_STYLES = {
  wrapper: {
    backgroundColor: COLORS.bg,
    className: 'px-3 sm:px-6 md:px-12 py-5 sm:py-10 min-h-screen flex items-center justify-center'
  },
  content: { className: 'text-center' },
  title: { color: COLORS.danger, className: 'text-2xl sm:text-3xl' },
  message: { color: COLORS.textMuted, className: 'text-sm sm:text-base mt-2' },
  button: {
    backgroundColor: COLORS.accent,
    color: 'white',
    className: 'mt-4 sm:mt-5 px-4 sm:px-5 py-2 rounded-lg cursor-pointer text-sm font-semibold border-none hover:opacity-90'
  }
};

const ACTIVITY_ITEM_STYLES = {
  container: (isLast) => ({
    borderBottomColor: COLORS.border,
    className: `p-2 sm:p-3 md:p-4 ${!isLast ? 'border-b' : ''} flex items-center gap-2 sm:gap-3`
  }),
  content: { className: 'flex-1 min-w-0' },
  description: { fontWeight: '600', color: COLORS.text, className: 'text-sm sm:text-base truncate' },
  timestamp: { fontSize: '11px', color: COLORS.textMuted, className: 'text-xs' },
  badge: { backgroundColor: '#444', color: COLORS.text, className: 'px-2 py-1 rounded-full text-xs font-semibold flex-shrink-0' }
};

const CHART_BAR_STYLES = {
  container: { className: 'text-center flex-1 min-w-0' },
  bar: (bgColor, height) => ({
    backgroundColor: bgColor,
    height: `${height}px`,
    className: 'rounded-t flex items-end justify-center text-white text-xs font-bold pb-1 mb-2'
  }),
  label: { fontSize: '10px', color: COLORS.textMuted, className: 'text-xs truncate' }
};

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

const LoadingState = memo(() => {
  return (
    <div className={LOADING_STYLES.wrapper.className} style={{ backgroundColor: LOADING_STYLES.wrapper.backgroundColor }}>
      <div className={LOADING_STYLES.content.className}>
        <div className={LOADING_STYLES.icon.className}>Loading</div>
        <h2 style={{ color: LOADING_STYLES.title.color }} className={LOADING_STYLES.title.className}>Loading Real Analytics...</h2>
        <p style={{ color: LOADING_STYLES.subtitle.color }}>Calculating data from your database</p>
      </div>
    </div>
  );
});

const StatCard = memo(({ label, value, subtitle }) => {
  return (
    <div className={STYLE.card.className} style={{ backgroundColor: STYLE.card.backgroundColor, borderColor: STYLE.card.borderColor }}>
      <div>
        <p style={{ color: STYLE.label.color }} className={STYLE.label.className}>{label}</p>
        <p style={{ color: STYLE.largeText.color }} className={STYLE.largeText.className}>{typeof value === 'number' ? value.toLocaleString() : value}</p>
        <p style={{ color: STYLE.smallText.color }} className={STYLE.smallText.className}>{subtitle}</p>
      </div>
    </div>
  );
});

const ActivityItem = memo(({ activity, isLast }) => {
  return (
    <div className={ACTIVITY_ITEM_STYLES.container(isLast).className} style={{ borderBottomColor: ACTIVITY_ITEM_STYLES.container(isLast).borderBottomColor }}>
      <div className={ACTIVITY_ITEM_STYLES.content.className}>
        <div style={{ color: ACTIVITY_ITEM_STYLES.description.color }} className="font-semibold">{activity.description}</div>
        <div style={{ fontSize: ACTIVITY_ITEM_STYLES.timestamp.fontSize, color: ACTIVITY_ITEM_STYLES.timestamp.color }}>{activity.timestamp}</div>
      </div>
      <div className={ACTIVITY_ITEM_STYLES.badge.className} style={{ backgroundColor: ACTIVITY_ITEM_STYLES.badge.backgroundColor, color: ACTIVITY_ITEM_STYLES.badge.color }}>REAL DATA</div>
    </div>
  );
});

const ChartBar = memo(({ data, maxCount, month }) => {
  const height = maxCount > 0 ? (data / maxCount) * CHART_BAR_MAX_HEIGHT : CHART_BAR_MIN_HEIGHT;
  const barColor = data > 0 ? COLORS.accent : COLORS.border;
  
  return (
    <div className={CHART_BAR_STYLES.container.className}>
      <div className={CHART_BAR_STYLES.bar(barColor, height).className} style={CHART_BAR_STYLES.bar(barColor, height)}>
        {data > 0 ? data : '0'}
      </div>
      <div style={CHART_BAR_STYLES.label}>{month}</div>
    </div>
  );
});

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

  useEffect(() => {
    fetchRealAnalytics();
  }, []);

  // ========== API FUNCTIONS ==========
  const fetchRealAnalytics = useCallback(async () => {
    try {
      setAnalytics(prev => ({ ...prev, loading: true, error: null }));
      
      const analyticsData = await axios.get(ENDPOINTS.analytics);
      const campaigns = JSON.parse(localStorage.getItem(STORAGE_KEYS.emailCampaigns) || '[]');
      const emailsSent = campaigns.reduce((total, campaign) => total + (campaign.sentCount || 0), 0);
      
      setAnalytics({
        ...analyticsData.data.data,
        totalCampaigns: campaigns.length,
        emailsSent,
        loading: false,
        error: null
      });
    } catch (error) {
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
    { label: 'Database Contacts', value: analytics.totalContacts, subtitle: 'Live from MongoDB' },
    { label: 'Active Segments', value: analytics.totalSegments, subtitle: 'Real segments created' },
    { label: 'Campaigns Created', value: analytics.totalCampaigns, subtitle: 'User-created campaigns' },
    { label: 'Emails Delivered', value: analytics.emailsSent, subtitle: 'Via Brevo API' }
  ], [analytics.totalContacts, analytics.totalSegments, analytics.totalCampaigns, analytics.emailsSent]);

  const lastUpdated = useMemo(() => new Date().toLocaleString(), []);

  // ========== RENDER ==========
  if (analytics.loading) return <LoadingState />;

  if (analytics.error) {
    return (
      <div className={ERROR_STYLES.wrapper.className} style={{ backgroundColor: ERROR_STYLES.wrapper.backgroundColor }}>
        <div className={ERROR_STYLES.content.className}>
          <h2 style={{ color: ERROR_STYLES.title.color }}>Error Loading Analytics</h2>
          <p style={{ color: ERROR_STYLES.message.color }}>{analytics.error}</p>
          <button onClick={fetchRealAnalytics} className={ERROR_STYLES.button.className} style={{ backgroundColor: ERROR_STYLES.button.backgroundColor, color: ERROR_STYLES.button.color }}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={STYLE.container.className} style={{ backgroundColor: STYLE.container.backgroundColor }}>
      <div className="mb-4 sm:mb-6 md:mb-8">
        <h1 style={{ color: STYLE.heading1.color }} className={STYLE.heading1.className}>Real-Time Analytics Dashboard</h1>
        <p className="text-xs sm:text-sm md:text-base mt-1 sm:mt-2" style={{ color: COLORS.textMuted }}>
          Live data from your email marketing platform • Updated: {lastUpdated}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8 md:mb-10">
        {statsData.map((stat, idx) => (
          <StatCard key={idx} label={stat.label} value={stat.value} subtitle={stat.subtitle} />
        ))}
      </div>

      <div className={`${STYLE.card.className} mb-6 sm:mb-8`} style={{ backgroundColor: STYLE.card.backgroundColor, borderColor: STYLE.card.borderColor }}>
        <h3 style={{ color: STYLE.heading3.color }} className={STYLE.heading3.className}>Real Contact Growth (From Your Database)</h3>
        <div className="flex items-end gap-2 sm:gap-3 h-40 sm:h-48 md:h-56 overflow-x-auto pb-2">
          {analytics.contactGrowth.length > 0 ? (
            analytics.contactGrowth.map((data, idx) => (
              <ChartBar key={idx} data={data.count} maxCount={maxContactGrowth} month={data.month} />
            ))
          ) : (
            <div className="w-full text-center p-3 sm:p-5" style={{ color: COLORS.textMuted }}>
              No data available
            </div>
          )}
        </div>
        <p className="text-xs text-center mt-2 sm:mt-3" style={{ color: COLORS.textMuted }}>
          Based on actual contact creation dates in your database
        </p>
      </div>

      <div className={STYLE.card.className} style={{ backgroundColor: STYLE.card.backgroundColor, borderColor: STYLE.card.borderColor }}>
        <h3 style={{ color: STYLE.heading2.color }} className={STYLE.heading2.className}>Live Activity Feed</h3>
        {analytics.recentActivity.length === 0 ? (
          <div className="text-center p-6 sm:p-10" style={{ color: COLORS.textMuted }}>
            <div className="text-3xl sm:text-5xl mb-2 sm:mb-4">No Activity</div>
            <p className="text-sm sm:text-base">No recent activity - start by adding contacts or creating segments!</p>
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