import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { getThemeClasses } from '../utils/themeUtils';

const AutomatedReminders = ({ onClose }) => {
  const { isDark } = useTheme();
  const theme = getThemeClasses(isDark);
  const [activeTab, setActiveTab] = useState('active');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newReminder, setNewReminder] = useState({
    title: '',
    type: 'deadline',
    frequency: 'once',
    date: '',
    recipients: '',
    message: ''
  });

  const reminders = [
    { id: 1, title: 'GRI Report Submission', type: 'deadline', date: '2025-01-15', frequency: 'once', recipients: 'esg-team@company.com', status: 'active', daysUntil: 10 },
    { id: 2, title: 'Monthly Carbon Data Collection', type: 'data_collection', date: '2025-01-31', frequency: 'monthly', recipients: 'site-managers@company.com', status: 'active', daysUntil: 26 },
    { id: 3, title: 'Quarterly Board ESG Review', type: 'meeting', date: '2025-02-15', frequency: 'quarterly', recipients: 'board@company.com', status: 'active', daysUntil: 41 },
    { id: 4, title: 'Annual Sustainability Audit', type: 'audit', date: '2025-03-20', frequency: 'yearly', recipients: 'audit-team@company.com', status: 'active', daysUntil: 74 },
    { id: 5, title: 'Weekly ESG Metrics Update', type: 'task', date: '2025-01-12', frequency: 'weekly', recipients: 'data-entry@company.com', status: 'active', daysUntil: 7 }
  ];

  const getTypeIcon = (type) => {
    const icons = {
      deadline: '⏰',
      data_collection: '📊',
      meeting: '📅',
      audit: '🔍',
      task: '✅',
      review: '👁️'
    };
    return icons[type] || '🔔';
  };

  const getTypeColor = (type) => {
    const colors = {
      deadline: 'bg-red-100 text-red-800',
      data_collection: 'bg-blue-100 text-blue-800',
      meeting: 'bg-green-100 text-green-800',
      audit: 'bg-purple-100 text-purple-800',
      task: 'bg-yellow-100 text-yellow-800',
      review: 'bg-indigo-100 text-indigo-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const getUrgencyColor = (days) => {
    if (days <= 7) return 'text-red-600 font-bold';
    if (days <= 14) return 'text-orange-600 font-semibold';
    return 'text-green-600';
  };

  const handleCreateReminder = () => {
    console.log('Creating reminder:', newReminder);
    alert('Reminder created successfully!');
    setShowCreateForm(false);
    setNewReminder({ title: '', type: 'deadline', frequency: 'once', date: '', recipients: '', message: '' });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`max-w-6xl w-full max-h-[90vh] overflow-hidden ${theme.bg.card} rounded-xl shadow-2xl`}>
        <div className="p-6 bg-white shadow-lg border-b-2 border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold flex items-center gap-3 text-gray-800">
                <span className="text-4xl">🔔</span>
                Automated Reminders
              </h2>
              <p className="text-gray-600 mt-1">Manage ESG compliance and task reminders</p>
            </div>
            <button onClick={onClose} className="text-3xl text-gray-600 hover:text-red-500 hover:rotate-90 transition-all duration-300 hover:bg-gray-100 w-10 h-10 rounded-full flex items-center justify-center">✕</button>
          </div>
        </div>

        <div className="flex h-[calc(90vh-140px)]">
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab('active')}
                  className={`px-4 py-2 rounded-lg font-semibold ${activeTab === 'active' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                >
                  Active ({reminders.filter(r => r.status === 'active').length})
                </button>
                <button
                  onClick={() => setActiveTab('completed')}
                  className={`px-4 py-2 rounded-lg font-semibold ${activeTab === 'completed' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                >
                  Completed (0)
                </button>
              </div>
              <button
                onClick={() => setShowCreateForm(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700"
              >
                + Create Reminder
              </button>
            </div>

            {showCreateForm && (
              <div className={`mb-6 p-6 rounded-lg border-2 border-blue-500 ${theme.bg.subtle}`}>
                <h3 className={`text-lg font-bold ${theme.text.primary} mb-4`}>Create New Reminder</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium ${theme.text.secondary} mb-2`}>Title</label>
                    <input
                      type="text"
                      value={newReminder.title}
                      onChange={(e) => setNewReminder({...newReminder, title: e.target.value})}
                      className={`w-full px-3 py-2 rounded border ${theme.bg.input} ${theme.border.input} ${theme.text.primary}`}
                      placeholder="e.g., Monthly ESG Report"
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${theme.text.secondary} mb-2`}>Type</label>
                    <select
                      value={newReminder.type}
                      onChange={(e) => setNewReminder({...newReminder, type: e.target.value})}
                      className={`w-full px-3 py-2 rounded border ${theme.bg.input} ${theme.border.input} ${theme.text.primary}`}
                    >
                      <option value="deadline">Deadline</option>
                      <option value="data_collection">Data Collection</option>
                      <option value="meeting">Meeting</option>
                      <option value="audit">Audit</option>
                      <option value="task">Task</option>
                      <option value="review">Review</option>
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${theme.text.secondary} mb-2`}>Date</label>
                    <input
                      type="date"
                      value={newReminder.date}
                      onChange={(e) => setNewReminder({...newReminder, date: e.target.value})}
                      className={`w-full px-3 py-2 rounded border ${theme.bg.input} ${theme.border.input} ${theme.text.primary}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${theme.text.secondary} mb-2`}>Frequency</label>
                    <select
                      value={newReminder.frequency}
                      onChange={(e) => setNewReminder({...newReminder, frequency: e.target.value})}
                      className={`w-full px-3 py-2 rounded border ${theme.bg.input} ${theme.border.input} ${theme.text.primary}`}
                    >
                      <option value="once">Once</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className={`block text-sm font-medium ${theme.text.secondary} mb-2`}>Recipients (comma-separated emails)</label>
                    <input
                      type="text"
                      value={newReminder.recipients}
                      onChange={(e) => setNewReminder({...newReminder, recipients: e.target.value})}
                      className={`w-full px-3 py-2 rounded border ${theme.bg.input} ${theme.border.input} ${theme.text.primary}`}
                      placeholder="email1@company.com, email2@company.com"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className={`block text-sm font-medium ${theme.text.secondary} mb-2`}>Message</label>
                    <textarea
                      value={newReminder.message}
                      onChange={(e) => setNewReminder({...newReminder, message: e.target.value})}
                      className={`w-full px-3 py-2 rounded border ${theme.bg.input} ${theme.border.input} ${theme.text.primary}`}
                      rows="3"
                      placeholder="Custom reminder message..."
                    />
                  </div>
                </div>
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={handleCreateReminder}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Create Reminder
                  </button>
                  <button
                    onClick={() => setShowCreateForm(false)}
                    className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {reminders.map(reminder => (
                <div key={reminder.id} className={`p-4 rounded-lg border ${theme.border.primary} ${theme.bg.subtle}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="text-3xl">{getTypeIcon(reminder.type)}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className={`font-semibold ${theme.text.primary}`}>{reminder.title}</h4>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(reminder.type)}`}>
                            {reminder.type.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className={`${theme.text.secondary}`}>Date:</span>
                            <p className={theme.text.primary}>{new Date(reminder.date).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <span className={`${theme.text.secondary}`}>Frequency:</span>
                            <p className={theme.text.primary}>{reminder.frequency}</p>
                          </div>
                          <div>
                            <span className={`${theme.text.secondary}`}>Recipients:</span>
                            <p className={`${theme.text.primary} truncate`}>{reminder.recipients}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${getUrgencyColor(reminder.daysUntil)}`}>
                        {reminder.daysUntil}
                      </div>
                      <div className={`text-xs ${theme.text.secondary}`}>days until</div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
                      Edit
                    </button>
                    <button className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700">
                      Send Now
                    </button>
                    <button className="px-3 py-1 bg-gray-300 rounded text-sm hover:bg-gray-400">
                      Pause
                    </button>
                    <button className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700">
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={`w-80 border-l ${theme.border.primary} p-6`}>
            <h3 className={`text-lg font-bold ${theme.text.primary} mb-4`}>Reminder Settings</h3>
            
            <div className={`p-4 rounded-lg ${theme.bg.subtle} border ${theme.border.primary} mb-4`}>
              <h4 className={`font-semibold ${theme.text.primary} mb-3`}>Notification Channels</h4>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span className={theme.text.primary}>Email</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span className={theme.text.primary}>In-App</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" />
                  <span className={theme.text.primary}>SMS</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" />
                  <span className={theme.text.primary}>Slack</span>
                </label>
              </div>
            </div>

            <div className={`p-4 rounded-lg ${theme.bg.subtle} border ${theme.border.primary} mb-4`}>
              <h4 className={`font-semibold ${theme.text.primary} mb-3`}>Advance Notice</h4>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span className={theme.text.primary}>7 days before</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span className={theme.text.primary}>3 days before</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span className={theme.text.primary}>1 day before</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" />
                  <span className={theme.text.primary}>On the day</span>
                </label>
              </div>
            </div>

            <div className={`p-4 rounded-lg ${isDark ? 'bg-blue-900/20' : 'bg-blue-50'} border border-blue-500`}>
              <h4 className={`font-semibold ${theme.text.primary} mb-2`}>📊 Statistics</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className={theme.text.secondary}>Active Reminders:</span>
                  <span className={`font-bold ${theme.text.primary}`}>5</span>
                </div>
                <div className="flex justify-between">
                  <span className={theme.text.secondary}>Sent This Month:</span>
                  <span className={`font-bold ${theme.text.primary}`}>23</span>
                </div>
                <div className="flex justify-between">
                  <span className={theme.text.secondary}>Upcoming (7 days):</span>
                  <span className={`font-bold text-orange-600`}>2</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AutomatedReminders;
