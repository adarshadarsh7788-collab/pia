import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { getThemeClasses } from '../utils/themeUtils';
import { Button, Toast } from './ProfessionalUX';
import { CarbonFootprintCalculator, WaterStressCalculator, ESGROICalculator, EmissionIntensityCalculator, CalculatorManager } from '../calculators';
import DataIntegration from '../calculators/DataIntegration';

const CalculatorDashboard = () => {
  const { isDark } = useTheme();
  const theme = getThemeClasses(isDark);
  const [activeCalculator, setActiveCalculator] = useState('carbon');
  const [results, setResults] = useState({});
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [useRealData, setUseRealData] = useState(false);
  const [dataSummary, setDataSummary] = useState(null);

  const calculators = [
    { id: 'carbon', name: 'Carbon Footprint', icon: '🌍' },
    { id: 'water', name: 'Water Stress', icon: '💧' },
    { id: 'roi', name: 'ESG ROI', icon: '💰' },
    { id: 'intensity', name: 'Emission Intensity', icon: '📈' }
  ];

  const testCalculator = async (type) => {
    setLoading(true);
    try {
      let result;
      let testData;
      
      if (useRealData) {
        testData = DataIntegration.getCalculatorData(type);
        if (!testData) {
          showToast('No ESG data available. Please add data through Data Entry first.', 'warning');
          setLoading(false);
          return;
        }
      } else {
        testData = getTestData(type);
      }
      
      switch (type) {
        case 'carbon':
          result = CarbonFootprintCalculator.calculateTotalFootprint(testData);
          break;
        case 'water':
          result = WaterStressCalculator.calculateWaterStress(testData);
          break;
        case 'roi':
          result = ESGROICalculator.calculateESGROI(testData);
          break;
        case 'intensity':
          result = EmissionIntensityCalculator.calculateEmissionIntensity(testData);
          break;
        default:
          result = await CalculatorManager.calculate(type, testData);
      }
      
      setResults(prev => ({ ...prev, [type]: result }));
      showToast(`${type} calculator ${useRealData ? '(real data)' : '(test data)'} successful`, 'success');
    } catch (error) {
      console.error(`${type} calculator failed:`, error);
      showToast(`${type} calculator failed: ${error.message}`, 'error');
    }
    setLoading(false);
  };

  const getTestData = (type) => {
    const testData = {
      carbon: {
        scope1: { naturalGas: 1000, diesel: 500, gasoline: 300 },
        scope2: { gridElectricity: 50000, renewableElectricity: 10000 },
        scope3: { 
          transport: { car: 10000, plane: 5000, truck: 2000 },
          businessTravel: { flights: 8000, carTravel: 3000 },
          supplyChainEmissions: 15000,
          wasteDisposal: 500
        }
      },
      water: {
        consumption: { 
          totalAnnual: 100000, 
          recycled: 20000, 
          rainwater: 5000,
          revenue: 10000000
        },
        location: { 
          region: 'North America', 
          country: 'United States',
          climate: 'temperate',
          localSupply: 85
        },
        quality: { ph: 7.2, tds: 250, turbidity: 0.8, chlorine: 0.6, hardness: 120 },
        efficiency: { 
          recyclingRate: 25, 
          leakageRate: 8, 
          conservationMeasures: 70,
          technologyScore: 75,
          industry: 'manufacturing'
        }
      },
      roi: {
        investments: {
          renewableEnergy: 500000,
          energyEfficiency: 200000,
          employeeTraining: 100000,
          healthSafety: 150000,
          complianceSystem: 80000
        },
        benefits: {
          costSavings: {
            energyReduction: 50000,
            waterReduction: 10000,
            operationalEfficiency: 75000,
            turnoverReduction: 5,
            avgRecruitmentCost: 15000
          },
          revenueGains: {
            greenProductRevenue: 200000,
            sustainabilityPremium: 50000,
            customerRetentionImprovement: 10,
            avgCustomerValue: 2000
          },
          riskReduction: {
            regulatoryFineReduction: 100000,
            reputationProtection: 150000
          },
          brandValue: {
            brandPremium: 80000,
            engagementImprovement: 15,
            productivityGain: 3000
          }
        },
        timeframe: 5
      },
      intensity: {
        emissions: { scope1: 5000, scope2: 8000, scope3: 12000 },
        businessMetrics: {
          revenue: 10000000,
          employees: 250,
          production: 50000,
          floorArea: 10000,
          energyConsumption: 100000
        },
        industry: 'manufacturing',
        historicalData: [
          { year: 2020, revenue: 0.3, employee: 9000, totalIntensity: 0.28 },
          { year: 2021, revenue: 0.28, employee: 8500, totalIntensity: 0.26 },
          { year: 2022, revenue: 0.25, employee: 8000, totalIntensity: 0.25 }
        ],
        targets: {
          revenue: { value: 0.2, timeline: 5 },
          employee: { value: 6000, timeline: 3 }
        }
      }
    };
    
    return testData[type] || {};
  };

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadDataSummary = () => {
    try {
      const summary = DataIntegration.getDataSummary();
      setDataSummary(summary);
      showToast('Data summary refreshed', 'success');
    } catch (error) {
      console.error('Failed to refresh data summary:', error);
      showToast('Failed to refresh data summary', 'error');
    }
  };

  React.useEffect(() => {
    loadDataSummary();
  }, []);

  const renderResults = (type) => {
    const result = results[type];
    if (!result) return null;

    return (
      <div className={`mt-4 p-4 rounded-lg ${theme.bg.subtle} w-full text-left`}>
        <h4 className={`font-semibold mb-3 ${theme.text.primary} text-center`}>Results</h4>
        <div className="space-y-2 text-sm">
          {type === 'carbon' && (
            <>
              <div className="flex justify-between py-1">
                <span className="font-medium">Total:</span>
                <span className="font-bold">{result.totalEmissions?.toFixed(2)} kg CO2e</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Scope 1:</span>
                <span>{result.scope1?.total?.toFixed(2)} kg CO2e</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Scope 2:</span>
                <span>{result.scope2?.total?.toFixed(2)} kg CO2e</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Scope 3:</span>
                <span>{result.scope3?.total?.toFixed(2)} kg CO2e</span>
              </div>
            </>
          )}
          {type === 'water' && (
            <>
              <div className="flex justify-between py-1">
                <span className="font-medium">Stress Score:</span>
                <span className="font-bold">{result.overallStressScore}/100</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Level:</span>
                <span>{result.stressLevel?.description}</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Availability:</span>
                <span>{result.availability?.score}/100</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Quality:</span>
                <span>{result.quality?.overallScore}/100</span>
              </div>
            </>
          )}
          {type === 'roi' && (
            <>
              <div className="flex justify-between py-1">
                <span className="font-medium">Total ROI:</span>
                <span className="font-bold">{result.totalROI}%</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Payback:</span>
                <span>{result.paybackPeriod} years</span>
              </div>
              <div className="flex justify-between py-1">
                <span>NPV:</span>
                <span>${result.netPresentValue?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Investment:</span>
                <span>${result.investments?.totalInvestment?.toLocaleString()}</span>
              </div>
            </>
          )}
          {type === 'intensity' && (
            <>
              <div className="flex justify-between py-1">
                <span className="font-medium">Total:</span>
                <span className="font-bold">{result.totalEmissions} kg CO2e</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Revenue:</span>
                <span>{result.intensityMetrics?.revenue?.value?.toFixed(4)} kg/$</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Employee:</span>
                <span>{result.intensityMetrics?.employee?.value?.toFixed(0)} kg/emp</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Performance:</span>
                <span>{result.benchmarks?.overallPerformance}</span>
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className={`mb-6 p-6 rounded-xl shadow-lg ${theme.bg.card}`}>
          <h1 className={`text-2xl font-bold ${theme.text.primary}`}>
            ESG Calculator Dashboard
          </h1>
          <p className={`text-sm ${theme.text.secondary} mt-1`}>
            Test and validate specialized ESG calculators
          </p>
          
          {/* Data Source Toggle */}
          <div className={`mt-4 p-4 rounded-lg ${theme.bg.subtle}`}>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex-1">
                <label className={`flex items-center cursor-pointer ${theme.text.primary} font-medium`}>
                  <input
                    type="checkbox"
                    checked={useRealData}
                    onChange={(e) => {
                      setUseRealData(e.target.checked);
                      loadDataSummary();
                    }}
                    className="mr-3 w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  Use Real Data from Data Entry
                </label>
                <p className={`text-sm ${theme.text.secondary} mt-2 ml-8`}>
                  {useRealData ? '✓ Using actual ESG data from Data Entry module' : '⚠ Using sample test data'}
                </p>
              </div>
              
              {dataSummary && (
                <div className={`p-4 rounded-lg ${theme.bg.subtle} min-w-[200px]`}>
                  <p className={`text-sm font-semibold ${theme.text.primary} mb-2`}>
                    Available Data: {dataSummary.totalEntries} entries
                  </p>
                  <div className="flex gap-3 text-xs">
                    <span className={theme.text.secondary}>E: {dataSummary.categories.environmental}</span>
                    <span className={theme.text.secondary}>S: {dataSummary.categories.social}</span>
                    <span className={theme.text.secondary}>G: {dataSummary.categories.governance}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {calculators.map((calc) => (
            <div
              key={calc.id}
              className={`p-4 rounded-lg shadow cursor-pointer transition-all ${
                activeCalculator === calc.id
                  ? 'ring-2 ring-blue-500 bg-blue-50'
                  : theme.bg.card
              }`}
              onClick={() => setActiveCalculator(calc.id)}
            >
              <div className="flex flex-col items-center">
                <div className="text-4xl mb-2">{calc.icon}</div>
                <h3 className={`font-semibold text-base mb-3 ${theme.text.primary}`}>{calc.name}</h3>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    testCalculator(calc.id);
                  }}
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? 'Testing...' : 'Test Calculator'}
                </Button>
                {renderResults(calc.id)}
              </div>
            </div>
          ))}
        </div>

        <div className={`p-6 rounded-lg shadow ${theme.bg.card}`}>
          <h2 className={`text-2xl font-bold mb-4 ${theme.text.primary}`}>
            Calculator Status
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className={`font-semibold mb-3 ${theme.text.primary}`}>Available Calculators</h3>
              <ul className="space-y-2">
                {CalculatorManager.getAvailableCalculators().map((calc) => (
                  <li key={calc} className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className={theme.text.secondary}>{calc}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className={`font-semibold mb-3 ${theme.text.primary}`}>Test All Calculators</h3>
              <div className="space-y-2">
                <Button
                  variant="primary"
                  onClick={async () => {
                    for (const calc of calculators) {
                      await testCalculator(calc.id);
                    }
                  }}
                  disabled={loading}
                  className="w-full"
                >
                  Run All Tests
                </Button>
                
                <Button
                  variant="outline"
                  onClick={loadDataSummary}
                  className="w-full"
                >
                  Refresh Data Summary
                </Button>
                
                {useRealData && dataSummary?.totalEntries === 0 && (
                  <div className={`p-3 rounded bg-yellow-100 text-yellow-800 text-sm`}>
                    No ESG data found. Add data through Data Entry first.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </div>
    </div>
  );
};

export default CalculatorDashboard;