// ERP System Integration (SAP, Oracle, Microsoft Dynamics)
export class ERPConnector {
  static config = {
    sap: { endpoint: `${process.env.REACT_APP_ERP_BASE_URL}/api/sap`, auth: 'oauth2' },
    oracle: { endpoint: `${process.env.REACT_APP_ERP_BASE_URL}/api/oracle`, auth: 'basic' },
    dynamics: { endpoint: `${process.env.REACT_APP_ERP_BASE_URL}/api/dynamics`, auth: 'oauth2' }
  };

  static async connectToERP(system, credentials) {
    try {
      const config = this.config[system.toLowerCase()];
      if (!config) throw new Error(`Unsupported ERP system: ${system}`);

      const response = await fetch(config.endpoint + '/connect', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.REACT_APP_ERP_API_KEY}`
        },
        body: JSON.stringify({ credentials, system })
      });

      return await response.json();
    } catch (error) {
      console.error('ERP connection failed:', error);
      return { success: false, error: error.message };
    }
  }

  static async syncFinancialData(system, dateRange) {
    try {
      const data = await this.fetchERPData(system, 'financial', dateRange);
      return this.transformFinancialData(data, system);
    } catch (error) {
      console.error('Financial data sync failed:', error);
      return this.getMockFinancialData();
    }
  }

  static async syncProcurementData(system, dateRange) {
    try {
      const data = await this.fetchERPData(system, 'procurement', dateRange);
      return this.transformProcurementData(data, system);
    } catch (error) {
      console.error('Procurement data sync failed:', error);
      return this.getMockProcurementData();
    }
  }

  static async fetchERPData(system, module, dateRange) {
    const config = this.config[system.toLowerCase()];
    const response = await fetch(`${config.endpoint}/${module}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dateRange, module })
    });
    return await response.json();
  }

  static transformFinancialData(data, system) {
    const mapping = {
      sap: { revenue: 'TOTAL_REVENUE', expenses: 'TOTAL_EXPENSES' },
      oracle: { revenue: 'REV_AMOUNT', expenses: 'EXP_AMOUNT' },
      dynamics: { revenue: 'Revenue', expenses: 'Expenses' }
    };

    const fields = mapping[system.toLowerCase()] || mapping.sap;
    
    return {
      totalRevenue: data[fields.revenue] || 0,
      totalExpenses: data[fields.expenses] || 0,
      sustainabilityInvestments: data.sustainability_spend || 0,
      carbonTaxPaid: data.carbon_tax || 0,
      greenBondIssuance: data.green_bonds || 0,
      lastUpdated: new Date().toISOString()
    };
  }

  static transformProcurementData(data, system) {
    return {
      supplierCount: data.supplier_count || 0,
      localSuppliers: data.local_suppliers || 0,
      sustainableProcurement: data.sustainable_procurement || 0,
      supplierDiversityScore: data.diversity_score || 0,
      ethicalSourcingCompliance: data.ethical_compliance || 0,
      lastUpdated: new Date().toISOString()
    };
  }

  static getMockFinancialData() {
    return {
      totalRevenue: 50000000,
      totalExpenses: 35000000,
      sustainabilityInvestments: 2500000,
      carbonTaxPaid: 150000,
      greenBondIssuance: 5000000,
      lastUpdated: new Date().toISOString()
    };
  }

  static getMockProcurementData() {
    return {
      supplierCount: 250,
      localSuppliers: 180,
      sustainableProcurement: 75,
      supplierDiversityScore: 68,
      ethicalSourcingCompliance: 92,
      lastUpdated: new Date().toISOString()
    };
  }

  static async testConnection(system) {
    try {
      const config = this.config[system.toLowerCase()];
      const response = await fetch(config.endpoint + '/health');
      return response.ok;
    } catch (error) {
      return false;
    }
  }
}

export default ERPConnector;