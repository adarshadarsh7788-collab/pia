const express = require('express');
const cors = require('cors');
const http = require('http');
require('dotenv').config();

const auditRoutes = require('./routes/auditRoutes');
const realtimeSyncService = require('./services/realtimeSyncService');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Routes
app.use('/api/audit', auditRoutes);

// Existing routes
const authRoutes = require('./routes/auth');
const esgRoutes = require('./routes/esg');
const workflowRoutes = require('./routes/workflow');
const reportingRoutes = require('./routes/reporting');

app.use('/api/auth', authRoutes);
app.use('/api/esg', esgRoutes);
app.use('/api/workflow', workflowRoutes);
app.use('/api/reporting', reportingRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    features: {
      auditTrail: true,
      realtimeSync: true,
      fileStorage: true,
      approvalWorkflow: true,
      emailNotifications: true,
      complianceReports: true
    }
  });
});

// Initialize WebSocket for real-time sync
realtimeSyncService.initialize(server);

// Start server
server.listen(PORT, () => {
  console.log(`✓ ESG Backend server running on port ${PORT}`);
  console.log(`✓ WebSocket server ready at ws://localhost:${PORT}/ws/sync`);
  console.log(`✓ Audit & Assurance features enabled`);
});

module.exports = app;
