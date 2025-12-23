import React, { useState } from 'react';

const TwoFactorSetup = ({ onComplete, onCancel, userEmail }) => {
  const [step, setStep] = useState(1);
  const [method, setMethod] = useState('email');
  const [qrCode] = useState('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==');
  const [verificationCode, setVerificationCode] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showPhoneInput, setShowPhoneInput] = useState(false);

  const handleMethodSelect = (selectedMethod) => {
    setMethod(selectedMethod);
    if (selectedMethod === 'sms') {
      setShowPhoneInput(true);
      setStep(1); // Stay on step 1 to show phone input
    } else {
      setShowPhoneInput(false);
      setStep(2); // Go directly to verification for email and app
    }
  };

  const handlePhoneSubmit = () => {
    if (phoneNumber.length >= 10) {
      setShowPhoneInput(false);
      setStep(2);
    } else {
      alert('Please enter a valid phone number');
    }
  };

  const handleVerify = () => {
    if (verificationCode.length === 6) {
      localStorage.setItem('2fa_enabled', 'true');
      localStorage.setItem('2fa_method', method);
      onComplete();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-lg w-full">
        {step === 1 && !showPhoneInput && (
          <>
            <div className="text-center mb-6">
              <div className="text-5xl mb-4">🔒</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Enable Two-Factor Authentication</h2>
              <p className="text-gray-600 text-sm">Choose your preferred authentication method</p>
            </div>

            <div className="space-y-3 mb-6">
              <button
                onClick={() => handleMethodSelect('email')}
                className="w-full p-4 border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="text-3xl">📧</div>
                  <div>
                    <div className="font-semibold text-gray-800">Email Authentication</div>
                    <div className="text-sm text-gray-600">Receive codes via email</div>
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleMethodSelect('sms')}
                className="w-full p-4 border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="text-3xl">📱</div>
                  <div>
                    <div className="font-semibold text-gray-800">SMS Authentication</div>
                    <div className="text-sm text-gray-600">Receive codes via text message</div>
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleMethodSelect('app')}
                className="w-full p-4 border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="text-3xl">🔐</div>
                  <div>
                    <div className="font-semibold text-gray-800">Authenticator App</div>
                    <div className="text-sm text-gray-600">Use Google Authenticator or similar</div>
                  </div>
                </div>
              </button>
            </div>

            <button onClick={onCancel} className="w-full py-2 text-gray-600 hover:text-gray-800">
              Cancel
            </button>
          </>
        )}

        {showPhoneInput && (
          <>
            <div className="text-center mb-6">
              <div className="text-5xl mb-4">📱</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Enter Your Phone Number</h2>
              <p className="text-gray-600 text-sm">We'll send a verification code to this number</p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter your phone number"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg"
                maxLength={15}
              />
              <p className="text-xs text-gray-500 mt-1">Format: 1234567890 (numbers only)</p>
            </div>

            <button
              onClick={handlePhoneSubmit}
              disabled={phoneNumber.length < 10}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed mb-3"
            >
              Continue
            </button>

            <button onClick={() => {
              setShowPhoneInput(false);
              setPhoneNumber('');
            }} className="w-full py-2 text-gray-600 hover:text-gray-800">
              Back
            </button>
          </>
        )}

        {step === 2 && method === 'app' && (
          <>
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Scan QR Code</h2>
              <p className="text-gray-600 text-sm">Use your authenticator app to scan this code</p>
            </div>

            <div className="bg-gray-100 p-6 rounded-lg mb-6 text-center">
              <div className="bg-white p-4 inline-block rounded-lg mb-4">
                <div className="w-48 h-48 bg-gray-200 flex items-center justify-center text-gray-500">
                  QR Code Here
                </div>
              </div>
              <div className="text-sm text-gray-600 mb-2">Or enter this code manually:</div>
              <div className="font-mono bg-white px-4 py-2 rounded border text-sm">
                JBSWY3DPEHPK3PXP
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter verification code from app
              </label>
              <input
                type="text"
                maxLength={6}
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-2xl tracking-widest"
                placeholder="000000"
              />
            </div>

            <button
              onClick={handleVerify}
              disabled={verificationCode.length !== 6}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed mb-3"
            >
              Enable 2FA
            </button>

            <button onClick={() => setStep(1)} className="w-full py-2 text-gray-600 hover:text-gray-800">
              Back
            </button>
          </>
        )}

        {step === 2 && (method === 'email' || method === 'sms') && (
          <>
            <div className="text-center mb-6">
              <div className="text-4xl mb-4">{method === 'email' ? '📧' : '📱'}</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Verify Your {method === 'email' ? 'Email' : 'Phone'}</h2>
              <p className="text-gray-600 text-sm mb-2">
                We've sent a 6-digit verification code to:
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <p className="font-semibold text-blue-800">
                  {method === 'email' ? userEmail : phoneNumber}
                </p>
              </div>
              <p className="text-gray-500 text-xs">
                Please check your {method === 'email' ? 'email inbox' : 'text messages'} and enter the code below
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter 6-digit verification code
              </label>
              <input
                type="text"
                maxLength={6}
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-2xl tracking-widest"
                placeholder="000000"
              />
            </div>

            <button
              onClick={handleVerify}
              disabled={verificationCode.length !== 6}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed mb-3"
            >
              Enable 2FA
            </button>

            <div className="flex justify-between text-sm mb-3">
              <button 
                onClick={() => alert(`Verification code resent to ${method === 'email' ? userEmail : phoneNumber}`)}
                className="text-blue-600 hover:underline"
              >
                Resend Code
              </button>
              <button onClick={() => setStep(1)} className="text-gray-600 hover:underline">Back</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TwoFactorSetup;
