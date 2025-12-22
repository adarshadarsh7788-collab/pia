// Sector-specific configurations for ESG system
export const SECTOR_CONFIGS = {
  mining: {
    name: 'Mining & Extractives',
    icon: '⛏️',
    color: 'amber',
    frameworks: {
      primary: ['GRI', 'ICMM', 'EITI', 'ISSB_S1', 'ISSB_S2'],
      secondary: ['TCFD', 'SASB_EM', 'OECD_MNE']
    },
    reportTemplates: [
      { id: 'gri_mining', name: 'GRI Mining Report', icon: '📊', frameworks: ['GRI-11'] },
      { id: 'icmm_report', name: 'ICMM Performance Report', icon: '⛏️', frameworks: ['ICMM'] },
      { id: 'eiti_report', name: 'EITI Transparency Report', icon: '💎', frameworks: ['EITI'] },
      { id: 'issb_climate', name: 'ISSB Climate Disclosure', icon: '🌡️', frameworks: ['ISSB S1/S2'] },
      { id: 'zimbabwe_compliance', name: 'Zimbabwe Mining Compliance', icon: '🇿🇼', frameworks: ['EMA', 'MMA'] }
    ],
    complianceModules: [
      { id: 'zimbabwe_mining', name: 'Zimbabwe Mining Compliance', requirements: ['EMA Act', 'MMA Act', 'ZSE Listing'] },
      { id: 'icmm_principles', name: 'ICMM 10 Principles', requirements: ['Performance Expectations', 'Position Statements'] },
      { id: 'eiti_standard', name: 'EITI Standard', requirements: ['Revenue Transparency', 'Beneficial Ownership'] }
    ],
    metrics: {
      environmental: ['water_withdrawal', 'tailings_management', 'biodiversity_impact', 'land_disturbance', 'acid_mine_drainage'],
      social: ['local_employment', 'community_investment', 'resettlement', 'artisanal_mining', 'safety_incidents'],
      governance: ['revenue_transparency', 'beneficial_ownership', 'anti_corruption', 'stakeholder_engagement']
    }
  },
  
  healthcare: {
    name: 'Healthcare',
    icon: '🏥',
    color: 'pink',
    frameworks: {
      primary: ['GRI', 'SASB_HC', 'ISSB_S1', 'ISSB_S2'],
      secondary: ['TCFD', 'UN_SDG', 'WHO_Guidelines']
    },
    reportTemplates: [
      { id: 'gri_healthcare', name: 'GRI Healthcare Report', icon: '📊', frameworks: ['GRI-11'] },
      { id: 'sasb_healthcare', name: 'SASB Healthcare Report', icon: '🏥', frameworks: ['SASB-HC'] },
      { id: 'patient_safety', name: 'Patient Safety Report', icon: '🛡️', frameworks: ['WHO', 'FDA'] },
      { id: 'access_affordability', name: 'Access & Affordability Report', icon: '💊', frameworks: ['UN SDG 3'] },
      { id: 'clinical_trials', name: 'Clinical Trials Transparency', icon: '🔬', frameworks: ['ICH-GCP'] }
    ],
    complianceModules: [
      { id: 'patient_safety_standards', name: 'Patient Safety Standards', requirements: ['WHO Guidelines', 'FDA Regulations'] },
      { id: 'clinical_trial_ethics', name: 'Clinical Trial Ethics', requirements: ['ICH-GCP', 'Declaration of Helsinki'] },
      { id: 'drug_access_pricing', name: 'Drug Access & Pricing', requirements: ['WHO Essential Medicines', 'Pricing Transparency'] }
    ],
    metrics: {
      environmental: ['medical_waste', 'pharmaceutical_emissions', 'energy_efficiency', 'water_usage'],
      social: ['patient_safety_incidents', 'healthcare_access', 'drug_affordability', 'clinical_trial_diversity'],
      governance: ['data_privacy', 'clinical_trial_transparency', 'pricing_transparency', 'regulatory_compliance']
    }
  },
  
  manufacturing: {
    name: 'Manufacturing',
    icon: '🏭',
    color: 'blue',
    frameworks: {
      primary: ['GRI', 'SASB_IM', 'ISSB_S1', 'ISSB_S2'],
      secondary: ['TCFD', 'ISO_14001', 'ISO_45001', 'OECD_MNE']
    },
    reportTemplates: [
      { id: 'gri_manufacturing', name: 'GRI Manufacturing Report', icon: '📊', frameworks: ['GRI-11'] },
      { id: 'sasb_manufacturing', name: 'SASB Industrial Manufacturing', icon: '🏭', frameworks: ['SASB-IM'] },
      { id: 'supply_chain_esg', name: 'Supply Chain ESG Report', icon: '🔗', frameworks: ['GRI-308', 'GRI-414'] },
      { id: 'product_lifecycle', name: 'Product Lifecycle Assessment', icon: '♻️', frameworks: ['ISO-14040'] },
      { id: 'circular_economy', name: 'Circular Economy Report', icon: '🔄', frameworks: ['Ellen MacArthur'] }
    ],
    complianceModules: [
      { id: 'supply_chain_due_diligence', name: 'Supply Chain Due Diligence', requirements: ['OECD Guidelines', 'Conflict Minerals'] },
      { id: 'product_safety_standards', name: 'Product Safety Standards', requirements: ['ISO-9001', 'Consumer Safety'] },
      { id: 'environmental_management', name: 'Environmental Management', requirements: ['ISO-14001', 'Waste Management'] }
    ],
    metrics: {
      environmental: ['industrial_emissions', 'waste_generation', 'energy_intensity', 'water_consumption', 'material_efficiency'],
      social: ['worker_safety', 'supply_chain_labor', 'product_safety', 'community_impact'],
      governance: ['supply_chain_transparency', 'product_quality', 'regulatory_compliance', 'stakeholder_engagement']
    }
  }
};

// Get current sector configuration
export const getCurrentSectorConfig = () => {
  const currentSector = localStorage.getItem('currentSector') || 'mining';
  return SECTOR_CONFIGS[currentSector] || SECTOR_CONFIGS.mining;
};

// Get sector-specific frameworks
export const getSectorFrameworks = (sector = null) => {
  const sectorKey = sector || localStorage.getItem('currentSector') || 'mining';
  const config = SECTOR_CONFIGS[sectorKey];
  return config ? config.frameworks : SECTOR_CONFIGS.mining.frameworks;
};

// Get sector-specific report templates
export const getSectorReportTemplates = (sector = null) => {
  const sectorKey = sector || localStorage.getItem('currentSector') || 'mining';
  const config = SECTOR_CONFIGS[sectorKey];
  return config ? config.reportTemplates : SECTOR_CONFIGS.mining.reportTemplates;
};

// Get sector-specific compliance modules
export const getSectorComplianceModules = (sector = null) => {
  const sectorKey = sector || localStorage.getItem('currentSector') || 'mining';
  const config = SECTOR_CONFIGS[sectorKey];
  return config ? config.complianceModules : SECTOR_CONFIGS.mining.complianceModules;
};

// Get sector-specific metrics
export const getSectorMetrics = (sector = null) => {
  const sectorKey = sector || localStorage.getItem('currentSector') || 'mining';
  const config = SECTOR_CONFIGS[sectorKey];
  return config ? config.metrics : SECTOR_CONFIGS.mining.metrics;
};

export default SECTOR_CONFIGS;