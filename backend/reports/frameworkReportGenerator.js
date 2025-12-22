import PDFDocument from 'pdfkit';
import fs from 'fs';

/**
 * Framework-Specific PDF Report Generator
 * Creates detailed compliance reports for ESG frameworks (GRI, SASB, TCFD)
 */
class FrameworkReportGenerator {
  constructor() {
    this.doc = null;
    this.pageMargin = 50;
    this.pageWidth = 595.28;
    this.pageHeight = 841.89;
  }

  /**
   * Generate framework compliance PDF report
   */
  async generateFrameworkPDF(frameworkData, outputPath) {
    this.doc = new PDFDocument({ margin: this.pageMargin });
    const stream = fs.createWriteStream(outputPath);
    this.doc.pipe(stream);

    // Cover Page
    this.addCoverPage();
    
    // Executive Summary
    this.addExecutiveSummary(frameworkData);
    
    // GRI Framework Section
    this.addGRISection(frameworkData);
    
    // SASB Framework Section
    this.addSASBSection(frameworkData);
    
    // TCFD Framework Section
    this.addTCFDSection(frameworkData);
    
    // Compliance Summary
    this.addComplianceSummary(frameworkData);
    
    // Action Plan
    this.addActionPlan(frameworkData);

    this.doc.end();
    
    return new Promise((resolve, reject) => {
      stream.on('finish', () => resolve(outputPath));
      stream.on('error', reject);
    });
  }

  /**
   * Add cover page
   */
  addCoverPage() {
    // Background gradient
    this.doc.rect(0, 0, this.pageWidth, 300)
      .fillAndStroke('#1B4F72', '#1B4F72');
    
    this.doc.fontSize(32).font('Helvetica-Bold')
      .fillColor('#FFFFFF')
      .text('ESG FRAMEWORK', this.pageMargin, 120, { align: 'center' })
      .text('COMPLIANCE REPORT', this.pageMargin, 160, { align: 'center' });
    
    this.doc.fontSize(18).font('Helvetica')
      .fillColor('#F8F9FA')
      .text('GRI Standards Assessment & Analysis', this.pageMargin, 220, { align: 'center' });

    // Enhanced info box
    this.doc.rect(this.pageMargin, 320, this.pageWidth - 2 * this.pageMargin, 180)
      .fillAndStroke('#FFFFFF', '#2C3E50');
    
    this.doc.fontSize(18).font('Helvetica-Bold')
      .fillColor('#1B4F72')
      .text('Current Compliance Status', this.pageMargin + 30, 350);
    
    this.doc.fontSize(14).font('Helvetica')
      .fillColor('#2C3E50')
      .text('✓ Social Standards: 75% (6/8 standards)', this.pageMargin + 30, 380)
      .text('✓ Customer & Society: 100% (4/4 standards)', this.pageMargin + 30, 405)
      .text('⚠ Governance: 0% (0/8 standards)', this.pageMargin + 30, 430)
      .text('✓ Environmental: 67% (8/12 standards)', this.pageMargin + 30, 455)
      .text(`Generated: ${new Date().toLocaleDateString()}`, this.pageMargin + 30, 480);

    this.doc.addPage();
  }

  /**
   * Add executive summary
   */
  addExecutiveSummary(frameworkData) {
    this.addSectionHeader('EXECUTIVE SUMMARY');
    
    this.doc.fontSize(12).font('Helvetica')
      .text('This report provides a comprehensive analysis of our organization\'s compliance with major ESG reporting frameworks. The assessment covers data quality, reporting completeness, and alignment with international standards.', this.pageMargin, this.doc.y + 20);

    this.doc.moveDown(2);

    // Summary metrics with detailed breakdown
    this.addTable([
      ['Framework Category', 'Standards Count', 'Compliant', 'Partial', 'Score'],
      ['Social Standards', '6/8', '4', '2', '75%'],
      ['Customer & Society', '4/4', '4', '0', '100%'],
      ['Governance', '0/8', '0', '0', '0%'],
      ['Environmental', '8/12', '6', '2', '67%'],
      ['Overall GRI Compliance', '18/32', '14', '4', '56%']
    ]);

    this.addPageIfNeeded();
  }

  /**
   * Add GRI section
   */
  addGRISection(frameworkData) {
    this.addSectionHeader('GRI STANDARDS COMPLIANCE');
    
    this.addSubsectionHeader('Social Standards (GRI 400 Series)');
    
    this.addTable([
      ['GRI Standard', 'Topic Area', 'Compliance Status', 'Score'],
      ['GRI-408', 'Child Labor', 'Compliant', '100%'],
      ['GRI-409', 'Forced or Compulsory Labor', 'Compliant', '100%'],
      ['GRI-410', 'Security Practices', 'Partial', '75%'],
      ['GRI-411', 'Rights of Indigenous Peoples', 'Not Applicable', 'N/A'],
      ['GRI-413', 'Local Communities', 'Compliant', '85%'],
      ['GRI-414', 'Supplier Social Assessment', 'In Progress', '60%']
    ]);

    this.addSubsectionHeader('Customer & Society Standards');
    
    this.addTable([
      ['GRI Standard', 'Topic Area', 'Materiality', 'Status', 'Score'],
      ['GRI-415', 'Public Policy', 'Medium', 'Compliant', '90%'],
      ['GRI-416', 'Customer Health and Safety', 'High', 'Compliant', '95%'],
      ['GRI-417', 'Marketing and Labeling', 'Medium', 'Compliant', '85%'],
      ['GRI-418', 'Customer Privacy', 'High', 'Compliant', '100%']
    ]);

    this.addSubsectionHeader('Governance Standards (0% Compliance)');
    
    this.addTable([
      ['GRI Standard', 'Governance Area', 'Implementation', 'Score'],
      ['GRI-2-9', 'Governance structure and composition', 'Complete', '90%'],
      ['GRI-205', 'Anti-corruption', 'Complete', '100%'],
      ['GRI-206', 'Anti-competitive Behavior', 'Complete', '95%'],
      ['GRI-207', 'Tax', 'Partial', '70%'],
      ['GRI-2-23', 'Policy commitments', 'Complete', '85%'],
      ['GRI-2-24', 'Embedding policy commitments', 'In Progress', '65%']
    ]);

    this.addPageIfNeeded();
  }

  /**
   * Add SASB section
   */
  addSASBSection(frameworkData) {
    this.addSectionHeader('SASB STANDARDS ASSESSMENT');
    
    this.addSubsectionHeader('Industry Classification');
    
    this.doc.fontSize(12).font('Helvetica')
      .text('Primary Industry: Technology & Communications', this.pageMargin, this.doc.y + 20)
      .text('Secondary Industries: Software & Services, Hardware', this.pageMargin, this.doc.y + 20);

    this.doc.moveDown(1);

    this.addSubsectionHeader('Material Topics Assessment');
    
    this.addTable([
      ['SASB Topic', 'Materiality', 'Data Availability', 'Reporting Quality'],
      ['Data Security', 'High', 'Complete', 'Excellent'],
      ['Employee Engagement', 'High', 'Good', 'Good'],
      ['Intellectual Property', 'Medium', 'Complete', 'Good'],
      ['Managing Systemic Risks', 'High', 'Partial', 'Developing'],
      ['Product Quality & Safety', 'Medium', 'Good', 'Good']
    ]);

    this.addSubsectionHeader('Quantitative Metrics');
    
    this.addTable([
      ['Metric', 'Unit', 'Current Value', 'Industry Benchmark'],
      ['Data breaches', 'Number', '0', '< 2'],
      ['Employee turnover', 'Percentage', '12%', '15%'],
      ['R&D investment', 'Percentage of revenue', '18%', '15%'],
      ['Customer satisfaction', 'Score (1-10)', '8.5', '7.8']
    ]);

    this.addPageIfNeeded();
  }

  /**
   * Add TCFD section
   */
  addTCFDSection(frameworkData) {
    this.addSectionHeader('TCFD IMPLEMENTATION STATUS');
    
    this.addSubsectionHeader('Governance Pillar');
    
    this.doc.fontSize(12).font('Helvetica')
      .text('Board Oversight: Climate-related risks and opportunities are overseen by the Risk Committee, which reports quarterly to the full Board.', this.pageMargin, this.doc.y + 20);

    this.doc.moveDown(1);
    
    this.addTable([
      ['Governance Element', 'Implementation Status', 'Effectiveness', 'Next Steps'],
      ['Board Oversight', 'Implemented', 'High', 'Annual training update'],
      ['Management Role', 'Implemented', 'Medium', 'Expand to all divisions'],
      ['Risk Integration', 'Partial', 'Medium', 'ERM system integration'],
      ['Performance Metrics', 'In Development', 'Low', 'Define KPIs']
    ]);

    this.addSubsectionHeader('Strategy Pillar');
    
    this.addTable([
      ['Strategy Element', 'Status', 'Time Horizon', 'Impact Assessment'],
      ['Risk Identification', 'Complete', 'Short/Medium/Long', 'High'],
      ['Opportunity Assessment', 'In Progress', 'Medium/Long', 'Medium'],
      ['Scenario Analysis', 'Planned', 'Long-term', 'To be determined'],
      ['Business Impact', 'Partial', 'All horizons', 'Medium']
    ]);

    this.addSubsectionHeader('Risk Management Pillar');
    
    this.addTable([
      ['Risk Process', 'Maturity Level', 'Integration Status', 'Improvement Areas'],
      ['Risk Identification', 'Advanced', 'Integrated', 'Quantification methods'],
      ['Risk Assessment', 'Intermediate', 'Partial', 'Scenario modeling'],
      ['Risk Management', 'Intermediate', 'Integrated', 'Response strategies'],
      ['Risk Monitoring', 'Basic', 'Developing', 'Real-time tracking']
    ]);

    this.addPageIfNeeded();
  }

  /**
   * Add compliance summary
   */
  addComplianceSummary(frameworkData) {
    this.addSectionHeader('COMPLIANCE SUMMARY & BENCHMARKING');
    
    this.addSubsectionHeader('Framework Comparison');
    
    this.addTable([
      ['Aspect', 'GRI', 'SASB', 'TCFD', 'Best Practice'],
      ['Data Completeness', '78%', '85%', '70%', '> 90%'],
      ['Reporting Quality', 'Good', 'Excellent', 'Developing', 'Excellent'],
      ['Stakeholder Relevance', 'High', 'High', 'Medium', 'High'],
      ['Decision Usefulness', 'Medium', 'High', 'Medium', 'High'],
      ['Verification Status', 'Partial', 'None', 'None', 'Full']
    ]);

    this.addSubsectionHeader('Industry Benchmarking');
    
    this.addTable([
      ['Metric', 'Our Performance', 'Industry Average', 'Top Quartile', 'Gap Analysis'],
      ['ESG Disclosure Score', '78%', '72%', '85%', '+6% vs avg, -7% vs top'],
      ['Climate Risk Disclosure', '75%', '68%', '88%', '+7% vs avg, -13% vs top'],
      ['Social Impact Reporting', '82%', '75%', '90%', '+7% vs avg, -8% vs top'],
      ['Governance Transparency', '85%', '80%', '92%', '+5% vs avg, -7% vs top']
    ]);

    this.addPageIfNeeded();
  }

  /**
   * Add action plan
   */
  addActionPlan(frameworkData) {
    this.addSectionHeader('STRATEGIC ACTION PLAN');
    
    this.addSubsectionHeader('Priority Initiatives (Next 12 Months)');
    
    this.addTable([
      ['Initiative', 'Framework', 'Timeline', 'Owner', 'Success Metric'],
      ['Scope 3 Emissions Calculation', 'GRI/TCFD', 'Q1 2024', 'Sustainability Team', 'Complete inventory'],
      ['Climate Scenario Analysis', 'TCFD', 'Q2 2024', 'Risk Management', '2°C and 4°C scenarios'],
      ['Water Management System', 'GRI/SASB', 'Q2 2024', 'Operations', 'Real-time monitoring'],
      ['Third-party Verification', 'All Frameworks', 'Q3 2024', 'Finance', 'Limited assurance'],
      ['Stakeholder Engagement', 'GRI', 'Q4 2024', 'Communications', 'Materiality update']
    ]);

    this.addSubsectionHeader('Long-term Roadmap (2-3 Years)');
    
    const roadmapItems = [
      '• Achieve 90%+ compliance across all three frameworks',
      '• Implement integrated reporting approach combining financial and ESG data',
      '• Establish science-based targets aligned with 1.5°C pathway',
      '• Develop real-time ESG data dashboard for stakeholders',
      '• Obtain reasonable assurance on key ESG metrics',
      '• Integrate ESG performance into executive compensation'
    ];

    roadmapItems.forEach(item => {
      this.doc.fontSize(12).font('Helvetica')
        .text(item, this.pageMargin, this.doc.y + 15);
    });

    this.doc.moveDown(2);

    this.addSubsectionHeader('Resource Requirements');
    
    this.addTable([
      ['Resource Type', 'Current State', 'Required Investment', 'Expected ROI'],
      ['Technology Systems', 'Basic', '$150K - Data platform', 'Efficiency gains'],
      ['Human Resources', '2 FTE', '+1 FTE specialist', 'Quality improvement'],
      ['External Consultants', 'Ad-hoc', '$75K - Annual support', 'Expertise access'],
      ['Training & Development', 'Limited', '$25K - Team training', 'Capability building'],
      ['Verification Services', 'None', '$50K - Annual audit', 'Credibility enhancement']
    ]);

    // Footer
    this.doc.fontSize(10).font('Helvetica')
      .text(`ESG Framework Compliance Report - Generated ${new Date().toLocaleDateString()}`, 
             this.pageMargin, this.pageHeight - 80, { align: 'center' });
  }

  /**
   * Helper methods
   */
  addSectionHeader(title) {
    this.checkPageBreak(100);
    this.doc.fontSize(18).font('Helvetica-Bold')
      .fillColor('#2E86AB')
      .text(title, this.pageMargin, this.doc.y + 30);
    
    this.doc.moveTo(this.pageMargin, this.doc.y + 25)
      .lineTo(this.pageWidth - this.pageMargin, this.doc.y + 25)
      .stroke('#2E86AB');
    
    this.doc.moveDown(2);
    this.doc.fillColor('black');
  }

  addSubsectionHeader(title) {
    this.checkPageBreak(60);
    this.doc.fontSize(14).font('Helvetica-Bold')
      .fillColor('#A23B72')
      .text(title, this.pageMargin, this.doc.y + 20);
    this.doc.moveDown(1);
    this.doc.fillColor('black');
  }

  addTable(data) {
    const tableWidth = this.pageWidth - 2 * this.pageMargin;
    const colWidth = tableWidth / data[0].length;
    const rowHeight = 35;
    const tableHeight = data.length * rowHeight;
    
    this.checkPageBreak(tableHeight + 50);
    
    const startY = this.doc.y;
    
    data.forEach((row, rowIndex) => {
      const yPos = startY + rowIndex * rowHeight;
      
      if (rowIndex === 0) {
        this.doc.rect(this.pageMargin, yPos, tableWidth, rowHeight)
          .fillAndStroke('#1B4F72', '#1B4F72');
      } else {
        const fillColor = rowIndex % 2 === 0 ? '#F8F9FA' : '#FFFFFF';
        this.doc.rect(this.pageMargin, yPos, tableWidth, rowHeight)
          .fillAndStroke(fillColor, '#34495E');
      }
      
      row.forEach((cell, colIndex) => {
        const xPos = this.pageMargin + colIndex * colWidth;
        
        if (colIndex > 0) {
          this.doc.moveTo(xPos, yPos)
            .lineTo(xPos, yPos + rowHeight)
            .stroke('#BDC3C7');
        }
        
        this.doc.fontSize(rowIndex === 0 ? 9 : 8)
          .font(rowIndex === 0 ? 'Helvetica-Bold' : 'Helvetica')
          .fillColor(rowIndex === 0 ? '#FFFFFF' : '#2C3E50')
          .text(cell.toString(), xPos + 3, yPos + 5, {
            width: colWidth - 6,
            height: rowHeight - 10,
            align: 'left',
            lineBreak: true
          });
      });
    });
    
    this.doc.y = startY + tableHeight + 30;
    this.doc.fillColor('#2C3E50');
  }

  checkPageBreak(requiredSpace) {
    const remainingSpace = this.pageHeight - this.pageMargin - this.doc.y;
    if (remainingSpace < requiredSpace) {
      this.doc.addPage();
    }
  }

  addPageIfNeeded() {
    const remainingSpace = this.pageHeight - this.pageMargin - this.doc.y;
    if (remainingSpace < 100) {
      this.doc.addPage();
    }
  }
}

export default FrameworkReportGenerator;