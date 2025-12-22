// Stakeholder Sentiment Analysis Module
export class StakeholderSentimentAnalysis {
  static stakeholderTypes = ['investors', 'employees', 'customers', 'communities', 'regulators', 'suppliers'];
  static sentimentSources = ['surveys', 'social_media', 'news', 'feedback'];

  static analyzeSentiment(stakeholderData, feedbackData, socialMediaData) {
    try {
      const sentimentByStakeholder = this.analyzeSentimentByStakeholder(stakeholderData);
      const sentimentTrends = this.analyzeSentimentTrends(feedbackData);
      const socialMediaSentiment = this.analyzeSocialMediaSentiment(socialMediaData);
      const overallSentiment = this.calculateOverallSentiment(sentimentByStakeholder);
      const riskIndicators = this.identifyRiskIndicators(sentimentByStakeholder);
      
      return {
        sentimentByStakeholder,
        sentimentTrends,
        socialMediaSentiment,
        overallSentiment,
        riskIndicators,
        recommendations: this.generateRecommendations(sentimentByStakeholder, riskIndicators)
      };
    } catch (error) {
      console.error('Sentiment analysis failed:', error);
      return this.getDefaultSentimentAnalysis();
    }
  }

  static analyzeSentimentByStakeholder(stakeholderData) {
    const analysis = {};
    
    this.stakeholderTypes.forEach(type => {
      const typeData = stakeholderData[type] || {};
      analysis[type] = {
        overallSentiment: this.calculateStakeholderSentiment(typeData),
        sentimentDistribution: this.calculateSentimentDistribution(typeData),
        engagementLevel: this.assessEngagementLevel(typeData),
        satisfactionScore: this.calculateSatisfactionScore(typeData),
        concerns: this.identifyStakeholderConcerns(typeData)
      };
    });
    
    return analysis;
  }

  static calculateStakeholderSentiment(typeData) {
    const feedback = typeData.feedback || [];
    if (feedback.length === 0) return 0;
    
    const sentimentSum = feedback.reduce((sum, item) => {
      return sum + this.classifySentiment(item.text || item.comment || '');
    }, 0);
    
    return sentimentSum / feedback.length;
  }

  static classifySentiment(text) {
    const positiveWords = ['good', 'great', 'excellent', 'satisfied', 'happy', 'positive'];
    const negativeWords = ['bad', 'poor', 'terrible', 'disappointed', 'unhappy', 'negative'];
    
    const words = text.toLowerCase().split(/\s+/);
    let score = 0;
    
    words.forEach(word => {
      if (positiveWords.includes(word)) score += 1;
      if (negativeWords.includes(word)) score -= 1;
    });
    
    return Math.max(-1, Math.min(1, score / Math.max(words.length, 1)));
  }

  static calculateSentimentDistribution(typeData) {
    const feedback = typeData.feedback || [];
    const distribution = { positive: 0, neutral: 0, negative: 0 };
    
    feedback.forEach(item => {
      const sentiment = this.classifySentiment(item.text || item.comment || '');
      if (sentiment > 0.1) distribution.positive++;
      else if (sentiment < -0.1) distribution.negative++;
      else distribution.neutral++;
    });
    
    const total = feedback.length || 1;
    return {
      positive: (distribution.positive / total) * 100,
      neutral: (distribution.neutral / total) * 100,
      negative: (distribution.negative / total) * 100
    };
  }

  static assessEngagementLevel(typeData) {
    const responseRate = typeData.responseRate || 0;
    const participationRate = typeData.participationRate || 0;
    const feedbackVolume = (typeData.feedback || []).length;
    
    const engagementScore = (responseRate * 0.4 + participationRate * 0.4 + Math.min(feedbackVolume / 50, 1) * 100 * 0.2);
    
    return {
      score: Math.min(100, engagementScore),
      level: engagementScore > 70 ? 'high' : engagementScore > 40 ? 'medium' : 'low'
    };
  }

  static calculateSatisfactionScore(typeData) {
    const surveys = typeData.surveys || [];
    if (surveys.length === 0) return 0;
    
    const totalScore = surveys.reduce((sum, survey) => sum + (survey.satisfactionScore || 0), 0);
    return totalScore / surveys.length;
  }

  static identifyStakeholderConcerns(typeData) {
    const feedback = typeData.feedback || [];
    const concerns = [];
    
    const negativeFeedback = feedback.filter(item => 
      this.classifySentiment(item.text || item.comment || '') < -0.3
    );
    
    if (negativeFeedback.length > feedback.length * 0.2) {
      concerns.push({
        type: 'high_negative_sentiment',
        severity: 'high',
        description: `${((negativeFeedback.length / feedback.length) * 100).toFixed(1)}% negative feedback`
      });
    }
    
    return concerns;
  }

  static analyzeSentimentTrends(feedbackData) {
    const feedback = feedbackData || [];
    const timeSeriesData = this.groupFeedbackByTime(feedback);
    
    return {
      monthlyTrends: this.calculateMonthlyTrends(timeSeriesData),
      trendDirection: this.determineTrendDirection(timeSeriesData),
      volatility: this.calculateSentimentVolatility(timeSeriesData)
    };
  }

  static analyzeSocialMediaSentiment(socialMediaData) {
    const data = socialMediaData || {};
    
    return {
      platforms: this.analyzePlatformSentiment(data),
      mentions: data.mentions || 0,
      reputationScore: this.calculateReputationScore(data),
      trending: data.trending || []
    };
  }

  static calculateOverallSentiment(sentimentByStakeholder) {
    const stakeholderScores = Object.values(sentimentByStakeholder).map(s => s.overallSentiment);
    const averageSentiment = stakeholderScores.reduce((sum, score) => sum + score, 0) / (stakeholderScores.length || 1);
    
    return {
      score: averageSentiment,
      category: this.categorizeSentiment(averageSentiment),
      riskLevel: this.assessSentimentRisk(averageSentiment)
    };
  }

  static identifyRiskIndicators(sentimentByStakeholder) {
    const risks = [];
    
    Object.entries(sentimentByStakeholder).forEach(([stakeholder, data]) => {
      if (data.overallSentiment < -0.3) {
        risks.push({
          type: 'negative_stakeholder_sentiment',
          severity: 'high',
          description: `High negative sentiment from ${stakeholder}`,
          stakeholder
        });
      }
    });
    
    return risks;
  }

  static generateRecommendations(sentimentByStakeholder, riskIndicators) {
    const recommendations = [];
    
    Object.entries(sentimentByStakeholder).forEach(([stakeholder, data]) => {
      if (data.overallSentiment < 0) {
        recommendations.push({
          stakeholder,
          priority: data.overallSentiment < -0.5 ? 'high' : 'medium',
          action: `Improve engagement with ${stakeholder} to address negative sentiment`,
          timeline: '3 months'
        });
      }
    });
    
    return recommendations;
  }

  // Helper methods
  static categorizeSentiment(score) {
    if (score > 0.3) return 'positive';
    if (score < -0.3) return 'negative';
    return 'neutral';
  }

  static assessSentimentRisk(score) {
    if (score < -0.5) return 'high';
    if (score < -0.2) return 'medium';
    return 'low';
  }

  static groupFeedbackByTime(feedback) {
    const grouped = {};
    feedback.forEach(item => {
      const month = new Date(item.date || Date.now()).toISOString().slice(0, 7);
      if (!grouped[month]) grouped[month] = [];
      grouped[month].push(item);
    });
    return grouped;
  }

  static calculateMonthlyTrends(timeSeriesData) {
    const trends = {};
    Object.entries(timeSeriesData).forEach(([month, feedback]) => {
      const avgSentiment = feedback.reduce((sum, item) => 
        sum + this.classifySentiment(item.text || item.comment || ''), 0
      ) / (feedback.length || 1);
      trends[month] = avgSentiment;
    });
    return trends;
  }

  static determineTrendDirection(timeSeriesData) {
    const months = Object.keys(timeSeriesData).sort();
    if (months.length < 2) return 'stable';
    
    const recent = months.slice(-2);
    const earlier = months.slice(0, -2);
    
    if (recent.length === 0 || earlier.length === 0) return 'stable';
    
    const recentAvg = recent.reduce((sum, month) => {
      const feedback = timeSeriesData[month];
      const sentiment = feedback.reduce((s, item) => 
        s + this.classifySentiment(item.text || item.comment || ''), 0
      ) / (feedback.length || 1);
      return sum + sentiment;
    }, 0) / recent.length;
    
    const earlierAvg = earlier.reduce((sum, month) => {
      const feedback = timeSeriesData[month];
      const sentiment = feedback.reduce((s, item) => 
        s + this.classifySentiment(item.text || item.comment || ''), 0
      ) / (feedback.length || 1);
      return sum + sentiment;
    }, 0) / (earlier.length || 1);
    
    if (recentAvg > earlierAvg + 0.1) return 'improving';
    if (recentAvg < earlierAvg - 0.1) return 'declining';
    return 'stable';
  }

  static calculateSentimentVolatility(timeSeriesData) {
    const values = Object.values(timeSeriesData).map(feedback => {
      return feedback.reduce((sum, item) => 
        sum + this.classifySentiment(item.text || item.comment || ''), 0
      ) / (feedback.length || 1);
    });
    
    if (values.length < 2) return 0;
    
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    return Math.sqrt(variance);
  }

  static analyzePlatformSentiment(data) {
    const platforms = ['twitter', 'linkedin', 'facebook', 'instagram'];
    const analysis = {};
    
    platforms.forEach(platform => {
      const platformData = data[platform] || {};
      analysis[platform] = {
        sentiment: platformData.sentiment || 0,
        mentions: platformData.mentions || 0,
        engagement: platformData.engagement || 0
      };
    });
    
    return analysis;
  }

  static calculateReputationScore(data) {
    const sentiment = data.overallSentiment || 0;
    const mentions = Math.min((data.mentions || 0) / 1000, 1);
    const engagement = (data.engagement || 0) / 100;
    
    return Math.max(0, Math.min(100, (sentiment + 1) * 50 + mentions * 25 + engagement * 25));
  }

  static getDefaultSentimentAnalysis() {
    return {
      sentimentByStakeholder: {},
      sentimentTrends: { monthlyTrends: {}, trendDirection: 'stable', volatility: 0 },
      socialMediaSentiment: { platforms: {}, mentions: 0, reputationScore: 0, trending: [] },
      overallSentiment: { score: 0, category: 'neutral', riskLevel: 'low' },
      riskIndicators: [],
      recommendations: []
    };
  }
}

export default StakeholderSentimentAnalysis;