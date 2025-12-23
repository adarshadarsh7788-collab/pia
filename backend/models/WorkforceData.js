import { DataTypes } from 'sequelize';

const WorkforceData = (sequelize) => sequelize.define('workforce_data', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  companyId: { type: DataTypes.INTEGER, allowNull: false },
  employeeId: { type: DataTypes.STRING, allowNull: false },
  department: { type: DataTypes.STRING, allowNull: false },
  position: { type: DataTypes.STRING, allowNull: false },
  gender: { type: DataTypes.STRING },
  age: { type: DataTypes.INTEGER },
  ethnicity: { type: DataTypes.STRING },
  salary: { type: DataTypes.FLOAT },
  hireDate: { type: DataTypes.DATE, allowNull: false },
  terminationDate: { type: DataTypes.DATE },
  trainingHours: { type: DataTypes.FLOAT, defaultValue: 0 },
  performanceRating: { type: DataTypes.FLOAT },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  indexes: [
    { fields: ['companyId'] },
    { fields: ['department'] },
    { fields: ['isActive'] }
  ]
});

export default WorkforceData;