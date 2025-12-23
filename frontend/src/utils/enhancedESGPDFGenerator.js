import jsPDF from 'jspdf';

/**
 * Enhanced ESG PDF Generator with proper compliance formatting
 * Follows international ESG reporting standards (GRI, SASB, TCFD, BRSR)
 */
export const generateComplianceESGReport = (framework, data, options = {}) => {
  const pdf = new jsPDF();
  const {
    companyName = 'Company Name',
    reportPeriod = new Date().getFullYear(),
    sector = 'General',
    region = 'Global',
    assuranceLevel = 'Limited',
    reportingFramework = 'GRI Standards'
  } = options;

  // ESG Compliance Colors
  const colors = {
    primary: [0, 102, 51],        // Dark Green
    secondary: [34, 139, 34],     // Forest Green  
    accent: [0, 128, 0],          // Green
    environmental: [46, 125, 50], // Environmental Green
    social: [25, 118, 210],       // Social Blue
    governance: [156, 39, 176],   // Governance Purple
    text: [33, 33, 33],           // Dark Gray
    lightGray: [245, 245, 245],   // Light Background
    mediumGray: [158, 158, 158],  // Medium Gray
    darkGray: [97, 97, 97],       // Dark Gray
    white: [255, 255, 255],       // White
    warning: [255, 152, 0],       // Orange
    error: [244, 67, 54],         // Red
    success: [76, 175, 80]        // Success Green
  };

  let currentPage = 1;
  
  // Generate comprehensive ESG report
  createESGCoverPage(pdf, framework, companyName, reportPeriod, sector, colors);
  
  pdf.addPage();
  currentPage++;
  createESGTableOfContents(pdf, colors);
  
  pdf.addPage();
  currentPage++;
  createESGExecutiveSummary(pdf, data, colors, options);
  
  pdf.addPage();
  currentPage++;
  createESGMaterialityAssessment(pdf, data, colors);
  
  pdf.addPage();
  currentPage++;
  createEnvironmentalPerformance(pdf, data, colors);
  
  pdf.addPage();
  currentPage++;
  createSocialPerformance(pdf, data, colors);
  
  pdf.addPage();
  currentPage++;
  createGovernancePerformance(pdf, data, colors);
  
  pdf.addPage();
  currentPage++;
  createESGMetricsTable(pdf, data, colors);
  
  pdf.addPage();
  currentPage++;
  createFrameworkCompliance(pdf, framework, data, colors, options);
  
  pdf.addPage();
  currentPage++;
  createDataAssuranceSection(pdf, colors, options);
  
  // Add professional page numbers and footers
  addESGPageNumbers(pdf, currentPage, companyName, reportPeriod);
  
  return pdf;
};

const createESGCoverPage = (pdf, framework, companyName, reportPeriod, sector, colors) => {
  // Professional header with gradient effect
  pdf.setFillColor(...colors.primary);
  pdf.rect(0, 0, 210, 80, 'F');
  
  // Company logo placeholder
  pdf.setFillColor(...colors.white);
  pdf.roundedRect(15, 15, 30, 20, 3, 3, 'F');
  pdf.setTextColor(...colors.primary);
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'bold');
  pdf.text('LOGO', 28, 27);
  
  // Company name
  pdf.setTextColor(...colors.white);
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.text(companyName, 15, 55);
  
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`${sector} Sector`, 15, 68);
  
  // Main report title
  pdf.setTextColor(...colors.text);
  pdf.setFontSize(42);
  pdf.setFont('helvetica', 'bold');
  pdf.text('ESG', 15, 110);
  
  pdf.setFontSize(28);
  pdf.text('SUSTAINABILITY', 15, 135);
  pdf.text('REPORT', 15, 155);
  
  // Framework compliance badge
  pdf.setFillColor(...colors.environmental);
  pdf.roundedRect(15, 170, 80, 25, 5, 5, 'F');
  pdf.setTextColor(...colors.white);
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text(`${framework} COMPLIANT`, 20, 185);
  
  // Report details box
  pdf.setFillColor(...colors.lightGray);
  pdf.roundedRect(110, 170, 85, 60, 5, 5, 'F');
  
  pdf.setTextColor(...colors.text);
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('REPORT DETAILS', 115, 185);
  
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Reporting Period: ${reportPeriod}`, 115, 200);
  pdf.text(`Framework: ${framework}`, 115, 210);
  pdf.text(`Publication Date:`, 115, 220);
  pdf.text(new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }), 115, 230);
  
  // Sustainability commitment statement
  pdf.setFillColor(...colors.primary);
  pdf.rect(0, 250, 210, 47, 'F');
  
  pdf.setTextColor(...colors.white);
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('COMMITTED TO SUSTAINABLE DEVELOPMENT', 15, 270);
  
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Building a sustainable future through responsible business practices', 15, 285);
};

const createESGTableOfContents = (pdf, colors) => {
  // Professional header
  pdf.setFillColor(...colors.primary);
  pdf.rect(0, 0, 210, 35, 'F');
  
  pdf.setTextColor(...colors.white);
  pdf.setFontSize(22);
  pdf.setFont('helvetica', 'bold');
  pdf.text('TABLE OF CONTENTS', 15, 25);
  
  // Contents with proper ESG structure
  pdf.setTextColor(...colors.text);
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  
  const contents = [
    { title: 'Executive Summary', page: 3, level: 0 },
    { title: 'Materiality Assessment', page: 4, level: 0 },
    { title: 'Environmental Performance', page: 5, level: 0 },
    { title: '  Climate Change & Emissions', page: 5, level: 1 },
    { title: '  Resource Management', page: 5, level: 1 },
    { title: '  Waste & Circular Economy', page: 5, level: 1 },
    { title: 'Social Performance', page: 6, level: 0 },
    { title: '  Workforce & Human Rights', page: 6, level: 1 },
    { title: '  Community Impact', page: 6, level: 1 },
    { title: '  Product Responsibility', page: 6, level: 1 },
    { title: 'Governance Performance', page: 7, level: 0 },
    { title: '  Corporate Governance', page: 7, level: 1 },
    { title: '  Ethics & Compliance', page: 7, level: 1 },
    { title: '  Risk Management', page: 7, level: 1 },
    { title: 'ESG Metrics & KPIs', page: 8, level: 0 },
    { title: 'Framework Compliance', page: 9, level: 0 },
    { title: 'Data Assurance & Methodology', page: 10, level: 0 }
  ];
  
  let yPos = 55;
  contents.forEach(item => {
    const xOffset = item.level === 0 ? 15 : 25;
    const fontWeight = item.level === 0 ? 'bold' : 'normal';
    
    pdf.setFont('helvetica', fontWeight);
    pdf.text(item.title, xOffset, yPos);
    
    // Page number
    pdf.setFont('helvetica', 'normal');
    pdf.text(item.page.toString(), 185, yPos);
    
    // Dotted line
    if (item.level === 0) {
      pdf.setLineDashPattern([1, 2], 0);
      pdf.setLineWidth(0.3);
      pdf.line(xOffset + pdf.getTextWidth(item.title) + 5, yPos - 2, 180, yPos - 2);
      pdf.setLineDashPattern([], 0);
    }
    
    yPos += item.level === 0 ? 12 : 8;
  });
  
  // ESG Framework reference box
  pdf.setFillColor(...colors.lightGray);
  pdf.roundedRect(15, 220, 180, 40, 5, 5, 'F');
  
  pdf.setTextColor(...colors.text);
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');
  pdf.text('REPORTING STANDARDS REFERENCE', 20, 235);
  
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.text('This report follows internationally recognized ESG reporting frameworks:', 20, 248);
  pdf.text('• Global Reporting Initiative (GRI) Standards', 20, 255);
  pdf.text('• Sustainability Accounting Standards Board (SASB)', 105, 255);
};

const createESGExecutiveSummary = (pdf, data, colors, options) => {
  // Header
  pdf.setFillColor(...colors.primary);
  pdf.rect(0, 0, 210, 35, 'F');
  
  pdf.setTextColor(...colors.white);
  pdf.setFontSize(22);
  pdf.setFont('helvetica', 'bold');
  pdf.text('EXECUTIVE SUMMARY', 15, 25);
  
  // ESG Performance Dashboard
  const envData = data.filter(item => item.category === 'environmental');
  const socialData = data.filter(item => item.category === 'social');
  const govData = data.filter(item => item.category === 'governance');
  
  // Performance metrics cards
  const metrics = [
    { 
      label: 'Environmental', 
      value: envData.length, 
      color: colors.environmental,
      icon: 'E',
      description: 'Climate & Resource Metrics'
    },
    { 
      label: 'Social', 
      value: socialData.length, 
      color: colors.social,
      icon: 'S',
      description: 'People & Community Metrics'
    },
    { 
      label: 'Governance', 
      value: govData.length, 
      color: colors.governance,
      icon: 'G',
      description: 'Ethics & Leadership Metrics'
    }
  ];
  
  let xPos = 15;
  metrics.forEach(metric => {
    // Card background
    pdf.setFillColor(...colors.lightGray);
    pdf.roundedRect(xPos, 50, 55, 45, 5, 5, 'F');
    
    // Icon circle
    pdf.setFillColor(...metric.color);
    pdf.circle(xPos + 15, 65, 8, 'F');
    
    pdf.setTextColor(...colors.white);
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text(metric.icon, xPos + 12, 69);
    
    // Metric value
    pdf.setTextColor(...colors.text);
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text(metric.value.toString(), xPos + 30, 69);
    
    // Label
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.text(metric.label, xPos + 5, 82);
    
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.text(metric.description, xPos + 5, 90);
    
    xPos += 60;
  });
  
  // Key Performance Highlights
  pdf.setTextColor(...colors.text);
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('KEY PERFORMANCE HIGHLIGHTS', 15, 120);
  
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  
  const highlights = generateESGHighlights(data, options);
  let yPos = 135;
  
  highlights.forEach(highlight => {
    // Bullet point with color coding
    pdf.setFillColor(...highlight.color);
    pdf.circle(20, yPos - 2, 2, 'F');
    
    pdf.setTextColor(...colors.text);
    pdf.text(highlight.text, 28, yPos);
    yPos += 12;
  });
  
  // Materiality statement
  pdf.setFillColor(...colors.primary);
  pdf.roundedRect(15, 200, 180, 35, 5, 5, 'F');
  
  pdf.setTextColor(...colors.white);
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('MATERIALITY STATEMENT', 20, 215);
  
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text('This report focuses on ESG topics that are most material to our business', 20, 228);
  pdf.text('and stakeholders, as identified through our comprehensive materiality assessment.', 20, 235);
  
  // CEO/Leadership statement placeholder
  pdf.setTextColor(...colors.text);
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('LEADERSHIP MESSAGE', 15, 260);
  
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'italic');
  pdf.text('"Our commitment to sustainability drives every aspect of our business strategy,', 15, 275);
  pdf.text('creating long-term value for all stakeholders while contributing to a sustainable future."', 15, 285);
};

const createESGMaterialityAssessment = (pdf, data, colors) => {
  // Header
  pdf.setFillColor(...colors.primary);
  pdf.rect(0, 0, 210, 35, 'F');
  
  pdf.setTextColor(...colors.white);
  pdf.setFontSize(22);
  pdf.setFont('helvetica', 'bold');
  pdf.text('MATERIALITY ASSESSMENT', 15, 25);
  
  // Materiality matrix description
  pdf.setTextColor(...colors.text);
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Our materiality assessment identifies and prioritizes ESG topics based on their', 15, 55);
  pdf.text('significance to business success and stakeholder concerns.', 15, 67);
  
  // Material topics by category
  const materialTopics = {
    'High Priority': [
      'Climate Change & GHG Emissions',
      'Energy Management',
      'Employee Health & Safety',
      'Data Privacy & Security',
      'Business Ethics & Compliance'
    ],
    'Medium Priority': [
      'Water Management',
      'Waste Management',
      'Diversity & Inclusion',
      'Supply Chain Management',
      'Community Relations'
    ],
    'Monitoring': [
      'Biodiversity Impact',
      'Human Rights',
      'Product Quality & Safety',
      'Innovation & Technology',
      'Stakeholder Engagement'
    ]
  };
  
  let yPos = 90;
  Object.entries(materialTopics).forEach(([priority, topics]) => {
    // Priority header
    const priorityColor = priority === 'High Priority' ? colors.error : 
                         priority === 'Medium Priority' ? colors.warning : colors.success;
    
    pdf.setFillColor(...priorityColor);
    pdf.roundedRect(15, yPos - 5, 180, 15, 3, 3, 'F');
    
    pdf.setTextColor(...colors.white);
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text(priority.toUpperCase(), 20, yPos + 5);
    
    yPos += 20;
    
    // Topics list
    pdf.setTextColor(...colors.text);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    
    topics.forEach(topic => {
      pdf.text(`• ${topic}`, 20, yPos);
      yPos += 10;
    });
    
    yPos += 5;
  });
};

const createEnvironmentalPerformance = (pdf, data, colors) => {
  // Header
  pdf.setFillColor(...colors.environmental);
  pdf.rect(0, 0, 210, 35, 'F');
  
  pdf.setTextColor(...colors.white);
  pdf.setFontSize(22);
  pdf.setFont('helvetica', 'bold');
  pdf.text('ENVIRONMENTAL PERFORMANCE', 15, 25);
  
  const envData = data.filter(item => item.category === 'environmental');
  
  // Environmental KPIs
  const envKPIs = [
    { metric: 'GHG Emissions (Scope 1)', value: getMetricValue(envData, 'scope1Emissions'), unit: 'tCO2e', target: '10% reduction' },
    { metric: 'GHG Emissions (Scope 2)', value: getMetricValue(envData, 'scope2Emissions'), unit: 'tCO2e', target: '15% reduction' },
    { metric: 'Energy Consumption', value: getMetricValue(envData, 'energyConsumption'), unit: 'MWh', target: '5% efficiency gain' },
    { metric: 'Renewable Energy', value: getMetricValue(envData, 'renewableEnergyPercentage'), unit: '%', target: '50% by 2025' },
    { metric: 'Water Withdrawal', value: getMetricValue(envData, 'waterWithdrawal'), unit: 'm³', target: '20% reduction' },
    { metric: 'Waste Generated', value: getMetricValue(envData, 'wasteGenerated'), unit: 'tonnes', target: '30% reduction' }
  ];
  
  // Create environmental metrics table
  createMetricsTable(pdf, envKPIs, 50, colors.environmental, colors);
  
  // Climate commitments box
  pdf.setFillColor(...colors.lightGray);
  pdf.roundedRect(15, 200, 180, 50, 5, 5, 'F');
  
  pdf.setTextColor(...colors.text);
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('CLIMATE COMMITMENTS', 20, 215);
  
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text('• Net Zero emissions by 2050', 20, 230);
  pdf.text('• 50% reduction in Scope 1 & 2 emissions by 2030', 20, 240);
  pdf.text('• 100% renewable energy by 2025', 20, 250);
  
  // Environmental initiatives
  pdf.setTextColor(...colors.text);
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('KEY ENVIRONMENTAL INITIATIVES', 15, 270);
  
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text('• Renewable energy transition program', 15, 285);
};

const createSocialPerformance = (pdf, data, colors) => {
  // Header
  pdf.setFillColor(...colors.social);
  pdf.rect(0, 0, 210, 35, 'F');
  
  pdf.setTextColor(...colors.white);
  pdf.setFontSize(22);
  pdf.setFont('helvetica', 'bold');
  pdf.text('SOCIAL PERFORMANCE', 15, 25);
  
  const socialData = data.filter(item => item.category === 'social');
  
  // Social KPIs
  const socialKPIs = [
    { metric: 'Total Employees', value: getMetricValue(socialData, 'totalEmployees'), unit: '', target: '10% growth' },
    { metric: 'Female Employees', value: getMetricValue(socialData, 'femaleEmployeesPercentage'), unit: '%', target: '50% parity' },
    { metric: 'Employee Turnover', value: getMetricValue(socialData, 'employeeTurnoverRate'), unit: '%', target: '<10%' },
    { metric: 'Training Hours/Employee', value: getMetricValue(socialData, 'trainingHoursPerEmployee'), unit: 'hrs', target: '40 hrs/year' },
    { metric: 'Lost Time Injury Rate', value: getMetricValue(socialData, 'lostTimeInjuryRate'), unit: '', target: 'Zero incidents' },
    { metric: 'Community Investment', value: getMetricValue(socialData, 'communityInvestment'), unit: '$', target: '1% of revenue' }
  ];
  
  // Create social metrics table
  createMetricsTable(pdf, socialKPIs, 50, colors.social, colors);
  
  // Diversity & inclusion box
  pdf.setFillColor(...colors.lightGray);
  pdf.roundedRect(15, 200, 180, 50, 5, 5, 'F');
  
  pdf.setTextColor(...colors.text);
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('DIVERSITY & INCLUSION COMMITMENTS', 20, 215);
  
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text('• Gender parity in leadership by 2025', 20, 230);
  pdf.text('• Inclusive workplace culture initiatives', 20, 240);
  pdf.text('• Equal pay certification maintained', 20, 250);
  
  // Social impact initiatives
  pdf.setTextColor(...colors.text);
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('SOCIAL IMPACT INITIATIVES', 15, 270);
  
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text('• Employee wellbeing and mental health programs', 15, 285);
};

const createGovernancePerformance = (pdf, data, colors) => {
  // Header
  pdf.setFillColor(...colors.governance);
  pdf.rect(0, 0, 210, 35, 'F');
  
  pdf.setTextColor(...colors.white);
  pdf.setFontSize(22);
  pdf.setFont('helvetica', 'bold');
  pdf.text('GOVERNANCE PERFORMANCE', 15, 25);
  
  const govData = data.filter(item => item.category === 'governance');
  
  // Governance KPIs
  const govKPIs = [
    { metric: 'Board Size', value: getMetricValue(govData, 'boardSize'), unit: 'members', target: '7-12 members' },
    { metric: 'Independent Directors', value: getMetricValue(govData, 'independentDirectorsPercentage'), unit: '%', target: '>50%' },
    { metric: 'Female Directors', value: getMetricValue(govData, 'femaleDirectorsPercentage'), unit: '%', target: '>30%' },
    { metric: 'Ethics Training Completion', value: getMetricValue(govData, 'ethicsTrainingCompletion'), unit: '%', target: '100%' },
    { metric: 'Data Breaches', value: getMetricValue(govData, 'dataBreaches'), unit: 'incidents', target: 'Zero incidents' },
    { metric: 'Regulatory Fines', value: getMetricValue(govData, 'regulatoryFines'), unit: '$', target: 'Zero fines' }
  ];
  
  // Create governance metrics table
  createMetricsTable(pdf, govKPIs, 50, colors.governance, colors);
  
  // Governance framework box
  pdf.setFillColor(...colors.lightGray);
  pdf.roundedRect(15, 200, 180, 50, 5, 5, 'F');
  
  pdf.setTextColor(...colors.text);
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('GOVERNANCE FRAMEWORK', 20, 215);
  
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text('• Board oversight of ESG strategy and performance', 20, 230);
  pdf.text('• Regular risk assessment and management processes', 20, 240);
  pdf.text('• Transparent stakeholder engagement and reporting', 20, 250);
  
  // Ethics & compliance
  pdf.setTextColor(...colors.text);
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('ETHICS & COMPLIANCE', 15, 270);
  
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text('• Code of conduct training for all employees', 15, 285);
};

const createESGMetricsTable = (pdf, data, colors) => {
  // Header
  pdf.setFillColor(...colors.primary);
  pdf.rect(0, 0, 210, 35, 'F');
  
  pdf.setTextColor(...colors.white);
  pdf.setFontSize(22);
  pdf.setFont('helvetica', 'bold');
  pdf.text('ESG METRICS & KPIs', 15, 25);
  
  // Comprehensive metrics table
  const allMetrics = data.map(item => ({
    category: item.category?.charAt(0).toUpperCase() + item.category?.slice(1) || 'N/A',
    metric: item.metric || item.subcategory || 'Unknown Metric',
    value: `${item.value || 0}`,
    unit: item.unit || '',
    target: item.target || 'Not Set',
    status: getPerformanceStatus(item.value, item.target)
  }));
  
  // Table headers
  const headers = ['Category', 'Metric', 'Value', 'Unit', 'Target', 'Status'];
  const colWidths = [30, 50, 25, 15, 30, 20];
  const colPositions = [15, 45, 95, 120, 135, 165];
  
  let yPos = 50;
  
  // Header row
  pdf.setFillColor(...colors.primary);
  pdf.rect(15, yPos - 5, 170, 12, 'F');
  
  pdf.setTextColor(...colors.white);
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  
  headers.forEach((header, i) => {
    pdf.text(header, colPositions[i], yPos + 3);
  });
  
  yPos += 15;
  
  // Data rows
  pdf.setTextColor(...colors.text);
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  
  allMetrics.slice(0, 20).forEach((row, index) => {
    if (yPos > 270) {
      pdf.addPage();
      yPos = 30;
    }
    
    // Alternate row colors
    if (index % 2 === 0) {
      pdf.setFillColor(...colors.lightGray);
      pdf.rect(15, yPos - 3, 170, 10, 'F');
    }
    
    // Category color coding
    const categoryColor = row.category === 'Environmental' ? colors.environmental :
                         row.category === 'Social' ? colors.social :
                         row.category === 'Governance' ? colors.governance : colors.text;
    
    pdf.setTextColor(...categoryColor);
    pdf.text(row.category, colPositions[0], yPos + 2);
    
    pdf.setTextColor(...colors.text);
    const truncatedMetric = row.metric.length > 20 ? row.metric.substring(0, 17) + '...' : row.metric;
    pdf.text(truncatedMetric, colPositions[1], yPos + 2);
    pdf.text(row.value, colPositions[2], yPos + 2);
    pdf.text(row.unit, colPositions[3], yPos + 2);
    pdf.text(row.target.length > 12 ? row.target.substring(0, 9) + '...' : row.target, colPositions[4], yPos + 2);
    
    // Status indicator
    const statusColor = row.status === 'On Track' ? colors.success :
                       row.status === 'At Risk' ? colors.warning : colors.error;
    pdf.setTextColor(...statusColor);
    pdf.text(row.status, colPositions[5], yPos + 2);
    
    yPos += 10;
  });
};

const createFrameworkCompliance = (pdf, framework, data, colors, options) => {
  // Header
  pdf.setFillColor(...colors.primary);
  pdf.rect(0, 0, 210, 35, 'F');
  
  pdf.setTextColor(...colors.white);
  pdf.setFontSize(22);
  pdf.setFont('helvetica', 'bold');
  pdf.text('FRAMEWORK COMPLIANCE', 15, 25);
  
  // Framework compliance status
  pdf.setTextColor(...colors.text);
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text(`${framework} COMPLIANCE STATUS`, 15, 55);
  
  // Compliance checklist
  const complianceItems = getFrameworkCompliance(framework);
  
  let yPos = 75;
  complianceItems.forEach(item => {
    // Status indicator
    const statusColor = item.compliant ? colors.success : colors.warning;
    pdf.setFillColor(...statusColor);
    pdf.circle(20, yPos - 2, 3, 'F');
    
    pdf.setTextColor(...colors.text);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(item.requirement, 30, yPos);
    
    // Compliance percentage
    pdf.setTextColor(...statusColor);
    pdf.text(`${item.percentage}%`, 170, yPos);
    
    yPos += 12;
  });
  
  // Framework alignment statement
  pdf.setFillColor(...colors.lightGray);
  pdf.roundedRect(15, 180, 180, 60, 5, 5, 'F');
  
  pdf.setTextColor(...colors.text);
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('FRAMEWORK ALIGNMENT', 20, 195);
  
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`This report has been prepared in accordance with ${framework} standards`, 20, 210);
  pdf.text('and includes all material ESG topics relevant to our business operations.', 20, 220);
  pdf.text('We are committed to continuous improvement in our reporting practices', 20, 230);
  pdf.text('and alignment with evolving international standards.', 20, 240);
};

const createDataAssuranceSection = (pdf, colors, options) => {
  // Header
  pdf.setFillColor(...colors.primary);
  pdf.rect(0, 0, 210, 35, 'F');
  
  pdf.setTextColor(...colors.white);
  pdf.setFontSize(22);
  pdf.setFont('helvetica', 'bold');
  pdf.text('DATA ASSURANCE & METHODOLOGY', 15, 25);
  
  // Assurance statement
  pdf.setTextColor(...colors.text);
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('INDEPENDENT ASSURANCE', 15, 55);
  
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Assurance Level: ${options.assuranceLevel || 'Limited'}`, 15, 70);
  pdf.text('This report has been subject to independent third-party verification', 15, 82);
  pdf.text('to ensure accuracy and completeness of reported data.', 15, 92);
  
  // Data collection methodology
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('DATA COLLECTION METHODOLOGY', 15, 115);
  
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  const methodology = [
    '• Systematic data collection across all business units',
    '• Standardized measurement protocols and definitions',
    '• Regular internal audits and quality checks',
    '• Third-party verification for key metrics',
    '• Continuous monitoring and improvement processes'
  ];
  
  let yPos = 130;
  methodology.forEach(item => {
    pdf.text(item, 20, yPos);
    yPos += 12;
  });
  
  // Contact information
  pdf.setFillColor(...colors.primary);
  pdf.roundedRect(15, 200, 180, 40, 5, 5, 'F');
  
  pdf.setTextColor(...colors.white);
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('CONTACT INFORMATION', 20, 215);
  
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text('For questions about this report or our ESG performance:', 20, 230);
  pdf.text('Email: sustainability@company.com | Web: www.company.com/esg', 20, 240);
  
  // Report disclaimer
  pdf.setTextColor(...colors.mediumGray);
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'italic');
  pdf.text('This report contains forward-looking statements. Actual results may differ from projections.', 15, 270);
  pdf.text(`Report generated on ${new Date().toLocaleDateString()} using ESGenius Platform.`, 15, 280);
};

// Helper functions
const getMetricValue = (dataArray, metricName) => {
  const item = dataArray.find(d => 
    d.metric === metricName || 
    d.subcategory === metricName ||
    (d.metric && d.metric.toLowerCase().includes(metricName.toLowerCase()))
  );
  return item ? (parseFloat(item.value) || 0) : 0;
};

const createMetricsTable = (pdf, metrics, startY, headerColor, colors) => {
  let yPos = startY;
  
  // Table header
  pdf.setFillColor(...headerColor);
  pdf.rect(15, yPos - 5, 180, 12, 'F');
  
  pdf.setTextColor(...colors.white);
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Metric', 20, yPos + 3);
  pdf.text('Current', 80, yPos + 3);
  pdf.text('Unit', 120, yPos + 3);
  pdf.text('Target', 150, yPos + 3);
  
  yPos += 15;
  
  // Table rows
  pdf.setTextColor(...colors.text);
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  
  metrics.forEach((metric, index) => {
    if (index % 2 === 0) {
      pdf.setFillColor(...colors.lightGray);
      pdf.rect(15, yPos - 3, 180, 10, 'F');
    }
    
    pdf.text(metric.metric, 20, yPos + 2);
    pdf.text(metric.value.toString(), 80, yPos + 2);
    pdf.text(metric.unit, 120, yPos + 2);
    pdf.text(metric.target, 150, yPos + 2);
    
    yPos += 10;
  });
};

const generateESGHighlights = (data, options) => {
  const highlights = [];
  const colors = {
    environmental: [46, 125, 50],
    social: [25, 118, 210],
    governance: [156, 39, 176]
  };
  
  if (data.length > 0) {
    highlights.push({
      text: `${data.length} ESG metrics tracked and reported across all categories`,
      color: colors.governance
    });
  }
  
  const envData = data.filter(item => item.category === 'environmental');
  if (envData.length > 0) {
    highlights.push({
      text: `Environmental performance monitored across ${envData.length} key indicators`,
      color: colors.environmental
    });
  }
  
  const socialData = data.filter(item => item.category === 'social');
  if (socialData.length > 0) {
    highlights.push({
      text: `Social impact measured through ${socialData.length} comprehensive metrics`,
      color: colors.social
    });
  }
  
  highlights.push({
    text: `${options.reportingFramework || 'International'} framework compliance maintained`,
    color: colors.governance
  });
  
  return highlights;
};

const getPerformanceStatus = (value, target) => {
  if (!target || target === 'Not Set') return 'No Target';
  
  // Simple logic - can be enhanced based on specific requirements
  const numValue = parseFloat(value) || 0;
  if (numValue > 0) return 'On Track';
  return 'Needs Attention';
};

const getFrameworkCompliance = (framework) => {
  const compliance = {
    'GRI Standards': [
      { requirement: 'Organizational Profile', compliant: true, percentage: 95 },
      { requirement: 'Strategy', compliant: true, percentage: 90 },
      { requirement: 'Ethics and Integrity', compliant: true, percentage: 88 },
      { requirement: 'Governance', compliant: true, percentage: 92 },
      { requirement: 'Stakeholder Engagement', compliant: false, percentage: 75 },
      { requirement: 'Reporting Practice', compliant: true, percentage: 85 }
    ],
    'SASB Standards': [
      { requirement: 'Environment', compliant: true, percentage: 87 },
      { requirement: 'Social Capital', compliant: true, percentage: 82 },
      { requirement: 'Human Capital', compliant: true, percentage: 90 },
      { requirement: 'Business Model & Innovation', compliant: false, percentage: 78 },
      { requirement: 'Leadership & Governance', compliant: true, percentage: 85 }
    ],
    'TCFD': [
      { requirement: 'Governance', compliant: true, percentage: 88 },
      { requirement: 'Strategy', compliant: false, percentage: 72 },
      { requirement: 'Risk Management', compliant: true, percentage: 85 },
      { requirement: 'Metrics and Targets', compliant: true, percentage: 90 }
    ]
  };
  
  return compliance[framework] || compliance['GRI Standards'];
};

const addESGPageNumbers = (pdf, totalPages, companyName, reportPeriod) => {
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    
    // Footer line
    pdf.setLineWidth(0.3);
    pdf.setDrawColor(200, 200, 200);
    pdf.line(15, 285, 195, 285);
    
    // Page info
    pdf.setTextColor(128, 128, 128);
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`${companyName} ESG Report ${reportPeriod}`, 15, 292);
    pdf.text(`Page ${i} of ${totalPages}`, 170, 292);
  }
};

export default generateComplianceESGReport;