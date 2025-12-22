// ESG Reporting Frameworks and Standards
export const ESG_FRAMEWORKS = {
  ISSB: {
    name: 'ISSB (IFRS S1 & S2)',
    description: 'International Sustainability Standards Board - Climate & Sustainability Disclosures',
    standards: ['IFRS-S1', 'IFRS-S2'],
    focus: ['Climate Risk', 'Financial Materiality', 'Enterprise Value'],
    region: 'Global',
    mandatory: false
  },
  GRI_MINING: {
    name: 'GRI Mining & Metals',
    description: 'GRI Standards for Mining & Metals Sector',
    standards: ['GRI-11', 'GRI-305', 'GRI-303', 'GRI-304', 'GRI-403', 'GRI-413'],
    focus: ['Tailings Management', 'Water Stewardship', 'Biodiversity', 'Community Relations'],
    region: 'Global',
    mandatory: false
  },
  GRI: {
    name: "GRI Standards",
    description: "Global Reporting Initiative Standards",
    categories: {
      environmental: {
        "GRI-302": "Energy",
        "GRI-305": "Emissions", 
        "GRI-303": "Water and Effluents",
        "GRI-306": "Waste",
        "GRI-301": "Materials",
        "GRI-304": "Biodiversity",
        "GRI-307": "Environmental Compliance"
      },
      social: {
        "GRI-401": "Employment",
        "GRI-403": "Occupational Health and Safety",
        "GRI-405": "Diversity and Equal Opportunity",
        "GRI-404": "Training and Education",
        "GRI-402": "Labor/Management Relations",
        "GRI-406": "Non-discrimination",
        "GRI-408": "Child Labor",
        "GRI-409": "Forced or Compulsory Labor",
        "GRI-410": "Security Practices",
        "GRI-411": "Rights of Indigenous Peoples",
        "GRI-413": "Local Communities",
        "GRI-414": "Supplier Social Assessment",
        "GRI-415": "Public Policy",
        "GRI-416": "Customer Health and Safety",
        "GRI-417": "Marketing and Labeling",
        "GRI-418": "Customer Privacy"
      },
      governance: {
        "GRI-2-9": "Governance structure and composition",
        "GRI-205": "Anti-corruption",
        "GRI-206": "Anti-competitive Behavior",
        "GRI-207": "Tax",
        "GRI-2-23": "Policy commitments",
        "GRI-2-24": "Embedding policy commitments",
        "GRI-2-25": "Processes to remediate negative impacts",
        "GRI-2-26": "Mechanisms for seeking advice and raising concerns"
      }
    }
  },
  SASB: {
    name: "SASB Standards",
    description: "Sustainability Accounting Standards Board",
    categories: {
      environmental: [
        "Energy Management", 
        "GHG Emissions",
        "Scope 3 Emissions Calculation"
      ],
      social: [
        "Employee Health & Safety Metrics",
        "Diversity & Inclusion Data", 
        "Human Capital Management",
        "Community Relations"
      ],
      governance: [
        "Data Privacy & Security",
        "Business Ethics & Compliance",
        "Supply Chain Management"
      ]
    },
    industries: {
      "Technology & Communications": {
        "Hardware": ["Product Lifecycle Management", "Materials Sourcing", "Data Security"],
        "Software & Services": ["Environmental Footprint of Hardware Infrastructure", "Data Privacy & Freedom of Expression", "Data Security"],
        "Telecommunications": ["Environmental Footprint of Hardware Infrastructure", "Data Privacy", "Product End-of-life Management"]
      },
      "Financials": {
        "Commercial Banks": ["Data Security", "Financial Inclusion & Capacity Building", "Incorporation of ESG Factors in Credit Analysis"],
        "Investment Banking & Brokerage": ["Transparent Information & Fair Advice for Customers", "Employee Diversity & Inclusion", "Incorporation of ESG Factors in Investment Banking & Brokerage Activities"]
      },
      "Healthcare": {
        "Biotechnology & Pharmaceuticals": ["Safety of Clinical Trial Participants", "Access to Medicines", "Affordability & Pricing"],
        "Medical Equipment & Supplies": ["Product Safety & Quality", "Ethical Marketing", "Product Design & Lifecycle Management"]
      }
    }
  },
  TCFD: {
    name: "TCFD Recommendations", 
    description: "Task Force on Climate-related Financial Disclosures",
    pillars: ["Governance", "Strategy", "Risk Management", "Metrics and Targets"]
  },
  CSRD: {
    name: "CSRD/ESRS",
    description: "Corporate Sustainability Reporting Directive",
    standards: ["ESRS E1-E5 (Environmental)", "ESRS S1-S4 (Social)", "ESRS G1-G2 (Governance)"]
  }
};

export const STANDARD_METRICS = {
  environmental: {
    scope1Emissions: { unit: "tCO2e", framework: "GRI-305-1", description: "Direct GHG emissions" },
    scope2Emissions: { unit: "tCO2e", framework: "GRI-305-2", description: "Energy indirect GHG emissions" },
    scope3Emissions: { unit: "tCO2e", framework: "SASB-EM-GHG-110a.3", description: "Scope 3 emissions calculation" },
    energyConsumption: { unit: "MWh", framework: "GRI-302-1", description: "Energy consumption within organization" },
    renewableEnergyPercentage: { unit: "%", framework: "GRI-302-1", description: "Renewable energy share" },
    waterWithdrawal: { unit: "m³", framework: "GRI-303-3", description: "Water withdrawal" },
    wasteGenerated: { unit: "tonnes", framework: "GRI-306-3", description: "Waste generated" }
  },
  social: {
    totalEmployees: { unit: "count", framework: "GRI-2-7", description: "Total number of employees" },
    femaleEmployeesPercentage: { unit: "%", framework: "SASB-HC-DI-330a.1", description: "Diversity & inclusion data" },
    lostTimeInjuryRate: { unit: "rate", framework: "SASB-RT-CH-320a.1", description: "Employee health & safety metrics" },
    trainingHoursPerEmployee: { unit: "hours", framework: "SASB-HC-HM-330a.2", description: "Human capital management" },
    employeeTurnoverRate: { unit: "%", framework: "SASB-HC-HM-330a.1", description: "Employee turnover rate" },
    safetyTrainingHours: { unit: "hours", framework: "SASB-RT-CH-320a.2", description: "Safety training completion" },
    communityInvestment: { unit: "USD", framework: "SASB-FB-PF-410a.1", description: "Community relations investment" },
    diversityTrainingCompletion: { unit: "%", framework: "SASB-HC-DI-330a.2", description: "Diversity training completion" }
  },
  governance: {
    boardSize: { unit: "count", framework: "GRI-2-9", description: "Total board members" },
    independentDirectorsPercentage: { unit: "%", framework: "GRI-2-9", description: "Independent directors percentage" },
    ethicsTrainingCompletion: { unit: "%", framework: "SASB-FN-CB-510a.2", description: "Business ethics & compliance training" },
    dataBreachIncidents: { unit: "count", framework: "SASB-TC-SI-230a.1", description: "Data privacy & security incidents" },
    cybersecurityInvestment: { unit: "USD", framework: "SASB-TC-SI-230a.3", description: "Cybersecurity investment" },
    supplierESGAssessments: { unit: "%", framework: "SASB-CG-MR-430a.1", description: "Supply chain ESG assessments" },
    antiCorruptionPolicies: { unit: "boolean", framework: "SASB-FN-CB-510a.1", description: "Anti-corruption policies implemented" },
    dataPrivacyPolicies: { unit: "boolean", framework: "SASB-TC-SI-220a.1", description: "Data privacy policies" }
  }
};

export const MATERIALITY_TOPICS = [
  { id: "climate_change", name: "Climate Change", category: "environmental" },
  { id: "energy_management", name: "Energy Management", category: "environmental" },
  { id: "water_management", name: "Water Management", category: "environmental" },
  { id: "waste_management", name: "Waste & Circular Economy", category: "environmental" },
  { id: "employee_wellbeing", name: "Employee Health & Wellbeing", category: "social" },
  { id: "diversity_inclusion", name: "Diversity & Inclusion", category: "social" },
  { id: "human_rights", name: "Human Rights", category: "social" },
  { id: "data_privacy", name: "Data Privacy & Security", category: "governance" },
  { id: "business_ethics", name: "Business Ethics & Anti-corruption", category: "governance" },
  { id: "supply_chain", name: "Supply Chain Management", category: "governance" },
  { id: "scope3_emissions", name: "Scope 3 Emissions", category: "environmental" },
  { id: "employee_safety", name: "Employee Safety Metrics", category: "social" },
  { id: "human_capital", name: "Human Capital Management", category: "social" },
  { id: "community_relations", name: "Community Relations", category: "social" },
  { id: "cybersecurity", name: "Cybersecurity & Data Protection", category: "governance" },
  { id: "ethics_compliance", name: "Ethics & Compliance", category: "governance" },
  { id: "supplier_assessment", name: "Supplier ESG Assessment", category: "governance" }
];