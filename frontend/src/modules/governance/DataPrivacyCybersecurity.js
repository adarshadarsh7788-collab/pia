// Data Privacy & Cybersecurity Module
export class DataPrivacyCybersecurity {
  static dataTypes = ['personal', 'sensitive', 'financial', 'health', 'biometric'];
  static securityControls = ['encryption', 'access_control', 'monitoring', 'backup', 'incident_response'];
  static complianceFrameworks = ['GDPR', 'CCPA', 'HIPAA', 'SOX', 'ISO27001'];
  static threatTypes = ['malware', 'phishing', 'ransomware', 'data_breach', 'insider_threat'];

  static assessDataPrivacyCybersecurity(privacyData, securityData, incidentData, complianceData) {
    try {
      const privacyCompliance = this.assessPrivacyCompliance(privacyData, complianceData);
      const securityPosture = this.evaluateSecurityPosture(securityData);
      const incidentManagement = this.analyzeSecurityIncidents(incidentData);
      const riskAssessment = this.conductCyberRiskAssessment(securityData, incidentData);
      const trainingEffectiveness = this.evaluateSecurityTraining(privacyData.training, securityData.training);
      
      return {
        privacyCompliance,
        securityPosture,
        incidentManagement,
        riskAssessment,
        trainingEffectiveness,
        overallMaturityScore: this.calculateMaturityScore(privacyCompliance, securityPosture, incidentManagement),
        recommendations: this.generateSecurityRecommendations(privacyCompliance, securityPosture, incidentManagement, riskAssessment)
      };
    } catch (error) {
      console.error('Data privacy & cybersecurity assessment failed:', error);
      return this.getDefaultSecurityAssessment();
    }
  }

  static assessPrivacyCompliance(privacyData, complianceData) {
    const dataInventory = this.analyzeDataInventory(privacyData.dataInventory);
    const consentManagement = this.evaluateConsentManagement(privacyData.consent);
    const dataSubjectRights = this.assessDataSubjectRights(privacyData.rights);
    const breachManagement = this.evaluateBreachManagement(privacyData.breaches);
    const frameworkCompliance = this.assessFrameworkCompliance(complianceData);
    
    return {
      dataInventory,
      consentManagement,
      dataSubjectRights,
      breachManagement,
      frameworkCompliance,
      privacyScore: this.calculatePrivacyScore(dataInventory, consentManagement, dataSubjectRights, breachManagement)
    };
  }

  static evaluateSecurityPosture(securityData) {
    const controlsAssessment = this.assessSecurityControls(securityData.controls);
    const vulnerabilityManagement = this.evaluateVulnerabilityManagement(securityData.vulnerabilities);
    const accessManagement = this.assessAccessManagement(securityData.access);
    const networkSecurity = this.evaluateNetworkSecurity(securityData.network);
    const endpointSecurity = this.assessEndpointSecurity(securityData.endpoints);
    
    return {
      controlsAssessment,
      vulnerabilityManagement,
      accessManagement,
      networkSecurity,
      endpointSecurity,
      securityScore: this.calculateSecurityScore(controlsAssessment, vulnerabilityManagement, accessManagement, networkSecurity, endpointSecurity)
    };
  }

  static analyzeSecurityIncidents(incidentData) {
    const incidents = incidentData.incidents || [];
    const byType = this.categorizeSecurityIncidents(incidents);
    const trends = this.analyzeIncidentTrends(incidents);
    const responseMetrics = this.calculateResponseMetrics(incidents);
    const impactAnalysis = this.analyzeIncidentImpact(incidents);
    
    return {
      totalIncidents: incidents.length,
      byType,
      trends,
      responseMetrics,
      impactAnalysis,
      lessonsLearned: this.extractLessonsLearned(incidents),
      preventiveMeasures: this.identifyPreventiveMeasures(incidents)
    };
  }

  static conductCyberRiskAssessment(securityData, incidentData) {
    const threatLandscape = this.analyzeThreatLandscape(incidentData);
    const vulnerabilityProfile = this.buildVulnerabilityProfile(securityData.vulnerabilities);
    const riskMatrix = this.buildCyberRiskMatrix(threatLandscape, vulnerabilityProfile);
    const businessImpact = this.assessBusinessImpact(riskMatrix);
    
    return {
      threatLandscape,
      vulnerabilityProfile,
      riskMatrix,
      businessImpact,
      overallRiskLevel: this.calculateOverallCyberRisk(riskMatrix),
      criticalRisks: this.identifyCriticalRisks(riskMatrix),
      mitigationStrategies: this.developCyberMitigationStrategies(riskMatrix)
    };
  }

  static evaluateSecurityTraining(privacyTraining, securityTraining) {
    const privacyMetrics = this.calculateTrainingMetrics(privacyTraining);
    const securityMetrics = this.calculateTrainingMetrics(securityTraining);
    const awarenessLevel = this.assessSecurityAwareness(privacyTraining, securityTraining);
    
    return {
      privacyTraining: privacyMetrics,
      securityTraining: securityMetrics,
      awarenessLevel,
      overallEffectiveness: (privacyMetrics.effectiveness + securityMetrics.effectiveness) / 2,
      gaps: this.identifyTrainingGaps(privacyTraining, securityTraining)
    };
  }

  // Privacy compliance methods
  static analyzeDataInventory(dataInventory) {
    const inventory = dataInventory || [];
    const byType = this.categorizeDataByType(inventory);
    const bySource = this.categorizeDataBySource(inventory);
    const retention = this.analyzeDataRetention(inventory);
    
    return {
      totalDataAssets: inventory.length,
      byType,
      bySource,
      retention,
      completeness: this.assessInventoryCompleteness(inventory),
      classification: this.assessDataClassification(inventory)
    };
  }

  static evaluateConsentManagement(consentData) {
    const consents = consentData?.consents || [];
    const mechanisms = consentData?.mechanisms || [];
    
    return {
      totalConsents: consents.length,
      validConsents: consents.filter(c => this.isConsentValid(c)).length,
      expiredConsents: consents.filter(c => this.isConsentExpired(c)).length,
      withdrawnConsents: consents.filter(c => c.status === 'withdrawn').length,
      consentMechanisms: mechanisms.length,
      complianceRate: this.calculateConsentComplianceRate(consents)
    };
  }

  static assessDataSubjectRights(rightsData) {
    const requests = rightsData?.requests || [];
    const byType = this.categorizeRightsRequests(requests);
    const responseMetrics = this.calculateRightsResponseMetrics(requests);
    
    return {
      totalRequests: requests.length,
      byType,
      responseMetrics,
      fulfillmentRate: this.calculateFulfillmentRate(requests),
      averageResponseTime: this.calculateAverageResponseTime(requests)
    };
  }

  // Security posture methods
  static assessSecurityControls(controls) {
    const controlsAssessment = {};
    this.securityControls.forEach(control => {
      const controlData = controls?.[control] || {};
      controlsAssessment[control] = {
        implemented: controlData.implemented || false,
        effectiveness: controlData.effectiveness || 0,
        lastTested: controlData.lastTested,
        status: this.determineControlStatus(controlData)
      };
    });
    
    return {
      controls: controlsAssessment,
      implementationRate: this.calculateImplementationRate(controlsAssessment),
      averageEffectiveness: this.calculateAverageEffectiveness(controlsAssessment),
      controlGaps: this.identifyControlGaps(controlsAssessment)
    };
  }

  static evaluateVulnerabilityManagement(vulnerabilities) {
    const vulns = vulnerabilities?.vulnerabilities || [];
    const bySeverity = this.categorizeVulnerabilitiesBySeverity(vulns);
    const byAge = this.categorizeVulnerabilitiesByAge(vulns);
    const patchingMetrics = this.calculatePatchingMetrics(vulns);
    
    return {
      totalVulnerabilities: vulns.length,
      bySeverity,
      byAge,
      patchingMetrics,
      riskScore: this.calculateVulnerabilityRiskScore(vulns),
      trends: this.analyzeVulnerabilityTrends(vulns)
    };
  }

  static assessAccessManagement(accessData) {
    const users = accessData?.users || [];
    const privilegedAccounts = users.filter(u => u.privileged);
    const accessReviews = accessData?.reviews || [];
    
    return {
      totalUsers: users.length,
      privilegedAccounts: privilegedAccounts.length,
      mfaEnabled: users.filter(u => u.mfaEnabled).length,
      lastAccessReview: this.getLatestAccessReview(accessReviews),
      accessViolations: this.identifyAccessViolations(users),
      complianceRate: this.calculateAccessComplianceRate(users)
    };
  }

  // Incident analysis methods
  static categorizeSecurityIncidents(incidents) {
    const categories = {};
    this.threatTypes.forEach(type => {
      categories[type] = incidents.filter(i => i.type === type);
    });
    return categories;
  }

  static calculateResponseMetrics(incidents) {
    const responseTimes = incidents.map(i => i.responseTime || 0);
    const resolutionTimes = incidents.map(i => i.resolutionTime || 0);
    
    return {
      averageResponseTime: this.calculateAverage(responseTimes),
      averageResolutionTime: this.calculateAverage(resolutionTimes),
      slaCompliance: this.calculateSLACompliance(incidents),
      escalationRate: this.calculateEscalationRate(incidents)
    };
  }

  static analyzeIncidentImpact(incidents) {
    const impacts = incidents.map(i => i.impact || {});
    
    return {
      totalFinancialImpact: impacts.reduce((sum, i) => sum + (i.financial || 0), 0),
      dataRecordsAffected: impacts.reduce((sum, i) => sum + (i.records || 0), 0),
      systemDowntime: impacts.reduce((sum, i) => sum + (i.downtime || 0), 0),
      reputationalImpact: this.assessReputationalImpact(impacts),
      regulatoryImpact: this.assessRegulatoryImpact(impacts)
    };
  }

  // Risk assessment methods
  static analyzeThreatLandscape(incidentData) {
    const incidents = incidentData.incidents || [];
    const threats = {};
    
    this.threatTypes.forEach(type => {
      const typeIncidents = incidents.filter(i => i.type === type);
      threats[type] = {
        frequency: typeIncidents.length,
        severity: this.calculateAverageSeverity(typeIncidents),
        trend: this.calculateThreatTrend(typeIncidents),
        likelihood: this.calculateThreatLikelihood(typeIncidents)
      };
    });
    
    return threats;
  }

  static buildCyberRiskMatrix(threatLandscape, vulnerabilityProfile) {
    const riskMatrix = {};
    
    Object.entries(threatLandscape).forEach(([threat, data]) => {
      riskMatrix[threat] = {
        likelihood: data.likelihood,
        impact: this.calculateThreatImpact(threat),
        riskScore: data.likelihood * this.calculateThreatImpact(threat),
        riskLevel: this.determineRiskLevel(data.likelihood * this.calculateThreatImpact(threat))
      };
    });
    
    return riskMatrix;
  }

  // Calculation methods
  static calculateMaturityScore(privacyCompliance, securityPosture, incidentManagement) {
    const privacyScore = privacyCompliance.privacyScore || 0;
    const securityScore = securityPosture.securityScore || 0;
    const incidentScore = Math.max(0, 100 - (incidentManagement.totalIncidents * 2));
    
    return (privacyScore + securityScore + incidentScore) / 3;
  }

  static calculatePrivacyScore(dataInventory, consentManagement, dataSubjectRights, breachManagement) {
    const inventoryScore = dataInventory.completeness || 0;
    const consentScore = consentManagement.complianceRate || 0;
    const rightsScore = dataSubjectRights.fulfillmentRate || 0;
    const breachScore = Math.max(0, 100 - ((breachManagement?.totalBreaches || 0) * 10));
    
    return (inventoryScore + consentScore + rightsScore + breachScore) / 4;
  }

  static calculateSecurityScore(controls, vulnerabilities, access, network, endpoints) {
    const controlsScore = controls.averageEffectiveness || 0;
    const vulnScore = Math.max(0, 100 - vulnerabilities.riskScore);
    const accessScore = access.complianceRate || 0;
    const networkScore = network?.securityScore || 70;
    const endpointScore = endpoints?.securityScore || 70;
    
    return (controlsScore + vulnScore + accessScore + networkScore + endpointScore) / 5;
  }

  static generateSecurityRecommendations(privacyCompliance, securityPosture, incidentManagement, riskAssessment) {
    const recommendations = [];
    
    // Privacy recommendations
    if (privacyCompliance.privacyScore < 70) {
      recommendations.push({
        area: 'privacy',
        priority: 'high',
        action: 'Strengthen data privacy compliance framework',
        timeline: '6 months'
      });
    }
    
    // Security recommendations
    if (securityPosture.securityScore < 70) {
      recommendations.push({
        area: 'security',
        priority: 'high',
        action: 'Enhance cybersecurity controls and monitoring',
        timeline: '3 months'
      });
    }
    
    // Incident management recommendations
    if (incidentManagement.totalIncidents > 10) {
      recommendations.push({
        area: 'incident_response',
        priority: 'medium',
        action: 'Improve incident prevention and response capabilities',
        timeline: '4 months'
      });
    }
    
    // Risk-based recommendations
    riskAssessment.criticalRisks?.forEach(risk => {
      recommendations.push({
        area: 'risk_mitigation',
        priority: 'critical',
        action: `Address critical ${risk} risk`,
        timeline: '1 month'
      });
    });
    
    return recommendations;
  }

  // Helper methods
  static isConsentValid(consent) {
    return consent.status === 'active' && !this.isConsentExpired(consent);
  }

  static isConsentExpired(consent) {
    return consent.expiryDate && new Date(consent.expiryDate) < new Date();
  }

  static calculateAverage(values) {
    return values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 0;
  }

  static determineRiskLevel(score) {
    if (score > 70) return 'critical';
    if (score > 50) return 'high';
    if (score > 30) return 'medium';
    return 'low';
  }

  static getDefaultSecurityAssessment() {
    return {
      privacyCompliance: { dataInventory: {}, consentManagement: {}, dataSubjectRights: {}, breachManagement: {}, frameworkCompliance: {}, privacyScore: 0 },
      securityPosture: { controlsAssessment: {}, vulnerabilityManagement: {}, accessManagement: {}, networkSecurity: {}, endpointSecurity: {}, securityScore: 0 },
      incidentManagement: { totalIncidents: 0, byType: {}, trends: {}, responseMetrics: {}, impactAnalysis: {}, lessonsLearned: [], preventiveMeasures: [] },
      riskAssessment: { threatLandscape: {}, vulnerabilityProfile: {}, riskMatrix: {}, businessImpact: {}, overallRiskLevel: 'unknown', criticalRisks: [], mitigationStrategies: {} },
      trainingEffectiveness: { privacyTraining: {}, securityTraining: {}, awarenessLevel: 0, overallEffectiveness: 0, gaps: [] },
      overallMaturityScore: 0,
      recommendations: []
    };
  }
}

export default DataPrivacyCybersecurity;