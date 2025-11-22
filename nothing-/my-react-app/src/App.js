import React, { Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation
} from "react-router-dom";

import Login from "./Login.jsx";
import { ThemeProvider } from './contexts/ThemeContext';
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

  return (
    <div className="flex flex-col min-h-screen">
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
