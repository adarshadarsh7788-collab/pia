import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { getThemeClasses } from '../utils/themeUtils';

const ComplianceCalendar = ({ onClose }) => {
  const { isDark } = useTheme();
  const theme = getThemeClasses(isDark);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState('month');
  const [selectedEvent, setSelectedEvent] = useState(null);

  const complianceEvents = [
    { id: 1, title: 'GRI Report Submission', date: '2025-01-15', type: 'deadline', framework: 'GRI', status: 'upcoming' },
    { id: 2, title: 'BRSR Annual Filing', date: '2025-01-30', type: 'deadline', framework: 'BRSR', status: 'upcoming' },
    { id: 3, title: 'Carbon Emissions Data Collection', date: '2025-02-10', type: 'task', framework: 'GHG', status: 'pending' },
    { id: 4, title: 'Board ESG Review Meeting', date: '2025-02-15', type: 'meeting', framework: 'Internal', status: 'scheduled' },
    { id: 5, title: 'TCFD Report Due', date: '2025-03-01', type: 'deadline', framework: 'TCFD', status: 'upcoming' },
    { id: 6, title: 'Sustainability Audit', date: '2025-03-20', type: 'audit', framework: 'ISO 14001', status: 'scheduled' },
    { id: 7, title: 'Quarterly ESG Data Review', date: '2025-03-31', type: 'review', framework: 'Internal', status: 'recurring' },
    { id: 8, title: 'SASB Disclosure Deadline', date: '2025-04-15', type: 'deadline', framework: 'SASB', status: 'upcoming' },
  ];

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
    return complianceEvents.filter(event => event.date === dateStr);
  };

  const getEventColor = (type) => {
    const colors = {
      deadline: 'bg-red-500',
      task: 'bg-blue-500',
      meeting: 'bg-green-500',
      audit: 'bg-purple-500',
      review: 'bg-yellow-500'
    };
    return colors[type] || 'bg-gray-500';
  };

  const getStatusBadge = (status) => {
    const badges = {
      upcoming: 'bg-orange-100 text-orange-800',
      pending: 'bg-yellow-100 text-yellow-800',
      scheduled: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      overdue: 'bg-red-100 text-red-800',
      recurring: 'bg-purple-100 text-purple-800'
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  const renderCalendar = () => {
    const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentDate);
    const days = [];
    const today = new Date();

    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 border border-gray-200"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const events = getEventsForDate(date);
      const isToday = date.toDateString() === today.toDateString();

      days.push(
        <div
          key={day}
          className={`h-24 border p-2 cursor-pointer transition-all duration-300 ${
            isToday ? 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-400 shadow-md' : 'border-gray-200 hover:bg-gradient-to-br hover:from-gray-50 hover:to-gray-100 hover:shadow-md'
          }`}
          onClick={() => events.length > 0 && setSelectedEvent(events[0])}
        >
          <div className={`text-sm font-bold mb-1 ${
            isToday ? 'text-blue-600 bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center' : theme.text.primary
          }`}>
            {day}
          </div>
          <div className="space-y-1">
            {events.slice(0, 2).map(event => (
              <div
                key={event.id}
                className={`text-xs px-1.5 py-0.5 rounded-md text-white truncate shadow-sm hover:shadow-md transition-shadow ${getEventColor(event.type)}`}
                title={event.title}
              >
                {event.title}
              </div>
            ))}
            {events.length > 2 && (
              <div className="text-xs text-gray-600 font-semibold">+{events.length - 2} more</div>
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

  const upcomingEvents = complianceEvents
    .filter(e => new Date(e.date) >= new Date())
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 5);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className={`max-w-7xl w-full max-h-[90vh] overflow-hidden ${theme.bg.card} rounded-2xl shadow-2xl border ${theme.border.primary} animate-slideUp`}>
        <div className="p-6 bg-white shadow-lg border-b-2 border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold flex items-center gap-3 text-gray-800">
                <span className="text-4xl">📅</span>
                Compliance Calendar
              </h2>
              <p className="text-gray-600 mt-1">Track deadlines, audits, and ESG reporting requirements</p>
            </div>
            <button onClick={onClose} className="text-3xl text-gray-600 hover:text-red-500 hover:rotate-90 transition-all duration-300 hover:bg-gray-100 w-10 h-10 rounded-full flex items-center justify-center">✕</button>
          </div>
        </div>

        <div className="flex h-[calc(90vh-140px)]">
          {/* Calendar View */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <button onClick={() => changeMonth(-1)} className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center font-bold text-lg">
                  ←
                </button>
                <h3 className={`text-2xl font-bold ${theme.text.primary} min-w-[200px] text-center`}>
                  {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h3>
                <button onClick={() => changeMonth(1)} className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center font-bold text-lg">
                  →
                </button>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 rounded-xl blur opacity-30 group-hover:opacity-60 transition-opacity duration-300"></div>
                  <div className="relative bg-white rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300">
                    <input
                      type="date"
                      value={currentDate.toISOString().split('T')[0]}
                      onChange={(e) => setCurrentDate(new Date(e.target.value))}
                      className="px-5 py-3 pr-12 rounded-xl border-2 border-transparent bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 cursor-pointer font-semibold text-gray-700"
                      style={{ colorScheme: 'light' }}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      <span className="text-2xl animate-bounce">📅</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setCurrentDate(new Date())}
                  className="relative px-6 py-3 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 text-white rounded-xl hover:from-green-600 hover:via-emerald-600 hover:to-teal-600 shadow-lg hover:shadow-xl transition-all duration-300 font-bold group overflow-hidden"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <span className="text-lg">🎯</span>
                    Today
                  </span>
                  <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-0 border-2 border-gray-200 rounded-xl overflow-hidden shadow-lg">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="p-3 text-center font-bold border-b-2 bg-gradient-to-b from-gray-50 to-gray-100 text-gray-700">
                  {day}
                </div>
              ))}
              {renderCalendar()}
            </div>

            {/* Legend */}
            <div className="mt-6 flex flex-wrap gap-3">
              {[
                { color: 'bg-red-500', label: 'Deadline', icon: '⏰' },
                { color: 'bg-blue-500', label: 'Task', icon: '✓' },
                { color: 'bg-green-500', label: 'Meeting', icon: '👥' },
                { color: 'bg-purple-500', label: 'Audit', icon: '🔍' },
                { color: 'bg-yellow-500', label: 'Review', icon: '📋' }
              ].map(item => (
                <div key={item.label} className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <div className={`w-3 h-3 ${item.color} rounded-full shadow-sm`}></div>
                  <span className="text-sm font-medium">{item.icon} {item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className={`w-80 border-l-2 ${theme.border.primary} p-6 overflow-y-auto bg-gradient-to-b from-gray-50 to-white`}>
            <h3 className={`text-xl font-bold ${theme.text.primary} mb-4 flex items-center gap-2`}>
              <span className="text-2xl">🔔</span>
              Upcoming Events
            </h3>
            <div className="space-y-3">
              {upcomingEvents.map(event => (
                <div
                  key={event.id}
                  className={`p-3 rounded-xl border-2 ${theme.border.primary} cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-300 bg-white`}
                  onClick={() => setSelectedEvent(event)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className={`w-3 h-3 rounded-full ${getEventColor(event.type)} mt-1`}></div>
                    <span className={`text-xs px-2 py-1 rounded ${getStatusBadge(event.status)}`}>
                      {event.status}
                    </span>
                  </div>
                  <h4 className={`font-semibold ${theme.text.primary} text-sm mb-1`}>{event.title}</h4>
                  <p className={`text-xs ${theme.text.secondary}`}>
                    {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                  <p className={`text-xs ${theme.text.muted} mt-1`}>{event.framework}</p>
                </div>
              ))}
            </div>

            {selectedEvent && (
              <div className={`mt-6 p-5 rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 shadow-lg animate-slideIn`}>
                <h4 className={`font-bold ${theme.text.primary} mb-4 text-lg flex items-center gap-2`}>
                  <span className="text-xl">📌</span>
                  Event Details
                </h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className={`font-semibold ${theme.text.secondary}`}>Title:</span>
                    <p className={theme.text.primary}>{selectedEvent.title}</p>
                  </div>
                  <div>
                    <span className={`font-semibold ${theme.text.secondary}`}>Date:</span>
                    <p className={theme.text.primary}>{new Date(selectedEvent.date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <span className={`font-semibold ${theme.text.secondary}`}>Framework:</span>
                    <p className={theme.text.primary}>{selectedEvent.framework}</p>
                  </div>
                  <div>
                    <span className={`font-semibold ${theme.text.secondary}`}>Type:</span>
                    <p className={theme.text.primary}>{selectedEvent.type}</p>
                  </div>
                  <div>
                    <span className={`font-semibold ${theme.text.secondary}`}>Status:</span>
                    <span className={`ml-2 px-2 py-1 rounded text-xs ${getStatusBadge(selectedEvent.status)}`}>
                      {selectedEvent.status}
                    </span>
                  </div>
                </div>
                <button className="w-full mt-4 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 shadow-md hover:shadow-lg transition-all duration-300 font-semibold flex items-center justify-center gap-2">
                  <span>✓</span>
                  Mark as Complete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplianceCalendar;
