

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { type Route } from '../types';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Textarea } from '../components/ui/Textarea';
import { Alert } from '../components/ui/Alert';
import { ArrowLeft, Edit, Plus, MessageSquare, ExternalLink, Tag, DollarSign, Image as ImageIcon, Clock, CheckCircle, XCircle, UploadCloud, AlertTriangle, Lock, ShoppingBag } from 'lucide-react';
import { useBrand } from '../firebase/hooks/useBrand';
import { useBrandServices } from '../firebase/hooks/useBrandServices';
import { toggleServiceSoldOut } from '../firebase/services/brandServiceService';
import CreateServiceModal from '../components/modals/CreateServiceModal';
import ServiceCard from '../components/ServiceCard';
import { toast } from 'react-hot-toast';
import { User } from '../firebase/types/user';

interface BrandDashboardPageProps {
  navigate: (route: Route, context?: any, options?: { name?: string }) => void;
  user?: User | null;
  isLoggedIn?: boolean;
}

const BrandDashboardPage = ({ navigate, user, isLoggedIn }: BrandDashboardPageProps) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
    const [alertDismissed, setAlertDismissed] = useState(false);
    const [freezeAlertDismissed, setFreezeAlertDismissed] = useState(false);
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string>('');
    const [isUpdating, setIsUpdating] = useState(false);
    const [editFormData, setEditFormData] = useState({
        brandName: '',
        tagline: '',
        description: '',
        whatsappChannel: ''
    });

    const { brandRequest, brand, loading, updateBrandData, canEditBrand } = useBrand(user?.uid);
    const { services, loading: servicesLoading, refetch } = useBrandServices(brand?.id);

    useEffect(() => {
        if (!user || !isLoggedIn) {
            toast.error('Please login to access brand dashboard');
            navigate('auth');
            return;
        }

        if (!loading && !brandRequest) {
            toast.error('No brand request found');
            navigate('fog-services');
            return;
        }

        // Initialize edit form with current data
        if (brand) {
            setEditFormData({
                brandName: brand.brandName,
                tagline: brand.tagline,
                description: brand.description,
                whatsappChannel: brand.whatsappChannel
            });
        } else if (brandRequest) {
            setEditFormData({
                brandName: brandRequest.brandName,
                tagline: brandRequest.tagline,
                description: brandRequest.description,
                whatsappChannel: brandRequest.whatsappChannel
            });
        }
    }, [user, loading, brandRequest, brand, navigate]);

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                toast.error('Please select an image file');
                return;
            }

            if (file.size > 5 * 1024 * 1024) {
                toast.error('Image size should be less than 5MB');
                return;
            }

            setLogoFile(file);
            
            const reader = new FileReader();
            reader.onload = (e) => {
                setLogoPreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUpdateBrand = async () => {
        if (!canEditBrand()) {
            toast.error('You cannot edit a brand that is not approved');
            return;
        }

        setIsUpdating(true);

        try {
            const result = await updateBrandData({
                brandName: editFormData.brandName,
                tagline: editFormData.tagline,
                description: editFormData.description,
                whatsappChannel: editFormData.whatsappChannel,
                logoFile: logoFile || undefined
            });

            if (result.success) {
                toast.success('Brand updated successfully!');
                setIsEditMode(false);
                setLogoFile(null);
                setLogoPreview('');
            } else {
                toast.error(result.error || 'Failed to update brand');
            }
        } catch (error) {
            console.error('Error updating brand:', error);
            toast.error('Failed to update brand. Please try again.');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleServiceCreated = () => {
        // Refresh services after creation
        refetch();
        setIsModalOpen(false);
        toast.success('Service created successfully!');
    };

    const handleViewService = (serviceId: string) => {
        const service = services.find(s => s.id === serviceId);
        if (service) {
            navigate('fog-service-detail', serviceId, { name: service.title });
        } else {
            navigate('fog-service-detail', serviceId);
        }
    };

    const handleEditService = (serviceId: string) => {
        setEditingServiceId(serviceId);
        setIsModalOpen(true);
    };

    const handleDeleteService = async (serviceId: string) => {
        if (!confirm('Are you sure you want to delete this service?')) {
            return;
        }
        
        try {
            // TODO: Implement delete service functionality
            // const result = await deleteService(serviceId, user?.uid || '');
            // if (result.success) {
            //     toast.success('Service deleted successfully!');
            //     refetch();
            // } else {
            //     toast.error(result.error || 'Failed to delete service');
            // }
            toast('Delete service feature coming soon!', { icon: 'ℹ️' });
        } catch (error) {
            toast.error('Failed to delete service');
        }
    };

    const handleToggleSoldOut = async (serviceId: string, currentSoldOut: boolean) => {
        try {
            const result = await toggleServiceSoldOut(serviceId, !currentSoldOut);
            if (result.success) {
                toast.success(!currentSoldOut ? 'Service marked as sold out' : 'Service marked as available');
                refetch();
            } else {
                toast.error(result.error || 'Failed to update service status');
            }
        } catch (error) {
            toast.error('Failed to update service status');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending':
                return 'text-yellow-600 dark:text-yellow-400';
            case 'approved':
            case 'active':
                return 'text-green-600 dark:text-green-400';
            case 'rejected':
                return 'text-red-600 dark:text-red-400';
            case 'frozen':
                return 'text-orange-600 dark:text-orange-400';
            default:
                return 'text-[--color-text-secondary]';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending':
                return <Clock className="w-5 h-5" />;
            case 'approved':
            case 'active':
                return <CheckCircle className="w-5 h-5" />;
            case 'rejected':
                return <XCircle className="w-5 h-5" />;
            case 'frozen':
                return <Lock className="w-5 h-5" />;
            default:
                return <Clock className="w-5 h-5" />;
        }
    };

    const getStatusMessage = () => {
        if (!brandRequest) return null;

        switch (brandRequest.status) {
            case 'pending':
                return {
                    type: 'warning' as const,
                    title: 'Brand Under Review',
                    message: ' Thank you! Our team will review your request and contact you within 2-3 business days.'
                };
            case 'approved':
            case 'active':
                return {
                    type: 'success' as const,
                    title: 'Brand Approved!',
                    message: 'Congratulations! Your brand has been approved. You can now manage your brand and add services.'
                };
            case 'rejected':
                return {
                    type: 'error' as const,
                    title: 'Brand Request Rejected',
                    message: brandRequest.rejectionReason || 'Your brand request was rejected by the FOGSLY team. Please contact our support team for further assistance.'
                };
            default:
                return null;
        }
    };

    const getFreezeMessage = () => {
        if (!brand || brand.status !== 'frozen') return null;

        return {
            type: 'error' as const,
            title: 'Brand Paused',
            message: 'We are sorry, unfortunately your brand is paused for some reason and you cannot make any changes. Your services are also paused and not visible to customers. Please contact our support team for assistance.'
        };
    };

    if (!user) {
        return (
            <div className="bg-[--color-bg-secondary] min-h-screen flex items-center justify-center">
                <Card className="max-w-md mx-auto">
                    <CardContent className="p-6 text-center">
                        <h2 className="text-xl font-bold mb-4">Authentication Required</h2>
                        <p className="text-[--color-text-secondary] mb-4">Please login to access your brand dashboard.</p>
                        <Button onClick={() => navigate('auth')}>Login</Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="bg-[--color-bg-secondary] min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[--color-primary] mx-auto mb-4"></div>
                    <p className="text-[--color-text-secondary]">Loading brand dashboard...</p>
                </div>
            </div>
        );
    }

    if (!brandRequest) {
        return (
            <div className="bg-[--color-bg-secondary] min-h-screen flex items-center justify-center">
                <Card className="max-w-md mx-auto">
                    <CardContent className="p-6 text-center">
                        <h2 className="text-xl font-bold mb-4">No Brand Found</h2>
                        <p className="text-[--color-text-secondary] mb-4">You don't have a brand request or approved brand yet.</p>
                        <Button onClick={() => navigate('make-brand')}>Create Brand</Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const currentData = brand || brandRequest;
    const statusMessage = getStatusMessage();
    const freezeMessage = getFreezeMessage();
    const isBrandFrozen = brand?.status === 'frozen';

    return (
        <div className="bg-[--color-bg-secondary] min-h-screen">
            <div className="container mx-auto px-4 py-8 pt-10">
                <div className="mb-6">
                    <Button variant="ghost" onClick={() => navigate('fog-services')}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to All Brands
                    </Button>
                </div>

                {/* Freeze Alert - Shows above status alert with priority */}
                {freezeMessage && !freezeAlertDismissed && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6"
                    >
                        <Alert 
                            type={freezeMessage.type}
                            title={freezeMessage.title}
                            dismissible
                            onDismiss={() => setFreezeAlertDismissed(true)}
                        >
                            {freezeMessage.message}
                        </Alert>
                    </motion.div>
                )}

                {/* Status Alert */}
                {statusMessage && !alertDismissed && !isBrandFrozen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6"
                    >
                        <Alert 
                            type={statusMessage.type}
                            title={statusMessage.title}
                            dismissible
                            onDismiss={() => setAlertDismissed(true)}
                        >
                            {statusMessage.message}
                        </Alert>
                    </motion.div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Sidebar: Brand Info */}
                    <aside className="lg:col-span-4 xl:col-span-3">
                        <Card className="sticky top-24">
                            <CardContent className="p-6 pt-6 text-center">
                                {currentData.logoUrl ? (
                                    <img 
                                        src={currentData.logoUrl} 
                                        alt="Brand logo" 
                                        className="w-24 h-24 rounded-full mx-auto mb-4 object-cover border border-[--color-border]"
                                    />
                                ) : (
                                    <div className="w-24 h-24 rounded-full bg-[--color-bg-tertiary] mx-auto mb-4 flex items-center justify-center text-4xl font-bold text-[--color-text-secondary]">
                                        {currentData.brandName.split(' ').map(n => n[0]).join('')}
                                    </div>
                                )}
                                <h1 className="text-2xl font-bold">{currentData.brandName}</h1>
                                <p className="text-sm text-[--color-text-secondary]">{currentData.tagline}</p>
                                
                                {/* Status Badge */}
                                <div className={`flex items-center justify-center gap-2 mt-3 ${getStatusColor(brand?.status || brandRequest.status)}`}>
                                    {getStatusIcon(brand?.status || brandRequest.status)}
                                    <span className="font-semibold capitalize">{brand?.status || brandRequest.status}</span>
                                </div>

                                <div className="mt-6 space-y-3">
                                    {canEditBrand() && !isEditMode && !isBrandFrozen && (
                                        <Button 
                                            variant="outline" 
                                            className="w-full" 
                                            onClick={() => setIsEditMode(true)}
                                        >
                                            <Edit className="w-4 h-4 mr-2" />
                                            Edit Brand
                                        </Button>
                                    )}
                                    
                                    {brand && !isBrandFrozen && (
                                        <Button 
                                            variant="default" 
                                            className="w-full" 
                                            onClick={() => navigate('brand-messages', brand.id)}
                                        >
                                            <MessageSquare className="w-4 h-4 mr-2" />
                                            Customer Messages
                                        </Button>
                                    )}
                                    
                                    {currentData.whatsappChannel && (
                                        <Button variant="outline" className="w-full">
                                            <a 
                                                href={currentData.whatsappChannel} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="flex items-center justify-center gap-2 w-full"
                                            >
                                                <MessageSquare className="w-4 h-4" />
                                                WhatsApp Channel
                                                <ExternalLink className="w-4 h-4" />
                                            </a>
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </aside>

                    {/* Main Content */}
                    <main className="lg:col-span-8 xl:col-span-9">
                        {isEditMode ? (
                            /* Edit Mode */
                            <Card>
                                <CardHeader>
                                    <CardTitle>Edit Brand</CardTitle>
                                    <CardDescription>Update your brand information</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {/* Logo Upload */}
                                    <div className="text-center">
                                        <label htmlFor="logo-upload" className="mx-auto cursor-pointer flex w-32 h-32 items-center justify-center rounded-full bg-[--color-bg-secondary] border-2 border-dashed border-[--color-border] hover:border-[--color-primary]">
                                            {logoPreview ? (
                                                <img src={logoPreview} alt="Logo preview" className="w-full h-full rounded-full object-cover" />
                                            ) : currentData.logoUrl ? (
                                                <img src={currentData.logoUrl} alt="Current logo" className="w-full h-full rounded-full object-cover" />
                                            ) : (
                                                <div className="text-center">
                                                    <UploadCloud className="mx-auto h-8 w-8 text-[--color-text-secondary]" />
                                                    <p className="mt-1 text-xs text-[--color-text-secondary]">Upload Logo</p>
                                                </div>
                                            )}
                                            <input id="logo-upload" type="file" accept="image/*" onChange={handleLogoChange} className="sr-only"/>
                                        </label>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="edit-brand-name">Brand Name</Label>
                                            <Input 
                                                id="edit-brand-name" 
                                                value={editFormData.brandName} 
                                                onChange={e => setEditFormData({...editFormData, brandName: e.target.value})} 
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="edit-tagline">Tagline</Label>
                                            <Input 
                                                id="edit-tagline" 
                                                value={editFormData.tagline} 
                                                onChange={e => setEditFormData({...editFormData, tagline: e.target.value})} 
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="edit-description">Description</Label>
                                        <Textarea 
                                            id="edit-description" 
                                            value={editFormData.description} 
                                            onChange={e => setEditFormData({...editFormData, description: e.target.value})} 
                                            rows={4}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="edit-whatsapp">WhatsApp Channel</Label>
                                        <Input 
                                            id="edit-whatsapp" 
                                            type="url"
                                            value={editFormData.whatsappChannel} 
                                            onChange={e => setEditFormData({...editFormData, whatsappChannel: e.target.value})} 
                                            placeholder="https://whatsapp.com/channel/..."
                                        />
                                    </div>

                                    <div className="flex gap-4 pt-4 border-t border-[--color-border]">
                                        <Button 
                                            onClick={handleUpdateBrand}
                                            disabled={isUpdating}
                                        >
                                            {isUpdating ? 'Updating...' : 'Save Changes'}
                                        </Button>
                                        <Button 
                                            variant="outline" 
                                            onClick={() => {
                                                setIsEditMode(false);
                                                setLogoFile(null);
                                                setLogoPreview('');
                                            }}
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            /* View Mode */
                            <div className="space-y-6">
                                {/* Brand Description */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Brand Description</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-[--color-text-secondary]">{currentData.description}</p>
                                    </CardContent>
                                </Card>

                                {/* Services Section */}
                                <Card>
                                    <CardHeader className="flex flex-col md:flex-row items-center justify-between">
                                        <div>
                                            <CardTitle>Services</CardTitle>
                                            <CardDescription>
                                                {isBrandFrozen 
                                                    ? 'Your services are paused and not visible to customers' 
                                                    : 'Manage your brand services'
                                                }
                                            </CardDescription>
                                        </div>
                                        {canEditBrand() && !isBrandFrozen && (
                                            <Button onClick={() => setIsModalOpen(true)}>
                                                <Plus className="w-4 h-4 mr-2" />
                                                Add Service
                                            </Button>
                                        )}
                                    </CardHeader>
                                    <CardContent>
                                        {servicesLoading ? (
                                            <div className="text-center py-8">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[--color-primary] mx-auto mb-4"></div>
                                                <p className="text-[--color-text-secondary]">Loading services...</p>
                                            </div>
                                        ) : services.length > 0 ? (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {services.map((service, index) => (
                                                    <ServiceCard 
                                                        key={service.id} 
                                                        service={service}
                                                        onView={!isBrandFrozen ? handleViewService : undefined}
                                                        onEdit={!isBrandFrozen ? handleEditService : undefined}
                                                        onDelete={!isBrandFrozen ? handleDeleteService : undefined}
                                                        onToggleSoldOut={!isBrandFrozen ? handleToggleSoldOut : undefined}
                                                        index={index}
                                                    />
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-8">
                                                <p className="text-[--color-text-secondary]">
                                                    {canEditBrand() && !isBrandFrozen ? 'No services added yet. Click "Add Service" to get started.' : 'No services available.'}
                                                </p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Stats Section (only for approved brands) */}
                                {brand && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Brand Statistics</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                <div className="text-center">
                                                    <div className="text-2xl font-bold text-[--color-primary]">{brand.stats.followers || 0}</div>
                                                    <div className="text-sm text-[--color-text-secondary]">Total Followers</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-2xl font-bold text-[--color-primary]">${brand.stats.totalEarnings}</div>
                                                    <div className="text-sm text-[--color-text-secondary]">Total Earnings</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-2xl font-bold text-[--color-primary]">{brand.stats.rating.toFixed(1)}</div>
                                                    <div className="text-sm text-[--color-text-secondary]">Rating</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-2xl font-bold text-[--color-primary]">{brand.stats.reviews}</div>
                                                    <div className="text-sm text-[--color-text-secondary]">Reviews</div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        )}
                    </main>
                </div>
            </div>

            {brand && (
                <CreateServiceModal 
                    isOpen={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false);
                        setEditingServiceId(null);
                    }}
                    brandId={brand.id}
                    userId={user?.uid || ''}
                    onServiceCreated={handleServiceCreated}
                    editServiceId={editingServiceId}
                />
            )}
        </div>
    );
};



export default BrandDashboardPage;