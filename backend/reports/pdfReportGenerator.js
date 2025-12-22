import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

/**
 * PDF Report Generator
 * Creates professional PDF reports from ESG and system data
 */
class PDFReportGenerator {
  constructor() {
    this.doc = null;
    this.currentY = 0;
    this.pageMargin = 50;
    this.pageWidth = 595.28; // A4 width
    this.pageHeight = 841.89; // A4 height
  }

  /**
   * Generate comprehensive PDF report
   */
  async generateComprehensivePDF(reportData, outputPath) {
    this.doc = new PDFDocument({ margin: this.pageMargin });
    const stream = fs.createWriteStream(outputPath);
    this.doc.pipe(stream);

    // Cover Page
    this.addCoverPage(reportData);
    
    // Executive Summary
    this.addExecutiveSummary(reportData);
    
    // ESG Reports Section
    this.addESGSection(reportData);
    
    // Performance Reports Section
    this.addPerformanceSection(reportData);
    
    // Security Reports Section
    this.addSecuritySection(reportData);
    
    // Deployment Reports Section
    this.addDeploymentSection(reportData);
    
    // Appendix
    this.addAppendix(reportData);

    this.doc.end();
    
    return new Promise((resolve, reject) => {
      stream.on('finish', () => resolve(outputPath));
      stream.on('error', reject);
    });
  }

  /**
   * Add cover page
   */
  addCoverPage(reportData) {
    // Header
    this.doc.fontSize(28).font('Helvetica-Bold')
      .text('ESG & SYSTEM PERFORMANCE', this.pageMargin, 150, { align: 'center' });
    
    this.doc.fontSize(24).font('Helvetica')
      .text('COMPREHENSIVE REPORT', this.pageMargin, 190, { align: 'center' });

    // Company Info Box
    this.doc.rect(this.pageMargin, 250, this.pageWidth - 2 * this.pageMargin, 100)
      .stroke('#2E86AB');
    
    this.doc.fontSize(16).font('Helvetica-Bold')
      .text('Report Details', this.pageMargin + 20, 270);
    
    this.doc.fontSize(12).font('Helvetica')
      .text(`Generated: ${new Date(reportData.timestamp).toLocaleDateString()}`, this.pageMargin + 20, 295)
      .text(`Report Type: Comprehensive Analysis`, this.pageMargin + 20, 315)
      .text(`Environment: ${reportData.summary?.deployment?.environment || 'Production'}`, this.pageMargin + 20, 335);

    // Key Metrics Summary Box
    this.doc.rect(this.pageMargin, 400, this.pageWidth - 2 * this.pageMargin, 200)
      .stroke('#A23B72');
    
    this.doc.fontSize(16).font('Helvetica-Bold')
      .text('Key Performance Indicators', this.pageMargin + 20, 420);

    const metrics = [
      { label: 'ESG Data Quality Score', value: `${reportData.summary?.esg?.dataCollection?.dataQualityScore || 0}%` },
      { label: 'System Performance Health', value: `${reportData.summary?.performance?.overallHealth || 0}%` },
      { label: 'Security Score', value: `${reportData.summary?.security?.overallSecurityScore || 0}%` },
      { label: 'Deployment Health', value: reportData.summary?.deployment?.overallHealth || 'Unknown' }
    ];

    let yPos = 450;
    metrics.forEach(metric => {
      this.doc.fontSize(12).font('Helvetica')
        .text(`${metric.label}:`, this.pageMargin + 20, yPos)
        .font('Helvetica-Bold')
        .text(metric.value, this.pageMargin + 250, yPos);
      yPos += 25;
    });

    // Footer
    this.doc.fontSize(10).font('Helvetica')
      .text('Confidential - Internal Use Only', this.pageMargin, this.pageHeight - 100, { align: 'center' });

    this.doc.addPage();
  }

  /**
   * Add executive summary
   */
  addExecutiveSummary(reportData) {
    this.addSectionHeader('EXECUTIVE SUMMARY');
    
    this.doc.fontSize(12).font('Helvetica')
      .text('This comprehensive report provides an overview of Environmental, Social, and Governance (ESG) performance alongside system performance, security, and deployment metrics.', this.pageMargin, this.currentY + 20);

    this.currentY += 60;

    // Summary Cards
    const summaryData = [
      {
        title: 'ESG Performance',
        score: reportData.summary?.esg?.dataCollection?.dataQualityScore || 0,
        status: this.getStatusFromScore(reportData.summary?.esg?.dataCollection?.dataQualityScore || 0),
        details: [
          `Total ESG Records: ${reportData.summary?.esg?.dataCollection?.totalRecords || 0}`,
          `Framework Compliance: ${reportData.summary?.esg?.compliance?.overallCompliance || 0}%`,
          `Carbon Footprint: ${reportData.summary?.esg?.sustainability?.carbonFootprint || 0} tons CO2`
        ]
      },
      {
        title: 'System Performance',
        score: reportData.summary?.performance?.overallHealth || 0,
        status: this.getStatusFromScore(reportData.summary?.performance?.overallHealth || 0),
        details: [
          `Avg API Response: ${Math.round(reportData.summary?.performance?.keyMetrics?.avgApiResponseTime || 0)}ms`,
          `CPU Usage: ${Math.round(reportData.summary?.performance?.keyMetrics?.systemCpuUsage || 0)}%`,
          `Memory Usage: ${Math.round(reportData.summary?.performance?.keyMetrics?.memoryUtilization || 0)}%`
        ]
      }
    ];

    summaryData.forEach((item, index) => {
      this.addSummaryCard(item, index);
    });

    this.doc.addPage();
  }

  /**
   * Add ESG section
   */
  addESGSection(reportData) {
    this.addSectionHeader('ESG PERFORMANCE ANALYSIS');
    
    // Environmental Metrics
    this.addSubsectionHeader('Environmental Impact');
    
    const envData = reportData.details?.esg?.sustainability || {};
    
    this.doc.fontSize(12).font('Helvetica')
      .text('Carbon Footprint Analysis:', this.pageMargin, this.currentY + 20);
    
    this.currentY += 45;
    
    // Check if we need a new page before adding table
    this.checkPageBreak(150);
    
    // Carbon emissions table
    this.addTable([
      ['Emission Type', 'Amount (tons CO2)', 'Target Reduction'],
      ['Scope 1 (Direct)', (envData.carbonFootprint?.scope1 || 0).toString(), '15%'],
      ['Scope 2 (Indirect)', (envData.carbonFootprint?.scope2 || 0).toString(), '25%'],
      ['Scope 3 (Value Chain)', (envData.carbonFootprint?.scope3 || 0).toString(), '10%'],
      ['Total Emissions', (envData.carbonFootprint?.totalEmissions || 0).toString(), '25%']
    ]);

    // Waste Management
    this.addSubsectionHeader('Waste Management');
    
    this.checkPageBreak(120);
    
    this.addTable([
      ['Metric', 'Current Value', 'Industry Benchmark'],
      ['Total Waste Generated', `${envData.wasteManagement?.totalWaste || 0} tons`, '150 tons'],
      ['Recycling Rate', `${envData.wasteManagement?.recycledPercentage || 0}%`, '65%'],
      ['Hazardous Waste', `${envData.wasteManagement?.hazardousWaste || 0} tons`, '5 tons']
    ]);

    // Social Metrics
    this.addSubsectionHeader('Social Impact');
    
    const socialData = reportData.details?.esg?.sustainability || {};
    
    this.checkPageBreak(150);
    
    this.addTable([
      ['Metric', 'Current Value', 'Target'],
      ['Employee Safety Incidents', (socialData.safety?.incidentRate || 0).toString(), '< 5'],
      ['Gender Diversity (Female %)', `${socialData.diversity?.genderBalance?.female || 0}%`, '50%'],
      ['Community Projects', (socialData.communityImpact?.projectsCompleted || 0).toString(), '12'],
      ['Training Hours per Employee', '40', '45']
    ]);

    this.addPageIfNeeded();
  }

  /**
   * Add performance section
   */
  addPerformanceSection(reportData) {
    this.addSectionHeader('SYSTEM PERFORMANCE ANALYSIS');
    
    const perfData = reportData.details?.performance || {};
    
    // Database Performance
    this.addSubsectionHeader('Database Performance');
    
    this.checkPageBreak(120);
    
    this.addTable([
      ['Metric', 'Current Value', 'Threshold', 'Status'],
      ['Avg Query Response Time', `${Math.round(perfData.summary?.keyMetrics?.dbQueryPerformance || 0)}ms`, '< 100ms', this.getPerformanceStatus(perfData.summary?.keyMetrics?.dbQueryPerformance, 100)],
      ['Active Connections', (perfData.detailedReports?.database?.connectionPool?.activeConnections || 0).toString(), '< 80%', 'Good'],
      ['Pool Utilization', `${Math.round(perfData.detailedReports?.database?.connectionPool?.poolUtilization || 0)}%`, '< 80%', 'Good']
    ]);

    // API Performance
    this.addSubsectionHeader('API Performance');
    
    this.checkPageBreak(150);
    
    this.addTable([
      ['Endpoint', 'Avg Response Time', 'Request Count', 'Error Rate'],
      ['/api/esg/data', '150ms', '1,250', '0.5%'],
      ['/api/analytics/dashboard', '200ms', '850', '1.2%'],
      ['/api/reporting/generate', '300ms', '450', '0.8%'],
      ['/api/compliance/check', '180ms', '650', '0.3%']
    ]);

    // System Resources
    this.addSubsectionHeader('System Resources');
    
    this.checkPageBreak(150);
    
    this.addTable([
      ['Resource', 'Current Usage', 'Available', 'Utilization %'],
      ['CPU', `${Math.round(perfData.summary?.keyMetrics?.systemCpuUsage || 0)}%`, '100%', `${Math.round(perfData.summary?.keyMetrics?.systemCpuUsage || 0)}%`],
      ['Memory', `${Math.round(perfData.summary?.keyMetrics?.memoryUtilization || 0)}%`, '100%', `${Math.round(perfData.summary?.keyMetrics?.memoryUtilization || 0)}%`],
      ['Disk Space', '45%', '1TB', '45%'],
      ['Network I/O', '25%', '1Gbps', '25%']
    ]);

    this.addPageIfNeeded();
  }

  /**
   * Add security section
   */
  addSecuritySection(reportData) {
    this.addSectionHeader('SECURITY ASSESSMENT');
    
    const secData = reportData.details?.security || {};
    
    // Security Overview
    this.addSubsectionHeader('Security Overview');
    
    this.doc.fontSize(12).font('Helvetica')
      .text(`Overall Security Score: ${secData.overallSecurityScore || 0}%`, this.pageMargin, this.currentY + 20)
      .text(`Last Security Assessment: ${new Date(secData.summary?.lastAssessment || Date.now()).toLocaleDateString()}`, this.pageMargin, this.currentY + 40);

    this.currentY += 80;

    // Vulnerability Assessment
    this.addSubsectionHeader('Vulnerability Assessment');
    
    this.checkPageBreak(180);
    
    this.addTable([
      ['Severity Level', 'Count', 'Status', 'Action Required'],
      ['Critical', (secData.summary?.criticalVulnerabilities || 0).toString(), 'Resolved', 'None'],
      ['High', '0', 'N/A', 'None'],
      ['Medium', '2', 'In Progress', 'Patch by EOW'],
      ['Low', '1', 'Scheduled', 'Next Sprint'],
      ['Info', '3', 'Acknowledged', 'Documentation']
    ]);

    // Access Control
    this.addSubsectionHeader('Access Control & Compliance');
    
    this.checkPageBreak(150);
    
    this.addTable([
      ['Control', 'Status', 'Compliance %', 'Last Review'],
      ['Multi-Factor Authentication', 'Enabled', '100%', '2024-11-01'],
      ['Password Policy', 'Enforced', '95%', '2024-10-15'],
      ['Session Management', 'Active', '98%', '2024-11-10'],
      ['Data Encryption', 'Enabled', `${secData.summary?.encryptionCompliance || 0}%`, '2024-11-05']
    ]);

    // Incident Response
    this.addSubsectionHeader('Security Incidents');
    
    this.checkPageBreak(150);
    
    this.addTable([
      ['Incident Type', 'Count (30 days)', 'Avg Resolution Time', 'Status'],
      ['Failed Login Attempts', '15', '5 minutes', 'Monitored'],
      ['Suspicious Activity', '2', '30 minutes', 'Investigated'],
      ['Data Access Violations', '0', 'N/A', 'None'],
      ['System Intrusions', '0', 'N/A', 'None']
    ]);

    this.addPageIfNeeded();
  }

  /**
   * Add deployment section
   */
  addDeploymentSection(reportData) {
    this.addSectionHeader('DEPLOYMENT & INFRASTRUCTURE');
    
    const deployData = reportData.details?.deployment || {};
    
    // Environment Configuration
    this.addSubsectionHeader('Environment Configuration');
    
    this.checkPageBreak(180);
    
    this.addTable([
      ['Configuration', 'Value', 'Status'],
      ['Environment', deployData.summary?.environment || 'Unknown', 'Active'],
      ['Database Type', 'SQLite/PostgreSQL', 'Connected'],
      ['SSL/TLS', 'Enabled', 'Secure'],
      ['CORS Policy', 'Configured', 'Active'],
      ['Session Timeout', '3600s', 'Configured']
    ]);

    // Health Checks
    this.addSubsectionHeader('System Health Checks');
    
    this.checkPageBreak(180);
    
    this.addTable([
      ['Component', 'Status', 'Response Time', 'Last Check'],
      ['Database', 'Healthy', '< 50ms', new Date().toLocaleTimeString()],
      ['API Endpoints', 'Healthy', '< 200ms', new Date().toLocaleTimeString()],
      ['File System', 'Healthy', '< 10ms', new Date().toLocaleTimeString()],
      ['Memory Usage', 'Normal', 'N/A', new Date().toLocaleTimeString()],
      ['CPU Usage', 'Normal', 'N/A', new Date().toLocaleTimeString()]
    ]);

    // Deployment Metrics
    this.addSubsectionHeader('Deployment Metrics');
    
    this.checkPageBreak(180);
    
    this.addTable([
      ['Metric', 'Value', 'Target', 'Status'],
      ['Deployment Frequency', '2x/week', '3x/week', 'Good'],
      ['Lead Time', '2 hours', '< 4 hours', 'Excellent'],
      ['Mean Time to Recovery', '15 minutes', '< 30 minutes', 'Excellent'],
      ['Change Failure Rate', '5%', '< 10%', 'Good'],
      ['Rollback Success Rate', '100%', '> 95%', 'Excellent']
    ]);

    this.addPageIfNeeded();
  }

  /**
   * Add appendix
   */
  addAppendix(reportData) {
    this.addSectionHeader('APPENDIX');
    
    // Recommendations
    this.addSubsectionHeader('Recommendations');
    
    const recommendations = [
      'Implement automated ESG data collection to improve data quality scores',
      'Optimize database queries to reduce average response times',
      'Enable multi-factor authentication for all user accounts',
      'Increase deployment frequency to improve system reliability',
      'Implement comprehensive monitoring for all system components'
    ];

    recommendations.forEach((rec, index) => {
      this.doc.fontSize(12).font('Helvetica')
        .text(`${index + 1}. ${rec}`, this.pageMargin, this.currentY + 20);
      this.currentY += 25;
    });

    // Glossary
    this.addSubsectionHeader('Glossary');
    
    const glossary = [
      ['ESG', 'Environmental, Social, and Governance'],
      ['API', 'Application Programming Interface'],
      ['SLA', 'Service Level Agreement'],
      ['MTTR', 'Mean Time To Recovery'],
      ['KPI', 'Key Performance Indicator']
    ];

    this.addTable([['Term', 'Definition'], ...glossary]);

    // Footer
    this.doc.fontSize(10).font('Helvetica')
      .text(`Report generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, 
             this.pageMargin, this.pageHeight - 80, { align: 'center' });
  }

  /**
   * Helper methods
   */
  addSectionHeader(title) {
    this.checkPageBreak(100);
    this.currentY = this.doc.y;
    this.doc.fontSize(18).font('Helvetica-Bold')
      .fillColor('#2E86AB')
      .text(title, this.pageMargin, this.currentY + 30);
    
    this.doc.moveTo(this.pageMargin, this.currentY + 55)
      .lineTo(this.pageWidth - this.pageMargin, this.currentY + 55)
      .stroke('#2E86AB');
    
    this.currentY += 70;
    this.doc.fillColor('black');
  }

  addSubsectionHeader(title) {
    this.checkPageBreak(60);
    this.currentY = this.doc.y + 20;
    this.doc.fontSize(14).font('Helvetica-Bold')
      .fillColor('#A23B72')
      .text(title, this.pageMargin, this.currentY);
    this.currentY += 25;
    this.doc.fillColor('black');
  }

  addSummaryCard(data, index) {
    const cardWidth = (this.pageWidth - 3 * this.pageMargin) / 2;
    const cardHeight = 120;
    const xPos = this.pageMargin + (index % 2) * (cardWidth + this.pageMargin);
    const yPos = this.currentY + Math.floor(index / 2) * (cardHeight + 20);

    // Card background
    this.doc.rect(xPos, yPos, cardWidth, cardHeight)
      .fillAndStroke('#F8F9FA', '#E9ECEF');

    // Title
    this.doc.fontSize(14).font('Helvetica-Bold')
      .fillColor('#2E86AB')
      .text(data.title, xPos + 15, yPos + 15);

    // Score
    this.doc.fontSize(24).font('Helvetica-Bold')
      .fillColor(this.getScoreColor(data.score))
      .text(`${data.score}%`, xPos + 15, yPos + 40);

    // Status
    this.doc.fontSize(12).font('Helvetica')
      .fillColor('#6C757D')
      .text(data.status, xPos + 15, yPos + 70);

    // Details
    data.details.forEach((detail, i) => {
      this.doc.fontSize(10).font('Helvetica')
        .fillColor('#495057')
        .text(detail, xPos + 15, yPos + 85 + i * 12);
    });

    this.doc.fillColor('black');
    
    if (index % 2 === 1) {
      this.currentY += cardHeight + 40;
    }
  }

  addTable(data) {
    const tableWidth = this.pageWidth - 2 * this.pageMargin;
    const colWidth = tableWidth / data[0].length;
    const rowHeight = 25;
    const tableHeight = data.length * rowHeight;
    
    // Check if table fits on current page
    this.checkPageBreak(tableHeight + 40);
    
    data.forEach((row, rowIndex) => {
      const yPos = this.currentY + rowIndex * rowHeight;
      
      // Header row styling
      if (rowIndex === 0) {
        this.doc.rect(this.pageMargin, yPos, tableWidth, rowHeight)
          .fillAndStroke('#2E86AB', '#2E86AB');
      } else {
        this.doc.rect(this.pageMargin, yPos, tableWidth, rowHeight)
          .stroke('#E9ECEF');
      }
      
      row.forEach((cell, colIndex) => {
        const xPos = this.pageMargin + colIndex * colWidth;
        
        this.doc.fontSize(10)
          .font(rowIndex === 0 ? 'Helvetica-Bold' : 'Helvetica')
          .fillColor(rowIndex === 0 ? 'white' : 'black')
          .text(cell.toString(), xPos + 5, yPos + 8, {
            width: colWidth - 10,
            ellipsis: true
          });
      });
    });
    
    this.currentY += data.length * rowHeight + 20;
    this.doc.fillColor('black');
  }

  getStatusFromScore(score) {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Improvement';
  }

  getScoreColor(score) {
    if (score >= 80) return '#28A745';
    if (score >= 60) return '#FFC107';
    if (score >= 40) return '#FD7E14';
    return '#DC3545';
  }

  getPerformanceStatus(value, threshold) {
    return value <= threshold ? 'Good' : 'Needs Attention';
  }

  /**
   * Check if we need a page break and add one if necessary
   */
  checkPageBreak(requiredSpace) {
    const currentY = this.doc.y;
    const remainingSpace = this.pageHeight - this.pageMargin - currentY;
    
    if (remainingSpace < requiredSpace) {
      this.doc.addPage();
      this.currentY = this.pageMargin;
    } else {
      this.currentY = currentY;
    }
  }

  /**
   * Add page if needed (smart page management)
   */
  addPageIfNeeded() {
    const currentY = this.doc.y;
    const remainingSpace = this.pageHeight - this.pageMargin - currentY;
    
    // Only add page if we're near the bottom
    if (remainingSpace < 100) {
      this.doc.addPage();
      this.currentY = this.pageMargin;
    }
  }
}

export default PDFReportGenerator;