import { DataTypes } from 'sequelize';

const AirQualityData = (sequelize) => sequelize.define('air_quality_data', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  companyId: { type: DataTypes.INTEGER, allowNull: false },
  locationId: { type: DataTypes.STRING, allowNull: false },
  pollutantType: { type: DataTypes.STRING, allowNull: false },
  concentration: { type: DataTypes.FLOAT, allowNull: false },
  unit: { type: DataTypes.STRING, allowNull: false },
  aqi: { type: DataTypes.INTEGER },
  equipmentId: { type: DataTypes.STRING },
  measurementDate: { type: DataTypes.DATE, allowNull: false },
  complianceStatus: { type: DataTypes.STRING, defaultValue: 'compliant' },
  createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  indexes: [
    { fields: ['companyId'] },
    { fields: ['pollutantType'] },
    { fields: ['measurementDate'] }
  ]
});

export default AirQualityData;