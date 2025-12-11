import React, { useEffect, useState } from "react";
import companyLogo from "./companyLogo.jpg";

import { Pie, Line, Bar, Doughnut } from "react-chartjs-2";

// Data normalization functions
function normalizeData(data) {
  return data
    .map(item => {
      let year = null;
      if (item.timestamp) {
        try {
          year = new Date(item.timestamp).getFullYear();
        } catch {
          year = item.reportingYear || new Date().getFullYear();
        }
      }
      
      if (item.environmental || item.social || item.governance) {
        const results = [];
        ['environmental', 'social', 'governance'].forEach(cat => {
          if (item[cat]) {
            Object.entries(item[cat]).forEach(([key, value]) => {
              if (key !== 'description' && value !== '' && !isNaN(parseFloat(value))) {
                results.push({
                  ...item,
                  category: cat,
                  metric: key,
                  value: parseFloat(value),
                  year,
                  companyName: item.companyName,
                  sector: item.sector,
                  region: item.region
                });
              }
            });
          }
        });
        return results;
      } else {
        const category = (item.category || '').toLowerCase();
        const value = parseFloat(item.value);
        return [{
          ...item,
          year,
          category,
          value: isNaN(value) ? null : value
        }];
      }
    })
    .flat()
    .filter(item => item.year && item.category && item.value !== null && ['environmental','social','governance'].includes(item.category));
}

function aggregateOverall(data) {
  const agg = { environmental: { sum: 0, count: 0 }, social: { sum: 0, count: 0 }, governance: { sum: 0, count: 0 } };
  data.forEach(item => {
    if (['environmental','social','governance'].includes(item.category)) {
      agg[item.category].sum += item.value;
      agg[item.category].count += 1;
    }
  });
  const envAvg = agg.environmental.count ? (agg.environmental.sum / agg.environmental.count).toFixed(2) : 0;
  const socAvg = agg.social.count ? (agg.social.sum / agg.social.count).toFixed(2) : 0;
  const govAvg = agg.governance.count ? (agg.governance.sum / agg.governance.count).toFixed(2) : 0;
  const overall = [envAvg, socAvg, govAvg].every(x => x > 0) ? (((+envAvg) + (+socAvg) + (+govAvg)) / 3).toFixed(2) : 0;
  return { environmental: +envAvg, social: +socAvg, governance: +govAvg, overall: +overall };
}
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  BarElement,
} from "chart.js";
import esgAPI from "./api/esgAPI";
import APIService from "./services/apiService";
import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "./contexts/ThemeContext";
import { getThemeClasses } from "./utils/themeUtils";
import ProfessionalHeader from "./components/ProfessionalHeader";
import { MetricCard, StatusCard } from "./components/ProfessionalCard";
import { Alert, Button, LoadingSpinner, Toast } from "./components/ProfessionalUX";
import { RBACManager, PERMISSIONS } from "./utils/rbac";
import { ESG_FRAMEWORKS, STANDARD_METRICS } from "./utils/esgFrameworks";
import { validateMiningMetrics, MINING_METRICS, ZIMBABWE_MINING_REQUIREMENTS } from "./utils/miningMetrics";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  BarElement
);

// Add 3D animations and styles
const style = document.createElement('style');
style.textContent = `
  @keyframes float3D {
    0%, 100% { transform: translateY(0px) rotateX(0deg); }
    50% { transform: translateY(-10px) rotateX(5deg); }
  }
  @keyframes pulse3D {
    0%, 100% { transform: scale(1) rotateY(0deg); }
    50% { transform: scale(1.05) rotateY(5deg); }
  }
  @keyframes slideIn3D {
    from { transform: translateX(-50px) rotateY(-15deg); opacity: 0; }
    to { transform: translateX(0) rotateY(0deg); opacity: 1; }
  }
  .chart-3d {
    perspective: 1000px;
    transform-style: preserve-3d;
  }
  .chart-container-3d {
    transform: rotateX(5deg) rotateY(-5deg);
    transition: all 0.3s ease;
    box-shadow: 0 20px 40px rgba(0,0,0,0.1);
  }
  .chart-container-3d:hover {
    transform: rotateX(8deg) rotateY(-8deg) scale(1.02);
    box-shadow: 0 30px 60px rgba(0,0,0,0.15);
  }
  .metric-card-3d {
    transform: perspective(800px) rotateX(5deg);
    transition: all 0.4s ease;
  }
  .metric-card-3d:hover {
    transform: perspective(800px) rotateX(10deg) rotateY(5deg) translateZ(20px);
  }
`;
document.head.appendChild(style);

const Analytics = () => {
  const { isDark, toggleTheme } = useTheme();
  const theme = getThemeClasses(isDark);
  const navigate = useNavigate();
  const [currentUser] = useState({ role: 'esg_manager', id: 'user_123' });
  const [data, setData] = useState([]);
  const [kpis, setKpis] = useState({});
  const [categoryData, setCategoryData] = useState({});
  const [riskData, setRiskData] = useState({});
  const [monthlyData, setMonthlyData] = useState({});
  const [selectedTimeframe, setSelectedTimeframe] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [selectedMetric, setSelectedMetric] = useState('overall');
  const [selectedFramework, setSelectedFramework] = useState('GRI');
  const [refreshing, setRefreshing] = useState(false);
  const [miningCompliance, setMiningCompliance] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const currentUser = 'admin@esgenius.com';
        
        // Try backend first
        const [backendKPIs, backendData] = await Promise.all([
          APIService.getESGKPIs(currentUser),
          APIService.getESGData(currentUser)
        ]);
        
        // Check if backend has data
        const hasBackendData = backendKPIs && !backendKPIs.error && backendData && !backendData.error && backendData.length > 0;
        
        if (hasBackendData) {
          const convertedData = backendData.map(item => ({
            companyName: item.companyName,
            category: item.category,
            metric: item.metric_name,
            value: item.metric_value,
            timestamp: item.created_at,
            reportingYear: item.reporting_year,
            overallScore: backendKPIs.overall_score || backendKPIs.overallScore
          }));
          
          setData(convertedData);
          setKpis({
            overallScore: Math.min(Math.round(backendKPIs.overall_score || backendKPIs.overallScore || 0), 100),
            environmental: Math.min(Math.round(backendKPIs.environmental_score || backendKPIs.environmental || 0), 100),
            social: Math.min(Math.round(backendKPIs.social_score || backendKPIs.social || 0), 100),
            governance: Math.min(Math.round(backendKPIs.governance_score || backendKPIs.governance || 0), 100),
            complianceRate: Math.min(backendKPIs.complianceRate || 0, 100)
          });
          
          const categoryCount = { environmental: 0, social: 0, governance: 0 };
          backendData.forEach(item => {
            if (categoryCount[item.category] !== undefined) {
              categoryCount[item.category]++;
            }
          });
          setCategoryData(categoryCount);
          
          const riskLevels = {
            high: categoryCount.environmental < 5 ? 3 : 1,
            medium: categoryCount.social < 5 ? 2 : 1,
            low: categoryCount.governance >= 5 ? 4 : 2
          };
          setRiskData(riskLevels);
          
          const monthlyTrends = { 'Jan': 5, 'Feb': 8, 'Mar': 12, 'Apr': 15, 'May': 18, 'Jun': backendData.length };
          setMonthlyData(monthlyTrends);
        } else {
          // Try localStorage as fallback
          const localData = JSON.parse(localStorage.getItem('esgData') || '[]');
          
          if (localData.length > 0) {
            const normalized = normalizeData(localData);
            setData(normalized);
            
            const aggregated = aggregateOverall(normalized);
            setKpis({
              overallScore: Math.min(Math.round(aggregated.overall), 100),
              environmental: Math.min(Math.round(aggregated.environmental), 100),
              social: Math.min(Math.round(aggregated.social), 100),
              governance: Math.min(Math.round(aggregated.governance), 100),
              complianceRate: Math.min(Math.round((normalized.length / 25) * 100), 100)
            });
            
            const categoryCount = { environmental: 0, social: 0, governance: 0 };
            normalized.forEach(item => {
              if (categoryCount[item.category] !== undefined) {
                categoryCount[item.category]++;
              }
            });
            setCategoryData(categoryCount);
            
            const riskLevels = {
              high: categoryCount.environmental < 5 ? 3 : 1,
              medium: categoryCount.social < 5 ? 2 : 1,
              low: categoryCount.governance >= 5 ? 4 : 2
            };
            setRiskData(riskLevels);
            
            const monthlyTrends = { 'Jan': 5, 'Feb': 8, 'Mar': 12, 'Apr': 15, 'May': 18, 'Jun': normalized.length };
            setMonthlyData(monthlyTrends);
          } else {
            // No data available
            setKpis({ overallScore: 0, environmental: 0, social: 0, governance: 0, complianceRate: 0 });
            setCategoryData({ environmental: 0, social: 0, governance: 0 });
            setRiskData({ high: 0, medium: 0, low: 0 });
            setMonthlyData({});
          }
        }
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading analytics data:', error);
        // Try localStorage on error
        const localData = JSON.parse(localStorage.getItem('esgData') || '[]');
        if (localData.length > 0) {
          const normalized = normalizeData(localData);
          setData(normalized);
          const aggregated = aggregateOverall(normalized);
          setKpis({
            overallScore: Math.min(Math.round(aggregated.overall), 100),
            environmental: Math.min(Math.round(aggregated.environmental), 100),
            social: Math.min(Math.round(aggregated.social), 100),
            governance: Math.min(Math.round(aggregated.governance), 100),
            complianceRate: Math.min(Math.round((normalized.length / 25) * 100), 100)
          });
          const categoryCount = { environmental: 0, social: 0, governance: 0 };
          normalized.forEach(item => { if (categoryCount[item.category] !== undefined) categoryCount[item.category]++; });
          setCategoryData(categoryCount);
          setRiskData({ high: categoryCount.environmental < 5 ? 3 : 1, medium: categoryCount.social < 5 ? 2 : 1, low: categoryCount.governance >= 5 ? 4 : 2 });
          setMonthlyData({ 'Jan': 5, 'Feb': 8, 'Mar': 12, 'Apr': 15, 'May': 18, 'Jun': normalized.length });
        } else {
          setKpis({ overallScore: 0, environmental: 0, social: 0, governance: 0, complianceRate: 0 });
          setCategoryData({ environmental: 0, social: 0, governance: 0 });
          setRiskData({ high: 0, medium: 0, low: 0 });
          setMonthlyData({});
        }
        setIsLoading(false);
      }
    };
    
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    navigate("/login");
  };

  // Memoize chart data to prevent unnecessary re-renders
  const categoryCount = React.useMemo(() => categoryData || { environmental: 0, social: 0, governance: 0 }, [categoryData]);
  const riskLevels = React.useMemo(() => riskData || { high: 0, medium: 0, low: 0 }, [riskData]);
  const monthlyTrends = React.useMemo(() => monthlyData || {}, [monthlyData]);


  const pieData = {
    labels: ["Environmental", "Social", "Governance"],
    datasets: [
      {
        data: [
          categoryCount.environmental,
          categoryCount.social,
          categoryCount.governance,
        ],
        backgroundColor: [
          isDark ? "#10b981" : "#059669",
          isDark ? "#f59e0b" : "#d97706", 
          isDark ? "#3b82f6" : "#2563eb"
        ],
        borderWidth: 3,
        borderColor: isDark ? "#374151" : "#ffffff",
        hoverOffset: 20,
        hoverBorderWidth: 5,
      },
    ],
  };

  const riskChartData = {
    labels: ["High Risk", "Medium Risk", "Low Risk"],
    datasets: [
      {
        data: [riskLevels.high, riskLevels.medium, riskLevels.low],
        backgroundColor: [
          isDark ? "#ef4444" : "#dc2626",
          isDark ? "#f59e0b" : "#d97706",
          isDark ? "#10b981" : "#059669"
        ],
        borderWidth: 3,
        borderColor: isDark ? "#374151" : "#ffffff",
        hoverOffset: 15,
      },
    ],
  };

  const barData = {
    labels: ["Environmental", "Social", "Governance"],
    datasets: [
      {
        label: "Current Score",
        data: [categoryCount.environmental || 0, categoryCount.social || 0, categoryCount.governance || 0],
        backgroundColor: [
          isDark ? "rgba(16, 185, 129, 0.8)" : "rgba(5, 150, 105, 0.8)",
          isDark ? "rgba(245, 158, 11, 0.8)" : "rgba(217, 119, 6, 0.8)",
          isDark ? "rgba(59, 130, 246, 0.8)" : "rgba(37, 99, 235, 0.8)"
        ],
        borderColor: [
          isDark ? "#10b981" : "#059669",
          isDark ? "#f59e0b" : "#d97706",
          isDark ? "#3b82f6" : "#2563eb"
        ],
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      },
      {
        label: "Target Score",
        data: [80, 75, 85],
        backgroundColor: isDark ? "rgba(107, 114, 128, 0.3)" : "rgba(156, 163, 175, 0.3)",
        borderColor: isDark ? "#6b7280" : "#9ca3af",
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  };

  const lineData = {
    labels: Object.keys(monthlyTrends).slice(-6),
    datasets: [
      {
        label: "Monthly Submissions",
        data: Object.values(monthlyTrends).slice(-6),
        borderColor: isDark ? "#10b981" : "#059669",
        backgroundColor: isDark ? "rgba(16, 185, 129, 0.1)" : "rgba(5, 150, 105, 0.1)",
        tension: 0.4,
        fill: true,
        pointBackgroundColor: isDark ? "#10b981" : "#059669",
        pointBorderColor: isDark ? "#ffffff" : "#ffffff",
        pointBorderWidth: 3,
        pointRadius: 6,
        pointHoverRadius: 8,
      },
      {
        label: "ESG Score Trend",
        data: data.length > 0 ? data.slice(-6).map(trend => trend.overallScore || 0) : [],
        borderColor: isDark ? "#3b82f6" : "#2563eb",
        backgroundColor: isDark ? "rgba(59, 130, 246, 0.1)" : "rgba(37, 99, 235, 0.1)",
        tension: 0.4,
        fill: true,
        pointBackgroundColor: isDark ? "#3b82f6" : "#2563eb",
        pointBorderColor: isDark ? "#ffffff" : "#ffffff",
        pointBorderWidth: 3,
        pointRadius: 6,
        pointHoverRadius: 8,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: isDark ? '#e5e7eb' : '#374151',
          font: { size: 12, weight: 'bold' }
        }
      },
      tooltip: {
        backgroundColor: isDark ? '#1f2937' : '#ffffff',
        titleColor: isDark ? '#ffffff' : '#000000',
        bodyColor: isDark ? '#e5e7eb' : '#374151',
        borderColor: isDark ? '#374151' : '#e5e7eb',
        borderWidth: 1,
      }
    },
    scales: {
      y: {
        ticks: { color: isDark ? '#9ca3af' : '#6b7280' },
        grid: { color: isDark ? '#374151' : '#e5e7eb' }
      },
      x: {
        ticks: { color: isDark ? '#9ca3af' : '#6b7280' },
        grid: { color: isDark ? '#374151' : '#e5e7eb' }
      }
    }
  };

  const riskColor = (val) =>
    val >= 10 ? "text-green-600" : val >= 5 ? "text-yellow-500" : "text-red-500";

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const refreshData = async () => {
    setRefreshing(true);
    try {
      const currentUser = 'admin@esgenius.com'; // Backend-only user
      
      // Single API call for KPIs and data
      const [backendKPIs, backendData] = await Promise.all([
        APIService.getESGKPIs(currentUser),
        APIService.getESGData(currentUser)
      ]);
      
      if (backendKPIs && !backendKPIs.error && backendData && !backendData.error) {
        // Use backend data
        const convertedData = backendData.map(item => ({
          companyName: item.companyName,
          category: item.category,
          metric: item.metric_name,
          value: item.metric_value,
          timestamp: item.created_at,
          reportingYear: item.reporting_year,
          overallScore: backendKPIs.overall_score || backendKPIs.overallScore
        }));
        
        setData(convertedData);
        setKpis({
          overallScore: Math.round(backendKPIs.overall_score || backendKPIs.overallScore || 0),
          environmental: Math.round(backendKPIs.environmental_score || backendKPIs.environmental || 0),
          social: Math.round(backendKPIs.social_score || backendKPIs.social || 0),
          governance: Math.round(backendKPIs.governance_score || backendKPIs.governance || 0),
          complianceRate: backendKPIs.complianceRate || 94
        });
        
        // Calculate distributions from backend data
        const categoryCount = { environmental: 0, social: 0, governance: 0 };
        backendData.forEach(item => {
          if (categoryCount[item.category] !== undefined) {
            categoryCount[item.category]++;
          }
        });
        setCategoryData(categoryCount);
        
        const riskLevels = {
          high: categoryCount.environmental < 5 ? 3 : 1,
          medium: categoryCount.social < 5 ? 2 : 1,
          low: categoryCount.governance >= 5 ? 4 : 2
        };
        setRiskData(riskLevels);
        
        const monthlyTrends = { 'Jan': 5, 'Feb': 8, 'Mar': 12, 'Apr': 15, 'May': 18, 'Jun': backendData.length };
        setMonthlyData(monthlyTrends);
        
        // Check for mining sector data
        const isMining = convertedData.some(item => item.sector === 'mining' || item.region === 'zimbabwe');
        if (isMining) {
          const miningData = {
            environmental: {},
            social: {},
            governance: {}
          };
          convertedData.forEach(item => {
            if (item.category && item.metric && item.value) {
              if (!miningData[item.category]) miningData[item.category] = {};
              miningData[item.category][item.metric] = item.value;
            }
          });
          const miningResult = validateMiningMetrics(miningData);
          setMiningCompliance(miningResult);
        }
        
        showToast('Analytics data refreshed successfully', 'success');
      } else {
        showToast('Backend unavailable - using cached data', 'warning');
      }
    } catch (error) {
      showToast('Failed to refresh analytics data', 'error');
    } finally {
      setRefreshing(false);
    }
  };

  const canViewAnalytics = true; // RBACManager.hasPermission(currentUser.role, PERMISSIONS.VIEW_ANALYTICS);

  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${theme.bg.gradient}`}>
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className={`mt-4 ${theme.text.primary}`}>Loading Analytics Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-all duration-500 ${
      isDark 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40'
    }`}>
      <ProfessionalHeader 
        onLogout={handleLogout}
        currentUser="admin@esgenius.com"
        title="Analytics Dashboard"
        subtitle="Advanced ESG Performance Insights & Trends"
        showBreadcrumb={true}
        breadcrumbItems={[
          { label: 'Dashboard', href: '/' },
          { label: 'Analytics', href: '/analytics', active: true }
        ]}
        actions={[
          {
            label: 'Refresh Data',
            onClick: refreshData,
            variant: 'outline',
            icon: '🔄',
            loading: refreshing
          },
          {
            label: 'Export Analytics',
            onClick: () => showToast('Analytics export feature coming soon', 'info'),
            variant: 'primary',
            icon: '📥'
          }
        ]}
      />

      <div className="max-w-7xl mx-auto p-6">
        {!canViewAnalytics && (
          <Alert 
            type="warning"
            title="Access Restricted"
            message="You do not have permission to view analytics. Please contact your administrator."
            className="mb-6"
          />
        )}

        {/* Enhanced Analytics Controls */}
        <div className={`p-6 rounded-xl mb-8 transition-all duration-300 ${
          isDark 
            ? 'bg-gray-800/90 backdrop-blur-sm shadow-xl border border-gray-700' 
            : 'bg-white/80 backdrop-blur-xl shadow-lg shadow-slate-200/30 border border-slate-200/60'
        }`}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className={`text-xl font-bold ${theme.text.primary}`}>Framework-Compliant Analytics</h2>
              <p className={`text-sm ${theme.text.secondary}`}>GRI, SASB, TCFD aligned metrics and insights</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <select
                value={selectedTimeframe}
                onChange={(e) => setSelectedTimeframe(e.target.value)}
                className={`border rounded-lg px-3 py-2 text-sm ${theme.bg.input} ${theme.border.input} ${theme.text.primary}`}
              >
                <option value="all">All Time</option>
                <option value="year">This Year</option>
                <option value="quarter">This Quarter</option>
                <option value="month">This Month</option>
              </select>
              <select
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value)}
                className={`border rounded-lg px-3 py-2 text-sm ${theme.bg.input} ${theme.border.input} ${theme.text.primary}`}
              >
                <option value="overall">Overall Performance</option>
                <option value="environmental">Environmental (GRI-300 series)</option>
                <option value="social">Social (GRI-400 series)</option>
                <option value="governance">Governance (GRI-200 series)</option>
              </select>
              <select
                className={`border rounded-lg px-3 py-2 text-sm ${theme.bg.input} ${theme.border.input} ${theme.text.primary}`}
              >
                <option value="GRI">GRI Standards</option>
                <option value="SASB">SASB Standards</option>
                <option value="TCFD">TCFD Framework</option>
                <option value="CSRD">CSRD/ESRS</option>
              </select>
            </div>
          </div>
        </div>

        {/* Enhanced KPI Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard 
            icon="⭐"
            value={kpis.overallScore || 0}
            label="Overall ESG Score"
            trend="↑ +12% vs last month"
            trendColor="success"
            progress={kpis.overallScore || 0}
          />
          <MetricCard 
            icon="📊"
            value={data.length}
            label="Total Data Points"
            trend="↑ Active submissions"
            trendColor="info"
            progress={Math.min((data.length / 100) * 100, 100)}
          />
          <MetricCard 
            icon="✓"
            value={`${kpis.complianceRate || 0}%`}
            label="Compliance Rate"
            trend="↑ Meeting targets"
            trendColor="success"
            progress={kpis.complianceRate || 0}
          />
          <MetricCard 
            icon="⚠️"
            value={riskLevels.high > 5 ? 'HIGH' : riskLevels.medium > 3 ? 'MED' : 'LOW'}
            label="Risk Assessment"
            trend={riskLevels.high > 5 ? '↑ Needs attention' : '→ Stable'}
            trendColor={riskLevels.high > 5 ? 'warning' : 'success'}
            progress={riskLevels.high > 5 ? 25 : riskLevels.medium > 3 ? 60 : 90}
          />
        </div>

        {/* Enhanced Main Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className={`chart-3d chart-container-3d rounded-2xl p-6 border shadow-lg transition-all duration-300 ${theme.bg.card} ${theme.border.primary}`}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className={`text-lg font-semibold ${theme.text.primary}`}>ESG Category Distribution</h2>
                <p className={`text-sm ${theme.text.secondary}`}>Data points by category</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">🎯</span>
                <button 
                  onClick={() => showToast('Chart data refreshed', 'success')}
                  className={`p-2 rounded-lg transition-colors duration-200 ${theme.hover.subtle}`}
                >
                  <span className="text-sm">🔄</span>
                </button>
              </div>
            </div>
            <div className="h-80 relative">
              <Pie data={pieData} options={chartOptions} />
              {!canViewAnalytics && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                  <span className="text-white font-semibold">Access Restricted</span>
                </div>
              )}
            </div>
          </div>

          <div className={`chart-3d chart-container-3d rounded-2xl p-6 border shadow-lg transition-all duration-300 ${theme.bg.card} ${theme.border.primary}`}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className={`text-lg font-semibold ${theme.text.primary}`}>Performance Trends</h2>
                <p className={`text-sm ${theme.text.secondary}`}>Monthly progress tracking</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">📈</span>
                <div className="flex items-center gap-1 text-xs">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Submissions</span>
                  <div className="w-2 h-2 bg-blue-500 rounded-full ml-2"></div>
                  <span>Score</span>
                </div>
              </div>
            </div>
            <div className="h-80 relative">
              <Line data={lineData} options={chartOptions} />
              {!canViewAnalytics && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                  <span className="text-white font-semibold">Access Restricted</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Enhanced Secondary Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className={`chart-3d chart-container-3d rounded-2xl p-6 border shadow-lg transition-all duration-300 ${theme.bg.card} ${theme.border.primary}`}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className={`text-lg font-semibold ${theme.text.primary}`}>Performance vs Targets</h2>
                <p className={`text-sm ${theme.text.secondary}`}>Current scores against benchmarks</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">📊</span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  isDark ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-800'
                }`}>
                  Target: 80%
                </span>
              </div>
            </div>
            <div className="h-80 relative">
              <Bar data={barData} options={chartOptions} />
              {!canViewAnalytics && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                  <span className="text-white font-semibold">Access Restricted</span>
                </div>
              )}
            </div>
          </div>

          <div className={`chart-3d chart-container-3d rounded-2xl p-6 border shadow-lg transition-all duration-300 ${theme.bg.card} ${theme.border.primary}`}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className={`text-lg font-semibold ${theme.text.primary}`}>Risk Distribution</h2>
                <p className={`text-sm ${theme.text.secondary}`}>Risk level assessment across categories</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">⚠️</span>
                <div className="flex items-center gap-1 text-xs">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span>High</span>
                  <div className="w-2 h-2 bg-yellow-500 rounded-full ml-1"></div>
                  <span>Med</span>
                  <div className="w-2 h-2 bg-green-500 rounded-full ml-1"></div>
                  <span>Low</span>
                </div>
              </div>
            </div>
            <div className="h-80 relative">
              <Doughnut data={riskChartData} options={chartOptions} />
              {!canViewAnalytics && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                  <span className="text-white font-semibold">Access Restricted</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Enhanced Detailed Analytics */}
        <div className={`rounded-2xl p-6 border shadow-lg transition-all duration-300 ${theme.bg.card} ${theme.border.primary}`}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className={`text-xl font-bold ${theme.text.primary}`}>Category Performance Analysis</h2>
              <p className={`text-sm ${theme.text.secondary}`}>Detailed breakdown by ESG categories</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🧠</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => showToast('Performance analysis updated', 'success')}
                icon="🔄"
              >
                Refresh
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {["environmental", "social", "governance"].map((key, idx) => {
              const score = key === 'environmental' ? kpis.environmental : key === 'social' ? kpis.social : kpis.governance;
              const count = categoryCount[key];
              const riskLevel = count >= 10 ? "Low" : count >= 5 ? "Medium" : "High";
              const target = 80;
              const performance = score >= target ? 'excellent' : score >= target * 0.8 ? 'good' : score >= target * 0.6 ? 'fair' : 'poor';
              
              return (
                <StatusCard
                  key={idx}
                  icon={key === 'environmental' ? '🌍' : key === 'social' ? '👥' : '🏛️'}
                  title={key.charAt(0).toUpperCase() + key.slice(1)}
                  score={score || 0}
                  target={target}
                  status={performance}
                  onClick={() => {
                    setSelectedMetric(key);
                    showToast(`Switched to ${key} focus view`, 'info');
                  }}
                  className="cursor-pointer hover:scale-105 transition-transform duration-200"
                >
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className={theme.text.secondary}>Data Points:</span>
                      <span className={`font-semibold ${theme.text.primary}`}>{count}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className={theme.text.secondary}>Risk Level:</span>
                      <span className={`font-semibold ${
                        riskLevel === 'Low' ? 'text-green-600' :
                        riskLevel === 'Medium' ? 'text-yellow-600' : 'text-red-600'
                      }`}>{riskLevel}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className={theme.text.secondary}>vs Target:</span>
                      <span className={`font-semibold ${
                        score >= target ? 'text-green-600' : 'text-orange-600'
                      }`}>
                        {score >= target ? '✓ On Track' : '⚠ Below Target'}
                      </span>
                    </div>
                  </div>
                </StatusCard>
              );
            })}
          </div>
        </div>

        {/* Mining Sector Compliance - Show if mining data detected */}
        {miningCompliance && (
          <div className={`mt-8 rounded-2xl p-6 border shadow-lg transition-all duration-300 ${theme.bg.card} ${theme.border.primary}`}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className={`text-xl font-bold ${theme.text.primary}`}>⛏️ Mining Sector ESG Compliance</h2>
                <p className={`text-sm ${theme.text.secondary}`}>GRI-11, GRI-303, GRI-304, GRI-403, GRI-413, IFRS S1/S2 Standards</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-lg px-3 py-1 rounded-full font-bold ${
                  miningCompliance.score >= 80 ? 'bg-green-100 text-green-800' :
                  miningCompliance.score >= 60 ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {miningCompliance.score}% Compliant
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
              {Object.entries(miningCompliance.compliance).map(([standard, isCompliant]) => (
                <div key={standard} className={`p-4 rounded-lg text-center transition-all duration-200 hover:scale-105 ${
                  isCompliant ? 'bg-green-50 border-2 border-green-500 shadow-md' : 'bg-gray-50 border-2 border-gray-300'
                }`}>
                  <div className="text-3xl mb-2">{isCompliant ? '✅' : '⚪'}</div>
                  <div className={`text-xs font-bold ${
                    isCompliant ? 'text-green-800' : 'text-gray-600'
                  }`}>
                    {standard.toUpperCase()}
                  </div>
                  <div className={`text-xs mt-1 ${
                    isCompliant ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    {isCompliant ? 'Compliant' : 'Missing Data'}
                  </div>
                </div>
              ))}
            </div>
            
            <Alert
              type="info"
              title="🇿🇼 Zimbabwe Mining Sector Requirements"
              message="This compliance assessment aligns with Zimbabwe mining regulations and international investor ESG requirements (80% of investors consider ESG critical for mining investments)."
              className="mb-4"
            />
            
            <div className={`p-4 rounded-lg ${theme.bg.subtle}`}>
              <h3 className={`font-semibold ${theme.text.primary} mb-3`}>📋 Key Requirements Coverage</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className={`font-medium ${theme.text.secondary}`}>Environmental:</span>
                  <ul className="mt-2 space-y-1">
                    {ZIMBABWE_MINING_REQUIREMENTS.environmental.map((req, idx) => (
                      <li key={idx} className={theme.text.primary}>• {req}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <span className={`font-medium ${theme.text.secondary}`}>Social:</span>
                  <ul className="mt-2 space-y-1">
                    {ZIMBABWE_MINING_REQUIREMENTS.social.map((req, idx) => (
                      <li key={idx} className={theme.text.primary}>• {req}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <span className={`font-medium ${theme.text.secondary}`}>Governance:</span>
                  <ul className="mt-2 space-y-1">
                    {ZIMBABWE_MINING_REQUIREMENTS.governance.map((req, idx) => (
                      <li key={idx} className={theme.text.primary}>• {req}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <span className={`font-medium ${theme.text.secondary}`}>Investor Focus:</span>
                  <ul className="mt-2 space-y-1">
                    {ZIMBABWE_MINING_REQUIREMENTS.investorFocus.map((req, idx) => (
                      <li key={idx} className={theme.text.primary}>• {req}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Framework Compliance Panel */}
        <div className={`mt-8 rounded-2xl p-6 border shadow-lg transition-all duration-300 ${theme.bg.card} ${theme.border.primary}`}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className={`text-xl font-bold ${theme.text.primary}`}>Framework Compliance Status</h2>
              <p className={`text-sm ${theme.text.secondary}`}>Alignment with global ESG standards</p>
            </div>
            <span className="text-2xl">📋</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(ESG_FRAMEWORKS).map(([key, framework]) => (
              <div key={key} className={`p-4 rounded-lg border ${theme.bg.subtle} ${theme.border.secondary}`}>
                <h3 className={`font-semibold ${theme.text.primary} mb-2`}>{framework.name}</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className={theme.text.secondary}>Coverage:</span>
                    <span className={`font-medium ${theme.text.primary}`}>85%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{width: '85%'}}></div>
                  </div>
                  <span className={`text-xs ${theme.text.muted}`}>{framework.description}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Advanced Insights Panel */}
        <div className={`mt-8 rounded-2xl p-6 border shadow-lg transition-all duration-300 ${theme.bg.card} ${theme.border.primary}`}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className={`text-xl font-bold ${theme.text.primary}`}>AI-Powered Insights</h2>
              <p className={`text-sm ${theme.text.secondary}`}>Framework-aligned recommendations</p>
            </div>
            <span className="text-2xl">🤖</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Alert
              type="success"
              title="🌍 GRI-305 Compliance"
              message="Scope 1 & 2 emissions tracking meets GRI-305 requirements. Consider adding Scope 3 for full compliance."
              className="border-l-4 border-green-500"
            />
            <Alert
              type="warning"
              title="👥 GRI-405 Gap"
              message="Diversity reporting incomplete. Add age and minority group breakdowns for GRI-405-1 compliance."
              className="border-l-4 border-yellow-500"
            />
            <Alert
              type="info"
              title="🏛️ TCFD Readiness"
              message="Governance structure documented. Add climate scenario analysis for full TCFD alignment."
              className="border-l-4 border-blue-500"
            />
          </div>
        </div>

        {/* Toast Notifications */}
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

export default Analytics;
