// Real-time ESG Score Calculator
export class ESGScoreCalculator {
  static weights = {
    environmental: 0.4,
    social: 0.35,
    governance: 0.25
  };

  static calculateRealTimeScore(data) {
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid data provided for ESG score calculation');
    }

    const scores = {
      environmental: this.calculateEnvironmentalScore(data.environmental || {}),
      social: this.calculateSocialScore(data.social || {}),
      governance: this.calculateGovernanceScore(data.governance || {})
    };

    // Validate scores are numbers
    Object.keys(scores).forEach(key => {
      if (isNaN(scores[key]) || scores[key] < 0 || scores[key] > 100) {
        scores[key] = 0;
      }
    });

    const weightedScore = (
      scores.environmental * this.weights.environmental +
      scores.social * this.weights.social +
      scores.governance * this.weights.governance
    );

    const finalScore = Math.max(0, Math.min(100, Math.round(weightedScore)));

    return {
      overallScore: finalScore,
      categoryScores: scores,
      grade: this.getGrade(finalScore),
      lastUpdated: new Date().toISOString()
    };
  }

  static calculateEnvironmentalScore(envData) {
    const metrics = {
      carbonIntensity: this.normalizeMetric(envData.carbonIntensity, 0, 100, true),
      energyEfficiency: this.normalizeMetric(envData.energyEfficiency, 0, 100),
      waterUsage: this.normalizeMetric(envData.waterUsage, 0, 1000, true),
      wasteReduction: this.normalizeMetric(envData.wasteReduction, 0, 100)
    };

    return Object.values(metrics).reduce((sum, score) => sum + score, 0) / Object.keys(metrics).length;
  }

  static calculateSocialScore(socialData) {
    const metrics = {
      employeeSatisfaction: this.normalizeMetric(socialData.employeeSatisfaction, 0, 100),
      diversityIndex: this.normalizeMetric(socialData.diversityIndex, 0, 100),
      safetyRecord: this.normalizeMetric(socialData.safetyRecord, 0, 100),
      communityImpact: this.normalizeMetric(socialData.communityImpact, 0, 100)
    };

    return Object.values(metrics).reduce((sum, score) => sum + score, 0) / Object.keys(metrics).length;
  }

  static calculateGovernanceScore(govData) {
    const metrics = {
      boardIndependence: this.normalizeMetric(govData.boardIndependence, 0, 100),
      executiveCompensation: this.normalizeMetric(govData.executiveCompensation, 0, 100),
      transparency: this.normalizeMetric(govData.transparency, 0, 100),
      ethicsCompliance: this.normalizeMetric(govData.ethicsCompliance, 0, 100)
    };

    return Object.values(metrics).reduce((sum, score) => sum + score, 0) / Object.keys(metrics).length;
  }

  static normalizeMetric(value, min, max, inverse = false) {
    if (value === undefined || value === null || isNaN(value)) return 50;
    if (min >= max) return 50; // Invalid range
    
    const numValue = Number(value);
    const numMin = Number(min);
    const numMax = Number(max);
    
    const normalized = ((numValue - numMin) / (numMax - numMin)) * 100;
    const bounded = Math.max(0, Math.min(100, normalized));
    
    return inverse ? 100 - bounded : bounded;
  }

  static getGrade(score) {
    if (score >= 90) return 'A+';
    if (score >= 80) return 'A';
    if (score >= 70) return 'B';
    if (score >= 60) return 'C';
    return 'D';
  }

  static calculateTrendScore(historicalScores) {
    if (historicalScores.length < 2) return { trend: 0, momentum: 'stable' };
    
    const recent = historicalScores.slice(-3);
    const trend = (recent[recent.length - 1].score - recent[0].score) / recent.length;
    
    return {
      trend: Math.round(trend * 100) / 100,
      momentum: trend > 2 ? 'improving' : trend < -2 ? 'declining' : 'stable'
    };
  }
}