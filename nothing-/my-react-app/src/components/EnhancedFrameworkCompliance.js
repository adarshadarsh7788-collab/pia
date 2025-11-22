import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { getThemeClasses } from '../utils/themeUtils';

function EnhancedFrameworkCompliance() {
  const { isDark } = useTheme();
  const theme = getThemeClasses(isDark);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [selectedFramework, setSelectedFramework] = useState('GRI');
  const [detailedData, setDetailedData] = useState(null);

  const companyId = localStorage.getItem('currentUser') || '1';

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (selectedFramework) {
      fetchDetailedData(selectedFramework);
    }
  }, [selectedFramework]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/framework-compliance/dashboard/${companyId}`);
      const result = await response.json();
      
      if (result.success) {
        setDashboardData(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDetailedData = async (framework) => {
    try {
      const response = await fetch(`/api/framework-compliance/detailed/${companyId}/${framework}`);
      const result = await response.json();
      
      if (result.success) {
        setDetailedData(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch detailed data:', error);
    }
  };

  const seedSampleData = async () => {
    try {
      const response = await fetch(`/api/framework-compliance/seed/${companyId}`, {
        method: 'POST'
      });
      const result = await response.json();
      
      if (result.success) {
        alert('Sample data seeded successfully!');
        fetchDashboardData();
      }
    } catch (error) {
      console.error('Failed to seed data:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLIANT': return 'text-green-600 bg-green-100';
      case 'PARTIAL': return 'text-yellow-600 bg-yellow-100';
      case 'NON_COMPLIANT': return 'text-red-600 bg-red-100';
      case 'IN_PROGRESS': return 'text-blue-600 bg-blue-100';
      case 'NOT_STARTED': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getMaterialityColor = (level) => {
    switch (level) {
      case 'HIGH': return 'text-red-600 bg-red-100';
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-100';
      case 'LOW': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className={theme.text.primary}>Loading framework compliance data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} p-6`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-3xl font-bold ${theme.text.primary} mb-2`}>Enhanced Framework Compliance</h1>
          <p className={theme.text.secondary}>Comprehensive ESG framework compliance tracking and management</p>
          
          <div className="mt-4 flex gap-3">
            <button
              onClick={seedSampleData}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              🌱 Seed Sample Data
            </button>
            <button
              onClick={fetchDashboardData}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              🔄 Refresh Data
            </button>
          </div>
        </div>

        {dashboardData ? (
          <>
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className={`rounded-lg p-6 border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <h3 className={`text-lg font-semibold ${theme.text.primary} mb-2`}>Overall Compliance</h3>
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {Math.round(dashboardData.overallMetrics.overallComplianceRate)}%
                </div>
                <p className={`text-sm ${theme.text.secondary}`}>
                  {dashboardData.overallMetrics.totalRequirements} total requirements
                </p>
              </div>

              <div className={`rounded-lg p-6 border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <h3 className={`text-lg font-semibold ${theme.text.primary} mb-2`}>Data Quality</h3>
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {Math.round(dashboardData.overallMetrics.avgDataQuality)}%
                </div>
                <p className={`text-sm ${theme.text.secondary}`}>Average data quality score</p>
              </div>

              <div className={`rounded-lg p-6 border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <h3 className={`text-lg font-semibold ${theme.text.primary} mb-2`}>Verification Rate</h3>
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {Math.round(dashboardData.overallMetrics.verificationRate)}%
                </div>
                <p className={`text-sm ${theme.text.secondary}`}>Third-party verified</p>
              </div>

              <div className={`rounded-lg p-6 border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <h3 className={`text-lg font-semibold ${theme.text.primary} mb-2`}>Critical Gaps</h3>
                <div className="text-3xl font-bold text-red-600 mb-2">
                  {dashboardData.overallMetrics.criticalGaps}
                </div>
                <p className={`text-sm ${theme.text.secondary}`}>High materiality gaps</p>
              </div>
            </div>

            {/* Framework Breakdown */}
            <div className={`rounded-lg p-6 border mb-8 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <h3 className={`text-xl font-semibold ${theme.text.primary} mb-6`}>Framework Breakdown</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {Object.entries(dashboardData.frameworkMetrics).map(([framework, metrics]) => (
                  <div 
                    key={framework}
                    className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-lg ${
                      selectedFramework === framework 
                        ? 'border-blue-500 bg-blue-50' 
                        : isDark ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-gray-50'
                    }`}
                    onClick={() => setSelectedFramework(framework)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className={`font-semibold ${theme.text.primary}`}>{framework}</h4>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        metrics.totalRequirements > 0 ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {metrics.totalRequirements} items
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className={theme.text.secondary}>Compliance:</span>
                        <span className={`font-medium ${metrics.avgComplianceScore >= 80 ? 'text-green-600' : metrics.avgComplianceScore >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {Math.round(metrics.avgComplianceScore)}%
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className={theme.text.secondary}>Data Quality:</span>
                        <span className={theme.text.primary}>{Math.round(metrics.avgDataQuality)}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className={theme.text.secondary}>Verified:</span>
                        <span className={theme.text.primary}>{metrics.verified}/{metrics.totalRequirements}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Risk and Materiality Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className={`rounded-lg p-6 border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <h3 className={`text-xl font-semibold ${theme.text.primary} mb-4`}>Risk Analysis</h3>
                <div className="space-y-3">
                  {Object.entries(dashboardData.riskAnalysis).map(([level, count]) => (
                    <div key={level} className="flex items-center justify-between">
                      <span className={`capitalize ${theme.text.secondary}`}>{level} Risk:</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        level === 'critical' ? 'bg-red-100 text-red-600' :
                        level === 'high' ? 'bg-orange-100 text-orange-600' :
                        level === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                        'bg-green-100 text-green-600'
                      }`}>
                        {count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className={`rounded-lg p-6 border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <h3 className={`text-xl font-semibold ${theme.text.primary} mb-4`}>Materiality Breakdown</h3>
                <div className="space-y-3">
                  {Object.entries(dashboardData.materialityBreakdown).map(([level, count]) => (
                    <div key={level} className="flex items-center justify-between">
                      <span className={`capitalize ${theme.text.secondary}`}>{level.replace('notApplicable', 'Not Applicable')}:</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getMaterialityColor(level.toUpperCase())}`}>
                        {count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Detailed Framework View */}
            {detailedData && (
              <div className={`rounded-lg p-6 border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <h3 className={`text-xl font-semibold ${theme.text.primary} mb-4`}>
                  {selectedFramework} Detailed View
                </h3>
                
                <div className="mb-4 flex items-center gap-4">
                  <span className={theme.text.secondary}>
                    Total Requirements: {detailedData.totalRequirements}
                  </span>
                  <span className={theme.text.secondary}>
                    Average Score: {Math.round(detailedData.summary.avgScore)}%
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className={`border-b ${isDark ? 'border-gray-600' : 'border-gray-200'}`}>
                        <th className={`text-left py-3 px-4 ${theme.text.primary}`}>Standard</th>
                        <th className={`text-left py-3 px-4 ${theme.text.primary}`}>Requirement</th>
                        <th className={`text-left py-3 px-4 ${theme.text.primary}`}>Status</th>
                        <th className={`text-left py-3 px-4 ${theme.text.primary}`}>Score</th>
                        <th className={`text-left py-3 px-4 ${theme.text.primary}`}>Materiality</th>
                        <th className={`text-left py-3 px-4 ${theme.text.primary}`}>Verification</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(detailedData.groupedData).map(([standardId, requirements]) =>
                        requirements.map((req, index) => (
                          <tr key={`${standardId}-${index}`} className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
                            <td className={`py-3 px-4 ${theme.text.primary}`}>{req.standardId}</td>
                            <td className={`py-3 px-4 ${theme.text.secondary}`}>
                              {req.requirementTitle || req.requirementId}
                            </td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(req.complianceStatus)}`}>
                                {req.complianceStatus}
                              </span>
                            </td>
                            <td className={`py-3 px-4 ${theme.text.primary}`}>
                              {req.complianceScore}%
                            </td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMaterialityColor(req.materialityLevel)}`}>
                                {req.materialityLevel}
                              </span>
                            </td>
                            <td className={`py-3 px-4 ${theme.text.secondary}`}>
                              {req.verificationStatus}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className={`text-center py-12 ${theme.text.secondary}`}>
            <p className="text-lg mb-4">No framework compliance data available</p>
            <button
              onClick={seedSampleData}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              🌱 Seed Sample Data to Get Started
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default EnhancedFrameworkCompliance;