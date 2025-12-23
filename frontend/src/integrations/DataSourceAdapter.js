// Flexible Data Source Adapter
export class DataSourceAdapter {
  static async fetchData(source, config) {
    const adapters = {
      api: this.fetchFromAPI,
      mock: this.fetchFromMock,
      localStorage: this.fetchFromLocalStorage,
      file: this.fetchFromFile,
      database: this.fetchFromDatabase
    };

    const adapter = adapters[source];
    if (!adapter) throw new Error(`Unsupported data source: ${source}`);

    return await adapter(config);
  }

  static async fetchFromAPI(config) {
    const { endpoint, method = 'GET', headers = {}, body, timeout = 30000 } = config;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json', ...headers },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  static async fetchFromMock(config) {
    const { mockData, delay = 500 } = config;
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, delay));
    
    if (typeof mockData === 'function') {
      return mockData();
    }
    
    return mockData;
  }

  static async fetchFromLocalStorage(config) {
    const { key, defaultValue = null } = config;
    
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultValue;
    } catch (error) {
      console.warn('LocalStorage fetch failed:', error);
      return defaultValue;
    }
  }

  static async fetchFromFile(config) {
    const { file, parser } = config;
    
    if (!file) throw new Error('File is required for file data source');
    
    const text = await file.text();
    
    if (parser) {
      return parser(text);
    }
    
    // Auto-detect file type and parse
    const extension = file.name.split('.').pop().toLowerCase();
    
    switch (extension) {
      case 'json':
        return JSON.parse(text);
      case 'csv':
        return this.parseCSV(text);
      case 'xml':
        return this.parseXML(text);
      default:
        return text;
    }
  }

  static async fetchFromDatabase(config) {
    const { query, connection } = config;
    
    // Placeholder for database integration
    // In real implementation, would use database drivers
    throw new Error('Database integration not implemented');
  }

  static parseCSV(text) {
    const lines = text.split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    
    return lines.slice(1).map(line => {
      const values = line.split(',');
      const row = {};
      headers.forEach((header, index) => {
        row[header] = values[index]?.trim();
      });
      return row;
    }).filter(row => Object.values(row).some(v => v));
  }

  static parseXML(text) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(text, 'text/xml');
    return this.xmlToJson(xmlDoc);
  }

  static xmlToJson(xml) {
    const result = {};
    
    if (xml.nodeType === 1) {
      if (xml.attributes.length > 0) {
        result['@attributes'] = {};
        for (let i = 0; i < xml.attributes.length; i++) {
          const attribute = xml.attributes.item(i);
          result['@attributes'][attribute.nodeName] = attribute.nodeValue;
        }
      }
    } else if (xml.nodeType === 3) {
      result = xml.nodeValue;
    }

    if (xml.hasChildNodes()) {
      for (let i = 0; i < xml.childNodes.length; i++) {
        const item = xml.childNodes.item(i);
        const nodeName = item.nodeName;
        
        if (typeof result[nodeName] === 'undefined') {
          result[nodeName] = this.xmlToJson(item);
        } else {
          if (typeof result[nodeName].push === 'undefined') {
            const old = result[nodeName];
            result[nodeName] = [];
            result[nodeName].push(old);
          }
          result[nodeName].push(this.xmlToJson(item));
        }
      }
    }
    
    return result;
  }
}

export default DataSourceAdapter;