import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useSector } from '../../contexts/SectorContext';
import { getThemeClasses } from '../../utils/themeUtils';
import { saveData } from '../../utils/storage';

const WorkforceManagementForm = ({ onSave, onClose }) => {
  const { isDark } = useTheme();
  const { currentSector, sectorConfig } = useSector();
  const theme = getThemeClasses(isDark);
  
  const getSectorFields = () => {
    const baseFields = {
      // Common workforce fields
      total_employees: '',
      female_employees: '',
      male_employees: '',
      employees_under_30: '',
      employees_30_50: '',
      employees_over_50: '',
      voluntary_turnover: '',
      involuntary_turnover: '',
      new_hires: '',
      local_employees: '',
      contract_workers: '',
      reporting_period: new Date().getFullYear(),
      facility_location: '',
      union_representation: false
    };

    if (currentSector === 'healthcare') {
      return {
        ...baseFields,
        // Healthcare-specific fields
        medical_staff: '',
        nursing_staff: '',
        administrative_staff: '',
        patient_safety_training_hours: '',
        medical_error_incidents: '',
        healthcare_worker_injuries: '',
        continuing_education_hours: '',
        facility_name: '',
        facility_type: 'hospital'
      };
    } else if (currentSector === 'manufacturing') {
      return {
        ...baseFields,
        // Manufacturing-specific fields
        production_workers: '',
        maintenance_workers: '',
        quality_control_staff: '',
        workplace_injuries: '',
        safety_training_hours: '',
        equipment_training_hours: '',
        lean_manufacturing_training: '',
        facility_name: '',
        facility_type: 'manufacturing_plant'
      };
    } else {
      return {
        ...baseFields,
        // Mining-specific fields
        underground_workers: '',
        surface_workers: '',
        local_community_workers: '',
        fatality_count: '',
        lost_time_injuries: '',
        total_recordable_injuries: '',
        near_miss_incidents: '',
        safety_training_hours: '',
        blasting_certification_training: '',
        equipment_operation_training: '',
        emergency_response_training: '',
        environmental_awareness_training: '',
        local_employment_percentage: '',
        community_training_programs: '',
        artisanal_miners_supported: '',
        mine_site_name: '',
        facility_type: 'mine_site'
      };
    }
  };

  const [formData, setFormData] = useState(getSectorFields());

  const [calculations, setCalculations] = useState({
    gender_diversity_ratio: 0,
    age_diversity_breakdown: { under_30: 0, between_30_50: 0, over_50: 0 },
    total_turnover_rate: 0,
    training_hours_per_employee: 0,
    leadership_diversity: 0
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field, value) => {
    const updatedData = { ...formData, [field]: value };
    setFormData(updatedData);
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
    
    calculateMetrics(updatedData);
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Required fields validation
    if (!formData.mine_site_name.trim()) {
      newErrors.mine_site_name = 'Mine site name is required';
    }
    
    if (!formData.mine_location.trim()) {
      newErrors.mine_location = 'Mine location is required';
    }
    
    // Numeric validation
    const numericFields = [
      'total_mine_workers', 'underground_workers', 'surface_workers', 'contract_workers',
      'female_employees', 'male_employees', 'employees_under_30', 'employees_30_50',
      'employees_over_50', 'fatality_count', 'lost_time_injuries', 'total_recordable_injuries',
      'voluntary_turnover', 'involuntary_turnover', 'new_hires'
    ];
    
    numericFields.forEach(field => {
      const value = formData[field];
      if (value !== '' && (isNaN(value) || parseFloat(value) < 0)) {
        newErrors[field] = 'Must be a positive number';
      }
    });
    
    // Business logic validation
    const totalWorkers = parseFloat(formData.total_mine_workers) || 0;
    const underground = parseFloat(formData.underground_workers) || 0;
    const surface = parseFloat(formData.surface_workers) || 0;
    
    if (totalWorkers > 0 && (underground + surface) > totalWorkers) {
      newErrors.underground_workers = 'Underground + Surface workers cannot exceed total workers';
    }
    
    // Gender validation
    const female = parseFloat(formData.female_employees) || 0;
    const male = parseFloat(formData.male_employees) || 0;
    
    if (totalWorkers > 0 && (female + male) > totalWorkers) {
      newErrors.female_employees = 'Total gender breakdown cannot exceed total workers';
    }
    
    // Percentage validation
    if (formData.local_employment_percentage && (parseFloat(formData.local_employment_percentage) < 0 || parseFloat(formData.local_employment_percentage) > 100)) {
      newErrors.local_employment_percentage = 'Percentage must be between 0-100';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
    setIsSubmitting(true);
    
    if (!validateForm()) {
      setIsSubmitting(false);
      return;
    }
    
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
      setErrors({ submit: 'Failed to save data. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`max-w-4xl mx-auto p-6 ${theme.bg.card} rounded-xl shadow-lg`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className={`text-2xl font-bold ${theme.text.primary}`}>{sectorConfig?.icon}👥 {sectorConfig?.name} Workforce Management</h2>
          <p className={`text-sm ${theme.text.secondary}`}>Track {sectorConfig?.name?.toLowerCase()} workforce, safety, and diversity metrics - GRI 403 & 405</p>
        </div>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Workforce Composition */}
        <div className={`p-4 rounded-lg border-l-4 border-blue-500 ${theme.bg.subtle}`}>
          <h3 className={`font-semibold ${theme.text.primary} mb-3`}>Workforce Composition - GRI-2-7</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <input
                type="number"
                placeholder="Total Employees *"
                value={formData.total_employees || formData.total_mine_workers}
                onChange={(e) => handleInputChange(currentSector === 'mining' ? 'total_mine_workers' : 'total_employees', e.target.value)}
                className={`p-3 border rounded-lg ${theme.bg.input} ${errors.total_employees || errors.total_mine_workers ? 'border-red-500' : theme.border.input}`}
                required
              />
              {(errors.total_employees || errors.total_mine_workers) && (
                <p className="text-red-500 text-xs mt-1">{errors.total_employees || errors.total_mine_workers}</p>
              )}
            </div>
            
            {/* Sector-specific workforce breakdown */}
            {currentSector === 'healthcare' && (
              <>
                <input
                  type="number"
                  placeholder="Medical Staff"
                  value={formData.medical_staff}
                  onChange={(e) => handleInputChange('medical_staff', e.target.value)}
                  className={`p-3 border rounded-lg ${theme.bg.input} ${theme.border.input}`}
                />
                <input
                  type="number"
                  placeholder="Nursing Staff"
                  value={formData.nursing_staff}
                  onChange={(e) => handleInputChange('nursing_staff', e.target.value)}
                  className={`p-3 border rounded-lg ${theme.bg.input} ${theme.border.input}`}
                />
                <input
                  type="number"
                  placeholder="Administrative Staff"
                  value={formData.administrative_staff}
                  onChange={(e) => handleInputChange('administrative_staff', e.target.value)}
                  className={`p-3 border rounded-lg ${theme.bg.input} ${theme.border.input}`}
                />
              </>
            )}
            
            {currentSector === 'manufacturing' && (
              <>
                <input
                  type="number"
                  placeholder="Production Workers"
                  value={formData.production_workers}
                  onChange={(e) => handleInputChange('production_workers', e.target.value)}
                  className={`p-3 border rounded-lg ${theme.bg.input} ${theme.border.input}`}
                />
                <input
                  type="number"
                  placeholder="Maintenance Workers"
                  value={formData.maintenance_workers}
                  onChange={(e) => handleInputChange('maintenance_workers', e.target.value)}
                  className={`p-3 border rounded-lg ${theme.bg.input} ${theme.border.input}`}
                />
                <input
                  type="number"
                  placeholder="Quality Control Staff"
                  value={formData.quality_control_staff}
                  onChange={(e) => handleInputChange('quality_control_staff', e.target.value)}
                  className={`p-3 border rounded-lg ${theme.bg.input} ${theme.border.input}`}
                />
              </>
            )}
            
            {currentSector === 'mining' && (
              <>
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
                  placeholder="Local Community Workers"
                  value={formData.local_community_workers}
                  onChange={(e) => handleInputChange('local_community_workers', e.target.value)}
                  className={`p-3 border rounded-lg ${theme.bg.input} ${theme.border.input}`}
                />
              </>
            )}
            
            <input
              type="number"
              placeholder="Contract Workers"
              value={formData.contract_workers}
              onChange={(e) => handleInputChange('contract_workers', e.target.value)}
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

        {/* Safety Metrics */}
        {currentSector === 'healthcare' && (
          <div className={`p-4 rounded-lg border-l-4 border-pink-500 ${theme.bg.subtle}`}>
            <h3 className={`font-semibold ${theme.text.primary} mb-3`}>Healthcare Safety Metrics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="number"
                placeholder="Patient Safety Training Hours"
                value={formData.patient_safety_training_hours}
                onChange={(e) => handleInputChange('patient_safety_training_hours', e.target.value)}
                className={`p-3 border rounded-lg ${theme.bg.input} ${theme.border.input}`}
              />
              <input
                type="number"
                placeholder="Medical Error Incidents"
                value={formData.medical_error_incidents}
                onChange={(e) => handleInputChange('medical_error_incidents', e.target.value)}
                className={`p-3 border rounded-lg ${theme.bg.input} ${theme.border.input}`}
              />
              <input
                type="number"
                placeholder="Healthcare Worker Injuries"
                value={formData.healthcare_worker_injuries}
                onChange={(e) => handleInputChange('healthcare_worker_injuries', e.target.value)}
                className={`p-3 border rounded-lg ${theme.bg.input} ${theme.border.input}`}
              />
              <input
                type="number"
                placeholder="Continuing Education Hours"
                value={formData.continuing_education_hours}
                onChange={(e) => handleInputChange('continuing_education_hours', e.target.value)}
                className={`p-3 border rounded-lg ${theme.bg.input} ${theme.border.input}`}
              />
            </div>
          </div>
        )}

        {currentSector === 'manufacturing' && (
          <div className={`p-4 rounded-lg border-l-4 border-blue-500 ${theme.bg.subtle}`}>
            <h3 className={`font-semibold ${theme.text.primary} mb-3`}>Manufacturing Safety & Training</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="number"
                placeholder="Workplace Injuries"
                value={formData.workplace_injuries}
                onChange={(e) => handleInputChange('workplace_injuries', e.target.value)}
                className={`p-3 border rounded-lg ${theme.bg.input} ${theme.border.input}`}
              />
              <input
                type="number"
                placeholder="Safety Training Hours"
                value={formData.safety_training_hours}
                onChange={(e) => handleInputChange('safety_training_hours', e.target.value)}
                className={`p-3 border rounded-lg ${theme.bg.input} ${theme.border.input}`}
              />
              <input
                type="number"
                placeholder="Equipment Training Hours"
                value={formData.equipment_training_hours}
                onChange={(e) => handleInputChange('equipment_training_hours', e.target.value)}
                className={`p-3 border rounded-lg ${theme.bg.input} ${theme.border.input}`}
              />
              <input
                type="number"
                placeholder="Lean Manufacturing Training"
                value={formData.lean_manufacturing_training}
                onChange={(e) => handleInputChange('lean_manufacturing_training', e.target.value)}
                className={`p-3 border rounded-lg ${theme.bg.input} ${theme.border.input}`}
              />
            </div>
          </div>
        )}

        {currentSector === 'mining' && (
          <>
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
              </div>
            </div>
            
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
          </>
        )}

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
            disabled={isSubmitting}
            className={`px-6 py-2 rounded-lg text-white ${
              isSubmitting 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-purple-600 hover:bg-purple-700'
            }`}
          >
            {isSubmitting ? 'Saving...' : 'Save Workforce Data'}
          </button>
          {errors.submit && (
            <p className="text-red-500 text-sm">{errors.submit}</p>
          )}
        </div>
      </form>
    </div>
  );
};

export default WorkforceManagementForm;