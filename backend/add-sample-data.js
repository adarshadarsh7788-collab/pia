/**
 * ESG Sample Data Loader
 * Securely loads sample ESG data with proper error handling and CSRF protection
 */

// Lazy load modules for better performance
let fetch;
const loadDependencies = async () => {
  if (!fetch) {
    try {
      fetch = (await import('node-fetch')).default;
    } catch (error) {
      throw new Error(`Failed to load dependencies: ${error.message}`);
    }
  }
};

const API_BASE = process.env.API_BASE || 'http://localhost:3004/api';
const CSRF_TOKEN = process.env.CSRF_TOKEN || (() => {
  const crypto = require('crypto');
  return crypto.randomBytes(32).toString('hex');
})();

const sampleData = {
  companyName: 'ESGenius Tech Solutions',
  sector: 'technology',
  region: 'north_america',
  reportingYear: 2024,
  environmental: {
    scope1Emissions: '1200',
    scope2Emissions: '2400',
    energyConsumption: '8500',
    renewableEnergyPercentage: '35',
    waterWithdrawal: '1500',
    wasteGenerated: '45',
    wasteRecycled: '32'
  },
  social: {
    totalEmployees: '150',
    femaleEmployeesPercentage: '42',
    employeeTurnoverRate: '8.5',
    trainingHoursPerEmployee: '24',
    communityInvestment: '125000',
    lostTimeInjuryRate: '0.8'
  },
  governance: {
    boardSize: '8',
    independentDirectorsPercentage: '62',
    femaleDirectorsPercentage: '38',
    ethicsTrainingCompletion: '95',
    corruptionIncidents: '0',
    dataBreaches: '0'
  },
  userId: 'admin@esgenius.com'
};

/**
 * Adds sample ESG data to the system with proper error handling and CSRF protection
 * @returns {Promise<void>}
 */
async function addSampleData() {
  const startTime = Date.now();
  try {
    await loadDependencies();
    console.log('[INFO] Starting sample ESG data addition process', {
      timestamp: new Date().toISOString(),
      userId: sampleData.userId,
      apiBase: API_BASE
    });
    
    // Validate input data
    if (!sampleData.userId || !sampleData.companyName) {
      throw new Error('Invalid sample data: missing required fields');
    }
    
    // Add sample data with enhanced CSRF protection
    const response = await fetch(`${API_BASE}/esg/data`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'X-CSRF-Token': CSRF_TOKEN,
        'X-Requested-With': 'XMLHttpRequest',
        'User-Agent': 'ESG-Data-Loader/1.0'
      },
      body: JSON.stringify(sampleData),
      timeout: 30000
    });
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
    }
    
    const result = await response.json().catch(() => ({ message: 'Data added successfully' }));
    console.log('[SUCCESS] Sample data added:', {
      message: result.message || result.error,
      duration: Date.now() - startTime,
      timestamp: new Date().toISOString()
    });
    
    await verifyData();
    await fetchKPIs();
    
  } catch (error) {
    console.error('[ERROR] Failed to add sample data:', {
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      timestamp: new Date().toISOString(),
      duration: Date.now() - startTime,
      userId: sampleData.userId
    });
    throw error;
  }
}

/**
 * Verifies that the data was saved correctly
 * @returns {Promise<void>}
 */
async function verifyData() {
  const startTime = Date.now();
  try {
    console.log('[INFO] Verifying data persistence', {
      timestamp: new Date().toISOString(),
      userId: sampleData.userId
    });
    
    const verifyResponse = await fetch(`${API_BASE}/esg/verify/${encodeURIComponent(sampleData.userId)}`, {
      method: 'GET',
      headers: { 
        'X-CSRF-Token': CSRF_TOKEN,
        'X-Requested-With': 'XMLHttpRequest'
      },
      timeout: 15000
    });
    
    if (!verifyResponse.ok) {
      const errorText = await verifyResponse.text().catch(() => 'Unknown error');
      throw new Error(`Verification failed: HTTP ${verifyResponse.status} - ${errorText}`);
    }
    
    const verifyResult = await verifyResponse.json().catch(() => ({ message: 'Verification completed' }));
    console.log('[SUCCESS] Data verification completed:', {
      message: verifyResult.message,
      duration: Date.now() - startTime,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[ERROR] Data verification failed:', {
      message: error.message,
      duration: Date.now() - startTime,
      timestamp: new Date().toISOString(),
      userId: sampleData.userId
    });
    throw error;
  }
}

/**
 * Fetches and displays KPI calculations
 * @returns {Promise<void>}
 */
async function fetchKPIs() {
  const startTime = Date.now();
  try {
    console.log('[INFO] Fetching KPI calculations', {
      timestamp: new Date().toISOString(),
      userId: sampleData.userId
    });
    
    const kpiResponse = await fetch(`${API_BASE}/esg/kpis/${encodeURIComponent(sampleData.userId)}`, {
      method: 'GET',
      headers: { 
        'X-CSRF-Token': CSRF_TOKEN,
        'X-Requested-With': 'XMLHttpRequest'
      },
      timeout: 20000
    });
    
    if (!kpiResponse.ok) {
      const errorText = await kpiResponse.text().catch(() => 'Unknown error');
      throw new Error(`KPI fetch failed: HTTP ${kpiResponse.status} - ${errorText}`);
    }
    
    const kpiResult = await kpiResponse.json().catch(() => ({ overallScore: 0 }));
    console.log('[SUCCESS] KPIs calculated successfully:', {
      overall: kpiResult.overallScore || 0,
      environmental: kpiResult.environmental || 0,
      social: kpiResult.social || 0,
      governance: kpiResult.governance || 0,
      duration: Date.now() - startTime,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[ERROR] KPI calculation failed:', {
      message: error.message,
      duration: Date.now() - startTime,
      timestamp: new Date().toISOString(),
      userId: sampleData.userId
    });
    throw error;
  }
}

// Execute with comprehensive error handling and logging
addSampleData().catch(error => {
  console.error('[FATAL] Application failed:', {
    message: error.message,
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    timestamp: new Date().toISOString(),
    processId: process.pid
  });
  process.exit(1);
});