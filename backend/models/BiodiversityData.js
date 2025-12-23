import { DataTypes } from 'sequelize';

const BiodiversityData = (sequelize) => sequelize.define('biodiversity_data', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  companyId: { type: DataTypes.INTEGER, allowNull: false },
  siteId: { type: DataTypes.STRING, allowNull: false },
  habitatType: { type: DataTypes.STRING, allowNull: false },
  areaSize: { type: DataTypes.FLOAT, allowNull: false },
  speciesCount: { type: DataTypes.INTEGER, defaultValue: 0 },
  conservationStatus: { type: DataTypes.STRING },
  landUseType: { type: DataTypes.STRING, allowNull: false },
  protectionLevel: { type: DataTypes.STRING },
  assessmentDate: { type: DataTypes.DATE, allowNull: false },
  riskLevel: { type: DataTypes.STRING, defaultValue: 'low' },
  createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  indexes: [
    { fields: ['companyId'] },
    { fields: ['habitatType'] },
    { fields: ['assessmentDate'] }
  ]
});

export default BiodiversityData;