import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { useTheme } from '../contexts/ThemeContext';
import { getThemeClasses } from '../utils/themeUtils';

const IoTDashboard = () => {
  const { isDark } = useTheme();
  const theme = getThemeClasses(isDark);
  const [devices, setDevices] = useState([]);
  const [realTimeMetrics, setRealTimeMetrics] = useState({});
  const [deviceAnalytics, setDeviceAnalytics] = useState(null);
  const [esgImpact, setEsgImpact] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showDataIngestionModal, setShowDataIngestionModal] = useState(false);
  const [showApiData, setShowApiData] = useState(false);
  const [showDeviceDetails, setShowDeviceDetails] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [apiData, setApiData] = useState(null);
  const [apiTitle, setApiTitle] = useState('');
  const [timeRange, setTimeRange] = useState('24h');
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [newDevice, setNewDevice] = useState({ deviceId: '', deviceType: '', location: '', metadata: {} });
  const [sensorData, setSensorData] = useState({ deviceId: '', sensorType: '', value: '', unit: '' });

  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchAllData, 30000);
    return () => clearInterval(interval);
  }, [timeRange]);

  const fetchAllData = async () => {
    await Promise.all([
      fetchDeviceStatus(),
      fetchRealTimeMetrics(),
      fetchDeviceAnalytics(),
      fetchESGImpact()
    ]);
  };

  const fetchDeviceStatus = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/iot/devices/status');
      const data = await response.json();
      if (data.success) {
        setDevices(data.data);
      }
    } catch (error) {
      console.error('Error fetching device status:', error);
    }
  };

  const fetchRealTimeMetrics = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/iot/metrics/realtime');
      const data = await response.json();
      if (data.success) {
        setRealTimeMetrics(data.data);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching real-time metrics:', error);
      setLoading(false);
    }
  };

  const fetchDeviceAnalytics = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/iot/devices/analytics?timeRange=${timeRange}`);
      const data = await response.json();
      if (data.success) {
        setDeviceAnalytics(data.data);
      }
    } catch (error) {
      console.error('Error fetching device analytics:', error);
    }
  };

  const fetchESGImpact = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/iot/metrics/esg-impact');
      const data = await response.json();
      if (data.success) {
        setEsgImpact(data.data);
      }
    } catch (error) {
      console.error('Error fetching ESG impact:', error);
    }
  };

  const ingestSensorData = async (data) => {
    try {
      const response = await fetch('http://localhost:5000/api/iot/data/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await response.json();
      
      if (response.ok && result.success) {
        alert('Sensor data ingested successfully!');
        fetchAllData();
        setShowDataIngestionModal(false);
        setSensorData({ deviceId: '', sensorType: '', value: '', unit: '' });
      } else {
        alert(`Failed to ingest data: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error ingesting sensor data:', error);
      alert('Error connecting to server.');
    }
  };

  const viewDeviceDetails = async (deviceId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/iot/data/history/${deviceId}?hours=24`);
      const data = await response.json();
      if (data.success) {
        setSelectedDevice({ deviceId, history: data.data });
        setShowDeviceDetails(true);
      }
    } catch (error) {
      console.error('Error fetching device details:', error);
    }
  };

  const registerDevice = async (deviceData) => {
    try {
      const response = await fetch('http://localhost:5000/api/iot/devices/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(deviceData)
      });
      const result = await response.json();
      
      if (response.ok && result.success) {
        alert('Device registered successfully!');
        fetchDeviceStatus();
        setShowRegisterModal(false);
        setNewDevice({ deviceId: '', deviceType: '', location: '' });
      } else {
        alert(`Failed to register device: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error registering device:', error);
      alert('Error connecting to server. Make sure backend is running on port 5000.');
    }
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    if (!newDevice.deviceId || !newDevice.deviceType || !newDevice.location) {
      alert('Please fill in all required fields');
      return;
    }
    registerDevice(newDevice);
  };

  const viewApiData = async (endpoint, title) => {
    try {
      const response = await fetch(`http://localhost:5000${endpoint}`);
      const data = await response.json();
      setApiData(data);
      setApiTitle(title);
      setShowApiData(true);
    } catch (error) {
      console.error('Error fetching API data:', error);
      alert('Error connecting to server. Make sure backend is running on port 5000.');
    }
  };

  const renderApiData = (data) => {
    if (!data) return null;

    if (data.summary) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-50 p-4 rounded">
            <h4 className="font-semibold text-blue-800 mb-2">Summary</h4>
            {Object.entries(data.summary).map(([key, value]) => (
              <div key={key} className="flex justify-between text-sm">
                <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                <span className="font-medium">{typeof value === 'object' ? JSON.stringify(value) : String(value)}</span>
              </div>
            ))}
          </div>
          <div className="bg-green-50 p-4 rounded">
            <h4 className="font-semibold text-green-800 mb-2">Status</h4>
            <div className="text-sm">
              <div className="flex justify-between">
                <span>Success:</span>
                <span className={`font-medium ${data.success ? 'text-green-600' : 'text-red-600'}`}>
                  {data.success ? '✅ Yes' : '❌ No'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Timestamp:</span>
                <span className="font-medium">{new Date(data.timestamp || Date.now()).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (data.environmental) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-50 p-4 rounded">
            <h4 className="font-semibold text-green-800 mb-2">🌱 Environmental</h4>
            {Object.entries(data.environmental).map(([key, value]) => (
              <div key={key} className="flex justify-between text-sm mb-1">
                <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                <span className="font-medium">{typeof value === 'number' ? value.toFixed(2) : String(value)}</span>
              </div>
            ))}
          </div>
          <div className="bg-blue-50 p-4 rounded">
            <h4 className="font-semibold text-blue-800 mb-2">👥 Social</h4>
            {Object.entries(data.social).map(([key, value]) => (
              <div key={key} className="flex justify-between text-sm mb-1">
                <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                <span className="font-medium">{typeof value === 'number' ? value.toFixed(2) : String(value)}</span>
              </div>
            ))}
          </div>
          <div className="bg-purple-50 p-4 rounded">
            <h4 className="font-semibold text-purple-800 mb-2">🏛️ Governance</h4>
            {Object.entries(data.governance).map(([key, value]) => (
              <div key={key} className="flex justify-between text-sm mb-1">
                <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                <span className="font-medium">{typeof value === 'number' ? value.toFixed(2) : String(value)}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="bg-gray-50 p-4 rounded">
        <h4 className="font-semibold mb-2">Data Overview</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
          {Object.entries(data).map(([key, value]) => (
            <div key={key} className="flex justify-between">
              <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
              <span className="font-medium">
                {typeof value === 'object' ? `${Object.keys(value).length} items` : String(value)}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const deleteDevice = async (deviceId) => {
    if (window.confirm(`Are you sure you want to delete device ${deviceId}? This will also delete all associated sensor data.`)) {
      try {
        const response = await fetch(`http://localhost:5000/api/iot/devices/${deviceId}`, {
          method: 'DELETE'
        });
        const result = await response.json();
        
        if (response.ok && result.success) {
          alert('Device deleted successfully!');
          fetchDeviceStatus();
        } else {
          alert(`Failed to delete device: ${result.error || 'Unknown error'}`);
        }
      } catch (error) {
        console.error('Error deleting device:', error);
        alert('Error connecting to server.');
      }
    }
  };

  const DeviceCard = ({ device }) => (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>{device.deviceId}</span>
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 rounded text-sm ${
              device.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {device.status}
            </span>
            <button
              onClick={() => deleteDevice(device.deviceId)}
              className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600 transition-colors"
              title="Delete Device"
            >
              🗑️
            </button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p><strong>Type:</strong> {device.deviceType}</p>
        <p><strong>Location:</strong> {device.location}</p>
        <p><strong>Last Update:</strong> {new Date(device.lastHeartbeat).toLocaleString()}</p>
      </CardContent>
    </Card>
  );

  const MetricCard = ({ title, value, unit, icon }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center">
          <div className="text-2xl mr-4">{icon}</div>
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold">{value} {unit}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const filteredDevices = devices.filter(device => {
    const matchesSearch = device.deviceId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         device.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'all' || device.deviceType === filterType;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className={`flex justify-center items-center h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-4"></div>
          <p className={`text-lg ${theme.text.primary}`}>Loading IoT Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} p-6 space-y-6`}>
      {/* Enhanced Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className={`text-3xl font-bold ${theme.text.primary}`}>IoT Monitoring Dashboard</h1>
          <p className={`text-sm ${theme.text.secondary} mt-1`}>Real-time device monitoring and ESG impact tracking</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className={`px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'}`}
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
          <button 
            onClick={fetchAllData} 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            🔄 Refresh
          </button>
          <button 
            onClick={() => setShowRegisterModal(true)} 
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            ➕ Add Device
          </button>
          <button 
            onClick={() => setShowDataIngestionModal(true)} 
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            📊 Ingest Data
          </button>
        </div>
      </div>

      {/* Enhanced Real-time Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className={`rounded-lg p-6 border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} hover:shadow-lg transition-shadow`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-3xl">📡</span>
            <span className={`text-xs px-2 py-1 rounded-full ${devices.filter(d => d.status === 'active').length > 0 ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}>
              {devices.filter(d => d.status === 'active').length}/{devices.length}
            </span>
          </div>
          <p className={`text-sm ${theme.text.secondary}`}>Active Devices</p>
          <p className={`text-3xl font-bold ${theme.text.primary}`}>{devices.filter(d => d.status === 'active').length}</p>
        </div>
        
        <div className={`rounded-lg p-6 border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} hover:shadow-lg transition-shadow`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-3xl">⭐</span>
            <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-600">ESG</span>
          </div>
          <p className={`text-sm ${theme.text.secondary}`}>ESG Score</p>
          <p className={`text-3xl font-bold ${theme.text.primary}`}>{realTimeMetrics.summary?.esgScore || 0}</p>
        </div>
        
        <div className={`rounded-lg p-6 border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} hover:shadow-lg transition-shadow`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-3xl">🌱</span>
            <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-600">CO2</span>
          </div>
          <p className={`text-sm ${theme.text.secondary}`}>CO2 Emissions</p>
          <p className={`text-2xl font-bold ${theme.text.primary}`}>{(realTimeMetrics.environmental?.co2Emissions || 0).toFixed(2)} kg</p>
        </div>
        
        <div className={`rounded-lg p-6 border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} hover:shadow-lg transition-shadow`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-3xl">⚡</span>
            <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-600">kWh</span>
          </div>
          <p className={`text-sm ${theme.text.secondary}`}>Energy Usage</p>
          <p className={`text-2xl font-bold ${theme.text.primary}`}>{(realTimeMetrics.environmental?.totalEnergyConsumption || 0).toFixed(2)}</p>
        </div>
        
        <div className={`rounded-lg p-6 border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} hover:shadow-lg transition-shadow`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-3xl">💧</span>
            <span className="text-xs px-2 py-1 rounded-full bg-cyan-100 text-cyan-600">L</span>
          </div>
          <p className={`text-sm ${theme.text.secondary}`}>Water Usage</p>
          <p className={`text-2xl font-bold ${theme.text.primary}`}>{(realTimeMetrics.environmental?.waterUsage || 0).toFixed(2)}</p>
        </div>
      </div>

      {/* ESG Impact Summary */}
      {esgImpact && (
        <div className={`rounded-lg p-6 border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <h3 className={`text-xl font-semibold ${theme.text.primary} mb-4`}>🌍 ESG Impact Analysis</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className={`font-semibold ${theme.text.primary} mb-3`}>🌱 Environmental</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className={theme.text.secondary}>Carbon Reduction:</span>
                  <span className={`font-medium ${theme.text.primary}`}>{esgImpact.environmental?.carbonFootprintReduction || 0} kg</span>
                </div>
                <div className="flex justify-between">
                  <span className={theme.text.secondary}>Energy Savings:</span>
                  <span className={`font-medium ${theme.text.primary}`}>{esgImpact.environmental?.energySavings || 0} kWh</span>
                </div>
                <div className="flex justify-between">
                  <span className={theme.text.secondary}>Water Conservation:</span>
                  <span className={`font-medium ${theme.text.primary}`}>{esgImpact.environmental?.waterConservation || 0} L</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className={`font-semibold ${theme.text.primary} mb-3`}>👥 Social</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className={theme.text.secondary}>Air Quality:</span>
                  <span className={`font-medium ${theme.text.primary}`}>{esgImpact.social?.airQualityImprovement || 0}%</span>
                </div>
                <div className="flex justify-between">
                  <span className={theme.text.secondary}>Noise Reduction:</span>
                  <span className={`font-medium ${theme.text.primary}`}>{esgImpact.social?.noiseReduction || 0}%</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className={`font-semibold ${theme.text.primary} mb-3`}>🏛️ Governance</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className={theme.text.secondary}>Data Transparency:</span>
                  <span className={`font-medium ${theme.text.primary}`}>{esgImpact.governance?.dataTransparency || 0}%</span>
                </div>
                <div className="flex justify-between">
                  <span className={theme.text.secondary}>Compliance Rate:</span>
                  <span className={`font-medium ${theme.text.primary}`}>{esgImpact.governance?.complianceRate || 0}%</span>
                </div>
                <div className="flex justify-between">
                  <span className={theme.text.secondary}>Reporting Accuracy:</span>
                  <span className={`font-medium ${theme.text.primary}`}>{esgImpact.governance?.reportingAccuracy || 0}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Device Status with Search and Filter */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={`lg:col-span-2 rounded-lg p-6 border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <h3 className={`text-xl font-semibold ${theme.text.primary}`}>📡 Connected Devices ({filteredDevices.length})</h3>
            <div className="flex gap-3 w-full md:w-auto">
              <input
                type="text"
                placeholder="Search devices..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`px-4 py-2 rounded-lg border flex-1 md:w-48 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className={`px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              >
                <option value="all">All Types</option>
                <option value="energy_meter">Energy Meter</option>
                <option value="water_meter">Water Meter</option>
                <option value="air_quality">Air Quality</option>
                <option value="waste_sensor">Waste Sensor</option>
              </select>
            </div>
          </div>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredDevices.length > 0 ? (
              filteredDevices.map(device => (
                <div key={device.deviceId} className={`p-4 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} hover:shadow-md transition-shadow`}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className={`font-semibold ${theme.text.primary}`}>{device.deviceId}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          device.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                        }`}>
                          {device.status}
                        </span>
                        {device.connectionStatus && (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            device.connectionStatus === 'connected' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {device.connectionStatus}
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className={theme.text.secondary}>Type: </span>
                          <span className={theme.text.primary}>{device.deviceType}</span>
                        </div>
                        <div>
                          <span className={theme.text.secondary}>Location: </span>
                          <span className={theme.text.primary}>{device.location}</span>
                        </div>
                        <div>
                          <span className={theme.text.secondary}>Last Update: </span>
                          <span className={theme.text.primary}>{new Date(device.lastHeartbeat).toLocaleString()}</span>
                        </div>
                        {device.dataPointsLast24h !== undefined && (
                          <div>
                            <span className={theme.text.secondary}>Data Points (24h): </span>
                            <span className={theme.text.primary}>{device.dataPointsLast24h}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => viewDeviceDetails(device.deviceId)}
                        className="px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 transition-colors"
                      >
                        🔍 Details
                      </button>
                      <button
                        onClick={() => deleteDevice(device.deviceId)}
                        className="px-3 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600 transition-colors"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <p className={`text-lg ${theme.text.secondary}`}>No devices found</p>
                <button
                  onClick={() => setShowRegisterModal(true)}
                  className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  ➕ Register First Device
                </button>
              </div>
            )}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <button 
              onClick={() => setShowRegisterModal(true)}
              className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
            >
              📱 Register New Device
            </button>
            
            <button 
              onClick={() => viewApiData('/api/iot/devices/status', 'Device Status & Analytics')}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              🔗 Device Analytics
            </button>
            
            <button 
              onClick={() => viewApiData('/api/iot/metrics/realtime', 'Real-time ESG Metrics')}
              className="w-full px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
            >
              📊 ESG Metrics
            </button>
            
            <button 
              onClick={() => viewApiData('/api/iot/metrics/esg-impact', 'ESG Impact Analysis')}
              className="w-full px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 transition-colors"
            >
              🌱 Impact Analysis
            </button>
            
            <button 
              onClick={() => viewApiData('/api/iot/devices/analytics?timeRange=24h', 'Device Performance Analytics')}
              className="w-full px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
            >
              📈 Performance Analytics
            </button>
            
            <button 
              onClick={() => fetchRealTimeMetrics()}
              className="w-full px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors"
            >
              🔄 Refresh Metrics
            </button>
          </CardContent>
        </Card>
      </div>

      {/* IoT Integration Guide */}
      <Card>
        <CardHeader>
          <CardTitle>IoT Integration Guide</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">Supported Sensor Types:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Energy Meters (kWh)</li>
                <li>Water Sensors (liters)</li>
                <li>Air Quality (CO2 ppm)</li>
                <li>Waste Level (%)</li>
                <li>Temperature (°C)</li>
                <li>Humidity (%)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">API Endpoints:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>POST /api/iot/devices/register</li>
                <li>POST /api/iot/data/ingest</li>
                <li>GET /api/iot/metrics/realtime</li>
                <li>GET /api/iot/devices/status</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Ingestion Modal */}
      {showDataIngestionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`p-6 rounded-lg w-96 max-w-90vw ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <h3 className={`text-lg font-semibold ${theme.text.primary} mb-4`}>📊 Ingest Sensor Data</h3>
            <form onSubmit={(e) => { e.preventDefault(); ingestSensorData(sensorData); }} className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${theme.text.primary}`}>Device ID</label>
                <select
                  value={sensorData.deviceId}
                  onChange={(e) => setSensorData({...sensorData, deviceId: e.target.value})}
                  className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`}
                  required
                >
                  <option value="">Select device</option>
                  {devices.map(device => (
                    <option key={device.deviceId} value={device.deviceId}>{device.deviceId} - {device.deviceType}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${theme.text.primary}`}>Sensor Type</label>
                <select
                  value={sensorData.sensorType}
                  onChange={(e) => setSensorData({...sensorData, sensorType: e.target.value})}
                  className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`}
                  required
                >
                  <option value="">Select sensor type</option>
                  <option value="energy">Energy (kWh)</option>
                  <option value="water">Water (L)</option>
                  <option value="co2">CO2 (ppm)</option>
                  <option value="temperature">Temperature (°C)</option>
                  <option value="humidity">Humidity (%)</option>
                  <option value="noise">Noise (dB)</option>
                  <option value="waste_level">Waste Level (%)</option>
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${theme.text.primary}`}>Value</label>
                <input
                  type="number"
                  step="0.01"
                  value={sensorData.value}
                  onChange={(e) => setSensorData({...sensorData, value: e.target.value})}
                  className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`}
                  placeholder="e.g., 125.5"
                  required
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${theme.text.primary}`}>Unit</label>
                <input
                  type="text"
                  value={sensorData.unit}
                  onChange={(e) => setSensorData({...sensorData, unit: e.target.value})}
                  className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`}
                  placeholder="e.g., kWh, L, ppm"
                  required
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button type="submit" className="flex-1 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors">
                  Ingest Data
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowDataIngestionModal(false);
                    setSensorData({ deviceId: '', sensorType: '', value: '', unit: '' });
                  }}
                  className="flex-1 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Device Details Modal */}
      {showDeviceDetails && selectedDevice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`p-6 rounded-lg w-11/12 max-w-4xl max-h-5/6 overflow-auto ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-xl font-semibold ${theme.text.primary}`}>🔍 Device Details: {selectedDevice.deviceId}</h3>
              <button onClick={() => setShowDeviceDetails(false)} className="text-gray-500 hover:text-gray-700 text-2xl font-bold">
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <h4 className={`font-semibold ${theme.text.primary} mb-3`}>Recent Data (Last 24 Hours)</h4>
                {selectedDevice.history && selectedDevice.history.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className={`border-b ${isDark ? 'border-gray-600' : 'border-gray-200'}`}>
                          <th className={`text-left py-2 ${theme.text.primary}`}>Timestamp</th>
                          <th className={`text-left py-2 ${theme.text.primary}`}>Sensor Type</th>
                          <th className={`text-left py-2 ${theme.text.primary}`}>Value</th>
                          <th className={`text-left py-2 ${theme.text.primary}`}>Unit</th>
                          <th className={`text-left py-2 ${theme.text.primary}`}>Quality</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedDevice.history.slice(0, 10).map((record, index) => (
                          <tr key={index} className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
                            <td className={`py-2 ${theme.text.secondary}`}>{new Date(record.timestamp).toLocaleString()}</td>
                            <td className={`py-2 ${theme.text.primary}`}>{record.sensorType}</td>
                            <td className={`py-2 ${theme.text.primary}`}>{record.value}</td>
                            <td className={`py-2 ${theme.text.secondary}`}>{record.unit}</td>
                            <td className="py-2">
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                record.quality === 'good' ? 'bg-green-100 text-green-600' :
                                record.quality === 'fair' ? 'bg-yellow-100 text-yellow-600' :
                                'bg-red-100 text-red-600'
                              }`}>
                                {record.quality}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className={theme.text.secondary}>No data available for this device</p>
                )}
              </div>
            </div>
            
            <div className="flex justify-end mt-6">
              <button onClick={() => setShowDeviceDetails(false)} className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Register Device Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`p-6 rounded-lg w-96 max-w-90vw ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <h3 className={`text-lg font-semibold ${theme.text.primary} mb-4`}>📡 Register New IoT Device</h3>
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${theme.text.primary}`}>Device ID</label>
                <input
                  type="text"
                  value={newDevice.deviceId}
                  onChange={(e) => setNewDevice({...newDevice, deviceId: e.target.value})}
                  className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`}
                  placeholder="e.g., SENSOR_001"
                  required
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${theme.text.primary}`}>Device Type</label>
                <select
                  value={newDevice.deviceType}
                  onChange={(e) => setNewDevice({...newDevice, deviceType: e.target.value})}
                  className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`}
                  required
                >
                  <option value="">Select device type</option>
                  <option value="energy_meter">⚡ Energy Meter</option>
                  <option value="water_meter">💧 Water Meter</option>
                  <option value="air_quality">🌫️ Air Quality Sensor</option>
                  <option value="waste_sensor">🗑️ Waste Level Sensor</option>
                  <option value="safety_wearable">🦺 Safety Wearable</option>
                  <option value="fleet_tracker">🚚 Fleet Tracker</option>
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${theme.text.primary}`}>Location</label>
                <input
                  type="text"
                  value={newDevice.location}
                  onChange={(e) => setNewDevice({...newDevice, location: e.target.value})}
                  className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`}
                  placeholder="e.g., Building A - Floor 2"
                  required
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                >
                  Register Device
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowRegisterModal(false);
                    setNewDevice({ deviceId: '', deviceType: '', location: '' });
                  }}
                  className="flex-1 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Enhanced API Data Modal */}
      {showApiData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-11/12 max-w-6xl max-h-5/6 overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-800">{apiTitle}</h3>
              <button
                onClick={() => setShowApiData(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                ×
              </button>
            </div>
            
            {/* Formatted Data Display */}
            <div className="space-y-4">
              {apiData && renderApiData(apiData)}
            </div>
            
            {/* Raw JSON Toggle */}
            <details className="mt-6">
              <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800 mb-2">
                View Raw JSON Data
              </summary>
              <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto max-h-64 border">
                {JSON.stringify(apiData, null, 2)}
              </pre>
            </details>
            
            <div className="flex justify-end mt-6 space-x-3">
              <button
                onClick={() => navigator.clipboard.writeText(JSON.stringify(apiData, null, 2))}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Copy JSON
              </button>
              <button
                onClick={() => setShowApiData(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IoTDashboard;