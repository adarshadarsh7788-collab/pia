import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { getThemeClasses } from '../utils/themeUtils';
import AuditSystem, { APPROVAL_LEVELS, APPROVAL_STATUS } from '../utils/auditSystem';

const ApprovalWorkflow = ({ onClose }) => {
  const { isDark } = useTheme();
  const theme = getThemeClasses(isDark);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [allWorkflows, setAllWorkflows] = useState([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [comments, setComments] = useState('');
  const [activeTab, setActiveTab] = useState('pending');

  useEffect(() => {
    loadWorkflows();
  }, []);

  const loadWorkflows = () => {
    setPendingApprovals(AuditSystem.getPendingApprovals());
    setAllWorkflows(AuditSystem.getWorkflows());
  };

  const handleApprove = (workflowId) => {
    try {
      AuditSystem.approveWorkflow(workflowId, comments);
      setComments('');
      setSelectedWorkflow(null);
      loadWorkflows();
      alert('Approved successfully!');
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const handleReject = (workflowId) => {
    if (!comments.trim()) {
      alert('Please provide rejection comments');
      return;
    }
    try {
      AuditSystem.rejectWorkflow(workflowId, comments);
      setComments('');
      setSelectedWorkflow(null);
      loadWorkflows();
      alert('Rejected successfully!');
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const getLevelIcon = (level) => {
    const icons = {
      [APPROVAL_LEVELS.SITE]: '🏢',
      [APPROVAL_LEVELS.BUSINESS_UNIT]: '🏭',
      [APPROVAL_LEVELS.GROUP_ESG]: '🌍',
      [APPROVAL_LEVELS.EXECUTIVE]: '👔'
    };
    return icons[level] || '📋';
  };

  const getStatusColor = (status) => {
    const colors = {
      [APPROVAL_STATUS.PENDING]: 'bg-yellow-100 text-yellow-800',
      [APPROVAL_STATUS.APPROVED]: 'bg-green-100 text-green-800',
      [APPROVAL_STATUS.REJECTED]: 'bg-red-100 text-red-800',
      [APPROVAL_STATUS.RETURNED]: 'bg-blue-100 text-blue-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const WorkflowCard = ({ workflow }) => (
    <div className={`p-4 rounded-lg border ${theme.border.primary} ${theme.bg.subtle}`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className={`font-semibold ${theme.text.primary}`}>
            {workflow.dataType} - {workflow.dataId}
          </h4>
          <p className={`text-sm ${theme.text.secondary}`}>
            Submitted by: {workflow.submittedBy}
          </p>
          <p className={`text-xs ${theme.text.muted}`}>
            {new Date(workflow.submittedAt).toLocaleString()}
          </p>
        </div>
        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(workflow.status)}`}>
          {workflow.status.toUpperCase()}
        </span>
      </div>

      {/* Approval Progress */}
      <div className="space-y-2 mb-3">
        {workflow.approvals.map((approval, index) => (
          <div key={index} className="flex items-center gap-2">
            <span className="text-lg">{getLevelIcon(approval.level)}</span>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className={`text-sm font-medium ${theme.text.primary}`}>
                  {approval.level.replace('_', ' ').toUpperCase()}
                </span>
                <span className={`text-xs px-2 py-1 rounded ${getStatusColor(approval.status)}`}>
                  {approval.status}
                </span>
              </div>
              {approval.approver && (
                <div className={`text-xs ${theme.text.muted}`}>
                  {approval.approver} - {new Date(approval.timestamp).toLocaleString()}
                  {approval.comments && <p className="italic mt-1">"{approval.comments}"</p>}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      {workflow.status === APPROVAL_STATUS.PENDING && workflow.currentLevel === getCurrentUserLevel() && (
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedWorkflow(workflow)}
            className="flex-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
          >
            Review
          </button>
        </div>
      )}
    </div>
  );

  const getCurrentUserLevel = () => {
    const userRole = localStorage.getItem('userRole');
    const roleToLevel = {
      'data_entry': APPROVAL_LEVELS.SITE,
      'supervisor': APPROVAL_LEVELS.BUSINESS_UNIT,
      'esg_manager': APPROVAL_LEVELS.GROUP_ESG,
      'super_admin': APPROVAL_LEVELS.EXECUTIVE
    };
    return roleToLevel[userRole];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`max-w-6xl w-full max-h-[90vh] overflow-hidden ${theme.bg.card} rounded-xl shadow-2xl`}>
        {/* Header */}
        <div className="p-6 bg-white shadow-lg border-b-2 border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold flex items-center gap-3 text-gray-800">
                <span className="text-4xl">✅</span>
                Approval Workflows
              </h2>
              <p className="text-gray-600 mt-1">Multi-level approval management</p>
            </div>
            <button onClick={onClose} className="text-3xl text-gray-600 hover:text-red-500 hover:rotate-90 transition-all duration-300 hover:bg-gray-100 w-10 h-10 rounded-full flex items-center justify-center">✕</button>
          </div>
        </div>

        {/* Tabs */}
        <div className={`flex border-b ${theme.border.primary}`}>
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-6 py-3 font-medium ${activeTab === 'pending' ? `${theme.bg.accent} ${theme.text.accent}` : theme.text.secondary}`}
          >
            Pending ({pendingApprovals.length})
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`px-6 py-3 font-medium ${activeTab === 'all' ? `${theme.bg.accent} ${theme.text.accent}` : theme.text.secondary}`}
          >
            All Workflows ({allWorkflows.length})
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[60vh] p-4">
          {selectedWorkflow ? (
            /* Review Modal */
            <div className={`p-6 rounded-lg border ${theme.border.primary} ${theme.bg.subtle}`}>
              <h3 className={`text-lg font-bold ${theme.text.primary} mb-4`}>Review Workflow</h3>
              <WorkflowCard workflow={selectedWorkflow} />
              
              <div className="mt-4">
                <label className={`block text-sm font-medium ${theme.text.secondary} mb-2`}>
                  Comments
                </label>
                <textarea
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  className={`w-full px-3 py-2 rounded border ${theme.bg.input} ${theme.border.input} ${theme.text.primary}`}
                  rows="4"
                  placeholder="Add your comments..."
                />
              </div>

              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => handleApprove(selectedWorkflow.id)}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  ✅ Approve
                </button>
                <button
                  onClick={() => handleReject(selectedWorkflow.id)}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  ❌ Reject
                </button>
                <button
                  onClick={() => {
                    setSelectedWorkflow(null);
                    setComments('');
                  }}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            /* Workflow List */
            <div className="space-y-3">
              {(activeTab === 'pending' ? pendingApprovals : allWorkflows).length === 0 ? (
                <div className="text-center py-12">
                  <p className={`text-lg ${theme.text.secondary}`}>No workflows found</p>
                </div>
              ) : (
                (activeTab === 'pending' ? pendingApprovals : allWorkflows).map(workflow => (
                  <WorkflowCard key={workflow.id} workflow={workflow} />
                ))
              )}
            </div>
          )}
        </div>

        {/* Footer */}
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

export default ApprovalWorkflow;
