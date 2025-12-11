import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { getThemeClasses } from '../utils/themeUtils';

const AdvancedESGDataEntry = ({ onClose }) => {
  const { isDark } = useTheme();
  const theme = getThemeClasses(isDark);
  const [activeTab, setActiveTab] = useState('mining');
  const [formData, setFormData] = useState({});

  const tabs = [
    { id: 'mining', label: 'Mining Sector', icon: '⛏️', frameworks: ['ICMM', 'EITI', 'ISSB S1/S2'] },
    { id: 'zimbabwe', label: 'Zimbabwe Compliance', icon: '🇿🇼', frameworks: ['EMA', 'MMA', 'ZSE'] },
    { id: 'climate', label: 'Climate & ISSB', icon: '🌡️', frameworks: ['IFRS S1', 'IFRS S2', 'TCFD'] },
    { id: 'investment', label: 'Investment & FDI', icon: '💰', frameworks: ['MSCI', 'Sustainalytics'] },
    { id: 'supply', label: 'Supply Chain', icon: '🔗', frameworks: ['Conflict Minerals', 'Due Diligence'] }
  ];

  const miningMetrics = [
    { id: 'tailings', label: 'Tailings Management (tonnes)', unit: 'tonnes', framework: 'ICMM Principle 6' },
    { id: 'waterPollution', label: 'Water Pollution Index', unit: 'score', framework: 'EMA Section 4' },
    { id: 'landDegradation', label: 'Land Degradation (hectares)', unit: 'ha', framework: 'ICMM Principle 7' },
    { id: 'biodiversity', label: 'Biodiversity Impact Score', unit: 'score', framework: 'ISSB S2' },
    { id: 'mineClosureCost', label: 'Mine Closure Provision (ZWL)', unit: 'ZWL', framework: 'MMA Section 157' },
    { id: 'artisanalMining', label: 'Artisanal Mining Impact', unit: 'score', framework: 'EITI Req 4.7' },
    { id: 'resettlement', label: 'Community Resettlement (families)', unit: 'families', framework: 'ICMM Principle 3' },
    { id: 'localEmployment', label: 'Local Employment (%)', unit: '%', framework: 'EITI Req 6.3' },
    { id: 'miningFatalities', label: 'Mining Fatalities', unit: 'count', framework: 'ICMM Principle 5' },
    { id: 'conflictMinerals', label: 'Conflict Minerals Risk', unit: 'score', framework: 'OECD Due Diligence' },
    { id: 'fdiImpact', label: 'FDI Impact Score', unit: 'score', framework: 'ZSE Listing Req' }
  ];

  const zimbabweMetrics = [
    { id: 'emaCompliance', label: 'EMA Compliance Score', unit: '%', framework: 'EMA Act' },
    { id: 'mmaCompliance', label: 'MMA Compliance Score', unit: '%', framework: 'MMA Act' },
    { id: 'zseReporting', label: 'ZSE Reporting Quality', unit: 'score', framework: 'ZSE Requirements' },
    { id: 'localCurrency', label: 'Local Currency Operations (ZWL)', unit: 'ZWL', framework: 'RBZ Regulations' },
    { id: 'communityImpact', label: 'Community Impact Assessment', unit: 'score', framework: 'EMA Section 97' }
  ];

  const climateMetrics = [
    { id: 'scope1', label: 'Scope 1 Emissions (tCO2e)', unit: 'tCO2e', framework: 'ISSB S2' },
    { id: 'scope2', label: 'Scope 2 Emissions (tCO2e)', unit: 'tCO2e', framework: 'ISSB S2' },
    { id: 'scope3', label: 'Scope 3 Emissions (tCO2e)', unit: 'tCO2e', framework: 'ISSB S2' },
    { id: 'climateRisk', label: 'Climate Risk Exposure', unit: 'score', framework: 'TCFD' },
    { id: 'transitionPlan', label: 'Transition Plan Quality', unit: 'score', framework: 'ISSB S2' },
    { id: 'scenarioAnalysis', label: 'Scenario Analysis Completion', unit: '%', framework: 'TCFD' }
  ];

  const investmentMetrics = [
    { id: 'msciRating', label: 'MSCI ESG Rating', unit: 'rating', framework: 'MSCI' },
    { id: 'sustainalytics', label: 'Sustainalytics Risk Score', unit: 'score', framework: 'Sustainalytics' },
    { id: 'esgLinked', label: 'ESG-Linked Financing (USD)', unit: 'USD', framework: 'Green Bond Principles' },
    { id: 'fdiInflow', label: 'FDI Inflow (USD)', unit: 'USD', framework: 'Investment Promotion' },
    { id: 'investorScore', label: 'Investor ESG Score', unit: 'score', framework: 'Custom' }
  ];

  const supplyChainMetrics = [
    { id: 'conflictMineralsDD', label: 'Conflict Minerals Due Diligence', unit: '%', framework: 'OECD' },
    { id: 'supplierESG', label: 'Supplier ESG Assessments', unit: '%', framework: 'GRI 308/414' },
    { id: 'artisanalDD', label: 'Artisanal Mining Due Diligence', unit: 'score', framework: 'EITI' },
    { id: 'traceability', label: 'Supply Chain Traceability', unit: '%', framework: 'OECD' }
  ];

  const getMetrics = () => {
    switch(activeTab) {
      case 'mining': return miningMetrics;
      case 'zimbabwe': return zimbabweMetrics;
      case 'climate': return climateMetrics;
      case 'investment': return investmentMetrics;
      case 'supply': return supplyChainMetrics;
      default: return [];
    }
  };

  const handleSave = () => {
    const existing = JSON.parse(localStorage.getItem('advanced_esg_data') || '[]');
    existing.push({ ...formData, timestamp: new Date().toISOString(), tab: activeTab });
    localStorage.setItem('advanced_esg_data', JSON.stringify(existing));
    alert('Advanced ESG data saved successfully!');
    setFormData({});
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`${theme.card} rounded-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col`}>
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">🚀 Advanced ESG Data Entry</h2>
            <p className="text-sm text-gray-600">Mining-specific, Zimbabwe compliance, ISSB, Investment tracking</p>
          </div>
          <button onClick={onClose} className="text-2xl hover:text-red-600">×</button>
        </div>

        <div className="flex gap-2 p-4 border-b border-gray-200 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-blue-500 to-green-500 text-white'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              {tab.icon} {tab.label}
              <div className="text-xs mt-1">{tab.frameworks.join(' • ')}</div>
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {getMetrics().map(metric => (
              <div key={metric.id} className="space-y-2">
                <label className="block text-sm font-medium">
                  {metric.label}
                  <span className="ml-2 text-xs text-blue-600">{metric.framework}</span>
                </label>
                <input
                  type={metric.unit === 'rating' ? 'text' : 'number'}
                  value={formData[metric.id] || ''}
                  onChange={(e) => setFormData({ ...formData, [metric.id]: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg border ${theme.input}`}
                  placeholder={`Enter ${metric.unit}`}
                />
                <p className="text-xs text-gray-500">Unit: {metric.unit}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
          <button onClick={onClose} className="px-6 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">
            Cancel
          </button>
          <button onClick={handleSave} className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            💾 Save Advanced Data
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdvancedESGDataEntry;
