import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Check,
  User,
  Briefcase,
  DollarSign,
  Star,
  Award,
  Target,
  X,
  Upload,
  Image as ImageIcon,
  Plus,
  Loader,
  AlertCircle
} from 'lucide-react';
import { type Route } from '../types';
import { User as FirebaseUser } from '../firebase/types/user';
import { getUserProfile } from '../firebase/services/userService';
import { submitFreelanceRequest, getUserFreelanceRequest } from '../firebase/services/freelanceRequests';
import ImageCropper from '../components/ImageCropper';
import { toast, ToastContainer } from 'react-toastify';

interface BecomeFreelancerPageProps {
  navigate: (route: Route) => void;
  currentUser: FirebaseUser | null;
}

type Step = 1 | 2 | 3 | 4;

interface PortfolioItem {
  id: string;
  image: string; // URL or base64
  title: string;
  description: string;
  link: string;
}

interface FreelancerFormData {
  // Step 1: Personal Information
  fullName: string;
  title: string;
  bio: string;

  // Step 2: Skills & Expertise
  skills: string[];
  categories: string[];
  customCategory: string;
  experience: string;

  // Step 3: Portfolio & Work
  portfolioItems: PortfolioItem[];
  education: string;
  certifications: string[];

  // Step 4: Rates & Availability
  hourlyRate: number;
  currency: string;
  availability: string;
  languages: string[];
}

interface ValidationErrors {
  [key: string]: string;
}

const BecomeFreelancerPage: React.FC<BecomeFreelancerPageProps> = ({ navigate, currentUser }) => {
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [formData, setFormData] = useState<FreelancerFormData>({
    fullName: '',
    title: '',
    bio: '',
    skills: [],
    categories: [],
    customCategory: '',
    experience: 'beginner',
    portfolioItems: [],
    education: '',
    certifications: [],
    hourlyRate: 0,
    currency: 'PKR',
    availability: 'full-time',
    languages: ['English']
  });

  // Auto-fetch user profile data on mount
  useEffect(() => {
    if (currentUser) {
      fetchUserProfile();
      checkExistingRequest();
    }
  }, [currentUser]);

  useEffect(() => {
    try {
      const draftStr = window.localStorage.getItem('fogsly_ai_draft_data');
      if (draftStr) {
        const parsed = JSON.parse(draftStr);
        setFormData(prev => ({
          ...prev,
          title: parsed.title || prev.title,
          bio: parsed.description || prev.bio, // using description as bio
          skills: parsed.skills || prev.skills,
          hourlyRate: parsed.hourlyRate || prev.hourlyRate,
        }));
        if (parsed.category) {
           setFormData(prev => ({ ...prev, categories: [parsed.category] }));
        }
        window.localStorage.removeItem('fogsly_ai_draft_data');
        setTimeout(() => toast.info('Loaded AI Draft! Please review your gig details.', { autoClose: 3000 }), 500);
      }
    } catch (err) {
      console.error('Failed to parse AI draft from localStorage', err);
    }
  }, []);

  const checkExistingRequest = async () => {
    if (!currentUser?.uid) return;

    try {
      const existingRequest = await getUserFreelanceRequest(currentUser.uid);
      if (existingRequest) {
        // User already has a request
        if (existingRequest.requestStatus === 'approved') {
          toast.info('Your freelancer profile has already been approved!');
          navigate('find-work');
        } else if (existingRequest.requestStatus === 'pending') {
          toast.info('Your freelancer application is pending review.');
          navigate('find-work');
        }
      }
    } catch (error) {
      console.error('Error checking existing request:', error);
    }
  };

  const fetchUserProfile = async () => {
    if (!currentUser?.uid) return;

    setIsLoading(true);
    try {
      const userProfile = await getUserProfile(currentUser.uid);

      if (userProfile) {
        setFormData(prev => ({
          ...prev,
          fullName: userProfile.name || currentUser.displayName || '',
          skills: userProfile.skills || [],
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          fullName: currentUser.displayName || '',
        }));
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setFormData(prev => ({
        ...prev,
        fullName: currentUser.displayName || '',
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const steps = [
    { number: 1, title: 'Personal Info', icon: User },
    { number: 2, title: 'Skills & Expertise', icon: Star },
    { number: 3, title: 'Portfolio', icon: Briefcase },
    { number: 4, title: 'Rates', icon: DollarSign }
  ];

  const validateStep = (step: Step): boolean => {
    const newErrors: ValidationErrors = {};

    switch (step) {
      case 1:
        if (!formData.fullName.trim()) {
          newErrors.fullName = 'Full name is required';
        }
        if (!formData.title.trim()) {
          newErrors.title = 'Professional title is required';
        }
        if (!formData.bio.trim()) {
          newErrors.bio = 'Bio is required';
        } else if (formData.bio.length < 50) {
          newErrors.bio = 'Bio must be at least 50 characters';
        }
        break;

      case 2:
        if (formData.categories.length === 0) {
          newErrors.categories = 'Please select at least one category';
        }
        if (formData.skills.length < 3) {
          newErrors.skills = 'Please add at least 3 skills';
        }
        break;

      case 3:
        // Portfolio is optional, no validation needed
        break;

      case 4:
        if (!formData.hourlyRate || formData.hourlyRate <= 0) {
          newErrors.hourlyRate = 'Please enter a valid hourly rate';
        }
        if (formData.languages.length === 0) {
          newErrors.languages = 'Please select at least one language';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 4) {
        setCurrentStep((currentStep + 1) as Step);
        setErrors({});
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else {
      toast.error('Please fix all errors before continuing');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as Step);
      setErrors({});
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) {
      return;
    }

    if (!currentUser) {
      toast.error('You must be logged in to submit a freelancer request');
      navigate('auth');
      return;
    }

    setIsSubmitting(true);
    try {
      const requestData = {
        userId: currentUser.uid,
        userEmail: currentUser.email || '',
        userName: currentUser.displayName || formData.fullName,
        fullName: formData.fullName,
        title: formData.title,
        bio: formData.bio,
        skills: formData.skills,
        categories: formData.categories,
        experience: formData.experience,
        portfolioItems: formData.portfolioItems,
        education: formData.education,
        certifications: formData.certifications,
        hourlyRate: formData.hourlyRate,
        currency: formData.currency,
        availability: formData.availability,
        languages: formData.languages,
        requestStatus: 'pending' as const,

        // Initial stats (will be updated as freelancer works)
        totalReviews: 0,
        totalJobs: 0,
        totalEarnings: 0,
        averageRating: 0
      };

      const requestId = await submitFreelanceRequest(requestData);
      console.log('Freelancer request submitted successfully:', requestId);

      toast.success('Your freelancer application has been submitted! We will review it and get back to you soon.', { autoClose: 5000 });
      navigate('freelancer-request-status');
    } catch (error) {
      console.error('Error submitting freelancer request:', error);
      toast.error('Failed to submit freelancer request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkillAdd = (skill: string) => {
    if (formData.skills.length >= 10) {
      toast.error('Maximum 10 skills allowed');
      return;
    }
    if (skill && !formData.skills.includes(skill)) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skill]
      }));
      if (formData.skills.length + 1 >= 3) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.skills;
          return newErrors;
        });
      }
    }
  };

  const handleSkillRemove = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleCategoryAdd = (category: string) => {
    if (formData.categories.length >= 5) {
      toast.error('Maximum 5 categories allowed');
      return;
    }
    if (category && !formData.categories.includes(category)) {
      setFormData(prev => ({
        ...prev,
        categories: [...prev.categories, category]
      }));
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.categories;
        return newErrors;
      });
    }
  };

  const handleCategoryRemove = (categoryToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.filter(cat => cat !== categoryToRemove)
    }));
  };

  const handleAddPortfolioItem = () => {
    const newItem: PortfolioItem = {
      id: Date.now().toString(),
      image: '',
      title: '',
      description: '',
      link: ''
    };
    setFormData(prev => ({
      ...prev,
      portfolioItems: [...prev.portfolioItems, newItem]
    }));
  };

  const handleRemovePortfolioItem = (id: string) => {
    setFormData(prev => ({
      ...prev,
      portfolioItems: prev.portfolioItems.filter(item => item.id !== id)
    }));
  };

  const handlePortfolioItemChange = (id: string, field: keyof PortfolioItem, value: string) => {
    setFormData(prev => ({
      ...prev,
      portfolioItems: prev.portfolioItems.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    }));
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <Step1PersonalInfo formData={formData} setFormData={setFormData} errors={errors} />;
      case 2:
        return (
          <Step2SkillsExpertise
            formData={formData}
            setFormData={setFormData}
            onSkillAdd={handleSkillAdd}
            onSkillRemove={handleSkillRemove}
            onCategoryAdd={handleCategoryAdd}
            onCategoryRemove={handleCategoryRemove}
            errors={errors}
          />
        );
      case 3:
        return (
          <Step3Portfolio
            formData={formData}
            setFormData={setFormData}
            onAddItem={handleAddPortfolioItem}
            onRemoveItem={handleRemovePortfolioItem}
            onItemChange={handlePortfolioItemChange}
            errors={errors}
          />
        );
      case 4:
        return <Step4RatesAvailability formData={formData} setFormData={setFormData} errors={errors} />;
      default:
        return null;
    }
  };

  if (!currentUser) {
    return (
      <>
        <ToastContainer />
        <div className="min-h-screen py-16 px-4" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
          <div className="max-w-2xl mx-auto text-center py-20">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
              className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center"
              style={{
                background: `linear-gradient(135deg, var(--color-primary), var(--color-accent))`
              }}
            >
              <Award className="w-10 h-10 text-white" />
            </motion.div>
            <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-4">Join Fogsly as a Freelancer</h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
              Please log in to create your freelancer profile
            </p>
            <button
              onClick={() => navigate('auth')}
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
              <span className="relative z-10">Log In to Continue</span>
            </button>
          </div>
        </div>
      </>
    );
  }

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
              Become a Freelancer
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Complete your profile to start getting hired on Fogsly
            </p>
          </div>

          {/* Step Progress */}
          <div className="mb-14 relative">
            <div className="absolute top-6 left-0 right-0 h-0.5 rounded-full" style={{ backgroundColor: 'var(--color-border)' }} />
            <motion.div
              className="absolute top-6 left-0 h-0.5 rounded-full"
              style={{
                width: `${((currentStep - 1) / 3) * 100}%`,
                background: `linear-gradient(to right, var(--color-primary), var(--color-accent))`,
                boxShadow: '0 0 20px rgba(0, 0, 0, 0.1)'
              }}
              initial={{ width: 0 }}
              animate={{ width: `${((currentStep - 1) / 3) * 100}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />

            <div className="relative flex justify-between">
              {[1, 2, 3, 4].map(step => {
                const stepInfo = steps[step - 1];
                const Icon = stepInfo.icon;

                return (
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
                      {step < currentStep ? <Check className="w-6 h-6" /> : <Icon className="w-6 h-6" />}
                    </motion.div>
                    <span
                      className="text-xs font-bold uppercase tracking-wider"
                      style={{
                        color: step === currentStep ? 'var(--color-primary)' : 'var(--color-text-secondary)'
                      }}
                    >
                      {stepInfo.title}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              {renderStepContent()}
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex gap-4 justify-between mt-8">
            <button
              type="button"
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="px-9 py-5 rounded-2xl font-bold text-base backdrop-blur-[20px] hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              style={{
                backgroundColor: 'var(--color-card)',
                color: 'var(--color-text-primary)',
                border: '1px solid var(--color-border)'
              }}
            >
              ← Previous
            </button>

            {currentStep < 4 ? (
              <button
                type="button"
                onClick={handleNext}
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
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-9 py-5 rounded-2xl font-bold text-base transition-all duration-300 relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                style={{
                  background: `linear-gradient(135deg, var(--color-primary), var(--color-accent))`,
                  color: 'white',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
                }}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <Loader className="w-5 h-5 animate-spin" />
                    Submitting...
                  </span>
                ) : (
                  <>
                    <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{
                        background: `linear-gradient(135deg, var(--color-accent), var(--color-primary))`
                      }}
                    />
                    <span className="relative z-10 flex items-center gap-2">
                      <Check className="w-5 h-5" />
                      Complete Profile
                    </span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </>
  );
};

// Step 1: Personal Information
const Step1PersonalInfo: React.FC<{
  formData: FreelancerFormData;
  setFormData: React.Dispatch<React.SetStateAction<FreelancerFormData>>;
  errors: ValidationErrors;
}> = ({ formData, setFormData, errors }) => {
  return (
    <div className="bg-white/[0.85] dark:bg-white/[0.05] backdrop-blur-[20px] border border-blue-500/[0.15] dark:border-white/[0.1] rounded-[24px] p-10">
      <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-8">Personal Information</h2>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-bold text-gray-900 dark:text-white mb-3">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.fullName}
            onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
            className={`w-full px-6 py-4 rounded-2xl border ${
              errors.fullName ? 'border-red-500' : 'border-blue-500/[0.15] dark:border-white/[0.1]'
            } bg-white/[0.85] dark:bg-white/[0.05] text-gray-900 dark:text-white text-base font-medium focus:outline-none focus:border-blue-500 dark:focus:border-cyan-400 transition-all`}
            placeholder="Enter your full name"
          />
          {errors.fullName && (
            <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" /> {errors.fullName}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-900 dark:text-white mb-3">
            Professional Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            className={`w-full px-6 py-4 rounded-2xl border ${
              errors.title ? 'border-red-500' : 'border-blue-500/[0.15] dark:border-white/[0.1]'
            } bg-white/[0.85] dark:bg-white/[0.05] text-gray-900 dark:text-white text-base font-medium focus:outline-none focus:border-blue-500 dark:focus:border-cyan-400 transition-all`}
            placeholder="e.g., Full Stack Developer, Graphic Designer"
          />
          {errors.title && (
            <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" /> {errors.title}
            </p>
          )}
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            This will be displayed prominently on your profile
          </p>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-900 dark:text-white mb-3">
            Professional Bio <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.bio}
            onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
            rows={6}
            maxLength={1000}
            className={`w-full px-6 py-4 rounded-2xl border ${
              errors.bio ? 'border-red-500' : 'border-blue-500/[0.15] dark:border-white/[0.1]'
            } bg-white/[0.85] dark:bg-white/[0.05] text-gray-900 dark:text-white text-base font-medium focus:outline-none focus:border-blue-500 dark:focus:border-cyan-400 transition-all resize-none`}
            placeholder="Tell clients about your experience, expertise, and what makes you unique..."
          />
          {errors.bio && (
            <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" /> {errors.bio}
            </p>
          )}
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            {formData.bio.length}/1000 characters (minimum 50)
          </p>
        </div>
      </div>
    </div>
  );
};

// Step 2: Skills & Expertise
const Step2SkillsExpertise: React.FC<{
  formData: FreelancerFormData;
  setFormData: React.Dispatch<React.SetStateAction<FreelancerFormData>>;
  onSkillAdd: (skill: string) => void;
  onSkillRemove: (skill: string) => void;
  onCategoryAdd: (category: string) => void;
  onCategoryRemove: (category: string) => void;
  errors: ValidationErrors;
}> = ({ formData, setFormData, onSkillAdd, onSkillRemove, onCategoryAdd, onCategoryRemove, errors }) => {
  const [skillInput, setSkillInput] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const predefinedCategories = [
    'Web Development',
    'Mobile Development',
    'Design',
    'Writing',
    'Marketing',
    'Data Science',
    'Video & Animation',
    'Music & Audio',
    'Business',
    'Lifestyle'
  ];

  const handleAddSkill = () => {
    if (skillInput.trim()) {
      onSkillAdd(skillInput.trim());
      setSkillInput('');
    }
  };

  const handleAddCategory = () => {
    if (selectedCategory === 'custom') {
      if (formData.customCategory.trim()) {
        onCategoryAdd(formData.customCategory.trim());
        setFormData(prev => ({ ...prev, customCategory: '' }));
        setSelectedCategory('');
      }
    } else if (selectedCategory) {
      onCategoryAdd(selectedCategory);
      setSelectedCategory('');
    }
  };

  return (
    <div className="bg-white/[0.85] dark:bg-white/[0.05] backdrop-blur-[20px] border border-blue-500/[0.15] dark:border-white/[0.1] rounded-[24px] p-10">
      <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-8">Skills & Expertise</h2>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-bold text-gray-900 dark:text-white mb-3">
            Categories <span className="text-red-500">*</span> (Max 5)
          </label>
          <div className="flex gap-2 mb-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="flex-1 px-6 py-4 rounded-2xl border border-blue-500/[0.15] dark:border-white/[0.1] bg-white/[0.85] dark:bg-white/[0.05] text-gray-900 dark:text-gray-200 text-base font-medium focus:outline-none focus:border-blue-500 dark:focus:border-cyan-400 transition-all dark:[color-scheme:dark]"
              disabled={formData.categories.length >= 5}
            >
              <option value="" className="!bg-gray-900 !text-gray-200">Select a category...</option>
              {predefinedCategories.map(cat => (
                <option key={cat} value={cat} disabled={formData.categories.includes(cat)} className="!bg-gray-900 !text-gray-200">
                  {cat}
                </option>
              ))}
              <option value="custom" className="!bg-gray-900 !text-gray-200">+ Add Custom Category</option>
            </select>
            <button
              type="button"
              onClick={handleAddCategory}
              disabled={!selectedCategory || formData.categories.length >= 5}
              className="px-6 py-4 rounded-2xl font-bold text-white flex items-center gap-2 hover:-translate-y-0.5 transition-all relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              style={{
                background: `linear-gradient(135deg, var(--color-primary), var(--color-accent))`
              }}
            >
              <span className="relative z-10">Add</span>
            </button>
          </div>

          {selectedCategory === 'custom' && (
            <input
              type="text"
              value={formData.customCategory}
              onChange={(e) => setFormData(prev => ({ ...prev, customCategory: e.target.value }))}
              className="w-full px-6 py-4 rounded-2xl border border-blue-500/[0.15] dark:border-white/[0.1] bg-white/[0.85] dark:bg-white/[0.05] text-gray-900 dark:text-white text-base font-medium focus:outline-none focus:border-blue-500 dark:focus:border-cyan-400 transition-all mb-2"
              placeholder="Enter custom category name"
            />
          )}

          <div className="flex flex-wrap gap-2">
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
                  onClick={() => onCategoryRemove(category)}
                  className="hover:text-red-500 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </span>
            ))}
          </div>
          {errors.categories && (
            <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" /> {errors.categories}
            </p>
          )}
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            {formData.categories.length}/5 categories selected
          </p>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-900 dark:text-white mb-3">
            Skills <span className="text-red-500">*</span> (Min 3, Max 10)
          </label>
          <div className="flex gap-3 mb-4">
            <input
              type="text"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
              className="flex-1 px-6 py-4 rounded-2xl border border-blue-500/[0.15] dark:border-white/[0.1] bg-white/[0.85] dark:bg-white/[0.05] text-gray-900 dark:text-white text-base font-medium focus:outline-none focus:border-blue-500 dark:focus:border-cyan-400 transition-all"
              placeholder="Add a skill (e.g., React, Photoshop, SEO)"
              disabled={formData.skills.length >= 10}
            />
            <button
              type="button"
              onClick={handleAddSkill}
              disabled={formData.skills.length >= 10}
              className="px-6 py-4 rounded-2xl font-bold text-white flex items-center gap-2 hover:-translate-y-0.5 transition-all relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
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
          <div className="flex flex-wrap gap-2">
            {formData.skills.map(skill => (
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
                  onClick={() => onSkillRemove(skill)}
                  className="hover:text-red-500 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </span>
            ))}
          </div>
          {errors.skills && (
            <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" /> {errors.skills}
            </p>
          )}
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            {formData.skills.length}/10 skills (minimum 3 required)
          </p>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-900 dark:text-white mb-3">
            Experience Level <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.experience}
            onChange={(e) => setFormData(prev => ({ ...prev, experience: e.target.value }))}
            className="w-full px-6 py-4 rounded-2xl border border-blue-500/[0.15] dark:border-white/[0.1] bg-white/[0.85] dark:bg-white/[0.05] text-gray-900 dark:text-gray-200 text-base font-medium focus:outline-none focus:border-blue-500 dark:focus:border-cyan-400 transition-all dark:[color-scheme:dark]"
          >
            <option value="beginner" className="!bg-gray-900 !text-gray-200">Beginner (0-2 years)</option>
            <option value="intermediate" className="!bg-gray-900 !text-gray-200">Intermediate (2-5 years)</option>
            <option value="expert" className="!bg-gray-900 !text-gray-200">Expert (5+ years)</option>
          </select>
        </div>
      </div>
    </div>
  );
};

// Step 3: Portfolio & Work
const Step3Portfolio: React.FC<{
  formData: FreelancerFormData;
  setFormData: React.Dispatch<React.SetStateAction<FreelancerFormData>>;
  onAddItem: () => void;
  onRemoveItem: (id: string) => void;
  onItemChange: (id: string, field: keyof PortfolioItem, value: string) => void;
  errors: ValidationErrors;
}> = ({ formData, setFormData, onAddItem, onRemoveItem, onItemChange, errors }) => {
  const [tempImageSrc, setTempImageSrc] = useState<string>('');
  const [cropItemId, setCropItemId] = useState<string>('');
  const [showCropper, setShowCropper] = useState(false);

  const handleImageSelect = (id: string, file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setTempImageSrc(reader.result as string);
      setCropItemId(id);
      setShowCropper(true);
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = (croppedImage: string) => {
    onItemChange(cropItemId, 'image', croppedImage);
    setShowCropper(false);
    setTempImageSrc('');
    setCropItemId('');
  };

  const handleCropCancel = () => {
    setShowCropper(false);
    setTempImageSrc('');
    setCropItemId('');
  };

  return (
    <>
      {showCropper && (
        <ImageCropper
          imageSrc={tempImageSrc}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
          aspectRatio={16 / 9}
        />
      )}

      <div className="bg-white/[0.85] dark:bg-white/[0.05] backdrop-blur-[20px] border border-blue-500/[0.15] dark:border-white/[0.1] rounded-[24px] p-10">
        <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2">Portfolio & Education</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-8">
          Showcase your best work (Optional) - Images will be displayed in 16:9 aspect ratio cards
        </p>

        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-bold text-gray-900 dark:text-white">
                Portfolio Items
              </label>
              {formData.portfolioItems.length > 0 && (
                <button
                  type="button"
                  onClick={onAddItem}
                  className="px-4 py-2 rounded-xl font-medium text-sm transition-all hover:-translate-y-0.5"
                  style={{
                    background: `linear-gradient(135deg, var(--color-primary), var(--color-accent))`,
                    color: 'white'
                  }}
                >
                  <Plus className="w-4 h-4 mr-2 inline" />
                  Add Item
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {formData.portfolioItems.length === 0 ? (
                <div className="col-span-full text-center py-16 border-2 border-dashed rounded-2xl" style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-secondary)' }}>
                  <div className="max-w-sm mx-auto">
                    <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
                      style={{
                        background: `linear-gradient(135deg, color-mix(in srgb, var(--color-primary) 10%, transparent), color-mix(in srgb, var(--color-accent) 10%, transparent))`
                      }}
                    >
                      <ImageIcon className="w-10 h-10" style={{ color: 'var(--color-primary)' }} />
                    </div>
                    <h4 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">No Portfolio Items Yet</h4>
                    <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm">
                      Add your best work to showcase your skills and attract clients. Each item includes an image, title, description, and optional link.
                    </p>
                    <button
                      type="button"
                      onClick={onAddItem}
                      className="px-6 py-3 rounded-2xl font-bold text-base transition-all duration-300 relative overflow-hidden group inline-flex items-center gap-2"
                      style={{
                        background: `linear-gradient(135deg, var(--color-primary), var(--color-accent))`,
                        color: 'white'
                      }}
                    >
                      <Plus className="w-4 h-4" />
                      Add Your First Portfolio Item
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {formData.portfolioItems.map((item) => (
                    <div key={item.id} className="border-2 rounded-2xl overflow-hidden hover:border-blue-500/50 dark:hover:border-cyan-400/50 transition-all" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-card)' }}>
                      {/* Portfolio Card Preview */}
                      <div className="relative group">
                        {item.image ? (
                          <>
                            <div className="aspect-video w-full bg-gradient-to-br from-gray-800 to-gray-900 overflow-hidden">
                              <img
                                src={item.image}
                                alt="Portfolio preview"
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <button
                              onClick={() => onItemChange(item.id, 'image', '')}
                              className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                              title="Remove image"
                            >
                              <X className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                const fileInput = document.getElementById(`file-${item.id}`) as HTMLInputElement;
                                fileInput?.click();
                              }}
                              className="absolute bottom-2 right-2 bg-white/90 text-gray-800 px-3 py-1.5 rounded-lg hover:bg-white text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity shadow-lg flex items-center gap-1"
                            >
                              <Upload className="w-3 h-3" />
                              Change
                            </button>
                          </>
                        ) : (
                          <label
                            htmlFor={`file-${item.id}`}
                            className="aspect-video w-full flex flex-col items-center justify-center border-2 border-dashed cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-secondary)' }}
                          >
                            <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3"
                              style={{
                                background: `linear-gradient(135deg, color-mix(in srgb, var(--color-primary) 10%, transparent), color-mix(in srgb, var(--color-accent) 10%, transparent))`
                              }}
                            >
                              <Upload className="w-6 h-6" style={{ color: 'var(--color-primary)' }} />
                            </div>
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                              Upload Project Image
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                              16:9 aspect ratio
                            </span>
                          </label>
                        )}
                        <input
                          id={`file-${item.id}`}
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleImageSelect(item.id, file);
                          }}
                          className="hidden"
                        />
                      </div>

                      {/* Portfolio Item Details */}
                      <div className="p-4 space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <input
                            type="text"
                            value={item.title}
                            onChange={(e) => onItemChange(item.id, 'title', e.target.value)}
                            className="flex-1 px-3 py-2 rounded-lg border text-sm font-medium focus:outline-none focus:ring-2"
                            style={{
                              borderColor: 'var(--color-border)',
                              backgroundColor: 'var(--color-bg-primary)',
                              color: 'var(--color-text-primary)'
                            }}
                            placeholder="Project Title"
                          />
                          <button
                            onClick={() => onRemoveItem(item.id)}
                            className="text-red-500 hover:text-red-600 p-2"
                            title="Remove portfolio item"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        <textarea
                          value={item.description}
                          onChange={(e) => onItemChange(item.id, 'description', e.target.value)}
                          rows={2}
                          className="w-full px-3 py-2 rounded-lg border text-sm resize-none focus:outline-none focus:ring-2"
                          style={{
                            borderColor: 'var(--color-border)',
                            backgroundColor: 'var(--color-bg-primary)',
                            color: 'var(--color-text-primary)'
                          }}
                          placeholder="Brief description of your project and role..."
                        />

                        <input
                          type="url"
                          value={item.link}
                          onChange={(e) => onItemChange(item.id, 'link', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2"
                          style={{
                            borderColor: 'var(--color-border)',
                            backgroundColor: 'var(--color-bg-primary)',
                            color: 'var(--color-text-primary)'
                          }}
                          placeholder="🔗 Project link (optional)"
                        />
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-900 dark:text-white mb-3">
              Education
            </label>
            <textarea
              value={formData.education}
              onChange={(e) => setFormData(prev => ({ ...prev, education: e.target.value }))}
              rows={4}
              className="w-full px-6 py-4 rounded-2xl border border-blue-500/[0.15] dark:border-white/[0.1] bg-white/[0.85] dark:bg-white/[0.05] text-gray-900 dark:text-white text-base font-medium focus:outline-none focus:border-blue-500 dark:focus:border-cyan-400 transition-all resize-none"
              placeholder="e.g., Bachelor's in Computer Science - University Name (2018-2022)"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-900 dark:text-white mb-3">
              Certifications (Optional)
            </label>
            <textarea
              value={formData.certifications.join('\n')}
              onChange={(e) =>
                setFormData(prev => ({
                  ...prev,
                  certifications: e.target.value.split('\n').filter(c => c.trim())
                }))
              }
              rows={4}
              className="w-full px-6 py-4 rounded-2xl border border-blue-500/[0.15] dark:border-white/[0.1] bg-white/[0.85] dark:bg-white/[0.05] text-gray-900 dark:text-white text-base font-medium focus:outline-none focus:border-blue-500 dark:focus:border-cyan-400 transition-all resize-none"
              placeholder="List your certifications (one per line)&#10;e.g.,&#10;AWS Certified Solutions Architect&#10;Google Analytics Certification"
            />
          </div>
        </div>
      </div>
    </>
  );
};

// Step 4: Rates & Availability
const Step4RatesAvailability: React.FC<{
  formData: FreelancerFormData;
  setFormData: React.Dispatch<React.SetStateAction<FreelancerFormData>>;
  errors: ValidationErrors;
}> = ({ formData, setFormData, errors }) => {
  return (
    <div className="bg-white/[0.85] dark:bg-white/[0.05] backdrop-blur-[20px] border border-blue-500/[0.15] dark:border-white/[0.1] rounded-[24px] p-10">
      <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-8">Rates & Availability</h2>

      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-gray-900 dark:text-white mb-3">
              Hourly Rate <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={formData.hourlyRate}
              onChange={(e) =>
                setFormData(prev => ({ ...prev, hourlyRate: Number(e.target.value) }))
              }
              className={`w-full px-6 py-4 rounded-2xl border ${
                errors.hourlyRate ? 'border-red-500' : 'border-blue-500/[0.15] dark:border-white/[0.1]'
              } bg-white/[0.85] dark:bg-white/[0.05] text-gray-900 dark:text-white text-base font-medium focus:outline-none focus:border-blue-500 dark:focus:border-cyan-400 transition-all`}
              placeholder="50"
              min="0"
            />
            {errors.hourlyRate && (
              <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" /> {errors.hourlyRate}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-900 dark:text-white mb-3">
              Currency
            </label>
            <select
              value={formData.currency}
              onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
              className="w-full px-6 py-4 rounded-2xl border border-blue-500/[0.15] dark:border-white/[0.1] bg-white/[0.85] dark:bg-white/[0.05] text-gray-900 dark:text-gray-200 text-base font-medium focus:outline-none focus:border-blue-500 dark:focus:border-cyan-400 transition-all dark:[color-scheme:dark]"
            >
              <option value="PKR" className="!bg-gray-900 !text-gray-200">PKR - Pakistani Rupee</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-900 dark:text-white mb-3">
            Availability <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.availability}
            onChange={(e) => setFormData(prev => ({ ...prev, availability: e.target.value }))}
            className="w-full px-6 py-4 rounded-2xl border border-blue-500/[0.15] dark:border-white/[0.1] bg-white/[0.85] dark:bg-white/[0.05] text-gray-900 dark:text-gray-200 text-base font-medium focus:outline-none focus:border-blue-500 dark:focus:border-cyan-400 transition-all dark:[color-scheme:dark]"
          >
            <option value="full-time" className="!bg-gray-900 !text-gray-200">Full-time (40+ hours/week)</option>
            <option value="part-time" className="!bg-gray-900 !text-gray-200">Part-time (20-40 hours/week)</option>
            <option value="contract" className="!bg-gray-900 !text-gray-200">Contract/Project-based</option>
            <option value="hourly" className="!bg-gray-900 !text-gray-200">Hourly (As needed)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-900 dark:text-white mb-3">
            Languages <span className="text-red-500">*</span>
          </label>
          <div className="space-y-2">
            {['English', 'Spanish', 'French', 'German', 'Chinese', 'Arabic', 'Urdu', 'Hindi'].map(
              language => (
                <label
                  key={language}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={formData.languages.includes(language)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData(prev => ({
                          ...prev,
                          languages: [...prev.languages, language]
                        }));
                      } else {
                        setFormData(prev => ({
                          ...prev,
                          languages: prev.languages.filter(l => l !== language)
                        }));
                      }
                    }}
                    className="rounded text-blue-600 focus:ring-blue-500 dark:text-cyan-400 dark:focus:ring-cyan-400"
                  />
                  <span className="text-sm text-gray-900 dark:text-white">{language}</span>
                </label>
              )
            )}
          </div>
          {errors.languages && (
            <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" /> {errors.languages}
            </p>
          )}
        </div>

        <div className="p-4 rounded-2xl border" style={{
          backgroundColor: 'var(--color-bg-secondary)',
          borderColor: 'var(--color-border)'
        }}>
          <h4 className="font-medium mb-2 flex items-center gap-2 text-gray-900 dark:text-white">
            <Target className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
            Profile Summary
          </h4>
          <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
            <li>• Hourly Rate: {formData.currency} {formData.hourlyRate}/hour</li>
            <li>• Availability: {formData.availability}</li>
            <li>• Languages: {formData.languages.join(', ')}</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BecomeFreelancerPage;
