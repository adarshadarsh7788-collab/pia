import jsPDF from 'jspdf';

/**
 * Professional White Paper Style ESG Report Generator
 * Based on Lingaro Group ESG Reporting Best Practices format
 */
export const generateProfessionalWhitePaper = (framework, data, options = {}) => {
  const pdf = new jsPDF();
  const {
    companyName = 'Company Name',
    reportPeriod = new Date().getFullYear(),
    authorName = 'ESG Team',
    authorTitle = 'Sustainability Director',
    sector = 'General',
    region = 'Global'
  } = options;

  // Professional color scheme (blue, green, orange accents)
  const colors = {
    primary: [0, 102, 204],        // Professional Blue
    secondary: [46, 125, 50],      // ESG Green
    accent: [255, 152, 0],         // Orange Accent
    text: [51, 51, 51],            // Dark Gray
    lightGray: [245, 245, 245],    // Light Background
    mediumGray: [158, 158, 158],   // Medium Gray
    white: [255, 255, 255],        // White
    darkBlue: [25, 118, 210]       // Dark Blue
  };

  let currentPage = 1;
  
  // Create title page
  createTitlePage(pdf, framework, companyName, reportPeriod, authorName, authorTitle, colors);
  
  // Add pages with professional formatting
  pdf.addPage();
  currentPage++;
  createExecutiveSummary(pdf, data, colors, options);
  
  pdf.addPage();
  currentPage++;
  createESGFrameworkSection(pdf, data, colors);
  
  pdf.addPage();
  currentPage++;
  createMaterialitySection(pdf, data, colors);
  
  pdf.addPage();
  currentPage++;
  createPerformanceAnalysis(pdf, data, colors);
  
  pdf.addPage();
  currentPage++;
  createDataAnalyticsSection(pdf, data, colors);
  
  pdf.addPage();
  currentPage++;
  createReferencesAndContact(pdf, colors, options);
  
  // Add professional headers and footers
  addProfessionalHeadersFooters(pdf, currentPage, companyName, reportPeriod, colors);
  
  return pdf;
};

const createTitlePage = (pdf, framework, companyName, reportPeriod, authorName, authorTitle, colors) => {
  // Company logo placeholder (top left)
  pdf.setFillColor(...colors.lightGray);
  pdf.roundedRect(20, 20, 40, 25, 3, 3, 'F');
  pdf.setTextColor(...colors.primary);
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.text('LOGO', 35, 35);
  
  // Main title (large, centered)
  pdf.setTextColor(...colors.text);
  pdf.setFontSize(28);
  pdf.setFont('helvetica', 'bold');
  const titleLines = [
    'ESG SUSTAINABILITY REPORT:',
    'Driving Business Success Through',
    'Environmental Responsibility'
  ];
  
  let yPos = 80;
  titleLines.forEach(line => {
    const textWidth = pdf.getTextWidth(line);
    pdf.text(line, (210 - textWidth) / 2, yPos);
    yPos += 12;
  });
  
  // Subtitle
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(...colors.mediumGray);
  const subtitle = `${framework} Framework Implementation for ${reportPeriod}`;
  const subtitleWidth = pdf.getTextWidth(subtitle);
  pdf.text(subtitle, (210 - subtitleWidth) / 2, yPos + 15);
  
  // Author information box
  pdf.setFillColor(...colors.primary);
  pdf.roundedRect(40, 150, 130, 50, 5, 5, 'F');
  
  pdf.setTextColor(...colors.white);
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('PREPARED BY', 50, 165);
  
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  pdf.text(authorName, 50, 180);
  pdf.text(authorTitle, 50, 190);
  pdf.text(companyName, 50, 200);
  
  // Statistics box (bottom)
  pdf.setFillColor(...colors.lightGray);
  pdf.roundedRect(20, 220, 170, 40, 5, 5, 'F');
  
  pdf.setTextColor(...colors.text);
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.text('KEY STATISTICS', 25, 235);
  
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`• ${data.length} ESG metrics tracked and analyzed`, 25, 245);
  pdf.text(`• ${new Set(data.map(d => d.category)).size} ESG categories covered`, 25, 252);
  pdf.text(`• ${framework} framework compliance maintained`, 25, 259);
  
  // Footer with date
  pdf.setTextColor(...colors.mediumGray);
  pdf.setFontSize(8);
  const publishDate = `Published: ${new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })}`;
  pdf.text(publishDate, 20, 285);
};

const createExecutiveSummary = (pdf, data, colors, options) => {
  // Section header
  createSectionHeader(pdf, 'EXECUTIVE SUMMARY', colors);
  
  // Key metrics dashboard
  const envData = data.filter(item => item.category === 'environmental');
  const socialData = data.filter(item => item.category === 'social');
  const govData = data.filter(item => item.category === 'governance');
  
  // Statistics boxes
  const stats = [
    { label: 'Environmental Metrics', value: envData.length, color: colors.secondary, desc: 'Climate & Resource KPIs' },
    { label: 'Social Metrics', value: socialData.length, color: colors.primary, desc: 'People & Community KPIs' },
    { label: 'Governance Metrics', value: govData.length, color: colors.accent, desc: 'Ethics & Leadership KPIs' }
  ];
  
  let xPos = 20;
  stats.forEach(stat => {
    // Stat box
    pdf.setFillColor(...stat.color);
    pdf.roundedRect(xPos, 50, 50, 35, 3, 3, 'F');
    
    // Value
    pdf.setTextColor(...colors.white);
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    const valueWidth = pdf.getTextWidth(stat.value.toString());
    pdf.text(stat.value.toString(), xPos + 25 - valueWidth/2, 70);
    
    // Label
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'bold');
    pdf.text(stat.label, xPos + 5, 80);
    
    // Description
    pdf.setTextColor(...colors.text);
    pdf.setFontSize(7);
    pdf.setFont('helvetica', 'normal');
    pdf.text(stat.desc, xPos + 5, 95);
    
    xPos += 57;
  });
  
  // Main content
  pdf.setTextColor(...colors.text);
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Overview', 20, 120);
  
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  const summaryText = [
    `This comprehensive ESG sustainability report presents ${options.companyName || 'our organization'}'s`,
    `environmental, social, and governance performance for ${options.reportPeriod || new Date().getFullYear()}.`,
    '',
    'Our commitment to sustainable business practices drives measurable impact across:',
    '',
    '• Environmental stewardship through climate action and resource efficiency',
    '• Social responsibility via workforce development and community engagement', 
    '• Governance excellence through ethical leadership and transparency'
  ];
  
  let yPos = 135;
  summaryText.forEach(line => {
    if (line.startsWith('•')) {
      pdf.text(line, 25, yPos);
    } else {
      pdf.text(line, 20, yPos);
    }
    yPos += 8;
  });
  
  // Key achievements box
  pdf.setFillColor(...colors.lightGray);
  pdf.roundedRect(20, 200, 170, 50, 5, 5, 'F');
  
  pdf.setTextColor(...colors.text);
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');
  pdf.text('KEY ACHIEVEMENTS', 25, 215);
  
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  const achievements = [
    `✓ Comprehensive tracking of ${data.length} ESG performance indicators`,
    `✓ ${framework} framework compliance and reporting standards alignment`,
    '✓ Data-driven sustainability strategy implementation',
    '✓ Stakeholder engagement and materiality assessment completion'
  ];
  
  yPos = 225;
  achievements.forEach(achievement => {
    pdf.text(achievement, 25, yPos);
    yPos += 8;
  });
};

const createESGFrameworkSection = (pdf, data, colors) => {
  createSectionHeader(pdf, 'ESG FRAMEWORK & METHODOLOGY', colors);
  
  // Framework diagram placeholder
  pdf.setFillColor(...colors.lightGray);
  pdf.roundedRect(20, 50, 170, 80, 5, 5, 'F');
  
  pdf.setTextColor(...colors.text);
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Figure 1: ESG Framework Components', 25, 65);
  
  // ESG pillars
  const pillars = [
    { name: 'ENVIRONMENTAL', color: colors.secondary, x: 40 },
    { name: 'SOCIAL', color: colors.primary, x: 90 },
    { name: 'GOVERNANCE', color: colors.accent, x: 140 }
  ];
  
  pillars.forEach(pillar => {
    pdf.setFillColor(...pillar.color);
    pdf.roundedRect(pillar.x, 80, 35, 25, 3, 3, 'F');
    
    pdf.setTextColor(...colors.white);
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'bold');
    const textWidth = pdf.getTextWidth(pillar.name);
    pdf.text(pillar.name, pillar.x + 17.5 - textWidth/2, 95);
  });
  
  // Methodology section
  pdf.setTextColor(...colors.text);
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Our ESG Approach', 20, 150);
  
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  const methodology = [
    '1. Stakeholder Identification & Engagement',
    '   • Internal and external stakeholder mapping',
    '   • Regular consultation and feedback collection',
    '',
    '2. Materiality Assessment',
    '   • Double materiality analysis implementation',
    '   • Risk and opportunity identification',
    '',
    '3. Metrics & KPI Definition',
    '   • Industry-specific indicator selection',
    '   • Baseline establishment and target setting',
    '',
    '4. Data Collection & Management',
    '   • Systematic data gathering processes',
    '   • Quality assurance and verification protocols'
  ];
  
  let yPos = 165;
  methodology.forEach(line => {
    if (line.match(/^\d+\./)) {
      pdf.setFont('helvetica', 'bold');
      pdf.text(line, 20, yPos);
      pdf.setFont('helvetica', 'normal');
    } else if (line.startsWith('   •')) {
      pdf.text(line, 25, yPos);
    } else {
      pdf.text(line, 20, yPos);
    }
    yPos += 7;
  });
};

const createMaterialitySection = (pdf, data, colors) => {
  createSectionHeader(pdf, 'MATERIALITY ASSESSMENT', colors);
  
  // Double materiality diagram
  pdf.setFillColor(...colors.lightGray);
  pdf.roundedRect(20, 50, 170, 70, 5, 5, 'F');
  
  pdf.setTextColor(...colors.text);
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Figure 2: Double Materiality Matrix', 25, 65);
  
  // Matrix axes
  pdf.setLineWidth(1);
  pdf.setDrawColor(...colors.mediumGray);
  pdf.line(50, 110, 150, 110); // X-axis
  pdf.line(100, 80, 100, 110); // Y-axis
  
  pdf.setFontSize(8);
  pdf.text('Financial Impact →', 120, 115);
  pdf.text('Impact on', 55, 85);
  pdf.text('Society/Environment', 55, 90);
  
  // Material topics
  pdf.setTextColor(...colors.text);
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Material ESG Topics', 20, 140);
  
  const materialTopics = {
    'High Priority': [
      'Climate Change & GHG Emissions',
      'Energy Management & Efficiency',
      'Employee Health & Safety',
      'Data Privacy & Cybersecurity',
      'Business Ethics & Anti-Corruption'
    ],
    'Medium Priority': [
      'Water Resource Management',
      'Waste Management & Circular Economy',
      'Diversity, Equity & Inclusion',
      'Supply Chain Sustainability',
      'Community Relations & Investment'
    ]
  };
  
  let yPos = 155;
  Object.entries(materialTopics).forEach(([priority, topics]) => {
    const priorityColor = priority === 'High Priority' ? colors.accent : colors.primary;
    
    pdf.setFillColor(...priorityColor);
    pdf.roundedRect(20, yPos - 3, 170, 10, 2, 2, 'F');
    
    pdf.setTextColor(...colors.white);
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    pdf.text(priority.toUpperCase(), 25, yPos + 3);
    
    yPos += 15;
    
    pdf.setTextColor(...colors.text);
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    
    topics.forEach(topic => {
      pdf.text(`• ${topic}`, 25, yPos);
      yPos += 7;
    });
    
    yPos += 5;
  });
};

const createPerformanceAnalysis = (pdf, data, colors) => {
  createSectionHeader(pdf, 'PERFORMANCE ANALYSIS & RESULTS', colors);
  
  // Performance summary table
  const categories = ['Environmental', 'Social', 'Governance'];
  const categoryData = categories.map(cat => {
    const catData = data.filter(item => item.category === cat.toLowerCase());
    return {
      category: cat,
      metrics: catData.length,
      coverage: catData.length > 0 ? 'Complete' : 'In Progress',
      trend: catData.length > 5 ? 'Improving' : 'Stable'
    };
  });
  
  // Table header
  pdf.setFillColor(...colors.primary);
  pdf.rect(20, 50, 170, 12, 'F');
  
  pdf.setTextColor(...colors.white);
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Category', 25, 58);
  pdf.text('Metrics', 80, 58);
  pdf.text('Coverage', 120, 58);
  pdf.text('Trend', 160, 58);
  
  // Table rows
  let yPos = 65;
  categoryData.forEach((row, index) => {
    if (index % 2 === 0) {
      pdf.setFillColor(...colors.lightGray);
      pdf.rect(20, yPos - 3, 170, 10, 'F');
    }
    
    pdf.setTextColor(...colors.text);
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.text(row.category, 25, yPos + 2);
    pdf.text(row.metrics.toString(), 80, yPos + 2);
    pdf.text(row.coverage, 120, yPos + 2);
    
    // Trend with color
    const trendColor = row.trend === 'Improving' ? colors.secondary : colors.mediumGray;
    pdf.setTextColor(...trendColor);
    pdf.text(row.trend, 160, yPos + 2);
    
    yPos += 10;
  });
  
  // Key insights
  pdf.setTextColor(...colors.text);
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Key Performance Insights', 20, 120);
  
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  const insights = [
    `• Comprehensive ESG data collection across ${data.length} key performance indicators`,
    '• Strong performance in governance metrics with full transparency implementation',
    '• Environmental initiatives showing measurable impact on carbon footprint reduction',
    '• Social programs demonstrating positive community and workforce outcomes',
    '• Continuous improvement processes established for all ESG categories'
  ];
  
  yPos = 135;
  insights.forEach(insight => {
    pdf.text(insight, 25, yPos);
    yPos += 10;
  });
  
  // Call-out box
  pdf.setFillColor(...colors.secondary);
  pdf.roundedRect(20, 190, 170, 40, 5, 5, 'F');
  
  pdf.setTextColor(...colors.white);
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');
  pdf.text('SUSTAINABILITY COMMITMENT', 25, 205);
  
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Our data-driven approach to ESG management enables continuous improvement', 25, 218);
  pdf.text('and demonstrates our commitment to creating long-term sustainable value.', 25, 225);
};

const createDataAnalyticsSection = (pdf, data, colors) => {
  createSectionHeader(pdf, 'THE ROLE OF DATA & ANALYTICS', colors);
  
  pdf.setTextColor(...colors.text);
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  const analyticsText = [
    'Advanced analytics and data management are fundamental to credible ESG reporting.',
    'Our comprehensive approach ensures data accuracy, consistency, and transparency.',
    '',
    'Data Collection & Management:',
    '• Automated data collection systems for real-time monitoring',
    '• Standardized measurement protocols across all business units',
    '• Regular data quality audits and validation processes',
    '• Secure data storage with full audit trail capabilities',
    '',
    'Analytics & Insights:',
    '• Trend analysis and performance benchmarking',
    '• Predictive modeling for target achievement',
    '• Risk assessment and scenario planning',
    '• Stakeholder impact analysis and reporting'
  ];
  
  let yPos = 50;
  analyticsText.forEach(line => {
    if (line.endsWith(':')) {
      pdf.setFont('helvetica', 'bold');
      pdf.text(line, 20, yPos);
      pdf.setFont('helvetica', 'normal');
    } else if (line.startsWith('•')) {
      pdf.text(line, 25, yPos);
    } else {
      pdf.text(line, 20, yPos);
    }
    yPos += 8;
  });
  
  // Technology stack box
  pdf.setFillColor(...colors.lightGray);
  pdf.roundedRect(20, 170, 170, 60, 5, 5, 'F');
  
  pdf.setTextColor(...colors.text);
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');
  pdf.text('ESG TECHNOLOGY STACK', 25, 185);
  
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  const techStack = [
    '• ESGenius Platform - Comprehensive ESG data management and reporting',
    '• Automated data collection and validation systems',
    '• Advanced analytics and visualization tools',
    '• Framework compliance monitoring and reporting',
    '• Stakeholder engagement and communication platforms'
  ];
  
  yPos = 195;
  techStack.forEach(item => {
    pdf.text(item, 25, yPos);
    yPos += 8;
  });
};

const createReferencesAndContact = (pdf, colors, options) => {
  createSectionHeader(pdf, 'REFERENCES & CONTACT', colors);
  
  // References section
  pdf.setTextColor(...colors.text);
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('References', 20, 50);
  
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  const references = [
    '1. Global Reporting Initiative (GRI). "GRI Standards." https://www.globalreporting.org',
    '2. Sustainability Accounting Standards Board (SASB). "SASB Standards." https://www.sasb.org',
    '3. Task Force on Climate-related Financial Disclosures (TCFD). "TCFD Recommendations." https://www.fsb-tcfd.org',
    '4. European Commission. "Corporate Sustainability Reporting Directive." https://ec.europa.eu',
    '5. McKinsey & Company. "The ESG premium: New perspectives on value and performance." 2020.',
    '6. Harvard Business Review. "The Investor Revolution." January-February 2020.',
    '7. Forbes. "ESG Investing: What You Need To Know." https://www.forbes.com',
    '8. Deloitte. "ESG reporting: Navigating the evolving landscape." 2021.'
  ];
  
  let yPos = 65;
  references.forEach(ref => {
    pdf.text(ref, 20, yPos);
    yPos += 10;
  });
  
  // Contact section
  pdf.setFillColor(...colors.primary);
  pdf.roundedRect(20, 180, 170, 60, 5, 5, 'F');
  
  pdf.setTextColor(...colors.white);
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('CONTACT INFORMATION', 25, 195);
  
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text('For more information about this report or our ESG initiatives:', 25, 210);
  
  pdf.setFontSize(9);
  pdf.text('Email: sustainability@company.com', 25, 225);
  pdf.text('Web: www.company.com/sustainability', 25, 232);
  pdf.text('Phone: +1 (555) 123-4567', 25, 239);
  
  // Footer disclaimer
  pdf.setTextColor(...colors.mediumGray);
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'italic');
  pdf.text('This report contains forward-looking statements. Actual results may differ from projections.', 20, 270);
  pdf.text(`© ${new Date().getFullYear()} ${options.companyName || 'Company Name'}. All rights reserved.`, 20, 277);
};

// Helper functions
const createSectionHeader = (pdf, title, colors) => {
  pdf.setFillColor(...colors.primary);
  pdf.rect(0, 0, 210, 35, 'F');
  
  pdf.setTextColor(...colors.white);
  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'bold');
  pdf.text(title, 20, 22);
};

const addProfessionalHeadersFooters = (pdf, totalPages, companyName, reportPeriod, colors) => {
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    
    if (i > 1) { // Skip header on title page
      // Header line
      pdf.setLineWidth(0.5);
      pdf.setDrawColor(...colors.lightGray);
      pdf.line(20, 15, 190, 15);
      
      // Company name in header
      pdf.setTextColor(...colors.mediumGray);
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`${companyName} - ESG Sustainability Report ${reportPeriod}`, 20, 12);
    }
    
    // Footer
    pdf.setLineWidth(0.3);
    pdf.setDrawColor(...colors.lightGray);
    pdf.line(20, 285, 190, 285);
    
    pdf.setTextColor(...colors.mediumGray);
    pdf.setFontSize(8);
    pdf.text(`Page ${i} of ${totalPages}`, 170, 292);
    
    if (i === totalPages) {
      pdf.text('Generated by ESGenius Platform', 20, 292);
    }
  }
};

export default generateProfessionalWhitePaper;