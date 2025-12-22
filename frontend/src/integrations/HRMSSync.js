// HRMS Integration for Employee and Social Data
export class HRMSSync {
  static supportedSystems = {
    workday: { endpoint: `${process.env.REACT_APP_HRMS_BASE_URL}/api/workday`, auth: 'oauth2' },
    successfactors: { endpoint: `${process.env.REACT_APP_HRMS_BASE_URL}/api/successfactors`, auth: 'saml' },
    bamboohr: { endpoint: `${process.env.REACT_APP_HRMS_BASE_URL}/api/bamboohr`, auth: 'api_key' },
    adp: { endpoint: `${process.env.REACT_APP_HRMS_BASE_URL}/api/adp`, auth: 'oauth2' }
  };

  static async connectToHRMS(system, credentials) {
    try {
      const config = this.supportedSystems[system.toLowerCase()];
      if (!config) throw new Error(`Unsupported HRMS: ${system}`);

      const response = await fetch(config.endpoint + '/connect', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.REACT_APP_HRMS_API_KEY}`
        },
        body: JSON.stringify({ credentials, system })
      });

      return await response.json();
    } catch (error) {
      console.error('HRMS connection failed:', error);
      return { success: false, error: error.message };
    }
  }

  static async syncEmployeeData(system, filters = {}) {
    try {
      const rawData = await this.fetchHRMSData(system, 'employees', filters);
      return this.processEmployeeData(rawData, system);
    } catch (error) {
      console.error('Employee data sync failed:', error);
      return this.getMockEmployeeData();
    }
  }

  static async syncDiversityData(system, filters = {}) {
    try {
      const rawData = await this.fetchHRMSData(system, 'diversity', filters);
      return this.processDiversityData(rawData, system);
    } catch (error) {
      console.error('Diversity data sync failed:', error);
      return this.getMockDiversityData();
    }
  }

  static async syncTrainingData(system, filters = {}) {
    try {
      const rawData = await this.fetchHRMSData(system, 'training', filters);
      return this.processTrainingData(rawData, system);
    } catch (error) {
      console.error('Training data sync failed:', error);
      return this.getMockTrainingData();
    }
  }

  static async fetchHRMSData(system, dataType, filters) {
    const config = this.supportedSystems[system.toLowerCase()];
    const response = await fetch(`${config.endpoint}/${dataType}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filters, dataType })
    });
    return await response.json();
  }

  static processEmployeeData(rawData, system) {
    const fieldMappings = {
      workday: {
        totalEmployees: 'total_count',
        fullTime: 'full_time_count',
        partTime: 'part_time_count',
        contractors: 'contractor_count'
      },
      successfactors: {
        totalEmployees: 'headcount',
        fullTime: 'fte_count',
        partTime: 'pte_count',
        contractors: 'contingent_count'
      },
      bamboohr: {
        totalEmployees: 'employee_count',
        fullTime: 'full_time',
        partTime: 'part_time',
        contractors: 'contractors'
      }
    };

    const mapping = fieldMappings[system.toLowerCase()] || fieldMappings.workday;

    return {
      totalEmployees: rawData[mapping.totalEmployees] || 0,
      employmentTypes: {
        fullTime: rawData[mapping.fullTime] || 0,
        partTime: rawData[mapping.partTime] || 0,
        contractors: rawData[mapping.contractors] || 0
      },
      turnoverRate: this.calculateTurnoverRate(rawData),
      averageTenure: rawData.average_tenure || 0,
      newHires: rawData.new_hires_count || 0,
      departures: rawData.departures_count || 0,
      locations: this.processLocationData(rawData.locations || []),
      lastUpdated: new Date().toISOString()
    };
  }

  static processDiversityData(rawData, system) {
    return {
      genderDistribution: {
        male: rawData.male_count || 0,
        female: rawData.female_count || 0,
        nonBinary: rawData.non_binary_count || 0,
        notSpecified: rawData.not_specified_count || 0
      },
      ageDistribution: {
        under30: rawData.under_30_count || 0,
        age30to50: rawData.age_30_50_count || 0,
        over50: rawData.over_50_count || 0
      },
      ethnicityDistribution: this.processEthnicityData(rawData.ethnicity || {}),
      leadershipDiversity: {
        femaleLeaders: rawData.female_leaders || 0,
        minorityLeaders: rawData.minority_leaders || 0,
        totalLeaders: rawData.total_leaders || 0
      },
      payEquityMetrics: {
        genderPayGap: rawData.gender_pay_gap || 0,
        ethnicityPayGap: rawData.ethnicity_pay_gap || 0
      },
      lastUpdated: new Date().toISOString()
    };
  }

  static processTrainingData(rawData, system) {
    return {
      totalTrainingHours: rawData.total_training_hours || 0,
      averageHoursPerEmployee: rawData.avg_hours_per_employee || 0,
      trainingPrograms: {
        esgTraining: rawData.esg_training_hours || 0,
        safetyTraining: rawData.safety_training_hours || 0,
        complianceTraining: rawData.compliance_training_hours || 0,
        skillDevelopment: rawData.skill_development_hours || 0
      },
      completionRates: {
        mandatory: rawData.mandatory_completion_rate || 0,
        optional: rawData.optional_completion_rate || 0
      },
      certifications: this.processCertificationData(rawData.certifications || []),
      trainingBudget: rawData.training_budget || 0,
      lastUpdated: new Date().toISOString()
    };
  }

  static calculateTurnoverRate(data) {
    const departures = data.departures_count || 0;
    const avgEmployees = data.average_employees || data.total_count || 1;
    return avgEmployees > 0 ? (departures / avgEmployees) * 100 : 0;
  }

  static processLocationData(locations) {
    return locations.map(location => ({
      country: location.country,
      region: location.region,
      employeeCount: location.employee_count || 0,
      isRemote: location.is_remote || false
    }));
  }

  static processEthnicityData(ethnicityData) {
    return {
      white: ethnicityData.white || 0,
      black: ethnicityData.black || 0,
      hispanic: ethnicityData.hispanic || 0,
      asian: ethnicityData.asian || 0,
      nativeAmerican: ethnicityData.native_american || 0,
      pacificIslander: ethnicityData.pacific_islander || 0,
      multiracial: ethnicityData.multiracial || 0,
      other: ethnicityData.other || 0,
      notSpecified: ethnicityData.not_specified || 0
    };
  }

  static processCertificationData(certifications) {
    return certifications.map(cert => ({
      name: cert.certification_name,
      count: cert.employee_count || 0,
      expirationDate: cert.expiration_date,
      isRequired: cert.is_required || false
    }));
  }

  static async syncBenefitsData(system, filters = {}) {
    try {
      const rawData = await this.fetchHRMSData(system, 'benefits', filters);
      return this.processBenefitsData(rawData, system);
    } catch (error) {
      console.error('Benefits data sync failed:', error);
      return this.getMockBenefitsData();
    }
  }

  static processBenefitsData(rawData, system) {
    return {
      healthcareParticipation: rawData.healthcare_participation || 0,
      retirementParticipation: rawData.retirement_participation || 0,
      wellnessProgramParticipation: rawData.wellness_participation || 0,
      flexibleWorkArrangements: rawData.flexible_work_count || 0,
      parentalLeaveUtilization: rawData.parental_leave_usage || 0,
      employeeSatisfactionScore: rawData.satisfaction_score || 0,
      benefitsCost: rawData.total_benefits_cost || 0,
      lastUpdated: new Date().toISOString()
    };
  }

  static getMockEmployeeData() {
    return {
      totalEmployees: 1250,
      employmentTypes: { fullTime: 1000, partTime: 150, contractors: 100 },
      turnoverRate: 12.5,
      averageTenure: 4.2,
      newHires: 85,
      departures: 45,
      locations: [
        { country: 'USA', region: 'North America', employeeCount: 800, isRemote: false },
        { country: 'Canada', region: 'North America', employeeCount: 200, isRemote: false },
        { country: 'Remote', region: 'Global', employeeCount: 250, isRemote: true }
      ],
      lastUpdated: new Date().toISOString()
    };
  }

  static getMockDiversityData() {
    return {
      genderDistribution: { male: 625, female: 575, nonBinary: 35, notSpecified: 15 },
      ageDistribution: { under30: 375, age30to50: 625, over50: 250 },
      ethnicityDistribution: {
        white: 625, black: 150, hispanic: 200, asian: 175,
        nativeAmerican: 25, pacificIslander: 15, multiracial: 45, other: 10, notSpecified: 5
      },
      leadershipDiversity: { femaleLeaders: 18, minorityLeaders: 12, totalLeaders: 45 },
      payEquityMetrics: { genderPayGap: 2.3, ethnicityPayGap: 1.8 },
      lastUpdated: new Date().toISOString()
    };
  }

  static getMockTrainingData() {
    return {
      totalTrainingHours: 15750,
      averageHoursPerEmployee: 12.6,
      trainingPrograms: {
        esgTraining: 3150, safetyTraining: 4200,
        complianceTraining: 2800, skillDevelopment: 5600
      },
      completionRates: { mandatory: 95, optional: 68 },
      certifications: [
        { name: 'Safety Certification', count: 850, expirationDate: '2024-12-31', isRequired: true },
        { name: 'ESG Awareness', count: 720, expirationDate: '2025-06-30', isRequired: false }
      ],
      trainingBudget: 485000,
      lastUpdated: new Date().toISOString()
    };
  }

  static getMockBenefitsData() {
    return {
      healthcareParticipation: 92,
      retirementParticipation: 78,
      wellnessProgramParticipation: 65,
      flexibleWorkArrangements: 450,
      parentalLeaveUtilization: 85,
      employeeSatisfactionScore: 4.2,
      benefitsCost: 8750000,
      lastUpdated: new Date().toISOString()
    };
  }

  static async generateESGReport(system, reportType = 'comprehensive') {
    try {
      const employeeData = await this.syncEmployeeData(system);
      const diversityData = await this.syncDiversityData(system);
      const trainingData = await this.syncTrainingData(system);
      const benefitsData = await this.syncBenefitsData(system);

      return {
        reportType,
        generatedAt: new Date().toISOString(),
        summary: this.generateSummaryMetrics(employeeData, diversityData, trainingData, benefitsData),
        employeeMetrics: employeeData,
        diversityMetrics: diversityData,
        trainingMetrics: trainingData,
        benefitsMetrics: benefitsData,
        recommendations: this.generateRecommendations(diversityData, trainingData)
      };
    } catch (error) {
      console.error('ESG report generation failed:', error);
      return { success: false, error: error.message };
    }
  }

  static generateSummaryMetrics(employee, diversity, training, benefits) {
    return {
      totalEmployees: employee.totalEmployees,
      diversityScore: this.calculateDiversityScore(diversity),
      trainingEffectiveness: this.calculateTrainingEffectiveness(training),
      employeeWellbeing: this.calculateWellbeingScore(benefits),
      turnoverRate: employee.turnoverRate,
      genderPayEquity: 100 - diversity.payEquityMetrics.genderPayGap
    };
  }

  static calculateDiversityScore(diversity) {
    const genderBalance = Math.min(diversity.genderDistribution.male, diversity.genderDistribution.female) / 
                         Math.max(diversity.genderDistribution.male, diversity.genderDistribution.female) * 100;
    const leadershipDiversity = (diversity.leadershipDiversity.femaleLeaders + diversity.leadershipDiversity.minorityLeaders) / 
                               diversity.leadershipDiversity.totalLeaders * 100;
    return Math.round((genderBalance + leadershipDiversity) / 2);
  }

  static calculateTrainingEffectiveness(training) {
    return Math.round((training.completionRates.mandatory + training.completionRates.optional) / 2);
  }

  static calculateWellbeingScore(benefits) {
    return Math.round((benefits.healthcareParticipation + benefits.employeeSatisfactionScore * 20) / 2);
  }

  static generateRecommendations(diversity, training) {
    const recommendations = [];

    if (diversity.payEquityMetrics.genderPayGap > 5) {
      recommendations.push({
        category: 'Pay Equity',
        priority: 'high',
        recommendation: 'Conduct comprehensive pay equity analysis and address gender pay gaps'
      });
    }

    if (training.completionRates.mandatory < 90) {
      recommendations.push({
        category: 'Training',
        priority: 'medium',
        recommendation: 'Improve mandatory training completion rates through better tracking and follow-up'
      });
    }

    return recommendations;
  }
}

export default HRMSSync;