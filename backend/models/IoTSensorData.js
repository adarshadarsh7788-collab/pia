import { DataTypes } from 'sequelize';

const IoTSensorData = (sequelize) => {
  return sequelize.define('IoTSensorData', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  deviceId: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: 'IoTDevices',
      key: 'deviceId'
    }
  },
  sensorType: {
    type: DataTypes.ENUM('energy', 'water', 'co2', 'temperature', 'humidity', 'noise', 'waste_level', 'gps'),
    allowNull: false
  },
  value: {
    type: DataTypes.DECIMAL(10, 4),
    allowNull: false
  },
  unit: {
    type: DataTypes.STRING,
    allowNull: false
  },
  timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  quality: {
    type: DataTypes.ENUM('good', 'fair', 'poor'),
    defaultValue: 'good'
  }
  });
};

export default IoTSensorData;