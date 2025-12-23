// SASB (Sustainability Accounting Standards Board) Report Generator
import jsPDF from 'jspdf';

export class SASBReportGenerator {
  static generateReport(data, options = {}) {
    const pdf = new jsPDF();
    const { companyName = 'Company', reportingYear = new Date().getFullYear(), industry = 'technology' } = options;

    // SASB Header
    pdf.setFontSize(20);
    pdf.setTextColor(0, 102, 51);
    pdf.text('SASB STANDARDS SUSTAINABILITY REPORT', 20, 25);
    
    pdf.setFontSize(14);
    pdf.setTextColor(0, 0, 0);
    pdf.text(`Company: ${companyName}`, 20, 40);
    pdf.text(`Industry: ${industry.toUpperCase()}`, 20, 50);
    pdf.text(`Reporting Period: ${reportingYear}`, 20, 60);
    pdf.text(`SASB Standard: ${this.getSASBStandard(industry)}`, 20, 70);
    pdf.text(`Report Date: ${new Date().toLocaleDateString()}`, 20, 80);

    let yPos = 100;

    // Industry Classification
    pdf.setFontSize(16);
    pdf.setTextColor(0, 102, 51);
    pdf.text('INDUSTRY CLASSIFICATION', 20, yPos);
    yPos += 20;

    const classification = this.getIndustryClassification(industry);
    pdf.setFontSize(10);
    pdf.setTextColor(0, 0, 0);
    pdf.text(`SICS Industry: ${classification.sics}`, 20, yPos);
    yPos += 8;
    pdf.text(`SICS Code: ${classification.code}`, 20, yPos);
    yPos += 8;
    pdf.text(`Description: ${classification.description}`, 20, yPos);
    yPos += 20;

    // Sustainability Disclosure Topics & Accounting Metrics
    pdf.setFontSize(16);
    pdf.setTextColor(0, 102, 51);
    pdf.text('SUSTAINABILITY DISCLOSURE TOPICS & ACCOUNTING METRICS', 20, yPos);
    yPos += 20;

    const topics = this.getSASBTopics(industry);
    topics.forEach(topic => {
      if (yPos > 250) { pdf.addPage(); yPos = 30; }
      
      pdf.setFontSize(12);
      pdf.setTextColor(0, 0, 0);
      pdf.text(`Topic: ${topic.name}`, 20, yPos);
      yPos += 10;
      
      topic.metrics.forEach(metric => {
        if (yPos > 270) { pdf.addPage(); yPos = 30; }
        pdf.setFontSize(10);
        pdf.text(`${metric.code}: ${metric.description}`, 25, yPos);
        yPos += 6;
        
        const value = this.extractMetricValue(data, metric.code, metric.key);
        pdf.text(`Value: ${value} ${metric.unit}`, 30, yPos);
        yPos += 10;
      });
      yPos += 5;
    });

    // Activity Metrics
    if (yPos > 250) { pdf.addPage(); yPos = 30; }
    pdf.setFontSize(16);
    pdf.setTextColor(0, 102, 51);
    pdf.text('ACTIVITY METRICS', 20, yPos);
    yPos += 20;

    const activityMetrics = this.getActivityMetrics(industry, data);
    activityMetrics.forEach(metric => {
      if (yPos > 270) { pdf.addPage(); yPos = 30; }
      pdf.setFontSize(10);
      pdf.text(`${metric.code}: ${metric.description}`, 20, yPos);
      yPos += 6;
      pdf.text(`Value: ${metric.value} ${metric.unit}`, 25, yPos);
      yPos += 12;
    });

    return pdf;
  }

  static getSASBStandard(industry) {
    const standards = {
      technology: 'TC-SI (Technology & Communications - Software & IT Services)',
      financial: 'FN-CB (Financials - Commercial Banks)',
      healthcare: 'HC-BP (Healthcare - Biotechnology & Pharmaceuticals)',
      manufacturing: 'RT-AE (Resource Transformation - Aerospace & Defense)',
      energy: 'NR-OG (Non-Renewable Resources - Oil & Gas)',
      retail: 'CG-MR (Consumer Goods - Multiline and Specialty Retailers)'
    };
    return standards[industry] || 'TC-SI (Technology & Communications - Software & IT Services)';
  }

  static getIndustryClassification(industry) {
    const classifications = {
      technology: {
        sics: 'Software & IT Services',
        code: 'TC-SI',
        description: 'Companies that develop software and provide information technology services'
      },
      financial: {
        sics: 'Commercial Banks',
        code: 'FN-CB',
        description: 'Companies engaged in commercial banking and related financial services'
      },
      healthcare: {
        sics: 'Biotechnology & Pharmaceuticals',
        code: 'HC-BP',
        description: 'Companies engaged in biotechnology research and pharmaceutical development'
      }
    };
    return classifications[industry] || classifications.technology;
  }

  static getSASBTopics(industry) {
    const topics = {
      technology: [
        {
          name: 'Environmental Footprint of Hardware Infrastructure',
          metrics: [
            { code: 'TC-SI-130a.1', key: 'energy_consumption', description: 'Total energy consumed', unit: 'GJ' },
            { code: 'TC-SI-130a.2', key: 'renewable_energy', description: 'Percentage of renewable energy', unit: '%' },
            { code: 'TC-SI-130a.3', key: 'water_withdrawal', description: 'Total water withdrawn', unit: 'm³' }
          ]
        },
        {
          name: 'Data Privacy & Freedom of Expression',
          metrics: [
            { code: 'TC-SI-220a.1', key: 'privacy_policies', description: 'Description of policies and practices relating to behavioral advertising', unit: 'Qualitative' },
            { code: 'TC-SI-220a.2', key: 'user_data_requests', description: 'Number of users whose information is used', unit: 'Number' }
          ]
        },
        {
          name: 'Data Security',
          metrics: [
            { code: 'TC-SI-230a.1', key: 'data_breaches', description: 'Number of data breaches', unit: 'Number' },
            { code: 'TC-SI-230a.2', key: 'customer_data', description: 'Description of approach to identifying and addressing data security risks', unit: 'Qualitative' }
          ]
        }
      ],
      financial: [
        {
          name: 'Data Security',
          metrics: [
            { code: 'FN-CB-230a.1', key: 'data_breaches', description: 'Number of data breaches', unit: 'Number' },
            { code: 'FN-CB-230a.2', key: 'customer_data', description: 'Card-related fraud losses', unit: 'USD' }
          ]
        },
        {
          name: 'Financial Inclusion & Capacity Building',
          metrics: [
            { code: 'FN-CB-240a.1', key: 'unbanked_customers', description: 'Number and amount of loans outstanding to unbanked customers', unit: 'Number, USD' },
            { code: 'FN-CB-240a.4', key: 'community_development', description: 'Community development lending', unit: 'USD' }
          ]
        }
      ]
    };
    return topics[industry] || topics.technology;
  }

  static getActivityMetrics(industry, data) {
    const metrics = {
      technology: [
        { code: 'TC-SI-000.A', description: 'Number of licenses or subscriptions', value: data.social?.total_employees || 'Not disclosed', unit: 'Number' },
        { code: 'TC-SI-000.B', description: 'Data processing capacity', value: 'Not disclosed', unit: 'Petabytes' },
        { code: 'TC-SI-000.C', description: 'Amount of data storage', value: 'Not disclosed', unit: 'Petabytes' }
      ],
      financial: [
        { code: 'FN-CB-000.A', description: 'Number of checking and savings accounts', value: 'Not disclosed', unit: 'Number' },
        { code: 'FN-CB-000.B', description: 'Value of checking and savings accounts', value: 'Not disclosed', unit: 'USD' },
        { code: 'FN-CB-000.C', description: 'Number of loans', value: 'Not disclosed', unit: 'Number' }
      ]
    };
    return metrics[industry] || metrics.technology;
  }

  static extractMetricValue(data, code, key) {
    // Map SASB codes to data fields
    const mapping = {
      'TC-SI-130a.1': data.environmental?.energy_consumption,
      'TC-SI-130a.2': data.environmental?.renewable_energy,
      'TC-SI-130a.3': data.environmental?.water_withdrawal,
      'TC-SI-230a.1': data.governance?.data_breaches || '0',
      'FN-CB-230a.1': data.governance?.data_breaches || '0',
      'FN-CB-240a.1': data.social?.community_investment
    };

    const value = mapping[code];
    if (value && !isNaN(parseFloat(value))) {
      return parseFloat(value).toFixed(2);
    }
    return 'Not disclosed';
  }
}

export default SASBReportGenerator;