import jsPDF from 'jspdf';

// GRI Standards specific PDF generator
export const generateGRIPDF = (data, options = {}) => {
  const pdf = new jsPDF();
  const { companyName = 'Company', reportPeriod = new Date().getFullYear() } = options;
  
  // GRI Header
  pdf.setFontSize(20);
  pdf.setTextColor(0, 102, 51);
  pdf.text('GRI STANDARDS REPORT', 20, 25);
  
  pdf.setFontSize(12);
  pdf.setTextColor(0, 0, 0);
  pdf.text(`Company: ${companyName}`, 20, 40);
  pdf.text(`Reporting Period: ${reportPeriod}`, 20, 50);
  pdf.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 60);
  
  // GRI-specific sections
  let yPos = 80;
  
  // GRI 102: General Disclosures
  pdf.setFontSize(14);
  pdf.setTextColor(0, 102, 51);
  pdf.text('GRI 102: GENERAL DISCLOSURES', 20, yPos);
  yPos += 20;
  
  pdf.setFontSize(10);
  pdf.setTextColor(0, 0, 0);
  pdf.text('102-1 Name of the organization: ' + companyName, 20, yPos);
  yPos += 10;
  pdf.text('102-2 Activities, brands, products, and services', 20, yPos);
  yPos += 10;
  pdf.text('102-3 Location of headquarters', 20, yPos);
  yPos += 20;
  
  // GRI 300: Environmental
  pdf.setFontSize(14);
  pdf.setTextColor(0, 102, 51);
  pdf.text('GRI 300: ENVIRONMENTAL', 20, yPos);
  yPos += 15;
  
  const envData = data.filter(d => d.category === 'environmental');
  envData.forEach(item => {
    if (yPos > 270) { pdf.addPage(); yPos = 30; }
    pdf.setFontSize(10);
    pdf.text(`• ${item.metric}: ${item.value}`, 25, yPos);
    yPos += 8;
  });
  
  return pdf;
};

// SASB specific PDF generator
export const generateSASBPDF = (data, options = {}) => {
  const pdf = new jsPDF();
  const { companyName = 'Company', reportPeriod = new Date().getFullYear() } = options;
  
  // SASB Header
  pdf.setFontSize(20);
  pdf.setTextColor(0, 51, 102);
  pdf.text('SASB STANDARDS REPORT', 20, 25);
  
  pdf.setFontSize(12);
  pdf.text(`Company: ${companyName}`, 20, 40);
  pdf.text(`Industry: Technology & Communications`, 20, 50);
  pdf.text(`Reporting Period: ${reportPeriod}`, 20, 60);
  
  let yPos = 80;
  
  // SASB Materiality Map
  pdf.setFontSize(14);
  pdf.setTextColor(0, 51, 102);
  pdf.text('MATERIALITY MAP', 20, yPos);
  yPos += 20;
  
  // Industry-specific metrics
  pdf.setFontSize(12);
  pdf.text('Key Performance Indicators:', 20, yPos);
  yPos += 15;
  
  data.forEach(item => {
    if (yPos > 270) { pdf.addPage(); yPos = 30; }
    pdf.setFontSize(10);
    pdf.text(`${item.metric}: ${item.value} (${item.category})`, 25, yPos);
    yPos += 8;
  });
  
  return pdf;
};

// TCFD specific PDF generator
export const generateTCFDPDF = (data, options = {}) => {
  const pdf = new jsPDF();
  const { companyName = 'Company', reportPeriod = new Date().getFullYear() } = options;
  
  // TCFD Header
  pdf.setFontSize(20);
  pdf.setTextColor(102, 0, 51);
  pdf.text('TCFD CLIMATE REPORT', 20, 25);
  
  pdf.setFontSize(12);
  pdf.text(`Company: ${companyName}`, 20, 40);
  pdf.text(`Reporting Period: ${reportPeriod}`, 20, 50);
  
  let yPos = 70;
  
  // TCFD Four Pillars
  const pillars = [
    'GOVERNANCE',
    'STRATEGY', 
    'RISK MANAGEMENT',
    'METRICS AND TARGETS'
  ];
  
  pillars.forEach(pillar => {
    if (yPos > 250) { pdf.addPage(); yPos = 30; }
    
    pdf.setFontSize(14);
    pdf.setTextColor(102, 0, 51);
    pdf.text(pillar, 20, yPos);
    yPos += 15;
    
    const pillarData = data.filter(d => 
      d.metric.toLowerCase().includes(pillar.toLowerCase().split(' ')[0])
    );
    
    if (pillarData.length === 0) {
      pdf.setFontSize(10);
      pdf.setTextColor(128, 128, 128);
      pdf.text('No data available for this pillar', 25, yPos);
      yPos += 10;
    } else {
      pillarData.forEach(item => {
        pdf.setFontSize(10);
        pdf.setTextColor(0, 0, 0);
        pdf.text(`• ${item.metric}: ${item.value}`, 25, yPos);
        yPos += 8;
      });
    }
    yPos += 10;
  });
  
  return pdf;
};

// SEBI BRSR specific PDF generator
export const generateBRSRPDF = (data, options = {}) => {
  const pdf = new jsPDF();
  const { companyName = 'Company', reportPeriod = new Date().getFullYear() } = options;
  
  // BRSR Header
  pdf.setFontSize(20);
  pdf.setTextColor(255, 102, 0);
  pdf.text('SEBI BRSR REPORT', 20, 25);
  
  pdf.setFontSize(12);
  pdf.setTextColor(0, 0, 0);
  pdf.text(`Company: ${companyName}`, 20, 40);
  pdf.text(`Financial Year: ${reportPeriod}`, 20, 50);
  pdf.text(`CIN: [Company Identification Number]`, 20, 60);
  
  let yPos = 80;
  
  // BRSR Sections A, B, C
  const sections = [
    { name: 'SECTION A: GENERAL DISCLOSURES', data: data },
    { name: 'SECTION B: MANAGEMENT AND PROCESS DISCLOSURES', data: data.filter(d => d.category === 'governance') },
    { name: 'SECTION C: PRINCIPLE-WISE PERFORMANCE DISCLOSURE', data: data }
  ];
  
  sections.forEach(section => {
    if (yPos > 250) { pdf.addPage(); yPos = 30; }
    
    pdf.setFontSize(14);
    pdf.setTextColor(255, 102, 0);
    pdf.text(section.name, 20, yPos);
    yPos += 15;
    
    section.data.slice(0, 5).forEach(item => {
      if (yPos > 270) { pdf.addPage(); yPos = 30; }
      pdf.setFontSize(10);
      pdf.setTextColor(0, 0, 0);
      pdf.text(`${item.metric}: ${item.value}`, 25, yPos);
      yPos += 8;
    });
    yPos += 10;
  });
  
  return pdf;
};

// EU Taxonomy specific PDF generator
export const generateEUTaxonomyPDF = (data, options = {}) => {
  const pdf = new jsPDF();
  const { companyName = 'Company', reportPeriod = new Date().getFullYear() } = options;
  
  // EU Taxonomy Header
  pdf.setFontSize(20);
  pdf.setTextColor(0, 51, 153);
  pdf.text('EU TAXONOMY REPORT', 20, 25);
  
  pdf.setFontSize(12);
  pdf.text(`Company: ${companyName}`, 20, 40);
  pdf.text(`Reporting Period: ${reportPeriod}`, 20, 50);
  
  let yPos = 70;
  
  // EU Taxonomy Objectives
  const objectives = [
    'Climate Change Mitigation',
    'Climate Change Adaptation', 
    'Sustainable Use of Water',
    'Circular Economy',
    'Pollution Prevention',
    'Biodiversity Protection'
  ];
  
  objectives.forEach(objective => {
    if (yPos > 250) { pdf.addPage(); yPos = 30; }
    
    pdf.setFontSize(12);
    pdf.setTextColor(0, 51, 153);
    pdf.text(objective, 20, yPos);
    yPos += 10;
    
    pdf.setFontSize(10);
    pdf.setTextColor(0, 0, 0);
    pdf.text('• Eligible Activities: 0%', 25, yPos);
    yPos += 8;
    pdf.text('• Aligned Activities: 0%', 25, yPos);
    yPos += 15;
  });
  
  return pdf;
};