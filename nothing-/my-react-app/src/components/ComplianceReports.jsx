import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { getThemeClasses } from '../utils/themeUtils';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const ComplianceReports = ({ onClose }) => {
  const { isDark } = useTheme();
  const theme = getThemeClasses(isDark);
  const [reports, setReports] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [selectedType, setSelectedType] = useState('SOX');

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      const response = await axios.get(`${API_URL}/audit/compliance/reports`);
      setReports(response.data.data || []);
    } catch (error) {
      console.error('Error loading reports:', error);
    }
  };

  const generateReport = async (type) => {
    setGenerating(true);
    try {
      const periodStart = new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0];
      const periodEnd = new Date().toISOString().split('T')[0];
      const generatedBy = localStorage.getItem('currentUser') || 'admin';

      const endpoint = type === 'SOX' ? 'sox' : type === 'ISO' ? 'iso' : 'gdpr';
      await axios.post(`${API_URL}/audit/compliance/report/${endpoint}`, {
        periodStart,
        periodEnd,
        generatedBy
      });

      alert(`${type} report generated successfully!`);
      loadReports();
    } catch (error) {
      alert('Error generating report: ' + error.message);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`max-w-4xl w-full max-h-[90vh] overflow-hidden ${theme.bg.card} rounded-xl shadow-2xl`}>
        <div className="p-6 bg-white shadow-lg border-b-2 border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold flex items-center gap-3 text-gray-800">
                <span className="text-4xl">📊</span>
                Compliance Reports
              </h2>
              <p className="text-gray-600 mt-1">SOX, ISO 27001, GDPR compliance reporting</p>
            </div>
            <button onClick={onClose} className="text-3xl text-gray-600 hover:text-red-500 hover:rotate-90 transition-all duration-300 hover:bg-gray-100 w-10 h-10 rounded-full flex items-center justify-center">✕</button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-3 gap-4 mb-6">
            <button
              onClick={() => generateReport('SOX')}
              disabled={generating}
              className="p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <div className="text-2xl mb-2">📋</div>
              <div className="font-semibold">Generate SOX Report</div>
            </button>
            <button
              onClick={() => generateReport('ISO')}
              disabled={generating}
              className="p-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              <div className="text-2xl mb-2">🔒</div>
              <div className="font-semibold">Generate ISO 27001</div>
            </button>
            <button
              onClick={() => generateReport('GDPR')}
              disabled={generating}
              className="p-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              <div className="text-2xl mb-2">🛡️</div>
              <div className="font-semibold">Generate GDPR</div>
            </button>
          </div>

          <div className={`border-t ${theme.border.primary} pt-4`}>
            <h3 className={`font-semibold ${theme.text.primary} mb-3`}>Generated Reports</h3>
            {reports.length === 0 ? (
              <p className={`text-center py-8 ${theme.text.secondary}`}>No reports generated yet</p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {reports.map((report) => (
                  <div key={report.id} className={`p-3 rounded-lg border ${theme.border.primary} ${theme.bg.subtle}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`font-medium ${theme.text.primary}`}>{report.framework}</p>
                        <p className={`text-sm ${theme.text.secondary}`}>
                          {report.period_start} to {report.period_end}
                        </p>
                        <p className={`text-xs ${theme.text.muted}`}>
                          Generated: {new Date(report.generated_at).toLocaleString()}
                        </p>
                      </div>
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded text-sm">
                        {report.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className={`p-4 border-t ${theme.border.primary}`}>
          <button onClick={onClose} className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ComplianceReports;
