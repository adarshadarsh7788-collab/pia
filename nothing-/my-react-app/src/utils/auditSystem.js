// Enhanced Audit System with Complete Trail Recording

export const AUDIT_ACTIONS = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  UPLOAD: 'upload',
  APPROVE: 'approve',
  REJECT: 'reject',
  SUBMIT: 'submit',
  REVIEW: 'review'
};

export const APPROVAL_LEVELS = {
  SITE: 'site',
  BUSINESS_UNIT: 'business_unit',
  GROUP_ESG: 'group_esg',
  EXECUTIVE: 'executive'
};

export const APPROVAL_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  RETURNED: 'returned'
};

class AuditSystem {
  constructor() {
    this.storageKey = 'audit_trail';
    this.evidenceKey = 'evidence_files';
    this.approvalsKey = 'approval_workflows';
  }

  // Record audit entry
  recordAudit(action, details) {
    const auditEntry = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      action,
      user: localStorage.getItem('currentUser') || 'unknown',
      userRole: localStorage.getItem('userRole') || 'unknown',
      timestamp: new Date().toISOString(),
      details: {
        ...details,
        ipAddress: 'client-side', // Would be captured server-side
        userAgent: navigator.userAgent
      }
    };

    const trail = this.getAuditTrail();
    trail.unshift(auditEntry);
    
    // Keep last 1000 entries
    if (trail.length > 1000) trail.splice(1000);
    
    localStorage.setItem(this.storageKey, JSON.stringify(trail));
    return auditEntry;
  }

  // Get complete audit trail
  getAuditTrail(filters = {}) {
    const trail = JSON.parse(localStorage.getItem(this.storageKey) || '[]');
    
    if (!filters || Object.keys(filters).length === 0) return trail;
    
    return trail.filter(entry => {
      if (filters.action && entry.action !== filters.action) return false;
      if (filters.user && entry.user !== filters.user) return false;
      if (filters.startDate && new Date(entry.timestamp) < new Date(filters.startDate)) return false;
      if (filters.endDate && new Date(entry.timestamp) > new Date(filters.endDate)) return false;
      if (filters.dataId && entry.details.dataId !== filters.dataId) return false;
      return true;
    });
  }

  // Upload evidence file
  uploadEvidence(dataId, file, description) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const evidence = {
          id: `evidence_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          dataId,
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          fileData: e.target.result, // Base64 encoded
          description,
          uploadedBy: localStorage.getItem('currentUser'),
          uploadedAt: new Date().toISOString()
        };

        const evidenceList = this.getEvidence();
        evidenceList.push(evidence);
        localStorage.setItem(this.evidenceKey, JSON.stringify(evidenceList));

        // Record audit
        this.recordAudit(AUDIT_ACTIONS.UPLOAD, {
          dataId,
          fileName: file.name,
          fileType: file.type,
          description
        });

        resolve(evidence);
      };

      reader.onerror = () => reject(new Error('File read failed'));
      reader.readAsDataURL(file);
    });
  }

  // Get evidence for data entry
  getEvidence(dataId = null) {
    const evidence = JSON.parse(localStorage.getItem(this.evidenceKey) || '[]');
    return dataId ? evidence.filter(e => e.dataId === dataId) : evidence;
  }

  // Delete evidence
  deleteEvidence(evidenceId) {
    const evidence = this.getEvidence();
    const filtered = evidence.filter(e => e.id !== evidenceId);
    localStorage.setItem(this.evidenceKey, JSON.stringify(filtered));
    
    this.recordAudit(AUDIT_ACTIONS.DELETE, {
      evidenceId,
      type: 'evidence'
    });
  }

  // Create approval workflow
  createApprovalWorkflow(dataId, dataType, submittedBy) {
    const workflow = {
      id: `workflow_${Date.now()}`,
      dataId,
      dataType,
      submittedBy,
      submittedAt: new Date().toISOString(),
      currentLevel: APPROVAL_LEVELS.SITE,
      status: APPROVAL_STATUS.PENDING,
      approvals: [
        { level: APPROVAL_LEVELS.SITE, status: APPROVAL_STATUS.PENDING, approver: null, timestamp: null, comments: null },
        { level: APPROVAL_LEVELS.BUSINESS_UNIT, status: APPROVAL_STATUS.PENDING, approver: null, timestamp: null, comments: null },
        { level: APPROVAL_LEVELS.GROUP_ESG, status: APPROVAL_STATUS.PENDING, approver: null, timestamp: null, comments: null },
        { level: APPROVAL_LEVELS.EXECUTIVE, status: APPROVAL_STATUS.PENDING, approver: null, timestamp: null, comments: null }
      ]
    };

    const workflows = this.getWorkflows();
    workflows.push(workflow);
    localStorage.setItem(this.approvalsKey, JSON.stringify(workflows));

    this.recordAudit(AUDIT_ACTIONS.SUBMIT, {
      workflowId: workflow.id,
      dataId,
      dataType
    });

    return workflow;
  }

  // Approve at current level
  approveWorkflow(workflowId, comments = '') {
    const workflows = this.getWorkflows();
    const workflow = workflows.find(w => w.id === workflowId);
    
    if (!workflow) throw new Error('Workflow not found');

    const currentApproval = workflow.approvals.find(a => a.level === workflow.currentLevel);
    currentApproval.status = APPROVAL_STATUS.APPROVED;
    currentApproval.approver = localStorage.getItem('currentUser');
    currentApproval.timestamp = new Date().toISOString();
    currentApproval.comments = comments;

    // Move to next level
    const levels = Object.values(APPROVAL_LEVELS);
    const currentIndex = levels.indexOf(workflow.currentLevel);
    
    if (currentIndex < levels.length - 1) {
      workflow.currentLevel = levels[currentIndex + 1];
    } else {
      workflow.status = APPROVAL_STATUS.APPROVED;
      workflow.completedAt = new Date().toISOString();
    }

    localStorage.setItem(this.approvalsKey, JSON.stringify(workflows));

    this.recordAudit(AUDIT_ACTIONS.APPROVE, {
      workflowId,
      level: currentApproval.level,
      comments
    });

    return workflow;
  }

  // Reject workflow
  rejectWorkflow(workflowId, comments) {
    const workflows = this.getWorkflows();
    const workflow = workflows.find(w => w.id === workflowId);
    
    if (!workflow) throw new Error('Workflow not found');

    const currentApproval = workflow.approvals.find(a => a.level === workflow.currentLevel);
    currentApproval.status = APPROVAL_STATUS.REJECTED;
    currentApproval.approver = localStorage.getItem('currentUser');
    currentApproval.timestamp = new Date().toISOString();
    currentApproval.comments = comments;

    workflow.status = APPROVAL_STATUS.REJECTED;
    workflow.completedAt = new Date().toISOString();

    localStorage.setItem(this.approvalsKey, JSON.stringify(workflows));

    this.recordAudit(AUDIT_ACTIONS.REJECT, {
      workflowId,
      level: currentApproval.level,
      comments
    });

    return workflow;
  }

  // Get workflows
  getWorkflows(filters = {}) {
    const workflows = JSON.parse(localStorage.getItem(this.approvalsKey) || '[]');
    
    if (!filters || Object.keys(filters).length === 0) return workflows;
    
    return workflows.filter(workflow => {
      if (filters.status && workflow.status !== filters.status) return false;
      if (filters.currentLevel && workflow.currentLevel !== filters.currentLevel) return false;
      if (filters.dataId && workflow.dataId !== filters.dataId) return false;
      return true;
    });
  }

  // Get pending approvals for current user role
  getPendingApprovals() {
    const userRole = localStorage.getItem('userRole');
    const workflows = this.getWorkflows({ status: APPROVAL_STATUS.PENDING });
    
    // Map roles to approval levels
    const roleToLevel = {
      'data_entry': APPROVAL_LEVELS.SITE,
      'supervisor': APPROVAL_LEVELS.BUSINESS_UNIT,
      'esg_manager': APPROVAL_LEVELS.GROUP_ESG,
      'super_admin': APPROVAL_LEVELS.EXECUTIVE
    };

    const userLevel = roleToLevel[userRole];
    return workflows.filter(w => w.currentLevel === userLevel);
  }

  // Export audit trail
  exportAuditTrail(format = 'json') {
    const trail = this.getAuditTrail();
    
    if (format === 'csv') {
      const headers = ['ID', 'Action', 'User', 'Role', 'Timestamp', 'Details'];
      const rows = trail.map(entry => [
        entry.id,
        entry.action,
        entry.user,
        entry.userRole,
        entry.timestamp,
        JSON.stringify(entry.details)
      ]);
      
      return [headers, ...rows].map(row => row.join(',')).join('\n');
    }
    
    return JSON.stringify(trail, null, 2);
  }
}

export default new AuditSystem();
