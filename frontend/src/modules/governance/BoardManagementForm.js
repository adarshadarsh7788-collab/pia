import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useSector } from '../../contexts/SectorContext';
import { getThemeClasses } from '../../utils/themeUtils';
import { saveData } from '../../utils/storage';

const BoardManagementForm = ({ onSave, onClose }) => {
  const { isDark } = useTheme();
  const { currentSector, sectorConfig } = useSector();
  const theme = getThemeClasses(isDark);
  
  const getSectorFields = () => {
    const baseFields = {
      // Common governance fields
      total_board_members: '',
      independent_directors: '',
      executive_directors: '',
      non_executive_directors: '',
      female_directors: '',
      male_directors: '',
      board_meetings_held: '',
      average_attendance: '',
      board_evaluation_conducted: false,
      succession_planning: false,
      reporting_period: new Date().getFullYear(),
      governance_framework: ''
    };

    if (currentSector === 'healthcare') {
      return {
        ...baseFields,
        // Healthcare-specific governance
        medical_expertise: '',
        regulatory_expertise: '',
        patient_safety_expertise: '',
        clinical_research_expertise: '',
        ethics_committee_exists: false,
        patient_safety_committee_exists: false,
        clinical_governance_committee_exists: false,
        regulatory_compliance_score: '',
        patient_safety_governance_score: '',
        clinical_trial_oversight: false,
        drug_safety_policy: false,
        patient_privacy_policy: false,
        facility_name: '',
        facility_type: 'hospital'
      };
    } else if (currentSector === 'manufacturing') {
      return {
        ...baseFields,
        // Manufacturing-specific governance
        manufacturing_expertise: '',
        supply_chain_expertise: '',
        quality_management_expertise: '',
        technology_expertise: '',
        quality_committee_exists: false,
        supply_chain_committee_exists: false,
        innovation_committee_exists: false,
        quality_management_score: '',
        supply_chain_governance_score: '',
        product_safety_policy: false,
        supply_chain_policy: false,
        quality_assurance_policy: false,
        facility_name: '',
        facility_type: 'manufacturing_plant'
      };
    } else {
      return {
        ...baseFields,
        // Mining-specific governance
        mining_industry_expertise: '',
        environmental_expertise: '',
        safety_expertise: '',
        community_relations_expertise: '',
        geology_expertise: '',
        safety_committee_exists: false,
        environmental_committee_exists: false,
        community_relations_committee_exists: false,
        sustainability_committee_exists: false,
        climate_risk_disclosure_score: '',
        sustainability_governance_score: '',
        esg_reporting_frequency: '',
        climate_targets_set: false,
        tailings_management_policy: false,
        mine_closure_plan: false,
        community_engagement_policy: false,
        artisanal_mining_policy: false,
        mine_site_name: '',
        facility_type: 'mine_site'
      };
    }
  };

  const [formData, setFormData] = useState(getSectorFields());

  const [calculations, setCalculations] = useState({
    independence_ratio: 0,
    gender_diversity_ratio: 0,
    age_diversity_breakdown: { under_50: 0, between_50_65: 0, over_65: 0 },
    expertise_coverage: 0,
    attendance_rate: 0
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
    
    calculateGovernanceMetrics(updatedData);
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Required fields validation
    if (!formData.total_board_members || parseFloat(formData.total_board_members) <= 0) {
      newErrors.total_board_members = 'Total board members is required and must be greater than 0';
    }
    
    // Numeric validation
    const numericFields = [
      'total_board_members', 'independent_directors', 'executive_directors',
      'female_directors', 'male_directors', 'board_meetings_held'
    ];
    
    numericFields.forEach(field => {
      const value = formData[field];
      if (value !== '' && (isNaN(value) || parseFloat(value) < 0)) {
        newErrors[field] = 'Must be a positive number';
      }
    });
    
    // Business logic validation
    const totalMembers = parseFloat(formData.total_board_members) || 0;
    const independent = parseFloat(formData.independent_directors) || 0;
    const executive = parseFloat(formData.executive_directors) || 0;
    const nonExecutive = parseFloat(formData.non_executive_directors) || 0;
    
    if (totalMembers > 0 && (independent + executive + nonExecutive) > totalMembers) {
      newErrors.independent_directors = 'Total director types cannot exceed total board members';
    }
    
    // Gender validation
    const female = parseFloat(formData.female_directors) || 0;
    const male = parseFloat(formData.male_directors) || 0;
    
    if (totalMembers > 0 && (female + male) > totalMembers) {
      newErrors.female_directors = 'Total gender breakdown cannot exceed total board members';
    }
    
    // Percentage validation
    const percentageFields = ['climate_risk_disclosure_score', 'sustainability_governance_score', 'average_attendance'];
    percentageFields.forEach(field => {
      const value = formData[field];
      if (value !== '' && (parseFloat(value) < 0 || parseFloat(value) > 100)) {
        newErrors[field] = 'Must be between 0-100';
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateGovernanceMetrics = (data) => {
    const totalMembers = parseFloat(data.total_board_members) || 0;
    const independentDirectors = parseFloat(data.independent_directors) || 0;
    const femaleDirectors = parseFloat(data.female_directors) || 0;
    
    const independenceRatio = totalMembers > 0 ? (independentDirectors / totalMembers) * 100 : 0;
    const genderDiversityRatio = totalMembers > 0 ? (femaleDirectors / totalMembers) * 100 : 0;
    
    const under50 = parseFloat(data.directors_under_50) || 0;
    const between50_65 = parseFloat(data.directors_50_65) || 0;
    const over65 = parseFloat(data.directors_over_65) || 0;
    
    const expertiseCount = [
      data.financial_expertise,
      data.industry_expertise,
      data.technology_expertise,
      data.esg_expertise
    ].filter(exp => parseFloat(exp) > 0).length;
    
    const expertiseCoverage = (expertiseCount / 4) * 100;
    
    const attendanceRate = parseFloat(data.average_attendance) || 0;

    setCalculations({
      independence_ratio: independenceRatio,
      gender_diversity_ratio: genderDiversityRatio,
      age_diversity_breakdown: {
        under_50: totalMembers > 0 ? (under50 / totalMembers) * 100 : 0,
        between_50_65: totalMembers > 0 ? (between50_65 / totalMembers) * 100 : 0,
        over_65: totalMembers > 0 ? (over65 / totalMembers) * 100 : 0
      },
      expertise_coverage: expertiseCoverage,
      attendance_rate: attendanceRate
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    if (!validateForm()) {
      setIsSubmitting(false);
      return;
    }
    
    const boardData = {
      companyName: localStorage.getItem('companyName') || 'Company',
      category: 'governance',
      subcategory: 'board_management',
      governance: {
        board_independence_ratio: calculations.independence_ratio,
        board_gender_diversity: calculations.gender_diversity_ratio,
        board_expertise_coverage: calculations.expertise_coverage,
        board_attendance_rate: calculations.attendance_rate,
        ...formData
      },
      timestamp: new Date().toISOString(),
      reportingYear: formData.reporting_period
    };

    try {
      await saveData(boardData);
      onSave?.(boardData);
      onClose?.();
    } catch (error) {
      console.error('Error saving board data:', error);
      setErrors({ submit: 'Failed to save data. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`max-w-4xl mx-auto p-6 ${theme.bg.card} rounded-xl shadow-lg`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className={`text-2xl font-bold ${theme.text.primary}`}>{sectorConfig?.icon}⚖️ {sectorConfig?.name} Board Management</h2>
          <p className={`text-sm ${theme.text.secondary}`}>Track {sectorConfig?.name?.toLowerCase()} board composition and governance - GRI 2-9 & 405</p>
        </div>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Board Composition */}
        <div className={`p-4 rounded-lg border-l-4 border-purple-500 ${theme.bg.subtle}`}>
          <h3 className={`font-semibold ${theme.text.primary} mb-3`}>Board Composition</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <input
                type="number"
                placeholder="Total Board Members *"
                value={formData.total_board_members}
                onChange={(e) => handleInputChange('total_board_members', e.target.value)}
                className={`p-3 border rounded-lg ${theme.bg.input} ${errors.total_board_members ? 'border-red-500' : theme.border.input}`}
                required
              />
              {errors.total_board_members && (
                <p className="text-red-500 text-xs mt-1">{errors.total_board_members}</p>
              )}
            </div>
            <input
              type="number"
              placeholder="Independent Directors"
              value={formData.independent_directors}
              onChange={(e) => handleInputChange('independent_directors', e.target.value)}
              className={`p-3 border rounded-lg ${theme.bg.input} ${theme.border.input}`}
            />
            <input
              type="number"
              placeholder="Executive Directors"
              value={formData.executive_directors}
              onChange={(e) => handleInputChange('executive_directors', e.target.value)}
              className={`p-3 border rounded-lg ${theme.bg.input} ${theme.border.input}`}
            />
            <input
              type="number"
              placeholder="Non-Executive Directors"
              value={formData.non_executive_directors}
              onChange={(e) => handleInputChange('non_executive_directors', e.target.value)}
              className={`p-3 border rounded-lg ${theme.bg.input} ${theme.border.input}`}
            />
          </div>
          <div className="mt-3 text-right">
            <span className={`font-bold ${theme.text.primary}`}>
              Independence Ratio: {calculations.independence_ratio.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Board Diversity */}
        <div className={`p-4 rounded-lg border-l-4 border-blue-500 ${theme.bg.subtle}`}>
          <h3 className={`font-semibold ${theme.text.primary} mb-3`}>Board Diversity</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="number"
              placeholder="Female Directors"
              value={formData.female_directors}
              onChange={(e) => handleInputChange('female_directors', e.target.value)}
              className={`p-3 border rounded-lg ${theme.bg.input} ${theme.border.input}`}
            />
            <input
              type="number"
              placeholder="Male Directors"
              value={formData.male_directors}
              onChange={(e) => handleInputChange('male_directors', e.target.value)}
              className={`p-3 border rounded-lg ${theme.bg.input} ${theme.border.input}`}
            />
            <input
              type="number"
              placeholder="Minority Directors"
              value={formData.minority_directors}
              onChange={(e) => handleInputChange('minority_directors', e.target.value)}
              className={`p-3 border rounded-lg ${theme.bg.input} ${theme.border.input}`}
            />
          </div>
          <div className="mt-3 text-right">
            <span className={`font-bold ${theme.text.primary}`}>
              Gender Diversity: {calculations.gender_diversity_ratio.toFixed(1)}% Female
            </span>
          </div>
        </div>

        {/* Sector-Specific Board Expertise */}
        {currentSector === 'healthcare' && (
          <div className={`p-4 rounded-lg border-l-4 border-pink-500 ${theme.bg.subtle}`}>
            <h3 className={`font-semibold ${theme.text.primary} mb-3`}>Healthcare Board Expertise (Number of Directors)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="number"
                placeholder="Medical Expertise"
                value={formData.medical_expertise}
                onChange={(e) => handleInputChange('medical_expertise', e.target.value)}
                className={`p-3 border rounded-lg ${theme.bg.input} ${theme.border.input}`}
              />
              <input
                type="number"
                placeholder="Regulatory Expertise"
                value={formData.regulatory_expertise}
                onChange={(e) => handleInputChange('regulatory_expertise', e.target.value)}
                className={`p-3 border rounded-lg ${theme.bg.input} ${theme.border.input}`}
              />
              <input
                type="number"
                placeholder="Patient Safety Expertise"
                value={formData.patient_safety_expertise}
                onChange={(e) => handleInputChange('patient_safety_expertise', e.target.value)}
                className={`p-3 border rounded-lg ${theme.bg.input} ${theme.border.input}`}
              />
              <input
                type="number"
                placeholder="Clinical Research Expertise"
                value={formData.clinical_research_expertise}
                onChange={(e) => handleInputChange('clinical_research_expertise', e.target.value)}
                className={`p-3 border rounded-lg ${theme.bg.input} ${theme.border.input}`}
              />
            </div>
          </div>
        )}

        {currentSector === 'manufacturing' && (
          <div className={`p-4 rounded-lg border-l-4 border-blue-500 ${theme.bg.subtle}`}>
            <h3 className={`font-semibold ${theme.text.primary} mb-3`}>Manufacturing Board Expertise (Number of Directors)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="number"
                placeholder="Manufacturing Expertise"
                value={formData.manufacturing_expertise}
                onChange={(e) => handleInputChange('manufacturing_expertise', e.target.value)}
                className={`p-3 border rounded-lg ${theme.bg.input} ${theme.border.input}`}
              />
              <input
                type="number"
                placeholder="Supply Chain Expertise"
                value={formData.supply_chain_expertise}
                onChange={(e) => handleInputChange('supply_chain_expertise', e.target.value)}
                className={`p-3 border rounded-lg ${theme.bg.input} ${theme.border.input}`}
              />
              <input
                type="number"
                placeholder="Quality Management Expertise"
                value={formData.quality_management_expertise}
                onChange={(e) => handleInputChange('quality_management_expertise', e.target.value)}
                className={`p-3 border rounded-lg ${theme.bg.input} ${theme.border.input}`}
              />
              <input
                type="number"
                placeholder="Technology Expertise"
                value={formData.technology_expertise}
                onChange={(e) => handleInputChange('technology_expertise', e.target.value)}
                className={`p-3 border rounded-lg ${theme.bg.input} ${theme.border.input}`}
              />
            </div>
          </div>
        )}

        {currentSector === 'mining' && (
          <div className={`p-4 rounded-lg border-l-4 border-amber-500 ${theme.bg.subtle}`}>
            <h3 className={`font-semibold ${theme.text.primary} mb-3`}>Mining Board Expertise (Number of Directors)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="number"
                placeholder="Mining Industry Expertise"
                value={formData.mining_industry_expertise}
                onChange={(e) => handleInputChange('mining_industry_expertise', e.target.value)}
                className={`p-3 border rounded-lg ${theme.bg.input} ${theme.border.input}`}
              />
              <input
                type="number"
                placeholder="Environmental Expertise"
                value={formData.environmental_expertise}
                onChange={(e) => handleInputChange('environmental_expertise', e.target.value)}
                className={`p-3 border rounded-lg ${theme.bg.input} ${theme.border.input}`}
              />
              <input
                type="number"
                placeholder="Safety Expertise"
                value={formData.safety_expertise}
                onChange={(e) => handleInputChange('safety_expertise', e.target.value)}
                className={`p-3 border rounded-lg ${theme.bg.input} ${theme.border.input}`}
              />
              <input
                type="number"
                placeholder="Community Relations Expertise"
                value={formData.community_relations_expertise}
                onChange={(e) => handleInputChange('community_relations_expertise', e.target.value)}
                className={`p-3 border rounded-lg ${theme.bg.input} ${theme.border.input}`}
              />
              <input
                type="number"
                placeholder="Geology/Technical Expertise"
                value={formData.geology_expertise}
                onChange={(e) => handleInputChange('geology_expertise', e.target.value)}
                className={`p-3 border rounded-lg ${theme.bg.input} ${theme.border.input}`}
              />
            </div>
          </div>
        )}

        {/* Sector-Specific Governance Committees */}
        {currentSector === 'healthcare' && (
          <div className={`p-4 rounded-lg border-l-4 border-pink-500 ${theme.bg.subtle}`}>
            <h3 className={`font-semibold ${theme.text.primary} mb-3`}>Healthcare Governance Committees</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.ethics_committee_exists}
                  onChange={(e) => handleInputChange('ethics_committee_exists', e.target.checked)}
                  className="rounded"
                />
                <label className={theme.text.primary}>Ethics Committee</label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.patient_safety_committee_exists}
                  onChange={(e) => handleInputChange('patient_safety_committee_exists', e.target.checked)}
                  className="rounded"
                />
                <label className={theme.text.primary}>Patient Safety Committee</label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.clinical_governance_committee_exists}
                  onChange={(e) => handleInputChange('clinical_governance_committee_exists', e.target.checked)}
                  className="rounded"
                />
                <label className={theme.text.primary}>Clinical Governance Committee</label>
              </div>
            </div>
          </div>
        )}

        {currentSector === 'manufacturing' && (
          <div className={`p-4 rounded-lg border-l-4 border-blue-500 ${theme.bg.subtle}`}>
            <h3 className={`font-semibold ${theme.text.primary} mb-3`}>Manufacturing Governance Committees</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.quality_committee_exists}
                  onChange={(e) => handleInputChange('quality_committee_exists', e.target.checked)}
                  className="rounded"
                />
                <label className={theme.text.primary}>Quality Committee</label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.supply_chain_committee_exists}
                  onChange={(e) => handleInputChange('supply_chain_committee_exists', e.target.checked)}
                  className="rounded"
                />
                <label className={theme.text.primary}>Supply Chain Committee</label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.innovation_committee_exists}
                  onChange={(e) => handleInputChange('innovation_committee_exists', e.target.checked)}
                  className="rounded"
                />
                <label className={theme.text.primary}>Innovation Committee</label>
              </div>
            </div>
          </div>
        )}

        {currentSector === 'mining' && (
          <div className={`p-4 rounded-lg border-l-4 border-amber-500 ${theme.bg.subtle}`}>
            <h3 className={`font-semibold ${theme.text.primary} mb-3`}>Mining Governance Committees</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.safety_committee_exists}
                  onChange={(e) => handleInputChange('safety_committee_exists', e.target.checked)}
                  className="rounded"
                />
                <label className={theme.text.primary}>Safety Committee</label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.environmental_committee_exists}
                  onChange={(e) => handleInputChange('environmental_committee_exists', e.target.checked)}
                  className="rounded"
                />
                <label className={theme.text.primary}>Environmental Committee</label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.community_relations_committee_exists}
                  onChange={(e) => handleInputChange('community_relations_committee_exists', e.target.checked)}
                  className="rounded"
                />
                <label className={theme.text.primary}>Community Relations Committee</label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.sustainability_committee_exists}
                  onChange={(e) => handleInputChange('sustainability_committee_exists', e.target.checked)}
                  className="rounded"
                />
                <label className={theme.text.primary}>Sustainability Committee</label>
              </div>
            </div>
          </div>
        )}

        {/* Climate & Sustainability Governance - IFRS S1 & S2 */}
        <div className={`p-4 rounded-lg border-l-4 border-indigo-500 ${theme.bg.subtle}`}>
          <h3 className={`font-semibold ${theme.text.primary} mb-3`}>Climate & Sustainability Governance - IFRS S1 & S2</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="number"
              placeholder="Climate Risk Disclosure Score (0-100)"
              value={formData.climate_risk_disclosure_score}
              onChange={(e) => handleInputChange('climate_risk_disclosure_score', e.target.value)}
              className={`p-3 border rounded-lg ${theme.bg.input} ${theme.border.input}`}
            />
            <input
              type="number"
              placeholder="Sustainability Governance Score (0-100)"
              value={formData.sustainability_governance_score}
              onChange={(e) => handleInputChange('sustainability_governance_score', e.target.value)}
              className={`p-3 border rounded-lg ${theme.bg.input} ${theme.border.input}`}
            />
            <input
              type="text"
              placeholder="ESG Reporting Frequency"
              value={formData.esg_reporting_frequency}
              onChange={(e) => handleInputChange('esg_reporting_frequency', e.target.value)}
              className={`p-3 border rounded-lg ${theme.bg.input} ${theme.border.input}`}
            />
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.climate_targets_set}
                onChange={(e) => handleInputChange('climate_targets_set', e.target.checked)}
                className="rounded"
              />
              <label className={theme.text.primary}>Climate Targets Set</label>
            </div>
          </div>
        </div>

        {/* Board Activities */}
        <div className={`p-4 rounded-lg border-l-4 border-orange-500 ${theme.bg.subtle}`}>
          <h3 className={`font-semibold ${theme.text.primary} mb-3`}>Board Activities</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="number"
              placeholder="Board Meetings Held"
              value={formData.board_meetings_held}
              onChange={(e) => handleInputChange('board_meetings_held', e.target.value)}
              className={`p-3 border rounded-lg ${theme.bg.input} ${theme.border.input}`}
            />
            <input
              type="number"
              placeholder="Average Attendance (%)"
              value={formData.average_attendance}
              onChange={(e) => handleInputChange('average_attendance', e.target.value)}
              className={`p-3 border rounded-lg ${theme.bg.input} ${theme.border.input}`}
            />
            <input
              type="number"
              placeholder="Number of Committees"
              value={formData.committees_count}
              onChange={(e) => handleInputChange('committees_count', e.target.value)}
              className={`p-3 border rounded-lg ${theme.bg.input} ${theme.border.input}`}
            />
          </div>
        </div>

        {/* Mining-Specific Policies */}
        <div className={`p-4 rounded-lg border-l-4 border-red-500 ${theme.bg.subtle}`}>
          <h3 className={`font-semibold ${theme.text.primary} mb-3`}>Mining-Specific Policies</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.tailings_management_policy}
                onChange={(e) => handleInputChange('tailings_management_policy', e.target.checked)}
                className="rounded"
              />
              <label className={theme.text.primary}>Tailings Management Policy</label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.mine_closure_plan}
                onChange={(e) => handleInputChange('mine_closure_plan', e.target.checked)}
                className="rounded"
              />
              <label className={theme.text.primary}>Mine Closure Plan</label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.community_engagement_policy}
                onChange={(e) => handleInputChange('community_engagement_policy', e.target.checked)}
                className="rounded"
              />
              <label className={theme.text.primary}>Community Engagement Policy</label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.artisanal_mining_policy}
                onChange={(e) => handleInputChange('artisanal_mining_policy', e.target.checked)}
                className="rounded"
              />
              <label className={theme.text.primary}>Artisanal Mining Policy</label>
            </div>
          </div>
        </div>

        {/* Mine Site Information */}
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
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.board_evaluation_conducted}
                onChange={(e) => handleInputChange('board_evaluation_conducted', e.target.checked)}
                className="rounded"
              />
              <label className={theme.text.primary}>Board Evaluation Conducted</label>
            </div>
          </div>
          <textarea
            placeholder="Governance Framework Description"
            value={formData.governance_framework}
            onChange={(e) => handleInputChange('governance_framework', e.target.value)}
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
                : 'bg-purple-600 hover:bg-purple-700'
            }`}
          >
            {isSubmitting ? 'Saving...' : 'Save Board Data'}
          </button>
          {errors.submit && (
            <p className="text-red-500 text-sm">{errors.submit}</p>
          )}
        </div>
      </form>
    </div>
  );
};

export default BoardManagementForm;