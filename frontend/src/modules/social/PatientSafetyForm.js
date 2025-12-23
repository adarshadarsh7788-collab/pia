import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { getThemeClasses } from '../../utils/themeUtils';
import { saveData } from '../../utils/storage';

const PatientSafetyForm = ({ onSave, onClose }) => {
  const { isDark } = useTheme();
  const theme = getThemeClasses(isDark);
  
  const [formData, setFormData] = useState({
    // Patient Safety Incidents (SASB-HC-MS-250a.1)
    patient_safety_incidents: '',
    adverse_events: '',
    medication_errors: '',
    healthcare_associated_infections: '',
    patient_falls: '',
    
    // Quality Metrics (GRI-416)
    patient_satisfaction_score: '',
    readmission_rate: '',
    mortality_rate: '',
    length_of_stay: '',
    
    // Healthcare Access (SASB-HC-DL-240a.1)
    patients_served: '',
    underserved_populations: '',
    charity_care_provided: '',
    emergency_department_visits: '',
    
    // Clinical Quality
    infection_control_compliance: '',
    hand_hygiene_compliance: '',
    surgical_site_infections: '',
    central_line_infections: '',
    
    // Staff Safety
    healthcare_worker_injuries: '',
    needlestick_injuries: '',
    workplace_violence_incidents: '',
    staff_turnover_rate: '',
    
    // Medical Device Safety
    device_recalls: '',
    device_malfunctions: '',
    device_related_incidents: '',
    
    // Pharmaceutical Safety
    drug_recalls: '',
    adverse_drug_reactions: '',
    medication_reconciliation_rate: '',
    
    // Additional Information
    reporting_period: new Date().getFullYear(),
    facility_name: '',
    facility_type: '',
    bed_count: '',
    accreditation_status: ''
  });

  const [calculations, setCalculations] = useState({
    incident_rate_per_1000: 0,
    safety_score: 0,
    quality_index: 0,
    access_score: 0
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
    
    calculateHealthcareMetrics(updatedData);
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Required fields validation
    if (!formData.facility_name.trim()) {
      newErrors.facility_name = 'Facility name is required';
    }
    
    if (!formData.facility_type.trim()) {
      newErrors.facility_type = 'Facility type is required';
    }
    
    // Numeric validation
    const numericFields = [
      'patient_safety_incidents', 'adverse_events', 'medication_errors',
      'patients_served', 'bed_count', 'readmission_rate', 'mortality_rate'
    ];
    
    numericFields.forEach(field => {
      const value = formData[field];
      if (value !== '' && (isNaN(value) || parseFloat(value) < 0)) {
        newErrors[field] = 'Must be a positive number';
      }
    });
    
    // Percentage validation
    const percentageFields = [
      'patient_satisfaction_score', 'infection_control_compliance', 
      'hand_hygiene_compliance', 'staff_turnover_rate'
    ];
    
    percentageFields.forEach(field => {
      const value = formData[field];
      if (value !== '' && (parseFloat(value) < 0 || parseFloat(value) > 100)) {
        newErrors[field] = 'Must be between 0-100';
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateHealthcareMetrics = (data) => {
    const patientsServed = parseFloat(data.patients_served) || 0;
    const safetyIncidents = parseFloat(data.patient_safety_incidents) || 0;
    
    const incidentRatePer1000 = patientsServed > 0 ? (safetyIncidents / patientsServed) * 1000 : 0;
    
    // Calculate safety score based on multiple factors
    const satisfactionScore = parseFloat(data.patient_satisfaction_score) || 0;
    const infectionCompliance = parseFloat(data.infection_control_compliance) || 0;
    const hygieneCompliance = parseFloat(data.hand_hygiene_compliance) || 0;
    
    const safetyScore = (satisfactionScore + infectionCompliance + hygieneCompliance) / 3;
    
    // Quality index
    const readmissionRate = parseFloat(data.readmission_rate) || 0;
    const mortalityRate = parseFloat(data.mortality_rate) || 0;
    const qualityIndex = Math.max(0, 100 - (readmissionRate * 2) - (mortalityRate * 5));
    
    // Access score
    const underservedPop = parseFloat(data.underserved_populations) || 0;
    const charityCare = parseFloat(data.charity_care_provided) || 0;
    const accessScore = patientsServed > 0 ? ((underservedPop + charityCare) / patientsServed) * 100 : 0;

    setCalculations({
      incident_rate_per_1000: incidentRatePer1000,
      safety_score: safetyScore,
      quality_index: qualityIndex,
      access_score: accessScore
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    if (!validateForm()) {
      setIsSubmitting(false);
      return;
    }
    
    const patientSafetyData = {
      companyName: localStorage.getItem('companyName') || 'Healthcare Facility',
      category: 'social',
      subcategory: 'patient_safety',
      social: {
        incident_rate_per_1000_patients: calculations.incident_rate_per_1000,
        overall_safety_score: calculations.safety_score,
        quality_index: calculations.quality_index,
        healthcare_access_score: calculations.access_score,
        ...formData
      },
      timestamp: new Date().toISOString(),
      reportingYear: formData.reporting_period
    };

    try {
      await saveData(patientSafetyData);
      onSave?.(patientSafetyData);
      onClose?.();
    } catch (error) {
      console.error('Error saving patient safety data:', error);
      setErrors({ submit: 'Failed to save data. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`max-w-4xl mx-auto p-6 ${theme.bg.card} rounded-xl shadow-lg`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className={`text-2xl font-bold ${theme.text.primary}`}>🏥 Patient Safety Management</h2>
          <p className={`text-sm ${theme.text.secondary}`}>Track patient safety incidents and quality metrics - SASB-HC-MS & GRI-416</p>
        </div>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Patient Safety Incidents */}
        <div className={`p-4 rounded-lg border-l-4 border-red-500 ${theme.bg.subtle}`}>
          <h3 className={`font-semibold ${theme.text.primary} mb-3`}>Patient Safety Incidents - SASB-HC-MS-250a.1</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="number"
              placeholder="Patient Safety Incidents"
              value={formData.patient_safety_incidents}
              onChange={(e) => handleInputChange('patient_safety_incidents', e.target.value)}
              className={`p-3 border rounded-lg ${theme.bg.input} ${theme.border.input}`}
            />
            <input
              type="number"
              placeholder="Adverse Events"
              value={formData.adverse_events}
              onChange={(e) => handleInputChange('adverse_events', e.target.value)}
              className={`p-3 border rounded-lg ${theme.bg.input} ${theme.border.input}`}
            />
            <input
              type="number"
              placeholder="Medication Errors"
              value={formData.medication_errors}
              onChange={(e) => handleInputChange('medication_errors', e.target.value)}
              className={`p-3 border rounded-lg ${theme.bg.input} ${theme.border.input}`}
            />
            <input
              type="number"
              placeholder="Healthcare-Associated Infections"
              value={formData.healthcare_associated_infections}
              onChange={(e) => handleInputChange('healthcare_associated_infections', e.target.value)}
              className={`p-3 border rounded-lg ${theme.bg.input} ${theme.border.input}`}
            />
          </div>
          <div className="mt-3 text-right">
            <span className={`font-bold ${theme.text.primary}`}>
              Incident Rate: {calculations.incident_rate_per_1000.toFixed(2)} per 1,000 patients
            </span>
          </div>
        </div>

        {/* Quality Metrics */}
        <div className={`p-4 rounded-lg border-l-4 border-blue-500 ${theme.bg.subtle}`}>
          <h3 className={`font-semibold ${theme.text.primary} mb-3`}>Quality Metrics - GRI-416</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="number"
              placeholder="Patient Satisfaction Score (%)"
              value={formData.patient_satisfaction_score}
              onChange={(e) => handleInputChange('patient_satisfaction_score', e.target.value)}
              className={`p-3 border rounded-lg ${theme.bg.input} ${theme.border.input}`}
            />
            <input
              type="number"
              placeholder="Readmission Rate (%)"
              value={formData.readmission_rate}
              onChange={(e) => handleInputChange('readmission_rate', e.target.value)}
              className={`p-3 border rounded-lg ${theme.bg.input} ${theme.border.input}`}
            />
            <input
              type="number"
              placeholder="Mortality Rate (%)"
              value={formData.mortality_rate}
              onChange={(e) => handleInputChange('mortality_rate', e.target.value)}
              className={`p-3 border rounded-lg ${theme.bg.input} ${theme.border.input}`}
            />
            <input
              type="number"
              placeholder="Average Length of Stay (days)"
              value={formData.length_of_stay}
              onChange={(e) => handleInputChange('length_of_stay', e.target.value)}
              className={`p-3 border rounded-lg ${theme.bg.input} ${theme.border.input}`}
            />
          </div>
          <div className="mt-3 text-right">
            <span className={`font-bold ${theme.text.primary}`}>
              Quality Index: {calculations.quality_index.toFixed(1)}
            </span>
          </div>
        </div>

        {/* Healthcare Access */}
        <div className={`p-4 rounded-lg border-l-4 border-green-500 ${theme.bg.subtle}`}>
          <h3 className={`font-semibold ${theme.text.primary} mb-3`}>Healthcare Access - SASB-HC-DL-240a.1</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="number"
              placeholder="Total Patients Served"
              value={formData.patients_served}
              onChange={(e) => handleInputChange('patients_served', e.target.value)}
              className={`p-3 border rounded-lg ${theme.bg.input} ${theme.border.input}`}
            />
            <input
              type="number"
              placeholder="Underserved Populations"
              value={formData.underserved_populations}
              onChange={(e) => handleInputChange('underserved_populations', e.target.value)}
              className={`p-3 border rounded-lg ${theme.bg.input} ${theme.border.input}`}
            />
            <input
              type="number"
              placeholder="Charity Care Provided ($)"
              value={formData.charity_care_provided}
              onChange={(e) => handleInputChange('charity_care_provided', e.target.value)}
              className={`p-3 border rounded-lg ${theme.bg.input} ${theme.border.input}`}
            />
            <input
              type="number"
              placeholder="Emergency Department Visits"
              value={formData.emergency_department_visits}
              onChange={(e) => handleInputChange('emergency_department_visits', e.target.value)}
              className={`p-3 border rounded-lg ${theme.bg.input} ${theme.border.input}`}
            />
          </div>
          <div className="mt-3 text-right">
            <span className={`font-bold ${theme.text.primary}`}>
              Access Score: {calculations.access_score.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Infection Control */}
        <div className={`p-4 rounded-lg border-l-4 border-purple-500 ${theme.bg.subtle}`}>
          <h3 className={`font-semibold ${theme.text.primary} mb-3`}>Infection Control</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="number"
              placeholder="Infection Control Compliance (%)"
              value={formData.infection_control_compliance}
              onChange={(e) => handleInputChange('infection_control_compliance', e.target.value)}
              className={`p-3 border rounded-lg ${theme.bg.input} ${theme.border.input}`}
            />
            <input
              type="number"
              placeholder="Hand Hygiene Compliance (%)"
              value={formData.hand_hygiene_compliance}
              onChange={(e) => handleInputChange('hand_hygiene_compliance', e.target.value)}
              className={`p-3 border rounded-lg ${theme.bg.input} ${theme.border.input}`}
            />
            <input
              type="number"
              placeholder="Surgical Site Infections"
              value={formData.surgical_site_infections}
              onChange={(e) => handleInputChange('surgical_site_infections', e.target.value)}
              className={`p-3 border rounded-lg ${theme.bg.input} ${theme.border.input}`}
            />
            <input
              type="number"
              placeholder="Central Line Infections"
              value={formData.central_line_infections}
              onChange={(e) => handleInputChange('central_line_infections', e.target.value)}
              className={`p-3 border rounded-lg ${theme.bg.input} ${theme.border.input}`}
            />
          </div>
        </div>

        {/* Staff Safety */}
        <div className={`p-4 rounded-lg border-l-4 border-orange-500 ${theme.bg.subtle}`}>
          <h3 className={`font-semibold ${theme.text.primary} mb-3`}>Healthcare Worker Safety</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="number"
              placeholder="Healthcare Worker Injuries"
              value={formData.healthcare_worker_injuries}
              onChange={(e) => handleInputChange('healthcare_worker_injuries', e.target.value)}
              className={`p-3 border rounded-lg ${theme.bg.input} ${theme.border.input}`}
            />
            <input
              type="number"
              placeholder="Needlestick Injuries"
              value={formData.needlestick_injuries}
              onChange={(e) => handleInputChange('needlestick_injuries', e.target.value)}
              className={`p-3 border rounded-lg ${theme.bg.input} ${theme.border.input}`}
            />
            <input
              type="number"
              placeholder="Workplace Violence Incidents"
              value={formData.workplace_violence_incidents}
              onChange={(e) => handleInputChange('workplace_violence_incidents', e.target.value)}
              className={`p-3 border rounded-lg ${theme.bg.input} ${theme.border.input}`}
            />
            <input
              type="number"
              placeholder="Staff Turnover Rate (%)"
              value={formData.staff_turnover_rate}
              onChange={(e) => handleInputChange('staff_turnover_rate', e.target.value)}
              className={`p-3 border rounded-lg ${theme.bg.input} ${theme.border.input}`}
            />
          </div>
        </div>

        {/* Facility Information */}
        <div className={`p-4 rounded-lg ${theme.bg.subtle}`}>
          <h3 className={`font-semibold ${theme.text.primary} mb-3`}>Facility Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <input
                type="text"
                placeholder="Facility Name *"
                value={formData.facility_name}
                onChange={(e) => handleInputChange('facility_name', e.target.value)}
                className={`p-3 border rounded-lg ${theme.bg.input} ${errors.facility_name ? 'border-red-500' : theme.border.input}`}
                required
              />
              {errors.facility_name && (
                <p className="text-red-500 text-xs mt-1">{errors.facility_name}</p>
              )}
            </div>
            <div>
              <select
                value={formData.facility_type}
                onChange={(e) => handleInputChange('facility_type', e.target.value)}
                className={`p-3 border rounded-lg ${theme.bg.input} ${errors.facility_type ? 'border-red-500' : theme.border.input}`}
                required
              >
                <option value="">Select Facility Type *</option>
                <option value="hospital">Hospital</option>
                <option value="clinic">Clinic</option>
                <option value="nursing_home">Nursing Home</option>
                <option value="ambulatory">Ambulatory Care</option>
                <option value="specialty">Specialty Care</option>
              </select>
              {errors.facility_type && (
                <p className="text-red-500 text-xs mt-1">{errors.facility_type}</p>
              )}
            </div>
            <input
              type="number"
              placeholder="Bed Count"
              value={formData.bed_count}
              onChange={(e) => handleInputChange('bed_count', e.target.value)}
              className={`p-3 border rounded-lg ${theme.bg.input} ${theme.border.input}`}
            />
            <input
              type="text"
              placeholder="Accreditation Status"
              value={formData.accreditation_status}
              onChange={(e) => handleInputChange('accreditation_status', e.target.value)}
              className={`p-3 border rounded-lg ${theme.bg.input} ${theme.border.input}`}
            />
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
                : 'bg-pink-600 hover:bg-pink-700'
            }`}
          >
            {isSubmitting ? 'Saving...' : 'Save Patient Safety Data'}
          </button>
          {errors.submit && (
            <p className="text-red-500 text-sm">{errors.submit}</p>
          )}
        </div>
      </form>
    </div>
  );
};

export default PatientSafetyForm;