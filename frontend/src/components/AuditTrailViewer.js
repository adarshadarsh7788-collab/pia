import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { getThemeClasses } from '../utils/themeUtils';
import AuditSystem, { AUDIT_ACTIONS } from '../utils/auditSystem';

const AuditTrailViewer = ({ dataId = null, onClose }) => {
  const { isDark } = useTheme();
  const theme = getThemeClasses(isDark);
  const [auditTrail, setAuditTrail] = useState([]);
  const [filters, setFilters] = useState({ action: '', user: '', startDate: '', endDate: '' });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadAuditTrail();
  }, [dataId, filters]);

  const loadAuditTrail = () => {
    const filterObj = { ...filters };
    if (dataId) filterObj.dataId = dataId;
    const trail = AuditSystem.getAuditTrail(filterObj);
    setAuditTrail(trail);
  };

  const filteredTrail = auditTrail.filter(entry =>
    searchTerm === '' ||
    entry.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    JSON.stringify(entry.details).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getActionIcon = (action) => {
    const icons = {
      [AUDIT_ACTIONS.CREATE]: '➕',
      [AUDIT_ACTIONS.UPDATE]: '✏️',
      [AUDIT_ACTIONS.DELETE]: '🗑️',
      [AUDIT_ACTIONS.UPLOAD]: '📤',
      [AUDIT_ACTIONS.APPROVE]: '✅',
      [AUDIT_ACTIONS.REJECT]: '❌',
      [AUDIT_ACTIONS.SUBMIT]: '📨',
      [AUDIT_ACTIONS.REVIEW]: '👁️'
    };
    return icons[action] || '📝';
  };

  const getActionColor = (action) => {
    const colors = {
      [AUDIT_ACTIONS.CREATE]: 'bg-green-100 text-green-800',
      [AUDIT_ACTIONS.UPDATE]: 'bg-blue-100 text-blue-800',
      [AUDIT_ACTIONS.DELETE]: 'bg-red-100 text-red-800',
      [AUDIT_ACTIONS.UPLOAD]: 'bg-purple-100 text-purple-800',
      [AUDIT_ACTIONS.APPROVE]: 'bg-green-100 text-green-800',
      [AUDIT_ACTIONS.REJECT]: 'bg-red-100 text-red-800',
      [AUDIT_ACTIONS.SUBMIT]: 'bg-yellow-100 text-yellow-800',
      [AUDIT_ACTIONS.REVIEW]: 'bg-blue-100 text-blue-800'
    };
    return colors[action] || 'bg-gray-100 text-gray-800';
  };

  const exportTrail = (format) => {
    const data = AuditSystem.exportAuditTrail(format);
    const blob = new Blob([data], { type: format === 'csv' ? 'text/csv' : 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-trail-${new Date().toISOString().split('T')[0]}.${format}`;
    a.click();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`max-w-6xl w-full max-h-[90vh] overflow-hidden ${theme.bg.card} rounded-xl shadow-2xl`}>
        {/* Header */}
        <div className="p-6 bg-white shadow-lg border-b-2 border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold flex items-center gap-3 text-gray-800">
                <span className="text-4xl">📋</span>
                Audit Trail
              </h2>
              <p className="text-gray-600 mt-1">Complete record of all system activities</p>
            </div>
            <button onClick={onClose} className="text-3xl text-gray-600 hover:text-red-500 hover:rotate-90 transition-all duration-300 hover:bg-gray-100 w-10 h-10 rounded-full flex items-center justify-center">✕</button>
          </div>
        </div>

        {/* Filters */}
        <div className={`p-4 border-b ${theme.border.primary} ${theme.bg.subtle}`}>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            <input
              type="text"
              placeholder="🔍 Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`px-3 py-2 rounded border ${theme.bg.input} ${theme.border.input} ${theme.text.primary}`}
            />
            <select
              value={filters.action}
              onChange={(e) => setFilters({ ...filters, action: e.target.value })}
              className={`px-3 py-2 rounded border ${theme.bg.input} ${theme.border.input} ${theme.text.primary}`}
            >
              <option value="">All Actions</option>
              {Object.values(AUDIT_ACTIONS).map(action => (
                <option key={action} value={action}>{action.toUpperCase()}</option>
              ))}
            </select>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              className={`px-3 py-2 rounded border ${theme.bg.input} ${theme.border.input} ${theme.text.primary}`}
            />
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              className={`px-3 py-2 rounded border ${theme.bg.input} ${theme.border.input} ${theme.text.primary}`}
            />
            <div className="flex gap-2">
              <button
                onClick={() => exportTrail('json')}
                className="flex-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
              >
                📥 JSON
              </button>
              <button
                onClick={() => exportTrail('csv')}
                className="flex-1 px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
              >
                📊 CSV
              </button>
            </div>
          </div>
        </div>

        {/* Audit Trail List */}
        <div className="overflow-y-auto max-h-[60vh] p-4">
          {filteredTrail.length === 0 ? (
            <div className="text-center py-12">
              <p className={`text-lg ${theme.text.secondary}`}>No audit entries found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTrail.map((entry) => (
                <div key={entry.id} className={`p-4 rounded-lg border ${theme.border.primary} ${theme.bg.subtle}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <span className="text-2xl">{getActionIcon(entry.action)}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getActionColor(entry.action)}`}>
                            {entry.action.toUpperCase()}
                          </span>
                          <span className={`text-sm font-medium ${theme.text.primary}`}>{entry.user}</span>
                          <span className={`text-xs ${theme.text.muted}`}>({entry.userRole})</span>
                        </div>
                        <div className={`text-sm ${theme.text.secondary} mb-2`}>
                          {new Date(entry.timestamp).toLocaleString()}
                        </div>
                        <div className={`text-sm ${theme.text.primary}`}>
                          <details>
                            <summary className="cursor-pointer hover:underline">View Details</summary>
                            <pre className={`mt-2 p-2 rounded text-xs overflow-x-auto ${theme.bg.card}`}>
                              {JSON.stringify(entry.details, null, 2)}
                            </pre>
                          </details>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`p-4 border-t ${theme.border.primary} flex justify-between items-center`}>
          <span className={`text-sm ${theme.text.secondary}`}>
            Total Entries: {filteredTrail.length}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuditTrailViewer;
