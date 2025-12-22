// AI-Enhanced ESG Insights Module
export class AIInsights {
  static generateAIInsights(esgData) {
    try {
      const gapAnalysis = this.performGapAnalysis(esgData);
      const maturityScoring = this.calculateMaturityScore(esgData);
      const predictiveAlerts = this.generatePredictiveAlerts(esgData);
      const policyRecommendations = this.generatePolicyRecommendations(gapAnalysis);
      
      return {
        gapAnalysis,
        maturityScoring,
        predictiveAlerts,
        policyRecommendations,
        automatedReporting: this.generateAutomatedReports(esgData)
      };
    } catch (error) {
      console.error('AI insights generation failed:', error);
      return this.getDefaultAIInsights();
    }
  }

  static performGapAnalysis(esgData) {
    const frameworks = ['GRI', 'SASB', 'TCFD', 'BRSR'];
    const gaps = {};
    let totalCompleteness = 0;
    
    frameworks.forEach(framework => {
      const analysis = this.analyzeFrameworkGaps(esgData, framework);
      gaps[framework] = analysis;
      totalCompleteness += analysis.completeness;
    });
    
    return { 
      byFramework: gaps, 
      overallCompleteness: Math.round(totalCompleteness / frameworks.length)
    };
  }

  static analyzeFrameworkGaps(esgData, framework) {
    if (!esgData || Object.keys(esgData).length === 0) {
      return {
        completeness: 0,
        missingData: this.getFrameworkRequirements(framework),
        qualityScore: 0
      };
    }

    const requirements = this.getFrameworkRequirements(framework);
    const availableData = this.extractAvailableData(esgData);
    const missingData = requirements.filter(req => !availableData.includes(req));
    const completeness = Math.round(((requirements.length - missingData.length) / requirements.length) * 100);
    const qualityScore = this.assessDataQuality(esgData);

    return { completeness, missingData, qualityScore };
  }

  static getFrameworkRequirements(framework) {
    const requirements = {
      GRI: ['organizational_profile', 'strategy_analysis', 'governance_structure', 'stakeholder_engagement', 'environmental_metrics', 'social_metrics'],
      SASB: ['industry_description', 'material_topics', 'accounting_metrics', 'activity_metrics'],
      TCFD: ['governance_oversight', 'strategy_resilience', 'risk_management_process', 'metrics_targets'],
      BRSR: ['general_disclosures', 'management_leadership', 'principle_wise_performance', 'assessment_evaluation']
    };
    return requirements[framework] || [];
  }

  static extractAvailableData(esgData) {
    const available = [];
    Object.entries(esgData).forEach(([category, data]) => {
      if (Array.isArray(data)) {
        data.forEach(item => {
          if (item.subcategory) available.push(item.subcategory);
          if (item.metric) available.push(item.metric);
        });
      }
    });
    return [...new Set(available)];
  }

  static assessDataQuality(esgData) {
    let qualityScore = 0;
    let totalItems = 0;

    Object.values(esgData).forEach(categoryData => {
      if (Array.isArray(categoryData)) {
        categoryData.forEach(item => {
          totalItems++;
          if (item.verified) qualityScore += 25;
          if (item.source) qualityScore += 15;
          if (item.methodology) qualityScore += 10;
          if (item.value !== null && item.value !== undefined) qualityScore += 10;
        });
      }
    });

    return totalItems > 0 ? Math.round(qualityScore / totalItems) : 0;
  }

  static calculateMaturityScore(esgData) {
    const dataCollection = this.assessDataCollectionMaturity(esgData);
    const processIntegration = this.assessProcessIntegrationMaturity(esgData);
    const reporting = this.assessReportingMaturity(esgData);
    const governance = this.assessGovernanceMaturity(esgData);
    
    const overallMaturity = (dataCollection + processIntegration + reporting + governance) / 4;
    const maturityLevel = this.getMaturityLevel(overallMaturity);
    
    return {
      dataCollection,
      processIntegration,
      reporting,
      governance,
      overallMaturity: Math.round(overallMaturity * 10) / 10,
      maturityLevel
    };
  }

  static assessDataCollectionMaturity(esgData) {
    if (!esgData || Object.keys(esgData).length === 0) return 0;
    
    const categories = ['environmental', 'social', 'governance'];
    const coverage = categories.filter(cat => esgData[cat] && esgData[cat].length > 0).length;
    const completeness = (coverage / categories.length) * 100;
    
    return Math.min(100, completeness);
  }

  static assessProcessIntegrationMaturity(esgData) {
    if (!esgData || Object.keys(esgData).length === 0) return 0;
    
    let integrationScore = 0;
    const totalData = Object.values(esgData).flat();
    
    totalData.forEach(item => {
      if (item.automated) integrationScore += 10;
      if (item.workflow) integrationScore += 5;
      if (item.approval_status) integrationScore += 5;
    });
    
    return Math.min(100, integrationScore / Math.max(1, totalData.length));
  }

  static assessReportingMaturity(esgData) {
    if (!esgData || Object.keys(esgData).length === 0) return 0;
    
    const hasReporting = Object.values(esgData).some(categoryData => 
      Array.isArray(categoryData) && categoryData.some(item => item.reported || item.framework)
    );
    
    return hasReporting ? 80 : 20;
  }

  static assessGovernanceMaturity(esgData) {
    if (!esgData || !esgData.governance) return 0;
    
    const governanceItems = esgData.governance || [];
    const hasGovernanceData = governanceItems.length > 0;
    const hasVerification = governanceItems.some(item => item.verified);
    
    let score = 0;
    if (hasGovernanceData) score += 50;
    if (hasVerification) score += 30;
    if (governanceItems.length > 5) score += 20;
    
    return Math.min(100, score);
  }

  static getMaturityLevel(score) {
    if (score >= 80) return 'Advanced';
    if (score >= 60) return 'Intermediate';
    if (score >= 40) return 'Developing';
    return 'Initial';
  }

  static generatePredictiveAlerts(esgData) {
    const alerts = [];
    let totalRiskScore = 0;
    
    // Analyze environmental risks
    const envRisks = this.analyzeEnvironmentalRisks(esgData.environmental || []);
    alerts.push(...envRisks.alerts);
    totalRiskScore += envRisks.riskScore;
    
    // Analyze social risks
    const socialRisks = this.analyzeSocialRisks(esgData.social || []);
    alerts.push(...socialRisks.alerts);
    totalRiskScore += socialRisks.riskScore;
    
    // Analyze governance risks
    const govRisks = this.analyzeGovernanceRisks(esgData.governance || []);
    alerts.push(...govRisks.alerts);
    totalRiskScore += govRisks.riskScore;
    
    return {
      alerts,
      riskScore: Math.round(totalRiskScore / 3)
    };
  }

  static analyzeEnvironmentalRisks(environmentalData) {
    const alerts = [];
    let riskScore = 0;
    
    const emissionsData = environmentalData.filter(item => 
      item.metric && item.metric.includes('emission')
    );
    
    if (emissionsData.length > 0) {
      const avgEmissions = emissionsData.reduce((sum, item) => sum + (parseFloat(item.value) || 0), 0) / emissionsData.length;
      if (avgEmissions > 1000) {
        alerts.push({
          type: 'climate_risk',
          severity: 'high',
          description: 'High carbon emissions detected - climate targets at risk'
        });
        riskScore += 60;
      }
    }
    
    return { alerts, riskScore };
  }

  static analyzeSocialRisks(socialData) {
    const alerts = [];
    let riskScore = 0;
    
    const safetyData = socialData.filter(item => 
      item.metric && (item.metric.includes('safety') || item.metric.includes('injury'))
    );
    
    if (safetyData.length > 0) {
      const avgSafety = safetyData.reduce((sum, item) => sum + (parseFloat(item.value) || 0), 0) / safetyData.length;
      if (avgSafety > 5) {
        alerts.push({
          type: 'safety_risk',
          severity: 'medium',
          description: 'Safety metrics indicate potential workplace risks'
        });
        riskScore += 40;
      }
    }
    
    return { alerts, riskScore };
  }

  static analyzeGovernanceRisks(governanceData) {
    const alerts = [];
    let riskScore = 0;
    
    const complianceData = governanceData.filter(item => 
      item.metric && item.metric.includes('compliance')
    );
    
    if (complianceData.length === 0) {
      alerts.push({
        type: 'compliance_risk',
        severity: 'medium',
        description: 'Limited governance compliance data available'
      });
      riskScore += 30;
    }
    
    return { alerts, riskScore };
  }

  static generatePolicyRecommendations(gapAnalysis) {
    const recommendations = [];
    
    Object.entries(gapAnalysis.byFramework).forEach(([framework, analysis]) => {
      if (analysis.completeness < 50) {
        recommendations.push({
          type: 'framework_compliance',
          priority: 'high',
          description: `Improve ${framework} framework compliance (${analysis.completeness}% complete)`,
          framework,
          missingData: analysis.missingData.slice(0, 3)
        });
      }
      
      if (analysis.qualityScore < 60) {
        recommendations.push({
          type: 'data_quality',
          priority: 'medium',
          description: `Enhance data quality for ${framework} reporting`,
          framework,
          currentScore: analysis.qualityScore
        });
      }
    });
    
    if (gapAnalysis.overallCompleteness < 70) {
      recommendations.push({
        type: 'process_improvement',
        priority: 'high',
        description: 'Implement comprehensive ESG data collection strategy',
        impact: 'Will improve overall framework compliance'
      });
    }
    
    return { recommendations };
  }

  static generateAutomatedReports(esgData) {
    const reports = {};
    const frameworks = ['BRSR', 'GRI', 'SASB', 'TCFD'];
    
    frameworks.forEach(framework => {
      const analysis = this.analyzeFrameworkGaps(esgData, framework);
      reports[framework] = {
        completeness: analysis.completeness,
        draftGenerated: analysis.completeness >= 60,
        qualityScore: analysis.qualityScore,
        missingDataCount: analysis.missingData.length,
        readyForReview: analysis.completeness >= 80 && analysis.qualityScore >= 70
      };
    });
    
    return reports;
  }

  static getDefaultAIInsights() {
    return {
      gapAnalysis: { byFramework: {}, overallCompleteness: 0 },
      maturityScoring: { overallMaturity: 0, maturityLevel: 'Initial' },
      predictiveAlerts: { alerts: [], riskScore: 0 },
      policyRecommendations: { recommendations: [] },
      automatedReporting: {}
    };
  }
}

export default AIInsights;