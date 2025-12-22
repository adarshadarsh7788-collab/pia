import React, { useState } from 'react';
import { EnhancedBRSRGenerator } from '../utils/EnhancedBRSRGenerator';
import { useTheme } from '../contexts/ThemeContext';
import { getThemeClasses } from '../utils/themeUtils';
import { Button, Modal, Alert } from './ProfessionalUX';
import jsPDF from 'jspdf';

const EnhancedBRSRReport = ({ data, onClose }) => {
  const { isDark } = useTheme();
  const theme = getThemeClasses(isDark);
  const [activeSection, setActiveSection] = useState('executiveSummary');
  const [isGenerating, setIsGenerating] = useState(false);

  const brsrReport = EnhancedBRSRGenerator.generateBRSRReport(data);

  const sections = [
    { id: 'executiveSummary', title: 'Executive Summary', icon: '📊', color: 'blue' },
    { id: 'sectionA', title: 'Section A - General Disclosures', icon: '🏢', color: 'green' },
    { id: 'sectionB', title: 'Section B - Management Processes', icon: '⚙️', color: 'purple' },
    { id: 'sectionC', title: 'Section C - Principle Performance', icon: '📋', color: 'orange' },
    { id: 'complianceMatrix', title: 'Compliance Matrix', icon: '✅', color: 'red' },
    { id: 'actionPlan', title: 'Action Plan', icon: '🎯', color: 'indigo' },
    { id: 'companyGuidance', title: 'Company Guidance', icon: '📚', color: 'teal' }
  ];

  const generateProfessionalPDF = async () => {
    setIsGenerating(true);
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      let yPosition = 20;

      // Professional Header with Logo Space
      pdf.setFillColor(0, 102, 51);
      pdf.rect(0, 0, pageWidth, 30, 'F');
      
      pdf.setFontSize(24);
      pdf.setTextColor(255, 255, 255);
      pdf.text('BUSINESS RESPONSIBILITY', pageWidth / 2, 15, { align: 'center' });
      pdf.text('& SUSTAINABILITY REPORT', pageWidth / 2, 25, { align: 'center' });
      
      yPosition = 45;
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(14);
      pdf.text(brsrReport.reportHeader.subtitle, pageWidth / 2, yPosition, { align: 'center' });
      
      yPosition += 15;
      pdf.setFontSize(18);
      pdf.text(brsrReport.reportHeader.companyName, pageWidth / 2, yPosition, { align: 'center' });
      
      yPosition += 10;
      pdf.setFontSize(12);
      pdf.text(`Financial Year: ${brsrReport.reportHeader.financialYear}`, pageWidth / 2, yPosition, { align: 'center' });

      // Executive Summary Section
      pdf.addPage();
      yPosition = 20;
      
      pdf.setFillColor(0, 102, 51);
      pdf.rect(15, yPosition - 5, pageWidth - 30, 12, 'F');
      pdf.setFontSize(16);
      pdf.setTextColor(255, 255, 255);
      pdf.text('EXECUTIVE SUMMARY', 20, yPosition + 3);
      
      yPosition += 20;
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(12);
      
      // Overall Performance Box
      pdf.setFillColor(240, 248, 255);
      pdf.rect(20, yPosition, pageWidth - 40, 25, 'F');
      pdf.setDrawColor(0, 102, 51);
      pdf.rect(20, yPosition, pageWidth - 40, 25);
      
      pdf.setFontSize(14);
      pdf.text('Overall ESG Performance', 25, yPosition + 8);
      pdf.setFontSize(20);
      pdf.text(`Score: ${brsrReport.executiveSummary.overallPerformance.esgScore}`, 25, yPosition + 18);
      pdf.setFontSize(12);
      pdf.text(`Rating: ${brsrReport.executiveSummary.overallPerformance.rating}`, 120, yPosition + 18);
      
      yPosition += 35;
      
      // Key Highlights
      pdf.setFontSize(14);
      pdf.setTextColor(0, 102, 51);
      pdf.text('Key Performance Highlights:', 20, yPosition);
      
      yPosition += 10;
      pdf.setFontSize(10);
      pdf.setTextColor(0, 0, 0);
      
      brsrReport.executiveSummary.keyHighlights.forEach((highlight, index) => {
        if (yPosition > pageHeight - 30) {
          pdf.addPage();
          yPosition = 20;
        }
        pdf.text(`• ${highlight}`, 25, yPosition);
        yPosition += 6;
      });

      // Material Topics
      yPosition += 10;
      pdf.setFontSize(14);
      pdf.setTextColor(0, 102, 51);
      pdf.text('Material Topics:', 20, yPosition);
      
      yPosition += 8;
      pdf.setFontSize(10);
      pdf.setTextColor(0, 0, 0);
      
      const topics = brsrReport.executiveSummary.materialTopics;
      for (let i = 0; i < topics.length; i += 2) {
        if (yPosition > pageHeight - 30) {
          pdf.addPage();
          yPosition = 20;
        }
        pdf.text(`${i + 1}. ${topics[i]}`, 25, yPosition);
        if (topics[i + 1]) {
          pdf.text(`${i + 2}. ${topics[i + 1]}`, 110, yPosition);
        }
        yPosition += 6;
      }

      // Section A - General Disclosures
      pdf.addPage();
      yPosition = 20;
      
      pdf.setFillColor(0, 102, 51);
      pdf.rect(15, yPosition - 5, pageWidth - 30, 12, 'F');
      pdf.setFontSize(16);
      pdf.setTextColor(255, 255, 255);
      pdf.text('SECTION A: GENERAL DISCLOSURES', 20, yPosition + 3);
      
      yPosition += 20;
      pdf.setTextColor(0, 0, 0);
      
      // A.1 Corporate Identity
      pdf.setFontSize(12);
      pdf.setTextColor(0, 102, 51);
      pdf.text('A.1 Corporate Identity:', 20, yPosition);
      
      yPosition += 10;
      pdf.setFontSize(10);
      pdf.setTextColor(0, 0, 0);
      
      const corporateInfo = brsrReport.sectionA.a1_corporateIdentity;
      const corporateFields = [
        ['Company Name', corporateInfo.companyName],
        ['CIN', corporateInfo.cin],
        ['Year of Incorporation', corporateInfo.yearOfIncorporation],
        ['Registered Office', corporateInfo.registeredOffice],
        ['Website', corporateInfo.website],
        ['Stock Exchanges', corporateInfo.stockExchanges.join(', ')],
        ['Paid-up Capital', corporateInfo.paidUpCapital],
        ['Reporting Boundary', corporateInfo.reportingBoundary]
      ];
      
      corporateFields.forEach(([label, value]) => {
        if (yPosition > pageHeight - 20) {
          pdf.addPage();
          yPosition = 20;
        }
        pdf.text(`${label}:`, 25, yPosition);
        pdf.text(value || 'Not specified', 80, yPosition);
        yPosition += 6;
      });

      // A.4 Employee Information
      yPosition += 10;
      pdf.setFontSize(12);
      pdf.setTextColor(0, 102, 51);
      pdf.text('A.4 Employee Information:', 20, yPosition);
      
      yPosition += 10;
      pdf.setFontSize(10);
      pdf.setTextColor(0, 0, 0);
      
      const employeeInfo = brsrReport.sectionA.a4_employees;
      const employeeFields = [
        ['Total Employees', employeeInfo.totalEmployees],
        ['Permanent Employees', employeeInfo.permanentEmployees],
        ['Contractual Employees', employeeInfo.contractualEmployees],
        ['Female Employees (%)', employeeInfo.femaleEmployees],
        ['Differently Abled Employees', employeeInfo.differentlyAbledEmployees],
        ['Employee Turnover Rate (%)', employeeInfo.turnoverRate]
      ];
      
      employeeFields.forEach(([label, value]) => {
        if (yPosition > pageHeight - 20) {
          pdf.addPage();
          yPosition = 20;
        }
        pdf.text(`${label}:`, 25, yPosition);
        pdf.text(String(value || 0), 80, yPosition);
        yPosition += 6;
      });

      // Compliance Matrix
      pdf.addPage();
      yPosition = 20;
      
      pdf.setFillColor(220, 20, 60);
      pdf.rect(15, yPosition - 5, pageWidth - 30, 12, 'F');
      pdf.setFontSize(16);
      pdf.setTextColor(255, 255, 255);
      pdf.text('COMPLIANCE MATRIX', 20, yPosition + 3);
      
      yPosition += 20;
      pdf.setTextColor(0, 0, 0);
      
      // Overall Compliance Score
      pdf.setFillColor(255, 248, 220);
      pdf.rect(20, yPosition, pageWidth - 40, 15, 'F');
      pdf.setDrawColor(220, 20, 60);
      pdf.rect(20, yPosition, pageWidth - 40, 15);
      
      pdf.setFontSize(14);
      pdf.text(`Overall Compliance: ${brsrReport.complianceMatrix.overallCompliance || 75}%`, 25, yPosition + 10);
      
      yPosition += 25;
      
      // Compliance Details
      pdf.setFontSize(12);
      pdf.text('Mandatory Disclosures Status:', 20, yPosition);
      
      yPosition += 10;
      pdf.setFontSize(10);
      
      brsrReport.complianceMatrix.mandatoryDisclosures.forEach((disclosure, index) => {
        if (yPosition > pageHeight - 30) {
          pdf.addPage();
          yPosition = 20;
        }
        
        const statusColor = disclosure.status === 'Complete' ? [0, 128, 0] : [255, 140, 0];
        pdf.setTextColor(...statusColor);
        pdf.text(`${disclosure.section}: ${disclosure.status} (${disclosure.completeness}%)`, 25, yPosition);
        pdf.setTextColor(0, 0, 0);
        pdf.text(`Penalty: ${disclosure.penalty}`, 25, yPosition + 5);
        yPosition += 12;
      });

      // Action Plan
      pdf.addPage();
      yPosition = 20;
      
      pdf.setFillColor(75, 0, 130);
      pdf.rect(15, yPosition - 5, pageWidth - 30, 12, 'F');
      pdf.setFontSize(16);
      pdf.setTextColor(255, 255, 255);
      pdf.text('ESG IMPROVEMENT ACTION PLAN', 20, yPosition + 3);
      
      yPosition += 20;
      pdf.setTextColor(0, 0, 0);
      
      const actionPlan = brsrReport.actionPlan;
      const phases = ['immediate', 'shortTerm', 'mediumTerm', 'longTerm'];
      
      phases.forEach(phase => {
        if (!actionPlan[phase]) return;
        
        const phaseData = actionPlan[phase];
        
        if (yPosition > pageHeight - 50) {
          pdf.addPage();
          yPosition = 20;
        }
        
        pdf.setFontSize(12);
        pdf.setTextColor(75, 0, 130);
        pdf.text(`${phase.toUpperCase()} (${phaseData.timeline})`, 20, yPosition);
        
        yPosition += 8;
        pdf.setFontSize(10);
        pdf.setTextColor(0, 0, 0);
        pdf.text(`Priority: ${phaseData.priority} | Budget: ${phaseData.budget} | Owner: ${phaseData.owner}`, 25, yPosition);
        
        yPosition += 8;
        phaseData.actions.forEach(action => {
          if (yPosition > pageHeight - 20) {
            pdf.addPage();
            yPosition = 20;
          }
          pdf.text(`• ${action}`, 25, yPosition);
          yPosition += 5;
        });
        
        yPosition += 10;
      });

      // Company Guidance
      pdf.addPage();
      yPosition = 20;
      
      pdf.setFillColor(0, 128, 128);
      pdf.rect(15, yPosition - 5, pageWidth - 30, 12, 'F');
      pdf.setFontSize(16);
      pdf.setTextColor(255, 255, 255);
      pdf.text('COMPANY GUIDANCE', 20, yPosition + 3);
      
      yPosition += 20;
      pdf.setTextColor(0, 0, 0);
      
      // Regulatory Requirements
      pdf.setFontSize(12);
      pdf.setTextColor(0, 128, 128);
      pdf.text('Regulatory Requirements:', 20, yPosition);
      
      yPosition += 10;
      pdf.setFontSize(10);
      pdf.setTextColor(0, 0, 0);
      
      const regReqs = brsrReport.companyGuidance.regulatoryRequirements;
      const regFields = [
        ['Applicability', regReqs.applicability],
        ['Filing Deadline', regReqs.filingDeadline],
        ['Board Approval', regReqs.boardApproval],
        ['Assurance', regReqs.assurance],
        ['Penalties', regReqs.penalties]
      ];
      
      regFields.forEach(([label, value]) => {
        if (yPosition > pageHeight - 20) {
          pdf.addPage();
          yPosition = 20;
        }
        pdf.text(`${label}:`, 25, yPosition);
        pdf.text(value, 25, yPosition + 5);
        yPosition += 12;
      });

      // Best Practices
      yPosition += 10;
      pdf.setFontSize(12);
      pdf.setTextColor(0, 128, 128);
      pdf.text('Data Collection Best Practices:', 20, yPosition);
      
      yPosition += 10;
      pdf.setFontSize(10);
      pdf.setTextColor(0, 0, 0);
      
      brsrReport.companyGuidance.dataCollectionBestPractices.forEach(practice => {
        if (yPosition > pageHeight - 20) {
          pdf.addPage();
          yPosition = 20;
        }
        pdf.text(`• ${practice}`, 25, yPosition);
        yPosition += 6;
      });

      // Footer on all pages
      const totalPages = pdf.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(128, 128, 128);
        pdf.text(`Page ${i} of ${totalPages}`, pageWidth - 30, pageHeight - 10);
        pdf.text(`Generated: ${new Date().toLocaleDateString()}`, 20, pageHeight - 10);
        pdf.text('Confidential - For Internal Use Only', pageWidth / 2, pageHeight - 10, { align: 'center' });
      }

      const filename = `Enhanced_BRSR_${data.companyName?.replace(/\s+/g, '_') || 'Company'}_${new Date().getFullYear()}.pdf`;
      pdf.save(filename);
      
    } catch (error) {
      console.error('PDF generation failed:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const renderSection = () => {
    const section = brsrReport[activeSection];
    if (!section) return null;

    switch (activeSection) {
      case 'executiveSummary':
        return (
          <div className="space-y-8">
            {/* Overall Performance Card */}
            <div className={`p-6 rounded-xl ${theme.bg.subtle} border-l-4 border-blue-500`}>
              <h3 className={`text-xl font-bold ${theme.text.primary} mb-4`}>Overall ESG Performance</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{section.overallPerformance.esgScore}</div>
                  <div className={`text-sm ${theme.text.secondary}`}>ESG Score</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{section.overallPerformance.rating}</div>
                  <div className={`text-sm ${theme.text.secondary}`}>ESG Rating</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-purple-600">{section.overallPerformance.yearOverYear}</div>
                  <div className={`text-sm ${theme.text.secondary}`}>YoY Change</div>
                </div>
              </div>
            </div>

            {/* Key Highlights */}
            <div>
              <h3 className={`text-lg font-semibold ${theme.text.primary} mb-4`}>Key Performance Highlights</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {section.keyHighlights.map((highlight, index) => (
                  <div key={index} className={`p-4 rounded-lg ${theme.bg.subtle} border-l-4 border-green-500`}>
                    <p className={`text-sm ${theme.text.primary} font-medium`}>{highlight}</p>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Material Topics */}
            <div>
              <h3 className={`text-lg font-semibold ${theme.text.primary} mb-4`}>Material Topics</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {section.materialTopics.map((topic, index) => (
                  <div key={index} className={`p-3 rounded-lg ${theme.bg.subtle} border border-gray-200`}>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-blue-600">{index + 1}</span>
                      <span className={`text-sm ${theme.text.primary}`}>{topic}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Strategic Commitments */}
            <div>
              <h3 className={`text-lg font-semibold ${theme.text.primary} mb-4`}>Strategic Commitments</h3>
              <div className="space-y-3">
                {section.strategicCommitments.map((commitment, index) => (
                  <div key={index} className={`p-4 rounded-lg ${theme.bg.subtle} border-l-4 border-purple-500`}>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🎯</span>
                      <span className={`text-sm font-medium ${theme.text.primary}`}>{commitment}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'complianceMatrix':
        return (
          <div className="space-y-6">
            <Alert 
              type="info" 
              title="SEBI BRSR Compliance Status" 
              message={`Overall compliance: ${section.overallCompliance || 75}% | Filing deadline: Within 135 days of FY end`} 
            />
            
            <div>
              <h3 className={`text-lg font-semibold ${theme.text.primary} mb-4`}>Mandatory Disclosures</h3>
              <div className="space-y-4">
                {section.mandatoryDisclosures.map((disclosure, index) => (
                  <div key={index} className={`p-4 rounded-lg ${theme.bg.subtle} border-l-4 ${
                    disclosure.status === 'Complete' ? 'border-green-500' : 'border-yellow-500'
                  }`}>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className={`font-medium ${theme.text.primary}`}>{disclosure.section}</h4>
                        <p className={`text-sm ${theme.text.secondary} mt-1`}>Deadline: {disclosure.deadline}</p>
                        <p className={`text-sm text-red-600 mt-1`}>Penalty: {disclosure.penalty}</p>
                      </div>
                      <div className="text-right">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          disclosure.status === 'Complete' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {disclosure.status}
                        </span>
                        <div className={`text-sm ${theme.text.secondary} mt-1`}>
                          {disclosure.completeness}% Complete
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {section.gaps && section.gaps.length > 0 && (
              <div>
                <h3 className={`text-lg font-semibold ${theme.text.primary} mb-4`}>Compliance Gaps</h3>
                <div className="space-y-2">
                  {section.gaps.map((gap, index) => (
                    <div key={index} className={`p-3 rounded-lg ${theme.bg.subtle} border-l-4 border-red-500`}>
                      <span className={`text-sm ${theme.text.primary}`}>⚠️ {gap}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 'companyGuidance':
        return (
          <div className="space-y-8">
            {/* Regulatory Requirements */}
            <div className={`p-6 rounded-xl ${theme.bg.subtle} border-l-4 border-teal-500`}>
              <h3 className={`text-lg font-semibold ${theme.text.primary} mb-4`}>Regulatory Requirements</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(section.regulatoryRequirements).map(([key, value]) => (
                  <div key={key} className="space-y-1">
                    <div className={`text-sm font-medium ${theme.text.secondary} capitalize`}>
                      {key.replace(/([A-Z])/g, ' $1')}:
                    </div>
                    <div className={`text-sm ${theme.text.primary}`}>{value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Best Practices */}
            <div>
              <h3 className={`text-lg font-semibold ${theme.text.primary} mb-4`}>Data Collection Best Practices</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {section.dataCollectionBestPractices.map((practice, index) => (
                  <div key={index} className={`p-3 rounded-lg ${theme.bg.subtle} border-l-4 border-blue-500`}>
                    <span className={`text-sm ${theme.text.primary}`}>✓ {practice}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Common Mistakes */}
            <div>
              <h3 className={`text-lg font-semibold ${theme.text.primary} mb-4`}>Common Mistakes to Avoid</h3>
              <div className="space-y-2">
                {section.commonMistakes.map((mistake, index) => (
                  <div key={index} className={`p-3 rounded-lg ${theme.bg.subtle} border-l-4 border-red-500`}>
                    <span className={`text-sm ${theme.text.primary}`}>❌ {mistake}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Budget Guidance */}
            <div className={`p-6 rounded-xl ${theme.bg.subtle} border-l-4 border-green-500`}>
              <h3 className={`text-lg font-semibold ${theme.text.primary} mb-4`}>Budget Guidance</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="text-center p-4 bg-white rounded-lg">
                  <div className="text-lg font-bold text-green-600">{section.budgetGuidance.small}</div>
                  <div className="text-sm text-gray-600">Small Companies</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg">
                  <div className="text-lg font-bold text-blue-600">{section.budgetGuidance.medium}</div>
                  <div className="text-sm text-gray-600">Medium Companies</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg">
                  <div className="text-lg font-bold text-purple-600">{section.budgetGuidance.large}</div>
                  <div className="text-sm text-gray-600">Large Companies</div>
                </div>
              </div>
              
              <h4 className={`font-medium ${theme.text.primary} mb-2`}>Budget Breakdown:</h4>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {Object.entries(section.budgetGuidance.breakdown).map(([category, percentage]) => (
                  <div key={category} className="text-center p-2 bg-white rounded">
                    <div className="text-sm font-medium capitalize">{category}</div>
                    <div className="text-lg font-bold text-indigo-600">{percentage}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className={`p-8 text-center ${theme.bg.subtle} rounded-lg`}>
            <div className="text-4xl mb-4">📋</div>
            <h3 className={`text-lg font-semibold ${theme.text.primary} mb-2`}>
              {sections.find(s => s.id === activeSection)?.title}
            </h3>
            <p className={`${theme.text.secondary}`}>
              Detailed content for this section follows SEBI BRSR guidelines and industry best practices.
            </p>
          </div>
        );
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Enhanced SEBI BRSR Report"
      size="full"
      actions={[
        {
          label: isGenerating ? 'Generating...' : 'Download Professional PDF',
          onClick: generateProfessionalPDF,
          variant: 'primary',
          icon: '📄',
          disabled: isGenerating
        },
        {
          label: 'Close',
          onClick: onClose,
          variant: 'outline'
        }
      ]}
    >
      <div className="flex h-full">
        {/* Enhanced Sidebar Navigation */}
        <div className={`w-80 ${theme.bg.subtle} border-r ${theme.border.primary} p-4`}>
          <div className="space-y-2">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full text-left p-4 rounded-lg transition-all duration-200 ${
                  activeSection === section.id
                    ? `bg-${section.color}-100 text-${section.color}-800 font-semibold shadow-md`
                    : `${theme.hover.subtle} ${theme.text.primary}`
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{section.icon}</span>
                  <div>
                    <div className="text-sm font-medium">{section.title}</div>
                    {activeSection === section.id && (
                      <div className="text-xs opacity-75 mt-1">Active Section</div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
          
          {/* Progress Indicator */}
          <div className="mt-6 p-4 bg-white rounded-lg">
            <div className="text-sm font-medium text-gray-700 mb-2">Report Completeness</div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{width: '75%'}}></div>
            </div>
            <div className="text-xs text-gray-600 mt-1">75% Complete</div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-5xl mx-auto">
            <div className="mb-6">
              <h2 className={`text-2xl font-bold ${theme.text.primary} mb-2`}>
                {sections.find(s => s.id === activeSection)?.title}
              </h2>
              <div className={`h-1 w-24 bg-gradient-to-r from-${sections.find(s => s.id === activeSection)?.color}-500 to-blue-500 rounded`}></div>
            </div>
            
            {renderSection()}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default EnhancedBRSRReport;