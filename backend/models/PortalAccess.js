import { DataTypes } from 'sequelize';

const PortalAccess = (sequelize) => sequelize.define('portal_access', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  companyId: { type: DataTypes.INTEGER, allowNull: false },
  portalType: { type: DataTypes.STRING, allowNull: false },
  userId: { type: DataTypes.STRING, allowNull: false },
  userType: { type: DataTypes.STRING, allowNull: false },
  accessLevel: { type: DataTypes.STRING, allowNull: false },
  permissions: { type: DataTypes.JSON },
  lastLoginDate: { type: DataTypes.DATE },
  sessionDuration: { type: DataTypes.INTEGER, defaultValue: 0 },
  actionsPerformed: { type: DataTypes.JSON },
  dataAccessed: { type: DataTypes.JSON },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  expiryDate: { type: DataTypes.DATE },
  createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  indexes: [
    { fields: ['companyId'] },
    { fields: ['portalType'] },
    { fields: ['userType'] }
  ]
});

export default PortalAccess;