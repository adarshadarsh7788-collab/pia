import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { getThemeClasses } from '../../utils/themeUtils';
import { saveData } from '../../utils/storage';

const WaterManagementForm = ({ onSave, onClose }) => {
  const { isDark } = useTheme();
  const theme = getThemeClasses(isDark);
  
  const [formData, setFormData] = useState({
    // Mining Water Withdrawal (GRI-303-3)
    surface_water_withdrawal: '',
    groundwater_withdrawal: '',
    municipal_water_withdrawal: '',
    rainwater_harvested: '',
    
    // Mining Water Discharge (GRI-303-4)
    treated_wastewater_discharge: '',
    untreated_wastewater_discharge: '',
    mine_water_discharge: '',
    tailings_water_discharge: '',
    
    // Mining Water Recycling (GRI-303-5)
    water_recycled: '',
    water_reused: '',
    process_water_recycled: '',
    
    // Mining-Specific Metrics
    water_used_in_processing: '',
    water_used_in_dust_suppression: '',
    tailings_dam_water_storage: '',
    acid_mine_drainage_volume: '',
    
    // Water Quality
    water_quality_parameters: '',
    treatment_efficiency: '',
    
    // Additional Information
    water_stress_area: false,
    water_conservation_initiatives: '',
    reporting_period: new Date().getFullYear(),
    facility_location: '',
    mine_site_name: ''
  });

  const [calculations, setCalculations] = useState({
    total_withdrawal: 0,
    total_discharge: 0,
    total_recycled: 0,
    water_intensity: 0,
    recycling_rate: 0
  });

  const handleInputChange = (field, value) => {
    const updatedData = { ...formData, [field]: value };
    setFormData(updatedData);
    calculateWaterMetrics(updatedData);
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
      onSave?.(waterData);
      onClose?.();
    } catch (error) {
      console.error('Error saving water data:', error);
    }
  };

  return (
    <div className={`max-w-4xl mx-auto p-6 ${theme.bg.card} rounded-xl shadow-lg`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className={`text-2xl font-bold ${theme.text.primary}`}>⛏️💧 Mining Water Management</h2>
          <p className={`text-sm ${theme.text.secondary}`}>Track mining water withdrawal, discharge, and recycling - GRI 303</p>
        </div>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Water Withdrawal */}
        <div className={`p-4 rounded-lg border-l-4 border-blue-500 ${theme.bg.subtle}`}>
          <h3 className={`font-semibold ${theme.text.primary} mb-3`}>Water Withdrawal (cubic meters)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="number"
              placeholder="Surface Water"
              value={formData.surface_water_withdrawal}
              onChange={(e) => handleInputChange('surface_water_withdrawal', e.target.value)}
              className={`p-3 border rounded-lg ${theme.bg.input} ${theme.border.input}`}
            />
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

        {/* Mining-Specific Water Usage */}
        <div className={`p-4 rounded-lg border-l-4 border-purple-500 ${theme.bg.subtle}`}>
          <h3 className={`font-semibold ${theme.text.primary} mb-3`}>Mining Operations Water Use (m³)</h3>
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
          <h3 className={`font-semibold ${theme.text.primary} mb-3`}>Mine Site Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Mine Site Name"
              value={formData.mine_site_name}
              onChange={(e) => handleInputChange('mine_site_name', e.target.value)}
              className={`p-3 border rounded-lg ${theme.bg.input} ${theme.border.input}`}
            />
            <input
              type="text"
              placeholder="Mine Location (Region/Country)"
              value={formData.facility_location}
              onChange={(e) => handleInputChange('facility_location', e.target.value)}
              className={`p-3 border rounded-lg ${theme.bg.input} ${theme.border.input}`}
            />
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
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Save Water Data
          </button>
        </div>
      </form>
    </div>
  );
};

export default WaterManagementForm;