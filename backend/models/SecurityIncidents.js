import { DataTypes } from 'sequelize';

const SecurityIncidents = (sequelize) => sequelize.define('security_incidents', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  companyId: { type: DataTypes.INTEGER, allowNull: false },
  incidentType: { type: DataTypes.STRING, allowNull: false },
  severity: { type: DataTypes.STRING, allowNull: false },
  affectedSystems: { type: DataTypes.TEXT },
  dataCompromised: { type: DataTypes.BOOLEAN, defaultValue: false },
  recordsAffected: { type: DataTypes.INTEGER, defaultValue: 0 },
  incidentDate: { type: DataTypes.DATE, allowNull: false },
  detectionDate: { type: DataTypes.DATE },
  resolutionDate: { type: DataTypes.DATE },
  rootCause: { type: DataTypes.TEXT },
  responseActions: { type: DataTypes.TEXT },
  status: { type: DataTypes.STRING, defaultValue: 'investigating' },
  complianceImpact: { type: DataTypes.STRING },
  createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  indexes: [
    { fields: ['companyId'] },
    { fields: ['severity'] },
    { fields: ['incidentDate'] }
  ]
});

export default SecurityIncidents;