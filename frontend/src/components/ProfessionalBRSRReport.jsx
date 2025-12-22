import React, { useState, useRef } from 'react';
import { ProfessionalBRSRGenerator } from '../utils/ProfessionalBRSRGenerator';
import './ProfessionalBRSRReport.css';

const ProfessionalBRSRReport = ({ data }) => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [reportData, setReportData] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const reportRef = useRef();

  const generateReport = async () => {
    setIsGenerating(true);
    try {
      const report = ProfessionalBRSRGenerator.generateAdvancedBRSRReport(data);
      setReportData(report);
    } catch (error) {
      console.error('Report generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const exportToPDF = async () => {
    if (typeof window !== 'undefined' && window.html2pdf) {
      const element = reportRef.current;
      const opt = {
        margin: 0.5,
        filename: `Professional_BRSR_${data.companyName?.replace(/\s+/g, '_')}_${new Date().getFullYear()}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
      };
      await window.html2pdf().set(opt).from(element).save();
    }
  };

  const navigationItems = [
    { id: 'dashboard', label: 'Executive Dashboard', icon: '📊' },
    { id: 'benchmarking', label: 'Industry Benchmarking', icon: '📈' },
    { id: 'risk', label: 'Risk Assessment', icon: '⚠️' },
    { id: 'materiality', label: 'Materiality Matrix', icon: '🎯' },
    { id: 'performance', label: 'Performance Analytics', icon: '📉' },
    { id: 'recommendations', label: 'Strategic Recommendations', icon: '💡' },
    { id: 'investor', label: 'Investor Readiness', icon: '💼' }
  ];

  if (!reportData) {
    return (
      <div className="professional-brsr-container">
        <div className="report-header">
          <h1>Professional SEBI BRSR Report Generator</h1>
          <p>Advanced ESG Analytics & Industry Benchmarking</p>
        </div>
        
        <div className="generation-panel">
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Executive Dashboard</h3>
              <p>Real-time ESG KPIs with industry benchmarking</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📈</div>
              <h3>Performance Analytics</h3>
              <p>Trend analysis and predictive forecasting</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⚠️</div>
              <h3>Risk Assessment</h3>
              <p>Comprehensive climate and ESG risk mapping</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💼</div>
              <h3>Investor Readiness</h3>
              <p>Rating agency preparation and disclosure frameworks</p>
            </div>
          </div>
          
          <button 
            className="generate-btn professional"
            onClick={generateReport}
            disabled={isGenerating}
          >
            {isGenerating ? 'Generating Professional Report...' : 'Generate Professional BRSR Report'}
          </button>
        </div>
      </div>
    );
  }

  const renderExecutiveDashboard = () => (
    <div className="dashboard-section">
      <div className="dashboard-header">
        <h2>Executive ESG Dashboard</h2>
        <div className="dashboard-metrics">
          <div className="metric-card primary">
            <div className="metric-value">{reportData.executiveDashboard.overallPerformance.esgScore}</div>
            <div className="metric-label">ESG Score</div>
            <div className="metric-trend">{reportData.executiveDashboard.overallPerformance.momentum}</div>
          </div>
          <div className="metric-card">
            <div className="metric-value">{reportData.executiveDashboard.overallPerformance.rating}</div>
            <div className="metric-label">ESG Rating</div>
            <div className="metric-trend">{reportData.executiveDashboard.overallPerformance.outlook}</div>
          </div>
          <div className="metric-card">
            <div className="metric-value">{reportData.executiveDashboard.overallPerformance.industryRank}</div>
            <div className="metric-label">Industry Rank</div>
            <div className="metric-trend">{reportData.executiveDashboard.overallPerformance.percentile}</div>
          </div>
        </div>
      </div>

      <div className="kpi-grid">
        <div className="kpi-section">
          <h3>Environmental KPIs</h3>
          {Object.entries(reportData.executiveDashboard.keyPerformanceIndicators.environmental).map(([key, kpi]) => (
            <div key={key} className="kpi-row">
              <span className="kpi-name">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</span>
              <span className="kpi-value">{kpi.value} {kpi.unit}</span>
              <span className="kpi-benchmark">Benchmark: {kpi.benchmark}</span>
              <span className={`kpi-trend ${kpi.trend.includes('↑') ? 'positive' : kpi.trend.includes('↓') ? 'negative' : 'neutral'}`}>
                {kpi.trend}
              </span>
            </div>
          ))}
        </div>

        <div className="kpi-section">
          <h3>Social KPIs</h3>
          {Object.entries(reportData.executiveDashboard.keyPerformanceIndicators.social).map(([key, kpi]) => (
            <div key={key} className="kpi-row">
              <span className="kpi-name">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</span>
              <span className="kpi-value">{kpi.value} {kpi.unit}</span>
              <span className="kpi-benchmark">Benchmark: {kpi.benchmark}</span>
              <span className={`kpi-trend ${kpi.trend.includes('↑') ? 'positive' : kpi.trend.includes('↓') ? 'negative' : 'neutral'}`}>
                {kpi.trend}
              </span>
            </div>
          ))}
        </div>

        <div className="kpi-section">
          <h3>Governance KPIs</h3>
          {Object.entries(reportData.executiveDashboard.keyPerformanceIndicators.governance).map(([key, kpi]) => (
            <div key={key} className="kpi-row">
              <span className="kpi-name">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</span>
              <span className="kpi-value">{kpi.value} {kpi.unit}</span>
              <span className="kpi-benchmark">Benchmark: {kpi.benchmark}</span>
              <span className={`kpi-trend ${kpi.trend.includes('↑') ? 'positive' : kpi.trend.includes('↓') ? 'negative' : 'neutral'}`}>
                {kpi.trend}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderIndustryBenchmarking = () => (
    <div className="benchmarking-section">
      <h2>Industry Benchmarking Analysis</h2>
      
      <div className="sector-profile">
        <h3>Sector Profile</h3>
        <div className="profile-grid">
          <div className="profile-item">
            <label>Sector:</label>
            <span>{reportData.industryBenchmarking.sectorProfile.sector}</span>
          </div>
          <div className="profile-item">
            <label>Sub-Sector:</label>
            <span>{reportData.industryBenchmarking.sectorProfile.subSector}</span>
          </div>
          <div className="profile-item">
            <label>Market Cap:</label>
            <span>{reportData.industryBenchmarking.sectorProfile.marketCap}</span>
          </div>
        </div>
      </div>

      <div className="comparative-analysis">
        <h3>Comparative Performance</h3>
        <div className="comparison-grid">
          {['environmental', 'social', 'governance'].map(category => (
            <div key={category} className="comparison-category">
              <h4>{category.charAt(0).toUpperCase() + category.slice(1)}</h4>
              {Object.entries(reportData.industryBenchmarking.comparativeAnalysis[category]).map(([metric, data]) => (
                <div key={metric} className="comparison-row">
                  <span className="metric-name">{metric.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</span>
                  <div className="comparison-values">
                    <span className="company-value">Company: {data.company}</span>
                    <span className="industry-value">Industry: {data.industry}</span>
                    <span className={`percentile ${data.percentile >= 70 ? 'good' : data.percentile >= 50 ? 'average' : 'below'}`}>
                      {data.percentile}th percentile
                    </span>
                    <span className={`rating ${data.rating.toLowerCase().replace(' ', '-')}`}>
                      {data.rating}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="competitive-positioning">
        <h3>Competitive Positioning</h3>
        <div className="positioning-grid">
          <div className="positioning-item strengths">
            <h4>Strengths</h4>
            <ul>
              {reportData.industryBenchmarking.competitivePositioning.strengths.map((strength, index) => (
                <li key={index}>{strength}</li>
              ))}
            </ul>
          </div>
          <div className="positioning-item opportunities">
            <h4>Opportunities</h4>
            <ul>
              {reportData.industryBenchmarking.competitivePositioning.opportunities.map((opportunity, index) => (
                <li key={index}>{opportunity}</li>
              ))}
            </ul>
          </div>
          <div className="positioning-item threats">
            <h4>Threats</h4>
            <ul>
              {reportData.industryBenchmarking.competitivePositioning.threats.map((threat, index) => (
                <li key={index}>{threat}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  const renderRiskAssessment = () => (
    <div className="risk-section">
      <h2>Comprehensive ESG Risk Assessment</h2>
      
      <div className="risk-profile">
        <div className="risk-overview">
          <div className="risk-metric">
            <label>Overall Risk:</label>
            <span className={`risk-level ${reportData.riskAssessment.riskProfile.overall.toLowerCase().replace('-', '')}`}>
              {reportData.riskAssessment.riskProfile.overall}
            </span>
          </div>
          <div className="risk-metric">
            <label>Trend:</label>
            <span className="risk-trend">{reportData.riskAssessment.riskProfile.trend}</span>
          </div>
        </div>
      </div>

      <div className="risk-categories">
        <div className="risk-category">
          <h3>Climate Risks - Physical</h3>
          <div className="risk-table">
            {reportData.riskAssessment.climateRisks.physical.map((risk, index) => (
              <div key={index} className="risk-row">
                <div className="risk-name">{risk.risk}</div>
                <div className={`risk-probability ${risk.probability.toLowerCase()}`}>{risk.probability}</div>
                <div className={`risk-impact ${risk.impact.toLowerCase()}`}>{risk.impact}</div>
                <div className="risk-timeframe">{risk.timeframe}</div>
                <div className="risk-mitigation">{risk.mitigation}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="risk-category">
          <h3>Climate Risks - Transition</h3>
          <div className="risk-table">
            {reportData.riskAssessment.climateRisks.transition.map((risk, index) => (
              <div key={index} className="risk-row">
                <div className="risk-name">{risk.risk}</div>
                <div className={`risk-probability ${risk.probability.toLowerCase()}`}>{risk.probability}</div>
                <div className={`risk-impact ${risk.impact.toLowerCase()}`}>{risk.impact}</div>
                <div className="risk-timeframe">{risk.timeframe}</div>
                <div className="risk-mitigation">{risk.mitigation}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="risk-mitigation">
        <h3>Risk Mitigation Strategy</h3>
        <div className="mitigation-timeline">
          <div className="mitigation-phase">
            <h4>Immediate Actions</h4>
            <ul>
              {reportData.riskAssessment.riskMitigation.immediate.map((action, index) => (
                <li key={index}>{action}</li>
              ))}
            </ul>
          </div>
          <div className="mitigation-phase">
            <h4>Short-term Actions</h4>
            <ul>
              {reportData.riskAssessment.riskMitigation.shortTerm.map((action, index) => (
                <li key={index}>{action}</li>
              ))}
            </ul>
          </div>
          <div className="mitigation-phase">
            <h4>Long-term Actions</h4>
            <ul>
              {reportData.riskAssessment.riskMitigation.longTerm.map((action, index) => (
                <li key={index}>{action}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStrategicRecommendations = () => (
    <div className="recommendations-section">
      <h2>Strategic ESG Recommendations</h2>
      
      <div className="executive-priorities">
        {Object.entries(reportData.strategicRecommendations.executivePriorities).map(([phase, details]) => (
          <div key={phase} className={`priority-phase ${phase}`}>
            <div className="phase-header">
              <h3>{phase.charAt(0).toUpperCase() + phase.slice(1)} Priorities</h3>
              <div className="phase-meta">
                <span className="timeline">{details.timeline}</span>
                <span className="investment">{details.investment}</span>
              </div>
            </div>
            
            <div className="phase-content">
              <div className="actions">
                <h4>Key Actions</h4>
                <ul>
                  {details.actions.map((action, index) => (
                    <li key={index}>{action}</li>
                  ))}
                </ul>
              </div>
              
              <div className="impact">
                <h4>Expected Impact</h4>
                <p>{details.expectedImpact}</p>
              </div>
              
              <div className="metrics">
                <h4>Success Metrics</h4>
                <ul>
                  {details.successMetrics.map((metric, index) => (
                    <li key={index}>{metric}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="capability-building">
        <h3>Capability Building Framework</h3>
        <div className="capability-grid">
          {Object.entries(reportData.strategicRecommendations.capabilityBuilding).map(([area, capabilities]) => (
            <div key={area} className="capability-area">
              <h4>{area.charAt(0).toUpperCase() + area.slice(1)}</h4>
              <ul>
                {capabilities.map((capability, index) => (
                  <li key={index}>{capability}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="investment-priorities">
        <h3>Investment Allocation</h3>
        <div className="investment-grid">
          {Object.entries(reportData.strategicRecommendations.investmentPriorities).map(([category, details]) => (
            <div key={category} className="investment-category">
              <div className="investment-header">
                <h4>{category.charAt(0).toUpperCase() + category.slice(1)}</h4>
                <span className="allocation">{details.allocation}</span>
              </div>
              <div className="focus-areas">
                {details.focus.map((focus, index) => (
                  <span key={index} className="focus-tag">{focus}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderInvestorReadiness = () => (
    <div className="investor-section">
      <h2>Investor ESG Readiness Assessment</h2>
      
      <div className="rating-agencies">
        <h3>Rating Agency Preparedness</h3>
        <div className="agencies-grid">
          {Object.entries(reportData.investorReadiness.ratingAgencyPreparedness).map(([agency, details]) => (
            <div key={agency} className="agency-card">
              <h4>{agency.toUpperCase()}</h4>
              <div className="agency-metrics">
                <div className="current-rating">
                  Current: <span className="rating-value">{details.currentEstimate || details.currentRisk || details.currentScore}</span>
                </div>
                <div className="target-rating">
                  Target: <span className="rating-value">{details.targetRating || details.targetRisk || details.targetScore || (details.targetInclusion ? 'Yes' : 'No')}</span>
                </div>
              </div>
              <div className="key-gaps">
                <h5>Key Gaps:</h5>
                <ul>
                  {details.keyGaps.map((gap, index) => (
                    <li key={index}>{gap}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="disclosure-frameworks">
        <h3>Disclosure Framework Compliance</h3>
        <div className="frameworks-grid">
          {Object.entries(reportData.investorReadiness.disclosureFrameworks).map(([framework, details]) => (
            <div key={framework} className="framework-card">
              <h4>{framework.toUpperCase().replace('_', ' ')}</h4>
              <div className="compliance-meter">
                <div className="compliance-bar">
                  <div 
                    className="compliance-fill" 
                    style={{ width: `${details.compliance.replace('%', '')}%` }}
                  ></div>
                </div>
                <span className="compliance-percentage">{details.compliance}</span>
              </div>
              
              <div className="framework-requirements">
                <h5>Core Requirements:</h5>
                <div className="requirements-tags">
                  {details.requirements.map((req, index) => (
                    <span key={index} className="requirement-tag">{req}</span>
                  ))}
                </div>
              </div>
              
              <div className="framework-gaps">
                <h5>Implementation Gaps:</h5>
                <ul>
                  {details.gaps.map((gap, index) => (
                    <li key={index} className="gap-item">{gap}</li>
                  ))}
                </ul>
              </div>
              
              <div className="framework-missing">
                <h5>Missing Requirements:</h5>
                <ul>
                  {details.missing.map((missing, index) => (
                    <li key={index} className="missing-item">{missing}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="value-creation">
        <h3>ESG Value Creation Story</h3>
        <div className="value-grid">
          {Object.entries(reportData.investorReadiness.valueCreationStory).map(([category, description]) => (
            <div key={category} className="value-item">
              <h4>{category.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</h4>
              <p>{description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'dashboard': return renderExecutiveDashboard();
      case 'benchmarking': return renderIndustryBenchmarking();
      case 'risk': return renderRiskAssessment();
      case 'recommendations': return renderStrategicRecommendations();
      case 'investor': return renderInvestorReadiness();
      default: return renderExecutiveDashboard();
    }
  };

  return (
    <div className="professional-brsr-container">
      <div className="report-header">
        <h1>Professional SEBI BRSR Report</h1>
        <div className="header-actions">
          <button className="export-btn" onClick={exportToPDF}>
            📄 Export Professional PDF
          </button>
        </div>
      </div>

      <div className="report-layout">
        <nav className="report-navigation">
          {navigationItems.map(item => (
            <button
              key={item.id}
              className={`nav-item ${activeSection === item.id ? 'active' : ''}`}
              onClick={() => setActiveSection(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </button>
          ))}
        </nav>

        <main className="report-content" ref={reportRef}>
          {renderActiveSection()}
        </main>
      </div>
    </div>
  );
};

export default ProfessionalBRSRReport;