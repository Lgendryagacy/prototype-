import React, { useState } from 'react';
import { X } from 'lucide-react';

interface SurveyPopupModalProps {
  userName: string;
  onComplete: (hearAboutUs: string, primaryGoal: string) => void;
}

const SurveyPopupModal: React.FC<SurveyPopupModalProps> = ({
  userName,
  onComplete
}) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [hearAboutUs, setHearAboutUs] = useState('');
  const [primaryGoal, setPrimaryGoal] = useState('');
  const [errors, setErrors] = useState<{ hearAboutUs?: string; primaryGoal?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleStep1Continue = () => {
    if (!hearAboutUs.trim()) {
      setErrors({ hearAboutUs: 'Please tell us how you heard about FOGSLY' });
      return;
    }
    setErrors({});
    setStep(2);
  };

  const handleStep2Continue = async () => {
    if (!primaryGoal.trim()) {
      setErrors({ primaryGoal: 'Please tell us your primary goal' });
      return;
    }
    setErrors({});
    setIsSubmitting(true);
    try {
      await onComplete(hearAboutUs, primaryGoal);
    } catch (error) {
      console.error('Error submitting survey:', error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] overflow-hidden">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[--color-primary] to-[--color-secondary] p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Welcome to FOGSLY! 🎉</h2>
              <p className="text-white/90 mt-1">Hi {userName}, we'd love to know more about you</p>
            </div>
            {step === 2 && (
              <button
                onClick={() => setStep(1)}
                className="text-white/80 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="px-6 pt-4">
          <div className="flex items-center gap-2">
            <div className={`flex-1 h-2 rounded-full ${step >= 1 ? 'bg-[--color-primary]' : 'bg-gray-200 dark:bg-gray-700'}`} />
            <div className={`flex-1 h-2 rounded-full ${step >= 2 ? 'bg-[--color-primary]' : 'bg-gray-200 dark:bg-gray-700'}`} />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 text-center">
            Step {step} of 2
          </p>
        </div>

        {/* Step 1: How did you hear about us? */}
        {step === 1 && (
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              How did you hear about FOGSLY? <span className="text-red-500">*</span>
            </h3>
            
            <div className="space-y-2">
              <input
                type="text"
                value={hearAboutUs}
                onChange={(e) => {
                  setHearAboutUs(e.target.value);
                  setErrors({});
                }}
                placeholder="e.g., Google Search, Social Media, Friend Referral, YouTube, etc."
                className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-[--color-primary] bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                style={{ borderColor: errors.hearAboutUs ? '#ef4444' : 'var(--color-border)' }}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Please share where you discovered FOGSLY
              </p>
            </div>

            {errors.hearAboutUs && (
              <p className="text-red-500 text-sm mt-2">{errors.hearAboutUs}</p>
            )}

            <button
              onClick={handleStep1Continue}
              className="w-full mt-6 py-3 rounded-lg font-semibold text-white transition-all hover:scale-[1.02]"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              Continue
            </button>
          </div>
        )}

        {/* Step 2: Primary Goal */}
        {step === 2 && (
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              What's your primary goal on FOGSLY? <span className="text-red-500">*</span>
            </h3>
            
            <div className="space-y-2">
              <input
                type="text"
                value={primaryGoal}
                onChange={(e) => {
                  setPrimaryGoal(e.target.value);
                  setErrors({});
                }}
                placeholder="e.g., Find Freelance Work, Hire Freelancers, Get Tasks Done, etc."
                className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-[--color-primary] bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                style={{ borderColor: errors.primaryGoal ? '#ef4444' : 'var(--color-border)' }}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Tell us what you're looking to achieve
              </p>
            </div>

            {errors.primaryGoal && (
              <p className="text-red-500 text-sm mt-2">{errors.primaryGoal}</p>
            )}

            <button
              onClick={handleStep2Continue}
              disabled={isSubmitting}
              className="w-full mt-6 py-3 rounded-lg font-semibold text-white transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Submitting...</span>
                </>
              ) : (
                'Complete'
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SurveyPopupModal;
