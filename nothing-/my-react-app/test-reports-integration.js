// Test script to verify reports and analytics integration
const API_BASE_URL = 'http://localhost:5000/api';

async function testReportsIntegration() {
  console.log('🧪 Testing Reports and Analytics Integration...\n');

  const tests = [
    {
      name: 'Report Types',
      url: `${API_BASE_URL}/reports/types`,
      expected: 'success'
    },
    {
      name: 'Comprehensive Report',
      url: `${API_BASE_URL}/reports/comprehensive`,
      expected: 'success'
    },
    {
      name: 'Performance Summary',
      url: `${API_BASE_URL}/reports/performance/summary`,
      expected: 'success'
    },
    {
      name: 'ESG Data Sources',
      url: `${API_BASE_URL}/reports/esg/data-sources`,
      expected: 'success'
    },
    {
      name: 'Environmental Report',
      url: `${API_BASE_URL}/reports/sustainability/environmental`,
      expected: 'success'
    },
    {
      name: 'Security Summary',
      url: `${API_BASE_URL}/reports/security/summary`,
      expected: 'success'
    },
    {
      name: 'Deployment Health',
      url: `${API_BASE_URL}/reports/deployment/health`,
      expected: 'success'
    },
    {
      name: 'KPI Calculation',
      url: `${API_BASE_URL}/kpi/1`,
      expected: 'success'
    }
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      console.log(`Testing ${test.name}...`);
      const response = await fetch(test.url);
      const data = await response.json();
      
      if (data.success === true) {
        console.log(`✅ ${test.name}: PASSED`);
        console.log(`   Data keys: ${Object.keys(data.data || {}).join(', ')}`);
        passed++;
      } else {
        console.log(`❌ ${test.name}: FAILED - ${data.error || 'Unknown error'}`);
        failed++;
      }
    } catch (error) {
      console.log(`❌ ${test.name}: ERROR - ${error.message}`);
      failed++;
    }
    console.log('');
  }

  console.log('📊 Test Results Summary:');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`);

  if (passed === tests.length) {
    console.log('\n🎉 All tests passed! Reports and Analytics integration is working correctly.');
    console.log('\n📋 Available Features:');
    console.log('   • Comprehensive ESG reporting');
    console.log('   • Real-time performance analytics');
    console.log('   • Security assessment reports');
    console.log('   • Environmental sustainability metrics');
    console.log('   • KPI calculations and tracking');
    console.log('   • PDF report generation');
    console.log('\n🌐 Access the dashboard at: http://localhost:3000');
    console.log('📊 View Reports & Analytics at: http://localhost:3000/reports-analytics');
  } else {
    console.log('\n⚠️  Some tests failed. Check the backend server and API endpoints.');
  }
}

// Run the test
testReportsIntegration().catch(console.error);