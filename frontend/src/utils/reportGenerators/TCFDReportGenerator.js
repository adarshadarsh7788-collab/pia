// TCFD (Task Force on Climate-related Financial Disclosures) Report Generator
import jsPDF from 'jspdf';

export class TCFDReportGenerator {
  static generateReport(data, options = {}) {
    const pdf = new jsPDF();
    const { companyName = 'Company', reportingYear = new Date().getFullYear() } = options;

    // TCFD Header
    pdf.setFontSize(20);
    pdf.setTextColor(0, 102, 51);
    pdf.text('TCFD CLIMATE-RELATED FINANCIAL DISCLOSURES', 20, 25);
    
    pdf.setFontSize(14);
    pdf.setTextColor(0, 0, 0);
    pdf.text(`Organization: ${companyName}`, 20, 40);
    pdf.text(`Reporting Period: ${reportingYear}`, 20, 50);
    pdf.text(`TCFD Version: 2023 Status Report`, 20, 60);
    pdf.text(`Report Date: ${new Date().toLocaleDateString()}`, 20, 70);

    let yPos = 90;

    // Executive Summary
    pdf.setFontSize(16);
    pdf.setTextColor(0, 102, 51);
    pdf.text('EXECUTIVE SUMMARY', 20, yPos);
    yPos += 20;

    pdf.setFontSize(10);
    pdf.setTextColor(0, 0, 0);
    const summary = this.generateExecutiveSummary(data);
    pdf.text(summary, 20, yPos, { maxWidth: 170 });
    yPos += 40;

    // Pillar 1: Governance
    if (yPos > 250) { pdf.addPage(); yPos = 30; }
    pdf.setFontSize(16);
    pdf.setTextColor(0, 102, 51);
    pdf.text('GOVERNANCE', 20, yPos);
    yPos += 20;

    const governance = this.extractGovernance(data);
    governance.forEach(item => {
      if (yPos > 270) { pdf.addPage(); yPos = 30; }
      pdf.setFontSize(12);
      pdf.setTextColor(0, 0, 0);
      pdf.text(item.title, 20, yPos);
      yPos += 10;
      pdf.setFontSize(10);
      pdf.text(item.description, 25, yPos, { maxWidth: 165 });
      yPos += 20;
    });

    // Pillar 2: Strategy
    if (yPos > 200) { pdf.addPage(); yPos = 30; }
    pdf.setFontSize(16);
    pdf.setTextColor(0, 102, 51);
    pdf.text('STRATEGY', 20, yPos);
    yPos += 20;

    const strategy = this.extractStrategy(data);
    strategy.forEach(item => {
      if (yPos > 270) { pdf.addPage(); yPos = 30; }
      pdf.setFontSize(12);
      pdf.setTextColor(0, 0, 0);
      pdf.text(item.title, 20, yPos);
      yPos += 10;
      pdf.setFontSize(10);
      pdf.text(item.description, 25, yPos, { maxWidth: 165 });
      yPos += 20;
    });

    // Pillar 3: Risk Management
    if (yPos > 200) { pdf.addPage(); yPos = 30; }
    pdf.setFontSize(16);
    pdf.setTextColor(0, 102, 51);
    pdf.text('RISK MANAGEMENT', 20, yPos);
    yPos += 20;

    const riskMgmt = this.extractRiskManagement(data);
    riskMgmt.forEach(item => {
      if (yPos > 270) { pdf.addPage(); yPos = 30; }
      pdf.setFontSize(12);
      pdf.setTextColor(0, 0, 0);
      pdf.text(item.title, 20, yPos);
      yPos += 10;
      pdf.setFontSize(10);
      pdf.text(item.description, 25, yPos, { maxWidth: 165 });
      yPos += 20;
    });

    // Pillar 4: Metrics and Targets
    pdf.addPage();
    yPos = 30;
    pdf.setFontSize(16);
    pdf.setTextColor(0, 102, 51);
    pdf.text('METRICS AND TARGETS', 20, yPos);
    yPos += 20;

    const metrics = this.extractMetricsAndTargets(data);
    metrics.forEach(metric => {
      if (yPos > 270) { pdf.addPage(); yPos = 30; }
      pdf.setFontSize(10);
      pdf.text(`${metric.category}: ${metric.description}`, 20, yPos);
      yPos += 6;
      pdf.text(`Current: ${metric.current} | Target: ${metric.target} | Timeline: ${metric.timeline}`, 25, yPos);
      yPos += 12;
    });

    // Scenario Analysis
    pdf.addPage();
    yPos = 30;
    pdf.setFontSize(16);
    pdf.setTextColor(0, 102, 51);
    pdf.text('SCENARIO ANALYSIS', 20, yPos);
    yPos += 20;

    const scenarios = this.extractScenarioAnalysis(data);
    scenarios.forEach(scenario => {
      if (yPos > 260) { pdf.addPage(); yPos = 30; }
      pdf.setFontSize(12);
      pdf.setTextColor(0, 0, 0);
      pdf.text(`Scenario: ${scenario.name}`, 20, yPos);
      yPos += 10;
      pdf.setFontSize(10);
      pdf.text(`Temperature Rise: ${scenario.temperature}`, 25, yPos);
      yPos += 6;
      pdf.text(`Financial Impact: ${scenario.impact}`, 25, yPos);
      yPos += 6;
      pdf.text(`Mitigation Strategy: ${scenario.mitigation}`, 25, yPos);
      yPos += 15;
    });

    return pdf;
  }

  static generateExecutiveSummary(data) {
    const totalEmissions = this.calculateTotalEmissions(data);
    return `This report presents our climate-related financial disclosures in accordance with the TCFD recommendations. Our organization has identified climate change as a material risk and opportunity. Current total GHG emissions: ${totalEmissions} tCO2e. We have implemented comprehensive climate governance, risk management processes, and science-based targets to address climate-related risks and opportunities.`;
  }

  static calculateTotalEmissions(data) {
    if (!data.environmental) return 'Not disclosed';
    
    const scope1 = parseFloat(data.environmental.scope1_emissions) || 0;
    const scope2 = parseFloat(data.environmental.scope2_emissions) || 0;
    const scope3 = parseFloat(data.environmental.scope3_emissions) || 0;
    
    const total = scope1 + scope2 + scope3;
    return total > 0 ? total.toFixed(2) : 'Not disclosed';
  }

  static extractGovernance(data) {
    return [
      {
        title: 'Board Oversight',
        description: `The Board of Directors provides oversight of climate-related risks and opportunities. Board size: ${data.governance?.board_size || 'Not disclosed'} members with ${data.governance?.independent_directors || 'Not disclosed'}% independence. Climate expertise is represented through dedicated sustainability committee.`
      },
      {
        title: 'Management Role',
        description: 'Senior management has designated responsibility for assessing and managing climate-related risks and opportunities. The Chief Sustainability Officer reports directly to the CEO and provides quarterly updates to the Board on climate performance and strategy implementation.'
      }
    ];
  }

  static extractStrategy(data) {
    return [
      {
        title: 'Climate-related Risks and Opportunities',
        description: 'We have identified both physical and transition risks including extreme weather events, carbon pricing, and changing customer preferences. Key opportunities include energy efficiency improvements, renewable energy adoption, and development of climate-friendly products and services.'
      },
      {
        title: 'Impact on Business and Financial Planning',
        description: 'Climate considerations are integrated into our strategic planning process with a 10-year horizon. We assess potential financial impacts across different climate scenarios and incorporate climate risks into capital allocation decisions and business model evolution.'
      },
      {
        title: 'Resilience of Strategy',
        description: 'Our strategy demonstrates resilience across multiple climate scenarios including 1.5°C, 2°C, and 4°C warming pathways. We have stress-tested our business model and identified adaptation measures to maintain operational and financial resilience.'
      }
    ];
  }

  static extractRiskManagement(data) {
    return [
      {
        title: 'Risk Identification and Assessment',
        description: 'We use a systematic approach to identify climate-related risks across short (1-3 years), medium (3-10 years), and long-term (10+ years) time horizons. Physical and transition risks are assessed using climate science data, regulatory analysis, and stakeholder engagement.'
      },
      {
        title: 'Risk Management Processes',
        description: 'Climate risks are managed through our enterprise risk management framework with quarterly risk assessments, mitigation planning, and monitoring. Risk appetite statements include climate-specific thresholds and escalation procedures.'
      },
      {
        title: 'Integration with Overall Risk Management',
        description: 'Climate-related risks are fully integrated into our overall risk management processes with consistent methodologies, reporting structures, and governance oversight. Climate risks are considered alongside other material risks in strategic decision-making.'
      }
    ];
  }

  static extractMetricsAndTargets(data) {
    const metrics = [];
    
    if (data.environmental) {
      const env = data.environmental;
      
      if (env.scope1_emissions) {
        metrics.push({
          category: 'Scope 1 Emissions',
          description: 'Direct GHG emissions from owned or controlled sources',
          current: `${parseFloat(env.scope1_emissions).toFixed(2)} tCO2e`,
          target: 'Net zero by 2050',
          timeline: '2050'
        });
      }
      
      if (env.scope2_emissions) {
        metrics.push({
          category: 'Scope 2 Emissions',
          description: 'Indirect GHG emissions from purchased energy',
          current: `${parseFloat(env.scope2_emissions).toFixed(2)} tCO2e`,
          target: '50% reduction by 2030',
          timeline: '2030'
        });
      }
      
      if (env.renewable_energy) {
        metrics.push({
          category: 'Renewable Energy',
          description: 'Percentage of renewable energy consumption',
          current: `${parseFloat(env.renewable_energy).toFixed(1)}%`,
          target: '100% renewable electricity',
          timeline: '2030'
        });
      }
    }
    
    // Add default metrics if no data available
    if (metrics.length === 0) {
      metrics.push({
        category: 'GHG Emissions',
        description: 'Total greenhouse gas emissions (Scope 1+2+3)',
        current: 'Baseline being established',
        target: 'Science-based targets to be set',
        timeline: '2024'
      });
    }
    
    return metrics;
  }

  static extractScenarioAnalysis(data) {
    return [
      {
        name: '1.5°C Scenario (Paris Agreement)',
        temperature: '1.5°C above pre-industrial levels',
        impact: 'Moderate transition risks, limited physical risks',
        mitigation: 'Accelerated decarbonization, carbon pricing adaptation'
      },
      {
        name: '2°C Scenario (NDCs)',
        temperature: '2°C above pre-industrial levels',
        impact: 'Increased physical risks, moderate transition costs',
        mitigation: 'Enhanced resilience measures, diversified energy portfolio'
      },
      {
        name: '4°C Scenario (Current Policies)',
        temperature: '4°C above pre-industrial levels',
        impact: 'Severe physical risks, supply chain disruption',
        mitigation: 'Comprehensive adaptation strategy, operational flexibility'
      }
    ];
  }
}

export default TCFDReportGenerator;