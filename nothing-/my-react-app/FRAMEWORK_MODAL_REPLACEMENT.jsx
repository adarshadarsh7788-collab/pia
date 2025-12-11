/* Framework Reports Modal - REPLACEMENT CODE */
/* Replace the entire Framework Reports Modal section in Reports.js with this */

{showFrameworkReports && (
  <Modal
    isOpen={showFrameworkReports}
    onClose={() => setShowFrameworkReports(false)}
    title="📄 Framework-Specific Reports"
    size="xl"
    isDark={isDark}
  >
    <div className="flex flex-col h-[80vh]">
      {data.length === 0 ? (
        <Alert 
          type="info"
          title="No Data Available"
          message="Add ESG data entries to generate framework-specific reports."
        />
      ) : (
        <>
          {/* Sticky Header - Filters */}
          <div className="sticky top-0 z-20 bg-white dark:bg-gray-800 pb-4 mb-4 border-b">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex gap-2">
                <select
                  value={frameworkFilter}
                  onChange={(e) => setFrameworkFilter(e.target.value)}
                  className={`flex-1 px-3 py-2 border rounded-lg text-sm ${theme.bg.input} ${theme.border.input}`}
                >
                  <option value="all">All Frameworks</option>
                  <option value="high">High Compliance (≥80%)</option>
                  <option value="medium">Medium (60-79%)</option>
                  <option value="low">Low (&lt;60%)</option>
                </select>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className={`flex-1 px-3 py-2 border rounded-lg text-sm ${theme.bg.input} ${theme.border.input}`}
                >
                  <option value="compliance">By Compliance</option>
                  <option value="name">By Name</option>
                </select>
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const all = ['GRI Standards', 'SASB Standards', 'TCFD', 'BRSR', 'EU Taxonomy', 'ISSB S1/S2'];
                    setSelectedFrameworks(selectedFrameworks.length === all.length ? [] : all);
                  }}
                >
                  {selectedFrameworks.length === 6 ? 'Deselect All' : 'Select All'}
                </Button>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => {
                    if (selectedFrameworks.length === 0) {
                      showToast('Select frameworks first', 'warning');
                      return;
                    }
                    selectedFrameworks.forEach(name => {
                      const normalizedData = normalizeData(data);
                      const options = { companyName: data[0]?.companyName || 'Company', reportPeriod: new Date().getFullYear() };
                      let pdf;
                      switch(name) {
                        case 'GRI Standards': pdf = generateGRIPDF(normalizedData, options); break;
                        case 'SASB Standards': pdf = generateSASBPDF(normalizedData, options); break;
                        case 'TCFD': pdf = generateTCFDPDF(normalizedData, options); break;
                        case 'BRSR': pdf = generateBRSRPDF(normalizedData, options); break;
                        case 'EU Taxonomy': pdf = generateEUTaxonomyPDF(normalizedData, options); break;
                      }
                      if (pdf) pdf.save(`${name.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`);
                    });
                    showToast(`Generating ${selectedFrameworks.length} reports...`, 'success');
                  }}
                  disabled={selectedFrameworks.length === 0}
                >
                  Generate ({selectedFrameworks.length})
                </Button>
              </div>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto pr-2">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {[
                { name: 'GRI Standards', desc: 'Global Reporting Initiative', icon: '🌍', compliance: complianceSummary.GRI?.score || 0 },
                { name: 'SASB Standards', desc: 'Sustainability Accounting Standards', icon: '📊', compliance: complianceSummary.SASB?.score || 0 },
                { name: 'TCFD', desc: 'Climate-related Disclosures', icon: '🌡️', compliance: complianceSummary.TCFD?.score || 0 },
                { name: 'BRSR', desc: 'Business Responsibility', icon: '🇮🇳', compliance: complianceSummary.BRSR?.score || 0 },
                { name: 'EU Taxonomy', desc: 'EU Sustainable Finance', icon: '🇪🇺', compliance: 0 },
                { name: 'ISSB S1/S2', desc: 'IFRS Sustainability', icon: '📈', compliance: 0 }
              ]
              .sort((a, b) => sortBy === 'compliance' ? b.compliance - a.compliance : a.name.localeCompare(b.name))
              .filter(f => {
                if (frameworkFilter === 'all') return true;
                if (frameworkFilter === 'high') return f.compliance >= 80;
                if (frameworkFilter === 'medium') return f.compliance >= 60 && f.compliance < 80;
                if (frameworkFilter === 'low') return f.compliance < 60;
                return true;
              })
              .map((framework, idx) => {
                const isSelected = selectedFrameworks.includes(framework.name);
                return (
                  <div 
                    key={idx} 
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      isSelected ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg' : 'border-gray-300 hover:shadow-md'
                    }`}
                    onClick={() => {
                      setSelectedFrameworks(isSelected 
                        ? selectedFrameworks.filter(f => f !== framework.name)
                        : [...selectedFrameworks, framework.name]
                      );
                    }}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="mt-1"
                      />
                      <span className="text-2xl">{framework.icon}</span>
                      <div className="flex-1 min-w-0">
                        <h4 className={`font-bold text-sm ${theme.text.primary} truncate`}>{framework.name}</h4>
                        <p className={`text-xs ${theme.text.secondary} line-clamp-1`}>{framework.desc}</p>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <div className="flex justify-between text-xs mb-1">
                        <span>Compliance</span>
                        <span className={`font-bold ${
                          framework.compliance >= 80 ? 'text-green-600' :
                          framework.compliance >= 60 ? 'text-yellow-600' : 'text-red-600'
                        }`}>{framework.compliance}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all ${
                            framework.compliance >= 80 ? 'bg-green-500' :
                            framework.compliance >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${framework.compliance}%` }}
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <Button 
                        size="sm" 
                        variant="primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          const normalizedData = normalizeData(data);
                          const options = { companyName: data[0]?.companyName || 'Company', reportPeriod: new Date().getFullYear() };
                          let pdf;
                          switch(framework.name) {
                            case 'GRI Standards': pdf = generateGRIPDF(normalizedData, options); break;
                            case 'SASB Standards': pdf = generateSASBPDF(normalizedData, options); break;
                            case 'TCFD': pdf = generateTCFDPDF(normalizedData, options); break;
                            case 'BRSR': pdf = generateBRSRPDF(normalizedData, options); break;
                            case 'EU Taxonomy': pdf = generateEUTaxonomyPDF(normalizedData, options); break;
                          }
                          if (pdf) {
                            pdf.save(`${framework.name.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`);
                            showToast(`${framework.name} generated`, 'success');
                          }
                        }}
                      >
                        PDF
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedReport(framework.name);
                          setShowFrameworkReports(false);
                        }}
                      >
                        View
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Summary Cards */}
            <div className={`p-4 rounded-lg ${theme.bg.subtle} mb-4`}>
              <h4 className={`font-semibold ${theme.text.primary} mb-3`}>📋 Data Coverage</h4>
              <div className="grid grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-green-600">{normalizeData(data).filter(d => d.category === 'environmental').length}</div>
                  <div className="text-xs text-gray-600">Environmental</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">{normalizeData(data).filter(d => d.category === 'social').length}</div>
                  <div className="text-xs text-gray-600">Social</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">{normalizeData(data).filter(d => d.category === 'governance').length}</div>
                  <div className="text-xs text-gray-600">Governance</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-800">{normalizeData(data).length}</div>
                  <div className="text-xs text-gray-600">Total</div>
                </div>
              </div>
            </div>
          </div>

          {/* Sticky Footer */}
          <div className="sticky bottom-0 bg-white dark:bg-gray-800 pt-4 border-t mt-4">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                {selectedFrameworks.length > 0 && `${selectedFrameworks.length} selected • `}
                Double-click for quick PDF
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowFrameworkReports(false)}>Close</Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  </Modal>
)}
