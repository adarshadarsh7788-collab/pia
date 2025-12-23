import { initializeDatabase } from './models/index.js';

const sampleData = {
  wasteData: [
    { wasteType: 'Plastic', amount: 150, unit: 'kg', disposalMethod: 'Recycling', date: new Date() },
    { wasteType: 'Paper', amount: 200, unit: 'kg', disposalMethod: 'Recycling', date: new Date() }
  ],
  airQualityData: [
    { location: 'Office Building', pm25: 12.5, pm10: 18.2, co2: 420, date: new Date() },
    { location: 'Manufacturing Unit', pm25: 15.8, pm10: 22.1, co2: 450, date: new Date() }
  ],
  workforceData: [
    { totalEmployees: 150, femaleEmployees: 63, diversityScore: 85, trainingHours: 24, date: new Date() },
    { totalEmployees: 152, femaleEmployees: 65, diversityScore: 87, trainingHours: 26, date: new Date() }
  ],
  safetyIncidents: [
    { incidentType: 'Minor Injury', severity: 'Low', resolved: true, date: new Date() }
  ],
  boardComposition: [
    { totalMembers: 8, independentMembers: 5, femaleMembers: 3, diversityScore: 75, date: new Date() }
  ]
};

async function populateDatabase() {
  try {
    const { models } = await initializeDatabase();
    console.log('Adding sample data...');

    // Add sample data to each model
    await models.WasteData.bulkCreate(sampleData.wasteData);
    await models.AirQualityData.bulkCreate(sampleData.airQualityData);
    await models.WorkforceData.bulkCreate(sampleData.workforceData);
    await models.SafetyIncidents.bulkCreate(sampleData.safetyIncidents);
    await models.BoardComposition.bulkCreate(sampleData.boardComposition);

    console.log('Sample data added successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error populating database:', error);
    process.exit(1);
  }
}

populateDatabase();