import { DataTypes } from 'sequelize';

const FrameworkCompliance = (sequelize) => {
  return sequelize.define('FrameworkCompliance', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    companyId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    framework: {
      type: DataTypes.STRING,
      allowNull: false
    },
    complianceScore: {
      type: DataTypes.FLOAT,
      defaultValue: 0
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: 'pending'
    },
    assessmentDate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    gaps: {
      type: DataTypes.JSON,
      defaultValue: []
    },
    recommendations: {
      type: DataTypes.JSON,
      defaultValue: []
    }
  });
};

export default FrameworkCompliance;
