// Mining-Specific ESG Metrics aligned with GRI-11, IFRS S1/S2, and Zimbabwe requirements

export const MINING_METRICS = {
  environmental: {
    tailingsManagement: {
      code: 'GRI-11',
      name: 'Tailings Management',
      unit: 'tonnes',
      description: 'Total tailings produced and managed',
      critical: true
    },
    waterStewardship: {
      code: 'GRI-303',
      name: 'Water Stewardship',
      metrics: ['waterWithdrawal', 'waterDischarge', 'waterRecycled'],
      unit: 'm³',
      critical: true
    },
    biodiversity: {
      code: 'GRI-304',
      name: 'Biodiversity Impact',
      unit: 'hectares',
      description: 'Land affected and rehabilitation progress',
      critical: true
    },
    climateRisk: {
      code: 'IFRS-S2',
      name: 'Climate-Related Disclosures',
      metrics: ['scope1', 'scope2', 'scope3', 'climateRisks'],
      critical: true
    }
  },
  social: {
    occupationalHealth: {
      code: 'GRI-403',
      name: 'Occupational Health & Safety',
      metrics: ['lostTimeInjuryRate', 'fatalityRate', 'safetyTraining'],
      critical: true
    },
    localCommunities: {
      code: 'GRI-413',
      name: 'Local Communities',
      metrics: ['communityInvestment', 'localEmployment', 'grievances'],
      critical: true
    }
  },
  governance: {
    sustainabilityGovernance: {
      code: 'IFRS-S1',
      name: 'Sustainability Governance',
      description: 'Board oversight and risk management',
      critical: true
    }
  }
};

export const ZIMBABWE_MINING_REQUIREMENTS = {
  environmental: ['Water pollution control', 'Land rehabilitation', 'Biodiversity protection'],
  social: ['Local employment targets', 'Community development', 'Safety standards'],
  governance: ['Revenue transparency', 'Anti-corruption', 'Stakeholder engagement'],
  investorFocus: ['ESG risk scoring', 'FDI readiness', 'Export compliance']
};

export const validateMiningMetrics = (data) => {
  const compliance = {
    gri11: false,
    gri303: false,
    gri304: false,
    gri403: false,
    gri413: false,
    ifrsS1: false,
    ifrsS2: false
  };

  if (data.environmental?.tailingsProduced) compliance.gri11 = true;
  if (data.environmental?.waterWithdrawal && data.environmental?.waterDischarge) compliance.gri303 = true;
  if (data.environmental?.biodiversityImpact || data.environmental?.landRehabilitated) compliance.gri304 = true;
  if (data.social?.lostTimeInjuryRate && data.social?.fatalityRate) compliance.gri403 = true;
  if (data.social?.communityInvestment && data.social?.localEmploymentPercentage) compliance.gri413 = true;
  if (data.governance?.sustainabilityGovernance) compliance.ifrsS1 = true;
  if (data.environmental?.scope1Emissions && data.governance?.climateRiskDisclosure) compliance.ifrsS2 = true;

  const score = Object.values(compliance).filter(Boolean).length;
  return { compliance, score: Math.round((score / 7) * 100) };
};

export default { MINING_METRICS, ZIMBABWE_MINING_REQUIREMENTS, validateMiningMetrics };
