// ESG Data Validation Engine
export class DataValidation {
  static validationRules = {
    environmental: {
      energyConsumption: { min: 0, max: 1000000, unit: 'kWh', required: true },
      carbonEmissions: { min: 0, max: 100000, unit: 'T CO2e', required: true },
      waterUsage: { min: 0, max: 1000000, unit: 'm³', required: false },
      wasteGenerated: { min: 0, max: 10000, unit: 'tons', required: false },
      renewableEnergyRatio: { min: 0, max: 100, unit: '%', required: false }
    },
    social: {
      totalEmployees: { min: 1, max: 1000000, unit: 'count', required: true },
      femaleEmployeesPercentage: { min: 0, max: 100, unit: '%', required: false },
      trainingHours: { min: 0, max: 1000, unit: 'hours', required: false },
      communityInvestment: { min: 0, max: 10000000, unit: 'USD', required: false },
      employeeTurnover: { min: 0, max: 100, unit: '%', required: false }
    },
    governance: {
      boardSize: { min: 3, max: 20, unit: 'count', required: true },
      independentDirectors: { min: 0, max: 100, unit: '%', required: true },
      ethicsTraining: { min: 0, max: 100, unit: '%', required: false },
      dataBreaches: { min: 0, max: 1000, unit: 'count', required: false },
      regulatoryFines: { min: 0, max: 100000000, unit: 'USD', required: false }
    }
  };

  static validateESGData(data) {
    const results = {
      isValid: true,
      errors: [],
      warnings: [],
      suggestions: [],
      score: 100
    };

    if (!data || typeof data !== 'object') {
      results.isValid = false;
      results.errors.push('Invalid data format provided');
      results.score = 0;
      return results;
    }

    // Validate each category
    ['environmental', 'social', 'governance'].forEach(category => {
      if (data[category]) {
        const categoryResults = this.validateCategory(category, data[category]);
        results.errors.push(...categoryResults.errors);
        results.warnings.push(...categoryResults.warnings);
        results.suggestions.push(...categoryResults.suggestions);
        
        if (categoryResults.errors.length > 0) {
          results.isValid = false;
        }
      }
    });

    // Calculate validation score
    results.score = this.calculateValidationScore(results);
    
    // Add cross-category validations
    this.performCrossValidation(data, results);
    
    return results;
  }

  static validateCategory(category, categoryData) {
    const results = { errors: [], warnings: [], suggestions: [] };
    const rules = this.validationRules[category] || {};

    Object.entries(categoryData).forEach(([metric, value]) => {
      if (metric === 'description') return; // Skip description fields
      
      const rule = rules[metric];
      if (!rule) {
        results.warnings.push(`Unknown metric '${metric}' in ${category} category`);
        return;
      }

      // Required field validation
      if (rule.required && (value === null || value === undefined || value === '')) {
        results.errors.push(`${metric} is required in ${category} category`);
        return;
      }

      // Skip validation for empty optional fields
      if (!rule.required && (value === null || value === undefined || value === '')) {
        return;
      }

      // Numeric validation
      const numValue = parseFloat(value);
      if (isNaN(numValue)) {
        results.errors.push(`${metric} must be a valid number`);
        return;
      }

      // Range validation
      if (numValue < rule.min) {
        results.errors.push(`${metric} cannot be less than ${rule.min} ${rule.unit}`);
      }
      
      if (numValue > rule.max) {
        results.errors.push(`${metric} cannot exceed ${rule.max} ${rule.unit}`);
      }

      // Business logic validations
      this.performBusinessLogicValidation(category, metric, numValue, results);
    });

    return results;
  }

  static performBusinessLogicValidation(category, metric, value, results) {
    // Environmental validations
    if (category === 'environmental') {
      if (metric === 'renewableEnergyRatio' && value > 95) {
        results.warnings.push('Renewable energy ratio above 95% is exceptional - please verify');
      }
      
      if (metric === 'carbonEmissions' && value === 0) {
        results.warnings.push('Zero carbon emissions reported - please confirm accuracy');
      }
    }

    // Social validations
    if (category === 'social') {
      if (metric === 'femaleEmployeesPercentage' && (value < 10 || value > 90)) {
        results.warnings.push('Gender distribution appears imbalanced - consider diversity initiatives');
      }
      
      if (metric === 'employeeTurnover' && value > 30) {
        results.warnings.push('High employee turnover detected - may indicate retention issues');
      }
    }

    // Governance validations
    if (category === 'governance') {
      if (metric === 'independentDirectors' && value < 30) {
        results.warnings.push('Low board independence - consider increasing independent directors');
      }
      
      if (metric === 'dataBreaches' && value > 0) {
        results.warnings.push('Data breaches reported - ensure proper cybersecurity measures');
      }
    }
  }

  static performCrossValidation(data, results) {
    // Cross-category consistency checks
    const env = data.environmental || {};
    const social = data.social || {};
    const gov = data.governance || {};

    // Energy vs Emissions consistency
    if (env.energyConsumption && env.carbonEmissions) {
      const emissionRatio = env.carbonEmissions / env.energyConsumption;
      if (emissionRatio > 1) {
        results.warnings.push('Carbon emissions seem high relative to energy consumption');
      }
    }

    // Company size consistency
    if (social.totalEmployees && gov.boardSize) {
      if (social.totalEmployees < 50 && gov.boardSize > 10) {
        results.warnings.push('Board size appears large for company size');
      }
    }

    // Investment vs Revenue consistency
    if (social.communityInvestment && data.totalRevenue) {
      const investmentRatio = (social.communityInvestment / data.totalRevenue) * 100;
      if (investmentRatio > 10) {
        results.warnings.push('Community investment ratio is exceptionally high');
      }
    }
  }

  static calculateValidationScore(results) {
    let score = 100;
    
    // Deduct points for errors and warnings
    score -= results.errors.length * 20;
    score -= results.warnings.length * 5;
    
    return Math.max(0, score);
  }

  static validateDataCompleteness(data) {
    const completeness = {
      environmental: 0,
      social: 0,
      governance: 0,
      overall: 0
    };

    ['environmental', 'social', 'governance'].forEach(category => {
      const categoryData = data[category] || {};
      const rules = this.validationRules[category] || {};
      const totalFields = Object.keys(rules).length;
      const filledFields = Object.keys(categoryData).filter(key => 
        key !== 'description' && categoryData[key] !== null && categoryData[key] !== undefined && categoryData[key] !== ''
      ).length;
      
      completeness[category] = totalFields > 0 ? Math.round((filledFields / totalFields) * 100) : 0;
    });

    completeness.overall = Math.round(
      (completeness.environmental + completeness.social + completeness.governance) / 3
    );

    return completeness;
  }

  static generateValidationReport(data) {
    const validation = this.validateESGData(data);
    const completeness = this.validateDataCompleteness(data);
    
    return {
      timestamp: new Date().toISOString(),
      validationScore: validation.score,
      completenessScore: completeness.overall,
      status: validation.isValid ? 'passed' : 'failed',
      summary: {
        totalErrors: validation.errors.length,
        totalWarnings: validation.warnings.length,
        totalSuggestions: validation.suggestions.length
      },
      details: {
        errors: validation.errors,
        warnings: validation.warnings,
        suggestions: validation.suggestions,
        completeness
      },
      recommendations: this.generateRecommendations(validation, completeness)
    };
  }

  static generateRecommendations(validation, completeness) {
    const recommendations = [];

    // Completeness recommendations
    if (completeness.overall < 70) {
      recommendations.push({
        type: 'completeness',
        priority: 'high',
        message: 'Data completeness is below 70%. Consider filling missing fields for better ESG reporting.'
      });
    }

    // Error recommendations
    if (validation.errors.length > 0) {
      recommendations.push({
        type: 'validation',
        priority: 'critical',
        message: 'Critical validation errors found. Please address all errors before submission.'
      });
    }

    // Warning recommendations
    if (validation.warnings.length > 3) {
      recommendations.push({
        type: 'quality',
        priority: 'medium',
        message: 'Multiple data quality warnings detected. Review and verify data accuracy.'
      });
    }

    return recommendations;
  }

  static getValidationRulesForCategory(category) {
    return this.validationRules[category] || {};
  }

  static isValidMetric(category, metric) {
    return !!(this.validationRules[category] && this.validationRules[category][metric]);
  }
}

export default DataValidation;