// Air Quality & Pollution Control Module
export class AirPollutionControl {
  static pollutants = {
    criteria: ['PM2.5', 'PM10', 'SO2', 'NOx', 'CO', 'O3'],
    hazardous: ['VOCs', 'HAPs', 'Mercury', 'Lead'],
    greenhouse: ['CO2', 'CH4', 'N2O', 'HFCs']
  };

  static monitorAirQuality(emissionData, equipmentData) {
    try {
      const emissions = this.calculateEmissions(emissionData);
      const compliance = this.checkCompliance(emissionData);
      const equipment = this.assessEquipment(equipmentData);
      
      return {
        emissions,
        compliance,
        equipment,
        airQualityIndex: this.calculateAQI(emissionData),
        controlEfficiency: this.calculateControlEfficiency(emissionData, equipmentData),
        alerts: this.generateAlerts(emissionData, compliance)
      };
    } catch (error) {
      console.error('Air quality monitoring failed:', error);
      return this.getDefaultAirQuality();
    }
  }

  static calculateEmissions(data) {
    const result = {};
    Object.entries(this.pollutants).forEach(([category, pollutants]) => {
      result[category] = {};
      pollutants.forEach(pollutant => {
        result[category][pollutant] = {
          measured: data[pollutant] || 0,
          limit: this.getEmissionLimit(pollutant),
          unit: this.getUnit(pollutant)
        };
      });
    });
    return result;
  }

  static checkCompliance(data) {
    const violations = [];
    Object.values(this.pollutants).flat().forEach(pollutant => {
      const measured = data[pollutant] || 0;
      const limit = this.getEmissionLimit(pollutant);
      if (measured > limit) {
        violations.push({
          pollutant,
          measured,
          limit,
          exceedance: ((measured - limit) / limit * 100).toFixed(1)
        });
      }
    });
    return { compliant: violations.length === 0, violations };
  }

  static assessEquipment(equipmentData) {
    const equipment = equipmentData || [];
    return equipment.map(item => ({
      id: item.id,
      type: item.type,
      efficiency: item.efficiency || 0,
      lastMaintenance: item.lastMaintenance,
      nextMaintenance: item.nextMaintenance,
      status: this.getEquipmentStatus(item)
    }));
  }

  static calculateAQI(data) {
    const pm25 = data['PM2.5'] || 0;
    const pm10 = data['PM10'] || 0;
    const so2 = data['SO2'] || 0;
    const nox = data['NOx'] || 0;
    
    // Simplified AQI calculation
    const aqi = Math.max(
      this.pollutantToAQI(pm25, 'PM2.5'),
      this.pollutantToAQI(pm10, 'PM10'),
      this.pollutantToAQI(so2, 'SO2'),
      this.pollutantToAQI(nox, 'NOx')
    );
    
    return {
      value: Math.round(aqi),
      category: this.getAQICategory(aqi),
      primaryPollutant: this.getPrimaryPollutant(data)
    };
  }

  static calculateControlEfficiency(emissionData, equipmentData) {
    const equipment = equipmentData || [];
    const totalEfficiency = equipment.reduce((sum, item) => sum + (item.efficiency || 0), 0);
    return equipment.length > 0 ? totalEfficiency / equipment.length : 0;
  }

  static generateAlerts(emissionData, compliance) {
    const alerts = [];
    
    if (!compliance.compliant) {
      alerts.push({
        type: 'violation',
        severity: 'high',
        message: `${compliance.violations.length} emission limit violations detected`
      });
    }
    
    // Check for trending issues
    Object.values(this.pollutants).flat().forEach(pollutant => {
      const level = emissionData[pollutant] || 0;
      const limit = this.getEmissionLimit(pollutant);
      if (level > limit * 0.8) {
        alerts.push({
          type: 'warning',
          severity: 'medium',
          message: `${pollutant} approaching emission limit (${(level/limit*100).toFixed(1)}%)`
        });
      }
    });
    
    return alerts;
  }

  static getEmissionLimit(pollutant) {
    const limits = {
      'PM2.5': 15, 'PM10': 50, 'SO2': 75, 'NOx': 100,
      'CO': 10000, 'O3': 120, 'VOCs': 250, 'HAPs': 10
    };
    return limits[pollutant] || 100;
  }

  static getUnit(pollutant) {
    const units = {
      'PM2.5': 'μg/m³', 'PM10': 'μg/m³', 'SO2': 'μg/m³', 'NOx': 'μg/m³',
      'CO': 'mg/m³', 'O3': 'μg/m³', 'VOCs': 'μg/m³', 'HAPs': 'μg/m³'
    };
    return units[pollutant] || 'μg/m³';
  }

  static pollutantToAQI(concentration, pollutant) {
    // Simplified AQI conversion
    const breakpoints = {
      'PM2.5': [[0,12,0,50], [12.1,35.4,51,100], [35.5,55.4,101,150]],
      'PM10': [[0,54,0,50], [55,154,51,100], [155,254,101,150]],
      'SO2': [[0,35,0,50], [36,75,51,100], [76,185,101,150]],
      'NOx': [[0,53,0,50], [54,100,51,100], [101,360,101,150]]
    };
    
    const bp = breakpoints[pollutant] || [[0,100,0,100]];
    for (let i = 0; i < bp.length; i++) {
      if (concentration <= bp[i][1]) {
        return ((bp[i][3] - bp[i][2]) / (bp[i][1] - bp[i][0])) * (concentration - bp[i][0]) + bp[i][2];
      }
    }
    return 150;
  }

  static getAQICategory(aqi) {
    if (aqi <= 50) return 'Good';
    if (aqi <= 100) return 'Moderate';
    if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
    return 'Unhealthy';
  }

  static getPrimaryPollutant(data) {
    let maxAQI = 0;
    let primary = 'PM2.5';
    
    ['PM2.5', 'PM10', 'SO2', 'NOx'].forEach(pollutant => {
      const aqi = this.pollutantToAQI(data[pollutant] || 0, pollutant);
      if (aqi > maxAQI) {
        maxAQI = aqi;
        primary = pollutant;
      }
    });
    
    return primary;
  }

  static getEquipmentStatus(equipment) {
    const now = new Date();
    const nextMaintenance = new Date(equipment.nextMaintenance);
    const daysDiff = (nextMaintenance - now) / (1000 * 60 * 60 * 24);
    
    if (daysDiff < 0) return 'overdue';
    if (daysDiff < 7) return 'due_soon';
    if (equipment.efficiency < 80) return 'low_efficiency';
    return 'operational';
  }

  static getDefaultAirQuality() {
    return {
      emissions: {},
      compliance: { compliant: false, violations: [] },
      equipment: [],
      airQualityIndex: { value: 0, category: 'Unknown', primaryPollutant: 'N/A' },
      controlEfficiency: 0,
      alerts: [{ type: 'info', severity: 'low', message: 'No air quality data available' }]
    };
  }
}

export default AirPollutionControl;