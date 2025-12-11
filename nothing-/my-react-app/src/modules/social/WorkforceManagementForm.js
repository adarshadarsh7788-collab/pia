import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { getThemeClasses } from '../../utils/themeUtils';
import { saveData } from '../../utils/storage';

const WorkforceManagementForm = ({ onSave, onClose }) => {
  const { isDark } = useTheme();
  const theme = getThemeClasses(isDark);
  
  const [formData, setFormData] = useState({
    // Mining Workforce Composition (GRI-2-7)
    total_mine_workers: '',
    underground_workers: '',
    surface_workers: '',
    contract_workers: '',
    local_community_workers: '',
    
    // Diversity Metrics (GRI-405-1)
    female_employees: '',
    male_employees: '',
    local_employees: '',
    employees_under_30: '',
    employees_30_50: '',
    employees_over_50: '',
    
    // Mining Safety Metrics (GRI-403-9)
    fatality_count: '',
    lost_time_injuries: '',
    total_recordable_injuries: '',
    near_miss_incidents: '',
    safety_training_hours: '',
    
    // Mining-Specific Training (GRI-404-1)
    blasting_certification_training: '',
    equipment_operation_training: '',
    emergency_response_training: '',
    environmental_awareness_training: '',
    
    // Community Relations (GRI-413)
    local_employment_percentage: '',
    community_training_programs: '',
    artisanal_miners_supported: '',
    
    // Retention & Turnover
    voluntary_turnover: '',
    involuntary_turnover: '',
    new_hires: '',
    
    // Additional Information
    reporting_period: new Date().getFullYear(),
    mine_site_name: '',
    mine_location: '',
    union_representation: false
  });

  const [calculations, setCalculations] = useState({
    gender_diversity_ratio: 0,
    age_diversity_breakdown: { under_30: 0, between_30_50: 0, over_50: 0 },
    total_turnover_rate: 0,
    training_hours_per_employee: 0,
    leadership_diversity: 0
  });

  const handleInputChange = (field, value) => {
    const updatedData = { ...formData, [field]: value };
    setFormData(updatedData);
    calculateMetrics(updatedData);
  };

  const calculateMetrics = (data) => {
    const totalEmployees = parseFloat(data.total_employees) || 0;
    const femaleEmployees = parseFloat(data.female_employees) || 0;
    const femaleManagers = parseFloat(data.female_managers) || 0;
    const totalManagers = parseFloat(data.female_managers) + parseFloat(data.male_employees) || 1;
    
    const genderDiversityRatio = totalEmployees > 0 ? (femaleEmployees / totalEmployees) * 100 : 0;
    
    const under30 = parseFloat(data.employees_under_30) || 0;
    const between30_50 = parseFloat(data.employees_30_50) || 0;
    const over50 = parseFloat(data.employees_over_50) || 0;
    
    const voluntaryTurnover = parseFloat(data.voluntary_turnover) || 0;
    const involuntaryTurnover = parseFloat(data.involuntary_turnover) || 0;
    const totalTurnoverRate = totalEmployees > 0 ? ((voluntaryTurnover + involuntaryTurnover) / totalEmployees) * 100 : 0;
    
    const trainingHours = parseFloat(data.training_hours_total) || 0;
    const trainingHoursPerEmployee = totalEmployees > 0 ? trainingHours / totalEmployees : 0;
    
    const leadershipDiversity = totalManagers > 0 ? (femaleManagers / totalManagers) * 100 : 0;

    setCalculations({
      gender_diversity_ratio: genderDiversityRatio,
      age_diversity_breakdown: {
        under_30: totalEmployees > 0 ? (under30 / totalEmployees) * 100 : 0,
        between_30_50: totalEmployees > 0 ? (between30_50 / totalEmployees) * 100 : 0,
        over_50: totalEmployees > 0 ? (over50 / totalEmployees) * 100 : 0
      },
      total_turnover_rate: totalTurnoverRate,
      training_hours_per_employee: trainingHoursPerEmployee,
      leadership_diversity: leadershipDiversity
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const workforceData = {
      companyName: localStorage.getItem('companyName') || 'Company',
      category: 'social',
      subcategory: 'workforce_management',
      social: {
        gender_diversity_ratio: calculations.gender_diversity_ratio,
        total_turnover_rate: calculations.total_turnover_rate,
        training_hours_per_employee: calculations.training_hours_per_employee,
        leadership_diversity: calculations.leadership_diversity,
        ...formData
      },
      timestamp: new Date().toISOString(),
      reportingYear: formData.reporting_period
    };

    try {
      await saveData(workforceData);
      onSave?.(workforceData);
      onClose?.();
    } catch (error) {
      console.error('Error saving workforce data:', error);
    }
  };

  return (
    <div className={`max-w-4xl mx-auto p-6 ${theme.bg.card} rounded-xl shadow-lg`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className={`text-2xl font-bold ${theme.text.primary}`}>⛏️👥 Mining Workforce & Safety</h2>
          <p className={`text-sm ${theme.text.secondary}`}>Track mining workforce, safety, and community metrics - GRI 403 & 413</p>
        </div>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Mining Workforce Composition - GRI-2-7 */}
        <div className={`p-4 rounded-lg border-l-4 border-blue-500 ${theme.bg.subtle}`}>
          <h3 className={`font-semibold ${theme.text.primary} mb-3`}>Mining Workforce Composition - GRI-2-7</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="number"
              placeholder="Total Mine Workers"
              value={formData.total_mine_workers}
              onChange={(e) => handleInputChange('total_mine_workers', e.target.value)}
              className={`p-3 border rounded-lg ${theme.bg.input} ${theme.border.input}`}
            />
            <input
              type="number"
              placeholder="Underground Workers"
              value={formData.underground_workers}
              onChange={(e) => handleInputChange('underground_workers', e.target.value)}
              className={`p-3 border rounded-lg ${theme.bg.input} ${theme.border.input}`}
            />
            <input
              type="number"
              placeholder="Surface Workers"
              value={formData.surface_workers}
              onChange={(e) => handleInputChange('surface_workers', e.target.value)}
              className={`p-3 border rounded-lg ${theme.bg.input} ${theme.border.input}`}
            />
            <input
              type="number"
              placeholder="Contract Workers"
              value={formData.contract_workers}
              onChange={(e) => handleInputChange('contract_workers', e.target.value)}
              className={`p-3 border rounded-lg ${theme.bg.input} ${theme.border.input}`}
            />
            <input
              type="number"
              placeholder="Local Community Workers"
              value={formData.local_community_workers}
              onChange={(e) => handleInputChange('local_community_workers', e.target.value)}
              className={`p-3 border rounded-lg ${theme.bg.input} ${theme.border.input}`}
            />
          </div>
        </div>

        {/* Gender Diversity */}
        <div className={`p-4 rounded-lg border-l-4 border-purple-500 ${theme.bg.subtle}`}>
          <h3 className={`font-semibold ${theme.text.primary} mb-3`}>Gender Diversity</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="number"
              placeholder="Female Employees"
              value={formData.female_employees}
              onChange={(e) => handleInputChange('female_employees', e.target.value)}
              className={`p-3 border rounded-lg ${theme.bg.input} ${theme.border.input}`}
            />
            <input
              type="number"
              placeholder="Male Employees"
              value={formData.male_employees}
              onChange={(e) => handleInputChange('male_employees', e.target.value)}
              className={`p-3 border rounded-lg ${theme.bg.input} ${theme.border.input}`}
            />
            <input
              type="number"
              placeholder="Non-binary Employees"
              value={formData.non_binary_employees}
              onChange={(e) => handleInputChange('non_binary_employees', e.target.value)}
              className={`p-3 border rounded-lg ${theme.bg.input} ${theme.border.input}`}
            />
          </div>
          <div className="mt-3 text-right">
            <span className={`font-bold ${theme.text.primary}`}>
              Gender Diversity: {calculations.gender_diversity_ratio.toFixed(1)}% Female
            </span>
          </div>
        </div>

        {/* Age Diversity */}
        <div className={`p-4 rounded-lg border-l-4 border-green-500 ${theme.bg.subtle}`}>
          <h3 className={`font-semibold ${theme.text.primary} mb-3`}>Age Diversity</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="number"
              placeholder="Under 30"
              value={formData.employees_under_30}
              onChange={(e) => handleInputChange('employees_under_30', e.target.value)}
              className={`p-3 border rounded-lg ${theme.bg.input} ${theme.border.input}`}
            />
            <input
              type="number"
              placeholder="30-50 years"
              value={formData.employees_30_50}
              onChange={(e) => handleInputChange('employees_30_50', e.target.value)}
              className={`p-3 border rounded-lg ${theme.bg.input} ${theme.border.input}`}
            />
            <input
              type="number"
              placeholder="Over 50"
              value={formData.employees_over_50}
              onChange={(e) => handleInputChange('employees_over_50', e.target.value)}
              className={`p-3 border rounded-lg ${theme.bg.input} ${theme.border.input}`}
            />
          </div>
        </div>

        {/* Mining Safety Metrics - GRI-403-9 */}
        <div className={`p-4 rounded-lg border-l-4 border-red-500 ${theme.bg.subtle}`}>
          <h3 className={`font-semibold ${theme.text.primary} mb-3`}>Mining Safety Metrics - GRI-403-9 (Critical)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="number"
              placeholder="Fatality Count"
              value={formData.fatality_count}
              onChange={(e) => handleInputChange('fatality_count', e.target.value)}
              className={`p-3 border rounded-lg ${theme.bg.input} ${theme.border.input} border-red-300`}
            />
            <input
              type="number"
              placeholder="Lost Time Injuries"
              value={formData.lost_time_injuries}
              onChange={(e) => handleInputChange('lost_time_injuries', e.target.value)}
              className={`p-3 border rounded-lg ${theme.bg.input} ${theme.border.input}`}
            />
            <input
              type="number"
              placeholder="Total Recordable Injuries"
              value={formData.total_recordable_injuries}
              onChange={(e) => handleInputChange('total_recordable_injuries', e.target.value)}
              className={`p-3 border rounded-lg ${theme.bg.input} ${theme.border.input}`}
            />
            <input
              type="number"
              placeholder="Near Miss Incidents"
              value={formData.near_miss_incidents}
              onChange={(e) => handleInputChange('near_miss_incidents', e.target.value)}
              className={`p-3 border rounded-lg ${theme.bg.input} ${theme.border.input}`}
            />
            <input
              type="number"
              placeholder="Safety Training Hours"
              value={formData.safety_training_hours}
              onChange={(e) => handleInputChange('safety_training_hours', e.target.value)}
              className={`p-3 border rounded-lg ${theme.bg.input} ${theme.border.input}`}
            />
          </div>
        </div>

        {/* Mining-Specific Training - GRI-404-1 */}
        <div className={`p-4 rounded-lg border-l-4 border-orange-500 ${theme.bg.subtle}`}>
          <h3 className={`font-semibold ${theme.text.primary} mb-3`}>Mining-Specific Training - GRI-404-1</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="number"
              placeholder="Blasting Certification (hours)"
              value={formData.blasting_certification_training}
              onChange={(e) => handleInputChange('blasting_certification_training', e.target.value)}
              className={`p-3 border rounded-lg ${theme.bg.input} ${theme.border.input}`}
            />
            <input
              type="number"
              placeholder="Equipment Operation (hours)"
              value={formData.equipment_operation_training}
              onChange={(e) => handleInputChange('equipment_operation_training', e.target.value)}
              className={`p-3 border rounded-lg ${theme.bg.input} ${theme.border.input}`}
            />
            <input
              type="number"
              placeholder="Emergency Response (hours)"
              value={formData.emergency_response_training}
              onChange={(e) => handleInputChange('emergency_response_training', e.target.value)}
              className={`p-3 border rounded-lg ${theme.bg.input} ${theme.border.input}`}
            />
            <input
              type="number"
              placeholder="Environmental Awareness (hours)"
              value={formData.environmental_awareness_training}
              onChange={(e) => handleInputChange('environmental_awareness_training', e.target.value)}
              className={`p-3 border rounded-lg ${theme.bg.input} ${theme.border.input}`}
            />
          </div>
        </div>

        {/* Community Relations - GRI-413 */}
        <div className={`p-4 rounded-lg border-l-4 border-green-500 ${theme.bg.subtle}`}>
          <h3 className={`font-semibold ${theme.text.primary} mb-3`}>Community Relations - GRI-413</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="number"
              placeholder="Local Employment %"
              value={formData.local_employment_percentage}
              onChange={(e) => handleInputChange('local_employment_percentage', e.target.value)}
              className={`p-3 border rounded-lg ${theme.bg.input} ${theme.border.input}`}
            />
            <input
              type="number"
              placeholder="Community Training Programs"
              value={formData.community_training_programs}
              onChange={(e) => handleInputChange('community_training_programs', e.target.value)}
              className={`p-3 border rounded-lg ${theme.bg.input} ${theme.border.input}`}
            />
            <input
              type="number"
              placeholder="Artisanal Miners Supported"
              value={formData.artisanal_miners_supported}
              onChange={(e) => handleInputChange('artisanal_miners_supported', e.target.value)}
              className={`p-3 border rounded-lg ${theme.bg.input} ${theme.border.input}`}
            />
          </div>
        </div>

        {/* Turnover & Retention */}
        <div className={`p-4 rounded-lg border-l-4 border-red-500 ${theme.bg.subtle}`}>
          <h3 className={`font-semibold ${theme.text.primary} mb-3`}>Turnover & Retention</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="number"
              placeholder="Voluntary Turnover"
              value={formData.voluntary_turnover}
              onChange={(e) => handleInputChange('voluntary_turnover', e.target.value)}
              className={`p-3 border rounded-lg ${theme.bg.input} ${theme.border.input}`}
            />
            <input
              type="number"
              placeholder="Involuntary Turnover"
              value={formData.involuntary_turnover}
              onChange={(e) => handleInputChange('involuntary_turnover', e.target.value)}
              className={`p-3 border rounded-lg ${theme.bg.input} ${theme.border.input}`}
            />
            <input
              type="number"
              placeholder="New Hires"
              value={formData.new_hires}
              onChange={(e) => handleInputChange('new_hires', e.target.value)}
              className={`p-3 border rounded-lg ${theme.bg.input} ${theme.border.input}`}
            />
          </div>
          <div className="mt-3 text-right">
            <span className={`font-bold ${theme.text.primary}`}>
              Total Turnover Rate: {calculations.total_turnover_rate.toFixed(1)}%
            </span>
          </div>
        </div>

        <div className="flex gap-4 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Save Workforce Data
          </button>
        </div>
      </form>
    </div>
  );
};

export default WorkforceManagementForm;