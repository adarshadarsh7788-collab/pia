import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import companyLogo from '../companyLogo.jpg';
import { getUserRole, USER_ROLES } from '../utils/rbac';
import ApprovalsPanel from './ApprovalsPanel';

const ProfessionalHeader = ({ onLogout, actions = [] }) => {
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const [pendingUsers, setPendingUsers] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [recentAlerts, setRecentAlerts] = useState([]);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [backgroundTheme, setBackgroundTheme] = useState(localStorage.getItem('backgroundTheme') || null);
  const [showApprovals, setShowApprovals] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const currentUser = localStorage.getItem('currentUser');
  const userRole = getUserRole();
  const isAdmin = userRole === USER_ROLES.SUPER_ADMIN;

  useEffect(() => {
    const loadPendingUsers = () => {
      if (isAdmin) {
        const pending = JSON.parse(localStorage.getItem('pendingUsers') || '[]');
        setPendingUsers(pending.filter(user => user.status === 'pending'));
      }
    };
    
    const loadRecentAlerts = () => {
      const alerts = JSON.parse(localStorage.getItem('recentAlerts') || '[]');
      const now = new Date();
      const last24Hours = alerts.filter(alert => {
        const alertTime = new Date(alert.timestamp);
        return (now - alertTime) < 24 * 60 * 60 * 1000;
      });
      setRecentAlerts(last24Hours.slice(0, 10));
    };
    
    loadPendingUsers();
    loadRecentAlerts();
    loadPendingApprovals();
    
    const interval = setInterval(() => {
      loadPendingUsers();
      loadRecentAlerts();
      loadPendingApprovals();
    }, 2000);
    
    return () => clearInterval(interval);
  }, [isAdmin]);

  const handleApprove = (userEmail) => {
    const pending = JSON.parse(localStorage.getItem('pendingUsers') || '[]');
    const approved = JSON.parse(localStorage.getItem('approvedUsers') || '[]');
    
    const userIndex = pending.findIndex(u => u.email === userEmail);
    if (userIndex !== -1) {
      const user = { ...pending[userIndex] };
      user.status = 'approved';
      user.approvedDate = new Date().toISOString();
      
      approved.push(user);
      pending.splice(userIndex, 1);
      
      localStorage.setItem('pendingUsers', JSON.stringify(pending));
      localStorage.setItem('approvedUsers', JSON.stringify(approved));
      
      setPendingUsers(pending.filter(u => u.status === 'pending'));
    }
  };

  const handleReject = (userEmail) => {
    const pending = JSON.parse(localStorage.getItem('pendingUsers') || '[]');
    const userIndex = pending.findIndex(u => u.email === userEmail);
    if (userIndex !== -1) {
      pending.splice(userIndex, 1);
      localStorage.setItem('pendingUsers', JSON.stringify(pending));
      setPendingUsers(pending.filter(u => u.status === 'pending'));
    }
  };

  const markAlertAsRead = (alertId) => {
    const alerts = JSON.parse(localStorage.getItem('recentAlerts') || '[]');
    const updatedAlerts = alerts.map(alert => 
      alert.id === alertId ? { ...alert, read: true } : alert
    );
    localStorage.setItem('recentAlerts', JSON.stringify(updatedAlerts));
    setRecentAlerts(updatedAlerts.filter(alert => {
      const alertTime = new Date(alert.timestamp);
      const now = new Date();
      return (now - alertTime) < 24 * 60 * 60 * 1000;
    }).slice(0, 10));
  };

  const clearAllAlerts = () => {
    localStorage.setItem('recentAlerts', JSON.stringify([]));
    setRecentAlerts([]);
    // Dispatch storage event to notify other components
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'recentAlerts',
      newValue: '[]',
      oldValue: localStorage.getItem('recentAlerts')
    }));
    // Also dispatch custom event for immediate updates
    window.dispatchEvent(new CustomEvent('alertsCleared'));
  };

  const loadPendingApprovals = () => {
    if (userRole === USER_ROLES.SUPERVISOR || userRole === USER_ROLES.SUPER_ADMIN) {
      const workflows = JSON.parse(localStorage.getItem('approvalWorkflows') || '[]');
      const pending = workflows.filter(w => w.status === 'pending').length;
      setPendingCount(pending);
    } else {
      setPendingCount(0);
    }
  };

  const unreadAlertsCount = recentAlerts.filter(alert => !alert.read).length;
  const totalNotifications = (isAdmin ? pendingUsers.length : 0) + unreadAlertsCount + pendingCount;

  const applyBackgroundTheme = (themeUrl) => {
    const overlay = isDark 
      ? 'linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6))' 
      : 'linear-gradient(rgba(255,255,255,0.1), rgba(255,255,255,0.1))';
    
    // Apply to body
    document.body.style.backgroundImage = `${overlay}, url(${themeUrl})`;
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundPosition = 'center';
    document.body.style.backgroundAttachment = 'fixed';
    
    // Also apply to main containers
    const mainContainers = document.querySelectorAll('main, .min-h-screen');
    mainContainers.forEach(container => {
      container.style.backgroundImage = 'inherit';
      container.style.backgroundColor = 'transparent';
    });
  };

  const handleThemeUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const themeUrl = e.target.result;
        setBackgroundTheme(themeUrl);
        localStorage.setItem('backgroundTheme', themeUrl);
        applyBackgroundTheme(themeUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeCustomTheme = () => {
    setBackgroundTheme(null);
    localStorage.removeItem('backgroundTheme');
    document.body.style.backgroundImage = '';
    document.body.style.backgroundSize = '';
    document.body.style.backgroundPosition = '';
    document.body.style.backgroundAttachment = '';
    
    // Reset main containers
    const mainContainers = document.querySelectorAll('main, .min-h-screen');
    mainContainers.forEach(container => {
      container.style.backgroundImage = '';
      container.style.backgroundColor = '';
    });
  };

  useEffect(() => {
    if (backgroundTheme) {
      applyBackgroundTheme(backgroundTheme);
    }
  }, [backgroundTheme, isDark]);

  const navItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/data-entry', label: 'Data Entry', icon: '📝' },
    { path: '/reports', label: 'Reports', icon: '📋' },
    { path: '/workflow', label: 'Approval', icon: '📋' },
    { path: '/analytics', label: 'Analytics', icon: '📈' },
    { path: '/compliance', label: 'Compliance', icon: '✅' },
    { path: '/regulatory', label: 'Regulatory', icon: '⚖️' },
    { path: '/stakeholders', label: 'Stakeholders', icon: '👥' }
  ];

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${
      isDark 
        ? 'bg-gradient-to-r from-teal-700 to-emerald-800 border-teal-600' 
        : 'bg-gradient-to-r from-teal-600 to-emerald-700 border-teal-500'
    } backdrop-blur-xl border-b shadow-sm`}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <div className="flex items-center space-x-2 flex-shrink-0">
            <div className="w-8 h-8 rounded-lg overflow-hidden">
              <img src={companyLogo} alt="ESG Platform" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className={`text-lg font-bold ${
                isDark ? 'text-white' : 'text-white'
              }`}>E-S-Genius</h1>
              <p className={`text-xs ${isDark ? 'text-teal-100' : 'text-teal-100'}`}>ESG Platform</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-1 flex-1 justify-center max-w-3xl">
            {navItems.map((item) => {
              if (item.adminOnly && !isAdmin) return null;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                    isActive
                      ? (isDark ? 'bg-white/20 text-white' : 'bg-white/20 text-white')
                      : isDark
                        ? 'text-teal-100 hover:text-white hover:bg-white/10'
                        : 'text-teal-100 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <span className="text-sm">{item.icon}</span>
                  <span className="hidden lg:block">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-2 flex-shrink-0">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-all duration-200 ${
                isDark 
                  ? 'text-teal-100 hover:bg-white/10' 
                  : 'text-teal-100 hover:bg-white/10'
              }`}
            >
              <span className="text-lg">{isDark ? '☀️' : '🌙'}</span>
            </button>

            {/* Notifications */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className={`relative p-2 rounded-lg transition-all duration-200 ${
                  isDark 
                    ? 'text-teal-100 hover:bg-white/10' 
                    : 'text-teal-100 hover:bg-white/10'
                }`}
              >
                <span className="text-lg">🔔</span>
                {totalNotifications > 0 && (
                  <div className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-xs text-white font-bold">{totalNotifications > 9 ? '9+' : totalNotifications}</span>
                  </div>
                )}
              </button>
              
              {showNotifications && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                  <div className={`absolute right-0 top-12 w-80 rounded-lg shadow-xl border z-50 ${
                    isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                  }`}>
                    <div className={`p-3 border-b flex items-center justify-between ${
                      isDark ? 'border-gray-700 text-white' : 'border-gray-200 text-gray-900'
                    }`}>
                      <h3 className="font-semibold text-sm flex items-center gap-2">
                        <span>🔔</span>Notifications
                      </h3>
                      {recentAlerts.length > 0 && (
                        <button
                          onClick={clearAllAlerts}
                          className={`text-xs px-2 py-1 rounded transition-colors ${
                            isDark ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          Clear All
                        </button>
                      )}
                    </div>
                    
                    <div className="max-h-64 overflow-y-auto">
                      {recentAlerts.length === 0 ? (
                        <div className={`p-4 text-center ${
                          isDark ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          <span className="text-xl mb-2 block">📭</span>
                          <p className="text-sm">No notifications</p>
                        </div>
                      ) : (
                        recentAlerts.map((alert) => (
                          <div 
                            key={alert.id} 
                            className={`p-3 border-b cursor-pointer transition-colors ${
                              isDark ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-100 hover:bg-gray-50'
                            } ${alert.read ? 'opacity-60' : ''}`}
                            onClick={() => markAlertAsRead(alert.id)}
                          >
                            <div className="flex items-start gap-2">
                              <span className={`text-sm ${
                                alert.type === 'error' ? 'text-red-500' :
                                alert.type === 'warning' ? 'text-yellow-500' :
                                alert.type === 'success' ? 'text-green-500' : 'text-blue-500'
                              }`}>
                                {alert.type === 'error' ? '🚨' :
                                 alert.type === 'warning' ? '⚠️' :
                                 alert.type === 'success' ? '✅' : 'ℹ️'}
                              </span>
                              <div className="flex-1">
                                <h4 className={`font-medium text-xs ${
                                  isDark ? 'text-white' : 'text-gray-900'
                                } ${!alert.read ? 'font-semibold' : ''}`}>
                                  {alert.title}
                                </h4>
                                <p className={`text-xs mt-1 ${
                                  isDark ? 'text-gray-400' : 'text-gray-600'
                                }`}>
                                  {alert.message}
                                </p>
                                <span className={`text-xs ${
                                  isDark ? 'text-gray-500' : 'text-gray-400'
                                }`}>
                                  {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              {!alert.read && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white text-sm font-bold hover:bg-blue-700 transition-colors"
              >
                U
              </button>
              
              {showUserMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                  <div className={`absolute right-0 top-10 w-48 rounded-lg shadow-xl border z-50 ${
                    isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                  }`}>
                    <div className="p-3">
                      <button
                        onClick={() => {
                          localStorage.removeItem('userRole');
                          setShowUserMenu(false);
                          onLogout();
                        }}
                        className="w-full bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded text-sm font-medium transition-colors"
                      >
                        🚺 Logout
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default ProfessionalHeader;