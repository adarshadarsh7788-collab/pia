import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { getThemeClasses } from '../../utils/themeUtils';
import { saveData } from '../../utils/storage';

const BoardManagementForm = ({ onSave, onClose }) => {
  const { isDark } = useTheme();
  const theme = getThemeClasses(isDark);
  
  const [formData, setFormData] = useState({
    // Mining Board Composition (GRI-2-9, IFRS-S1)
    total_board_members: '',
    independent_directors: '',
    executive_directors: '',
    non_executive_directors: '',
    
    // Diversity Metrics (GRI-405-1)
    female_directors: '',
    male_directors: '',
    local_directors: '',
    
    // Mining-Specific Expertise
    mining_industry_expertise: '',
    environmental_expertise: '',
    safety_expertise: '',
    community_relations_expertise: '',
    geology_expertise: '',
    
    // Mining Governance Committees
    safety_committee_exists: false,
    environmental_committee_exists: false,
    community_relations_committee_exists: false,
    sustainability_committee_exists: false,
    
    // Climate & Sustainability Governance (IFRS-S1, IFRS-S2)
    climate_risk_disclosure_score: '',
    sustainability_governance_score: '',
    esg_reporting_frequency: '',
    climate_targets_set: false,
    
    // Board Activities
    board_meetings_held: '',
    safety_committee_meetings: '',
    environmental_committee_meetings: '',
    average_attendance: '',
    
    // Mining-Specific Policies
    tailings_management_policy: false,
    mine_closure_plan: false,
    community_engagement_policy: false,
    artisanal_mining_policy: false,
    
    // Additional Information
    board_evaluation_conducted: false,
    succession_planning: false,
    reporting_period: new Date().getFullYear(),
    mine_site_name: '',
    governance_framework: ''
  });

  const [calculations, setCalculations] = useState({
    independence_ratio: 0,
    gender_diversity_ratio: 0,
    age_diversity_breakdown: { under_50: 0, between_50_65: 0, over_65: 0 },
    expertise_coverage: 0,
    attendance_rate: 0
  });

  const handleInputChange = (field, value) => {
    const updatedData = { ...formData, [field]: value };
    setFormData(updatedData);
    calculateGovernanceMetrics(updatedData);
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
    }
  };

  return (
    <div className={`max-w-4xl mx-auto p-6 ${theme.bg.card} rounded-xl shadow-lg`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className={`text-2xl font-bold ${theme.text.primary}`}>⛏️⚖️ Mining Governance & Board</h2>
          <p className={`text-sm ${theme.text.secondary}`}>Track mining board composition and climate governance - IFRS S1 & S2</p>
        </div>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Board Composition */}
        <div className={`p-4 rounded-lg border-l-4 border-purple-500 ${theme.bg.subtle}`}>
          <h3 className={`font-semibold ${theme.text.primary} mb-3`}>Board Composition</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="number"
              placeholder="Total Board Members"
              value={formData.total_board_members}
              onChange={(e) => handleInputChange('total_board_members', e.target.value)}
              className={`p-3 border rounded-lg ${theme.bg.input} ${theme.border.input}`}
            />
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

        {/* Mining-Specific Board Expertise */}
        <div className={`p-4 rounded-lg border-l-4 border-green-500 ${theme.bg.subtle}`}>
          <h3 className={`font-semibold ${theme.text.primary} mb-3`}>Mining-Specific Board Expertise (Number of Directors)</h3>
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

        {/* Mining Governance Committees */}
        <div className={`p-4 rounded-lg border-l-4 border-yellow-500 ${theme.bg.subtle}`}>
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
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Save Board Data
          </button>
        </div>
      </form>
    </div>
  );
};

export default BoardManagementForm;