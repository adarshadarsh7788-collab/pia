const db = require('../database/db');
const AuditService = require('./auditService');
const NotificationService = require('./notificationService');

const APPROVAL_LEVELS = ['site', 'business_unit', 'group_esg', 'executive'];
const LEVEL_EMAILS = {
  site: process.env.SITE_APPROVER_EMAIL,
  business_unit: process.env.BU_APPROVER_EMAIL,
  group_esg: process.env.ESG_APPROVER_EMAIL,
  executive: process.env.EXEC_APPROVER_EMAIL
};

class WorkflowService {
  async createWorkflow(dataId, dataType, submittedBy, submitterEmail) {
    const workflowId = `WF_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    
    return new Promise((resolve, reject) => {
      db.run(`
        INSERT INTO approval_workflows (workflow_id, data_id, data_type, submitted_by, current_level, status)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [workflowId, dataId, dataType, submittedBy, 'site', 'pending'], async (err) => {
        if (err) return reject(err);
        
        // Create approval steps
        for (const level of APPROVAL_LEVELS) {
          await this.createApprovalStep(workflowId, level);
        }
        
        // Send notification to first approver
        if (LEVEL_EMAILS.site) {
          await NotificationService.sendApprovalNotification(
            workflowId, LEVEL_EMAILS.site, dataType, submittedBy
          );
        }
        
        // Audit log
        await AuditService.createAuditEntry(
          'workflow_created', 'approval_workflows', workflowId, 
          submittedBy, 'submitter', null, { dataId, dataType }
        );
        
        resolve({ workflowId, status: 'pending' });
      });
    });
  }

  async createApprovalStep(workflowId, level) {
    return new Promise((resolve, reject) => {
      db.run(`
        INSERT INTO approval_steps (workflow_id, level, status)
        VALUES (?, ?, ?)
      `, [workflowId, level, 'pending'], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  async approveWorkflow(workflowId, approverId, approverEmail, comments = '') {
    const workflow = await this.getWorkflow(workflowId);
    if (!workflow) throw new Error('Workflow not found');
    
    const currentLevel = workflow.current_level;
    const currentIndex = APPROVAL_LEVELS.indexOf(currentLevel);
    
    // Update current step
    await this.updateApprovalStep(workflowId, currentLevel, 'approved', approverId, comments);
    
    // Move to next level or complete
    if (currentIndex < APPROVAL_LEVELS.length - 1) {
      const nextLevel = APPROVAL_LEVELS[currentIndex + 1];
      await this.updateWorkflowLevel(workflowId, nextLevel);
      
      // Notify next approver
      if (LEVEL_EMAILS[nextLevel]) {
        await NotificationService.sendApprovalNotification(
          workflowId, LEVEL_EMAILS[nextLevel], workflow.data_type, workflow.submitted_by
        );
      }
    } else {
      await this.completeWorkflow(workflowId, 'approved');
      
      // Notify submitter
      await NotificationService.sendApprovalStatusNotification(
        workflowId, approverEmail, 'approved', comments
      );
    }
    
    // Audit log
    await AuditService.createAuditEntry(
      'workflow_approved', 'approval_workflows', workflowId,
      approverId, 'approver', { level: currentLevel }, { status: 'approved', comments }
    );
    
    return { success: true, workflowId };
  }

  async rejectWorkflow(workflowId, approverId, approverEmail, comments) {
    const workflow = await this.getWorkflow(workflowId);
    if (!workflow) throw new Error('Workflow not found');
    
    await this.updateApprovalStep(workflowId, workflow.current_level, 'rejected', approverId, comments);
    await this.completeWorkflow(workflowId, 'rejected');
    
    // Notify submitter
    await NotificationService.sendApprovalStatusNotification(
      workflowId, approverEmail, 'rejected', comments
    );
    
    // Audit log
    await AuditService.createAuditEntry(
      'workflow_rejected', 'approval_workflows', workflowId,
      approverId, 'approver', { level: workflow.current_level }, { status: 'rejected', comments }
    );
    
    return { success: true, workflowId };
  }

  updateApprovalStep(workflowId, level, status, approver, comments) {
    return new Promise((resolve, reject) => {
      db.run(`
        UPDATE approval_steps 
        SET status = ?, approver = ?, approved_at = CURRENT_TIMESTAMP, comments = ?
        WHERE workflow_id = ? AND level = ?
      `, [status, approver, comments, workflowId, level], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  updateWorkflowLevel(workflowId, newLevel) {
    return new Promise((resolve, reject) => {
      db.run(`
        UPDATE approval_workflows SET current_level = ? WHERE workflow_id = ?
      `, [newLevel, workflowId], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  completeWorkflow(workflowId, status) {
    return new Promise((resolve, reject) => {
      db.run(`
        UPDATE approval_workflows 
        SET status = ?, completed_at = CURRENT_TIMESTAMP 
        WHERE workflow_id = ?
      `, [status, workflowId], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  getWorkflow(workflowId) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM approval_workflows WHERE workflow_id = ?', [workflowId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  async getWorkflowWithSteps(workflowId) {
    const workflow = await this.getWorkflow(workflowId);
    if (!workflow) return null;
    
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM approval_steps WHERE workflow_id = ? ORDER BY id', 
        [workflowId], (err, steps) => {
          if (err) reject(err);
          else resolve({ ...workflow, steps });
        });
    });
  }

  getPendingWorkflows(level = null) {
    return new Promise((resolve, reject) => {
      const query = level 
        ? 'SELECT * FROM approval_workflows WHERE status = ? AND current_level = ? ORDER BY submitted_at DESC'
        : 'SELECT * FROM approval_workflows WHERE status = ? ORDER BY submitted_at DESC';
      
      const params = level ? ['pending', level] : ['pending'];
      
      db.all(query, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }
}

module.exports = new WorkflowService();
