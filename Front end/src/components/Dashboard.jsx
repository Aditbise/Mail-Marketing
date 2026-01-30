import { useState, useEffect, useCallback, useMemo, memo } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001';
const ENDPOINTS = {
  analytics: `${API_BASE_URL}/analytics`
};

const STORAGE_KEYS = {
  emailCampaigns: 'emailCampaigns'
};

const CHART_BAR_MAX_HEIGHT = 160;
const CHART_BAR_MIN_HEIGHT = 20;

const LoadingState = memo(() => {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 flex items-center justify-center">
      <div className="text-center">
        <div className="text-5xl mb-4">Loading</div>
        <h2 className="text-2xl text-white mb-2">Loading Real Analytics...</h2>
        <p className="text-zinc-400">Calculating data from your database</p>
      </div>
    </div>
  );
});

const StatCard = memo(({ label, value, subtitle }) => {
  return (
    <div className="bg-zinc-800 rounded-xl p-8 shadow-lg border border-zinc-700">
      <div>
        <p className="text-zinc-400 text-sm uppercase mb-3">{label}</p>
        <p className="text-5xl font-bold text-white mb-1">{typeof value === 'number' ? value.toLocaleString() : value}</p>
        <p className="text-xs text-lime-500">{subtitle}</p>
      </div>
    </div>
  );
});

const ActivityItem = memo(({ activity, isLast }) => {
  return (
    <div className={`p-4 flex items-center gap-3 ${!isLast ? 'border-b border-zinc-700' : ''}`}>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-lg text-white">{activity.description}</div>
        <div className="text-xs text-zinc-500 mt-1">{activity.timestamp}</div>
      </div>
      <div className="px-2 py-1 rounded-full text-xs font-semibold flex-shrink-0 bg-zinc-700 text-lime-500">REAL DATA</div>
    </div>
  );
});

const ChartBar = memo(({ data, maxCount, month }) => {
  const height = maxCount > 0 ? (data / maxCount) * CHART_BAR_MAX_HEIGHT : CHART_BAR_MIN_HEIGHT;
  
  return (
    <div className="text-center flex-1 min-w-0">
      <div className="text-sm font-bold text-white mb-1">{data}</div>
      <div 
        className="rounded-t"
        style={{
          backgroundColor: data > 0 ? '#84cc16' : '#3f3f46',
          height: `${height}px`
        }}
      />
      <div className="text-xs text-zinc-500 truncate mt-2">{month}</div>
    </div>
  );
});

export default function Dashboard() {
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

  const maxContactGrowth = useMemo(
    () => analytics.contactGrowth.length > 0 
      ? Math.max(...analytics.contactGrowth.map(d => d.count))
      : 0,
    [analytics.contactGrowth]
  );

  const sortedContactGrowth = useMemo(
    () => {
      if (!analytics.contactGrowth || analytics.contactGrowth.length === 0) return [];
      return [...analytics.contactGrowth].sort((a, b) => {
        const monthA = new Date(`${a.month} 1`).getTime();
        const monthB = new Date(`${b.month} 1`).getTime();
        return monthA - monthB;
      });
    },
    [analytics.contactGrowth]
  );

  const statsData = useMemo(() => [
    { label: 'Database Contacts', value: analytics.totalContacts, subtitle: 'Live from MongoDB' },
    { label: 'Active Segments', value: analytics.totalSegments, subtitle: 'Real segments created' },
    { label: 'Campaigns Created', value: analytics.totalCampaigns, subtitle: 'User-created campaigns' },
    { label: 'Emails Delivered', value: analytics.emailsSent, subtitle: 'Via Brevo API' }
  ], [analytics.totalContacts, analytics.totalSegments, analytics.totalCampaigns, analytics.emailsSent]);

  const lastUpdated = useMemo(() => new Date().toLocaleString(), []);

  if (analytics.loading) return <LoadingState />;

  if (analytics.error) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-3xl text-lime-500">Error Loading Analytics</h2>
          <p className="text-zinc-400 text-base mt-2">{analytics.error}</p>
          <button 
            onClick={fetchRealAnalytics} 
            className="mt-5 px-5 py-2 rounded-lg cursor-pointer text-sm font-semibold border-none bg-lime-500 text-black hover:opacity-90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 overflow-y-auto overflow-x-hidden">
      <div className="ml-20 lg:ml-64 max-w-[1600px] mx-auto p-8 flex flex-col gap-8">
        <div className="mb-6">
          <h1 className="text-5xl font-bold text-white mb-3">Real-Time Analytics Dashboard</h1>
          <p className="text-lg text-zinc-400">
            Live data from your email marketing platform • Updated: {lastUpdated}
          </p>
        </div>

        <div className="mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {statsData.map((stat, idx) => (
              <StatCard key={idx} label={stat.label} value={stat.value} subtitle={stat.subtitle} />
            ))}
          </div>
        </div>

        <div className="mb-8">
          <div className="bg-zinc-800 rounded-xl p-8 shadow-lg border border-zinc-700">
            <h3 className="text-2xl font-semibold text-white mb-6">Real Contact Growth (From Your Database)</h3>
            <div className="flex items-end gap-4 h-64 overflow-x-auto pb-3">
            {sortedContactGrowth.length > 0 ? (
              sortedContactGrowth.map((data, idx) => (
                <ChartBar key={idx} data={data.count} maxCount={maxContactGrowth} month={data.month} />
              ))
            ) : (
              <div className="w-full text-center p-6 text-zinc-400">
                No data available
              </div>
            )}
          </div>
          <p className="text-sm text-center mt-4 text-zinc-400">
            Based on actual contact creation dates in your database
          </p>
          </div>
        </div>

        <div>
          <div className="bg-zinc-800 rounded-xl p-8 shadow-lg border border-zinc-700">
            <h3 className="text-2xl font-semibold text-white mb-6">Live Activity Feed</h3>
            {analytics.recentActivity.length === 0 ? (
              <div className="text-center p-12 text-zinc-400">
                <div className="text-6xl mb-5">No Activity</div>
                <p className="text-lg">No recent activity - start by adding contacts or creating segments!</p>
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
      </div>
    </div>
  );
}