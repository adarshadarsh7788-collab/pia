import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useSector } from '../contexts/SectorContext';
import { useTheme } from '../contexts/ThemeContext';
import { getThemeClasses } from '../utils/themeUtils';
import ProfessionalHeader from './ProfessionalHeader';
import { MetricCard, StatusCard } from './ProfessionalCard';
import EnhancedDataEntry from '../modules/EnhancedDataEntry';
import ComplianceManager from './ComplianceManager';

const SectorDashboard = () => {
  const { sector } = useParams();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const theme = getThemeClasses(isDark);
  const { currentSector, changeSector, getSectorConfig } = useSector();
  
  const [showEnhancedEntry, setShowEnhancedEntry] = useState(false);
  const [showComplianceManager, setShowComplianceManager] = useState(false);
  const [kpis, setKpis] = useState({
    overallScore: 75,
    complianceRate: 82,
    environmental: 78,
    social: 71,
    governance: 76,
    totalEntries: 24
  });

  const sectorConfig = getSectorConfig(sector || currentSector);

  useEffect(() => {
    if (sector && sector !== currentSector) {
      changeSector(sector);
    }
  }, [sector, currentSector, changeSector]);

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    navigate("/login");
  };

  const getSectorGradient = () => {
    switch(sectorConfig?.color) {
      case 'amber': return 'from-amber-500/20 via-orange-500/10 to-yellow-500/20';
      case 'pink': return 'from-pink-500/20 via-rose-500/10 to-red-500/20';
      case 'blue': return 'from-blue-500/20 via-indigo-500/10 to-purple-500/20';
      default: return 'from-gray-500/20 via-slate-500/10 to-gray-500/20';
    }
  };

  const getSectorAccentColor = () => {
    switch(sectorConfig?.color) {
      case 'amber': return 'border-amber-500 bg-amber-50';
      case 'pink': return 'border-pink-500 bg-pink-50';
      case 'blue': return 'border-blue-500 bg-blue-50';
      default: return 'border-gray-500 bg-gray-50';
    }
  };

  if (!sectorConfig) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Sector Not Found</h2>
          <button
            onClick={() => navigate('/sectors')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Select Sector
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-all duration-500 ${
      isDark 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : `bg-gradient-to-br ${getSectorGradient()}`
    }`}>
      <ProfessionalHeader 
        onLogout={handleLogout}
        currentUser={localStorage.getItem('currentUser')}
      />

      {/* Sector Header */}
      <div className={`border-b ${theme.border.primary} ${isDark ? 'bg-gray-800/50' : 'bg-white/50'} backdrop-blur-sm`}>
        <div className="max-w-7xl mx-auto p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${
                sectorConfig.color === 'amber' ? 'from-amber-500 to-orange-500' :
                sectorConfig.color === 'pink' ? 'from-pink-500 to-rose-500' :
                sectorConfig.color === 'blue' ? 'from-blue-500 to-indigo-500' :
                'from-gray-500 to-gray-600'
              } flex items-center justify-center text-white text-xl shadow-lg`}>
                {sectorConfig.icon}
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${theme.text.primary}`}>
                  {sectorConfig.name} ESG Dashboard
                </h1>
                <p className={`${theme.text.secondary}`}>
                  Specialized ESG management for {sectorConfig.name.toLowerCase()} industry
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/sectors')}
              className={`px-4 py-2 rounded-lg border transition-colors ${theme.border.primary} ${theme.hover.card}`}
            >
              Change Sector
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto p-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard 
            icon="⭐" 
            value={Math.round(kpis.overallScore)}
            label="Overall ESG Score" 
            trend="↑ Improving"
            trendColor="success"
            progress={kpis.overallScore}
          />
          <MetricCard 
            icon="✓" 
            value={`${Math.round(kpis.complianceRate)}%`}
            label="Compliance Rate" 
            trend="↑ On Track"
            trendColor="info"
            progress={kpis.complianceRate}
          />
          <MetricCard 
            icon="🌍" 
            value={`${Math.round(kpis.environmental)}%`}
            label="Environmental Score"
            trend="↑ Strong"
            trendColor="success"
            progress={kpis.environmental}
          />
          <MetricCard 
            icon="📈" 
            value={kpis.totalEntries}
            label="Data Entries" 
            trend="↑ Growing"
            trendColor="success"
            progress={Math.min((kpis.totalEntries / 50) * 100, 100)}
          />
        </div>

        {/* Sector-Specific Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Data Entry Templates */}
          <div className={`rounded-2xl p-6 border ${theme.bg.card} ${theme.border.primary}`}>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">📊</span>
              <h2 className={`text-lg font-semibold ${theme.text.primary}`}>Data Entry Templates</h2>
            </div>
            <div className="space-y-3">
              {sectorConfig.metrics.environmental.slice(0, 3).map((metric, idx) => (
                <div key={idx} className={`p-3 rounded-lg border ${theme.border.secondary} ${theme.hover.card} cursor-pointer`}>
                  <div className="flex items-center justify-between">
                    <span className={`font-medium ${theme.text.primary}`}>
                      {metric.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                    <span className="text-green-500">→</span>
                  </div>
                </div>
              ))}
              <button
                onClick={() => setShowEnhancedEntry(true)}
                className="w-full mt-3 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Open Advanced Data Entry
              </button>
            </div>
          </div>

          {/* Report Templates */}
          <div className={`rounded-2xl p-6 border ${theme.bg.card} ${theme.border.primary}`}>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">📋</span>
              <h2 className={`text-lg font-semibold ${theme.text.primary}`}>Report Templates</h2>
            </div>
            <div className="space-y-3">
              {sectorConfig.reportTemplates.slice(0, 3).map((template, idx) => (
                <Link
                  key={idx}
                  to={`/reports?template=${template.id}`}
                  className={`block p-3 rounded-lg border ${theme.border.secondary} ${theme.hover.card} transition-all`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{template.icon}</span>
                    <div className="flex-1">
                      <div className={`font-medium ${theme.text.primary}`}>{template.name}</div>
                      <div className={`text-xs ${theme.text.secondary}`}>
                        {template.frameworks.join(', ')}
                      </div>
                    </div>
                    <span className="text-blue-500">→</span>
                  </div>
                </Link>
              ))}
              <Link
                to="/reports"
                className="block w-full mt-3 py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg text-center transition-colors"
              >
                View All Templates
              </Link>
            </div>
          </div>

          {/* Compliance Modules */}
          <div className={`rounded-2xl p-6 border ${theme.bg.card} ${theme.border.primary}`}>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">⚖️</span>
              <h2 className={`text-lg font-semibold ${theme.text.primary}`}>Compliance Modules</h2>
            </div>
            <div className="space-y-3">
              {sectorConfig.complianceModules.slice(0, 3).map((module, idx) => (
                <div key={idx} className={`p-3 rounded-lg border ${theme.border.secondary} ${theme.hover.card} cursor-pointer`}>
                  <div className={`font-medium ${theme.text.primary} mb-1`}>{module.name}</div>
                  <div className={`text-xs ${theme.text.secondary}`}>
                    {module.requirements.slice(0, 2).join(', ')}
                    {module.requirements.length > 2 && ` +${module.requirements.length - 2} more`}
                  </div>
                </div>
              ))}
              <button
                onClick={() => setShowComplianceManager(true)}
                className="w-full mt-3 py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                Manage Compliance
              </button>
            </div>
          </div>
        </div>

        {/* Framework Compliance & Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Framework Compliance Status */}
          <div className={`rounded-2xl p-6 border ${theme.bg.card} ${theme.border.primary}`}>
            <div className="flex items-center gap-2 mb-6">
              <span className="text-2xl">📊</span>
              <h2 className={`text-lg font-semibold ${theme.text.primary}`}>Framework Compliance Status</h2>
            </div>
            <div className="space-y-4">
              {sectorConfig.frameworks.primary.slice(0, 4).map((framework, idx) => {
                const compliance = 65 + (idx * 8); // Mock compliance scores
                return (
                  <div key={idx} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className={`font-medium ${theme.text.primary}`}>{framework}</span>
                      <span className={`text-sm font-semibold ${
                        compliance >= 80 ? 'text-green-600' : 
                        compliance >= 60 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {compliance}%
                      </span>
                    </div>
                    <div className={`w-full bg-gray-200 rounded-full h-2 ${isDark ? 'bg-gray-700' : ''}`}>
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${
                          compliance >= 80 ? 'bg-green-500' : 
                          compliance >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${compliance}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ESG Performance Overview */}
          <div className={`rounded-2xl p-6 border ${theme.bg.card} ${theme.border.primary}`}>
            <div className="flex items-center gap-2 mb-6">
              <span className="text-2xl">📈</span>
              <h2 className={`text-lg font-semibold ${theme.text.primary}`}>ESG Performance Overview</h2>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {[
                { icon: '🌍', title: 'Environmental', score: kpis.environmental, target: 75 },
                { icon: '👥', title: 'Social', score: kpis.social, target: 70 },
                { icon: '🏛️', title: 'Governance', score: kpis.governance, target: 80 }
              ].map((metric, index) => (
                <StatusCard 
                  key={index}
                  icon={metric.icon}
                  title={metric.title}
                  score={Math.round(metric.score)}
                  target={metric.target}
                  status={metric.score >= metric.target ? "excellent" : metric.score >= (metric.target - 10) ? "good" : "warning"}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <div className={`rounded-2xl p-6 border ${theme.bg.card} ${theme.border.primary}`}>
            <div className="flex items-center gap-2 mb-6">
              <span className="text-2xl">⚡</span>
              <h2 className={`text-lg font-semibold ${theme.text.primary}`}>Quick Actions</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: '📊', label: 'Analytics', link: '/analytics' },
                { icon: '📋', label: 'Reports', link: '/reports' },
                { icon: '✓', label: 'Compliance', link: '/compliance' },
                { icon: '👥', label: 'Stakeholders', link: '/stakeholders' }
              ].map((action, idx) => (
                <Link
                  key={idx}
                  to={action.link}
                  className={`p-4 rounded-xl border text-center transition-all hover:scale-105 ${theme.border.secondary} ${theme.hover.card}`}
                >
                  <div className="text-2xl mb-2">{action.icon}</div>
                  <div className={`font-medium ${theme.text.primary}`}>{action.label}</div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      {showEnhancedEntry && (
        <EnhancedDataEntry onClose={() => setShowEnhancedEntry(false)} />
      )}
      
      {showComplianceManager && (
        <ComplianceManager onClose={() => setShowComplianceManager(false)} />
      )}
    </div>
  );
};

export default SectorDashboard;