// Emission Intensity Calculator for ESG Metrics
export class EmissionIntensityCalculator {
  static intensityMetrics = {
    revenue: 'kg CO2e per $ revenue',
    employee: 'kg CO2e per employee',
    production: 'kg CO2e per unit produced',
    area: 'kg CO2e per m² floor area',
    energy: 'kg CO2e per kWh consumed'
  };

  static industryBenchmarks = {
    manufacturing: { revenue: 0.25, employee: 8500, production: 12.5 },
    technology: { revenue: 0.08, employee: 3200, production: 2.1 },
    energy: { revenue: 0.45, employee: 15600, production: 28.3 },
    finance: { revenue: 0.05, employee: 2100, production: 1.2 },
    retail: { revenue: 0.12, employee: 4800, production: 3.8 },
    healthcare: { revenue: 0.18, employee: 6200, production: 7.4 },
    transportation: { revenue: 0.35, employee: 12400, production: 18.7 }
  };

  static calculateEmissionIntensity(data) {
    try {
      const emissions = this.processEmissionData(data.emissions || {});
      const businessMetrics = this.processBusinessMetrics(data.businessMetrics || {});
      const intensities = this.calculateIntensities(emissions, businessMetrics);
      const trends = this.calculateTrends(data.historicalData || []);
      const benchmarks = this.compareToBenchmarks(intensities, data.industry);

      return {
        totalEmissions: emissions.total,
        intensityMetrics: intensities,
        trends,
        benchmarks,
        targetAnalysis: this.analyzeTargets(intensities, data.targets || {}),
        recommendations: this.generateRecommendations(intensities, benchmarks, trends),
        calculatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Emission intensity calculation failed:', error);
      return this.getDefaultIntensity();
    }
  }

  static processEmissionData(emissionData) {
    const scope1 = emissionData.scope1 || 0;
    const scope2 = emissionData.scope2 || 0;
    const scope3 = emissionData.scope3 || 0;
    const total = scope1 + scope2 + scope3;

    return {
      scope1,
      scope2,
      scope3,
      total,
      breakdown: {
        scope1Percentage: total > 0 ? Math.round((scope1 / total) * 100) : 0,
        scope2Percentage: total > 0 ? Math.round((scope2 / total) * 100) : 0,
        scope3Percentage: total > 0 ? Math.round((scope3 / total) * 100) : 0
      }
    };
  }

  static processBusinessMetrics(businessData) {
    return {
      revenue: businessData.revenue || 0,
      employees: businessData.employees || 0,
      production: businessData.production || 0,
      floorArea: businessData.floorArea || 0,
      energyConsumption: businessData.energyConsumption || 0,
      operatingHours: businessData.operatingHours || 8760, // hours per year
      facilities: businessData.facilities || 1
    };
  }

  static calculateIntensities(emissions, businessMetrics) {
    const intensities = {};

    // Revenue intensity
    if (businessMetrics.revenue > 0) {
      intensities.revenue = {
        value: emissions.total / businessMetrics.revenue,
        unit: this.intensityMetrics.revenue,
        scope1: emissions.scope1 / businessMetrics.revenue,
        scope2: emissions.scope2 / businessMetrics.revenue,
        scope3: emissions.scope3 / businessMetrics.revenue
      };
    }

    // Employee intensity
    if (businessMetrics.employees > 0) {
      intensities.employee = {
        value: emissions.total / businessMetrics.employees,
        unit: this.intensityMetrics.employee,
        scope1: emissions.scope1 / businessMetrics.employees,
        scope2: emissions.scope2 / businessMetrics.employees,
        scope3: emissions.scope3 / businessMetrics.employees
      };
    }

    // Production intensity
    if (businessMetrics.production > 0) {
      intensities.production = {
        value: emissions.total / businessMetrics.production,
        unit: this.intensityMetrics.production,
        scope1: emissions.scope1 / businessMetrics.production,
        scope2: emissions.scope2 / businessMetrics.production,
        scope3: emissions.scope3 / businessMetrics.production
      };
    }

    // Floor area intensity
    if (businessMetrics.floorArea > 0) {
      intensities.area = {
        value: emissions.total / businessMetrics.floorArea,
        unit: this.intensityMetrics.area,
        scope1: emissions.scope1 / businessMetrics.floorArea,
        scope2: emissions.scope2 / businessMetrics.floorArea,
        scope3: emissions.scope3 / businessMetrics.floorArea
      };
    }

    // Energy intensity
    if (businessMetrics.energyConsumption > 0) {
      intensities.energy = {
        value: emissions.total / businessMetrics.energyConsumption,
        unit: this.intensityMetrics.energy,
        scope1: emissions.scope1 / businessMetrics.energyConsumption,
        scope2: emissions.scope2 / businessMetrics.energyConsumption,
        scope3: emissions.scope3 / businessMetrics.energyConsumption
      };
    }

    return intensities;
  }

  static calculateTrends(historicalData) {
    if (historicalData.length < 2) {
      return { trend: 'insufficient_data', change: 0, analysis: 'Need at least 2 years of data' };
    }

    const sortedData = historicalData.sort((a, b) => new Date(a.year) - new Date(b.year));
    const latest = sortedData[sortedData.length - 1];
    const previous = sortedData[sortedData.length - 2];

    const trends = {};

    // Calculate trends for each intensity metric
    ['revenue', 'employee', 'production', 'area', 'energy'].forEach(metric => {
      if (latest[metric] && previous[metric]) {
        const change = ((latest[metric] - previous[metric]) / previous[metric]) * 100;
        trends[metric] = {
          change: Math.round(change * 100) / 100,
          direction: change > 5 ? 'increasing' : change < -5 ? 'decreasing' : 'stable',
          yearOverYear: change
        };
      }
    });

    // Calculate overall trend
    const overallTrend = this.calculateOverallTrend(sortedData);

    return {
      ...trends,
      overall: overallTrend,
      dataPoints: sortedData.length,
      timespan: `${sortedData[0].year} - ${latest.year}`
    };
  }

  static calculateOverallTrend(data) {
    if (data.length < 3) return { trend: 'insufficient_data' };

    // Use linear regression to determine trend
    const n = data.length;
    const years = data.map((d, i) => i);
    const values = data.map(d => d.totalIntensity || 0);

    const sumX = years.reduce((sum, x) => sum + x, 0);
    const sumY = values.reduce((sum, y) => sum + y, 0);
    const sumXY = years.reduce((sum, x, i) => sum + x * values[i], 0);
    const sumXX = years.reduce((sum, x) => sum + x * x, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    const trendPercentage = (slope / (sumY / n)) * 100;

    return {
      slope,
      intercept,
      trendPercentage: Math.round(trendPercentage * 100) / 100,
      direction: slope > 0.05 ? 'increasing' : slope < -0.05 ? 'decreasing' : 'stable',
      strength: Math.abs(trendPercentage) > 10 ? 'strong' : Math.abs(trendPercentage) > 5 ? 'moderate' : 'weak'
    };
  }

  static compareToBenchmarks(intensities, industry = 'general') {
    const benchmarks = this.industryBenchmarks[industry] || this.industryBenchmarks.manufacturing;
    const comparisons = {};

    Object.entries(intensities).forEach(([metric, data]) => {
      if (benchmarks[metric]) {
        const benchmark = benchmarks[metric];
        const performance = data.value / benchmark;
        
        comparisons[metric] = {
          benchmark,
          current: data.value,
          ratio: Math.round(performance * 100) / 100,
          performance: performance < 0.8 ? 'excellent' : 
                      performance < 1.0 ? 'good' : 
                      performance < 1.2 ? 'average' : 'poor',
          gap: data.value - benchmark,
          gapPercentage: Math.round(((data.value - benchmark) / benchmark) * 100)
        };
      }
    });

    return {
      industry,
      comparisons,
      overallPerformance: this.calculateOverallPerformance(comparisons),
      ranking: this.estimateIndustryRanking(comparisons)
    };
  }

  static calculateOverallPerformance(comparisons) {
    const performances = Object.values(comparisons).map(c => c.ratio);
    if (performances.length === 0) return 'unknown';

    const avgRatio = performances.reduce((sum, ratio) => sum + ratio, 0) / performances.length;
    
    if (avgRatio < 0.8) return 'excellent';
    if (avgRatio < 1.0) return 'good';
    if (avgRatio < 1.2) return 'average';
    return 'poor';
  }

  static estimateIndustryRanking(comparisons) {
    const avgRatio = Object.values(comparisons).reduce((sum, c) => sum + c.ratio, 0) / Object.keys(comparisons).length;
    
    if (avgRatio < 0.7) return 'Top 10%';
    if (avgRatio < 0.9) return 'Top 25%';
    if (avgRatio < 1.1) return 'Top 50%';
    if (avgRatio < 1.3) return 'Bottom 50%';
    return 'Bottom 25%';
  }

  static analyzeTargets(intensities, targets) {
    const analysis = {};

    Object.entries(targets).forEach(([metric, target]) => {
      if (intensities[metric]) {
        const current = intensities[metric].value;
        const gap = current - target.value;
        const gapPercentage = (gap / target.value) * 100;
        
        analysis[metric] = {
          target: target.value,
          current,
          gap,
          gapPercentage: Math.round(gapPercentage * 100) / 100,
          status: gap <= 0 ? 'achieved' : gap <= target.value * 0.1 ? 'close' : 'needs_improvement',
          timeToTarget: this.estimateTimeToTarget(current, target.value, target.timeline || 5),
          requiredReduction: gap > 0 ? Math.round((gap / current) * 100) : 0
        };
      }
    });

    return analysis;
  }

  static estimateTimeToTarget(current, target, timeline) {
    if (current <= target) return 0;
    
    const requiredReduction = (current - target) / current;
    const annualReduction = requiredReduction / timeline;
    
    // Assuming current reduction rate of 3% per year
    const currentReductionRate = 0.03;
    
    if (currentReductionRate >= annualReduction) {
      return Math.ceil(Math.log(target / current) / Math.log(1 - currentReductionRate));
    } else {
      return timeline * (annualReduction / currentReductionRate);
    }
  }

  static generateRecommendations(intensities, benchmarks, trends) {
    const recommendations = [];

    // Performance-based recommendations
    Object.entries(benchmarks.comparisons).forEach(([metric, comparison]) => {
      if (comparison.performance === 'poor') {
        recommendations.push({
          priority: 'High',
          category: 'Performance Improvement',
          metric,
          action: `Reduce ${metric} intensity by ${Math.abs(comparison.gapPercentage)}%`,
          rationale: `Currently ${comparison.gapPercentage}% above industry benchmark`
        });
      }
    });

    // Trend-based recommendations
    Object.entries(trends).forEach(([metric, trend]) => {
      if (trend.direction === 'increasing' && Math.abs(trend.change) > 10) {
        recommendations.push({
          priority: 'Medium',
          category: 'Trend Reversal',
          metric,
          action: `Implement measures to reverse increasing ${metric} intensity trend`,
          rationale: `${metric} intensity has increased by ${trend.change}% year-over-year`
        });
      }
    });

    // Scope-specific recommendations
    if (intensities.revenue) {
      const { scope1, scope2, scope3 } = intensities.revenue;
      const maxScope = Math.max(scope1, scope2, scope3);
      
      if (maxScope === scope2) {
        recommendations.push({
          priority: 'High',
          category: 'Energy Transition',
          metric: 'scope2',
          action: 'Transition to renewable energy sources',
          rationale: 'Scope 2 emissions represent the largest intensity component'
        });
      } else if (maxScope === scope1) {
        recommendations.push({
          priority: 'High',
          category: 'Direct Emissions',
          metric: 'scope1',
          action: 'Improve operational efficiency and fuel switching',
          rationale: 'Scope 1 emissions represent the largest intensity component'
        });
      }
    }

    return recommendations.slice(0, 5); // Return top 5 recommendations
  }

  static projectFutureIntensity(currentIntensity, reductionRate, years) {
    const projections = [];
    let intensity = currentIntensity;

    for (let year = 1; year <= years; year++) {
      intensity = intensity * (1 - reductionRate);
      projections.push({
        year,
        intensity: Math.round(intensity * 1000) / 1000,
        cumulativeReduction: Math.round(((currentIntensity - intensity) / currentIntensity) * 100)
      });
    }

    return projections;
  }

  static getDefaultIntensity() {
    return {
      totalEmissions: 0,
      intensityMetrics: {},
      trends: { trend: 'no_data' },
      benchmarks: { industry: 'unknown', comparisons: {} },
      targetAnalysis: {},
      recommendations: [],
      calculatedAt: new Date().toISOString()
    };
  }
}

export default EmissionIntensityCalculator;