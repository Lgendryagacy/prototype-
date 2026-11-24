import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, ArrowRight, Calendar, MapPin, Globe, Clock, DollarSign,
  Users, Upload, X, Plus, Minus, Info, MonitorPlay, Check, Sparkles,
  Tag, MessageSquare, AlertCircle, Eye, Loader2, MapPinned
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Textarea } from '../components/ui/Textarea';
import { type Route } from '../types';
import ImageCropper from '../components/ImageCropper';
import { geocodeAddress, loadGoogleMapsScript, initializeMap, addMarker, isValidLocation } from '../utils/geocoding';
import type { JobLocation } from '../firebase/types/physicalJob';
import { DEFAULT_FOG_COIN_SETTINGS } from '../firebase/types/fogCoinSettings';
import { toast } from 'react-hot-toast';
import { getUserProfile } from '../firebase/services/userService';
import { createEventRequest, getUserEventRequests } from '../firebase/services/eventRequestService';
import { updateActiveEvent } from '../firebase/services/activeEventService';
import type { UserProfile } from '../firebase/types/userProfile';

interface CreateEventPageProps {
  navigate: (route: Route, context?: any) => void;
  user?: any;
  isLoggedIn?: boolean;
  editEventData?: any; // Event data for editing
}

const CreateEventPage = ({ navigate, user, isLoggedIn, editEventData }: CreateEventPageProps) => {
  const isEditMode = !!editEventData;
  const [currentStep, setCurrentStep] = useState(1);
  const [showPreview, setShowPreview] = useState(false);
  const [showImageCropper, setShowImageCropper] = useState(false);
  const [pendingImage, setPendingImage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isValidatingProfile, setIsValidatingProfile] = useState(true);
  const [customCategory, setCustomCategory] = useState('');
  const [tagInput, setTagInput] = useState('');
  const predefinedCategories = [
    "Tech & Innovation",
    "Education",
    "Networking",
    "Art & Design",
    "Marketing",
    "Business"
  ];
  const [customCategories, setCustomCategories] = useState<string[]>(editEventData?.customCategories || []);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);
  const [isLoadingMap, setIsLoadingMap] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [isGeocodingAddress, setIsGeocodingAddress] = useState(false);
  const [location, setLocation] = useState<JobLocation | null>(editEventData?.location || null);
  const [fogConversionRate] = useState(DEFAULT_FOG_COIN_SETTINGS.fogToPkrRate);

  // Form Data - Pre-fill if editing
  const [formData, setFormData] = useState({
    // Step 1: Event Details
    title: editEventData?.title || '',
    description: editEventData?.description || '',
    category: editEventData?.category || 'Tech & Innovation',
    tags: editEventData?.tags || [''],

    // Step 2: Type & Location
    type: (editEventData?.type || 'virtual') as 'physical' | 'virtual',
    venue: editEventData?.venue || '',
    address: editEventData?.address || '',
    city: editEventData?.city || '',
    country: editEventData?.country || '',
    virtualLink: editEventData?.virtualLink || '',
    location: editEventData?.location || null as JobLocation | null,

    // Step 3: Date & Time
    startDate: editEventData?.startDate || '',
    startTime: editEventData?.startTime || '',
    endDate: editEventData?.endDate || '',
    endTime: editEventData?.endTime || '',

    // Step 4: Pricing & Capacity
    priceInPKR: editEventData?.priceInPKR || '',
    isFree: editEventData?.isFree !== undefined ? editEventData.isFree : true,
    maxCapacity: editEventData?.maxCapacity || '',

    // Step 5: Banner
    banner: editEventData?.banner || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Validate user profile on mount
  useEffect(() => {
    const validateUserProfile = async () => {
      if (!user?.uid) {
        toast.error('Please login to create an event');
        navigate('auth');
        return;
      }

      try {
        setIsValidatingProfile(true);
        const profile = await getUserProfile(user.uid);
        
        if (!profile) {
          toast.error('Profile not found. Please complete your profile first.');
          navigate('profile');
          return;
        }

        // Check required fields
        const missingFields: string[] = [];
        if (!profile.name) missingFields.push('Name');
        if (!profile.phone) missingFields.push('Phone Number');
        if (!profile.city) missingFields.push('City');

        if (missingFields.length > 0) {
          toast.error(
            `Please complete your profile first. Missing: ${missingFields.join(', ')}`,
            { duration: 5000 }
          );
          navigate('profile');
          return;
        }

        // Check for pending event requests (skip in edit mode)
        if (!isEditMode) {
          const userRequests = await getUserEventRequests(user.uid);
          const hasPendingRequest = userRequests.some(req => req.eventStatus === 'pending');
          
          if (hasPendingRequest) {
            toast.error(
              'You already have a pending event request. Please wait for it to be reviewed.',
              { duration: 5000 }
            );
            navigate('event-request-status');
            return;
          }
        }

        setUserProfile(profile);
        setIsValidatingProfile(false);
      } catch (error) {
        console.error('Error validating profile:', error);
        toast.error('Failed to validate profile. Please try again.');
        navigate('profile');
      }
    };

    validateUserProfile();
  }, [user, navigate]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim();
    
    if (!trimmedTag) {
      toast.error('Please enter a tag');
      return;
    }

    if (formData.tags.filter(tag => tag.trim()).length >= 5) {
      toast.error('Maximum 5 tags allowed');
      return;
    }

    if (formData.tags.some(tag => tag.trim() === trimmedTag)) {
      toast.error('Tag already exists');
      return;
    }

    setFormData(prev => ({ ...prev, tags: [...prev.tags.filter(t => t.trim()), trimmedTag] }));
    setTagInput('');
  };

  const handleTagKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({ 
      ...prev, 
      tags: prev.tags.filter(tag => tag !== tagToRemove) 
    }));
  };

  const handleAddCustomCategory = () => {
    const trimmedCategory = customCategory.trim();
    
    if (!trimmedCategory) {
      toast.error('Please enter a category name');
      return;
    }

    if (customCategories.length >= 5) {
      toast.error('Maximum 5 custom categories allowed');
      return;
    }

    if (predefinedCategories.includes(trimmedCategory) || customCategories.includes(trimmedCategory)) {
      toast.error('Category already exists');
      return;
    }

    setCustomCategories(prev => [...prev, trimmedCategory]);
    setFormData(prev => ({ ...prev, category: trimmedCategory }));
    setCustomCategory('');
    toast.success('Custom category added!');
  };

  const handleRemoveCustomCategory = (categoryToRemove: string) => {
    setCustomCategories(prev => prev.filter(cat => cat !== categoryToRemove));
    // If the removed category was selected, reset to first predefined category
    if (formData.category === categoryToRemove) {
      setFormData(prev => ({ ...prev, category: predefinedCategories[0] }));
    }
  };

  const handleCategoryKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddCustomCategory();
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPendingImage(reader.result as string);
        setShowImageCropper(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = (croppedImage: string) => {
    setFormData(prev => ({ ...prev, banner: croppedImage }));
    setShowImageCropper(false);
    setPendingImage('');
  };
  // Geocode address and show on map
  const handleGeocodeAddress = async () => {
    if (!formData.city || !formData.country) {
      toast.error('Please enter city and country first');
      return;
    }

    setIsGeocodingAddress(true);
    const address = formData.address || formData.venue || '';
    
    try {
      const result = await geocodeAddress(address, formData.city, formData.country);
      
      if (result.success && result.location) {
        setLocation(result.location);
        setFormData(prev => ({ ...prev, location: result.location }));
        toast.success('📍 Location confirmed! View map in step 2', {
          duration: 3000
        });
      } else {
        toast.error(result.error || 'Could not find location');
      }
    } catch (error) {
      toast.error('Failed to verify location');
    } finally {
      setIsGeocodingAddress(false);
    }
  };

  // Initialize Google Map
  const initializeGoogleMap = async (initialLocation?: JobLocation) => {
    if (!mapContainerRef.current) return;
    
    setIsLoadingMap(true);
    try {
      await loadGoogleMapsScript();
      const newMap = initializeMap(mapContainerRef.current, initialLocation);
      setMap(newMap);
      
      if (initialLocation) {
        const newMarker = addMarker(newMap, initialLocation, true, handleMarkerDragEnd);
        setMarker(newMarker);
      }
    } catch (error) {
      console.error('Failed to load Google Maps:', error);
      toast.error('Failed to load map. Please check your internet connection.');
    } finally {
      setIsLoadingMap(false);
    }
  };

  // Handle marker drag end
  const handleMarkerDragEnd = (newLocation: JobLocation) => {
    setLocation(newLocation);
    setFormData(prev => ({ ...prev, location: newLocation }));
    toast.success('Location updated');
  };

  // Load map only when reaching step 2 with physical type - ONCE
  useEffect(() => {
    if (currentStep === 2 && formData.type === 'physical' && formData.location?.latitude && !mapLoaded) {
      const checkAndInitMap = async () => {
        // Wait for ref to be available
        await new Promise(resolve => setTimeout(resolve, 400));

        if (!mapContainerRef.current) {
          console.error('Map container not available');
          setMapLoaded(true);
          return;
        }

        try {
          // Load Google Maps script if not already loaded
          if (!window.google || !window.google.maps) {
            await loadGoogleMapsScript();
          }

          // Wait a bit more for DOM to be ready
          await new Promise(resolve => setTimeout(resolve, 100));

          if (!mapContainerRef.current) {
            console.error('Map container not found');
            setMapLoaded(true);
            return;
          }

          const newMap = initializeMap(mapContainerRef.current, formData.location!);
          setMap(newMap);

          // Add draggable marker
          const newMarker = addMarker(newMap, formData.location!, true, handleMarkerDragEnd);
          setMarker(newMarker);
          setMapLoaded(true);
        } catch (error) {
          console.error('Map loading error:', error);
          toast.error('Map preview unavailable');
          setMapLoaded(true);
        }
      };

      checkAndInitMap();
    }

    // Cleanup function to properly remove map and marker when leaving step 2
    return () => {
      if (currentStep !== 2 && map) {
        try {
          if (marker) {
            marker.setMap(null);
          }
          // Clear the map container content before React unmounts it
          if (mapContainerRef.current) {
            mapContainerRef.current.innerHTML = '';
          }
        } catch (e) {
          console.error('Error cleaning up map:', e);
        }
        setMap(null);
        setMarker(null);
        setMapLoaded(false);
      }
    };
  }, [currentStep, formData.location?.latitude, formData.type]);

  // Auto-geocode when address fields change
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.city && formData.country && formData.type === 'physical') {
        handleGeocodeAddress();
      }
    }, 1000); // Debounce for 1 second

    return () => clearTimeout(timer);
  }, [formData.city, formData.country, formData.address, formData.venue]);

  // Calculate FOG price from PKR
  const calculateFogPrice = (pkrAmount: string): number => {
    if (!pkrAmount || isNaN(parseFloat(pkrAmount))) return 0;
    return parseFloat((parseFloat(pkrAmount) / fogConversionRate).toFixed(2));
  };
  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!formData.title.trim()) newErrors.title = 'Event title is required';
        if (!formData.description.trim()) newErrors.description = 'Description is required';
        if (formData.description.trim().length < 50) newErrors.description = 'Description must be at least 50 characters';
        break;
      case 2:
        if (formData.type === 'physical') {
          if (!formData.venue.trim()) newErrors.venue = 'Venue name is required';
          if (!formData.city.trim()) newErrors.city = 'City is required';
          if (!formData.country.trim()) newErrors.country = 'Country is required';
          if (!isValidLocation(formData.location)) {
            newErrors.location = 'Please verify location on map';
          }
        }
        if (formData.type === 'virtual') {
          if (!formData.virtualLink.trim()) newErrors.virtualLink = 'Virtual link is required';
        }
        break;
      case 3:
        if (!formData.startDate) newErrors.startDate = 'Start date is required';
        if (!formData.startTime) newErrors.startTime = 'Start time is required';
        if (!formData.endDate) newErrors.endDate = 'End date is required';
        if (!formData.endTime) newErrors.endTime = 'End time is required';
        
        // Validate that end date/time is after start date/time
        if (formData.startDate && formData.startTime && formData.endDate && formData.endTime) {
          const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
          const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`);
          
          if (endDateTime <= startDateTime) {
            newErrors.endDate = 'End date/time must be after start date/time';
          }
        }
        break;
      case 4:
        if (!formData.isFree && !formData.priceInPKR) newErrors.priceInPKR = 'Price is required for paid events';
        if (!formData.maxCapacity) newErrors.maxCapacity = 'Maximum capacity is required';
        if (formData.maxCapacity && parseInt(formData.maxCapacity) < 1) {
          newErrors.maxCapacity = 'Capacity must be at least 1';
        }
        break;
      case 5:
        if (!formData.banner) newErrors.banner = 'Event banner is required';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 5));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(5)) {
      return;
    }

    if (!userProfile || !user?.uid) {
      toast.error('User profile not found');
      return;
    }

    // Filter out empty tags
    const filteredTags = formData.tags.filter(tag => tag.trim() !== '');
    
    if (filteredTags.length === 0) {
      toast.error('Please add at least one tag');
      return;
    }

    try {
      setIsSubmitting(true);

      // Calculate FOG price
      const fogPrice = formData.isFree 
        ? 0 
        : parseFloat((parseFloat(formData.priceInPKR) / fogConversionRate).toFixed(2));

      const eventRequestData = {
        // User Information
        userId: user.uid,
        userName: userProfile.name || userProfile.displayName || '',
        userEmail: userProfile.email || user.email || '',
        userPhone: userProfile.phone || '',
        userProfile: userProfile.profilePicture || userProfile.photoURL || '',
        
        // Event Details
        title: formData.title,
        description: formData.description,
        category: formData.category,
        tags: filteredTags,
        
        // Event Type & Location
        type: formData.type,
        venue: formData.venue || undefined,
        address: formData.address || undefined,
        city: formData.city || undefined,
        country: formData.country || undefined,
        location: formData.location || undefined,
        virtualLink: formData.virtualLink || undefined,
        
        // Schedule
        startDate: formData.startDate,
        startTime: formData.startTime,
        endDate: formData.endDate || undefined,
        endTime: formData.endTime || undefined,
        
        // Pricing & Capacity
        priceInPKR: formData.priceInPKR,
        priceInFOG: fogPrice,
        isFree: formData.isFree,
        maxCapacity: formData.maxCapacity,
        
        // Banner
        banner: formData.banner,
      };

      if (isEditMode && editEventData?.id) {
        // Update existing event
        await updateActiveEvent(editEventData.id, {
          ...eventRequestData,
          priceInFOG: String(fogPrice), // Convert to string for ActiveEvent
          organizerId: editEventData.organizerId, // Preserve organizer
          eventStatus: editEventData.eventStatus, // Preserve status
          currentAttendees: editEventData.currentAttendees, // Preserve attendee count
        });
        
        toast.success('Event updated successfully!', {
          duration: 3000
        });
        
        // Navigate back to manage events
        setTimeout(() => {
          navigate('manage-events' as any);
        }, 1500);
      } else {
        // Create new event request
        const requestId = await createEventRequest(eventRequestData);
        
        toast.success('Event request submitted successfully! Awaiting admin approval.', {
          duration: 4000
        });

        // Navigate back to events page after short delay
        setTimeout(() => {
          navigate('events');
        }, 2000);
      }

    } catch (error) {
      console.error('Error submitting event request:', error);
      toast.error('Failed to submit event request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading while validating profile
  if (isValidatingProfile) {
    return (
      <div className="min-h-screen bg-page flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-teal-600 mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Validating your profile...</p>
        </div>
      </div>
    );
  }

  // Replace everything after the return statement with this code:

return (
  <div className="min-h-screen pt-24 pb-20" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('events')}
          className="flex items-center gap-2 text-sm font-bold transition-colors group px-4 py-2 rounded-full mb-6"
          style={{ color: 'var(--color-text-secondary)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--color-accent)';
            e.currentTarget.style.backgroundColor = 'var(--color-bg-tertiary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--color-text-secondary)';
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to Events
        </button>

        <div className="text-center mb-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-sm text-sm font-bold uppercase tracking-wider mb-4 shadow-sm"
            style={{
              backgroundColor: 'var(--color-bg-tertiary)',
              borderWidth: '1px',
              borderStyle: 'solid',
              borderColor: 'var(--color-border)',
              color: 'var(--color-accent)'
            }}
          >
            <Sparkles size={16} /> {isEditMode ? 'Edit Event' : 'Create Event'}
          </motion.div>
          <h1 className="text-5xl md:text-6xl font-extrabold mb-4 font-heading tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
            {isEditMode ? 'Update Your Event' : 'Host Your Event'}
          </h1>
          <p className="text-lg max-w-2xl mx-auto font-light leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
            {isEditMode 
              ? 'Update your event details. Changes will be reflected immediately.' 
              : 'Submit your event for review. Our team will verify and publish it within 24-48 hours.'}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="rounded-3xl p-6 shadow-xl" style={{ backgroundColor: 'var(--color-card)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--color-border)' }}>
          <div className="flex items-center justify-between mb-3">
            {[1, 2, 3, 4, 5].map((step) => (
              <div key={step} className="flex items-center flex-1">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm transition-all shadow-md"
                  style={{
                    backgroundColor: currentStep >= step ? 'var(--color-accent)' : 'var(--color-bg-tertiary)',
                    color: currentStep >= step ? 'var(--color-popup-text)' : 'var(--color-text-secondary)',
                    transform: currentStep >= step ? 'scale(1.1)' : 'scale(1)'
                  }}
                >
                  {currentStep > step ? <Check size={20} strokeWidth={3} /> : step}
                </div>
                {step < 5 && (
                  <div 
                    className="flex-1 h-1.5 mx-3 rounded-full transition-all"
                    style={{
                      backgroundColor: currentStep > step ? 'var(--color-accent)' : 'var(--color-bg-tertiary)'
                    }}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs font-bold uppercase tracking-wider mt-4">
            <span style={{ color: currentStep === 1 ? 'var(--color-accent)' : 'var(--color-text-secondary)' }}>Details</span>
            <span style={{ color: currentStep === 2 ? 'var(--color-accent)' : 'var(--color-text-secondary)' }}>Location</span>
            <span style={{ color: currentStep === 3 ? 'var(--color-accent)' : 'var(--color-text-secondary)' }}>Schedule</span>
            <span style={{ color: currentStep === 4 ? 'var(--color-accent)' : 'var(--color-text-secondary)' }}>Pricing</span>
            <span style={{ color: currentStep === 5 ? 'var(--color-accent)' : 'var(--color-text-secondary)' }}>Banner</span>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="rounded-3xl p-8 md:p-12 shadow-xl min-h-[500px]"
          style={{ backgroundColor: 'var(--color-card)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--color-border)' }}
        >
          
          {/* Step 1: Event Details */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-accent)' }}>
                  <MessageSquare size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Event Details</h2>
                  <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Tell us about your event</p>
                </div>
              </div>

              <div>
                <Label htmlFor="title">Event Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="e.g., Freelance Mastery Workshop 2024"
                  className={`mt-2 ${errors.title ? 'border-red-500' : ''}`}
                />
                {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe your event in detail. What will attendees learn or experience?"
                  rows={6}
                  className={`mt-2 ${errors.description ? 'border-red-500' : ''}`}
                />
                <div className="flex justify-between items-center mt-1">
                  {errors.description ? (
                    <p className="text-red-500 text-xs">{errors.description}</p>
                  ) : (
                    <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{formData.description.length} / 500 characters</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="category">Category *</Label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className="mt-2 w-full px-4 py-3 rounded-xl transition-all font-medium"
                  style={{
                    backgroundColor: 'var(--color-bg-primary)',
                    borderWidth: '1px',
                    borderStyle: 'solid',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text-primary)'
                  }}
                >
                  {predefinedCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                  {customCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                
                {/* Custom Category Input */}
                <div className="mt-3 p-4 rounded-xl" style={{ backgroundColor: 'var(--color-bg-secondary)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--color-border)' }}>
                  <p className="text-xs font-bold mb-2" style={{ color: 'var(--color-text-secondary)' }}>Add Custom Category</p>
                  <div className="flex gap-2">
                    <Input
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      onKeyPress={handleCategoryKeyPress}
                      placeholder="Type category name and press Enter"
                      className="flex-1 text-sm"
                    />
                    <Button
                      type="button"
                      onClick={handleAddCustomCategory}
                      size="sm"
                      style={{ backgroundColor: 'var(--color-accent)' }}
                      onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                      onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                    >
                      <Plus size={16} />
                    </Button>
                  </div>
                  
                  {/* Display Custom Categories as Chips */}
                  {customCategories.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs font-bold mb-2" style={{ color: 'var(--color-text-secondary)' }}>Custom Categories:</p>
                      <div className="flex flex-wrap gap-2">
                        {customCategories.map((cat) => (
                          <span
                            key={cat}
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold transition-all"
                            style={{
                              backgroundColor: 'var(--color-accent)',
                              color: 'var(--color-popup-text)'
                            }}
                          >
                            {cat}
                            <button
                              type="button"
                              onClick={() => handleRemoveCustomCategory(cat)}
                              className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
                            >
                              <X size={14} />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <Label>Tags (up to 5)</Label>
                <div className="mt-2 space-y-3">
                  {/* Tag Input */}
                  <div className="flex gap-2">
                    <Input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={handleTagKeyPress}
                      placeholder="Type tag and press Enter"
                      className="flex-1"
                      disabled={formData.tags.filter(t => t.trim()).length >= 5}
                    />
                    <Button
                      type="button"
                      onClick={handleAddTag}
                      size="sm"
                      disabled={formData.tags.filter(t => t.trim()).length >= 5}
                      style={{ backgroundColor: 'var(--color-accent)' }}
                      onMouseEnter={(e) => !e.currentTarget.disabled && (e.currentTarget.style.opacity = '0.9')}
                      onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                    >
                      <Plus size={16} />
                    </Button>
                  </div>
                  
                  {/* Display Tags as Chips */}
                  {formData.tags.filter(t => t.trim()).length > 0 && (
                    <div className="p-3 rounded-xl" style={{ backgroundColor: 'var(--color-bg-secondary)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--color-border)' }}>
                      <p className="text-xs font-bold mb-2" style={{ color: 'var(--color-text-secondary)' }}>Added Tags:</p>
                      <div className="flex flex-wrap gap-2">
                        {formData.tags.filter(t => t.trim()).map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold transition-all"
                            style={{
                              backgroundColor: 'var(--color-bg-tertiary)',
                              borderWidth: '1px',
                              borderStyle: 'solid',
                              borderColor: 'var(--color-accent)',
                              color: 'var(--color-text-primary)'
                            }}
                          >
                            <Tag size={14} style={{ color: 'var(--color-accent)' }} />
                            {tag}
                            <button
                              type="button"
                              onClick={() => removeTag(tag)}
                              className="hover:bg-red-100 rounded-full p-0.5 transition-colors"
                            >
                              <X size={14} style={{ color: 'var(--color-text-secondary)' }} />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                    {formData.tags.filter(t => t.trim()).length}/5 tags added
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Type & Location */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-accent)' }}>
                  <MapPin size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Event Type & Location</h2>
                  <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Where will it take place?</p>
                </div>
              </div>

              <div>
                <Label>Event Type *</Label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  {(['physical', 'virtual'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => handleInputChange('type', type)}
                      className="p-4 rounded-2xl font-bold capitalize transition-all text-center"
                      style={{
                        borderWidth: '2px',
                        borderStyle: 'solid',
                        borderColor: formData.type === type ? 'var(--color-accent)' : 'var(--color-border)',
                        backgroundColor: formData.type === type ? 'var(--color-bg-tertiary)' : 'transparent',
                        color: formData.type === type ? 'var(--color-accent)' : 'var(--color-text-secondary)'
                      }}
                    >
                      {type === 'physical' && <MapPin className="mx-auto mb-2" size={24} />}
                      {type === 'virtual' && <MonitorPlay className="mx-auto mb-2" size={24} />}
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {formData.type === 'physical' && (
                <>
                  <div>
                    <Label htmlFor="venue">Venue Name *</Label>
                    <Input
                      id="venue"
                      value={formData.venue}
                      onChange={(e) => handleInputChange('venue', e.target.value)}
                      placeholder="e.g., Convention Center Hall A"
                      className={`mt-2 ${errors.venue ? 'border-red-500' : ''}`}
                    />
                    {errors.venue && <p className="text-red-500 text-xs mt-1">{errors.venue}</p>}
                  </div>

                  <div>
                    <Label htmlFor="address">Street Address</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      placeholder="e.g., 123 Main Street"
                      className="mt-2"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        placeholder="e.g., Karachi"
                        className={`mt-2 ${errors.city ? 'border-red-500' : ''}`}
                      />
                      {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                    </div>
                    <div>
                      <Label htmlFor="country">Country *</Label>
                      <Input
                        id="country"
                        value={formData.country}
                        onChange={(e) => handleInputChange('country', e.target.value)}
                        placeholder="e.g., Pakistan"
                        className={`mt-2 ${errors.country ? 'border-red-500' : ''}`}
                      />
                      {errors.country && <p className="text-red-500 text-xs mt-1">{errors.country}</p>}
                    </div>
                  </div>

                  {/* Google Map Preview */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Location Verification</Label>
                      {isValidLocation(formData.location) && (
                        <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full" style={{ color: 'var(--color-success-fg)', backgroundColor: 'var(--color-success-bg)' }}>
                          <Check size={14} />
                          Verified
                        </span>
                      )}
                    </div>

                    <div
                      ref={mapContainerRef}
                      className="w-full h-[300px] rounded-2xl overflow-hidden transition-all"
                      style={{
                        borderWidth: '2px',
                        borderStyle: 'solid',
                        borderColor: errors.location ? '#EF4444' : 'var(--color-border)',
                        backgroundColor: isLoadingMap ? 'var(--color-bg-tertiary)' : 'var(--color-bg-secondary)'
                      }}
                    >
                      {isLoadingMap && (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-3" style={{ borderColor: 'var(--color-accent)' }}></div>
                            <p className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>Loading map...</p>
                          </div>
                        </div>
                      )}
                      {isGeocodingAddress && !isLoadingMap && (
                        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10">
                          <div className="text-center">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 mx-auto mb-2" style={{ borderColor: 'var(--color-accent)' }}></div>
                            <p className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>Finding location...</p>
                          </div>
                        </div>
                      )}
                    </div>
                    {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location}</p>}

                    <div className="border rounded-xl p-3 flex gap-2 text-xs" style={{ backgroundColor: 'var(--color-bg-tertiary)', borderColor: 'var(--color-accent)' }}>
                      <Info size={16} className="flex-shrink-0 mt-0.5" style={{ color: 'var(--color-accent)' }} />
                      <p style={{ color: 'var(--color-text-primary)' }}>
                        The map will auto-update as you type. Drag the marker to fine-tune the exact location.
                      </p>
                    </div>
                  </div>
                </>
              )}

              {formData.type === 'virtual' && (
                <div>
                  <Label htmlFor="virtualLink">Virtual Meeting Link *</Label>
                  <Input
                    id="virtualLink"
                    value={formData.virtualLink}
                    onChange={(e) => handleInputChange('virtualLink', e.target.value)}
                    placeholder="e.g., https://zoom.us/j/123456789"
                    className={`mt-2 ${errors.virtualLink ? 'border-red-500' : ''}`}
                  />
                  {errors.virtualLink && <p className="text-red-500 text-xs mt-1">{errors.virtualLink}</p>}
                  <p className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>Zoom, Google Meet, or custom streaming link</p>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Date & Time */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-accent)' }}>
                  <Calendar size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Schedule</h2>
                  <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>When will your event take place?</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="startDate">Start Date *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                    className={`mt-2 ${errors.startDate ? 'border-red-500' : ''}`}
                  />
                  {errors.startDate && <p className="text-red-500 text-xs mt-1">{errors.startDate}</p>}
                </div>

                <div>
                  <Label htmlFor="startTime">Start Time *</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => handleInputChange('startTime', e.target.value)}
                    className={`mt-2 ${errors.startTime ? 'border-red-500' : ''}`}
                  />
                  {errors.startTime && <p className="text-red-500 text-xs mt-1">{errors.startTime}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="endDate">End Date *</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                    className={`mt-2 ${errors.endDate ? 'border-red-500' : ''}`}
                  />
                  {errors.endDate && <p className="text-red-500 text-xs mt-1">{errors.endDate}</p>}
                </div>

                <div>
                  <Label htmlFor="endTime">End Time *</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => handleInputChange('endTime', e.target.value)}
                    className={`mt-2 ${errors.endTime ? 'border-red-500' : ''}`}
                  />
                  {errors.endTime && <p className="text-red-500 text-xs mt-1">{errors.endTime}</p>}
                </div>
              </div>

              <div className="border rounded-2xl p-4 flex gap-3" style={{ backgroundColor: 'var(--color-bg-tertiary)', borderColor: 'var(--color-accent)' }}>
                <Info size={20} className="flex-shrink-0 mt-0.5" style={{ color: 'var(--color-accent)' }} />
                <div className="text-sm" style={{ color: 'var(--color-text-primary)' }}>
                  <p className="font-bold mb-1">Pro Tip:</p>
                  <p>Events typically run better when scheduled between 2-4 hours. Consider your audience's timezone!</p>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Pricing & Capacity */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-accent)' }}>
                  <DollarSign size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Pricing & Capacity</h2>
                  <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Set ticket price and attendee limits</p>
                </div>
              </div>

              <div>
                <Label>Ticket Price</Label>
                <div className="mt-2 space-y-3">
                  <label 
                    className="flex items-center gap-3 p-4 rounded-2xl cursor-pointer transition-all"
                    style={{
                      borderWidth: '2px',
                      borderStyle: 'solid',
                      borderColor: formData.isFree ? 'var(--color-accent)' : 'var(--color-border)',
                      backgroundColor: formData.isFree ? 'var(--color-bg-tertiary)' : 'transparent'
                    }}
                  >
                    <input
                      type="radio"
                      checked={formData.isFree}
                      onChange={() => {
                        handleInputChange('isFree', true);
                        handleInputChange('priceInPKR', '');
                      }}
                      className="w-5 h-5"
                      style={{ accentColor: 'var(--color-accent)' }}
                    />
                    <div className="flex-1">
                      <p className="font-bold" style={{ color: 'var(--color-text-primary)' }}>Free Event</p>
                      <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>No ticket fee required</p>
                    </div>
                  </label>

                  <label 
                    className="flex items-center gap-3 p-4 rounded-2xl cursor-pointer transition-all"
                    style={{
                      borderWidth: '2px',
                      borderStyle: 'solid',
                      borderColor: !formData.isFree ? 'var(--color-accent)' : 'var(--color-border)',
                      backgroundColor: !formData.isFree ? 'var(--color-bg-tertiary)' : 'transparent'
                    }}
                  >
                    <input
                      type="radio"
                      checked={!formData.isFree}
                      onChange={() => handleInputChange('isFree', false)}
                      className="w-5 h-5"
                      style={{ accentColor: 'var(--color-accent)' }}
                    />
                    <div className="flex-1">
                      <p className="font-bold" style={{ color: 'var(--color-text-primary)' }}>Paid Event</p>
                      <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Charge in PKR (auto-converted to FOG coins)</p>
                    </div>
                  </label>
                </div>
              </div>

              {!formData.isFree && (
                <div>
                  <Label htmlFor="priceInPKR">Ticket Price in PKR *</Label>
                  <div className="relative mt-2">
                    <Input
                      id="priceInPKR"
                      type="number"
                      value={formData.priceInPKR}
                      onChange={(e) => handleInputChange('priceInPKR', e.target.value)}
                      placeholder="e.g., 500"
                      className={`pl-16 ${errors.priceInPKR ? 'border-red-500' : ''}`}
                    />
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold" style={{ color: 'var(--color-text-secondary)' }}>
                      PKR
                    </span>
                  </div>
                  {errors.priceInPKR && <p className="text-red-500 text-xs mt-1">{errors.priceInPKR}</p>}
                  
                  {/* FOG Conversion Display */}
                  {formData.priceInPKR && !isNaN(parseFloat(formData.priceInPKR)) && (
                    <div className="mt-3 p-4 rounded-xl" style={{ backgroundColor: 'var(--color-bg-tertiary)', borderWidth: '2px', borderStyle: 'solid', borderColor: 'var(--color-accent)' }}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-accent)' }}>
                            <span className="text-xs font-bold" style={{ color: 'var(--color-popup-text)' }}>FOG</span>
                          </div>
                          <div>
                            <p className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>Equivalent FOG Coins</p>
                            <p className="text-2xl font-bold" style={{ color: 'var(--color-accent)' }}>
                              {calculateFogPrice(formData.priceInPKR).toFixed(2)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Conversion Rate</p>
                          <p className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>1 FOG = ₨{fogConversionRate.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div>
                <Label htmlFor="maxCapacity">Maximum Attendees *</Label>
                <div className="relative mt-2">
                  <Input
                    id="maxCapacity"
                    type="number"
                    value={formData.maxCapacity}
                    onChange={(e) => handleInputChange('maxCapacity', e.target.value)}
                    placeholder="e.g., 100"
                    className={`pl-12 ${errors.maxCapacity ? 'border-red-500' : ''}`}
                  />
                  <Users size={20} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-secondary)' }} />
                  </div>
                  {errors.maxCapacity && <p className="text-red-500 text-xs mt-1">{errors.maxCapacity}</p>}
                  <p className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>Set a realistic capacity based on your venue/platform</p>
                </div>
              </div>
            )}

            {/* Step 5: Banner Image */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-accent)' }}>
                    <Upload size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Event Banner</h2>
                    <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Add a captivating banner image (16:9 ratio)</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {formData.banner ? (
                    <div className="relative group">
                      <div className="aspect-video rounded-2xl overflow-hidden" style={{ borderWidth: '2px', borderStyle: 'solid', borderColor: 'var(--color-border)' }}>
                        <img
                          src={formData.banner}
                          alt="Event banner preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleInputChange('banner', '')}
                        className="absolute top-4 right-4 p-2 bg-red-500 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="aspect-video rounded-2xl cursor-pointer flex flex-col items-center justify-center gap-4 transition-all"
                      style={{
                        borderWidth: '2px',
                        borderStyle: 'dashed',
                        borderColor: errors.banner ? '#EF4444' : 'var(--color-border)',
                        backgroundColor: errors.banner ? '#FEE2E2' : 'var(--color-bg-secondary)'
                      }}
                      onMouseEnter={(e) => {
                        if (!errors.banner) {
                          e.currentTarget.style.backgroundColor = 'var(--color-bg-tertiary)';
                          e.currentTarget.style.borderColor = 'var(--color-accent)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!errors.banner) {
                          e.currentTarget.style.backgroundColor = 'var(--color-bg-secondary)';
                          e.currentTarget.style.borderColor = 'var(--color-border)';
                        }
                      }}
                    >
                      <div className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg" style={{ backgroundColor: 'var(--color-card)' }}>
                        <Upload size={28} style={{ color: errors.banner ? '#EF4444' : 'var(--color-accent)' }} />
                      </div>
                      <div className="text-center">
                        <p className="font-bold mb-1" style={{ color: 'var(--color-text-primary)' }}>Click to upload banner image</p>
                        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>PNG, JPG up to 5MB • 16:9 aspect ratio recommended</p>
                      </div>
                    </div>
                  )}
                  {errors.banner && <p className="text-red-500 text-xs">{errors.banner}</p>}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                </div>

                <div className="border rounded-2xl p-4 flex gap-3" style={{ backgroundColor: '#FEF3C7', borderColor: '#FCD34D' }}>
                  <AlertCircle size={20} className="flex-shrink-0 mt-0.5" style={{ color: '#78350F' }} />
                  <div className="text-sm" style={{ color: '#78350F' }}>
                    <p className="font-bold mb-1">Image Guidelines:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Use high-quality images (1920x1080px recommended)</li>
                      <li>Avoid excessive text in the image</li>
                      <li>Ensure good contrast for readability</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center mt-8">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="px-8"
          >
            <ArrowLeft size={18} className="mr-2" />
            Previous
          </Button>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowPreview(true)}
              className="px-6"
            >
              <Eye size={18} className="mr-2" />
              Preview
            </Button>

            {currentStep < 5 ? (
              <Button onClick={nextStep} className="px-8">
                Next
                <ArrowRight size={18} className="ml-2" />
              </Button>
            ) : (
              <Button 
                onClick={handleSubmit} 
                disabled={isSubmitting}
                className="px-8 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: 'var(--color-accent)' }}
                onMouseEnter={(e) => !isSubmitting && (e.currentTarget.style.opacity = '0.9')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={18} className="mr-2 animate-spin" />
                    {isEditMode ? 'Updating...' : 'Submitting...'}
                  </>
                ) : (
                  <>
                    <Check size={18} className="mr-2" />
                    {isEditMode ? 'Update Event' : 'Submit for Review'}
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Image Cropper Modal */}
        {showImageCropper && pendingImage && (
          <ImageCropper
            imageSrc={pendingImage}
            onCropComplete={handleCropComplete}
            onCancel={() => {
              setShowImageCropper(false);
              setPendingImage('');
            }}
            aspectRatio={16 / 9}
          />
        )}
      </div>
    </div>
  );
};


export default CreateEventPage;
