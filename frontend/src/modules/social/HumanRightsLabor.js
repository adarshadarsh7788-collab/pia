// Human Rights & Labor Practices Module
export class HumanRightsLabor {
  static riskCategories = ['child_labor', 'forced_labor', 'discrimination', 'freedom_association', 'working_conditions'];
  static auditTypes = ['internal', 'external', 'supplier', 'third_party'];

  static assessHumanRights(laborData, supplierData, grievanceData) {
    try {
      const riskAssessment = this.conductRiskAssessment(laborData, supplierData);
      const compliance = this.evaluateCompliance(laborData);
      const grievanceAnalysis = this.analyzeGrievances(grievanceData);
      const supplierDueDiligence = this.assessSupplierCompliance(supplierData);
      
      return {
        riskAssessment,
        compliance,
        grievanceAnalysis,
        supplierDueDiligence,
        auditResults: this.processAuditResults(laborData.audits),
        trainingMetrics: this.calculateTrainingMetrics(laborData.training),
        recommendations: this.generateRecommendations(riskAssessment, compliance)
      };
    } catch (error) {
      console.error('Human rights assessment failed:', error);
      return this.getDefaultHumanRightsAssessment();
    }
  }

  static conductRiskAssessment(laborData, supplierData) {
    const risks = {};
    
    this.riskCategories.forEach(category => {
      risks[category] = {
        internalRisk: this.assessInternalRisk(laborData, category),
        supplierRisk: this.assessSupplierRisk(supplierData, category),
        geographicRisk: this.assessGeographicRisk(laborData.locations, category),
        overallRisk: 0
      };
      
      risks[category].overallRisk = this.calculateOverallRisk(risks[category]);
    });
    
    return {
      categoryRisks: risks,
      overallRiskScore: this.calculateTotalRiskScore(risks),
      highRiskAreas: this.identifyHighRiskAreas(risks),
      mitigationPriority: this.prioritizeRisks(risks)
    };
  }

  static assessInternalRisk(data, category) {
    const indicators = this.getRiskIndicators(category);
    let riskScore = 0;
    
    indicators.forEach(indicator => {
      const value = data[indicator] || 0;
      riskScore += this.calculateIndicatorRisk(indicator, value);
    });
    
    return Math.min(100, riskScore / indicators.length);
  }

  static assessSupplierRisk(supplierData, category) {
    const suppliers = supplierData || [];
    if (suppliers.length === 0) return 50; // Default medium risk
    
    const riskScores = suppliers.map(supplier => {
      return this.assessSupplierCategoryRisk(supplier, category);
    });
    
    return riskScores.reduce((sum, score) => sum + score, 0) / riskScores.length;
  }

  static assessGeographicRisk(locations, category) {
    const locationRisks = {
      child_labor: { high: ['Bangladesh', 'Myanmar', 'Pakistan'], medium: ['India', 'Vietnam'] },
      forced_labor: { high: ['North Korea', 'Eritrea', 'Mauritania'], medium: ['China', 'Iran'] },
      discrimination: { high: ['Saudi Arabia', 'Qatar'], medium: ['UAE', 'Kuwait'] }
    };
    
    const categoryRisks = locationRisks[category] || { high: [], medium: [] };
    let maxRisk = 0;
    
    (locations || []).forEach(location => {
      if (categoryRisks.high.includes(location.country)) maxRisk = Math.max(maxRisk, 80);
      else if (categoryRisks.medium.includes(location.country)) maxRisk = Math.max(maxRisk, 50);
      else maxRisk = Math.max(maxRisk, 20);
    });
    
    return maxRisk;
  }

  static evaluateCompliance(data) {
    const policies = this.checkPolicies(data.policies);
    const training = this.checkTraining(data.training);
    const monitoring = this.checkMonitoring(data.monitoring);
    const reporting = this.checkReporting(data.reporting);
    
    return {
      policies,
      training,
      monitoring,
      reporting,
      overallScore: (policies.score + training.score + monitoring.score + reporting.score) / 4,
      gaps: this.identifyComplianceGaps(policies, training, monitoring, reporting)
    };
  }

  static analyzeGrievances(grievanceData) {
    const grievances = grievanceData || [];
    const byCategory = this.categorizeGrievances(grievances);
    const trends = this.analyzeGrievanceTrends(grievances);
    const resolution = this.analyzeResolutionMetrics(grievances);
    
    return {
      totalGrievances: grievances.length,
      byCategory,
      trends,
      resolution,
      riskIndicators: this.identifyGrievanceRisks(byCategory, resolution)
    };
  }

  static assessSupplierCompliance(supplierData) {
    const suppliers = supplierData || [];
    const assessments = suppliers.map(supplier => ({
      id: supplier.id,
      name: supplier.name,
      riskLevel: this.calculateSupplierRiskLevel(supplier),
      auditStatus: supplier.auditStatus || 'pending',
      complianceScore: this.calculateSupplierComplianceScore(supplier),
      issues: supplier.issues || [],
      lastAudit: supplier.lastAudit,
      nextAudit: supplier.nextAudit
    }));
    
    return {
      totalSuppliers: suppliers.length,
      assessments,
      riskDistribution: this.calculateRiskDistribution(assessments),
      auditCoverage: this.calculateAuditCoverage(assessments),
      actionRequired: assessments.filter(s => s.riskLevel === 'high' || s.issues.length > 0)
    };
  }

  static processAuditResults(audits) {
    const auditResults = audits || [];
    return {
      totalAudits: auditResults.length,
      byType: this.categorizeAudits(auditResults),
      findings: this.summarizeFindings(auditResults),
      corrective_actions: this.trackCorrectiveActions(auditResults),
      effectiveness: this.calculateAuditEffectiveness(auditResults)
    };
  }

  static calculateTrainingMetrics(trainingData) {
    const training = trainingData || {};
    return {
      coverage: training.coverage || 0,
      completionRate: training.completionRate || 0,
      effectivenessScore: training.effectivenessScore || 0,
      byTopic: training.byTopic || {},
      refresherNeeded: this.identifyRefresherNeeds(training)
    };
  }

  // Helper methods
  static getRiskIndicators(category) {
    const indicators = {
      child_labor: ['minorEmployees', 'ageVerificationProcess', 'educationSupport'],
      forced_labor: ['debtBondage', 'documentRetention', 'movementRestriction'],
      discrimination: ['diversityMetrics', 'equalPayGap', 'promotionEquity'],
      freedom_association: ['unionRecognition', 'collectiveBargaining', 'workerRepresentation'],
      working_conditions: ['safetyIncidents', 'overtimeHours', 'workplaceConditions']
    };
    return indicators[category] || [];
  }

  static calculateIndicatorRisk(indicator, value) {
    // Risk calculation logic based on indicator type
    const riskThresholds = {
      minorEmployees: { low: 0, medium: 1, high: 5 },
      safetyIncidents: { low: 0, medium: 2, high: 10 },
      overtimeHours: { low: 40, medium: 60, high: 80 }
    };
    
    const thresholds = riskThresholds[indicator];
    if (!thresholds) return 30; // Default medium risk
    
    if (value <= thresholds.low) return 10;
    if (value <= thresholds.medium) return 50;
    return 90;
  }

  static calculateOverallRisk(categoryRisk) {
    return (categoryRisk.internalRisk + categoryRisk.supplierRisk + categoryRisk.geographicRisk) / 3;
  }

  static calculateTotalRiskScore(risks) {
    const scores = Object.values(risks).map(r => r.overallRisk);
    return scores.reduce((sum, score) => sum + score, 0) / scores.length;
  }

  static identifyHighRiskAreas(risks) {
    return Object.entries(risks)
      .filter(([_, risk]) => risk.overallRisk > 70)
      .map(([category, risk]) => ({ category, risk: risk.overallRisk }));
  }

  static checkPolicies(policies) {
    const required = ['child_labor', 'forced_labor', 'discrimination', 'harassment', 'grievance'];
    const existing = policies || [];
    const missing = required.filter(p => !existing.includes(p));
    
    return {
      score: ((required.length - missing.length) / required.length) * 100,
      existing,
      missing,
      compliant: missing.length === 0
    };
  }

  static checkTraining(training) {
    const coverage = training?.coverage || 0;
    const effectiveness = training?.effectivenessScore || 0;
    
    return {
      score: (coverage + effectiveness) / 2,
      coverage,
      effectiveness,
      compliant: coverage >= 90 && effectiveness >= 80
    };
  }

  static checkMonitoring(monitoring) {
    const frequency = monitoring?.frequency || 0;
    const coverage = monitoring?.coverage || 0;
    
    return {
      score: (frequency + coverage) / 2,
      frequency,
      coverage,
      compliant: frequency >= 80 && coverage >= 90
    };
  }

  static checkReporting(reporting) {
    const transparency = reporting?.transparency || 0;
    const timeliness = reporting?.timeliness || 0;
    
    return {
      score: (transparency + timeliness) / 2,
      transparency,
      timeliness,
      compliant: transparency >= 80 && timeliness >= 90
    };
  }

  static generateRecommendations(riskAssessment, compliance) {
    const recommendations = [];
    
    // High-risk category recommendations
    riskAssessment.highRiskAreas.forEach(area => {
      recommendations.push({
        priority: 'high',
        category: area.category,
        action: `Implement enhanced controls for ${area.category.replace('_', ' ')}`,
        timeline: '3 months'
      });
    });
    
    // Compliance gap recommendations
    if (compliance.overallScore < 80) {
      recommendations.push({
        priority: 'medium',
        category: 'compliance',
        action: 'Strengthen compliance framework and monitoring',
        timeline: '6 months'
      });
    }
    
    return recommendations;
  }

  static getDefaultHumanRightsAssessment() {
    return {
      riskAssessment: { categoryRisks: {}, overallRiskScore: 0, highRiskAreas: [], mitigationPriority: [] },
      compliance: { policies: {}, training: {}, monitoring: {}, reporting: {}, overallScore: 0, gaps: [] },
      grievanceAnalysis: { totalGrievances: 0, byCategory: {}, trends: {}, resolution: {}, riskIndicators: [] },
      supplierDueDiligence: { totalSuppliers: 0, assessments: [], riskDistribution: {}, auditCoverage: 0, actionRequired: [] },
      auditResults: { totalAudits: 0, byType: {}, findings: {}, corrective_actions: [], effectiveness: 0 },
      trainingMetrics: { coverage: 0, completionRate: 0, effectivenessScore: 0, byTopic: {}, refresherNeeded: [] },
      recommendations: []
    };
  }
}

export default HumanRightsLabor;