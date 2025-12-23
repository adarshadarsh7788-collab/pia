// Biodiversity & Land Use Management Module
export class BiodiversityLandUse {
  static landUseTypes = ['owned', 'leased', 'managed', 'impacted'];
  static habitatTypes = ['forest', 'wetland', 'grassland', 'marine', 'urban'];
  static threatLevels = ['low', 'medium', 'high', 'critical'];

  static assessBiodiversity(landData, conservationData) {
    try {
      const landUse = this.analyzeLandUse(landData);
      const biodiversityImpact = this.calculateBiodiversityImpact(landData, conservationData);
      const conservation = this.assessConservationEfforts(conservationData);
      
      return {
        landUse,
        biodiversityImpact,
        conservation,
        riskAssessment: this.assessBiodiversityRisk(landData),
        initiatives: this.trackConservationInitiatives(conservationData),
        compliance: this.checkEnvironmentalCompliance(landData, conservationData)
      };
    } catch (error) {
      console.error('Biodiversity assessment failed:', error);
      return this.getDefaultBiodiversityAssessment();
    }
  }

  static analyzeLandUse(landData) {
    const totalArea = this.calculateTotalArea(landData);
    const breakdown = this.categorizeLandUse(landData);
    const intensity = this.calculateLandUseIntensity(landData);
    
    return {
      totalArea,
      breakdown,
      intensity,
      changeOverTime: this.analyzeLandUseChange(landData)
    };
  }

  static calculateTotalArea(data) {
    return this.landUseTypes.reduce((total, type) => {
      return total + (data[type] || 0);
    }, 0);
  }

  static categorizeLandUse(data) {
    const result = {};
    this.landUseTypes.forEach(type => {
      result[type] = {
        area: data[type] || 0,
        percentage: this.calculatePercentage(data[type] || 0, this.calculateTotalArea(data))
      };
    });
    return result;
  }

  static calculateLandUseIntensity(data) {
    const totalArea = this.calculateTotalArea(data);
    const revenue = data.revenue || 1;
    const production = data.production || 1;
    
    return {
      areaPerRevenue: totalArea / revenue,
      areaPerProduction: totalArea / production
    };
  }

  static analyzeLandUseChange(data) {
    const historical = data.historical || [];
    if (historical.length < 2) return { trend: 'insufficient_data', change: 0 };
    
    const recent = historical[historical.length - 1];
    const previous = historical[historical.length - 2];
    const change = ((recent.totalArea - previous.totalArea) / previous.totalArea) * 100;
    
    return {
      trend: change > 0 ? 'increasing' : change < 0 ? 'decreasing' : 'stable',
      change: Math.abs(change),
      period: `${previous.year}-${recent.year}`
    };
  }

  static calculateBiodiversityImpact(landData, conservationData) {
    const habitatImpact = this.assessHabitatImpact(landData);
    const speciesImpact = this.assessSpeciesImpact(conservationData);
    const ecosystemServices = this.evaluateEcosystemServices(landData, conservationData);
    
    return {
      habitatImpact,
      speciesImpact,
      ecosystemServices,
      overallScore: this.calculateBiodiversityScore(habitatImpact, speciesImpact, ecosystemServices)
    };
  }

  static assessHabitatImpact(data) {
    const habitats = data.habitats || {};
    const impact = {};
    
    this.habitatTypes.forEach(type => {
      const area = habitats[type] || 0;
      const quality = habitats[`${type}_quality`] || 50;
      impact[type] = {
        area,
        quality,
        impactScore: this.calculateHabitatImpactScore(area, quality)
      };
    });
    
    return impact;
  }

  static assessSpeciesImpact(data) {
    const species = data.species || {};
    return {
      endangered: species.endangered || 0,
      threatened: species.threatened || 0,
      endemic: species.endemic || 0,
      invasive: species.invasive || 0,
      riskLevel: this.calculateSpeciesRiskLevel(species)
    };
  }

  static evaluateEcosystemServices(landData, conservationData) {
    const services = conservationData.ecosystemServices || {};
    return {
      carbonSequestration: services.carbonSequestration || 0,
      waterRegulation: services.waterRegulation || 0,
      pollination: services.pollination || 0,
      soilFormation: services.soilFormation || 0,
      totalValue: this.calculateEcosystemValue(services)
    };
  }

  static assessConservationEfforts(data) {
    const efforts = data.conservationEfforts || {};
    return {
      protectedAreas: efforts.protectedAreas || 0,
      restorationProjects: efforts.restorationProjects || 0,
      partnerships: efforts.partnerships || 0,
      funding: efforts.funding || 0,
      effectiveness: this.calculateConservationEffectiveness(efforts)
    };
  }

  static assessBiodiversityRisk(data) {
    const risks = [];
    
    // Habitat fragmentation risk
    if (data.fragmentationIndex > 0.7) {
      risks.push({ type: 'fragmentation', level: 'high', impact: 'habitat_loss' });
    }
    
    // Species extinction risk
    const endangeredRatio = (data.endangered || 0) / (data.totalSpecies || 1);
    if (endangeredRatio > 0.1) {
      risks.push({ type: 'species_loss', level: 'critical', impact: 'biodiversity_decline' });
    }
    
    // Climate change risk
    if (data.climateVulnerability > 0.6) {
      risks.push({ type: 'climate_change', level: 'medium', impact: 'ecosystem_shift' });
    }
    
    return {
      risks,
      overallRiskLevel: this.calculateOverallRiskLevel(risks),
      mitigationPriority: this.prioritizeRisks(risks)
    };
  }

  static trackConservationInitiatives(data) {
    const initiatives = data.initiatives || [];
    return initiatives.map(initiative => ({
      id: initiative.id,
      name: initiative.name,
      type: initiative.type,
      area: initiative.area,
      budget: initiative.budget,
      status: initiative.status,
      impact: this.assessInitiativeImpact(initiative)
    }));
  }

  static checkEnvironmentalCompliance(landData, conservationData) {
    const issues = [];
    
    // Protected area compliance
    if (landData.protectedAreaImpact > 0 && !conservationData.permits) {
      issues.push('Missing permits for protected area impact');
    }
    
    // Biodiversity offset requirements
    if (landData.biodiversityLoss > 0 && !conservationData.offsetProgram) {
      issues.push('Biodiversity offset program required');
    }
    
    // Environmental impact assessment
    if (landData.newDevelopment && !conservationData.environmentalImpactAssessment) {
      issues.push('Environmental impact assessment required');
    }
    
    return {
      compliant: issues.length === 0,
      issues,
      recommendations: this.generateComplianceRecommendations(issues)
    };
  }

  // Helper methods
  static calculatePercentage(value, total) {
    return total > 0 ? (value / total) * 100 : 0;
  }

  static calculateHabitatImpactScore(area, quality) {
    return (area * quality) / 100;
  }

  static calculateSpeciesRiskLevel(species) {
    const total = (species.endangered || 0) + (species.threatened || 0);
    if (total > 10) return 'critical';
    if (total > 5) return 'high';
    if (total > 0) return 'medium';
    return 'low';
  }

  static calculateEcosystemValue(services) {
    return Object.values(services).reduce((sum, value) => sum + (value || 0), 0);
  }

  static calculateConservationEffectiveness(efforts) {
    const score = (efforts.protectedAreas || 0) * 0.3 + 
                  (efforts.restorationProjects || 0) * 0.3 + 
                  (efforts.partnerships || 0) * 0.2 + 
                  (efforts.funding || 0) * 0.2;
    return Math.min(100, score);
  }

  static calculateBiodiversityScore(habitatImpact, speciesImpact, ecosystemServices) {
    const habitatScore = Object.values(habitatImpact).reduce((sum, h) => sum + h.impactScore, 0);
    const speciesScore = 100 - (speciesImpact.endangered * 5 + speciesImpact.threatened * 3);
    const servicesScore = ecosystemServices.totalValue / 1000;
    
    return Math.max(0, Math.min(100, (habitatScore + speciesScore + servicesScore) / 3));
  }

  static calculateOverallRiskLevel(risks) {
    if (risks.some(r => r.level === 'critical')) return 'critical';
    if (risks.some(r => r.level === 'high')) return 'high';
    if (risks.some(r => r.level === 'medium')) return 'medium';
    return 'low';
  }

  static prioritizeRisks(risks) {
    return risks.sort((a, b) => {
      const levels = { critical: 4, high: 3, medium: 2, low: 1 };
      return levels[b.level] - levels[a.level];
    });
  }

  static assessInitiativeImpact(initiative) {
    const areaImpact = (initiative.area || 0) / 100;
    const budgetImpact = (initiative.budget || 0) / 10000;
    return Math.min(100, (areaImpact + budgetImpact) * 10);
  }

  static generateComplianceRecommendations(issues) {
    return issues.map(issue => {
      if (issue.includes('permits')) return 'Obtain necessary environmental permits';
      if (issue.includes('offset')) return 'Develop biodiversity offset program';
      if (issue.includes('assessment')) return 'Conduct environmental impact assessment';
      return 'Consult environmental compliance specialist';
    });
  }

  static getDefaultBiodiversityAssessment() {
    return {
      landUse: { totalArea: 0, breakdown: {}, intensity: {}, changeOverTime: {} },
      biodiversityImpact: { habitatImpact: {}, speciesImpact: {}, ecosystemServices: {}, overallScore: 0 },
      conservation: { protectedAreas: 0, restorationProjects: 0, partnerships: 0, funding: 0, effectiveness: 0 },
      riskAssessment: { risks: [], overallRiskLevel: 'unknown', mitigationPriority: [] },
      initiatives: [],
      compliance: { compliant: false, issues: ['No data available'], recommendations: [] }
    };
  }
}

export default BiodiversityLandUse;