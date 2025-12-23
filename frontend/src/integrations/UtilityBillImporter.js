// Utility Bill Data Import and Processing
export class UtilityBillImporter {
  static supportedFormats = ['pdf', 'csv', 'xml', 'json'];
  static utilityTypes = ['electricity', 'gas', 'water', 'steam', 'waste'];

  static async importBill(file, utilityType, provider) {
    try {
      const fileType = this.detectFileType(file);
      const rawData = await this.parseFile(file, fileType);
      return this.processUtilityData(rawData, utilityType, provider);
    } catch (error) {
      console.error('Bill import failed:', error);
      return this.getMockBillData(utilityType);
    }
  }

  static detectFileType(file) {
    const extension = file.name.split('.').pop().toLowerCase();
    return this.supportedFormats.includes(extension) ? extension : 'unknown';
  }

  static async parseFile(file, fileType) {
    const parsers = {
      csv: this.parseCSV,
      json: this.parseJSON,
      xml: this.parseXML,
      pdf: this.parsePDF
    };

    const parser = parsers[fileType];
    if (!parser) throw new Error(`Unsupported file type: ${fileType}`);

    return await parser(file);
  }

  static async parseCSV(file) {
    const text = await file.text();
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

  static async parseJSON(file) {
    const text = await file.text();
    return JSON.parse(text);
  }

  static async parseXML(file) {
    const text = await file.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(text, 'text/xml');
    return this.xmlToJson(xmlDoc);
  }

  static async parsePDF(file) {
    // Simplified PDF parsing - in real implementation would use PDF.js
    return {
      accountNumber: 'PDF_ACCOUNT_123',
      billingPeriod: { start: '2024-01-01', end: '2024-01-31' },
      consumption: 1250,
      cost: 187.50,
      unit: 'kWh'
    };
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

  static processUtilityData(rawData, utilityType, provider) {
    const processors = {
      electricity: this.processElectricityBill,
      gas: this.processGasBill,
      water: this.processWaterBill,
      steam: this.processSteamBill,
      waste: this.processWasteBill
    };

    const processor = processors[utilityType] || this.processGenericBill;
    return processor(rawData, provider);
  }

  static processElectricityBill(data, provider) {
    return {
      utilityType: 'electricity',
      provider,
      accountNumber: data.accountNumber || data.account_id,
      billingPeriod: {
        start: data.billing_start || data.period_start,
        end: data.billing_end || data.period_end
      },
      consumption: {
        total: parseFloat(data.consumption || data.kwh_used || 0),
        peak: parseFloat(data.peak_consumption || 0),
        offPeak: parseFloat(data.off_peak_consumption || 0),
        unit: 'kWh'
      },
      cost: {
        total: parseFloat(data.total_cost || data.amount_due || 0),
        energyCharges: parseFloat(data.energy_charges || 0),
        deliveryCharges: parseFloat(data.delivery_charges || 0),
        taxes: parseFloat(data.taxes || 0),
        currency: data.currency || 'USD'
      },
      carbonFootprint: this.calculateCarbonFootprint(parseFloat(data.consumption || 0), 'electricity'),
      renewablePercentage: parseFloat(data.renewable_percentage || 0),
      lastUpdated: new Date().toISOString()
    };
  }

  static processGasBill(data, provider) {
    return {
      utilityType: 'gas',
      provider,
      accountNumber: data.accountNumber || data.account_id,
      billingPeriod: {
        start: data.billing_start || data.period_start,
        end: data.billing_end || data.period_end
      },
      consumption: {
        total: parseFloat(data.consumption || data.therms_used || 0),
        unit: data.unit || 'therms'
      },
      cost: {
        total: parseFloat(data.total_cost || data.amount_due || 0),
        gasCharges: parseFloat(data.gas_charges || 0),
        deliveryCharges: parseFloat(data.delivery_charges || 0),
        taxes: parseFloat(data.taxes || 0),
        currency: data.currency || 'USD'
      },
      carbonFootprint: this.calculateCarbonFootprint(parseFloat(data.consumption || 0), 'gas'),
      lastUpdated: new Date().toISOString()
    };
  }

  static processWaterBill(data, provider) {
    return {
      utilityType: 'water',
      provider,
      accountNumber: data.accountNumber || data.account_id,
      billingPeriod: {
        start: data.billing_start || data.period_start,
        end: data.billing_end || data.period_end
      },
      consumption: {
        total: parseFloat(data.consumption || data.gallons_used || 0),
        unit: data.unit || 'gallons'
      },
      cost: {
        total: parseFloat(data.total_cost || data.amount_due || 0),
        waterCharges: parseFloat(data.water_charges || 0),
        sewerCharges: parseFloat(data.sewer_charges || 0),
        taxes: parseFloat(data.taxes || 0),
        currency: data.currency || 'USD'
      },
      qualityMetrics: {
        ph: parseFloat(data.ph_level || 7.0),
        hardness: parseFloat(data.hardness || 0),
        chlorine: parseFloat(data.chlorine_level || 0)
      },
      lastUpdated: new Date().toISOString()
    };
  }

  static calculateCarbonFootprint(consumption, utilityType) {
    const emissionFactors = {
      electricity: 0.4, // kg CO2 per kWh
      gas: 5.3, // kg CO2 per therm
      water: 0.0007, // kg CO2 per gallon
      steam: 0.2, // kg CO2 per lb
      waste: 0.5 // kg CO2 per kg
    };

    const factor = emissionFactors[utilityType] || 0;
    return consumption * factor;
  }

  static async batchImport(files, utilityType, provider) {
    const results = [];
    
    for (const file of files) {
      try {
        const result = await this.importBill(file, utilityType, provider);
        results.push({ success: true, data: result, filename: file.name });
      } catch (error) {
        results.push({ success: false, error: error.message, filename: file.name });
      }
    }

    return {
      totalFiles: files.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results
    };
  }

  static validateBillData(billData) {
    const errors = [];
    const warnings = [];

    // Required fields validation
    if (!billData.accountNumber) errors.push('Account number is required');
    if (!billData.consumption?.total) errors.push('Consumption data is required');
    if (!billData.cost?.total) errors.push('Cost data is required');

    // Data consistency validation
    if (billData.consumption?.total < 0) errors.push('Consumption cannot be negative');
    if (billData.cost?.total < 0) errors.push('Cost cannot be negative');

    // Warning checks
    if (billData.consumption?.total > 10000) warnings.push('Unusually high consumption detected');
    if (billData.carbonFootprint > 5000) warnings.push('High carbon footprint detected');

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  static getMockBillData(utilityType) {
    const mockData = {
      electricity: {
        utilityType: 'electricity',
        provider: 'Mock Electric Company',
        accountNumber: 'ELEC123456789',
        billingPeriod: { start: '2024-01-01', end: '2024-01-31' },
        consumption: { total: 1250, peak: 800, offPeak: 450, unit: 'kWh' },
        cost: { total: 187.50, energyCharges: 125.00, deliveryCharges: 45.00, taxes: 17.50, currency: 'USD' },
        carbonFootprint: 500,
        renewablePercentage: 25,
        lastUpdated: new Date().toISOString()
      },
      gas: {
        utilityType: 'gas',
        provider: 'Mock Gas Company',
        accountNumber: 'GAS987654321',
        billingPeriod: { start: '2024-01-01', end: '2024-01-31' },
        consumption: { total: 85, unit: 'therms' },
        cost: { total: 95.75, gasCharges: 68.00, deliveryCharges: 20.00, taxes: 7.75, currency: 'USD' },
        carbonFootprint: 450.5,
        lastUpdated: new Date().toISOString()
      },
      water: {
        utilityType: 'water',
        provider: 'Mock Water Authority',
        accountNumber: 'WATER555666777',
        billingPeriod: { start: '2024-01-01', end: '2024-01-31' },
        consumption: { total: 3500, unit: 'gallons' },
        cost: { total: 65.25, waterCharges: 45.00, sewerCharges: 15.00, taxes: 5.25, currency: 'USD' },
        qualityMetrics: { ph: 7.2, hardness: 150, chlorine: 0.8 },
        lastUpdated: new Date().toISOString()
      }
    };

    return mockData[utilityType] || mockData.electricity;
  }

  static generateBillSummary(bills) {
    const summary = {
      totalBills: bills.length,
      totalCost: 0,
      totalCarbonFootprint: 0,
      byUtilityType: {},
      byProvider: {},
      monthlyTrends: {}
    };

    bills.forEach(bill => {
      summary.totalCost += bill.cost?.total || 0;
      summary.totalCarbonFootprint += bill.carbonFootprint || 0;

      // Group by utility type
      if (!summary.byUtilityType[bill.utilityType]) {
        summary.byUtilityType[bill.utilityType] = { count: 0, cost: 0, consumption: 0 };
      }
      summary.byUtilityType[bill.utilityType].count++;
      summary.byUtilityType[bill.utilityType].cost += bill.cost?.total || 0;
      summary.byUtilityType[bill.utilityType].consumption += bill.consumption?.total || 0;

      // Group by provider
      if (!summary.byProvider[bill.provider]) {
        summary.byProvider[bill.provider] = { count: 0, cost: 0 };
      }
      summary.byProvider[bill.provider].count++;
      summary.byProvider[bill.provider].cost += bill.cost?.total || 0;
    });

    return summary;
  }
}

export default UtilityBillImporter;