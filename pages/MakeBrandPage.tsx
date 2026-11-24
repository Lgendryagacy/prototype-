import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { type Route } from '../types';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Textarea } from '../components/ui/Textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Alert } from '../components/ui/Alert';
import MultiSelectCategories from '../components/ui/MultiSelectCategories';
import { ArrowLeft, Check, UploadCloud, Link as LinkIcon, Edit2, FileText } from 'lucide-react';
import { useBrand } from '../firebase/hooks/useBrand';
import { toast } from 'react-hot-toast';
import { User } from '../firebase/types/user';

const steps = [
    { id: 1, name: 'Brand Identity', icon: Edit2 },
    { id: 2, name: 'Brand Story', icon: FileText },
    { id: 3, name: 'Connect', icon: LinkIcon },
];

interface MakeBrandPageProps {
    navigate: (route: Route, context?: any) => void;
    user?: User | null;
    isLoggedIn?: boolean;
}

const MakeBrandPage = ({ navigate, user, isLoggedIn }: MakeBrandPageProps) => {
    const [step, setStep] = useState(1);
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        brandName: '',
        tagline: '',
        description: '',
        whatsappChannel: '',
    });
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [errors, setErrors] = useState<{
        brandName?: string;
        tagline?: string;
        description?: string;
        whatsappChannel?: string;
        categories?: string;
        logo?: string;
    }>({});

    const { submitBrandRequest, canCreateBrand, loading, brandRequest } = useBrand(user?.uid);

    // Check authentication and permissions
    useEffect(() => {
        if (!user || !isLoggedIn) {
            toast.error('Please login to create a brand');
            navigate('auth');
            return;
        }

        if (!loading && !canCreateBrand()) {
            // Check if user is permanently banned
            if (brandRequest?.status === 'rejected' && brandRequest?.canResubmit === false) {
                toast.error('You are permanently banned from creating brand requests');
            } else {
                toast.error('You already have a brand request or approved brand');
            }
            navigate('fog-services');
            return;
        }
    }, [user, isLoggedIn, loading, canCreateBrand, brandRequest, navigate]);

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                toast.error('Please select an image file');
                return;
            }

            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Image size should be less than 5MB');
                return;
            }

            setLogoFile(file);

            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setLogoPreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    // Validation functions
    const validateStep1 = () => {
        const newErrors: typeof errors = {};
        if (!logoFile) {
            newErrors.logo = 'Logo is required';
        } else if (!formData.brandName.trim()) {
            newErrors.brandName = 'Brand name is required';
        } else if (formData.brandName.trim().length < 2) {
            newErrors.brandName = 'Brand name must be at least 2 characters';
        } else if (formData.brandName.trim().length > 50) {
            newErrors.brandName = 'Brand name must not exceed 50 characters';
        }

        if (!formData.tagline.trim()) {
            newErrors.tagline = 'Tagline is required';
        } else if (formData.tagline.trim().length < 10) {
            newErrors.tagline = 'Tagline must be at least 10 characters';
        } else if (formData.tagline.trim().length > 100) {
            newErrors.tagline = 'Tagline must not exceed 100 characters';
        }

        if (selectedCategories.length === 0) {
            newErrors.categories = 'Please select at least one category';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateStep2 = () => {
        const newErrors: typeof errors = {};

        if (!formData.description.trim()) {
            newErrors.description = 'Brand description is required';
        } else if (formData.description.trim().length < 50) {
            newErrors.description = 'Description must be at least 50 characters';
        } else if (formData.description.trim().length > 1000) {
            newErrors.description = 'Description must not exceed 1000 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateStep3 = () => {
        const newErrors: typeof errors = {};

        // WhatsApp channel is now optional, but if provided, validate the format
        if (formData.whatsappChannel.trim()) {
            const whatsappPattern = /^https:\/\/(wa\.me\/|whatsapp\.com\/channel\/|chat\.whatsapp\.com\/)/;
            if (!whatsappPattern.test(formData.whatsappChannel.trim())) {
                newErrors.whatsappChannel = 'Please enter a valid WhatsApp channel link';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateCurrentStep = () => {
        switch (step) {
            case 1: return validateStep1();
            case 2: return validateStep2();
            case 3: return validateStep3();
            default: return true;
        }
    };

    const handleNext = () => {
        if (validateCurrentStep()) {
            setStep(s => Math.min(s + 1, 3));
        }
    };

    const handleBack = () => {
        setErrors({});  // Clear errors when going back
        setStep(s => Math.max(s - 1, 1));
    };

    const handleCreate = async () => {
        if (!user) {
            toast.error('Please login to create a brand');
            navigate('auth');
            return;
        }

        // Validate all steps before submission
        if (!validateStep1() || !validateStep2() || !validateStep3()) {
            toast.error('Please fix all validation errors before submitting');
            return;
        }

        setIsSubmitting(true);

        try {
            const result = await submitBrandRequest({
                brandName: formData.brandName,
                tagline: formData.tagline,
                description: formData.description,
                whatsappChannel: formData.whatsappChannel,
                logoFile: logoFile || undefined,
                categories: selectedCategories
            });

            if (result.success) {
                toast.success('Brand request submitted successfully! Please wait for admin approval.');
                navigate('brand-dashboard');
            } else {
                toast.error(result.error || 'Failed to submit brand request');
            }
        } catch (error) {
            console.error('Error creating brand:', error);
            toast.error('Failed to submit brand request. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Show loading while checking permissions
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
                <div className="text-center relative z-10">
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

    return (
        <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
            {/* Animated gradient backgrounds that scroll with the page */}
            <motion.div
                className="absolute w-[500px] h-[500px] rounded-full opacity-50 blur-[80px] pointer-events-none"
                style={{
                    background: 'radial-gradient(circle, var(--color-primary) 0%, transparent 70%)',
                    top: '-10%',
                    left: '10%'
                }}
                animate={{
                    x: [0, 50, -30, 40, 0],
                    y: [0, -50, 30, 20, 0],
                    scale: [1, 1.1, 0.9, 1.05, 1]
                }}
                transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
            />

            <motion.div
                className="absolute w-[400px] h-[400px] rounded-full opacity-50 blur-[80px] pointer-events-none"
                style={{
                    background: 'radial-gradient(circle, var(--color-accent) 0%, transparent 70%)',
                    top: '20%',
                    right: '15%'
                }}
                animate={{
                    x: [0, -40, 30, -20, 0],
                    y: [0, 40, -30, 20, 0],
                    scale: [1, 0.9, 1.1, 0.95, 1]
                }}
                transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut', delay: 5 }}
            />

            <motion.div
                className="absolute w-[350px] h-[350px] rounded-full opacity-40 blur-[80px] pointer-events-none"
                style={{
                    background: 'radial-gradient(circle, rgb(139, 92, 246) 0%, transparent 70%)',
                    bottom: '10%',
                    left: '20%'
                }}
                animate={{
                    x: [0, 30, -40, 25, 0],
                    y: [0, -30, 40, -15, 0],
                    scale: [1, 1.05, 0.9, 1.1, 1]
                }}
                transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut', delay: 10 }}
            />

            <div className="container mx-auto px-4 py-8 pt-24 relative z-10">
                <div className="max-w-4xl mx-auto">
                    {/* Back Button with Glass Effect */}
                    <motion.button
                        onClick={() => navigate('make-brand-request')}
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
                        Back to Brand Request
                    </motion.button>

                    {/* Header */}
                    <div className="mb-12">
                        <h1 className="text-5xl font-black mb-4" style={{ letterSpacing: '-0.02em', color: 'var(--color-text-primary)' }}>
                            Create Your Service Brand
                        </h1>
                        <p className="text-xl" style={{ color: 'var(--color-text-secondary)' }}>
                            Follow the steps to set up your professional brand on FOGSLY
                        </p>
                    </div>

                    {/* Step Progress Indicator */}
                    <div className="mb-14 relative">
                        <div className="absolute top-6 left-0 right-0 h-0.5 rounded-full" style={{ backgroundColor: 'var(--color-border)' }} />
                        <motion.div
                            className="absolute top-6 left-0 h-0.5 rounded-full"
                            style={{
                                width: `${((step - 1) / 2) * 100}%`,
                                background: `linear-gradient(to right, var(--color-primary), var(--color-accent))`,
                            }}
                            initial={{ width: 0 }}
                            animate={{ width: `${((step - 1) / 2) * 100}%` }}
                            transition={{ duration: 0.5, ease: 'easeInOut' }}
                        />

                        <div className="relative z-10 flex justify-between">
                            {steps.map((s) => {
                                const Icon = s.icon;
                                const isCompleted = step > s.id;
                                const isCurrent = step === s.id;

                                return (
                                    <div key={s.id} className="flex flex-col items-center">
                                        <motion.div
                                            className="w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300"
                                            style={{
                                                backgroundColor: isCompleted || isCurrent ? 'var(--color-primary)' : 'var(--color-bg-secondary)',
                                                borderColor: isCompleted || isCurrent ? 'var(--color-primary)' : 'var(--color-border)',
                                                color: isCompleted || isCurrent ? 'white' : 'var(--color-text-secondary)'
                                            }}
                                            whileHover={{ scale: 1.1 }}
                                        >
                                            {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                                        </motion.div>
                                        <span className="mt-3 text-sm font-semibold text-center" style={{ color: isCurrent ? 'var(--color-primary)' : 'var(--color-text-secondary)' }}>
                                            {s.name}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Main Glass Card */}
                    <motion.div
                        className="backdrop-blur-xl bg-white/10 dark:bg-black/10 border border-white/20 dark:border-white/10 rounded-3xl shadow-2xl p-8 md:p-12"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={step}
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -50 }}
                                transition={{ duration: 0.3 }}
                            >
                                {step === 1 && (
                                    <div className="space-y-6">
                                        <div className="text-center">
                                            <label htmlFor="logo-upload" className="mx-auto cursor-pointer flex w-32 h-32 items-center justify-center rounded-full bg-[--color-bg-secondary] border-2 border-dashed border-[--color-border] hover:border-[--color-primary] transition-colors">
                                                {logoPreview ? (
                                                    <img src={logoPreview} alt="Logo preview" className="w-full h-full rounded-full object-cover" />
                                                ) : (
                                                    <div className="text-center">
                                                        <UploadCloud className="mx-auto h-8 w-8 text-[--color-text-secondary]" />
                                                        <p className="mt-1 text-xs text-[--color-text-secondary]">Upload Logo</p>
                                                    </div>
                                                )}
                                                <input id="logo-upload" type="file" accept="image/*" onChange={handleLogoChange} className="sr-only" />
                                            </label>
                                            {errors.logo && <p className="text-sm text-red-500 mt-2">{errors.logo}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="brand-name" style={{ color: 'var(--color-text-primary)' }}>Brand Name *</Label>
                                            <Input
                                                id="brand-name"
                                                value={formData.brandName}
                                                onChange={e => {
                                                    setFormData({ ...formData, brandName: e.target.value });
                                                    if (errors.brandName) {
                                                        setErrors({ ...errors, brandName: undefined });
                                                    }
                                                }}
                                                placeholder="e.g., Creative Wizards"
                                                className={errors.brandName ? 'border-red-500 focus:border-red-500' : ''}
                                            />
                                            {errors.brandName && <p className="text-sm text-red-500">{errors.brandName}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="brand-tagline" style={{ color: 'var(--color-text-primary)' }}>Tagline *</Label>
                                            <Input
                                                id="brand-tagline"
                                                value={formData.tagline}
                                                onChange={e => {
                                                    setFormData({ ...formData, tagline: e.target.value });
                                                    if (errors.tagline) {
                                                        setErrors({ ...errors, tagline: undefined });
                                                    }
                                                }}
                                                placeholder="e.g., Magical solutions for your creative needs."
                                                className={errors.tagline ? 'border-red-500 focus:border-red-500' : ''}
                                            />
                                            {errors.tagline && <p className="text-sm text-red-500">{errors.tagline}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label style={{ color: 'var(--color-text-primary)' }}>Business Categories (Select up to 3) *</Label>
                                            <MultiSelectCategories
                                                selectedCategories={selectedCategories}
                                                onCategoriesChange={(categories) => {
                                                    setSelectedCategories(categories);
                                                    if (errors.categories) {
                                                        setErrors({ ...errors, categories: undefined });
                                                    }
                                                }}
                                            />
                                            {errors.categories && <p className="text-sm text-red-500">{errors.categories}</p>}
                                            <p className="text-xs text-[--color-text-secondary]">Choose categories that best describe your services to help clients find you.</p>
                                        </div>
                                    </div>
                                )}
                                {step === 2 && (
                                    <div className="space-y-2">
                                        <Label htmlFor="brand-description" style={{ color: 'var(--color-text-primary)' }}>Brand Description *</Label>
                                        <Textarea
                                            id="brand-description"
                                            value={formData.description}
                                            onChange={e => {
                                                setFormData({ ...formData, description: e.target.value });
                                                if (errors.description) {
                                                    setErrors({ ...errors, description: undefined });
                                                }
                                            }}
                                            placeholder="Tell clients what your brand is all about, what you offer, and what makes you unique."
                                            rows={8}
                                            className={errors.description ? 'border-red-500 focus:border-red-500' : ''}
                                        />
                                        {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
                                        <p className="text-xs text-[--color-text-secondary]">{formData.description.length}/1000 characters</p>
                                    </div>
                                )}
                                {step === 3 && (
                                    <div className="space-y-2">
                                        <Label htmlFor="whatsapp-channel" style={{ color: 'var(--color-text-primary)' }}>WhatsApp Channel Link (Optional)</Label>
                                        <Input
                                            id="whatsapp-channel"
                                            type="url"
                                            value={formData.whatsappChannel}
                                            onChange={e => {
                                                setFormData({ ...formData, whatsappChannel: e.target.value });
                                                if (errors.whatsappChannel) {
                                                    setErrors({ ...errors, whatsappChannel: undefined });
                                                }
                                            }}
                                            placeholder="https://whatsapp.com/channel/... (optional)"
                                            className={errors.whatsappChannel ? 'border-red-500 focus:border-red-500' : ''}
                                        />
                                        {errors.whatsappChannel && <p className="text-sm text-red-500">{errors.whatsappChannel}</p>}
                                        <p className="text-xs text-[--color-text-secondary] mt-1">Connect with your customers directly. If provided, this will be visible on your brand page.</p>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>

                        {/* Navigation */}
                        <div className="flex justify-between mt-8 pt-6 border-t" style={{ borderColor: 'var(--color-border)' }}>
                            <motion.button
                                onClick={handleBack}
                                disabled={step === 1}
                                className="px-6 py-3 rounded-2xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                style={{
                                    border: '2px solid var(--color-border)',
                                    color: 'var(--color-text-primary)',
                                    backgroundColor: 'transparent'
                                }}
                                whileHover={step !== 1 ? { scale: 1.05, backgroundColor: 'var(--color-card)' } : {}}
                                whileTap={step !== 1 ? { scale: 0.95 } : {}}
                            >
                                Back
                            </motion.button>
                            {step < 3 ? (
                                <motion.button
                                    onClick={handleNext}
                                    className="px-6 py-3 rounded-2xl font-semibold text-white transition-all duration-300"
                                    style={{
                                        background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))'
                                    }}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Next
                                </motion.button>
                            ) : (
                                <motion.button
                                    onClick={handleCreate}
                                    disabled={isSubmitting}
                                    className="px-6 py-3 rounded-2xl font-semibold text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                    style={{
                                        background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))'
                                    }}
                                    whileHover={!isSubmitting ? { scale: 1.05 } : {}}
                                    whileTap={!isSubmitting ? { scale: 0.95 } : {}}
                                >
                                    {isSubmitting ? 'Submitting...' : 'Create Brand'}
                                </motion.button>
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default MakeBrandPage;
