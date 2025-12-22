// GRI (Global Reporting Initiative) Standards Report Generator
import jsPDF from 'jspdf';

export class GRIReportGenerator {
  static generateReport(data, options = {}) {
    const pdf = new jsPDF();
    const { companyName = 'Company', reportingYear = new Date().getFullYear() } = options;

    // GRI Header
    pdf.setFontSize(20);
    pdf.setTextColor(0, 102, 51);
    pdf.text('GRI STANDARDS SUSTAINABILITY REPORT', 20, 25);
    
    pdf.setFontSize(14);
    pdf.setTextColor(0, 0, 0);
    pdf.text(`Organization: ${companyName}`, 20, 40);
    pdf.text(`Reporting Period: ${reportingYear}`, 20, 50);
    pdf.text(`GRI Standards Version: GRI Standards 2021`, 20, 60);
    pdf.text(`Report Date: ${new Date().toLocaleDateString()}`, 20, 70);

    let yPos = 90;

    // GRI 2: General Disclosures
    pdf.setFontSize(16);
    pdf.setTextColor(0, 102, 51);
    pdf.text('GRI 2: GENERAL DISCLOSURES', 20, yPos);
    yPos += 20;

    const generalDisclosures = this.extractGeneralDisclosures(data);
    generalDisclosures.forEach(disclosure => {
      if (yPos > 270) { pdf.addPage(); yPos = 30; }
      pdf.setFontSize(10);
      pdf.setTextColor(0, 0, 0);
      pdf.text(`${disclosure.code}: ${disclosure.title}`, 20, yPos);
      yPos += 6;
      pdf.text(`Response: ${disclosure.response}`, 25, yPos);
      yPos += 12;
    });

    // GRI 3: Material Topics
    if (yPos > 250) { pdf.addPage(); yPos = 30; }
    pdf.setFontSize(16);
    pdf.setTextColor(0, 102, 51);
    pdf.text('GRI 3: MATERIAL TOPICS', 20, yPos);
    yPos += 20;

    const materialTopics = this.extractMaterialTopics(data);
    materialTopics.forEach(topic => {
      if (yPos > 270) { pdf.addPage(); yPos = 30; }
      pdf.setFontSize(12);
      pdf.setTextColor(0, 0, 0);
      pdf.text(`Material Topic: ${topic.name}`, 20, yPos);
      yPos += 10;
      pdf.setFontSize(10);
      pdf.text(`GRI Standard: ${topic.standard}`, 25, yPos);
      yPos += 6;
      pdf.text(`Management Approach: ${topic.approach}`, 25, yPos);
      yPos += 15;
    });

    // Environmental Standards (GRI 300 Series)
    pdf.addPage();
    yPos = 30;
    pdf.setFontSize(16);
    pdf.setTextColor(0, 102, 51);
    pdf.text('ENVIRONMENTAL STANDARDS (GRI 300 SERIES)', 20, yPos);
    yPos += 20;

    const envMetrics = this.extractEnvironmentalMetrics(data);
    envMetrics.forEach(metric => {
      if (yPos > 270) { pdf.addPage(); yPos = 30; }
      pdf.setFontSize(10);
      pdf.text(`${metric.code}: ${metric.title}`, 20, yPos);
      yPos += 6;
      pdf.text(`Value: ${metric.value} ${metric.unit}`, 25, yPos);
      yPos += 12;
    });

    // Social Standards (GRI 400 Series)
    pdf.addPage();
    yPos = 30;
    pdf.setFontSize(16);
    pdf.setTextColor(0, 102, 51);
    pdf.text('SOCIAL STANDARDS (GRI 400 SERIES)', 20, yPos);
    yPos += 20;

    const socialMetrics = this.extractSocialMetrics(data);
    socialMetrics.forEach(metric => {
      if (yPos > 270) { pdf.addPage(); yPos = 30; }
      pdf.setFontSize(10);
      pdf.text(`${metric.code}: ${metric.title}`, 20, yPos);
      yPos += 6;
      pdf.text(`Value: ${metric.value} ${metric.unit}`, 25, yPos);
      yPos += 12;
    });

    return pdf;
  }

  static extractGeneralDisclosures(data) {
    return [
      { code: 'GRI 2-1', title: 'Organizational details', response: data.companyName || 'Organization Name' },
      { code: 'GRI 2-2', title: 'Entities included in sustainability reporting', response: 'Consolidated reporting boundary' },
      { code: 'GRI 2-3', title: 'Reporting period, frequency and contact point', response: 'Annual reporting cycle' },
      { code: 'GRI 2-4', title: 'Restatements of information', response: 'No restatements in current period' },
      { code: 'GRI 2-5', title: 'External assurance', response: 'Limited assurance provided' },
      { code: 'GRI 2-6', title: 'Activities, value chain and other business relationships', response: 'Described in annual report' },
      { code: 'GRI 2-7', title: 'Employees', response: `${data.social?.total_employees || 'Not disclosed'} total employees` },
      { code: 'GRI 2-9', title: 'Governance structure and composition', response: `${data.governance?.board_size || 'Not disclosed'} board members` }
    ];
  }

  static extractMaterialTopics(data) {
    return [
      { name: 'Climate Change', standard: 'GRI 305: Emissions', approach: 'Comprehensive climate strategy with science-based targets' },
      { name: 'Energy Management', standard: 'GRI 302: Energy', approach: 'Energy efficiency programs and renewable energy adoption' },
      { name: 'Water Management', standard: 'GRI 303: Water and Effluents', approach: 'Water stewardship and conservation initiatives' },
      { name: 'Employee Wellbeing', standard: 'GRI 403: Occupational Health and Safety', approach: 'Comprehensive health and safety management system' },
      { name: 'Diversity and Inclusion', standard: 'GRI 405: Diversity and Equal Opportunity', approach: 'Inclusive workplace policies and programs' }
    ];
  }

  static extractEnvironmentalMetrics(data) {
    const metrics = [];
    
    if (data.environmental) {
      const env = data.environmental;
      
      if (env.scope1_emissions) {
        metrics.push({
          code: 'GRI 305-1',
          title: 'Direct (Scope 1) GHG emissions',
          value: parseFloat(env.scope1_emissions).toFixed(2),
          unit: 'tCO2e'
        });
      }
      
      if (env.scope2_emissions) {
        metrics.push({
          code: 'GRI 305-2',
          title: 'Energy indirect (Scope 2) GHG emissions',
          value: parseFloat(env.scope2_emissions).toFixed(2),
          unit: 'tCO2e'
        });
      }
      
      if (env.scope3_emissions) {
        metrics.push({
          code: 'GRI 305-3',
          title: 'Other indirect (Scope 3) GHG emissions',
          value: parseFloat(env.scope3_emissions).toFixed(2),
          unit: 'tCO2e'
        });
      }
      
      if (env.energy_consumption) {
        metrics.push({
          code: 'GRI 302-1',
          title: 'Energy consumption within the organization',
          value: parseFloat(env.energy_consumption).toFixed(2),
          unit: 'MWh'
        });
      }
      
      if (env.water_withdrawal) {
        metrics.push({
          code: 'GRI 303-3',
          title: 'Water withdrawal',
          value: parseFloat(env.water_withdrawal).toFixed(2),
          unit: 'm³'
        });
      }
      
      if (env.waste_generated) {
        metrics.push({
          code: 'GRI 306-3',
          title: 'Waste generated',
          value: parseFloat(env.waste_generated).toFixed(2),
          unit: 'tonnes'
        });
      }
    }
    
    return metrics;
  }

  static extractSocialMetrics(data) {
    const metrics = [];
    
    if (data.social) {
      const social = data.social;
      
      if (social.total_employees) {
        metrics.push({
          code: 'GRI 2-7',
          title: 'Employees',
          value: parseInt(social.total_employees),
          unit: 'count'
        });
      }
      
      if (social.female_employees) {
        metrics.push({
          code: 'GRI 405-1',
          title: 'Diversity of governance bodies and employees',
          value: parseFloat(social.female_employees).toFixed(1),
          unit: '% female'
        });
      }
      
      if (social.training_hours) {
        metrics.push({
          code: 'GRI 404-1',
          title: 'Average hours of training per year per employee',
          value: parseFloat(social.training_hours).toFixed(1),
          unit: 'hours'
        });
      }
      
      if (social.lost_time_injury_rate) {
        metrics.push({
          code: 'GRI 403-9',
          title: 'Work-related injuries',
          value: parseFloat(social.lost_time_injury_rate).toFixed(2),
          unit: 'rate'
        });
      }
    }
    
    return metrics;
  }
}

export default GRIReportGenerator;