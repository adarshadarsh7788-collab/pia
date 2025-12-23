import { DataTypes } from 'sequelize';

const SafetyIncidents = (sequelize) => sequelize.define('safety_incidents', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  companyId: { type: DataTypes.INTEGER, allowNull: false },
  incidentType: { type: DataTypes.STRING, allowNull: false },
  severity: { type: DataTypes.STRING, allowNull: false },
  location: { type: DataTypes.STRING, allowNull: false },
  incidentDate: { type: DataTypes.DATE, allowNull: false },
  description: { type: DataTypes.TEXT },
  injuryCount: { type: DataTypes.INTEGER, defaultValue: 0 },
  lostTimeHours: { type: DataTypes.FLOAT, defaultValue: 0 },
  rootCause: { type: DataTypes.TEXT },
  correctiveActions: { type: DataTypes.TEXT },
  status: { type: DataTypes.STRING, defaultValue: 'open' },
  reportedBy: { type: DataTypes.STRING },
  createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  indexes: [
    { fields: ['companyId'] },
    { fields: ['severity'] },
    { fields: ['incidentDate'] }
  ]
});

export default SafetyIncidents;