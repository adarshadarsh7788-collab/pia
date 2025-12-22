import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { getThemeClasses } from '../utils/themeUtils';
import { BRSRReportGenerator } from '../utils/reportGenerators/BRSRReportGenerator';
import { GRIReportGenerator } from '../utils/reportGenerators/GRIReportGenerator';
import { SASBReportGenerator } from '../utils/reportGenerators/SASBReportGenerator';
import { TCFDReportGenerator } from '../utils/reportGenerators/TCFDReportGenerator';

const FrameworkReportSelector = ({ data, onClose }) => {
  const { isDark } = useTheme();
  const theme = getThemeClasses(isDark);
  const [selectedFramework, setSelectedFramework] = useState('GRI');
  const [isGenerating, setIsGenerating] = useState(false);
  const [industry, setIndustry] = useState('technology');

  const frameworks = [
    {
      id: 'BRSR',
      name: 'SEBI BRSR',
      description: 'Business Responsibility and Sustainability Reporting for Indian listed companies',
      icon: '🇮🇳',
      generator: BRSRReportGenerator
    },
    {
      id: 'GRI',
      name: 'GRI Standards',
      description: 'Global Reporting Initiative - Most widely used sustainability reporting standards',
      icon: '🌍',
      generator: GRIReportGenerator
    },
    {
      id: 'SASB',
      name: 'SASB Standards',
      description: 'Sustainability Accounting Standards Board - Industry-specific standards',
      icon: '🏭',
      generator: SASBReportGenerator
    },
    {
      id: 'TCFD',
      name: 'TCFD Framework',
      description: 'Task Force on Climate-related Financial Disclosures',
      icon: '🌡️',
      generator: TCFDReportGenerator
    }
  ];

  const generateReport = async (frameworkId) => {
    setIsGenerating(true);
    
    try {
      const framework = frameworks.find(f => f.id === frameworkId);
      const companyName = data.companyName || data.companyInfo?.companyName || 'Company';
      const reportingYear = data.reportingYear || data.companyInfo?.reportingYear || new Date().getFullYear();
      
      const options = {
        companyName,
        reportingYear,
        industry: frameworkId === 'SASB' ? industry : undefined
      };
      
      const pdf = framework.generator.generateReport(data, options);
      const filename = `${framework.name.replace(/\s+/g, '-')}-Report-${new Date().toISOString().split('T')[0]}.pdf`;
      
      pdf.save(filename);
      
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Error generating report. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`max-w-4xl w-full mx-4 p-6 rounded-xl shadow-2xl ${theme.bg.card}`}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className={`text-2xl font-bold ${theme.text.primary}`}>Framework-Specific Reports</h2>
            <p className={`text-sm ${theme.text.secondary}`}>Generate compliance reports for different ESG frameworks</p>
          </div>
          <button 
            onClick={onClose}
            className={`text-gray-500 hover:text-gray-700 text-xl font-bold`}
          >
            ✕
          </button>
        </div>

        {/* Framework Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {frameworks.map(framework => (
            <div
              key={framework.id}
              onClick={() => setSelectedFramework(framework.id)}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                selectedFramework === framework.id
                  ? 'border-blue-500 bg-blue-50'
                  : `border-gray-200 ${theme.hover.card}`
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{framework.icon}</span>
                <div className="flex-1">
                  <h3 className={`font-semibold ${theme.text.primary}`}>{framework.name}</h3>
                  <p className={`text-sm ${theme.text.secondary} mt-1`}>{framework.description}</p>
                  {selectedFramework === framework.id && (
                    <div className="mt-2">
                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">Selected</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Industry Selection for SASB */}
        {selectedFramework === 'SASB' && (
          <div className={`p-4 rounded-lg ${theme.bg.subtle} mb-6`}>
            <h4 className={`font-medium ${theme.text.primary} mb-3`}>Industry Classification (Required for SASB)</h4>
            <select
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className={`w-full p-3 border rounded-lg ${theme.bg.input} ${theme.border.input}`}
            >
              <option value="technology">Technology & Communications</option>
              <option value="financial">Financial Services</option>
              <option value="healthcare">Healthcare</option>
              <option value="manufacturing">Manufacturing</option>
              <option value="energy">Energy</option>
              <option value="retail">Retail & Consumer</option>
            </select>
          </div>
        )}

        {/* Framework Details */}
        <div className={`p-4 rounded-lg ${theme.bg.subtle} mb-6`}>
          <h4 className={`font-medium ${theme.text.primary} mb-3`}>
            {frameworks.find(f => f.id === selectedFramework)?.name} Report Details
          </h4>
          
          {selectedFramework === 'BRSR' && (
            <div className="space-y-2 text-sm">
              <p>• Section A: General Disclosures</p>
              <p>• Section B: Management and Process Disclosures (9 Principles)</p>
              <p>• Section C: Principle-wise Performance Disclosure</p>
              <p>• Mandatory for top 1000 listed companies in India</p>
            </div>
          )}
          
          {selectedFramework === 'GRI' && (
            <div className="space-y-2 text-sm">
              <p>• GRI 2: General Disclosures (Organizational profile, strategy, governance)</p>
              <p>• GRI 3: Material Topics (Materiality assessment and management approach)</p>
              <p>• GRI 300 Series: Environmental Standards</p>
              <p>• GRI 400 Series: Social Standards</p>
            </div>
          )}
          
          {selectedFramework === 'SASB' && (
            <div className="space-y-2 text-sm">
              <p>• Industry-specific sustainability topics</p>
              <p>• Financially material ESG metrics</p>
              <p>• Standardized accounting metrics</p>
              <p>• Activity metrics for context</p>
            </div>
          )}
          
          {selectedFramework === 'TCFD' && (
            <div className="space-y-2 text-sm">
              <p>• Governance: Board oversight and management role</p>
              <p>• Strategy: Climate risks, opportunities, and business impact</p>
              <p>• Risk Management: Risk identification and management processes</p>
              <p>• Metrics & Targets: Climate metrics and performance targets</p>
            </div>
          )}
        </div>

        {/* Data Coverage Summary */}
        <div className={`p-4 rounded-lg border-l-4 border-blue-500 ${theme.bg.subtle} mb-6`}>
          <h4 className={`font-medium ${theme.text.primary} mb-2`}>Data Coverage Summary</h4>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className={theme.text.secondary}>Environmental:</span>
              <span className="ml-2 px-2 py-1 rounded text-xs bg-green-100 text-green-800">
                {Object.keys(data.environmental || {}).length} metrics
              </span>
            </div>
            <div>
              <span className={theme.text.secondary}>Social:</span>
              <span className="ml-2 px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">
                {Object.keys(data.social || {}).length} metrics
              </span>
            </div>
            <div>
              <span className={theme.text.secondary}>Governance:</span>
              <span className="ml-2 px-2 py-1 rounded text-xs bg-purple-100 text-purple-800">
                {Object.keys(data.governance || {}).length} metrics
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-end">
          <button
            onClick={onClose}
            className={`px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 ${theme.text.primary}`}
          >
            Cancel
          </button>
          <button
            onClick={() => generateReport(selectedFramework)}
            disabled={isGenerating}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              isGenerating
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isGenerating ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
                Generating...
              </span>
            ) : (
              `Generate ${frameworks.find(f => f.id === selectedFramework)?.name} Report`
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FrameworkReportSelector;