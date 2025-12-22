// Specialized ESG Calculators Hub
export { default as CarbonFootprintCalculator } from './CarbonFootprintCalculator';
export { default as WaterStressCalculator } from './WaterStressCalculator';
export { default as ESGROICalculator } from './ESGROICalculator';
export { default as EmissionIntensityCalculator } from './EmissionIntensityCalculator';
export { default as DataIntegration } from './DataIntegration';

// Calculator Manager for unified access
export class CalculatorManager {
  static calculators = {
    carbon: 'CarbonFootprintCalculator',
    water: 'WaterStressCalculator',
    roi: 'ESGROICalculator',
    intensity: 'EmissionIntensityCalculator'
  };

  static async calculate(type, data) {
    try {
      switch (type) {
        case 'carbon':
          const { CarbonFootprintCalculator } = await import('./CarbonFootprintCalculator');
          return CarbonFootprintCalculator.calculateTotalFootprint(data);
        
        case 'water':
          const { WaterStressCalculator } = await import('./WaterStressCalculator');
          return WaterStressCalculator.calculateWaterStress(data);
        
        case 'roi':
          const { ESGROICalculator } = await import('./ESGROICalculator');
          return ESGROICalculator.calculateESGROI(data);
        
        case 'intensity':
          const { EmissionIntensityCalculator } = await import('./EmissionIntensityCalculator');
          return EmissionIntensityCalculator.calculateEmissionIntensity(data);
        
        default:
          throw new Error(`Unknown calculator type: ${type}`);
      }
    } catch (error) {
      console.error(`Calculator ${type} failed:`, error);
      return { error: error.message, type };
    }
  }

  static getAvailableCalculators() {
    return Object.keys(this.calculators);
  }

  static getCalculatorInfo(type) {
    const info = {
      carbon: {
        name: 'Carbon Footprint Calculator',
        description: 'Calculate Scope 1, 2, 3 emissions with recommendations',
        inputs: ['scope1', 'scope2', 'scope3'],
        outputs: ['totalEmissions', 'breakdown', 'recommendations']
      },
      water: {
        name: 'Water Stress Calculator',
        description: 'Assess water stress levels and efficiency metrics',
        inputs: ['consumption', 'location', 'quality', 'efficiency'],
        outputs: ['stressScore', 'riskAssessment', 'recommendations']
      },
      roi: {
        name: 'ESG ROI Calculator',
        description: 'Calculate return on investment for ESG initiatives',
        inputs: ['investments', 'benefits', 'risks', 'timeframe'],
        outputs: ['totalROI', 'paybackPeriod', 'netPresentValue']
      },
      intensity: {
        name: 'Emission Intensity Calculator',
        description: 'Calculate emission intensity metrics and benchmarks',
        inputs: ['emissions', 'businessMetrics', 'industry'],
        outputs: ['intensityMetrics', 'benchmarks', 'trends']
      }
    };

    return info[type] || null;
  }
}

export default CalculatorManager;