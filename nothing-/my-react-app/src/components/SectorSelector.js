import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSector } from '../contexts/SectorContext';
import { useTheme } from '../contexts/ThemeContext';
import { getThemeClasses } from '../utils/themeUtils';

const SectorSelector = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const theme = getThemeClasses(isDark);
  const { currentSector, changeSector, availableSectors, getSectorConfig } = useSector();
  const [isSelecting, setIsSelecting] = useState(false);

  const handleSectorChange = (newSector) => {
    changeSector(newSector);
    setIsSelecting(false);
    // Navigate to sector-specific dashboard
    navigate(`/sector/${newSector}`);
  };

  const getSectorIcon = (sector) => {
    const config = getSectorConfig(sector);
    return config?.icon || '🏢';
  };

  const getSectorColor = (sector) => {
    const config = getSectorConfig(sector);
    switch(config?.color) {
      case 'amber': return 'from-amber-500 to-orange-500';
      case 'pink': return 'from-pink-500 to-rose-500';
      case 'blue': return 'from-blue-500 to-indigo-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  if (!isSelecting) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{
        background: isDark 
          ? 'linear-gradient(135deg, #1f2937 0%, #111827 100%)'
          : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
      }}>
        <div className={`max-w-4xl w-full rounded-3xl p-8 border transition-all duration-500 ${
          isDark 
            ? 'bg-gray-800/90 border-gray-700 shadow-2xl backdrop-blur-sm' 
            : 'bg-white/80 backdrop-blur-2xl border-white/50 shadow-xl'
        }`}>
          <div className="text-center mb-12">
            <h1 className={`text-4xl font-bold mb-4 ${theme.text.primary}`}>
              ESG Management Platform
            </h1>
            <p className={`text-lg ${theme.text.secondary} mb-8`}>
              Select your industry sector to access tailored ESG solutions
            </p>
            <div className="flex justify-center">
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
                isDark ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-100 text-blue-700'
              }`}>
                <span className="text-sm font-medium">Current Sector:</span>
                <span className="font-bold">{getSectorConfig(currentSector)?.name}</span>
                <span className="text-lg">{getSectorIcon(currentSector)}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {availableSectors.map((sector) => {
              const config = getSectorConfig(sector);
              const isActive = currentSector === sector;
              
              return (
                <div
                  key={sector}
                  onClick={() => handleSectorChange(sector)}
                  className={`relative group cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                    isActive ? 'ring-4 ring-blue-500/50' : ''
                  }`}
                >
                  <div className={`rounded-2xl p-6 border transition-all duration-300 ${
                    isDark 
                      ? 'bg-gray-700/50 border-gray-600 hover:bg-gray-700/80' 
                      : 'bg-white/60 border-gray-200 hover:bg-white/90 hover:shadow-lg'
                  }`}>
                    <div className="text-center">
                      <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r ${getSectorColor(sector)} flex items-center justify-center text-2xl text-white shadow-lg`}>
                        {config.icon}
                      </div>
                      <h3 className={`text-xl font-bold mb-2 ${theme.text.primary}`}>
                        {config.name}
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div className={`${theme.text.secondary}`}>
                          <strong>Primary Frameworks:</strong>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {config.frameworks.primary.slice(0, 3).map((framework, idx) => (
                              <span key={idx} className={`px-2 py-1 rounded text-xs ${
                                isDark ? 'bg-gray-600 text-gray-300' : 'bg-gray-100 text-gray-600'
                              }`}>
                                {framework}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className={`${theme.text.secondary}`}>
                          <strong>Report Templates:</strong> {config.reportTemplates.length}
                        </div>
                        <div className={`${theme.text.secondary}`}>
                          <strong>Compliance Modules:</strong> {config.complianceModules.length}
                        </div>
                      </div>
                      {isActive && (
                        <div className="mt-4">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                            isDark ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-700'
                          }`}>
                            ✓ Active Sector
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  {!isActive && (
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="text-center">
            <button
              onClick={() => navigate(`/sector/${currentSector}`)}
              className={`px-8 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${
                isDark 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
              }`}
            >
              Continue to {getSectorConfig(currentSector)?.name} Dashboard →
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default SectorSelector;