// Predictive Insights and Trend Analysis
import { PredictiveAnalytics } from './predictiveAnalytics.js';

export class TrendAnalysis {
  static analyzeTrends(historicalData, timeframe = 12) {
    if (!Array.isArray(historicalData)) {
      console.warn('Invalid historical data provided for trend analysis');
      historicalData = [];
    }

    const trends = {
      environmental: this.calculateCategoryTrend(historicalData, 'environmental', timeframe),
      social: this.calculateCategoryTrend(historicalData, 'social', timeframe),
      governance: this.calculateCategoryTrend(historicalData, 'governance', timeframe)
    };

    return {
      trends,
      predictions: this.generatePredictions(trends),
      insights: this.generateInsights(trends),
      riskFactors: this.identifyRiskFactors(trends)
    };
  }

  static calculateCategoryTrend(data, category, months) {
    const categoryData = data.filter(d => d.category === category)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(-months);

    if (categoryData.length < 2) return this.getDefaultTrend();

    const values = categoryData.map(d => d.value);
    const slope = this.calculateLinearRegression(values);
    const volatility = this.calculateVolatility(values);
    const momentum = this.calculateMomentum(values);

    return {
      direction: slope > 0.1 ? 'improving' : slope < -0.1 ? 'declining' : 'stable',
      slope: Math.round(slope * 1000) / 1000,
      volatility: Math.round(volatility * 100) / 100,
      momentum,
      confidence: this.calculateConfidence(categoryData.length, volatility),
      dataPoints: categoryData.length
    };
  }

  static calculateLinearRegression(values) {
    if (!Array.isArray(values) || values.length < 2) {
      return 0;
    }

    const n = values.length;
    const x = Array.from({length: n}, (_, i) => i);
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = values.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * values[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);

    const denominator = n * sumXX - sumX * sumX;
    if (denominator === 0) {
      return 0; // Prevent division by zero
    }

    return (n * sumXY - sumX * sumY) / denominator;
  }

  static calculateVolatility(values) {
    const mean = values.reduce((a, b) => a + b) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    return Math.sqrt(variance);
  }

  static calculateMomentum(values) {
    if (values.length < 3) return 'neutral';
    
    const recent = values.slice(-3);
    const earlier = values.slice(-6, -3);
    
    if (earlier.length === 0) return 'neutral';
    
    const recentAvg = recent.reduce((a, b) => a + b) / recent.length;
    const earlierAvg = earlier.reduce((a, b) => a + b) / earlier.length;
    
    const change = (recentAvg - earlierAvg) / earlierAvg;
    
    return change > 0.05 ? 'accelerating' : change < -0.05 ? 'decelerating' : 'steady';
  }

  static calculateConfidence(dataPoints, volatility) {
    const baseConfidence = Math.min(dataPoints / 12, 1) * 0.7;
    const volatilityPenalty = Math.min(volatility / 10, 0.3);
    return Math.max(0.3, baseConfidence - volatilityPenalty);
  }

  static generatePredictions(trends) {
    const predictions = {};
    
    Object.entries(trends).forEach(([category, trend]) => {
      predictions[category] = {
        nextQuarter: this.predictNextPeriod(trend, 3),
        nextYear: this.predictNextPeriod(trend, 12),
        targetAchievability: this.assessTargetAchievability(trend)
      };
    });

    return predictions;
  }

  static predictNextPeriod(trend, months) {
    const baseChange = trend.slope * months;
    const confidenceInterval = trend.volatility * 1.96;
    
    return {
      expectedChange: Math.round(baseChange * 100) / 100,
      range: {
        low: Math.round((baseChange - confidenceInterval) * 100) / 100,
        high: Math.round((baseChange + confidenceInterval) * 100) / 100
      },
      confidence: trend.confidence
    };
  }

  static assessTargetAchievability(trend) {
    if (trend.direction === 'improving' && trend.momentum === 'accelerating') {
      return { likelihood: 'high', recommendation: 'Consider more ambitious targets' };
    } else if (trend.direction === 'declining') {
      return { likelihood: 'low', recommendation: 'Implement corrective measures immediately' };
    }
    return { likelihood: 'moderate', recommendation: 'Monitor closely and adjust strategy' };
  }

  static generateInsights(trends) {
    const insights = [];
    
    Object.entries(trends).forEach(([category, trend]) => {
      if (trend.direction === 'improving' && trend.confidence > 0.7) {
        insights.push(`${category} performance shows strong positive trend with ${(trend.confidence * 100).toFixed(0)}% confidence`);
      } else if (trend.direction === 'declining' && trend.confidence > 0.6) {
        insights.push(`${category} performance declining - immediate attention required`);
      } else if (trend.volatility > 5) {
        insights.push(`${category} shows high volatility - consider stabilization measures`);
      }
    });

    return insights;
  }

  static identifyRiskFactors(trends) {
    const risks = [];
    
    Object.entries(trends).forEach(([category, trend]) => {
      if (trend.direction === 'declining' && trend.momentum === 'accelerating') {
        risks.push({
          category,
          risk: 'Accelerating decline',
          severity: 'high',
          impact: 'Performance deterioration may affect overall ESG rating'
        });
      } else if (trend.volatility > 8) {
        risks.push({
          category,
          risk: 'High volatility',
          severity: 'medium',
          impact: 'Unpredictable performance may indicate systemic issues'
        });
      }
    });

    return risks;
  }

  static getDefaultTrend() {
    return {
      direction: 'stable',
      slope: 0,
      volatility: 0,
      momentum: 'neutral',
      confidence: 0.3,
      dataPoints: 0
    };
  }

  static generateForecast(historicalData, periods = 6) {
    return PredictiveAnalytics.forecastEmissions(historicalData, periods);
  }
}