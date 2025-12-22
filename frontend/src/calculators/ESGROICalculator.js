// ESG Return on Investment Calculator
export class ESGROICalculator {
  static calculateESGROI(data) {
    try {
      const investments = this.calculateInvestments(data.investments || {});
      const benefits = this.calculateBenefits(data.benefits || {});
      const risks = this.calculateRiskMitigation(data.risks || {});
      const timeframe = data.timeframe || 5;

      const roi = this.calculateROI(investments, benefits, risks, timeframe);
      
      return {
        totalROI: roi.totalROI,
        annualizedROI: roi.annualizedROI,
        paybackPeriod: roi.paybackPeriod,
        netPresentValue: roi.netPresentValue,
        investments,
        benefits,
        risks,
        breakdown: this.generateBreakdown(investments, benefits, risks),
        recommendations: this.generateRecommendations(roi, investments, benefits),
        calculatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('ESG ROI calculation failed:', error);
      return this.getDefaultROI();
    }
  }

  static calculateInvestments(investmentData) {
    const environmental = {
      renewableEnergy: investmentData.renewableEnergy || 0,
      energyEfficiency: investmentData.energyEfficiency || 0,
      wasteReduction: investmentData.wasteReduction || 0,
      waterConservation: investmentData.waterConservation || 0,
      carbonOffset: investmentData.carbonOffset || 0
    };

    const social = {
      employeeTraining: investmentData.employeeTraining || 0,
      healthSafety: investmentData.healthSafety || 0,
      communityPrograms: investmentData.communityPrograms || 0,
      diversityInitiatives: investmentData.diversityInitiatives || 0,
      workplaceWellness: investmentData.workplaceWellness || 0
    };

    const governance = {
      complianceSystem: investmentData.complianceSystem || 0,
      riskManagement: investmentData.riskManagement || 0,
      boardTraining: investmentData.boardTraining || 0,
      auditingSystems: investmentData.auditingSystems || 0,
      transparencyTools: investmentData.transparencyTools || 0
    };

    const totalEnvironmental = Object.values(environmental).reduce((sum, val) => sum + val, 0);
    const totalSocial = Object.values(social).reduce((sum, val) => sum + val, 0);
    const totalGovernance = Object.values(governance).reduce((sum, val) => sum + val, 0);

    return {
      environmental: { ...environmental, total: totalEnvironmental },
      social: { ...social, total: totalSocial },
      governance: { ...governance, total: totalGovernance },
      totalInvestment: totalEnvironmental + totalSocial + totalGovernance
    };
  }

  static calculateBenefits(benefitData) {
    const costSavings = this.calculateCostSavings(benefitData.costSavings || {});
    const revenueGains = this.calculateRevenueGains(benefitData.revenueGains || {});
    const riskReduction = this.calculateRiskReductionValue(benefitData.riskReduction || {});
    const brandValue = this.calculateBrandValue(benefitData.brandValue || {});

    return {
      costSavings,
      revenueGains,
      riskReduction,
      brandValue,
      totalBenefits: costSavings.total + revenueGains.total + riskReduction.total + brandValue.total
    };
  }

  static calculateCostSavings(costSavingsData) {
    const energySavings = (costSavingsData.energyReduction || 0) * (costSavingsData.energyCostPerUnit || 0.12);
    const waterSavings = (costSavingsData.waterReduction || 0) * (costSavingsData.waterCostPerUnit || 0.003);
    const wasteSavings = (costSavingsData.wasteReduction || 0) * (costSavingsData.wasteCostPerUnit || 0.1);
    const operationalEfficiency = costSavingsData.operationalEfficiency || 0;
    const reducedTurnover = (costSavingsData.turnoverReduction || 0) * (costSavingsData.avgRecruitmentCost || 15000);

    return {
      energySavings,
      waterSavings,
      wasteSavings,
      operationalEfficiency,
      reducedTurnover,
      total: energySavings + waterSavings + wasteSavings + operationalEfficiency + reducedTurnover
    };
  }

  static calculateRevenueGains(revenueData) {
    const greenProducts = revenueData.greenProductRevenue || 0;
    const sustainabilityPremium = revenueData.sustainabilityPremium || 0;
    const newMarkets = revenueData.newMarketAccess || 0;
    const customerRetention = (revenueData.customerRetentionImprovement || 0) * (revenueData.avgCustomerValue || 1000);
    const investorAttraction = revenueData.investorAttraction || 0;

    return {
      greenProducts,
      sustainabilityPremium,
      newMarkets,
      customerRetention,
      investorAttraction,
      total: greenProducts + sustainabilityPremium + newMarkets + customerRetention + investorAttraction
    };
  }

  static calculateRiskReductionValue(riskData) {
    const regulatoryRisk = (riskData.regulatoryFineReduction || 0);
    const reputationalRisk = (riskData.reputationProtection || 0);
    const operationalRisk = (riskData.operationalRiskReduction || 0);
    const supplyChainRisk = (riskData.supplyChainStability || 0);
    const climateRisk = (riskData.climateRiskMitigation || 0);

    return {
      regulatoryRisk,
      reputationalRisk,
      operationalRisk,
      supplyChainRisk,
      climateRisk,
      total: regulatoryRisk + reputationalRisk + operationalRisk + supplyChainRisk + climateRisk
    };
  }

  static calculateBrandValue(brandData) {
    const brandPremium = brandData.brandPremium || 0;
    const marketShare = brandData.marketShareGain || 0;
    const employeeEngagement = (brandData.engagementImprovement || 0) * (brandData.productivityGain || 5000);
    const mediaValue = brandData.positiveMediaValue || 0;

    return {
      brandPremium,
      marketShare,
      employeeEngagement,
      mediaValue,
      total: brandPremium + marketShare + employeeEngagement + mediaValue
    };
  }

  static calculateRiskMitigation(riskData) {
    const environmentalRisks = riskData.environmentalRisks || 0;
    const socialRisks = riskData.socialRisks || 0;
    const governanceRisks = riskData.governanceRisks || 0;
    const totalRiskMitigation = environmentalRisks + socialRisks + governanceRisks;

    return {
      environmentalRisks,
      socialRisks,
      governanceRisks,
      totalRiskMitigation,
      riskAdjustedReturn: this.calculateRiskAdjustedReturn(totalRiskMitigation)
    };
  }

  static calculateRiskAdjustedReturn(riskMitigation) {
    // Risk mitigation adds value through reduced volatility and improved stability
    return riskMitigation * 0.15; // 15% premium for risk reduction
  }

  static calculateROI(investments, benefits, risks, timeframe) {
    const totalInvestment = investments.totalInvestment;
    const annualBenefits = benefits.totalBenefits;
    const riskAdjustedBenefits = annualBenefits + risks.riskAdjustedReturn;
    
    // Calculate cumulative benefits over timeframe
    const cumulativeBenefits = this.calculateCumulativeBenefits(riskAdjustedBenefits, timeframe);
    
    // Calculate ROI
    const totalROI = totalInvestment > 0 ? ((cumulativeBenefits - totalInvestment) / totalInvestment) * 100 : 0;
    const annualizedROI = totalROI / timeframe;
    
    // Calculate payback period
    const paybackPeriod = riskAdjustedBenefits > 0 ? totalInvestment / riskAdjustedBenefits : Infinity;
    
    // Calculate NPV (assuming 8% discount rate)
    const discountRate = 0.08;
    const netPresentValue = this.calculateNPV(totalInvestment, riskAdjustedBenefits, timeframe, discountRate);

    return {
      totalROI: Math.round(totalROI * 100) / 100,
      annualizedROI: Math.round(annualizedROI * 100) / 100,
      paybackPeriod: Math.round(paybackPeriod * 100) / 100,
      netPresentValue: Math.round(netPresentValue),
      benefitCostRatio: totalInvestment > 0 ? cumulativeBenefits / totalInvestment : 0
    };
  }

  static calculateCumulativeBenefits(annualBenefits, timeframe) {
    let cumulative = 0;
    for (let year = 1; year <= timeframe; year++) {
      // Assume 3% annual growth in benefits
      cumulative += annualBenefits * Math.pow(1.03, year - 1);
    }
    return cumulative;
  }

  static calculateNPV(investment, annualBenefits, timeframe, discountRate) {
    let npv = -investment; // Initial investment is negative cash flow
    
    for (let year = 1; year <= timeframe; year++) {
      const yearlyBenefit = annualBenefits * Math.pow(1.03, year - 1); // 3% growth
      const presentValue = yearlyBenefit / Math.pow(1 + discountRate, year);
      npv += presentValue;
    }
    
    return npv;
  }

  static generateBreakdown(investments, benefits, risks) {
    const totalInvestment = investments.totalInvestment;
    const totalBenefits = benefits.totalBenefits;

    return {
      investmentBreakdown: {
        environmental: totalInvestment > 0 ? Math.round((investments.environmental.total / totalInvestment) * 100) : 0,
        social: totalInvestment > 0 ? Math.round((investments.social.total / totalInvestment) * 100) : 0,
        governance: totalInvestment > 0 ? Math.round((investments.governance.total / totalInvestment) * 100) : 0
      },
      benefitBreakdown: {
        costSavings: totalBenefits > 0 ? Math.round((benefits.costSavings.total / totalBenefits) * 100) : 0,
        revenueGains: totalBenefits > 0 ? Math.round((benefits.revenueGains.total / totalBenefits) * 100) : 0,
        riskReduction: totalBenefits > 0 ? Math.round((benefits.riskReduction.total / totalBenefits) * 100) : 0,
        brandValue: totalBenefits > 0 ? Math.round((benefits.brandValue.total / totalBenefits) * 100) : 0
      },
      topBenefitSources: this.identifyTopBenefitSources(benefits),
      topInvestmentAreas: this.identifyTopInvestmentAreas(investments)
    };
  }

  static identifyTopBenefitSources(benefits) {
    const sources = [
      { name: 'Cost Savings', value: benefits.costSavings.total },
      { name: 'Revenue Gains', value: benefits.revenueGains.total },
      { name: 'Risk Reduction', value: benefits.riskReduction.total },
      { name: 'Brand Value', value: benefits.brandValue.total }
    ];
    
    return sources.sort((a, b) => b.value - a.value).slice(0, 3);
  }

  static identifyTopInvestmentAreas(investments) {
    const areas = [
      { name: 'Environmental', value: investments.environmental.total },
      { name: 'Social', value: investments.social.total },
      { name: 'Governance', value: investments.governance.total }
    ];
    
    return areas.sort((a, b) => b.value - a.value);
  }

  static generateRecommendations(roi, investments, benefits) {
    const recommendations = [];

    if (roi.totalROI < 15) {
      recommendations.push({
        priority: 'High',
        category: 'Investment Optimization',
        action: 'Focus on high-impact, low-cost ESG initiatives',
        rationale: 'Current ROI is below industry average of 15-25%'
      });
    }

    if (roi.paybackPeriod > 5) {
      recommendations.push({
        priority: 'Medium',
        category: 'Payback Acceleration',
        action: 'Prioritize quick-win initiatives with shorter payback periods',
        rationale: 'Current payback period exceeds typical 3-5 year target'
      });
    }

    if (benefits.costSavings.total < investments.totalInvestment * 0.3) {
      recommendations.push({
        priority: 'Medium',
        category: 'Cost Efficiency',
        action: 'Increase focus on operational efficiency and cost reduction',
        rationale: 'Cost savings should represent at least 30% of total investment'
      });
    }

    if (roi.netPresentValue < 0) {
      recommendations.push({
        priority: 'High',
        category: 'Investment Strategy',
        action: 'Reassess investment priorities and timeline',
        rationale: 'Negative NPV indicates investment may not create value'
      });
    }

    return recommendations;
  }

  static benchmarkROI(roi, industry = 'general') {
    const industryBenchmarks = {
      manufacturing: { roi: 18, payback: 4.2 },
      technology: { roi: 25, payback: 3.5 },
      energy: { roi: 22, payback: 4.0 },
      finance: { roi: 20, payback: 3.8 },
      retail: { roi: 16, payback: 4.5 },
      general: { roi: 20, payback: 4.0 }
    };

    const benchmark = industryBenchmarks[industry] || industryBenchmarks.general;
    
    return {
      industryROI: benchmark.roi,
      industryPayback: benchmark.payback,
      roiComparison: roi.totalROI > benchmark.roi ? 'Above Average' : 'Below Average',
      paybackComparison: roi.paybackPeriod < benchmark.payback ? 'Better than Average' : 'Slower than Average'
    };
  }

  static getDefaultROI() {
    return {
      totalROI: 0,
      annualizedROI: 0,
      paybackPeriod: 0,
      netPresentValue: 0,
      investments: { totalInvestment: 0 },
      benefits: { totalBenefits: 0 },
      risks: { totalRiskMitigation: 0 },
      breakdown: {},
      recommendations: [],
      calculatedAt: new Date().toISOString()
    };
  }
}

export default ESGROICalculator;