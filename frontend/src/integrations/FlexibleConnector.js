// Flexible Universal Connector
import { IntegrationConfig } from './IntegrationConfig';
import { DataSourceAdapter } from './DataSourceAdapter';

export class FlexibleConnector {
  constructor(type, config = {}) {
    this.type = type;
    this.config = { ...IntegrationConfig.getConfig(), ...config };
    this.cache = new Map();
    this.retryCount = 0;
  }

  async fetchData(dataType, options = {}) {
    const cacheKey = `${this.type}_${dataType}_${JSON.stringify(options)}`;
    
    // Check cache first
    if (options.useCache !== false && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < (options.cacheTimeout || 300000)) {
        return cached.data;
      }
    }

    try {
      // Try primary data source
      const data = await this.tryDataSource(
        this.config.dataSources.primary,
        dataType,
        options
      );
      
      // Cache successful result
      this.cache.set(cacheKey, {
        data,
        timestamp: Date.now()
      });
      
      this.retryCount = 0;
      return data;
      
    } catch (error) {
      console.warn(`Primary source failed for ${this.type}:`, error.message);
      
      // Try fallback data source
      try {
        const fallbackData = await this.tryDataSource(
          this.config.dataSources.fallback,
          dataType,
          options
        );
        
        return fallbackData;
        
      } catch (fallbackError) {
        console.error(`All data sources failed for ${this.type}:`, fallbackError.message);
        throw new Error(`Data fetch failed: ${error.message}`);
      }
    }
  }

  async tryDataSource(source, dataType, options) {
    const sourceConfig = this.buildSourceConfig(source, dataType, options);
    return await DataSourceAdapter.fetchData(source, sourceConfig);
  }

  buildSourceConfig(source, dataType, options) {
    const configs = {
      api: () => ({
        endpoint: `${this.config.endpoints.base}/${this.type}/${dataType}`,
        method: options.method || 'POST',
        body: options.filters || {},
        timeout: this.config.endpoints.timeout,
        headers: options.headers || {}
      }),
      
      mock: () => ({
        mockData: this.getMockData(dataType, options),
        delay: options.mockDelay || 500
      }),
      
      localStorage: () => ({
        key: `${this.type}_${dataType}`,
        defaultValue: this.getMockData(dataType, options)
      }),
      
      file: () => ({
        file: options.file,
        parser: options.parser
      })
    };

    const configBuilder = configs[source];
    if (!configBuilder) {
      throw new Error(`No configuration builder for source: ${source}`);
    }

    return configBuilder();
  }

  getMockData(dataType, options = {}) {
    const mockGenerators = {
      financial: () => ({
        totalRevenue: this.randomValue(10000000, 100000000),
        totalExpenses: this.randomValue(5000000, 80000000),
        sustainabilityInvestments: this.randomValue(500000, 5000000),
        carbonTaxPaid: this.randomValue(50000, 500000),
        lastUpdated: new Date().toISOString()
      }),
      
      environmental: () => ({
        totalConsumption: this.randomValue(10000, 50000),
        carbonFootprint: this.randomValue(3000, 15000),
        waterUsage: this.randomValue(1000, 10000),
        wasteGenerated: this.randomValue(500, 5000),
        lastUpdated: new Date().toISOString()
      }),
      
      social: () => ({
        totalEmployees: this.randomValue(100, 5000),
        turnoverRate: this.randomValue(5, 25),
        diversityScore: this.randomValue(40, 95),
        trainingHours: this.randomValue(1000, 20000),
        lastUpdated: new Date().toISOString()
      }),
      
      governance: () => ({
        boardSize: this.randomValue(5, 15),
        independentDirectors: this.randomValue(30, 80),
        complianceScore: this.randomValue(70, 100),
        auditScore: this.randomValue(80, 100),
        lastUpdated: new Date().toISOString()
      })
    };

    const generator = mockGenerators[dataType] || (() => ({}));
    return generator();
  }

  randomValue(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // Data transformation methods
  transformData(data, transformConfig = {}) {
    if (!transformConfig.mappings) return data;

    const transformed = {};
    
    Object.entries(transformConfig.mappings).forEach(([targetField, sourceField]) => {
      if (typeof sourceField === 'string') {
        transformed[targetField] = this.getNestedValue(data, sourceField);
      } else if (typeof sourceField === 'function') {
        transformed[targetField] = sourceField(data);
      }
    });

    return { ...data, ...transformed };
  }

  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  // Validation methods
  validateData(data, schema = {}) {
    const errors = [];
    
    Object.entries(schema).forEach(([field, rules]) => {
      const value = data[field];
      
      if (rules.required && (value === undefined || value === null)) {
        errors.push(`${field} is required`);
      }
      
      if (rules.type && value !== undefined && typeof value !== rules.type) {
        errors.push(`${field} must be of type ${rules.type}`);
      }
      
      if (rules.min !== undefined && value < rules.min) {
        errors.push(`${field} must be at least ${rules.min}`);
      }
      
      if (rules.max !== undefined && value > rules.max) {
        errors.push(`${field} must be at most ${rules.max}`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Caching methods
  clearCache(pattern = null) {
    if (!pattern) {
      this.cache.clear();
      return;
    }
    
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  getCacheStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

export default FlexibleConnector;