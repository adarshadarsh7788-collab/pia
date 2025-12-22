import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useSector } from '../contexts/SectorContext';
import { getThemeClasses } from '../utils/themeUtils';

import WaterManagementForm from './environmental/WaterManagementForm';
import WorkforceManagementForm from './social/WorkforceManagementForm';
import BoardManagementForm from './governance/BoardManagementForm';
import PatientSafetyForm from './social/PatientSafetyForm';

const EnhancedDataEntry = ({ onClose, onValidationResult }) => {
  const { isDark } = useTheme();
  const { currentSector, sectorConfig } = useSector();
  const theme = getThemeClasses(isDark);
  
  const [selectedModule, setSelectedModule] = useState(null);
  const [toast, setToast] = useState(null);

  const getSectorModules = () => {
    const baseModules = [
      {
        id: 'water_management',
        title: '💧 Water Management',
        description: 'Track water withdrawal, discharge, and recycling',
        category: 'Environmental',
        component: WaterManagementForm,
        color: 'blue',
        sectors: ['mining', 'manufacturing', 'healthcare']
      },
      {
        id: 'workforce_management',
        title: '👥 Workforce Management',
        description: 'Monitor diversity, training, and retention',
        category: 'Social',
        component: WorkforceManagementForm,
        color: 'purple',
        sectors: ['mining', 'manufacturing', 'healthcare']
      },
      {
        id: 'board_management',
        title: '⚖️ Board Management',
        description: 'Track board composition and governance',
        category: 'Governance',
        component: BoardManagementForm,
        color: 'indigo',
        sectors: ['mining', 'manufacturing', 'healthcare']
      }
    ];

    // Add sector-specific modules
    if (currentSector === 'healthcare') {
      baseModules.push({
        id: 'patient_safety',
        title: '🏥 Patient Safety',
        description: 'Track patient safety incidents and quality metrics',
        category: 'Social',
        component: PatientSafetyForm,
        color: 'pink',
        sectors: ['healthcare']
      });
    }

    // Filter modules based on current sector
    return baseModules.filter(module => 
      module.sectors.includes(currentSector)
    );
  };

  const modules = getSectorModules();

  const handleModuleSelect = (module) => {
    setSelectedModule(module);
  };

  const handleDataSave = (data) => {
    setToast({ message: 'Data saved successfully!', type: 'success' });
    
    // Send validation result to Dashboard
    if (onValidationResult) {
      onValidationResult({
        module: selectedModule.title,
        message: 'Data validated and saved successfully',
        status: 'success'
      });
    }
    
    setTimeout(() => setToast(null), 3000);
    setSelectedModule(null);
  };

  const handleModuleClose = () => {
    setSelectedModule(null);
  };

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  if (selectedModule) {
    const ModuleComponent = selectedModule.component;
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="max-w-6xl w-full max-h-[90vh] overflow-y-auto">
          <ModuleComponent 
            onSave={handleDataSave}
            onClose={handleModuleClose}
            onValidationResult={onValidationResult}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`max-w-4xl w-full max-h-[90vh] overflow-y-auto ${theme.bg.card} rounded-xl shadow-lg`}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className={`text-2xl font-bold ${theme.text.primary}`}>{sectorConfig?.icon} {sectorConfig?.name} ESG Data Entry</h2>
              <p className={`text-sm ${theme.text.secondary}`}>Specialized modules for {sectorConfig?.name?.toLowerCase()} industry data collection</p>
            </div>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ✕
            </button>
          </div>

          {/* Module Categories */}
          <div className="space-y-6">
            {['Environmental', 'Social', 'Governance'].map(category => (
              <div key={category} className={`p-4 rounded-lg ${theme.bg.subtle}`}>
                <h3 className={`text-lg font-semibold ${theme.text.primary} mb-4`}>
                  {category} Modules
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {modules
                    .filter(module => module.category === category)
                    .map(module => (
                      <div
                        key={module.id}
                        onClick={() => handleModuleSelect(module)}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:scale-105 ${
                          module.color === 'green' ? 'border-green-200 hover:border-green-400 hover:bg-green-50' :
                          module.color === 'blue' ? 'border-blue-200 hover:border-blue-400 hover:bg-blue-50' :
                          module.color === 'purple' ? 'border-purple-200 hover:border-purple-400 hover:bg-purple-50' :
                          module.color === 'pink' ? 'border-pink-200 hover:border-pink-400 hover:bg-pink-50' :
                          'border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50'
                        } ${theme.bg.card}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className={`font-semibold ${theme.text.primary} mb-2`}>
                              {module.title}
                            </h4>
                            <p className={`text-sm ${theme.text.secondary} mb-3`}>
                              {module.description}
                            </p>
                            <div className="flex items-center gap-2">
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                module.color === 'green' ? 'bg-green-100 text-green-800' :
                                module.color === 'blue' ? 'bg-blue-100 text-blue-800' :
                                module.color === 'purple' ? 'bg-purple-100 text-purple-800' :
                                module.color === 'pink' ? 'bg-pink-100 text-pink-800' :
                                'bg-indigo-100 text-indigo-800'
                              }`}>
                                {module.category}
                              </span>
                              <span className={`text-xs ${theme.text.muted}`}>
                                • Advanced Calculator
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              module.color === 'green' ? 'bg-green-100' :
                              module.color === 'blue' ? 'bg-blue-100' :
                              module.color === 'purple' ? 'bg-purple-100' :
                              module.color === 'pink' ? 'bg-pink-100' :
                              'bg-indigo-100'
                            }`}>
                              <span className="text-lg">→</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>

          {/* Quick Stats */}
          <div className={`mt-6 p-4 rounded-lg border-l-4 border-blue-500 ${theme.bg.subtle}`}>
            <h3 className={`font-semibold ${theme.text.primary} mb-2`}>📈 Module Benefits</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className={`font-medium ${theme.text.primary}`}>Automated Calculations</span>
                <p className={theme.text.secondary}>Real-time metric calculations and validations</p>
              </div>
              <div>
                <span className={`font-medium ${theme.text.primary}`}>Framework Compliance</span>
                <p className={theme.text.secondary}>Aligned with GRI, SASB, TCFD standards</p>
              </div>
              <div>
                <span className={`font-medium ${theme.text.primary}`}>Data Quality</span>
                <p className={theme.text.secondary}>Built-in validation and audit trails</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-end mt-6">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Close
            </button>
            <button
              onClick={() => showToast('Basic data entry still available in main form', 'info')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Use Basic Form
            </button>
          </div>
        </div>

        {/* Toast Notification */}
        {toast && (
          <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
            toast.type === 'success' ? 'bg-green-500 text-white' :
            toast.type === 'error' ? 'bg-red-500 text-white' :
            'bg-blue-500 text-white'
          }`}>
            {toast.message}
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedDataEntry;