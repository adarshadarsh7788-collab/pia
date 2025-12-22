import reportManager from './reports/index.js';
import fs from 'fs';

/**
 * Test PDF report generation
 */
async function testPDFGeneration() {
  console.log('🔄 Testing PDF Report Generation...\n');

  try {
    // Ensure reports directory exists
    if (!fs.existsSync('reports')) {
      fs.mkdirSync('reports');
    }

    console.log('📊 Generating comprehensive data...');
    await reportManager.initialize();

    console.log('📄 Creating PDF report...');
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `ESG_Comprehensive_Report_${timestamp}.pdf`;
    const outputPath = `reports/${filename}`;

    const pdfPath = await reportManager.generatePDFReport(outputPath);
    
    console.log(`✅ PDF report generated successfully!`);
    console.log(`📁 File location: ${pdfPath}`);
    console.log(`📊 File size: ${(fs.statSync(pdfPath).size / 1024).toFixed(2)} KB`);
    
    console.log('\n📋 Report Contents:');
    console.log('   ✓ Cover Page with Key Metrics');
    console.log('   ✓ Executive Summary');
    console.log('   ✓ ESG Performance Analysis');
    console.log('     - Environmental Impact (Carbon, Waste)');
    console.log('     - Social Impact (Safety, Diversity)');
    console.log('     - Governance Metrics');
    console.log('   ✓ System Performance Analysis');
    console.log('     - Database Performance');
    console.log('     - API Performance');
    console.log('     - System Resources');
    console.log('   ✓ Security Assessment');
    console.log('     - Vulnerability Analysis');
    console.log('     - Access Control');
    console.log('     - Incident Response');
    console.log('   ✓ Deployment & Infrastructure');
    console.log('     - Environment Configuration');
    console.log('     - Health Checks');
    console.log('     - Deployment Metrics');
    console.log('   ✓ Appendix with Recommendations');

    console.log('\n🌐 API Endpoints for PDF Generation:');
    console.log('   GET  /api/reports/pdf/comprehensive - Download PDF directly');
    console.log('   POST /api/reports/pdf/generate - Generate PDF with custom filename');
    
    console.log('\n💡 Usage Examples:');
    console.log('   curl -o report.pdf http://localhost:5000/api/reports/pdf/comprehensive');
    console.log('   curl -X POST -H "Content-Type: application/json" \\');
    console.log('        -d \'{"filename":"custom_report.pdf"}\' \\');
    console.log('        http://localhost:5000/api/reports/pdf/generate');

  } catch (error) {
    console.error('❌ Error generating PDF report:', error.message);
  }
}

// Run the test
testPDFGeneration();