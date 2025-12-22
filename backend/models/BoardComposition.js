import { DataTypes } from 'sequelize';

const BoardComposition = (sequelize) => sequelize.define('board_composition', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  companyId: { type: DataTypes.INTEGER, allowNull: false },
  memberId: { type: DataTypes.STRING, allowNull: false },
  memberName: { type: DataTypes.STRING, allowNull: false },
  position: { type: DataTypes.STRING, allowNull: false },
  isIndependent: { type: DataTypes.BOOLEAN, defaultValue: false },
  gender: { type: DataTypes.STRING },
  age: { type: DataTypes.INTEGER },
  ethnicity: { type: DataTypes.STRING },
  expertise: { type: DataTypes.TEXT },
  tenure: { type: DataTypes.INTEGER, defaultValue: 0 },
  compensation: { type: DataTypes.FLOAT },
  attendanceRate: { type: DataTypes.FLOAT, defaultValue: 100 },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  appointmentDate: { type: DataTypes.DATE },
  createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  indexes: [
    { fields: ['companyId'] },
    { fields: ['position'] },
    { fields: ['isActive'] }
  ]
});

export default BoardComposition;