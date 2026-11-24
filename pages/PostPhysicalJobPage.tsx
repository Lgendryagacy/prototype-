import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/firebase/config';
import { getUserProfile } from '@/firebase/services/userService';
import { createPhysicalJobRequest } from '@/firebase/services/physicalJobRequestService';
import { getFogslyPhysicalJobById, updatePhysicalJob } from '@/firebase/services/fogslyPhysicalJobsService';
import FogPhysicalJobPost from '@/components/FogPhysicalJobPost';
import { toast } from 'react-hot-toast';
import { UserProfile } from '@/firebase/types/user';
import { FogslyPhysicalJob } from '@/firebase/types/physicalJob';

interface PostPhysicalJobPageProps {
  navigate: (route: string) => void;
}

const PostPhysicalJobPage: React.FC<PostPhysicalJobPageProps> = ({ navigate }) => {
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const [editJobId, setEditJobId] = useState<string | null>(null);
  const [editJobData, setEditJobData] = useState<FogslyPhysicalJob | null>(null);
  const [isLoadingJobData, setIsLoadingJobData] = useState(false);

  // Extract job ID from URL if editing OR check local storage for AI drafts
  useEffect(() => {
    const path = window.location.pathname;
    const match = path.match(/edit-physical-job\/([^/]+)/);
    if (match && match[1]) {
      setEditJobId(match[1]);
    } else {
      try {
        const draftStr = window.localStorage.getItem('fogsly_ai_draft_data');
        if (draftStr) {
          const parsed = JSON.parse(draftStr);
          setEditJobData(parsed as FogslyPhysicalJob);
          window.localStorage.removeItem('fogsly_ai_draft_data');
          setTimeout(() => toast.success('Loaded AI Draft! Please review and confirm.'), 500);
        }
      } catch (err) {
        console.error('Failed to parse AI draft from localStorage', err);
      }
    }
  }, []);

  // Load job data if editing
  useEffect(() => {
    if (editJobId) {
      setIsLoadingJobData(true);
      getFogslyPhysicalJobById(editJobId)
        .then(job => {
          if (job) {
            setEditJobData(job);
          } else {
            toast.error('Job not found');
            navigate('manage-physical-jobs');
          }
        })
        .catch(error => {
          console.error('Error loading job:', error);
          toast.error('Failed to load job data');
          navigate('manage-physical-jobs');
        })
        .finally(() => setIsLoadingJobData(false));
    }
  }, [editJobId, navigate]);

  // Check authentication and profile completeness
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        // Not logged in - redirect to auth
        toast.error('Please log in to post a job');
        navigate('auth');
        return;
      }

      setCurrentUserId(user.uid);
      setCurrentUserEmail(user.email);

      // Fetch user profile
      try {
        const profile = await getUserProfile(user.uid);
        
        if (!profile) {
          toast.error('Profile not found. Please complete your profile first.');
          navigate('profile');
          return;
        }

        // Check if profile is complete
        const isProfileComplete = 
          profile.name &&
          profile.phone &&
          profile.country &&
          profile.city;

        if (!isProfileComplete) {
          toast.error('Please complete your profile before posting a job', {
            duration: 4000,
          });
          navigate('profile');
          return;
        }

        setUserProfile(profile);
        setIsCheckingAuth(false);
      } catch (error) {
        console.error('Error fetching user profile:', error);
        toast.error('Error loading profile. Please try again.');
        navigate('profile');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleNavigateBack = () => {
    navigate('fog-jobs');
  };

  const handleNavigateToStatus = () => {
    navigate('physical-job-request-status');
  };

  const handleNavigateToAuth = () => {
    navigate('auth');
  };

  const handleSubmit = async (jobData: any) => {
    if (!currentUserId || !currentUserEmail) {
      toast.error('Authentication error. Please log in again.');
      navigate('auth');
      return;
    }

    try {
      // Show loading toast
      const loadingToast = toast.loading(editJobId ? 'Updating job...' : 'Submitting job request...');

      if (editJobId) {
        // Update existing job
        const updateData = {
          company_name: jobData.company_name,
          company_logo: jobData.company_logo || editJobData?.company_logo,
          industry: jobData.industry,
          company_description: jobData.company_description,
          website: jobData.website,
          company_size: jobData.company_size,
          email: jobData.email,
          phone: jobData.phone,
          country: jobData.country,
          city: jobData.city,
          address: jobData.address,
          location: jobData.location,
          job_title: jobData.job_title,
          category: jobData.category,
          job_type: jobData.job_type,
          experience_level: jobData.experience_level,
          employment_type: jobData.employment_type,
          num_positions: jobData.num_positions,
          salary_min: jobData.salary_min,
          salary_max: jobData.salary_max,
          urgency: jobData.urgency,
          job_description: jobData.job_description,
          responsibilities: jobData.responsibilities,
          required_skills: jobData.required_skills,
          benefits: jobData.benefits,
          accommodation: jobData.accommodation,
          visa_support: jobData.visa_support,
          deadline: jobData.deadline,
        };

        const result = await updatePhysicalJob(editJobId, updateData);

        toast.dismiss(loadingToast);

        if (result.success) {
          toast.success('Job updated successfully! ✨', {
            duration: 4000,
            icon: '🎉',
          });
          setTimeout(() => {
            navigate('manage-physical-jobs');
          }, 1500);
        } else {
          toast.error(result.error || 'Failed to update job');
        }
      } else {
        // Create new job request
        const jobRequestData = {
          userId: currentUserId,
          userEmail: currentUserEmail,
          
          // Company Info
          company_name: jobData.company_name,
          company_logo: jobData.company_logo || undefined,
          industry: jobData.industry,
          company_description: jobData.company_description,
          website: jobData.website || undefined,
          company_size: jobData.company_size,
          email: jobData.email,
          phone: jobData.phone,
          
          // Location
          country: jobData.country,
          city: jobData.city,
          address: jobData.address,
          location: jobData.location, // From Google Maps
          
          // Job Details
          job_title: jobData.job_title,
          category: jobData.category,
          job_type: jobData.job_type,
          experience_level: jobData.experience_level,
          employment_type: jobData.employment_type,
          num_positions: jobData.num_positions,
          
          // Compensation
          salary_min: jobData.salary_min,
          salary_max: jobData.salary_max,
          urgency: jobData.urgency,
          
          // Description
          job_description: jobData.job_description,
          responsibilities: jobData.responsibilities,
          required_skills: jobData.required_skills, // Array from FogPhysicalJobPost
          benefits: jobData.benefits || undefined,
          
          // Special Offers
          accommodation: jobData.accommodation,
          visa_support: jobData.visa_support,
          deadline: jobData.deadline,
        };

        // Submit to Firebase
        const result = await createPhysicalJobRequest(jobRequestData);

        toast.dismiss(loadingToast);

        if (result.success) {
          toast.success('Job request submitted successfully! ✨', {
            duration: 4000,
            icon: '🎉',
          });
          
          // Navigate to status page
          setTimeout(() => {
            navigate('job-requests-status');
          }, 1500);
        } else {
          toast.error(result.error || 'Failed to submit job request');
        }
      }
    } catch (error) {
      console.error('Error submitting job request:', error);
      toast.error('An error occurred. Please try again.');
    }
  };

  // Show loading screen while checking authentication or loading job data
  if (isCheckingAuth || isLoadingJobData) {
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
            {isLoadingJobData ? 'Loading job data...' : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  // Render the job post form
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
      <FogPhysicalJobPost
        navigateBack={handleNavigateBack}
        onNavigateToStatus={handleNavigateToStatus}
        onNavigateToAuth={handleNavigateToAuth}
        onSubmit={handleSubmit}
        editMode={!!editJobId}
        initialData={editJobData}
      />
    </div>
  );
};

export default PostPhysicalJobPage;
