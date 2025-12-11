import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { getThemeClasses } from '../utils/themeUtils';
import { getUserRole, USER_ROLES } from '../utils/rbac';

const ApprovalsPanel = ({ onClose }) => {
  const { isDark } = useTheme();
  const theme = getThemeClasses(isDark);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const userRole = getUserRole();

  useEffect(() => {
    loadPendingApprovals();
  }, []);

  const loadPendingApprovals = () => {
    const workflows = JSON.parse(localStorage.getItem('approval_workflows') || '[]');
    const pending = workflows.filter(w => w.status === 'pending');
    setPendingApprovals(pending);
  };

  const handleApprove = (workflowId) => {
    const workflows = JSON.parse(localStorage.getItem('approval_workflows') || '[]');
    const workflow = workflows.find(w => w.id === workflowId);
    
    if (workflow) {
      const currentUser = localStorage.getItem('currentUser');
      
      if (userRole === USER_ROLES.SUPERVISOR) {
        workflow.approvals[0].status = 'approved';
        workflow.approvals[0].approver = currentUser;
        workflow.approvals[0].timestamp = new Date().toISOString();
        workflow.currentLevel = 'business_unit';
      } else if (userRole === USER_ROLES.SUPER_ADMIN) {
        workflow.approvals[1].status = 'approved';
        workflow.approvals[1].approver = currentUser;
        workflow.approvals[1].timestamp = new Date().toISOString();
        workflow.status = 'approved';
      }
      
      localStorage.setItem('approval_workflows', JSON.stringify(workflows));
      
      // Update data status
      const esgData = JSON.parse(localStorage.getItem('esgData') || '[]');
      const dataEntry = esgData.find(d => d.id === workflow.dataId);
      if (dataEntry) {
        dataEntry.status = workflow.status === 'approved' ? 'Approved' : 'Pending Approval';
        localStorage.setItem('esgData', JSON.stringify(esgData));
      }
      
      // Create notification
      const alerts = JSON.parse(localStorage.getItem('recentAlerts') || '[]');
      alerts.unshift({
        id: Date.now(),
        type: 'success',
        title: 'Data Approved',
        message: `${currentUser} approved ESG data submission`,
        category: 'Approval',
        timestamp: new Date().toISOString(),
        read: false
      });
      localStorage.setItem('recentAlerts', JSON.stringify(alerts));
      
      loadPendingApprovals();
      alert('Approved successfully!');
    }
  };

  const handleReject = (workflowId) => {
    const workflows = JSON.parse(localStorage.getItem('approval_workflows') || '[]');
    const workflow = workflows.find(w => w.id === workflowId);
    
    if (workflow) {
      workflow.status = 'rejected';
      localStorage.setItem('approval_workflows', JSON.stringify(workflows));
      
      // Update data status
      const esgData = JSON.parse(localStorage.getItem('esgData') || '[]');
      const dataEntry = esgData.find(d => d.id === workflow.dataId);
      if (dataEntry) {
        dataEntry.status = 'Rejected';
        localStorage.setItem('esgData', JSON.stringify(esgData));
      }
      
      loadPendingApprovals();
      alert('Rejected successfully!');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`max-w-4xl w-full max-h-[90vh] overflow-hidden ${theme.bg.card} rounded-xl shadow-2xl`}>
        <div className={`p-6 border-b ${theme.border.primary}`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className={`text-2xl font-bold ${theme.text.primary}`}>✅ Pending Approvals</h2>
              <p className={`text-sm ${theme.text.secondary}`}>Review and approve data submissions</p>
            </div>
            <button onClick={onClose} className="text-2xl hover:opacity-70">✕</button>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[70vh] p-4">
          {pendingApprovals.length === 0 ? (
            <div className="text-center py-12">
              <p className={`text-lg ${theme.text.secondary}`}>No pending approvals</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingApprovals.map((workflow) => (
                <div key={workflow.id} className={`p-4 rounded-lg border ${theme.border.primary} ${theme.bg.subtle}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className={`font-semibold ${theme.text.primary}`}>
                        {workflow.dataType}
                      </h4>
                      <p className={`text-sm ${theme.text.secondary}`}>
                        Submitted by: {workflow.submittedBy}
                      </p>
                      <p className={`text-xs ${theme.text.muted}`}>
                        {new Date(workflow.submittedAt).toLocaleString()}
                      </p>
                    </div>
                    <span className="px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                      PENDING
                    </span>
                  </div>

                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => handleApprove(workflow.id)}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      ✅ Approve
                    </button>
                    <button
                      onClick={() => handleReject(workflow.id)}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      ❌ Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={`p-4 border-t ${theme.border.primary}`}>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApprovalsPanel;
