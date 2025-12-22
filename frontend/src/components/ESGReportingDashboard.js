import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { getThemeClasses } from '../utils/themeUtils';
import { Button, Toast } from './ProfessionalUX';
import { GlobalFrameworks } from '../modules/reporting/GlobalFrameworks';
import { ExternalAuditorPortal } from '../modules/reporting/ExternalAuditorPortal';

const ESGReportingDashboard = () => {
  const { isDark } = useTheme();
  const theme = getThemeClasses(isDark);
  const [activeTab, setActiveTab] = useState('frameworks');
  const [selectedFrameworks, setSelectedFrameworks] = useState(['GRI', 'SASB', 'TCFD']);
  const [reportResults, setReportResults] = useState({});
  const [auditorPortal, setAuditorPortal] = useState({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const frameworks = [
    { id: 'GRI', name: 'Global Reporting Initiative', description: 'Universal sustainability reporting standard' },
    { id: 'SASB', name: 'SASB Standards', description: 'Industry-specific sustainability metrics' },
    { id: 'TCFD', name: 'TCFD Framework', description: 'Climate-related financial disclosures' },
    { id: 'BRSR', name: 'BRSR (India)', description: 'Business Responsibility & Sustainability Reporting' },
    { id: 'EU_CSRD', name: 'EU CSRD', description: 'Corporate Sustainability Reporting Directive' }
  ];

  const generateFrameworkReports = async () => {
    setLoading(true);
    try {
      const esgData = JSON.parse(localStorage.getItem('esgData') || '[]');
      const results = GlobalFrameworks.generateFrameworkReports(esgData, selectedFrameworks);
      setReportResults(results);
      showToast('Framework reports generated successfully', 'success');
    } catch (error) {
      showToast('Failed to generate reports', 'error');
    }
    setLoading(false);
  };

  const initializeAuditorPortal = async () => {
    setLoading(true);
    try {
      const auditorData = {
        auditors: [
          { id: 1, name: 'External Auditor 1', status: 'active', accessLevel: 'full_audit' },
          { id: 2, name: 'Verification Team', status: 'active', accessLevel: 'verification' }
        ],
        auditTrails: [],
        evidence: [],
        audits: []
      };
      
      const portal = ExternalAuditorPortal.manageAuditorPortal(auditorData, [], []);
      setAuditorPortal(portal);
      showToast('Auditor portal initialized', 'success');
    } catch (error) {
      showToast('Failed to initialize auditor portal', 'error');
    }
    setLoading(false);
  };

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const deleteReport = (framework) => {
    setReportResults(prev => ({
      ...prev,
      reports: Object.fromEntries(Object.entries(prev.reports).filter(([key]) => key !== framework))
    }));
    showToast(`${framework} report deleted`, 'success');
  };

  const deleteGap = (index) => {
    setReportResults(prev => ({
      ...prev,
      gaps: prev.gaps.filter((_, i) => i !== index)
    }));
    showToast('Gap deleted', 'success');
  };

  const renderFrameworksTab = () => (
    <div className="space-y-6">
      <div className={`p-6 rounded-lg ${theme.bg.card}`}>
        <h3 className={`text-xl font-semibold mb-4 ${theme.text.primary}`}>
          Select Reporting Frameworks
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {frameworks.map(framework => (
            <div
              key={framework.id}
              className={`p-4 border rounded-lg cursor-pointer transition-all ${
                selectedFrameworks.includes(framework.id)
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300'
              }`}
              onClick={() => {
                setSelectedFrameworks(prev =>
                  prev.includes(framework.id)
                    ? prev.filter(f => f !== framework.id)
                    : [...prev, framework.id]
                );
              }}
            >
              <h4 className={`font-semibold ${theme.text.primary}`}>{framework.name}</h4>
              <p className={`text-sm ${theme.text.secondary}`}>{framework.description}</p>
            </div>
          ))}
        </div>
        
        <Button
          variant="primary"
          onClick={generateFrameworkReports}
          disabled={loading || selectedFrameworks.length === 0}
        >
          Generate Reports
        </Button>
      </div>

      {reportResults.reports && Object.keys(reportResults.reports).length > 0 && (
        <div className={`p-6 rounded-lg ${theme.bg.card}`}>
          <h3 className={`text-xl font-semibold mb-4 ${theme.text.primary}`}>
            Generated Reports
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(reportResults.reports).map(([framework, report]) => (
              <div key={framework} className={`p-4 border rounded-lg ${theme.bg.subtle} relative`}>
                <button
                  onClick={() => deleteReport(framework)}
                  className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                  title="Delete report"
                >
                  ✕
                </button>
                <h4 className={`font-semibold ${theme.text.primary}`}>{framework}</h4>
                <div className="mt-2 space-y-1 text-sm">
                  <div>Completeness: {report.completeness?.toFixed(1)}%</div>
                  <div>Quality Score: {report.qualityScore?.toFixed(1)}/100</div>
                  <div>Sections: {report.sections?.length || 0}</div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3 w-full"
                  onClick={() => showToast(`${framework} report downloaded`, 'success')}
                >
                  Download Report
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {reportResults.gaps && reportResults.gaps.length > 0 && (
        <div className={`p-6 rounded-lg ${theme.bg.card}`}>
          <h3 className={`text-xl font-semibold mb-4 ${theme.text.primary}`}>
            Reporting Gaps
          </h3>
          
          <div className="space-y-2">
            {reportResults.gaps.map((gap, index) => (
              <div
                key={index}
                className={`p-3 rounded border-l-4 relative ${
                  gap.severity === 'high' ? 'border-red-500 bg-red-50' : 'border-yellow-500 bg-yellow-50'
                }`}
              >
                <button
                  onClick={() => deleteGap(index)}
                  className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                  title="Delete gap"
                >
                  ✕
                </button>
                <div className="font-medium">{gap.framework}</div>
                <div className="text-sm text-gray-600">{gap.description}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderAuditorPortalTab = () => (
    <div className="space-y-6">
      <div className={`p-6 rounded-lg ${theme.bg.card}`}>
        <h3 className={`text-xl font-semibold mb-4 ${theme.text.primary}`}>
          External Auditor Portal
        </h3>
        
        <Button
          variant="primary"
          onClick={initializeAuditorPortal}
          disabled={loading}
          className="mb-4"
        >
          Initialize Auditor Portal
        </Button>

        {auditorPortal.accessManagement && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className={`p-4 rounded-lg ${theme.bg.subtle}`}>
              <h4 className={`font-semibold mb-2 ${theme.text.primary}`}>Access Management</h4>
              <div className="space-y-1 text-sm">
                <div>Active Auditors: {auditorPortal.accessManagement.activeAuditors?.length || 0}</div>
                <div>Pending Requests: {auditorPortal.accessManagement.pendingRequests?.length || 0}</div>
                <div>Access Levels: {auditorPortal.accessManagement.accessLevels?.length || 0}</div>
              </div>
            </div>

            <div className={`p-4 rounded-lg ${theme.bg.subtle}`}>
              <h4 className={`font-semibold mb-2 ${theme.text.primary}`}>Data Verification</h4>
              <div className="space-y-1 text-sm">
                <div>Total Tasks: {auditorPortal.dataVerification?.totalTasks || 0}</div>
                <div>Completed: {auditorPortal.dataVerification?.completedTasks || 0}</div>
                <div>Verification Rate: {auditorPortal.dataVerification?.verificationRate?.toFixed(1) || 0}%</div>
              </div>
            </div>

            <div className={`p-4 rounded-lg ${theme.bg.subtle}`}>
              <h4 className={`font-semibold mb-2 ${theme.text.primary}`}>Evidence Repository</h4>
              <div className="space-y-1 text-sm">
                <div>Total Documents: {auditorPortal.evidenceRepository?.totalDocuments || 0}</div>
                <div>Verified: {Object.keys(auditorPortal.evidenceRepository?.verificationStatus || {}).length}</div>
                <div>Missing Evidence: {auditorPortal.evidenceRepository?.missingEvidence?.length || 0}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {auditorPortal.auditProgress && (
        <div className={`p-6 rounded-lg ${theme.bg.card}`}>
          <h3 className={`text-xl font-semibold mb-4 ${theme.text.primary}`}>
            Audit Progress
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className={`font-medium mb-2 ${theme.text.primary}`}>Active Audits</h4>
              <div className="space-y-2">
                {auditorPortal.auditProgress.activeAudits?.length > 0 ? (
                  auditorPortal.auditProgress.activeAudits.map((audit, index) => (
                    <div key={index} className={`p-3 rounded ${theme.bg.subtle}`}>
                      <div className="font-medium">{audit.name || `Audit ${index + 1}`}</div>
                      <div className="text-sm text-gray-600">Status: {audit.status}</div>
                    </div>
                  ))
                ) : (
                  <div className="text-gray-500">No active audits</div>
                )}
              </div>
            </div>

            <div>
              <h4 className={`font-medium mb-2 ${theme.text.primary}`}>Completed Audits</h4>
              <div className="space-y-2">
                {auditorPortal.auditProgress.completedAudits?.length > 0 ? (
                  auditorPortal.auditProgress.completedAudits.map((audit, index) => (
                    <div key={index} className={`p-3 rounded ${theme.bg.subtle}`}>
                      <div className="font-medium">{audit.name || `Audit ${index + 1}`}</div>
                      <div className="text-sm text-gray-600">Completed: {audit.completionDate}</div>
                    </div>
                  ))
                ) : (
                  <div className="text-gray-500">No completed audits</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className={`min-h-screen p-6 ${theme.bg.gradient}`}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className={`text-3xl font-bold ${theme.text.primary}`}>
            ESG Reporting & Disclosure Engine
          </h1>
          <p className={`text-lg ${theme.text.secondary}`}>
            Global frameworks compliance and external auditor portal
          </p>
        </div>

        <div className="mb-6">
          <div className="flex space-x-4 border-b">
            <button
              className={`px-4 py-2 font-medium ${
                activeTab === 'frameworks'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : theme.text.secondary
              }`}
              onClick={() => setActiveTab('frameworks')}
            >
              Global Frameworks
            </button>
            <button
              className={`px-4 py-2 font-medium ${
                activeTab === 'auditor'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : theme.text.secondary
              }`}
              onClick={() => setActiveTab('auditor')}
            >
              Auditor Portal
            </button>
          </div>
        </div>

        {activeTab === 'frameworks' && renderFrameworksTab()}
        {activeTab === 'auditor' && renderAuditorPortalTab()}

        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </div>
    </div>
  );
};

export default ESGReportingDashboard;