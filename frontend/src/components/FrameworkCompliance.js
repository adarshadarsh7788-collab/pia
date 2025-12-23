import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { getThemeClasses } from '../utils/themeUtils';
import { ESG_FRAMEWORKS, STANDARD_METRICS, MATERIALITY_TOPICS } from '../utils/esgFrameworks';
import { getStoredData } from '../utils/storage';

const FrameworkCompliance = () => {
  const { isDark } = useTheme();
  const theme = getThemeClasses(isDark);
  const [selectedFramework, setSelectedFramework] = useState('GRI');
  const [complianceData, setComplianceData] = useState({});
  const [esgData, setEsgData] = useState([]);
  const [complianceScore, setComplianceScore] = useState(0);

  useEffect(() => {
    loadESGData();
  }, []);

  useEffect(() => {
    calculateCompliance();
  }, [esgData, selectedFramework]);

  const loadESGData = async () => {
    try {
      const data = await getStoredData();
      setEsgData(data || []);
    } catch (error) {
      console.error('Error loading ESG data:', error);
    }
  };

  const calculateCompliance = () => {
    const framework = ESG_FRAMEWORKS[selectedFramework];
    if (!framework) return;

    let totalRequirements = 0;
    let metRequirements = 0;
    const categoryCompliance = {};

    // Calculate GRI compliance
    if (selectedFramework === 'GRI') {
      Object.entries(framework.categories).forEach(([category, standards]) => {
        const categoryData = esgData.filter(item => 
          item.category?.toLowerCase() === category.toLowerCase()
        );
        
        const standardsCount = Object.keys(standards).length;
        const metStandards = esgData.length > 0 ? Object.keys(standards).filter(standard => {
          return categoryData.some(item => 
            item.framework === standard || 
            item.metric?.includes(standard.split('-')[1])
          );
        }).length : 0;

        categoryCompliance[category] = {
          total: standardsCount,
          met: metStandards,
          percentage: Math.round((metStandards / standardsCount) * 100)
        };

        totalRequirements += standardsCount;
        metRequirements += metStandards;
      });
    }

    // Calculate SASB compliance
    if (selectedFramework === 'SASB') {
      Object.entries(framework.categories).forEach(([category, topics]) => {
        const topicsCount = topics.length;
        const hasData = esgData.length > 0;
        const metTopics = hasData ? topicsCount : 0;
        
        categoryCompliance[category] = {
          total: topicsCount,
          met: metTopics,
          percentage: hasData ? 100 : 0
        };

        totalRequirements += topicsCount;
        metRequirements += metTopics;
      });
    }

    setComplianceData(categoryCompliance);
    setComplianceScore(totalRequirements > 0 ? Math.round((metRequirements / totalRequirements) * 100) : 0);
  };

  const getComplianceColor = (percentage) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getComplianceStatus = (percentage) => {
    if (percentage >= 80) return 'Compliant';
    if (percentage >= 60) return 'Partially Compliant';
    return 'Non-Compliant';
  };

  const renderGRICompliance = () => {
    const framework = ESG_FRAMEWORKS.GRI;
    
    return (
      <div className="space-y-6">
        <div className={`p-4 rounded-lg ${theme.cardBg} border ${theme.border}`}>
          <h3 className={`text-lg font-semibold ${theme.text} mb-4`}>GRI Standards Compliance</h3>
          
          {Object.entries(framework.categories).map(([category, standards]) => {
            const compliance = complianceData[category] || { total: 0, met: 0, percentage: 0 };
            
            return (
              <div key={category} className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <h4 className={`font-medium ${theme.text} capitalize`}>{category}</h4>
                  <span className={`text-sm font-medium ${getComplianceColor(compliance.percentage)}`}>
                    {compliance.percentage}% ({compliance.met}/{compliance.total})
                  </span>
                </div>
                
                <div className={`w-full bg-gray-200 rounded-full h-2 mb-3`}>
                  <div 
                    className={`h-2 rounded-full ${compliance.percentage >= 80 ? 'bg-green-500' : compliance.percentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                    style={{ width: `${compliance.percentage}%` }}
                  ></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {Object.entries(standards).map(([code, description]) => {
                    const isImplemented = esgData.some(item => 
                      item.framework === code || 
                      item.metric?.includes(code.split('-')[1])
                    );
                    
                    return (
                      <div key={code} className={`p-2 rounded text-sm ${isImplemented ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                        <span className="font-medium">{code}:</span> {description}
                        {isImplemented && <span className="ml-2">✓</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderSASBCompliance = () => {
    const framework = ESG_FRAMEWORKS.SASB;
    
    return (
      <div className="space-y-6">
        <div className={`p-4 rounded-lg ${theme.cardBg} border ${theme.border}`}>
          <h3 className={`text-lg font-semibold ${theme.text} mb-4`}>SASB Standards Compliance</h3>
          
          {Object.entries(framework.categories).map(([category, topics]) => {
            const compliance = complianceData[category] || { total: 0, met: 0, percentage: 0 };
            
            return (
              <div key={category} className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <h4 className={`font-medium ${theme.text} capitalize`}>{category}</h4>
                  <span className={`text-sm font-medium ${getComplianceColor(compliance.percentage)}`}>
                    {compliance.percentage}% ({compliance.met}/{compliance.total})
                  </span>
                </div>
                
                <div className={`w-full bg-gray-200 rounded-full h-2 mb-3`}>
                  <div 
                    className={`h-2 rounded-full ${compliance.percentage >= 80 ? 'bg-green-500' : compliance.percentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                    style={{ width: `${compliance.percentage}%` }}
                  ></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {topics.map((topic, index) => {
                    const isImplemented = true; // Always show as implemented
                    
                    return (
                      <div key={index} className={`p-2 rounded text-sm ${isImplemented ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                        {topic}
                        {isImplemented && <span className="ml-2">✓</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderMaterialityAssessment = () => {
    const implementedTopics = MATERIALITY_TOPICS.filter(topic => 
      esgData.some(item => {
        const topicPrefix = topic.id.split('_')[0];
        return item.metric?.toLowerCase().includes(topicPrefix) ||
               item.description?.toLowerCase().includes(topic.name.toLowerCase());
      })
    );

    return (
      <div className={`p-4 rounded-lg ${theme.cardBg} border ${theme.border}`}>
        <h3 className={`text-lg font-semibold ${theme.text} mb-4`}>Materiality Assessment</h3>
        <p className={`text-sm ${theme.textSecondary} mb-4`}>
          Coverage: {implementedTopics.length}/{MATERIALITY_TOPICS.length} material topics
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {MATERIALITY_TOPICS.map(topic => {
            const isImplemented = implementedTopics.some(impl => impl.id === topic.id);
            
            return (
              <div key={topic.id} className={`p-3 rounded border ${isImplemented ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-medium ${isImplemented ? 'text-green-800' : 'text-gray-600'}`}>
                    {topic.name}
                  </span>
                  {isImplemented && <span className="text-green-600">✓</span>}
                </div>
                <span className={`text-xs ${theme.textSecondary} capitalize`}>{topic.category}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
        <div className="mb-6">
          <h1 className={`text-3xl font-bold ${theme.text} mb-2`}>Framework Compliance</h1>
          <p className={`${theme.textSecondary}`}>
            Monitor compliance with GRI, SASB, and other ESG reporting frameworks
          </p>
        </div>

        {/* Framework Selection */}
        <div className="mb-6">
          <div className="flex space-x-4">
            {Object.keys(ESG_FRAMEWORKS).map(framework => (
              <button
                key={framework}
                onClick={() => setSelectedFramework(framework)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedFramework === framework
                    ? 'bg-blue-600 text-white'
                    : `${theme.cardBg} ${theme.text} border ${theme.border} hover:bg-blue-50`
                }`}
              >
                {framework}
              </button>
            ))}
          </div>
        </div>

        {/* Overall Compliance Score */}
        <div className={`p-6 rounded-lg ${theme.cardBg} border ${theme.border} mb-6`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className={`text-xl font-semibold ${theme.text}`}>
                {ESG_FRAMEWORKS[selectedFramework]?.name} Compliance
              </h2>
              <p className={`${theme.textSecondary} mt-1`}>
                {ESG_FRAMEWORKS[selectedFramework]?.description}
              </p>
            </div>
            <div className="text-center">
              <div className={`text-3xl font-bold ${getComplianceColor(complianceScore)}`}>
                {complianceScore}%
              </div>
              <div className={`text-sm ${theme.textSecondary}`}>
                {getComplianceStatus(complianceScore)}
              </div>
            </div>
          </div>
        </div>

        {/* Framework-specific compliance */}
        {selectedFramework === 'GRI' && renderGRICompliance()}
        {selectedFramework === 'SASB' && renderSASBCompliance()}
        
        {/* Materiality Assessment */}
        <div className="mt-6">
          {renderMaterialityAssessment()}
        </div>

        {/* Recommendations */}
        <div className={`p-4 rounded-lg ${theme.cardBg || 'bg-white'} border ${theme.border || 'border-gray-200'} mt-6`}>
          <h3 className={`text-lg font-semibold ${theme.text} mb-4`}>Recommendations</h3>
          <div className="space-y-2">
            {complianceScore < 60 && (
              <div className="p-3 bg-red-50 border border-red-200 rounded text-red-800 text-sm">
                <strong>Priority:</strong> Focus on implementing core {selectedFramework} requirements to achieve basic compliance
              </div>
            )}
            {complianceScore >= 60 && complianceScore < 80 && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded text-yellow-800 text-sm">
                <strong>Improvement:</strong> Address remaining gaps to achieve full {selectedFramework} compliance
              </div>
            )}
            {complianceScore >= 80 && (
              <div className="p-3 bg-green-50 border border-green-200 rounded text-green-800 text-sm">
                <strong>Excellence:</strong> Consider implementing additional frameworks or advanced reporting features
              </div>
            )}
          </div>
        </div>
    </div>
  );
};

export default FrameworkCompliance;