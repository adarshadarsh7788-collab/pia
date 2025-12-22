import reportManager from './reports/index.js';

/**
 * Test script to demonstrate the reporting functionality
 */
async function testReports() {
  console.log('🔄 Testing ESG and System Reports...\n');

  try {
    // Initialize report manager
    await reportManager.initialize();
    console.log('✅ Report Manager initialized\n');

    // Test ESG Data Collection Report
    console.log('📊 Generating ESG Data Collection Report...');
    const esgDataReport = await reportManager.generateReport('esg', 'data-collection');
    console.log(`   - Total Records: ${esgDataReport.totalRecords}`);
    console.log(`   - Data Quality Score: ${esgDataReport.dataQualityScore}%`);
    console.log(`   - Environmental Sources: ${Object.keys(esgDataReport.dataSources.environmental).length}`);
    console.log(`   - Social Sources: ${Object.keys(esgDataReport.dataSources.social).length}`);
    console.log(`   - Governance Sources: ${Object.keys(esgDataReport.dataSources.governance).length}\n`);

    // Test Sustainability Metrics Report
    console.log('🌱 Generating Environmental Sustainability Report...');
    const envReport = await reportManager.generateReport('esg', 'environmental');
    console.log(`   - Total Emissions: ${envReport.carbonFootprint.totalEmissions} tons CO2`);
    console.log(`   - Scope 1: ${envReport.carbonFootprint.scope1} tons`);
    console.log(`   - Scope 2: ${envReport.carbonFootprint.scope2} tons`);
    console.log(`   - Scope 3: ${envReport.carbonFootprint.scope3} tons`);
    console.log(`   - Total Waste: ${envReport.wasteManagement.totalWaste} tons`);
    console.log(`   - Recycling Rate: ${envReport.wasteManagement.recycledPercentage}%\n`);

    // Test Performance Monitoring Report
    console.log('⚡ Generating Performance Monitoring Report...');
    const perfReport = await reportManager.generateReport('performance');
    console.log(`   - Overall Health: ${perfReport.summary.overallHealth}%`);
    console.log(`   - Avg API Response: ${Math.round(perfReport.summary.keyMetrics.avgApiResponseTime)}ms`);
    console.log(`   - DB Query Performance: ${Math.round(perfReport.summary.keyMetrics.dbQueryPerformance)}ms`);
    console.log(`   - CPU Usage: ${Math.round(perfReport.summary.keyMetrics.systemCpuUsage)}%`);
    console.log(`   - Memory Usage: ${Math.round(perfReport.summary.keyMetrics.memoryUtilization)}%\n`);

    // Test Security Assessment Report
    console.log('🔒 Generating Security Assessment Report...');
    const secReport = await reportManager.generateReport('security');
    console.log(`   - Overall Security Score: ${secReport.overallSecurityScore}%`);
    console.log(`   - Critical Vulnerabilities: ${secReport.summary.criticalVulnerabilities}`);
    console.log(`   - Active Users: ${secReport.summary.activeUsers}`);
    console.log(`   - Encryption Compliance: ${secReport.summary.encryptionCompliance}%`);
    console.log(`   - Pending Incidents: ${secReport.summary.pendingIncidents}\n`);

    // Test Deployment Report
    console.log('🚀 Generating Deployment Report...');
    const deployReport = await reportManager.generateReport('deployment');
    console.log(`   - Environment: ${deployReport.summary.environment}`);
    console.log(`   - Overall Health: ${deployReport.summary.overallHealth}`);
    console.log(`   - Deployment Readiness: ${deployReport.summary.deploymentReadiness}`);
    console.log(`   - Configuration Score: ${deployReport.keyMetrics.configurationScore}%`);
    console.log(`   - Health Score: ${deployReport.keyMetrics.healthScore}%\n`);

    // Test Comprehensive Report
    console.log('📋 Generating Comprehensive Report...');
    const compReport = await reportManager.generateComprehensiveReport();
    console.log(`   - Report Generated: ${compReport.timestamp}`);
    console.log(`   - ESG Data Quality: ${compReport.summary.esg.dataCollection.dataQualityScore}%`);
    console.log(`   - Performance Health: ${compReport.summary.performance.overallHealth}%`);
    console.log(`   - Security Score: ${compReport.summary.security.overallSecurityScore}%`);
    console.log(`   - Deployment Health: ${compReport.summary.deployment.overallHealth}\n`);

    console.log('✅ All reports generated successfully!');
    console.log('\n📡 API Endpoints Available:');
    console.log('   GET /api/reports/types - List all available reports');
    console.log('   GET /api/reports/comprehensive - Full system report');
    console.log('   GET /api/reports/esg?subType=environmental - Environmental metrics');
    console.log('   GET /api/reports/performance?subType=database - Database performance');
    console.log('   GET /api/reports/security?subType=vulnerabilities - Security scan');
    console.log('   GET /api/reports/deployment?subType=health - Health checks');

  } catch (error) {
    console.error('❌ Error testing reports:', error.message);
  }
}

// Run the test
testReports();