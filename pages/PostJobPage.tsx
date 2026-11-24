import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, AlertCircle, CheckCircle, X, Plus, ChevronDown, ArrowLeft } from 'lucide-react';
import { type Route } from '../types';
import { categories } from '../constants';
import { auth } from '../firebase/config';
import { getUserProfile } from '../firebase/services/userService';
import { createJobRequest, getUserPendingJobRequestsCount } from '../firebase/services/jobRequestService';
import { getFogCoinSettings } from '../firebase/services/fogCoinSettingsService';
import { getUserEarnings, deductJobPayment, transferPlatformTax } from '../firebase/services/earningsService';
import { UserProfile } from '../firebase/types/user';
import { toast, ToastContainer } from 'react-toastify';

interface PostJobPageProps {
  navigate: (route: Route, context?: any) => void;
  isLoggedIn?: boolean;
}

const PostJobPage = ({ navigate, isLoggedIn = false }: PostJobPageProps) => {
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [pendingJobsCount, setPendingJobsCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // Platform tax constant
  const PLATFORM_TAX_RATE = 0.025; // 2.5%

  // FOG Coin conversion
  const [fogToPkrRate, setFogToPkrRate] = useState<number>(28); // Default rate (1 FOG = 28 PKR)
  const [calculatedFogCoins, setCalculatedFogCoins] = useState<number>(0);
  const [platformTaxAmount, setPlatformTaxAmount] = useState<number>(0);
  const [totalAmountRequired, setTotalAmountRequired] = useState<number>(0);
  const [userAvailableBalance, setUserAvailableBalance] = useState<number>(0);
  const [hasInsufficientBalance, setHasInsufficientBalance] = useState<boolean>(false);

  // Profile completion
  const [profileComplete, setProfileComplete] = useState(false);
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [missingFields, setMissingFields] = useState<string[]>([]);

  // Form state
  const [formData, setFormData] = useState({
    jobTitle: '',
    jobDescription: '',
    categories: [] as string[],
    skills: [] as string[],
    budgetType: 'fixed' as 'hourly' | 'fixed' | 'quote',
    budgetAmount: '',
    budgetCurrency: 'PKR'
  });

  const [skillInput, setSkillInput] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch FOG Coin rates and auto-refresh every 30 seconds
  useEffect(() => {
    const fetchFogCoinRate = async () => {
      try {
        const settings = await getFogCoinSettings();
        setFogToPkrRate(settings.fogToPkrRate);
        console.log('📊 FOG Coin Rate Updated:', settings.fogToPkrRate, 'PKR per FOG');
      } catch (error) {
        console.error('Error fetching FOG coin rate:', error);
        // Keep default rate if fetch fails
      }
    };

    // Fetch immediately
    fetchFogCoinRate();

    // Set up auto-refresh every 30 seconds
    const intervalId = setInterval(fetchFogCoinRate, 30000);

    // Cleanup interval on unmount
    return () => clearInterval(intervalId);
  }, []);

  // Check authentication and load profile
  useEffect(() => {
    const checkAuthAndProfile = async () => {
      if (!isLoggedIn || !auth.currentUser) {
        toast.error('Please login to post a job');
        navigate('auth');
        return;
      }

      try {
        setLoading(true);

        // Fetch user profile
        const profile = await getUserProfile(auth.currentUser.uid);
        setUserProfile(profile);

        // Fetch user's available balance
        const earnings = await getUserEarnings(auth.currentUser.uid);
        if (earnings) {
          setUserAvailableBalance(earnings.availableBalance);
        }

        // Check profile completion
        const missing: string[] = [];
        if (!profile?.name) missing.push('Name');
        if (!profile?.city) missing.push('City');
        if (!profile?.country) missing.push('Country');
        if (!profile?.phone) missing.push('Phone Number');

        setMissingFields(missing);
        setProfileComplete(missing.length === 0);

        // Calculate completion percentage
        const totalFields = 4;
        const completedFields = totalFields - missing.length;
        setProfileCompletion((completedFields / totalFields) * 100);

        // Check pending jobs count
        if (missing.length === 0) {
          const pendingCount = await getUserPendingJobRequestsCount(auth.currentUser.uid);
          setPendingJobsCount(pendingCount);
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndProfile();
  }, [isLoggedIn, navigate]);

  useEffect(() => {
    try {
      const draftStr = window.localStorage.getItem('fogsly_ai_draft_data');
      if (draftStr) {
        const parsed = JSON.parse(draftStr);
        setFormData(prev => ({ ...prev, ...parsed }));
        window.localStorage.removeItem('fogsly_ai_draft_data');
        toast.info('Loaded AI Draft! Please review your job details.', { autoClose: 3000 });
      }
    } catch (err) {
      console.error('Failed to parse AI draft from localStorage', err);
    }
  }, []);

  // Calculate FOG coins and platform tax when budget amount or rate changes
  useEffect(() => {
    if (formData.budgetType !== 'quote' && formData.budgetAmount && fogToPkrRate > 0) {
      const budgetInPkr = parseFloat(formData.budgetAmount);
      if (!isNaN(budgetInPkr) && budgetInPkr > 0) {
        const fogCoins = budgetInPkr / fogToPkrRate;
        const taxAmount = fogCoins * PLATFORM_TAX_RATE;
        const totalRequired = fogCoins + taxAmount;

        setCalculatedFogCoins(fogCoins);
        setPlatformTaxAmount(taxAmount);
        setTotalAmountRequired(totalRequired);

        // Check if user has sufficient balance (budget + tax)
        setHasInsufficientBalance(totalRequired > userAvailableBalance);
      } else {
        setCalculatedFogCoins(0);
        setPlatformTaxAmount(0);
        setTotalAmountRequired(0);
        setHasInsufficientBalance(false);
      }
    } else {
      setCalculatedFogCoins(0);
      setPlatformTaxAmount(0);
      setTotalAmountRequired(0);
      setHasInsufficientBalance(false);
    }
  }, [formData.budgetAmount, formData.budgetType, fogToPkrRate, userAvailableBalance]);

  // Add skill
  const handleAddSkill = () => {
    if (!skillInput.trim()) return;

    if (formData.skills.length >= 10) {
      toast.error('Maximum 10 skills allowed');
      return;
    }

    if (formData.skills.includes(skillInput.trim())) {
      toast.error('Skill already added');
      return;
    }

    setFormData(prev => ({
      ...prev,
      skills: [...prev.skills, skillInput.trim()]
    }));
    setSkillInput('');
  };

  // Remove skill
  const handleRemoveSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  };

  // Add category
  const handleAddCategory = (category: string) => {
    if (formData.categories.length >= 3) {
      toast.error('Maximum 3 categories allowed');
      return;
    }

    if (formData.categories.includes(category)) {
      return;
    }

    setFormData(prev => ({
      ...prev,
      categories: [...prev.categories, category]
    }));
  };

  // Remove category
  const handleRemoveCategory = (category: string) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.filter(c => c !== category)
    }));
  };

  // Add custom category
  const handleAddCustomCategory = () => {
    if (!customCategory.trim()) return;

    if (formData.categories.length >= 3) {
      toast.error('Maximum 3 categories allowed');
      return;
    }

    if (formData.categories.includes(customCategory.trim())) {
      toast.error('Category already added');
      return;
    }

    setFormData(prev => ({
      ...prev,
      categories: [...prev.categories, customCategory.trim()]
    }));
    setCustomCategory('');
    setShowCustomCategory(false);
  };

  // Validate form
  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.jobTitle.trim()) {
        newErrors.jobTitle = 'Job title is required';
      }
      if (!formData.jobDescription.trim()) {
        newErrors.jobDescription = 'Job description is required';
      }
    } else if (step === 2) {
      if (formData.categories.length === 0) {
        newErrors.categories = 'At least one category is required';
      }
      if (formData.skills.length === 0) {
        newErrors.skills = 'At least one skill is required';
      }
    } else if (step === 3) {
      if (formData.budgetType !== 'quote' && !formData.budgetAmount.trim()) {
        newErrors.budgetAmount = 'Budget amount is required';
      }
      if (formData.budgetType !== 'quote' && formData.budgetAmount && parseFloat(formData.budgetAmount) <= 0) {
        newErrors.budgetAmount = 'Budget amount must be greater than 0';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    } else {
      toast.error('Please fix all errors before continuing');
    }
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStep(3)) {
      toast.error('Please fill all required fields');
      return;
    }

    if (!userProfile || !auth.currentUser) {
      toast.error('User not authenticated')
      return;
    }

    // Check for insufficient balance
    if (hasInsufficientBalance && formData.budgetType !== 'quote') {
      const shortfall = totalAmountRequired - userAvailableBalance;
      toast.error(
        `Insufficient balance! You need ${totalAmountRequired.toFixed(2)} FOG (${calculatedFogCoins.toFixed(2)} budget + ${platformTaxAmount.toFixed(2)} platform fee). You're short by ${shortfall.toFixed(2)} FOG.`,
        { autoClose: 6000 }
      );
      return;
    }

    setIsSubmitting(true);

    try {
      // Create job request first
      const result = await createJobRequest({
        userId: auth.currentUser.uid,
        jobTitle: formData.jobTitle,
        jobDescription: formData.jobDescription,
        categories: formData.categories,
        skills: formData.skills,
        budgetType: formData.budgetType,
        budgetAmount: formData.budgetType === 'quote' ? undefined : parseFloat(formData.budgetAmount),
        budgetCurrency: formData.budgetCurrency,
        budgetInFogCoins: formData.budgetType === 'quote' ? undefined : calculatedFogCoins,
        userName: userProfile.name || userProfile.displayName || 'Unknown',
        userEmail: userProfile.email || '',
        userPhone: userProfile.phone || '',
        userCity: userProfile.city || '',
        userCountry: userProfile.country || ''
      });

      if (result.success && result.jobRequestId) {
        // Deduct payment if not a quote request
        if (formData.budgetType !== 'quote' && calculatedFogCoins > 0) {
          // Deduct job budget
          const paymentResult = await deductJobPayment(
            auth.currentUser.uid,
            calculatedFogCoins,
            result.jobRequestId,
            formData.jobTitle
          );

          if (!paymentResult.success) {
            toast.error(paymentResult.error || 'Payment failed. Please try again.');
            return;
          }

          // Transfer platform tax to admin
          if (platformTaxAmount > 0) {
            const taxResult = await transferPlatformTax(
              platformTaxAmount,
              result.jobRequestId,
              formData.jobTitle,
              'client',
              auth.currentUser.uid
            );

            if (!taxResult.success) {
              console.error('Platform tax transfer failed:', taxResult.error);
              toast.error('Job posted but platform fee processing failed. Contact support.');
            }
          }
        }

        toast.success(
          `Job posted successfully! ${calculatedFogCoins.toFixed(2)} FOG budget charged + ${platformTaxAmount.toFixed(2)} FOG platform fee. Awaiting admin approval.`,
          { autoClose: 5000 }
        );
        navigate('job-requests-status');
      } else {
        toast.error(result.error || 'Failed to submit job request');
      }
    } catch (error) {
      console.error('Error submitting job:', error);
      toast.error('Failed to submit job request');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
        <div className="text-center">
          <motion.div
            className="w-16 h-16 border-4 border-t-transparent rounded-full mx-auto mb-4"
            style={{ borderColor: 'var(--color-primary)' }}
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
          <p className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            Loading...
          </p>
        </div>
      </div>
    );
  }

  // Profile incomplete state
  if (!profileComplete) {
    return (
      <div className="min-h-screen py-16 px-4" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
        <div className="max-w-2xl mx-auto">
          <motion.button
            onClick={() => navigate('find-work')}
            className="mb-8 inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all"
            style={{
              border: '2px solid var(--color-border)',
              color: 'var(--color-primary)',
              backgroundColor: 'transparent'
            }}
            whileHover={{
              scale: 1.02,
              backgroundColor: 'var(--color-card)'
            }}
            whileTap={{ scale: 0.98 }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </motion.button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white/[0.85] dark:bg-white/[0.05] backdrop-blur-[20px] border border-blue-500/[0.15] dark:border-white/[0.1] rounded-[24px] p-10"
          >
            <div className="flex items-center gap-3 mb-6">
              <AlertCircle className="w-8 h-8 text-orange-500" />
              <h2 className="text-3xl font-black text-gray-900 dark:text-white">Complete Your Profile First</h2>
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
              Please complete your profile before posting a job. This information is required to process your job request.
            </p>

            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  Profile Completion
                </span>
                <span className="text-sm font-bold" style={{ color: 'var(--color-primary)' }}>
                  {Math.round(profileCompletion)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div
                  className="h-3 rounded-full transition-all duration-500"
                  style={{
                    width: `${profileCompletion}%`,
                    background: `linear-gradient(to right, var(--color-primary), var(--color-accent))`
                  }}
                ></div>
              </div>
            </div>

            {/* Missing Fields */}
            <div className="mb-8">
              <h3 className="text-sm font-semibold mb-3 text-gray-900 dark:text-white">
                Missing Information:
              </h3>
              <div className="space-y-2">
                {missingFields.map(field => (
                  <div key={field} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <X className="w-4 h-4 text-red-500" />
                    <span>{field}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Complete Profile Button */}
            <button
              onClick={() => navigate('profile')}
              className="w-full px-9 py-5 rounded-2xl font-bold text-base transition-all duration-300 relative overflow-hidden group"
              style={{
                background: `linear-gradient(135deg, var(--color-primary), var(--color-accent))`,
                color: 'white',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
              }}
            >
              <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  background: `linear-gradient(135deg, var(--color-accent), var(--color-primary))`
                }}
              />
              <span className="relative z-10 flex items-center justify-center gap-2">
                <User className="w-4 h-4" />
                Complete Profile Now
              </span>
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  // Max pending jobs reached
  if (pendingJobsCount >= 2) {
    return (
      <div className="min-h-screen py-16 px-4" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
        <div className="max-w-2xl mx-auto">
          <motion.button
            onClick={() => navigate('find-work')}
            className="mb-8 inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all"
            style={{
              border: '2px solid var(--color-border)',
              color: 'var(--color-primary)',
              backgroundColor: 'transparent'
            }}
            whileHover={{
              scale: 1.02,
              backgroundColor: 'var(--color-card)'
            }}
            whileTap={{ scale: 0.98 }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </motion.button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white/[0.85] dark:bg-white/[0.05] backdrop-blur-[20px] border border-blue-500/[0.15] dark:border-white/[0.1] rounded-[24px] p-10"
          >
            <div className="flex items-center gap-3 mb-6">
              <AlertCircle className="w-8 h-8 text-orange-500" />
              <h2 className="text-3xl font-black text-gray-900 dark:text-white">Maximum Pending Jobs Reached</h2>
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
              You have {pendingJobsCount} pending job requests. Please wait for admin approval before posting new jobs.
            </p>

            <button
              onClick={() => navigate('job-requests-status')}
              className="w-full px-9 py-5 rounded-2xl font-bold text-base transition-all duration-300 relative overflow-hidden group"
              style={{
                background: `linear-gradient(135deg, var(--color-primary), var(--color-accent))`,
                color: 'white',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
              }}
            >
              <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  background: `linear-gradient(135deg, var(--color-accent), var(--color-primary))`
                }}
              />
              <span className="relative z-10">Check Request Status</span>
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  // Main form
  return (
    <>
      <ToastContainer />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="py-16 px-4"
        style={{ backgroundColor: 'var(--color-bg-primary)' }}
      >
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <motion.button
            onClick={() => navigate('find-work')}
            className="mb-8 inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all"
            style={{
              border: '2px solid var(--color-border)',
              color: 'var(--color-primary)',
              backgroundColor: 'transparent'
            }}
            whileHover={{
              scale: 1.02,
              backgroundColor: 'var(--color-card)'
            }}
            whileTap={{ scale: 0.98 }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Find Work
          </motion.button>

          {/* Header */}
          <div className="mb-12">
            <h1 className="text-5xl font-black text-gray-900 dark:text-white mb-4" style={{ letterSpacing: '-0.02em' }}>
              Post a New Job
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Fill out the details below to find the perfect talent for your project
            </p>
          </div>

          {/* Step Progress */}
          <div className="mb-14 relative">
            <div className="absolute top-6 left-0 right-0 h-0.5 rounded-full" style={{ backgroundColor: 'var(--color-border)' }} />
            <motion.div
              className="absolute top-6 left-0 h-0.5 rounded-full"
              style={{
                width: `${((currentStep - 1) / 2) * 100}%`,
                background: `linear-gradient(to right, var(--color-primary), var(--color-accent))`,
                boxShadow: '0 0 20px rgba(0, 0, 0, 0.1)'
              }}
              initial={{ width: 0 }}
              animate={{ width: `${((currentStep - 1) / 2) * 100}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />

            <div className="relative flex justify-between">
              {[1, 2, 3].map(step => (
                <div key={step} className="flex flex-col items-center gap-3">
                  <motion.div
                    className="w-12 h-12 rounded-full flex items-center justify-center font-black text-lg transition-all duration-400"
                    style={{
                      background: step < currentStep
                        ? '#10b981' // green for completed
                        : step === currentStep
                          ? `linear-gradient(to right, var(--color-primary), var(--color-accent))`
                          : 'var(--color-card)',
                      color: step <= currentStep ? 'white' : 'var(--color-text-secondary)',
                      border: step > currentStep ? `3px solid var(--color-border)` : '0',
                      boxShadow: step === currentStep ? '0 0 20px rgba(0, 0, 0, 0.15)' : 'none'
                    }}
                    animate={{ scale: step === currentStep ? 1.1 : 1 }}
                  >
                    {step < currentStep ? '✓' : step}
                  </motion.div>
                  <span
                    className="text-xs font-bold uppercase tracking-wider"
                    style={{
                      color: step === currentStep ? 'var(--color-primary)' : 'var(--color-text-secondary)'
                    }}
                  >
                    {step === 1 ? 'Job Details' : step === 2 ? 'Categories & Skills' : 'Budget'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-8">
            <AnimatePresence mode="wait">
              {/* Step 1: Job Details */}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white/[0.85] dark:bg-white/[0.05] backdrop-blur-[20px] border border-blue-500/[0.15] dark:border-white/[0.1] rounded-[24px] p-10"
                >
                  <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-8">Job Details</h2>

                  {/* User Balance Display */}
                  <div className="mb-8 p-4 rounded-2xl border border-blue-500/[0.15] dark:border-white/[0.1]" style={{
                    background: `linear-gradient(135deg, color-mix(in srgb, var(--color-primary) 10%, transparent), color-mix(in srgb, var(--color-accent) 10%, transparent))`
                  }}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Your Available Balance</p>
                        <p className="text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>
                          {userAvailableBalance.toFixed(2)} FOG Coins
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => navigate('fog-coins')}
                        className="px-6 py-3 rounded-2xl font-bold text-sm transition-all duration-300 relative overflow-hidden group"
                        style={{
                          background: `linear-gradient(135deg, var(--color-primary), var(--color-accent))`,
                          color: 'white'
                        }}
                      >
                        <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                          style={{
                            background: `linear-gradient(135deg, var(--color-accent), var(--color-primary))`
                          }}
                        />
                        <span className="relative z-10 flex items-center gap-2">
                          <Plus className="w-4 h-4" />
                          Add FOG Coins
                        </span>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {/* Job Title */}
                    <div>
                      <label className="block text-sm font-bold text-gray-900 dark:text-white mb-3">
                        Job Title *
                      </label>
                      <input
                        type="text"
                        className={`w-full px-6 py-4 rounded-2xl border ${errors.jobTitle ? 'border-red-500' : 'border-blue-500/[0.15] dark:border-white/[0.1]'} bg-white/[0.85] dark:bg-white/[0.05] text-gray-900 dark:text-white text-base font-medium focus:outline-none focus:border-blue-500 dark:focus:border-cyan-400 transition-all`}
                        placeholder="e.g., Senior UX Designer"
                        value={formData.jobTitle}
                        onChange={(e) => setFormData(prev => ({ ...prev, jobTitle: e.target.value }))}
                      />
                      {errors.jobTitle && (
                        <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" /> {errors.jobTitle}
                        </p>
                      )}
                    </div>

                    {/* Job Description */}
                    <div>
                      <label className="block text-sm font-bold text-gray-900 dark:text-white mb-3">
                        Job Description *
                      </label>
                      <textarea
                        className={`w-full px-6 py-4 rounded-2xl border ${errors.jobDescription ? 'border-red-500' : 'border-blue-500/[0.15] dark:border-white/[0.1]'} bg-white/[0.85] dark:bg-white/[0.05] text-gray-900 dark:text-white text-base font-medium focus:outline-none focus:border-blue-500 dark:focus:border-cyan-400 transition-all resize-none`}
                        rows={6}
                        placeholder="Describe the project, responsibilities, and qualifications..."
                        value={formData.jobDescription}
                        onChange={(e) => setFormData(prev => ({ ...prev, jobDescription: e.target.value }))}
                      />
                      {errors.jobDescription && (
                        <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" /> {errors.jobDescription}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-4 justify-between mt-8">
                    <button
                      type="button"
                      onClick={() => navigate('find-work')}
                      className="px-9 py-5 rounded-2xl font-bold text-base backdrop-blur-[20px] hover:-translate-y-0.5 transition-all duration-300"
                      style={{
                        backgroundColor: 'var(--color-card)',
                        color: 'var(--color-text-primary)',
                        border: '1px solid var(--color-border)'
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="px-9 py-5 rounded-2xl font-bold text-base transition-all duration-300 relative overflow-hidden group"
                      style={{
                        background: `linear-gradient(135deg, var(--color-primary), var(--color-accent))`,
                        color: 'white',
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
                      }}
                    >
                      <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        style={{
                          background: `linear-gradient(135deg, var(--color-accent), var(--color-primary))`
                        }}
                      />
                      <span className="relative z-10 group-hover:-translate-y-1 inline-block transition-transform duration-300">Next Step →</span>
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Categories & Skills */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white/[0.85] dark:bg-white/[0.05] backdrop-blur-[20px] border border-blue-500/[0.15] dark:border-white/[0.1] rounded-[24px] p-10"
                >
                  <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-8">Categories & Skills</h2>

                  <div className="space-y-6">
                    {/* Categories */}
                    <div>
                      <label className="block text-sm font-bold text-gray-900 dark:text-white mb-3">
                        Select Categories (Max 3) *
                      </label>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                          className={`w-full px-6 py-4 rounded-2xl border ${errors.categories ? 'border-red-500' : 'border-blue-500/[0.15] dark:border-white/[0.1]'} bg-white/[0.85] dark:bg-white/[0.05] text-gray-900 dark:text-white text-base font-medium focus:outline-none focus:border-blue-500 dark:focus:border-cyan-400 transition-all flex items-center justify-between`}
                        >
                          <span className={formData.categories.length > 0 ? '' : 'text-gray-400'}>
                            {formData.categories.length > 0 ? `${formData.categories.length} selected` : 'Select a category'}
                          </span>
                          <ChevronDown className={`w-5 h-5 transition-transform ${showCategoryDropdown ? 'rotate-180' : ''}`} />
                        </button>

                        {showCategoryDropdown && (
                          <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 border border-blue-500/[0.15] dark:border-white/[0.1] rounded-2xl shadow-xl max-h-64 overflow-y-auto">
                            {categories.map((cat) => (
                              <button
                                key={cat.name}
                                type="button"
                                onClick={() => {
                                  handleAddCategory(cat.name);
                                  setShowCategoryDropdown(false);
                                }}
                                className="w-full px-6 py-3 text-left hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors"
                              >
                                <span className="text-sm font-medium text-gray-900 dark:text-white">{cat.name}</span>
                              </button>
                            ))}
                            <button
                              type="button"
                              onClick={() => {
                                setShowCustomCategory(true);
                                setShowCategoryDropdown(false);
                              }}
                              className="w-full px-6 py-3 text-left hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors border-t border-gray-200 dark:border-gray-700"
                            >
                              <span className="text-sm font-medium text-blue-600 dark:text-blue-400">+ Add Custom Category</span>
                            </button>
                          </div>
                        )}
                      </div>
                      {errors.categories && (
                        <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" /> {errors.categories}
                        </p>
                      )}

                      {/* Custom Category Input */}
                      {showCustomCategory && (
                        <div className="flex gap-2 mt-4">
                          <input
                            type="text"
                            className="flex-1 px-6 py-4 rounded-2xl border border-blue-500/[0.15] dark:border-white/[0.1] bg-white/[0.85] dark:bg-white/[0.05] text-gray-900 dark:text-white text-base font-medium focus:outline-none focus:border-blue-500 dark:focus:border-cyan-400 transition-all"
                            placeholder="Enter custom category"
                            value={customCategory}
                            onChange={(e) => setCustomCategory(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCustomCategory())}
                          />
                          <button
                            type="button"
                            onClick={handleAddCustomCategory}
                            className="px-6 py-4 rounded-2xl font-bold text-white flex items-center gap-2 hover:-translate-y-0.5 transition-all relative overflow-hidden group"
                            style={{
                              background: `linear-gradient(135deg, var(--color-primary), var(--color-accent))`
                            }}
                          >
                            <span className="relative z-10">Add</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowCustomCategory(false)}
                            className="px-6 py-4 rounded-2xl font-bold backdrop-blur-[20px] hover:-translate-y-0.5 transition-all duration-300"
                            style={{
                              backgroundColor: 'var(--color-card)',
                              color: 'var(--color-text-primary)',
                              border: '1px solid var(--color-border)'
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      )}

                      {/* Selected Categories */}
                      {formData.categories.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-4">
                          {formData.categories.map(category => (
                            <span
                              key={category}
                              className="px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2"
                              style={{
                                background: `linear-gradient(to right, color-mix(in srgb, var(--color-primary) 20%, transparent), color-mix(in srgb, var(--color-accent) 20%, transparent))`,
                                border: `1px solid var(--color-primary)`,
                                color: 'var(--color-primary)'
                              }}
                            >
                              {category}
                              <button
                                type="button"
                                onClick={() => handleRemoveCategory(category)}
                                className="hover:text-red-500 transition-colors"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Skills */}
                    <div>
                      <label className="block text-sm font-bold text-gray-900 dark:text-white mb-3">
                        Add Skills (1-10 required) *
                      </label>
                      <div className="flex gap-3 mb-4">
                        <input
                          type="text"
                          className={`flex-1 px-6 py-4 rounded-2xl border ${errors.skills ? 'border-red-500' : 'border-blue-500/[0.15] dark:border-white/[0.1]'} bg-white/[0.85] dark:bg-white/[0.05] text-gray-900 dark:text-white text-base font-medium focus:outline-none focus:border-blue-500 dark:focus:border-cyan-400 transition-all`}
                          placeholder="e.g., Figma, React, Prototyping"
                          value={skillInput}
                          onChange={(e) => setSkillInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                        />
                        <button
                          type="button"
                          onClick={handleAddSkill}
                          className="px-6 py-4 rounded-2xl font-bold text-white flex items-center gap-2 hover:-translate-y-0.5 transition-all relative overflow-hidden group"
                          style={{
                            background: `linear-gradient(135deg, var(--color-primary), var(--color-accent))`
                          }}
                        >
                          <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                            style={{
                              background: `linear-gradient(135deg, var(--color-accent), var(--color-primary))`
                            }}
                          />
                          <Plus className="w-5 h-5 relative z-10" />
                          <span className="relative z-10">Add</span>
                        </button>
                      </div>
                      {errors.skills && (
                        <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" /> {errors.skills}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                        Press Enter or click Add to add a skill ({formData.skills.length}/10)
                      </p>

                      {/* Selected Skills */}
                      <div className="flex flex-wrap gap-2">
                        {formData.skills.map((skill) => (
                          <span
                            key={skill}
                            className="px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2"
                            style={{
                              background: `linear-gradient(to right, color-mix(in srgb, var(--color-primary) 20%, transparent), color-mix(in srgb, var(--color-accent) 20%, transparent))`,
                              border: `1px solid var(--color-primary)`,
                              color: 'var(--color-primary)'
                            }}
                          >
                            {skill}
                            <button
                              type="button"
                              onClick={() => handleRemoveSkill(skill)}
                              className="hover:text-red-500 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 justify-between mt-8">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="px-9 py-5 rounded-2xl font-bold text-base backdrop-blur-[20px] hover:-translate-y-0.5 transition-all duration-300"
                      style={{
                        backgroundColor: 'var(--color-card)',
                        color: 'var(--color-text-primary)',
                        border: '1px solid var(--color-border)'
                      }}
                    >
                      ← Previous
                    </button>
                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="px-9 py-5 rounded-2xl font-bold text-base transition-all duration-300 relative overflow-hidden group"
                      style={{
                        background: `linear-gradient(135deg, var(--color-primary), var(--color-accent))`,
                        color: 'white',
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
                      }}
                    >
                      <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        style={{
                          background: `linear-gradient(135deg, var(--color-accent), var(--color-primary))`
                        }}
                      />
                      <span className="relative z-10 group-hover:-translate-y-1 inline-block transition-transform duration-300">Next Step →</span>
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Budget */}
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white/[0.85] dark:bg-white/[0.05] backdrop-blur-[20px] border border-blue-500/[0.15] dark:border-white/[0.1] rounded-[24px] p-10"
                >
                  <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-8">Budget</h2>

                  <div className="space-y-6">
                    {/* Insufficient Balance Warning */}
                    {hasInsufficientBalance && calculatedFogCoins > 0 && (
                      <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <h4 className="font-semibold text-red-600 mb-1">Insufficient Balance</h4>
                            <p className="text-sm text-red-500 mb-2">
                              You need <strong>{totalAmountRequired.toFixed(2)} FOG</strong> to post this job,
                              but you only have <strong>{userAvailableBalance.toFixed(2)} FOG</strong>.
                            </p>
                            <p className="text-sm text-red-500 mb-3">
                              Please add <strong>{(totalAmountRequired - userAvailableBalance).toFixed(2)} FOG</strong> more to proceed.
                            </p>
                            <button
                              type="button"
                              onClick={() => navigate('fog-coins')}
                              className="px-4 py-2 rounded-xl font-bold text-sm bg-red-600 text-white hover:bg-red-700 transition-colors"
                            >
                              <Plus className="w-4 h-4 mr-2 inline" />
                              Deposit FOG Coins
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Payment Ready Info */}
                    {formData.budgetType !== 'quote' && !hasInsufficientBalance && calculatedFogCoins > 0 && (
                      <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-2xl">
                        <div className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <div>
                            <h4 className="font-semibold text-green-600 mb-1">Payment Ready</h4>
                            <p className="text-sm text-green-600">
                              <strong>{calculatedFogCoins.toFixed(2)} FOG Coins</strong> will be deducted from your balance when you submit this job.
                              The amount will be refunded if the admin rejects your job request.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-6">
                      {/* Budget Type */}
                      <div>
                        <label className="block text-sm font-bold text-gray-900 dark:text-white mb-3">
                          Budget Type *
                        </label>
                        <select
                          className="w-full px-6 py-4 rounded-2xl border border-blue-500/[0.15] dark:border-white/[0.1] bg-white/[0.85] dark:bg-white/[0.05] text-gray-900 dark:text-gray-200 text-base font-medium focus:outline-none focus:border-blue-500 dark:focus:border-cyan-400 transition-all dark:[color-scheme:dark]"
                          value={formData.budgetType}
                          onChange={(e) => setFormData(prev => ({ ...prev, budgetType: e.target.value as any }))}
                        >
                          <option className="!bg-gray-900 !text-gray-200" value="fixed">Fixed Price</option>
                          <option className="!bg-gray-900 !text-gray-200" value="hourly">Hourly Rate</option>
                        </select>
                      </div>

                      {/* Budget Amount */}
                      {formData.budgetType !== 'quote' && (
                        <div>
                          <label className="block text-sm font-bold text-gray-900 dark:text-white mb-3">
                            Budget Amount ({formData.budgetCurrency}) *
                          </label>
                          <input
                            type="number"
                            className={`w-full px-6 py-4 rounded-2xl border ${errors.budgetAmount ? 'border-red-500' : 'border-blue-500/[0.15] dark:border-white/[0.1]'} bg-white/[0.85] dark:bg-white/[0.05] text-gray-900 dark:text-white text-base font-medium focus:outline-none focus:border-blue-500 dark:focus:border-cyan-400 transition-all`}
                            placeholder="e.g., 5000"
                            value={formData.budgetAmount}
                            onChange={(e) => setFormData(prev => ({ ...prev, budgetAmount: e.target.value }))}
                          />
                          {errors.budgetAmount && (
                            <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                              <AlertCircle className="w-4 h-4" /> {errors.budgetAmount}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Platform Fee Notice */}
                    {formData.budgetType !== 'quote' && (
                      <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                        <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-blue-700 dark:text-blue-300">
                          <span className="font-semibold">Platform Fee:</span> A 2.5% service fee will be charged on your job budget to support platform operations and security.
                        </p>
                      </div>
                    )}

                    {/* FOG Coin Conversion Display */}
                    {calculatedFogCoins > 0 && (
                      <div className="p-4 rounded-2xl border border-blue-500/[0.15] dark:border-white/[0.1]" style={{
                        background: `linear-gradient(135deg, color-mix(in srgb, var(--color-primary) 10%, transparent), color-mix(in srgb, var(--color-accent) 10%, transparent))`
                      }}>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{
                              background: `linear-gradient(to bottom right, var(--color-primary), var(--color-accent))`
                            }}>
                              <span className="text-white font-bold text-xs">FC</span>
                            </div>
                            <div>
                              <p className="text-xs text-gray-600 dark:text-gray-400">Job Budget in FOG Coins</p>
                              <p className="text-lg font-bold" style={{ color: 'var(--color-primary)' }}>
                                {calculatedFogCoins.toFixed(2)} FOG
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-600 dark:text-gray-400">Conversion Rate</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              1 FOG = {fogToPkrRate.toFixed(2)} PKR
                            </p>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-blue-500/20 space-y-2">
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Platform Fee (2.5%)</span>
                            <span className="font-semibold text-orange-600 dark:text-orange-400">
                              +{platformTaxAmount.toFixed(2)} FOG
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-base font-bold pt-2 border-t border-blue-500/20">
                            <span className="text-gray-900 dark:text-white">Total Amount Required</span>
                            <span className="text-green-600 dark:text-green-400">
                              {totalAmountRequired.toFixed(2)} FOG
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-gray-600 dark:text-gray-400">Your Available Balance</span>
                            <span className={userAvailableBalance >= totalAmountRequired ? 'text-green-600' : 'text-red-600'}>
                              {userAvailableBalance.toFixed(2)} FOG
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-4 justify-between mt-8">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="px-9 py-5 rounded-2xl font-bold text-base backdrop-blur-[20px] hover:-translate-y-0.5 transition-all duration-300"
                      style={{
                        backgroundColor: 'var(--color-card)',
                        color: 'var(--color-text-primary)',
                        border: '1px solid var(--color-border)'
                      }}
                    >
                      ← Previous
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting || hasInsufficientBalance}
                      className="px-9 py-5 rounded-2xl font-bold text-base transition-all duration-300 relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                      style={{
                        background: `linear-gradient(135deg, var(--color-primary), var(--color-accent))`,
                        color: 'white',
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
                      }}
                    >
                      {isSubmitting ? (
                        <span className="flex items-center gap-2">
                          <span className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                          Submitting...
                        </span>
                      ) : hasInsufficientBalance ? (
                        'Insufficient Balance'
                      ) : (
                        <>
                          <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                            style={{
                              background: `linear-gradient(135deg, var(--color-accent), var(--color-primary))`
                            }}
                          />
                          <span className="relative z-10">✓ Post Job Request</span>
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </div>
      </motion.div>
    </>
  );
};

export default PostJobPage;
