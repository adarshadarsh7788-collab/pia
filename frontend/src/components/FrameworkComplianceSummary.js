import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { getThemeClasses } from '../utils/themeUtils';

const FrameworkComplianceSummary = ({ complianceData }) => {
  const { isDark } = useTheme();
  const theme = getThemeClasses(isDark);

  const getComplianceColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getCircularProgress = (score) => {
    const radius = 20;
    const circumference = 2 * Math.PI * radius;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (score / 100) * circumference;
    
    return (
      <div className="relative w-12 h-12">
        <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 44 44">
          <circle
            cx="22"
            cy="22"
            r={radius}
            stroke="#e5e7eb"
            strokeWidth="4"
            fill="none"
          />
          <circle
            cx="22"
            cy="22"
            r={radius}
            stroke={score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444'}
            strokeWidth="4"
            fill="none"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-bold">{score}%</span>
        </div>
      </div>
    );
  };

  // Check if we have actual compliance data
  const hasData = complianceData && Object.keys(complianceData).length > 0 && 
    Object.values(complianceData).some(framework => 
      framework && typeof framework === 'object' && framework.complianceScore !== undefined
    );

  const displayData = hasData ? complianceData : null;

  if (!displayData) {
    return (
      <div className={`p-6 rounded-lg ${theme.bg?.card || 'bg-white'} border ${theme.border?.primary || 'border-gray-200'} mb-6`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-lg font-semibold ${theme.text?.primary || 'text-gray-900'}`}>Framework Compliance Status</h3>
          <span className={`text-xs px-2 py-1 rounded-full ${isDark ? 'bg-gray-900 text-gray-300' : 'bg-gray-100 text-gray-800'}`}>
            No Data
          </span>
        </div>
        <div className="text-center py-8">
          <div className="text-4xl mb-4">📊</div>
          <h4 className={`text-lg font-medium ${theme.text?.primary || 'text-gray-900'} mb-2`}>No Compliance Data Available</h4>
          <p className={`${theme.text?.secondary || 'text-gray-600'} mb-4`}>Add ESG data entries to analyze framework compliance and generate compliance scores.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            {['GRI', 'SASB', 'TCFD', 'BRSR'].map(framework => (
              <div key={framework} className="text-center p-4 border-t-4 border-gray-300 bg-gray-50 rounded-b-lg">
                <div className="flex justify-center mb-2">{getCircularProgress(0)}</div>
                <h5 className={`font-semibold text-sm ${theme.text?.primary || 'text-gray-900'} mb-1`}>{framework}</h5>
                <span className="text-lg font-bold text-gray-400 block">0%</span>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div className="h-2 rounded-full bg-gray-300" style={{ width: '0%' }}></div>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={() => window.location.href = '/data-entry'}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
          >
            📝 Add ESG Data
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 rounded-lg ${theme.cardBg} border ${theme.border} mb-6`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-lg font-semibold ${theme.text}`}>Framework Compliance Status</h3>
        <span className={`text-xs px-2 py-1 rounded-full ${isDark ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-800'}`}>
          Live Analysis
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(displayData).map(([framework, data]) => (
          <div key={framework} className={`text-center p-4 border-t-4 rounded-b-lg ${
            data.complianceScore >= 80 ? 'border-green-500 bg-green-50' : 
            data.complianceScore >= 60 ? 'border-yellow-500 bg-yellow-50' : 'border-red-500 bg-red-50'
          }`}>
            <div className="flex justify-center mb-3">{getCircularProgress(data.complianceScore)}</div>
            <h4 className={`font-bold text-base ${theme.text?.primary || 'text-gray-900'} mb-2`}>{framework}</h4>
            <span className={`text-2xl font-bold block mb-2 ${getComplianceColor(data.complianceScore).split(' ')[0]}`}>
              {data.complianceScore}%
            </span>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div 
                className={`h-2 rounded-full ${
                  data.complianceScore >= 80 ? 'bg-green-500' : 
                  data.complianceScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${data.complianceScore}%` }}
              ></div>
            </div>
            <p className={`text-xs ${theme.text?.secondary || 'text-gray-600'}`}>
              {data.metRequirements}/{data.totalRequirements} requirements
            </p>
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm">
        <div className="flex items-start gap-2">
          <span className="text-blue-600">💡</span>
          <div>
            <strong className="text-blue-800">Framework Compliance Tips:</strong>
            <ul className="text-blue-700 mt-1 space-y-1">
              <li>• GRI Standards focus on materiality and stakeholder engagement</li>
              <li>• SASB emphasizes industry-specific financially material topics</li>
              <li>• Regular data updates improve compliance scores</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FrameworkComplianceSummary;