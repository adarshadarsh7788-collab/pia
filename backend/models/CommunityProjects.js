import { DataTypes } from 'sequelize';

const CommunityProjects = (sequelize) => sequelize.define('community_projects', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  companyId: { type: DataTypes.INTEGER, allowNull: false },
  projectName: { type: DataTypes.STRING, allowNull: false },
  projectType: { type: DataTypes.STRING, allowNull: false },
  investmentAmount: { type: DataTypes.FLOAT, allowNull: false },
  beneficiaries: { type: DataTypes.INTEGER, defaultValue: 0 },
  location: { type: DataTypes.STRING, allowNull: false },
  startDate: { type: DataTypes.DATE, allowNull: false },
  endDate: { type: DataTypes.DATE },
  status: { type: DataTypes.STRING, defaultValue: 'active' },
  impactMetrics: { type: DataTypes.JSON },
  stakeholderFeedback: { type: DataTypes.TEXT },
  createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  indexes: [
    { fields: ['companyId'] },
    { fields: ['projectType'] },
    { fields: ['status'] }
  ]
});

export default CommunityProjects;