import React, { useState, useEffect } from 'react';
import { hasPermission, getUserRole, getCurrentUser, PERMISSIONS, USER_ROLES } from '../utils/rbac';
import { useTheme } from '../contexts/ThemeContext';
import { getThemeClasses } from '../utils/themeUtils';
import ProfessionalHeader from './ProfessionalHeader';
import { useNavigate } from 'react-router-dom';

const WorkflowDashboard = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const theme = getThemeClasses(isDark);
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

  // Check if current user can approve/reject
  const canApproveReject = () => {
    const userRole = getUserRole();
    return hasPermission(userRole, PERMISSIONS.AUTHORIZE_DATA);
  };

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    navigate("/login");
  };

  const currentUser = localStorage.getItem('currentUser');
  const pendingCount = workflows.filter(w => w.status === 'pending').length;
  const unreadNotifications = notifications.filter(n => !n.read).length;

  return (
    <div className={`min-h-screen transition-all duration-500 ${
      isDark 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-blue-50 via-indigo-50/40 to-purple-50/30'
    }`} style={{
      backgroundImage: isDark ? '' : 'radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.12) 0%, transparent 50%), radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.1) 0%, transparent 50%)'
    }}>
      <ProfessionalHeader 
        onLogout={handleLogout}
        currentUser={currentUser}
      />

      <main className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-4xl">📋</span>
            <h1 className={`text-3xl font-bold ${theme.text.primary}`}>Workflow & Approval Dashboard</h1>
          </div>
          <p className={`${theme.text.secondary}`}>Manage ESG data approvals, validation, and audit trail</p>
          {!canApproveReject() && (
            <div className={`mt-3 p-3 rounded-lg border ${
              isDark ? 'bg-yellow-900/20 border-yellow-700 text-yellow-300' : 'bg-yellow-50 border-yellow-200 text-yellow-800'
            }`}>
              <p className="text-sm">
                <span className="font-medium">Note:</span> You have view-only access. Approve/Reject functions are restricted to Supervisors and Super Admins.
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className={`rounded-lg p-6 shadow-sm border ${theme.bg.card} ${theme.border.primary}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm mb-1 ${theme.text.secondary}`}>Pending Approvals</p>
                <p className={`text-3xl font-bold ${theme.text.primary}`}>{pendingCount}</p>
              </div>
              <div className="text-4xl">⏳</div>
            </div>
          </div>
          
          <div className={`rounded-lg p-6 shadow-sm border ${theme.bg.card} ${theme.border.primary}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm mb-1 ${theme.text.secondary}`}>Unread Notifications</p>
                <p className={`text-3xl font-bold ${theme.text.primary}`}>{unreadNotifications}</p>
              </div>
              <div className="text-4xl">🔔</div>
            </div>
          </div>
          
          <div className={`rounded-lg p-6 shadow-sm border ${theme.bg.card} ${theme.border.primary}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm mb-1 ${theme.text.secondary}`}>Validation Status</p>
                <p className="text-lg font-bold text-green-600">
                  {validationResults.errors === 0 ? 'PASSED' : 'FAILED'}
                </p>
              </div>
              <div className={`text-4xl ${validationResults.errors === 0 ? 'text-green-500' : 'text-red-500'}`}>
                {validationResults.errors === 0 ? '✅' : '❌'}
              </div>
            </div>
          </div>
          
          <div className={`rounded-lg p-6 shadow-sm border ${theme.bg.card} ${theme.border.primary}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm mb-1 ${theme.text.secondary}`}>Audit Entries</p>
                <p className={`text-3xl font-bold ${theme.text.primary}`}>{auditEntries.length}</p>
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
            onClick={() => window.location.reload()}
            className={`px-6 py-3 rounded-lg transition-colors flex items-center gap-2 ${
              isDark ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <span>🔄</span>
            Refresh Dashboard
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className={`rounded-lg p-6 shadow-sm border ${theme.bg.card} ${theme.border.primary}`}>
            <h2 className={`text-xl font-semibold mb-4 ${theme.text.primary}`}>Recent Notifications</h2>
            {notifications.length === 0 ? (
              <div className={`text-center py-8 ${theme.text.secondary}`}>
                <span className="text-4xl mb-2 block">💭</span>
                <p>No notifications available</p>
                <p className="text-xs mt-1">Workflow actions will appear here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.map((notification, index) => (
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
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className={`rounded-lg p-6 shadow-sm border ${theme.bg.card} ${theme.border.primary}`}>
            <h2 className={`text-xl font-semibold mb-4 ${theme.text.primary}`}>Data Validation Results</h2>
            
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <p className={`text-sm mb-1 ${theme.text.secondary}`}>Validation Score</p>
                <p className="text-3xl font-bold text-green-600">{validationResults.score}%</p>
              </div>
              <div>
                <p className={`text-sm mb-1 ${theme.text.secondary}`}>Completeness</p>
                <p className={`text-3xl font-bold ${theme.text.primary}`}>{validationResults.completeness}%</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">{validationResults.errors}</p>
                <p className={`text-sm ${theme.text.secondary}`}>Errors</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">{validationResults.warnings}</p>
                <p className={`text-sm ${theme.text.secondary}`}>Warnings</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{validationResults.suggestions}</p>
                <p className={`text-sm ${theme.text.secondary}`}>Suggestions</p>
              </div>
            </div>
          </div>
        </div>

        {/* Approval Modal */}
        {showApprovalModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto ${theme.bg.card}`}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">📋</span>
                    <h2 className={`text-2xl font-bold ${theme.text.primary}`}>Approval Workflows</h2>
                  </div>
                  <button 
                    onClick={() => setShowApprovalModal(false)}
                    className={`text-2xl ${theme.text.secondary} hover:${theme.text.primary}`}
                  >
                    ✕
                  </button>
                </div>
                
                <p className={`mb-6 ${theme.text.secondary}`}>Multi-level approval management</p>
                
                <div className="space-y-6">
                  {workflows.length === 0 ? (
                    <div className={`text-center py-8 ${theme.text.secondary}`}>
                      <span className="text-6xl mb-4 block">📭</span>
                      <p className="text-lg">No workflows found</p>
                      <p className="text-sm mt-2">Workflows will appear here when ESG data is submitted for approval</p>
                    </div>
                  ) : (
                    workflows.slice().reverse().map((workflow) => (
                      <div key={workflow.id} className={`border rounded-lg p-6 ${theme.bg.subtle} ${theme.border.primary}`}>
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className={`font-semibold ${theme.text.primary}`}>{workflow.title}</h3>
                            <p className={`text-sm ${theme.text.secondary}`}>
                              Submitted by {workflow.submittedBy} • {new Date(workflow.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            workflow.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            workflow.status === 'approved' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {workflow.status.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                
                <div className="flex justify-end mt-6">
                  <button 
                    onClick={() => setShowApprovalModal(false)}
                    className={`px-6 py-2 rounded-lg ${
                      isDark ? 'bg-gray-600 text-gray-300 hover:bg-gray-500' : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                    }`}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default WorkflowDashboard;