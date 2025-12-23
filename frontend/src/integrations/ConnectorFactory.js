// Dynamic Connector Factory
import { FlexibleConnector } from './FlexibleConnector';
import { IntegrationConfig } from './IntegrationConfig';

export class ConnectorFactory {
  static connectorTypes = new Map();
  static instances = new Map();

  static registerConnectorType(type, connectorClass) {
    this.connectorTypes.set(type, connectorClass);
  }

  static createConnector(type, config = {}) {
    const instanceKey = `${type}_${JSON.stringify(config)}`;
    
    // Return existing instance if available
    if (this.instances.has(instanceKey)) {
      return this.instances.get(instanceKey);
    }

    // Create new connector instance
    let connector;
    
    if (this.connectorTypes.has(type)) {
      const ConnectorClass = this.connectorTypes.get(type);
      connector = new ConnectorClass(config);
    } else {
      // Use flexible connector as default
      connector = new FlexibleConnector(type, config);
    }

    this.instances.set(instanceKey, connector);
    return connector;
  }

  static getConnector(type, config = {}) {
    const instanceKey = `${type}_${JSON.stringify(config)}`;
    return this.instances.get(instanceKey);
  }

  static removeConnector(type, config = {}) {
    const instanceKey = `${type}_${JSON.stringify(config)}`;
    return this.instances.delete(instanceKey);
  }

  static listConnectors() {
    return Array.from(this.instances.keys());
  }

  static clearAll() {
    this.instances.clear();
  }

  // Predefined connector configurations
  static createERPConnector(system, credentials = {}) {
    return this.createConnector('erp', {
      system,
      credentials,
      endpoints: {
        financial: `/erp/${system}/financial`,
        procurement: `/erp/${system}/procurement`
      },
      transformations: {
        financial: {
          mappings: {
            revenue: 'total_revenue',
            expenses: 'total_expenses',
            sustainability: 'sustainability_spend'
          }
        }
      }
    });
  }

  static createIoTConnector(platform, sensorConfig = {}) {
    return this.createConnector('iot', {
      platform,
      sensorConfig,
      endpoints: {
        sensors: `/iot/${platform}/sensors`,
        data: `/iot/${platform}/data`
      },
      realTime: true,
      bufferSize: 1000
    });
  }

  static createHRMSConnector(system, credentials = {}) {
    return this.createConnector('hrms', {
      system,
      credentials,
      endpoints: {
        employees: `/hrms/${system}/employees`,
        diversity: `/hrms/${system}/diversity`,
        training: `/hrms/${system}/training`
      },
      syncInterval: 3600000 // 1 hour
    });
  }

  static createUtilityConnector(provider, config = {}) {
    return this.createConnector('utility', {
      provider,
      config,
      supportedFormats: ['pdf', 'csv', 'xml', 'json'],
      autoProcess: true
    });
  }
}

// Register default connector types
ConnectorFactory.registerConnectorType('flexible', FlexibleConnector);

export default ConnectorFactory;