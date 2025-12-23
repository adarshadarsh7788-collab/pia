// ESG Data Storage with Backend Integration
import APIService from '../services/apiService.js';
import DataValidation from './dataValidation.js';
import AuditTrail from './AuditTrail.js';
import { ESGAnalytics } from './esgAnalytics.js';
import { ReportGenerator } from './reportGenerator.js';
import { DataGovernance } from './dataGovernance.js';
import { AuditSupport } from './auditSupport.js';
import { MaterialityAssessment } from './materialityAssessment.js';
import { SupplyChain } from './supplyChain.js';
import esgDB from '../api/database.js';

// Save a single ESG data entry with comprehensive validation
export const saveData = async (entry) => {
  const currentUser = localStorage.getItem('currentUser') || 'defaultUser';

  // Build a base enhanced entry that will be persisted (either to backend or local)
  const enhancedEntry = {
    ...entry,
    id: entry.id || Date.now().toString(),
    createdBy: currentUser,
    createdAt: new Date().toISOString(),
    version: (entry.version || 0) + 1
  };

  // If entry looks like a single metric (category+metric+value), validate that metric.
  if (entry.category && entry.metric) {
    try {
      const validation = DataValidation.validateESGData({ [entry.category]: { [entry.metric]: entry.value } });

      if (!validation || !validation.isValid) {
        const msgs = (validation && validation.errors) ? validation.errors.join(', ') : 'Unknown validation error';
        throw new Error(`Validation failed: ${msgs}`);
      }

      enhancedEntry.qualityScore = validation.qualityScore;
      enhancedEntry.complianceStatus = validation.complianceStatus;
      enhancedEntry.auditTrail = [AuditTrail.trackDataEntry(entry, currentUser)];
    } catch (err) {
      // Bubble up validation errors so callers can show feedback
      throw err;
    }
  } else {
    // Company-level submission (full form): add submission audit
    enhancedEntry.auditTrail = [AuditTrail.trackDataEntry(entry, currentUser)];
  }

  // Compose payload expected by backend
  const backendData = {
    companyName: entry.companyName || enhancedEntry.companyName || 'Unknown',
    sector: entry.sector || '',
    region: entry.region || '',
    reportingYear: entry.reportingYear || new Date().getFullYear(),
    environmental: entry.environmental || (entry.category === 'environmental' ? { [entry.metric]: entry.value } : {}),
    social: entry.social || (entry.category === 'social' ? { [entry.metric]: entry.value } : {}),
    governance: entry.governance || (entry.category === 'governance' ? { [entry.metric]: entry.value } : {}),
    userId: currentUser,
    timestamp: new Date().toISOString()
  };

  // Try backend save, fall back to localStorage and in-memory esgDB
  try {
    const response = await APIService.saveESGData(backendData);

    if (response && !response.error) {
      // Persist to local in-memory DB if available (keeps UI consistent)
      try {
        if (esgDB && typeof esgDB.addEntry === 'function') esgDB.addEntry(enhancedEntry);
      } catch (e) {
        console.warn('esgDB.addEntry failed:', e);
      }

      // Also keep a copy in localStorage for offline reads
      try {
        const existing = JSON.parse(localStorage.getItem('esgData') || '[]');
        existing.push(enhancedEntry);
        localStorage.setItem('esgData', JSON.stringify(existing));
      } catch (e) {
        console.warn('Failed to write esgData to localStorage:', e);
      }

      return { success: true, source: 'backend', data: enhancedEntry };
    }

    throw new Error(response?.error || 'Backend save failed');
  } catch (error) {
    console.warn('Backend save failed, falling back to localStorage:', error);

    // Save into localStorage array so Reports can pick it up
    try {
      const existing = JSON.parse(localStorage.getItem('esgData') || '[]');
      existing.push(enhancedEntry);
      localStorage.setItem('esgData', JSON.stringify(existing));
      console.log('Saved to localStorage, total entries:', existing.length);
    } catch (err) {
      console.warn('Failed to persist to localStorage', err);
    }

    // Also attempt to persist in esgDB for immediate UI visibility
    try {
      if (esgDB && typeof esgDB.addEntry === 'function') esgDB.addEntry(enhancedEntry);
    } catch (e) {
      console.warn('esgDB.addEntry failed:', e);
    }

    // Return a consistent shape so callers can decide what to do
    return { success: true, source: 'localStorage', data: enhancedEntry };
  }
};

// Save multiple entries with batch validation
export const saveMultiple = (entries) => {
  const currentUser = localStorage.getItem('currentUser') || 'defaultUser';
  const validatedEntries = [];
  const errors = [];
  
  // Batch validation
  const comprehensiveValidation = entries.map(entry => ({ ...entry, validation: DataValidation.validateESGData(entry) }));
  
  comprehensiveValidation.forEach((validatedEntry, index) => {
    if (validatedEntry.validation.isValid) {
      const enhancedEntry = {
        ...validatedEntry,
        id: validatedEntry.id || `${Date.now()}_${index}`,
        auditTrail: [AuditTrail.trackDataEntry(validatedEntry, currentUser)],
        createdBy: currentUser,
        createdAt: new Date().toISOString(),
        batchId: Date.now().toString()
      };
      
      validatedEntries.push(enhancedEntry);
      esgDB.addEntry(enhancedEntry);
    } else {
      errors.push(`Row ${index + 1}: ${validatedEntry.validation.errors.join(', ')}`);
    }
  });
  
  return {
    success: validatedEntries.length,
    errors: errors.length,
    errorDetails: errors
  };
};

// Get all stored ESG data
export const getStoredData = async () => {
  const currentUser = localStorage.getItem('currentUser') || 'defaultUser';
  
  // First, always check localStorage since that's where DataEntry saves data
  try {
    const local = localStorage.getItem('esgData');
    if (local) {
      const parsed = JSON.parse(local);
      if (Array.isArray(parsed) && parsed.length > 0) {
        console.log('Found data in localStorage:', parsed.length, 'entries');
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Failed to read esgData from localStorage', err);
  }
  
  // If no localStorage data, try backend as fallback
  try {
    const result = await APIService.getESGData(currentUser);
    if (result && !result.error) {
      if (Array.isArray(result) && result.length > 0) return result;
      if (result.data && Array.isArray(result.data) && result.data.length > 0) return result.data;
    }
  } catch (error) {
    console.warn('Backend unavailable, no data found');
  }

  // Return empty array if no data available anywhere
  console.log('No ESG data found in localStorage or backend');
  return [];
};

// Initialize ESG storage if empty
export const initializeStorage = () => {
  // Defensive: esgDB may not be ready during circular import or HMR reloads
  if (!esgDB || typeof esgDB.updateKPIs !== 'function') {
    console.warn('esgDB not available yet — skipping initializeStorage');
    return;
  }

  // Database initializes automatically
  esgDB.updateKPIs();
};

// Enhanced KPI calculation with analytics
export const calculateAndSaveKPIs = (filters = {}) => {
  esgDB.updateKPIs();
  const kpis = esgDB.getKPIs();
  const entries = esgDB.getEntries();
  
  // Enhanced analytics
  const environmentalData = entries.filter(e => e.category === 'environmental');
  const socialData = entries.filter(e => e.category === 'social');
  const governanceData = entries.filter(e => e.category === 'governance');
  
  // Calculate trends
  const trends = {
    environmental: ESGAnalytics.calculateTrends(environmentalData),
    social: ESGAnalytics.calculateTrends(socialData),
    governance: ESGAnalytics.calculateTrends(governanceData)
  };
  
  // Data quality assessment
  const qualityScores = entries.map(e => e.qualityScore || 85);
  const avgQualityScore = qualityScores.reduce((a, b) => a + b, 0) / qualityScores.length;
  
  // Compliance rate calculation
  const complianceDocs = esgDB.getComplianceDocs();
  const approvedDocs = complianceDocs.filter(doc => doc.status === 'Approved').length;
  const complianceRate = complianceDocs.length > 0 ? Math.round((approvedDocs / complianceDocs.length) * 100) : 94;
  
  // Audit readiness
  const auditReadyEntries = entries.filter(e => e.auditReadiness !== false).length;
  const auditReadinessRate = entries.length > 0 ? Math.round((auditReadyEntries / entries.length) * 100) : 100;
  
  return {
    ...kpis,
    complianceRate,
    dataQualityScore: Math.round(avgQualityScore),
    auditReadinessRate,
    trends,
    totalDataPoints: entries.length,
    lastUpdated: new Date().toISOString()
  };
};

// Get KPIs
export const getKPIs = async () => {
  const currentUser = localStorage.getItem('currentUser') || 'defaultUser';

  try {
    const result = await APIService.getESGKPIs(currentUser);
    if (result && !result.error) {
      // Prefer array payloads from backend if present
      if (Array.isArray(result) && result.length > 0) return result;
      if (result.data && Array.isArray(result.data) && result.data.length > 0) return result.data;
      return result;
    }
  } catch (error) {
    console.warn('Backend unavailable, using localStorage fallback');
  }

  // Return default KPIs if backend unavailable
  return {
    overallScore: 0,
    environmental: 0,
    social: 0,
    governance: 0,
    complianceRate: 0,
    totalEntries: 0
  };
};

const calculateKPIsFromData = (data) => {
  const environmental = data.filter(d => d.category === 'environmental');
  const social = data.filter(d => d.category === 'social');
  const governance = data.filter(d => d.category === 'governance');
  
  return {
    overallScore: Math.round((environmental.length + social.length + governance.length) / 3),
    environmental: environmental.length,
    social: social.length,
    governance: governance.length,
    complianceRate: 94,
    totalEntries: data.length
  };
};

// Enhanced analytics data with comprehensive insights
export const getAnalyticsData = () => {
  const entries = esgDB.getEntries();
  
  // Supply chain analytics
  const suppliers = JSON.parse(localStorage.getItem('suppliers') || '[]');
  const supplyChainRisks = SupplyChain.identifySupplyChainRisks(suppliers);
  
  // Materiality assessment
  const materialityMatrix = MaterialityAssessment.generateMaterialityMatrix(
    entries.map(e => ({
      name: e.metric,
      revenueImpact: Math.random() * 10,
      environmentalImpact: Math.random() * 10,
      socialImpact: Math.random() * 10,
      stakeholderConcern: Math.random() * 10
    }))
  );
  
  return {
    categoryDistribution: esgDB.getCategoryDistribution(),
    riskDistribution: esgDB.getRiskDistribution(),
    monthlyTrends: esgDB.getMonthlyTrends(),
    trends: esgDB.getTrends(),
    supplyChainRisks,
    materialityMatrix,
    dataQualityMetrics: getDataQualityMetrics(),
    frameworkCompliance: getFrameworkCompliance()
  };
};

// Get compliance data
export const getComplianceData = () => {
  return esgDB.getComplianceDocs();
};

// Add compliance document
export const addComplianceDoc = (doc) => {
  return esgDB.addComplianceDoc(doc);
};

// Enhanced data quality and compliance functions
export const getDataQualityMetrics = () => {
  const entries = esgDB.getEntries();
  const qualityChecks = entries.map(entry => 
    DataGovernance.validateDataQuality(entry)
  );
  
  return {
    averageScore: qualityChecks.reduce((sum, check) => sum + check.overallScore, 0) / qualityChecks.length,
    completenessRate: qualityChecks.filter(c => c.checks.completeness.status === 'good').length / qualityChecks.length * 100,
    accuracyRate: qualityChecks.filter(c => c.checks.accuracy.status === 'good').length / qualityChecks.length * 100,
    timelinessRate: qualityChecks.filter(c => c.checks.timeliness.status === 'good').length / qualityChecks.length * 100
  };
};

export const getFrameworkCompliance = () => {
  const entries = esgDB.getEntries();
  const frameworks = ['GRI', 'SASB', 'TCFD', 'CSRD'];
  
  return frameworks.reduce((compliance, framework) => {
    const frameworkData = entries.filter(e => e.reportingFramework === framework);
    compliance[framework] = DataValidation.validateDataCompleteness(
      { environmental: frameworkData, social: frameworkData, governance: frameworkData }
    );
    return compliance;
  }, {});
};

// Generate comprehensive ESG report
export const generateESGReport = (filters = {}) => {
  const entries = esgDB.getEntries();
  const kpis = calculateAndSaveKPIs();
  const analytics = getAnalyticsData();
  
  const reportData = {
    companyName: 'ESG Company',
    environmental: entries.filter(e => e.category === 'environmental'),
    social: entries.filter(e => e.category === 'social'),
    governance: entries.filter(e => e.category === 'governance'),
    kpis,
    analytics
  };
  
  return ReportGenerator.generateESGReport(reportData, filters.framework || 'GRI');
};

// Initialize database on first load
if (typeof window !== 'undefined' && !localStorage.getItem('esg_database')) {
  initializeStorage();
}
