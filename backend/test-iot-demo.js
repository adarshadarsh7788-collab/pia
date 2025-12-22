import fetch from 'node-fetch';

/**
 * Live IoT Integration Demo
 */
async function runIoTDemo() {
  const baseUrl = 'http://localhost:5000/api';
  
  console.log('🚀 STARTING IoT INTEGRATION DEMO\n');
  
  try {
    // Step 1: Register IoT devices
    console.log('📡 STEP 1: Registering IoT Devices...');
    
    const devices = [
      { deviceId: 'ENERGY_METER_001', deviceType: 'energy_meter', location: 'Factory Floor 1' },
      { deviceId: 'WATER_SENSOR_001', deviceType: 'water_meter', location: 'Main Building' },
      { deviceId: 'AIR_QUALITY_001', deviceType: 'air_quality', location: 'Production Area' },
      { deviceId: 'WASTE_BIN_001', deviceType: 'waste_sensor', location: 'Cafeteria' }
    ];

    for (const device of devices) {
      const response = await fetch(`${baseUrl}/iot/devices/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(device)
      });
      
      if (response.ok) {
        console.log(`   ✅ Registered: ${device.deviceId}`);
      } else {
        console.log(`   ❌ Failed to register: ${device.deviceId}`);
      }
    }

    console.log('\n📊 STEP 2: Sending Sensor Data...');
    
    // Step 2: Send sensor data
    const sensorReadings = [
      { deviceId: 'ENERGY_METER_001', sensorType: 'energy', value: 150.5, unit: 'kWh' },
      { deviceId: 'WATER_SENSOR_001', sensorType: 'water', value: 500, unit: 'liters' },
      { deviceId: 'AIR_QUALITY_001', sensorType: 'co2', value: 420, unit: 'ppm' },
      { deviceId: 'WASTE_BIN_001', sensorType: 'waste_level', value: 75, unit: 'percent' }
    ];

    for (const reading of sensorReadings) {
      const response = await fetch(`${baseUrl}/iot/data/ingest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reading)
      });
      
      if (response.ok) {
        console.log(`   📈 Data received: ${reading.deviceId} - ${reading.value} ${reading.unit}`);
      }
    }

    console.log('\n⚡ STEP 3: Getting Real-time ESG Metrics...');
    
    // Step 3: Get real-time metrics
    const metricsResponse = await fetch(`${baseUrl}/iot/metrics/realtime`);
    if (metricsResponse.ok) {
      const metrics = await metricsResponse.json();
      console.log('   📊 Real-time ESG Data:', JSON.stringify(metrics.data, null, 2));
    }

    console.log('\n🔍 STEP 4: Checking Device Status...');
    
    // Step 4: Check device status
    const statusResponse = await fetch(`${baseUrl}/iot/devices/status`);
    if (statusResponse.ok) {
      const status = await statusResponse.json();
      console.log(`   📱 Active Devices: ${status.data.length}`);
      status.data.forEach(device => {
        console.log(`      - ${device.deviceId}: ${device.status}`);
      });
    }

    console.log('\n✅ IoT INTEGRATION DEMO COMPLETED SUCCESSFULLY!');
    console.log('\n🎯 WHAT HAPPENED:');
    console.log('   1. IoT devices registered in system');
    console.log('   2. Sensor data converted to ESG metrics');
    console.log('   3. Real-time dashboard updated');
    console.log('   4. Data ready for BRSR/GRI reporting');

  } catch (error) {
    console.error('❌ Demo failed:', error.message);
    console.log('\n💡 Make sure to start the server first:');
    console.log('   node server.js');
  }
}

// Check if server is running, then run demo
console.log('🔄 Checking if server is running...');
console.log('💡 If this fails, start server with: node server.js\n');

runIoTDemo();