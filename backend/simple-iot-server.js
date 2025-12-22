import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage for demo
let devices = [];
let sensorData = [];

// Register IoT device
app.post('/api/iot/devices/register', (req, res) => {
  const { deviceId, deviceType, location } = req.body;
  
  const device = {
    deviceId,
    deviceType,
    location,
    status: 'active',
    lastHeartbeat: new Date(),
    metadata: {}
  };
  
  devices.push(device);
  
  res.json({
    success: true,
    message: 'IoT device registered successfully',
    device
  });
});

// Get device status
app.get('/api/iot/devices/status', (req, res) => {
  const deviceStats = devices.map(device => ({
    ...device,
    dataPointsLast24h: sensorData.filter(d => d.deviceId === device.deviceId).length,
    lastReading: sensorData.filter(d => d.deviceId === device.deviceId).pop() || null,
    connectionStatus: 'connected'
  }));

  const summary = {
    totalDevices: devices.length,
    activeDevices: devices.filter(d => d.status === 'active').length,
    connectedDevices: devices.length,
    deviceTypes: [...new Set(devices.map(d => d.deviceType))],
    locations: [...new Set(devices.map(d => d.location))]
  };

  res.json({
    success: true,
    data: deviceStats,
    summary,
    timestamp: new Date().toISOString()
  });
});

// Delete device
app.delete('/api/iot/devices/:deviceId', (req, res) => {
  const { deviceId } = req.params;
  
  const deviceIndex = devices.findIndex(d => d.deviceId === deviceId);
  if (deviceIndex === -1) {
    return res.status(404).json({
      success: false,
      error: 'Device not found'
    });
  }
  
  devices.splice(deviceIndex, 1);
  sensorData = sensorData.filter(d => d.deviceId !== deviceId);
  
  res.json({
    success: true,
    message: 'Device deleted successfully'
  });
});

// Ingest sensor data
app.post('/api/iot/data/ingest', (req, res) => {
  const { deviceId, sensorType, value, unit } = req.body;
  
  const data = {
    id: Date.now(),
    deviceId,
    sensorType,
    value: parseFloat(value),
    unit,
    timestamp: new Date(),
    quality: 'good'
  };
  
  sensorData.push(data);
  
  res.json({
    success: true,
    message: 'Sensor data processed successfully',
    dataId: data.id
  });
});

// Get real-time metrics
app.get('/api/iot/metrics/realtime', (req, res) => {
  const metrics = {
    environmental: {
      totalEnergyConsumption: sensorData.filter(d => d.sensorType === 'energy').reduce((sum, d) => sum + d.value, 0),
      co2Emissions: sensorData.filter(d => d.sensorType === 'co2').reduce((sum, d) => sum + d.value, 0),
      waterUsage: sensorData.filter(d => d.sensorType === 'water').reduce((sum, d) => sum + d.value, 0),
      averageTemperature: 22.5,
      averageHumidity: 45
    },
    social: {
      wasteLevel: sensorData.filter(d => d.sensorType === 'waste_level').reduce((sum, d) => sum + d.value, 0) / Math.max(1, sensorData.filter(d => d.sensorType === 'waste_level').length),
      noiseLevel: 35,
      airQuality: 85
    },
    governance: {
      dataQuality: 95,
      deviceUptime: 98,
      complianceScore: 92
    },
    summary: {
      totalDataPoints: sensorData.length,
      activeDevices: devices.length,
      esgScore: 85,
      lastUpdated: new Date()
    }
  };

  res.json({
    success: true,
    data: metrics,
    timestamp: new Date().toISOString()
  });
});

// Get ESG impact
app.get('/api/iot/metrics/esg-impact', (req, res) => {
  const impact = {
    environmental: {
      carbonFootprintReduction: 125,
      energySavings: 250,
      waterConservation: 180,
      wasteReduction: 15
    },
    social: {
      airQualityImprovement: 12,
      noiseReduction: 8,
      safetyIncidents: 0
    },
    governance: {
      dataTransparency: 95,
      complianceRate: 98,
      reportingAccuracy: 97
    },
    trends: {
      monthlyImprovement: 12,
      targetAchievement: 85,
      benchmarkComparison: 92
    }
  };

  res.json({
    success: true,
    data: impact,
    timestamp: new Date().toISOString()
  });
});

// Get device analytics
app.get('/api/iot/devices/analytics', (req, res) => {
  const analytics = {
    devices: devices.map(device => ({
      deviceId: device.deviceId,
      deviceType: device.deviceType,
      location: device.location,
      status: device.status,
      totalDataPoints: sensorData.filter(d => d.deviceId === device.deviceId).length,
      sensorTypes: [...new Set(sensorData.filter(d => d.deviceId === device.deviceId).map(d => d.sensorType))],
      dataFrequency: '5 points/hour'
    })),
    summary: {
      totalDevices: devices.length,
      totalDataPoints: sensorData.length,
      averageDataFrequency: 5
    }
  };

  res.json({
    success: true,
    data: analytics,
    timestamp: new Date().toISOString()
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Simple IoT Backend server running on port ${PORT}`);
  console.log(`📊 Ready to accept IoT device registrations and data`);
});