import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { getThemeClasses } from '../utils/themeUtils';
import { GRIReportGenerator } from '../utils/griReportGenerator';

const GRIReportViewer = ({ onClose }) => {
  const { isDark } = useTheme();
  const theme = getThemeClasses(isDark);
  const [esgData, setEsgData] = useState(null);
  const [htmlPreview, setHtmlPreview] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem('esg_last_submission') || '{}');
    if (Object.keys(data).length > 0) {
      setEsgData(data);
      const preview = GRIReportGenerator.generateHTMLPreview(data);
      setHtmlPreview(preview);
    }
    setLoading(false);
  }, []);

  const handleDownloadPDF = () => {
    if (!esgData) return;
    const doc = GRIReportGenerator.generateGRIReport(esgData);
    GRIReportGenerator.downloadPDF(doc, `GRI-Report-${esgData.companyInfo?.companyName || 'Company'}-${new Date().getFullYear()}.pdf`);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`max-w-5xl w-full max-h-[90vh] overflow-hidden ${theme.bg.card} rounded-xl shadow-2xl flex flex-col`}>
        <div className={`p-6 border-b ${theme.border.primary} flex items-center justify-between`}>
          <h2 className={`text-2xl font-bold ${theme.text.primary}`}>📄 GRI Sustainability Report</h2>
          <div className="flex gap-3">
            <button
              onClick={handleDownloadPDF}
              disabled={!esgData}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center gap-2"
            >
              📥 Download PDF
            </button>
            <button onClick={onClose} className="text-2xl hover:opacity-70">✕</button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className={theme.text.secondary}>Loading report...</p>
            </div>
          ) : !esgData ? (
            <div className="text-center py-12">
              <p className={`text-lg ${theme.text.secondary}`}>No ESG data available. Please submit data first.</p>
            </div>
          ) : (
            <div dangerouslySetInnerHTML={{ __html: htmlPreview }} />
          )}
        </div>
      </div>
    </div>
  );
};

export default GRIReportViewer;
