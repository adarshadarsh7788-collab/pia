import { DataTypes } from 'sequelize';
import createSequelize from '../config/database.js';

const WasteData = (sequelize) => sequelize.define('waste_data', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  companyId: { type: DataTypes.INTEGER, allowNull: false },
  wasteType: { type: DataTypes.STRING, allowNull: false },
  quantity: { type: DataTypes.FLOAT, allowNull: false },
  unit: { type: DataTypes.STRING, allowNull: false },
  disposalMethod: { type: DataTypes.STRING, allowNull: false },
  recyclingRate: { type: DataTypes.FLOAT, defaultValue: 0 },
  vendorId: { type: DataTypes.STRING },
  reportingPeriod: { type: DataTypes.STRING, allowNull: false },
  isHazardous: { type: DataTypes.BOOLEAN, defaultValue: false },
  createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  indexes: [
    { fields: ['companyId'] },
    { fields: ['wasteType'] },
    { fields: ['reportingPeriod'] }
  ]
});

export default WasteData;