import { DataTypes } from 'sequelize';

const AuditorSessions = (sequelize) => sequelize.define('auditor_sessions', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  companyId: { type: DataTypes.INTEGER, allowNull: false },
  auditorId: { type: DataTypes.STRING, allowNull: false },
  auditorName: { type: DataTypes.STRING, allowNull: false },
  auditType: { type: DataTypes.STRING, allowNull: false },
  sessionStart: { type: DataTypes.DATE, allowNull: false },
  sessionEnd: { type: DataTypes.DATE },
  dataVerified: { type: DataTypes.JSON },
  evidenceReviewed: { type: DataTypes.JSON },
  findings: { type: DataTypes.TEXT },
  recommendations: { type: DataTypes.TEXT },
  verificationStatus: { type: DataTypes.STRING, defaultValue: 'in_progress' },
  auditTrailAccessed: { type: DataTypes.JSON },
  certificationsIssued: { type: DataTypes.JSON },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  indexes: [
    { fields: ['companyId'] },
    { fields: ['auditorId'] },
    { fields: ['auditType'] }
  ]
});

export default AuditorSessions;