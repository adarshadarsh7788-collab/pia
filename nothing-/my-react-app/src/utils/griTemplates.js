// GRI Standards Templates - Complete Implementation
// GRI 102, 200, 300, 400, and GRI 14 (Mining)

export const GRI_TEMPLATES = {
  'GRI-102': {
    name: 'GRI 102: General Disclosures',
    description: 'Organizational profile, strategy, ethics, and governance',
    category: 'general',
    sections: {
      'organizational_profile': {
        title: 'Organizational Profile',
        fields: [
          { id: 'org_name', label: 'Organization Name', code: 'GRI 102-1', required: true },
          { id: 'activities', label: 'Activities, Brands, Products, Services', code: 'GRI 102-2', required: true },
          { id: 'headquarters', label: 'Location of Headquarters', code: 'GRI 102-3', required: true },
          { id: 'operations', label: 'Location of Operations', code: 'GRI 102-4', required: true },
          { id: 'ownership', label: 'Ownership and Legal Form', code: 'GRI 102-5', required: true },
          { id: 'markets', label: 'Markets Served', code: 'GRI 102-6', required: true },
          { id: 'scale', label: 'Scale of Organization', code: 'GRI 102-7', required: true },
          { id: 'employees', label: 'Information on Employees', code: 'GRI 102-8', required: true },
          { id: 'supply_chain', label: 'Supply Chain', code: 'GRI 102-9', required: true },
          { id: 'changes', label: 'Significant Changes', code: 'GRI 102-10', required: false }
        ]
      },
      'strategy': {
        title: 'Strategy',
        fields: [
          { id: 'statement', label: 'Statement from Senior Decision-maker', code: 'GRI 102-14', required: true },
          { id: 'impacts', label: 'Key Impacts, Risks, Opportunities', code: 'GRI 102-15', required: false }
        ]
      },
      'ethics': {
        title: 'Ethics and Integrity',
        fields: [
          { id: 'values', label: 'Values, Principles, Standards', code: 'GRI 102-16', required: true },
          { id: 'advice', label: 'Mechanisms for Advice on Ethics', code: 'GRI 102-17', required: false }
        ]
      },
      'governance': {
        title: 'Governance',
        fields: [
          { id: 'structure', label: 'Governance Structure', code: 'GRI 102-18', required: true },
          { id: 'delegation', label: 'Delegating Authority', code: 'GRI 102-19', required: false },
          { id: 'responsibility', label: 'Executive Responsibility', code: 'GRI 102-20', required: false }
        ]
      }
    }
  },

  'GRI-200': {
    name: 'GRI 200: Economic Performance',
    description: 'Economic impacts, market presence, and indirect impacts',
    category: 'economic',
    sections: {
      'economic_performance': {
        title: 'Economic Performance (GRI 201)',
        fields: [
          { id: 'revenue', label: 'Direct Economic Value Generated', code: 'GRI 201-1', type: 'number', unit: 'USD', required: true },
          { id: 'operating_costs', label: 'Operating Costs', code: 'GRI 201-1', type: 'number', unit: 'USD', required: true },
          { id: 'employee_wages', label: 'Employee Wages and Benefits', code: 'GRI 201-1', type: 'number', unit: 'USD', required: true },
          { id: 'community_investment', label: 'Community Investments', code: 'GRI 201-1', type: 'number', unit: 'USD', required: true },
          { id: 'climate_risks', label: 'Financial Implications of Climate Change', code: 'GRI 201-2', type: 'text', required: false },
          { id: 'pension_obligations', label: 'Defined Benefit Plan Obligations', code: 'GRI 201-3', type: 'number', unit: 'USD', required: false }
        ]
      },
      'market_presence': {
        title: 'Market Presence (GRI 202)',
        fields: [
          { id: 'wage_ratio', label: 'Ratio of Entry Level Wage to Local Minimum', code: 'GRI 202-1', type: 'number', unit: 'ratio', required: true },
          { id: 'local_hiring', label: 'Proportion of Senior Management from Local Community', code: 'GRI 202-2', type: 'number', unit: '%', required: true }
        ]
      },
      'indirect_impacts': {
        title: 'Indirect Economic Impacts (GRI 203)',
        fields: [
          { id: 'infrastructure', label: 'Infrastructure Investments', code: 'GRI 203-1', type: 'number', unit: 'USD', required: false },
          { id: 'indirect_impacts', label: 'Significant Indirect Economic Impacts', code: 'GRI 203-2', type: 'text', required: false }
        ]
      },
      'procurement': {
        title: 'Procurement Practices (GRI 204)',
        fields: [
          { id: 'local_suppliers', label: 'Proportion of Spending on Local Suppliers', code: 'GRI 204-1', type: 'number', unit: '%', required: true }
        ]
      },
      'anti_corruption': {
        title: 'Anti-corruption (GRI 205)',
        fields: [
          { id: 'corruption_risk', label: 'Operations Assessed for Corruption Risks', code: 'GRI 205-1', type: 'number', unit: '%', required: true },
          { id: 'anti_corruption_training', label: 'Anti-corruption Training', code: 'GRI 205-2', type: 'number', unit: '%', required: true },
          { id: 'corruption_incidents', label: 'Confirmed Corruption Incidents', code: 'GRI 205-3', type: 'number', unit: 'count', required: true }
        ]
      }
    }
  },

  'GRI-300': {
    name: 'GRI 300: Environmental',
    description: 'Materials, energy, water, emissions, waste, and biodiversity',
    category: 'environmental',
    sections: {
      'materials': {
        title: 'Materials (GRI 301)',
        fields: [
          { id: 'materials_used', label: 'Materials Used by Weight', code: 'GRI 301-1', type: 'number', unit: 'tonnes', required: true },
          { id: 'recycled_materials', label: 'Recycled Input Materials', code: 'GRI 301-2', type: 'number', unit: '%', required: true },
          { id: 'reclaimed_products', label: 'Reclaimed Products', code: 'GRI 301-3', type: 'number', unit: '%', required: false }
        ]
      },
      'energy': {
        title: 'Energy (GRI 302)',
        fields: [
          { id: 'energy_consumption', label: 'Energy Consumption within Organization', code: 'GRI 302-1', type: 'number', unit: 'MWh', required: true },
          { id: 'energy_outside', label: 'Energy Consumption outside Organization', code: 'GRI 302-2', type: 'number', unit: 'MWh', required: false },
          { id: 'energy_intensity', label: 'Energy Intensity', code: 'GRI 302-3', type: 'number', unit: 'MWh/unit', required: true },
          { id: 'energy_reduction', label: 'Reduction of Energy Consumption', code: 'GRI 302-4', type: 'number', unit: 'MWh', required: true },
          { id: 'renewable_energy', label: 'Renewable Energy Percentage', code: 'GRI 302-1', type: 'number', unit: '%', required: true }
        ]
      },
      'water': {
        title: 'Water and Effluents (GRI 303)',
        fields: [
          { id: 'water_withdrawal', label: 'Water Withdrawal', code: 'GRI 303-3', type: 'number', unit: 'm³', required: true },
          { id: 'water_discharge', label: 'Water Discharge', code: 'GRI 303-4', type: 'number', unit: 'm³', required: true },
          { id: 'water_consumption', label: 'Water Consumption', code: 'GRI 303-5', type: 'number', unit: 'm³', required: true },
          { id: 'water_stress', label: 'Operations in Water-stressed Areas', code: 'GRI 303-3', type: 'text', required: false }
        ]
      },
      'biodiversity': {
        title: 'Biodiversity (GRI 304)',
        fields: [
          { id: 'protected_areas', label: 'Sites in Protected Areas', code: 'GRI 304-1', type: 'number', unit: 'count', required: true },
          { id: 'biodiversity_impacts', label: 'Significant Impacts on Biodiversity', code: 'GRI 304-2', type: 'text', required: true },
          { id: 'habitats_protected', label: 'Habitats Protected or Restored', code: 'GRI 304-3', type: 'number', unit: 'hectares', required: false },
          { id: 'species_affected', label: 'IUCN Red List Species', code: 'GRI 304-4', type: 'number', unit: 'count', required: false }
        ]
      },
      'emissions': {
        title: 'Emissions (GRI 305)',
        fields: [
          { id: 'scope1_emissions', label: 'Direct GHG Emissions (Scope 1)', code: 'GRI 305-1', type: 'number', unit: 'tCO2e', required: true },
          { id: 'scope2_emissions', label: 'Energy Indirect GHG Emissions (Scope 2)', code: 'GRI 305-2', type: 'number', unit: 'tCO2e', required: true },
          { id: 'scope3_emissions', label: 'Other Indirect GHG Emissions (Scope 3)', code: 'GRI 305-3', type: 'number', unit: 'tCO2e', required: false },
          { id: 'ghg_intensity', label: 'GHG Emissions Intensity', code: 'GRI 305-4', type: 'number', unit: 'tCO2e/unit', required: true },
          { id: 'emissions_reduction', label: 'Reduction of GHG Emissions', code: 'GRI 305-5', type: 'number', unit: 'tCO2e', required: true }
        ]
      },
      'waste': {
        title: 'Waste (GRI 306)',
        fields: [
          { id: 'waste_generated', label: 'Waste Generation', code: 'GRI 306-3', type: 'number', unit: 'tonnes', required: true },
          { id: 'waste_diverted', label: 'Waste Diverted from Disposal', code: 'GRI 306-4', type: 'number', unit: 'tonnes', required: true },
          { id: 'waste_disposal', label: 'Waste Directed to Disposal', code: 'GRI 306-5', type: 'number', unit: 'tonnes', required: true },
          { id: 'hazardous_waste', label: 'Hazardous Waste', code: 'GRI 306-3', type: 'number', unit: 'tonnes', required: true }
        ]
      }
    }
  },

  'GRI-400': {
    name: 'GRI 400: Social',
    description: 'Employment, health & safety, training, diversity, and human rights',
    category: 'social',
    sections: {
      'employment': {
        title: 'Employment (GRI 401)',
        fields: [
          { id: 'new_hires', label: 'New Employee Hires', code: 'GRI 401-1', type: 'number', unit: 'count', required: true },
          { id: 'turnover', label: 'Employee Turnover', code: 'GRI 401-1', type: 'number', unit: '%', required: true },
          { id: 'benefits', label: 'Benefits Provided to Employees', code: 'GRI 401-2', type: 'text', required: false },
          { id: 'parental_leave', label: 'Parental Leave', code: 'GRI 401-3', type: 'number', unit: '%', required: false }
        ]
      },
      'labor_relations': {
        title: 'Labor/Management Relations (GRI 402)',
        fields: [
          { id: 'notice_period', label: 'Minimum Notice Periods', code: 'GRI 402-1', type: 'number', unit: 'weeks', required: true }
        ]
      },
      'health_safety': {
        title: 'Occupational Health and Safety (GRI 403)',
        fields: [
          { id: 'ohs_system', label: 'OHS Management System', code: 'GRI 403-1', type: 'text', required: true },
          { id: 'hazard_identification', label: 'Hazard Identification', code: 'GRI 403-2', type: 'text', required: true },
          { id: 'ohs_services', label: 'Occupational Health Services', code: 'GRI 403-3', type: 'text', required: true },
          { id: 'work_injuries', label: 'Work-related Injuries', code: 'GRI 403-9', type: 'number', unit: 'count', required: true },
          { id: 'fatalities', label: 'Fatalities', code: 'GRI 403-9', type: 'number', unit: 'count', required: true },
          { id: 'injury_rate', label: 'Lost Time Injury Rate', code: 'GRI 403-9', type: 'number', unit: 'rate', required: true },
          { id: 'safety_training', label: 'Safety Training Hours', code: 'GRI 403-5', type: 'number', unit: 'hours', required: true }
        ]
      },
      'training': {
        title: 'Training and Education (GRI 404)',
        fields: [
          { id: 'training_hours', label: 'Average Training Hours per Employee', code: 'GRI 404-1', type: 'number', unit: 'hours', required: true },
          { id: 'skills_programs', label: 'Skills Upgrade Programs', code: 'GRI 404-2', type: 'text', required: false },
          { id: 'performance_reviews', label: 'Performance Reviews', code: 'GRI 404-3', type: 'number', unit: '%', required: true }
        ]
      },
      'diversity': {
        title: 'Diversity and Equal Opportunity (GRI 405)',
        fields: [
          { id: 'board_diversity', label: 'Diversity of Governance Bodies', code: 'GRI 405-1', type: 'number', unit: '%', required: true },
          { id: 'female_employees', label: 'Female Employees', code: 'GRI 405-1', type: 'number', unit: '%', required: true },
          { id: 'wage_equality', label: 'Ratio of Basic Salary (Women to Men)', code: 'GRI 405-2', type: 'number', unit: 'ratio', required: true }
        ]
      },
      'non_discrimination': {
        title: 'Non-discrimination (GRI 406)',
        fields: [
          { id: 'discrimination_incidents', label: 'Discrimination Incidents', code: 'GRI 406-1', type: 'number', unit: 'count', required: true }
        ]
      },
      'local_communities': {
        title: 'Local Communities (GRI 413)',
        fields: [
          { id: 'community_engagement', label: 'Operations with Community Engagement', code: 'GRI 413-1', type: 'number', unit: '%', required: true },
          { id: 'community_impacts', label: 'Significant Impacts on Local Communities', code: 'GRI 413-2', type: 'text', required: true },
          { id: 'local_employment', label: 'Local Employment Percentage', code: 'GRI 413-1', type: 'number', unit: '%', required: true },
          { id: 'community_investment', label: 'Community Investment', code: 'GRI 413-1', type: 'number', unit: 'USD', required: true }
        ]
      }
    }
  },

  'GRI-14': {
    name: 'GRI 14: Mining and Metals (Sector Standard)',
    description: 'Mining-specific disclosures including tailings, closure, and artisanal mining',
    category: 'mining',
    sections: {
      'tailings': {
        title: 'Tailings Management (GRI 14.6)',
        fields: [
          { id: 'tailings_facilities', label: 'Number of Tailings Storage Facilities', code: 'GRI 14.6.1', type: 'number', unit: 'count', required: true },
          { id: 'tailings_volume', label: 'Total Tailings Produced', code: 'GRI 14.6.2', type: 'number', unit: 'tonnes', required: true },
          { id: 'tailings_incidents', label: 'Tailings-related Incidents', code: 'GRI 14.6.3', type: 'number', unit: 'count', required: true },
          { id: 'dam_safety', label: 'Dam Safety Management', code: 'GRI 14.6.4', type: 'text', required: true }
        ]
      },
      'mine_closure': {
        title: 'Mine Closure and Rehabilitation (GRI 14.7)',
        fields: [
          { id: 'closure_plan', label: 'Mine Closure Plan Status', code: 'GRI 14.7.1', type: 'text', required: true },
          { id: 'closure_provision', label: 'Financial Provision for Closure', code: 'GRI 14.7.2', type: 'number', unit: 'USD', required: true },
          { id: 'land_rehabilitated', label: 'Land Rehabilitated', code: 'GRI 14.7.3', type: 'number', unit: 'hectares', required: true },
          { id: 'rehabilitation_progress', label: 'Rehabilitation Progress', code: 'GRI 14.7.4', type: 'number', unit: '%', required: true }
        ]
      },
      'artisanal_mining': {
        title: 'Artisanal and Small-scale Mining (GRI 14.8)',
        fields: [
          { id: 'asm_presence', label: 'Presence of Artisanal Mining', code: 'GRI 14.8.1', type: 'text', required: true },
          { id: 'asm_engagement', label: 'Engagement with Artisanal Miners', code: 'GRI 14.8.2', type: 'text', required: false },
          { id: 'asm_support', label: 'Support Programs for ASM', code: 'GRI 14.8.3', type: 'text', required: false }
        ]
      },
      'resettlement': {
        title: 'Resettlement (GRI 14.9)',
        fields: [
          { id: 'resettlement_sites', label: 'Sites Requiring Resettlement', code: 'GRI 14.9.1', type: 'number', unit: 'count', required: true },
          { id: 'people_resettled', label: 'Number of People Resettled', code: 'GRI 14.9.2', type: 'number', unit: 'count', required: true },
          { id: 'resettlement_compensation', label: 'Resettlement Compensation', code: 'GRI 14.9.3', type: 'number', unit: 'USD', required: false }
        ]
      },
      'rights_holders': {
        title: 'Rights of Indigenous Peoples (GRI 14.10)',
        fields: [
          { id: 'indigenous_lands', label: 'Operations on Indigenous Lands', code: 'GRI 14.10.1', type: 'text', required: true },
          { id: 'fpic_process', label: 'Free Prior Informed Consent Process', code: 'GRI 14.10.2', type: 'text', required: true },
          { id: 'indigenous_grievances', label: 'Grievances from Indigenous Peoples', code: 'GRI 14.10.3', type: 'number', unit: 'count', required: true }
        ]
      },
      'material_stewardship': {
        title: 'Material Stewardship (GRI 14.11)',
        fields: [
          { id: 'ore_processed', label: 'Ore Processed', code: 'GRI 14.11.1', type: 'number', unit: 'tonnes', required: true },
          { id: 'metal_production', label: 'Metal Production', code: 'GRI 14.11.2', type: 'number', unit: 'tonnes', required: true },
          { id: 'waste_rock', label: 'Waste Rock Generated', code: 'GRI 14.11.3', type: 'number', unit: 'tonnes', required: true }
        ]
      }
    }
  }
};

// Helper function to get all fields from a template
export const getTemplateFields = (templateId) => {
  const template = GRI_TEMPLATES[templateId];
  if (!template) return [];
  
  const fields = [];
  Object.entries(template.sections).forEach(([sectionKey, section]) => {
    section.fields.forEach(field => {
      fields.push({
        ...field,
        section: sectionKey,
        sectionTitle: section.title,
        template: templateId
      });
    });
  });
  
  return fields;
};

// Helper function to validate template completeness
export const validateTemplateCompleteness = (templateId, data) => {
  const fields = getTemplateFields(templateId);
  const requiredFields = fields.filter(f => f.required);
  
  let completed = 0;
  requiredFields.forEach(field => {
    if (data[field.id] && data[field.id] !== '') {
      completed++;
    }
  });
  
  return {
    total: requiredFields.length,
    completed,
    percentage: (completed / requiredFields.length) * 100,
    missing: requiredFields.filter(f => !data[f.id] || data[f.id] === '').map(f => f.label)
  };
};

// Get template by category
export const getTemplatesByCategory = (category) => {
  return Object.entries(GRI_TEMPLATES)
    .filter(([_, template]) => template.category === category)
    .map(([id, template]) => ({ id, ...template }));
};

export default GRI_TEMPLATES;
