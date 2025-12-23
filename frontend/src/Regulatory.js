import React, { useState, useEffect } from 'react';
import { useTheme } from './contexts/ThemeContext';
import { getThemeClasses } from './utils/themeUtils';
import ProfessionalHeader from './components/ProfessionalHeader';
import RegulatoryComplianceManager from './components/RegulatoryComplianceManager';
import { useNavigate } from 'react-router-dom';

const Regulatory = () => {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const theme = getThemeClasses(isDark);
  const [selectedRegulation, setSelectedRegulation] = useState(null);
  const [animateCards, setAnimateCards] = useState(false);
  const [showComplianceModal, setShowComplianceModal] = useState(false);
  const [showRegulationDetails, setShowRegulationDetails] = useState(null);
  
  const [regulations] = useState([
    { 
      id: 1, 
      name: 'EU Taxonomy', 
      fullName: 'EU Sustainable Finance Taxonomy',
      status: 'Compliant', 
      deadline: '2024-12-31', 
      progress: 85,
      icon: '🇪🇺',
      color: 'emerald',
      description: 'Classification system for environmentally sustainable economic activities',
      requirements: ['Environmental objectives alignment', 'Technical screening criteria', 'Do no significant harm assessment'],
      priority: 'High'
    },
    { 
      id: 2, 
      name: 'CSRD', 
      fullName: 'Corporate Sustainability Reporting Directive',
      status: 'In Progress', 
      deadline: '2024-06-30', 
      progress: 60,
      icon: '📊',
      color: 'blue',
      description: 'Enhanced sustainability reporting requirements for EU companies',
      requirements: ['Double materiality assessment', 'ESRS standards compliance', 'Third-party assurance'],
      priority: 'Critical'
    },
    { 
      id: 3, 
      name: 'SFDR', 
      fullName: 'Sustainable Finance Disclosure Regulation',
      status: 'Review Required', 
      deadline: '2024-09-15', 
      progress: 40,
      icon: '💰',
      color: 'amber',
      description: 'Disclosure obligations for financial market participants',
      requirements: ['Principal adverse impacts', 'Sustainability preferences', 'Product-level disclosures'],
      priority: 'Medium'
    },
    { 
      id: 4, 
      name: 'SEC Climate Rules', 
      fullName: 'SEC Climate-Related Disclosures',
      status: 'Pending', 
      deadline: '2024-11-30', 
      progress: 20,
      icon: '🏛️',
      color: 'red',
      description: 'Climate-related disclosure requirements for US public companies',
      requirements: ['Scope 1 & 2 emissions', 'Climate risk governance', 'Transition plans'],
      priority: 'High'
    }
  ]);

  useEffect(() => {
    setAnimateCards(true);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    navigate("/login");
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Compliant': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      case 'In Progress': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'Review Required': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'Pending': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'Critical': return 'bg-red-500';
      case 'High': return 'bg-orange-500';
      case 'Medium': return 'bg-yellow-500';
      case 'Low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getProgressColor = (progress) => {
    if (progress >= 80) return 'from-emerald-500 to-green-600';
    if (progress >= 60) return 'from-blue-500 to-cyan-600';
    if (progress >= 40) return 'from-amber-500 to-orange-600';
    return 'from-red-500 to-pink-600';
  };

  return (
    <div className={`min-h-screen transition-all duration-500 ${
      isDark 
        ? 'bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900' 
        : 'bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20'
    }`}>
      <ProfessionalHeader 
        onLogout={handleLogout}
        isDark={isDark}
        toggleTheme={toggleTheme}
      />

      <main className="max-w-7xl mx-auto p-6">
        {/* Hero Section */}
        <div className={`rounded-3xl p-8 mb-8 border backdrop-blur-xl ${
          isDark 
            ? 'bg-gradient-to-r from-slate-800/90 via-gray-800/90 to-slate-800/90 border-slate-700 shadow-2xl' 
            : 'bg-gradient-to-r from-white/80 via-blue-50/80 to-indigo-50/80 border-white/50 shadow-xl'
        }`}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className={`p-4 rounded-2xl ${
                isDark ? 'bg-gradient-to-br from-blue-600 to-purple-600' : 'bg-gradient-to-br from-blue-500 to-indigo-600'
              } shadow-lg`}>
                <span className="text-3xl text-white">⚖️</span>
              </div>
              <div>
                <h1 className={`text-4xl font-bold bg-gradient-to-r ${
                  isDark 
                    ? 'from-blue-400 via-purple-400 to-indigo-400' 
                    : 'from-blue-600 via-indigo-600 to-purple-600'
                } bg-clip-text text-transparent`}>
                  Regulatory Compliance
                </h1>
                <p className={`text-lg mt-2 ${
                  isDark ? 'text-slate-300' : 'text-slate-600'
                }`}>
                  Monitor and manage ESG regulatory requirements across global frameworks
                </p>
              </div>
            </div>
            <div className={`px-6 py-3 rounded-xl border ${
              isDark 
                ? 'bg-slate-700/50 border-slate-600 text-slate-300' 
                : 'bg-white/60 border-slate-200 text-slate-700'
            }`}>
              <div className="text-center">
                <div className="text-2xl font-bold">{Math.round(regulations.reduce((acc, reg) => acc + reg.progress, 0) / regulations.length)}%</div>
                <div className="text-xs">Overall Compliance</div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Compliant', count: regulations.filter(r => r.status === 'Compliant').length, color: 'emerald' },
              { label: 'In Progress', count: regulations.filter(r => r.status === 'In Progress').length, color: 'blue' },
              { label: 'Review Required', count: regulations.filter(r => r.status === 'Review Required').length, color: 'amber' },
              { label: 'Pending', count: regulations.filter(r => r.status === 'Pending').length, color: 'red' }
            ].map((stat, idx) => (
              <div key={idx} className={`p-4 rounded-xl border backdrop-blur-sm ${
                isDark 
                  ? 'bg-slate-800/40 border-slate-700' 
                  : 'bg-white/40 border-slate-200'
              }`}>
                <div className={`text-2xl font-bold text-${stat.color}-500`}>{stat.count}</div>
                <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Regulations Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {regulations.map((reg, index) => (
            <div 
              key={reg.id} 
              className={`group relative overflow-hidden rounded-2xl border backdrop-blur-xl transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl cursor-pointer ${
                isDark 
                  ? 'bg-gradient-to-br from-slate-800/90 to-gray-800/90 border-slate-700 hover:border-slate-600' 
                  : 'bg-gradient-to-br from-white/90 to-slate-50/90 border-slate-200 hover:border-slate-300'
              } ${animateCards ? 'animate-fade-in-up' : 'opacity-0'}`}
              style={{ animationDelay: `${index * 150}ms` }}
              onClick={() => setSelectedRegulation(selectedRegulation === reg.id ? null : reg.id)}
            >
              {/* Priority Indicator */}
              <div className={`absolute top-4 right-4 w-3 h-3 rounded-full ${getPriorityColor(reg.priority)} shadow-lg`}></div>
              
              {/* Card Content */}
              <div className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br from-${reg.color}-500 to-${reg.color}-600 shadow-lg`}>
                    <span className="text-2xl">{reg.icon}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className={`text-xl font-bold mb-1 ${theme.text.primary}`}>{reg.name}</h3>
                    <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'} mb-2`}>{reg.fullName}</p>
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(reg.status)}`}>
                      {reg.status}
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className={`text-sm font-medium ${theme.text.secondary}`}>Progress</span>
                    <span className={`text-sm font-bold ${theme.text.primary}`}>{reg.progress}%</span>
                  </div>
                  <div className={`w-full h-3 rounded-full overflow-hidden ${
                    isDark ? 'bg-slate-700' : 'bg-slate-200'
                  }`}>
                    <div 
                      className={`h-full bg-gradient-to-r ${getProgressColor(reg.progress)} transition-all duration-1000 ease-out shadow-sm`}
                      style={{ width: `${reg.progress}%` }}
                    ></div>
                  </div>
                </div>

                {/* Deadline */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">📅</span>
                    <div>
                      <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Deadline</div>
                      <div className={`text-sm font-medium ${theme.text.primary}`}>{new Date(reg.deadline).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <div className={`transform transition-transform duration-200 ${
                    selectedRegulation === reg.id ? 'rotate-180' : ''
                  }`}>
                    <span className="text-lg">🔽</span>
                  </div>
                </div>

                {/* Expanded Content */}
                {selectedRegulation === reg.id && (
                  <div className={`mt-6 pt-6 border-t animate-fade-in ${
                    isDark ? 'border-slate-700' : 'border-slate-200'
                  }`}>
                    <p className={`text-sm mb-4 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      {reg.description}
                    </p>
                    <div>
                      <h4 className={`text-sm font-semibold mb-2 ${theme.text.primary}`}>Key Requirements:</h4>
                      <ul className="space-y-1">
                        {reg.requirements.map((req, idx) => (
                          <li key={idx} className={`text-xs flex items-center gap-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                            <span className="text-green-500">✓</span>
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowRegulationDetails(reg);
                        }}
                        className={`px-4 py-2 rounded-lg text-xs font-medium transition-colors ${
                          isDark 
                            ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                            : 'bg-blue-500 hover:bg-blue-600 text-white'
                        }`}
                      >
                        📋 View Details
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Hover Effect Overlay */}
              <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none bg-gradient-to-r ${
                isDark 
                  ? 'from-blue-600/10 to-purple-600/10' 
                  : 'from-blue-500/5 to-indigo-500/5'
              }`}></div>
            </div>
          ))}
        </div>

        {/* Action Center */}
        <div className={`rounded-2xl p-6 border backdrop-blur-xl ${
          isDark 
            ? 'bg-gradient-to-r from-slate-800/90 to-gray-800/90 border-slate-700' 
            : 'bg-gradient-to-r from-white/90 to-slate-50/90 border-slate-200'
        }`}>
          <h2 className={`text-2xl font-bold mb-6 ${theme.text.primary}`}>🚀 Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: '📊', title: 'Compliance Dashboard', desc: 'View detailed compliance metrics', color: 'blue' },
              { icon: '📋', title: 'Generate Reports', desc: 'Create regulatory compliance reports', color: 'green' },
              { icon: '⚠️', title: 'Risk Assessment', desc: 'Identify compliance risks and gaps', color: 'amber' }
            ].map((action, idx) => (
              <button 
                key={idx} 
                onClick={() => setShowComplianceModal(true)}
                className={`group p-6 rounded-xl border transition-all duration-200 hover:scale-105 hover:shadow-lg ${
                  isDark 
                    ? 'bg-slate-700/50 border-slate-600 hover:border-slate-500' 
                    : 'bg-white/60 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className={`text-3xl mb-3 group-hover:scale-110 transition-transform duration-200`}>{action.icon}</div>
                <h3 className={`font-semibold mb-2 ${theme.text.primary}`}>{action.title}</h3>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{action.desc}</p>
              </button>
            ))}
          </div>
        </div>
      </main>

      {/* Regulatory Compliance Modal */}
      {showComplianceModal && (
        <RegulatoryComplianceManager onClose={() => setShowComplianceModal(false)} />
      )}

      {/* Regulation Details Modal */}
      {showRegulationDetails && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          } border`}>
            <div className={`p-6 border-b ${
              isDark ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{showRegulationDetails.icon}</span>
                  <h2 className={`text-2xl font-bold ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>{showRegulationDetails.name}</h2>
                </div>
                <button 
                  onClick={() => setShowRegulationDetails(null)} 
                  className={`p-2 rounded-lg ${
                    isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                  }`}
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <h3 className={`font-semibold mb-2 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>Full Name</h3>
                <p className={`text-sm ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>{showRegulationDetails.fullName}</p>
              </div>
              
              <div>
                <h3 className={`font-semibold mb-2 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>Description</h3>
                <p className={`text-sm ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>{showRegulationDetails.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className={`font-semibold mb-2 ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>Status</h3>
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(showRegulationDetails.status)}`}>
                    {showRegulationDetails.status}
                  </div>
                </div>
                <div>
                  <h3 className={`font-semibold mb-2 ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>Progress</h3>
                  <div className="flex items-center gap-2">
                    <div className={`flex-1 h-2 rounded-full ${
                      isDark ? 'bg-gray-700' : 'bg-gray-200'
                    }`}>
                      <div 
                        className={`h-2 rounded-full bg-gradient-to-r ${getProgressColor(showRegulationDetails.progress)}`}
                        style={{ width: `${showRegulationDetails.progress}%` }}
                      ></div>
                    </div>
                    <span className={`text-sm font-bold ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>{showRegulationDetails.progress}%</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className={`font-semibold mb-2 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>Key Requirements</h3>
                <ul className="space-y-2">
                  {showRegulationDetails.requirements.map((req, idx) => (
                    <li key={idx} className={`text-sm flex items-center gap-2 ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      <span className="text-green-500">✓</span>
                      {req}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className={`font-semibold mb-2 ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>Deadline</h3>
                  <p className={`text-sm ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>{new Date(showRegulationDetails.deadline).toLocaleDateString()}</p>
                </div>
                <div>
                  <h3 className={`font-semibold mb-2 ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>Priority</h3>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${getPriorityColor(showRegulationDetails.priority)}`}></div>
                    <span className={`text-sm ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>{showRegulationDetails.priority}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Regulatory;