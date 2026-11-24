import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowLeft, ArrowRight, Eye, Upload, Trash2, Plus, Minus, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Textarea } from '../ui/Textarea';
import { Badge } from '../ui/Badge';
import MultiSelectCategories from '../ui/MultiSelectCategories';
import ServicePreview from './ServicePreview';
import ImageCropModal from './ImageCropModal';
import { CreateServiceData, ServicePricing, ServiceFAQ, ServicePackage, UpdateServiceData } from '../../firebase/types/service';
import { createBrandService, getBrandServiceById, updateBrandService } from '../../firebase/services/brandServiceService';
import { compressImage, compressionPresets } from '../../utils/imageCompression';
import { toast } from 'react-hot-toast';

interface CreateServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  brandId: string;
  userId: string;
  onServiceCreated: () => void;
  editServiceId?: string | null;
}

const CreateServiceModal = ({ isOpen, onClose, brandId, userId, onServiceCreated, editServiceId }: CreateServiceModalProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [showPreview, setShowPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingService, setIsLoadingService] = useState(false);

  // Image Crop Modal States
  const [showMainImageCrop, setShowMainImageCrop] = useState(false);
  const [showThumbnailCrop, setShowThumbnailCrop] = useState(false);
  const [pendingMainImage, setPendingMainImage] = useState<File | null>(null);
  const [pendingThumbnailImage, setPendingThumbnailImage] = useState<File | null>(null);

  // Form Data
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    categories: string[];
    mainImage: File | null;
    thumbnailImages: File[];
    pricing: ServicePricing;
    faqs: ServiceFAQ[];
  }>({
    title: '',
    description: '',
    categories: [],
    mainImage: null,
    thumbnailImages: [],
    pricing: {
      type: 'fixed',
      packages: [{
        id: '1',
        name: 'Basic',
        price: 0,
        currency: 'PKR',
        features: [''],
        deliveryTime: '3 days'
      }]
    },
    faqs: []
  });

  // Image previews
  const [mainImagePreview, setMainImagePreview] = useState<string>('');
  const [thumbnailPreviews, setThumbnailPreviews] = useState<string[]>([]);

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Clear form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(1);
      setShowPreview(false);
      setFormData({
        title: '',
        description: '',
        categories: [],
        mainImage: null,
        thumbnailImages: [],
        pricing: {
          type: 'fixed',
          packages: [{
            id: '1',
            name: 'Basic',
            price: 0,
            currency: 'PKR',
            features: [''],
            deliveryTime: '3 days'
          }]
        },
        faqs: []
      });
      setMainImagePreview('');
      setThumbnailPreviews([]);
      setErrors({});
    }
  }, [isOpen]);

    // Cleanup object URLs when component unmounts or modal closes
  useEffect(() => {
    if (!isOpen) {
      // Clean up object URLs to prevent memory leaks
      if (mainImagePreview && mainImagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(mainImagePreview);
      }
      thumbnailPreviews.forEach(preview => {
        if (preview.startsWith('blob:')) {
          URL.revokeObjectURL(preview);
        }
      });
    }
  }, [isOpen]);

  // Final cleanup on component unmount
  useEffect(() => {
    return () => {
      // Clean up all object URLs when component unmounts
      if (mainImagePreview && mainImagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(mainImagePreview);
      }
      thumbnailPreviews.forEach(preview => {
        if (preview.startsWith('blob:')) {
          URL.revokeObjectURL(preview);
        }
      });
    };
  }, []);

  // Load existing service data when in edit mode
  useEffect(() => {
    const loadServiceData = async () => {
      if (isOpen && editServiceId) {
        setIsLoadingService(true);
        try {
          const service = await getBrandServiceById(editServiceId);
          if (service) {
            // Populate form data
            setFormData({
              title: service.title,
              description: service.description,
              categories: service.categories,
              mainImage: null, // We'll load from URL
              thumbnailImages: [], // We'll load from URLs
              pricing: service.pricing,
              faqs: service.faqs
            });

            // Set image previews from existing URLs
            if (service.mainImage) {
              setMainImagePreview(service.mainImage);
            }

            if (service.thumbnailImages && service.thumbnailImages.length > 0) {
              setThumbnailPreviews(service.thumbnailImages);
            }

            toast.success('Service loaded for editing');
          } else {
            toast.error('Service not found');
            onClose();
          }
        } catch (error) {
          console.error('Error loading service:', error);
          toast.error('Failed to load service data');
          onClose();
        } finally {
          setIsLoadingService(false);
        }
      }
    };

    loadServiceData();
  }, [isOpen, editServiceId]);

  // Save to localStorage for preview (excluding large image data)
  useEffect(() => {
    if (isOpen) {
      try {
        const previewData = {
          title: formData.title,
          description: formData.description,
          categories: formData.categories,
          pricing: formData.pricing,
          faqs: formData.faqs,
          // Store image info without the actual data
          hasMainImage: !!formData.mainImage,
          thumbnailCount: formData.thumbnailImages.length,
          mainImagePreview: mainImagePreview ? 'preview-available' : null,
          thumbnailPreviewCount: thumbnailPreviews.length
        };
        localStorage.setItem('servicePreviewData', JSON.stringify(previewData));
      } catch (error) {
        console.warn('Failed to save preview data to localStorage:', error);
        // If localStorage fails, continue without saving preview data
      }
    }
  }, [formData.title, formData.description, formData.categories, formData.pricing, formData.faqs, formData.mainImage, formData.thumbnailImages.length, mainImagePreview, thumbnailPreviews.length, isOpen]);

  const handleMainImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Clear any previous errors
    setErrors(prev => ({ ...prev, mainImage: '' }));

    // Basic validation
    if (!file.type.startsWith('image/')) {
      const errorMsg = 'Please select an image file';
      setErrors(prev => ({ ...prev, mainImage: errorMsg }));
      toast.error(errorMsg);
      e.target.value = ''; // Reset input
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      const errorMsg = 'Image size must be less than 10MB';
      setErrors(prev => ({ ...prev, mainImage: errorMsg }));
      toast.error(errorMsg);
      e.target.value = ''; // Reset input
      return;
    }

    // Open crop modal
    setPendingMainImage(file);
    setShowMainImageCrop(true);
    e.target.value = ''; // Reset input
  };

  const handleMainImageCropComplete = async (croppedFile: File) => {
    try {
      // Show compression toast
      const toastId = toast.loading('Compressing image...');
      
      // Compress the cropped image
      const compressedFile = await compressImage(croppedFile, compressionPresets.mainImage);
      
      const savedBytes = croppedFile.size - compressedFile.size;
      const savedPercentage = Math.round((savedBytes / croppedFile.size) * 100);
      
      toast.success(
        `Image ready! Compressed ${savedPercentage}% (${(croppedFile.size / 1024 / 1024).toFixed(2)}MB → ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB)`,
        { id: toastId, duration: 3000 }
      );
      
      setFormData(prev => ({ ...prev, mainImage: compressedFile }));
      
      // Use object URL for preview
      if (mainImagePreview && mainImagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(mainImagePreview);
      }
      setMainImagePreview(URL.createObjectURL(compressedFile));
      
      // Clear any previous errors on success
      setErrors(prev => ({ ...prev, mainImage: '' }));
      setPendingMainImage(null);
    } catch (error) {
      console.error('Image processing failed:', error);
      const errorMsg = 'Failed to process image. Please try again.';
      setErrors(prev => ({ ...prev, mainImage: errorMsg }));
      toast.error(errorMsg);
    }
  };

  const handleThumbnailChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (files.length === 0) return;

    // Clear any previous thumbnail errors
    setErrors(prev => ({ ...prev, thumbnails: '' }));

    // Check total count
    if (formData.thumbnailImages.length + files.length > 5) {
      const errorMsg = `Cannot add ${files.length} images. Maximum 5 thumbnails allowed (currently have ${formData.thumbnailImages.length})`;
      setErrors(prev => ({ ...prev, thumbnails: errorMsg }));
      toast.error(errorMsg);
      e.target.value = ''; // Reset input
      return;
    }

    // Validate file types and sizes
    const validFile = files[0]; // Process one at a time for cropping

    if (!validFile.type.startsWith('image/')) {
      toast.error(`${validFile.name} is not an image file`);
      e.target.value = '';
      return;
    }
    
    if (validFile.size > 10 * 1024 * 1024) {
      toast.error(`${validFile.name} is too large (max 10MB)`);
      e.target.value = '';
      return;
    }

    // Open crop modal for the first image
    setPendingThumbnailImage(validFile);
    setShowThumbnailCrop(true);
    e.target.value = ''; // Reset input
  };

  const handleThumbnailCropComplete = async (croppedFile: File) => {
    try {
      // Show compression toast
      const toastId = toast.loading('Compressing thumbnail...');
      
      // Compress the cropped thumbnail
      const compressedFile = await compressImage(croppedFile, compressionPresets.thumbnail);
      
      toast.success('Thumbnail ready!', { id: toastId, duration: 2000 });
      
      setFormData(prev => ({
        ...prev,
        thumbnailImages: [...prev.thumbnailImages, compressedFile]
      }));

      // Use object URL for preview
      const newPreview = URL.createObjectURL(compressedFile);
      setThumbnailPreviews(prev => [...prev, newPreview]);
      
      // Clear errors on success
      setErrors(prev => ({ ...prev, thumbnails: '' }));
      setPendingThumbnailImage(null);
    } catch (error) {
      console.error('Thumbnail processing failed:', error);
      const errorMsg = 'Failed to process thumbnail. Please try again.';
      setErrors(prev => ({ ...prev, thumbnails: errorMsg }));
      toast.error(errorMsg);
    }
  };

  const removeThumbnail = (index: number) => {
    // Revoke the object URL to free memory
    if (thumbnailPreviews[index] && thumbnailPreviews[index].startsWith('blob:')) {
      URL.revokeObjectURL(thumbnailPreviews[index]);
    }
    
    setFormData(prev => ({
      ...prev,
      thumbnailImages: prev.thumbnailImages.filter((_, i) => i !== index)
    }));
    setThumbnailPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) newErrors.title = 'Service title is required';
    if (!formData.description.trim()) newErrors.description = 'Service description is required';
    if (formData.categories.length === 0) newErrors.categories = 'At least one category is required';
    
    // Only require main image for new services, thumbnails are optional
    if (!editServiceId) {
      if (!formData.mainImage) newErrors.mainImage = 'Main service image is required';
      // Thumbnails are now optional - removed the validation
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};
    
    if (formData.pricing.type === 'contact') {
      // No validation needed for contact pricing
      return true;
    } else if (formData.pricing.type === 'hourly') {
      if (!formData.pricing.hourlyRate?.rate || formData.pricing.hourlyRate.rate <= 0) {
        newErrors.hourlyRate = 'Valid hourly rate is required';
      }
    } else {
      if (!formData.pricing.packages || formData.pricing.packages.length === 0) {
        newErrors.packages = 'At least one package is required';
      } else {
        formData.pricing.packages.forEach((pkg, index) => {
          if (!pkg.name.trim()) newErrors[`package${index}Name`] = 'Package name is required';
          if (pkg.price <= 0) newErrors[`package${index}Price`] = 'Valid package price is required';
          if (pkg.features.filter(f => f.trim()).length === 0) {
            newErrors[`package${index}Features`] = 'At least one feature is required';
          }
        });
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    let isValid = false;
    
    switch (currentStep) {
      case 1:
        isValid = validateStep1();
        break;
      case 2:
        isValid = validateStep2();
        break;
      default:
        isValid = true;
    }
    
    if (isValid) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    setErrors({});
  };

  const handleSubmit = async () => {
    if (!validateStep1() || !validateStep2()) {
      toast.error('Please fix all validation errors');
      return;
    }

    setIsSubmitting(true);
    
    // Show progress toast
    const toastId = toast.loading(editServiceId ? 'Updating service...' : 'Creating service...');

    try {
      if (editServiceId) {
        // Update existing service
        const updateData: UpdateServiceData = {
          title: formData.title.trim(),
          description: formData.description.trim(),
          categories: formData.categories,
          pricing: formData.pricing,
          faqs: formData.faqs.filter(faq => faq.question.trim() && faq.answer.trim())
        };

        // Only include new image files if they were changed
        if (formData.mainImage) {
          updateData.mainImageFile = formData.mainImage;
        }
        if (formData.thumbnailImages.length > 0) {
          updateData.thumbnailImageFiles = formData.thumbnailImages;
        }

        const result = await updateBrandService(editServiceId, userId, updateData);

        if (result.success) {
          toast.success('Service updated successfully!', { id: toastId });
          localStorage.removeItem('servicePreviewData');
          onServiceCreated();
          onClose();
        } else {
          toast.error(result.error || 'Failed to update service', { id: toastId });
        }
      } else {
        // Create new service
        // Validate image files before submission
        if (!formData.mainImage) {
          throw new Error('Main image is required');
        }

        const serviceData: CreateServiceData = {
          title: formData.title.trim(),
          description: formData.description.trim(),
          categories: formData.categories,
          mainImageFile: formData.mainImage,
          thumbnailImageFiles: formData.thumbnailImages,
          pricing: formData.pricing,
          faqs: formData.faqs.filter(faq => faq.question.trim() && faq.answer.trim())
        };

        // Update progress
        toast.loading('Uploading images...', { id: toastId });
        
        const result = await createBrandService(userId, brandId, serviceData);

        if (result.success) {
          toast.success('Service created successfully!', { id: toastId });
          localStorage.removeItem('servicePreviewData');
          
          // Reset form
          setFormData({
            title: '',
            description: '',
            categories: [],
            mainImage: null,
            thumbnailImages: [],
            pricing: {
              type: 'fixed',
              packages: [{
                id: '1',
                name: 'Basic',
                price: 0,
                currency: 'PKR',
                features: [''],
                deliveryTime: '3 days'
              }]
            },
            faqs: []
          });
          setMainImagePreview('');
          setThumbnailPreviews([]);
          setCurrentStep(1);
          
          onServiceCreated();
          onClose();
        } else {
          toast.error(result.error || 'Failed to create service', { id: toastId });
        }
      }
    } catch (error) {
      console.error('Error submitting service:', error);
      toast.error(editServiceId ? 'Failed to update service' : 'Failed to create service', { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const addPackage = () => {
    if (formData.pricing.packages && formData.pricing.packages.length < 3) {
      const newPackage: ServicePackage = {
        id: Date.now().toString(),
        name: '',
        price: 0,
        currency: 'PKR',
        features: [''],
        deliveryTime: '3 days'
      };
      
      setFormData(prev => ({
        ...prev,
        pricing: {
          ...prev.pricing,
          packages: [...(prev.pricing.packages || []), newPackage]
        }
      }));
    }
  };

  const removePackage = (packageId: string) => {
    setFormData(prev => ({
      ...prev,
      pricing: {
        ...prev.pricing,
        packages: prev.pricing.packages?.filter(pkg => pkg.id !== packageId) || []
      }
    }));
  };

  const updatePackage = (packageId: string, updates: Partial<ServicePackage>) => {
    setFormData(prev => ({
      ...prev,
      pricing: {
        ...prev.pricing,
        packages: prev.pricing.packages?.map(pkg => 
          pkg.id === packageId ? { ...pkg, ...updates } : pkg
        ) || []
      }
    }));
  };

  const addFAQ = () => {
    const newFAQ: ServiceFAQ = {
      id: Date.now().toString(),
      question: '',
      answer: ''
    };
    setFormData(prev => ({
      ...prev,
      faqs: [...prev.faqs, newFAQ]
    }));
  };

  const removeFAQ = (faqId: string) => {
    setFormData(prev => ({
      ...prev,
      faqs: prev.faqs.filter(faq => faq.id !== faqId)
    }));
  };

  const updateFAQ = (faqId: string, updates: Partial<ServiceFAQ>) => {
    setFormData(prev => ({
      ...prev,
      faqs: prev.faqs.map(faq => 
        faq.id === faqId ? { ...faq, ...updates } : faq
      )
    }));
  };

  if (!isOpen) return null;

  if (showPreview) {
    return (
      <ServicePreview 
        onClose={() => setShowPreview(false)}
        onBack={() => setShowPreview(false)}
      />
    );
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-[--color-card] rounded-xl max-w-4xl w-full max-h-[95vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-[--color-border]">
            <h2 className="text-2xl font-bold text-[--color-text-primary]">
              {editServiceId ? 'Edit Service' : 'Create New Service'}
            </h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X size={20} />
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="px-6 py-4 border-b border-[--color-border]">
            <div className="flex items-center gap-4">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep >= step 
                      ? 'bg-[--color-primary] text-white' 
                      : 'bg-[--color-bg-tertiary] text-[--color-text-secondary]'
                  }`}>
                    {step}
                  </div>
                  {step < 3 && (
                    <div className={`w-16 h-1 mx-2 ${
                      currentStep > step ? 'bg-[--color-primary]' : 'bg-[--color-border]'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between text-sm text-[--color-text-secondary] mt-2">
              <span>Service Details</span>
              <span>Pricing</span>
              <span>FAQs</span>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              {isLoadingService ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[--color-primary] mx-auto mb-4"></div>
                    <p className="text-[--color-text-secondary]">Loading service data...</p>
                  </div>
                </div>
              ) : (
              <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="service-title">Service Title *</Label>
                      <Input
                        id="service-title"
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="e.g., Professional Logo Design"
                        className={errors.title ? 'border-red-500' : ''}
                      />
                      {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="service-description">Service Description *</Label>
                      <Textarea
                        id="service-description"
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Describe your service in detail..."
                        rows={6}
                        className={errors.description ? 'border-red-500' : ''}
                      />
                      {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label>Service Categories *</Label>
                      <MultiSelectCategories
                        selectedCategories={formData.categories}
                        onCategoriesChange={(categories) => 
                          setFormData(prev => ({ ...prev, categories }))
                        }
                      />
                      {errors.categories && <p className="text-sm text-red-500">{errors.categories}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label>Main Service Image *</Label>
                      <p className="text-xs text-[--color-text-secondary]">
                        Upload any image - you'll be able to crop it to 4:3 ratio • Max size: 10MB
                      </p>
                      <div className="border-2 border-dashed border-[--color-border] rounded-lg p-6">
                        {mainImagePreview ? (
                          <div className="relative">
                            <img 
                              src={mainImagePreview} 
                              alt="Main service" 
                              className="w-full h-48 object-cover rounded-lg"
                            />
                            <Badge className="absolute top-2 left-2 bg-green-500">4:3 ✓</Badge>
                            <Button
                              variant="outline"
                              size="sm"
                              className="absolute top-2 right-2"
                              onClick={() => {
                                setFormData(prev => ({ ...prev, mainImage: null }));
                                setMainImagePreview('');
                                setErrors(prev => ({ ...prev, mainImage: '' }));
                              }}
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        ) : (
                          <label className="cursor-pointer flex flex-col items-center gap-2">
                            <Upload size={24} className="text-[--color-text-secondary]" />
                            <span className="text-sm text-[--color-text-secondary]">
                              Click to upload & crop main image
                            </span>
                            <span className="text-xs text-[--color-text-secondary]">
                              You'll be able to crop to 4:3 ratio after upload
                            </span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleMainImageChange}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>
                      {errors.mainImage && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                          <p className="text-sm text-red-600 dark:text-red-400 font-medium">❌ {errors.mainImage}</p>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Thumbnail Images (0-5 images) - Optional</Label>
                      <p className="text-xs text-[--color-text-secondary]">
                        Upload any images - you'll be able to crop each to 4:3 ratio • Max size: 10MB each
                      </p>
                      <div className="grid grid-cols-3 gap-4">
                        {thumbnailPreviews.map((preview, index) => (
                          <div key={index} className="relative">
                            <img 
                              src={preview} 
                              alt={`Thumbnail ${index + 1}`} 
                              className="w-full h-24 object-cover rounded-lg"
                            />
                            <Badge className="absolute top-1 left-1 bg-green-500 text-xs px-1 py-0">4:3 ✓</Badge>
                            <Button
                              variant="outline"
                              size="sm"
                              className="absolute top-1 right-1 p-1"
                              onClick={() => removeThumbnail(index)}
                            >
                              <Trash2 size={12} />
                            </Button>
                          </div>
                        ))}
                        
                        {thumbnailPreviews.length < 5 && (
                          <label className="cursor-pointer border-2 border-dashed border-[--color-border] rounded-lg h-24 flex flex-col items-center justify-center gap-1">
                            <Plus size={20} className="text-[--color-text-secondary]" />
                            <span className="text-[10px] text-[--color-text-secondary] text-center px-1">Add & Crop</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleThumbnailChange}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>
                      {errors.thumbnails && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                          <p className="text-sm text-red-600 dark:text-red-400 font-medium">❌ {errors.thumbnails}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <Label>Pricing Type</Label>
                      <div className="flex flex-wrap gap-3">
                        <Button
                          variant={formData.pricing.type === 'hourly' ? 'default' : 'outline'}
                          onClick={() => setFormData(prev => ({
                            ...prev,
                            pricing: {
                              type: 'hourly',
                              hourlyRate: {
                                rate: 0,
                                currency: 'PKR',
                                minimumHours: 1
                              }
                            }
                          }))}
                          className="flex-1 min-w-[140px]"
                        >
                          Hourly Rate
                        </Button>
                        <Button
                          variant={formData.pricing.type === 'fixed' ? 'default' : 'outline'}
                          onClick={() => setFormData(prev => ({
                            ...prev,
                            pricing: {
                              type: 'fixed',
                              packages: [{
                                id: '1',
                                name: 'Basic',
                                price: 0,
                                currency: 'PKR',
                                features: [''],
                                deliveryTime: '3 days'
                              }]
                            }
                          }))}
                          className="flex-1 min-w-[140px]"
                        >
                          Fixed Packages
                        </Button>
                        <Button
                          variant={formData.pricing.type === 'contact' ? 'default' : 'outline'}
                          onClick={() => setFormData(prev => ({
                            ...prev,
                            pricing: {
                              type: 'contact'
                            }
                          }))}
                          className="flex-1 min-w-[140px]"
                        >
                          Contact for Pricing
                        </Button>
                      </div>
                    </div>

                    {formData.pricing.type === 'contact' ? (
                      <Card className="border-2 border-[--color-primary]">
                        <CardContent className="p-6 text-center">
                          <div className="mb-4">
                            <div className="w-16 h-16 rounded-full bg-[--color-primary]/10 flex items-center justify-center mx-auto mb-3">
                              <MessageSquare className="w-8 h-8 text-[--color-primary]" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Contact for Custom Pricing</h3>
                            <p className="text-[--color-text-secondary]">
                              Customers will need to message you directly to discuss pricing and project details. 
                              This is perfect for services that require custom quotes based on specific requirements.
                            </p>
                          </div>
                          {/* <div className="bg-[--color-bg-secondary] rounded-lg p-4 text-left">
                            <p className="text-sm font-semibold mb-2">When to use this option:</p>
                            <ul className="text-sm text-[--color-text-secondary] space-y-1">
                              <li>• Projects with variable scope</li>
                              <li>• Enterprise-level services</li>
                              <li>• Consultation-based offerings</li>
                              <li>• Custom or bespoke solutions</li>
                            </ul>
                          </div> */}
                        </CardContent>
                      </Card>
                    ) : formData.pricing.type === 'hourly' ? (
                      <Card>
                        <CardHeader>
                          <CardTitle>Hourly Rate</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Rate per Hour</Label>
                              <Input
                                type="number"
                                value={formData.pricing.hourlyRate?.rate || 0}
                                onChange={(e) => setFormData(prev => ({
                                  ...prev,
                                  pricing: {
                                    ...prev.pricing,
                                    hourlyRate: {
                                      ...prev.pricing.hourlyRate!,
                                      rate: parseInt(e.target.value) || 0
                                    }
                                  }
                                }))}
                                placeholder="1000"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Minimum Hours</Label>
                              <Input
                                type="number"
                                value={formData.pricing.hourlyRate?.minimumHours || 1}
                                onChange={(e) => setFormData(prev => ({
                                  ...prev,
                                  pricing: {
                                    ...prev.pricing,
                                    hourlyRate: {
                                      ...prev.pricing.hourlyRate!,
                                      minimumHours: parseInt(e.target.value) || 1
                                    }
                                  }
                                }))}
                                placeholder="1"
                              />
                            </div>
                          </div>
                          {errors.hourlyRate && <p className="text-sm text-red-500">{errors.hourlyRate}</p>}
                        </CardContent>
                      </Card>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold">Service Packages</h3>
                          {(formData.pricing.packages?.length || 0) < 3 && (
                            <Button onClick={addPackage} size="sm">
                              <Plus size={16} className="mr-2" />
                              Add Package
                            </Button>
                          )}
                        </div>

                        {formData.pricing.packages?.map((pkg, index) => (
                          <Card key={pkg.id}>
                            <CardHeader className="flex flex-row items-center justify-between">
                              <CardTitle className="text-base">
                                Package {index + 1}
                              </CardTitle>
                              {formData.pricing.packages!.length > 1 && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => removePackage(pkg.id)}
                                >
                                  <Trash2 size={16} />
                                </Button>
                              )}
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label>Package Name</Label>
                                  <Input
                                    value={pkg.name}
                                    onChange={(e) => updatePackage(pkg.id, { name: e.target.value })}
                                    placeholder="e.g., Basic, Standard, Premium"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Price (PKR)</Label>
                                  <Input
                                    type="number"
                                    value={pkg.price}
                                    onChange={(e) => updatePackage(pkg.id, { price: parseInt(e.target.value) || 0 })}
                                    placeholder="5000"
                                  />
                                </div>
                              </div>
                              
                              <div className="space-y-2">
                                <Label>Delivery Time</Label>
                                <Input
                                  value={pkg.deliveryTime}
                                  onChange={(e) => updatePackage(pkg.id, { deliveryTime: e.target.value })}
                                  placeholder="e.g., 3 days, 1 week"
                                />
                              </div>

                              <div className="space-y-2">
                                <Label>Features Included</Label>
                                {pkg.features.map((feature, featureIndex) => (
                                  <div key={featureIndex} className="flex gap-2">
                                    <Input
                                      value={feature}
                                      onChange={(e) => {
                                        const newFeatures = [...pkg.features];
                                        newFeatures[featureIndex] = e.target.value;
                                        updatePackage(pkg.id, { features: newFeatures });
                                      }}
                                      placeholder="e.g., Logo design, Business card design"
                                    />
                                    {pkg.features.length > 1 && (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                          const newFeatures = pkg.features.filter((_, i) => i !== featureIndex);
                                          updatePackage(pkg.id, { features: newFeatures });
                                        }}
                                      >
                                        <Minus size={16} />
                                      </Button>
                                    )}
                                  </div>
                                ))}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => updatePackage(pkg.id, { features: [...pkg.features, ''] })}
                                >
                                  <Plus size={16} className="mr-2" />
                                  Add Feature
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        )) || []}
                      </div>
                    )}
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Frequently Asked Questions</h3>
                      <Button onClick={addFAQ} size="sm">
                        <Plus size={16} className="mr-2" />
                        Add FAQ
                      </Button>
                    </div>

                    {formData.faqs.length === 0 ? (
                      <div className="text-center py-8 text-[--color-text-secondary]">
                        <p>No FAQs added yet. Click "Add FAQ" to get started.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {formData.faqs.map((faq, index) => (
                          <Card key={faq.id}>
                            <CardHeader className="flex flex-row items-center justify-between">
                              <CardTitle className="text-base">FAQ {index + 1}</CardTitle>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => removeFAQ(faq.id)}
                              >
                                <Trash2 size={16} />
                              </Button>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div className="space-y-2">
                                <Label>Question</Label>
                                <Input
                                  value={faq.question}
                                  onChange={(e) => updateFAQ(faq.id, { question: e.target.value })}
                                  placeholder="What is included in this service?"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Answer</Label>
                                <Textarea
                                  value={faq.answer}
                                  onChange={(e) => updateFAQ(faq.id, { answer: e.target.value })}
                                  placeholder="Provide a detailed answer..."
                                  rows={3}
                                />
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
            )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex-shrink-0 flex items-center justify-between p-6 border-t border-[--color-border] bg-[--color-card]">
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleBack} disabled={currentStep === 1 || isSubmitting}>
                <ArrowLeft size={16} className="mr-2" />
                Back
              </Button>
              
              <Button variant="outline" onClick={() => setShowPreview(true)} disabled={isSubmitting}>
                <Eye size={16} className="mr-2" />
                Preview
              </Button>
            </div>

            <div className="flex gap-2">
              {currentStep < 3 ? (
                <Button onClick={handleNext} disabled={isSubmitting}>
                  Next
                  <ArrowRight size={16} className="ml-2" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {editServiceId ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    editServiceId ? 'Update Service' : 'Create Service'
                  )}
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Image Crop Modals */}
      {pendingMainImage && (
        <ImageCropModal
          isOpen={showMainImageCrop}
          onClose={() => {
            setShowMainImageCrop(false);
            setPendingMainImage(null);
          }}
          imageFile={pendingMainImage}
          onCropComplete={handleMainImageCropComplete}
          aspectRatio={16 / 9}
          title="Crop Main Service Image"
        />
      )}

      {pendingThumbnailImage && (
        <ImageCropModal
          isOpen={showThumbnailCrop}
          onClose={() => {
            setShowThumbnailCrop(false);
            setPendingThumbnailImage(null);
          }}
          imageFile={pendingThumbnailImage}
          onCropComplete={handleThumbnailCropComplete}
          aspectRatio={16 / 9}
          title="Crop Thumbnail Image"
        />
      )}
    </AnimatePresence>
  );
};

export default CreateServiceModal;