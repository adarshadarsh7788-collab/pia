import React, { useState, useEffect } from 'react';
import { hasPermission, getUserRole, getCurrentUser, PERMISSIONS, USER_ROLES } from '../utils/rbac';

const WorkflowDashboard = () => {
  const [workflows, setWorkflows] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [auditEntries, setAuditEntries] = useState([]);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [validationResults, setValidationResults] = useState({
    score: 5,
    completeness: 167,
    errors: 0,
    warnings: 19,
    suggestions: 0
  });

  useEffect(() => {
    loadData();
    
    // Listen for storage changes to update in real-time
    const handleStorageChange = () => {
      loadData();
    };
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const loadData = () => {
    // Load ESG data entries
    const esgData = JSON.parse(localStorage.getItem('esgData') || '[]');
    const alerts = JSON.parse(localStorage.getItem('recentAlerts') || '[]');
    const approvalWorkflows = JSON.parse(localStorage.getItem('approvalWorkflows') || '[]');
    
    // Create workflows from ESG data if they don't exist
    let workflowData = approvalWorkflows;
    if (workflowData.length === 0 && esgData.length > 0) {
      workflowData = esgData.map((data, index) => {
        // Determine workflow status based on ESG data status
        const dataStatus = data.status || 'Pending';
        let workflowStatus = 'pending';
        let approvalLevels = [
          {
            level: 1,
            approverRole: 'SITE',
            approver: 'dataentry1@esgenius.com',
            status: 'approved',
            approvedAt: new Date().toISOString()
          },
          {
            level: 2,
            approverRole: 'BUSINESS UNIT',
            approver: 'supervisor1@esgenius.com',
            status: 'approved',
            approvedAt: new Date().toISOString()
          },
          {
            level: 3,
            approverRole: 'GROUP ESG',
            approver: 'superadmin2@esgenius.com',
            status: 'approved',
            approvedAt: new Date().toISOString()
          },
          {
            level: 4,
            approverRole: 'EXECUTIVE',
            approver: 'superadmin2@esgenius.com',
            status: 'pending'
          }
        ];
        
        // Set workflow status based on data status
        if (dataStatus === 'Submitted') {
          workflowStatus = 'approved';
          approvalLevels[3].status = 'approved';
          approvalLevels[3].approvedAt = new Date().toISOString();
        } else if (dataStatus === 'Failed') {
          workflowStatus = 'rejected';
          approvalLevels[3].status = 'rejected';
          approvalLevels[3].rejectedAt = new Date().toISOString();
          approvalLevels[3].rejectionReason = 'Data quality issues identified';
        }
        
        return {
          id: data.id || `ESG_${Date.now()}_${index}`,
          title: `ESG Data Entry - ${data.companyName || 'Unknown Company'}`,
          submittedBy: data.submittedBy || 'dataentry1@esgenius.com',
          createdAt: data.timestamp || data.createdAt || new Date().toISOString(),
          status: workflowStatus,
          data: data,
          approvalLevels: approvalLevels
        };
      });
      
      localStorage.setItem('approvalWorkflows', JSON.stringify(workflowData));
    }
    
    // Also check for new ESG data that doesn't have workflows yet
    const existingWorkflowIds = workflowData.map(w => w.data?.id).filter(Boolean);
    const newESGData = esgData.filter(data => 
      data.id && !existingWorkflowIds.includes(data.id) && 
      (data.status === 'Pending' || !data.status)
    );
    
    if (newESGData.length > 0) {
      const newWorkflows = newESGData.map((data, index) => ({
        id: data.id || `ESG_${Date.now()}_${index}`,
        title: `ESG Data Entry - ${data.companyName || 'Unknown Company'}`,
        submittedBy: data.submittedBy || 'dataentry1@esgenius.com',
        createdAt: data.timestamp || data.createdAt || new Date().toISOString(),
        status: 'pending',
        data: data,
        approvalLevels: [
          {
            level: 1,
            approverRole: 'SITE',
            approver: 'dataentry1@esgenius.com',
            status: 'approved',
            approvedAt: new Date().toISOString()
          },
          {
            level: 2,
            approverRole: 'BUSINESS UNIT',
            approver: 'supervisor1@esgenius.com',
            status: 'approved',
            approvedAt: new Date().toISOString()
          },
          {
            level: 3,
            approverRole: 'GROUP ESG',
            approver: 'superadmin2@esgenius.com',
            status: 'approved',
            approvedAt: new Date().toISOString()
          },
          {
            level: 4,
            approverRole: 'EXECUTIVE',
            approver: 'superadmin2@esgenius.com',
            status: 'pending'
          }
        ]
      }));
      
      workflowData = [...workflowData, ...newWorkflows];
      localStorage.setItem('approvalWorkflows', JSON.stringify(workflowData));
    }
    
    setWorkflows(workflowData);
    setNotifications(alerts.slice(0, 5));
    
    // Create audit entries from recent activity
    const auditData = [
      {
        timestamp: new Date().toLocaleString(),
        action: 'VALIDATION_RUN',
        user: 'esg_manager',
        category: 'system',
        details: `Processed ${esgData.length} ESG entries`
      },
      ...esgData.slice(0, 3).map(data => ({
        timestamp: new Date(data.timestamp || data.createdAt || Date.now()).toLocaleString(),
        action: 'DATA_ENTRY',
        user: data.submittedBy || 'user',
        category: 'data',
        details: `${data.companyName || 'Company'} ESG data submitted`
      }))
    ];
    
    setAuditEntries(auditData);
  };

  const runValidation = () => {
    const esgData = JSON.parse(localStorage.getItem('esgData') || '[]');
    
    // Calculate validation metrics based on actual data
    let errors = 0;
    let warnings = 0;
    let suggestions = 0;
    
    esgData.forEach(data => {
      // Check for missing required fields
      if (!data.companyName) errors++;
      if (!data.environmental?.scope1Emissions && !data.environmental?.scope2Emissions) warnings++;
      if (!data.social?.totalEmployees) warnings++;
      if (!data.governance?.boardSize) suggestions++;
    });
    
    const completeness = esgData.length > 0 ? Math.min((esgData.length * 50), 200) : 167;
    const score = Math.max(100 - (errors * 20) - (warnings * 5), 0);
    
    setValidationResults({
      score,
      completeness,
      errors,
      warnings,
      suggestions
    });
    
    // Add audit entry for validation
    const newAuditEntry = {
      timestamp: new Date().toLocaleString(),
      action: 'VALIDATION_RUN',
      user: 'esg_manager',
      category: 'system',
      details: `Found ${errors} errors, ${warnings} warnings`
    };
    
    setAuditEntries(prev => [newAuditEntry, ...prev]);
  };

  // Check if current user can approve/reject
  const canApproveReject = () => {
    const userRole = getUserRole();
    return hasPermission(userRole, PERMISSIONS.AUTHORIZE_DATA);
  };

  // Update ESG data status in localStorage
  const updateESGDataStatus = (workflowData, newStatus) => {
    try {
      // Update main ESG data
      const esgData = JSON.parse(localStorage.getItem('esgData') || '[]');
      let updated = false;
      
      const updatedESGData = esgData.map(item => {
        // Match by ID first, then by company name and timestamp
        const matchById = item.id && workflowData.id && item.id === workflowData.id;
        const matchByDetails = item.companyName === workflowData.companyName && 
                              item.timestamp === workflowData.timestamp;
        
        if (matchById || matchByDetails) {
          updated = true;
          console.log('Updating ESG data status:', item.id, 'from', item.status, 'to', newStatus);
          return { ...item, status: newStatus, lastModified: new Date().toISOString() };
        }
        return item;
      });
      
      if (updated) {
        localStorage.setItem('esgData', JSON.stringify(updatedESGData));
        console.log('ESG data updated successfully');
      } else {
        console.warn('No matching ESG data found for workflow:', workflowData.id);
      }
      
      // Update advanced ESG data if exists
      const advancedData = JSON.parse(localStorage.getItem('advanced_esg_data') || '[]');
      if (advancedData.length > 0) {
        const updatedAdvancedData = advancedData.map(item => {
          const matchById = item.id && workflowData.id && item.id === workflowData.id;
          const matchByDetails = item.companyName === workflowData.companyName && 
                                item.timestamp === workflowData.timestamp;
          
          if (matchById || matchByDetails) {
            return { ...item, status: newStatus, lastModified: new Date().toISOString() };
          }
          return item;
        });
        localStorage.setItem('advanced_esg_data', JSON.stringify(updatedAdvancedData));
      }
      
      // Trigger storage event for real-time updates
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'esgData',
        newValue: JSON.stringify(updatedESGData)
      }));
      
      // Also dispatch custom event
      window.dispatchEvent(new CustomEvent('esgDataUpdated', { 
        detail: { status: newStatus, workflowId: workflowData.id } 
      }));
      
      // Force refresh of any open Reports page
      if (window.location.pathname === '/reports') {
        setTimeout(() => {
          window.location.reload();
        }, 500);
      }
      
    } catch (error) {
      console.error('Failed to update ESG data status:', error);
    }
  };

  const handleApprove = (workflowId, level) => {
    if (!canApproveReject()) {
      alert('Access Denied: You do not have permission to approve workflows.');
      return;
    }
    
    const currentUser = getCurrentUser();
    const updatedWorkflows = workflows.map(workflow => {
      if (workflow.id === workflowId) {
        const updatedLevels = workflow.approvalLevels.map(lvl => 
          lvl.level === level ? { ...lvl, status: 'approved', approvedBy: currentUser.email, approvedAt: new Date().toISOString() } : lvl
        );
        
        // Check if all levels are approved
        const allApproved = updatedLevels.every(lvl => lvl.status === 'approved');
        const newWorkflowStatus = allApproved ? 'approved' : 'pending';
        
        // Update ESG data status when workflow is fully approved
        if (allApproved && workflow.data) {
          console.log('Workflow fully approved, updating ESG data status to Submitted');
          updateESGDataStatus(workflow.data, 'Submitted');
        }
        
        return { ...workflow, approvalLevels: updatedLevels, status: newWorkflowStatus };
      }
      return workflow;
    });
    
    setWorkflows(updatedWorkflows);
    localStorage.setItem('approvalWorkflows', JSON.stringify(updatedWorkflows));
    
    // Show success message and create notification
    const workflow = workflows.find(w => w.id === workflowId);
    const allApproved = updatedWorkflows.find(w => w.id === workflowId)?.status === 'approved';
    if (allApproved) {
      alert('✅ Workflow approved successfully! ESG data status updated to "Submitted".');
      createNotification('success', 'Workflow Approved', `${workflow.title} has been fully approved and ESG data status updated to Submitted`, 'approval');
    } else {
      createNotification('info', 'Approval Level Completed', `Level ${level} approval completed for ${workflow.title}`, 'approval');
    }
  };

  const handleReject = (workflowId, level, reason) => {
    if (!canApproveReject()) {
      alert('Access Denied: You do not have permission to reject workflows.');
      return;
    }
    
    const currentUser = getCurrentUser();
    const updatedWorkflows = workflows.map(workflow => {
      if (workflow.id === workflowId) {
        const updatedLevels = workflow.approvalLevels.map(lvl => 
          lvl.level === level ? { ...lvl, status: 'rejected', rejectedBy: currentUser.email, rejectedAt: new Date().toISOString(), rejectionReason: reason } : lvl
        );
        
        // Update ESG data status when workflow is rejected
        if (workflow.data) {
          console.log('Workflow rejected, updating ESG data status to Failed');
          updateESGDataStatus(workflow.data, 'Failed');
        }
        
        return { ...workflow, approvalLevels: updatedLevels, status: 'rejected' };
      }
      return workflow;
    });
    
    setWorkflows(updatedWorkflows);
    localStorage.setItem('approvalWorkflows', JSON.stringify(updatedWorkflows));
    
    // Show success message and create notification
    alert('❌ Workflow rejected successfully! ESG data status updated to "Failed".');
    const workflow = workflows.find(w => w.id === workflowId);
    createNotification('warning', 'Workflow Rejected', `${workflow.title} has been rejected: ${reason}`, 'rejection');
  };

  const handleDelete = (workflowId) => {
    if (!canApproveReject()) {
      alert('Access Denied: You do not have permission to delete workflows.');
      return;
    }
    
    if (confirm('Are you sure you want to delete this workflow? This action cannot be undone.')) {
      const workflow = workflows.find(w => w.id === workflowId);
      const updatedWorkflows = workflows.filter(workflow => workflow.id !== workflowId);
      setWorkflows(updatedWorkflows);
      localStorage.setItem('approvalWorkflows', JSON.stringify(updatedWorkflows));
      alert('🗑️ Workflow deleted successfully!');
      createNotification('info', 'Workflow Deleted', `${workflow.title} has been permanently deleted`, 'deletion');
    }
  };

  const handleDeleteAuditEntry = (index) => {
    if (!canApproveReject()) {
      alert('Access Denied: You do not have permission to delete audit entries.');
      return;
    }
    
    if (confirm('Are you sure you want to delete this audit entry? This action cannot be undone.')) {
      const updatedAuditEntries = auditEntries.filter((_, i) => i !== index);
      setAuditEntries(updatedAuditEntries);
      alert('🗑️ Audit entry deleted successfully!');
    }
  };

  // Handle approve/reject from notifications
  const handleNotificationApprove = (notification) => {
    // Find the related workflow from notification message
    const workflowTitle = notification.message.split(' has been')[0];
    const workflow = workflows.find(w => w.title === workflowTitle && w.status === 'pending');
    
    if (workflow) {
      // Find the next pending level
      const pendingLevel = workflow.approvalLevels.find(level => level.status === 'pending');
      if (pendingLevel) {
        handleApprove(workflow.id, pendingLevel.level);
      }
    }
  };

  const handleNotificationReject = (notification) => {
    // Find the related workflow from notification message
    const workflowTitle = notification.message.split(' has been')[0];
    const workflow = workflows.find(w => w.title === workflowTitle && w.status === 'pending');
    
    if (workflow) {
      // Find the next pending level
      const pendingLevel = workflow.approvalLevels.find(level => level.status === 'pending');
      if (pendingLevel) {
        const reason = prompt('Rejection reason:');
        if (reason) {
          handleReject(workflow.id, pendingLevel.level, reason);
        }
      }
    }
  };

  const createNotification = (type, title, message, category = 'workflow') => {
    const notification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      title,
      message,
      category,
      timestamp: new Date().toISOString(),
      read: false
    };
    
    const existingAlerts = JSON.parse(localStorage.getItem('recentAlerts') || '[]');
    const updatedAlerts = [notification, ...existingAlerts];
    localStorage.setItem('recentAlerts', JSON.stringify(updatedAlerts));
    
    // Dispatch event to update other components
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'recentAlerts',
      newValue: JSON.stringify(updatedAlerts)
    }));
  };

  const pendingCount = workflows.filter(w => w.status === 'pending').length;
  const unreadNotifications = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-4xl">📋</span>
            <h1 className="text-3xl font-bold text-gray-900">Workflow & Approval Dashboard</h1>
          </div>
          <p className="text-gray-600">Manage ESG data approvals, validation, and audit trail</p>
          {!canApproveReject() && (
            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <span className="font-medium">Note:</span> You have view-only access. Approve/Reject functions are restricted to Supervisors and Super Admins.
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Pending Approvals</p>
                <p className="text-3xl font-bold text-gray-900">{pendingCount}</p>
              </div>
              <div className="text-4xl">⏳</div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Unread Notifications</p>
                <p className="text-3xl font-bold text-gray-900">{unreadNotifications}</p>
              </div>
              <div className="text-4xl">🔔</div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Validation Status</p>
                <p className="text-lg font-bold text-green-600">
                  {validationResults.errors === 0 ? 'PASSED' : 'FAILED'}
                </p>
              </div>
              <div className={`text-4xl ${validationResults.errors === 0 ? 'text-green-500' : 'text-red-500'}`}>
                {validationResults.errors === 0 ? '✅' : '❌'}
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Audit Entries</p>
                <p className="text-3xl font-bold text-gray-900">{auditEntries.length}</p>
              </div>
              <div className="text-4xl">📋</div>
            </div>
          </div>
        </div>

        <div className="flex gap-4 mb-8">
          <button 
            onClick={() => setShowApprovalModal(true)}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
          >
            <span>📋</span>
            Review Approvals ({pendingCount})
          </button>
          <button 
            onClick={runValidation}
            className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <span>🔍</span>
            Run Data Validation
          </button>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <span>🔄</span>
            Refresh Dashboard
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Notifications</h2>
            {notifications.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <span className="text-4xl mb-2 block">💭</span>
                <p>No notifications available</p>
                <p className="text-xs mt-1">Workflow actions will appear here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.map((notification, index) => {
                  // Check if this notification is for a pending workflow
                  const workflowTitle = notification.message.split(' has been')[0];
                  const relatedWorkflow = workflows.find(w => w.title === workflowTitle && w.status === 'pending');
                  const isPendingWorkflow = relatedWorkflow && notification.category === 'workflow';
                  
                  return (
                    <div key={index} className={`p-3 rounded-lg border-l-4 ${
                      notification.type === 'success' ? 'bg-green-50 border-green-400' :
                      notification.type === 'warning' ? 'bg-yellow-50 border-yellow-400' :
                      notification.type === 'error' ? 'bg-red-50 border-red-400' :
                      'bg-blue-50 border-blue-400'
                    }`}>
                      <div className="flex items-start gap-2">
                        <span className="text-lg">
                          {notification.type === 'success' ? '✅' :
                           notification.type === 'warning' ? '⚠️' :
                           notification.type === 'error' ? '🚨' : 'ℹ️'}
                        </span>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{notification.title}</p>
                          <p className="text-sm text-gray-600">{notification.message}</p>
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-2">
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                notification.category === 'approval' ? 'bg-green-100 text-green-700' :
                                notification.category === 'rejection' ? 'bg-red-100 text-red-700' :
                                notification.category === 'deletion' ? 'bg-gray-100 text-gray-700' :
                                'bg-blue-100 text-blue-700'
                              }`}>
                                {notification.category}
                              </span>
                              {isPendingWorkflow && canApproveReject() && (
                                <div className="flex gap-1">
                                  <button
                                    onClick={() => handleNotificationApprove(notification)}
                                    className="px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600 flex items-center gap-1"
                                    title="Quick Approve"
                                  >
                                    <span>✅</span>
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => handleNotificationReject(notification)}
                                    className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600 flex items-center gap-1"
                                    title="Quick Reject"
                                  >
                                    <span>❌</span>
                                    Reject
                                  </button>
                                </div>
                              )}
                            </div>
                            <p className="text-xs text-gray-500">
                              {new Date(notification.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Data Validation Results</h2>
            
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <p className="text-sm text-gray-600 mb-1">Validation Score</p>
                <p className="text-3xl font-bold text-green-600">{validationResults.score}%</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Completeness</p>
                <p className="text-3xl font-bold text-gray-900">{validationResults.completeness}%</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">{validationResults.errors}</p>
                <p className="text-sm text-gray-600">Errors</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">{validationResults.warnings}</p>
                <p className="text-sm text-gray-600">Warnings</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{validationResults.suggestions}</p>
                <p className="text-sm text-gray-600">Suggestions</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Audit Trail</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Timestamp</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Action</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">User</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Category</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Details</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {auditEntries.map((entry, index) => (
                  <tr key={index} className="border-b border-gray-100">
                    <td className="py-3 px-4 text-gray-900">{entry.timestamp}</td>
                    <td className="py-3 px-4 text-gray-900">{entry.action}</td>
                    <td className="py-3 px-4 text-gray-900">{entry.user}</td>
                    <td className="py-3 px-4 text-gray-900">{entry.category}</td>
                    <td className="py-3 px-4 text-gray-900">{entry.details}</td>
                    <td className="py-3 px-4">
                      {canApproveReject() && (
                        <button
                          onClick={() => handleDeleteAuditEntry(index)}
                          className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs flex items-center gap-1"
                          title="Delete Audit Entry"
                        >
                          <span>🗑️</span>
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Approval Modal */}
        {showApprovalModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">📋</span>
                    <h2 className="text-2xl font-bold text-gray-900">Approval Workflows</h2>
                  </div>
                  <button 
                    onClick={() => setShowApprovalModal(false)}
                    className="text-2xl hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
                
                <p className="text-gray-600 mb-6">Multi-level approval management</p>
                
                <div className="space-y-6">
                  {workflows.length === 0 ? (
                    <div className="text-center py-8">
                      <span className="text-6xl mb-4 block">📭</span>
                      <p className="text-lg text-gray-500">No workflows found</p>
                      <p className="text-sm text-gray-400">Workflows will appear here when ESG data is submitted for approval</p>
                    </div>
                  ) : (
                    workflows.slice().reverse().map((workflow) => (
                      <div key={workflow.id} className="border rounded-lg p-6 bg-gray-50">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="font-semibold text-gray-900">{workflow.title}</h3>
                            <p className="text-sm text-gray-600">
                              Submitted by {workflow.submittedBy} • {new Date(workflow.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              workflow.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              workflow.status === 'approved' ? 'bg-green-100 text-green-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {workflow.status.toUpperCase()}
                            </span>
                            {canApproveReject() && (
                              <button
                                onClick={() => handleDelete(workflow.id)}
                                className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 text-xs flex items-center gap-1"
                                title="Delete Workflow"
                              >
                                <span>🗑️</span>
                                Delete
                              </button>
                            )}
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          {workflow.approvalLevels.map((level) => (
                            <div key={level.level} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                              <div className="flex items-center gap-3">
                                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                                  level.status === 'approved' ? 'bg-green-500 text-white' :
                                  level.status === 'rejected' ? 'bg-red-500 text-white' :
                                  'bg-gray-300 text-gray-600'
                                }`}>
                                  {level.status === 'approved' ? '✓' : 
                                   level.status === 'rejected' ? '✗' : level.level}
                                </span>
                                <div>
                                  <p className="font-medium">{level.approverRole}</p>
                                  <p className="text-sm text-gray-600">{level.approver}</p>
                                </div>
                              </div>
                              
                              {level.status === 'pending' && workflow.status === 'pending' && (
                                <div className="flex gap-2">
                                  {canApproveReject() ? (
                                    <>
                                      <button
                                        onClick={() => handleApprove(workflow.id, level.level)}
                                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm flex items-center gap-1"
                                      >
                                        <span>✅</span>
                                        Approve
                                      </button>
                                      <button
                                        onClick={() => {
                                          const reason = prompt('Rejection reason:');
                                          if (reason) handleReject(workflow.id, level.level, reason);
                                        }}
                                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm flex items-center gap-1"
                                      >
                                        <span>❌</span>
                                        Reject
                                      </button>
                                    </>
                                  ) : (
                                    <div className="px-4 py-2 bg-gray-100 text-gray-500 rounded-lg text-sm">
                                      🔒 Access Restricted
                                    </div>
                                  )}
                                </div>
                              )}
                              
                              {level.status === 'approved' && (
                                <div className="text-sm text-gray-600">
                                  Approved by {level.approvedBy} on {new Date(level.approvedAt).toLocaleDateString()}
                                </div>
                              )}
                              
                              {level.status === 'rejected' && (
                                <div className="text-sm text-red-600">
                                  Rejected: {level.rejectionReason}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
                
                <div className="flex justify-end mt-6">
                  <button 
                    onClick={() => setShowApprovalModal(false)}
                    className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkflowDashboard;