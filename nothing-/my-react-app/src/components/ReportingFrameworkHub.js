import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { getThemeClasses } from '../utils/themeUtils';
import { GRIReportGenerator } from '../utils/griReportGenerator';

const ReportingFrameworkHub = ({ onClose }) => {
  const { isDark } = useTheme();
  const theme = getThemeClasses(isDark);
  const [activeTab, setActiveTab] = useState('frameworks');
  const [esgData, setEsgData] = useState([]);
  const [selectedFrameworks, setSelectedFrameworks] = useState([]);
  const [reportYear, setReportYear] = useState(new Date().getFullYear());
  const [reportFormat, setReportFormat] = useState('PDF');
  const [includeCharts, setIncludeCharts] = useState(true);
  const [filterCategory, setFilterCategory] = useState('all');
  const [customSections, setCustomSections] = useState([]);
  const [showMateriality, setShowMateriality] = useState(false);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem('esgData') || '[]');
    setEsgData(data);
  }, []);

  const frameworks = [
    { id: 'GRI', name: 'GRI Standards', icon: '🌍', desc: 'Global Reporting Initiative', coverage: calculateCoverage('GRI') },
    { id: 'SDG', name: 'UN SDGs', icon: '🎯', desc: 'Sustainable Development Goals', coverage: calculateCoverage('SDG') },
    { id: 'IFRS', name: 'IFRS S1/S2', icon: '📊', desc: 'Sustainability Disclosure Standards', coverage: calculateCoverage('IFRS') },
    { id: 'ISSB', name: 'ISSB Standards', icon: '📈', desc: 'International Sustainability Standards', coverage: calculateCoverage('ISSB') },
    { id: 'TCFD', name: 'TCFD', icon: '🌡️', desc: 'Climate-related Disclosures', coverage: calculateCoverage('TCFD') },
    { id: 'SASB', name: 'SASB', icon: '🏭', desc: 'Industry-specific Standards', coverage: calculateCoverage('SASB') }
  ];

  function calculateCoverage(framework) {
    if (esgData.length === 0) return 0;
    const requirements = {
      GRI: 15, SDG: 17, IFRS: 12, ISSB: 10, TCFD: 11, SASB: 13
    };
    const available = esgData.length;
    return Math.min(100, Math.round((available / requirements[framework]) * 100));
  }

  const generateReport = (frameworkId) => {
    const data = JSON.parse(localStorage.getItem('esg_last_submission') || '{}');
    if (Object.keys(data).length === 0) {
      alert('No ESG data available. Please submit data first.');
      return;
    }

    const filteredData = filterCategory === 'all' ? data : {
      ...data,
      environmental: filterCategory === 'environmental' ? data.environmental : {},
      social: filterCategory === 'social' ? data.social : {},
      governance: filterCategory === 'governance' ? data.governance : {}
    };

    if (frameworkId === 'GRI') {
      const doc = GRIReportGenerator.generateGRIReport(filteredData);
      const filename = `${frameworkId}-Report-${reportYear}-${Date.now()}.pdf`;
      GRIReportGenerator.downloadPDF(doc, filename);
    } else if (reportFormat === 'JSON') {
      const blob = new Blob([JSON.stringify(filteredData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${frameworkId}-Report-${reportYear}.json`;
      a.click();
    } else {
      alert(`${frameworkId} ${reportFormat} report generation coming soon!`);
    }
  };

  const generateBulkReports = () => {
    if (selectedFrameworks.length === 0) {
      alert('Please select at least one framework');
      return;
    }
    selectedFrameworks.forEach(fw => generateReport(fw));
    alert(`Generated ${selectedFrameworks.length} reports`);
  };

  const sdgMapping = [
    { goal: 1, name: 'No Poverty', metrics: ['communityInvestment'], icon: '🏚️' },
    { goal: 3, name: 'Good Health', metrics: ['lostTimeInjuryRate', 'fatalityRate'], icon: '🏥' },
    { goal: 5, name: 'Gender Equality', metrics: ['femaleEmployeesPercentage', 'femaleDirectorsPercentage'], icon: '⚖️' },
    { goal: 7, name: 'Clean Energy', metrics: ['renewableEnergyPercentage', 'energyConsumption'], icon: '⚡' },
    { goal: 8, name: 'Decent Work', metrics: ['totalEmployees', 'trainingHoursPerEmployee'], icon: '💼' },
    { goal: 12, name: 'Responsible Consumption', metrics: ['wasteGenerated', 'wasteRecycled'], icon: '♻️' },
    { goal: 13, name: 'Climate Action', metrics: ['scope1Emissions', 'scope2Emissions', 'scope3Emissions'], icon: '🌍' },
    { goal: 16, name: 'Peace & Justice', metrics: ['corruptionIncidents', 'ethicsTrainingCompletion'], icon: '⚖️' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`max-w-6xl w-full max-h-[90vh] overflow-hidden ${theme.bg.card} rounded-xl shadow-2xl flex flex-col`}>
        <div className={`p-6 border-b ${theme.border.primary} flex items-center justify-between`}>
          <h2 className={`text-2xl font-bold ${theme.text.primary}`}>📋 Reporting & Framework Alignment</h2>
          <button onClick={onClose} className="text-2xl hover:opacity-70">✕</button>
        </div>

        <div className={`border-b ${theme.border.primary}`}>
          <div className="flex gap-2 px-6">
            {['frameworks', 'sdg', 'materiality', 'dashboard'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-3 font-medium transition-colors ${
                  activeTab === tab
                    ? `${theme.text.accent} border-b-2 border-blue-500`
                    : `${theme.text.secondary} hover:${theme.text.primary}`
                }`}
              >
                {tab === 'frameworks' && '📄 Frameworks'}
                {tab === 'sdg' && '🎯 SDG Mapping'}
                {tab === 'materiality' && '⚖️ Materiality'}
                {tab === 'dashboard' && '📊 Dashboard'}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'frameworks' && (
            <div className="space-y-6">
              <div className={`p-4 rounded-lg ${theme.bg.subtle} flex flex-wrap gap-4 items-center`}>
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium">Year:</label>
                  <select value={reportYear} onChange={(e) => setReportYear(e.target.value)} className="px-3 py-1 border rounded">
                    {[2024, 2023, 2022, 2021].map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium">Format:</label>
                  <select value={reportFormat} onChange={(e) => setReportFormat(e.target.value)} className="px-3 py-1 border rounded">
                    <option value="PDF">PDF</option>
                    <option value="JSON">JSON</option>
                    <option value="CSV">CSV</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium">Category:</label>
                  <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="px-3 py-1 border rounded">
                    <option value="all">All Categories</option>
                    <option value="environmental">Environmental</option>
                    <option value="social">Social</option>
                    <option value="governance">Governance</option>
                  </select>
                </div>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={includeCharts} onChange={(e) => setIncludeCharts(e.target.checked)} />
                  <span className="text-sm">Include Charts</span>
                </label>
                {selectedFrameworks.length > 0 && (
                  <button onClick={generateBulkReports} className="ml-auto px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                    📦 Generate {selectedFrameworks.length} Reports
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {frameworks.map(fw => {
                  const isSelected = selectedFrameworks.includes(fw.id);
                  return (
                  <div key={fw.id} className={`p-5 border-2 rounded-xl transition-all cursor-pointer ${
                    isSelected ? 'border-blue-500 bg-blue-50' : `${theme.border.primary} hover:border-blue-500`
                  }`} onClick={() => {
                    setSelectedFrameworks(prev => 
                      prev.includes(fw.id) ? prev.filter(f => f !== fw.id) : [...prev, fw.id]
                    );
                  }}>
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-3xl">{fw.icon}</span>
                      <div className="flex-1">
                        <h3 className={`font-bold ${theme.text.primary}`}>{fw.name}</h3>
                        <p className={`text-xs ${theme.text.secondary}`}>{fw.desc}</p>
                      </div>
                    </div>
                    <div className="mb-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Coverage</span>
                        <span className="font-bold">{fw.coverage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className={`h-2 rounded-full ${fw.coverage >= 80 ? 'bg-green-500' : fw.coverage >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{width: `${fw.coverage}%`}}></div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); generateReport(fw.id); }}
                        className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                      >
                        📥 Generate
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); alert(`${fw.name} preview coming soon`); }}
                        className="px-3 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 text-sm"
                      >
                        👁️
                      </button>
                    </div>
                    {isSelected && <div className="absolute top-2 right-2 text-blue-600 text-xl">✓</div>}
                  </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'sdg' && (
            <div className="space-y-6">
              <div className={`p-4 rounded-lg ${theme.bg.subtle} flex justify-between items-center`}>
                <div>
                  <h3 className={`font-bold ${theme.text.primary} mb-2`}>UN Sustainable Development Goals Alignment</h3>
                  <p className={`text-sm ${theme.text.secondary}`}>Your ESG data mapped to relevant SDG targets</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => {
                    const sdgReport = sdgMapping.map(sdg => ({
                      goal: sdg.goal,
                      name: sdg.name,
                      hasData: sdg.metrics.some(m => esgData.some(d => d.metric === m)),
                      metrics: sdg.metrics
                    }));
                    const blob = new Blob([JSON.stringify(sdgReport, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `SDG-Mapping-${new Date().getFullYear()}.json`;
                    a.click();
                  }} className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                    📥 Export SDG Report
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sdgMapping.map(sdg => {
                  const hasData = sdg.metrics.some(m => esgData.some(d => d.metric === m));
                  return (
                    <div key={sdg.goal} className={`p-4 border-2 rounded-xl ${hasData ? 'border-green-500 bg-green-50' : theme.border.primary}`}>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">{sdg.icon}</span>
                        <div>
                          <h4 className={`font-bold ${theme.text.primary}`}>SDG {sdg.goal}: {sdg.name}</h4>
                          <p className={`text-xs ${theme.text.secondary}`}>{sdg.metrics.length} metrics tracked</p>
                        </div>
                        {hasData && <span className="ml-auto text-green-600 text-xl">✓</span>}
                      </div>
                      <div className="text-xs space-y-1">
                        {sdg.metrics.map(m => (
                          <div key={m} className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${esgData.some(d => d.metric === m) ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                            <span>{m}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'materiality' && (
            <div className="space-y-6">
              <div className={`p-6 rounded-lg ${theme.bg.subtle}`}>
                <h3 className={`font-bold ${theme.text.primary} mb-4`}>Double Materiality Assessment</h3>
                <p className={`text-sm ${theme.text.secondary} mb-4`}>Rate ESG topics on impact, financial, and stakeholder dimensions (1-5 scale)</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {['Climate Change', 'Water Management', 'Waste & Circular Economy', 'Employee Health & Safety', 'Diversity & Inclusion', 'Community Relations', 'Board Diversity', 'Ethics & Compliance'].map((topic, idx) => (
                    <div key={idx} className={`p-4 border rounded-lg ${theme.border.primary}`}>
                      <h4 className={`font-medium ${theme.text.primary} mb-3`}>{topic}</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Impact:</span>
                          <select className="border rounded px-2 py-1 text-xs">
                            {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
                          </select>
                        </div>
                        <div className="flex justify-between">
                          <span>Financial:</span>
                          <select className="border rounded px-2 py-1 text-xs">
                            {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
                          </select>
                        </div>
                        <div className="flex justify-between">
                          <span>Stakeholder:</span>
                          <select className="border rounded px-2 py-1 text-xs">
                            {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <button onClick={() => alert('Materiality assessment saved!')} className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Save Assessment
                </button>
              </div>
            </div>
          )}

          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className={`p-4 rounded-lg ${theme.bg.subtle} flex gap-4 items-center`}>
                <select className="px-3 py-2 border rounded" onChange={(e) => setReportYear(e.target.value)}>
                  <option>Filter by Year</option>
                  {[2024, 2023, 2022, 2021].map(y => <option key={y} value={y}>{y}</option>)}
                </select>
                <button onClick={() => {
                  const dashboardData = {
                    environmental: esgData.filter(d => d.category === 'environmental').length,
                    social: esgData.filter(d => d.category === 'social').length,
                    governance: esgData.filter(d => d.category === 'governance').length,
                    frameworks: frameworks.map(f => ({ name: f.name, coverage: f.coverage }))
                  };
                  const csv = 'Category,Count\n' + 
                    `Environmental,${dashboardData.environmental}\n` +
                    `Social,${dashboardData.social}\n` +
                    `Governance,${dashboardData.governance}`;
                  const blob = new Blob([csv], { type: 'text/csv' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `ESG-Dashboard-${new Date().getFullYear()}.csv`;
                  a.click();
                }} className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">
                  📄 Export CSV
                </button>
                <button onClick={() => window.print()} className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm">
                  🖨️ Print
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className={`p-5 rounded-xl ${theme.bg.subtle}`}>
                  <div className="text-3xl mb-2">🌍</div>
                  <div className="text-2xl font-bold">{esgData.filter(d => d.category === 'environmental').length}</div>
                  <div className={`text-sm ${theme.text.secondary}`}>Environmental Metrics</div>
                </div>
                <div className={`p-5 rounded-xl ${theme.bg.subtle}`}>
                  <div className="text-3xl mb-2">👥</div>
                  <div className="text-2xl font-bold">{esgData.filter(d => d.category === 'social').length}</div>
                  <div className={`text-sm ${theme.text.secondary}`}>Social Metrics</div>
                </div>
                <div className={`p-5 rounded-xl ${theme.bg.subtle}`}>
                  <div className="text-3xl mb-2">⚖️</div>
                  <div className="text-2xl font-bold">{esgData.filter(d => d.category === 'governance').length}</div>
                  <div className={`text-sm ${theme.text.secondary}`}>Governance Metrics</div>
                </div>
              </div>

              <div className={`p-5 rounded-xl ${theme.bg.subtle}`}>
                <h3 className={`font-bold ${theme.text.primary} mb-4`}>Framework Compliance Overview</h3>
                <div className="space-y-3">
                  {frameworks.map(fw => (
                    <div key={fw.id} className="flex items-center gap-3">
                      <span className="text-xl">{fw.icon}</span>
                      <div className="flex-1">
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">{fw.name}</span>
                          <span className="text-sm font-bold">{fw.coverage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className={`h-2 rounded-full ${fw.coverage >= 80 ? 'bg-green-500' : fw.coverage >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{width: `${fw.coverage}%`}}></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportingFrameworkHub;
