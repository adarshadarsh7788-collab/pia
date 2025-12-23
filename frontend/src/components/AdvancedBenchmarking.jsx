import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { getThemeClasses } from '../utils/themeUtils';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

const AdvancedBenchmarking = ({ onClose }) => {
  const { isDark } = useTheme();
  const theme = getThemeClasses(isDark);
  const [selectedIndustry, setSelectedIndustry] = useState('mining');
  const [selectedRegion, setSelectedRegion] = useState('global');
  const [comparisonType, setComparisonType] = useState('industry');

  const industries = ['mining', 'manufacturing', 'technology', 'energy', 'finance'];
  const regions = ['global', 'north_america', 'europe', 'asia_pacific', 'africa'];

  const benchmarkData = {
    yourCompany: { environmental: 72, social: 68, governance: 75, overall: 72 },
    industryAverage: { environmental: 65, social: 62, governance: 70, overall: 66 },
    topQuartile: { environmental: 85, social: 82, governance: 88, overall: 85 },
    leaders: { environmental: 92, social: 90, governance: 95, overall: 92 }
  };

  const radarData = [
    { metric: 'Carbon Emissions', yourCompany: 72, industry: 65, topQuartile: 85, leaders: 92 },
    { metric: 'Water Usage', yourCompany: 68, industry: 60, topQuartile: 80, leaders: 88 },
    { metric: 'Waste Management', yourCompany: 75, industry: 70, topQuartile: 88, leaders: 95 },
    { metric: 'Employee Safety', yourCompany: 80, industry: 72, topQuartile: 90, leaders: 96 },
    { metric: 'Diversity', yourCompany: 65, industry: 58, topQuartile: 78, leaders: 85 },
    { metric: 'Board Independence', yourCompany: 78, industry: 75, topQuartile: 90, leaders: 95 }
  ];

  const peerComparison = [
    { company: 'Your Company', score: 72, rank: 12 },
    { company: 'Peer A', score: 85, rank: 3 },
    { company: 'Peer B', score: 78, rank: 8 },
    { company: 'Peer C', score: 68, rank: 18 },
    { company: 'Peer D', score: 82, rank: 5 },
    { company: 'Industry Leader', score: 92, rank: 1 }
  ];

  const trendData = [
    { year: '2020', yourCompany: 58, industry: 52, topQuartile: 75 },
    { year: '2021', yourCompany: 63, industry: 56, topQuartile: 78 },
    { year: '2022', yourCompany: 68, industry: 61, topQuartile: 82 },
    { year: '2023', yourCompany: 70, industry: 64, topQuartile: 84 },
    { year: '2024', yourCompany: 72, industry: 66, topQuartile: 85 }
  ];

  const gapAnalysis = [
    { metric: 'Carbon Footprint', current: 72, target: 85, gap: 13, priority: 'high' },
    { metric: 'Renewable Energy', current: 68, target: 90, gap: 22, priority: 'critical' },
    { metric: 'Gender Diversity', current: 65, target: 78, gap: 13, priority: 'high' },
    { metric: 'Board Independence', current: 78, target: 90, gap: 12, priority: 'medium' },
    { metric: 'Supply Chain ESG', current: 60, target: 80, gap: 20, priority: 'high' }
  ];

  const getPriorityColor = (priority) => {
    const colors = {
      critical: 'bg-red-100 text-red-800 border-red-300',
      high: 'bg-orange-100 text-orange-800 border-orange-300',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      low: 'bg-green-100 text-green-800 border-green-300'
    };
    return colors[priority] || colors.medium;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`max-w-7xl w-full max-h-[90vh] overflow-hidden ${theme.bg.card} rounded-xl shadow-2xl`}>
        <div className="p-6 bg-white shadow-lg border-b-2 border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold flex items-center gap-3 text-gray-800">
                <span className="text-4xl">📊</span>
                Advanced Benchmarking
              </h2>
              <p className="text-gray-600 mt-1">Compare your ESG performance against industry peers and leaders</p>
            </div>
            <button onClick={onClose} className="text-3xl text-gray-600 hover:text-red-500 hover:rotate-90 transition-all duration-300 hover:bg-gray-100 w-10 h-10 rounded-full flex items-center justify-center">✕</button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Filters */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div>
              <label className={`block text-sm font-medium ${theme.text.secondary} mb-2`}>Industry</label>
              <select
                value={selectedIndustry}
                onChange={(e) => setSelectedIndustry(e.target.value)}
                className={`w-full px-3 py-2 rounded border ${theme.bg.input} ${theme.border.input} ${theme.text.primary}`}
              >
                {industries.map(ind => (
                  <option key={ind} value={ind}>{ind.charAt(0).toUpperCase() + ind.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={`block text-sm font-medium ${theme.text.secondary} mb-2`}>Region</label>
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className={`w-full px-3 py-2 rounded border ${theme.bg.input} ${theme.border.input} ${theme.text.primary}`}
              >
                {regions.map(reg => (
                  <option key={reg} value={reg}>{reg.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={`block text-sm font-medium ${theme.text.secondary} mb-2`}>Comparison</label>
              <select
                value={comparisonType}
                onChange={(e) => setComparisonType(e.target.value)}
                className={`w-full px-3 py-2 rounded border ${theme.bg.input} ${theme.border.input} ${theme.text.primary}`}
              >
                <option value="industry">Industry Average</option>
                <option value="peers">Direct Peers</option>
                <option value="leaders">Industry Leaders</option>
              </select>
            </div>
          </div>

          {/* Score Cards */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {Object.entries(benchmarkData).map(([key, scores]) => (
              <div key={key} className={`p-4 rounded-lg border ${theme.border.primary} ${theme.bg.subtle}`}>
                <h4 className={`text-sm font-semibold ${theme.text.secondary} mb-2`}>
                  {key.split(/(?=[A-Z])/).join(' ').replace(/^./, str => str.toUpperCase())}
                </h4>
                <div className={`text-3xl font-bold ${theme.text.primary} mb-2`}>{scores.overall}</div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span>E: {scores.environmental}</span>
                    <span>S: {scores.social}</span>
                    <span>G: {scores.governance}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Radar Chart */}
          <div className={`p-6 rounded-lg border ${theme.border.primary} ${theme.bg.subtle} mb-6`}>
            <h3 className={`text-lg font-bold ${theme.text.primary} mb-4`}>Multi-Dimensional Comparison</h3>
            <ResponsiveContainer width="100%" height={400}>
              <RadarChart data={radarData}>
                <PolarGrid stroke={isDark ? '#374151' : '#e5e7eb'} />
                <PolarAngleAxis dataKey="metric" tick={{ fill: isDark ? '#9ca3af' : '#6b7280', fontSize: 12 }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: isDark ? '#9ca3af' : '#6b7280' }} />
                <Radar name="Your Company" dataKey="yourCompany" stroke="#0066CC" fill="#0066CC" fillOpacity={0.3} />
                <Radar name="Industry Avg" dataKey="industry" stroke="#FFC107" fill="#FFC107" fillOpacity={0.2} />
                <Radar name="Top Quartile" dataKey="topQuartile" stroke="#00AA44" fill="#00AA44" fillOpacity={0.2} />
                <Radar name="Leaders" dataKey="leaders" stroke="#FF6B35" fill="#FF6B35" fillOpacity={0.2} />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-6">
            {/* Peer Ranking */}
            <div className={`p-6 rounded-lg border ${theme.border.primary} ${theme.bg.subtle}`}>
              <h3 className={`text-lg font-bold ${theme.text.primary} mb-4`}>Peer Ranking</h3>
              <div className="space-y-2">
                {peerComparison.map((peer, idx) => (
                  <div key={idx} className={`flex items-center justify-between p-3 rounded ${peer.company === 'Your Company' ? 'bg-blue-100 border-2 border-blue-500' : isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                    <div className="flex items-center gap-3">
                      <span className={`font-bold ${peer.rank <= 3 ? 'text-yellow-600' : theme.text.primary}`}>#{peer.rank}</span>
                      <span className={`font-medium ${theme.text.primary}`}>{peer.company}</span>
                    </div>
                    <span className={`text-xl font-bold ${theme.text.primary}`}>{peer.score}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Historical Trend */}
            <div className={`p-6 rounded-lg border ${theme.border.primary} ${theme.bg.subtle}`}>
              <h3 className={`text-lg font-bold ${theme.text.primary} mb-4`}>5-Year Performance Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
                  <XAxis dataKey="year" stroke={isDark ? '#9ca3af' : '#6b7280'} />
                  <YAxis stroke={isDark ? '#9ca3af' : '#6b7280'} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="yourCompany" stroke="#0066CC" strokeWidth={3} name="Your Company" />
                  <Line type="monotone" dataKey="industry" stroke="#FFC107" strokeWidth={2} name="Industry Avg" />
                  <Line type="monotone" dataKey="topQuartile" stroke="#00AA44" strokeWidth={2} name="Top Quartile" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Gap Analysis */}
          <div className={`p-6 rounded-lg border ${theme.border.primary} ${theme.bg.subtle}`}>
            <h3 className={`text-lg font-bold ${theme.text.primary} mb-4`}>Gap Analysis & Improvement Priorities</h3>
            <div className="space-y-3">
              {gapAnalysis.map((item, idx) => (
                <div key={idx} className={`p-4 rounded-lg border ${theme.border.primary}`}>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className={`font-semibold ${theme.text.primary}`}>{item.metric}</h4>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getPriorityColor(item.priority)}`}>
                      {item.priority.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-1">
                        <span className={theme.text.secondary}>Current: {item.current}</span>
                        <span className={theme.text.secondary}>Target: {item.target}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div className="bg-blue-600 h-3 rounded-full" style={{ width: `${(item.current / item.target) * 100}%` }}></div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${theme.text.primary}`}>{item.gap}</div>
                      <div className={`text-xs ${theme.text.secondary}`}>point gap</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedBenchmarking;
