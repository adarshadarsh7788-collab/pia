import { useState } from "react";
import * as XLSX from "xlsx";
import { debounce } from "lodash";
import APIService from "./services/apiService";
import ModuleAPI from "./services/moduleAPI";
import { ESG_FRAMEWORKS, STANDARD_METRICS } from "./utils/esgFrameworks";
import DataValidation from "./utils/dataValidation";
import AuditTrail from "./utils/AuditTrail";
import { GRI_TEMPLATES, getTemplateFields, validateTemplateCompleteness } from "./utils/griTemplates";
import { performFullValidation } from "./utils/advancedValidation";
import { useTheme } from "./contexts/ThemeContext";
import { getThemeClasses } from "./utils/themeUtils";
import ProfessionalHeader from "./components/ProfessionalHeader";
import { Alert, Button, Toast } from "./components/ProfessionalUX";
import UnifiedAdvancedEntry from "./modules/UnifiedAdvancedEntry";
import SiteHierarchyManager from "./modules/SiteHierarchyManager";
import { getUserRole, hasPermission, PERMISSIONS, USER_ROLES } from "./utils/rbac";
import AuditTrailViewer from "./components/AuditTrailViewer";
import ApprovalWorkflow from "./components/ApprovalWorkflow";
import EvidenceUploader from "./components/EvidenceUploader";

function DataEntry() {
  const { isDark } = useTheme();
  const theme = getThemeClasses(isDark);
  const userRole = getUserRole();
  const canAdd = hasPermission(userRole, PERMISSIONS.ADD_DATA);
  const canEdit = hasPermission(userRole, PERMISSIONS.EDIT_DATA);
  const canDelete = hasPermission(userRole, PERMISSIONS.DELETE_DATA);
  const canAuthorize = hasPermission(userRole, PERMISSIONS.AUTHORIZE_DATA);
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [frameworkCompliance, setFrameworkCompliance] = useState({});
  const [toast, setToast] = useState(null);
  const [showAdvancedEntry, setShowAdvancedEntry] = useState(false);
  const [selectedGRITemplate, setSelectedGRITemplate] = useState(null);
  const [templateCompleteness, setTemplateCompleteness] = useState({});
  const [showSiteManager, setShowSiteManager] = useState(false);
  const [selectedSite, setSelectedSite] = useState(null);
  const [validationResults, setValidationResults] = useState(null);
  const [showValidationPanel, setShowValidationPanel] = useState(false);
  const [showAuditTrail, setShowAuditTrail] = useState(false);
  const [showApprovals, setShowApprovals] = useState(false);
  const [showEvidence, setShowEvidence] = useState(false);

  const steps = [
    { id: 1, title: "Company Information", icon: "🏢", description: "Basic company details" },
    { id: 2, title: "Environmental", icon: "🌱", description: "GHG emissions, energy, water" },
    { id: 3, title: "Social", icon: "👥", description: "Workforce, safety, community" },
    { id: 4, title: "Governance", icon: "⚖️", description: "Board composition, ethics" },
    { id: 5, title: "Review & Submit", icon: "📋", description: "Final review" }
  ];
  const [formData, setFormData] = useState({
    companyInfo: {
      companyName: "",
      reportingYear: new Date().getFullYear(),
      sector: "",
      region: "",
      reportingFramework: "GRI",
      siteId: null,
      siteName: ""
    },
    environmental: {
      scope1Emissions: "", // GRI-305-1 / IFRS-S2
      scope2Emissions: "", // GRI-305-2 / IFRS-S2
      scope3Emissions: "", // GRI-305-3 / IFRS-S2
      energyConsumption: "", // GRI-302-1
      renewableEnergyPercentage: "", // GRI-302-1
      waterWithdrawal: "", // GRI-303-3 (Water Stewardship)
      waterDischarge: "", // GRI-303-4 (Mining)
      wasteGenerated: "", // GRI-306-3
      tailingsProduced: "", // GRI-11 (Mining Tailings)
      landRehabilitated: "", // GRI-11 (Mining Land Use)
      biodiversityImpact: "" // GRI-304 (Biodiversity)
    },
    social: {
      totalEmployees: "", // GRI-2-7
      femaleEmployeesPercentage: "", // SASB-HC-DI-330a.1
      lostTimeInjuryRate: "", // GRI-403-9 (Mining Safety)
      fatalityRate: "", // GRI-403-9 (Mining Critical)
      trainingHoursPerEmployee: "", // SASB-HC-HM-330a.2
      communityInvestment: "", // GRI-413 (Local Communities)
      localEmploymentPercentage: "", // GRI-413 (Mining)
      communityGrievances: "", // GRI-413 (Mining)
      employeeTurnoverRate: "", // SASB-HC-HM-330a.1
      safetyTrainingHours: "", // GRI-403 (OHS)
      diversityTrainingCompletion: "" // SASB-HC-DI-330a.2
    },
    governance: {
      boardSize: "", // GRI-2-9
      independentDirectorsPercentage: "", // GRI-2-9 / IFRS-S1
      femaleDirectorsPercentage: "", // GRI-405-1
      ethicsTrainingCompletion: "", // SASB-FN-CB-510a.2
      corruptionIncidents: "", // GRI-205-3
      dataBreachIncidents: "", // SASB-TC-SI-230a.1
      cybersecurityInvestment: "", // SASB-TC-SI-230a.3
      supplierESGAssessments: "", // SASB-CG-MR-430a.1
      antiCorruptionPolicies: "", // SASB-FN-CB-510a.1
      dataPrivacyPolicies: "", // SASB-TC-SI-220a.1
      climateRiskDisclosure: "", // IFRS-S2 (Climate Risk)
      sustainabilityGovernance: "" // IFRS-S1 (Governance)
    }
  });

  const [dragOver, setDragOver] = useState(false);
  const [isEditingCompany, setIsEditingCompany] = useState(false);

  // Load saved company name on mount
  useState(() => {
    const savedCompany = localStorage.getItem('esg_company_name');
    if (savedCompany && !formData.companyInfo.companyName) {
      setFormData(prev => ({
        ...prev,
        companyInfo: { ...prev.companyInfo, companyName: savedCompany }
      }));
    }
  }, []);

  // Disabled auto-save to prevent API calls
  const debouncedSave = debounce(async (data) => {
    // Auto-save disabled - only save on submit
  }, 1500);

  // Enhanced validation with industry standards
  const validateField = (category, field, value) => {
    if (value === '') return { isValid: true, errors: [], warnings: [] };
    
    const result = DataValidation.validateESGData({ [category]: { [field]: value } });
    return result;
  };

  const handleChange = (category, field, value) => {
    // Enhanced validation with industry standards
    if (field !== 'description') {
      validateField(category, field, value);
    }

    // Update form data
    setFormData(prev => {
      const newData = {
        ...prev,
        [category]: {
          ...prev[category],
          [field]: value
        }
      };
      
      // Trigger auto-save with audit trail
      const saveDataPayload = {
        ...newData.companyInfo,
        environmental: newData.environmental,
        social: newData.social,
        governance: newData.governance,
        status: "Draft",
        timestamp: new Date().toISOString(),
        frameworkCompliance: DataValidation.validateDataCompleteness(newData)
      };
      
      debouncedSave(saveDataPayload);
      
      // Log to audit trail
      AuditTrail.trackDataUpdate({}, { category, field, value }, 'current_user');
      
      return newData;
    });
  };



  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Validate required fields
      if (!formData.companyInfo.companyName.trim()) {
        showToast("Company name is required", 'error');
        return;
      }

      // Perform advanced validation
      const validation = performFullValidation(formData);
      setValidationResults(validation);

      if (validation.summary.totalCritical > 0) {
        showToast(`${validation.summary.totalCritical} critical issues found. Please review.`, 'error');
        setShowValidationPanel(true);
        return;
      }

      if (validation.summary.totalErrors > 0) {
        const proceed = window.confirm(`${validation.summary.totalErrors} validation errors found. Continue anyway?`);
        if (!proceed) {
          setShowValidationPanel(true);
          return;
        }
      }

      setIsSaving(true);
      
      // Prepare data for localStorage (simplified format)
      const submissionData = {
        id: Date.now().toString(),
        companyName: formData.companyInfo.companyName,
        sector: formData.companyInfo.sector,
        region: formData.companyInfo.region,
        reportingYear: formData.companyInfo.reportingYear,
        siteId: selectedSite?.id || null,
        siteName: selectedSite?.name || null,
        siteType: selectedSite?.type || null,
        environmental: formData.environmental,
        social: formData.social,
        governance: formData.governance,
        status: "Submitted",
        timestamp: new Date().toISOString(),
        createdAt: new Date().toISOString()
      };
      
      // Save to database via ModuleAPI
      const currentUser = localStorage.getItem('currentUser') || 'admin@esgenius.com';
      const companyId = currentUser || '1';
      const userRole = getUserRole();
      
      // Create approval workflow for data_entry role
      if (userRole === USER_ROLES.DATA_ENTRY) {
        const AuditSystem = require('./utils/auditSystem').default;
        const workflowId = AuditSystem.createApprovalWorkflow(
          submissionData.id,
          'ESG Data Entry',
          currentUser
        );
        
        // Create notification for supervisor
        const alerts = JSON.parse(localStorage.getItem('recentAlerts') || '[]');
        alerts.unshift({
          id: Date.now(),
          type: 'info',
          title: 'New Data Pending Approval',
          message: `${currentUser} submitted ESG data for approval`,
          category: 'Approval',
          timestamp: new Date().toISOString(),
          read: false,
          workflowId: workflowId.id
        });
        localStorage.setItem('recentAlerts', JSON.stringify(alerts));
        
        submissionData.status = 'Pending Approval';
        submissionData.workflowId = workflowId.id;
      }
      try {
        // Save environmental data
        if (formData.environmental.scope1Emissions) {
          await ModuleAPI.saveModuleData('AirQualityData', companyId, {
            locationId: 'main_facility',
            pollutantType: 'CO2',
            concentration: parseFloat(formData.environmental.scope1Emissions),
            unit: 'tCO2e',
            measurementDate: new Date(),
            complianceStatus: 'compliant'
          });
        }
        
        // Save social data
        if (formData.social.totalEmployees) {
          await ModuleAPI.saveWorkforceData(companyId, {
            employeeId: `BULK_${Date.now()}`,
            department: 'All Departments',
            position: 'Various',
            gender: 'mixed',
            hireDate: new Date(),
            trainingHours: parseFloat(formData.social.trainingHoursPerEmployee || 0),
            isActive: true
          });
        }
        
        // Save governance data
        if (formData.governance.boardSize) {
          await ModuleAPI.saveModuleData('EthicsCompliance', companyId, {
            policyType: 'board_governance',
            complianceStatus: 'compliant',
            auditScore: 85,
            auditDate: new Date()
          });
        }
        
        // Also save to localStorage for backward compatibility
        const existing = JSON.parse(localStorage.getItem('esgData') || '[]');
        existing.push(submissionData);
        localStorage.setItem('esgData', JSON.stringify(existing));
        localStorage.setItem('esg_last_submission', JSON.stringify(submissionData));
        
        // Dispatch custom event to notify other components
        window.dispatchEvent(new CustomEvent('esgDataUpdated', { detail: submissionData }));
      } catch (e) {
        console.error('Failed to save data:', e);
        throw new Error('Failed to save data');
      }
      
      setCompletedSteps(prev => new Set([...prev, 5]));
      
      if (userRole === USER_ROLES.DATA_ENTRY) {
        showToast("Assessment submitted for approval!", 'success');
      } else {
        showToast("Assessment submitted successfully!", 'success');
      }
      
      // Navigate to reports after a short delay
      setTimeout(() => {
        window.location.href = '/reports';
      }, 1000);
      
    } catch (error) {
      showToast(`Error saving data: ${error.message}`, 'error');
      console.error('Submit failed:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileUpload = (file) => {
    setUploadProgress(10);
    showToast(`Processing ${file.name}...`, 'info');
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        setUploadProgress(30);
        let jsonData;
        
        if (file.name.endsWith('.json')) {
          jsonData = JSON.parse(event.target.result);
        } else {
          const workbook = XLSX.read(event.target.result, { type: "array" });
          const sheet = workbook.Sheets[workbook.SheetNames[0]];
          jsonData = XLSX.utils.sheet_to_json(sheet);
        }
        
        setUploadProgress(50);
        
        // Enhanced validation
        const requiredColumns = ['CompanyName', 'Category', 'Metric', 'Value'];
        
        if (!jsonData[0]) throw new Error('File appears to be empty');
        
        const fileColumns = Object.keys(jsonData[0]);
        const missingRequired = requiredColumns.filter(col => !fileColumns.includes(col));
        
        if (missingRequired.length > 0) {
          throw new Error(`Missing required columns: ${missingRequired.join(', ')}`);
        }

        setUploadProgress(70);
        
        const formatted = jsonData.map((row, index) => {
          // Enhanced validation
          if (!row.CompanyName?.trim()) {
            throw new Error(`Row ${index + 2}: Company Name is required`);
          }
          
          const category = row.Category?.toLowerCase();
          if (!['environmental', 'social', 'governance'].includes(category)) {
            throw new Error(`Row ${index + 2}: Category must be Environmental, Social, or Governance`);
          }
          
          const value = parseFloat(row.Value);
          if (isNaN(value)) {
            throw new Error(`Row ${index + 2}: Value '${row.Value}' is not a valid number`);
          }

          // Framework validation
          const validation = DataValidation.validateESGData({ [category]: { [row.Metric]: value } });
          
          return {
            companyName: row.CompanyName.trim(),
            category: category,
            metric: row.Metric || "",
            value: value,
            unit: row.Unit || '',
            frameworkCode: row.FrameworkCode || '',
            reportingYear: row.ReportingYear || new Date().getFullYear(),
            description: row.Description || "",
            sector: row.Sector || '',
            region: row.Region || '',
            dataSource: row.DataSource || 'Manual Entry',
            verified: row.Verified === 'true' || row.Verified === true,
            notes: row.Notes || '',
            validation: validation,
            status: validation.isValid ? "Submitted" : "Validation Required",
            timestamp: new Date().toISOString(),
            importSource: file.name
          };
        });

        setUploadProgress(90);
        // Save bulk data via API
        const currentUser = 'admin@esgenius.com'; // Use consistent user ID
        
        // Save each formatted entry to database via ModuleAPI
        const companyId = 'admin@esgenius.com';
        Promise.all(formatted.map(async entry => {
          try {
            // Determine which module to save to based on category and metric
            if (entry.category === 'environmental') {
              if (entry.metric.includes('waste')) {
                await ModuleAPI.saveWasteData(companyId, {
                  wasteType: entry.metric,
                  quantity: entry.value,
                  unit: entry.unit,
                  disposalMethod: 'recycling',
                  recyclingRate: entry.value * 0.7,
                  reportingPeriod: entry.reportingYear
                });
              } else {
                await ModuleAPI.saveModuleData('AirQualityData', companyId, {
                  locationId: 'main_facility',
                  pollutantType: entry.metric,
                  concentration: entry.value,
                  unit: entry.unit,
                  measurementDate: new Date()
                });
              }
            } else if (entry.category === 'social') {
              if (entry.metric.includes('employee') || entry.metric.includes('workforce')) {
                await ModuleAPI.saveWorkforceData(companyId, {
                  employeeId: `EMP_${Date.now()}`,
                  department: 'General',
                  position: 'Employee',
                  gender: 'unknown',
                  hireDate: new Date(),
                  trainingHours: entry.value,
                  isActive: true
                });
              } else if (entry.metric.includes('safety') || entry.metric.includes('injury')) {
                await ModuleAPI.saveSafetyIncident(companyId, {
                  incidentType: entry.metric,
                  severity: 'low',
                  location: 'workplace',
                  incidentDate: new Date(),
                  injuryCount: entry.value
                });
              }
            } else if (entry.category === 'governance') {
              await ModuleAPI.saveModuleData('EthicsCompliance', companyId, {
                policyType: entry.metric,
                complianceStatus: 'compliant',
                auditScore: entry.value,
                auditDate: new Date()
              });
            }
          } catch (error) {
            console.warn('Failed to save entry:', entry.metric, error);
          }
        }));
        
        setUploadProgress(100);
        
        const validEntries = formatted.filter(f => f.validation.isValid).length;
        
        setTimeout(() => {
          setUploadProgress(0);
          const successMessage = `Import complete: ${validEntries} valid entries saved to backend`;
          showToast(successMessage, 'success');
        }, 1000);
        
      } catch (error) {
        setUploadProgress(0);
        showToast(`Import failed: ${error.message}`, 'error');
      }
    };
    
    reader.onprogress = (event) => {
      if (event.lengthComputable) {
        const fileProgress = Math.round((event.loaded / event.total) * 20);
        setUploadProgress(Math.min(20 + fileProgress, 90));
      }
    };
    
    if (file.name.endsWith('.json')) {
      reader.readAsText(file);
    } else {
      reader.readAsArrayBuffer(file);
    }
  };

  const onFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    files.forEach(file => {
      if (!file.name.match(/\.(xlsx|csv|json)$/i)) {
        showToast(`Unsupported file type: ${file.name}`, 'error');
        return;
      }
      handleFileUpload(file);
    });
  };

  const generateTemplate = () => {
    return {
      sheets: [{
        name: 'ESG_Data_Template',
        data: [
          ['CompanyName', 'Category', 'Metric', 'Value', 'Unit', 'FrameworkCode', 'ReportingYear', 'Description', 'Sector', 'Region', 'DataSource', 'Verified', 'Notes']
        ]
      }]
    };
  };

  const generateSampleData = () => {
    return {
      sheets: [{
        name: 'Sample_ESG_Data',
        data: [
          ['CompanyName', 'Category', 'Metric', 'Value', 'Unit', 'FrameworkCode', 'ReportingYear', 'Sector', 'Region', 'DataSource', 'Verified']
        ]
      }]
    };
  };

  const downloadTemplate = (templateData, filename = 'ESG-Import-Template.xlsx') => {
    const wb = XLSX.utils.book_new();
    templateData.sheets.forEach(sheet => {
      const ws = XLSX.utils.aoa_to_sheet(sheet.data);
      XLSX.utils.book_append_sheet(wb, ws, sheet.name);
    });
    XLSX.writeFile(wb, filename);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    
    files.forEach(file => {
      if (file.name.match(/\.(xlsx|csv|json)$/i)) {
        handleFileUpload(file);
      } else {
        showToast(`Unsupported file: ${file.name}`, 'error');
      }
    });
  };

  // Removed validateCurrentStep - no validation for navigation

  // Removed nextStep function - using direct navigation in buttons

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (stepId) => {
    setCurrentStep(stepId);
  };

  const getStepProgress = () => {
    // Calculate progress based on current step and completed steps
    const totalSteps = steps.length;
    const currentProgress = Math.max(currentStep - 1, 0); // Current step progress
    const completedProgress = completedSteps.size; // Completed steps
    
    // Use the higher of current step or completed steps for accurate progress
    const actualProgress = Math.max(currentProgress, completedProgress);
    
    return Math.round((actualProgress / totalSteps) * 100);
  };

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleLogout = () => {
    window.location.href = "/login";
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${theme.bg.gradient}`}>
      <ProfessionalHeader 
        onLogout={handleLogout}
        actions={[
          {
            label: 'Audit Trail',
            onClick: () => setShowAuditTrail(true),
            icon: '📋'
          },
          {
            label: 'Approvals',
            onClick: () => setShowApprovals(true),
            icon: '✅'
          },
          {
            label: 'Evidence',
            onClick: () => setShowEvidence(true),
            icon: '📎'
          },
          {
            label: 'Site Manager',
            onClick: () => setShowSiteManager(true),
            icon: '🏢'
          },
          {
            label: 'Advanced Data Entry',
            onClick: () => setShowAdvancedEntry(true),
            icon: '🚀'
          }
        ]}
      />


      <div className="max-w-7xl mx-auto p-6">
        {/* Step Progress Card */}
        <div className={`p-6 rounded-xl shadow-lg mb-8 ${theme.bg.card}`}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className={`text-2xl font-bold ${theme.text.primary}`}>Step {currentStep} of {steps.length}</h2>
              <p className={`text-sm ${theme.text.secondary}`}>{steps.find(s => s.id === currentStep)?.description}</p>
            </div>
            <div className="text-right">
              <div className={`text-sm font-medium ${theme.text.secondary}`}>Progress: {getStepProgress()}% Complete</div>
              <div className={`w-32 ${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-2 mt-2`}>
                <div 
                  className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500 ease-out"
                  style={{width: `${Math.max(getStepProgress(), 20)}%`}}
                ></div>
              </div>
              <div className={`text-xs ${theme.text.muted} mt-1`}>Step {currentStep} of {steps.length}</div>
            </div>
          </div>
          
          {/* Step Navigation */}
          <div className="flex flex-wrap gap-2">
            {steps.map((step) => (
              <button
                key={step.id}
                type="button"
                onClick={() => goToStep(step.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentStep === step.id
                    ? `${theme.bg.accent} ${theme.text.accent} ring-2 ring-blue-500`
                    : completedSteps.has(step.id)
                    ? 'bg-green-100 text-green-800 hover:bg-green-200'
                    : `${theme.bg.subtle} ${theme.text.secondary} ${theme.hover.subtle}`
                }`}
              >
                <span>{step.icon}</span>
                <span className="hidden md:inline">{step.title}</span>
                {completedSteps.has(step.id) && <span className="text-green-600">✓</span>}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Step Content */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className={`text-2xl font-bold ${theme.text.primary} mb-2`}>🏢 Company Information</h3>
                <p className={`${theme.text.secondary}`}>Let's start with basic company details and framework selection</p>
              </div>
              <div className={`p-6 rounded-lg ${theme.bg.subtle}`}>
            <h3 className={`text-lg font-bold ${theme.text.primary} mb-4`}>Company Information & Framework Selection</h3>
            <Alert 
              type="info"
              title="Flexible Company Management"
              message="You can edit company information at any time and manage data for multiple companies."
              className="mb-4"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className={`block text-sm font-medium ${theme.text.secondary} mb-1`}>Company Name *</label>
                <div className="flex gap-2">
                  {!isEditingCompany && formData.companyInfo.companyName ? (
                    <>
                      <div className={`flex-1 border rounded-md px-4 py-2 ${theme.bg.input} ${theme.border.input} ${theme.text.primary} bg-gray-50 flex items-center justify-between`}>
                        <span className="font-medium">{formData.companyInfo.companyName}</span>
                        <span className="text-xs text-gray-500 ml-2">(Auto-filled)</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsEditingCompany(true)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm flex items-center gap-1"
                        title="Edit company name"
                      >
                        ✏️ Edit
                      </button>
                    </>
                  ) : (
                    <>
                      <input
                        type="text"
                        value={formData.companyInfo.companyName}
                        onChange={(e) => {
                          handleChange('companyInfo', 'companyName', e.target.value);
                        }}
                        className={`flex-1 border rounded-md px-4 py-2 ${theme.bg.input} ${theme.border.input} ${theme.text.primary}`}
                        placeholder="Enter company name (e.g., Acme Corporation)"
                        required
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (formData.companyInfo.companyName.trim()) {
                            localStorage.setItem('esg_company_name', formData.companyInfo.companyName);
                            setIsEditingCompany(false);
                            showToast('Company name saved', 'success');
                          }
                        }}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm"
                        disabled={!formData.companyInfo.companyName.trim()}
                      >
                        ✓ Save
                      </button>
                    </>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">Company name is auto-filled for all entries. Click Edit to change.</p>
              </div>
              <div className="md:col-span-2">
                <label className={`block text-sm font-medium ${theme.text.secondary} mb-1`}>Site/Business Unit</label>
                <div className="flex gap-2">
                  <div className={`flex-1 border rounded-md px-4 py-2 ${theme.bg.input} ${theme.border.input}`}>
                    {selectedSite ? (
                      <div>
                        <span className="font-medium">{selectedSite.name}</span>
                        <span className={`text-xs ${theme.text.muted} ml-2`}>({selectedSite.type})</span>
                      </div>
                    ) : (
                      <span className={theme.text.muted}>No site selected (Company-level)</span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowSiteManager(true)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm"
                  >
                    {selectedSite ? '✏️ Change' : '➕ Select Site'}
                  </button>
                  {selectedSite && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedSite(null);
                        setFormData(prev => ({
                          ...prev,
                          companyInfo: { ...prev.companyInfo, siteId: null, siteName: '' }
                        }));
                        showToast('Switched to company-level reporting', 'info');
                      }}
                      className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded-md text-sm"
                    >
                      ✕
                    </button>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">Select a site/business unit for site-level reporting, or leave empty for company-level.</p>
              </div>
              <div>
                <label className={`block text-sm font-medium ${theme.text.secondary} mb-1`}>{'{Reporting Year}'}</label>
                <input
                  type="number"
                  value={formData.companyInfo.reportingYear}
                  onChange={(e) => handleChange('companyInfo', 'reportingYear', e.target.value)}
                  className={`w-full border rounded-md px-4 py-2 ${theme.bg.input} ${theme.border.input} ${theme.text.primary}`}
                  required
                />
              </div>
              <div>
                <label className={`block text-sm font-medium ${theme.text.secondary} mb-1`}>{'{Sector}'}</label>
                <select
                  value={formData.companyInfo.sector}
                  onChange={(e) => handleChange('companyInfo', 'sector', e.target.value)}
                  className={`w-full border rounded-md px-4 py-2 ${theme.bg.input} ${theme.border.input} ${theme.text.primary}`}
                  required
                >
                  <option value="">Select sector</option>
                  <option value="mining">Mining & Extractives</option>
                  <option value="healthcare">Healthcare</option>
                  <option value="manufacturing">Manufacturing</option>
                  <option value="technology">Technology & IT Services</option>
                  <option value="financial">Financial Services & Banking</option>
                  <option value="retail">Retail & Consumer Goods</option>
                  <option value="telecommunications">Telecommunications</option>
                  <option value="real_estate">Real Estate & Property</option>
                  <option value="hospitality">Hospitality & Tourism</option>
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium ${theme.text.secondary} mb-1`}>{'{Region}'}</label>
                <select
                  value={formData.companyInfo.region}
                  onChange={(e) => handleChange('companyInfo', 'region', e.target.value)}
                  className={`w-full border rounded-md px-4 py-2 ${theme.bg.input} ${theme.border.input} ${theme.text.primary}`}
                  required
                >
                  <option value="">Select region</option>
                  <option value="africa">Africa</option>
                  <option value="zimbabwe">Zimbabwe</option>
                  <option value="southern_africa">Southern Africa</option>
                  <option value="north_america">North America</option>
                  <option value="europe">Europe</option>
                  <option value="asia_pacific">Asia Pacific</option>
                  <option value="latin_america">Latin America</option>
                  <option value="middle_east">Middle East</option>
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium ${theme.text.secondary} mb-1`}>{'{Primary Reporting Framework *}'}</label>
                <select
                  value={formData.companyInfo.reportingFramework}
                  onChange={(e) => {
                    handleChange('companyInfo', 'reportingFramework', e.target.value);
                    // Update compliance when framework changes
                    const compliance = DataValidation.validateDataCompleteness(formData);
                    setFrameworkCompliance(compliance);
                  }}
                  className={`w-full border rounded-md px-4 py-2 ${theme.bg.input} ${theme.border.input} ${theme.text.primary}`}
                  required
                >
                  {Object.entries(ESG_FRAMEWORKS).map(([key, framework]) => (
                    <option key={key} value={key}>{framework.name} - {framework.description}</option>
                  ))}
                </select>
                {frameworkCompliance.score !== undefined && (
                  <div className="mt-2 text-sm">
                    <span className={`px-2 py-1 rounded ${
                      frameworkCompliance.score >= 80 ? 'bg-green-100 text-green-800' :
                      frameworkCompliance.score >= 60 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      Compliance: {frameworkCompliance.score}%
                    </span>
                  </div>
                )}
              </div>
              <div>
                <label className={`block text-sm font-medium ${theme.text.secondary} mb-1`}>{'{Assurance Level}'}</label>
                <select
                  value={formData.companyInfo.assuranceLevel}
                  onChange={(e) => handleChange('companyInfo', 'assuranceLevel', e.target.value)}
                  className={`w-full border rounded-md px-4 py-2 ${theme.bg.input} ${theme.border.input} ${theme.text.primary}`}
                >
                  <option value="None">No External Assurance</option>
                  <option value="Limited">Limited Assurance</option>
                  <option value="Reasonable">Reasonable Assurance</option>
                </select>
              </div>
            </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className={`text-2xl font-bold ${theme.text.primary} mb-2`}>🌱 Advanced Environmental Metrics</h3>
                <p className={`${theme.text.secondary}`}>Comprehensive environmental data with mining-specific metrics, ISSB S2 climate disclosures, and biodiversity tracking</p>
                <button
                  type="button"
                  onClick={() => setShowAdvancedEntry(true)}
                  className="mt-3 px-4 py-2 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg hover:shadow-lg transition-all"
                >
                  🚀 Open Advanced Data Entry
                </button>
              </div>
              <div className={`p-6 rounded-lg ${theme.bg.subtle}`}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium ${theme.text.secondary} mb-1`}>Mine Tailings Produced (tonnes) <span className="text-xs text-blue-600">GRI-11</span></label>
                    <input
                      type="number"
                      value={formData.environmental.tailingsProduced}
                      onChange={(e) => handleChange('environmental', 'tailingsProduced', e.target.value)}
                      className={`w-full border rounded-md px-4 py-2 ${theme.bg.input} ${theme.border.input} ${theme.text.primary}`}
                      placeholder="50000"
                    />
                    <p className="text-xs text-gray-500 mt-1">Total tailings from mining operations</p>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${theme.text.secondary} mb-1`}>Water Discharge (m³) <span className="text-xs text-blue-600">GRI-303-4</span></label>
                    <input
                      type="number"
                      value={formData.environmental.waterDischarge}
                      onChange={(e) => handleChange('environmental', 'waterDischarge', e.target.value)}
                      className={`w-full border rounded-md px-4 py-2 ${theme.bg.input} ${theme.border.input} ${theme.text.primary}`}
                      placeholder="25000"
                    />
                    <p className="text-xs text-gray-500 mt-1">Water discharged from mining site</p>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${theme.text.secondary} mb-1`}>Land Rehabilitated (hectares) <span className="text-xs text-blue-600">GRI-11</span></label>
                    <input
                      type="number"
                      value={formData.environmental.landRehabilitated}
                      onChange={(e) => handleChange('environmental', 'landRehabilitated', e.target.value)}
                      className={`w-full border rounded-md px-4 py-2 ${theme.bg.input} ${theme.border.input} ${theme.text.primary}`}
                      placeholder="120"
                    />
                    <p className="text-xs text-gray-500 mt-1">Land restored post-mining</p>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${theme.text.secondary} mb-1`}>Biodiversity Impact Score <span className="text-xs text-blue-600">GRI-304</span></label>
                    <input
                      type="number"
                      value={formData.environmental.biodiversityImpact}
                      onChange={(e) => handleChange('environmental', 'biodiversityImpact', e.target.value)}
                      className={`w-full border rounded-md px-4 py-2 ${theme.bg.input} ${theme.border.input} ${theme.text.primary}`}
                      placeholder="7.5"
                      step="0.1"
                    />
                    <p className="text-xs text-gray-500 mt-1">Impact on local biodiversity (0-10 scale)</p>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${theme.text.secondary} mb-1`}>GHG Emissions - Scope 1 (tCO2e) <span className="text-xs text-blue-600">IFRS-S2</span></label>
                    <input
                      type="number"
                      value={formData.environmental.scope1Emissions}
                      onChange={(e) => handleChange('environmental', 'scope1Emissions', e.target.value)}
                      className={`w-full border rounded-md px-4 py-2 ${theme.bg.input} ${theme.border.input} ${theme.text.primary}`}
                      placeholder="85000"
                    />
                    <p className="text-xs text-gray-500 mt-1">Direct emissions from mining operations</p>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${theme.text.secondary} mb-1`}>GHG Emissions - Scope 2 (tCO2e) <span className="text-xs text-blue-600">IFRS-S2</span></label>
                    <input
                      type="number"
                      value={formData.environmental.scope2Emissions}
                      onChange={(e) => handleChange('environmental', 'scope2Emissions', e.target.value)}
                      className={`w-full border rounded-md px-4 py-2 ${theme.bg.input} ${theme.border.input} ${theme.text.primary}`}
                      placeholder="42000"
                    />
                    <p className="text-xs text-gray-500 mt-1">Indirect emissions from energy use</p>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${theme.text.secondary} mb-1`}>Water Withdrawal (m³) <span className="text-xs text-blue-600">GRI-303-3</span></label>
                    <input
                      type="number"
                      value={formData.environmental.waterWithdrawal}
                      onChange={(e) => handleChange('environmental', 'waterWithdrawal', e.target.value)}
                      className={`w-full border rounded-md px-4 py-2 ${theme.bg.input} ${theme.border.input} ${theme.text.primary}`}
                      placeholder="150000"
                    />
                    <p className="text-xs text-gray-500 mt-1">Total water withdrawn for mining</p>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${theme.text.secondary} mb-1`}>Energy Consumption (MWh) <span className="text-xs text-blue-600">GRI-302-1</span></label>
                    <input
                      type="number"
                      value={formData.environmental.energyConsumption}
                      onChange={(e) => handleChange('environmental', 'energyConsumption', e.target.value)}
                      className={`w-full border rounded-md px-4 py-2 ${theme.bg.input} ${theme.border.input} ${theme.text.primary}`}
                      placeholder="95000"
                    />
                    <p className="text-xs text-gray-500 mt-1">Total energy used in mining operations</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className={`text-2xl font-bold ${theme.text.primary} mb-2`}>👥 Advanced Social & Community Metrics</h3>
                <p className={`${theme.text.secondary}`}>Workforce diversity, mining safety, community relations, stakeholder engagement, and local employment tracking</p>
                <button
                  type="button"
                  onClick={() => setShowAdvancedEntry(true)}
                  className="mt-3 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg transition-all"
                >
                  🚀 Open Advanced Data Entry
                </button>
              </div>
              <div className={`p-6 rounded-lg ${theme.bg.subtle}`}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium ${theme.text.secondary} mb-1`}>Fatality Rate (per 200,000 hours) <span className="text-xs text-red-600">GRI-403-9</span></label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.social.fatalityRate}
                      onChange={(e) => handleChange('social', 'fatalityRate', e.target.value)}
                      className={`w-full border rounded-md px-4 py-2 ${theme.bg.input} ${theme.border.input} ${theme.text.primary}`}
                      placeholder="0.02"
                    />
                    <p className="text-xs text-gray-500 mt-1">Critical mining safety metric</p>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${theme.text.secondary} mb-1`}>Lost Time Injury Rate <span className="text-xs text-blue-600">GRI-403-9</span></label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.social.lostTimeInjuryRate}
                      onChange={(e) => handleChange('social', 'lostTimeInjuryRate', e.target.value)}
                      className={`w-full border rounded-md px-4 py-2 ${theme.bg.input} ${theme.border.input} ${theme.text.primary}`}
                      placeholder="1.2"
                    />
                    <p className="text-xs text-gray-500 mt-1">Workplace injury frequency</p>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${theme.text.secondary} mb-1`}>Local Employment (%) <span className="text-xs text-blue-600">GRI-413</span></label>
                    <input
                      type="number"
                      value={formData.social.localEmploymentPercentage}
                      onChange={(e) => handleChange('social', 'localEmploymentPercentage', e.target.value)}
                      className={`w-full border rounded-md px-4 py-2 ${theme.bg.input} ${theme.border.input} ${theme.text.primary}`}
                      placeholder="75"
                      min="0"
                      max="100"
                    />
                    <p className="text-xs text-gray-500 mt-1">Percentage of local community hires</p>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${theme.text.secondary} mb-1`}>Community Grievances (count) <span className="text-xs text-blue-600">GRI-413</span></label>
                    <input
                      type="number"
                      value={formData.social.communityGrievances}
                      onChange={(e) => handleChange('social', 'communityGrievances', e.target.value)}
                      className={`w-full border rounded-md px-4 py-2 ${theme.bg.input} ${theme.border.input} ${theme.text.primary}`}
                      placeholder="8"
                    />
                    <p className="text-xs text-gray-500 mt-1">Formal complaints from local communities</p>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${theme.text.secondary} mb-1`}>Total Mine Workers <span className="text-xs text-blue-600">GRI-2-7</span></label>
                    <input
                      type="number"
                      value={formData.social.totalEmployees}
                      onChange={(e) => handleChange('social', 'totalEmployees', e.target.value)}
                      className={`w-full border rounded-md px-4 py-2 ${theme.bg.input} ${theme.border.input} ${theme.text.primary}`}
                      placeholder="3500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Total workforce at mining site</p>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${theme.text.secondary} mb-1`}>Female Workers (%) <span className="text-xs text-blue-600">GRI-405-1</span></label>
                    <input
                      type="number"
                      value={formData.social.femaleEmployeesPercentage}
                      onChange={(e) => handleChange('social', 'femaleEmployeesPercentage', e.target.value)}
                      className={`w-full border rounded-md px-4 py-2 ${theme.bg.input} ${theme.border.input} ${theme.text.primary}`}
                      placeholder="28"
                      min="0"
                      max="100"
                    />
                    <p className="text-xs text-gray-500 mt-1">Gender diversity in mining workforce</p>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${theme.text.secondary} mb-1`}>Safety Training Hours/Worker <span className="text-xs text-blue-600">GRI-403</span></label>
                    <input
                      type="number"
                      value={formData.social.safetyTrainingHours}
                      onChange={(e) => handleChange('social', 'safetyTrainingHours', e.target.value)}
                      className={`w-full border rounded-md px-4 py-2 ${theme.bg.input} ${theme.border.input} ${theme.text.primary}`}
                      placeholder="80"
                    />
                    <p className="text-xs text-gray-500 mt-1">Annual safety training per worker</p>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${theme.text.secondary} mb-1`}>Community Investment (USD) <span className="text-xs text-blue-600">GRI-413</span></label>
                    <input
                      type="number"
                      value={formData.social.communityInvestment}
                      onChange={(e) => handleChange('social', 'communityInvestment', e.target.value)}
                      className={`w-full border rounded-md px-4 py-2 ${theme.bg.input} ${theme.border.input} ${theme.text.primary}`}
                      placeholder="500000"
                    />
                    <p className="text-xs text-gray-500 mt-1">Investment in local community development</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className={`text-2xl font-bold ${theme.text.primary} mb-2`}>⚖️ Advanced Governance & Investment</h3>
                <p className={`${theme.text.secondary}`}>Board composition, ISSB S1/S2 disclosures, ESG ratings (MSCI/Sustainalytics), FDI tracking, and ESG-linked financing</p>
                <button
                  type="button"
                  onClick={() => setShowAdvancedEntry(true)}
                  className="mt-3 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:shadow-lg transition-all"
                >
                  🚀 Open Advanced Data Entry
                </button>
              </div>
              <div className={`p-6 rounded-lg ${theme.bg.subtle}`}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium ${theme.text.secondary} mb-1`}>Climate Risk Disclosure Score <span className="text-xs text-blue-600">IFRS-S2</span></label>
                    <input
                      type="number"
                      value={formData.governance.climateRiskDisclosure}
                      onChange={(e) => handleChange('governance', 'climateRiskDisclosure', e.target.value)}
                      className={`w-full border rounded-md px-4 py-2 ${theme.bg.input} ${theme.border.input} ${theme.text.primary}`}
                      placeholder="85"
                      min="0"
                      max="100"
                    />
                    <p className="text-xs text-gray-500 mt-1">Climate-related financial disclosure quality (0-100)</p>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${theme.text.secondary} mb-1`}>Sustainability Governance Score <span className="text-xs text-blue-600">IFRS-S1</span></label>
                    <input
                      type="number"
                      value={formData.governance.sustainabilityGovernance}
                      onChange={(e) => handleChange('governance', 'sustainabilityGovernance', e.target.value)}
                      className={`w-full border rounded-md px-4 py-2 ${theme.bg.input} ${theme.border.input} ${theme.text.primary}`}
                      placeholder="78"
                      min="0"
                      max="100"
                    />
                    <p className="text-xs text-gray-500 mt-1">ESG governance structure effectiveness (0-100)</p>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${theme.text.secondary} mb-1`}>Board Size <span className="text-xs text-blue-600">GRI-2-9</span></label>
                    <input
                      type="number"
                      value={formData.governance.boardSize}
                      onChange={(e) => handleChange('governance', 'boardSize', e.target.value)}
                      className={`w-full border rounded-md px-4 py-2 ${theme.bg.input} ${theme.border.input} ${theme.text.primary}`}
                      placeholder="11"
                    />
                    <p className="text-xs text-gray-500 mt-1">Total board members</p>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${theme.text.secondary} mb-1`}>Independent Directors (%) <span className="text-xs text-blue-600">IFRS-S1</span></label>
                    <input
                      type="number"
                      value={formData.governance.independentDirectorsPercentage}
                      onChange={(e) => handleChange('governance', 'independentDirectorsPercentage', e.target.value)}
                      className={`w-full border rounded-md px-4 py-2 ${theme.bg.input} ${theme.border.input} ${theme.text.primary}`}
                      placeholder="70"
                      min="0"
                      max="100"
                    />
                    <p className="text-xs text-gray-500 mt-1">Board independence percentage</p>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${theme.text.secondary} mb-1`}>Female Directors (%) <span className="text-xs text-blue-600">GRI-405-1</span></label>
                    <input
                      type="number"
                      value={formData.governance.femaleDirectorsPercentage}
                      onChange={(e) => handleChange('governance', 'femaleDirectorsPercentage', e.target.value)}
                      className={`w-full border rounded-md px-4 py-2 ${theme.bg.input} ${theme.border.input} ${theme.text.primary}`}
                      placeholder="36"
                      min="0"
                      max="100"
                    />
                    <p className="text-xs text-gray-500 mt-1">Gender diversity on board</p>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${theme.text.secondary} mb-1`}>Ethics Training Completion (%) <span className="text-xs text-blue-600">GRI-205-2</span></label>
                    <input
                      type="number"
                      value={formData.governance.ethicsTrainingCompletion}
                      onChange={(e) => handleChange('governance', 'ethicsTrainingCompletion', e.target.value)}
                      className={`w-full border rounded-md px-4 py-2 ${theme.bg.input} ${theme.border.input} ${theme.text.primary}`}
                      placeholder="95"
                      min="0"
                      max="100"
                    />
                    <p className="text-xs text-gray-500 mt-1">Staff ethics training completion rate</p>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${theme.text.secondary} mb-1`}>Corruption Incidents <span className="text-xs text-blue-600">GRI-205-3</span></label>
                    <input
                      type="number"
                      value={formData.governance.corruptionIncidents}
                      onChange={(e) => handleChange('governance', 'corruptionIncidents', e.target.value)}
                      className={`w-full border rounded-md px-4 py-2 ${theme.bg.input} ${theme.border.input} ${theme.text.primary}`}
                      placeholder="0"
                      min="0"
                    />
                    <p className="text-xs text-gray-500 mt-1">Confirmed corruption cases</p>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${theme.text.secondary} mb-1`}>Anti-Corruption Policies <span className="text-xs text-blue-600">GRI-205</span></label>
                    <select
                      value={formData.governance.antiCorruptionPolicies}
                      onChange={(e) => handleChange('governance', 'antiCorruptionPolicies', e.target.value)}
                      className={`w-full border rounded-md px-4 py-2 ${theme.bg.input} ${theme.border.input} ${theme.text.primary}`}
                    >
                      <option value="">Select status</option>
                      <option value="implemented">Fully Implemented</option>
                      <option value="in_development">In Development</option>
                      <option value="not_implemented">Not Implemented</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">Anti-corruption policy status</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 5 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className={`text-2xl font-bold ${theme.text.primary} mb-2`}>📋 Review & Submit</h3>
                <p className={`${theme.text.secondary}`}>Review your ESG data before submission</p>
              </div>
              
              {/* Company Information Summary */}
              <div className={`p-6 rounded-lg ${theme.bg.subtle} mb-6`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-lg font-bold ${theme.text.primary}`}>🏢 Company Information</h3>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    ✏️ Edit Company Info
                  </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <span className={`text-sm ${theme.text.secondary}`}>Company:</span>
                    <p className={`font-medium ${theme.text.primary}`}>{formData.companyInfo.companyName || 'Not set'}</p>
                  </div>
                  <div>
                    <span className={`text-sm ${theme.text.secondary}`}>Year:</span>
                    <p className={`font-medium ${theme.text.primary}`}>{formData.companyInfo.reportingYear}</p>
                  </div>
                  <div>
                    <span className={`text-sm ${theme.text.secondary}`}>Sector:</span>
                    <p className={`font-medium ${theme.text.primary}`}>{formData.companyInfo.sector || 'Not set'}</p>
                  </div>
                  <div>
                    <span className={`text-sm ${theme.text.secondary}`}>Framework:</span>
                    <p className={`font-medium ${theme.text.primary}`}>{formData.companyInfo.reportingFramework}</p>
                  </div>
                </div>
              </div>

              {/* ESG Data Summary */}
              <div className={`p-6 rounded-lg ${theme.bg.subtle}`}>
                <h3 className={`text-lg font-bold ${theme.text.primary} mb-4`}>ESG Data Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className={`p-4 rounded border ${theme.bg.card} ${theme.border.primary}`}>
                    <h4 className={`font-medium ${theme.text.primary} mb-3 flex items-center gap-2`}>
                      🌱 Environmental Metrics
                    </h4>
                    <div className={`text-sm ${theme.text.secondary} space-y-2`}>
                      <div className="flex justify-between">
                        <span>Scope 1 Emissions:</span>
                        <span className="font-medium">{formData.environmental.scope1Emissions || 'Not set'} {formData.environmental.scope1Emissions && 'tCO2e'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Scope 2 Emissions:</span>
                        <span className="font-medium">{formData.environmental.scope2Emissions || 'Not set'} {formData.environmental.scope2Emissions && 'tCO2e'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Scope 3 Emissions:</span>
                        <span className="font-medium">{formData.environmental.scope3Emissions || 'Not set'} {formData.environmental.scope3Emissions && 'tCO2e'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Energy Consumption:</span>
                        <span className="font-medium">{formData.environmental.energyConsumption || 'Not set'} {formData.environmental.energyConsumption && 'MWh'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Renewable Energy:</span>
                        <span className="font-medium">{formData.environmental.renewableEnergyPercentage || 'Not set'} {formData.environmental.renewableEnergyPercentage && '%'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Water Withdrawal:</span>
                        <span className="font-medium">{formData.environmental.waterWithdrawal || 'Not set'} {formData.environmental.waterWithdrawal && 'm³'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Waste Generated:</span>
                        <span className="font-medium">{formData.environmental.wasteGenerated || 'Not set'} {formData.environmental.wasteGenerated && 'tonnes'}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className={`p-4 rounded border ${theme.bg.card} ${theme.border.primary}`}>
                    <h4 className={`font-medium ${theme.text.primary} mb-3 flex items-center gap-2`}>
                      👥 Social Metrics
                    </h4>
                    <div className={`text-sm ${theme.text.secondary} space-y-2`}>
                      <div className="flex justify-between">
                        <span>Total Employees:</span>
                        <span className="font-medium">{formData.social.totalEmployees || 'Not set'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Female Employees:</span>
                        <span className="font-medium">{formData.social.femaleEmployeesPercentage || 'Not set'} {formData.social.femaleEmployeesPercentage && '%'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Injury Rate:</span>
                        <span className="font-medium">{formData.social.lostTimeInjuryRate || 'Not set'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Training Hours:</span>
                        <span className="font-medium">{formData.social.trainingHoursPerEmployee || 'Not set'} {formData.social.trainingHoursPerEmployee && 'hrs/employee'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Community Investment:</span>
                        <span className="font-medium">{formData.social.communityInvestment || 'Not set'} {formData.social.communityInvestment && '$'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Employee Turnover:</span>
                        <span className="font-medium">{formData.social.employeeTurnoverRate || 'Not set'} {formData.social.employeeTurnoverRate && '%'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Safety Training:</span>
                        <span className="font-medium">{formData.social.safetyTrainingHours || 'Not set'} {formData.social.safetyTrainingHours && 'hrs'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Diversity Training:</span>
                        <span className="font-medium">{formData.social.diversityTrainingCompletion || 'Not set'} {formData.social.diversityTrainingCompletion && '%'}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className={`p-4 rounded border ${theme.bg.card} ${theme.border.primary}`}>
                    <h4 className={`font-medium ${theme.text.primary} mb-3 flex items-center gap-2`}>
                      ⚖️ Governance Metrics
                    </h4>
                    <div className={`text-sm ${theme.text.secondary} space-y-2`}>
                      <div className="flex justify-between">
                        <span>Board Size:</span>
                        <span className="font-medium">{formData.governance.boardSize || 'Not set'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Independent Directors:</span>
                        <span className="font-medium">{formData.governance.independentDirectorsPercentage || 'Not set'} {formData.governance.independentDirectorsPercentage && '%'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Female Directors:</span>
                        <span className="font-medium">{formData.governance.femaleDirectorsPercentage || 'Not set'} {formData.governance.femaleDirectorsPercentage && '%'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Ethics Training:</span>
                        <span className="font-medium">{formData.governance.ethicsTrainingCompletion || 'Not set'} {formData.governance.ethicsTrainingCompletion && '%'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Corruption Incidents:</span>
                        <span className="font-medium">{formData.governance.corruptionIncidents || 'Not set'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Data Breaches:</span>
                        <span className="font-medium">{formData.governance.dataBreachIncidents || 'Not set'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Cybersecurity Investment:</span>
                        <span className="font-medium">{formData.governance.cybersecurityInvestment || 'Not set'} {formData.governance.cybersecurityInvestment && '$'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Supplier Assessments:</span>
                        <span className="font-medium">{formData.governance.supplierESGAssessments || 'Not set'} {formData.governance.supplierESGAssessments && '%'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Anti-Corruption Policies:</span>
                        <span className="font-medium">{formData.governance.antiCorruptionPolicies || 'Not set'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Data Privacy Policies:</span>
                        <span className="font-medium">{formData.governance.dataPrivacyPolicies || 'Not set'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Data Completeness Check */}
              <div className={`p-4 rounded-lg border-l-4 border-blue-500 ${theme.bg.subtle}`}>
                <h4 className={`font-medium ${theme.text.primary} mb-2`}>📊 Data Completeness</h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className={`${theme.text.secondary}`}>Environmental:</span>
                    <span className={`ml-2 px-2 py-1 rounded text-xs ${
                      Object.values(formData.environmental).filter(v => v !== '').length >= 3 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {Object.values(formData.environmental).filter(v => v !== '').length}/7 fields
                    </span>
                  </div>
                  <div>
                    <span className={`${theme.text.secondary}`}>Social:</span>
                    <span className={`ml-2 px-2 py-1 rounded text-xs ${
                      Object.values(formData.social).filter(v => v !== '').length >= 4 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {Object.values(formData.social).filter(v => v !== '').length}/8 fields
                    </span>
                  </div>
                  <div>
                    <span className={`${theme.text.secondary}`}>Governance:</span>
                    <span className={`ml-2 px-2 py-1 rounded text-xs ${
                      Object.values(formData.governance).filter(v => v !== '').length >= 5 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {Object.values(formData.governance).filter(v => v !== '').length}/10 fields
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}











          {/* Step Navigation Buttons */}
          <div className={`pt-8 flex justify-between items-center border-t ${theme.border.primary}`}>
            <div className="flex gap-3">
              {currentStep > 1 && (
                <Button
                  variant="outline"
                  onClick={prevStep}
                  icon="←"
                >
                  Previous
                </Button>
              )}
            </div>
            
            <div className="flex gap-3">
              {currentStep === 5 && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      const validation = performFullValidation(formData);
                      setValidationResults(validation);
                      setShowValidationPanel(true);
                      
                      // Push validation errors to notifications
                      const alerts = JSON.parse(localStorage.getItem('recentAlerts') || '[]');
                      
                      if (validation.summary.totalCritical > 0) {
                        alerts.unshift({
                          id: Date.now(),
                          type: 'error',
                          title: 'Critical Validation Issues',
                          message: `${validation.summary.totalCritical} critical issues found in ESG data`,
                          category: 'Validation',
                          timestamp: new Date().toISOString(),
                          read: false
                        });
                      }
                      
                      if (validation.summary.totalErrors > 0) {
                        alerts.unshift({
                          id: Date.now() + 1,
                          type: 'warning',
                          title: 'Validation Errors Detected',
                          message: `${validation.summary.totalErrors} errors found in ESG data`,
                          category: 'Validation',
                          timestamp: new Date().toISOString(),
                          read: false
                        });
                      }
                      
                      if (validation.summary.totalWarnings > 0) {
                        alerts.unshift({
                          id: Date.now() + 2,
                          type: 'info',
                          title: 'Validation Warnings',
                          message: `${validation.summary.totalWarnings} warnings found in ESG data`,
                          category: 'Validation',
                          timestamp: new Date().toISOString(),
                          read: false
                        });
                      }
                      
                      if (validation.summary.totalCritical === 0 && validation.summary.totalErrors === 0 && validation.summary.totalWarnings === 0) {
                        alerts.unshift({
                          id: Date.now(),
                          type: 'success',
                          title: 'Validation Passed',
                          message: 'All ESG data validation checks passed successfully',
                          category: 'Validation',
                          timestamp: new Date().toISOString(),
                          read: false
                        });
                      }
                      
                      localStorage.setItem('recentAlerts', JSON.stringify(alerts));
                    }}
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
                  >
                    ✓ Validate Data
                  </button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      const compliance = DataValidation.validateDataCompleteness(formData);
                      showToast(`Framework Compliance: ${compliance.score}%`, 'info');
                    }}
                    icon="🔍"
                  >
                    Check Compliance
                  </Button>
                </>
              )}
              
              <div className="flex gap-3">
                {currentStep === 1 && (
                  <button type="button" onClick={() => {
                    setCurrentStep(2);
                    setCompletedSteps(prev => new Set([...prev, 1]));
                  }} className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    Next: Environmental →
                  </button>
                )}
                {currentStep === 2 && (
                  <button type="button" onClick={() => {
                    setCurrentStep(3);
                    setCompletedSteps(prev => new Set([...prev, 2]));
                  }} className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    Next: Social →
                  </button>
                )}
                {currentStep === 3 && (
                  <button type="button" onClick={() => {
                    setCurrentStep(4);
                    setCompletedSteps(prev => new Set([...prev, 3]));
                  }} className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    Next: Governance →
                  </button>
                )}
                {currentStep === 4 && (
                  <button type="button" onClick={() => {
                    setCurrentStep(5);
                    setCompletedSteps(prev => new Set([...prev, 4]));
                  }} className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    Next: Review & Submit →
                  </button>
                )}
                {currentStep === 5 && (
                  <button 
                    type="submit" 
                    disabled={isSaving || !formData.companyInfo.companyName.trim()}
                    className={`px-6 py-2 rounded-md font-medium transition-colors duration-200 ${
                      isSaving || !formData.companyInfo.companyName.trim()
                        ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                        : 'bg-green-600 text-white hover:bg-green-700 active:bg-green-800'
                    }`}
                  >
                    {isSaving ? (
                      <span className="flex items-center gap-2">
                        <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
                        Submitting...
                      </span>
                    ) : (
                      '✓ Submit Assessment'
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </form>

        {/* Enhanced Bulk Import Section - Only show on first step */}
        {currentStep === 1 && (
          <div className={`p-6 rounded-xl shadow-lg mt-8 ${theme.bg.card}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📂</span>
                <div>
                  <h3 className={`text-xl font-semibold ${theme.text.primary}`}>Advanced Bulk Data Import</h3>
                  <p className={`text-sm ${theme.text.secondary}`}>Industry-standard ESG data import with validation</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    const template = generateTemplate();
                    downloadTemplate(template);
                    showToast('Template downloaded successfully!', 'success');
                  }}
                  icon="📥"
                  size="sm"
                >
                  Download Template
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    const sample = generateSampleData();
                    downloadTemplate(sample, 'ESG-Sample-Data.xlsx');
                    showToast('Sample data downloaded!', 'success');
                  }}
                  icon="📋"
                  size="sm"
                >
                  Sample Data
                </Button>
              </div>
            </div>

            {/* Import Methods */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Drag & Drop Area */}
              <div
                onDrop={onDrop}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                className={`border-2 ${dragOver ? "border-blue-500 bg-blue-50" : `border-dashed ${theme.border.primary}`} p-6 rounded-lg text-center cursor-pointer relative ${theme.bg.subtle} transition-all duration-200 hover:border-blue-400`}
              >
                <div className="flex flex-col items-center gap-3">
                  <span className="text-4xl">📁</span>
                  <div>
                    <p className={`font-medium ${theme.text.primary}`}>Drag & Drop Files</p>
                    <p className={`text-sm ${theme.text.secondary}`}>or click to browse</p>
                  </div>
                  <input
                    type="file"
                    accept=".xlsx,.csv,.json"
                    onChange={onFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    multiple
                  />
                  <div className={`text-xs ${theme.text.muted}`}>
                    Supports: .xlsx, .csv, .json
                  </div>
                </div>
                
                {/* Enhanced Progress Bar */}
                {uploadProgress > 0 && (
                  <div className="absolute bottom-0 left-0 w-full">
                    <div className="flex items-center justify-between px-2 py-1 bg-white bg-opacity-90">
                      <span className="text-xs font-medium">Processing...</span>
                      <span className="text-xs">{uploadProgress}%</span>
                    </div>
                    <div className="h-1 bg-gray-200">
                      <div 
                        className="h-1 bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Import Options */}
              <div className={`p-6 rounded-lg ${theme.bg.subtle}`}>
                <h4 className={`font-semibold ${theme.text.primary} mb-3`}>Import Options</h4>
                <div className="space-y-3">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span className={`text-sm ${theme.text.secondary}`}>Validate data on import</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span className={`text-sm ${theme.text.secondary}`}>Skip duplicate entries</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" />
                    <span className={`text-sm ${theme.text.secondary}`}>Auto-map columns</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span className={`text-sm ${theme.text.secondary}`}>Generate audit log</span>
                  </label>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h5 className={`text-sm font-medium ${theme.text.primary} mb-2`}>Framework Mapping</h5>
                  <select className={`w-full text-sm border rounded px-2 py-1 ${theme.bg.input} ${theme.border.input}`}>
                    <option value="auto">Auto-detect framework</option>
                    <option value="GRI">GRI Standards</option>
                    <option value="SASB">SASB Standards</option>
                    <option value="TCFD">TCFD Framework</option>
                    <option value="CSRD">CSRD/ESRS</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Format Specifications */}
            <div className={`mt-6 p-4 rounded-lg ${theme.bg.subtle} border-l-4 border-blue-500`}>
              <h4 className={`font-semibold ${theme.text.primary} mb-2`}>📋 Data Format Requirements</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className={`font-medium ${theme.text.primary} mb-1`}>Required Columns:</p>
                  <ul className={`${theme.text.secondary} space-y-1`}>
                    <li>• <code className="bg-gray-100 px-1 rounded">CompanyName</code> - Company identifier</li>
                    <li>• <code className="bg-gray-100 px-1 rounded">Category</code> - Environmental/Social/Governance</li>
                    <li>• <code className="bg-gray-100 px-1 rounded">Metric</code> - Specific ESG metric name</li>
                    <li>• <code className="bg-gray-100 px-1 rounded">Value</code> - Numeric value</li>
                  </ul>
                </div>
                <div>
                  <p className={`font-medium ${theme.text.primary} mb-1`}>Optional Columns:</p>
                  <ul className={`${theme.text.secondary} space-y-1 text-xs`}>
                    <li>• <code className="bg-gray-100 px-1 rounded">Unit</code> - Measurement unit</li>
                    <li>• <code className="bg-gray-100 px-1 rounded">FrameworkCode</code> - GRI-305-1, SASB-EM-GHG</li>
                    <li>• <code className="bg-gray-100 px-1 rounded">ReportingYear</code> - Data year</li>
                    <li>• <code className="bg-gray-100 px-1 rounded">Description</code> - Additional context</li>
                    <li>• <code className="bg-gray-100 px-1 rounded">Sector</code> - Industry sector</li>
                    <li>• <code className="bg-gray-100 px-1 rounded">Region</code> - Geographic region</li>
                    <li>• <code className="bg-gray-100 px-1 rounded">DataSource</code> - Source system/method</li>
                    <li>• <code className="bg-gray-100 px-1 rounded">Verified</code> - true/false verification status</li>
                    <li>• <code className="bg-gray-100 px-1 rounded">Notes</code> - Additional notes</li>
                  </ul>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-4 text-xs">
                <span className={`px-2 py-1 rounded ${isDark ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-800'}`}>✓ CSRD Compatible</span>
                <span className={`px-2 py-1 rounded ${isDark ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-800'}`}>✓ GRI Aligned</span>
                <span className={`px-2 py-1 rounded ${isDark ? 'bg-purple-900 text-purple-300' : 'bg-purple-100 text-purple-800'}`}>✓ SASB Ready</span>
              </div>
            </div>
          </div>
        )}

        {/* Site Hierarchy Manager Modal */}
        {showSiteManager && (
          <SiteHierarchyManager
            onClose={() => setShowSiteManager(false)}
            onSiteSelect={(site) => {
              setSelectedSite(site);
              setFormData(prev => ({
                ...prev,
                companyInfo: { ...prev.companyInfo, siteId: site.id, siteName: site.name }
              }));
              setShowSiteManager(false);
              showToast(`Selected: ${site.name}`, 'success');
            }}
          />
        )}

        {/* Unified Advanced Data Entry Modal */}
        {showAdvancedEntry && (
          <UnifiedAdvancedEntry onClose={() => setShowAdvancedEntry(false)} />
        )}

        {/* Audit Trail Viewer */}
        {showAuditTrail && (
          <AuditTrailViewer onClose={() => setShowAuditTrail(false)} />
        )}

        {/* Approval Workflow */}
        {showApprovals && (
          <ApprovalWorkflow onClose={() => setShowApprovals(false)} />
        )}

        {/* Evidence Uploader */}
        {showEvidence && (
          <EvidenceUploader onClose={() => setShowEvidence(false)} />
        )}

        {/* Validation Panel */}
        {showValidationPanel && validationResults && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`max-w-4xl w-full max-h-[90vh] overflow-y-auto ${theme.bg.card} rounded-xl shadow-2xl`}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className={`text-2xl font-bold ${theme.text.primary}`}>⚠️ Validation Results</h2>
                  <button onClick={() => setShowValidationPanel(false)} className="text-2xl">✕</button>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className={`p-4 rounded-lg ${validationResults.summary.totalCritical > 0 ? 'bg-red-100' : 'bg-gray-100'}`}>
                    <div className="text-2xl font-bold text-red-600">{validationResults.summary.totalCritical}</div>
                    <div className="text-sm">Critical Issues</div>
                  </div>
                  <div className={`p-4 rounded-lg ${validationResults.summary.totalErrors > 0 ? 'bg-orange-100' : 'bg-gray-100'}`}>
                    <div className="text-2xl font-bold text-orange-600">{validationResults.summary.totalErrors}</div>
                    <div className="text-sm">Errors</div>
                  </div>
                  <div className={`p-4 rounded-lg ${validationResults.summary.totalWarnings > 0 ? 'bg-yellow-100' : 'bg-gray-100'}`}>
                    <div className="text-2xl font-bold text-yellow-600">{validationResults.summary.totalWarnings}</div>
                    <div className="text-sm">Warnings</div>
                  </div>
                </div>

                <div className={`p-4 rounded-lg ${theme.bg.subtle} mb-6`}>
                  <h3 className={`font-semibold ${theme.text.primary} mb-2`}>GRI Completeness: {validationResults.summary.griCompletenessScore}%</h3>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div className="bg-green-500 h-3 rounded-full" style={{width: `${validationResults.summary.griCompletenessScore}%`}}></div>
                  </div>
                </div>

                {validationResults.crossField.errors.length > 0 && (
                  <div className="mb-4">
                    <h3 className="font-semibold text-red-600 mb-2">Cross-Field Errors</h3>
                    {validationResults.crossField.errors.map((err, i) => (
                      <div key={i} className="p-3 bg-red-50 border-l-4 border-red-500 mb-2">
                        <div className="font-medium">{err.field}</div>
                        <div className="text-sm">{err.message}</div>
                      </div>
                    ))}
                  </div>
                )}

                {validationResults.thresholds.filter(a => a.severity === 'critical' || a.severity === 'error').length > 0 && (
                  <div className="mb-4">
                    <h3 className="font-semibold text-orange-600 mb-2">Threshold Violations</h3>
                    {validationResults.thresholds.filter(a => a.severity === 'critical' || a.severity === 'error').map((alert, i) => (
                      <div key={i} className={`p-3 border-l-4 mb-2 ${alert.severity === 'critical' ? 'bg-red-50 border-red-500' : 'bg-orange-50 border-orange-500'}`}>
                        <div className="font-medium">{alert.field}</div>
                        <div className="text-sm">{alert.message}</div>
                      </div>
                    ))}
                  </div>
                )}

                {validationResults.crossField.warnings.length > 0 && (
                  <div className="mb-4">
                    <h3 className="font-semibold text-yellow-600 mb-2">Warnings</h3>
                    {validationResults.crossField.warnings.map((warn, i) => (
                      <div key={i} className="p-3 bg-yellow-50 border-l-4 border-yellow-500 mb-2">
                        <div className="font-medium">{warn.field}</div>
                        <div className="text-sm">{warn.message}</div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-3 justify-end mt-6">
                  <button onClick={() => setShowValidationPanel(false)} className="px-4 py-2 bg-gray-300 rounded-lg">Close</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Toast Notifications */}
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
}

export default DataEntry;
