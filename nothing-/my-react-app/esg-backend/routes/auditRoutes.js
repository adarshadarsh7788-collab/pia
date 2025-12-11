const express = require('express');
const router = express.Router();
const AuditService = require('../services/auditService');
const FileStorageService = require('../services/fileStorageService');
const WorkflowService = require('../services/workflowService');
const ComplianceReportService = require('../services/complianceReportService');
const NotificationService = require('../services/notificationService');

// Audit Trail Endpoints
router.get('/audit-trail', async (req, res) => {
  try {
    const filters = {
      recordId: req.query.recordId,
      tableName: req.query.tableName,
      userId: req.query.userId,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      limit: parseInt(req.query.limit) || 1000
    };
    const trail = await AuditService.getAuditTrail(filters);
    res.json({ success: true, data: trail, count: trail.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/audit-trail', async (req, res) => {
  try {
    const { action, tableName, recordId, userId, userRole, oldValues, newValues, metadata } = req.body;
    const result = await AuditService.createAuditEntry(
      action, tableName, recordId, userId, userRole, oldValues, newValues, metadata
    );
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/audit-trail/verify', async (req, res) => {
  try {
    const startId = parseInt(req.query.startId) || 1;
    const endId = req.query.endId ? parseInt(req.query.endId) : null;
    const result = await AuditService.verifyAuditChain(startId, endId);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Evidence File Endpoints
router.post('/evidence/upload', async (req, res) => {
  try {
    const { dataId, file, uploadedBy, description } = req.body;
    const result = await FileStorageService.uploadFile(dataId, file, uploadedBy, description);
    
    await AuditService.createAuditEntry(
      'evidence_upload', 'evidence_files', result.id, uploadedBy, 'user',
      null, { dataId, fileName: file.name }
    );
    
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/evidence/:dataId', async (req, res) => {
  try {
    const files = await FileStorageService.getFilesByDataId(req.params.dataId);
    res.json({ success: true, data: files });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/evidence/file/:fileId', async (req, res) => {
  try {
    const file = await FileStorageService.getFile(req.params.fileId);
    res.json({ success: true, data: file });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/evidence/:fileId', async (req, res) => {
  try {
    const { userId } = req.body;
    const result = await FileStorageService.deleteFile(req.params.fileId, userId);
    
    await AuditService.createAuditEntry(
      'evidence_delete', 'evidence_files', req.params.fileId, userId, 'user',
      { fileId: req.params.fileId }, null
    );
    
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Workflow Endpoints
router.post('/workflow/create', async (req, res) => {
  try {
    const { dataId, dataType, submittedBy, submitterEmail } = req.body;
    const result = await WorkflowService.createWorkflow(dataId, dataType, submittedBy, submitterEmail);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/workflow/:workflowId/approve', async (req, res) => {
  try {
    const { approverId, approverEmail, comments } = req.body;
    const result = await WorkflowService.approveWorkflow(
      req.params.workflowId, approverId, approverEmail, comments
    );
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/workflow/:workflowId/reject', async (req, res) => {
  try {
    const { approverId, approverEmail, comments } = req.body;
    const result = await WorkflowService.rejectWorkflow(
      req.params.workflowId, approverId, approverEmail, comments
    );
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/workflow/:workflowId', async (req, res) => {
  try {
    const workflow = await WorkflowService.getWorkflowWithSteps(req.params.workflowId);
    res.json({ success: true, data: workflow });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/workflow/pending/:level?', async (req, res) => {
  try {
    const workflows = await WorkflowService.getPendingWorkflows(req.params.level);
    res.json({ success: true, data: workflows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Compliance Reports
router.post('/compliance/report/sox', async (req, res) => {
  try {
    const { periodStart, periodEnd, generatedBy } = req.body;
    const result = await ComplianceReportService.generateSOXReport(periodStart, periodEnd, generatedBy);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/compliance/report/iso', async (req, res) => {
  try {
    const { periodStart, periodEnd, generatedBy } = req.body;
    const result = await ComplianceReportService.generateISOReport(periodStart, periodEnd, generatedBy);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/compliance/report/gdpr', async (req, res) => {
  try {
    const { periodStart, periodEnd, generatedBy } = req.body;
    const result = await ComplianceReportService.generateGDPRReport(periodStart, periodEnd, generatedBy);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/compliance/reports', async (req, res) => {
  try {
    const reports = await ComplianceReportService.getReports({ reportType: req.query.type });
    res.json({ success: true, data: reports });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Notifications
router.post('/notifications/process', async (req, res) => {
  try {
    const result = await NotificationService.processQueue();
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
