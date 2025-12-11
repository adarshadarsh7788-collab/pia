import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { getThemeClasses } from '../utils/themeUtils';
import TwoFactorSetup from './TwoFactorSetup';
import EncryptionSetup from './EncryptionSetup';
import SecureStorage from '../utils/secureStorage';

const SecuritySettings = ({ onClose }) => {
  const { isDark } = useTheme();
  const theme = getThemeClasses(isDark);
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [is2FAEnabled, setIs2FAEnabled] = useState(localStorage.getItem('2fa_enabled') === 'true');
  const [twoFAMethod, setTwoFAMethod] = useState(localStorage.getItem('2fa_method') || 'none');
  const [showEncryptionSetup, setShowEncryptionSetup] = useState(false);
  const [isEncryptionEnabled, setIsEncryptionEnabled] = useState(SecureStorage.isEncryptionEnabled());

  const handle2FAToggle = () => {
    if (is2FAEnabled) {
      if (window.confirm('Are you sure you want to disable Two-Factor Authentication?')) {
        localStorage.removeItem('2fa_enabled');
        localStorage.removeItem('2fa_method');
        setIs2FAEnabled(false);
        setTwoFAMethod('none');
      }
    } else {
      setShow2FASetup(true);
    }
  };

  const handle2FAComplete = () => {
    setShow2FASetup(false);
    setIs2FAEnabled(true);
    setTwoFAMethod(localStorage.getItem('2fa_method'));
  };

  const handleEncryptionToggle = () => {
    if (isEncryptionEnabled) {
      if (window.confirm('Disabling encryption will decrypt all data. Continue?')) {
        localStorage.removeItem('encryption_enabled');
        setIsEncryptionEnabled(false);
        alert('Encryption disabled. Data is no longer encrypted.');
      }
    } else {
      setShowEncryptionSetup(true);
    }
  };

  const handleEncryptionComplete = () => {
    setShowEncryptionSetup(false);
    setIsEncryptionEnabled(true);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className={`max-w-2xl w-full max-h-[90vh] overflow-hidden ${theme.bg.card} rounded-xl shadow-2xl`}>
          <div className="p-6 bg-white shadow-lg border-b-2 border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold flex items-center gap-3 text-gray-800">
                  <span className="text-4xl">🔒</span>
                  Security Settings
                </h2>
                <p className="text-gray-600 mt-1">Manage your account security</p>
              </div>
              <button onClick={onClose} className="text-3xl text-gray-600 hover:text-red-500 hover:rotate-90 transition-all duration-300 hover:bg-gray-100 w-10 h-10 rounded-full flex items-center justify-center">✕</button>
            </div>
          </div>

          <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
            {/* Two-Factor Authentication */}
            <div className={`p-6 rounded-lg border ${theme.border.primary} ${theme.bg.subtle} mb-4`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3">
                  <div className="text-3xl">🔐</div>
                  <div>
                    <h3 className={`text-lg font-semibold ${theme.text.primary}`}>
                      Two-Factor Authentication
                    </h3>
                    <p className={`text-sm ${theme.text.secondary} mt-1`}>
                      Add an extra layer of security to your account
                    </p>
                  </div>
                </div>
                <button
                  onClick={handle2FAToggle}
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                    is2FAEnabled
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  {is2FAEnabled ? 'Disable' : 'Enable'}
                </button>
              </div>

              {is2FAEnabled && (
                <div className={`mt-4 p-4 rounded-lg ${isDark ? 'bg-green-900/20' : 'bg-green-50'} border border-green-500`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-green-600 text-xl">✓</span>
                    <span className={`font-semibold ${theme.text.primary}`}>2FA is Active</span>
                  </div>
                  <p className={`text-sm ${theme.text.secondary}`}>
                    Method: {twoFAMethod === 'email' ? '📧 Email' : twoFAMethod === 'sms' ? '📱 SMS' : '🔐 Authenticator App'}
                  </p>
                </div>
              )}
            </div>

            {/* Client-Side Encryption */}
            <div className={`p-6 rounded-lg border ${theme.border.primary} ${theme.bg.subtle} mb-4`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3">
                  <div className="text-3xl">🔐</div>
                  <div>
                    <h3 className={`text-lg font-semibold ${theme.text.primary}`}>
                      Client-Side Encryption
                    </h3>
                    <p className={`text-sm ${theme.text.secondary} mt-1`}>
                      AES-256 encryption for all sensitive data
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleEncryptionToggle}
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                    isEncryptionEnabled
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  {isEncryptionEnabled ? 'Disable' : 'Enable'}
                </button>
              </div>

              {isEncryptionEnabled && (
                <div className={`mt-4 p-4 rounded-lg ${isDark ? 'bg-green-900/20' : 'bg-green-50'} border border-green-500`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-green-600 text-xl">✓</span>
                    <span className={`font-semibold ${theme.text.primary}`}>Encryption Active</span>
                  </div>
                  <p className={`text-sm ${theme.text.secondary}`}>
                    All data is encrypted with AES-256 before storage
                  </p>
                </div>
              )}
            </div>

            {/* Password Settings */}
            <div className={`p-6 rounded-lg border ${theme.border.primary} ${theme.bg.subtle} mb-4`}>
              <div className="flex items-start gap-3 mb-4">
                <div className="text-3xl">🔑</div>
                <div>
                  <h3 className={`text-lg font-semibold ${theme.text.primary}`}>Password</h3>
                  <p className={`text-sm ${theme.text.secondary} mt-1`}>
                    Change your password regularly to keep your account secure
                  </p>
                </div>
              </div>
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold">
                Change Password
              </button>
            </div>

            {/* Session Management */}
            <div className={`p-6 rounded-lg border ${theme.border.primary} ${theme.bg.subtle} mb-4`}>
              <div className="flex items-start gap-3 mb-4">
                <div className="text-3xl">💻</div>
                <div>
                  <h3 className={`text-lg font-semibold ${theme.text.primary}`}>Active Sessions</h3>
                  <p className={`text-sm ${theme.text.secondary} mt-1`}>
                    Manage devices where you're currently logged in
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`font-medium ${theme.text.primary}`}>Current Device</p>
                      <p className={`text-xs ${theme.text.secondary}`}>Last active: Just now</p>
                    </div>
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Active</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Security Recommendations */}
            <div className={`p-6 rounded-lg border ${theme.border.primary} ${theme.bg.subtle}`}>
              <div className="flex items-start gap-3 mb-4">
                <div className="text-3xl">💡</div>
                <div>
                  <h3 className={`text-lg font-semibold ${theme.text.primary}`}>Security Tips</h3>
                </div>
              </div>
              <ul className={`space-y-2 text-sm ${theme.text.secondary}`}>
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>Use a strong, unique password for your account</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>Enable two-factor authentication for extra security</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>Never share your password with anyone</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>Log out from shared or public devices</span>
                </li>
              </ul>
            </div>
          </div>

          <div className={`p-4 border-t ${theme.border.primary}`}>
            <button onClick={onClose} className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded">
              Close
            </button>
          </div>
        </div>
      </div>

      {show2FASetup && (
        <TwoFactorSetup
          onComplete={handle2FAComplete}
          onCancel={() => setShow2FASetup(false)}
          userEmail={localStorage.getItem('currentUser')}
        />
      )}

      {showEncryptionSetup && (
        <EncryptionSetup
          onComplete={handleEncryptionComplete}
          onCancel={() => setShowEncryptionSetup(false)}
        />
      )}
    </>
  );
};

export default SecuritySettings;
