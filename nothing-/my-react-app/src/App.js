import React, { Suspense, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation
} from "react-router-dom";

import Login from "./Login.jsx";
import { ThemeProvider } from './contexts/ThemeContext';
import AuditTrailViewer from './components/AuditTrailViewer';
import ApprovalWorkflow from './components/ApprovalWorkflow';
import EvidenceUploader from './components/EvidenceUploader';
import ComplianceReports from './components/ComplianceReports';
import SecuritySettings from './components/SecuritySettings';
import ComplianceCalendar from './components/ComplianceCalendar';
import AdvancedBenchmarking from './components/AdvancedBenchmarking';
import AutomatedReminders from './components/AutomatedReminders';
import {
  LazyDashboard,
  LazyDataEntry,
  LazyIndustryStandardDataEntry,
  LazyReports,
  LazyAnalytics,
  LazyAdvancedAnalytics,
  LazyCompliance,
  LazyRegulatory,
  LazyStakeholders,
  LazyAdminPanel,
  LazyMaterialityAssessment,
  LazySupplyChainESG,
  LazyWorkflowDashboard,
  LazyIntegrationDashboard,
  LazyCalculatorDashboard,
  LazyComprehensiveESGDashboard,
  LazyESGReportingDashboard,
  LazyStakeholderSentimentDashboard,
  LazyIoTDashboard,
  LazyReportsAnalyticsDashboard,
  LazyEnhancedFrameworkCompliance
} from './components/LazyComponents';
import RBACProtectedRoute from './components/ProtectedRoute';
import UserManagement from './components/UserManagement';
import { PERMISSIONS } from './utils/rbac';

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
  </div>
);

// ✅ Route guard
const ProtectedRoute = ({ children }) => {
  const currentUser = localStorage.getItem("currentUser");
  return currentUser ? children : <Navigate to="/login" replace />;
};

// ✅ Footer wrapper
const Layout = () => {
  const location = useLocation();
  const hideFooterOn = ["/login"];
  const [showAudit, setShowAudit] = useState(false);
  const [showWorkflow, setShowWorkflow] = useState(false);
  const [showEvidence, setShowEvidence] = useState(false);
  const [showReports, setShowReports] = useState(false);
  const [showSecurity, setShowSecurity] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showBenchmarking, setShowBenchmarking] = useState(false);
  const [showReminders, setShowReminders] = useState(false);

  return (
    <div className="flex flex-col min-h-screen">
      {location.pathname !== '/login' && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
          <button onClick={() => setShowReminders(true)} className="bg-pink-600 text-white p-4 rounded-full shadow-lg hover:bg-pink-700" title="Reminders">🔔</button>
          <button onClick={() => setShowBenchmarking(true)} className="bg-teal-600 text-white p-4 rounded-full shadow-lg hover:bg-teal-700" title="Benchmarking">📊</button>
          <button onClick={() => setShowCalendar(true)} className="bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:bg-indigo-700" title="Compliance Calendar">📅</button>
          <button onClick={() => setShowSecurity(true)} className="bg-red-600 text-white p-4 rounded-full shadow-lg hover:bg-red-700" title="Security Settings">🔒</button>
          <button onClick={() => setShowAudit(true)} className="bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700" title="Audit Trail">📋</button>
          <button onClick={() => setShowWorkflow(true)} className="bg-green-600 text-white p-4 rounded-full shadow-lg hover:bg-green-700" title="Workflows">✅</button>
          <button onClick={() => setShowEvidence(true)} className="bg-purple-600 text-white p-4 rounded-full shadow-lg hover:bg-purple-700" title="Evidence">📁</button>
          <button onClick={() => setShowReports(true)} className="bg-orange-600 text-white p-4 rounded-full shadow-lg hover:bg-orange-700" title="Reports">📊</button>
        </div>
      )}
      {showReminders && <AutomatedReminders onClose={() => setShowReminders(false)} />}
      {showBenchmarking && <AdvancedBenchmarking onClose={() => setShowBenchmarking(false)} />}
      {showCalendar && <ComplianceCalendar onClose={() => setShowCalendar(false)} />}
      {showSecurity && <SecuritySettings onClose={() => setShowSecurity(false)} />}
      {showAudit && <AuditTrailViewer onClose={() => setShowAudit(false)} />}
      {showWorkflow && <ApprovalWorkflow onClose={() => setShowWorkflow(false)} />}
      {showEvidence && <EvidenceUploader dataId="ESG_001" onClose={() => setShowEvidence(false)} />}
      {showReports && <ComplianceReports onClose={() => setShowReports(false)} />}
      <div className="flex-grow">
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<ProtectedRoute><LazyDashboard /></ProtectedRoute>} />
            <Route path="/data-entry" element={<ProtectedRoute><LazyDataEntry /></ProtectedRoute>} />
            <Route path="/industry-standard-data-entry" element={<ProtectedRoute><LazyIndustryStandardDataEntry /></ProtectedRoute>} />
            <Route path="/materiality-assessment" element={<ProtectedRoute><LazyMaterialityAssessment /></ProtectedRoute>} />
            <Route path="/supply-chain" element={<ProtectedRoute><LazySupplyChainESG /></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute><LazyReports /></ProtectedRoute>} />
            <Route path="/analytics" element={<ProtectedRoute><LazyAnalytics /></ProtectedRoute>} />
            <Route path="/advanced-analytics" element={<ProtectedRoute><LazyAdvancedAnalytics /></ProtectedRoute>} />
            <Route path="/compliance" element={<ProtectedRoute><LazyCompliance /></ProtectedRoute>} />
            <Route path="/stakeholders" element={<ProtectedRoute><LazyStakeholders /></ProtectedRoute>} />
            <Route path="/regulatory" element={<ProtectedRoute><LazyRegulatory /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute><LazyAdminPanel /></ProtectedRoute>} />
            <Route path="/workflow" element={<ProtectedRoute><LazyWorkflowDashboard /></ProtectedRoute>} />
            <Route path="/integrations" element={<ProtectedRoute><LazyIntegrationDashboard /></ProtectedRoute>} />
            <Route path="/calculators" element={<ProtectedRoute><LazyCalculatorDashboard /></ProtectedRoute>} />
            <Route path="/comprehensive-esg" element={<ProtectedRoute><LazyComprehensiveESGDashboard /></ProtectedRoute>} />
            <Route path="/esg-reporting" element={<ProtectedRoute><LazyESGReportingDashboard /></ProtectedRoute>} />
            <Route path="/stakeholder-sentiment" element={<ProtectedRoute><LazyStakeholderSentimentDashboard /></ProtectedRoute>} />
            <Route path="/iot" element={<ProtectedRoute><LazyIoTDashboard /></ProtectedRoute>} />
            <Route path="/reports-analytics" element={<ProtectedRoute><LazyReportsAnalyticsDashboard /></ProtectedRoute>} />
            <Route path="/enhanced-framework-compliance" element={<ProtectedRoute><LazyEnhancedFrameworkCompliance /></ProtectedRoute>} />
            <Route path="/user-management" element={
              <RBACProtectedRoute requiredPermission={PERMISSIONS.MANAGE_USERS}>
                <UserManagement />
              </RBACProtectedRoute>
            } />

            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Suspense>
      </div>

    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Layout />
      </Router>
    </ThemeProvider>
  );
}

export default App;
