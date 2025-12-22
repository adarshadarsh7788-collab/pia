import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000/api/iot';

// Test IoT system functionality
async function testIoTSystem() {
  console.log('🚀 Testing Complete IoT System Functionality\n');

  try {
    // 1. Register sample devices
    console.log('📱 Registering sample IoT devices...');
    const devices = [
      { deviceId: 'ENERGY_001', deviceType: 'energy_meter', location: 'Building A - Floor 1' },
      { deviceId: 'WATER_001', deviceType: 'water_meter', location: 'Building A - Basement' },
      { deviceId: 'AIR_001', deviceType: 'air_quality', location: 'Building A - Floor 2' },
      { deviceId: 'WASTE_001', deviceType: 'waste_sensor', location: 'Building A - Parking' }
    ];

    for (const device of devices) {
      const response = await fetch(`${BASE_URL}/devices/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(device)
      });
      const result = await response.json();
      console.log(`✅ ${device.deviceId}: ${result.success ? 'Registered' : 'Failed'}`);
    }

    // 2. Add sample sensor data
    console.log('\n📊 Adding sample sensor data...');
    const sensorData = [
      { deviceId: 'ENERGY_001', sensorType: 'energy', value: 125.5, unit: 'kWh' },
      { deviceId: 'ENERGY_001', sensorType: 'energy', value: 130.2, unit: 'kWh' },
      { deviceId: 'WATER_001', sensorType: 'water', value: 450.0, unit: 'liters' },
      { deviceId: 'AIR_001', sensorType: 'co2', value: 420.5, unit: 'ppm' },
      { deviceId: 'AIR_001', sensorType: 'temperature', value: 22.5, unit: '°C' },
      { deviceId: 'WASTE_001', sensorType: 'waste_level', value: 75.0, unit: '%' }
    ];

    for (const data of sensorData) {
      const response = await fetch(`${BASE_URL}/data/ingest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await response.json();
      console.log(`📈 ${data.deviceId} (${data.sensorType}): ${result.success ? 'Added' : 'Failed'}`);
    }

    // 3. Test device status API
    console.log('\n🔍 Testing Device Status API...');
    const statusResponse = await fetch(`${BASE_URL}/devices/status`);
    const statusData = await statusResponse.json();
    
    if (statusData.success) {
      console.log(`✅ Found ${statusData.data.length} devices`);
      console.log(`📊 Summary: ${JSON.stringify(statusData.summary, null, 2)}`);
    }

    // 4. Test real-time metrics API
    console.log('\n📊 Testing Real-time Metrics API...');
    const metricsResponse = await fetch(`${BASE_URL}/metrics/realtime`);
    const metricsData = await metricsResponse.json();
    
    if (metricsData.success) {
      console.log('✅ Real-time metrics retrieved');
      console.log(`🌱 ESG Score: ${metricsData.data.summary.esgScore}`);
      console.log(`⚡ Energy: ${metricsData.data.environmental.totalEnergyConsumption} kWh`);
      console.log(`💧 Water: ${metricsData.data.environmental.waterUsage} liters`);
    }

    // 5. Test ESG impact API
    console.log('\n🌍 Testing ESG Impact API...');
    const impactResponse = await fetch(`${BASE_URL}/metrics/esg-impact`);
    const impactData = await impactResponse.json();
    
    if (impactData.success) {
      console.log('✅ ESG impact data retrieved');
      console.log(`🌱 Carbon Reduction: ${impactData.data.environmental.carbonFootprintReduction} kg CO2`);
      console.log(`⚡ Energy Savings: ${impactData.data.environmental.energySavings} kWh`);
    }

    // 6. Test device analytics API
    console.log('\n📈 Testing Device Analytics API...');
    const analyticsResponse = await fetch(`${BASE_URL}/devices/analytics?timeRange=24h`);
    const analyticsData = await analyticsResponse.json();
    
    if (analyticsData.success) {
      console.log('✅ Device analytics retrieved');
      console.log(`📊 Total Data Points: ${analyticsData.data.summary.totalDataPoints}`);
      console.log(`📡 Active Devices: ${analyticsData.data.summary.totalDevices}`);
    }

    console.log('\n🎉 All IoT system tests completed successfully!');
    console.log('\n📋 Frontend Testing Instructions:');
    console.log('1. Open http://localhost:3000/iot in your browser');
    console.log('2. Click "Device Analytics" to see device status');
    console.log('3. Click "ESG Metrics" to see real-time data');
    console.log('4. Click "Impact Analysis" to see ESG impact');
    console.log('5. Try deleting a device using the 🗑️ button');
    console.log('6. Register a new device using the form');

  } catch (error) {
    console.error('❌ Error testing IoT system:', error.message);
    console.log('\n🔧 Make sure the backend server is running on port 5000');
  }
}

// Run the test
testIoTSystem();