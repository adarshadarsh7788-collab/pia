import ESGDataCollectionReport from './esgDataCollectionReport.js';
import SustainabilityMetricsReport from './sustainabilityMetricsReport.js';
import PerformanceMonitoringReport from './performanceMonitoringReport.js';
import SecurityAssessmentReport from './securityAssessmentReport.js';
import DeploymentReport from './deploymentReport.js';
import PDFReportGenerator from './pdfReportGenerator.js';
import FrameworkReportGenerator from './frameworkReportGenerator.js';

/**
 * Centralized Report Manager
 * Provides unified access to all reporting modules
 */
class ReportManager {
  constructor() {
    this.esgDataReport = new ESGDataCollectionReport();
    this.sustainabilityReport = new SustainabilityMetricsReport();
    this.performanceReport = new PerformanceMonitoringReport();
    this.securityReport = new SecurityAssessmentReport();
    this.deploymentReport = new DeploymentReport();
    this.pdfGenerator = new PDFReportGenerator();
    this.frameworkGenerator = new FrameworkReportGenerator();
    this.initialized = false;
  }

  /**
   * Initialize all report modules
   */
  async initialize() {
    if (this.initialized) return;

    try {
      await Promise.all([
        this.esgDataReport.initialize(),
        this.sustainabilityReport.initialize(),
        this.performanceReport.initialize(),
        this.securityReport.initialize(),
        this.deploymentReport.initialize()
      ]);
      this.initialized = true;
      console.log('Report Manager initialized successfully');
    } catch (error) {
      console.error('Error initializing Report Manager:', error);
      throw error;
    }
  }

  /**
   * Generate PDF report
   */
  async generatePDFReport(outputPath = null) {
    await this.initialize();
    
    const reportData = await this.generateComprehensiveReport();
    const pdfPath = outputPath || `reports/ESG_Report_${new Date().toISOString().split('T')[0]}.pdf`;
    
    return await this.pdfGenerator.generateComprehensivePDF(reportData, pdfPath);
  }

  /**
   * Generate Framework-specific PDF report
   */
  async generateFrameworkPDFReport(outputPath = null) {
    await this.initialize();
    
    // Generate framework compliance data
    const frameworkData = {
      gri: { compliance: 78, gaps: ['Scope 3 emissions', 'Water recycling'] },
      sasb: { compliance: 82, materiality: 'High' },
      tcfd: { compliance: 75, pillars: ['Governance', 'Strategy', 'Risk', 'Metrics'] }
    };
    
    const pdfPath = outputPath || `reports/Framework_Compliance_${new Date().toISOString().split('T')[0]}.pdf`;
    
    return await this.frameworkGenerator.generateFrameworkPDF(frameworkData, pdfPath);
  }

  /**
   * Generate comprehensive system report
   */
  async generateComprehensiveReport() {
    await this.initialize();

    const report = {
      timestamp: new Date().toISOString(),
      reportType: 'comprehensive',
      summary: {
        esg: {},
        performance: {},
        security: {},
        deployment: {}
      },
      details: {}
    };

    try {
      // Generate all reports in parallel
      const [esgSummary, performanceSummary, securitySummary, deploymentSummary] = await Promise.all([
        this.generateESGSummary(),
        this.performanceReport.getPerformanceSummary(),
        this.securityReport.getSecuritySummary(),
        this.deploymentReport.getDeploymentSummary()
      ]);

      report.summary.esg = esgSummary;
      report.summary.performance = performanceSummary.summary;
      report.summary.security = securitySummary;
      report.summary.deployment = deploymentSummary.summary;

      report.details = {
        esg: esgSummary,
        performance: performanceSummary,
        security: securitySummary,
        deployment: deploymentSummary
      };

    } catch (error) {
      console.error('Error generating comprehensive report:', error);
      report.error = error.message;
    }

    return report;
  }

  /**
   * Generate ESG summary from multiple ESG reports
   */
  async generateESGSummary() {
    const [dataReport, metricsReport] = await Promise.all([
      this.esgDataReport.getDataSourcesReport(),
      this.esgDataReport.getFrameworkComplianceReport()
    ]);

    const [envReport, socialReport, govReport] = await Promise.all([
      this.sustainabilityReport.getEnvironmentalReport(),
      this.sustainabilityReport.getSocialReport(),
      this.sustainabilityReport.getGovernanceReport()
    ]);

    return {
      dataCollection: {
        totalRecords: dataReport.totalRecords,
        dataQualityScore: dataReport.dataQualityScore,
        lastUpdate: dataReport.timestamp
      },
      compliance: {
        overallCompliance: metricsReport.overallCompliance,
        frameworks: Object.keys(metricsReport.frameworks).length
      },
      sustainability: {
        carbonFootprint: envReport.carbonFootprint.totalEmissions,
        wasteReduction: envReport.wasteManagement.recycledPercentage,
        employeeSafety: socialReport.safety.incidentRate,
        boardDiversity: govReport.boardComposition.femaleRepresentation
      }
    };
  }

  /**
   * Generate specific report by type
   */
  async generateReport(reportType, subType = null) {
    await this.initialize();

    switch (reportType.toLowerCase()) {
      case 'esg':
        return this.generateESGReport(subType);
      case 'performance':
        return this.generatePerformanceReport(subType);
      case 'security':
        return this.generateSecurityReport(subType);
      case 'deployment':
        return this.generateDeploymentReport(subType);
      default:
        throw new Error(`Unknown report type: ${reportType}`);
    }
  }

  async generateESGReport(subType) {
    switch (subType) {
      case 'data-collection':
        return this.esgDataReport.getDataSourcesReport();
      case 'compliance':
        return this.esgDataReport.getFrameworkComplianceReport();
      case 'environmental':
        return this.sustainabilityReport.getEnvironmentalReport();
      case 'social':
        return this.sustainabilityReport.getSocialReport();
      case 'governance':
        return this.sustainabilityReport.getGovernanceReport();
      case 'trends':
        return this.sustainabilityReport.getTrendAnalysis();
      default:
        return this.generateESGSummary();
    }
  }

  async generatePerformanceReport(subType) {
    switch (subType) {
      case 'database':
        return this.performanceReport.getDatabasePerformanceReport();
      case 'api':
        return this.performanceReport.getAPIPerformanceReport();
      case 'system':
        return this.performanceReport.getSystemResourceReport();
      case 'errors':
        return this.performanceReport.getErrorAnalysisReport();
      default:
        return this.performanceReport.getPerformanceSummary();
    }
  }

  async generateSecurityReport(subType) {
    switch (subType) {
      case 'vulnerabilities':
        return this.securityReport.getVulnerabilityScanReport();
      case 'access-control':
        return this.securityReport.getAccessControlReport();
      case 'encryption':
        return this.securityReport.getDataEncryptionReport();
      case 'incidents':
        return this.securityReport.getIncidentResponseReport();
      default:
        return this.securityReport.getSecuritySummary();
    }
  }

  async generateDeploymentReport(subType) {
    switch (subType) {
      case 'environment':
        return this.deploymentReport.getEnvironmentConfigReport();
      case 'procedures':
        return this.deploymentReport.getDeploymentProceduresReport();
      case 'health':
        return this.deploymentReport.getHealthCheckReport();
      case 'rollback':
        return this.deploymentReport.getRollbackStrategiesReport();
      default:
        return this.deploymentReport.getDeploymentSummary();
    }
  }

  /**
   * Get available report types and subtypes
   */
  getAvailableReports() {
    return {
      esg: {
        description: 'ESG-Specific Reports',
        subtypes: [
          'data-collection',
          'compliance',
          'environmental',
          'social',
          'governance',
          'trends'
        ]
      },
      performance: {
        description: 'System Performance Reports',
        subtypes: [
          'database',
          'api',
          'system',
          'errors'
        ]
      },
      security: {
        description: 'Security Assessment Reports',
        subtypes: [
          'vulnerabilities',
          'access-control',
          'encryption',
          'incidents'
        ]
      },
      deployment: {
        description: 'Deployment and Environment Reports',
        subtypes: [
          'environment',
          'procedures',
          'health',
          'rollback'
        ]
      }
    };
  }
}

// Export singleton instance
const reportManager = new ReportManager();

export default reportManager;
export {
  ESGDataCollectionReport,
  SustainabilityMetricsReport,
  PerformanceMonitoringReport,
  SecurityAssessmentReport,
  DeploymentReport,
  PDFReportGenerator,
  FrameworkReportGenerator,
  ReportManager
};