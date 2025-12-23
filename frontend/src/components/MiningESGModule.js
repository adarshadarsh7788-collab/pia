import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { getThemeClasses } from '../utils/themeUtils';
import { MINING_FRAMEWORKS, MINING_METRICS, ZIMBABWE_CURRENCY } from '../utils/miningFrameworks';

const MiningESGModule = ({ onClose, onSave }) => {
  const { isDark } = useTheme();
  const theme = getThemeClasses(isDark);
  const [activeTab, setActiveTab] = useState('environmental');
  const [formData, setFormData] = useState({
    // Environmental
    tailingsVolume: '',
    damStability: '',
    waterPH: '',
    heavyMetals: '',
    disturbedArea: '',
    rehabilitatedArea: '',
    biodiversityIndex: '',
    
    // Social
    householdsResettled: '',
    compensationPaid: '',
    localWorkforce: '',
    skillsTraining: '',
    complaintsReceived: '',
    complaintsResolved: '',
    fatalityRate: '',
    lostTimeInjuries: '',
    
    // Governance
    artisanalMiners: '',
    supplyChainAudit: '',
    fdiInflow: '',
    exportEarnings: '',
    governmentRevenue: '',
    closureCostEstimate: '',
    rehabilitationBond: ''
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    onSave(formData);
    onClose();
  };

  const tabs = [
    { id: 'environmental', label: 'Environmental', icon: '🌍' },
    { id: 'social', label: 'Social', icon: '👥' },
    { id: 'governance', label: 'Governance', icon: '⚖️' },
    { id: 'compliance', label: 'Compliance', icon: '✅' }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className={`${theme.bg.card} rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden`}>
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h2 className={`text-2xl font-bold ${theme.text.primary}`}>⛏️ Mining Sector ESG Data</h2>
              <p className={`text-sm ${theme.text.secondary}`}>Zimbabwe Mining Industry - ICMM, EITI & ISSB Compliant</p>
            </div>
            <button onClick={onClose} className="text-2xl hover:scale-110 transition-transform">×</button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 px-6">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 font-medium transition-colors ${
                activeTab === tab.id
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : `${theme.text.secondary} hover:text-blue-500`
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {/* Environmental Tab */}
          {activeTab === 'environmental' && (
            <div className="space-y-6">
              <div className={`p-4 rounded-lg ${theme.bg.subtle}`}>
                <h3 className={`font-bold ${theme.text.primary} mb-4`}>🏔️ Tailings Management (ICMM)</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm ${theme.text.secondary} mb-1`}>Tailings Volume (tonnes)</label>
                    <input type="number" value={formData.tailingsVolume} onChange={(e) => handleChange('tailingsVolume', e.target.value)}
                      className={`w-full px-3 py-2 border rounded ${theme.bg.input} ${theme.border.input}`} />
                  </div>
                  <div>
                    <label className={`block text-sm ${theme.text.secondary} mb-1`}>Dam Stability Score (0-100)</label>
                    <input type="number" value={formData.damStability} onChange={(e) => handleChange('damStability', e.target.value)}
                      className={`w-full px-3 py-2 border rounded ${theme.bg.input} ${theme.border.input}`} />
                  </div>
                </div>
              </div>

              <div className={`p-4 rounded-lg ${theme.bg.subtle}`}>
                <h3 className={`font-bold ${theme.text.primary} mb-4`}>💧 Water Pollution (EMA)</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm ${theme.text.secondary} mb-1`}>Water pH Level</label>
                    <input type="number" step="0.1" value={formData.waterPH} onChange={(e) => handleChange('waterPH', e.target.value)}
                      className={`w-full px-3 py-2 border rounded ${theme.bg.input} ${theme.border.input}`} />
                  </div>
                  <div>
                    <label className={`block text-sm ${theme.text.secondary} mb-1`}>Heavy Metals (mg/L)</label>
                    <input type="number" step="0.01" value={formData.heavyMetals} onChange={(e) => handleChange('heavyMetals', e.target.value)}
                      className={`w-full px-3 py-2 border rounded ${theme.bg.input} ${theme.border.input}`} />
                  </div>
                </div>
              </div>

              <div className={`p-4 rounded-lg ${theme.bg.subtle}`}>
                <h3 className={`font-bold ${theme.text.primary} mb-4`}>🌱 Land & Biodiversity (ICMM)</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm ${theme.text.secondary} mb-1`}>Disturbed Area (hectares)</label>
                    <input type="number" value={formData.disturbedArea} onChange={(e) => handleChange('disturbedArea', e.target.value)}
                      className={`w-full px-3 py-2 border rounded ${theme.bg.input} ${theme.border.input}`} />
                  </div>
                  <div>
                    <label className={`block text-sm ${theme.text.secondary} mb-1`}>Rehabilitated Area (hectares)</label>
                    <input type="number" value={formData.rehabilitatedArea} onChange={(e) => handleChange('rehabilitatedArea', e.target.value)}
                      className={`w-full px-3 py-2 border rounded ${theme.bg.input} ${theme.border.input}`} />
                  </div>
                  <div className="col-span-2">
                    <label className={`block text-sm ${theme.text.secondary} mb-1`}>Biodiversity Impact Index (0-100)</label>
                    <input type="number" value={formData.biodiversityIndex} onChange={(e) => handleChange('biodiversityIndex', e.target.value)}
                      className={`w-full px-3 py-2 border rounded ${theme.bg.input} ${theme.border.input}`} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Social Tab */}
          {activeTab === 'social' && (
            <div className="space-y-6">
              <div className={`p-4 rounded-lg ${theme.bg.subtle}`}>
                <h3 className={`font-bold ${theme.text.primary} mb-4`}>🏘️ Community Resettlement (ICMM)</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm ${theme.text.secondary} mb-1`}>Households Resettled</label>
                    <input type="number" value={formData.householdsResettled} onChange={(e) => handleChange('householdsResettled', e.target.value)}
                      className={`w-full px-3 py-2 border rounded ${theme.bg.input} ${theme.border.input}`} />
                  </div>
                  <div>
                    <label className={`block text-sm ${theme.text.secondary} mb-1`}>Compensation Paid ({ZIMBABWE_CURRENCY.symbol})</label>
                    <input type="number" value={formData.compensationPaid} onChange={(e) => handleChange('compensationPaid', e.target.value)}
                      className={`w-full px-3 py-2 border rounded ${theme.bg.input} ${theme.border.input}`} />
                  </div>
                </div>
              </div>

              <div className={`p-4 rounded-lg ${theme.bg.subtle}`}>
                <h3 className={`font-bold ${theme.text.primary} mb-4`}>👷 Local Employment (MMA)</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm ${theme.text.secondary} mb-1`}>Local Workforce (%)</label>
                    <input type="number" value={formData.localWorkforce} onChange={(e) => handleChange('localWorkforce', e.target.value)}
                      className={`w-full px-3 py-2 border rounded ${theme.bg.input} ${theme.border.input}`} />
                  </div>
                  <div>
                    <label className={`block text-sm ${theme.text.secondary} mb-1`}>Skills Training (hours)</label>
                    <input type="number" value={formData.skillsTraining} onChange={(e) => handleChange('skillsTraining', e.target.value)}
                      className={`w-full px-3 py-2 border rounded ${theme.bg.input} ${theme.border.input}`} />
                  </div>
                </div>
              </div>

              <div className={`p-4 rounded-lg ${theme.bg.subtle}`}>
                <h3 className={`font-bold ${theme.text.primary} mb-4`}>📢 Grievance Mechanism (ICMM)</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm ${theme.text.secondary} mb-1`}>Complaints Received</label>
                    <input type="number" value={formData.complaintsReceived} onChange={(e) => handleChange('complaintsReceived', e.target.value)}
                      className={`w-full px-3 py-2 border rounded ${theme.bg.input} ${theme.border.input}`} />
                  </div>
                  <div>
                    <label className={`block text-sm ${theme.text.secondary} mb-1`}>Complaints Resolved</label>
                    <input type="number" value={formData.complaintsResolved} onChange={(e) => handleChange('complaintsResolved', e.target.value)}
                      className={`w-full px-3 py-2 border rounded ${theme.bg.input} ${theme.border.input}`} />
                  </div>
                </div>
              </div>

              <div className={`p-4 rounded-lg ${theme.bg.subtle}`}>
                <h3 className={`font-bold ${theme.text.primary} mb-4`}>⚠️ Worker Safety (MMA)</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm ${theme.text.secondary} mb-1`}>Fatality Rate (per 1M hours)</label>
                    <input type="number" step="0.01" value={formData.fatalityRate} onChange={(e) => handleChange('fatalityRate', e.target.value)}
                      className={`w-full px-3 py-2 border rounded ${theme.bg.input} ${theme.border.input}`} />
                  </div>
                  <div>
                    <label className={`block text-sm ${theme.text.secondary} mb-1`}>Lost Time Injuries</label>
                    <input type="number" value={formData.lostTimeInjuries} onChange={(e) => handleChange('lostTimeInjuries', e.target.value)}
                      className={`w-full px-3 py-2 border rounded ${theme.bg.input} ${theme.border.input}`} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Governance Tab */}
          {activeTab === 'governance' && (
            <div className="space-y-6">
              <div className={`p-4 rounded-lg ${theme.bg.subtle}`}>
                <h3 className={`font-bold ${theme.text.primary} mb-4`}>⛏️ Artisanal Mining (EITI)</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm ${theme.text.secondary} mb-1`}>Artisanal Miners (number)</label>
                    <input type="number" value={formData.artisanalMiners} onChange={(e) => handleChange('artisanalMiners', e.target.value)}
                      className={`w-full px-3 py-2 border rounded ${theme.bg.input} ${theme.border.input}`} />
                  </div>
                  <div>
                    <label className={`block text-sm ${theme.text.secondary} mb-1`}>Supply Chain Audit Score (0-100)</label>
                    <input type="number" value={formData.supplyChainAudit} onChange={(e) => handleChange('supplyChainAudit', e.target.value)}
                      className={`w-full px-3 py-2 border rounded ${theme.bg.input} ${theme.border.input}`} />
                  </div>
                </div>
              </div>

              <div className={`p-4 rounded-lg ${theme.bg.subtle}`}>
                <h3 className={`font-bold ${theme.text.primary} mb-4`}>💰 Investment & Revenue (EITI)</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm ${theme.text.secondary} mb-1`}>FDI Inflow (USD)</label>
                    <input type="number" value={formData.fdiInflow} onChange={(e) => handleChange('fdiInflow', e.target.value)}
                      className={`w-full px-3 py-2 border rounded ${theme.bg.input} ${theme.border.input}`} />
                  </div>
                  <div>
                    <label className={`block text-sm ${theme.text.secondary} mb-1`}>Export Earnings (USD)</label>
                    <input type="number" value={formData.exportEarnings} onChange={(e) => handleChange('exportEarnings', e.target.value)}
                      className={`w-full px-3 py-2 border rounded ${theme.bg.input} ${theme.border.input}`} />
                  </div>
                  <div className="col-span-2">
                    <label className={`block text-sm ${theme.text.secondary} mb-1`}>Government Revenue ({ZIMBABWE_CURRENCY.symbol})</label>
                    <input type="number" value={formData.governmentRevenue} onChange={(e) => handleChange('governmentRevenue', e.target.value)}
                      className={`w-full px-3 py-2 border rounded ${theme.bg.input} ${theme.border.input}`} />
                  </div>
                </div>
              </div>

              <div className={`p-4 rounded-lg ${theme.bg.subtle}`}>
                <h3 className={`font-bold ${theme.text.primary} mb-4`}>🔚 Mine Closure (MMA)</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm ${theme.text.secondary} mb-1`}>Closure Cost Estimate (USD)</label>
                    <input type="number" value={formData.closureCostEstimate} onChange={(e) => handleChange('closureCostEstimate', e.target.value)}
                      className={`w-full px-3 py-2 border rounded ${theme.bg.input} ${theme.border.input}`} />
                  </div>
                  <div>
                    <label className={`block text-sm ${theme.text.secondary} mb-1`}>Rehabilitation Bond (USD)</label>
                    <input type="number" value={formData.rehabilitationBond} onChange={(e) => handleChange('rehabilitationBond', e.target.value)}
                      className={`w-full px-3 py-2 border rounded ${theme.bg.input} ${theme.border.input}`} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Compliance Tab */}
          {activeTab === 'compliance' && (
            <div className="space-y-4">
              {Object.entries(MINING_FRAMEWORKS).map(([key, framework]) => (
                <div key={key} className={`p-4 rounded-lg border ${theme.border.primary}`}>
                  <h3 className={`font-bold ${theme.text.primary} mb-2`}>{framework.name}</h3>
                  <p className={`text-sm ${theme.text.secondary} mb-3`}>{framework.description}</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '0%' }}></div>
                    </div>
                    <span className="text-sm font-medium">0%</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
          <button onClick={onClose} className="px-6 py-2 border rounded-lg hover:bg-gray-100">Cancel</button>
          <button onClick={handleSubmit} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Save Mining ESG Data
          </button>
        </div>
      </div>
    </div>
  );
};

export default MiningESGModule;
