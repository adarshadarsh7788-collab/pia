import express from 'express';
import cors from 'cors';
import { initializeDatabase } from './models/index.js';
import esgRoutes from './routes/esgRoutes.js';
import kpiRoutes from './routes/kpiRoutes.js';
import reportingRoutes from './routes/reportingRoutes.js';
import iotRoutes from './routes/iotRoutes.js';
import frameworkComplianceRoutes from './routes/frameworkComplianceRoutes.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/esg', esgRoutes);
app.use('/api/kpi', kpiRoutes);
app.use('/api/reports', reportingRoutes);
app.use('/api/iot', iotRoutes);
app.use('/api/framework-compliance', frameworkComplianceRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Initialize database and start server
const startServer = async () => {
  try {
    await initializeDatabase();
    console.log('Database initialized successfully');
    
    app.listen(PORT, () => {
      console.log(`ESG Backend server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();