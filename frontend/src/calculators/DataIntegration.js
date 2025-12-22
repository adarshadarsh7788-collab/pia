// Data Integration Utility for Calculator-DataEntry Connection
export class DataIntegration {
  static getESGData() {
    try {
      const esgData = JSON.parse(localStorage.getItem('esgData') || '[]');
      return esgData;
    } catch (error) {
      console.error('Failed to fetch ESG data:', error);
      return [];
    }
  }

  static transformForCarbonCalculator(esgData) {
    const allData = esgData;
    
    return {
      scope1: {
        naturalGas: this.findMetricValue(allData, 'naturalgas') || this.findMetricValue(allData, 'gas') || 0,
        diesel: this.findMetricValue(allData, 'diesel') || this.findMetricValue(allData, 'fuel') || 0,
        gasoline: this.findMetricValue(allData, 'gasoline') || this.findMetricValue(allData, 'petrol') || 0,
        coal: this.findMetricValue(allData, 'coal') || 0
      },
      scope2: {
        gridElectricity: this.findMetricValue(allData, 'energy') || this.findMetricValue(allData, 'electricity') || 0,
        renewableElectricity: this.findMetricValue(allData, 'renewable') || 0
      },
      scope3: {
        transport: {
          car: this.findMetricValue(allData, 'transport') || this.findMetricValue(allData, 'vehicle') || 0,
          plane: this.findMetricValue(allData, 'travel') || this.findMetricValue(allData, 'flight') || 0
        },
        supplyChainEmissions: this.findMetricValue(allData, 'supply') || this.findMetricValue(allData, 'chain') || 0,
        wasteDisposal: this.findMetricValue(allData, 'waste') || 0
      }
    };
  }

  static transformForWaterCalculator(esgData) {
    const environmentalData = esgData.filter(item => item.category === 'environmental');
    const companyInfo = esgData.find(item => item.companyName) || {};
    
    return {
      consumption: {
        totalAnnual: this.findMetricValue(environmentalData, 'waterUsage') || 0,
        recycled: this.findMetricValue(environmentalData, 'waterRecycled') || 0,
        rainwater: this.findMetricValue(environmentalData, 'rainwaterHarvested') || 0,
        revenue: this.findMetricValue(esgData, 'totalRevenue') || 10000000
      },
      location: {
        region: companyInfo.region || 'North America',
        country: companyInfo.country || 'United States',
        climate: 'temperate'
      },
      quality: {
        ph: 7.2,
        tds: 250,
        turbidity: 0.8,
        chlorine: 0.6,
        hardness: 120
      },
      efficiency: {
        recyclingRate: this.calculateRecyclingRate(environmentalData),
        leakageRate: 10,
        conservationMeasures: 60,
        technologyScore: 70,
        industry: companyInfo.sector || 'general'
      }
    };
  }

  static transformForROICalculator(esgData) {
    const allData = esgData;
    const companyInfo = esgData.find(item => item.companyName) || {};
    
    return {
      investments: {
        renewableEnergy: this.findMetricValue(allData, 'renewableEnergyInvestment') || 0,
        energyEfficiency: this.findMetricValue(allData, 'energyEfficiencyInvestment') || 0,
        employeeTraining: this.findMetricValue(allData, 'trainingInvestment') || 0,
        healthSafety: this.findMetricValue(allData, 'healthSafetyInvestment') || 0,
        complianceSystem: this.findMetricValue(allData, 'complianceInvestment') || 0
      },
      benefits: {
        costSavings: {
          energyReduction: this.calculateEnergySavings(allData),
          waterReduction: this.calculateWaterSavings(allData),
          operationalEfficiency: this.findMetricValue(allData, 'operationalSavings') || 0,
          turnoverReduction: this.calculateTurnoverReduction(allData),
          avgRecruitmentCost: 15000
        },
        revenueGains: {
          greenProductRevenue: this.findMetricValue(allData, 'greenRevenue') || 0,
          sustainabilityPremium: this.findMetricValue(allData, 'sustainabilityPremium') || 0,
          customerRetentionImprovement: 5,
          avgCustomerValue: 2000
        }
      },
      timeframe: 5
    };
  }

  static transformForIntensityCalculator(esgData) {
    const environmentalData = esgData.filter(item => item.category === 'environmental');
    const socialData = esgData.filter(item => item.category === 'social');
    const companyInfo = esgData.find(item => item.companyName) || {};
    
    return {
      emissions: {
        scope1: this.calculateScope1FromData(environmentalData),
        scope2: this.calculateScope2FromData(environmentalData),
        scope3: this.calculateScope3FromData(environmentalData)
      },
      businessMetrics: {
        revenue: this.findMetricValue(esgData, 'totalRevenue') || 10000000,
        employees: this.findMetricValue(socialData, 'totalEmployees') || 250,
        production: this.findMetricValue(environmentalData, 'productionVolume') || 50000,
        floorArea: this.findMetricValue(environmentalData, 'facilityArea') || 10000,
        energyConsumption: this.findMetricValue(environmentalData, 'energyConsumption') || 100000
      },
      industry: companyInfo.sector || 'manufacturing',
      targets: {
        revenue: { value: 0.2, timeline: 5 },
        employee: { value: 6000, timeline: 3 }
      }
    };
  }

  static findMetricValue(data, metricName) {
    for (const item of data) {
      // Fuzzy matching - check if metric name contains the search term
      const searchTerm = metricName.toLowerCase().replace(/[_\s]/g, '');
      
      // Direct metric match with fuzzy search
      if (item.metric && item.metric.toLowerCase().replace(/[_\s]/g, '').includes(searchTerm) && item.value !== undefined) {
        return parseFloat(item.value) || 0;
      }
      
      // Search all properties with fuzzy matching
      for (const [key, value] of Object.entries(item)) {
        if (key.toLowerCase().replace(/[_\s]/g, '').includes(searchTerm) && value !== undefined && !isNaN(value)) {
          return parseFloat(value) || 0;
        }
      }
      
      // Deep search in nested objects
      ['environmental', 'social', 'governance'].forEach(category => {
        if (item[category] && typeof item[category] === 'object') {
          for (const [key, value] of Object.entries(item[category])) {
            if (key.toLowerCase().replace(/[_\s]/g, '').includes(searchTerm) && value !== undefined && !isNaN(value)) {
              return parseFloat(value) || 0;
            }
          }
        }
      });
    }
    
    return 0;
  }

  static calculateScope1FromData(environmentalData) {
    const naturalGas = this.findMetricValue(environmentalData, 'naturalGas') || 0;
    const diesel = this.findMetricValue(environmentalData, 'diesel') || 0;
    return (naturalGas * 2.0) + (diesel * 2.68); // Emission factors
  }

  static calculateScope2FromData(environmentalData) {
    const electricity = this.findMetricValue(environmentalData, 'energyConsumption') || 0;
    return electricity * 0.4; // Grid emission factor
  }

  static calculateScope3FromData(environmentalData) {
    const transport = this.findMetricValue(environmentalData, 'transportEmissions') || 0;
    const waste = this.findMetricValue(environmentalData, 'wasteGenerated') || 0;
    return transport + (waste * 0.5);
  }

  static calculateRecyclingRate(environmentalData) {
    const waterUsage = this.findMetricValue(environmentalData, 'waterUsage') || 0;
    const waterRecycled = this.findMetricValue(environmentalData, 'waterRecycled') || 0;
    return waterUsage > 0 ? (waterRecycled / waterUsage) * 100 : 0;
  }

  static calculateEnergySavings(allData) {
    const energyEfficiency = this.findMetricValue(allData, 'energyEfficiencyGain') || 0;
    const energyCost = 0.12; // per kWh
    return energyEfficiency * energyCost;
  }

  static calculateWaterSavings(allData) {
    const waterSavings = this.findMetricValue(allData, 'waterSavings') || 0;
    const waterCost = 0.003; // per gallon
    return waterSavings * waterCost;
  }

  static calculateTurnoverReduction(allData) {
    const currentTurnover = this.findMetricValue(allData, 'employeeTurnover') || 15;
    const targetTurnover = 10;
    return Math.max(0, currentTurnover - targetTurnover);
  }

  static getCalculatorData(calculatorType) {
    const esgData = this.getESGData();
    
    if (esgData.length === 0) {
      return null;
    }

    // Auto-detect data structure and transform accordingly
    const transformedData = this.autoTransformData(esgData, calculatorType);
    
    switch (calculatorType) {
      case 'carbon':
        return { ...this.transformForCarbonCalculator(esgData), ...transformedData };
      case 'water':
        return { ...this.transformForWaterCalculator(esgData), ...transformedData };
      case 'roi':
        return { ...this.transformForROICalculator(esgData), ...transformedData };
      case 'intensity':
        return { ...this.transformForIntensityCalculator(esgData), ...transformedData };
      default:
        return transformedData;
    }
  }

  static getDataSummary() {
    const esgData = this.getESGData();
    
    return {
      totalEntries: esgData.length,
      categories: {
        environmental: esgData.filter(item => item.category === 'environmental').length,
        social: esgData.filter(item => item.category === 'social').length,
        governance: esgData.filter(item => item.category === 'governance').length
      },
      companies: [...new Set(esgData.map(item => item.companyName).filter(Boolean))],
      lastUpdated: esgData.length > 0 ? Math.max(...esgData.map(item => new Date(item.timestamp || 0).getTime())) : null
    };
  }

  static validateDataForCalculator(calculatorType) {
    const data = this.getCalculatorData(calculatorType);
    
    if (!data) {
      return {
        isValid: false,
        message: 'No ESG data available. Please add data through Data Entry first.',
        missingFields: ['All data fields']
      };
    }

    const validationRules = {
      carbon: ['scope1', 'scope2'],
      water: ['consumption.totalAnnual'],
      roi: ['investments', 'benefits'],
      intensity: ['emissions', 'businessMetrics.revenue']
    };

    const requiredFields = validationRules[calculatorType] || [];
    const missingFields = [];

    requiredFields.forEach(field => {
      const fieldValue = this.getNestedValue(data, field);
      if (!fieldValue || (typeof fieldValue === 'object' && Object.values(fieldValue).every(v => v === 0))) {
        missingFields.push(field);
      }
    });

    return {
      isValid: missingFields.length === 0,
      message: missingFields.length === 0 ? 'Data is valid for calculation' : 'Some required data is missing',
      missingFields
    };
  }

  static getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  static autoTransformData(esgData, calculatorType) {
    const result = {};
    
    // Auto-detect and extract all numeric values
    esgData.forEach(item => {
      Object.entries(item).forEach(([key, value]) => {
        if (!isNaN(value) && value !== null && value !== '') {
          result[key] = parseFloat(value);
        }
        
        // Handle nested objects
        if (typeof value === 'object' && value !== null) {
          Object.entries(value).forEach(([nestedKey, nestedValue]) => {
            if (!isNaN(nestedValue) && nestedValue !== null && nestedValue !== '') {
              result[`${key}_${nestedKey}`] = parseFloat(nestedValue);
              result[nestedKey] = parseFloat(nestedValue);
            }
          });
        }
      });
    });
    
    return result;
  }
}

export default DataIntegration;