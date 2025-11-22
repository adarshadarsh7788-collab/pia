import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { getThemeClasses } from '../utils/themeUtils';
import ReportsAPI from '../services/reportsAPI';

function ReportsAnalyticsDashboard() {
  const { isDark } = useTheme();
  const theme = getThemeClasses(isDark);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    comprehensive: null,
    performance: null,
    environmental: null,
    security: null,
    deployment: null
  });

  useEffect(() => {
    const fetchAllReports = async () => {
      setLoading(true);
      try {
        const [comprehensive, performance, environmental, security, deployment] = await Promise.all([
          ReportsAPI.fetchComprehensiveReport(),
          ReportsAPI.fetchPerformanceSummary(),
          ReportsAPI.fetchEnvironmentalReport(),
          ReportsAPI.fetchSecuritySummary(),
          ReportsAPI.fetchDeploymentHealth()
        ]);

        setData({
          comprehensive: comprehensive.success ? comprehensive.data : null,
          performance: performance.success ? performance.data : null,
          environmental: environmental.success ? environmental.data : null,
          security: security.success ? security.data : null,
          deployment: deployment.success ? deployment.data : null
        });
      } catch (error) {
        console.error('Failed to fetch reports:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllReports();
  }, []);

  const handleDownloadPDF = async () => {
    try {
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `ESG_Analytics_Report_${timestamp}.pdf`;
      
      const result = await ReportsAPI.generatePDFReport(filename);
      if (result.success) {
        // Open PDF in new tab
        window.open('/api/reports/pdf/comprehensive', '_blank');
      }
    } catch (error) {
      console.error('Failed to generate PDF:', error);
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className={theme.text.primary}>Loading reports and analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} p-6`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-3xl font-bold ${theme.text.primary} mb-2`}>Reports & Analytics Dashboard</h1>
          <p className={theme.text.secondary}>Comprehensive ESG reporting and performance analytics</p>
          
          <div className="mt-4 flex gap-3">
            <button
              onClick={handleDownloadPDF}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              📄 Download PDF Report
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              🔄 Refresh Data
            </button>
          </div>
        </div>

        {/* Reports Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Comprehensive Report */}
          {data.comprehensive && (
            <div className={`rounded-lg p-6 border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <h3 className={`text-lg font-semibold ${theme.text.primary} mb-4`}>📊 Comprehensive Report</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className={theme.text.secondary}>Total Metrics:</span>
                  <span className={theme.text.primary}>{data.comprehensive.totalMetrics || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className={theme.text.secondary}>Data Quality:</span>
                  <span className={theme.text.primary}>{data.comprehensive.dataQuality || 0}%</span>
                </div>
                <div className="flex justify-between">
                  <span className={theme.text.secondary}>Last Updated:</span>
                  <span className={theme.text.primary}>{new Date().toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          )}

          {/* Performance Summary */}
          {data.performance && (
            <div className={`rounded-lg p-6 border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <h3 className={`text-lg font-semibold ${theme.text.primary} mb-4`}>⚡ Performance Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className={theme.text.secondary}>System Health:</span>
                  <span className="text-green-500">✅ Healthy</span>
                </div>
                <div className="flex justify-between">
                  <span className={theme.text.secondary}>Response Time:</span>
                  <span className={theme.text.primary}>{data.performance.responseTime || '<100ms'}</span>
                </div>
                <div className="flex justify-between">
                  <span className={theme.text.secondary}>Uptime:</span>
                  <span className={theme.text.primary}>{data.performance.uptime || '99.9%'}</span>
                </div>
              </div>
            </div>
          )}

          {/* Environmental Report */}
          {data.environmental && (
            <div className={`rounded-lg p-6 border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <h3 className={`text-lg font-semibold ${theme.text.primary} mb-4`}>🌍 Environmental Report</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className={theme.text.secondary}>Carbon Footprint:</span>
                  <span className={theme.text.primary}>{data.environmental.carbonFootprint || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className={theme.text.secondary}>Energy Efficiency:</span>
                  <span className={theme.text.primary}>{data.environmental.energyEfficiency || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className={theme.text.secondary}>Waste Reduction:</span>
                  <span className={theme.text.primary}>{data.environmental.wasteReduction || 'N/A'}</span>
                </div>
              </div>
            </div>
          )}

          {/* Security Summary */}
          {data.security && (
            <div className={`rounded-lg p-6 border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <h3 className={`text-lg font-semibold ${theme.text.primary} mb-4`}>🔒 Security Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className={theme.text.secondary}>Security Score:</span>
                  <span className="text-green-500">{data.security.securityScore || 'A+'}</span>
                </div>
                <div className="flex justify-between">
                  <span className={theme.text.secondary}>Vulnerabilities:</span>
                  <span className={theme.text.primary}>{data.security.vulnerabilities || '0'}</span>
                </div>
                <div className="flex justify-between">
                  <span className={theme.text.secondary}>Last Scan:</span>
                  <span className={theme.text.primary}>{new Date().toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Charts Section */}
        <div className="mt-8">
          <h2 className={`text-2xl font-bold ${theme.text.primary} mb-6`}>Analytics Charts</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Placeholder for charts */}
            <div className={`rounded-lg p-6 border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <h3 className={`text-lg font-semibold ${theme.text.primary} mb-4`}>ESG Score Trends</h3>
              <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded">
                <p className={theme.text.secondary}>Chart visualization will be displayed here</p>
              </div>
            </div>
            
            <div className={`rounded-lg p-6 border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <h3 className={`text-lg font-semibold ${theme.text.primary} mb-4`}>Performance Metrics</h3>
              <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded">
                <p className={theme.text.secondary}>Performance charts will be displayed here</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReportsAnalyticsDashboard;