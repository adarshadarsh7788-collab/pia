// Framework-Specific Report Generators Index
export { BRSRReportGenerator } from './BRSRReportGenerator';
export { GRIReportGenerator } from './GRIReportGenerator';
export { SASBReportGenerator } from './SASBReportGenerator';
export { TCFDReportGenerator } from './TCFDReportGenerator';

// Unified report generator interface
export class FrameworkReportManager {
  static getAvailableFrameworks() {
    return [
      { id: 'BRSR', name: 'SEBI BRSR', description: 'Business Responsibility and Sustainability Reporting' },
      { id: 'GRI', name: 'GRI Standards', description: 'Global Reporting Initiative Standards' },
      { id: 'SASB', name: 'SASB Standards', description: 'Sustainability Accounting Standards Board' },
      { id: 'TCFD', name: 'TCFD Framework', description: 'Task Force on Climate-related Financial Disclosures' }
    ];
  }

  static generateReport(frameworkId, data, options = {}) {
    const generators = {
      BRSR: () => import('./BRSRReportGenerator').then(m => m.BRSRReportGenerator.generateReport(data, options)),
      GRI: () => import('./GRIReportGenerator').then(m => m.GRIReportGenerator.generateReport(data, options)),
      SASB: () => import('./SASBReportGenerator').then(m => m.SASBReportGenerator.generateReport(data, options)),
      TCFD: () => import('./TCFDReportGenerator').then(m => m.TCFDReportGenerator.generateReport(data, options))
    };

    const generator = generators[frameworkId];
    if (!generator) {
      throw new Error(`Unknown framework: ${frameworkId}`);
    }

    return generator();
  }

  static validateDataForFramework(frameworkId, data) {
    const validationRules = {
      BRSR: {
        required: ['companyName'],
        recommended: ['environmental.scope1_emissions', 'social.total_employees', 'governance.board_size']
      },
      GRI: {
        required: ['companyName'],
        recommended: ['environmental.scope1_emissions', 'environmental.scope2_emissions', 'social.total_employees']
      },
      SASB: {
        required: ['companyName', 'industry'],
        recommended: ['environmental.energy_consumption', 'governance.data_breaches']
      },
      TCFD: {
        required: ['companyName'],
        recommended: ['environmental.scope1_emissions', 'environmental.scope2_emissions', 'environmental.scope3_emissions']
      }
    };

    const rules = validationRules[frameworkId];
    if (!rules) return { isValid: false, errors: ['Unknown framework'] };

    const errors = [];
    const warnings = [];

    // Check required fields
    rules.required.forEach(field => {
      if (!this.getNestedValue(data, field)) {
        errors.push(`Missing required field: ${field}`);
      }
    });

    // Check recommended fields
    rules.recommended.forEach(field => {
      if (!this.getNestedValue(data, field)) {
        warnings.push(`Missing recommended field: ${field}`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      completeness: Math.round(((rules.required.length + rules.recommended.length - errors.length - warnings.length) / (rules.required.length + rules.recommended.length)) * 100)
    };
  }

  static getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }
}

export default FrameworkReportManager;