import ModuleAPI from '../../services/moduleAPI.js';

// Advanced Waste Management Module
export class WasteManagement {
  static wasteTypes = {
    hazardous: ['chemical', 'medical', 'electronic', 'radioactive'],
    nonHazardous: ['organic', 'plastic', 'paper', 'metal', 'glass']
  };

  static disposalMethods = ['landfill', 'incineration', 'recycling', 'composting', 'reuse'];

  static async calculateWasteMetrics(wasteData, companyId) {
    try {
      // Save data to database if provided
      if (wasteData && companyId) {
        await ModuleAPI.saveWasteData(companyId, wasteData);
      }
      
      // Get real data from database
      const dbResponse = await ModuleAPI.getWasteData(companyId);
      const realData = dbResponse.success ? dbResponse.data : [];
      
      const totalWaste = this.calculateTotalWaste(realData);
      const recyclingRate = this.calculateRecyclingRate(realData);
      const wasteIntensity = this.calculateWasteIntensity(realData);
      const vendorCompliance = this.assessVendorCompliance(realData);

      return {
        totalWaste,
        recyclingRate,
        wasteIntensity,
        vendorCompliance,
        wasteByType: this.categorizeWaste(realData),
        disposalBreakdown: this.analyzeDisposalMethods(realData),
        complianceStatus: this.checkCompliance(realData)
      };
    } catch (error) {
      console.error('Waste calculation failed:', error);
      return this.getDefaultWasteMetrics();
    }
  }

  static calculateTotalWaste(data) {
    const hazardous = this.sumWasteByCategory(data, 'hazardous');
    const nonHazardous = this.sumWasteByCategory(data, 'nonHazardous');
    return { hazardous, nonHazardous, total: hazardous + nonHazardous };
  }

  static sumWasteByCategory(data, category) {
    return this.wasteTypes[category].reduce((sum, type) => {
      return sum + (data[type] || 0);
    }, 0);
  }

  static calculateRecyclingRate(data) {
    const totalWaste = this.calculateTotalWaste(data).total;
    const recycled = data.recycled || 0;
    const reused = data.reused || 0;
    return totalWaste > 0 ? ((recycled + reused) / totalWaste) * 100 : 0;
  }

  static calculateWasteIntensity(data) {
    const totalWaste = this.calculateTotalWaste(data).total;
    const revenue = data.revenue || 1;
    const production = data.production || 1;
    return {
      perRevenue: totalWaste / revenue,
      perProduction: totalWaste / production
    };
  }

  static assessVendorCompliance(data) {
    const vendors = data.vendors || [];
    const compliant = vendors.filter(v => v.certified && v.auditPassed).length;
    return vendors.length > 0 ? (compliant / vendors.length) * 100 : 0;
  }

  static categorizeWaste(data) {
    const result = {};
    Object.entries(this.wasteTypes).forEach(([category, types]) => {
      result[category] = {};
      types.forEach(type => {
        result[category][type] = data[type] || 0;
      });
    });
    return result;
  }

  static analyzeDisposalMethods(data) {
    const breakdown = {};
    this.disposalMethods.forEach(method => {
      breakdown[method] = data[method] || 0;
    });
    return breakdown;
  }

  static checkCompliance(data) {
    const issues = [];
    if (data.hazardousWaste > 0 && !data.hazardousLicense) {
      issues.push('Missing hazardous waste license');
    }
    if (this.calculateRecyclingRate(data) < 30) {
      issues.push('Recycling rate below 30% threshold');
    }
    return { compliant: issues.length === 0, issues };
  }

  static getDefaultWasteMetrics() {
    return {
      totalWaste: { hazardous: 0, nonHazardous: 0, total: 0 },
      recyclingRate: 0,
      wasteIntensity: { perRevenue: 0, perProduction: 0 },
      vendorCompliance: 0,
      wasteByType: {},
      disposalBreakdown: {},
      complianceStatus: { compliant: false, issues: ['No data available'] }
    };
  }
}

export default WasteManagement;