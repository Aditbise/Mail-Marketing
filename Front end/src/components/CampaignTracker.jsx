import { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart3, Mail, Eye, MousePointerClick, TrendingUp, Calendar, User, ExternalLink, Filter } from 'lucide-react';

const API_BASE_URL = 'http://localhost:3001';

export default function CampaignTracker() {
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [campaignStats, setCampaignStats] = useState(null);
  const [topLinks, setTopLinks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filterTab, setFilterTab] = useState('overview');

  // Fetch all campaigns and their tracking summaries
  const fetchCampaignsSummary = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/tracking/campaigns-summary`);
      if (response.data.success) {
        setCampaigns(response.data.campaigns);
        // Auto-select first campaign
        if (response.data.campaigns.length > 0 && !selectedCampaign) {
          setSelectedCampaign(response.data.campaigns[0].campaignId);
        }
      }
    } catch (err) {
      console.error('Error fetching campaigns summary:', err);
      setError('Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  };

  // Fetch stats for selected campaign
  const fetchCampaignStats = async (campaignId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/tracking/campaign/${campaignId}`);
      if (response.data.success) {
        setCampaignStats(response.data);
      }
    } catch (err) {
      console.error('Error fetching campaign stats:', err);
      setError('Failed to load campaign statistics');
    }
  };

  // Fetch top clicked links
  const fetchTopLinks = async (campaignId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/tracking/top-links/${campaignId}`);
      if (response.data.success) {
        setTopLinks(response.data.topLinks);
      }
    } catch (err) {
      console.error('Error fetching top links:', err);
    }
  };

  // Initial load
  useEffect(() => {
    fetchCampaignsSummary();
  }, []);

  // Load stats when campaign selection changes
  useEffect(() => {
    if (selectedCampaign) {
      fetchCampaignStats(selectedCampaign);
      fetchTopLinks(selectedCampaign);
    }
  }, [selectedCampaign]);

  const StatCard = ({ icon: Icon, label, value, borderColor, unit = '' }) => (
    <div className={`bg-zinc-900 rounded-lg border-l-4 p-4 ${borderColor} backdrop-blur-sm`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-zinc-400 text-sm font-medium">{label}</p>
          <p className="text-2xl font-bold text-white mt-1">
            {value}
            {unit && <span className="text-lg text-zinc-400">{unit}</span>}
          </p>
        </div>
        <Icon className={`w-10 h-10 ${borderColor.replace('border', 'text')}`} />
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 overflow-y-auto overflow-x-hidden">
      <div className="ml-20 lg:ml-64 max-w-[1600px] mx-auto p-8">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-3">
            <BarChart3 className="w-10 h-10 text-lime-400" />
            <h1 className="text-4xl font-bold text-white">Campaign Analytics</h1>
          </div>
          <p className="text-zinc-400 text-lg">Track email opens, clicks, and engagement metrics</p>
        </div>

        {/* Campaign Selection */}
        <div className="bg-zinc-900 rounded-xl border border-lime-500/20 p-8 mb-10">
          <div className="flex items-center gap-3 mb-6">
            <Filter className="w-6 h-6 text-lime-400" />
            <h2 className="text-xl font-semibold text-white">Select Campaign</h2>
          </div>
          
          {campaigns.length === 0 ? (
            <div className="text-center py-12">
              <Mail className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
              <p className="text-zinc-400 text-lg">No campaigns with tracking data available</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {campaigns.map((campaign) => (
                <button
                  key={campaign.campaignId}
                  onClick={() => setSelectedCampaign(campaign.campaignId)}
                  className={`p-5 rounded-lg border-2 text-left transition-all duration-200 ${
                    selectedCampaign === campaign.campaignId
                      ? 'border-lime-500 bg-lime-500/10'
                      : 'border-zinc-700 bg-zinc-800 hover:border-lime-500/50 hover:bg-zinc-800/80'
                  }`}
                >
                  <h3 className="font-semibold text-white truncate text-lg">{campaign.campaignName}</h3>
                  <p className="text-sm text-zinc-400 mt-2">
                    {campaign.totalRecipients} recipients
                  </p>
                  <div className="flex flex-col gap-2 mt-4 text-sm">
                    <span className="flex items-center gap-2 text-lime-400 font-medium">
                      <Eye className="w-4 h-4" />
                      {campaign.totalOpens} opens
                    </span>
                    <span className="flex items-center gap-2 text-lime-300 font-medium">
                      <MousePointerClick className="w-4 h-4" />
                      {campaign.totalClicks} clicks
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Campaign Details */}
        {selectedCampaign && campaignStats && (
          <div className="space-y-10">
            {/* Statistics Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
              <StatCard
                icon={Mail}
                label="Total Sent"
                value={campaignStats.summary.totalSent}
                borderColor="border-lime-500"
              />
              <StatCard
                icon={Eye}
                label="Total Opens"
                value={campaignStats.summary.totalOpens}
                borderColor="border-lime-400"
              />
              <StatCard
                icon={MousePointerClick}
                label="Total Clicks"
                value={campaignStats.summary.totalClicks}
                borderColor="border-lime-300"
              />
              <StatCard
                icon={TrendingUp}
                label="Click Through Rate"
                value={campaignStats.summary.clickRate}
                borderColor="border-lime-500"
                unit="%"
              />
            </div>

            {/* Engagement Metrics & Top Links Row */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              {/* Engagement Metrics */}
              <div className="bg-zinc-900 rounded-xl border border-lime-500/20 p-8">
                <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-3">
                  <TrendingUp className="w-6 h-6 text-lime-400" />
                  Engagement Metrics
                </h3>
                <div className="space-y-6">
                  <div className="flex justify-between items-center pb-5 border-b border-zinc-700">
                    <span className="text-zinc-300 text-lg">Open Rate</span>
                    <span className="text-3xl font-bold text-lime-400">{campaignStats.summary.openRate}%</span>
                  </div>
                  <div className="flex justify-between items-center pb-5 border-b border-zinc-700">
                    <span className="text-zinc-300 text-lg">Unique Openers</span>
                    <span className="text-3xl font-bold text-lime-400">{campaignStats.summary.uniqueOpeners}</span>
                  </div>
                  <div className="flex justify-between items-center pb-5 border-b border-zinc-700">
                    <span className="text-zinc-300 text-lg">Unique Clickers</span>
                    <span className="text-3xl font-bold text-lime-400">{campaignStats.summary.uniqueClickers}</span>
                  </div>
                  <div className="flex justify-between items-center pb-5 border-b border-zinc-700">
                    <span className="text-zinc-300 text-lg">Avg Opens/Recipient</span>
                    <span className="text-3xl font-bold text-lime-300">{campaignStats.summary.avgOpensPerRecipient}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-300 text-lg">Avg Clicks/Recipient</span>
                    <span className="text-3xl font-bold text-lime-300">{campaignStats.summary.avgClicksPerRecipient}</span>
                  </div>
                </div>
              </div>

              {/* Top Links */}
              <div className="bg-zinc-900 rounded-xl border border-lime-500/20 p-8">
                <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-3">
                  <ExternalLink className="w-6 h-6 text-lime-400" />
                  Top Clicked Links
                </h3>
                {topLinks.length === 0 ? (
                  <p className="text-zinc-400 py-12 text-center text-lg">No link clicks yet</p>
                ) : (
                  <div className="space-y-4">
                    {topLinks.map((link, idx) => (
                      <div key={idx} className="flex items-start gap-4 p-4 bg-zinc-800 rounded-lg border border-zinc-700 hover:border-lime-500/30 transition-colors">
                        <div className="flex-1 min-w-0">
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-lime-400 hover:text-lime-300 truncate flex items-center gap-2 transition-colors text-sm"
                          >
                            <ExternalLink className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">{link.url}</span>
                          </a>
                          <p className="text-sm text-zinc-400 mt-2">{link.clicks} clicks</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Recipient Details - Full Width Table */}
            <div className="bg-zinc-900 rounded-xl border border-lime-500/20 p-8">
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-3">
                <User className="w-6 h-6 text-lime-400" />
                Recipient Engagement
              </h3>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-zinc-800 border-b-2 border-lime-500/30">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-bold text-lime-400 whitespace-nowrap">Email</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-lime-400 whitespace-nowrap">Opens</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-lime-400 whitespace-nowrap">Clicks</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-lime-400 whitespace-nowrap">First Opened</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-lime-400 whitespace-nowrap">Last Activity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-700">
                    {campaignStats.recipientTracking.map((recipient, idx) => (
                      <tr key={idx} className="hover:bg-zinc-800/50 transition-colors">
                        <td className="px-6 py-4 text-sm text-white font-medium">{recipient.email}</td>
                        <td className="px-6 py-4 text-sm">
                          <span className="inline-flex items-center gap-2 text-lime-400 font-semibold bg-lime-500/10 px-3 py-1 rounded-lg">
                            <Eye className="w-4 h-4" />
                            {recipient.opens}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className="inline-flex items-center gap-2 text-lime-300 font-semibold bg-lime-500/10 px-3 py-1 rounded-lg">
                            <MousePointerClick className="w-4 h-4" />
                            {recipient.clicks}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-zinc-400">
                          {recipient.firstOpened 
                            ? new Date(recipient.firstOpened).toLocaleDateString()
                            : '-'
                          }
                        </td>
                        <td className="px-6 py-4 text-sm text-zinc-400">
                          {recipient.lastOpened
                            ? new Date(recipient.lastOpened).toLocaleDateString()
                            : 'Not opened'
                          }
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {campaignStats.recipientTracking.length === 0 && (
                <div className="text-center py-12">
                  <User className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
                  <p className="text-zinc-400 text-lg">No recipient tracking data available</p>
                </div>
              )}
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 text-red-400 text-lg">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
