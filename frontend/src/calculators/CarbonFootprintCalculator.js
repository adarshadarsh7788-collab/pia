// Carbon Footprint Calculator for ESG Reporting
export class CarbonFootprintCalculator {
  static emissionFactors = {
    electricity: { grid: 0.4, renewable: 0.02 }, // kg CO2e per kWh
    naturalGas: 2.0, // kg CO2e per m³
    diesel: 2.68, // kg CO2e per liter
    gasoline: 2.31, // kg CO2e per liter
    coal: 2.42, // kg CO2e per kg
    propane: 1.51, // kg CO2e per liter
    heating_oil: 2.52, // kg CO2e per liter
    transport: {
      car: 0.21, // kg CO2e per km
      truck: 0.62, // kg CO2e per km
      plane: 0.255, // kg CO2e per km
      train: 0.041, // kg CO2e per km
      ship: 0.011 // kg CO2e per km
    }
  };

  static calculateTotalFootprint(data) {
    try {
      const scope1 = this.calculateScope1Emissions(data.scope1 || {});
      const scope2 = this.calculateScope2Emissions(data.scope2 || {});
      const scope3 = this.calculateScope3Emissions(data.scope3 || {});

      return {
        totalEmissions: scope1.total + scope2.total + scope3.total,
        scope1,
        scope2,
        scope3,
        breakdown: this.generateBreakdown(scope1, scope2, scope3),
        recommendations: this.generateRecommendations(scope1, scope2, scope3),
        calculatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Carbon footprint calculation failed:', error);
      return this.getDefaultFootprint();
    }
  }

  static calculateScope1Emissions(scope1Data) {
    const emissions = {
      naturalGas: (scope1Data.naturalGas || 0) * this.emissionFactors.naturalGas,
      diesel: (scope1Data.diesel || 0) * this.emissionFactors.diesel,
      gasoline: (scope1Data.gasoline || 0) * this.emissionFactors.gasoline,
      coal: (scope1Data.coal || 0) * this.emissionFactors.coal,
      propane: (scope1Data.propane || 0) * this.emissionFactors.propane,
      heatingOil: (scope1Data.heatingOil || 0) * this.emissionFactors.heating_oil
    };

    return {
      total: Object.values(emissions).reduce((sum, val) => sum + val, 0),
      breakdown: emissions,
      category: 'Direct Emissions'
    };
  }

  static calculateScope2Emissions(scope2Data) {
    const gridElectricity = (scope2Data.gridElectricity || 0) * this.emissionFactors.electricity.grid;
    const renewableElectricity = (scope2Data.renewableElectricity || 0) * this.emissionFactors.electricity.renewable;

    return {
      total: gridElectricity + renewableElectricity,
      breakdown: {
        gridElectricity,
        renewableElectricity
      },
      category: 'Indirect Emissions (Energy)'
    };
  }

  static calculateScope3Emissions(scope3Data) {
    const transport = this.calculateTransportEmissions(scope3Data.transport || {});
    const businessTravel = this.calculateBusinessTravelEmissions(scope3Data.businessTravel || {});
    const supplyChain = (scope3Data.supplyChainEmissions || 0);
    const wasteDisposal = (scope3Data.wasteDisposal || 0) * 0.5; // kg CO2e per kg waste

    return {
      total: transport + businessTravel + supplyChain + wasteDisposal,
      breakdown: {
        transport,
        businessTravel,
        supplyChain,
        wasteDisposal
      },
      category: 'Other Indirect Emissions'
    };
  }

  static calculateTransportEmissions(transportData) {
    return Object.entries(transportData).reduce((total, [mode, distance]) => {
      const factor = this.emissionFactors.transport[mode] || 0;
      return total + (distance * factor);
    }, 0);
  }

  static calculateBusinessTravelEmissions(travelData) {
    const flights = (travelData.flights || 0) * this.emissionFactors.transport.plane;
    const carTravel = (travelData.carTravel || 0) * this.emissionFactors.transport.car;
    const trainTravel = (travelData.trainTravel || 0) * this.emissionFactors.transport.train;

    return flights + carTravel + trainTravel;
  }

  static generateBreakdown(scope1, scope2, scope3) {
    const total = scope1.total + scope2.total + scope3.total;
    
    return {
      scope1Percentage: total > 0 ? Math.round((scope1.total / total) * 100) : 0,
      scope2Percentage: total > 0 ? Math.round((scope2.total / total) * 100) : 0,
      scope3Percentage: total > 0 ? Math.round((scope3.total / total) * 100) : 0,
      largestSource: this.identifyLargestSource(scope1, scope2, scope3),
      emissionIntensity: this.calculateEmissionIntensity(total)
    };
  }

  static identifyLargestSource(scope1, scope2, scope3) {
    const sources = [
      { name: 'Scope 1', value: scope1.total },
      { name: 'Scope 2', value: scope2.total },
      { name: 'Scope 3', value: scope3.total }
    ];
    
    return sources.reduce((max, source) => source.value > max.value ? source : max);
  }

  static calculateEmissionIntensity(totalEmissions, revenue = 1000000) {
    return totalEmissions / revenue; // kg CO2e per dollar revenue
  }

  static generateRecommendations(scope1, scope2, scope3) {
    const recommendations = [];
    
    if (scope2.total > scope1.total) {
      recommendations.push({
        priority: 'high',
        category: 'Energy',
        action: 'Switch to renewable energy sources',
        impact: 'Could reduce emissions by up to 90%',
        cost: 'Medium'
      });
    }

    if (scope1.breakdown.naturalGas > 1000) {
      recommendations.push({
        priority: 'medium',
        category: 'Heating',
        action: 'Improve building insulation and heating efficiency',
        impact: 'Could reduce natural gas consumption by 20-30%',
        cost: 'High'
      });
    }

    if (scope3.breakdown.transport > 500) {
      recommendations.push({
        priority: 'medium',
        category: 'Transport',
        action: 'Implement electric vehicle fleet or remote work policies',
        impact: 'Could reduce transport emissions by 40-60%',
        cost: 'Medium'
      });
    }

    return recommendations;
  }

  static calculateCarbonOffset(totalEmissions, offsetPrice = 15) {
    return {
      offsetRequired: Math.ceil(totalEmissions / 1000), // tonnes CO2e
      estimatedCost: Math.ceil(totalEmissions / 1000) * offsetPrice,
      offsetProjects: this.suggestOffsetProjects(totalEmissions)
    };
  }

  static suggestOffsetProjects(emissions) {
    const projects = [];
    
    if (emissions > 10000) {
      projects.push('Reforestation projects', 'Renewable energy development');
    } else if (emissions > 5000) {
      projects.push('Solar panel installations', 'Energy efficiency programs');
    } else {
      projects.push('Tree planting', 'Methane capture projects');
    }
    
    return projects;
  }

  static calculateYearOverYear(currentYear, previousYear) {
    if (!previousYear || previousYear.totalEmissions === 0) {
      return { change: 0, trend: 'baseline' };
    }

    const change = ((currentYear.totalEmissions - previousYear.totalEmissions) / previousYear.totalEmissions) * 100;
    
    return {
      change: Math.round(change * 100) / 100,
      trend: change > 5 ? 'increasing' : change < -5 ? 'decreasing' : 'stable',
      absoluteChange: currentYear.totalEmissions - previousYear.totalEmissions
    };
  }

  static getDefaultFootprint() {
    return {
      totalEmissions: 0,
      scope1: { total: 0, breakdown: {}, category: 'Direct Emissions' },
      scope2: { total: 0, breakdown: {}, category: 'Indirect Emissions (Energy)' },
      scope3: { total: 0, breakdown: {}, category: 'Other Indirect Emissions' },
      breakdown: { scope1Percentage: 0, scope2Percentage: 0, scope3Percentage: 0 },
      recommendations: [],
      calculatedAt: new Date().toISOString()
    };
  }
}

export default CarbonFootprintCalculator;