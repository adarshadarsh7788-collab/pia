import { lazy } from 'react';

// Lazy load heavy components to reduce bundle size
export const LazyDashboard = lazy(() => import('../Dashboard'));
export const LazyReports = lazy(() => import('../Reports'));
export const LazyAnalytics = lazy(() => import('../Analytics'));
export const LazyAdvancedAnalytics = lazy(() => import('../AdvancedAnalytics'));
export const LazyCompliance = lazy(() => import('../Compliance'));
export const LazyDataEntry = lazy(() => import('../DataEntry'));
export const LazyIndustryStandardDataEntry = lazy(() => import('../IndustryStandardDataEntry'));
export const LazyStakeholders = lazy(() => import('../Stakeholders'));
export const LazyRegulatory = lazy(() => import('../Regulatory'));
export const LazyAdminPanel = lazy(() => import('../AdminPanel'));

// Lazy load component modules
export const LazyMaterialityAssessment = lazy(() => import('./MaterialityAssessment'));
export const LazySupplyChainESG = lazy(() => import('./SupplyChainESG'));
export const LazyWorkflowDashboard = lazy(() => import('./WorkflowDashboard'));
export const LazyIntegrationDashboard = lazy(() => import('./IntegrationDashboard'));
export const LazyCalculatorDashboard = lazy(() => import('./CalculatorDashboard'));
export const LazyComprehensiveESGDashboard = lazy(() => import('./ComprehensiveESGDashboard'));
export const LazyESGReportingDashboard = lazy(() => import('./ESGReportingDashboard'));
export const LazyStakeholderSentimentDashboard = lazy(() => import('./StakeholderSentimentDashboard'));
export const LazyIoTDashboard = lazy(() => import('./EnhancedIoTDashboard'));
export const LazyReportsAnalyticsDashboard = lazy(() => import('./ReportsAnalyticsDashboard'));
export const LazyEnhancedFrameworkCompliance = lazy(() => import('./EnhancedFrameworkCompliance'));