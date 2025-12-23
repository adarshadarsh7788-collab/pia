// Advanced ESG Data Validation with Cross-field, Thresholds, and GRI Completeness

export const VALIDATION_THRESHOLDS = {
  environmental: {
    scope1Emissions: { min: 0, max: 1000000, warning: 500000 },
    scope2Emissions: { min: 0, max: 1000000, warning: 500000 },
    scope3Emissions: { min: 0, max: 5000000, warning: 2000000 },
    energyConsumption: { min: 0, max: 10000000, warning: 5000000 },
    waterWithdrawal: { min: 0, max: 10000000, warning: 5000000 },
    wasteGenerated: { min: 0, max: 100000, warning: 50000 }
  },
  social: {
    totalEmployees: { min: 1, max: 1000000, warning: 10000 },
    femaleEmployeesPercentage: { min: 0, max: 100, warning: { low: 20, high: 80 } },
    lostTimeInjuryRate: { min: 0, max: 100, warning: 5 },
    fatalityRate: { min: 0, max: 10, critical: 1 },
    employeeTurnoverRate: { min: 0, max: 100, warning: 30 }
  },
  governance: {
    boardSize: { min: 3, max: 30, warning: { low: 5, high: 20 } },
    independentDirectorsPercentage: { min: 0, max: 100, warning: { low: 33 } },
    femaleDirectorsPercentage: { min: 0, max: 100, warning: { low: 30 } },
    corruptionIncidents: { min: 0, max: 1000, critical: 1 }
  }
};

export const GRI_COMPLETENESS_REQUIREMENTS = {
  'GRI-102': {
    required: ['companyName', 'sector', 'region', 'reportingYear'],
    recommended: ['boardSize', 'independentDirectorsPercentage']
  },
  'GRI-302': {
    required: ['energyConsumption'],
    recommended: ['renewableEnergyPercentage']
  },
  'GRI-303': {
    required: ['waterWithdrawal'],
    recommended: ['waterDischarge']
  },
  'GRI-305': {
    required: ['scope1Emissions', 'scope2Emissions'],
    recommended: ['scope3Emissions']
  },
  'GRI-306': {
    required: ['wasteGenerated'],
    recommended: []
  },
  'GRI-403': {
    required: ['lostTimeInjuryRate'],
    recommended: ['fatalityRate', 'safetyTrainingHours']
  },
  'GRI-405': {
    required: ['femaleEmployeesPercentage'],
    recommended: ['femaleDirectorsPercentage']
  }
};

export const validateCrossField = (data) => {
  const errors = [];
  const warnings = [];

  // Environmental cross-field validations
  if (data.environmental) {
    const { scope1Emissions, scope2Emissions, scope3Emissions, energyConsumption, renewableEnergyPercentage } = data.environmental;

    // Total emissions should be reasonable
    const totalEmissions = (parseFloat(scope1Emissions) || 0) + (parseFloat(scope2Emissions) || 0) + (parseFloat(scope3Emissions) || 0);
    if (totalEmissions > 0 && scope3Emissions && parseFloat(scope3Emissions) > totalEmissions * 10) {
      warnings.push({
        field: 'scope3Emissions',
        message: 'Scope 3 emissions seem unusually high compared to Scope 1+2',
        severity: 'warning'
      });
    }

    // Renewable energy percentage validation
    if (renewableEnergyPercentage && parseFloat(renewableEnergyPercentage) > 100) {
      errors.push({
        field: 'renewableEnergyPercentage',
        message: 'Renewable energy percentage cannot exceed 100%',
        severity: 'error'
      });
    }

    // Energy and emissions correlation
    if (energyConsumption && scope2Emissions) {
      const ratio = parseFloat(scope2Emissions) / parseFloat(energyConsumption);
      if (ratio > 1) {
        warnings.push({
          field: 'scope2Emissions',
          message: 'Scope 2 emissions to energy ratio seems high. Verify emission factors.',
          severity: 'warning'
        });
      }
    }
  }

  // Social cross-field validations
  if (data.social) {
    const { totalEmployees, femaleEmployeesPercentage, lostTimeInjuryRate, fatalityRate } = data.social;

    // Female percentage validation
    if (femaleEmployeesPercentage && (parseFloat(femaleEmployeesPercentage) < 0 || parseFloat(femaleEmployeesPercentage) > 100)) {
      errors.push({
        field: 'femaleEmployeesPercentage',
        message: 'Female employees percentage must be between 0 and 100',
        severity: 'error'
      });
    }

    // Fatality rate critical check
    if (fatalityRate && parseFloat(fatalityRate) > 0) {
      errors.push({
        field: 'fatalityRate',
        message: 'Fatality incidents detected. Immediate review required.',
        severity: 'critical'
      });
    }

    // Injury rate reasonableness
    if (lostTimeInjuryRate && parseFloat(lostTimeInjuryRate) > 20) {
      warnings.push({
        field: 'lostTimeInjuryRate',
        message: 'Lost time injury rate is very high. Review safety protocols.',
        severity: 'warning'
      });
    }
  }

  // Governance cross-field validations
  if (data.governance) {
    const { boardSize, independentDirectorsPercentage, femaleDirectorsPercentage, corruptionIncidents } = data.governance;

    // Board composition validation
    if (boardSize && independentDirectorsPercentage) {
      const independentCount = Math.round((parseFloat(boardSize) * parseFloat(independentDirectorsPercentage)) / 100);
      if (independentCount < 2) {
        warnings.push({
          field: 'independentDirectorsPercentage',
          message: 'Board should have at least 2 independent directors',
          severity: 'warning'
        });
      }
    }

    // Female directors validation
    if (femaleDirectorsPercentage && parseFloat(femaleDirectorsPercentage) < 20) {
      warnings.push({
        field: 'femaleDirectorsPercentage',
        message: 'Board gender diversity below recommended 30% threshold',
        severity: 'info'
      });
    }

    // Corruption incidents
    if (corruptionIncidents && parseFloat(corruptionIncidents) > 0) {
      errors.push({
        field: 'corruptionIncidents',
        message: 'Corruption incidents reported. Requires immediate action and disclosure.',
        severity: 'critical'
      });
    }
  }

  return { errors, warnings, isValid: errors.length === 0 };
};

export const validateThresholds = (data) => {
  const alerts = [];

  Object.keys(data).forEach(category => {
    if (VALIDATION_THRESHOLDS[category]) {
      Object.keys(data[category]).forEach(field => {
        const value = parseFloat(data[category][field]);
        const threshold = VALIDATION_THRESHOLDS[category][field];

        if (!threshold || isNaN(value)) return;

        // Check min/max bounds
        if (value < threshold.min) {
          alerts.push({
            field: `${category}.${field}`,
            message: `Value ${value} is below minimum threshold ${threshold.min}`,
            severity: 'error',
            type: 'threshold'
          });
        }

        if (value > threshold.max) {
          alerts.push({
            field: `${category}.${field}`,
            message: `Value ${value} exceeds maximum threshold ${threshold.max}`,
            severity: 'error',
            type: 'threshold'
          });
        }

        // Check warning thresholds
        if (threshold.warning) {
          if (typeof threshold.warning === 'number' && value > threshold.warning) {
            alerts.push({
              field: `${category}.${field}`,
              message: `Value ${value} exceeds warning threshold ${threshold.warning}`,
              severity: 'warning',
              type: 'threshold'
            });
          } else if (typeof threshold.warning === 'object') {
            if (threshold.warning.low && value < threshold.warning.low) {
              alerts.push({
                field: `${category}.${field}`,
                message: `Value ${value} is below recommended threshold ${threshold.warning.low}`,
                severity: 'warning',
                type: 'threshold'
              });
            }
            if (threshold.warning.high && value > threshold.warning.high) {
              alerts.push({
                field: `${category}.${field}`,
                message: `Value ${value} exceeds recommended threshold ${threshold.warning.high}`,
                severity: 'warning',
                type: 'threshold'
              });
            }
          }
        }

        // Check critical thresholds
        if (threshold.critical && value >= threshold.critical) {
          alerts.push({
            field: `${category}.${field}`,
            message: `CRITICAL: Value ${value} requires immediate attention`,
            severity: 'critical',
            type: 'threshold'
          });
        }
      });
    }
  });

  return alerts;
};

export const checkGRICompleteness = (data) => {
  const completeness = {};
  let totalRequired = 0;
  let totalFilled = 0;
  let totalRecommended = 0;
  let totalRecommendedFilled = 0;

  Object.keys(GRI_COMPLETENESS_REQUIREMENTS).forEach(standard => {
    const requirements = GRI_COMPLETENESS_REQUIREMENTS[standard];
    const requiredFields = requirements.required || [];
    const recommendedFields = requirements.recommended || [];

    let filledRequired = 0;
    let filledRecommended = 0;

    // Check required fields
    requiredFields.forEach(field => {
      totalRequired++;
      const value = getNestedValue(data, field);
      if (value !== null && value !== undefined && value !== '') {
        filledRequired++;
        totalFilled++;
      }
    });

    // Check recommended fields
    recommendedFields.forEach(field => {
      totalRecommended++;
      const value = getNestedValue(data, field);
      if (value !== null && value !== undefined && value !== '') {
        filledRecommended++;
        totalRecommendedFilled++;
      }
    });

    completeness[standard] = {
      required: {
        total: requiredFields.length,
        filled: filledRequired,
        percentage: requiredFields.length > 0 ? Math.round((filledRequired / requiredFields.length) * 100) : 100
      },
      recommended: {
        total: recommendedFields.length,
        filled: filledRecommended,
        percentage: recommendedFields.length > 0 ? Math.round((filledRecommended / recommendedFields.length) * 100) : 100
      },
      overall: Math.round(((filledRequired + filledRecommended) / (requiredFields.length + recommendedFields.length)) * 100)
    };
  });

  const overallCompleteness = {
    required: totalRequired > 0 ? Math.round((totalFilled / totalRequired) * 100) : 100,
    recommended: totalRecommended > 0 ? Math.round((totalRecommendedFilled / totalRecommended) * 100) : 100,
    overall: Math.round(((totalFilled + totalRecommendedFilled) / (totalRequired + totalRecommended)) * 100)
  };

  return { completeness, overallCompleteness };
};

const getNestedValue = (obj, path) => {
  const keys = path.split('.');
  let value = obj;
  for (const key of keys) {
    if (value && typeof value === 'object') {
      value = value[key];
    } else {
      return null;
    }
  }
  return value;
};

export const performFullValidation = (data) => {
  const crossFieldResults = validateCrossField(data);
  const thresholdAlerts = validateThresholds(data);
  const griCompleteness = checkGRICompleteness(data);

  return {
    crossField: crossFieldResults,
    thresholds: thresholdAlerts,
    griCompleteness: griCompleteness,
    summary: {
      totalErrors: crossFieldResults.errors.length + thresholdAlerts.filter(a => a.severity === 'error').length,
      totalWarnings: crossFieldResults.warnings.length + thresholdAlerts.filter(a => a.severity === 'warning').length,
      totalCritical: thresholdAlerts.filter(a => a.severity === 'critical').length,
      griCompletenessScore: griCompleteness.overallCompleteness.overall,
      isValid: crossFieldResults.isValid && thresholdAlerts.filter(a => a.severity === 'error').length === 0
    }
  };
};
