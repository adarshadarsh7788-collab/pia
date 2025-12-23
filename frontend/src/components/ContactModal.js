import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { getThemeClasses } from '../utils/themeUtils';

const ContactModal = ({ stakeholder, onClose, onSendEmail }) => {
  const { isDark } = useTheme();
  const theme = getThemeClasses(isDark);

  if (!stakeholder) return null;

  const handleSendEmail = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Sending email to:', stakeholder.email || 'contact@company.com');
    
    if (onSendEmail) {
      onSendEmail(stakeholder);
    } else {
      window.open(`mailto:${stakeholder.email || 'contact@company.com'}`);
    }
    
    onClose();
  };

  const handleClose = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className={`w-full max-w-md rounded-2xl shadow-2xl ${
        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      } border p-6`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-xl font-bold ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>📞 Contact {stakeholder.name}</h3>
          <button 
            onClick={handleClose}
            className={`p-2 rounded-lg ${
              isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
            } transition-colors hover:scale-110`}
          >
            ✕
          </button>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 border border-blue-200">
            <span className="text-2xl">📧</span>
            <div>
              <div className="font-medium text-blue-900">Email</div>
              <div className="text-sm text-blue-700">{stakeholder.email || 'contact@company.com'}</div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 rounded-lg bg-purple-50 border border-purple-200">
            <span className="text-2xl">📅</span>
            <div>
              <div className="font-medium text-purple-900">Next Action</div>
              <div className="text-sm text-purple-700">{stakeholder.nextAction}</div>
            </div>
          </div>

          {stakeholder.phone && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 border border-green-200">
              <span className="text-2xl">📱</span>
              <div>
                <div className="font-medium text-green-900">Phone</div>
                <div className="text-sm text-green-700">{stakeholder.phone}</div>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex gap-2 mt-6">
          <button 
            type="button"
            onClick={handleSendEmail}
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer transform hover:scale-105 active:scale-95"
          >
            📧 Send Email
          </button>
          <button 
            type="button"
            onClick={handleClose}
            className={`flex-1 py-2 px-4 rounded-lg transition-colors cursor-pointer transform hover:scale-105 active:scale-95 ${
              isDark ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
            }`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContactModal;