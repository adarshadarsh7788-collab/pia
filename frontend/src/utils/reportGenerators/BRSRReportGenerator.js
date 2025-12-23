// SEBI BRSR (Business Responsibility and Sustainability Reporting) Generator
import jsPDF from 'jspdf';

export class BRSRReportGenerator {
  static generateReport(data, options = {}) {
    const pdf = new jsPDF();
    const { companyName = 'Company', reportingYear = new Date().getFullYear() } = options;

    // BRSR Header
    pdf.setFontSize(20);
    pdf.setTextColor(0, 102, 51);
    pdf.text('BUSINESS RESPONSIBILITY AND SUSTAINABILITY REPORT', 20, 25);
    
    pdf.setFontSize(14);
    pdf.setTextColor(0, 0, 0);
    pdf.text(`Company: ${companyName}`, 20, 40);
    pdf.text(`Financial Year: ${reportingYear}`, 20, 50);
    pdf.text(`Report Date: ${new Date().toLocaleDateString()}`, 20, 60);

    let yPos = 80;

    // Section A: General Disclosures
    pdf.setFontSize(16);
    pdf.setTextColor(0, 102, 51);
    pdf.text('SECTION A: GENERAL DISCLOSURES', 20, yPos);
    yPos += 20;

    const sectionA = this.extractSectionA(data);
    Object.entries(sectionA).forEach(([key, value]) => {
      if (yPos > 270) { pdf.addPage(); yPos = 30; }
      pdf.setFontSize(10);
      pdf.setTextColor(0, 0, 0);
      pdf.text(`${key}: ${value}`, 20, yPos);
      yPos += 8;
    });

    // Section B: Management and Process Disclosures
    yPos += 10;
    if (yPos > 250) { pdf.addPage(); yPos = 30; }
    pdf.setFontSize(16);
    pdf.setTextColor(0, 102, 51);
    pdf.text('SECTION B: MANAGEMENT AND PROCESS DISCLOSURES', 20, yPos);
    yPos += 20;

    const principleData = this.extractPrincipleData(data);
    principleData.forEach((principle, index) => {
      if (yPos > 260) { pdf.addPage(); yPos = 30; }
      pdf.setFontSize(12);
      pdf.setTextColor(0, 0, 0);
      pdf.text(`Principle ${index + 1}: ${principle.title}`, 20, yPos);
      yPos += 10;
      pdf.setFontSize(10);
      pdf.text(`Performance: ${principle.performance}`, 25, yPos);
      yPos += 15;
    });

    // Section C: Principle-wise Performance Disclosure
    pdf.addPage();
    yPos = 30;
    pdf.setFontSize(16);
    pdf.setTextColor(0, 102, 51);
    pdf.text('SECTION C: PRINCIPLE-WISE PERFORMANCE DISCLOSURE', 20, yPos);
    yPos += 20;

    const performanceMetrics = this.extractPerformanceMetrics(data);
    performanceMetrics.forEach(metric => {
      if (yPos > 270) { pdf.addPage(); yPos = 30; }
      pdf.setFontSize(10);
      pdf.text(`${metric.indicator}: ${metric.value} ${metric.unit}`, 20, yPos);
      yPos += 8;
    });

    return pdf;
  }

  static extractSectionA(data) {
    return {
      'Corporate Identity Number (CIN)': 'L72900DL2010PLC198141',
      'Name of the Company': data.companyName || 'Company Name',
      'Year of Incorporation': '2010',
      'Registered Office Address': 'New Delhi, India',
      'Corporate Website': 'www.company.com',
      'E-mail ID': 'sustainability@company.com',
      'Telephone': '+91-11-XXXXXXXX',
      'Reporting Boundary': 'Standalone',
      'Name of Assurance Provider': 'External Auditor',
      'Type of Assurance': 'Limited Assurance'
    };
  }

  static extractPrincipleData(data) {
    return [
      { title: 'Businesses should conduct and govern themselves with integrity', performance: 'Compliant' },
      { title: 'Businesses should provide goods and services in a manner that is sustainable', performance: 'Compliant' },
      { title: 'Businesses should respect and promote the well-being of all employees', performance: 'Compliant' },
      { title: 'Businesses should respect the interests of and be responsive to all its stakeholders', performance: 'Compliant' },
      { title: 'Businesses should respect and promote human rights', performance: 'Compliant' },
      { title: 'Businesses should respect and make efforts to protect and restore the environment', performance: 'Compliant' },
      { title: 'Businesses should support inclusive growth and equitable development', performance: 'Compliant' },
      { title: 'Businesses should promote innovation and technology for sustainable development', performance: 'Compliant' },
      { title: 'Businesses should engage with and provide value to their consumers responsibly', performance: 'Compliant' }
    ];
  }

  static extractPerformanceMetrics(data) {
    const metrics = [];
    
    // Environmental metrics
    if (data.environmental) {
      Object.entries(data.environmental).forEach(([key, value]) => {
        if (value && !isNaN(parseFloat(value))) {
          metrics.push({
            indicator: this.getBRSRIndicator(key),
            value: parseFloat(value).toFixed(2),
            unit: this.getBRSRUnit(key)
          });
        }
      });
    }

    // Social metrics
    if (data.social) {
      Object.entries(data.social).forEach(([key, value]) => {
        if (value && !isNaN(parseFloat(value))) {
          metrics.push({
            indicator: this.getBRSRIndicator(key),
            value: parseFloat(value).toFixed(2),
            unit: this.getBRSRUnit(key)
          });
        }
      });
    }

    // Governance metrics
    if (data.governance) {
      Object.entries(data.governance).forEach(([key, value]) => {
        if (value && !isNaN(parseFloat(value))) {
          metrics.push({
            indicator: this.getBRSRIndicator(key),
            value: parseFloat(value).toFixed(2),
            unit: this.getBRSRUnit(key)
          });
        }
      });
    }

    return metrics;
  }

  static getBRSRIndicator(key) {
    const indicators = {
      scope1_emissions: 'Total Scope 1 emissions',
      scope2_emissions: 'Total Scope 2 emissions',
      scope3_emissions: 'Total Scope 3 emissions',
      energy_consumption: 'Total energy consumption',
      renewable_energy: 'Renewable energy consumption',
      water_withdrawal: 'Water withdrawal',
      waste_generated: 'Waste generated',
      total_employees: 'Total number of employees',
      female_employees: 'Female employees',
      training_hours: 'Training hours per employee',
      board_size: 'Board size',
      independent_directors: 'Independent directors'
    };
    return indicators[key] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  static getBRSRUnit(key) {
    const units = {
      scope1_emissions: 'tCO2e',
      scope2_emissions: 'tCO2e',
      scope3_emissions: 'tCO2e',
      energy_consumption: 'MWh',
      renewable_energy: '%',
      water_withdrawal: 'm³',
      waste_generated: 'tonnes',
      total_employees: 'count',
      female_employees: '%',
      training_hours: 'hours',
      board_size: 'count',
      independent_directors: '%'
    };
    return units[key] || '';
  }
}

export default BRSRReportGenerator;