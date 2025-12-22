// Flexible Integration Configuration Manager
export class IntegrationConfig {
  static config = {
    dataSources: {
      primary: 'api',     // 'api', 'mock', 'localStorage', 'file'
      fallback: 'mock'
    },
    endpoints: {
      base: process.env.REACT_APP_API_BASE || 'http://localhost:8080/api',
      timeout: 30000,
      retries: 3
    },
    connectors: new Map(),
    adapters: new Map()
  };

  static setDataSource(primary, fallback = 'mock') {
    this.config.dataSources.primary = primary;
    this.config.dataSources.fallback = fallback;
  }

  static setEndpoint(baseUrl, timeout = 30000) {
    this.config.endpoints.base = baseUrl;
    this.config.endpoints.timeout = timeout;
  }

  static registerConnector(type, connector) {
    this.config.connectors.set(type, connector);
  }

  static registerAdapter(system, adapter) {
    this.config.adapters.set(system, adapter);
  }

  static getConnector(type) {
    return this.config.connectors.get(type);
  }

  static getAdapter(system) {
    return this.config.adapters.get(system);
  }

  static getConfig() {
    return { ...this.config };
  }
}

export default IntegrationConfig;