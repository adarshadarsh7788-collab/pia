import { DataTypes } from 'sequelize';

const IoTDevice = (sequelize) => {
  return sequelize.define('IoTDevice', {
  deviceId: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false
  },
  deviceType: {
    type: DataTypes.ENUM('energy_meter', 'water_meter', 'air_quality', 'waste_sensor', 'safety_wearable', 'fleet_tracker'),
    allowNull: false
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'maintenance'),
    defaultValue: 'active'
  },
  lastHeartbeat: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  metadata: {
    type: DataTypes.JSON,
    defaultValue: {}
  }
  });
};

export default IoTDevice;