import React, { useState, useEffect } from 'react';
import { Gift, X, CheckCircle, Sparkles } from 'lucide-react';

interface ReferralInputModalProps {
  onSubmit: (referralCode: string) => void;
  onSkip: () => void;
  isValidating?: boolean;
  error?: string;
  initialCode?: string; // Pre-filled referral code
}

const ReferralInputModal: React.FC<ReferralInputModalProps> = ({
  onSubmit,
  onSkip,
  isValidating = false,
  error,
  initialCode = ''
}) => {
  const [referralCode, setReferralCode] = useState(initialCode);
  const hasInitialCode = initialCode && initialCode.trim().length > 0;

  // Update referral code when initialCode changes
  useEffect(() => {
    if (initialCode) {
      setReferralCode(initialCode);
    }
  }, [initialCode]);

  const handleSubmit = () => {
    if (referralCode.trim()) {
      onSubmit(referralCode.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] overflow-hidden">
      <div className="rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden" style={{ backgroundColor: 'var(--color-card)' }}>
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-[--color-primary] to-[--color-secondary] p-6 text-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              {hasInitialCode ? <Sparkles className="w-6 h-6 animate-pulse" /> : <Gift className="w-6 h-6" />}
            </div>
            <div>
              <h2 className="text-2xl font-bold">
                {hasInitialCode ? '🎉 You\'ve Been Invited!' : 'Got a Referral Code?'}
              </h2>
              <p className="text-white/90 text-sm mt-1">
                {hasInitialCode ? 'Your friend shared FOGSLY with you!' : 'Unlock exclusive benefits!'}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-6">
            {hasInitialCode ? (
              <>
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  By using this referral code, you'll get access to special perks and help your friend earn rewards too! 🎁
                </p>
              </>
            ) : (
              <>
                <p className="mb-4" style={{ color: 'var(--color-text-secondary)' }}>
                  If someone invited you to FOGSLY, enter their referral code below to get started with special perks!
                </p>
                
                <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 rounded-r-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-300">
                    💡 <strong>Pro tip:</strong> Using a referral code helps us grow and gives you access to exclusive features!
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
              Referral Code {hasInitialCode && <span className="text-green-600 dark:text-green-400 text-xs">(Auto-filled)</span>}
            </label>
            <div className="relative">
              <input
                type="text"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value.toLowerCase())}
                placeholder="e.g., john_1234"
                className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-[--color-primary] transition-all placeholder:text-[--color-text-secondary]/50"
                style={{ 
                  borderColor: error ? '#ef4444' : hasInitialCode ? '#10b981' : 'var(--color-border)',
                  backgroundColor: hasInitialCode ? 'rgba(16, 185, 129, 0.1)' : 'var(--color-bg-secondary)',
                  color: 'var(--color-text-primary)'
                }}
                disabled={isValidating}
                onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
              />
              {hasInitialCode && !error && (
                <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-600 dark:text-green-400" />
              )}
            </div>
            {error && (
              <p className="text-red-500 text-sm mt-2">{error}</p>
            )}
            {hasInitialCode && !error && (
              <p className="text-green-600 dark:text-green-400 text-xs mt-2">
                ✨ Code verified from invitation link
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleSubmit}
              disabled={!referralCode.trim() || isValidating}
              className="flex-1 py-3 rounded-lg font-semibold text-white transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              {isValidating ? 'Validating...' : 'Continue'}
            </button>
            
            <button
              onClick={onSkip}
              disabled={isValidating}
              className="flex-1 py-3 rounded-lg font-semibold border-2 transition-all hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ 
                borderColor: 'var(--color-border)',
                color: 'var(--color-text)'
              }}
            >
              Skip
            </button>
          </div>

          <p className="text-xs text-center mt-4" style={{ color: 'var(--color-text-secondary)' }}>
            Don't have a referral code? No worries, you can skip this step!
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReferralInputModal;
