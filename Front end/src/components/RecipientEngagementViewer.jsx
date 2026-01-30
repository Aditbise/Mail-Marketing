import React, { useState } from 'react';
import axios from 'axios';
import { X, Mail, User, Eye, Link as LinkIcon } from 'lucide-react';

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
    if (recipient.clicked) return { level: 'Very Interested', color: 'text-green-500', bgColor: 'bg-green-500/10', borderColor: 'border-green-500' };
    if (recipient.opened) return { level: 'Engaged', color: 'text-amber-500', bgColor: 'bg-amber-500/10', borderColor: 'border-amber-500' };
    return { level: 'Not Interested', color: 'text-red-500', bgColor: 'bg-red-500/10', borderColor: 'border-red-500' };
  };

  const getFilteredRecipients = () => {
    if (filter === 'interested') return recipients.filter(r => r.clicked);
    if (filter === 'engaged') return recipients.filter(r => r.opened && !r.clicked);
    if (filter === 'notInterested') return recipients.filter(r => !r.opened);
    return recipients;
  };

  if (loading) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-400">Loading recipient data...</p>
      </div>
    );
  }

  const filtered = getFilteredRecipients();

  return (
    <div className="bg-gray-900 rounded-lg p-6 text-white">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
            <Mail className="w-6 h-6 text-indigo-400" />
            {templateName}
          </h2>
          <p className="text-gray-400 text-sm">Recipient Engagement Tracking</p>
        </div>
        <button 
          onClick={onClose}
          className="p-2 hover:bg-gray-800 rounded-lg transition-colors text-gray-400 hover:text-white"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Stats Summary */}
      {stats && (
        <div className="grid grid-cols-4 gap-3 mb-6">
          <div className="bg-gray-800 p-4 rounded-lg border-l-4 border-blue-500">
            <p className="text-gray-400 text-xs font-medium mb-1">Total Recipients</p>
            <p className="text-2xl font-bold text-blue-400">{stats.total}</p>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg border-l-4 border-green-500">
            <p className="text-gray-400 text-xs font-medium mb-1">Interested (Clicked)</p>
            <p className="text-2xl font-bold text-green-400">{stats.interested}</p>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg border-l-4 border-amber-500">
            <p className="text-gray-400 text-xs font-medium mb-1">Engaged (Opened)</p>
            <p className="text-2xl font-bold text-amber-400">{stats.engaged}</p>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg border-l-4 border-red-500">
            <p className="text-gray-400 text-xs font-medium mb-1">Not Interested</p>
            <p className="text-2xl font-bold text-red-400">{stats.notInterested}</p>
          </div>
        </div>
      )}

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-3 mb-6">
        {[
          { label: 'All Recipients', value: 'all' },
          { label: 'Very Interested', value: 'interested' },
          { label: 'Engaged', value: 'engaged' },
          { label: 'Not Interested', value: 'notInterested' }
        ].map(btn => (
          <button
            key={btn.value}
            onClick={() => setFilter(btn.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === btn.value
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Recipients List */}
      <div className="overflow-y-auto max-h-96 space-y-3 mb-6">
        {filtered.length === 0 ? (
          <p className="text-center text-gray-400 py-8">No recipients in this category</p>
        ) : (
          filtered.map((recipient, idx) => {
            const interest = getInterestLevel(recipient);
            return (
              <div
                key={idx}
                className={`bg-gray-800 p-4 rounded-lg border-l-4 ${interest.borderColor} flex justify-between items-start`}
              >
                <div className="flex-1">
                  <p className="font-medium text-white mb-2 flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    {recipient.email}
                  </p>
                  <div className="flex gap-3 flex-wrap text-sm text-gray-400">
                    {recipient.opened && (
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" /> Opened
                      </span>
                    )}
                    {recipient.clicked && (
                      <span className="flex items-center gap-1">
                        <LinkIcon className="w-3 h-3" /> 
                        Clicked ({recipient.events?.filter(e => e.eventType === 'click').length || 0})
                      </span>
                    )}
                    {!recipient.opened && (
                      <span className="text-red-400">Never opened</span>
                    )}
                  </div>
                </div>
                <div className="text-right ml-4">
                  <p className={`font-bold text-sm mb-2 ${interest.color}`}>
                    {interest.level}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(recipient.lastActivity).toLocaleDateString()}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Legend */}
      <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
        <p className="font-bold text-white mb-3 flex items-center gap-2">
          <Mail className="w-4 h-4" />
          How Interest is Measured
        </p>
        <div className="space-y-2 text-sm">
          <p>
            <span className="text-green-400 font-medium">Very Interested</span>
            <span className="text-gray-400">: Opened email AND clicked a link</span>
          </p>
          <p>
            <span className="text-amber-400 font-medium">Engaged</span>
            <span className="text-gray-400">: Opened email but did not click</span>
          </p>
          <p>
            <span className="text-red-400 font-medium">Not Interested</span>
            <span className="text-gray-400">: Never opened email</span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default RecipientEngagementViewer;
