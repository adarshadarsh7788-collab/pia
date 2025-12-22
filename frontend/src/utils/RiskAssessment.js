// ESG Risk Matrix and Assessment Engine
export class RiskAssessment {
  static riskCategories = {
    environmental: ['climate_change', 'resource_scarcity', 'pollution', 'biodiversity_loss'],
    social: ['labor_practices', 'human_rights', 'community_relations', 'product_safety'],
    governance: ['board_oversight', 'executive_compensation', 'transparency', 'corruption']
  };

  static assessESGRisks(companyData, industry, region = 'global') {
    if (!companyData || typeof companyData !== 'object') {
      throw new Error('Invalid company data for risk assessment');
    }
    if (!industry || typeof industry !== 'string') {
      throw new Error('Valid industry must be specified for risk assessment');
    }

    try {
      const riskMatrix = this.buildRiskMatrix(companyData, industry);
      const materialityAssessment = this.assessMateriality(riskMatrix, industry);
      const mitigationStrategies = this.generateMitigationStrategies(riskMatrix);

      return {
        overallRiskScore: this.calculateOverallRisk(riskMatrix),
        riskMatrix,
        materialityAssessment,
        mitigationStrategies,
        riskTrends: this.analyzeRiskTrends(companyData),
        regulatoryRisks: this.assessRegulatoryRisks(industry, region)
      };
    } catch (error) {
      console.error('Risk assessment failed:', error);
      return this.getDefaultRiskAssessment();
    }
  }

  static getDefaultRiskAssessment() {
    return {
      overallRiskScore: { score: 0, level: 'unknown', distribution: { critical: 0, high: 0, medium: 0, low: 0 } },
      riskMatrix: {},
      materialityAssessment: [],
      mitigationStrategies: {},
      riskTrends: { emerging: [], declining: [], stable: [] },
      regulatoryRisks: { applicableRegulations: [], complianceGaps: [], upcomingRequirements: [] }
    };
  }

  static buildRiskMatrix(data, industry) {
    const matrix = {};
    
    Object.entries(this.riskCategories).forEach(([category, risks]) => {
      matrix[category] = {};
      
      risks.forEach(risk => {
        const probability = this.calculateRiskProbability(data, category, risk, industry);
        const impact = this.calculateRiskImpact(risk, industry);
        
        matrix[category][risk] = {
          probability,
          impact,
          riskScore: probability * impact,
          riskLevel: this.getRiskLevel(probability * impact),
          mitigationStatus: this.assessMitigationStatus(data, risk)
        };
      });
    });

    return matrix;
  }

  static calculateRiskProbability(data, category, risk, industry) {
    const categoryData = data[category] || {};
    const industryMultiplier = this.getIndustryRiskMultiplier(industry, risk);
    
    // Base probability calculation based on performance gaps
    let baseProbability = 0.3; // Default moderate probability
    
    if (categoryData.score < 50) baseProbability = 0.8;
    else if (categoryData.score < 70) baseProbability = 0.5;
    else if (categoryData.score > 85) baseProbability = 0.2;

    return Math.min(0.95, baseProbability * industryMultiplier);
  }

  static calculateRiskImpact(risk, industry) {
    const impactMatrix = {
      climate_change: { technology: 0.7, manufacturing: 0.9, energy: 0.95, finance: 0.6 },
      resource_scarcity: { manufacturing: 0.9, technology: 0.6, energy: 0.8 },
      labor_practices: { manufacturing: 0.8, technology: 0.7, healthcare: 0.9 },
      board_oversight: { finance: 0.9, technology: 0.8, manufacturing: 0.7 }
    };

    return impactMatrix[risk]?.[industry] || 0.6;
  }

  static getIndustryRiskMultiplier(industry, risk) {
    const multipliers = {
      energy: { climate_change: 1.5, pollution: 1.4 },
      manufacturing: { resource_scarcity: 1.3, labor_practices: 1.2 },
      technology: { human_rights: 1.2, transparency: 0.8 },
      finance: { corruption: 1.3, board_oversight: 1.1 }
    };

    return multipliers[industry]?.[risk] || 1.0;
  }

  static getRiskLevel(riskScore) {
    if (riskScore >= 0.7) return 'critical';
    if (riskScore >= 0.5) return 'high';
    if (riskScore >= 0.3) return 'medium';
    return 'low';
  }

  static assessMitigationStatus(data, risk) {
    // Simplified mitigation assessment based on available controls
    const controls = data.controls || {};
    return controls[risk] ? 'active' : 'planned';
  }

  static calculateOverallRisk(riskMatrix) {
    let totalRisk = 0;
    let riskCount = 0;

    if (!riskMatrix || typeof riskMatrix !== 'object') {
      return { score: 0, level: 'unknown', distribution: { critical: 0, high: 0, medium: 0, low: 0 } };
    }

    Object.values(riskMatrix).forEach(category => {
      if (category && typeof category === 'object') {
        Object.values(category).forEach(risk => {
          if (risk && typeof risk.riskScore === 'number') {
            totalRisk += risk.riskScore;
            riskCount++;
          }
        });
      }
    });

    if (riskCount === 0) {
      return { score: 0, level: 'unknown', distribution: { critical: 0, high: 0, medium: 0, low: 0 } };
    }

    const avgRisk = totalRisk / riskCount;
    return {
      score: Math.round(avgRisk * 100),
      level: this.getRiskLevel(avgRisk),
      distribution: this.getRiskDistribution(riskMatrix)
    };
  }

  static getRiskDistribution(riskMatrix) {
    const distribution = { critical: 0, high: 0, medium: 0, low: 0 };
    
    Object.values(riskMatrix).forEach(category => {
      Object.values(category).forEach(risk => {
        distribution[risk.riskLevel]++;
      });
    });

    return distribution;
  }

  static assessMateriality(riskMatrix, industry) {
    const materialRisks = [];
    
    Object.entries(riskMatrix).forEach(([category, risks]) => {
      Object.entries(risks).forEach(([riskType, riskData]) => {
        if (riskData.riskScore >= 0.5) {
          materialRisks.push({
            category,
            risk: riskType,
            score: riskData.riskScore,
            stakeholderImpact: this.assessStakeholderImpact(riskType, industry),
            businessImpact: this.assessBusinessImpact(riskType, riskData.riskScore)
          });
        }
      });
    });

    return materialRisks.sort((a, b) => b.score - a.score);
  }

  static assessStakeholderImpact(risk, industry) {
    const stakeholderMatrix = {
      climate_change: ['investors', 'regulators', 'customers'],
      labor_practices: ['employees', 'unions', 'communities'],
      board_oversight: ['shareholders', 'regulators', 'rating_agencies']
    };

    return stakeholderMatrix[risk] || ['stakeholders'];
  }

  static assessBusinessImpact(risk, riskScore) {
    const impacts = [];
    
    if (riskScore >= 0.7) {
      impacts.push('Potential regulatory penalties');
      impacts.push('Reputation damage');
      impacts.push('Investor confidence loss');
    } else if (riskScore >= 0.5) {
      impacts.push('Operational disruptions');
      impacts.push('Increased compliance costs');
    }

    return impacts;
  }

  static generateMitigationStrategies(riskMatrix) {
    const strategies = {};
    
    Object.entries(riskMatrix).forEach(([category, risks]) => {
      strategies[category] = [];
      
      Object.entries(risks).forEach(([riskType, riskData]) => {
        if (riskData.riskLevel === 'critical' || riskData.riskLevel === 'high') {
          strategies[category].push({
            risk: riskType,
            priority: riskData.riskLevel === 'critical' ? 'immediate' : 'high',
            actions: this.getSpecificMitigationActions(riskType),
            timeline: riskData.riskLevel === 'critical' ? '3 months' : '6 months',
            resources: this.estimateResourceRequirements(riskType, riskData.riskScore)
          });
        }
      });
    });

    return strategies;
  }

  static getSpecificMitigationActions(risk) {
    const actionMap = {
      climate_change: ['Set science-based targets', 'Implement carbon reduction plan', 'Enhance climate disclosure'],
      labor_practices: ['Conduct labor audits', 'Implement fair wage policies', 'Strengthen worker safety programs'],
      board_oversight: ['Enhance board independence', 'Implement ESG oversight committee', 'Improve transparency']
    };

    return actionMap[risk] || ['Develop comprehensive risk management plan'];
  }

  static estimateResourceRequirements(risk, riskScore) {
    const baseEffort = riskScore * 100;
    return {
      effort: baseEffort > 70 ? 'high' : baseEffort > 40 ? 'medium' : 'low',
      budget: baseEffort > 70 ? '$500K+' : baseEffort > 40 ? '$100K-500K' : '<$100K',
      timeline: baseEffort > 70 ? '12+ months' : baseEffort > 40 ? '6-12 months' : '3-6 months'
    };
  }

  static analyzeRiskTrends(data) {
    // Simplified trend analysis for risk evolution
    return {
      emerging: ['supply_chain_disruption', 'cyber_security'],
      declining: ['traditional_governance'],
      stable: ['environmental_compliance']
    };
  }

  static assessRegulatoryRisks(industry, region) {
    const regulatoryLandscape = {
      global: ['TCFD', 'SASB', 'GRI'],
      eu: ['CSRD', 'EU_Taxonomy', 'SFDR'],
      us: ['SEC_Climate_Rules', 'State_Regulations']
    };

    return {
      applicableRegulations: regulatoryLandscape[region] || regulatoryLandscape.global,
      complianceGaps: this.identifyComplianceGaps(industry),
      upcomingRequirements: this.getUpcomingRequirements(region)
    };
  }

  static identifyComplianceGaps(industry) {
    return [
      'Climate risk disclosure gaps',
      'Supply chain transparency requirements',
      'Board diversity reporting'
    ];
  }

  static getUpcomingRequirements(region) {
    return [
      { regulation: 'Enhanced climate disclosure', deadline: '2025-01-01', impact: 'high' },
      { regulation: 'Supply chain due diligence', deadline: '2024-07-01', impact: 'medium' }
    ];
  }
}