// Community Engagement & CSR Module
export class CommunityEngagement {
  static projectTypes = ['education', 'healthcare', 'infrastructure', 'environment', 'economic_development'];
  static stakeholderTypes = ['local_community', 'government', 'ngos', 'suppliers', 'customers'];
  static impactAreas = ['social', 'economic', 'environmental', 'cultural'];

  static manageCommunityEngagement(csrData, stakeholderData, impactData) {
    try {
      const csrAnalysis = this.analyzeCSRProjects(csrData);
      const stakeholderEngagement = this.assessStakeholderEngagement(stakeholderData);
      const impactMeasurement = this.measureCommunityImpact(impactData);
      const investmentTracking = this.trackCSRInvestment(csrData);
      
      return {
        csrAnalysis,
        stakeholderEngagement,
        impactMeasurement,
        investmentTracking,
        performanceMetrics: this.calculatePerformanceMetrics(csrData, impactData),
        recommendations: this.generateEngagementRecommendations(csrAnalysis, stakeholderEngagement, impactMeasurement)
      };
    } catch (error) {
      console.error('Community engagement analysis failed:', error);
      return this.getDefaultCommunityEngagement();
    }
  }

  static analyzeCSRProjects(csrData) {
    const projects = csrData.projects || [];
    const byType = this.categorizeProjects(projects);
    const byStatus = this.analyzeProjectStatus(projects);
    const effectiveness = this.assessProjectEffectiveness(projects);
    
    return {
      totalProjects: projects.length,
      byType,
      byStatus,
      effectiveness,
      budget: this.analyzeProjectBudgets(projects),
      timeline: this.analyzeProjectTimelines(projects),
      beneficiaries: this.calculateBeneficiaries(projects)
    };
  }

  static assessStakeholderEngagement(stakeholderData) {
    const stakeholders = stakeholderData.stakeholders || [];
    const engagementMetrics = this.calculateEngagementMetrics(stakeholders);
    const satisfactionScores = this.analyzeSatisfactionScores(stakeholderData.surveys);
    const communicationEffectiveness = this.assessCommunicationEffectiveness(stakeholderData.communications);
    
    return {
      totalStakeholders: stakeholders.length,
      byType: this.categorizeStakeholders(stakeholders),
      engagementMetrics,
      satisfactionScores,
      communicationEffectiveness,
      feedbackAnalysis: this.analyzeFeedback(stakeholderData.feedback),
      relationshipHealth: this.assessRelationshipHealth(stakeholders)
    };
  }

  static measureCommunityImpact(impactData) {
    const impacts = impactData.impacts || [];
    const byArea = this.categorizeImpacts(impacts);
    const measurement = this.calculateImpactMeasurement(impacts);
    const sustainability = this.assessImpactSustainability(impacts);
    
    return {
      totalImpacts: impacts.length,
      byArea,
      measurement,
      sustainability,
      longTermOutcomes: this.assessLongTermOutcomes(impacts),
      unintendedConsequences: this.identifyUnintendedConsequences(impacts),
      scalability: this.assessScalability(impacts)
    };
  }

  static trackCSRInvestment(csrData) {
    const investments = csrData.investments || [];
    const totalInvestment = this.calculateTotalInvestment(investments);
    const allocation = this.analyzeInvestmentAllocation(investments);
    const efficiency = this.calculateInvestmentEfficiency(investments, csrData.outcomes);
    
    return {
      totalInvestment,
      allocation,
      efficiency,
      trends: this.analyzeInvestmentTrends(investments),
      benchmarking: this.benchmarkInvestment(totalInvestment, csrData.revenue),
      roi: this.calculateCSRROI(investments, csrData.outcomes)
    };
  }

  static calculatePerformanceMetrics(csrData, impactData) {
    const projects = csrData.projects || [];
    const impacts = impactData.impacts || [];
    
    return {
      projectSuccessRate: this.calculateSuccessRate(projects),
      impactPerDollar: this.calculateImpactPerDollar(impacts, csrData.investments),
      beneficiaryReach: this.calculateBeneficiaryReach(projects),
      sustainabilityIndex: this.calculateSustainabilityIndex(impacts),
      stakeholderSatisfaction: this.calculateOverallSatisfaction(csrData.stakeholderFeedback),
      communityDevelopmentIndex: this.calculateCommunityDevelopmentIndex(impacts)
    };
  }

  // Helper methods for project analysis
  static categorizeProjects(projects) {
    const result = {};
    this.projectTypes.forEach(type => {
      result[type] = projects.filter(p => p.type === type);
    });
    return result;
  }

  static analyzeProjectStatus(projects) {
    const statuses = ['planning', 'active', 'completed', 'suspended'];
    const result = {};
    statuses.forEach(status => {
      result[status] = projects.filter(p => p.status === status).length;
    });
    return result;
  }

  static assessProjectEffectiveness(projects) {
    const completed = projects.filter(p => p.status === 'completed');
    if (completed.length === 0) return { average: 0, distribution: {} };
    
    const scores = completed.map(p => p.effectivenessScore || 0);
    const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    
    return {
      average,
      distribution: this.calculateScoreDistribution(scores),
      topPerformers: completed.filter(p => (p.effectivenessScore || 0) > 80),
      underPerformers: completed.filter(p => (p.effectivenessScore || 0) < 60)
    };
  }

  static analyzeProjectBudgets(projects) {
    const budgets = projects.map(p => p.budget || 0);
    const total = budgets.reduce((sum, budget) => sum + budget, 0);
    
    return {
      total,
      average: budgets.length > 0 ? total / budgets.length : 0,
      largest: Math.max(...budgets, 0),
      smallest: Math.min(...budgets.filter(b => b > 0), 0) || 0,
      utilization: this.calculateBudgetUtilization(projects)
    };
  }

  static calculateBeneficiaries(projects) {
    const direct = projects.reduce((sum, p) => sum + (p.directBeneficiaries || 0), 0);
    const indirect = projects.reduce((sum, p) => sum + (p.indirectBeneficiaries || 0), 0);
    
    return {
      direct,
      indirect,
      total: direct + indirect,
      byDemographic: this.analyzeBeneficiaryDemographics(projects)
    };
  }

  // Helper methods for stakeholder analysis
  static categorizeStakeholders(stakeholders) {
    const result = {};
    this.stakeholderTypes.forEach(type => {
      result[type] = stakeholders.filter(s => s.type === type);
    });
    return result;
  }

  static calculateEngagementMetrics(stakeholders) {
    const totalEngagements = stakeholders.reduce((sum, s) => sum + (s.engagements || 0), 0);
    const activeStakeholders = stakeholders.filter(s => (s.lastEngagement || 0) > Date.now() - 90 * 24 * 60 * 60 * 1000);
    
    return {
      totalEngagements,
      averagePerStakeholder: stakeholders.length > 0 ? totalEngagements / stakeholders.length : 0,
      activeStakeholders: activeStakeholders.length,
      engagementRate: stakeholders.length > 0 ? (activeStakeholders.length / stakeholders.length) * 100 : 0
    };
  }

  static analyzeSatisfactionScores(surveys) {
    if (!surveys || surveys.length === 0) return { average: 0, trend: 'no_data' };
    
    const scores = surveys.map(s => s.satisfactionScore || 0);
    const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    
    return {
      average,
      latest: scores[scores.length - 1] || 0,
      trend: this.calculateTrend(scores),
      distribution: this.calculateScoreDistribution(scores)
    };
  }

  // Helper methods for impact measurement
  static categorizeImpacts(impacts) {
    const result = {};
    this.impactAreas.forEach(area => {
      result[area] = impacts.filter(i => i.area === area);
    });
    return result;
  }

  static calculateImpactMeasurement(impacts) {
    return {
      quantitative: this.measureQuantitativeImpacts(impacts),
      qualitative: this.measureQualitativeImpacts(impacts),
      baseline: this.establishBaselines(impacts),
      progress: this.trackProgress(impacts)
    };
  }

  static assessImpactSustainability(impacts) {
    const sustainabilityScores = impacts.map(i => i.sustainabilityScore || 0);
    const average = sustainabilityScores.length > 0 ? 
      sustainabilityScores.reduce((sum, score) => sum + score, 0) / sustainabilityScores.length : 0;
    
    return {
      averageScore: average,
      sustainableImpacts: impacts.filter(i => (i.sustainabilityScore || 0) > 70).length,
      riskOfReversal: impacts.filter(i => (i.sustainabilityScore || 0) < 50).length
    };
  }

  // Calculation methods
  static calculateSuccessRate(projects) {
    const completed = projects.filter(p => p.status === 'completed');
    const successful = completed.filter(p => (p.successScore || 0) > 70);
    return completed.length > 0 ? (successful.length / completed.length) * 100 : 0;
  }

  static calculateImpactPerDollar(impacts, investments) {
    const totalInvestment = investments?.reduce((sum, inv) => sum + (inv.amount || 0), 0) || 1;
    const totalImpact = impacts.reduce((sum, imp) => sum + (imp.quantitativeValue || 0), 0);
    return totalImpact / totalInvestment;
  }

  static calculateSustainabilityIndex(impacts) {
    const scores = impacts.map(i => i.sustainabilityScore || 0);
    return scores.length > 0 ? scores.reduce((sum, score) => sum + score, 0) / scores.length : 0;
  }

  static generateEngagementRecommendations(csrAnalysis, stakeholderEngagement, impactMeasurement) {
    const recommendations = [];
    
    // CSR project recommendations
    if (csrAnalysis.effectiveness.average < 70) {
      recommendations.push({
        area: 'project_effectiveness',
        priority: 'high',
        action: 'Improve project design and implementation processes',
        expectedImpact: 'Increase project success rate by 20%'
      });
    }
    
    // Stakeholder engagement recommendations
    if (stakeholderEngagement.engagementMetrics.engagementRate < 60) {
      recommendations.push({
        area: 'stakeholder_engagement',
        priority: 'medium',
        action: 'Develop more frequent and meaningful engagement activities',
        expectedImpact: 'Improve stakeholder satisfaction and participation'
      });
    }
    
    // Impact measurement recommendations
    if (impactMeasurement.sustainability.averageScore < 60) {
      recommendations.push({
        area: 'impact_sustainability',
        priority: 'high',
        action: 'Focus on long-term sustainable impact strategies',
        expectedImpact: 'Ensure lasting community benefits'
      });
    }
    
    return recommendations;
  }

  static getDefaultCommunityEngagement() {
    return {
      csrAnalysis: { totalProjects: 0, byType: {}, byStatus: {}, effectiveness: {}, budget: {}, timeline: {}, beneficiaries: {} },
      stakeholderEngagement: { totalStakeholders: 0, byType: {}, engagementMetrics: {}, satisfactionScores: {}, communicationEffectiveness: {}, feedbackAnalysis: {}, relationshipHealth: {} },
      impactMeasurement: { totalImpacts: 0, byArea: {}, measurement: {}, sustainability: {}, longTermOutcomes: {}, unintendedConsequences: [], scalability: {} },
      investmentTracking: { totalInvestment: 0, allocation: {}, efficiency: 0, trends: {}, benchmarking: {}, roi: 0 },
      performanceMetrics: { projectSuccessRate: 0, impactPerDollar: 0, beneficiaryReach: 0, sustainabilityIndex: 0, stakeholderSatisfaction: 0, communityDevelopmentIndex: 0 },
      recommendations: []
    };
  }
}

export default CommunityEngagement;