import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useSector } from '../../contexts/SectorContext';
import { getThemeClasses } from '../../utils/themeUtils';
import { saveData } from '../../utils/storage';

const WaterManagementForm = ({ onSave, onClose, onValidationResult }) => {
  const { isDark } = useTheme();
  const { currentSector, sectorConfig } = useSector();
  const theme = getThemeClasses(isDark);
  
  const getSectorFields = () => {
    if (currentSector === 'healthcare') {
      return {
        // Healthcare Water Management
        medical_water_usage: '',
        pharmaceutical_water_usage: '',
        sterilization_water: '',
        cooling_water_usage: '',
        laboratory_water: '',
        
        // Healthcare Water Discharge
        pharmaceutical_wastewater: '',
        medical_wastewater: '',
        laboratory_wastewater: '',
        
        // Healthcare-Specific
        water_quality_compliance: '',
        medical_waste_water_treatment: '',
        facility_name: '',
        facility_type: 'hospital' // hospital, clinic, pharmaceutical
      };
    } else if (currentSector === 'manufacturing') {
      return {
        // Manufacturing Water Usage
        process_water_usage: '',
        cooling_water_usage: '',
        cleaning_water_usage: '',
        steam_generation_water: '',
        
        // Manufacturing Water Discharge
        industrial_wastewater: '',
        process_wastewater: '',
        cooling_water_discharge: '',
        
        // Manufacturing-Specific
        water_intensity_per_unit: '',
        production_volume: '',
        facility_name: '',
        facility_type: 'manufacturing_plant'
      };
    } else {
      return {
        // Mining Water Management
        surface_water_withdrawal: '',
        groundwater_withdrawal: '',
        mine_water_discharge: '',
        tailings_water_discharge: '',
        water_used_in_processing: '',
        water_used_in_dust_suppression: '',
        tailings_dam_water_storage: '',
        acid_mine_drainage_volume: '',
        mine_site_name: '',
        facility_type: 'mine_site'
      };
    }
  };

  const [formData, setFormData] = useState({
    // Common fields for all sectors
    municipal_water_withdrawal: '',
    rainwater_harvested: '',
    treated_wastewater_discharge: '',
    untreated_wastewater_discharge: '',
    water_recycled: '',
    water_reused: '',
    process_water_recycled: '',
    water_quality_parameters: '',
    treatment_efficiency: '',
    water_stress_area: false,
    water_conservation_initiatives: '',
    reporting_period: new Date().getFullYear(),
    facility_location: '',
    
    // Sector-specific fields
    ...getSectorFields()
  });

  const [calculations, setCalculations] = useState({
    total_withdrawal: 0,
    total_discharge: 0,
    total_recycled: 0,
    water_intensity: 0,
    recycling_rate: 0
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
    
    calculateWaterMetrics(updatedData);
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Required fields validation
    if (!formData.mine_site_name.trim()) {
      newErrors.mine_site_name = 'Mine site name is required';
    }
    
    if (!formData.facility_location.trim()) {
      newErrors.facility_location = 'Facility location is required';
    }
    
    // Numeric validation
    const numericFields = [
      'surface_water_withdrawal', 'groundwater_withdrawal', 'municipal_water_withdrawal',
      'rainwater_harvested', 'treated_wastewater_discharge', 'untreated_wastewater_discharge',
      'mine_water_discharge', 'tailings_water_discharge', 'water_recycled', 'water_reused',
      'water_used_in_processing', 'water_used_in_dust_suppression', 'tailings_dam_water_storage',
      'acid_mine_drainage_volume'
    ];
    
    numericFields.forEach(field => {
      const value = formData[field];
      if (value !== '' && (isNaN(value) || parseFloat(value) < 0)) {
        newErrors[field] = 'Must be a positive number';
      }
    });
    
    // Business logic validation
    const totalWithdrawal = calculations.total_withdrawal;
    const totalRecycled = calculations.total_recycled;
    
    if (totalRecycled > totalWithdrawal && totalWithdrawal > 0) {
      newErrors.water_recycled = 'Total recycled water cannot exceed total withdrawal';
    }
    
    // Treatment efficiency validation
    if (formData.treatment_efficiency && (parseFloat(formData.treatment_efficiency) < 0 || parseFloat(formData.treatment_efficiency) > 100)) {
      newErrors.treatment_efficiency = 'Treatment efficiency must be between 0-100%';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateWaterMetrics = (data) => {
    const totalWithdrawal = [
      data.surface_water_withdrawal,
      data.groundwater_withdrawal,
      data.municipal_water_withdrawal,
      data.rainwater_harvested
    ].reduce((sum, val) => sum + (parseFloat(val) || 0), 0);

    const totalDischarge = [
      data.treated_wastewater_discharge,
      data.untreated_wastewater_discharge,
      data.surface_water_discharge
    ].reduce((sum, val) => sum + (parseFloat(val) || 0), 0);

    const totalRecycled = (parseFloat(data.water_recycled) || 0) + (parseFloat(data.water_reused) || 0);
    
    const recyclingRate = totalWithdrawal > 0 ? (totalRecycled / totalWithdrawal) * 100 : 0;

    setCalculations({
      total_withdrawal: totalWithdrawal,
      total_discharge: totalDischarge,
      total_recycled: totalRecycled,
      recycling_rate: recyclingRate
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    if (!validateForm()) {
      setIsSubmitting(false);
      
      // Send validation failure result
      if (onValidationResult) {
        onValidationResult({
          module: 'Water Management',
          message: 'Validation failed - please check required fields',
          status: 'error'
        });
      }
      
      return;
    }
    
    const waterData = {
      companyName: localStorage.getItem('companyName') || 'Company',
      category: 'environmental',
      subcategory: 'water_management',
      environmental: {
        total_water_withdrawal: calculations.total_withdrawal,
        total_water_discharge: calculations.total_discharge,
        water_recycling_rate: calculations.recycling_rate,
        ...formData
      },
      timestamp: new Date().toISOString(),
      reportingYear: formData.reporting_period
    };

    try {
      await saveData(waterData);
      
      // Send validation success result
      if (onValidationResult) {
        onValidationResult({
          module: 'Water Management',
          message: 'Data validated and saved successfully',
          status: 'success'
        });
      }
      
      onSave?.(waterData);
      onClose?.();
    } catch (error) {
      console.error('Error saving water data:', error);
      setErrors({ submit: 'Failed to save data. Please try again.' });
      
      // Send validation error result
      if (onValidationResult) {
        onValidationResult({
          module: 'Water Management',
          message: 'Save failed - please try again',
          status: 'error'
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`max-w-4xl mx-auto p-6 ${theme.bg.card} rounded-xl shadow-lg`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className={`text-2xl font-bold ${theme.text.primary}`}>{sectorConfig?.icon}💧 {sectorConfig?.name} Water Management</h2>
          <p className={`text-sm ${theme.text.secondary}`}>Track {sectorConfig?.name?.toLowerCase()} water withdrawal, discharge, and recycling - GRI 303</p>
        </div>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Water Withdrawal */}
        <div className={`p-4 rounded-lg border-l-4 border-blue-500 ${theme.bg.subtle}`}>
          <h3 className={`font-semibold ${theme.text.primary} mb-3`}>Water Withdrawal (cubic meters)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <input
                type="number"
                placeholder="Surface Water"
                value={formData.surface_water_withdrawal}
                onChange={(e) => handleInputChange('surface_water_withdrawal', e.target.value)}
                className={`p-3 border rounded-lg ${theme.bg.input} ${errors.surface_water_withdrawal ? 'border-red-500' : theme.border.input}`}
              />
              {errors.surface_water_withdrawal && (
                <p className="text-red-500 text-xs mt-1">{errors.surface_water_withdrawal}</p>
              )}
            </div>
            <input
              type="number"
              placeholder="Groundwater"
              value={formData.groundwater_withdrawal}
              onChange={(e) => handleInputChange('groundwater_withdrawal', e.target.value)}
              className={`p-3 border rounded-lg ${theme.bg.input} ${theme.border.input}`}
            />
            <input
              type="number"
              placeholder="Municipal Water"
              value={formData.municipal_water_withdrawal}
              onChange={(e) => handleInputChange('municipal_water_withdrawal', e.target.value)}
              className={`p-3 border rounded-lg ${theme.bg.input} ${theme.border.input}`}
            />
            <input
              type="number"
              placeholder="Rainwater Harvested"
              value={formData.rainwater_harvested}
              onChange={(e) => handleInputChange('rainwater_harvested', e.target.value)}
              className={`p-3 border rounded-lg ${theme.bg.input} ${theme.border.input}`}
            />
          </div>
          <div className="mt-3 text-right">
            <span className={`font-bold ${theme.text.primary}`}>
              Total Withdrawal: {calculations.total_withdrawal.toFixed(2)} m³
            </span>
          </div>
        </div>

        {/* Mining Water Discharge - GRI-303-4 */}
        <div className={`p-4 rounded-lg border-l-4 border-orange-500 ${theme.bg.subtle}`}>
          <h3 className={`font-semibold ${theme.text.primary} mb-3`}>Mining Water Discharge (m³) - GRI-303-4</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="number"
              placeholder="Treated Wastewater"
              value={formData.treated_wastewater_discharge}
              onChange={(e) => handleInputChange('treated_wastewater_discharge', e.target.value)}
              className={`p-3 border rounded-lg ${theme.bg.input} ${theme.border.input}`}
            />
            <input
              type="number"
              placeholder="Untreated Wastewater"
              value={formData.untreated_wastewater_discharge}
              onChange={(e) => handleInputChange('untreated_wastewater_discharge', e.target.value)}
              className={`p-3 border rounded-lg ${theme.bg.input} ${theme.border.input}`}
            />
            <input
              type="number"
              placeholder="Mine Water Discharge"
              value={formData.mine_water_discharge}
              onChange={(e) => handleInputChange('mine_water_discharge', e.target.value)}
              className={`p-3 border rounded-lg ${theme.bg.input} ${theme.border.input}`}
            />
            <input
              type="number"
              placeholder="Tailings Water Discharge"
              value={formData.tailings_water_discharge}
              onChange={(e) => handleInputChange('tailings_water_discharge', e.target.value)}
              className={`p-3 border rounded-lg ${theme.bg.input} ${theme.border.input}`}
            />
          </div>
          <div className="mt-3 text-right">
            <span className={`font-bold ${theme.text.primary}`}>
              Total Discharge: {calculations.total_discharge.toFixed(2)} m³
            </span>
          </div>
        </div>

        {/* Sector-Specific Water Usage */}
        {currentSector === 'healthcare' && (
          <div className={`p-4 rounded-lg border-l-4 border-pink-500 ${theme.bg.subtle}`}>
            <h3 className={`font-semibold ${theme.text.primary} mb-3`}>Healthcare Water Usage (m³)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="number"
                placeholder="Medical Water Usage"
                value={formData.medical_water_usage}
                onChange={(e) => handleInputChange('medical_water_usage', e.target.value)}
                className={`p-3 border rounded-lg ${theme.bg.input} ${theme.border.input}`}
              />
              <input
                type="number"
                placeholder="Pharmaceutical Water Usage"
                value={formData.pharmaceutical_water_usage}
                onChange={(e) => handleInputChange('pharmaceutical_water_usage', e.target.value)}
                className={`p-3 border rounded-lg ${theme.bg.input} ${theme.border.input}`}
              />
              <input
                type="number"
                placeholder="Sterilization Water"
                value={formData.sterilization_water}
                onChange={(e) => handleInputChange('sterilization_water', e.target.value)}
                className={`p-3 border rounded-lg ${theme.bg.input} ${theme.border.input}`}
              />
              <input
                type="number"
                placeholder="Laboratory Water"
                value={formData.laboratory_water}
                onChange={(e) => handleInputChange('laboratory_water', e.target.value)}
                className={`p-3 border rounded-lg ${theme.bg.input} ${theme.border.input}`}
              />
            </div>
          </div>
        )}

        {currentSector === 'manufacturing' && (
          <div className={`p-4 rounded-lg border-l-4 border-blue-500 ${theme.bg.subtle}`}>
            <h3 className={`font-semibold ${theme.text.primary} mb-3`}>Manufacturing Water Usage (m³)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="number"
                placeholder="Process Water Usage"
                value={formData.process_water_usage}
                onChange={(e) => handleInputChange('process_water_usage', e.target.value)}
                className={`p-3 border rounded-lg ${theme.bg.input} ${theme.border.input}`}
              />
              <input
                type="number"
                placeholder="Cooling Water Usage"
                value={formData.cooling_water_usage}
                onChange={(e) => handleInputChange('cooling_water_usage', e.target.value)}
                className={`p-3 border rounded-lg ${theme.bg.input} ${theme.border.input}`}
              />
              <input
                type="number"
                placeholder="Cleaning Water Usage"
                value={formData.cleaning_water_usage}
                onChange={(e) => handleInputChange('cleaning_water_usage', e.target.value)}
                className={`p-3 border rounded-lg ${theme.bg.input} ${theme.border.input}`}
              />
              <input
                type="number"
                placeholder="Steam Generation Water"
                value={formData.steam_generation_water}
                onChange={(e) => handleInputChange('steam_generation_water', e.target.value)}
                className={`p-3 border rounded-lg ${theme.bg.input} ${theme.border.input}`}
              />
            </div>
          </div>
        )}

        {currentSector === 'mining' && (
          <div className={`p-4 rounded-lg border-l-4 border-amber-500 ${theme.bg.subtle}`}>
            <h3 className={`font-semibold ${theme.text.primary} mb-3`}>Mining Water Usage (m³)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="number"
                placeholder="Water in Ore Processing"
                value={formData.water_used_in_processing}
                onChange={(e) => handleInputChange('water_used_in_processing', e.target.value)}
                className={`p-3 border rounded-lg ${theme.bg.input} ${theme.border.input}`}
              />
              <input
                type="number"
                placeholder="Water for Dust Suppression"
                value={formData.water_used_in_dust_suppression}
                onChange={(e) => handleInputChange('water_used_in_dust_suppression', e.target.value)}
                className={`p-3 border rounded-lg ${theme.bg.input} ${theme.border.input}`}
              />
              <input
                type="number"
                placeholder="Tailings Dam Water Storage"
                value={formData.tailings_dam_water_storage}
                onChange={(e) => handleInputChange('tailings_dam_water_storage', e.target.value)}
                className={`p-3 border rounded-lg ${theme.bg.input} ${theme.border.input}`}
              />
              <input
                type="number"
                placeholder="Acid Mine Drainage Volume"
                value={formData.acid_mine_drainage_volume}
                onChange={(e) => handleInputChange('acid_mine_drainage_volume', e.target.value)}
                className={`p-3 border rounded-lg ${theme.bg.input} ${theme.border.input}`}
              />
            </div>
          </div>
        )}

        {/* Water Recycling */}
        <div className={`p-4 rounded-lg border-l-4 border-green-500 ${theme.bg.subtle}`}>
          <h3 className={`font-semibold ${theme.text.primary} mb-3`}>Water Recycling & Reuse (cubic meters)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="number"
              placeholder="Water Recycled"
              value={formData.water_recycled}
              onChange={(e) => handleInputChange('water_recycled', e.target.value)}
              className={`p-3 border rounded-lg ${theme.bg.input} ${theme.border.input}`}
            />
            <input
              type="number"
              placeholder="Water Reused"
              value={formData.water_reused}
              onChange={(e) => handleInputChange('water_reused', e.target.value)}
              className={`p-3 border rounded-lg ${theme.bg.input} ${theme.border.input}`}
            />
          </div>
          <div className="mt-3 text-right">
            <span className={`font-bold ${theme.text.primary}`}>
              Recycling Rate: {calculations.recycling_rate.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Additional Information */}
        <div className={`p-4 rounded-lg ${theme.bg.subtle}`}>
          <h3 className={`font-semibold ${theme.text.primary} mb-3`}>Facility Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <input
                type="text"
                placeholder={`${sectorConfig?.name} Facility Name *`}
                value={formData.facility_name || formData.mine_site_name}
                onChange={(e) => handleInputChange(currentSector === 'mining' ? 'mine_site_name' : 'facility_name', e.target.value)}
                className={`p-3 border rounded-lg ${theme.bg.input} ${errors.facility_name || errors.mine_site_name ? 'border-red-500' : theme.border.input}`}
                required
              />
              {(errors.facility_name || errors.mine_site_name) && (
                <p className="text-red-500 text-xs mt-1">{errors.facility_name || errors.mine_site_name}</p>
              )}
            </div>
            <div>
              <input
                type="text"
                placeholder={`${sectorConfig?.name} Location (Region/Country) *`}
                value={formData.facility_location}
                onChange={(e) => handleInputChange('facility_location', e.target.value)}
                className={`p-3 border rounded-lg ${theme.bg.input} ${errors.facility_location ? 'border-red-500' : theme.border.input}`}
                required
              />
              {errors.facility_location && (
                <p className="text-red-500 text-xs mt-1">{errors.facility_location}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.water_stress_area}
                onChange={(e) => handleInputChange('water_stress_area', e.target.checked)}
                className="rounded"
              />
              <label className={theme.text.primary}>Located in water stress area</label>
            </div>
          </div>
          <textarea
            placeholder="Water Conservation Initiatives"
            value={formData.water_conservation_initiatives}
            onChange={(e) => handleInputChange('water_conservation_initiatives', e.target.value)}
            className={`mt-4 w-full p-3 border rounded-lg ${theme.bg.input} ${theme.border.input}`}
            rows="3"
          />
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
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isSubmitting ? 'Saving...' : 'Save Water Data'}
          </button>
          {errors.submit && (
            <p className="text-red-500 text-sm">{errors.submit}</p>
          )}
        </div>
      </form>
    </div>
  );
};

export default WaterManagementForm;