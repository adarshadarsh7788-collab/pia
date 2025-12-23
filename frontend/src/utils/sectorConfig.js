// Sector-specific configurations for ESG system
export const SECTOR_CONFIGS = {
  // No sector-specific configurations - using generic ESG framework
};

// Get current sector configuration
export const getCurrentSectorConfig = () => {
  return null;
};

// Get sector-specific frameworks
export const getSectorFrameworks = (sector = null) => {
  return { primary: ['GRI', 'SASB', 'TCFD', 'BRSR'], secondary: ['ISSB_S1', 'ISSB_S2'] };
};

// Get sector-specific report templates
export const getSectorReportTemplates = (sector = null) => {
  return [
    { id: 'gri_standard', name: 'GRI Standards Report', icon: '📊', frameworks: ['GRI'] },
    { id: 'sasb_standard', name: 'SASB Standards Report', icon: '📋', frameworks: ['SASB'] },
    { id: 'tcfd_report', name: 'TCFD Climate Report', icon: '🌡️', frameworks: ['TCFD'] },
    { id: 'brsr_report', name: 'BRSR Compliance Report', icon: '🇮🇳', frameworks: ['BRSR'] }
  ];
};

// Get sector-specific compliance modules
export const getSectorComplianceModules = (sector = null) => {
  return [
    { id: 'esg_compliance', name: 'ESG Compliance Framework', requirements: ['GRI Standards', 'SASB Standards'] },
    { id: 'climate_disclosure', name: 'Climate Disclosure', requirements: ['TCFD', 'ISSB S2'] },
    { id: 'sustainability_reporting', name: 'Sustainability Reporting', requirements: ['BRSR', 'UN SDG'] }
  ];
};

// Get sector-specific metrics
export const getSectorMetrics = (sector = null) => {
  return {
    environmental: ['carbon_emissions', 'energy_consumption', 'water_usage', 'waste_generation'],
    social: ['employee_diversity', 'safety_incidents', 'community_investment', 'training_hours'],
    governance: ['board_diversity', 'ethics_compliance', 'data_privacy', 'stakeholder_engagement']
  };
};

export default SECTOR_CONFIGS;