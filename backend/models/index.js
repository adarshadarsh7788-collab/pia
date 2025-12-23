import createSequelize from '../config/database.js';
import WasteData from './WasteData.js';
import AirQualityData from './AirQualityData.js';
import BiodiversityData from './BiodiversityData.js';
import HumanRightsData from './HumanRightsData.js';
import CommunityProjects from './CommunityProjects.js';
import WorkforceData from './WorkforceData.js';
import SafetyIncidents from './SafetyIncidents.js';
import EthicsCompliance from './EthicsCompliance.js';
import SecurityIncidents from './SecurityIncidents.js';
import BoardComposition from './BoardComposition.js';
import AIAnalysis from './AIAnalysis.js';
import PortalAccess from './PortalAccess.js';
import FrameworkCompliance from './FrameworkCompliance.js';
import AuditorSessions from './AuditorSessions.js';
import SentimentData from './SentimentData.js';
import IoTDevice from './IoTDevice.js';
import IoTSensorData from './IoTSensorData.js';

let sequelize;
let models = {};

const initializeDatabase = async () => {
  try {
    sequelize = await createSequelize();
    
    // Initialize all models
    models.WasteData = WasteData(sequelize);
    models.AirQualityData = AirQualityData(sequelize);
    models.BiodiversityData = BiodiversityData(sequelize);
    models.HumanRightsData = HumanRightsData(sequelize);
    models.CommunityProjects = CommunityProjects(sequelize);
    models.WorkforceData = WorkforceData(sequelize);
    models.SafetyIncidents = SafetyIncidents(sequelize);
    models.EthicsCompliance = EthicsCompliance(sequelize);
    models.SecurityIncidents = SecurityIncidents(sequelize);
    models.BoardComposition = BoardComposition(sequelize);
    models.AIAnalysis = AIAnalysis(sequelize);
    models.PortalAccess = PortalAccess(sequelize);
    models.FrameworkCompliance = FrameworkCompliance(sequelize);
    models.AuditorSessions = AuditorSessions(sequelize);
    models.SentimentData = SentimentData(sequelize);
    models.IoTDevice = IoTDevice(sequelize);
    models.IoTSensorData = IoTSensorData(sequelize);

    // Sync all models
    await sequelize.sync({ alter: true });
    
    console.log('All ESG database models initialized successfully');
    return { sequelize, models };
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  }
};

export { initializeDatabase, models, sequelize };
export default initializeDatabase;