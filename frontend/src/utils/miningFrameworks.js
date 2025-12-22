/**
 * Mining Sector-Specific ESG Frameworks
 * Includes ICMM, EITI, Zimbabwe regulations, and ISSB standards
 */

export const MINING_FRAMEWORKS = {
  ICMM: {
    name: 'International Council on Mining and Metals',
    description: 'Global mining industry sustainability framework',
    principles: [
      { id: 'ICMM-1', title: 'Ethical Business', metrics: ['anti-corruption', 'transparency', 'human-rights'] },
      { id: 'ICMM-2', title: 'Decision Making', metrics: ['stakeholder-engagement', 'impact-assessment'] },
      { id: 'ICMM-3', title: 'Human Rights', metrics: ['indigenous-rights', 'resettlement', 'security'] },
      { id: 'ICMM-4', title: 'Risk Management', metrics: ['health-safety', 'emergency-response'] },
      { id: 'ICMM-5', title: 'Environmental Performance', metrics: ['biodiversity', 'water', 'tailings'] },
      { id: 'ICMM-6', title: 'Conservation', metrics: ['land-rehabilitation', 'mine-closure'] },
      { id: 'ICMM-7', title: 'Biodiversity', metrics: ['protected-areas', 'species-conservation'] },
      { id: 'ICMM-8', title: 'Responsible Production', metrics: ['product-stewardship', 'supply-chain'] },
      { id: 'ICMM-9', title: 'Social Performance', metrics: ['local-employment', 'community-development'] },
      { id: 'ICMM-10', title: 'Stakeholder Engagement', metrics: ['consultation', 'grievance-mechanism'] }
    ]
  },
  
  EITI: {
    name: 'Extractive Industries Transparency Initiative',
    description: 'Global standard for transparency in extractive sector',
    requirements: [
      { id: 'EITI-1', title: 'Legal Framework', metrics: ['mining-licenses', 'contracts', 'beneficial-ownership'] },
      { id: 'EITI-2', title: 'Production Data', metrics: ['production-volumes', 'export-data'] },
      { id: 'EITI-3', title: 'Revenue Collection', metrics: ['taxes', 'royalties', 'dividends'] },
      { id: 'EITI-4', title: 'Revenue Allocation', metrics: ['government-revenue', 'subnational-transfers'] },
      { id: 'EITI-5', title: 'Social Expenditure', metrics: ['community-payments', 'infrastructure'] },
      { id: 'EITI-6', title: 'State Participation', metrics: ['state-owned-enterprises', 'quasi-fiscal'] }
    ]
  },

  ISSB_S1: {
    name: 'IFRS S1 - General Sustainability Disclosures',
    description: 'Sustainability-related financial information',
    pillars: [
      { id: 'S1-GOV', title: 'Governance', metrics: ['board-oversight', 'management-role', 'controls'] },
      { id: 'S1-STRAT', title: 'Strategy', metrics: ['risks-opportunities', 'business-model', 'value-chain'] },
      { id: 'S1-RISK', title: 'Risk Management', metrics: ['identification', 'assessment', 'mitigation'] },
      { id: 'S1-METRICS', title: 'Metrics & Targets', metrics: ['performance-metrics', 'targets', 'trends'] }
    ]
  },

  ISSB_S2: {
    name: 'IFRS S2 - Climate-related Disclosures',
    description: 'Climate-related financial disclosures based on TCFD',
    categories: [
      { id: 'S2-GOV', title: 'Governance', metrics: ['climate-oversight', 'management-responsibility'] },
      { id: 'S2-STRAT', title: 'Strategy', metrics: ['climate-risks', 'opportunities', 'resilience', 'transition-plan'] },
      { id: 'S2-RISK', title: 'Risk Management', metrics: ['climate-risk-identification', 'integration'] },
      { id: 'S2-METRICS', title: 'Metrics & Targets', metrics: ['ghg-emissions', 'climate-targets', 'scenario-analysis'] }
    ]
  },

  ZIMBABWE_EMA: {
    name: 'Environmental Management Act (Chapter 20:27)',
    description: 'Zimbabwe environmental regulations',
    requirements: [
      { id: 'EMA-1', title: 'EIA Certificate', metrics: ['environmental-impact-assessment', 'eia-approval'] },
      { id: 'EMA-2', title: 'Effluent Standards', metrics: ['water-discharge', 'effluent-quality'] },
      { id: 'EMA-3', title: 'Air Quality', metrics: ['emissions-monitoring', 'air-quality-standards'] },
      { id: 'EMA-4', title: 'Waste Management', metrics: ['hazardous-waste', 'waste-disposal'] },
      { id: 'EMA-5', title: 'Environmental Levy', metrics: ['levy-payment', 'compliance-certificate'] }
    ]
  },

  ZIMBABWE_MMA: {
    name: 'Mines and Minerals Act (Chapter 21:05)',
    description: 'Zimbabwe mining regulations',
    requirements: [
      { id: 'MMA-1', title: 'Mining Title', metrics: ['special-grant', 'mining-lease', 'claim'] },
      { id: 'MMA-2', title: 'Royalties', metrics: ['royalty-payment', 'production-returns'] },
      { id: 'MMA-3', title: 'Mine Safety', metrics: ['safety-certificate', 'accident-reporting'] },
      { id: 'MMA-4', title: 'Mine Closure', metrics: ['closure-plan', 'rehabilitation-bond'] },
      { id: 'MMA-5', title: 'Local Content', metrics: ['local-employment', 'local-procurement'] }
    ]
  },

  ZSE_LISTING: {
    name: 'Zimbabwe Stock Exchange ESG Requirements',
    description: 'ZSE listing and disclosure requirements',
    requirements: [
      { id: 'ZSE-1', title: 'Annual Reporting', metrics: ['financial-statements', 'esg-disclosure'] },
      { id: 'ZSE-2', title: 'Corporate Governance', metrics: ['board-composition', 'audit-committee'] },
      { id: 'ZSE-3', title: 'Continuous Disclosure', metrics: ['material-events', 'price-sensitive-info'] }
    ]
  }
};

export const MINING_METRICS = {
  tailingsManagement: {
    name: 'Tailings Management',
    unit: 'tonnes',
    category: 'environmental',
    framework: ['ICMM', 'ISSB_S2'],
    subMetrics: ['tailings-volume', 'dam-stability', 'seepage-monitoring', 'emergency-preparedness']
  },
  
  mineClosurePlan: {
    name: 'Mine Closure Planning',
    unit: 'USD',
    category: 'environmental',
    framework: ['ICMM', 'ZIMBABWE_MMA'],
    subMetrics: ['closure-cost-estimate', 'rehabilitation-bond', 'post-closure-monitoring']
  },

  artisanalMining: {
    name: 'Artisanal Mining Impact',
    unit: 'number',
    category: 'social',
    framework: ['EITI', 'ZIMBABWE_MMA'],
    subMetrics: ['artisanal-miners', 'formalization-support', 'conflict-resolution']
  },

  waterPollution: {
    name: 'Water Pollution',
    unit: 'mg/L',
    category: 'environmental',
    framework: ['ZIMBABWE_EMA', 'ISSB_S2'],
    subMetrics: ['ph-level', 'heavy-metals', 'suspended-solids', 'discharge-volume']
  },

  landDegradation: {
    name: 'Land Degradation',
    unit: 'hectares',
    category: 'environmental',
    framework: ['ICMM', 'ZIMBABWE_EMA'],
    subMetrics: ['disturbed-area', 'rehabilitated-area', 'topsoil-management']
  },

  biodiversityLoss: {
    name: 'Biodiversity Impact',
    unit: 'index',
    category: 'environmental',
    framework: ['ICMM', 'ISSB_S2'],
    subMetrics: ['species-affected', 'habitat-loss', 'offset-programs']
  },

  communityResettlement: {
    name: 'Community Resettlement',
    unit: 'households',
    category: 'social',
    framework: ['ICMM', 'ISSB_S1'],
    subMetrics: ['households-resettled', 'compensation-paid', 'livelihood-restoration']
  },

  localEmployment: {
    name: 'Local Employment',
    unit: 'percentage',
    category: 'social',
    framework: ['ZIMBABWE_MMA', 'EITI'],
    subMetrics: ['local-workforce', 'skills-training', 'local-management']
  },

  grievanceMechanism: {
    name: 'Grievance Mechanism',
    unit: 'number',
    category: 'social',
    framework: ['ICMM', 'ISSB_S1'],
    subMetrics: ['complaints-received', 'complaints-resolved', 'resolution-time']
  },

  miningFatalities: {
    name: 'Mining Fatalities',
    unit: 'number',
    category: 'social',
    framework: ['ZIMBABWE_MMA', 'ICMM'],
    subMetrics: ['fatality-rate', 'lost-time-injuries', 'occupational-diseases']
  },

  conflictMinerals: {
    name: 'Conflict Minerals Due Diligence',
    unit: 'compliance',
    category: 'governance',
    framework: ['EITI', 'ICMM'],
    subMetrics: ['supply-chain-audit', 'traceability', 'certification']
  },

  fdiImpact: {
    name: 'Foreign Direct Investment',
    unit: 'USD',
    category: 'governance',
    framework: ['EITI', 'ZSE_LISTING'],
    subMetrics: ['fdi-inflow', 'export-earnings', 'government-revenue']
  }
};

export const ZIMBABWE_CURRENCY = {
  code: 'ZWL',
  name: 'Zimbabwe Dollar',
  symbol: 'Z$',
  exchangeRates: {
    USD: 0.0031, // Approximate rate
    ZAR: 0.056
  }
};

export const validateMiningCompliance = (data, framework) => {
  const frameworkData = MINING_FRAMEWORKS[framework];
  if (!frameworkData) return { compliant: false, score: 0, gaps: [] };

  const requirements = frameworkData.principles || frameworkData.requirements || frameworkData.pillars || frameworkData.categories;
  let compliantCount = 0;
  const gaps = [];

  requirements.forEach(req => {
    const hasData = req.metrics.some(metric => data[metric] !== undefined);
    if (hasData) {
      compliantCount++;
    } else {
      gaps.push(req.title);
    }
  });

  return {
    compliant: compliantCount === requirements.length,
    score: Math.round((compliantCount / requirements.length) * 100),
    gaps,
    compliantCount,
    totalRequirements: requirements.length
  };
};
