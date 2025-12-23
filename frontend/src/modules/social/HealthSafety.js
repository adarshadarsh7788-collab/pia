// Enhanced Health & Safety Module
export class HealthSafety {
  static incidentTypes = ['injury', 'illness', 'near_miss', 'property_damage', 'environmental'];
  static severityLevels = ['minor', 'moderate', 'major', 'critical', 'fatality'];
  static safetyMetrics = ['ltifr', 'trifr', 'dart', 'osha_rate'];

  static manageHealthSafety(incidentData, auditData, trainingData, emergencyData) {
    try {
      const incidentAnalysis = this.analyzeIncidents(incidentData);
      const safetyMetrics = this.calculateSafetyMetrics(incidentData);
      const auditResults = this.processSafetyAudits(auditData);
      const trainingEffectiveness = this.analyzeSafetyTraining(trainingData);
      const emergencyPreparedness = this.assessEmergencyPreparedness(emergencyData);
      const complianceStatus = this.assessSafetyCompliance(incidentData, auditData);
      
      return {
        incidentAnalysis,
        safetyMetrics,
        auditResults,
        trainingEffectiveness,
        emergencyPreparedness,
        complianceStatus,
        overallSafetyScore: this.calculateOverallSafetyScore(safetyMetrics, auditResults, trainingEffectiveness),
        recommendations: this.generateSafetyRecommendations(incidentAnalysis, safetyMetrics, auditResults)
      };
    } catch (error) {
      console.error('Health & safety analysis failed:', error);
      return this.getDefaultHealthSafetyAnalysis();
    }
  }

  static analyzeIncidents(incidentData) {
    const incidents = incidentData.incidents || [];
    
    return {
      totalIncidents: incidents.length,
      byType: this.categorizeIncidents(incidents),
      bySeverity: this.categorizeIncidentsBySeverity(incidents),
      trends: this.analyzeIncidentTrends(incidents),
      rootCauses: this.analyzeRootCauses(incidents),
      preventiveMeasures: this.identifyPreventiveMeasures(incidents),
      costImpact: this.calculateIncidentCosts(incidents)
    };
  }

  static calculateSafetyMetrics(incidentData) {
    const incidents = incidentData.incidents || [];
    const workHours = incidentData.totalWorkHours || 1000000;
    const employees = incidentData.totalEmployees || 1000;
    
    return {
      ltifr: this.calculateLTIFR(incidents, workHours),
      trifr: this.calculateTRIFR(incidents, workHours),
      dart: this.calculateDART(incidents, workHours),
      oshaRate: this.calculateOSHARate(incidents, workHours),
      fatalities: incidents.filter(i => i.severity === 'fatality').length,
      benchmarking: this.benchmarkSafetyMetrics(incidents, workHours)
    };
  }

  static processSafetyAudits(auditData) {
    const audits = auditData.audits || [];
    const findings = auditData.findings || [];
    
    return {
      totalAudits: audits.length,
      auditCoverage: this.calculateAuditCoverage(audits),
      findings: this.categorizeSafetyFindings(findings),
      correctiveActions: this.trackCorrectiveActions(auditData.actions),
      auditEffectiveness: this.measureAuditEffectiveness(audits, findings),
      complianceGaps: this.identifyComplianceGaps(findings)
    };
  }

  static analyzeSafetyTraining(trainingData) {
    const training = trainingData || {};
    
    return {
      totalTrainingHours: training.totalHours || 0,
      completionRate: training.completionRate || 0,
      certificationStatus: this.analyzeCertifications(training.certifications),
      trainingEffectiveness: training.effectivenessScore || 0,
      refresherCompliance: this.trackRefresherTraining(training.refresher),
      emergencyDrills: this.analyzeEmergencyDrills(training.drills)
    };
  }

  static assessEmergencyPreparedness(emergencyData) {
    const procedures = emergencyData.procedures || [];
    const drills = emergencyData.drills || [];
    const equipment = emergencyData.equipment || [];
    
    return {
      procedureCoverage: this.assessProcedureCoverage(procedures),
      drillCompliance: this.analyzeDrillCompliance(drills),
      equipmentReadiness: this.assessEquipmentReadiness(equipment),
      responseCapability: this.evaluateResponseCapability(emergencyData),
      communicationSystems: this.assessCommunicationSystems(emergencyData.communications)
    };
  }

  static calculateLTIFR(incidents, workHours) {
    const lostTimeInjuries = incidents.filter(i => 
      i.type === 'injury' && i.lostTime > 0
    ).length;
    return (lostTimeInjuries * 1000000) / workHours;
  }

  static calculateTRIFR(incidents, workHours) {
    const recordableInjuries = incidents.filter(i => 
      i.type === 'injury' && i.recordable
    ).length;
    return (recordableInjuries * 1000000) / workHours;
  }

  static calculateDART(incidents, workHours) {
    const dartCases = incidents.filter(i => 
      i.type === 'injury' && (i.daysAway > 0 || i.restricted || i.transferred)
    ).length;
    return (dartCases * 200000) / workHours;
  }

  static calculateOSHARate(incidents, workHours) {
    const oshaRecordable = incidents.filter(i => i.oshaRecordable).length;
    return (oshaRecordable * 200000) / workHours;
  }

  static calculateOverallSafetyScore(safetyMetrics, auditResults, trainingEffectiveness) {
    const metricsScore = Math.max(0, 100 - (safetyMetrics.ltifr * 10));
    const auditScore = auditResults.auditEffectiveness || 70;
    const trainingScore = trainingEffectiveness.trainingEffectiveness || 70;
    
    return (metricsScore + auditScore + trainingScore) / 3;
  }

  static generateSafetyRecommendations(incidentAnalysis, safetyMetrics, auditResults) {
    const recommendations = [];
    
    if (safetyMetrics.ltifr > 2.0) {
      recommendations.push({
        area: 'incident_reduction',
        priority: 'high',
        action: 'Implement enhanced safety controls to reduce LTIFR',
        timeline: '6 months'
      });
    }
    
    if (incidentAnalysis.totalIncidents > 50) {
      recommendations.push({
        area: 'prevention',
        priority: 'medium',
        action: 'Strengthen preventive safety measures and training',
        timeline: '3 months'
      });
    }
    
    return recommendations;
  }

  static getDefaultHealthSafetyAnalysis() {
    return {
      incidentAnalysis: { totalIncidents: 0, byType: {}, bySeverity: {}, trends: {}, rootCauses: {}, preventiveMeasures: [], costImpact: 0 },
      safetyMetrics: { ltifr: 0, trifr: 0, dart: 0, oshaRate: 0, fatalities: 0, benchmarking: {} },
      auditResults: { totalAudits: 0, auditCoverage: 0, findings: {}, correctiveActions: [], auditEffectiveness: 0, complianceGaps: [] },
      trainingEffectiveness: { totalTrainingHours: 0, completionRate: 0, certificationStatus: {}, trainingEffectiveness: 0, refresherCompliance: {}, emergencyDrills: {} },
      emergencyPreparedness: { procedureCoverage: 0, drillCompliance: 0, equipmentReadiness: 0, responseCapability: 0, communicationSystems: {} },
      complianceStatus: { compliant: false, gaps: [], violations: [] },
      overallSafetyScore: 0,
      recommendations: []
    };
  }
}

export default HealthSafety;