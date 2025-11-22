import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, BarChart, Bar } from "recharts";
import { getStoredData, initializeStorage } from "./utils/storage";
import esgAPI from "./api/esgAPI";
import APIService from "./services/apiService";
import companyLogo from "./companyLogo.jpg";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useTheme } from "./contexts/ThemeContext";
import { getThemeClasses } from "./utils/themeUtils";
import ProfessionalHeader from "./components/ProfessionalHeader";
import { MetricCard, StatusCard } from "./components/ProfessionalCard";
import { Alert, Button, Input, Modal, Toast } from "./components/ProfessionalUX";
import { RBACManager, PERMISSIONS } from "./utils/rbac";
import { ESG_FRAMEWORKS, AI_INSIGHTS_ENGINE, REGULATORY_COMPLIANCE } from "./utils/enhancedFrameworks";
import { validateFrameworkCompliance, generateFrameworkReport } from "./utils/frameworkMapper";
import FrameworkCompliance from "./components/FrameworkCompliance";
import FrameworkComplianceSummary from "./components/FrameworkComplianceSummary";
import FrameworkReportSelector from "./components/FrameworkReportSelector";
import { generateESGPDF } from "./utils/pdfGenerator";
import { generateProfessionalESGReport } from "./utils/professionalPDFGenerator";
import { generateExecutiveProfessionalReport } from "./utils/enhancedProfessionalPDF";
import { generateGRIPDF, generateSASBPDF, generateTCFDPDF, generateBRSRPDF, generateEUTaxonomyPDF } from "./utils/frameworkPDFGenerators";
import ProfessionalReportTemplate from "./components/ProfessionalReportTemplate";
import CustomReportBuilder from "./components/CustomReportBuilder";
// sample data removed: no dummy/sample data should be auto-loaded in Reports
import { ReportGenerator } from "./utils/reportGenerator";


const COLORS = ["#3a7a44", "#6b7bd6", "#ffbb28", "#ff8042"];



// --- ESG Data Normalization and Aggregation ---
function normalizeData(data) {
  return data
    .map((item, originalIndex) => {
      let year = null;
      
      // Priority order: reportingYear -> timestamp -> current year
      if (item.reportingYear && !isNaN(parseInt(item.reportingYear))) {
        year = parseInt(item.reportingYear);
      } else if (item.timestamp) {
        try {
          year = new Date(item.timestamp).getFullYear();
        } catch {
          year = new Date().getFullYear();
        }
      } else {
        year = new Date().getFullYear();
      }
      
      // Handle both old format (category/value) and new format (nested objects)
      if (item.environmental || item.social || item.governance) {
        // New format from DataEntry form submission
        const results = [];
        ['environmental', 'social', 'governance'].forEach(cat => {
          if (item[cat]) {
            Object.entries(item[cat]).forEach(([key, value]) => {
              if (key !== 'description' && value !== '' && !isNaN(parseFloat(value))) {
                results.push({
                  ...item,
                  category: cat,
                  metric: key,
                  value: parseFloat(value),
                  year,
                  companyName: item.companyName,
                  sector: item.sector,
                  region: item.region,
                  _originalIndex: originalIndex
                });
              }
            });
          }
        });
        return results;
      } else {
        // Old format
        const category = (item.category || '').toLowerCase();
        const value = parseFloat(item.value);
        return [{
          ...item,
          year,
          category,
          value: isNaN(value) ? null : value,
          _originalIndex: originalIndex
        }];
      }
    })
    .flat()
    .filter(item => item.year && item.category && item.value !== null && ['environmental','social','governance'].includes(item.category));
}

function aggregateByYear(data) {
  // { [year]: { environmental: {sum, count}, ... } }
  const result = {};
  data.forEach(item => {
    if (!result[item.year]) {
      result[item.year] = {
        year: item.year,
        environmental: { sum: 0, count: 0 },
        social: { sum: 0, count: 0 },
        governance: { sum: 0, count: 0 }
      };
    }
    if (['environmental','social','governance'].includes(item.category)) {
      result[item.year][item.category].sum += item.value;
      result[item.year][item.category].count += 1;
    }
  });
  // Convert to array with averages
  return Object.values(result).map(yearObj => ({
    year: yearObj.year,
    environmental: yearObj.environmental.count ? (yearObj.environmental.sum / yearObj.environmental.count).toFixed(2) : '-',
    social: yearObj.social.count ? (yearObj.social.sum / yearObj.social.count).toFixed(2) : '-',
    governance: yearObj.governance.count ? (yearObj.governance.sum / yearObj.governance.count).toFixed(2) : '-',
    average: [yearObj.environmental, yearObj.social, yearObj.governance].every(x => x.count)
      ? (((yearObj.environmental.sum / yearObj.environmental.count) + (yearObj.social.sum / yearObj.social.count) + (yearObj.governance.sum / yearObj.governance.count)) / 3).toFixed(2)
      : '-'
  })).sort((a, b) => a.year - b.year);
}

function aggregateOverall(data) {
  const agg = { environmental: { sum: 0, count: 0 }, social: { sum: 0, count: 0 }, governance: { sum: 0, count: 0 } };
  data.forEach(item => {
    if (['environmental','social','governance'].includes(item.category)) {
      agg[item.category].sum += item.value;
      agg[item.category].count += 1;
    }
  });
  const envAvg = agg.environmental.count ? (agg.environmental.sum / agg.environmental.count).toFixed(2) : '-';
  const socAvg = agg.social.count ? (agg.social.sum / agg.social.count).toFixed(2) : '-';
  const govAvg = agg.governance.count ? (agg.governance.sum / agg.governance.count).toFixed(2) : '-';
  const overall = [envAvg, socAvg, govAvg].every(x => x !== '-') ? (((+envAvg) + (+socAvg) + (+govAvg)) / 3).toFixed(2) : '-';
  return { environmental: envAvg, social: socAvg, governance: govAvg, overall };
}

// Remove duplicate entries. Keep latest entry when duplicates detected.
const dedupeEntries = (entries = []) => {
  const map = new Map();
  entries.forEach(e => {
    const key = e.id || `${e.companyName || ''}|${(e.category||'').toLowerCase()}|${e.metric||''}|${e.year||e.reportingYear||''}|${String(e.value)}`;
    const existing = map.get(key);
    if (!existing) {
      map.set(key, e);
    } else {
      const existingTime = new Date(existing.timestamp || existing.createdAt || 0).getTime();
      const newTime = new Date(e.timestamp || e.createdAt || 0).getTime();
      if (newTime >= existingTime) map.set(key, e);
    }
  });
  return Array.from(map.values());
};

function Reports() {
  const { isDark, toggleTheme } = useTheme();
  const theme = getThemeClasses(isDark);
  const [currentUser] = useState({ 
    role: localStorage.getItem('userRole') || 'esg_manager', 
    id: localStorage.getItem('currentUser') || 'user_123' 
  });
  const [data, setData] = useState([]);
  const [selectedReport, setSelectedReport] = useState("SEBI BRSR");
  const [filterStatus, setFilterStatus] = useState("All");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [yearlyData, setYearlyData] = useState([]);
  const [overallSummary, setOverallSummary] = useState({});
  const [showPreview, setShowPreview] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItems, setSelectedItems] = useState([]);
  const [sortField, setSortField] = useState('timestamp');
  const [sortOrder, setSortOrder] = useState('desc');
  const [toast, setToast] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showProfessionalTemplate, setShowProfessionalTemplate] = useState(false);
  const [showCustomReportBuilder, setShowCustomReportBuilder] = useState(false);
  const [showPredictiveAnalytics, setShowPredictiveAnalytics] = useState(false);
  const [showIntegrations, setShowIntegrations] = useState(false);
  const [showFrameworkCompliance, setShowFrameworkCompliance] = useState(false);
  const [frameworkComplianceData, setFrameworkComplianceData] = useState({});
  const [complianceSummary, setComplianceSummary] = useState({});
  const [showFrameworkReports, setShowFrameworkReports] = useState(false);

  // Clear all data from localStorage
  const clearAllData = () => {
    if (window.confirm('Are you sure you want to clear all ESG data? This action cannot be undone.')) {
      try {
        // Clear all ESG-related localStorage keys
        const keysToRemove = [
          'esgData',
          'esg_database', 
          'suppliers',
          'sampleData',
          'dummyData',
          'testData'
        ];
        
        keysToRemove.forEach(key => {
          localStorage.removeItem(key);
        });
        
        // Reset component state
        setData([]);
        setYearlyData([]);
        setOverallSummary({});
        setComplianceSummary({});
        setFrameworkComplianceData({});
        
        showToast('All data cleared successfully', 'success');
        console.log('Cleared localStorage keys:', keysToRemove);
      } catch (error) {
        console.error('Error clearing data:', error);
        showToast('Error clearing data', 'error');
      }
    }
  };

  // Framework compliance analysis
  const analyzeFrameworkCompliance = () => {
    const griCompliance = validateFrameworkCompliance(data, 'GRI');
    const sasbCompliance = validateFrameworkCompliance(data, 'SASB');
    
    setFrameworkComplianceData({
      GRI: griCompliance,
      SASB: sasbCompliance
    });
    
    setShowFrameworkCompliance(true);
  };



  // Save full report (JSON) and trigger download
  const handleSaveFullReport = async () => {
    setIsGenerating(true);
    try {
      const esgData = await getStoredData();

      // Build report input expected by ReportGenerator
      const companyName = (esgData && esgData.length && esgData[0].companyName) || 'Company';
      const reportInput = {
        companyName,
        environmental: esgData.filter(e => e.category === 'environmental'),
        social: esgData.filter(e => e.category === 'social'),
        governance: esgData.filter(e => e.category === 'governance'),
        kpis: {},
        analytics: {}
      };

      const framework = (selectedReport && selectedReport.includes('GRI')) ? 'GRI' : selectedReport;
      const fullReport = ReportGenerator.generateESGReport(reportInput, framework);

      const blob = new Blob([JSON.stringify(fullReport, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const filename = `ESG-Full-Report-${selectedReport.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.json`;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      showToast('Full report downloaded', 'success');
    } catch (err) {
      console.error('Failed to save full report', err);
      showToast('Failed to download report', 'error');
    } finally {
      setIsGenerating(false);
    }
  };



  

  // Print the visible report summary (opens a new window with report content and calls print)
  const handlePrintReport = () => {
    const el = document.getElementById('report-summary');
    if (!el) {
      showToast('No report content to print', 'error');
      return;
    }

    const printWindow = window.open('', '_blank', 'width=1000,height=800');
    if (!printWindow) {
      showToast('Unable to open print window (popup blocked?)', 'error');
      return;
    }

    // Copy styles from current document
    const headHtml = Array.from(document.querySelectorAll('link[rel="stylesheet"], style')).map(node => node.outerHTML).join('\n');

    printWindow.document.open();
    printWindow.document.write(`<!doctype html><html><head><title>ESG Report - Print</title>${headHtml}</head><body>`);
    printWindow.document.write(el.innerHTML);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.focus();
    // Delay slightly to allow resources to load
    setTimeout(() => {
      printWindow.print();
      // Do not auto-close so user can inspect printed view; close automatically after short delay optionally
    }, 600);
  };


  const getEnvironmentalMetrics = () => {
    const normalized = normalizeData(data);
    const envData = normalized.filter(item => item.category === 'environmental');
    const metrics = [
      { name: 'Total Electricity Consumption', value: getMetricValue(envData, 'energyConsumption') + ' kWh' },
      { name: 'Renewable Electricity Consumption', value: getMetricValue(envData, 'renewableEnergyRatio') + ' kWh' },
      { name: 'Total Fuel Consumption', value: getMetricValue(envData, 'fuelConsumption') + ' liters' },
      { name: 'Carbon Emissions', value: getMetricValue(envData, 'carbonEmissions') + ' T CO2e' },
      { name: 'Water Usage', value: getMetricValue(envData, 'waterUsage') + ' cubic meters' },
      { name: 'Waste Management', value: getMetricValue(envData, 'wasteManagement') + ' tons' }
    ];
    return metrics.filter(m => m.value && String(m.value).trim() !== '' && !String(m.value).startsWith('0 '));
  };

  const getSocialMetrics = () => {
    const normalized = normalizeData(data);
    const socialData = normalized.filter(item => item.category === 'social');
    return [
      { name: 'Total Number of Employees', value: getMetricValue(socialData, 'totalEmployees') },
      { name: 'Female Employees Percentage', value: getMetricValue(socialData, 'femaleEmployeesPercentage') + ' %' },
      { name: 'Average Training Hours per Employee', value: getMetricValue(socialData, 'trainingHours') + ' hrs/yr' },
      { name: 'Community Investment Spend', value: getMetricValue(socialData, 'communityInvestment') + ' INR' },
      { name: 'Employee Turnover Rate', value: getMetricValue(socialData, 'employeeTurnover') + ' %' },
      { name: 'Workplace Safety Incidents', value: getMetricValue(socialData, 'workplaceSafety') }
    ].filter(m => m.value && String(m.value).trim() !== '' && !String(m.value).startsWith('0'));
  };

  const getGovernanceMetrics = () => {
    const normalized = normalizeData(data);
    const govData = normalized.filter(item => item.category === 'governance');
    return [
      { name: '% of Independent Board Members', value: getMetricValue(govData, 'boardDiversity') + ' %' },
      { name: 'Data Privacy Policy', value: getMetricValue(govData, 'dataPrivacyPolicy') ? 'Yes' : 'No' },
      { name: 'Total Revenue', value: getMetricValue(govData, 'totalRevenue') + ' INR' },
      { name: 'Ethics Violations', value: getMetricValue(govData, 'ethicsViolations') },
      { name: 'Transparency Score', value: getMetricValue(govData, 'transparencyScore') + ' %' },
      { name: 'Risk Management Score', value: getMetricValue(govData, 'riskManagement') + ' %' }
    ].filter(m => m.value && String(m.value).trim() !== '' && !String(m.value).startsWith('0'));
  };

  const getCalculatedMetrics = () => {
    const normalized = normalizeData(data);
    const envData = normalized.filter(item => item.category === 'environmental');
    const socialData = normalized.filter(item => item.category === 'social');
    const govData = normalized.filter(item => item.category === 'governance');
    
    const totalRevenue = getMetricValue(govData, 'totalRevenue');
    const carbonEmissions = getMetricValue(envData, 'carbonEmissions');
    const communityInvestment = getMetricValue(socialData, 'communityInvestment');
    const renewableRatio = getMetricValue(envData, 'renewableEnergyRatio');
    const diversityRatio = getMetricValue(socialData, 'femaleEmployeesPercentage');
    
    const metrics = [];
    
    if (carbonEmissions > 0 && totalRevenue > 0) {
      metrics.push({ name: 'Carbon Intensity', value: (carbonEmissions / totalRevenue).toFixed(6) + ' T CO2e/INR' });
    }
    
    if (renewableRatio > 0) {
      metrics.push({ name: 'Renewable Electricity Ratio', value: renewableRatio.toFixed(2) + ' %' });
    }
    
    if (diversityRatio > 0) {
      metrics.push({ name: 'Gender Diversity Ratio', value: diversityRatio.toFixed(0) + ' %' });
    }
    
    if (communityInvestment > 0 && totalRevenue > 0) {
      metrics.push({ name: 'Community Spend Ratio', value: ((communityInvestment / totalRevenue) * 100).toFixed(2) + ' %' });
    }
    
    return metrics;
  };

  const getMetricValue = (dataArray, metricName) => {
    // Try exact match first
    let item = dataArray.find(d => d.metric === metricName);
    
    // If no exact match, try case-insensitive partial match
    if (!item) {
      item = dataArray.find(d => 
        d.metric && d.metric.toLowerCase().includes(metricName.toLowerCase())
      );
    }
    
    // If still no match, try alternative common names
    if (!item) {
      const alternativeNames = {
        'energyConsumption': ['energy', 'electricity', 'power'],
        'carbonEmissions': ['carbon', 'emissions', 'co2', 'scope'],
        'waterUsage': ['water', 'withdrawal'],
        'wasteGenerated': ['waste', 'generated'],
        'wasteRecycled': ['recycled', 'recycling'],
        'totalEmployees': ['employees', 'workforce', 'headcount'],
        'femaleEmployeesPercentage': ['female', 'women', 'gender', 'diversity'],
        'boardDiversity': ['board', 'independent', 'directors']
      };
      
      const alternatives = alternativeNames[metricName] || [];
      item = dataArray.find(d => 
        alternatives.some(alt => d.metric && d.metric.toLowerCase().includes(alt))
      );
    }
    
    return item ? parseFloat(item.value) || 0 : 0;
  };

  const getTemplateContent = () => {
    const normalized = normalizeData(data);
    
    switch(selectedReport) {
      case "SEBI BRSR":
        const esgData = [
          { name: 'Environmental', value: parseFloat(overallSummary.environmental) || 0 },
          { name: 'Social', value: parseFloat(overallSummary.social) || 0 },
          { name: 'Governance', value: parseFloat(overallSummary.governance) || 0 }
        ].filter(item => item.value > 0);
        
        if (esgData.length === 0) {
          return (
            <div className="h-[250px] flex items-center justify-center text-gray-500">
              <div className="text-center">
                <p className="text-lg mb-2">🇮🇳</p>
                <p>No SEBI BRSR data available</p>
                <p className="text-sm">Add ESG data to generate BRSR compliance charts</p>
                <div className="mt-3">
                  <button
                    onClick={() => window.location.href = '/data-entry'}
                    className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                  >
                    Add Data
                  </button>
                </div>
              </div>
            </div>
          );
        }
        
        return (
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={esgData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Tooltip formatter={(value) => [`${value}`, 'Score']} />
                <Bar dataKey="value" fill="#059669" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        );
      
      case "GRI Standards":
        const griData = chartData();
        if (griData.length === 0) {
          return (
            <div className="h-[250px] flex items-center justify-center text-gray-500">
              <div className="text-center">
                <p className="text-lg mb-2">🌍</p>
                <p>No GRI Standards data available</p>
                <p className="text-sm">Add ESG data to generate GRI compliance charts</p>
                <div className="mt-3">
                  <button
                    onClick={() => window.location.href = '/data-entry'}
                    className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                  >
                    Add Data
                  </button>
                </div>
              </div>
            </div>
          );
        }
        const displayData = griData;
        
        return (
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <Pie
                  data={displayData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  dataKey="value"
                >
                  {displayData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        );
      
      case "Carbon Report":
        let carbonData = yearlyData.map(year => ({
          name: year.year.toString(),
          emissions: parseFloat(year.environmental) || 0
        }));
        
        if (carbonData.length === 0 || carbonData.every(d => d.emissions === 0)) {
          return (
            <div className="h-[250px] flex items-center justify-center text-gray-500">
              <div className="text-center">
                <p className="text-lg mb-2">🌍</p>
                <p>No carbon emissions data available</p>
                <p className="text-sm">Add environmental data to track emissions</p>
              </div>
            </div>
          );
        }
        
        return (
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={carbonData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value} T CO2e`, 'Emissions']} />
                <Line type="monotone" dataKey="emissions" stroke="#dc2626" strokeWidth={3} dot={{ fill: '#dc2626', strokeWidth: 2, r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        );
      
      case "Water Usage":
        const waterUsageMetrics = normalized.filter(item => 
          item.category === 'environmental' && 
          (item.metric === 'waterUsage' || item.metric === 'waterWithdrawal' || 
           item.metric === 'total_water_withdrawal' || item.metric.includes('water'))
        );
        
        // Group by month and sum values
        const waterByMonth = {};
        waterUsageMetrics.forEach(item => {
          const month = new Date(item.timestamp).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
          if (!waterByMonth[month]) {
            waterByMonth[month] = { usage: 0, count: 0 };
          }
          waterByMonth[month].usage += item.value;
          waterByMonth[month].count += 1;
        });
        
        let waterData = Object.entries(waterByMonth).map(([month, data]) => ({
          month,
          usage: Math.round(data.usage / data.count), // Average if multiple entries
          target: Math.round((data.usage / data.count) * 0.9)
        })).sort((a, b) => new Date(a.month) - new Date(b.month));
          
        if (waterData.length === 0) {
          return (
            <div className="h-[250px] flex items-center justify-center text-gray-500">
              <div className="text-center">
                <p className="text-lg mb-2">💧</p>
                <p>No water usage data available</p>
                <p className="text-sm">Add water management data to see usage trends</p>
              </div>
            </div>
          );
        }
        
        return (
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={waterData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value, name) => [`${value} m³`, name === 'usage' ? 'Usage' : 'Target']} />
                <Bar dataKey="usage" fill="#2563eb" name="Usage" radius={[4, 4, 0, 0]} />
                <Bar dataKey="target" fill="#93c5fd" name="Target" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        );
      
      case "Waste Management":
        const wasteMetrics = normalized.filter(item => 
          item.category === 'environmental' && 
          (item.metric.includes('waste') || item.metric === 'wasteGenerated' || item.metric === 'wasteRecycled')
        );
        
        let wasteData = [];
        if (wasteMetrics.length > 0) {
          wasteData = [
            { name: 'Recycled', value: getMetricValue(wasteMetrics, 'wasteRecycled') || 0, fill: '#059669' },
            { name: 'Generated', value: getMetricValue(wasteMetrics, 'wasteGenerated') || 0, fill: '#eab308' },
            { name: 'Management', value: getMetricValue(wasteMetrics, 'wasteManagement') || 0, fill: '#dc2626' }
          ].filter(item => item.value > 0);
        }
        
        if (wasteData.length === 0) {
          return (
            <div className="h-[250px] flex items-center justify-center text-gray-500">
              <div className="text-center">
                <p className="text-lg mb-2">♻️</p>
                <p>No waste management data available</p>
                <p className="text-sm">Add waste data to see management breakdown</p>
              </div>
            </div>
          );
        }
        
        return (
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <Pie
                  data={wasteData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  dataKey="value"
                >
                  {wasteData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} tons`, 'Waste']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        );
      
      case "TCFD":
        const tcfdMetrics = normalized.filter(item => 
          item.category === 'governance' && 
          (item.metric.includes('climate') || item.metric.includes('risk') || item.metric.includes('governance'))
        );
        
        if (tcfdMetrics.length === 0) {
          return (
            <div className="h-[250px] flex items-center justify-center text-gray-500">
              <div className="text-center">
                <p className="text-lg mb-2">🌡️</p>
                <p>No TCFD data available</p>
                <p className="text-sm">Add climate-related governance data</p>
              </div>
            </div>
          );
        }
        
        const climateMetrics = tcfdMetrics.filter(m => m.metric.includes('climate') || m.metric.includes('Climate') || m.metric.includes('risk') || m.metric.includes('Risk'));
        const scenarioMetrics = tcfdMetrics.filter(m => m.metric.includes('scenario') || m.metric.includes('Scenario'));
        const governanceMetrics = tcfdMetrics.filter(m => m.metric.includes('governance') || m.metric.includes('Governance') || m.metric.includes('board') || m.metric.includes('Board'));
        const targetMetrics = tcfdMetrics.filter(m => m.metric.includes('target') || m.metric.includes('Target') || m.metric.includes('metric') || m.metric.includes('Metric'));
        
        const tcfdData = [
          { name: 'Climate Risk Assessment', value: climateMetrics.length > 0 ? Math.round(Math.min(100, climateMetrics.reduce((sum, m) => sum + m.value, 0) / climateMetrics.length)) : 0 },
          { name: 'Scenario Analysis', value: scenarioMetrics.length > 0 ? Math.round(Math.min(100, scenarioMetrics.reduce((sum, m) => sum + m.value, 0) / scenarioMetrics.length)) : 0 },
          { name: 'Governance', value: governanceMetrics.length > 0 ? Math.round(Math.min(100, governanceMetrics.reduce((sum, m) => sum + m.value, 0) / governanceMetrics.length)) : 0 },
          { name: 'Metrics & Targets', value: targetMetrics.length > 0 ? Math.round(Math.min(100, targetMetrics.reduce((sum, m) => sum + m.value, 0) / targetMetrics.length)) : 0 }
        ].filter(item => item.value > 0);
        
        return (
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tcfdData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis domain={[0, 100]} />
                <Tooltip formatter={(value) => [`${value}%`, 'Compliance']} />
                <Bar dataKey="value" fill="#7c3aed" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        );
      
      case "SASB":
        const sasbEnvData = normalized.filter(item => item.category === 'environmental');
        const sasbSocialData = normalized.filter(item => item.category === 'social');
        
        if (sasbEnvData.length === 0 && sasbSocialData.length === 0) {
          return (
            <div className="h-[250px] flex items-center justify-center text-gray-500">
              <div className="text-center">
                <p className="text-lg mb-2">📋</p>
                <p>No SASB data available</p>
                <p className="text-sm">Add industry-specific sustainability data</p>
              </div>
            </div>
          );
        }
        
        const sasbEnergyMetrics = sasbEnvData.filter(m => m.metric.includes('energy') || m.metric.includes('Energy'));
        const sasbWaterMetrics = sasbEnvData.filter(m => m.metric.includes('water') || m.metric.includes('Water'));
        const sasbWasteMetrics = sasbEnvData.filter(m => m.metric.includes('waste') || m.metric.includes('Waste'));
        const sasbSafetyMetrics = sasbSocialData.filter(m => m.metric.includes('safety') || m.metric.includes('Safety') || m.metric.includes('health') || m.metric.includes('Health') || m.metric.includes('injury') || m.metric.includes('Injury'));
        
        const sasbData = [
          { name: 'Energy Management', value: sasbEnergyMetrics.length > 0 ? Math.round(sasbEnergyMetrics.reduce((sum, m) => sum + m.value, 0) / sasbEnergyMetrics.length) : 0 },
          { name: 'Water Management', value: sasbWaterMetrics.length > 0 ? Math.round(sasbWaterMetrics.reduce((sum, m) => sum + m.value, 0) / sasbWaterMetrics.length) : 0 },
          { name: 'Waste Management', value: sasbWasteMetrics.length > 0 ? Math.round(sasbWasteMetrics.reduce((sum, m) => sum + m.value, 0) / sasbWasteMetrics.length) : 0 },
          { name: 'Employee Health & Safety', value: sasbSafetyMetrics.length > 0 ? Math.round(sasbSafetyMetrics.reduce((sum, m) => sum + m.value, 0) / sasbSafetyMetrics.length) : 0 }
        ].filter(item => item.value > 0);
        
        return (
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sasbData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis domain={[0, 100]} />
                <Tooltip formatter={(value) => [`${value}%`, 'Performance']} />
                <Bar dataKey="value" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        );
      
      case "EU Taxonomy":
        const taxonomyMetrics = normalized.filter(item => 
          item.metric && (item.metric.includes('taxonomy') || item.metric.includes('eligible') || item.metric.includes('aligned'))
        );
        
        if (taxonomyMetrics.length === 0) {
          return (
            <div className="h-[250px] flex items-center justify-center text-gray-500">
              <div className="text-center">
                <p className="text-lg mb-2">🇪🇺</p>
                <p>No EU Taxonomy data available</p>
                <p className="text-sm">Add taxonomy-eligible activity data</p>
              </div>
            </div>
          );
        }
        
        const eligibleMetrics = taxonomyMetrics.filter(m => m.metric.includes('eligible') || m.metric.includes('Eligible'));
        const alignedMetrics = taxonomyMetrics.filter(m => m.metric.includes('aligned') || m.metric.includes('Aligned'));
        
        const eligibleActivities = eligibleMetrics.length > 0 ? Math.round(eligibleMetrics.reduce((sum, m) => sum + m.value, 0) / eligibleMetrics.length) : 0;
        const alignedActivities = alignedMetrics.length > 0 ? Math.round(alignedMetrics.reduce((sum, m) => sum + m.value, 0) / alignedMetrics.length) : 0;
        const nonEligible = Math.max(0, 100 - eligibleActivities - alignedActivities);
        
        const taxonomyData = [
          { name: 'Eligible Activities', value: eligibleActivities },
          { name: 'Aligned Activities', value: alignedActivities },
          { name: 'Non-Eligible', value: nonEligible }
        ].filter(item => item.value > 0);
        
        return (
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <Pie
                  data={taxonomyData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  dataKey="value"
                >
                  {taxonomyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#10b981', '#3b82f6', '#ef4444'][index]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, 'Revenue Share']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        );
      
      default:
        const defaultData = chartData();
        if (defaultData.length === 0) {
          return (
            <div className="h-[250px] flex items-center justify-center text-gray-500">
              <div className="text-center">
                <p className="text-lg mb-2">📊</p>
                <p>No ESG data available for {selectedReport}</p>
                <p className="text-sm">Add data entries to generate {selectedReport} visualizations</p>
                <div className="mt-4">
                  <button
                    onClick={() => window.location.href = '/data-entry'}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                  >
                    📝 Add ESG Data
                  </button>
                </div>
              </div>
            </div>
          );
        }
        const finalData = defaultData;
        
        return (
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <Pie
                  data={finalData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  dataKey="value"
                >
                  {finalData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        );
    }
  };

  const refreshData = async () => {
    try {
      // Check localStorage first - also try direct localStorage access as fallback
      let localData = await getStoredData();
      
      // If getStoredData returns empty, try direct localStorage access
      if (!localData || localData.length === 0) {
        try {
          const directData = localStorage.getItem('esgData');
          if (directData) {
            const parsed = JSON.parse(directData);
            if (Array.isArray(parsed) && parsed.length > 0) {
              localData = parsed;
            }
          }
        } catch (err) {
          console.warn('Failed to read direct localStorage:', err);
        }
      }
      
      if (localData && localData.length > 0) {
        // Normalize and dedupe stored entries before using them
        const convertedData = dedupeEntries(localData.map(item => ({
          ...item,
          status: item.status || 'Submitted',
          timestamp: item.timestamp || item.submissionDate || new Date().toISOString()
        })));

        setData(convertedData);
        const normalized = normalizeData(convertedData);
        setYearlyData(aggregateByYear(normalized));
        setOverallSummary(aggregateOverall(normalized));
        
        // Calculate framework compliance - always calculate, even with empty data
        const griCompliance = validateFrameworkCompliance(normalized, 'GRI');
        const sasbCompliance = validateFrameworkCompliance(normalized, 'SASB');
        const tcfdCompliance = validateFrameworkCompliance(normalized, 'TCFD');
        const brsrCompliance = validateFrameworkCompliance(normalized, 'BRSR');
        setComplianceSummary({ GRI: griCompliance, SASB: sasbCompliance, TCFD: tcfdCompliance, BRSR: brsrCompliance });
        
        if (normalized.length > 0) {
          const years = [...new Set(normalized.map(item => item.year))].filter(year => year && !isNaN(year)).sort((a, b) => b - a);
          if (years.length > 0) {
            setSelectedYear(years[0]);
          }
        }
        return;
      }
      // No sample data fallback: if no backend/local data, show empty reports
      setData([]);
      setYearlyData([]);
      setOverallSummary({});
      setComplianceSummary({});
      setFrameworkComplianceData({});
      return;
    } catch (error) {
      console.error('Error loading data:', error);
      setData([]);
      setYearlyData([]);
      setOverallSummary({});
      setComplianceSummary({});
      setFrameworkComplianceData({});
    }
  };

  const updateStatus = async (index, newStatus) => {
    const updatedData = [...data];
    if (updatedData[index]) {
      updatedData[index].status = newStatus;
      updatedData[index].lastModified = new Date().toISOString();
      setData(updatedData);
      
      // Update via backend API
      try {
        const currentUser = parseInt(localStorage.getItem('currentUser')) || 1;
        const backendData = {
          companyName: updatedData[index].companyName,
          sector: updatedData[index].sector,
          region: updatedData[index].region,
          reportingYear: updatedData[index].reportingYear,
          environmental: updatedData[index].category === 'environmental' ? { [updatedData[index].metric]: updatedData[index].value } : {},
          social: updatedData[index].category === 'social' ? { [updatedData[index].metric]: updatedData[index].value } : {},
          governance: updatedData[index].category === 'governance' ? { [updatedData[index].metric]: updatedData[index].value } : {},
          userId: currentUser
        };
        
        await APIService.saveESGData(backendData);
      } catch (error) {
        console.error('Failed to update status:', error);
      }
    }
  };

  // Remove duplicates from currently loaded data and persist cleaned data to localStorage
  const handleRemoveDuplicates = () => {
    const deduped = dedupeEntries(data);
    if (deduped.length === data.length) {
      showToast('No duplicate entries found', 'info');
      return;
    }
    try {
      localStorage.setItem('esgData', JSON.stringify(deduped));
    } catch (err) {
      console.warn('Failed to write deduped data to localStorage', err);
    }
    setData(deduped);
    const normalized = normalizeData(deduped);
    setYearlyData(aggregateByYear(normalized));
    setOverallSummary(aggregateOverall(normalized));
    showToast(`Removed ${data.length - deduped.length} duplicate entries`, 'success');
  };

  const getFilteredAndSortedData = () => {
    let filtered = normalizeData(data).filter((item) => {
      const matchesStatus = filterStatus === "All" || item.status === filterStatus;
      const matchesSearch = searchTerm === "" || 
        (item.companyName && item.companyName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.metric && item.metric.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.category && item.category.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesStatus && matchesSearch;
    });

    return filtered.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      
      if (sortField === 'timestamp') {
        aVal = new Date(aVal || 0).getTime();
        bVal = new Date(bVal || 0).getTime();
      } else if (sortField === 'value') {
        aVal = parseFloat(aVal) || 0;
        bVal = parseFloat(bVal) || 0;
      }
      
      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const toggleSelectAll = () => {
    if (selectedItems.length === filteredData.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredData.map((_, idx) => idx));
    }
  };

  const toggleSelectItem = (index) => {
    if (selectedItems.includes(index)) {
      setSelectedItems(selectedItems.filter(i => i !== index));
    } else {
      setSelectedItems([...selectedItems, index]);
    }
  };

  const bulkApprove = async () => {
    if (selectedItems.length === 0) {
      showToast('Please select items to approve', 'warning');
      return;
    }
    
    const updatedData = [...data];
    const currentUser = parseInt(localStorage.getItem('currentUser')) || 1;
    
    for (const index of selectedItems) {
      if (updatedData[index]) {
        updatedData[index].status = 'Submitted';
        updatedData[index].lastModified = new Date().toISOString();
        
        try {
          const backendData = {
            companyName: updatedData[index].companyName,
            sector: updatedData[index].sector,
            region: updatedData[index].region,
            reportingYear: updatedData[index].reportingYear,
            environmental: updatedData[index].category === 'environmental' ? { [updatedData[index].metric]: updatedData[index].value } : {},
            social: updatedData[index].category === 'social' ? { [updatedData[index].metric]: updatedData[index].value } : {},
            governance: updatedData[index].category === 'governance' ? { [updatedData[index].metric]: updatedData[index].value } : {},
            userId: currentUser
          };
          
          await APIService.saveESGData(backendData);
        } catch (error) {
          console.error('Failed to approve item:', index, error);
        }
      }
    }
    
    setData(updatedData);
    setSelectedItems([]);
    showToast(`${selectedItems.length} items approved successfully`, 'success');
  };

  const viewDetails = (item) => {
    const details = `Details:\nCompany: ${item.companyName || 'N/A'}\nCategory: ${item.category || 'N/A'}\nMetric: ${item.metric || 'N/A'}\nValue: ${item.value || 'N/A'}\nDate: ${item.timestamp ? new Date(item.timestamp).toLocaleString() : 'N/A'}`;
    showToast(details, 'info');
  };

  const deleteItem = (displayIndex) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    
    try {
      const filteredData = getFilteredAndSortedData();
      const itemToDelete = filteredData[displayIndex];
      
      if (!itemToDelete || itemToDelete._originalIndex === undefined) {
        showToast('Item not found', 'error');
        return;
      }
      
      // Use the stored original index to remove from data array
      const newData = [...data];
      newData.splice(itemToDelete._originalIndex, 1);
      
      // Update state
      setData(newData);
      
      // Update localStorage
      localStorage.setItem('esgData', JSON.stringify(newData));
      
      // Clear selections
      setSelectedItems([]);
      
      showToast('Item deleted successfully', 'success');
    } catch (error) {
      console.error('Delete error:', error);
      showToast('Failed to delete item', 'error');
    }
  };

  useEffect(() => {
    refreshData();
    

    
    // Add storage event listener for real-time updates
    const handleStorageChange = (e) => {
      if (e.key === 'esgData' || e.key === null) {
        setTimeout(refreshData, 100); // Small delay to ensure data is written
      }
    };
    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom events from data entry
    const handleDataUpdate = () => {
      setTimeout(refreshData, 100);
    };
    window.addEventListener('esgDataUpdated', handleDataUpdate);
    
    // Reduce API calls - update every 30 seconds instead of 5
    const interval = setInterval(refreshData, 30000);
    
    const cleanup = () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('esgDataUpdated', handleDataUpdate);
    };
    
    // Add print styles
    const printStyles = `
      @media print {
        .no-print { display: none !important; }
        .print-break { page-break-before: always; }
        body { font-size: 12pt; }
        .bg-white { background: white !important; }
        .shadow { box-shadow: none !important; }
        .rounded-xl { border-radius: 0 !important; }
      }
    `;
    
    const styleSheet = document.createElement('style');
    styleSheet.textContent = printStyles;
    document.head.appendChild(styleSheet);
    
    return cleanup;
  }, []);

  const chartData = () => {
    const normalized = normalizeData(data);
    const categoryCount = {};
    normalized.forEach((item) => {
      const category = item.category.charAt(0).toUpperCase() + item.category.slice(1);
      if (!categoryCount[category]) categoryCount[category] = 0;
      categoryCount[category]++;
    });
    return Object.entries(categoryCount).map(([name, value]) => ({ name, value }));
  };

  const filteredData = normalizeData(data).filter((item) => {
    return filterStatus === "All" || item.status === filterStatus;
  });

  const exportPDFSimple = () => {
    (async () => {
      const esgData = await getStoredData();
      const companyName = (esgData && esgData.length > 0 && esgData[0].companyName) || 'Company';
      const pdf = generateESGPDF(selectedReport, esgData, {
        companyName,
        reportPeriod: selectedYear,
        includeCharts: true
      });
      
      const filename = `ESG-Report-${selectedReport.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(filename);
      showToast(`${selectedReport} report generated successfully!`, 'success');
    })();
  };
  
  const exportPDF = async () => {
    // Use professional PDF generator
    const esgData = await getStoredData();
    const normalizedData = normalizeData(esgData);

    const companyName = (esgData && esgData.length > 0 && esgData[0].companyName) || 'Company';
    const pdf = generateProfessionalESGReport(selectedReport, normalizedData, {
      companyName,
      reportPeriod: selectedYear || new Date().getFullYear()
    });

    const filename = `Professional-ESG-Report-${selectedReport.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(filename);
    showToast(`Professional ${selectedReport} report generated successfully!`, 'success');
    return;
    
    // Fallback to original generator
    const pdf2 = new jsPDF();
    const normalized = normalizeData(data);
    const envMetrics = getEnvironmentalMetrics();
    const socialMetrics = getSocialMetrics();
    const govMetrics = getGovernanceMetrics();
    const calcMetrics = getCalculatedMetrics();
    
    // Company Header
    pdf.setFontSize(24);
    pdf.setTextColor(0, 102, 51);
    pdf.text('ESG SUSTAINABILITY REPORT', 20, 25);
    
    pdf.setFontSize(16);
    pdf.setTextColor(0, 0, 0);
    pdf.text(`Framework: ${selectedReport}`, 20, 40);
    pdf.setFontSize(12);
    pdf.text(`Report Period: ${new Date().getFullYear()}`, 20, 50);
    pdf.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 60);
    pdf.text(`Total Data Points: ${normalized.length}`, 20, 70);
    
    // Executive Summary
    let yPos = 90;
    pdf.setFontSize(16);
    pdf.setTextColor(0, 102, 51);
    pdf.text('EXECUTIVE SUMMARY', 20, yPos);
    yPos += 15;
    
    pdf.setFontSize(12);
    pdf.setTextColor(0, 0, 0);
    if (overallSummary.overall !== '-') {
      pdf.text(`Overall ESG Performance Score: ${overallSummary.overall}/100`, 20, yPos);
      yPos += 10;
    }
    
    // Performance by Pillar
    pdf.text('Performance by ESG Pillar:', 20, yPos);
    yPos += 10;
    if (overallSummary.environmental !== '-') {
      pdf.text(`• Environmental: ${overallSummary.environmental}/100 - ${getPerformanceRating(overallSummary.environmental)}`, 25, yPos);
      yPos += 8;
    }
    if (overallSummary.social !== '-') {
      pdf.text(`• Social: ${overallSummary.social}/100 - ${getPerformanceRating(overallSummary.social)}`, 25, yPos);
      yPos += 8;
    }
    if (overallSummary.governance !== '-') {
      pdf.text(`• Governance: ${overallSummary.governance}/100 - ${getPerformanceRating(overallSummary.governance)}`, 25, yPos);
      yPos += 8;
    }
    
    yPos += 10;
    pdf.text(`Key Highlights: ${normalized.length} metrics tracked across ${yearlyData.length} reporting periods`, 20, yPos);
    
    // Environmental Section
    yPos += 20;
    if (yPos > 250) { pdf.addPage(); yPos = 30; }
    pdf.setFontSize(16);
    pdf.setTextColor(0, 102, 51);
    pdf.text('ENVIRONMENTAL PERFORMANCE', 20, yPos);
    yPos += 15;
    
    pdf.setFontSize(12);
    pdf.setTextColor(0, 0, 0);
    envMetrics.forEach(metric => {
      if (yPos > 270) { pdf.addPage(); yPos = 30; }
      pdf.text(`${metric.name}: ${metric.value}`, 20, yPos);
      yPos += 8;
    });
    
    // Social Section
    yPos += 15;
    if (yPos > 250) { pdf.addPage(); yPos = 30; }
    pdf.setFontSize(16);
    pdf.setTextColor(0, 102, 51);
    pdf.text('SOCIAL PERFORMANCE', 20, yPos);
    yPos += 15;
    
    pdf.setFontSize(12);
    pdf.setTextColor(0, 0, 0);
    socialMetrics.forEach(metric => {
      if (yPos > 270) { pdf.addPage(); yPos = 30; }
      pdf.text(`${metric.name}: ${metric.value}`, 20, yPos);
      yPos += 8;
    });
    
    // Governance Section
    yPos += 15;
    if (yPos > 250) { pdf.addPage(); yPos = 30; }
    pdf.setFontSize(16);
    pdf.setTextColor(0, 102, 51);
    pdf.text('GOVERNANCE PERFORMANCE', 20, yPos);
    yPos += 15;
    
    pdf.setFontSize(12);
    pdf.setTextColor(0, 0, 0);
    govMetrics.forEach(metric => {
      if (yPos > 270) { pdf.addPage(); yPos = 30; }
      pdf.text(`${metric.name}: ${metric.value}`, 20, yPos);
      yPos += 8;
    });
    
    // Calculated Metrics
    if (calcMetrics.length > 0) {
      yPos += 15;
      if (yPos > 250) { pdf.addPage(); yPos = 30; }
      pdf.setFontSize(16);
      pdf.setTextColor(0, 102, 51);
      pdf.text('KEY PERFORMANCE INDICATORS', 20, yPos);
      yPos += 15;
      
      pdf.setFontSize(12);
      pdf.setTextColor(0, 0, 0);
      calcMetrics.forEach(metric => {
        if (yPos > 270) { pdf.addPage(); yPos = 30; }
        pdf.text(`${metric.name}: ${metric.value}`, 20, yPos);
        yPos += 8;
      });
    }
    
    // Year-over-Year Analysis
    if (yearlyData.length > 0) {
      pdf.addPage();
      yPos = 30;
      pdf.setFontSize(16);
      pdf.setTextColor(0, 102, 51);
      pdf.text('YEAR-OVER-YEAR PERFORMANCE ANALYSIS', 20, yPos);
      yPos += 20;
      
      pdf.setFontSize(10);
      pdf.setTextColor(0, 0, 0);
      // Table headers
      pdf.text('Year', 20, yPos);
      pdf.text('Environmental', 60, yPos);
      pdf.text('Social', 100, yPos);
      pdf.text('Governance', 140, yPos);
      pdf.text('Overall', 180, yPos);
      yPos += 10;
      
      // Draw header line
      pdf.line(20, yPos - 2, 200, yPos - 2);
      
      // Table data
      yearlyData.forEach(row => {
        if (yPos > 270) {
          pdf.addPage();
          yPos = 30;
        }
        pdf.text(row.year.toString(), 20, yPos);
        pdf.text(row.environmental.toString(), 60, yPos);
        pdf.text(row.social.toString(), 100, yPos);
        pdf.text(row.governance.toString(), 140, yPos);
        pdf.text(row.average.toString(), 180, yPos);
        yPos += 8;
      });
    }
    
    // Compliance Status
    pdf.addPage();
    yPos = 30;
    pdf.setFontSize(16);
    pdf.setTextColor(0, 102, 51);
    pdf.text('REGULATORY COMPLIANCE STATUS', 20, yPos);
    yPos += 20;
    
    pdf.setFontSize(12);
    pdf.setTextColor(0, 0, 0);
    pdf.text('This report demonstrates compliance with:', 20, yPos);
    yPos += 15;
    
    if (normalized.length > 0) {
      const frameworks = ['GRI Standards', 'SEBI BRSR', 'TCFD Guidelines', 'SASB Standards'];
      frameworks.forEach(framework => {
        pdf.text(`• ${framework}`, 25, yPos);
        yPos += 8;
      });
    } else {
      pdf.text('• No compliance data available', 25, yPos);
      yPos += 8;
    }
    
    yPos += 10;
    pdf.text('Data Quality Assurance:', 20, yPos);
    yPos += 10;
    if (normalized.length > 0) {
      pdf.text(`• ${normalized.length} verified data points`, 25, yPos);
      yPos += 8;
      pdf.text('• Third-party verification where applicable', 25, yPos);
      yPos += 8;
      pdf.text('• Audit trail maintained for all entries', 25, yPos);
    } else {
      pdf.text('• No data points available for verification', 25, yPos);
      yPos += 8;
    }
    
    // Footer
    yPos += 30;
    pdf.setFontSize(10);
    pdf.setTextColor(128, 128, 128);
    pdf.text('This report was generated automatically from verified ESG data.', 20, yPos);
    pdf.text(`Report ID: ESG-${Date.now()}`, 20, yPos + 10);
    
    // Save PDF with proper filename
    const reportFilename = `ESG-Report-${selectedReport.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(reportFilename);
    
    // Show success message
    showToast(`${selectedReport} report generated successfully!`, 'success');
  };
  
  const getPerformanceRating = (score) => {
    const numScore = parseFloat(score);
    if (isNaN(numScore)) return 'No Data';
    if (numScore >= 80) return 'Excellent';
    if (numScore >= 70) return 'Good';
    if (numScore >= 60) return 'Satisfactory';
    if (numScore >= 50) return 'Needs Improvement';
    return 'Poor';
  };

  const exportCSV = () => {
    const csvRows = [
      ["Category", "Metric", "Value", "Description", "Status"],
      ...filteredData.map((item) => [
        item.category,
        item.metric,
        item.value,
        item.description,
        item.status || "Pending"
      ]),
    ];

    const csvContent =
      "data:text/csv;charset=utf-8," +
      csvRows.map((row) => row.map((x) => `"${x}"`).join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${selectedReport}-report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Convert new ESG form data to old format for compatibility
  const convertNewFormatToOld = (newData) => {
    const converted = [];
    const timestamp = newData.submissionDate || new Date().toISOString();
    
    // Environmental metrics
    const envFields = {
      scope1Emissions: 'Scope 1 Emissions',
      scope2Emissions: 'Scope 2 Emissions', 
      scope3Emissions: 'Scope 3 Emissions',
      energyConsumption: 'Energy Consumption',
      renewableEnergyPercentage: 'Renewable Energy Percentage',
      waterWithdrawal: 'Water Withdrawal',
      wasteGenerated: 'Waste Generated',
      wasteRecycled: 'Waste Recycled',
      environmentalFines: 'Environmental Fines'
    };
    
    Object.entries(envFields).forEach(([key, label]) => {
      if (newData[key] && newData[key] !== '') {
        converted.push({
          companyName: newData.companyName,
          category: 'environmental',
          metric: key,
          value: parseFloat(newData[key]),
          description: label,
          status: 'Submitted',
          timestamp,
          reportingYear: newData.reportingYear,
          sector: newData.sector,
          region: newData.region
        });
      }
    });
    
    // Social metrics
    const socialFields = {
      totalEmployees: 'Total Employees',
      femaleEmployeesPercentage: 'Female Employees Percentage',
      minorityEmployeesPercentage: 'Minority Employees Percentage',
      employeeTurnoverRate: 'Employee Turnover Rate',
      lostTimeInjuryRate: 'Lost Time Injury Rate',
      fatalityRate: 'Fatality Rate',
      trainingHoursPerEmployee: 'Training Hours per Employee',
      communityInvestment: 'Community Investment',
      humanRightsViolations: 'Human Rights Violations',
      supplierAssessments: 'Supplier Assessments'
    };
    
    Object.entries(socialFields).forEach(([key, label]) => {
      if (newData[key] && newData[key] !== '') {
        converted.push({
          companyName: newData.companyName,
          category: 'social',
          metric: key,
          value: parseFloat(newData[key]),
          description: label,
          status: 'Submitted',
          timestamp,
          reportingYear: newData.reportingYear,
          sector: newData.sector,
          region: newData.region
        });
      }
    });
    
    // Governance metrics
    const govFields = {
      boardSize: 'Board Size',
      independentDirectorsPercentage: 'Independent Directors Percentage',
      femaleDirectorsPercentage: 'Female Directors Percentage',
      ethicsTrainingCompletion: 'Ethics Training Completion',
      corruptionIncidents: 'Corruption Incidents',
      dataBreaches: 'Data Breaches',
      regulatoryFines: 'Regulatory Fines',
      cybersecurityScore: 'Cybersecurity Score'
    };
    
    Object.entries(govFields).forEach(([key, label]) => {
      if (newData[key] && newData[key] !== '') {
        converted.push({
          companyName: newData.companyName,
          category: 'governance',
          metric: key,
          value: parseFloat(newData[key]),
          description: label,
          status: 'Submitted',
          timestamp,
          reportingYear: newData.reportingYear,
          sector: newData.sector,
          region: newData.region
        });
      }
    });
    
    return converted;
  };

  const canViewReports = RBACManager.hasPermission(currentUser.role, PERMISSIONS.VIEW_REPORTS);
  const canExportReports = RBACManager.hasPermission(currentUser.role, PERMISSIONS.EXPORT_DATA);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${theme.bg.gradient}`}>
      <ProfessionalHeader 
        onLogout={() => {
          window.location.href = "/login";
        }}
        currentUser="admin@esgenius.com"
        title="ESG Reports & Analytics"
        subtitle="Comprehensive ESG Performance Reporting"
        showBreadcrumb={true}
        breadcrumbItems={[
          { label: 'Dashboard', href: '/' },
          { label: 'Reports', href: '/reports', active: true }
        ]}
        actions={[
            {
              label: 'Save JSON',
              onClick: async () => { 
                await handleSaveFullReport();
              },
              variant: 'outline'
            },
            {
              label: 'Save PDF',
              onClick: async () => { 
                setShowPreview(false);
                await exportPDF();
              },
              variant: 'outline'
            },
          {
            label: 'Refresh Data',
            onClick: () => {
              refreshData();
              showToast('Data refreshed successfully!', 'success');
            },
            variant: 'outline',
            icon: '🔄'
          },
          {
            label: 'View Data Entry',
            onClick: () => window.location.href = '/data-entry',
            variant: 'primary',
            icon: '📝'
          }
        ]}
      />

      <div className="max-w-7xl mx-auto p-6">




        {/* Data Status Indicator */}
        <div className={`mb-6 p-4 rounded-lg ${theme.bg.subtle} border-l-4 border-blue-500`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">📈</span>
              <div>
                <h3 className={`font-semibold ${theme.text.primary}`}>Data Status</h3>
                <p className={`text-sm ${theme.text.secondary}`}>
                  {data.length > 0 
                    ? `${data.length} ESG data points loaded from ${data[0]?.companyName || 'your submissions'}`
                    : 'No ESG data found. Submit data via Data Entry to generate reports.'
                  }
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
                {data.length === 0 ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => window.location.href = '/data-entry'}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                    >
                      📝 Add Data
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => window.location.href = '/data-entry'}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                    >
                      📝 Add Data
                    </button>
                    <button
                      onClick={analyzeFrameworkCompliance}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm whitespace-nowrap"
                    >
                      📋 Framework Compliance
                    </button>
                    <button
                      onClick={() => setShowFrameworkReports(true)}
                      className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm whitespace-nowrap"
                    >
                      📄 Framework Reports
                    </button>
                    <button
                      onClick={clearAllData}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                      title="Clear all ESG data"
                    >
                      🗑️ Clear Data
                    </button>
                  </div>
                )}
              <span className={`px-2 py-1 rounded text-xs ${
                data.length > 0 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {data.length > 0 ? 'Data Available' : 'No Data'}
              </span>
              {data.length > 0 && (
                <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">
                  GRI/SASB Ready
                </span>
              )}
            </div>
          </div>
        </div>

        {!canViewReports && (
          <Alert 
            type="warning"
            title="Access Restricted"
            message="You do not have permission to view reports. Please contact your administrator."
            className="mb-6"
          />
        )}

        {/* Enhanced Overall Summary Section */}
        <div className={`p-6 rounded-xl shadow-lg mb-8 ${theme.bg.card}`}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className={`text-2xl font-bold ${theme.text.primary}`}>ESG Performance Overview</h2>
              <p className={`text-sm ${theme.text.secondary}`}>Comprehensive sustainability metrics dashboard</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2 py-1 rounded-full ${isDark ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-800'}`}>
                Live Data
              </span>
            </div>
          </div>
          
          {overallSummary && overallSummary.environmental !== undefined ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard 
                icon="🌍"
                value={Math.min(100, parseFloat(overallSummary.environmental) || 0)}
                label="Environmental Score"
                trend="↑ +2.3%"
                trendColor="success"
                progress={Math.min(100, parseFloat(overallSummary.environmental) || 0)}
              />
              <MetricCard 
                icon="👥"
                value={Math.min(100, parseFloat(overallSummary.social) || 0)}
                label="Social Score"
                trend="↑ +1.8%"
                trendColor="success"
                progress={Math.min(100, parseFloat(overallSummary.social) || 0)}
              />
              <MetricCard 
                icon="⚖️"
                value={Math.min(100, parseFloat(overallSummary.governance) || 0)}
                label="Governance Score"
                trend="→ 0.0%"
                trendColor="neutral"
                progress={Math.min(100, parseFloat(overallSummary.governance) || 0)}
              />
              <MetricCard 
                icon="⭐"
                value={Math.min(100, parseFloat(overallSummary.overall) || 0)}
                label="Overall ESG Score"
                trend="↑ +1.4%"
                trendColor="success"
                progress={Math.min(100, parseFloat(overallSummary.overall) || 0)}
              />
            </div>
          ) : (
            <Alert 
              type="info"
              title="No Data Available"
              message="Start by adding ESG data entries to generate comprehensive reports and analytics."
            />
          )}
        </div>

        {/* Enhanced Per-Year Breakdown */}
        <div className={`p-6 rounded-xl shadow-lg mb-8 ${theme.bg.card}`}>
          <div className="flex items-center justify-between mb-6">
            <h2 className={`text-xl font-bold ${theme.text.primary}`}>Year-over-Year Performance</h2>
            <div className="flex items-center gap-4">
              <label className={`text-sm font-medium ${theme.text.secondary}`}>Select Year:</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className={`border rounded-lg px-3 py-2 text-sm ${theme.bg.input} ${theme.border.input} ${theme.text.primary}`}
                disabled={yearlyData.length === 0}
              >
                {yearlyData.length > 0 ? (
                  yearlyData
                    .filter(entry => entry.year && !isNaN(entry.year))
                    .sort((a, b) => b.year - a.year)
                    .map(entry => (
                      <option key={entry.year} value={entry.year}>
                        {entry.year}
                      </option>
                    ))
                ) : (
                  <option value={new Date().getFullYear()}>
                    {new Date().getFullYear()} (No Data)
                  </option>
                )}
              </select>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className={`min-w-full text-sm ${theme.text.primary}`}>
              <thead>
                <tr className={`${theme.bg.subtle}`}>
                  <th className="px-4 py-3 text-left font-semibold">Year</th>
                  <th className="px-4 py-3 text-left font-semibold">Environmental</th>
                  <th className="px-4 py-3 text-left font-semibold">Social</th>
                  <th className="px-4 py-3 text-left font-semibold">Governance</th>
                  <th className="px-4 py-3 text-left font-semibold">Overall Avg</th>
                  <th className="px-4 py-3 text-left font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {yearlyData.length > 0 ? yearlyData.map((row) => (
                  <tr key={row.year} className={`hover:${theme.bg.subtle} transition-colors duration-200 ${
                    row.year === selectedYear ? `${theme.bg.accent} font-semibold` : ''
                  }`}>
                    <td className="px-4 py-3">{row.year}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span>{row.environmental !== '-' ? row.environmental : 'N/A'}</span>
                        {row.environmental !== '-' && (
                          <div className={`w-2 h-2 rounded-full ${
                            parseFloat(row.environmental) >= 70 ? 'bg-green-500' :
                            parseFloat(row.environmental) >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}></div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span>{row.social !== '-' ? row.social : 'N/A'}</span>
                        {row.social !== '-' && (
                          <div className={`w-2 h-2 rounded-full ${
                            parseFloat(row.social) >= 70 ? 'bg-green-500' :
                            parseFloat(row.social) >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}></div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span>{row.governance !== '-' ? row.governance : 'N/A'}</span>
                        {row.governance !== '-' && (
                          <div className={`w-2 h-2 rounded-full ${
                            parseFloat(row.governance) >= 70 ? 'bg-green-500' :
                            parseFloat(row.governance) >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}></div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-semibold">{row.average !== '-' ? row.average : 'N/A'}</td>
                    <td className="px-4 py-3">
                      {row.average !== '-' ? (
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          parseFloat(row.average) >= 70 ? 'bg-green-100 text-green-800' :
                          parseFloat(row.average) >= 50 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {parseFloat(row.average) >= 70 ? 'Excellent' :
                           parseFloat(row.average) >= 50 ? 'Good' : 'Needs Improvement'}
                        </span>
                      ) : (
                        <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                          No Data
                        </span>
                      )}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                      <div>
                        <p className="text-lg mb-2">📊</p>
                        <p>No yearly data available</p>
                        <p className="text-sm">Add ESG data to see year-over-year trends</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>



      {/* ESG Metrics Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Environmental Metrics */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-lg font-bold bg-emerald-600 text-white p-3 -m-6 mb-4 rounded-t-xl">Environmental</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-emerald-600 text-white">
                <th className="text-left p-2">Metric</th>
                <th className="text-left p-2">Value</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {getEnvironmentalMetrics().map((metric, i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="p-2 text-gray-700">{metric.name}</td>
                  <td className="p-2 font-medium">{metric.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Social Metrics */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-lg font-bold bg-emerald-600 text-white p-3 -m-6 mb-4 rounded-t-xl">Social</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-emerald-600 text-white">
                <th className="text-left p-2">Metric</th>
                <th className="text-left p-2">Value</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {getSocialMetrics().map((metric, i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="p-2 text-gray-700">{metric.name}</td>
                  <td className="p-2 font-medium">{metric.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Governance and Auto-Calculated Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Governance Metrics */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-lg font-bold bg-emerald-600 text-white p-3 -m-6 mb-4 rounded-t-xl">Governance</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-emerald-600 text-white">
                <th className="text-left p-2">Metric</th>
                <th className="text-left p-2">Value</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {getGovernanceMetrics().map((metric, i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="p-2 text-gray-700">{metric.name}</td>
                  <td className="p-2 font-medium">{metric.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Auto-Calculated Metrics */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-lg font-bold bg-emerald-600 text-white p-3 -m-6 mb-4 rounded-t-xl">Auto-Calculated Metrics</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-emerald-600 text-white">
                <th className="text-left p-2">Metric</th>
                <th className="text-left p-2">Value</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {getCalculatedMetrics().map((metric, i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="p-2 text-gray-700">{metric.name}</td>
                  <td className="p-2 font-medium">{metric.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

        {/* Enhanced Analytics Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 no-print">
          <div className={`p-6 rounded-xl shadow-lg ${theme.bg.card}`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className={`text-lg font-bold ${theme.text.primary}`}>Score Distribution</h3>
                <p className={`text-sm ${theme.text.secondary}`}>Current year performance breakdown</p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${
                isDark ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-800'
              }`}>
                {selectedYear}
              </span>
            </div>
            <div className="h-[250px]">
              {yearlyData.length > 0 && yearlyData.find(d => d.year === selectedYear) ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={[{
                      year: selectedYear,
                      environmental: parseFloat(yearlyData.find(d => d.year === selectedYear)?.environmental) || 0,
                      social: parseFloat(yearlyData.find(d => d.year === selectedYear)?.social) || 0,
                      governance: parseFloat(yearlyData.find(d => d.year === selectedYear)?.governance) || 0
                    }]}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
                    <XAxis dataKey="year" stroke={isDark ? '#9ca3af' : '#6b7280'} />
                    <YAxis domain={[0, 100]} stroke={isDark ? '#9ca3af' : '#6b7280'} />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: isDark ? '#1f2937' : '#ffffff',
                        border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
                        borderRadius: '8px'
                      }}
                      formatter={(value, name) => [`${value}`, name.charAt(0).toUpperCase() + name.slice(1)]}
                    />
                    <Bar dataKey="environmental" fill="#059669" name="Environmental" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="social" fill="#2563eb" name="Social" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="governance" fill="#7c3aed" name="Governance" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <p className="text-lg mb-2">📊</p>
                    <p>No data for {selectedYear}</p>
                    <p className="text-sm">Select a different year or add data</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className={`p-6 rounded-xl shadow-lg ${theme.bg.card}`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className={`text-lg font-bold ${theme.text.primary}`}>Performance Trends</h3>
                <p className={`text-sm ${theme.text.secondary}`}>Multi-year ESG score evolution</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs">E</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-xs">S</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-xs">G</span>
                </div>
              </div>
            </div>
            <div className="h-[250px]">
              {yearlyData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart 
                    data={yearlyData.map(year => ({
                      year: year.year,
                      environmental: parseFloat(year.environmental) || 0,
                      social: parseFloat(year.social) || 0,
                      governance: parseFloat(year.governance) || 0
                    }))}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
                    <XAxis dataKey="year" stroke={isDark ? '#9ca3af' : '#6b7280'} />
                    <YAxis domain={[0, 100]} stroke={isDark ? '#9ca3af' : '#6b7280'} />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: isDark ? '#1f2937' : '#ffffff',
                        border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
                        borderRadius: '8px'
                      }}
                      formatter={(value, name) => [`${value}`, name.charAt(0).toUpperCase() + name.slice(1)]}
                    />
                    <Line type="monotone" dataKey="environmental" stroke="#059669" strokeWidth={3} dot={{ fill: '#059669', strokeWidth: 2, r: 4 }} />
                    <Line type="monotone" dataKey="social" stroke="#2563eb" strokeWidth={3} dot={{ fill: '#2563eb', strokeWidth: 2, r: 4 }} />
                    <Line type="monotone" dataKey="governance" stroke="#7c3aed" strokeWidth={3} dot={{ fill: '#7c3aed', strokeWidth: 2, r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <p className="text-lg mb-2">📈</p>
                    <p>No trend data available</p>
                    <p className="text-sm">Add multi-year data to see trends</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>



        {/* AI Insights Section */}
        {data.length > 0 && (
          <div className={`border rounded-lg p-4 mb-6 ${isDark ? 'bg-purple-900/30 border-purple-700' : 'bg-purple-50 border-purple-200'}`}>
            <h3 className={`font-medium mb-3 ${isDark ? 'text-purple-300' : 'text-purple-800'}`}>🤖 AI-Powered Insights</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {data.length > 0 ? [
                { type: 'data', message: `${data.length} ESG data points analyzed across ${new Set(data.map(d => d.category)).size} categories`, priority: 'info' },
                { type: 'completeness', message: `Data coverage: ${Math.round((data.length / 50) * 100)}% of recommended ESG metrics`, priority: data.length > 25 ? 'high' : 'medium' },
                { type: 'trend', message: yearlyData.length > 1 ? 'Multi-year trend analysis available' : 'Add historical data for trend analysis', priority: yearlyData.length > 1 ? 'high' : 'low' },
                { type: 'framework', message: `Ready for ${Object.keys(complianceSummary).length} framework reports`, priority: 'medium' }
              ].map((insight, idx) => (
                <div key={idx} className={`p-3 rounded-lg ${theme.bg.subtle}`}>
                  <div className={`text-sm font-medium ${theme.text.primary}`}>{insight.message}</div>
                  <div className={`text-xs ${
                    insight.priority === 'high' ? 'text-green-600' : 
                    insight.priority === 'medium' ? 'text-yellow-600' : 
                    insight.priority === 'info' ? 'text-blue-600' : 'text-gray-600'
                  }`}>
                    {insight.priority.toUpperCase()} IMPACT
                  </div>
                </div>
              )) : (
                <div className={`p-3 rounded-lg ${theme.bg.subtle} col-span-2 text-center`}>
                  <div className={`text-sm ${theme.text.secondary}`}>Add ESG data to generate AI-powered insights</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Enhanced Template Selection and Visualization */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Professional Template List */}
          <div className={`p-6 rounded-xl shadow-lg no-print ${theme.bg.card}`}>
            <div className="flex items-center gap-2 mb-6">
              <span className="text-2xl">📄</span>
              <div>
                <h2 className={`text-xl font-bold ${theme.text.primary}`}>Report Templates</h2>
                <p className={`text-sm ${theme.text.secondary}`}>Choose from industry-standard ESG frameworks</p>
              </div>
            </div>
            <div className="space-y-3">
              {[
                { type: "SEBI BRSR", description: "Mandatory ESG report for listed Indian companies" },
                { type: "GRI Standards", description: "Global Reporting Initiative based template" },
                { type: "Carbon Report", description: "Tracks CO2 emissions and carbon footprint" },
                { type: "Water Usage", description: "Analyzes total water consumption" },
                { type: "Waste Management", description: "Details waste segregation and disposal" },
                { type: "TCFD", description: "Climate-related financial disclosures framework" },
                { type: "SASB", description: "Industry-specific sustainability standards" },
                { type: "EU Taxonomy", description: "EU sustainable finance classification" }
              ].map((report, i) => (
                <div
                  key={i}
                  className={`border-2 p-4 rounded-xl cursor-pointer transition-all duration-200 hover:scale-102 ${
                    selectedReport === report.type 
                      ? `${theme.border.accent} ${theme.bg.accent} shadow-lg` 
                      : `${theme.border.primary} ${theme.hover.card}`
                  }`}
                  onClick={() => setSelectedReport(report.type)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className={`font-semibold ${theme.text.primary}`}>{report.type}</h3>
                      <p className={`text-sm mt-1 ${theme.text.secondary}`}>{report.description}</p>
                    </div>
                    {selectedReport === report.type && (
                      <div className="ml-2">
                        <span className="text-green-500 text-lg">✓</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      isDark ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {report.type.includes('SEBI') ? 'Regulatory' : 
                       report.type.includes('GRI') ? 'International' :
                       report.type.includes('TCFD') ? 'Climate' :
                       report.type.includes('SASB') ? 'Industry' :
                       report.type.includes('EU') ? 'EU Regulatory' : 'Operational'}
                    </span>
                    <span className={`text-xs ${theme.text.muted}`}>• Updated 2024</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Enhanced Summary & Chart */}
          <div className={`p-6 rounded-xl shadow-lg print-break ${theme.bg.card}`} id="report-summary">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className={`text-xl font-bold ${theme.text.primary}`}>{selectedReport}</h2>
                <p className={`text-sm ${theme.text.secondary}`}>Interactive data visualization</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-1 rounded-full ${
                  isDark ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-800'
                }`}>
                  Live Data
                </span>
              </div>
            </div>
            <div className="relative">
              {getTemplateContent()}
            </div>
          </div>
        </div>

      {/* Print Header - Only visible when printing */}
      <div className="hidden print:block mb-4">
        <h1 className="text-2xl font-bold text-center mb-2">ESG Performance Report</h1>
        <p className="text-center text-gray-600">Generated on {new Date().toLocaleDateString()}</p>
        <hr className="my-4" />
      </div>

        {/* Framework Compliance Summary */}
        <FrameworkComplianceSummary complianceData={complianceSummary} />

        {/* Enhanced History Section */}
        <div className={`p-6 rounded-xl shadow-lg mt-8 ${theme.bg.card}`}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h2 className={`text-xl font-bold ${theme.text.primary}`}>Data History & Management</h2>
              <p className={`text-sm ${theme.text.secondary}`}>{filteredData.length} entries available for reporting</p>
            </div>
            
            <div className="flex flex-col md:flex-row gap-3">
              <Input
                type="text"
                placeholder="Search by company or metric..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full md:w-64"
                icon="🔍"
              />
              
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className={`border rounded-lg px-3 py-2 text-sm ${theme.bg.input} ${theme.border.input} ${theme.text.primary}`}
              >
                <option value="All">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Submitted">Submitted</option>
                <option value="Failed">Failed</option>
              </select>
              
              <Button
                variant="success"
                onClick={() => {
                  if (selectedItems.length === 0) {
                    showToast('Please select items to approve', 'warning');
                    return;
                  }
                  bulkApprove();
                  showToast(`${selectedItems.length} items approved successfully`, 'success');
                }}
                disabled={selectedItems.length === 0}
                icon="✓"
              >
                Bulk Approve
              </Button>
            </div>
          </div>
        
          <div className="mb-6 flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
              <span className={theme.text.secondary}>Pending: {filteredData.filter(item => (item.status || 'Pending') === 'Pending').length}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              <span className={theme.text.secondary}>Submitted: {filteredData.filter(item => item.status === 'Submitted').length}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-400 rounded-full"></div>
              <span className={theme.text.secondary}>Failed: {filteredData.filter(item => item.status === 'Failed').length}</span>
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <span className={`text-xs px-2 py-1 rounded-full ${
                isDark ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-800'
              }`}>
                Total: {filteredData.length}
              </span>
            </div>
          </div>
          {filteredData.length > 0 ? (
            <div className="overflow-x-auto">
              <table className={`min-w-full text-sm ${theme.text.primary}`}>
                <thead className={`${theme.bg.subtle}`}>
                  <tr>
                    <th className="px-4 py-3 text-left">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedItems.length === filteredData.length && filteredData.length > 0}
                          onChange={toggleSelectAll}
                          className="rounded"
                        />
                        <span className="font-semibold">Company</span>
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left">
                      <button 
                        onClick={() => handleSort('category')}
                        className="flex items-center gap-1 font-semibold hover:text-blue-600 transition-colors duration-200"
                      >
                        Category 
                        {sortField === 'category' && (
                          <span className="text-blue-600">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </button>
                    </th>
                    <th className="px-4 py-3 text-left font-semibold">Metric</th>
                    <th className="px-4 py-3 text-left">
                      <button 
                        onClick={() => handleSort('value')}
                        className="flex items-center gap-1 font-semibold hover:text-blue-600 transition-colors duration-200"
                      >
                        Value 
                        {sortField === 'value' && (
                          <span className="text-blue-600">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </button>
                    </th>
                    <th className="px-4 py-3 text-left">
                      <button 
                        onClick={() => handleSort('timestamp')}
                        className="flex items-center gap-1 font-semibold hover:text-blue-600 transition-colors duration-200"
                      >
                        Date 
                        {sortField === 'timestamp' && (
                          <span className="text-blue-600">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </button>
                    </th>
                    <th className="px-4 py-3 text-left font-semibold">Status</th>
                    <th className="px-4 py-3 text-left font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {getFilteredAndSortedData().map((item, idx) => (
                    <tr key={idx} className={`transition-colors duration-200 ${
                      selectedItems.includes(idx) 
                        ? `${theme.bg.accent} border-l-4 border-blue-500` 
                        : `hover:${theme.bg.subtle}`
                    }`}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={selectedItems.includes(idx)}
                            onChange={() => toggleSelectItem(idx)}
                            className="rounded"
                          />
                          <span className="font-medium">{item.companyName || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${
                            item.category === 'environmental' ? 'bg-green-500' :
                            item.category === 'social' ? 'bg-blue-500' : 'bg-purple-500'
                          }`}></div>
                          <span className="capitalize font-medium">{item.category}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-medium">{item.metric || 'General'}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-bold text-lg">{item.value}</span>
                      </td>
                      <td className="px-4 py-3">
                        {item.timestamp ? (
                          <div>
                            <div className="font-medium">{new Date(item.timestamp).toLocaleDateString()}</div>
                            <div className={`text-xs ${theme.text.muted}`}>{new Date(item.timestamp).toLocaleTimeString()}</div>
                          </div>
                        ) : (
                          <span className={theme.text.muted}>N/A</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={item.status || "Pending"}
                          onChange={(e) => {
                            updateStatus(idx, e.target.value);
                            showToast(`Status updated to ${e.target.value}`, 'success');
                          }}
                          className={`text-xs font-semibold px-3 py-1 rounded-full border-0 cursor-pointer ${
                            item.status === "Submitted"
                              ? "bg-green-100 text-green-800"
                              : item.status === "Pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Submitted">Submitted</option>
                          <option value="Failed">Failed</option>
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              viewDetails(item);
                              showToast('Viewing item details', 'info');
                            }}
                            className={`p-2 rounded-lg transition-colors duration-200 ${theme.hover.subtle}`}
                            title="View Details"
                          >
                            <span className="text-blue-600">👁️</span>
                          </button>
                          <button
                            onClick={() => deleteItem(idx)}
                            className={`p-2 rounded-lg transition-colors duration-200 ${theme.hover.subtle}`}
                            title="Delete"
                          >
                            <span className="text-red-600">🗑️</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <Alert 
              type="info"
              title="No Data Available"
              message="No report history found. Start by adding ESG data entries to generate reports."
            />
          )}
        </div>

        {/* Professional Report Template Modal */}
        {showProfessionalTemplate && (
          <ProfessionalReportTemplate
            data={data}
            onClose={() => setShowProfessionalTemplate(false)}
          />
        )}

        {/* Custom Report Builder Modal */}
        {showCustomReportBuilder && (
          <CustomReportBuilder
            data={data}
            onClose={() => setShowCustomReportBuilder(false)}
          />
        )}

        {/* Framework Compliance Modal */}
        {showFrameworkCompliance && (
          <Modal
            isOpen={showFrameworkCompliance}
            onClose={() => setShowFrameworkCompliance(false)}
            title="📋 Framework Compliance Analysis"
            size="xl"
            isDark={isDark}
          >
            <FrameworkCompliance />
          </Modal>
        )}

        {/* Framework Reports Modal */}
        {showFrameworkReports && (
          <Modal
            isOpen={showFrameworkReports}
            onClose={() => setShowFrameworkReports(false)}
            title="📄 Framework-Specific Reports"
            size="xl"
            isDark={isDark}
          >
            <div className="space-y-6">
              {data.length === 0 ? (
                <Alert 
                  type="info"
                  title="No Data Available"
                  message="Add ESG data entries to generate framework-specific reports."
                />
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { name: 'GRI Standards', desc: 'Global Reporting Initiative', icon: '🌍' },
                      { name: 'SASB Standards', desc: 'Sustainability Accounting Standards', icon: '📊' },
                      { name: 'TCFD Report', desc: 'Climate-related Financial Disclosures', icon: '🌡️' },
                      { name: 'SEBI BRSR', desc: 'Business Responsibility Report', icon: '🇮🇳' }
                    ].map((framework, idx) => (
                      <div key={idx} className={`p-4 border rounded-lg ${theme.border.primary} hover:${theme.bg.subtle} cursor-pointer`}>
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-2xl">{framework.icon}</span>
                          <div>
                            <h4 className={`font-semibold ${theme.text.primary}`}>{framework.name}</h4>
                            <p className={`text-sm ${theme.text.secondary}`}>{framework.desc}</p>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-3">
                          <Button 
                            size="sm" 
                            variant="primary"
                            onClick={() => {
                              const normalizedData = normalizeData(data);
                              const options = { companyName: data[0]?.companyName || 'Company', reportPeriod: new Date().getFullYear() };
                              
                              let pdf;
                              switch(framework.name) {
                                case 'GRI Standards':
                                  pdf = generateGRIPDF(normalizedData, options);
                                  break;
                                case 'SASB Standards':
                                  pdf = generateSASBPDF(normalizedData, options);
                                  break;
                                case 'TCFD Report':
                                  pdf = generateTCFDPDF(normalizedData, options);
                                  break;
                                case 'SEBI BRSR':
                                  pdf = generateBRSRPDF(normalizedData, options);
                                  break;
                                default:
                                  pdf = generateGRIPDF(normalizedData, options);
                              }
                              
                              const filename = `${framework.name.replace(/\s+/g, '-')}-Report-${new Date().toISOString().split('T')[0]}.pdf`;
                              pdf.save(filename);
                              showToast(`${framework.name} report generated`, 'success');
                            }}
                          >
                            Generate PDF
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setSelectedReport(framework.name);
                              showToast(`Viewing ${framework.name} template`, 'info');
                            }}
                          >
                            Preview
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className={`p-4 rounded-lg ${theme.bg.subtle}`}>
                    <h4 className={`font-semibold ${theme.text.primary} mb-2`}>📋 Data Summary</h4>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className={theme.text.secondary}>Environmental:</span>
                        <span className="ml-2 font-medium">{data.filter(d => d.category === 'environmental').length} metrics</span>
                      </div>
                      <div>
                        <span className={theme.text.secondary}>Social:</span>
                        <span className="ml-2 font-medium">{data.filter(d => d.category === 'social').length} metrics</span>
                      </div>
                      <div>
                        <span className={theme.text.secondary}>Governance:</span>
                        <span className="ml-2 font-medium">{data.filter(d => d.category === 'governance').length} metrics</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
              
              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={() => setShowFrameworkReports(false)}>Close</Button>
              </div>
            </div>
          </Modal>
        )}

        {/* Predictive Analytics Modal */}
        {showPredictiveAnalytics && (
          <Modal
            isOpen={showPredictiveAnalytics}
            onClose={() => setShowPredictiveAnalytics(false)}
            title="🔮 Predictive ESG Analytics"
            isDark={isDark}
          >
            <div className="space-y-4">
              <Alert type="info" title="AI-Powered Insights" message="Advanced predictive modeling for ESG performance forecasting" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={`p-4 rounded-lg ${theme.bg.subtle}`}>
                  <h4 className={`font-semibold ${theme.text.primary} mb-2`}>📈 Trend Forecasting</h4>
                  <p className={`text-sm ${theme.text.secondary} mb-3`}>Predict ESG scores for next 12 months</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Environmental</span>
                      <span className="text-green-600">↗ +5.2% projected</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Social</span>
                      <span className="text-blue-600">↗ +3.1% projected</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Governance</span>
                      <span className="text-purple-600">→ +1.8% projected</span>
                    </div>
                  </div>
                </div>
                
                <div className={`p-4 rounded-lg ${theme.bg.subtle}`}>
                  <h4 className={`font-semibold ${theme.text.primary} mb-2`}>⚠️ Risk Assessment</h4>
                  <p className={`text-sm ${theme.text.secondary} mb-3`}>Identify potential ESG risks</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                      <span>Carbon target at risk</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      <span>Social metrics on track</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      <span>Governance improving</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className={`p-4 rounded-lg border-l-4 border-blue-500 ${theme.bg.subtle}`}>
                <h4 className={`font-semibold ${theme.text.primary} mb-2`}>🎯 Recommendations</h4>
                <ul className={`text-sm ${theme.text.secondary} space-y-1`}>
                  <li>• Increase renewable energy adoption by 15% to meet 2025 targets</li>
                  <li>• Implement diversity training programs to improve social scores</li>
                  <li>• Enhance board independence for better governance ratings</li>
                </ul>
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button variant="primary" onClick={() => showToast('Predictive model updated', 'success')}>Generate Forecast</Button>
                <Button variant="outline" onClick={() => setShowPredictiveAnalytics(false)}>Close</Button>
              </div>
            </div>
          </Modal>
        )}

        {/* Integrations Modal */}
        {showIntegrations && (
          <Modal
            isOpen={showIntegrations}
            onClose={() => setShowIntegrations(false)}
            title="🔗 ESG Data Integrations"
            isDark={isDark}
          >
            <div className="space-y-4">
              <Alert type="info" title="Connect Your Systems" message="Integrate with external ESG data sources and reporting platforms" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={`p-4 rounded-lg border ${theme.border.primary}`}>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">📊</span>
                    <div>
                      <h4 className={`font-semibold ${theme.text.primary}`}>Bloomberg ESG</h4>
                      <p className={`text-xs ${theme.text.secondary}`}>Market data integration</p>
                    </div>
                    <span className="ml-auto px-2 py-1 text-xs bg-green-100 text-green-800 rounded">Connected</span>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => showToast('Bloomberg sync initiated', 'success')}>Sync Data</Button>
                </div>
                
                <div className={`p-4 rounded-lg border ${theme.border.primary}`}>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">🌍</span>
                    <div>
                      <h4 className={`font-semibold ${theme.text.primary}`}>CDP Platform</h4>
                      <p className={`text-xs ${theme.text.secondary}`}>Carbon disclosure</p>
                    </div>
                    <span className="ml-auto px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">Setup</span>
                  </div>
                  <Button size="sm" variant="primary" onClick={() => showToast('CDP integration configured', 'success')}>Connect</Button>
                </div>
                
                <div className={`p-4 rounded-lg border ${theme.border.primary}`}>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">📈</span>
                    <div>
                      <h4 className={`font-semibold ${theme.text.primary}`}>MSCI ESG</h4>
                      <p className={`text-xs ${theme.text.secondary}`}>Rating benchmarks</p>
                    </div>
                    <span className="ml-auto px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded">Available</span>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => showToast('MSCI integration available', 'info')}>Learn More</Button>
                </div>
                
                <div className={`p-4 rounded-lg border ${theme.border.primary}`}>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">🔄</span>
                    <div>
                      <h4 className={`font-semibold ${theme.text.primary}`}>SAP Sustainability</h4>
                      <p className={`text-xs ${theme.text.secondary}`}>ERP integration</p>
                    </div>
                    <span className="ml-auto px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">Beta</span>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => showToast('SAP integration in beta', 'info')}>Join Beta</Button>
                </div>
              </div>
              
              <div className={`p-4 rounded-lg ${theme.bg.subtle}`}>
                <h4 className={`font-semibold ${theme.text.primary} mb-2`}>🚀 API Endpoints</h4>
                <div className="space-y-2 text-sm font-mono">
                  <div className="flex justify-between">
                    <span>GET /api/esg/data</span>
                    <span className="text-green-600">Active</span>
                  </div>
                  <div className="flex justify-between">
                    <span>POST /api/esg/import</span>
                    <span className="text-green-600">Active</span>
                  </div>
                  <div className="flex justify-between">
                    <span>GET /api/esg/reports</span>
                    <span className="text-green-600">Active</span>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button variant="primary" onClick={() => showToast('Integration settings saved', 'success')}>Save Settings</Button>
                <Button variant="outline" onClick={() => setShowIntegrations(false)}>Close</Button>
              </div>
            </div>
          </Modal>
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

      {/* Enhanced Print Preview Modal */}
      {showPreview && (
        <Modal
          isOpen={showPreview}
          onClose={() => setShowPreview(false)}
          title={`Print Preview - ${selectedReport}`}
          size="xl"
          actions={[
            {
              label: 'Print Now',
              onClick: () => { 
                setShowPreview(false); 
                setTimeout(() => {
                  window.print();
                  showToast('Report sent to printer', 'success');
                }, 100); 
              },
              variant: 'primary',
              icon: '🖨️'
            },
            {
              label: 'Close',
              onClick: () => setShowPreview(false),
              variant: 'outline'
            }
          ]}
        >
          <div className="max-h-[70vh] overflow-y-auto">
            
            <div className="print-preview">
              {/* Print Header */}
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold mb-2">ESG Performance Report</h1>
                <p className="text-gray-600">Report Type: {selectedReport}</p>
                <p className="text-gray-600">Generated on: {new Date().toLocaleDateString()}</p>
                <hr className="my-4" />
              </div>

              {/* Overall Summary */}
              <div className="mb-6">
                <h2 className="text-lg font-bold mb-4">Overall ESG Performance Summary</h2>
                <div className="grid grid-cols-4 gap-4">
                  <div className="border p-3 text-center">
                    <h3 className="font-semibold text-emerald-800">Environmental</h3>
                    <p className="text-xl font-bold">{overallSummary.environmental || 'N/A'}</p>
                  </div>
                  <div className="border p-3 text-center">
                    <h3 className="font-semibold text-blue-800">Social</h3>
                    <p className="text-xl font-bold">{overallSummary.social || 'N/A'}</p>
                  </div>
                  <div className="border p-3 text-center">
                    <h3 className="font-semibold text-purple-800">Governance</h3>
                    <p className="text-xl font-bold">{overallSummary.governance || 'N/A'}</p>
                  </div>
                  <div className="border p-3 text-center">
                    <h3 className="font-semibold text-gray-800">Overall Score</h3>
                    <p className="text-xl font-bold">{overallSummary.overall || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Metrics Tables */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-bold bg-emerald-600 text-white p-2 text-center">Environmental</h3>
                  <table className="w-full border border-collapse text-sm">
                    <thead>
                      <tr className="bg-emerald-600 text-white">
                        <th className="border p-2 text-left">Metric</th>
                        <th className="border p-2 text-left">Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getEnvironmentalMetrics().map((metric, i) => (
                        <tr key={i}>
                          <td className="border p-2">{metric.name}</td>
                          <td className="border p-2">{metric.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div>
                  <h3 className="font-bold bg-emerald-600 text-white p-2 text-center">Social</h3>
                  <table className="w-full border border-collapse text-sm">
                    <thead>
                      <tr className="bg-emerald-600 text-white">
                        <th className="border p-2 text-left">Metric</th>
                        <th className="border p-2 text-left">Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getSocialMetrics().map((metric, i) => (
                        <tr key={i}>
                          <td className="border p-2">{metric.name}</td>
                          <td className="border p-2">{metric.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div>
                  <h3 className="font-bold bg-emerald-600 text-white p-2 text-center">Governance</h3>
                  <table className="w-full border border-collapse text-sm">
                    <thead>
                      <tr className="bg-emerald-600 text-white">
                        <th className="border p-2 text-left">Metric</th>
                        <th className="border p-2 text-left">Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getGovernanceMetrics().map((metric, i) => (
                        <tr key={i}>
                          <td className="border p-2">{metric.name}</td>
                          <td className="border p-2">{metric.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div>
                  <h3 className="font-bold bg-emerald-600 text-white p-2 text-center">Auto-Calculated Metrics</h3>
                  <table className="w-full border border-collapse text-sm">
                    <thead>
                      <tr className="bg-emerald-600 text-white">
                        <th className="border p-2 text-left">Metric</th>
                        <th className="border p-2 text-left">Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getCalculatedMetrics().map((metric, i) => (
                        <tr key={i}>
                          <td className="border p-2">{metric.name}</td>
                          <td className="border p-2">{metric.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Year-over-Year Data */}
              {yearlyData.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-bold mb-2">Year-over-Year Performance</h3>
                  <table className="w-full border border-collapse text-sm">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border p-2">Year</th>
                        <th className="border p-2">Environmental</th>
                        <th className="border p-2">Social</th>
                        <th className="border p-2">Governance</th>
                        <th className="border p-2">Overall Avg</th>
                      </tr>
                    </thead>
                    <tbody>
                      {yearlyData.map((row) => (
                        <tr key={row.year}>
                          <td className="border p-2">{row.year}</td>
                          <td className="border p-2">{row.environmental}</td>
                          <td className="border p-2">{row.social}</td>
                          <td className="border p-2">{row.governance}</td>
                          <td className="border p-2">{row.average}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Save / Print footer */}
      <div className="fixed bottom-4 right-6 left-6 md:left-auto md:right-6 z-50">
        <div className="max-w-7xl mx-auto flex justify-end gap-3">
          <button
            onClick={() => handleSaveFullReport()}
            className={`px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700 shadow-lg`}
            disabled={isGenerating}
            title="Save Full Report (JSON)"
          >
            {isGenerating ? 'Saving...' : '💾 Save JSON'}
          </button>

          <button
            onClick={() => exportPDF()}
            className={`px-4 py-2 rounded-lg bg-gray-50 text-gray-800 text-sm border hover:bg-gray-100 shadow-lg`}
            disabled={isGenerating}
            title="Save Full Report (PDF)"
          >
            📄 Save PDF
          </button>

          <button
            onClick={() => handlePrintReport()}
            className={`px-4 py-2 rounded-lg bg-white text-gray-800 text-sm border hover:bg-gray-100 shadow-lg`}
            title="Print Report"
          >
            🖨️ Print
          </button>
        </div>
      </div>
    </div>
  );
}

export default Reports;
