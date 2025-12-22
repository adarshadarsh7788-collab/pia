import React, { useState, useEffect } from 'react';
import { useTheme } from './contexts/ThemeContext';
import { getThemeClasses } from './utils/themeUtils';
import ProfessionalHeader from './components/ProfessionalHeader';
import { AdvancedAnalyticsDashboard } from './utils/AdvancedAnalyticsDashboard.js';
import { getStoredData } from './utils/storage.js';
import { useNavigate } from 'react-router-dom';

const AdvancedAnalytics = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const theme = getThemeClasses(isDark);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const storedData = await getStoredData();
      
      if (!storedData || storedData.length === 0) {
        setError('No ESG data found. Please add some data first.');
        setLoading(false);
        return;
      }

      const companyData = transformDataForAnalytics(storedData);
      const result = await AdvancedAnalyticsDashboard.generateComprehensiveAnalytics(
        companyData,
        'technology',
        'global'
      );
      
      setAnalytics(result);
      setError(null);
    } catch (err) {
      setError('Failed to generate analytics: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const transformDataForAnalytics = (data) => {
    const environmental = {};
    const social = {};
    const governance = {};
    const historicalData = [];

    data.forEach(entry => {
      if (entry.category === 'environmental') {
        environmental[entry.metric] = entry.value;
        historicalData.push({
          category: 'environmental',
          value: entry.value,
          date: entry.createdAt || entry.date || new Date().toISOString()
        });
      } else if (entry.category === 'social') {
        social[entry.metric] = entry.value;
        historicalData.push({
          category: 'social',
          value: entry.value,
          date: entry.createdAt || entry.date || new Date().toISOString()
        });
      } else if (entry.category === 'governance') {
        governance[entry.metric] = entry.value;
        historicalData.push({
          category: 'governance',
          value: entry.value,
          date: entry.createdAt || entry.date || new Date().toISOString()
        });
      }
    });

    return { environmental, social, governance, historicalData };
  };

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    navigate("/login");
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <ProfessionalHeader onLogout={handleLogout} currentUser={localStorage.getItem('currentUser')} />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className={theme.text.secondary}>Generating advanced analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <ProfessionalHeader onLogout={handleLogout} currentUser={localStorage.getItem('currentUser')} />
        <div className="max-w-4xl mx-auto p-6">
          <div className={`rounded-lg p-6 border ${isDark ? 'bg-red-900/20 border-red-800 text-red-300' : 'bg-red-50 border-red-200 text-red-700'}`}>
            <h3 className="font-semibold mb-2">Analytics Error</h3>
            <p>{error}</p>
            <button 
              onClick={() => navigate('/data-entry')}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Add ESG Data
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <ProfessionalHeader onLogout={handleLogout} currentUser={localStorage.getItem('currentUser')} />
      
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <h1 className={`text-3xl font-bold ${theme.text.primary} mb-2`}>Advanced ESG Analytics</h1>
          <p className={theme.text.secondary}>Comprehensive analysis with real-time scoring, benchmarking, and risk assessment</p>
        </div>

        {/* ESG Score Card */}
        <div className={`rounded-xl p-6 mb-6 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-xl font-semibold ${theme.text.primary}`}>ESG Score Overview</h2>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              analytics.esgScore.grade === 'A+' || analytics.esgScore.grade === 'A' ? 'bg-green-100 text-green-800' :
              analytics.esgScore.grade === 'B' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              Grade {analytics.esgScore.grade}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className={`text-4xl font-bold ${theme.text.primary} mb-2`}>
                {analytics.esgScore.overallScore}
              </div>
              <div className={`text-sm ${theme.text.secondary}`}>Overall Score</div>
            </div>
            
            {Object.entries(analytics.esgScore.categoryScores).map(([category, score]) => (
              <div key={category} className="text-center">
                <div className={`text-2xl font-semibold ${theme.text.primary} mb-2`}>
                  {Math.round(score)}
                </div>
                <div className={`text-sm ${theme.text.secondary} capitalize`}>{category}</div>
                <div className={`w-full bg-gray-200 rounded-full h-2 mt-2 ${isDark ? 'bg-gray-700' : ''}`}>
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${score}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Benchmarking Section */}
        <div className={`rounded-xl p-6 mb-6 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border`}>
          <h2 className={`text-xl font-semibold ${theme.text.primary} mb-4`}>Industry Benchmarking</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {analytics.benchmarking.overall.percentile}th
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Industry Percentile</div>
            </div>
            
            {Object.entries(analytics.benchmarking).filter(([key]) => key !== 'overall' && key !== 'industry' && key !== 'region').map(([category, data]) => (
              <div key={category} className="text-center p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                <div className={`text-lg font-semibold mb-1 ${
                  data.status === 'leader' ? 'text-green-600' :
                  data.status === 'laggard' ? 'text-red-600' : 'text-yellow-600'
                }`}>
                  {data.gap > 0 ? '+' : ''}{data.gap.toFixed(1)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 capitalize">{category}</div>
                <div className={`text-xs font-medium ${
                  data.status === 'leader' ? 'text-green-600' :
                  data.status === 'laggard' ? 'text-red-600' : 'text-yellow-600'
                }`}>
                  {data.status}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Risk Assessment */}
        <div className={`rounded-xl p-6 mb-6 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border`}>
          <h2 className={`text-xl font-semibold ${theme.text.primary} mb-4`}>Risk Assessment</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center gap-4 mb-4">
                <div className={`text-3xl font-bold ${
                  analytics.riskAssessment.overallRiskScore.level === 'low' ? 'text-green-600' :
                  analytics.riskAssessment.overallRiskScore.level === 'medium' ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {analytics.riskAssessment.overallRiskScore.score}
                </div>
                <div>
                  <div className={`font-semibold ${theme.text.primary}`}>Overall Risk Score</div>
                  <div className={`text-sm capitalize ${
                    analytics.riskAssessment.overallRiskScore.level === 'low' ? 'text-green-600' :
                    analytics.riskAssessment.overallRiskScore.level === 'medium' ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {analytics.riskAssessment.overallRiskScore.level} Risk Level
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                {Object.entries(analytics.riskAssessment.overallRiskScore.distribution).map(([level, count]) => (
                  <div key={level} className="flex justify-between items-center">
                    <span className={`text-sm capitalize ${theme.text.secondary}`}>{level} Risk:</span>
                    <span className={`font-medium ${theme.text.primary}`}>{count}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className={`font-semibold ${theme.text.primary} mb-3`}>Material Risks</h3>
              {analytics.riskAssessment.materialityAssessment.length > 0 ? (
                <div className="space-y-2">
                  {analytics.riskAssessment.materialityAssessment.slice(0, 5).map((risk, index) => (
                    <div key={index} className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <div className="flex justify-between items-center">
                        <span className={`font-medium capitalize ${theme.text.primary}`}>
                          {risk.risk.replace('_', ' ')}
                        </span>
                        <span className={`text-sm px-2 py-1 rounded ${
                          risk.score >= 0.7 ? 'bg-red-100 text-red-800' :
                          risk.score >= 0.5 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {(risk.score * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div className={`text-xs ${theme.text.secondary} capitalize`}>
                        {risk.category}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className={theme.text.secondary}>No material risks identified</p>
              )}
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className={`rounded-xl p-6 mb-6 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border`}>
          <h2 className={`text-xl font-semibold ${theme.text.primary} mb-4`}>Recommendations</h2>
          <div className="space-y-3">
            {analytics.recommendations.slice(0, 8).map((rec, index) => (
              <div key={index} className={`p-4 rounded-lg border-l-4 ${
                rec.priority === 'high' ? 'border-red-500 bg-red-50 dark:bg-red-900/20' :
                rec.priority === 'medium' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' :
                'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              }`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-bold px-2 py-1 rounded uppercase ${
                        rec.priority === 'high' ? 'bg-red-100 text-red-800' :
                        rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {rec.priority}
                      </span>
                      <span className={`text-xs ${theme.text.secondary} capitalize`}>{rec.category}</span>
                    </div>
                    <p className={`font-medium ${theme.text.primary}`}>{rec.action}</p>
                    <p className={`text-sm ${theme.text.secondary} mt-1`}>{rec.expectedImpact}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Executive Summary */}
        <div className={`rounded-xl p-6 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border`}>
          <h2 className={`text-xl font-semibold ${theme.text.primary} mb-4`}>Executive Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className={`font-semibold ${theme.text.primary} mb-2`}>Performance Overview</h3>
              <p className={theme.text.secondary}>{analytics.summary.overallPerformance}</p>
              <p className={`${theme.text.secondary} mt-2`}>{analytics.summary.marketPosition}</p>
            </div>
            
            <div>
              <h3 className={`font-semibold ${theme.text.primary} mb-2`}>Urgent Actions Required</h3>
              {analytics.summary.urgentActions && analytics.summary.urgentActions.length > 0 ? (
                <ul className="space-y-1">
                  {analytics.summary.urgentActions.map((action, index) => (
                    <li key={index} className={`text-sm ${theme.text.secondary} flex items-start gap-2`}>
                      <span className="text-red-500 mt-1">•</span>
                      {action}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className={`text-sm ${theme.text.secondary}`}>No urgent actions required</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedAnalytics;