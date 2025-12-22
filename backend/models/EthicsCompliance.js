import { DataTypes } from 'sequelize';

const EthicsCompliance = (sequelize) => sequelize.define('ethics_compliance', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  companyId: { type: DataTypes.INTEGER, allowNull: false },
  policyType: { type: DataTypes.STRING, allowNull: false },
  complianceStatus: { type: DataTypes.STRING, allowNull: false },
  trainingCompletion: { type: DataTypes.FLOAT, defaultValue: 0 },
  incidentCount: { type: DataTypes.INTEGER, defaultValue: 0 },
  auditDate: { type: DataTypes.DATE },
  auditScore: { type: DataTypes.FLOAT },
  riskLevel: { type: DataTypes.STRING, defaultValue: 'low' },
  mitigationPlan: { type: DataTypes.TEXT },
  nextReviewDate: { type: DataTypes.DATE },
  certificationStatus: { type: DataTypes.STRING },
  createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  indexes: [
    { fields: ['companyId'] },
    { fields: ['policyType'] },
    { fields: ['complianceStatus'] }
  ]
});

export default EthicsCompliance;