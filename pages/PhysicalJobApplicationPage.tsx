import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Upload, Plus, X, Loader, CheckCircle, FileText } from 'lucide-react';
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import Select from 'react-select';
import { COUNTRIES, getPhonePattern, findCountryByName } from '@/constants/countries';
import { useAuth } from '@/firebase/hooks/useAuth';
import { getUserProfile } from '@/firebase/services/userService';
import { getFogslyPhysicalJobById } from '@/firebase/services/fogslyPhysicalJobsService';
import {
  createPhysicalJobApplication,
  checkExistingApplication
} from '@/firebase/services/physicalJobApplicationService';
import { storage } from '@/firebase/config';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { toast } from 'react-hot-toast';

interface Job {
  id: string;
  userId: string;
  userEmail: string;
  company_name: string;
  company_logo?: string;
  city: string;
  country: string;
  job_title: string;
  category: string;
  job_type: string;
  experience_level: string;
  employment_type: string;
  salary_min: number;
  salary_max: number;
}

interface PhysicalJobApplicationPageProps {
  navigate: (route: string) => void;
}

const GlassCard: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <motion.div
    className={`backdrop-blur-[20px] rounded-[24px] shadow-lg transition-all duration-400 ${className}`}
    style={{
      backgroundColor: 'var(--color-card)',
      border: '1px solid var(--color-border)'
    }}
  >
    {children}
  </motion.div>
);

// Country options for react-select
const countryOptions = COUNTRIES.map(country => ({
  value: country.name,
  label: `${country.flag} ${country.name}`,
  code: country.code,
  phoneCode: country.phoneCode
}));

const PhysicalJobApplicationPage: React.FC<PhysicalJobApplicationPageProps> = ({ navigate }) => {
  const { user, loading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [skillInput, setSkillInput] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [jobId, setJobId] = useState<string | null>(null);
  const [job, setJob] = useState<Job | null>(null);
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [existingApplication, setExistingApplication] = useState<any>(null);
  const [hasApplied, setHasApplied] = useState(false);
  
  // File upload states
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    applicant_name: '',
    applicant_email: '',
    applicant_phone: '',
    applicant_city: '',
    applicant_country: '',
    cover_letter: '',
    resume_url: ''
  });

  // Extract job ID from URL and fetch job data immediately
  useEffect(() => {
    const fetchJobData = async () => {
      const path = window.location.pathname;
      const match = path.match(/physical-job-application\/([^/]+)/);
      
      if (!match || !match[1]) {
        toast.error('Job ID not found');
        navigate('fog-jobs');
        return;
      }

      const extractedJobId = match[1];
      setJobId(extractedJobId);

      try {
        const jobData = await getFogslyPhysicalJobById(extractedJobId);
        
        if (jobData) {
          setJob(jobData as any as Job);
        } else {
          toast.error('Job not found');
          navigate('fog-jobs');
        }
      } catch (error) {
        console.error('Error fetching job:', error);
        toast.error('Failed to load job details');
        navigate('fog-jobs');
      }
    };

    fetchJobData();
  }, [navigate]);

  // Load user profile data
  useEffect(() => {
    if (authLoading) return; // Wait for auth to load
    
    if (!user) {
      navigate('auth');
      return;
    }

    const loadProfile = async () => {
      try {
        const profile = await getUserProfile(user.uid);
        if (profile) {
          setFormData(prev => ({
            ...prev,
            applicant_name: profile.name || '',
            applicant_email: profile.email || user.email || '',
            applicant_phone: profile.phone || '',
            applicant_city: profile.city || '',
            applicant_country: profile.country || ''
          }));
          
          if (profile.phone) {
            setPhoneNumber(profile.phone);
          }
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [user, navigate, authLoading]);

  // Check if user already applied to this job
  useEffect(() => {
    const checkApplication = async () => {
      if (!user || !jobId) return;

      try {
        const application = await checkExistingApplication(jobId, user.uid);
        if (application) {
          setExistingApplication(application);
          setHasApplied(true);
        }
      } catch (error) {
        console.error('Error checking application:', error);
      }
    };

    checkApplication();
  }, [user, jobId]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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

  // Validate file type and size
  const validateFile = (file: File): boolean => {
    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a PDF, DOC, or DOCX file');
      return false;
    }

    if (file.size > maxSize) {
      toast.error('File size must be less than 5MB');
      return false;
    }

    return true;
  };

  // Handle file upload to Firebase Storage
  const handleFileUpload = async (file: File) => {
    if (!user) {
      toast.error('Please log in to upload files');
      return;
    }

    if (!validateFile(file)) {
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Create a unique file name
      const timestamp = Date.now();
      const fileName = `resumes/${user.uid}/${timestamp}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const storageRef = ref(storage, fileName);

      // Upload file
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (error) => {
          console.error('Upload error:', error);
          toast.error('Failed to upload file. Please try again.');
          setIsUploading(false);
          setUploadProgress(0);
        },
        async () => {
          // Upload completed successfully
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          setFormData(prev => ({ ...prev, resume_url: downloadURL }));
          setUploadedFile(file);
          setIsUploading(false);
          toast.success('Resume uploaded successfully! ✅');
        }
      );
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Failed to upload file');
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  // Handle drag and drop
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  // Handle removing uploaded file
  const handleRemoveFile = () => {
    setUploadedFile(null);
    setFormData(prev => ({ ...prev, resume_url: '' }));
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    toast.success('Resume removed');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !job) {
      toast.error('Please log in to apply');
      return;
    }

    // Validate phone number
    if (!phoneNumber || !isValidPhoneNumber(phoneNumber)) {
      toast.error('Please enter a valid phone number');
      return;
    }

    // Additional country-specific validation
    const selectedCountry = findCountryByName(formData.applicant_country);
    if (selectedCountry) {
      const phonePattern = getPhonePattern(selectedCountry.code);
      if (!phonePattern.test(phoneNumber)) {
        toast.error(`Please enter a valid phone number for ${selectedCountry.name}`);
        return;
      }
    }

    if (skills.length === 0) {
      toast.error('Please add at least one skill');
      return;
    }

    if (!formData.cover_letter.trim()) {
      toast.error('Please write a cover letter');
      return;
    }

    if (formData.cover_letter.length > 1000) {
      toast.error('Cover letter must be less than 1000 characters');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createPhysicalJobApplication({
        jobId: job.id,
        jobTitle: job.job_title,
        applicantId: user.uid,
        applicantEmail: formData.applicant_email,
        applicant_name: formData.applicant_name,
        applicant_phone: phoneNumber,
        applicant_city: formData.applicant_city,
        applicant_country: formData.applicant_country,
        jobPosterId: job.userId,
        jobPosterEmail: job.userEmail,
        skills,
        cover_letter: formData.cover_letter,
        resume_url: formData.resume_url
      });

      if (result.success) {
        setShowSuccess(true);
      } else {
        toast.error(result.error || 'Failed to submit application');
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      toast.error('Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
        <Loader className="w-8 h-8 animate-spin" style={{ color: 'var(--color-primary)' }} />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>
            Job not found
          </h2>
          <button
            onClick={() => navigate('fog-jobs')}
            className="px-6 py-3 rounded-xl font-bold"
            style={{
              backgroundColor: 'var(--color-primary)',
              color: 'white'
            }}
          >
            Browse Jobs
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-4 py-16 px-4" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <motion.button
          onClick={() => navigate('fog-jobs')}
          className="mb-2 inline-flex items-center gap-2 px-6 py-3 text-sm font-bold hover:opacity-80 transition-all"
          style={{ color: 'var(--color-primary)' }}
          whileHover={{ x: -4 }}
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Jobs
        </motion.button>

        {/* Job Info Card */}
        <GlassCard className="p-8 mb-4">
          <div className="flex items-start gap-6">
            {job.company_logo ? (
              <img
                src={job.company_logo}
                alt={job.company_name}
                className="w-20 h-20 rounded-2xl object-cover shadow-md"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl shadow-md flex items-center justify-center text-white text-3xl font-black" style={{ backgroundColor: 'var(--color-primary)' }}>
                {job.company_name.charAt(0)}
              </div>
            )}
            <div className="flex-1">
              <h2 className="text-3xl font-black mb-2" style={{ color: 'var(--color-text-primary)', letterSpacing: '-0.02em' }}>
                {job.job_title}
              </h2>
              <p className="text-xl font-semibold mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                {job.company_name}
              </p>
              <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
                {job.city}, {job.country} • ${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()}
              </p>
            </div>
          </div>
        </GlassCard>

        {/* Already Applied Message */}
        {hasApplied && existingApplication && (
          <GlassCard className="p-10 mb-4">
            <div className="text-center">
              <div className="text-6xl mb-6">✅</div>
              <h2 className="text-3xl font-black mb-4" style={{ color: 'var(--color-text-primary)' }}>
                You've Already Applied!
              </h2>
              <p className="text-lg mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                You submitted your application on <span className="font-bold">
                  {new Date(existingApplication.appliedAt).toLocaleDateString('en-US', { 
                    month: 'long', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}
                </span>
              </p>
              <p className="text-base mb-8" style={{ color: 'var(--color-text-tertiary)' }}>
                Current Status: <span 
                  className="font-bold px-3 py-1 rounded-full text-sm"
                  style={{
                    backgroundColor: 
                      existingApplication.status === 'approved' ? '#10b981' : 
                      existingApplication.status === 'rejected' ? '#ef4444' : 
                      '#f59e0b',
                    color: 'white'
                  }}
                >
                  {existingApplication.status.charAt(0).toUpperCase() + existingApplication.status.slice(1)}
                </span>
              </p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => navigate('fog-jobs')}
                  className="px-8 py-4 rounded-2xl font-bold text-base border-2 transition-all duration-300"
                  style={{
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text-primary)',
                    backgroundColor: 'transparent'
                  }}
                >
                  Browse More Jobs
                </button>
                <button
                  onClick={() => navigate('my-fog-job-applications')}
                  className="px-8 py-4 rounded-2xl font-bold text-base bg-[var(--color-primary)] text-white shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
                >
                  View All My Applications
                </button>
              </div>
            </div>
          </GlassCard>
        )}

        {/* Application Form */}
        {!hasApplied && (
        <GlassCard className="p-10">
          <h1 className="text-4xl font-black mb-8" style={{ color: 'var(--color-text-primary)', letterSpacing: '-0.02em' }}>
            Submit Your Application
          </h1>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Personal Information */}
            <div>
              <h3 className="text-xl font-bold mb-6" style={{ color: 'var(--color-text-primary)' }}>
                Personal Information
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.applicant_name}
                    onChange={(e) => handleChange('applicant_name', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 bg-white/50 dark:bg-black/50 focus:outline-none focus:ring-2 transition-all"
                    style={{
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text-primary)'
                    }}
                    placeholder="Your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.applicant_email}
                    onChange={(e) => handleChange('applicant_email', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 bg-white/50 dark:bg-black/50 focus:outline-none focus:ring-2 transition-all"
                    style={{
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text-primary)'
                    }}
                    placeholder="your.email@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                    Phone Number *
                  </label>
                  <PhoneInput
                    international
                    defaultCountry={(findCountryByName(formData.applicant_country)?.code as any) || "US"}
                    value={phoneNumber}
                    onChange={(value) => setPhoneNumber(value || '')}
                    className="w-full px-4 py-3 rounded-xl border-2 bg-white/50 dark:bg-black/50 focus:outline-none focus:ring-2 transition-all phone-input-custom"
                    style={{
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text-primary)'
                    }}
                    placeholder="+1 234 567 8900"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                    Country *
                  </label>
                  <Select
                    options={countryOptions}
                    value={countryOptions.find(c => c.value === formData.applicant_country)}
                    onChange={(option) => {
                      handleChange('applicant_country', option?.value || '');
                      // Update phone input default country when country changes
                      if (option?.code) {
                        setPhoneNumber(''); // Clear phone number when country changes
                      }
                    }}
                    placeholder="Select country"
                    className="react-select-container"
                    classNamePrefix="react-select"
                    styles={{
                      control: (base) => ({
                        ...base,
                        backgroundColor: 'var(--color-bg-secondary)',
                        borderColor: 'var(--color-border)',
                        borderRadius: '0.75rem',
                        borderWidth: '2px',
                        padding: '0.25rem',
                        minHeight: '3rem'
                      }),
                      menu: (base) => ({
                        ...base,
                        backgroundColor: 'var(--color-card)',
                        border: '1px solid var(--color-border)',
                        borderRadius: '0.75rem'
                      }),
                      option: (base, state) => ({
                        ...base,
                        backgroundColor: state.isFocused ? 'var(--color-primary)' : 'transparent',
                        color: state.isFocused ? 'white' : 'var(--color-text-primary)',
                        cursor: 'pointer'
                      }),
                      singleValue: (base) => ({
                        ...base,
                        color: 'var(--color-text-primary)'
                      }),
                      input: (base) => ({
                        ...base,
                        color: 'var(--color-text-primary)'
                      })
                    }}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.applicant_city}
                    onChange={(e) => handleChange('applicant_city', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 bg-white/50 dark:bg-black/50 focus:outline-none focus:ring-2 transition-all"
                    style={{
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text-primary)'
                    }}
                    placeholder="San Francisco"
                  />
                </div>
              </div>
            </div>

            {/* Skills */}
            <div>
              <h3 className="text-xl font-bold mb-6" style={{ color: 'var(--color-text-primary)' }}>
                Skills *
              </h3>
              
              <div className="flex gap-3 mb-4">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                  className="flex-1 px-4 py-3 rounded-xl border-2 bg-white/50 dark:bg-black/50 focus:outline-none focus:ring-2 transition-all"
                  style={{
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text-primary)'
                  }}
                  placeholder="Add a skill (e.g., React, Node.js)"
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="px-6 py-3 rounded-xl font-bold bg-[var(--color-primary)] text-white hover:shadow-lg transition-all duration-300 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
              </div>

              {/* Skills Display */}
              {skills.length > 0 && (
                <div className="flex flex-wrap gap-3">
                  {skills.map((skill, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2"
                      style={{
                        backgroundColor: 'var(--color-primary)',
                        color: 'white'
                      }}
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="hover:opacity-70 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Cover Letter */}
            <div>
              <h3 className="text-xl font-bold mb-6" style={{ color: 'var(--color-text-primary)' }}>
                Cover Letter *
              </h3>
              <textarea
                required
                rows={8}
                value={formData.cover_letter}
                onChange={(e) => handleChange('cover_letter', e.target.value)}
                maxLength={1000}
                className="w-full px-4 py-3 rounded-xl border-2 bg-white/50 dark:bg-black/50 focus:outline-none focus:ring-2 transition-all resize-none"
                style={{
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text-primary)'
                }}
                placeholder="Tell us why you're a great fit for this position..."
              />
              <p className="text-sm mt-2" style={{ color: 'var(--color-text-tertiary)' }}>
                {formData.cover_letter.length} / 1000 characters
              </p>
            </div>

            {/* Resume Upload (Optional) */}
            <div>
              <h3 className="text-xl font-bold mb-6" style={{ color: 'var(--color-text-primary)' }}>
                Resume/CV (Optional)
              </h3>
              
              {!uploadedFile && !isUploading ? (
                <div
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                    isDragging ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10 scale-105' : 'hover:border-[var(--color-primary)]'
                  }`}
                  style={{ borderColor: isDragging ? 'var(--color-primary)' : 'var(--color-border)' }}
                  onClick={() => fileInputRef.current?.click()}
                  onDragEnter={handleDragEnter}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <Upload className="w-12 h-12 mx-auto mb-4" style={{ color: isDragging ? 'var(--color-primary)' : 'var(--color-text-secondary)' }} />
                  <p className="font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                    {isDragging ? 'Drop file here' : 'Click to upload or drag and drop'}
                  </p>
                  <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    PDF, DOC, DOCX (Max 5MB)
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    onChange={handleFileInputChange}
                    className="hidden"
                  />
                </div>
              ) : isUploading ? (
                <div className="border-2 rounded-xl p-8" style={{ borderColor: 'var(--color-border)' }}>
                  <div className="flex items-center gap-4 mb-4">
                    <Loader className="w-8 h-8 animate-spin" style={{ color: 'var(--color-primary)' }} />
                    <div className="flex-1">
                      <p className="font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                        Uploading... {Math.round(uploadProgress)}%
                      </p>
                      <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full transition-all duration-300"
                          style={{ 
                            width: `${uploadProgress}%`,
                            backgroundColor: 'var(--color-primary)'
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="border-2 rounded-xl p-6 flex items-center justify-between" style={{ borderColor: 'var(--color-primary)', backgroundColor: 'var(--color-primary)/5' }}>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                      <FileText className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="font-bold" style={{ color: 'var(--color-text-primary)' }}>
                        {uploadedFile?.name}
                      </p>
                      <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                        {(uploadedFile?.size! / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      className="p-2 rounded-lg hover:bg-red-500/10 transition-colors"
                    >
                      <X className="w-5 h-5" style={{ color: '#ef4444' }} />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-6">
              <button
                type="button"
                onClick={() => navigate('fog-jobs')}
                disabled={isSubmitting}
                className="px-8 py-4 rounded-2xl font-bold text-base border-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text-primary)',
                  backgroundColor: 'transparent'
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-8 py-4 rounded-2xl font-bold text-base bg-[var(--color-primary)] text-white shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Application'
                )}
              </button>
            </div>
          </form>
        </GlassCard>
        )}

        {/* Success Modal */}
        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-lg flex items-center justify-center z-[3000] p-6"
              onClick={() => {
                setShowSuccess(false);
                navigate('fog-jobs');
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                className="bg-[var(--color-card)] backdrop-blur-[20px] border border-[var(--color-border)] rounded-[32px] p-14 max-w-md w-full text-center shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="text-6xl mb-6">🎉</div>
                <h3 className="text-3xl font-black mb-4" style={{ color: 'var(--color-text-primary)' }}>
                  Thank You for Applying!
                </h3>
                <p className="text-lg mb-8" style={{ color: 'var(--color-text-secondary)' }}>
                  Your application for <span className="font-bold" style={{ color: 'var(--color-primary)' }}>{job?.job_title}</span> at <span className="font-bold">{job?.company_name}</span> has been successfully submitted.
                  <br /><br />
                  The employer will review your application and contact you soon. Good luck! 🍀
                </p>
                <button
                  onClick={() => {
                    setShowSuccess(false);
                    navigate('fog-jobs');
                  }}
                  className="w-full px-8 py-4 rounded-2xl font-bold text-base bg-[var(--color-primary)] text-white shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
                >
                  Back to Jobs
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PhysicalJobApplicationPage;
