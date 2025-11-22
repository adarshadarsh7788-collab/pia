import express from 'express';
import { Op } from 'sequelize';
import IoTDataProcessor from '../services/iotDataProcessor.js';
import { models } from '../models/index.js';

const router = express.Router();

/**
 * Register IoT device
 */
router.post('/devices/register', async (req, res) => {
  try {
    const { deviceId, deviceType, location, metadata } = req.body;
    
    const device = await models.IoTDevice.create({
      deviceId,
      deviceType,
      location,
      metadata: metadata || {}
    });

    res.json({
      success: true,
      message: 'IoT device registered successfully',
      device
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Receive sensor data from IoT devices
 */
router.post('/data/ingest', async (req, res) => {
  try {
    const { deviceId, sensorType, value, unit, timestamp } = req.body;
    
    const result = await IoTDataProcessor.processIncomingData(
      deviceId, 
      sensorType, 
      value, 
      unit, 
      timestamp ? new Date(timestamp) : new Date()
    );

    res.json({
      success: true,
      message: 'Sensor data processed successfully',
      dataId: result.id
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get comprehensive real-time ESG metrics
 */
router.get('/metrics/realtime', async (req, res) => {
  try {
    const metrics = await IoTDataProcessor.calculateRealTimeESGScore();
    
    res.json({
      success: true,
      data: metrics,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get device performance analytics
 */
router.get('/devices/analytics', async (req, res) => {
  try {
    const { timeRange = '24h' } = req.query;
    const hours = timeRange === '7d' ? 168 : timeRange === '30d' ? 720 : 24;
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);

    const analytics = await IoTDataProcessor.getDeviceAnalytics(since);
    
    res.json({
      success: true,
      data: analytics,
      timeRange,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get ESG impact summary
 */
router.get('/metrics/esg-impact', async (req, res) => {
  try {
    const impact = await IoTDataProcessor.calculateESGImpact();
    
    res.json({
      success: true,
      data: impact,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get comprehensive device status with analytics
 */
router.get('/devices/status', async (req, res) => {
  try {
    const devices = await models.IoTDevice.findAll({
      attributes: ['deviceId', 'deviceType', 'location', 'status', 'lastHeartbeat', 'metadata']
    });

    // Get data count for each device from last 24 hours
    const deviceStats = await Promise.all(devices.map(async (device) => {
      const dataCount = await models.IoTSensorData.count({
        where: {
          deviceId: device.deviceId,
          timestamp: {
            [Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000)
          }
        }
      });

      const lastReading = await models.IoTSensorData.findOne({
        where: { deviceId: device.deviceId },
        order: [['timestamp', 'DESC']]
      });

      return {
        ...device.toJSON(),
        dataPointsLast24h: dataCount,
        lastReading: lastReading ? {
          sensorType: lastReading.sensorType,
          value: lastReading.value,
          unit: lastReading.unit,
          timestamp: lastReading.timestamp
        } : null,
        connectionStatus: dataCount > 0 ? 'connected' : 'disconnected'
      };
    }));

    const summary = {
      totalDevices: devices.length,
      activeDevices: devices.filter(d => d.status === 'active').length,
      connectedDevices: deviceStats.filter(d => d.connectionStatus === 'connected').length,
      deviceTypes: [...new Set(devices.map(d => d.deviceType))],
      locations: [...new Set(devices.map(d => d.location))]
    };

    res.json({
      success: true,
      data: deviceStats,
      summary,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Update device status
 */
router.put('/devices/:deviceId/status', async (req, res) => {
  try {
    const { deviceId } = req.params;
    const { status } = req.body;
    
    const device = await models.IoTDevice.findOne({ where: { deviceId } });
    
    if (!device) {
      return res.status(404).json({
        success: false,
        error: 'Device not found'
      });
    }
    
    device.status = status;
    await device.save();
    
    res.json({
      success: true,
      message: 'Device status updated successfully',
      device
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Delete IoT device
 */
router.delete('/devices/:deviceId', async (req, res) => {
  try {
    const { deviceId } = req.params;
    
    // Delete associated sensor data first
    await models.IoTSensorData.destroy({
      where: { deviceId }
    });
    
    // Delete the device
    const deleted = await models.IoTDevice.destroy({
      where: { deviceId }
    });
    
    if (deleted) {
      res.json({
        success: true,
        message: 'Device deleted successfully'
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Device not found'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get sensor data history
 */
router.get('/data/history/:deviceId', async (req, res) => {
  try {
    const { deviceId } = req.params;
    const { hours = 24 } = req.query;
    
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);
    
    const data = await models.IoTSensorData.findAll({
      where: {
        deviceId,
        timestamp: { [Op.gte]: since }
      },
      order: [['timestamp', 'DESC']],
      limit: 1000
    });

    res.json({
      success: true,
      data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;