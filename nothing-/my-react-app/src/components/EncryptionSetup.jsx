import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { getThemeClasses } from '../utils/themeUtils';
import SecureStorage from '../utils/secureStorage';

const EncryptionSetup = ({ onComplete, onCancel }) => {
  const { isDark } = useTheme();
  const theme = getThemeClasses(isDark);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleEnable = async () => {
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const migratedCount = await SecureStorage.migrateToEncrypted(password);
      alert(`Encryption enabled! ${migratedCount} items encrypted.`);
      onComplete();
    } catch (err) {
      setError('Failed to enable encryption: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`max-w-md w-full ${theme.bg.card} rounded-xl shadow-2xl p-8`}>
        <div className="text-center mb-6">
          <div className="text-5xl mb-4">🔐</div>
          <h2 className={`text-2xl font-bold ${theme.text.primary} mb-2`}>
            Enable Client-Side Encryption
          </h2>
          <p className={`text-sm ${theme.text.secondary}`}>
            Protect your ESG data with AES-256 encryption
          </p>
        </div>

        <div className={`mb-6 p-4 rounded-lg ${isDark ? 'bg-blue-900/20' : 'bg-blue-50'} border border-blue-500`}>
          <h3 className={`font-semibold ${theme.text.primary} mb-2`}>What gets encrypted:</h3>
          <ul className={`text-sm ${theme.text.secondary} space-y-1`}>
            <li>• ESG data entries</li>
            <li>• User credentials</li>
            <li>• Audit logs</li>
            <li>• Evidence files metadata</li>
            <li>• All sensitive information</li>
          </ul>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <label className={`block text-sm font-medium ${theme.text.secondary} mb-2`}>
              Encryption Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${theme.bg.input} ${theme.border.input} ${theme.text.primary}`}
              placeholder="Enter strong password (min 8 chars)"
            />
          </div>

          <div>
            <label className={`block text-sm font-medium ${theme.text.secondary} mb-2`}>
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setError('');
              }}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${theme.bg.input} ${theme.border.input} ${theme.text.primary}`}
              placeholder="Confirm password"
            />
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        <div className={`mb-6 p-3 rounded-lg ${isDark ? 'bg-yellow-900/20' : 'bg-yellow-50'} border border-yellow-500`}>
          <p className={`text-xs ${theme.text.secondary}`}>
            ⚠️ <strong>Important:</strong> Remember this password! It cannot be recovered. 
            Without it, your encrypted data will be inaccessible.
          </p>
        </div>

        <button
          onClick={handleEnable}
          disabled={loading || !password || !confirmPassword}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed mb-3"
        >
          {loading ? 'Encrypting Data...' : 'Enable Encryption'}
        </button>

        <button
          onClick={onCancel}
          className="w-full py-2 text-gray-600 hover:text-gray-800"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default EncryptionSetup;
