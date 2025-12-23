import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { getThemeClasses } from '../utils/themeUtils';

import WaterManagementForm from './environmental/WaterManagementForm';
import WorkforceManagementForm from './social/WorkforceManagementForm';
import BoardManagementForm from './governance/BoardManagementForm';
import PatientSafetyForm from './social/PatientSafetyForm';

const UnifiedAdvancedEntry = ({ onClose }) => {
  const { isDark } = useTheme();
  const theme = getThemeClasses(isDark);
  
  // Helper function to get sector tabs (moved up for use in useState)
  const getSectorTabs = (sector) => {
    const baseTabs = [
      { id: 'climate', label: 'Climate & ISSB', icon: '🌡️', frameworks: ['IFRS S1', 'IFRS S2', 'TCFD'], color: 'red' },
      { id: 'investment', label: 'Investment & ESG', icon: '💰', frameworks: ['MSCI', 'Sustainalytics'], color: 'blue' },
      { id: 'supply', label: 'Supply Chain', icon: '🔗', frameworks: ['GRI-308', 'GRI-414'], color: 'purple' }
    ];

    if (sector === 'mining') {
      return [
        { id: 'mining', label: 'Mining Sector', icon: '⛏️', frameworks: ['ICMM', 'EITI', 'ISSB S1/S2'], color: 'amber' },
        { id: 'zimbabwe', label: 'Zimbabwe Compliance', icon: '🇿🇼', frameworks: ['EMA', 'MMA', 'ZSE'], color: 'green' },
        ...baseTabs
      ];
    } else if (sector === 'healthcare') {
      return [
        { id: 'healthcare', label: 'Healthcare Sector', icon: '🏥', frameworks: ['SASB-HC', 'GRI-416', 'FDA'], color: 'pink' },
        ...baseTabs
      ];
    } else {
      return baseTabs;
    }
  };
  
  const [activeView, setActiveView] = useState('home'); // 'home', 'specialized', 'sector'
  const [selectedModule, setSelectedModule] = useState(null);
  const [activeSectorTab, setActiveSectorTab] = useState(() => {
    const sector = localStorage.getItem('currentSector') || 'general';
    const tabs = getSectorTabs(sector);
    return tabs.length > 0 ? tabs[0].id : 'climate';
  });
  const [selectedSector, setSelectedSector] = useState(null);
  const [sectorFormData, setSectorFormData] = useState({});
  const [toast, setToast] = useState(null);

  // Get sector from localStorage or default to 'general'
  const currentSector = localStorage.getItem('currentSector') || 'general';

  // Specialized Modules (sector-specific)
  const getSpecializedModules = (sector) => {
    if (sector === 'mining') {
      return [
        {
          id: 'water_management',
          title: '💧 Mining Water Management',
          description: 'Track water withdrawal, discharge, tailings water, and mine site water usage',
          category: 'Environmental',
          component: WaterManagementForm,
          color: 'blue',
          frameworks: ['GRI-303', 'ICMM']
        },
        {
          id: 'workforce_management',
          title: '👥 Mining Workforce & Safety',
          description: 'Monitor mining workforce, safety metrics, training, and community relations',
          category: 'Social',
          component: WorkforceManagementForm,
          color: 'purple',
          frameworks: ['GRI-403', 'GRI-413']
        },
        {
          id: 'board_management',
          title: '⚖️ Mining Governance & Board',
          description: 'Track board expertise, governance committees, and mining-specific policies',
          category: 'Governance',
          component: BoardManagementForm,
          color: 'indigo',
          frameworks: ['IFRS-S1', 'GRI-2-9']
        }
      ];
    } else if (sector === 'healthcare') {
      return [
        {
          id: 'patient_safety',
          title: '🏥 Patient Safety Management',
          description: 'Track patient safety incidents, adverse events, and quality metrics',
          category: 'Social',
          component: PatientSafetyForm,
          color: 'pink',
          frameworks: ['SASB-HC-MS', 'GRI-416']
        }
      ];
    } else if (sector === 'manufacturing') {
      return [
        {
          id: 'supply_chain_management',
          title: '🏭 Supply Chain ESG',
          description: 'Track supplier assessments, conflict minerals, and supply chain sustainability',
          category: 'Environmental',
          component: WaterManagementForm,
          color: 'green',
          frameworks: ['GRI-308', 'GRI-414']
        },
        {
          id: 'product_safety',
          title: '🔍 Product Safety & Quality',
          description: 'Monitor product recalls, safety incidents, and quality metrics',
          category: 'Social',
          component: WorkforceManagementForm,
          color: 'orange',
          frameworks: ['GRI-416', 'ISO-9001']
        }
      ];
    }
    return []; // No specialized modules for other sectors
  };

  const specializedModules = getSpecializedModules(currentSector);

  const sectorTabs = getSectorTabs(currentSector);

  // Sector Metrics
  const sectorMetrics = {
    mining: [
      { id: 'tailings', label: 'Tailings Management (tonnes)', unit: 'tonnes', framework: 'ICMM Principle 6' },
      { id: 'waterPollution', label: 'Water Pollution Index', unit: 'score', framework: 'EMA Section 4' },
      { id: 'landDegradation', label: 'Land Degradation (hectares)', unit: 'ha', framework: 'ICMM Principle 7' },
      { id: 'biodiversity', label: 'Biodiversity Impact Score', unit: 'score', framework: 'ISSB S2' },
      { id: 'mineClosureCost', label: 'Mine Closure Provision (ZWL)', unit: 'ZWL', framework: 'MMA Section 157' },
      { id: 'artisanalMining', label: 'Artisanal Mining Impact', unit: 'score', framework: 'EITI Req 4.7' },
      { id: 'resettlement', label: 'Community Resettlement (families)', unit: 'families', framework: 'ICMM Principle 3' },
      { id: 'localEmployment', label: 'Local Employment (%)', unit: '%', framework: 'EITI Req 6.3' },
      { id: 'miningFatalities', label: 'Mining Fatalities', unit: 'count', framework: 'ICMM Principle 5' },
      { id: 'conflictMinerals', label: 'Conflict Minerals Risk', unit: 'score', framework: 'OECD Due Diligence' }
    ],
    healthcare: [
      { id: 'patientSafety', label: 'Patient Safety Incidents', unit: 'count', framework: 'SASB-HC-MS-250a.1' },
      { id: 'medicineAccess', label: 'Medicine Access Programs', unit: 'count', framework: 'SASB-HC-BP-240a.1' },
      { id: 'drugPricing', label: 'Drug Pricing Transparency', unit: 'score', framework: 'SASB-HC-BP-240a.2' },
      { id: 'clinicalTrials', label: 'Clinical Trial Participants', unit: 'count', framework: 'SASB-HC-BP-210a.1' },
      { id: 'adverseEvents', label: 'Adverse Drug Events', unit: 'count', framework: 'GRI-416-2' },
      { id: 'rdInvestment', label: 'R&D Investment (USD)', unit: 'USD', framework: 'SASB-HC-BP-200a.1' },
      { id: 'healthcareAccess', label: 'Healthcare Access Score', unit: 'score', framework: 'SASB-HC-DL-240a.1' },
      { id: 'dataPrivacy', label: 'Patient Data Privacy Breaches', unit: 'count', framework: 'SASB-HC-MS-230a.1' },
      { id: 'antibiotic', label: 'Antibiotic Resistance Programs', unit: 'count', framework: 'SASB-HC-BP-260a.1' },
      { id: 'medicalWaste', label: 'Medical Waste Generated (tonnes)', unit: 'tonnes', framework: 'GRI-306-3' },
      { id: 'healthEquity', label: 'Health Equity Initiatives', unit: 'count', framework: 'SASB-HC-DL-240a.2' },
      { id: 'productRecalls', label: 'Product Recalls', unit: 'count', framework: 'GRI-416-2' }
    ],
    zimbabwe: [
      { id: 'emaCompliance', label: 'EMA Compliance Score', unit: '%', framework: 'EMA Act' },
      { id: 'mmaCompliance', label: 'MMA Compliance Score', unit: '%', framework: 'MMA Act' },
      { id: 'zseReporting', label: 'ZSE Reporting Quality', unit: 'score', framework: 'ZSE Requirements' },
      { id: 'localCurrency', label: 'Local Currency Operations (ZWL)', unit: 'ZWL', framework: 'RBZ Regulations' },
      { id: 'communityImpact', label: 'Community Impact Assessment', unit: 'score', framework: 'EMA Section 97' }
    ],
    climate: [
      { id: 'scope1', label: 'Scope 1 Emissions (tCO2e)', unit: 'tCO2e', framework: 'ISSB S2' },
      { id: 'scope2', label: 'Scope 2 Emissions (tCO2e)', unit: 'tCO2e', framework: 'ISSB S2' },
      { id: 'scope3', label: 'Scope 3 Emissions (tCO2e)', unit: 'tCO2e', framework: 'ISSB S2' },
      { id: 'climateRisk', label: 'Climate Risk Exposure', unit: 'score', framework: 'TCFD' },
      { id: 'transitionPlan', label: 'Transition Plan Quality', unit: 'score', framework: 'ISSB S2' },
      { id: 'scenarioAnalysis', label: 'Scenario Analysis Completion', unit: '%', framework: 'TCFD' }
    ],
    investment: [
      { id: 'msciRating', label: 'MSCI ESG Rating', unit: 'rating', framework: 'MSCI' },
      { id: 'sustainalytics', label: 'Sustainalytics Risk Score', unit: 'score', framework: 'Sustainalytics' },
      { id: 'esgLinked', label: 'ESG-Linked Financing (USD)', unit: 'USD', framework: 'Green Bond Principles' },
      { id: 'fdiInflow', label: 'FDI Inflow (USD)', unit: 'USD', framework: 'Investment Promotion' },
      { id: 'investorScore', label: 'Investor ESG Score', unit: 'score', framework: 'Custom' }
    ],
    supply: [
      { id: 'conflictMineralsDD', label: 'Conflict Minerals Due Diligence', unit: '%', framework: 'OECD' },
      { id: 'supplierESG', label: 'Supplier ESG Assessments', unit: '%', framework: 'GRI 308/414' },
      { id: 'artisanalDD', label: 'Artisanal Mining Due Diligence', unit: 'score', framework: 'EITI' },
      { id: 'traceability', label: 'Supply Chain Traceability', unit: '%', framework: 'OECD' }
    ]
  };

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSectorSave = () => {
    const existing = JSON.parse(localStorage.getItem('advanced_esg_data') || '[]');
    existing.push({ 
      ...sectorFormData, 
      timestamp: new Date().toISOString(), 
      tab: activeSectorTab 
    });
    localStorage.setItem('advanced_esg_data', JSON.stringify(existing));
    showToast('Sector-specific data saved successfully!', 'success');
    setSectorFormData({});
  };

  const handleModuleSave = (data) => {
    showToast('Specialized module data saved successfully!', 'success');
    setSelectedModule(null);
  };

  // Render Specialized Module
  if (selectedModule) {
    const ModuleComponent = selectedModule.component;
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="max-w-6xl w-full max-h-[90vh] overflow-y-auto">
          <ModuleComponent 
            onSave={handleModuleSave}
            onClose={() => setSelectedModule(null)}
          />
        </div>
      </div>
    );
  }

  // Render Sector-Specific View
  if (activeView === 'sector') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className={`${theme.bg.card} rounded-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl`}>
          {/* Header */}
          <div className={`p-6 border-b ${theme.border.primary} flex justify-between items-center bg-gradient-to-r from-blue-50 to-green-50 ${isDark ? 'from-gray-800 to-gray-700' : ''}`}>
            <div>
              <h2 className={`text-2xl font-bold ${theme.text.primary} flex items-center gap-2`}>
                🌍 Sector-Specific ESG Metrics
              </h2>
              <p className={`text-sm ${theme.text.secondary} mt-1`}>
                {currentSector === 'mining' ? 'Mining, Zimbabwe compliance, Climate, Investment & Supply Chain' :
                 currentSector === 'healthcare' ? 'Healthcare, Climate, Investment & Supply Chain' :
                 'Climate, Investment & Supply Chain'}
              </p>
            </div>
            <button 
              onClick={() => setActiveView('home')} 
              className={`text-2xl ${theme.text.secondary} hover:text-red-600 transition-colors`}
            >
              ←
            </button>
          </div>

          {/* Tabs */}
          <div className={`flex gap-2 p-4 border-b ${theme.border.primary} overflow-x-auto bg-gray-50 ${isDark ? 'bg-gray-800' : ''}`}>
            {sectorTabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveSectorTab(tab.id)}
                className={`px-4 py-3 rounded-lg whitespace-nowrap transition-all duration-200 ${
                  activeSectorTab === tab.id
                    ? 'bg-gradient-to-r from-blue-500 to-green-500 text-white shadow-lg scale-105'
                    : `${theme.bg.subtle} ${theme.text.secondary} hover:scale-102`
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{tab.icon}</span>
                  <span className="font-medium">{tab.label}</span>
                </div>
                <div className="text-xs mt-1 opacity-90">{tab.frameworks.join(' • ')}</div>
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sectorMetrics[activeSectorTab]?.map(metric => (
                <div key={metric.id} className={`p-4 rounded-lg ${theme.bg.subtle} border ${theme.border.primary} hover:shadow-md transition-shadow`}>
                  <label className={`block text-sm font-medium ${theme.text.primary} mb-2`}>
                    {metric.label}
                  </label>
                  <input
                    type={metric.unit === 'rating' ? 'text' : 'number'}
                    value={sectorFormData[metric.id] || ''}
                    onChange={(e) => setSectorFormData({ ...sectorFormData, [metric.id]: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${theme.bg.input} ${theme.border.input} ${theme.text.primary} focus:ring-2 focus:ring-blue-500`}
                    placeholder={`Enter ${metric.unit}`}
                  />
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-blue-600 font-medium">{metric.framework}</span>
                    <span className={`text-xs ${theme.text.muted}`}>Unit: {metric.unit}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className={`p-6 border-t ${theme.border.primary} flex justify-between items-center bg-gray-50 ${isDark ? 'bg-gray-800' : ''}`}>
            <button 
              onClick={() => setActiveView('home')} 
              className={`px-6 py-2 ${theme.bg.subtle} rounded-lg hover:bg-gray-300 transition-colors`}
            >
              ← Back to Home
            </button>
            <div className="flex gap-3">
              <button 
                onClick={() => setSectorFormData({})} 
                className="px-6 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Clear Form
              </button>
              <button 
                onClick={handleSectorSave} 
                className="px-6 py-2 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg hover:shadow-lg transition-all"
              >
                💾 Save Data
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render Specialized Modules View
  if (activeView === 'specialized') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className={`max-w-5xl w-full max-h-[90vh] overflow-y-auto ${theme.bg.card} rounded-xl shadow-2xl`}>
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className={`text-2xl font-bold ${theme.text.primary} flex items-center gap-2`}>
                  🎯 Specialized {currentSector === 'mining' ? 'Mining' : currentSector === 'healthcare' ? 'Healthcare' : 'Industry'} Modules
                </h2>
                <p className={`text-sm ${theme.text.secondary} mt-1`}>Advanced calculators with automated metrics</p>
              </div>
              <button 
                onClick={() => setActiveView('home')}
                className={`text-2xl ${theme.text.secondary} hover:text-red-600 transition-colors`}
              >
                ←
              </button>
            </div>

            {/* Module Categories */}
            <div className="space-y-6">
              {['Environmental', 'Social', 'Governance'].map(category => (
                <div key={category} className={`p-4 rounded-lg ${theme.bg.subtle}`}>
                  <h3 className={`text-lg font-semibold ${theme.text.primary} mb-4 flex items-center gap-2`}>
                    {category === 'Environmental' ? '🌱' : category === 'Social' ? '👥' : '⚖️'}
                    {category} Modules
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    {specializedModules
                      .filter(module => module.category === category)
                      .map(module => (
                        <div
                          key={module.id}
                          onClick={() => setSelectedModule(module)}
                          className={`p-5 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:scale-102 hover:shadow-lg ${
                            module.color === 'blue' ? 'border-blue-200 hover:border-blue-400 hover:bg-blue-50' :
                            module.color === 'purple' ? 'border-purple-200 hover:border-purple-400 hover:bg-purple-50' :
                            'border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50'
                          } ${isDark ? 'hover:bg-opacity-10' : ''} ${theme.bg.card}`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className={`font-semibold ${theme.text.primary} mb-2 text-lg`}>
                                {module.title}
                              </h4>
                              <p className={`text-sm ${theme.text.secondary} mb-3`}>
                                {module.description}
                              </p>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                                  module.color === 'blue' ? 'bg-blue-100 text-blue-800' :
                                  module.color === 'purple' ? 'bg-purple-100 text-purple-800' :
                                  'bg-indigo-100 text-indigo-800'
                                }`}>
                                  {module.category}
                                </span>
                                {module.frameworks.map(fw => (
                                  <span key={fw} className={`text-xs px-2 py-1 rounded ${theme.bg.subtle} ${theme.text.muted}`}>
                                    {fw}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                module.color === 'blue' ? 'bg-blue-100' :
                                module.color === 'purple' ? 'bg-purple-100' :
                                'bg-indigo-100'
                              }`}>
                                <span className="text-xl">→</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="flex gap-4 justify-between mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={() => setActiveView('home')}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                ← Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render Home View (Main Selection)
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`max-w-5xl w-full max-h-[90vh] overflow-y-auto ${theme.bg.card} rounded-xl shadow-2xl`}>
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className={`text-3xl font-bold ${theme.text.primary} flex items-center gap-3`}>
                🚀 Advanced ESG Data Entry
              </h2>
              <p className={`text-sm ${theme.text.secondary} mt-2`}>Choose your data entry method: Specialized modules or Sector-specific metrics</p>
            </div>
            <button 
              onClick={onClose}
              className={`text-3xl ${theme.text.secondary} hover:text-red-600 transition-colors`}
            >
              ✕
            </button>
          </div>

          {/* Main Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Specialized Modules Card */}
            <div
              onClick={() => setActiveView('specialized')}
              className={`p-6 rounded-xl border-2 border-blue-200 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:border-blue-400 bg-gradient-to-br from-blue-50 to-cyan-50 ${isDark ? 'from-blue-900 to-cyan-900 from-opacity-20 to-opacity-20' : ''}`}
            >
              <div className="text-center">
                <div className="text-5xl mb-4">🎯</div>
                <h3 className={`text-xl font-bold ${theme.text.primary} mb-3`}>
                  Specialized {currentSector === 'mining' ? 'Mining' : currentSector === 'healthcare' ? 'Healthcare' : currentSector === 'manufacturing' ? 'Manufacturing' : 'Industry'} Modules
                </h3>
                <p className={`text-sm ${theme.text.secondary} mb-4`}>
                  {currentSector === 'mining' ? 'Advanced calculators with automated metrics for Water, Workforce, and Board Management' :
                   currentSector === 'healthcare' ? 'Advanced calculators for Patient Safety, Clinical Trials, and Healthcare Access' :
                   currentSector === 'manufacturing' ? 'Advanced calculators for Supply Chain ESG, Product Safety, and Manufacturing Operations' :
                   'Advanced calculators with automated ESG metrics'}
                </p>
                <div className="space-y-2 text-left">
                  {specializedModules.map(module => (
                    <div key={module.id} className={`text-xs ${theme.text.secondary} flex items-center gap-2`}>
                      <span className="text-blue-500">✓</span> {module.title.replace(/^[^\s]+\s/, '')} ({module.frameworks.join(', ')})
                    </div>
                  ))}
                  {specializedModules.length === 0 && (
                    <div className={`text-xs ${theme.text.secondary} flex items-center gap-2`}>
                      <span className="text-gray-400">ℹ</span> No specialized modules available for this sector
                    </div>
                  )}
                </div>
                <div className="mt-4 pt-4 border-t border-blue-200">
                  <span className="text-xs px-3 py-1 rounded-full bg-blue-100 text-blue-800 font-medium">
                    {specializedModules.length} Modules Available
                  </span>
                </div>
              </div>
            </div>

            {/* Sector-Specific Card */}
            <div
              onClick={() => setActiveView('sector')}
              className={`p-6 rounded-xl border-2 border-green-200 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:border-green-400 bg-gradient-to-br from-green-50 to-emerald-50 ${isDark ? 'from-green-900 to-emerald-900 from-opacity-20 to-opacity-20' : ''}`}
            >
              <div className="text-center">
                <div className="text-5xl mb-4">🌍</div>
                <h3 className={`text-xl font-bold ${theme.text.primary} mb-3`}>Sector-Specific Metrics</h3>
                <p className={`text-sm ${theme.text.secondary} mb-4`}>
                  Industry-specific data entry for {currentSector === 'mining' ? 'Mining, Zimbabwe, Climate, Investment & Supply Chain' :
                   currentSector === 'healthcare' ? 'Healthcare, Climate, Investment & Supply Chain' :
                   'Climate, Investment & Supply Chain'}
                </p>
                <div className="space-y-2 text-left">
                  {sectorTabs.map(tab => (
                    <div key={tab.id} className={`text-xs ${theme.text.secondary} flex items-center gap-2`}>
                      <span className="text-green-500">✓</span> {tab.label} ({tab.frameworks.join(', ')})
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-green-200">
                  <span className="text-xs px-3 py-1 rounded-full bg-green-100 text-green-800 font-medium">
                    {sectorTabs.length} Sectors Available
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Benefits Section */}
          <div className={`p-6 rounded-lg border-l-4 border-blue-500 ${theme.bg.subtle} mb-6`}>
            <h3 className={`font-semibold ${theme.text.primary} mb-3 flex items-center gap-2`}>
              📈 Advanced Entry Benefits
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className={`font-medium ${theme.text.primary}`}>🤖 Automated Calculations</span>
                <p className={theme.text.secondary}>Real-time metric calculations and validations</p>
              </div>
              <div>
                <span className={`font-medium ${theme.text.primary}`}>📊 Framework Compliance</span>
                <p className={theme.text.secondary}>Aligned with GRI, ISSB, ICMM, EITI standards</p>
              </div>
              <div>
                <span className={`font-medium ${theme.text.primary}`}>✅ Data Quality</span>
                <p className={theme.text.secondary}>Built-in validation and audit trails</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-4 justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
          </div>
        </div>

        {/* Toast Notification */}
        {toast && (
          <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 animate-slide-in ${
            toast.type === 'success' ? 'bg-green-500 text-white' :
            toast.type === 'error' ? 'bg-red-500 text-white' :
            'bg-blue-500 text-white'
          }`}>
            <div className="flex items-center gap-2">
              <span>{toast.type === 'success' ? '✓' : toast.type === 'error' ? '✕' : 'ℹ'}</span>
              <span>{toast.message}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UnifiedAdvancedEntry;
