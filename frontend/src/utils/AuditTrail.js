// ESG Data Audit Trail and Change Tracking System
export class AuditTrail {
  static auditLog = [];
  static maxLogSize = 1000;

  static logChange(action, data, user = 'system', metadata = {}) {
    const auditEntry = {
      id: this.generateAuditId(),
      timestamp: new Date().toISOString(),
      action,
      user,
      data: this.sanitizeData(data),
      metadata,
      sessionId: this.getSessionId(),
      ipAddress: this.getClientIP(),
      userAgent: navigator.userAgent
    };

    this.auditLog.unshift(auditEntry);
    
    // Maintain log size limit
    if (this.auditLog.length > this.maxLogSize) {
      this.auditLog = this.auditLog.slice(0, this.maxLogSize);
    }

    // Persist to localStorage
    this.persistAuditLog();
    
    return auditEntry.id;
  }

  static generateAuditId() {
    return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  static getSessionId() {
    let sessionId = sessionStorage.getItem('esg_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('esg_session_id', sessionId);
    }
    return sessionId;
  }

  static getClientIP() {
    // In a real application, this would be handled by the backend
    return 'client_ip_masked';
  }

  static sanitizeData(data) {
    // Remove sensitive information and limit data size
    if (!data) return null;
    
    const sanitized = JSON.parse(JSON.stringify(data));
    
    // Remove sensitive fields
    const sensitiveFields = ['password', 'token', 'secret', 'key'];
    this.removeSensitiveFields(sanitized, sensitiveFields);
    
    // Limit data size
    const dataString = JSON.stringify(sanitized);
    if (dataString.length > 5000) {
      return { 
        _truncated: true, 
        _originalSize: dataString.length,
        summary: this.createDataSummary(sanitized)
      };
    }
    
    return sanitized;
  }

  static removeSensitiveFields(obj, sensitiveFields) {
    if (typeof obj !== 'object' || obj === null) return;
    
    Object.keys(obj).forEach(key => {
      if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
        obj[key] = '[REDACTED]';
      } else if (typeof obj[key] === 'object') {
        this.removeSensitiveFields(obj[key], sensitiveFields);
      }
    });
  }

  static createDataSummary(data) {
    if (Array.isArray(data)) {
      return {
        type: 'array',
        length: data.length,
        sample: data.slice(0, 2)
      };
    } else if (typeof data === 'object') {
      return {
        type: 'object',
        keys: Object.keys(data),
        sampleValues: Object.fromEntries(
          Object.entries(data).slice(0, 3)
        )
      };
    }
    return data;
  }

  static persistAuditLog() {
    try {
      localStorage.setItem('esg_audit_log', JSON.stringify(this.auditLog));
    } catch (error) {
      console.warn('Failed to persist audit log:', error);
    }
  }

  static loadAuditLog() {
    try {
      const stored = localStorage.getItem('esg_audit_log');
      if (stored) {
        this.auditLog = JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Failed to load audit log:', error);
      this.auditLog = [];
    }
  }

  static getAuditLog(filters = {}) {
    let filtered = [...this.auditLog];

    // Apply filters
    if (filters.user) {
      filtered = filtered.filter(entry => 
        entry.user.toLowerCase().includes(filters.user.toLowerCase())
      );
    }

    if (filters.action) {
      filtered = filtered.filter(entry => 
        entry.action.toLowerCase().includes(filters.action.toLowerCase())
      );
    }

    if (filters.startDate) {
      filtered = filtered.filter(entry => 
        new Date(entry.timestamp) >= new Date(filters.startDate)
      );
    }

    if (filters.endDate) {
      filtered = filtered.filter(entry => 
        new Date(entry.timestamp) <= new Date(filters.endDate)
      );
    }

    if (filters.sessionId) {
      filtered = filtered.filter(entry => entry.sessionId === filters.sessionId);
    }

    return filtered;
  }

  static trackDataEntry(data, user) {
    return this.logChange('DATA_ENTRY', data, user, {
      category: 'esg_data',
      recordCount: Array.isArray(data) ? data.length : 1,
      categories: this.extractCategories(data)
    });
  }

  static trackDataUpdate(oldData, newData, user) {
    const changes = this.detectChanges(oldData, newData);
    return this.logChange('DATA_UPDATE', { changes, newData }, user, {
      category: 'esg_data',
      changeCount: changes.length,
      fieldsChanged: changes.map(c => c.field)
    });
  }

  static trackDataDeletion(data, user) {
    return this.logChange('DATA_DELETE', data, user, {
      category: 'esg_data',
      recordCount: Array.isArray(data) ? data.length : 1
    });
  }

  static trackApproval(data, approver, decision) {
    return this.logChange('APPROVAL_ACTION', { data, decision }, approver, {
      category: 'workflow',
      decision,
      recordCount: Array.isArray(data) ? data.length : 1
    });
  }

  static trackLogin(user) {
    return this.logChange('USER_LOGIN', null, user, {
      category: 'authentication'
    });
  }

  static trackLogout(user) {
    return this.logChange('USER_LOGOUT', null, user, {
      category: 'authentication'
    });
  }

  static trackReportGeneration(reportType, user, parameters) {
    return this.logChange('REPORT_GENERATED', parameters, user, {
      category: 'reporting',
      reportType
    });
  }

  static detectChanges(oldData, newData) {
    const changes = [];
    
    if (!oldData || !newData) return changes;

    const compareObjects = (old, current, path = '') => {
      Object.keys(current).forEach(key => {
        const currentPath = path ? `${path}.${key}` : key;
        
        if (old[key] !== current[key]) {
          if (typeof current[key] === 'object' && current[key] !== null && 
              typeof old[key] === 'object' && old[key] !== null) {
            compareObjects(old[key], current[key], currentPath);
          } else {
            changes.push({
              field: currentPath,
              oldValue: old[key],
              newValue: current[key],
              changeType: old[key] === undefined ? 'added' : 'modified'
            });
          }
        }
      });

      // Check for deleted fields
      Object.keys(old).forEach(key => {
        if (!(key in current)) {
          const currentPath = path ? `${path}.${key}` : key;
          changes.push({
            field: currentPath,
            oldValue: old[key],
            newValue: undefined,
            changeType: 'deleted'
          });
        }
      });
    };

    compareObjects(oldData, newData);
    return changes;
  }

  static extractCategories(data) {
    if (!data) return [];
    
    if (Array.isArray(data)) {
      return [...new Set(data.map(item => item.category).filter(Boolean))];
    } else if (data.category) {
      return [data.category];
    } else {
      return Object.keys(data).filter(key => 
        ['environmental', 'social', 'governance'].includes(key)
      );
    }
  }

  static generateAuditReport(filters = {}) {
    const entries = this.getAuditLog(filters);
    
    const report = {
      generatedAt: new Date().toISOString(),
      totalEntries: entries.length,
      dateRange: {
        start: entries.length > 0 ? entries[entries.length - 1].timestamp : null,
        end: entries.length > 0 ? entries[0].timestamp : null
      },
      summary: this.generateAuditSummary(entries),
      entries: entries.map(entry => ({
        ...entry,
        data: entry.data?._truncated ? '[TRUNCATED]' : entry.data
      }))
    };

    return report;
  }

  static generateAuditSummary(entries) {
    const summary = {
      actionCounts: {},
      userCounts: {},
      categoryCounts: {},
      dailyActivity: {}
    };

    entries.forEach(entry => {
      // Action counts
      summary.actionCounts[entry.action] = (summary.actionCounts[entry.action] || 0) + 1;
      
      // User counts
      summary.userCounts[entry.user] = (summary.userCounts[entry.user] || 0) + 1;
      
      // Category counts
      if (entry.metadata?.category) {
        summary.categoryCounts[entry.metadata.category] = 
          (summary.categoryCounts[entry.metadata.category] || 0) + 1;
      }
      
      // Daily activity
      const date = entry.timestamp.split('T')[0];
      summary.dailyActivity[date] = (summary.dailyActivity[date] || 0) + 1;
    });

    return summary;
  }

  static exportAuditLog(format = 'json', filters = {}) {
    const report = this.generateAuditReport(filters);
    
    if (format === 'csv') {
      return this.convertToCSV(report.entries);
    }
    
    return JSON.stringify(report, null, 2);
  }

  static convertToCSV(entries) {
    if (entries.length === 0) return '';
    
    const headers = ['Timestamp', 'Action', 'User', 'Session ID', 'Metadata'];
    const rows = entries.map(entry => [
      entry.timestamp,
      entry.action,
      entry.user,
      entry.sessionId,
      JSON.stringify(entry.metadata || {})
    ]);
    
    return [headers, ...rows].map(row => 
      row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(',')
    ).join('\n');
  }

  static clearAuditLog() {
    this.auditLog = [];
    localStorage.removeItem('esg_audit_log');
  }

  static getAuditStats() {
    return {
      totalEntries: this.auditLog.length,
      oldestEntry: this.auditLog.length > 0 ? this.auditLog[this.auditLog.length - 1].timestamp : null,
      newestEntry: this.auditLog.length > 0 ? this.auditLog[0].timestamp : null,
      uniqueUsers: [...new Set(this.auditLog.map(entry => entry.user))].length,
      uniqueSessions: [...new Set(this.auditLog.map(entry => entry.sessionId))].length
    };
  }
}

// Initialize audit log on module load
AuditTrail.loadAuditLog();

export default AuditTrail;