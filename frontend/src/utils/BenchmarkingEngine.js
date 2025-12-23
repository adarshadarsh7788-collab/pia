// Peer Comparison and Benchmarking Engine
export class BenchmarkingEngine {
  static industryBenchmarks = {
    technology: { environmental: 75, social: 82, governance: 88 },
    manufacturing: { environmental: 65, social: 70, governance: 75 },
    finance: { environmental: 70, social: 85, governance: 90 },
    healthcare: { environmental: 68, social: 88, governance: 82 },
    energy: { environmental: 55, social: 65, governance: 70 }
  };

  static performPeerComparison(companyData, industry, region = 'global') {
    if (!companyData || typeof companyData !== 'object') {
      throw new Error('Invalid company data for benchmarking');
    }
    if (!industry || typeof industry !== 'string') {
      throw new Error('Valid industry must be specified');
    }

    const benchmark = this.industryBenchmarks[industry] || this.industryBenchmarks.manufacturing;
    const companyScores = companyData.categoryScores || {};

    // Validate benchmark data exists
    if (!benchmark) {
      throw new Error(`No benchmark data available for industry: ${industry}`);
    }

    return {
      environmental: this.calculatePerformanceGap(companyScores.environmental || 0, benchmark.environmental || 70),
      social: this.calculatePerformanceGap(companyScores.social || 0, benchmark.social || 70),
      governance: this.calculatePerformanceGap(companyScores.governance || 0, benchmark.governance || 70),
      overall: this.calculateOverallRanking(companyData.overallScore || 0, benchmark),
      industry,
      region
    };
  }

  static calculatePerformanceGap(companyScore, benchmarkScore) {
    const numCompanyScore = Number(companyScore) || 0;
    const numBenchmarkScore = Number(benchmarkScore) || 70;
    
    const gap = numCompanyScore - numBenchmarkScore;
    return {
      score: numCompanyScore,
      benchmark: numBenchmarkScore,
      gap: Math.round(gap * 100) / 100,
      percentile: this.calculatePercentile(numCompanyScore, numBenchmarkScore),
      status: gap > 5 ? 'leader' : gap > -5 ? 'average' : 'laggard'
    };
  }

  static calculatePercentile(score, benchmark) {
    const standardDeviation = 15;
    const zScore = (score - benchmark) / standardDeviation;
    return Math.round(this.normalCDF(zScore) * 100);
  }

  static normalCDF(x) {
    return 0.5 * (1 + this.erf(x / Math.sqrt(2)));
  }

  static erf(x) {
    const a1 = 0.254829592;
    const a2 = -0.284496736;
    const a3 = 1.421413741;
    const a4 = -1.453152027;
    const a5 = 1.061405429;
    const p = 0.3275911;

    const sign = x >= 0 ? 1 : -1;
    x = Math.abs(x);

    const t = 1.0 / (1.0 + p * x);
    const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

    return sign * y;
  }

  static calculateOverallRanking(overallScore, benchmark) {
    const avgBenchmark = (benchmark.environmental + benchmark.social + benchmark.governance) / 3;
    return this.calculatePerformanceGap(overallScore, avgBenchmark);
  }

  static generateCompetitiveInsights(comparison) {
    const insights = [];
    
    Object.entries(comparison).forEach(([category, data]) => {
      if (category === 'industry' || category === 'region') return;
      
      if (data.status === 'leader') {
        insights.push(`Strong performance in ${category} - ${data.gap.toFixed(1)} points above industry average`);
      } else if (data.status === 'laggard') {
        insights.push(`Improvement needed in ${category} - ${Math.abs(data.gap).toFixed(1)} points below industry average`);
      }
    });

    return insights;
  }

  static identifyBestPractices(topPerformers, category) {
    return {
      category,
      practices: [
        'Implement comprehensive sustainability reporting',
        'Establish clear ESG governance structure',
        'Set science-based targets for emissions reduction',
        'Enhance stakeholder engagement programs'
      ],
      leaders: topPerformers.slice(0, 3),
      implementationPriority: 'high'
    };
  }

  static calculateMarketPosition(companyScore, marketData) {
    const sortedScores = marketData.sort((a, b) => b.score - a.score);
    const position = sortedScores.findIndex(company => company.score <= companyScore) + 1;
    
    return {
      rank: position,
      totalCompanies: sortedScores.length,
      percentileRank: Math.round((1 - position / sortedScores.length) * 100),
      quartile: position <= sortedScores.length * 0.25 ? 'Q1' : 
               position <= sortedScores.length * 0.5 ? 'Q2' :
               position <= sortedScores.length * 0.75 ? 'Q3' : 'Q4'
    };
  }
}