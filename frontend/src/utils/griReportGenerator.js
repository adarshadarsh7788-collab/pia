import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export class GRIReportGenerator {
  static GRI_TEMPLATE = {
    'GRI-2': {
      title: 'General Disclosures',
      sections: [
        { id: 'GRI-2-1', name: 'Organizational Details', fields: ['companyName', 'sector', 'region'] },
        { id: 'GRI-2-7', name: 'Employees', fields: ['totalEmployees', 'femaleEmployeesPercentage'] },
        { id: 'GRI-2-9', name: 'Governance Structure', fields: ['boardSize', 'independentDirectorsPercentage'] }
      ]
    },
    'GRI-302': {
      title: 'Energy',
      sections: [
        { id: 'GRI-302-1', name: 'Energy Consumption', fields: ['energyConsumption', 'renewableEnergyPercentage'] }
      ]
    },
    'GRI-303': {
      title: 'Water',
      sections: [
        { id: 'GRI-303-3', name: 'Water Withdrawal', fields: ['waterWithdrawal'] },
        { id: 'GRI-303-4', name: 'Water Discharge', fields: ['waterDischarge'] }
      ]
    },
    'GRI-305': {
      title: 'Emissions',
      sections: [
        { id: 'GRI-305-1', name: 'Direct GHG Emissions', fields: ['scope1Emissions'] },
        { id: 'GRI-305-2', name: 'Indirect GHG Emissions', fields: ['scope2Emissions'] },
        { id: 'GRI-305-3', name: 'Other Indirect Emissions', fields: ['scope3Emissions'] }
      ]
    },
    'GRI-306': {
      title: 'Waste',
      sections: [
        { id: 'GRI-306-3', name: 'Waste Generated', fields: ['wasteGenerated'] }
      ]
    },
    'GRI-403': {
      title: 'Occupational Health & Safety',
      sections: [
        { id: 'GRI-403-9', name: 'Work-related Injuries', fields: ['lostTimeInjuryRate', 'fatalityRate'] }
      ]
    },
    'GRI-405': {
      title: 'Diversity & Equal Opportunity',
      sections: [
        { id: 'GRI-405-1', name: 'Diversity of Governance Bodies', fields: ['femaleDirectorsPercentage'] }
      ]
    }
  };

  static generateGRIReport(esgData) {
    const doc = new jsPDF();
    let yPos = 20;

    // Title Page
    doc.setFontSize(24);
    doc.text('GRI Sustainability Report', 105, yPos, { align: 'center' });
    yPos += 15;

    doc.setFontSize(12);
    doc.text(`Company: ${esgData.companyInfo?.companyName || 'N/A'}`, 105, yPos, { align: 'center' });
    yPos += 8;
    doc.text(`Reporting Year: ${esgData.companyInfo?.reportingYear || new Date().getFullYear()}`, 105, yPos, { align: 'center' });
    yPos += 8;
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 105, yPos, { align: 'center' });
    yPos += 20;

    // Table of Contents
    doc.setFontSize(16);
    doc.text('Table of Contents', 20, yPos);
    yPos += 10;
    doc.setFontSize(10);
    Object.entries(this.GRI_TEMPLATE).forEach(([key, section], idx) => {
      doc.text(`${idx + 1}. ${section.title} (${key})`, 25, yPos);
      yPos += 6;
    });

    // Generate sections
    Object.entries(this.GRI_TEMPLATE).forEach(([standardKey, standard]) => {
      doc.addPage();
      yPos = 20;

      doc.setFontSize(18);
      doc.text(`${standard.title} (${standardKey})`, 20, yPos);
      yPos += 10;

      standard.sections.forEach(section => {
        doc.setFontSize(14);
        doc.text(section.name, 20, yPos);
        yPos += 8;

        const tableData = section.fields.map(field => {
          const value = this.getFieldValue(esgData, field);
          return [field, value || 'Not Reported', this.getUnit(field)];
        });

        autoTable(doc, {
          startY: yPos,
          head: [['Metric', 'Value', 'Unit']],
          body: tableData,
          theme: 'grid',
          headStyles: { fillColor: [41, 128, 185] },
          margin: { left: 20 }
        });

        yPos = doc.lastAutoTable.finalY + 10;
      });
    });

    return doc;
  }

  static getFieldValue(esgData, field) {
    if (esgData.companyInfo?.[field]) return esgData.companyInfo[field];
    if (esgData.environmental?.[field]) return esgData.environmental[field];
    if (esgData.social?.[field]) return esgData.social[field];
    if (esgData.governance?.[field]) return esgData.governance[field];
    return null;
  }

  static getUnit(field) {
    const units = {
      scope1Emissions: 'tCO2e',
      scope2Emissions: 'tCO2e',
      scope3Emissions: 'tCO2e',
      energyConsumption: 'MWh',
      renewableEnergyPercentage: '%',
      waterWithdrawal: 'm³',
      waterDischarge: 'm³',
      wasteGenerated: 'tonnes',
      totalEmployees: 'count',
      femaleEmployeesPercentage: '%',
      lostTimeInjuryRate: 'per 200k hrs',
      fatalityRate: 'per 200k hrs',
      boardSize: 'count',
      independentDirectorsPercentage: '%',
      femaleDirectorsPercentage: '%'
    };
    return units[field] || '';
  }

  static downloadPDF(doc, filename = 'GRI-Report.pdf') {
    doc.save(filename);
  }

  static generateHTMLPreview(esgData) {
    let html = `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
        <h1 style="text-align: center; color: #2c3e50;">GRI Sustainability Report</h1>
        <div style="text-align: center; margin-bottom: 30px;">
          <p><strong>Company:</strong> ${esgData.companyInfo?.companyName || 'N/A'}</p>
          <p><strong>Reporting Year:</strong> ${esgData.companyInfo?.reportingYear || new Date().getFullYear()}</p>
          <p><strong>Generated:</strong> ${new Date().toLocaleDateString()}</p>
        </div>
    `;

    Object.entries(this.GRI_TEMPLATE).forEach(([standardKey, standard]) => {
      html += `<h2 style="color: #2980b9; border-bottom: 2px solid #2980b9; padding-bottom: 5px;">${standard.title} (${standardKey})</h2>`;
      
      standard.sections.forEach(section => {
        html += `<h3 style="color: #34495e;">${section.name}</h3>`;
        html += `<table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <thead>
            <tr style="background-color: #2980b9; color: white;">
              <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Metric</th>
              <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Value</th>
              <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Unit</th>
            </tr>
          </thead>
          <tbody>`;
        
        section.fields.forEach(field => {
          const value = this.getFieldValue(esgData, field);
          html += `<tr>
            <td style="padding: 8px; border: 1px solid #ddd;">${field}</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${value || 'Not Reported'}</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${this.getUnit(field)}</td>
          </tr>`;
        });
        
        html += `</tbody></table>`;
      });
    });

    html += `</div>`;
    return html;
  }
}

export default GRIReportGenerator;
