// Water Stress Assessment Calculator
export class WaterStressCalculator {
  static waterStressLevels = {
    low: { min: 0, max: 10, description: 'Low water stress' },
    lowMedium: { min: 10, max: 20, description: 'Low-medium water stress' },
    mediumHigh: { min: 20, max: 40, description: 'Medium-high water stress' },
    high: { min: 40, max: 80, description: 'High water stress' },
    extremelyHigh: { min: 80, max: 100, description: 'Extremely high water stress' }
  };

  static regionalFactors = {
    'North America': { availability: 0.8, quality: 0.9, infrastructure: 0.95 },
    'Europe': { availability: 0.85, quality: 0.95, infrastructure: 0.98 },
    'Asia': { availability: 0.6, quality: 0.7, infrastructure: 0.75 },
    'Africa': { availability: 0.4, quality: 0.5, infrastructure: 0.6 },
    'South America': { availability: 0.7, quality: 0.75, infrastructure: 0.8 },
    'Oceania': { availability: 0.75, quality: 0.9, infrastructure: 0.9 }
  };

  static calculateWaterStress(data) {
    try {
      const consumption = this.calculateWaterConsumption(data.consumption || {});
      const availability = this.assessWaterAvailability(data.location || {});
      const quality = this.assessWaterQuality(data.quality || {});
      const efficiency = this.calculateWaterEfficiency(data.efficiency || {});

      const stressScore = this.calculateStressScore(consumption, availability, quality, efficiency);
      
      return {
        overallStressScore: stressScore,
        stressLevel: this.getStressLevel(stressScore),
        consumption,
        availability,
        quality,
        efficiency,
        riskAssessment: this.assessRisks(stressScore, data.location),
        recommendations: this.generateRecommendations(stressScore, consumption, efficiency),
        calculatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Water stress calculation failed:', error);
      return this.getDefaultAssessment();
    }
  }

  static calculateWaterConsumption(consumptionData) {
    const totalConsumption = (consumptionData.totalAnnual || 0);
    const peakConsumption = (consumptionData.peakMonthly || 0);
    const recycledWater = (consumptionData.recycled || 0);
    const rainwaterHarvested = (consumptionData.rainwater || 0);

    const netConsumption = totalConsumption - recycledWater - rainwaterHarvested;
    const consumptionIntensity = totalConsumption / (consumptionData.revenue || 1000000);

    return {
      totalAnnual: totalConsumption,
      netConsumption,
      peakMonthly: peakConsumption,
      recycledPercentage: totalConsumption > 0 ? (recycledWater / totalConsumption) * 100 : 0,
      rainwaterPercentage: totalConsumption > 0 ? (rainwaterHarvested / totalConsumption) * 100 : 0,
      consumptionIntensity,
      seasonalVariation: this.calculateSeasonalVariation(consumptionData.monthly || [])
    };
  }

  static calculateSeasonalVariation(monthlyData) {
    if (monthlyData.length < 12) return 0;
    
    const average = monthlyData.reduce((sum, val) => sum + val, 0) / monthlyData.length;
    const variance = monthlyData.reduce((sum, val) => sum + Math.pow(val - average, 2), 0) / monthlyData.length;
    
    return Math.sqrt(variance) / average * 100; // Coefficient of variation as percentage
  }

  static assessWaterAvailability(locationData) {
    const region = locationData.region || 'Global';
    const country = locationData.country || 'Unknown';
    const localSupply = locationData.localSupply || 50; // percentage of local water supply reliability

    const regionalFactor = this.regionalFactors[region] || { availability: 0.7, quality: 0.8, infrastructure: 0.8 };
    
    // Country-specific adjustments
    const countryAdjustments = {
      'United States': 0.9,
      'Canada': 0.95,
      'Germany': 0.9,
      'India': 0.6,
      'China': 0.65,
      'Brazil': 0.75,
      'Australia': 0.8
    };

    const countryFactor = countryAdjustments[country] || 0.7;
    const availabilityScore = (regionalFactor.availability * 0.4 + countryFactor * 0.4 + localSupply / 100 * 0.2) * 100;

    return {
      score: Math.round(availabilityScore),
      regionalFactor: regionalFactor.availability,
      countryFactor,
      localSupplyReliability: localSupply,
      infrastructure: regionalFactor.infrastructure * 100,
      seasonalAvailability: this.assessSeasonalAvailability(locationData.climate)
    };
  }

  static assessSeasonalAvailability(climate = 'temperate') {
    const climateFactors = {
      arid: 0.3,
      semiarid: 0.5,
      temperate: 0.8,
      tropical: 0.7,
      continental: 0.75,
      mediterranean: 0.6
    };

    return (climateFactors[climate] || 0.7) * 100;
  }

  static assessWaterQuality(qualityData) {
    const ph = qualityData.ph || 7.0;
    const tds = qualityData.tds || 300; // Total Dissolved Solids (mg/L)
    const turbidity = qualityData.turbidity || 1; // NTU
    const chlorine = qualityData.chlorine || 0.5; // mg/L
    const hardness = qualityData.hardness || 150; // mg/L as CaCO3

    // Quality scoring based on WHO standards
    const phScore = this.scoreParameter(ph, 6.5, 8.5, 'optimal');
    const tdsScore = this.scoreParameter(tds, 0, 500, 'lower');
    const turbidityScore = this.scoreParameter(turbidity, 0, 1, 'lower');
    const chlorineScore = this.scoreParameter(chlorine, 0.2, 1.0, 'optimal');
    const hardnessScore = this.scoreParameter(hardness, 60, 120, 'optimal');

    const overallQuality = (phScore + tdsScore + turbidityScore + chlorineScore + hardnessScore) / 5;

    return {
      overallScore: Math.round(overallQuality),
      parameters: {
        ph: { value: ph, score: phScore },
        tds: { value: tds, score: tdsScore },
        turbidity: { value: turbidity, score: turbidityScore },
        chlorine: { value: chlorine, score: chlorineScore },
        hardness: { value: hardness, score: hardnessScore }
      },
      treatmentRequired: overallQuality < 70,
      potabilityRating: this.getPotabilityRating(overallQuality)
    };
  }

  static scoreParameter(value, min, max, type) {
    switch (type) {
      case 'optimal':
        if (value >= min && value <= max) return 100;
        const deviation = Math.min(Math.abs(value - min), Math.abs(value - max));
        return Math.max(0, 100 - (deviation / Math.max(min, max - min)) * 100);
      
      case 'lower':
        if (value <= max) return 100;
        return Math.max(0, 100 - ((value - max) / max) * 100);
      
      default:
        return 50;
    }
  }

  static getPotabilityRating(score) {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Good';
    if (score >= 70) return 'Acceptable';
    if (score >= 60) return 'Poor';
    return 'Unacceptable';
  }

  static calculateWaterEfficiency(efficiencyData) {
    const recyclingRate = efficiencyData.recyclingRate || 0;
    const leakageRate = efficiencyData.leakageRate || 10;
    const conservationMeasures = efficiencyData.conservationMeasures || 0;
    const technologyScore = efficiencyData.technologyScore || 50;

    const efficiencyScore = (
      (recyclingRate * 0.3) +
      ((100 - leakageRate) * 0.3) +
      (conservationMeasures * 0.2) +
      (technologyScore * 0.2)
    );

    return {
      overallScore: Math.round(efficiencyScore),
      recyclingRate,
      leakageRate,
      conservationMeasures,
      technologyScore,
      waterProductivity: this.calculateWaterProductivity(efficiencyData),
      benchmarkComparison: this.benchmarkEfficiency(efficiencyScore, efficiencyData.industry)
    };
  }

  static calculateWaterProductivity(data) {
    const revenue = data.revenue || 1000000;
    const waterConsumption = data.totalConsumption || 10000;
    
    return revenue / waterConsumption; // Revenue per cubic meter of water
  }

  static benchmarkEfficiency(score, industry = 'general') {
    const industryBenchmarks = {
      manufacturing: 65,
      technology: 80,
      agriculture: 45,
      energy: 60,
      textiles: 50,
      food: 55,
      general: 60
    };

    const benchmark = industryBenchmarks[industry] || industryBenchmarks.general;
    
    return {
      industryBenchmark: benchmark,
      performance: score > benchmark ? 'Above Average' : score > benchmark - 10 ? 'Average' : 'Below Average',
      gap: score - benchmark
    };
  }

  static calculateStressScore(consumption, availability, quality, efficiency) {
    const consumptionWeight = 0.3;
    const availabilityWeight = 0.35;
    const qualityWeight = 0.2;
    const efficiencyWeight = 0.15;

    // Normalize consumption (higher consumption = higher stress)
    const consumptionStress = Math.min(100, (consumption.consumptionIntensity * 1000));
    
    // Invert availability and quality (lower availability/quality = higher stress)
    const availabilityStress = 100 - availability.score;
    const qualityStress = 100 - quality.overallScore;
    
    // Invert efficiency (lower efficiency = higher stress)
    const efficiencyStress = 100 - efficiency.overallScore;

    const weightedScore = (
      (consumptionStress * consumptionWeight) +
      (availabilityStress * availabilityWeight) +
      (qualityStress * qualityWeight) +
      (efficiencyStress * efficiencyWeight)
    );

    return Math.round(Math.min(100, Math.max(0, weightedScore)));
  }

  static getStressLevel(score) {
    for (const [level, range] of Object.entries(this.waterStressLevels)) {
      if (score >= range.min && score < range.max) {
        return { level, ...range };
      }
    }
    return { level: 'extremelyHigh', ...this.waterStressLevels.extremelyHigh };
  }

  static assessRisks(stressScore, location) {
    const risks = [];

    if (stressScore > 60) {
      risks.push({
        type: 'Supply Risk',
        severity: 'High',
        description: 'Potential water supply disruptions',
        mitigation: 'Diversify water sources, implement conservation measures'
      });
    }

    if (stressScore > 40) {
      risks.push({
        type: 'Regulatory Risk',
        severity: 'Medium',
        description: 'Increased water usage regulations likely',
        mitigation: 'Monitor regulatory changes, prepare compliance strategies'
      });
    }

    if (stressScore > 70) {
      risks.push({
        type: 'Operational Risk',
        severity: 'High',
        description: 'Business operations may be impacted',
        mitigation: 'Develop water contingency plans, invest in efficiency'
      });
    }

    return risks;
  }

  static generateRecommendations(stressScore, consumption, efficiency) {
    const recommendations = [];

    if (stressScore > 50) {
      recommendations.push({
        priority: 'High',
        category: 'Conservation',
        action: 'Implement water recycling and reuse systems',
        impact: 'Could reduce consumption by 30-50%',
        cost: 'Medium'
      });
    }

    if (efficiency.recyclingRate < 20) {
      recommendations.push({
        priority: 'Medium',
        category: 'Efficiency',
        action: 'Install water recycling infrastructure',
        impact: 'Increase water efficiency by 25%',
        cost: 'High'
      });
    }

    if (efficiency.leakageRate > 15) {
      recommendations.push({
        priority: 'High',
        category: 'Infrastructure',
        action: 'Repair and upgrade water distribution systems',
        impact: 'Reduce water loss by 10-20%',
        cost: 'Medium'
      });
    }

    return recommendations;
  }

  static getDefaultAssessment() {
    return {
      overallStressScore: 0,
      stressLevel: { level: 'low', description: 'Low water stress' },
      consumption: { totalAnnual: 0, netConsumption: 0 },
      availability: { score: 0 },
      quality: { overallScore: 0 },
      efficiency: { overallScore: 0 },
      riskAssessment: [],
      recommendations: [],
      calculatedAt: new Date().toISOString()
    };
  }
}

export default WaterStressCalculator;