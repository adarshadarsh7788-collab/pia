import { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { getThemeClasses } from '../utils/themeUtils';
import { Button, Toast } from './ProfessionalUX';
import { ERPConnector, IoTDataIngestion, UtilityBillImporter, HRMSSync, IntegrationManager, IntegrationConfig, ConnectorFactory } from '../integrations';

const IntegrationDashboard = () => {
  const { isDark } = useTheme();
  const theme = getThemeClasses(isDark);
  const [activeTab, setActiveTab] = useState('overview');
  const [, setConnectionStatus] = useState({});
  const [syncResults, setSyncResults] = useState({});
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState('mock');
  const [connectorType, setConnectorType] = useState('original');

  useEffect(() => {
    loadConnectionStatus();
    // Configure integration system
    IntegrationConfig.setDataSource(dataSource, 'mock');
  }, [dataSource]);

  const loadConnectionStatus = () => {
    const status = IntegrationManager.getConnectionStatus();
    setConnectionStatus(status);
  };

  const testConnection = async (system) => {
    setLoading(true);
    try {
      let result;
      switch (system) {
        case 'erp_sap':
          result = await ERPConnector.testConnection('sap');
          break;
        case 'iot':
          result = await IoTDataIngestion.connectToIoTPlatform('aws', {});
          break;
        case 'hrms_workday':
          result = await HRMSSync.connectToHRMS('workday', {});
          break;
        default:
          result = { success: true };
      }
      showToast(`${system} connection: ${result.success ? 'Success' : 'Failed'}`, result.success ? 'success' : 'error');
    } catch (error) {
      showToast(`Connection failed: ${error.message}`, 'error');
    }
    setLoading(false);
  };

  const syncData = async (system) => {
    setLoading(true);
    try {
      let result;
      
      if (connectorType === 'flexible') {
        // Use flexible connector
        const connector = ConnectorFactory.createConnector(system, { dataSource });
        const dataType = system === 'erp' ? 'financial' : system === 'iot' ? 'environmental' : 'social';
        result = await connector.fetchData(dataType, { useCache: false });
      } else {
        // Use original connectors
        switch (system) {
          case 'erp':
            result = await ERPConnector.syncFinancialData('sap', {});
            break;
          case 'iot':
            result = await IoTDataIngestion.ingestSensorData('sensor_001', 'energy');
            break;
          case 'hrms':
            result = await HRMSSync.syncEmployeeData('workday', {});
            break;
          default:
            result = { success: true, data: {} };
        }
      }
      
      setSyncResults(prev => ({ ...prev, [system]: result }));
      showToast(`${system} data synced successfully`, 'success');
    } catch (error) {
      showToast(`Sync failed: ${error.message}`, 'error');
    }
    setLoading(false);
  };

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const integrationCards = [
    {
      id: 'erp',
      title: 'ERP Systems',
      description: 'SAP, Oracle, Dynamics integration',
      icon: '🏢',
      systems: ['SAP', 'Oracle', 'Dynamics'],
      features: ['Financial Data', 'Procurement Data', 'Sustainability Investments']
    },
    {
      id: 'iot',
      title: 'IoT Sensors',
      description: 'Environmental monitoring',
      icon: '🌐',
      systems: ['AWS IoT', 'Azure IoT', 'GCP IoT'],
      features: ['Energy Monitoring', 'Water Usage', 'Air Quality', 'Waste Tracking']
    },
    {
      id: 'utility',
      title: 'Utility Bills',
      description: 'Energy & water bill processing',
      icon: '📄',
      systems: ['PDF', 'CSV', 'XML', 'JSON'],
      features: ['Bill Parsing', 'Carbon Calculation', 'Cost Analysis']
    },
    {
      id: 'hrms',
      title: 'HRMS Systems',
      description: 'Employee & social data',
      icon: '👥',
      systems: ['Workday', 'SuccessFactors', 'BambooHR'],
      features: ['Employee Data', 'Diversity Metrics', 'Training Records']
    }
  ];

  return (
    <div className={`min-h-screen p-6 ${theme.bg.gradient}`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-3xl font-bold ${theme.text.primary}`}>
            Integration Dashboard
          </h1>
          <p className={`text-lg ${theme.text.secondary}`}>
            Connect and sync data from enterprise systems
          </p>
        </div>

        {/* Configuration Controls */}
        <div className={`mb-6 p-4 rounded-lg ${theme.bg.card}`}>
          <div className="flex flex-wrap gap-4 items-center">
            <div>
              <label className={`block text-sm font-medium mb-1 ${theme.text.primary}`}>{'Data Source'}:</label>
              <select 
                value={dataSource} 
                onChange={(e) => setDataSource(e.target.value)}
                className={`px-3 py-1 rounded border ${theme.bg.input} ${theme.border.input}`}
              >
                <option value="mock">Mock Data</option>
                <option value="api">API</option>
                <option value="localStorage">Local Storage</option>
                <option value="file">File Upload</option>
              </select>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${theme.text.primary}`}>{'Connector Type'}:</label>
              <select 
                value={connectorType} 
                onChange={(e) => setConnectorType(e.target.value)}
                className={`px-3 py-1 rounded border ${theme.bg.input} ${theme.border.input}`}
              >
                <option value="original">Original Connectors</option>
                <option value="flexible">Flexible Connectors</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  IntegrationConfig.setDataSource(dataSource, 'mock');
                  showToast('Configuration updated', 'success');
                }}
              >
                Apply Config
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-8">
          {['overview', 'connections', 'sync', 'testing', 'config'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg font-medium capitalize ${
                activeTab === tab
                  ? 'bg-blue-500 text-white'
                  : `${theme.bg.card} ${theme.text.secondary} hover:${theme.bg.subtle}`
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {integrationCards.map((card) => (
              <div key={card.id} className={`p-6 rounded-xl shadow-lg ${theme.bg.card}`}>
                <div className="flex items-center mb-4">
                  <span className="text-3xl mr-3">{card.icon}</span>
                  <div>
                    <h3 className={`text-xl font-bold ${theme.text.primary}`}>
                      {card.title}
                    </h3>
                    <p className={`${theme.text.secondary}`}>{card.description}</p>
                  </div>
                </div>
                
                <div className="mb-4">
                  <h4 className={`font-semibold mb-2 ${theme.text.primary}`}>Supported Systems:</h4>
                  <div className="flex flex-wrap gap-2">
                    {card.systems.map((system) => (
                      <span
                        key={system}
                        className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm"
                      >
                        {system}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className={`font-semibold mb-2 ${theme.text.primary}`}>Features:</h4>
                  <ul className={`text-sm ${theme.text.secondary}`}>
                    {card.features.map((feature) => (
                      <li key={feature} className="flex items-center">
                        <span className="text-green-500 mr-2">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => testConnection(card.id)}
                    disabled={loading}
                  >
                    Test Connection
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => syncData(card.id)}
                    disabled={loading}
                  >
                    Sync Data
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Connections Tab */}
        {activeTab === 'connections' && (
          <div className={`p-6 rounded-xl shadow-lg ${theme.bg.card}`}>
            <h2 className={`text-2xl font-bold mb-6 ${theme.text.primary}`}>
              System Connections
            </h2>
            
            <div className="space-y-4">
              {[
                { name: 'SAP ERP', status: 'connected', lastSync: '2024-01-15 10:30' },
                { name: 'AWS IoT Core', status: 'connected', lastSync: '2024-01-15 10:25' },
                { name: 'Workday HRMS', status: 'disconnected', lastSync: 'Never' },
                { name: 'Oracle Financials', status: 'error', lastSync: '2024-01-14 15:20' }
              ].map((connection) => (
                <div
                  key={connection.name}
                  className={`flex items-center justify-between p-4 rounded-lg ${theme.bg.subtle}`}
                >
                  <div className="flex items-center">
                    <div
                      className={`w-3 h-3 rounded-full mr-3 ${
                        connection.status === 'connected' ? 'bg-green-500' :
                        connection.status === 'error' ? 'bg-red-500' : 'bg-gray-400'
                      }`}
                    />
                    <div>
                      <h3 className={`font-semibold ${theme.text.primary}`}>
                        {connection.name}
                      </h3>
                      <p className={`text-sm ${theme.text.secondary}`}>
                        Last sync: {connection.lastSync}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      Configure
                    </Button>
                    <Button
                      variant={connection.status === 'connected' ? 'danger' : 'primary'}
                      size="sm"
                    >
                      {connection.status === 'connected' ? 'Disconnect' : 'Connect'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sync Tab */}
        {activeTab === 'sync' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className={`p-6 rounded-xl shadow-lg ${theme.bg.card}`}>
              <h2 className={`text-2xl font-bold mb-6 ${theme.text.primary}`}>
                Data Sync Status
              </h2>
              
              {Object.entries(syncResults).map(([system, result]) => (
                <div key={system} className={`mb-4 p-4 rounded-lg ${theme.bg.subtle}`}>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className={`font-semibold capitalize ${theme.text.primary}`}>
                      {system} Data
                    </h3>
                    <span className="text-green-600 text-sm">
                      {result.lastUpdated ? new Date(result.lastUpdated).toLocaleString() : 'Just now'}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {system === 'erp' && result.totalRevenue && (
                      <>
                        <div>Revenue: ${result.totalRevenue.toLocaleString()}</div>
                        <div>Sustainability: ${result.sustainabilityInvestments.toLocaleString()}</div>
                      </>
                    )}
                    {system === 'iot' && result.totalConsumption && (
                      <>
                        <div>Energy: {result.totalConsumption} kWh</div>
                        <div>Carbon: {result.carbonFootprint} kg CO2</div>
                      </>
                    )}
                    {system === 'hrms' && result.totalEmployees && (
                      <>
                        <div>Employees: {result.totalEmployees}</div>
                        <div>Turnover: {result.turnoverRate}%</div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className={`p-6 rounded-xl shadow-lg ${theme.bg.card}`}>
              <h2 className={`text-2xl font-bold mb-6 ${theme.text.primary}`}>
                Sync Controls
              </h2>
              
              <div className="space-y-4">
                <Button
                  variant="primary"
                  onClick={() => syncData('erp')}
                  disabled={loading}
                  className="w-full"
                >
                  Sync ERP Data
                </Button>
                
                <Button
                  variant="primary"
                  onClick={() => syncData('iot')}
                  disabled={loading}
                  className="w-full"
                >
                  Sync IoT Data
                </Button>
                
                <Button
                  variant="primary"
                  onClick={() => syncData('hrms')}
                  disabled={loading}
                  className="w-full"
                >
                  Sync HRMS Data
                </Button>
                
                <Button
                  variant="outline"
                  onClick={loadConnectionStatus}
                  className="w-full"
                >
                  Refresh Status
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Configuration Tab */}
        {activeTab === 'config' && (
          <div className={`p-6 rounded-xl shadow-lg ${theme.bg.card}`}>
            <h2 className={`text-2xl font-bold mb-6 ${theme.text.primary}`}>
              Advanced Configuration
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className={`text-lg font-semibold mb-4 ${theme.text.primary}`}>
                  Connector Management
                </h3>
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      ConnectorFactory.createERPConnector('sap', {});
                      showToast('ERP connector created', 'success');
                    }}
                    className="w-full"
                  >
                    Create ERP Connector
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => {
                      ConnectorFactory.createIoTConnector('aws', {});
                      showToast('IoT connector created', 'success');
                    }}
                    className="w-full"
                  >
                    Create IoT Connector
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => {
                      const connectors = ConnectorFactory.listConnectors();
                      showToast(`Active connectors: ${connectors.length}`, 'info');
                    }}
                    className="w-full"
                  >
                    List Active Connectors
                  </Button>
                </div>
              </div>

              <div>
                <h3 className={`text-lg font-semibold mb-4 ${theme.text.primary}`}>
                  Data Source Configuration
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme.text.primary}`}>{'API Base URL'}:</label>
                    <input
                      type="text"
                      placeholder="http://localhost:8080/api"
                      className={`w-full p-2 border rounded ${theme.bg.input} ${theme.border.input}`}
                      onChange={(e) => {
                        IntegrationConfig.setEndpoint(e.target.value);
                      }}
                    />
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme.text.primary}`}>{'Cache Timeout (ms)'}:</label>
                    <input
                      type="number"
                      placeholder="300000"
                      className={`w-full p-2 border rounded ${theme.bg.input} ${theme.border.input}`}
                    />
                  </div>
                  
                  <Button
                    variant="primary"
                    onClick={() => {
                      showToast('Configuration saved', 'success');
                    }}
                    className="w-full"
                  >
                    Save Configuration
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Testing Tab */}
        {activeTab === 'testing' && (
          <div className={`p-6 rounded-xl shadow-lg ${theme.bg.card}`}>
            <h2 className={`text-2xl font-bold mb-6 ${theme.text.primary}`}>
              Integration Testing
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className={`text-lg font-semibold mb-4 ${theme.text.primary}`}>
                  Mock Data Generation
                </h3>
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      const mockData = ERPConnector.getMockFinancialData();
                      setSyncResults(prev => ({ ...prev, erp: mockData }));
                      showToast('ERP mock data generated', 'success');
                    }}
                    className="w-full"
                  >
                    Generate ERP Mock Data
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => {
                      const mockData = IoTDataIngestion.getMockSensorData('energy');
                      setSyncResults(prev => ({ ...prev, iot: mockData }));
                      showToast('IoT mock data generated', 'success');
                    }}
                    className="w-full"
                  >
                    Generate IoT Mock Data
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => {
                      const mockData = HRMSSync.getMockEmployeeData();
                      setSyncResults(prev => ({ ...prev, hrms: mockData }));
                      showToast('HRMS mock data generated', 'success');
                    }}
                    className="w-full"
                  >
                    Generate HRMS Mock Data
                  </Button>
                </div>
              </div>

              <div>
                <h3 className={`text-lg font-semibold mb-4 ${theme.text.primary}`}>
                  File Upload Testing
                </h3>
                <div className="space-y-3">
                  <input
                    type="file"
                    accept=".pdf,.csv,.xml,.json"
                    onChange={async (e) => {
                      const file = e.target.files[0];
                      if (file) {
                        try {
                          const result = await UtilityBillImporter.importBill(file, 'electricity', 'Test Provider');
                          setSyncResults(prev => ({ ...prev, utility: result }));
                          showToast('Utility bill imported successfully', 'success');
                        } catch (error) {
                          showToast('Import failed: ' + error.message, 'error');
                        }
                      }
                    }}
                    className={`w-full p-3 border rounded-lg ${theme.bg.input} ${theme.border.input}`}
                  />
                  <p className={`text-sm ${theme.text.secondary}`}>
                    Upload utility bills (PDF, CSV, XML, JSON)
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Toast Notifications */}
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </div>
    </div>
  );
};

export default IntegrationDashboard;