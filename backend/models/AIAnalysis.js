import { DataTypes } from 'sequelize';

const AIAnalysis = (sequelize) => sequelize.define('ai_analysis', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  companyId: { type: DataTypes.INTEGER, allowNull: false },
  analysisType: { type: DataTypes.STRING, allowNull: false },
  maturityScore: { type: DataTypes.FLOAT, defaultValue: 0 },
  gapAnalysis: { type: DataTypes.JSON },
  recommendations: { type: DataTypes.JSON },
  predictiveAlerts: { type: DataTypes.JSON },
  riskAssessment: { type: DataTypes.JSON },
  benchmarkData: { type: DataTypes.JSON },
  confidenceLevel: { type: DataTypes.FLOAT, defaultValue: 0 },
  analysisDate: { type: DataTypes.DATE, allowNull: false },
  dataQualityScore: { type: DataTypes.FLOAT, defaultValue: 0 },
  modelVersion: { type: DataTypes.STRING },
  createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  indexes: [
    { fields: ['companyId'] },
    { fields: ['analysisType'] },
    { fields: ['analysisDate'] }
  ]
});

export default AIAnalysis;