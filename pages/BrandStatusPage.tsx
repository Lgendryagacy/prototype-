import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { type Route } from '../types';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Alert } from '../components/ui/Alert';
import { ArrowLeft, Clock, CheckCircle, XCircle, Calendar, User, MessageSquare, ExternalLink } from 'lucide-react';
import { useBrand } from '../firebase/hooks/useBrand';
import { User as UserType } from '../firebase/types/user';

interface BrandStatusPageProps {
  navigate: (route: Route, context?: any) => void;
  user?: UserType | null;
  isLoggedIn?: boolean;
}

const BrandStatusPage = ({ navigate, user, isLoggedIn }: BrandStatusPageProps) => {
    const { brandRequest, brand, loading } = useBrand(user?.uid);
    const [alertDismissed, setAlertDismissed] = useState(false);

    if (!user || !isLoggedIn) {
        return (
            <div className="bg-[--color-bg-secondary] min-h-screen flex items-center justify-center">
                <Card className="max-w-md mx-auto">
                    <CardContent className="p-6 text-center">
                        <h2 className="text-xl font-bold mb-4">Authentication Required</h2>
                        <p className="text-[--color-text-secondary] mb-4">Please login to view your brand status.</p>
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
                    <p className="text-[--color-text-secondary]">Loading brand status...</p>
                </div>
            </div>
        );
    }

    if (!brandRequest) {
        return (
            <div className="bg-[--color-bg-secondary] min-h-screen flex items-center justify-center">
                <Card className="max-w-md mx-auto">
                    <CardContent className="p-6 text-center">
                        <h2 className="text-xl font-bold mb-4">No Brand Request Found</h2>
                        <p className="text-[--color-text-secondary] mb-4">You haven't submitted a brand request yet.</p>
                        <Button onClick={() => navigate('make-brand')}>Create Brand</Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending':
                return 'text-yellow-600 dark:text-yellow-400';
            case 'approved':
                return 'text-green-600 dark:text-green-400';
            case 'rejected':
                return 'text-red-600 dark:text-red-400';
            default:
                return 'text-[--color-text-secondary]';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending':
                return <Clock className="w-6 h-6" />;
            case 'approved':
                return <CheckCircle className="w-6 h-6" />;
            case 'rejected':
                return <XCircle className="w-6 h-6" />;
            default:
                return <Clock className="w-6 h-6" />;
        }
    };

    const getStatusMessage = () => {
        switch (brandRequest.status) {
            case 'pending':
                return {
                    type: 'warning' as const,
                    title: 'Request Under Review',
                    message: ' Thank you! Our team will review your request and contact you within 2-3 business days.'
                };
            case 'approved':
                return {
                    type: 'success' as const,
                    title: 'Brand Approved!',
                    message: 'Congratulations! Your brand request has been approved. You can now manage your brand and add services.'
                };
            case 'rejected':
                return {
                    type: 'error' as const,
                    title: 'Request Rejected',
                    message: brandRequest.rejectionReason || 'Your brand request was rejected. Please review the feedback and submit a new request if needed.'
                };
            default:
                return {
                    type: 'info' as const,
                    title: 'Unknown Status',
                    message: 'Unable to determine request status.'
                };
        }
    };

    const statusMessage = getStatusMessage();

    return (
        <div className="bg-[--color-bg-secondary] min-h-screen">
            <div className="container mx-auto px-4 py-8 pt-10">
                <div className="max-w-4xl mx-auto">
                    <div className="mb-6">
                        <Button variant="ghost" onClick={() => navigate('fog-services')}>
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Fog Services
                        </Button>
                    </div>

                    {/* Status Alert */}
                    {!alertDismissed && (
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

                    {/* Brand Request Details */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-2xl">Brand Request Status</CardTitle>
                                    <div className={`flex items-center gap-2 ${getStatusColor(brandRequest.status)}`}>
                                        {getStatusIcon(brandRequest.status)}
                                        <span className="font-semibold capitalize">{brandRequest.status}</span>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Brand Info */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-sm font-medium text-[--color-text-secondary]">Brand Name</label>
                                            <p className="text-lg font-semibold">{brandRequest.brandName}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-[--color-text-secondary]">Tagline</label>
                                            <p>{brandRequest.tagline}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-[--color-text-secondary]">WhatsApp Channel</label>
                                            {brandRequest.whatsappChannel ? (
                                                <a 
                                                    href={brandRequest.whatsappChannel}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-1 text-[--color-primary] hover:underline"
                                                >
                                                    View Channel <ExternalLink className="w-4 h-4" />
                                                </a>
                                            ) : (
                                                <p className="text-[--color-text-secondary]">Not provided</p>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-4">
                                        {brandRequest.logoUrl && (
                                            <div>
                                                <label className="text-sm font-medium text-[--color-text-secondary]">Logo</label>
                                                <div className="mt-2">
                                                    <img 
                                                        src={brandRequest.logoUrl} 
                                                        alt="Brand logo" 
                                                        className="w-24 h-24 rounded-full object-cover border border-[--color-border]"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                        <div>
                                            <label className="text-sm font-medium text-[--color-text-secondary]">Submitted On</label>
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4" />
                                                <p>{brandRequest.createdAt.toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-[--color-text-secondary]">Last Updated</label>
                                            <p>{brandRequest.updatedAt.toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="text-sm font-medium text-[--color-text-secondary]">Description</label>
                                    <p className="mt-1 p-3 bg-[--color-bg-tertiary] rounded-lg">{brandRequest.description}</p>
                                </div>

                                {/* Admin Comments/Rejection Reason */}
                                {(brandRequest.adminComments || brandRequest.rejectionReason) && (
                                    <div>
                                        <label className="text-sm font-medium text-[--color-text-secondary]">
                                            {brandRequest.status === 'rejected' ? 'Rejection Reason' : 'Admin Comments'}
                                        </label>
                                        <p className="mt-1 p-3 bg-[--color-bg-tertiary] rounded-lg">
                                            {brandRequest.rejectionReason || brandRequest.adminComments}
                                        </p>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex flex-wrap gap-4 pt-4 border-t border-[--color-border]">
                                    {brandRequest.status === 'approved' && (
                                        <Button onClick={() => navigate('brand-dashboard')}>
                                            Manage Brand
                                        </Button>
                                    )}
                                    <Button variant="outline" onClick={() => navigate('fog-services')}>
                                        Browse Services
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default BrandStatusPage;