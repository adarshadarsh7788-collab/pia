// Ethics & Anti-Corruption Module
export class EthicsAntiCorruption {
  static riskAreas = ['bribery', 'corruption', 'conflicts_of_interest', 'fraud', 'money_laundering'];
  static trainingTypes = ['code_of_conduct', 'anti_bribery', 'conflict_of_interest', 'fraud_prevention', 'whistleblower'];
  static incidentTypes = ['bribery_attempt', 'corruption_allegation', 'conflict_of_interest', 'fraud_case', 'policy_violation'];

  static manageEthicsCompliance(policyData, trainingData, incidentData, auditData) {
    try {
      const policyCompliance = this.assessPolicyCompliance(policyData);
      const trainingEffectiveness = this.evaluateTrainingPrograms(trainingData);
      const incidentAnalysis = this.analyzeIncidents(incidentData);
      const riskAssessment = this.conductEthicsRiskAssessment(policyData, incidentData);
      const auditResults = this.processEthicsAudits(auditData);
      
      return {
        policyCompliance,
        trainingEffectiveness,
        incidentAnalysis,
        riskAssessment,
        auditResults,
        complianceScore: this.calculateOverallComplianceScore(policyCompliance, trainingEffectiveness, incidentAnalysis),
        recommendations: this.generateEthicsRecommendations(policyCompliance, trainingEffectiveness, incidentAnalysis, riskAssessment)
      };
    } catch (error) {
      console.error('Ethics compliance analysis failed:', error);
      return this.getDefaultEthicsCompliance();
    }
  }

  static assessPolicyCompliance(policyData) {
    const policies = policyData.policies || [];
    const acknowledgments = policyData.acknowledgments || [];
    const updates = policyData.updates || [];
    
    return {
      policyFramework: this.evaluatePolicyFramework(policies),
      acknowledgmentRate: this.calculateAcknowledgmentRate(acknowledgments, policyData.totalEmployees),
      policyUpdates: this.analyzePolicyUpdates(updates),
      coverage: this.assessPolicyCoverage(policies),
      effectiveness: this.measurePolicyEffectiveness(policies, policyData.violations)
    };
  }

  static evaluateTrainingPrograms(trainingData) {
    const programs = trainingData.programs || [];
    const completions = trainingData.completions || [];
    const assessments = trainingData.assessments || [];
    
    return {
      programCoverage: this.calculateProgramCoverage(programs),
      completionRates: this.calculateCompletionRates(completions, trainingData.totalEmployees),
      effectivenessScores: this.analyzeTrainingEffectiveness(assessments),
      refresherCompliance: this.trackRefresherTraining(trainingData.refresher),
      targetedTraining: this.assessTargetedTraining(programs, trainingData.riskProfiles)
    };
  }

  static analyzeIncidents(incidentData) {
    const incidents = incidentData.incidents || [];
    const investigations = incidentData.investigations || [];
    
    return {
      totalIncidents: incidents.length,
      byType: this.categorizeIncidents(incidents),
      bySource: this.analyzeIncidentSources(incidents),
      trends: this.analyzeIncidentTrends(incidents),
      investigations: this.assessInvestigations(investigations),
      resolutions: this.trackResolutions(incidents),
      preventiveMeasures: this.identifyPreventiveMeasures(incidents)
    };
  }

  static conductEthicsRiskAssessment(policyData, incidentData) {
    const riskFactors = this.identifyRiskFactors(policyData, incidentData);
    const riskMatrix = this.buildEthicsRiskMatrix(riskFactors);
    const mitigationStrategies = this.developMitigationStrategies(riskMatrix);
    
    return {
      riskFactors,
      riskMatrix,
      overallRiskLevel: this.calculateOverallEthicsRisk(riskMatrix),
      highRiskAreas: this.identifyHighRiskAreas(riskMatrix),
      mitigationStrategies,
      monitoringPlan: this.createMonitoringPlan(riskMatrix)
    };
  }

  static processEthicsAudits(auditData) {
    const audits = auditData.audits || [];
    const findings = auditData.findings || [];
    const actions = auditData.correctiveActions || [];
    
    return {
      auditCoverage: this.calculateAuditCoverage(audits),
      findings: this.categorizeAuditFindings(findings),
      correctiveActions: this.trackCorrectiveActions(actions),
      auditEffectiveness: this.measureAuditEffectiveness(audits, findings),
      followUp: this.assessFollowUpActions(actions)
    };
  }

  // Policy compliance methods
  static evaluatePolicyFramework(policies) {
    const requiredPolicies = ['code_of_conduct', 'anti_bribery', 'conflict_of_interest', 'whistleblower', 'gift_policy'];
    const existingPolicies = policies.map(p => p.type);
    const missing = requiredPolicies.filter(rp => !existingPolicies.includes(rp));
    
    return {
      completeness: ((requiredPolicies.length - missing.length) / requiredPolicies.length) * 100,
      existing: existingPolicies,
      missing,
      lastUpdated: this.getLatestUpdateDate(policies),
      comprehensiveness: this.assessPolicyComprehensiveness(policies)
    };
  }

  static calculateAcknowledgmentRate(acknowledgments, totalEmployees) {
    const acknowledged = acknowledgments.length;
    const rate = totalEmployees > 0 ? (acknowledged / totalEmployees) * 100 : 0;
    
    return {
      rate,
      acknowledged,
      pending: totalEmployees - acknowledged,
      overdue: acknowledgments.filter(a => this.isOverdue(a.dueDate)).length
    };
  }

  static analyzePolicyUpdates(updates) {
    const recentUpdates = updates.filter(u => this.isRecent(u.date, 365));
    
    return {
      totalUpdates: updates.length,
      recentUpdates: recentUpdates.length,
      updateFrequency: this.calculateUpdateFrequency(updates),
      majorRevisions: updates.filter(u => u.type === 'major').length,
      minorRevisions: updates.filter(u => u.type === 'minor').length
    };
  }

  // Training effectiveness methods
  static calculateProgramCoverage(programs) {
    const coverage = {};
    this.trainingTypes.forEach(type => {
      coverage[type] = programs.filter(p => p.type === type).length;
    });
    return coverage;
  }

  static calculateCompletionRates(completions, totalEmployees) {
    const rates = {};
    this.trainingTypes.forEach(type => {
      const completed = completions.filter(c => c.trainingType === type).length;
      rates[type] = totalEmployees > 0 ? (completed / totalEmployees) * 100 : 0;
    });
    return rates;
  }

  static analyzeTrainingEffectiveness(assessments) {
    const effectiveness = {};
    this.trainingTypes.forEach(type => {
      const typeAssessments = assessments.filter(a => a.trainingType === type);
      const scores = typeAssessments.map(a => a.score || 0);
      effectiveness[type] = {
        averageScore: scores.length > 0 ? scores.reduce((sum, score) => sum + score, 0) / scores.length : 0,
        passRate: typeAssessments.filter(a => (a.score || 0) >= 80).length / typeAssessments.length * 100 || 0,
        completions: typeAssessments.length
      };
    });
    return effectiveness;
  }

  // Incident analysis methods
  static categorizeIncidents(incidents) {
    const categories = {};
    this.incidentTypes.forEach(type => {
      categories[type] = incidents.filter(i => i.type === type);
    });
    return categories;
  }

  static analyzeIncidentSources(incidents) {
    const sources = {};
    incidents.forEach(incident => {
      const source = incident.source || 'unknown';
      sources[source] = (sources[source] || 0) + 1;
    });
    return sources;
  }

  static analyzeIncidentTrends(incidents) {
    const monthlyData = this.groupIncidentsByMonth(incidents);
    const trend = this.calculateTrend(Object.values(monthlyData));
    
    return {
      monthlyData,
      trend,
      peakMonth: this.findPeakMonth(monthlyData),
      seasonality: this.detectSeasonality(monthlyData)
    };
  }

  // Risk assessment methods
  static identifyRiskFactors(policyData, incidentData) {
    const factors = [];
    
    // Policy gaps
    const policyGaps = policyData.policies?.missing || [];
    if (policyGaps.length > 0) {
      factors.push({ type: 'policy_gap', severity: 'high', description: `Missing ${policyGaps.length} required policies` });
    }
    
    // Training gaps
    const lowTrainingRates = Object.entries(policyData.trainingRates || {})
      .filter(([_, rate]) => rate < 80);
    if (lowTrainingRates.length > 0) {
      factors.push({ type: 'training_gap', severity: 'medium', description: 'Low training completion rates' });
    }
    
    // Incident patterns
    const recentIncidents = (incidentData.incidents || []).filter(i => this.isRecent(i.date, 90));
    if (recentIncidents.length > 5) {
      factors.push({ type: 'incident_pattern', severity: 'high', description: 'High incident frequency' });
    }
    
    return factors;
  }

  static buildEthicsRiskMatrix(riskFactors) {
    const matrix = {};
    this.riskAreas.forEach(area => {
      const areaFactors = riskFactors.filter(f => this.isRelatedToArea(f, area));
      matrix[area] = {
        probability: this.calculateRiskProbability(areaFactors),
        impact: this.calculateRiskImpact(area),
        riskLevel: 'medium' // Calculated based on probability and impact
      };
      matrix[area].riskLevel = this.determineRiskLevel(matrix[area].probability, matrix[area].impact);
    });
    return matrix;
  }

  // Calculation methods
  static calculateOverallComplianceScore(policyCompliance, trainingEffectiveness, incidentAnalysis) {
    const policyScore = policyCompliance.policyFramework?.completeness || 0;
    const trainingScore = Object.values(trainingEffectiveness.completionRates || {})
      .reduce((sum, rate) => sum + rate, 0) / Object.keys(trainingEffectiveness.completionRates || {}).length || 0;
    const incidentScore = Math.max(0, 100 - (incidentAnalysis.totalIncidents * 5));
    
    return (policyScore + trainingScore + incidentScore) / 3;
  }

  static generateEthicsRecommendations(policyCompliance, trainingEffectiveness, incidentAnalysis, riskAssessment) {
    const recommendations = [];
    
    // Policy recommendations
    if (policyCompliance.policyFramework?.completeness < 80) {
      recommendations.push({
        area: 'policy',
        priority: 'high',
        action: 'Complete missing policy framework components',
        timeline: '3 months'
      });
    }
    
    // Training recommendations
    const lowTrainingAreas = Object.entries(trainingEffectiveness.completionRates || {})
      .filter(([_, rate]) => rate < 80);
    if (lowTrainingAreas.length > 0) {
      recommendations.push({
        area: 'training',
        priority: 'medium',
        action: `Improve training completion rates in ${lowTrainingAreas.map(([area]) => area).join(', ')}`,
        timeline: '6 months'
      });
    }
    
    // Risk-based recommendations
    riskAssessment.highRiskAreas?.forEach(area => {
      recommendations.push({
        area: 'risk_mitigation',
        priority: 'high',
        action: `Implement enhanced controls for ${area.replace('_', ' ')}`,
        timeline: '3 months'
      });
    });
    
    return recommendations;
  }

  // Helper methods
  static isOverdue(dueDate) {
    return new Date(dueDate) < new Date();
  }

  static isRecent(date, days) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return new Date(date) > cutoff;
  }

  static calculateTrend(values) {
    if (values.length < 2) return 'insufficient_data';
    const recent = values.slice(-3).reduce((sum, val) => sum + val, 0) / 3;
    const earlier = values.slice(0, -3).reduce((sum, val) => sum + val, 0) / (values.length - 3) || recent;
    
    if (recent > earlier * 1.1) return 'increasing';
    if (recent < earlier * 0.9) return 'decreasing';
    return 'stable';
  }

  static determineRiskLevel(probability, impact) {
    const score = probability * impact;
    if (score > 70) return 'high';
    if (score > 40) return 'medium';
    return 'low';
  }

  static getDefaultEthicsCompliance() {
    return {
      policyCompliance: { policyFramework: {}, acknowledgmentRate: {}, policyUpdates: {}, coverage: {}, effectiveness: {} },
      trainingEffectiveness: { programCoverage: {}, completionRates: {}, effectivenessScores: {}, refresherCompliance: {}, targetedTraining: {} },
      incidentAnalysis: { totalIncidents: 0, byType: {}, bySource: {}, trends: {}, investigations: {}, resolutions: {}, preventiveMeasures: [] },
      riskAssessment: { riskFactors: [], riskMatrix: {}, overallRiskLevel: 'unknown', highRiskAreas: [], mitigationStrategies: {}, monitoringPlan: {} },
      auditResults: { auditCoverage: 0, findings: {}, correctiveActions: [], auditEffectiveness: 0, followUp: {} },
      complianceScore: 0,
      recommendations: []
    };
  }
}

export default EthicsAntiCorruption;