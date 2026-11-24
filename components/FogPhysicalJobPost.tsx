import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Plus, Briefcase, DollarSign, FileText, AlertCircle, ArrowLeft, Upload, MapPin, Check, ChevronDown,
  CheckCircle
} from 'lucide-react';
import { COUNTRIES, findCountryByName, getPhonePattern, getPhonePlaceholder } from '../constants/countries';
import { geocodeAddress, loadGoogleMapsScript, initializeMap, addMarker, reverseGeocode } from '../utils/geocoding';
import { toast, ToastContainer } from 'react-toastify';

// ============== TYPES ==============
interface PostJobPageProps {
  navigateBack: () => void;
  onNavigateToStatus: () => void;
  onNavigateToAuth: () => void;
  onSubmit: (jobData: any) => void;
  editMode?: boolean;
  initialData?: any;
}

interface JobLocation {
  latitude: number;
  longitude: number;
  formatted_address: string;
}

interface JobFormData {
  // Company Info
  company_name: string;
  industry: string;
  company_description: string;
  website: string;
  company_size: string;
  country: string;
  city: string;
  address: string;
  email: string;
  phone: string;
  location?: JobLocation;
  // Job Info
  job_title: string;
  category: string;
  job_type: string;
  experience_level: string;
  employment_type: string;
  num_positions: number;
  // Compensation & Details
  salary_min: number | string;
  salary_max: number | string;
  urgency: string;
  job_description: string;
  responsibilities: string;
  required_skills: string;
  benefits: string;
  // Special Offers
  accommodation: boolean;
  visa_support: boolean;
  deadline: string;
}

// ============== POST JOB PAGE COMPONENT ==============
const FogPhysicalJobPost: React.FC<PostJobPageProps> = ({
  navigateBack,
  onNavigateToStatus,
  onNavigateToAuth,
  onSubmit,
  editMode = false,
  initialData = null
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');

  // New state for enhancements
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [mapInstance, setMapInstance] = useState<any>(null);
  const [marker, setMarker] = useState<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);

  // Field-level validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<JobFormData>({
    // Company Info
    company_name: '',
    industry: '',
    company_description: '',
    website: '',
    company_size: '',
    country: '',
    city: '',
    address: '',
    email: '',
    phone: '',
    // Job Info
    job_title: '',
    category: '',
    job_type: 'On-Site',
    experience_level: 'Mid',
    employment_type: 'Full-time',
    num_positions: 1,
    // Compensation & Details
    salary_min: 0,
    salary_max: 0,
    urgency: 'Normal',
    job_description: '',
    responsibilities: '',
    required_skills: '',
    benefits: '',
    // Special Offers
    accommodation: false,
    visa_support: false,
    deadline: ''
  });

  // Load initial data when editing
  useEffect(() => {
    if (editMode && initialData) {
      setFormData({
        company_name: initialData.company_name || '',
        industry: initialData.industry || '',
        company_description: initialData.company_description || '',
        website: initialData.website || '',
        company_size: initialData.company_size || '',
        country: initialData.country || '',
        city: initialData.city || '',
        address: initialData.address || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        job_title: initialData.job_title || '',
        category: initialData.category || '',
        job_type: initialData.job_type || 'On-Site',
        experience_level: initialData.experience_level || 'Mid',
        employment_type: initialData.employment_type || 'Full-time',
        num_positions: initialData.num_positions || 1,
        salary_min: initialData.salary_min || 0,
        salary_max: initialData.salary_max || 0,
        urgency: initialData.urgency || 'Normal',
        job_description: initialData.job_description || '',
        responsibilities: initialData.responsibilities || '',
        required_skills: Array.isArray(initialData.required_skills) ? initialData.required_skills.join(', ') : '',
        benefits: initialData.benefits || '',
        accommodation: initialData.accommodation || false,
        visa_support: initialData.visa_support || false,
        deadline: initialData.deadline || '',
        location: initialData.location
      });
      
      if (Array.isArray(initialData.required_skills)) {
        setSkills(initialData.required_skills);
      }
      
      if (initialData.company_logo) {
        setLogoPreview(initialData.company_logo);
      }
    }
  }, [editMode, initialData]);

  const handleInputChange = (field: keyof JobFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Validate individual field
  const validateField = (field: keyof JobFormData, value: any): string => {
    switch (field) {
      case 'company_name':
        return !value?.trim() ? 'Company name is required' : '';
      case 'country':
        return !value?.trim() ? 'Country is required' : '';
      case 'city':
        return !value?.trim() ? 'City is required' : '';
      case 'industry':
        return !value?.trim() ? 'Industry name is required' : '';
      case 'address':
        return !value?.trim() ? 'Address is required for location mapping' : '';
      case 'email':
        if (!value?.trim()) return 'Email is required';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return !emailRegex.test(value) ? 'Invalid email format' : '';
      case 'phone':
        if (!value?.trim()) return 'Phone number is required';
        const country = findCountryByName(formData.country);
        if (country) {
          const pattern = getPhonePattern(country.code);
          return !pattern.test(value) ? `Invalid phone format for ${country.name}` : '';
        }
        return value.length < 7 ? 'Phone number too short' : '';
      case 'job_title':
        return !value?.trim() ? 'Job title is required' : '';
      case 'job_description':
        return !value?.trim() ? 'Job description is required' : '';
      case 'salary_min':
        const minVal = typeof value === 'string' ? parseFloat(value) : value;
        return !value || minVal <= 0 ? 'Minimum salary must be greater than 0' : '';
      case 'salary_max':
        const maxVal = typeof value === 'string' ? parseFloat(value) : value;
        if (!value || maxVal <= 0) return 'Maximum salary must be greater than 0';
        const minSalary = typeof formData.salary_min === 'string' ? parseFloat(formData.salary_min) : formData.salary_min;
        if (maxVal < minSalary) return 'Maximum salary must be greater than minimum';
        return '';
      case 'deadline':
        if (!value) return 'Deadline is required';
        const deadlineDate = new Date(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return deadlineDate < today ? 'Deadline must be in the future' : '';
      default:
        return '';
    }
  };

  // Handle field blur for validation
  const handleFieldBlur = (field: keyof JobFormData) => {
    const error = validateField(field, formData[field]);
    if (error) {
      setErrors(prev => ({ ...prev, [field]: error }));
    }
  };

  // Logo upload handlers
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Logo file size must be less than 5MB');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    setLogoFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview('');
  };

  // Country selection handlers
  const selectCountry = (countryName: string) => {
    handleInputChange('country', countryName);
    setCountryDropdownOpen(false);
    setCountrySearch('');
  };

  const filteredCountries = COUNTRIES.filter(c =>
    c.name.toLowerCase().includes(countrySearch.toLowerCase())
  );

  // Load map only when reaching step 4
  useEffect(() => {
    // console.log('Map useEffect triggered:', {
    //   currentStep,
    //   hasLocation: !!formData.location?.latitude,
    //   mapLoaded,
    //   hasMapRef: !!mapRef.current
    // });

    if (currentStep === 4 && formData.location?.latitude && !mapLoaded) {
      // Wait for ref to be available - longer delay for framer-motion animation
      const checkAndInitMap = async () => {
        // Give React and framer-motion time to render the map container
        await new Promise(resolve => setTimeout(resolve, 400));

        if (!mapRef.current) {
          console.error('Map container still not available after delay');
          setMapLoaded(true);
          return;
        }

        let timeoutId: NodeJS.Timeout;

        // console.log('Step 4: Initializing map...');

        // Set a timeout to prevent infinite loading
        timeoutId = setTimeout(() => {
          if (!mapLoaded) {
            console.error('Map loading timeout after 10 seconds');
            setMapLoaded(true);
            toast.error('Map loading timed out. Location is saved but preview unavailable.', { autoClose: 4000 });
          }
        }, 10000);

        try {
          // Load Google Maps script if not already loaded
          if (!window.google || !window.google.maps) {
            console.log('Loading Google Maps script...');
            await loadGoogleMapsScript();
            console.log('Google Maps script loaded successfully');
          } else {
            console.log('Google Maps already loaded');
          }

          // Wait a bit more for DOM to be ready
          await new Promise(resolve => setTimeout(resolve, 100));

          // Double check container exists and is visible
          if (!mapRef.current) {
            console.error('Map container not found');
            clearTimeout(timeoutId);
            setMapLoaded(true);
            return;
          }

          // console.log('Creating map instance...');
          const map = initializeMap(mapRef.current, formData.location!);
          setMapInstance(map);
          // console.log('Map instance created');

          // Add draggable marker
          // console.log('Adding marker...');
          const newMarker = addMarker(map, formData.location!, true, (newLocation: JobLocation) => {
            setFormData(prev => ({ ...prev, location: newLocation }));
            toast.success('📍 Location updated', { autoClose: 2000 });
          });
          setMarker(newMarker);
          setMapLoaded(true);
          clearTimeout(timeoutId);
          // console.log('Map fully initialized');
        } catch (error) {
          console.error('Map loading error:', error);
          clearTimeout(timeoutId);
          setMapLoaded(true); // Prevent infinite retry
          toast.error('Map preview unavailable', { autoClose: 3000 });
        }
      };

      checkAndInitMap();
    }

    // Cleanup function to properly remove map and marker when leaving step 4
    return () => {
      if (currentStep !== 4 && mapInstance) {
        // console.log('Cleaning up map instance');
        try {
          if (marker) {
            marker.setMap(null);
          }
          // Clear the map container content before React unmounts it
          if (mapRef.current) {
            mapRef.current.innerHTML = '';
          }
        } catch (e) {
          console.error('Error cleaning up map:', e);
        }
        setMapInstance(null);
        setMarker(null);
        setMapLoaded(false);
      }
    };
  }, [currentStep, formData.location?.latitude]);

  // Address geocoding - only geocode, don't load map yet
  const handleAddressBlur = async () => {
    handleFieldBlur('address');

    if (!formData.address || !formData.city || !formData.country) {
      if (formData.address) {
        toast.error('Please select country and city before entering address');
      }
      return;
    }

    setIsGeocoding(true);

    try {
      // Only geocode the address - map will load in step 4
      const result = await geocodeAddress(formData.address, formData.city, formData.country);

      if (result.success && result.location) {
        setFormData(prev => ({ ...prev, location: result.location }));
        toast.success('📍 Location confirmed! View map in final step', {
          autoClose: 3000,
          position: 'top-center'
        });
      } else {
        toast.error(result.error || 'Location not found. Please check your address format', {
          autoClose: 4000
        });
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      toast.error('Failed to geocode. Please try again or check your internet connection');
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleAddSkill = () => {
    if (!skillInput.trim()) return;

    if (skills.length >= 10) {
      toast.error('Maximum 10 skills allowed');
      return;
    }

    if (skills.includes(skillInput.trim())) {
      toast.error('Skill already added');
      return;
    }

    setSkills([...skills, skillInput.trim()]);
    setSkillInput('');
  };

  const handleRemoveSkill = (skill: string) => {
    setSkills(skills.filter(s => s !== skill));
  };

  const handleNextStep = () => {
    // console.log('Attempting to go to next step. Current step:', currentStep);
    // console.log('Current form data:', formData);
    // console.log('Location:', formData.location);

    // Validate current step fields
    const stepErrors: Record<string, string> = {};

    if (currentStep === 1) {
      ['company_name', 'country', 'city', 'address', 'email', 'phone'].forEach(field => {
        const error = validateField(field as keyof JobFormData, formData[field as keyof JobFormData]);
        if (error) {
          // console.log(`Validation error for ${field}:`, error);
          stepErrors[field] = error;
        }
      });

      if (Object.keys(stepErrors).length > 0) {
        // console.log('Step 1 has errors:', stepErrors);
        setErrors(stepErrors);
        toast.error('Please fix all errors before continuing');
        return;
      }

      if (!formData.location?.latitude) {
        // console.log('Location not geocoded yet');
        toast.error('Please wait for address to be geocoded or check the address');
        return;
      }

      // console.log('Step 1 validation passed!');
    } else if (currentStep === 2) {
      ['job_title', 'job_description'].forEach(field => {
        const error = validateField(field as keyof JobFormData, formData[field as keyof JobFormData]);
        if (error) stepErrors[field] = error;
      });

      if (Object.keys(stepErrors).length > 0) {
        setErrors(stepErrors);
        toast.error('Please fix all errors before continuing');
        return;
      }
    } else if (currentStep === 3) {
      ['salary_min', 'salary_max'].forEach(field => {
        const error = validateField(field as keyof JobFormData, formData[field as keyof JobFormData]);
        if (error) stepErrors[field] = error;
      });

      if (Object.keys(stepErrors).length > 0) {
        setErrors(stepErrors);
        toast.error('Please fix all errors before continuing');
        return;
      }
    }

    setCurrentStep(currentStep + 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (skills.length === 0) {
      toast.error('Please add at least one required skill');
      return;
    }

    const deadlineError = validateField('deadline', formData.deadline);
    if (deadlineError) {
      setErrors({ deadline: deadlineError });
      toast.error(deadlineError);
      return;
    }

    if (!formData.location?.latitude) {
      toast.error('Please provide a valid address with location');
      return;
    }

    try {
      setIsSubmitting(true);

      const jobData = {
        ...formData,
        required_skills: skills,
        company_logo: logoPreview || '', // Base64 logo or empty
      };

      await onSubmit(jobData);

      if (!editMode) {
        // Only show this message and navigate for new job posts
        toast.success('Job request submitted successfully! Redirecting to status page...', { autoClose: 2000 });

        setTimeout(() => {
          onNavigateToStatus();
        }, 2000);
      }
      // For edit mode, the parent component handles the toast and navigation

      // Reset form only if not in edit mode
      if (!editMode) {
        setCurrentStep(1);
        setSkills([]);
        setSkillInput('');
        setLogoFile(null);
        setLogoPreview('');
        setErrors({});
        setFormData({
          company_name: '',
          industry: '',
          company_description: '',
          website: '',
          company_size: '',
          country: '',
          city: '',
          address: '',
          email: '',
          phone: '',
          job_title: '',
          category: '',
          job_type: 'On-Site',
          experience_level: 'Mid',
          employment_type: 'Full-time',
          num_positions: 1,
          salary_min: 0,
          salary_max: 0,
          urgency: 'Normal',
          job_description: '',
          responsibilities: '',
          required_skills: '',
          benefits: '',
          accommodation: false,
          visa_support: false,
          deadline: ''
        });
      }
    } catch (error) {
      console.error('Error submitting job:', error);
      toast.error('Failed to post job. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (

    <>
      <ToastContainer />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="py-16 px-4"
      >
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <motion.button
            onClick={navigateBack}
            className="mb-8 inline-flex items-center gap-2 px-6 py-3 text-sm font-bold text-gray-900 dark:text-white hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            whileHover={{ x: -4 }}
          >
            ← Back
          </motion.button>

          {/* Header */}
          <div className="mb-12">
            <h1 className="text-5xl font-black text-gray-900 dark:text-white mb-4" style={{ letterSpacing: '-0.02em' }}>
              {editMode ? 'Edit Job' : 'Post a Job'}
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              {editMode ? 'Update your job posting details' : 'Create a job posting to find your ideal candidates'}
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
              {[1, 2, 3, 4].map(step => (
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
                    {step === 1 ? 'Company' : step === 2 ? 'Job Details' : step === 3 ? 'Compensation' : 'Publish'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-8">
            <AnimatePresence mode="wait">
              {/* Step 1: Company Info */}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white/[0.85] dark:bg-white/[0.05] backdrop-blur-[20px] border border-blue-500/[0.15] dark:border-white/[0.1] rounded-[24px] p-10"
                >
                  <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-8">Company Information</h2>

                  <div className="space-y-6">
                    {/* Company Name */}
                    <div>
                      <label className="block text-sm font-bold text-gray-900 dark:text-white mb-3">
                        Company Name *
                      </label>
                      <input
                        type="text"
                        className={`w-full px-6 py-4 rounded-2xl border ${errors.company_name ? 'border-red-500' : 'border-blue-500/[0.15] dark:border-white/[0.1]'} bg-white/[0.85] dark:bg-white/[0.05] text-gray-900 dark:text-white text-base font-medium focus:outline-none focus:border-blue-500 dark:focus:border-cyan-400 transition-all`}
                        placeholder="Enter company name"
                        value={formData.company_name}
                        onChange={(e) => handleInputChange('company_name', e.target.value)}
                        onBlur={() => handleFieldBlur('company_name')}
                      />
                      {errors.company_name && (
                        <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" /> {errors.company_name}
                        </p>
                      )}
                    </div>

                    {/* Company Logo Upload */}
                    <div>
                      <label className="block text-sm font-bold text-gray-900 dark:text-white mb-3">
                        Company Logo
                      </label>
                      <div className="flex items-center gap-4">
                        {logoPreview ? (
                          <div className="relative">
                            <img src={logoPreview} alt="Logo preview" className="w-24 h-24 rounded-2xl object-cover border border-blue-500/[0.15] dark:border-white/[0.1]" />
                            <button
                              type="button"
                              onClick={removeLogo}
                              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <label className="flex items-center gap-3 px-6 py-4 rounded-2xl border border-dashed border-blue-500/[0.3] dark:border-white/[0.2] bg-white/[0.85] dark:bg-white/[0.05] cursor-pointer hover:border-blue-500 dark:hover:border-cyan-400 transition-all">
                            <Upload className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Upload Logo (Max 5MB)</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleLogoChange}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>
                    </div>

                    {/* Country Dropdown */}
                    <div className="grid grid-cols-2 gap-6">
                      <div className="relative">
                        <label className="block text-sm font-bold text-gray-900 dark:text-white mb-3">
                          Country *
                        </label>
                        <button
                          type="button"
                          onClick={() => setCountryDropdownOpen(!countryDropdownOpen)}
                          className={`w-full px-6 py-4 rounded-2xl border ${errors.country ? 'border-red-500' : 'border-blue-500/[0.15] dark:border-white/[0.1]'} bg-white/[0.85] dark:bg-white/[0.05] text-gray-900 dark:text-white text-base font-medium focus:outline-none focus:border-blue-500 dark:focus:border-cyan-400 transition-all flex items-center justify-between`}
                        >
                          <span className={formData.country ? '' : 'text-gray-400'}>
                            {formData.country || 'Select country'}
                          </span>
                          <ChevronDown className={`w-5 h-5 transition-transform ${countryDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {countryDropdownOpen && (
                          <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 border border-blue-500/[0.15] dark:border-white/[0.1] rounded-2xl shadow-xl max-h-64 overflow-hidden">
                            <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                              <input
                                type="text"
                                className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-blue-500"
                                placeholder="Search countries..."
                                value={countrySearch}
                                onChange={(e) => setCountrySearch(e.target.value)}
                              />
                            </div>
                            <div className="overflow-y-auto max-h-48">
                              {filteredCountries.map((country) => (
                                <button
                                  key={country.code}
                                  type="button"
                                  onClick={() => selectCountry(country.name)}
                                  className="w-full px-6 py-3 text-left hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-3"
                                >
                                  <span className="text-xl">{country.flag}</span>
                                  <span className="text-sm font-medium text-gray-900 dark:text-white">{country.name}</span>
                                  <span className="text-xs text-gray-500 ml-auto">{country.phoneCode}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                        {errors.country && (
                          <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" /> {errors.country}
                          </p>
                        )}
                      </div>

                      {/* City */}
                      <div>
                        <label className="block text-sm font-bold text-gray-900 dark:text-white mb-3">
                          City *
                        </label>
                        <input
                          type="text"
                          className={`w-full px-6 py-4 rounded-2xl border ${errors.city ? 'border-red-500' : 'border-blue-500/[0.15] dark:border-white/[0.1]'} bg-white/[0.85] dark:bg-white/[0.05] text-gray-900 dark:text-white text-base font-medium focus:outline-none focus:border-blue-500 dark:focus:border-cyan-400 transition-all`}
                          placeholder="e.g., San Francisco"
                          value={formData.city}
                          onChange={(e) => handleInputChange('city', e.target.value)}
                          onBlur={() => handleFieldBlur('city')}
                        />
                        {errors.city && (
                          <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" /> {errors.city}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Address */}
                    <div>
                      <label className="block text-sm font-bold text-gray-900 dark:text-white mb-3">
                        Complete Address * <span className="text-xs font-normal text-gray-500">(Include street, area, province/state, and country)</span>
                      </label>
                      <input
                        type="text"
                        className={`w-full px-6 py-4 rounded-2xl border ${errors.address ? 'border-red-500' : 'border-blue-500/[0.15] dark:border-white/[0.1]'} bg-white/[0.85] dark:bg-white/[0.05] text-gray-900 dark:text-white text-base font-medium focus:outline-none focus:border-blue-500 dark:focus:border-cyan-400 transition-all`}
                        placeholder="e.g., 123 Main Street, Block A, Silicon Valley, California, United States"
                        value={formData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        onBlur={handleAddressBlur}
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        💡 Tip: Include complete details (street number, area name, province/state) for accurate location mapping
                      </p>
                      {errors.address && (
                        <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" /> {errors.address}
                        </p>
                      )}
                      {isGeocoding && (
                        <p className="text-blue-500 text-sm mt-2 flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                          Finding location...
                        </p>
                      )}
                      {formData.location?.latitude && !isGeocoding && (
                        <p className="text-green-500 text-sm mt-2 flex items-center gap-1 font-medium">
                          <Check className="w-4 h-4" /> Location confirmed
                        </p>
                      )}
                    </div>

                    {/* Location Confirmation */}
                    {formData.location?.latitude && (
                      <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-xl">
                        <div className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-semibold text-green-900 dark:text-green-100">Location Verified</p>
                            <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                              {formData.location.formatted_address}
                            </p>
                            <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                              Map preview will be available in the final step
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-bold text-gray-900 dark:text-white mb-3">
                        Email *
                      </label>
                      <input
                        type="email"
                        className={`w-full px-6 py-4 rounded-2xl border ${errors.email ? 'border-red-500' : 'border-blue-500/[0.15] dark:border-white/[0.1]'} bg-white/[0.85] dark:bg-white/[0.05] text-gray-900 dark:text-white text-base font-medium focus:outline-none focus:border-blue-500 dark:focus:border-cyan-400 transition-all`}
                        placeholder="company@example.com"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        onBlur={() => handleFieldBlur('email')}
                      />
                      {errors.email && (
                        <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" /> {errors.email}
                        </p>
                      )}
                    </div>

                    {/* Phone with Country-based Validation */}
                    <div>
                      <label className="block text-sm font-bold text-gray-900 dark:text-white mb-3">
                        Phone *
                      </label>
                      <input
                        type="tel"
                        className={`w-full px-6 py-4 rounded-2xl border ${errors.phone ? 'border-red-500' : 'border-blue-500/[0.15] dark:border-white/[0.1]'} bg-white/[0.85] dark:bg-white/[0.05] text-gray-900 dark:text-white text-base font-medium focus:outline-none focus:border-blue-500 dark:focus:border-cyan-400 transition-all`}
                        placeholder={formData.country ? getPhonePlaceholder(findCountryByName(formData.country)?.code || '') : 'Select country first'}
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        onBlur={() => handleFieldBlur('phone')}
                      />
                      {errors.phone && (
                        <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" /> {errors.phone}
                        </p>
                      )}
                    </div>

                    {/* Industry */}
                    <div>
                      <label className="block text-sm font-bold text-gray-900 dark:text-white mb-3">
                        Industry *
                      </label>
                      <input
                        type="text"
                        className={`w-full px-6 py-4 rounded-2xl border ${errors.industry ? 'border-red-500' : 'border-blue-500/[0.15] dark:border-white/[0.1]'} bg-white/[0.85] dark:bg-white/[0.05] text-gray-900 dark:text-white text-base font-medium focus:outline-none focus:border-blue-500 dark:focus:border-cyan-400 transition-all`}
                        placeholder="e.g., Technology"
                        value={formData.industry}
                        onChange={(e) => handleInputChange('industry', e.target.value)}
                        onBlur={() => handleFieldBlur('industry')}

                      />
                      {errors.industry && (
                        <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" /> {errors.industry}
                        </p>
                      )}
                    </div>

                    {/* Company Description */}
                    <div>
                      <label className="block text-sm font-bold text-gray-900 dark:text-white mb-3">
                        Company Description
                      </label>
                      <textarea
                        className="w-full px-6 py-4 rounded-2xl border border-blue-500/[0.15] dark:border-white/[0.1] bg-white/[0.85] dark:bg-white/[0.05] text-gray-900 dark:text-white text-base font-medium focus:outline-none focus:border-blue-500 dark:focus:border-cyan-400 transition-all resize-none"
                        rows={4}
                        placeholder="Tell us about your company..."
                        value={formData.company_description}
                        onChange={(e) => handleInputChange('company_description', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex gap-4 justify-between mt-8">
                    <button
                      type="button"
                      onClick={navigateBack}
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

              {/* Step 2: Job Details */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white/[0.85] dark:bg-white/[0.05] backdrop-blur-[20px] border border-blue-500/[0.15] dark:border-white/[0.1] rounded-[24px] p-10"
                >
                  <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-8">Job Details</h2>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-900 dark:text-white mb-3">
                        Job Title *
                      </label>
                      <input
                        type="text"
                        className="w-full px-6 py-4 rounded-2xl border border-blue-500/[0.15] dark:border-white/[0.1] bg-white/[0.85] dark:bg-white/[0.05] text-gray-900 dark:text-white text-base font-medium focus:outline-none focus:border-blue-500 dark:focus:border-cyan-400 transition-all"
                        placeholder="e.g., Senior Software Engineer"
                        value={formData.job_title}
                        onChange={(e) => handleInputChange('job_title', e.target.value)}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-gray-900 dark:text-white mb-3">
                          Job Type
                        </label>
                        <select
                          className="w-full px-6 py-4 rounded-2xl border border-blue-500/[0.15] dark:border-white/[0.1] bg-white/[0.85] dark:bg-white/[0.05] text-gray-900 dark:text-gray-200 text-base font-medium focus:outline-none focus:border-blue-500 dark:focus:border-cyan-400 transition-all dark:[color-scheme:dark]"
                          value={formData.job_type}
                          onChange={(e) => handleInputChange('job_type', e.target.value)}
                        >
                          <option className="!bg-gray-900 !text-gray-200" value="On-Site">On-Site</option>
                          <option className="!bg-gray-900 !text-gray-200" value="Remote">Remote</option>
                          <option className="!bg-gray-900 !text-gray-200" value="Hybrid">Hybrid</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-900 dark:text-white mb-3">
                          Experience Level
                        </label>
                        <select
                          className="w-full px-6 py-4 rounded-2xl border border-blue-500/[0.15] dark:border-white/[0.1] bg-white/[0.85] dark:bg-white/[0.05] text-gray-900 dark:text-white text-base font-medium focus:outline-none focus:border-blue-500 dark:focus:border-cyan-400 transition-all dark:[color-scheme:dark]"
                          value={formData.experience_level}
                          onChange={(e) => handleInputChange('experience_level', e.target.value)}
                        >
                          <option className="!bg-gray-900 !text-gray-200">Entry</option>
                          <option className="!bg-gray-900 !text-gray-200">Mid</option>
                          <option className="!bg-gray-900 !text-gray-200">Senior</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-900 dark:text-white mb-3">
                        Job Description *
                      </label>
                      <textarea
                        className="w-full px-6 py-4 rounded-2xl border border-blue-500/[0.15] dark:border-white/[0.1] bg-white/[0.85] dark:bg-white/[0.05] text-gray-900 dark:text-white text-base font-medium focus:outline-none focus:border-blue-500 dark:focus:border-cyan-400 transition-all resize-none"
                        rows={5}
                        placeholder="Describe the job role and responsibilities..."
                        value={formData.job_description}
                        onChange={(e) => handleInputChange('job_description', e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-900 dark:text-white mb-3">
                        Responsibilities
                      </label>
                      <textarea
                        className="w-full px-6 py-4 rounded-2xl border border-blue-500/[0.15] dark:border-white/[0.1] bg-white/[0.85] dark:bg-white/[0.05] text-gray-900 dark:text-white text-base font-medium focus:outline-none focus:border-blue-500 dark:focus:border-cyan-400 transition-all resize-none"
                        rows={4}
                        placeholder="List key responsibilities (one per line)..."
                        value={formData.responsibilities}
                        onChange={(e) => handleInputChange('responsibilities', e.target.value)}
                      />
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

              {/* Step 3: Compensation */}
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white/[0.85] dark:bg-white/[0.05] backdrop-blur-[20px] border border-blue-500/[0.15] dark:border-white/[0.1] rounded-[24px] p-10"
                >
                  <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-8">Compensation & Requirements</h2>

                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-gray-900 dark:text-white mb-3">
                          Minimum Salary *
                        </label>
                        <input
                          type="number"
                          className="w-full px-6 py-4 rounded-2xl border border-blue-500/[0.15] dark:border-white/[0.1] bg-white/[0.85] dark:bg-white/[0.05] text-gray-900 dark:text-white text-base font-medium focus:outline-none focus:border-blue-500 dark:focus:border-cyan-400 transition-all"
                          placeholder="0"
                          value={formData.salary_min}
                          onChange={(e) => handleInputChange('salary_min', e.target.value === '' ? '' : Number(e.target.value))}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-900 dark:text-white mb-3">
                          Maximum Salary *
                        </label>
                        <input
                          type="number"
                          className="w-full px-6 py-4 rounded-2xl border border-blue-500/[0.15] dark:border-white/[0.1] bg-white/[0.85] dark:bg-white/[0.05] text-gray-900 dark:text-white text-base font-medium focus:outline-none focus:border-blue-500 dark:focus:border-cyan-400 transition-all"
                          placeholder="0"
                          value={formData.salary_max}
                          onChange={(e) => handleInputChange('salary_max', e.target.value === '' ? '' : Number(e.target.value))}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-900 dark:text-white mb-3">
                        Positions Available
                      </label>
                      <input
                        type="number"
                        className="w-full px-6 py-4 rounded-2xl border border-blue-500/[0.15] dark:border-white/[0.1] bg-white/[0.85] dark:bg-white/[0.05] text-gray-900 dark:text-white text-base font-medium focus:outline-none focus:border-blue-500 dark:focus:border-cyan-400 transition-all"
                        placeholder="1"
                        min="1"
                        value={formData.num_positions}
                        onChange={(e) => handleInputChange('num_positions', Number(e.target.value))}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-900 dark:text-white mb-3">
                        Required Skills *
                      </label>
                      <div className="flex gap-3 mb-4">
                        <input
                          type="text"
                          className="flex-1 px-6 py-4 rounded-2xl border border-blue-500/[0.15] dark:border-white/[0.1] bg-white/[0.85] dark:bg-white/[0.05] text-gray-900 dark:text-white text-base font-medium focus:outline-none focus:border-blue-500 dark:focus:border-cyan-400 transition-all"
                          placeholder="Type a skill and press Add..."
                          value={skillInput}
                          onChange={(e) => setSkillInput(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
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
                      <div className="flex flex-wrap gap-2">
                        {skills.map((skill) => (
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

                    <div>
                      <label className="block text-sm font-bold text-gray-900 dark:text-white mb-3">
                        Benefits
                      </label>
                      <textarea
                        className="w-full px-6 py-4 rounded-2xl border border-blue-500/[0.15] dark:border-white/[0.1] bg-white/[0.85] dark:bg-white/[0.05] text-gray-900 dark:text-white text-base font-medium focus:outline-none focus:border-blue-500 dark:focus:border-cyan-400 transition-all resize-none"
                        rows={4}
                        placeholder="List benefits (one per line)..."
                        value={formData.benefits}
                        onChange={(e) => handleInputChange('benefits', e.target.value)}
                      />
                    </div>
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

              {/* Step 4: Final Details */}
              {currentStep === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white/[0.85] dark:bg-white/[0.05] backdrop-blur-[20px] border border-blue-500/[0.15] dark:border-white/[0.1] rounded-[24px] p-10"
                >
                  <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-8">Final Details</h2>

                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-gray-900 dark:text-white mb-3">
                          Urgency
                        </label>
                        <select
                          className="w-full px-6 py-4 rounded-2xl border border-blue-500/[0.15] dark:border-white/[0.1] bg-white/[0.85] dark:bg-white/[0.05] text-gray-900 dark:text-white text-base font-medium focus:outline-none focus:border-blue-500 dark:focus:border-cyan-400 transition-all"
                          value={formData.urgency}
                          onChange={(e) => handleInputChange('urgency', e.target.value)}
                        >
                          <option className="!bg-gray-900 !text-gray-200">Normal</option>
                          <option className="!bg-gray-900 !text-gray-200">Urgent</option>
                          <option className="!bg-gray-900 !text-gray-200">Critical</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-900 dark:text-white mb-3">
                          Deadline *
                        </label>
                        <input
                          type="date"
                          className="w-full px-6 py-4 rounded-2xl border border-blue-500/[0.15] dark:border-white/[0.1] bg-white/[0.85] dark:bg-white/[0.05] text-gray-900 dark:text-white text-base font-medium focus:outline-none focus:border-blue-500 dark:focus:border-cyan-400 transition-all"
                          value={formData.deadline}
                          onChange={(e) => handleInputChange('deadline', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          className="w-5 h-5 rounded border border-blue-500/[0.15] dark:border-white/[0.1] accent-blue-600 dark:accent-cyan-400"
                          checked={formData.accommodation}
                          onChange={(e) => handleInputChange('accommodation', e.target.checked)}
                        />
                        <span className="text-base font-bold text-gray-900 dark:text-white">
                          🏠 Accommodation Provided
                        </span>
                      </label>

                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          className="w-5 h-5 rounded border border-blue-500/[0.15] dark:border-white/[0.1] accent-blue-600 dark:accent-cyan-400"
                          checked={formData.visa_support}
                          onChange={(e) => handleInputChange('visa_support', e.target.checked)}
                        />
                        <span className="text-base font-bold text-gray-900 dark:text-white">
                          ✈️ Visa Support Available
                        </span>
                      </label>
                    </div>

                    {/* Map Preview in Step 4 - Always render container when location exists */}
                    <div className="mt-8">
                      {formData.location?.latitude ? (
                        <>
                          <label className="block text-sm font-bold text-gray-900 dark:text-white mb-3">
                            📍 Location Preview <span className="text-xs font-normal text-gray-500">(Drag marker to fine-tune location)</span>
                          </label>
                          <div className="w-full h-80 rounded-2xl border border-blue-500/[0.15] dark:border-white/[0.1] overflow-hidden shadow-lg bg-gray-100 dark:bg-gray-800 relative">
                            {!mapLoaded && (
                              <div className="w-full h-full flex items-center justify-center absolute inset-0 z-50 bg-gray-100 dark:bg-gray-800 pointer-events-none">
                                <div className="text-center">
                                  <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Loading map...</p>
                                </div>
                              </div>
                            )}
                            <div
                              ref={mapRef}
                              className="w-full h-full"
                            />
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                            📍 {formData.location.formatted_address}
                          </p>
                        </>
                      ) : (
                        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-xl">
                          <p className="text-sm text-yellow-800 dark:text-yellow-200">
                            ⚠️ No location set. Please go back to Step 1 and add an address.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-4 justify-between mt-8">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(3)}
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
                      disabled={isSubmitting}
                      className="px-9 py-5 rounded-2xl font-bold text-base bg-gradient-to-r from-blue-600 to-purple-600 dark:from-cyan-400 dark:to-blue-500 text-white shadow-[0_0_40px_rgba(59,130,246,0.25)] hover:shadow-[0_20px_60px_rgba(6,182,212,0.4)] hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                    >
                      {isSubmitting ? (
                        <span className="flex items-center gap-2">
                          <span className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                          {editMode ? 'Updating...' : 'Posting...'}
                        </span>
                      ) : (
                        editMode ? '✓ Confirm Edit' : '✓ Post Job'
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

export default FogPhysicalJobPost;
