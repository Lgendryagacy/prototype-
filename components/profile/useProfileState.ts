import { useState, useEffect, useCallback } from 'react';
import { User as FirebaseUser, UserProfile } from '../../firebase/types/user';
import { getUserProfile, updateUserProfile, uploadAvatarImage, uploadCoverImage, updateUserAvatar, updateUserCover } from '../../firebase/services/userService';
import { Tab, EditForm, ProfileState, ProfileActions } from './types';
import { toast } from 'react-toastify';

export const useProfileState = (currentUser: FirebaseUser | null) => {
  const [state, setState] = useState<ProfileState>({
    activeTab: 'overview' as Tab,
    userProfile: null,
    isLoading: true,
    isEditing: false,
    editForm: {
      name: '',
      role: '',
      city: '',
      country: '',
      phone: '',
      bio: '',
      skills: [],
      social: {
        linkedin: '',
        facebook: '',
        instagram: '',
        tiktok: ''
      },
      withdrawalAccount: {
        pkr: { accountName: '', accountNumber: '', bankName: '', ibanNumber: '' },
        usd: { serviceName: '', walletAddress: '' }
      }
    },
    isFormInitialized: false,
    isSaving: false,
    newSkill: ''
  });

  useEffect(() => {
    try {
      const draftStr = window.localStorage.getItem('fogsly_ai_draft_data');
      if (draftStr) {
        const parsed = JSON.parse(draftStr);
        // Only consume if this looks like a profile
        if (parsed.displayName || parsed.role || parsed.bio || parsed.city) {
          const newForm = { ...state.editForm };
          if (parsed.displayName) newForm.name = parsed.displayName;
          if (parsed.role) newForm.role = parsed.role;
          if (parsed.bio) newForm.bio = parsed.bio;
          if (parsed.skills) newForm.skills = parsed.skills;
          if (parsed.city) newForm.city = parsed.city;
          if (parsed.country) newForm.country = parsed.country;
          if (parsed.phone) newForm.phone = parsed.phone;
          
          setState(prev => ({
            ...prev,
            activeTab: 'settings',
            isEditing: true,
            editForm: newForm
          }));
          window.localStorage.removeItem('fogsly_ai_draft_data');
          setTimeout(() => toast.info('Loaded AI Draft! Please review your profile updates.', { autoClose: 3000 }), 500);
        }
      }
    } catch (err) {
      console.error('Failed to parse AI draft from localStorage', err);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Memoized actions to prevent unnecessary re-renders
  const actions: ProfileActions = {
    setActiveTab: useCallback((tab: Tab) => {
      setState(prev => ({ ...prev, activeTab: tab }));
    }, []),

    setUserProfile: useCallback((profile: UserProfile | null) => {
      setState(prev => ({ ...prev, userProfile: profile }));
    }, []),

    setIsLoading: useCallback((loading: boolean) => {
      setState(prev => ({ ...prev, isLoading: loading }));
    }, []),

    setIsEditing: useCallback((editing: boolean) => {
      setState(prev => ({ ...prev, isEditing: editing }));
    }, []),

    setEditForm: useCallback((updater) => {
      setState(prev => ({ 
        ...prev, 
        editForm: typeof updater === 'function' ? updater(prev.editForm) : updater 
      }));
    }, []),

    setIsFormInitialized: useCallback((initialized: boolean) => {
      setState(prev => ({ ...prev, isFormInitialized: initialized }));
    }, []),

    setIsSaving: useCallback((saving: boolean) => {
      setState(prev => ({ ...prev, isSaving: saving }));
    }, []),

    setNewSkill: useCallback((skill: string) => {
      setState(prev => ({ ...prev, newSkill: skill }));
    }, []),

    handleFormChange: useCallback((field: string, value: string) => {
      setState(prev => ({
        ...prev,
        editForm: { ...prev.editForm, [field]: value }
      }));
    }, []),

    handleSocialChange: useCallback((platform: string, value: string) => {
      setState(prev => ({
        ...prev,
        editForm: {
          ...prev.editForm,
          social: { ...prev.editForm.social, [platform]: value }
        }
      }));
    }, []),

    handleWithdrawalAccountChange: useCallback((currency: 'pkr' | 'usd', field: string, value: string) => {
      setState(prev => ({
        ...prev,
        editForm: {
          ...prev.editForm,
          withdrawalAccount: {
            ...prev.editForm.withdrawalAccount,
            [currency]: {
              ...prev.editForm.withdrawalAccount?.[currency],
              [field]: value
            }
          }
        }
      }));
    }, []),

    handleSkillAdd: useCallback((skill: string) => {
      if (skill.trim() && !state.editForm.skills.includes(skill.trim())) {
        setState(prev => ({
          ...prev,
          editForm: {
            ...prev.editForm,
            skills: [...prev.editForm.skills, skill.trim()]
          }
        }));
      }
    }, [state.editForm.skills]),

    handleSkillRemove: useCallback((skillToRemove: string) => {
      setState(prev => ({
        ...prev,
        editForm: {
          ...prev.editForm,
          skills: prev.editForm.skills.filter(skill => skill !== skillToRemove)
        }
      }));
    }, []),

    handleCancelEdit: useCallback(() => {
      // Reset form to original values
      if (state.userProfile) {
        setState(prev => ({
          ...prev,
          isEditing: false,
          editForm: {
            name: prev.userProfile?.name || '',
            role: prev.userProfile?.role || '',
            city: prev.userProfile?.city || '',
            country: prev.userProfile?.country || '',
            phone: prev.userProfile?.phone || '',
            bio: prev.userProfile?.bio || '',
            skills: prev.userProfile?.skills || [],
            social: {
              linkedin: prev.userProfile?.social?.linkedin || '',
              facebook: prev.userProfile?.social?.facebook || '',
              instagram: prev.userProfile?.social?.instagram || '',
              tiktok: prev.userProfile?.social?.tiktok || ''
            },
            withdrawalAccount: {
              pkr: {
                accountName: prev.userProfile?.withdrawalAccount?.pkr?.accountName || '',
                accountNumber: prev.userProfile?.withdrawalAccount?.pkr?.accountNumber || '',
                bankName: prev.userProfile?.withdrawalAccount?.pkr?.bankName || '',
                ibanNumber: prev.userProfile?.withdrawalAccount?.pkr?.ibanNumber || ''
              },
              usd: {
                serviceName: prev.userProfile?.withdrawalAccount?.usd?.serviceName || '',
                walletAddress: prev.userProfile?.withdrawalAccount?.usd?.walletAddress || ''
              }
            }
          }
        }));
      }
    }, [state.userProfile]),

    handleSaveProfile: useCallback(async () => {
      if (!currentUser?.uid) {
        throw new Error('User not authenticated');
      }

      setState(prev => ({ ...prev, isSaving: true }));

      try {
        // Validation: all required fields (this is now handled in SettingsTab)
        const { name, role, city, country, phone } = state.editForm;
        if (!name.trim() || !role.trim() || !city.trim() || !country.trim() || !phone.trim()) {
          setState(prev => ({ ...prev, isSaving: false }));
          throw new Error('Please fill in all required fields.');
        }

        const profileData = {
          name: name.trim(),
          role: role.trim(),
          city: city.trim(),
          country: country.trim(),
          phone: phone.trim(),
          bio: state.editForm.bio?.trim(),
          skills: state.editForm.skills,
          social: state.editForm.social,
          withdrawalAccount: state.editForm.withdrawalAccount
        };

        await updateUserProfile(currentUser.uid, profileData);
        
        // Update local state
        setState(prev => ({
          ...prev,
          userProfile: prev.userProfile ? { ...prev.userProfile, ...profileData } : null,
          isEditing: false,
          isSaving: false
        }));

        // Success - no need to log here, SettingsTab will handle success message
      } catch (error) {
        console.error('Error updating profile:', error);
        setState(prev => ({ ...prev, isSaving: false }));
        throw error; // Re-throw so SettingsTab can catch it
      }
    }, [currentUser?.uid, state.editForm]),

    handleAvatarUpload: useCallback(async (file: File) => {
      if (!currentUser?.uid) return;

      try {
        setState(prev => ({ ...prev, isSaving: true }));
        const avatarUrl = await uploadAvatarImage(file, currentUser.uid);
        await updateUserAvatar(currentUser.uid, avatarUrl);
        
        // Update local state
        setState(prev => ({
          ...prev,
          userProfile: prev.userProfile ? { ...prev.userProfile, avatarUrl } : null,
          isSaving: false
        }));
        
        toast.success('Avatar updated successfully!');
      } catch (error) {
        console.error('Error uploading avatar:', error);
        toast.error('Failed to upload avatar. Please try again.');
        setState(prev => ({ ...prev, isSaving: false }));
      }
    }, [currentUser?.uid]),

    handleCoverUpload: useCallback(async (file: File) => {
      if (!currentUser?.uid) return;

      try {
        setState(prev => ({ ...prev, isSaving: true }));
        const coverUrl = await uploadCoverImage(file, currentUser.uid);
        await updateUserCover(currentUser.uid, coverUrl);
        
        // Update local state
        setState(prev => ({
          ...prev,
          userProfile: prev.userProfile ? { ...prev.userProfile, coverUrl } : null,
          isSaving: false
        }));
        
        toast.success('Cover image updated successfully!');
      } catch (error) {
        console.error('Error uploading cover image:', error);
        toast.error('Failed to upload cover image. Please try again.');
        setState(prev => ({ ...prev, isSaving: false }));
      }
    }, [currentUser?.uid])
  };

  // Fetch user profile on mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (currentUser?.uid) {
        try {
          const profile = await getUserProfile(currentUser.uid);
          setState(prev => ({ 
            ...prev, 
            userProfile: profile,
            isLoading: false
          }));
          
          // Initialize edit form if profile exists and form hasn't been initialized yet
          if (profile && !state.isFormInitialized) {
            setState(prev => ({
              ...prev,
              editForm: {
                name: profile.name || '',
                role: profile.role || '',
                city: profile.city || '',
                country: profile.country || '',
                phone: profile.phone || '',
                bio: profile.bio || '',
                skills: profile.skills || [],
                social: {
                  linkedin: profile.social?.linkedin || '',
                  facebook: profile.social?.facebook || '',
                  instagram: profile.social?.instagram || '',
                  tiktok: profile.social?.tiktok || ''
                },
                withdrawalAccount: {
                  pkr: {
                    accountName: profile.withdrawalAccount?.pkr?.accountName || '',
                    accountNumber: profile.withdrawalAccount?.pkr?.accountNumber || '',
                    bankName: profile.withdrawalAccount?.pkr?.bankName || '',
                    ibanNumber: profile.withdrawalAccount?.pkr?.ibanNumber || ''
                  },
                  usd: {
                    serviceName: profile.withdrawalAccount?.usd?.serviceName || '',
                    walletAddress: profile.withdrawalAccount?.usd?.walletAddress || ''
                  }
                }
              },
              isFormInitialized: true
            }));
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
          setState(prev => ({ ...prev, isLoading: false }));
        }
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };

    fetchUserProfile();
  }, [currentUser?.uid, state.isFormInitialized]);

  return { state, actions };
};
