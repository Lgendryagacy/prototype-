import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../firebase/hooks/useAuth';
import { 
    getApprovedFreelancerById, 
    updateApprovedFreelancer,
    ApprovedFreelancer 
} from '../firebase/services/approvedFreelancers';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import {
    ArrowLeft,
    Loader,
    Save,
    X,
    Plus,
    Trash2,
    AlertCircle
} from 'lucide-react';
import { type Route } from '../types';
import { toast } from 'react-hot-toast';
import ImageCropper from '../components/ImageCropper';

interface EditGigPageProps {
    navigate: (route: Route, context?: any) => void;
    context?: any;
}

interface PortfolioItem {
    id: string;
    image: string;
    title: string;
    description: string;
    link: string;
}

const EditGigPage: React.FC<EditGigPageProps> = ({ navigate, context }) => {
    const { user: currentUser } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [gig, setGig] = useState<ApprovedFreelancer | null>(null);
    
    // Form states
    const [title, setTitle] = useState('');
    const [bio, setBio] = useState('');
    const [skills, setSkills] = useState<string[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [experience, setExperience] = useState<'beginner' | 'intermediate' | 'expert'>('beginner');
    const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
    const [education, setEducation] = useState('');
    const [certifications, setCertifications] = useState<string[]>([]);
    const [hourlyRate, setHourlyRate] = useState(0);
    const [currency, setCurrency] = useState<'USD' | 'PKR'>('USD');
    const [availability, setAvailability] = useState('full-time');
    const [languages, setLanguages] = useState<string[]>(['English']);
    
    // UI states
    const [skillInput, setSkillInput] = useState('');
    const [categoryInput, setCategoryInput] = useState('');
    const [languageInput, setLanguageInput] = useState('');
    const [showCropper, setShowCropper] = useState(false);
    const [tempImageSrc, setTempImageSrc] = useState('');
    const [cropItemId, setCropItemId] = useState('');

    const gigId = context?.gigId;

    useEffect(() => {
        if (gigId && currentUser) {
            fetchGigData();
        } else {
            setLoading(false);
            if (!gigId) {
                toast.error('No gig ID provided');
            }
        }
    }, [gigId, currentUser]);

    const fetchGigData = async () => {
        try {
            setLoading(true);
            const gigData = await getApprovedFreelancerById(gigId);
            
            if (!gigData) {
                toast.error('Gig not found');
                navigate('manage-gigs');
                return;
            }

            // Check if user owns this gig
            if (gigData.userId !== currentUser?.uid) {
                toast.error('You can only edit your own gigs');
                navigate('manage-gigs');
                return;
            }

            setGig(gigData);
            
            // Populate form fields
            setTitle(gigData.title);
            setBio(gigData.bio);
            setSkills(gigData.skills);
            setCategories(gigData.categories);
            setExperience(gigData.experience);
            setPortfolioItems(gigData.portfolioItems || []);
            setEducation(gigData.education);
            setCertifications(gigData.certifications);
            setHourlyRate(gigData.hourlyRate);
            setCurrency(gigData.currency);
            setAvailability(gigData.availability);
            setLanguages(gigData.languages);
        } catch (error) {
            console.error('Error fetching gig:', error);
            toast.error('Failed to load gig data');
            navigate('manage-gigs');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        // Validation
        if (!title.trim()) {
            toast.error('Title is required');
            return;
        }
        if (!bio.trim() || bio.length < 50) {
            toast.error('Bio must be at least 50 characters');
            return;
        }
        if (categories.length === 0) {
            toast.error('At least one category is required');
            return;
        }
        if (skills.length < 3) {
            toast.error('At least 3 skills are required');
            return;
        }
        if (hourlyRate <= 0) {
            toast.error('Please enter a valid hourly rate');
            return;
        }

        try {
            setSaving(true);
            
            const updates: Partial<ApprovedFreelancer> = {
                title,
                bio,
                skills,
                categories,
                experience,
                portfolioItems,
                education,
                certifications,
                hourlyRate,
                currency,
                availability,
                languages
            };

            await updateApprovedFreelancer(gigId, updates);
            
            toast.success('Gig updated successfully!');
            navigate('gig-detail', { gigId });
        } catch (error) {
            console.error('Error updating gig:', error);
            toast.error('Failed to update gig');
        } finally {
            setSaving(false);
        }
    };

    const handleAddSkill = () => {
        if (skillInput.trim() && !skills.includes(skillInput.trim()) && skills.length < 10) {
            setSkills([...skills, skillInput.trim()]);
            setSkillInput('');
        }
    };

    const handleRemoveSkill = (skill: string) => {
        setSkills(skills.filter(s => s !== skill));
    };

    const handleAddCategory = () => {
        if (categoryInput.trim() && !categories.includes(categoryInput.trim()) && categories.length < 5) {
            setCategories([...categories, categoryInput.trim()]);
            setCategoryInput('');
        }
    };

    const handleRemoveCategory = (category: string) => {
        setCategories(categories.filter(c => c !== category));
    };

    const handleAddLanguage = () => {
        if (languageInput.trim() && !languages.includes(languageInput.trim())) {
            setLanguages([...languages, languageInput.trim()]);
            setLanguageInput('');
        }
    };

    const handleRemoveLanguage = (language: string) => {
        if (languages.length > 1) {
            setLanguages(languages.filter(l => l !== language));
        }
    };

    const handleAddPortfolioItem = () => {
        const newItem: PortfolioItem = {
            id: Date.now().toString(),
            image: '',
            title: '',
            description: '',
            link: ''
        };
        setPortfolioItems([...portfolioItems, newItem]);
    };

    const handleRemovePortfolioItem = (id: string) => {
        setPortfolioItems(portfolioItems.filter(item => item.id !== id));
    };

    const handlePortfolioItemChange = (id: string, field: keyof PortfolioItem, value: string) => {
        setPortfolioItems(portfolioItems.map(item =>
            item.id === id ? { ...item, [field]: value } : item
        ));
    };

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
        handlePortfolioItemChange(cropItemId, 'image', croppedImage);
        setShowCropper(false);
        setTempImageSrc('');
        setCropItemId('');
    };

    const handleCropCancel = () => {
        setShowCropper(false);
        setTempImageSrc('');
        setCropItemId('');
    };

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

    if (loading) {
        return (
            <div className="min-h-screen bg-[--color-bg-primary] flex items-center justify-center">
                <div className="text-center">
                    <Loader className="w-12 h-12 animate-spin text-[--color-primary] mx-auto mb-4" />
                    <p className="text-[--color-text-secondary]">Loading gig data...</p>
                </div>
            </div>
        );
    }

    if (!currentUser) {
        return (
            <div className="min-h-screen bg-[--color-bg-primary] flex items-center justify-center">
                <Card className="max-w-md w-full mx-4">
                    <CardContent className="p-8 text-center">
                        <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold mb-2">Authentication Required</h2>
                        <p className="text-[--color-text-secondary] mb-6">
                            Please log in to edit your gig.
                        </p>
                        <Button onClick={() => navigate('auth')} className="w-full">
                            Go to Login
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

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
            
            <div className="min-h-screen bg-gradient-to-br from-[--color-bg-primary] to-[--color-bg-secondary] pt-20 px-4 pb-20">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <button
                            onClick={() => navigate('gig-detail', { gigId })}
                            className="flex items-center gap-2 text-[--color-text-secondary] hover:text-[--color-primary] mb-4 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Gig Details
                        </button>
                        <h1 className="text-4xl font-bold mb-2">Edit Gig</h1>
                        <p className="text-[--color-text-secondary]">
                            Update your gig information
                        </p>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        {/* Basic Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Basic Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Gig Title <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="e.g., Full Stack Developer, Graphic Designer"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Bio <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        value={bio}
                                        onChange={(e) => setBio(e.target.value)}
                                        rows={6}
                                        maxLength={1000}
                                        className="w-full px-4 py-2 rounded-lg border border-[--color-border] bg-[--color-bg-primary] focus:outline-none focus:ring-2 focus:ring-[--color-primary]"
                                        placeholder="Describe your expertise and what makes you unique..."
                                    />
                                    <p className="text-sm text-[--color-text-secondary] mt-1">
                                        {bio.length}/1000 characters (minimum 50)
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Skills & Categories */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Skills & Categories</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Categories */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Categories <span className="text-red-500">*</span> (Max 5)
                                    </label>
                                    <div className="flex gap-2 mb-2">
                                        <select
                                            value=""
                                            onChange={(e) => {
                                                if (e.target.value && categories.length < 5) {
                                                    handleAddCategory();
                                                    setCategoryInput(e.target.value);
                                                }
                                            }}
                                            className="flex-1 px-4 py-2 rounded-lg border border-[--color-border] bg-[--color-bg-primary]"
                                        >
                                            <option value="">Select a category</option>
                                            {predefinedCategories.filter(cat => !categories.includes(cat)).map(cat => (
                                                <option key={cat} value={cat}>{cat}</option>
                                            ))}
                                        </select>
                                        <Input
                                            value={categoryInput}
                                            onChange={(e) => setCategoryInput(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCategory())}
                                            placeholder="Or add custom"
                                            disabled={categories.length >= 5}
                                        />
                                        <Button onClick={handleAddCategory} disabled={!categoryInput.trim() || categories.length >= 5}>
                                            <Plus className="w-4 h-4" />
                                        </Button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {categories.map((category, index) => (
                                            <Badge key={index} className="bg-[--color-primary]/20 text-[--color-primary]">
                                                {category}
                                                <button onClick={() => handleRemoveCategory(category)} className="ml-2">
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </Badge>
                                        ))}
                                    </div>
                                </div>

                                {/* Skills */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Skills <span className="text-red-500">*</span> (Min 3, Max 10)
                                    </label>
                                    <div className="flex gap-2 mb-2">
                                        <Input
                                            value={skillInput}
                                            onChange={(e) => setSkillInput(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                                            placeholder="Add a skill (e.g., React, Photoshop)"
                                            disabled={skills.length >= 10}
                                        />
                                        <Button onClick={handleAddSkill} disabled={!skillInput.trim() || skills.length >= 10}>
                                            <Plus className="w-4 h-4" />
                                        </Button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {skills.map((skill, index) => (
                                            <Badge key={index} variant="outline">
                                                {skill}
                                                <button onClick={() => handleRemoveSkill(skill)} className="ml-2">
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </Badge>
                                        ))}
                                    </div>
                                </div>

                                {/* Experience */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Experience Level
                                    </label>
                                    <select
                                        value={experience}
                                        onChange={(e) => setExperience(e.target.value as 'beginner' | 'intermediate' | 'expert')}
                                        className="w-full px-4 py-2 rounded-lg border border-[--color-border] bg-[--color-bg-primary]"
                                    >
                                        <option value="beginner">Beginner (0-2 years)</option>
                                        <option value="intermediate">Intermediate (2-5 years)</option>
                                        <option value="expert">Expert (5+ years)</option>
                                    </select>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Portfolio */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Portfolio</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Button onClick={handleAddPortfolioItem} variant="outline" className="w-full">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Portfolio Item
                                </Button>

                                {portfolioItems.map((item) => (
                                    <Card key={item.id} className="border-2">
                                        <CardContent className="pt-6 space-y-3">
                                            <div className="flex justify-between items-start">
                                                <h4 className="font-semibold">Portfolio Item</h4>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleRemovePortfolioItem(item.id)}
                                                >
                                                    <Trash2 className="w-4 h-4 text-red-500" />
                                                </Button>
                                            </div>

                                            {item.image && (
                                                <img src={item.image} alt="Portfolio" className="w-full h-40 object-cover rounded-lg" />
                                            )}

                                            <Input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) handleImageSelect(item.id, file);
                                                }}
                                            />

                                            <Input
                                                value={item.title}
                                                onChange={(e) => handlePortfolioItemChange(item.id, 'title', e.target.value)}
                                                placeholder="Project Title"
                                            />

                                            <textarea
                                                value={item.description}
                                                onChange={(e) => handlePortfolioItemChange(item.id, 'description', e.target.value)}
                                                rows={3}
                                                className="w-full px-4 py-2 rounded-lg border border-[--color-border] bg-[--color-bg-primary]"
                                                placeholder="Project Description"
                                            />

                                            <Input
                                                value={item.link}
                                                onChange={(e) => handlePortfolioItemChange(item.id, 'link', e.target.value)}
                                                placeholder="Project Link (optional)"
                                            />
                                        </CardContent>
                                    </Card>
                                ))}

                                <div>
                                    <label className="block text-sm font-medium mb-2">Education</label>
                                    <textarea
                                        value={education}
                                        onChange={(e) => setEducation(e.target.value)}
                                        rows={3}
                                        className="w-full px-4 py-2 rounded-lg border border-[--color-border] bg-[--color-bg-primary]"
                                        placeholder="e.g., Bachelor's in Computer Science - University Name (2018-2022)"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Certifications (one per line)</label>
                                    <textarea
                                        value={certifications.join('\n')}
                                        onChange={(e) => setCertifications(e.target.value.split('\n').filter(c => c.trim()))}
                                        rows={4}
                                        className="w-full px-4 py-2 rounded-lg border border-[--color-border] bg-[--color-bg-primary]"
                                        placeholder="List your certifications (one per line)"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Rates & Availability */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Rates & Availability</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">
                                            Hourly Rate <span className="text-red-500">*</span>
                                        </label>
                                        <Input
                                            type="number"
                                            value={hourlyRate}
                                            onChange={(e) => setHourlyRate(Number(e.target.value))}
                                            placeholder="50"
                                            min="0"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Currency</label>
                                        <select
                                            value={currency}
                                            onChange={(e) => setCurrency(e.target.value as 'USD' | 'PKR')}
                                            className="w-full px-4 py-2 rounded-lg border border-[--color-border] bg-[--color-bg-primary]"
                                        >
                                            <option value="USD">USD ($)</option>
                                            <option value="PKR">PKR (₨)</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Availability</label>
                                    <select
                                        value={availability}
                                        onChange={(e) => setAvailability(e.target.value)}
                                        className="w-full px-4 py-2 rounded-lg border border-[--color-border] bg-[--color-bg-primary]"
                                    >
                                        <option value="full-time">Full-time (40+ hrs/week)</option>
                                        <option value="part-time">Part-time (20-40 hrs/week)</option>
                                        <option value="contract">Contract/Project basis</option>
                                        <option value="as-needed">As needed</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Languages</label>
                                    <div className="flex gap-2 mb-2">
                                        <Input
                                            value={languageInput}
                                            onChange={(e) => setLanguageInput(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddLanguage())}
                                            placeholder="Add a language"
                                        />
                                        <Button onClick={handleAddLanguage} disabled={!languageInput.trim()}>
                                            <Plus className="w-4 h-4" />
                                        </Button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {languages.map((language, index) => (
                                            <Badge key={index} variant="outline">
                                                {language}
                                                {languages.length > 1 && (
                                                    <button onClick={() => handleRemoveLanguage(language)} className="ml-2">
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                )}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Action Buttons */}
                        <div className="flex gap-4">
                            <Button
                                onClick={() => navigate('gig-detail', { gigId })}
                                variant="outline"
                                className="flex-1"
                                disabled={saving}
                            >
                                <X className="w-4 h-4 mr-2" />
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSave}
                                className="flex-1 bg-gradient-to-r from-[--color-primary] to-purple-600"
                                disabled={saving}
                            >
                                {saving ? (
                                    <>
                                        <Loader className="w-4 h-4 mr-2 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4 mr-2" />
                                        Save Changes
                                    </>
                                )}
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </div>
        </>
    );
};

export default EditGigPage;
