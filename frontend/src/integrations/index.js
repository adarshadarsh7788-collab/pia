// Integration Hub - Central export for all API connectors
export { default as ERPConnector } from './ERPConnector';
export { default as IoTDataIngestion } from './IoTDataIngestion';
export { default as UtilityBillImporter } from './UtilityBillImporter';
export { default as HRMSSync } from './HRMSSync';
export { default as IntegrationConfig } from './IntegrationConfig';
export { default as DataSourceAdapter } from './DataSourceAdapter';
export { default as FlexibleConnector } from './FlexibleConnector';
export { default as ConnectorFactory } from './ConnectorFactory';

// Flexible Integration Manager - Orchestrates multiple integrations
export class IntegrationManager {
  static connectedSystems = new Map();
  static syncSchedules = new Map();
  static connectors = new Map();
  static config = {
    dataSource: 'mock',
    fallbackSource: 'localStorage',
    cacheTimeout: 300000,
    retryAttempts: 3
  };

  static configure(options = {}) {
    this.config = { ...this.config, ...options };
    
    // Update global config
    const { IntegrationConfig } = require('./IntegrationConfig');
    if (options.dataSource) {
      IntegrationConfig.setDataSource(options.dataSource, options.fallbackSource);
    }
    if (options.apiBase) {
      IntegrationConfig.setEndpoint(options.apiBase, options.timeout);
    }
  }

  static registerConnector(type, connector) {
    this.connectors.set(type, connector);
  }

  static createFlexibleConnector(type, config = {}) {
    const { FlexibleConnector } = require('./FlexibleConnector');
    const connector = new FlexibleConnector(type, {
      ...this.config,
      ...config
    });
    this.connectors.set(type, connector);
    return connector;
  }

  static getConnector(type) {
    return this.connectors.get(type);
  }

  static async initializeIntegrations(config) {
    const results = {};
    
    // Configure integration settings
    if (config.settings) {
      this.configure(config.settings);
    }
    
    // Initialize ERP connections
    if (config.erp) {
      for (const [system, credentials] of Object.entries(config.erp)) {
        try {
          let connector;
          if (config.useFlexibleConnector) {
            connector = this.createFlexibleConnector('erp', { system, credentials });
          } else {
            const { ERPConnector } = await import('./ERPConnector');
            connector = ERPConnector;
          }
          
          const result = await connector.connectToERP?.(system, credentials) || { success: true };
          results[`erp_${system}`] = result;
          if (result.success) {
            this.connectedSystems.set(`erp_${system}`, { type: 'erp', system, connector });
          }
        } catch (error) {
          results[`erp_${system}`] = { success: false, error: error.message };
        }
      }
    }

    // Initialize IoT connections
    if (config.iot) {
      try {
        const { IoTDataIngestion } = await import('./IoTDataIngestion');
        const result = await IoTDataIngestion.connectToIoTPlatform(config.iot.platform, config.iot.config);
        results.iot = result;
        if (result.success) {
          this.connectedSystems.set('iot', { type: 'iot', connector: IoTDataIngestion });
        }
      } catch (error) {
        results.iot = { success: false, error: error.message };
      }
    }

    // Initialize HRMS connections
    if (config.hrms) {
      for (const [system, credentials] of Object.entries(config.hrms)) {
        try {
          const { HRMSSync } = await import('./HRMSSync');
          const result = await HRMSSync.connectToHRMS(system, credentials);
          results[`hrms_${system}`] = result;
          if (result.success) {
            this.connectedSystems.set(`hrms_${system}`, { type: 'hrms', system, connector: HRMSSync });
          }
        } catch (error) {
          results[`hrms_${system}`] = { success: false, error: error.message };
        }
      }
    }

    return results;
  }

  static async syncAllData(dateRange = {}) {
    const syncResults = {};
    
    for (const [key, connection] of this.connectedSystems.entries()) {
      try {
        let result;
        
        switch (connection.type) {
          case 'erp':
            result = await this.syncERPData(connection, dateRange);
            break;
          case 'iot':
            result = await this.syncIoTData(connection);
            break;
          case 'hrms':
            result = await this.syncHRMSData(connection, dateRange);
            break;
          default:
            result = { success: false, error: 'Unknown connection type' };
        }
        
        syncResults[key] = result;
      } catch (error) {
        syncResults[key] = { success: false, error: error.message };
      }
    }

    return syncResults;
  }

  static async syncERPData(connection, dateRange) {
    const financial = await connection.connector.syncFinancialData(connection.system, dateRange);
    const procurement = await connection.connector.syncProcurementData(connection.system, dateRange);
    
    return {
      success: true,
      data: { financial, procurement },
      lastSync: new Date().toISOString()
    };
  }

  static async syncIoTData(connection) {
    const sensorTypes = ['energy', 'water', 'air', 'waste'];
    const data = {};
    
    for (const type of sensorTypes) {
      data[type] = await connection.connector.ingestSensorData(`sensor_${type}_001`, type);
    }
    
    return {
      success: true,
      data,
      lastSync: new Date().toISOString()
    };
  }

  static async syncHRMSData(connection, dateRange) {
    const employee = await connection.connector.syncEmployeeData(connection.system, dateRange);
    const diversity = await connection.connector.syncDiversityData(connection.system, dateRange);
    const training = await connection.connector.syncTrainingData(connection.system, dateRange);
    const benefits = await connection.connector.syncBenefitsData(connection.system, dateRange);
    
    return {
      success: true,
      data: { employee, diversity, training, benefits },
      lastSync: new Date().toISOString()
    };
  }

  static scheduleSync(systemKey, interval = 3600000) { // Default 1 hour
    if (this.syncSchedules.has(systemKey)) {
      clearInterval(this.syncSchedules.get(systemKey));
    }
    
    const intervalId = setInterval(async () => {
      const connection = this.connectedSystems.get(systemKey);
      if (connection) {
        try {
          await this.syncSingleSystem(systemKey, connection);
        } catch (error) {
          console.error(`Scheduled sync failed for ${systemKey}:`, error);
        }
      }
    }, interval);
    
    this.syncSchedules.set(systemKey, intervalId);
    return intervalId;
  }

  static async syncSingleSystem(key, connection) {
    switch (connection.type) {
      case 'erp':
        return await this.syncERPData(connection, {});
      case 'iot':
        return await this.syncIoTData(connection);
      case 'hrms':
        return await this.syncHRMSData(connection, {});
      default:
        throw new Error('Unknown connection type');
    }
  }

  static getConnectionStatus() {
    const status = {};
    
    for (const [key, connection] of this.connectedSystems.entries()) {
      status[key] = {
        type: connection.type,
        system: connection.system || 'default',
        connected: true,
        lastSync: connection.lastSync || null,
        scheduled: this.syncSchedules.has(key)
      };
    }
    
    return status;
  }

  static disconnectSystem(systemKey) {
    if (this.syncSchedules.has(systemKey)) {
      clearInterval(this.syncSchedules.get(systemKey));
      this.syncSchedules.delete(systemKey);
    }
    
    return this.connectedSystems.delete(systemKey);
  }

  static async testAllConnections() {
    const results = {};
    
    for (const [key, connection] of this.connectedSystems.entries()) {
      try {
        let testResult;
        
        switch (connection.type) {
          case 'erp':
            testResult = await connection.connector.testConnection(connection.system);
            break;
          case 'iot':
            testResult = true; // IoT connections are typically always available
            break;
          case 'hrms':
            testResult = await connection.connector.connectToHRMS(connection.system, {});
            testResult = testResult.success;
            break;
          default:
            testResult = false;
        }
        
        results[key] = { success: testResult };
      } catch (error) {
        results[key] = { success: false, error: error.message };
      }
    }
    
    return results;
  }
}

export default IntegrationManager;