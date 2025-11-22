import { DataTypes } from 'sequelize';

const FrameworkCompliance = (sequelize) => sequelize.define('framework_compliance', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  companyId: { type: DataTypes.INTEGER, allowNull: false },
  frameworkType: { 
    type: DataTypes.ENUM('GRI', 'SASB', 'TCFD', 'BRSR', 'CDP', 'DJSI', 'MSCI', 'CUSTOM'), 
    allowNull: false 
  },
  frameworkVersion: { type: DataTypes.STRING, defaultValue: 'latest' },
  standardId: { type: DataTypes.STRING, allowNull: false },
  requirementId: { type: DataTypes.STRING, allowNull: false },
  requirementTitle: { type: DataTypes.STRING },
  materialityLevel: { 
    type: DataTypes.ENUM('HIGH', 'MEDIUM', 'LOW', 'NOT_APPLICABLE'), 
    defaultValue: 'MEDIUM' 
  },
  complianceStatus: { 
    type: DataTypes.ENUM('COMPLIANT', 'PARTIAL', 'NON_COMPLIANT', 'IN_PROGRESS', 'NOT_STARTED', 'NOT_APPLICABLE'), 
    allowNull: false 
  },
  complianceScore: { type: DataTypes.FLOAT, defaultValue: 0, validate: { min: 0, max: 100 } },
  dataQualityScore: { type: DataTypes.FLOAT, defaultValue: 0, validate: { min: 0, max: 100 } },
  completenessScore: { type: DataTypes.FLOAT, defaultValue: 0, validate: { min: 0, max: 100 } },
  evidenceProvided: { type: DataTypes.TEXT },
  evidenceType: { 
    type: DataTypes.ENUM('DOCUMENT', 'DATA', 'PROCESS', 'POLICY', 'CERTIFICATION', 'AUDIT'), 
    defaultValue: 'DOCUMENT' 
  },
  evidenceQuality: { 
    type: DataTypes.ENUM('EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'NONE'), 
    defaultValue: 'NONE' 
  },
  gapAnalysis: { type: DataTypes.TEXT },
  actionPlan: { type: DataTypes.TEXT },
  riskLevel: { 
    type: DataTypes.ENUM('CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'MINIMAL'), 
    defaultValue: 'MEDIUM' 
  },
  targetDate: { type: DataTypes.DATE },
  actualCompletionDate: { type: DataTypes.DATE },
  assessmentDate: { type: DataTypes.DATE, allowNull: false },
  nextReviewDate: { type: DataTypes.DATE },
  assessorId: { type: DataTypes.STRING },
  assessorName: { type: DataTypes.STRING },
  reportingPeriod: { type: DataTypes.STRING },
  reportingYear: { type: DataTypes.INTEGER },
  stakeholderRelevance: { 
    type: DataTypes.ENUM('VERY_HIGH', 'HIGH', 'MEDIUM', 'LOW', 'VERY_LOW'), 
    defaultValue: 'MEDIUM' 
  },
  businessImpact: { 
    type: DataTypes.ENUM('VERY_HIGH', 'HIGH', 'MEDIUM', 'LOW', 'VERY_LOW'), 
    defaultValue: 'MEDIUM' 
  },
  verificationStatus: { 
    type: DataTypes.ENUM('VERIFIED', 'SELF_ASSESSED', 'THIRD_PARTY', 'PENDING', 'NOT_VERIFIED'), 
    defaultValue: 'SELF_ASSESSED' 
  },
  improvementOpportunities: { type: DataTypes.TEXT },
  bestPractices: { type: DataTypes.TEXT },
  benchmarkData: { type: DataTypes.JSON },
  kpiMetrics: { type: DataTypes.JSON },
  attachments: { type: DataTypes.JSON },
  notes: { type: DataTypes.TEXT },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  indexes: [
    { fields: ['companyId'] },
    { fields: ['frameworkType'] },
    { fields: ['complianceStatus'] },
    { fields: ['materialityLevel'] },
    { fields: ['reportingYear'] },
    { fields: ['verificationStatus'] },
    { fields: ['isActive'] },
    { fields: ['companyId', 'frameworkType', 'reportingYear'] },
    { fields: ['frameworkType', 'complianceStatus'] }
  ]
});

export default FrameworkCompliance;