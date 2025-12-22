// Global Reporting Frameworks Module
export class GlobalFrameworks {
  static frameworks = ['GRI', 'SASB', 'TCFD', 'BRSR', 'EU_CSRD'];

  static generateFrameworkReports(esgData, selectedFrameworks) {
    try {
      const reports = {};
      selectedFrameworks.forEach(framework => {
        reports[framework] = this.generateFrameworkReport(esgData, framework);
      });
      
      return {
        reports,
        complianceStatus: this.assessFrameworkCompliance(reports),
        gaps: this.identifyReportingGaps(reports)
      };
    } catch (error) {
      return { reports: {}, complianceStatus: {}, gaps: [] };
    }
  }

  static generateFrameworkReport(esgData, framework) {
    const sections = this.getFrameworkSections(framework, esgData);
    const completeness = this.calculateCompleteness(esgData, framework);
    const qualityScore = this.calculateQualityScore(esgData, framework);
    
    return {
      framework,
      completeness,
      qualityScore,
      sections
    };
  }

  static calculateCompleteness(esgData, framework) {
    if (!esgData || Object.keys(esgData).length === 0) return 0;
    
    const requiredFields = this.getRequiredFields(framework);
    const availableFields = this.getAvailableFields(esgData);
    const matchedFields = requiredFields.filter(field => availableFields.includes(field));
    
    return Math.round((matchedFields.length / requiredFields.length) * 100);
  }

  static calculateQualityScore(esgData, framework) {
    if (!esgData || Object.keys(esgData).length === 0) return 0;
    
    let qualityScore = 0;
    const dataPoints = Object.values(esgData).flat();
    
    dataPoints.forEach(point => {
      if (point && typeof point === 'object') {
        if (point.verified) qualityScore += 10;
        if (point.source) qualityScore += 5;
        if (point.methodology) qualityScore += 5;
      }
    });
    
    return Math.min(100, qualityScore);
  }

  static getRequiredFields(framework) {
    const fieldMap = {
      GRI: ['environmental_policy', 'social_metrics', 'governance_structure', 'stakeholder_engagement'],
      SASB: ['industry_metrics', 'material_topics', 'quantitative_data', 'forward_looking'],
      TCFD: ['governance_oversight', 'strategy_resilience', 'risk_management', 'metrics_targets'],
      BRSR: ['business_responsibility', 'product_responsibility', 'employee_wellbeing', 'stakeholder_engagement'],
      EU_CSRD: ['business_model', 'policies_procedures', 'outcomes_performance', 'principal_risks']
    };
    return fieldMap[framework] || [];
  }

  static getAvailableFields(esgData) {
    const fields = [];
    Object.entries(esgData).forEach(([category, data]) => {
      if (Array.isArray(data)) {
        data.forEach(item => {
          if (item.metric) fields.push(item.metric);
          if (item.subcategory) fields.push(item.subcategory);
        });
      } else if (typeof data === 'object') {
        Object.keys(data).forEach(key => fields.push(key));
      }
    });
    return [...new Set(fields)];
  }

  static getFrameworkSections(framework, data) {
    const sections = {
      GRI: ['organizational-profile', 'strategy', 'ethics', 'governance'],
      SASB: ['industry-description', 'sustainability-topics', 'metrics'],
      TCFD: ['governance', 'strategy', 'risk-management', 'metrics-targets'],
      BRSR: ['section-a', 'section-b', 'section-c'],
      EU_CSRD: ['business-model', 'policies', 'outcomes', 'risks']
    };
    
    return sections[framework] || [];
  }

  static assessFrameworkCompliance(reports) {
    const compliance = {};
    Object.entries(reports).forEach(([framework, report]) => {
      compliance[framework] = {
        compliant: report.completeness >= 80,
        completeness: report.completeness,
        qualityScore: report.qualityScore
      };
    });
    return compliance;
  }

  static identifyReportingGaps(reports) {
    const gaps = [];
    Object.entries(reports).forEach(([framework, report]) => {
      if (report.completeness < 80) {
        gaps.push({
          framework,
          type: 'completeness',
          severity: report.completeness < 50 ? 'high' : 'medium'
        });
      }
    });
    return gaps;
  }
}

export default GlobalFrameworks;