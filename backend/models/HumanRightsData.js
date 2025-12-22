import { DataTypes } from 'sequelize';

const HumanRightsData = (sequelize) => sequelize.define('human_rights_data', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  companyId: { type: DataTypes.INTEGER, allowNull: false },
  supplierId: { type: DataTypes.STRING },
  riskCategory: { type: DataTypes.STRING, allowNull: false },
  riskLevel: { type: DataTypes.STRING, allowNull: false },
  assessmentDate: { type: DataTypes.DATE, allowNull: false },
  mitigationActions: { type: DataTypes.TEXT },
  auditStatus: { type: DataTypes.STRING, defaultValue: 'pending' },
  grievanceCount: { type: DataTypes.INTEGER, defaultValue: 0 },
  complianceScore: { type: DataTypes.FLOAT, defaultValue: 0 },
  region: { type: DataTypes.STRING },
  createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  indexes: [
    { fields: ['companyId'] },
    { fields: ['riskLevel'] },
    { fields: ['assessmentDate'] }
  ]
});

export default HumanRightsData;