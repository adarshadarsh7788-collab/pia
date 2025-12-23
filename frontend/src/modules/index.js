// ESG Modules Index - Complete Module Exports
import { WasteManagement } from './environmental/WasteManagement';
import { AirPollutionControl } from './environmental/AirPollutionControl';
import { BiodiversityLandUse } from './environmental/BiodiversityLandUse';
import { HumanRightsLabor } from './social/HumanRightsLabor';
import { CommunityEngagement } from './social/CommunityEngagement';
import { WorkforceManagement } from './social/WorkforceManagement';
import { HealthSafety } from './social/HealthSafety';
import { EthicsAntiCorruption } from './governance/EthicsAntiCorruption';
import { DataPrivacyCybersecurity } from './governance/DataPrivacyCybersecurity';
import { BoardLeadership } from './governance/BoardLeadership';
import { AIInsights } from './advanced/AIInsights';
import { ExternalPortals } from './advanced/ExternalPortals';

// Import reporting modules
import { GlobalFrameworks } from './reporting/GlobalFrameworks';
import { ExternalAuditorPortal } from './reporting/ExternalAuditorPortal';

// Import analytics modules
import { StakeholderSentimentAnalysis } from './analytics/StakeholderSentimentAnalysis';

// Re-export modules
export { WasteManagement, AirPollutionControl, BiodiversityLandUse, HumanRightsLabor, CommunityEngagement, WorkforceManagement, HealthSafety, EthicsAntiCorruption, DataPrivacyCybersecurity, BoardLeadership, AIInsights, ExternalPortals, GlobalFrameworks, ExternalAuditorPortal, StakeholderSentimentAnalysis };

// Module Manager for centralized access
export class ESGModuleManager {
  static modules = {
    // Environmental
    wasteManagement: WasteManagement,
    airPollutionControl: AirPollutionControl,
    biodiversityLandUse: BiodiversityLandUse,
    
    // Social
    humanRightsLabor: HumanRightsLabor,
    communityEngagement: CommunityEngagement,
    workforceManagement: WorkforceManagement,
    healthSafety: HealthSafety,
    
    // Governance
    ethicsAntiCorruption: EthicsAntiCorruption,
    dataPrivacyCybersecurity: DataPrivacyCybersecurity,
    boardLeadership: BoardLeadership,
    
    // Advanced
    aiInsights: AIInsights,
    externalPortals: ExternalPortals,
    
    // Reporting
    globalFrameworks: GlobalFrameworks,
    externalAuditorPortal: ExternalAuditorPortal,
    
    // Analytics
    stakeholderSentimentAnalysis: StakeholderSentimentAnalysis
  };

  static getModule(moduleName) {
    return this.modules[moduleName];
  }

  static getAllModules() {
    return this.modules;
  }

  static getModulesByCategory(category) {
    const categoryModules = {
      environmental: ['wasteManagement', 'airPollutionControl', 'biodiversityLandUse'],
      social: ['humanRightsLabor', 'communityEngagement', 'workforceManagement', 'healthSafety'],
      governance: ['ethicsAntiCorruption', 'dataPrivacyCybersecurity', 'boardLeadership'],
      advanced: ['aiInsights', 'externalPortals'],
      reporting: ['globalFrameworks', 'externalAuditorPortal'],
      analytics: ['stakeholderSentimentAnalysis']
    };
    
    const moduleNames = categoryModules[category] || [];
    return moduleNames.reduce((result, name) => {
      result[name] = this.modules[name];
      return result;
    }, {});
  }

  static runModuleAssessment(moduleName, data) {
    const module = this.getModule(moduleName);
    if (!module) {
      throw new Error(`Module ${moduleName} not found`);
    }

    // Call the main assessment method based on module type
    const methodMap = {
      wasteManagement: 'calculateWasteMetrics',
      airPollutionControl: 'monitorAirQuality',
      biodiversityLandUse: 'assessBiodiversity',
      humanRightsLabor: 'assessHumanRights',
      communityEngagement: 'manageCommunityEngagement',
      workforceManagement: 'manageWorkforce',
      healthSafety: 'manageHealthSafety',
      ethicsAntiCorruption: 'manageEthicsCompliance',
      dataPrivacyCybersecurity: 'assessDataPrivacyCybersecurity',
      boardLeadership: 'assessBoardLeadership',
      aiInsights: 'generateAIInsights',
      externalPortals: 'manageExternalPortals',
      globalFrameworks: 'generateFrameworkReports',
      externalAuditorPortal: 'manageAuditorPortal',
      stakeholderSentimentAnalysis: 'analyzeSentiment'
    };

    const methodName = methodMap[moduleName];
    if (methodName && typeof module[methodName] === 'function') {
      return module[methodName](data);
    }

    throw new Error(`Assessment method not found for module ${moduleName}`);
  }

  static getModuleCapabilities() {
    return {
      environmental: {
        wasteManagement: {
          description: 'Comprehensive waste tracking, recycling rates, and vendor compliance',
          capabilities: ['hazardous_waste_tracking', 'recycling_analysis', 'vendor_compliance', 'disposal_methods']
        },
        airPollutionControl: {
          description: 'Air quality monitoring, emission tracking, and compliance management',
          capabilities: ['emission_monitoring', 'aqi_calculation', 'equipment_tracking', 'compliance_alerts']
        },
        biodiversityLandUse: {
          description: 'Biodiversity impact assessment and land use management',
          capabilities: ['habitat_assessment', 'species_tracking', 'conservation_monitoring', 'land_use_analysis']
        }
      },
      social: {
        humanRightsLabor: {
          description: 'Human rights risk assessment and labor practices monitoring',
          capabilities: ['risk_assessment', 'supplier_due_diligence', 'grievance_analysis', 'audit_tracking']
        },
        communityEngagement: {
          description: 'CSR project management and community impact measurement',
          capabilities: ['csr_tracking', 'stakeholder_engagement', 'impact_measurement', 'investment_analysis']
        },
        workforceManagement: {
          description: 'Comprehensive workforce diversity, retention, and performance management',
          capabilities: ['diversity_analysis', 'retention_tracking', 'pay_equity', 'training_effectiveness']
        },
        healthSafety: {
          description: 'Health and safety incident management and compliance tracking',
          capabilities: ['incident_analysis', 'safety_metrics', 'audit_management', 'emergency_preparedness']
        }
      },
      governance: {
        ethicsAntiCorruption: {
          description: 'Ethics compliance and anti-corruption program management',
          capabilities: ['policy_compliance', 'training_tracking', 'incident_analysis', 'risk_assessment']
        },
        dataPrivacyCybersecurity: {
          description: 'Data privacy compliance and cybersecurity posture assessment',
          capabilities: ['privacy_compliance', 'security_assessment', 'incident_management', 'risk_evaluation']
        },
        boardLeadership: {
          description: 'Board composition, diversity, and governance effectiveness assessment',
          capabilities: ['composition_analysis', 'diversity_assessment', 'performance_evaluation', 'compensation_analysis']
        }
      },
      advanced: {
        aiInsights: {
          description: 'AI-powered ESG gap analysis, maturity scoring, and predictive insights',
          capabilities: ['gap_analysis', 'maturity_scoring', 'predictive_alerts', 'automated_reporting']
        },
        externalPortals: {
          description: 'External stakeholder portal management for investors, suppliers, employees, and auditors',
          capabilities: ['investor_portal', 'supplier_portal', 'employee_portal', 'auditor_portal']
        }
      },
      reporting: {
        globalFrameworks: {
          description: 'Global ESG reporting frameworks compliance (GRI, SASB, TCFD, BRSR, EU CSRD)',
          capabilities: ['framework_mapping', 'compliance_assessment', 'gap_analysis', 'automated_reporting']
        },
        externalAuditorPortal: {
          description: 'External auditor access portal with verification and audit trail capabilities',
          capabilities: ['auditor_access', 'data_verification', 'evidence_repository', 'audit_trails']
        }
      },
      analytics: {
        stakeholderSentimentAnalysis: {
          description: 'AI-powered stakeholder sentiment analysis with multi-source tracking and trend analysis',
          capabilities: ['sentiment_classification', 'stakeholder_tracking', 'trend_analysis', 'social_media_monitoring', 'risk_identification']
        }
      }
    };
  }
}

export default ESGModuleManager;