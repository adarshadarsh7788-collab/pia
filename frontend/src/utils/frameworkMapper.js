// Framework Data Mapping and Validation Utilities
import { ESG_FRAMEWORKS, STANDARD_METRICS } from './esgFrameworks';

export const GRI_METRIC_MAPPINGS = {
  // Environmental mappings
  'scope1_emissions': 'GRI-305-1',
  'scope2_emissions': 'GRI-305-2', 
  'scope3_emissions': 'GRI-305-3',
  'energy_consumption': 'GRI-302-1',
  'renewable_energy': 'GRI-302-1',
  'water_withdrawal': 'GRI-303-3',
  'water_discharge': 'GRI-303-4',
  'waste_generated': 'GRI-306-3',
  'waste_recycled': 'GRI-306-4',
  'materials_used': 'GRI-301-1',
  
  // Social mappings
  'total_employees': 'GRI-2-7',
  'new_hires': 'GRI-401-1',
  'employee_turnover': 'GRI-401-1',
  'female_employees': 'GRI-405-1',
  'board_diversity': 'GRI-405-1',
  'training_hours': 'GRI-404-1',
  'safety_incidents': 'GRI-403-9',
  'lost_time_injuries': 'GRI-403-9',
  
  // Governance mappings
  'board_size': 'GRI-2-9',
  'independent_directors': 'GRI-2-9',
  'ethics_violations': 'GRI-205-3',
  'corruption_incidents': 'GRI-205-3',
  'legal_actions': 'GRI-206-1'
};

export const SASB_METRIC_MAPPINGS = {
  // Technology sector mappings
  'data_breaches': 'TC-SI-230a.1',
  'customer_privacy': 'TC-SI-220a.1',
  'energy_consumption': 'TC-SI-130a.1',
  'renewable_energy': 'TC-SI-130a.2',
  
  // Financial sector mappings
  'esg_integration': 'FN-IB-410a.1',
  'climate_risk': 'FN-CB-450a.1',
  'financial_inclusion': 'FN-CB-240a.1',
  
  // Healthcare sector mappings
  'clinical_trial_safety': 'HC-BP-210a.1',
  'drug_pricing': 'HC-BP-240a.1',
  'product_recalls': 'HC-BP-250a.1'
};

export const validateFrameworkCompliance = (data, framework = 'GRI') => {
  const results = {
    framework,
    totalRequirements: 0,
    metRequirements: 0,
    missingRequirements: [],
    complianceScore: 0,
    categoryScores: {}
  };

  const normalizedData = Array.isArray(data) ? data : [];
  
  if (framework === 'GRI') {
    const griRequirements = {
      environmental: ['scope1Emissions', 'scope2Emissions', 'energyConsumption', 'waterWithdrawal', 'wasteGenerated'],
      social: ['totalEmployees', 'femaleEmployeesPercentage', 'trainingHoursPerEmployee', 'lostTimeInjuryRate'],
      governance: ['boardSize', 'independentDirectorsPercentage', 'ethicsTrainingCompletion', 'corruptionIncidents']
    };
    
    Object.entries(griRequirements).forEach(([category, requirements]) => {
      const categoryData = normalizedData.filter(item => 
        item.category?.toLowerCase() === category.toLowerCase()
      );
      
      const availableMetrics = new Set(categoryData.map(item => item.metric));
      const metRequirements = requirements.filter(req => 
        availableMetrics.has(req) || 
        categoryData.some(item => item.metric?.includes(req.replace(/([A-Z])/g, '_$1').toLowerCase().substring(1)))
      );

      results.categoryScores[category] = {
        total: requirements.length,
        met: metRequirements.length,
        percentage: Math.round((metRequirements.length / requirements.length) * 100),
        missing: requirements.filter(req => !metRequirements.includes(req))
      };

      results.totalRequirements += requirements.length;
      results.metRequirements += metRequirements.length;
      results.missingRequirements.push(...results.categoryScores[category].missing);
    });
  }

  if (framework === 'SASB') {
    const sasbRequirements = {
      environmental: ['energyConsumption', 'renewableEnergy', 'waterWithdrawal', 'ghgEmissions'],
      social: ['employeeDiversity', 'dataPrivacy', 'customerSatisfaction'],
      governance: ['dataSecurity', 'businessEthics', 'riskManagement']
    };
    
    Object.entries(sasbRequirements).forEach(([category, requirements]) => {
      const categoryData = normalizedData.filter(item => 
        item.category?.toLowerCase() === category.toLowerCase()
      );
      
      const availableMetrics = new Set(categoryData.map(item => item.metric));
      const metRequirements = requirements.filter(req => 
        availableMetrics.has(req) || 
        categoryData.some(item => item.metric?.includes(req.replace(/([A-Z])/g, '_$1').toLowerCase().substring(1)))
      );

      results.categoryScores[category] = {
        total: requirements.length,
        met: metRequirements.length,
        percentage: Math.round((metRequirements.length / requirements.length) * 100),
        missing: requirements.filter(req => !metRequirements.includes(req))
      };

      results.totalRequirements += requirements.length;
      results.metRequirements += metRequirements.length;
      results.missingRequirements.push(...results.categoryScores[category].missing);
    });
  }

  if (framework === 'TCFD') {
    const tcfdRequirements = {
      governance: ['boardOversight', 'managementRole'],
      strategy: ['climateRisks', 'businessImpact'],
      risk_management: ['riskIdentification', 'riskAssessment'],
      metrics_targets: ['scope1Emissions', 'scope2Emissions', 'scope3Emissions']
    };
    
    Object.entries(tcfdRequirements).forEach(([pillar, requirements]) => {
      const availableMetrics = new Set(normalizedData.map(item => item.metric));
      const metRequirements = requirements.filter(req => 
        availableMetrics.has(req) || 
        normalizedData.some(item => item.metric?.includes(req.replace(/([A-Z])/g, '_$1').toLowerCase().substring(1)))
      );

      results.categoryScores[pillar] = {
        total: requirements.length,
        met: metRequirements.length,
        percentage: Math.round((metRequirements.length / requirements.length) * 100),
        missing: requirements.filter(req => !metRequirements.includes(req))
      };

      results.totalRequirements += requirements.length;
      results.metRequirements += metRequirements.length;
      results.missingRequirements.push(...results.categoryScores[pillar].missing);
    });
  }

  if (framework === 'BRSR') {
    const brsrRequirements = {
      environmental: ['energyConsumption', 'ghgEmissions', 'waterUsage', 'wasteManagement'],
      social: ['employeeWellbeing', 'diversityInclusion', 'communityInvestment'],
      governance: ['boardComposition', 'ethicsCompliance', 'stakeholderEngagement']
    };
    
    Object.entries(brsrRequirements).forEach(([category, requirements]) => {
      const categoryData = normalizedData.filter(item => 
        item.category?.toLowerCase() === category.toLowerCase()
      );
      
      const availableMetrics = new Set(categoryData.map(item => item.metric));
      const metRequirements = requirements.filter(req => 
        availableMetrics.has(req) || 
        categoryData.some(item => item.metric?.includes(req.replace(/([A-Z])/g, '_$1').toLowerCase().substring(1)))
      );

      results.categoryScores[category] = {
        total: requirements.length,
        met: metRequirements.length,
        percentage: Math.round((metRequirements.length / requirements.length) * 100),
        missing: requirements.filter(req => !metRequirements.includes(req))
      };

      results.totalRequirements += requirements.length;
      results.metRequirements += metRequirements.length;
      results.missingRequirements.push(...results.categoryScores[category].missing);
    });
  }

  results.complianceScore = results.totalRequirements > 0 
    ? Math.round((results.metRequirements / results.totalRequirements) * 100) 
    : 0;

  return results;
};

export const mapDataToFramework = (dataEntry, targetFramework = 'GRI') => {
  const mappedEntry = { ...dataEntry };
  
  if (targetFramework === 'GRI' && dataEntry.metric) {
    const griCode = GRI_METRIC_MAPPINGS[dataEntry.metric];
    if (griCode) {
      mappedEntry.framework = griCode;
      mappedEntry.frameworkStandard = griCode;
    }
  }
  
  if (targetFramework === 'SASB' && dataEntry.metric) {
    const sasbCode = SASB_METRIC_MAPPINGS[dataEntry.metric];
    if (sasbCode) {
      mappedEntry.framework = sasbCode;
      mappedEntry.frameworkStandard = sasbCode;
    }
  }
  
  return mappedEntry;
};

export const generateFrameworkReport = (data, framework = 'GRI', industry = null) => {
  const compliance = validateFrameworkCompliance(data, framework);
  const mappedData = data.map(entry => mapDataToFramework(entry, framework));
  
  const report = {
    framework,
    industry,
    generatedAt: new Date().toISOString(),
    compliance,
    data: mappedData,
    summary: {
      totalDataPoints: data.length,
      frameworkMappedPoints: mappedData.filter(item => item.framework).length,
      complianceLevel: compliance.complianceScore >= 80 ? 'High' : 
                      compliance.complianceScore >= 60 ? 'Medium' : 'Low',
      recommendations: generateRecommendations(compliance, framework)
    }
  };
  
  return report;
};

const generateRecommendations = (compliance, framework) => {
  const recommendations = [];
  
  if (compliance.complianceScore < 60) {
    recommendations.push({
      priority: 'High',
      category: 'Foundation',
      action: `Implement core ${framework} requirements to establish baseline compliance`,
      impact: 'Critical for regulatory compliance and stakeholder trust'
    });
  }
  
  Object.entries(compliance.categoryScores).forEach(([category, score]) => {
    if (score.percentage < 70) {
      recommendations.push({
        priority: score.percentage < 50 ? 'High' : 'Medium',
        category: category.charAt(0).toUpperCase() + category.slice(1),
        action: `Address ${score.missing.length} missing ${framework} requirements in ${category}`,
        impact: `Improve ${category} reporting completeness`
      });
    }
  });
  
  if (compliance.complianceScore >= 80) {
    recommendations.push({
      priority: 'Low',
      category: 'Enhancement',
      action: 'Consider implementing additional frameworks or advanced reporting features',
      impact: 'Demonstrate leadership in ESG reporting'
    });
  }
  
  return recommendations;
};

export const getFrameworkGuidance = (framework, category = null) => {
  const guidance = {
    GRI: {
      general: "GRI Standards provide a comprehensive framework for sustainability reporting. Focus on materiality assessment and stakeholder engagement.",
      environmental: "Report on energy, emissions, water, waste, and biodiversity impacts. Include both direct and indirect impacts.",
      social: "Cover employment, health & safety, training, diversity, human rights, and community impacts.",
      governance: "Address governance structure, ethics, anti-corruption, and stakeholder engagement processes."
    },
    SASB: {
      general: "SASB focuses on financially material sustainability topics specific to your industry. Identify your industry classification first.",
      environmental: "Report on industry-specific environmental metrics that affect financial performance.",
      social: "Focus on social factors that create financial risks or opportunities in your sector.",
      governance: "Address governance practices that impact long-term value creation."
    }
  };
  
  return category ? guidance[framework]?.[category] : guidance[framework]?.general;
};

export default {
  GRI_METRIC_MAPPINGS,
  SASB_METRIC_MAPPINGS,
  validateFrameworkCompliance,
  mapDataToFramework,
  generateFrameworkReport,
  getFrameworkGuidance
};