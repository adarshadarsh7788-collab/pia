import createSequelize from '../config/database.js';

/**
 * ESG Data Collection Report Generator
 * Provides comprehensive reporting on ESG data collection processes
 */
class ESGDataCollectionReport {
  constructor() {
    this.sequelize = null;
  }

  async initialize() {
    this.sequelize = await createSequelize();
  }

  /**
   * Generate data sources and collection methods report
   */
  async getDataSourcesReport() {
    const report = {
      timestamp: new Date().toISOString(),
      dataSources: {
        environmental: {
          emissions: { source: 'ERP Integration', frequency: 'Monthly', lastUpdate: null },
          waste: { source: 'Manual Entry', frequency: 'Weekly', lastUpdate: null },
          airQuality: { source: 'IoT Sensors', frequency: 'Real-time', lastUpdate: null },
          biodiversity: { source: 'Third-party API', frequency: 'Quarterly', lastUpdate: null }
        },
        social: {
          workforce: { source: 'HR System', frequency: 'Daily', lastUpdate: null },
          safety: { source: 'Incident Reports', frequency: 'As-needed', lastUpdate: null },
          community: { source: 'Manual Entry', frequency: 'Monthly', lastUpdate: null },
          humanRights: { source: 'Audit Reports', frequency: 'Annually', lastUpdate: null }
        },
        governance: {
          boardComposition: { source: 'Manual Entry', frequency: 'Quarterly', lastUpdate: null },
          ethics: { source: 'Compliance System', frequency: 'Monthly', lastUpdate: null },
          auditor: { source: 'External Audits', frequency: 'Annually', lastUpdate: null }
        }
      },
      totalRecords: 0,
      dataQualityScore: 0
    };

    try {
      // Get actual data counts and last updates
      const tables = ['EmissionsData', 'WasteData', 'AirQualityData', 'BiodiversityData', 
                     'WorkforceData', 'SafetyIncidents', 'CommunityProjects', 'HumanRightsData',
                     'BoardComposition', 'EthicsCompliance', 'AuditorSessions'];
      
      let totalRecords = 0;
      for (const table of tables) {
        const [results] = await this.sequelize.query(`SELECT COUNT(*) as count, MAX(createdAt) as lastUpdate FROM ${table}`);
        totalRecords += results[0].count;
        
        // Update last update times in report
        const category = this.getCategoryForTable(table);
        const field = this.getFieldForTable(table);
        if (report.dataSources[category] && report.dataSources[category][field]) {
          report.dataSources[category][field].lastUpdate = results[0].lastUpdate;
        }
      }
      
      report.totalRecords = totalRecords;
      report.dataQualityScore = await this.calculateDataQualityScore();
      
    } catch (error) {
      console.error('Error generating data sources report:', error);
    }

    return report;
  }

  /**
   * Generate compliance framework report
   */
  async getFrameworkComplianceReport() {
    const report = {
      timestamp: new Date().toISOString(),
      frameworks: {
        GRI: { compliance: 0, missingIndicators: [], lastAssessment: null },
        SASB: { compliance: 0, missingIndicators: [], lastAssessment: null },
        TCFD: { compliance: 0, missingIndicators: [], lastAssessment: null }
      },
      overallCompliance: 0
    };

    try {
      const [results] = await this.sequelize.query(`
        SELECT framework, compliance_percentage, missing_indicators, last_assessment 
        FROM FrameworkCompliance 
        ORDER BY last_assessment DESC
      `);

      results.forEach(row => {
        if (report.frameworks[row.framework]) {
          report.frameworks[row.framework] = {
            compliance: row.compliance_percentage,
            missingIndicators: JSON.parse(row.missing_indicators || '[]'),
            lastAssessment: row.last_assessment
          };
        }
      });

      // Calculate overall compliance
      const frameworks = Object.values(report.frameworks);
      report.overallCompliance = frameworks.reduce((sum, f) => sum + f.compliance, 0) / frameworks.length;

    } catch (error) {
      console.error('Error generating framework compliance report:', error);
    }

    return report;
  }

  /**
   * Calculate data quality score based on completeness and freshness
   */
  async calculateDataQualityScore() {
    try {
      const tables = ['EmissionsData', 'WasteData', 'WorkforceData', 'SafetyIncidents'];
      let totalScore = 0;
      
      for (const table of tables) {
        const [results] = await this.sequelize.query(`
          SELECT 
            COUNT(*) as total,
            COUNT(CASE WHEN createdAt > datetime('now', '-30 days') THEN 1 END) as recent
          FROM ${table}
        `);
        
        const freshnessScore = results[0].recent / Math.max(results[0].total, 1);
        totalScore += freshnessScore;
      }
      
      return Math.round((totalScore / tables.length) * 100);
    } catch (error) {
      console.error('Error calculating data quality score:', error);
      return 0;
    }
  }

  getCategoryForTable(table) {
    const mapping = {
      'EmissionsData': 'environmental', 'WasteData': 'environmental', 
      'AirQualityData': 'environmental', 'BiodiversityData': 'environmental',
      'WorkforceData': 'social', 'SafetyIncidents': 'social', 
      'CommunityProjects': 'social', 'HumanRightsData': 'social',
      'BoardComposition': 'governance', 'EthicsCompliance': 'governance', 
      'AuditorSessions': 'governance'
    };
    return mapping[table] || 'other';
  }

  getFieldForTable(table) {
    const mapping = {
      'EmissionsData': 'emissions', 'WasteData': 'waste', 
      'AirQualityData': 'airQuality', 'BiodiversityData': 'biodiversity',
      'WorkforceData': 'workforce', 'SafetyIncidents': 'safety', 
      'CommunityProjects': 'community', 'HumanRightsData': 'humanRights',
      'BoardComposition': 'boardComposition', 'EthicsCompliance': 'ethics', 
      'AuditorSessions': 'auditor'
    };
    return mapping[table] || 'other';
  }
}

export default ESGDataCollectionReport;