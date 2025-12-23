import { DataTypes } from 'sequelize';

const SentimentData = (sequelize) => sequelize.define('sentiment_data', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  companyId: { type: DataTypes.INTEGER, allowNull: false },
  stakeholderType: { type: DataTypes.STRING, allowNull: false },
  sourceType: { type: DataTypes.STRING, allowNull: false },
  content: { type: DataTypes.TEXT, allowNull: false },
  sentimentScore: { type: DataTypes.FLOAT, allowNull: false },
  sentimentLabel: { type: DataTypes.STRING, allowNull: false },
  confidenceLevel: { type: DataTypes.FLOAT, defaultValue: 0 },
  topics: { type: DataTypes.JSON },
  riskLevel: { type: DataTypes.STRING, defaultValue: 'low' },
  trendDirection: { type: DataTypes.STRING },
  sourceUrl: { type: DataTypes.STRING },
  collectionDate: { type: DataTypes.DATE, allowNull: false },
  processedDate: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  indexes: [
    { fields: ['companyId'] },
    { fields: ['stakeholderType'] },
    { fields: ['sentimentLabel'] },
    { fields: ['collectionDate'] }
  ]
});

export default SentimentData;