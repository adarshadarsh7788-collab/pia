import React, { useState, useRef, useEffect } from 'react';

const TwoFactorAuth = ({ onVerify, onCancel, email }) => {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef([]);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    
    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);
    setError('');

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6).split('');
    const newCode = [...code];
    pastedData.forEach((char, i) => {
      if (/^\d$/.test(char) && i < 6) newCode[i] = char;
    });
    setCode(newCode);
  };

  const handleVerify = async () => {
    const fullCode = code.join('');
    if (fullCode.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    setLoading(true);
    try {
      // Simulate API call - replace with actual backend call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo: accept 123456 or any 6 digits
      if (fullCode === '123456' || fullCode.length === 6) {
        onVerify(fullCode);
      } else {
        setError('Invalid verification code');
      }
    } catch (err) {
      setError('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = () => {
    setCode(['', '', '', '', '', '']);
    setError('');
    alert('Verification code sent to ' + email);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <div className="text-5xl mb-4">🔐</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Two-Factor Authentication</h2>
          <p className="text-gray-600 text-sm">
            Enter the 6-digit code sent to<br />
            <span className="font-semibold">{email}</span>
          </p>
        </div>

        <div className="flex gap-2 justify-center mb-6" onPaste={handlePaste}>
          {code.map((digit, index) => (
            <input
              key={index}
              ref={el => inputRefs.current[index] = el}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
              autoFocus={index === 0}
            />
          ))}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm text-center">
            {error}
          </div>
        )}

        <button
          onClick={handleVerify}
          disabled={loading || code.join('').length !== 6}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors mb-3"
        >
          {loading ? 'Verifying...' : 'Verify'}
        </button>

        <div className="flex justify-between items-center text-sm">
          <button onClick={handleResend} className="text-blue-600 hover:underline">
            Resend Code
          </button>
          <button onClick={onCancel} className="text-gray-600 hover:underline">
            Cancel
          </button>
        </div>

        <div className="mt-6 pt-4 border-t text-center text-xs text-gray-500">
          Code expires in 5 minutes
        </div>
      </div>
    </div>
  );
};

export default TwoFactorAuth;
