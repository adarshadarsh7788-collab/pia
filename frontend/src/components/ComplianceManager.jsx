import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { getThemeClasses } from '../utils/themeUtils';

const ComplianceManager = ({ onClose }) => {
  const { isDark } = useTheme();
  const theme = getThemeClasses(isDark);
  const [activeTab, setActiveTab] = useState('calendar');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newReminder, setNewReminder] = useState({
    title: '',
    type: 'deadline',
    frequency: 'once',
    date: '',
    recipients: '',
    message: ''
  });

  const complianceData = [
    { id: 1, title: 'GRI Report Submission', date: '2025-01-15', type: 'deadline', framework: 'GRI', status: 'upcoming', recipients: 'esg-team@company.com', frequency: 'yearly', daysUntil: 10 },
    { id: 2, title: 'Monthly Carbon Data Collection', date: '2025-01-31', type: 'data_collection', framework: 'GHG', status: 'active', recipients: 'site-managers@company.com', frequency: 'monthly', daysUntil: 26 },
    { id: 3, title: 'Board ESG Review Meeting', date: '2025-02-15', type: 'meeting', framework: 'Internal', status: 'scheduled', recipients: 'board@company.com', frequency: 'quarterly', daysUntil: 41 },
    { id: 4, title: 'TCFD Report Due', date: '2025-03-01', type: 'deadline', framework: 'TCFD', status: 'upcoming', recipients: 'compliance@company.com', frequency: 'yearly', daysUntil: 55 },
    { id: 5, title: 'Sustainability Audit', date: '2025-03-20', type: 'audit', framework: 'ISO 14001', status: 'scheduled', recipients: 'audit-team@company.com', frequency: 'yearly', daysUntil: 74 }
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

  const getEventColor = (type) => {
    const colors = {
      deadline: 'bg-red-500',
      data_collection: 'bg-blue-500',
      meeting: 'bg-green-500',
      audit: 'bg-purple-500',
      task: 'bg-yellow-500',
      review: 'bg-indigo-500'
    };
    return colors[type] || 'bg-gray-500';
  };

  const getStatusBadge = (status) => {
    const badges = {
      upcoming: 'bg-orange-100 text-orange-800',
      active: 'bg-green-100 text-green-800',
      scheduled: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      overdue: 'bg-red-100 text-red-800'
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  const getUrgencyColor = (days) => {
    if (days <= 7) return 'text-red-600 font-bold';
    if (days <= 14) return 'text-orange-600 font-semibold';
    return 'text-green-600';
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const getEventsForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return complianceData.filter(event => event.date === dateStr);
  };

  const renderCalendar = () => {
    const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentDate);
    const days = [];
    const today = new Date();

    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="h-20 border border-gray-200"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const events = getEventsForDate(date);
      const isToday = date.toDateString() === today.toDateString();

      days.push(
        <div
          key={day}
          className={`h-20 border p-1 cursor-pointer transition-all duration-300 ${
            isToday ? 'bg-blue-50 border-blue-400' : 'border-gray-200 hover:bg-gray-50'
          }`}
          onClick={() => events.length > 0 && setSelectedEvent(events[0])}
        >
          <div className={`text-xs font-bold mb-1 ${
            isToday ? 'text-blue-600 bg-blue-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs' : theme.text.primary
          }`}>
            {day}
          </div>
          <div className="space-y-0.5">
            {events.slice(0, 1).map(event => (
              <div
                key={event.id}
                className={`text-xs px-1 py-0.5 rounded text-white truncate ${getEventColor(event.type)}`}
                title={event.title}
              >
                {event.title.substring(0, 12)}...
              </div>
            ))}
            {events.length > 1 && (
              <div className="text-xs text-gray-600">+{events.length - 1}</div>
            )}
          </div>
        </div>
      );
    }
    return days;
  };

  const changeMonth = (delta) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + delta, 1));
  };

  const handleCreateReminder = () => {
    console.log('Creating reminder:', newReminder);
    alert('Reminder created successfully!');
    setShowCreateForm(false);
    setNewReminder({ title: '', type: 'deadline', frequency: 'once', date: '', recipients: '', message: '' });
  };

  const upcomingEvents = complianceData
    .filter(e => new Date(e.date) >= new Date())
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 4);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`max-w-7xl w-full max-h-[90vh] overflow-hidden ${theme.bg.card} rounded-xl shadow-2xl`}>
        <div className="p-6 bg-white shadow-lg border-b-2 border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold flex items-center gap-3 text-gray-800">
                <span className="text-4xl">📅</span>
                Compliance Manager
              </h2>
              <p className="text-gray-600 mt-1">Manage ESG compliance calendar and automated reminders</p>
            </div>
            <button onClick={onClose} className="text-3xl text-gray-600 hover:text-red-500 hover:rotate-90 transition-all duration-300 hover:bg-gray-100 w-10 h-10 rounded-full flex items-center justify-center">✕</button>
          </div>
        </div>

        <div className="flex h-[calc(90vh-140px)]">
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab('calendar')}
                  className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 ${
                    activeTab === 'calendar' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  📅 Calendar View
                </button>
                <button
                  onClick={() => setActiveTab('reminders')}
                  className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 ${
                    activeTab === 'reminders' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  🔔 Reminders ({complianceData.filter(r => r.status === 'active').length})
                </button>
              </div>
              <button
                onClick={() => setShowCreateForm(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 flex items-center gap-2"
              >
                + Create New
              </button>
            </div>

            {showCreateForm && (
              <div className={`mb-6 p-6 rounded-lg border-2 border-blue-500 ${theme.bg.subtle}`}>
                <h3 className={`text-lg font-bold ${theme.text.primary} mb-4`}>Create New Compliance Item</h3>
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
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className={`block text-sm font-medium ${theme.text.secondary} mb-2`}>Recipients</label>
                    <input
                      type="text"
                      value={newReminder.recipients}
                      onChange={(e) => setNewReminder({...newReminder, recipients: e.target.value})}
                      className={`w-full px-3 py-2 rounded border ${theme.bg.input} ${theme.border.input} ${theme.text.primary}`}
                      placeholder="email1@company.com, email2@company.com"
                    />
                  </div>
                </div>
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={handleCreateReminder}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Create
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

            {activeTab === 'calendar' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <button onClick={() => changeMonth(-1)} className="w-8 h-8 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center">←</button>
                    <h3 className={`text-xl font-bold ${theme.text.primary}`}>
                      {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </h3>
                    <button onClick={() => changeMonth(1)} className="w-8 h-8 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center">→</button>
                  </div>
                  <button
                    onClick={() => setCurrentDate(new Date())}
                    className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                  >
                    Today
                  </button>
                </div>

                <div className="grid grid-cols-7 gap-0 border border-gray-200 rounded-lg overflow-hidden">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="p-2 text-center font-bold bg-gray-100 text-gray-700 text-sm">
                      {day}
                    </div>
                  ))}
                  {renderCalendar()}
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {[
                    { color: 'bg-red-500', label: 'Deadline' },
                    { color: 'bg-blue-500', label: 'Data Collection' },
                    { color: 'bg-green-500', label: 'Meeting' },
                    { color: 'bg-purple-500', label: 'Audit' }
                  ].map(item => (
                    <div key={item.label} className="flex items-center gap-2 px-2 py-1 bg-gray-50 rounded text-sm">
                      <div className={`w-3 h-3 ${item.color} rounded-full`}></div>
                      <span>{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'reminders' && (
              <div className="space-y-3">
                {complianceData.map(item => (
                  <div key={item.id} className={`p-4 rounded-lg border ${theme.border.primary} ${theme.bg.subtle}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="text-2xl">{getTypeIcon(item.type)}</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className={`font-semibold ${theme.text.primary}`}>{item.title}</h4>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadge(item.status)}`}>
                              {item.status}
                            </span>
                          </div>
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className={theme.text.secondary}>Date:</span>
                              <p className={theme.text.primary}>{new Date(item.date).toLocaleDateString()}</p>
                            </div>
                            <div>
                              <span className={theme.text.secondary}>Framework:</span>
                              <p className={theme.text.primary}>{item.framework}</p>
                            </div>
                            <div>
                              <span className={theme.text.secondary}>Frequency:</span>
                              <p className={theme.text.primary}>{item.frequency}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-xl font-bold ${getUrgencyColor(item.daysUntil)}`}>
                          {item.daysUntil}
                        </div>
                        <div className={`text-xs ${theme.text.secondary}`}>days</div>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">Edit</button>
                      <button className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700">Send Now</button>
                      <button className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className={`w-72 border-l ${theme.border.primary} p-6 overflow-y-auto`}>
            <h3 className={`text-lg font-bold ${theme.text.primary} mb-4 flex items-center gap-2`}>
              🔔 Upcoming Events
            </h3>
            <div className="space-y-3 mb-6">
              {upcomingEvents.map(event => (
                <div
                  key={event.id}
                  className={`p-3 rounded-lg border ${theme.border.primary} cursor-pointer hover:shadow-md transition-all ${theme.bg.subtle}`}
                  onClick={() => setSelectedEvent(event)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className={`w-3 h-3 rounded-full ${getEventColor(event.type)}`}></div>
                    <span className={`text-xs px-2 py-1 rounded ${getStatusBadge(event.status)}`}>
                      {event.status}
                    </span>
                  </div>
                  <h4 className={`font-semibold ${theme.text.primary} text-sm mb-1`}>{event.title}</h4>
                  <p className={`text-xs ${theme.text.secondary}`}>
                    {new Date(event.date).toLocaleDateString()}
                  </p>
                  <p className={`text-xs ${theme.text.muted}`}>{event.framework}</p>
                </div>
              ))}
            </div>

            {selectedEvent && (
              <div className={`p-4 rounded-lg bg-blue-50 border border-blue-200`}>
                <h4 className={`font-bold ${theme.text.primary} mb-3 flex items-center gap-2`}>
                  📌 Event Details
                </h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-semibold">Title:</span>
                    <p>{selectedEvent.title}</p>
                  </div>
                  <div>
                    <span className="font-semibold">Date:</span>
                    <p>{new Date(selectedEvent.date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <span className="font-semibold">Framework:</span>
                    <p>{selectedEvent.framework}</p>
                  </div>
                  <div>
                    <span className="font-semibold">Recipients:</span>
                    <p className="text-xs">{selectedEvent.recipients}</p>
                  </div>
                </div>
                <button className="w-full mt-3 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">
                  ✓ Mark Complete
                </button>
              </div>
            )}

            <div className={`mt-6 p-4 rounded-lg ${isDark ? 'bg-blue-900/20' : 'bg-blue-50'} border border-blue-500`}>
              <h4 className={`font-semibold ${theme.text.primary} mb-2`}>📊 Statistics</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className={theme.text.secondary}>Active Items:</span>
                  <span className={`font-bold ${theme.text.primary}`}>{complianceData.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className={theme.text.secondary}>Due This Month:</span>
                  <span className={`font-bold text-orange-600`}>3</span>
                </div>
                <div className="flex justify-between">
                  <span className={theme.text.secondary}>Overdue:</span>
                  <span className={`font-bold text-red-600`}>0</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplianceManager;