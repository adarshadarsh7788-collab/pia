// Advanced Analytics Dashboard Integration
import { ESGScoreCalculator } from './ESGScoreCalculator.js';
import { BenchmarkingEngine } from './BenchmarkingEngine.js';
import { TrendAnalysis } from './TrendAnalysis.js';
import { RiskAssessment } from './RiskAssessment.js';

export class AdvancedAnalyticsDashboard {
  static async generateComprehensiveAnalytics(companyData, industry, region = 'global') {
    // Input validation
    if (!companyData || typeof companyData !== 'object') {
      throw new Error('Invalid company data provided');
    }
    if (!industry || typeof industry !== 'string') {
      throw new Error('Valid industry must be specified');
    }

    try {
      // Real-time ESG scoring with validation
      const esgScore = this.safeCalculateScore(companyData);
      
      // Peer benchmarking with validation
      const benchmarking = this.safeBenchmarking(esgScore, industry, region);
      
      // Trend analysis with validation
      const trendAnalysis = this.safeTrendAnalysis(companyData.historicalData || []);
      
      // Risk assessment with validation
      const riskAssessment = this.safeRiskAssessment(companyData, industry, region);

      return {
        timestamp: new Date().toISOString(),
        esgScore,
        benchmarking,
        trendAnalysis,
        riskAssessment,
        summary: this.generateExecutiveSummary(esgScore, benchmarking, trendAnalysis, riskAssessment),
        recommendations: this.generateRecommendations(esgScore, benchmarking, riskAssessment)
      };
    } catch (error) {
      console.error('Analytics generation failed:', error);
      return this.getDefaultAnalytics();
    }
  }

  static safeCalculateScore(companyData) {
    try {
      return ESGScoreCalculator.calculateRealTimeScore(companyData);
    } catch (error) {
      console.warn('ESG score calculation failed:', error);
      return { overallScore: 0, grade: 'N/A', categoryScores: { environmental: 0, social: 0, governance: 0 } };
    }
  }

  static safeBenchmarking(esgScore, industry, region) {
    try {
      return BenchmarkingEngine.performPeerComparison(esgScore, industry, region);
    } catch (error) {
      console.warn('Benchmarking failed:', error);
      return { overall: { percentile: 0 }, environmental: { status: 'unknown' }, social: { status: 'unknown' }, governance: { status: 'unknown' } };
    }
  }

  static safeTrendAnalysis(historicalData) {
    try {
      return TrendAnalysis.analyzeTrends(historicalData);
    } catch (error) {
      console.warn('Trend analysis failed:', error);
      return { trends: {}, insights: [], predictions: {}, riskFactors: [] };
    }
  }

  static safeRiskAssessment(companyData, industry, region) {
    try {
      return RiskAssessment.assessESGRisks(companyData, industry, region);
    } catch (error) {
      console.warn('Risk assessment failed:', error);
      return { overallRiskScore: { level: 'unknown', score: 0 }, materialityAssessment: [], riskMatrix: {} };
    }
  }

  static generateExecutiveSummary(esgScore, benchmarking, trends, risks) {
    const safeScore = esgScore?.overallScore || 0;
    const safeGrade = esgScore?.grade || 'N/A';
    const safePercentile = benchmarking?.overall?.percentile || 0;
    const safeMateriality = risks?.materialityAssessment || [];
    
    return {
      overallPerformance: `ESG Score: ${safeScore}/100 (${safeGrade})`,
      marketPosition: `${safePercentile}th percentile in industry`,
      keyTrends: this.summarizeKeyTrends(trends),
      topRisks: safeMateriality.slice(0, 3).map(r => r?.risk || 'Unknown'),
      urgentActions: this.identifyUrgentActions(risks, trends)
    };
  }

  static summarizeKeyTrends(trends) {
    const summary = [];
    if (!trends?.trends || typeof trends.trends !== 'object') {
      return summary;
    }
    
    Object.entries(trends.trends).forEach(([category, trend]) => {
      if (trend?.direction && trend.direction !== 'stable') {
        const confidence = (trend.confidence || 0) > 0.7 ? 'high' : 'moderate';
        summary.push(`${category}: ${trend.direction} (${confidence} confidence)`);
      }
    });
    return summary;
  }

  static identifyUrgentActions(risks, trends) {
    const actions = [];
    
    // Critical risks with validation
    if (risks?.riskMatrix && typeof risks.riskMatrix === 'object') {
      Object.values(risks.riskMatrix).forEach(category => {
        if (category && typeof category === 'object') {
          Object.entries(category).forEach(([risk, data]) => {
            if (data?.riskLevel === 'critical') {
              actions.push(`Address ${risk.replace('_', ' ')} immediately`);
            }
          });
        }
      });
    }

    // Declining trends with validation
    if (trends?.trends && typeof trends.trends === 'object') {
      Object.entries(trends.trends).forEach(([category, trend]) => {
        if (trend?.direction === 'declining' && (trend.confidence || 0) > 0.6) {
          actions.push(`Reverse declining ${category} performance`);
        }
      });
    }

    return actions.slice(0, 5);
  }

  static generateRecommendations(esgScore, benchmarking, risks) {
    const recommendations = [];

    // Score-based recommendations with validation
    if (esgScore?.categoryScores && typeof esgScore.categoryScores === 'object') {
      Object.entries(esgScore.categoryScores).forEach(([category, score]) => {
        const numericScore = Number(score) || 0;
        if (numericScore < 60) {
          recommendations.push({
            category,
            priority: 'high',
            action: `Implement comprehensive ${category} improvement program`,
            expectedImpact: 'Significant score improvement'
          });
        }
      });
    }

    // Benchmarking recommendations with validation
    if (benchmarking && typeof benchmarking === 'object') {
      Object.entries(benchmarking).forEach(([category, data]) => {
        if (data?.status === 'laggard' && category !== 'industry' && category !== 'region' && typeof data.gap === 'number') {
          recommendations.push({
            category,
            priority: 'medium',
            action: `Close ${Math.abs(data.gap).toFixed(1)} point gap in ${category}`,
            expectedImpact: 'Improved industry positioning'
          });
        }
      });
    }

    // Risk-based recommendations with validation
    if (risks?.materialityAssessment && Array.isArray(risks.materialityAssessment)) {
      risks.materialityAssessment.slice(0, 3).forEach(risk => {
        if (risk?.category && risk?.risk) {
          recommendations.push({
            category: risk.category,
            priority: 'high',
            action: `Mitigate ${risk.risk.replace('_', ' ')} exposure`,
            expectedImpact: 'Reduced ESG risk profile'
          });
        }
      });
    }

    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
    });
  }

  static getDefaultAnalytics() {
    return {
      timestamp: new Date().toISOString(),
      esgScore: { overallScore: 0, grade: 'N/A', categoryScores: {} },
      benchmarking: { overall: { percentile: 0 } },
      trendAnalysis: { trends: {}, insights: [] },
      riskAssessment: { overallRiskScore: { level: 'unknown' }, materialityAssessment: [] },
      summary: { overallPerformance: 'Data unavailable' },
      recommendations: []
    };
  }

  // Utility method for dashboard components
  static formatAnalyticsForDisplay(analytics) {
    return {
      scoreCard: {
        score: analytics.esgScore.overallScore,
        grade: analytics.esgScore.grade,
        trend: analytics.trendAnalysis.trends.overall?.direction || 'stable'
      },
      benchmarkChart: {
        environmental: analytics.benchmarking.environmental,
        social: analytics.benchmarking.social,
        governance: analytics.benchmarking.governance
      },
      riskMatrix: analytics.riskAssessment.riskMatrix,
      keyInsights: [
        ...analytics.trendAnalysis.insights,
        ...analytics.summary.urgentActions.map(action => `Action needed: ${action}`)
      ]
    };
  }
}