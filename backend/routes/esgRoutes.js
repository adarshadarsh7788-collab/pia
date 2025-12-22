import express from 'express';
import ESGController from '../controllers/ESGController.js';

const router = express.Router();

// Generic routes for all ESG models
const models = [
  'WasteData', 'AirQualityData', 'BiodiversityData', 'HumanRightsData',
  'CommunityProjects', 'WorkforceData', 'SafetyIncidents', 'EthicsCompliance',
  'SecurityIncidents', 'BoardComposition', 'AIAnalysis', 'PortalAccess',
  'FrameworkCompliance', 'AuditorSessions', 'SentimentData'
];

models.forEach(modelName => {
  const route = modelName.toLowerCase().replace(/([A-Z])/g, '-$1').substring(1);
  
  // GET /api/esg/:model/:companyId
  router.get(`/${route}/:companyId`, async (req, res) => {
    try {
      const result = await ESGController.findAll(modelName, req.params.companyId, req.query);
      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // POST /api/esg/:model
  router.post(`/${route}`, async (req, res) => {
    try {
      const result = await ESGController.create(modelName, req.body);
      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  });

  // PUT /api/esg/:model/:id
  router.put(`/${route}/:id`, async (req, res) => {
    try {
      const result = await ESGController.update(modelName, req.params.id, req.body);
      res.json(result);
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  });

  // DELETE /api/esg/:model/:id
  router.delete(`/${route}/:id`, async (req, res) => {
    try {
      const result = await ESGController.delete(modelName, req.params.id);
      res.json(result);
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  });
});

export default router;