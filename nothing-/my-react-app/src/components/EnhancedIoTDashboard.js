import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { getThemeClasses } from '../utils/themeUtils';

const EnhancedIoTDashboard = () => {
  const { isDark } = useTheme();
  const theme = getThemeClasses(isDark);
  const [devices, setDevices] = useState([]);
  const [metrics, setMetrics] = useState({});
  const [analytics, setAnalytics] = useState(null);
  const [impact, setImpact] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('24h');
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchAllData, 30000);
    return () => clearInterval(interval);
  }, [timeRange]);

  const fetchAllData = async () => {
    try {
      const [devicesRes, metricsRes, analyticsRes, impactRes] = await Promise.all([
        fetch('http://localhost:5000/api/iot/devices/status').then(r => r.json()),
        fetch('http://localhost:5000/api/iot/metrics/realtime').then(r => r.json()),
        fetch(`http://localhost:5000/api/iot/devices/analytics?timeRange=${timeRange}`).then(r => r.json()),
        fetch('http://localhost:5000/api/iot/metrics/esg-impact').then(r => r.json())
      ]);

      if (devicesRes.success) setDevices(devicesRes.data);
      if (metricsRes.success) setMetrics(metricsRes.data);
      if (analyticsRes.success) setAnalytics(analyticsRes.data);
      if (impactRes.success) setImpact(impactRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const openModal = (type, device = null) => {
    setModalType(type);
    setSelectedDevice(device);
    setShowModal(true);
  };

  const deleteDevice = async (deviceId, e) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete device ${deviceId}?`)) return;
    
    try {
      const response = await fetch(`http://localhost:5000/api/iot/devices/${deviceId}`, {
        method: 'DELETE'
      });
      const result = await response.json();
      
      if (result.success) {
        setDevices(devices.filter(d => d.deviceId !== deviceId));
        alert('Device deleted successfully');
      } else {
        alert('Failed to delete device');
      }
    } catch (error) {
      console.error('Error deleting device:', error);
      alert('Error deleting device');
    }
  };

  const toggleDeviceStatus = async (deviceId) => {
    const device = devices.find(d => d.deviceId === deviceId);
    const newStatus = device.status === 'active' ? 'inactive' : 'active';
    
    try {
      const response = await fetch(`http://localhost:5000/api/iot/devices/${deviceId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const result = await response.json();
      
      if (result.success) {
        setDevices(devices.map(d => d.deviceId === deviceId ? { ...d, status: newStatus } : d));
      }
    } catch (error) {
      console.error('Error toggling device status:', error);
    }
  };

  const filteredDevices = devices.filter(d => {
    const matchesSearch = d.deviceId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || d.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900' : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'}`}>
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-blue-200 rounded-full animate-ping"></div>
            <div className="absolute inset-0 border-4 border-blue-500 rounded-full animate-spin"></div>
          </div>
          <p className={`text-xl font-semibold ${theme.text.primary}`}>Loading IoT Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900' : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'} p-6`}>
      <style>{`
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-20px); } }
        @keyframes pulse-glow { 0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.5); } 50% { box-shadow: 0 0 40px rgba(59, 130, 246, 0.8); } }
        @keyframes slide-in { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-float { animation: float 3s ease-in-out infinite; }
        .animate-pulse-glow { animation: pulse-glow 2s ease-in-out infinite; }
        .animate-slide-in { animation: slide-in 0.5s ease-out; }
        .glass-effect { backdrop-filter: blur(10px); background: rgba(255, 255, 255, 0.1); }
        .gradient-border { background: linear-gradient(45deg, #3b82f6, #8b5cf6, #ec4899); padding: 2px; border-radius: 1rem; }
      `}</style>

      {/* Header */}
      <div className="mb-8 animate-slide-in">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className={`text-4xl font-bold ${theme.text.primary} mb-2 flex items-center gap-3`}>
              <span className="animate-float">🚀</span>
              IoT Command Center
            </h1>
            <p className={`text-lg ${theme.text.secondary}`}>Real-time monitoring & ESG intelligence</p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)}
              className={`px-4 py-2 rounded-lg border-2 ${isDark ? 'bg-gray-800 border-blue-500 text-white' : 'bg-white border-blue-300'} transition-all hover:scale-105`}>
              <option value="24h">📅 24 Hours</option>
              <option value="7d">📅 7 Days</option>
              <option value="30d">📅 30 Days</option>
            </select>
            <button onClick={fetchAllData} className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:scale-105 transition-transform shadow-lg">
              🔄 Refresh
            </button>
            <button onClick={() => openModal('register')} className="px-6 py-2 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-lg hover:scale-105 transition-transform shadow-lg">
              ➕ Add Device
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
        {['overview', 'devices', 'analytics', 'impact'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === tab
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg scale-105'
                : isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}>
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-slide-in">
          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: '📡', label: 'Active Devices', value: devices.filter(d => d.status === 'active').length, total: devices.length, color: 'from-blue-500 to-cyan-500' },
              { icon: '⭐', label: 'ESG Score', value: metrics.summary?.esgScore || 0, unit: '/100', color: 'from-purple-500 to-pink-500' },
              { icon: '🌱', label: 'CO2 Emissions', value: (metrics.environmental?.co2Emissions || 0).toFixed(1), unit: 'kg', color: 'from-green-500 to-emerald-500' },
              { icon: '⚡', label: 'Energy Usage', value: (metrics.environmental?.totalEnergyConsumption || 0).toFixed(1), unit: 'kWh', color: 'from-yellow-500 to-orange-500' }
            ].map((metric, i) => (
              <div key={i} className={`relative overflow-hidden rounded-2xl p-6 ${isDark ? 'bg-gray-800/50' : 'bg-white/80'} backdrop-blur-lg shadow-xl hover:scale-105 transition-transform cursor-pointer`}>
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${metric.color} opacity-10 rounded-full -mr-16 -mt-16`}></div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-4xl animate-float">{metric.icon}</span>
                    {metric.total && <span className={`text-xs px-2 py-1 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>{metric.value}/{metric.total}</span>}
                  </div>
                  <p className={`text-sm ${theme.text.secondary} mb-1`}>{metric.label}</p>
                  <p className={`text-3xl font-bold ${theme.text.primary}`}>{metric.value}<span className="text-lg ml-1">{metric.unit}</span></p>
                </div>
              </div>
            ))}
          </div>

          {/* Live Activity */}
          <div className={`rounded-2xl p-6 ${isDark ? 'bg-gray-800/50' : 'bg-white/80'} backdrop-blur-lg shadow-xl`}>
            <h3 className={`text-2xl font-bold ${theme.text.primary} mb-4 flex items-center gap-2`}>
              <span className="animate-pulse">🔴</span> Live Activity Feed
            </h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {devices.slice(0, 5).map((device, i) => (
                <div key={i} className={`p-4 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'} hover:scale-102 transition-transform`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${device.status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                      <div>
                        <p className={`font-semibold ${theme.text.primary}`}>{device.deviceId}</p>
                        <p className={`text-sm ${theme.text.secondary}`}>{device.location}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${device.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}>
                        {device.status}
                      </span>
                      <button
                        onClick={() => toggleDeviceStatus(device.deviceId)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-all hover:scale-105 ${
                          device.status === 'active' 
                            ? 'bg-red-500 hover:bg-red-600 text-white' 
                            : 'bg-green-500 hover:bg-green-600 text-white'
                        }`}
                        title={device.status === 'active' ? 'Set Inactive' : 'Set Active'}
                      >
                        {device.status === 'active' ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Devices Tab */}
      {activeTab === 'devices' && (
        <div className="animate-slide-in">
          <div className="mb-6 flex gap-4">
            <input type="text" placeholder="🔍 Search devices..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className={`flex-1 px-4 py-3 rounded-lg border-2 ${isDark ? 'bg-gray-800 border-blue-500 text-white' : 'bg-white border-blue-300'}`} />
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
              className={`px-4 py-3 rounded-lg border-2 ${isDark ? 'bg-gray-800 border-blue-500 text-white' : 'bg-white border-blue-300'}`}>
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDevices.map((device, i) => (
              <div key={i} className={`rounded-2xl p-6 ${isDark ? 'bg-gray-800/50' : 'bg-white/80'} backdrop-blur-lg shadow-xl hover:scale-105 transition-transform cursor-pointer relative`}
                onClick={() => openModal('details', device)}>
                <div className="absolute top-4 right-4 flex gap-2 z-10">
                  <button
                    onClick={(e) => { e.stopPropagation(); openModal('edit', device); }}
                    className="w-8 h-8 rounded-full bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center transition-all hover:scale-110"
                    title="Edit device"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={(e) => deleteDevice(device.deviceId, e)}
                    className="w-8 h-8 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition-all hover:scale-110"
                    title="Delete device"
                  >
                    🗑️
                  </button>
                </div>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                      {device.deviceType === 'energy_meter' ? '⚡' : device.deviceType === 'water_meter' ? '💧' : '📡'}
                    </div>
                    <div>
                      <p className={`font-bold ${theme.text.primary}`}>{device.deviceId}</p>
                      <p className={`text-sm ${theme.text.secondary}`}>{device.deviceType}</p>
                    </div>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${device.status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className={theme.text.secondary}>Location:</span>
                    <span className={theme.text.primary}>{device.location}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className={theme.text.secondary}>Last Update:</span>
                    <span className={theme.text.primary}>{new Date(device.lastHeartbeat).toLocaleTimeString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && analytics && (
        <div className="animate-slide-in space-y-6">
          <div className={`rounded-2xl p-6 ${isDark ? 'bg-gray-800/50' : 'bg-white/80'} backdrop-blur-lg shadow-xl`}>
            <h3 className={`text-2xl font-bold ${theme.text.primary} mb-6`}>📊 Performance Analytics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <p className={`text-4xl font-bold ${theme.text.primary} mb-2`}>{analytics.summary?.totalDevices || 0}</p>
                <p className={theme.text.secondary}>Total Devices</p>
              </div>
              <div className="text-center">
                <p className={`text-4xl font-bold ${theme.text.primary} mb-2`}>{analytics.summary?.totalDataPoints || 0}</p>
                <p className={theme.text.secondary}>Data Points</p>
              </div>
              <div className="text-center">
                <p className={`text-4xl font-bold ${theme.text.primary} mb-2`}>{analytics.summary?.averageDataFrequency || 0}</p>
                <p className={theme.text.secondary}>Avg Frequency</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Impact Tab */}
      {activeTab === 'impact' && impact && (
        <div className="animate-slide-in">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: '🌱 Environmental', data: impact.environmental, color: 'from-green-500 to-emerald-500' },
              { title: '👥 Social', data: impact.social, color: 'from-blue-500 to-cyan-500' },
              { title: '🏛️ Governance', data: impact.governance, color: 'from-purple-500 to-pink-500' }
            ].map((section, i) => (
              <div key={i} className={`rounded-2xl p-6 ${isDark ? 'bg-gray-800/50' : 'bg-white/80'} backdrop-blur-lg shadow-xl`}>
                <h3 className={`text-xl font-bold ${theme.text.primary} mb-4`}>{section.title}</h3>
                <div className="space-y-3">
                  {Object.entries(section.data || {}).map(([key, value], j) => (
                    <div key={j} className="flex justify-between items-center">
                      <span className={`text-sm ${theme.text.secondary} capitalize`}>{key.replace(/([A-Z])/g, ' $1')}</span>
                      <span className={`font-bold ${theme.text.primary}`}>{typeof value === 'number' ? value.toFixed(1) : value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`rounded-2xl p-8 max-w-2xl w-full ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-2xl animate-slide-in`}>
            <div className="flex justify-between items-center mb-6">
              <h3 className={`text-2xl font-bold ${theme.text.primary}`}>
                {modalType === 'register' ? '➕ Register Device' : '📊 Device Details'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-3xl hover:scale-110 transition-transform">×</button>
            </div>
            <div className={theme.text.secondary}>
              {modalType === 'register' && 'Device registration form here'}
              {modalType === 'edit' && selectedDevice && `Edit form for ${selectedDevice.deviceId}`}
              {modalType === 'details' && selectedDevice && `Details for ${selectedDevice.deviceId}`}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedIoTDashboard;