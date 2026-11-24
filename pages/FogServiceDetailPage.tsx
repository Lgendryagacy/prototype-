

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { type Route } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ArrowLeft, Star, MessageSquare, Check } from 'lucide-react';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '../components/ui/Accordion';
import { Textarea } from '../components/ui/Textarea';
import { getBrandServiceById } from '../firebase/services/brandServiceService';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { BrandService } from '../firebase/types/service';
import { toast } from 'react-hot-toast';
import { convertPKRtoFOG } from '../firebase/services/servicePaymentService';

const FogServiceDetailPage = ({ navigate, context: serviceId }: { navigate: (route: Route, context?: any, options?: { name?: string }) => void; context: any; }) => {
    const [service, setService] = useState<BrandService | null>(null);
    const [brandData, setBrandData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeImage, setActiveImage] = useState('');
    const [packagePricesInFOG, setPackagePricesInFOG] = useState<{ [key: string]: number }>({});
    const [hourlyRateInFOG, setHourlyRateInFOG] = useState<number | null>(null);
    const [convertingPrices, setConvertingPrices] = useState(false);

    // Handle package selection
    const handlePackageSelect = (packageData: any) => {
        if (!service || !brandData) return;
        
        const fogPrice = packagePricesInFOG[packageData.id] || 0;
        
        navigate('messages', {
            brandId: brandData.id,
            serviceInquiry: {
                serviceName: service.title,
                packageName: packageData.name,
                price: `${fogPrice.toFixed(2)} FOG`,
                deliveryTime: packageData.deliveryTime
            }
        });
    };

    // Handle hourly rate selection
    const handleHourlyRateSelect = () => {
        if (!service || !brandData || service.pricing.type !== 'hourly' || !service.pricing.hourlyRate) return;
        
        navigate('messages', {
            brandId: brandData.id,
            serviceInquiry: {
                serviceName: service.title,
                hourlyRate: `${hourlyRateInFOG?.toFixed(2) || 0} FOG/hr`,
                minimumHours: service.pricing.hourlyRate.minimumHours
            }
        });
    };

    useEffect(() => {
        const fetchServiceData = async () => {
            try {
                setLoading(true);
                
                // Fetch service data
                const serviceData = await getBrandServiceById(serviceId);
                if (!serviceData) {
                    toast.error('Service not found');
                    navigate('fog-services');
                    return;
                }
                
                setService(serviceData);
                setActiveImage(serviceData.mainImage || serviceData.thumbnailImages?.[0] || '');
                
                // Fetch brand data
                const brandDoc = await getDoc(doc(db, 'brands', serviceData.brandId));
                if (brandDoc.exists()) {
                    setBrandData({ id: brandDoc.id, ...brandDoc.data() });
                }
            } catch (error) {
                console.error('Error fetching service:', error);
                toast.error('Failed to load service');
                navigate('fog-services');
            } finally {
                setLoading(false);
            }
        };

        if (serviceId) {
            fetchServiceData();
        }
    }, [serviceId]);

    // Convert prices to FOG coins when service loads
    useEffect(() => {
        const convertPrices = async () => {
            if (!service) return;
            
            try {
                setConvertingPrices(true);
                
                // Convert package prices
                if (service.pricing.type === 'fixed' && service.pricing.packages) {
                    const conversions: { [key: string]: number } = {};
                    for (const pkg of service.pricing.packages) {
                        const conversion = await convertPKRtoFOG(pkg.price);
                        conversions[pkg.id] = conversion.priceInFOG;
                    }
                    setPackagePricesInFOG(conversions);
                }
                
                // Convert hourly rate
                if (service.pricing.type === 'hourly' && service.pricing.hourlyRate) {
                    const conversion = await convertPKRtoFOG(service.pricing.hourlyRate.rate);
                    setHourlyRateInFOG(conversion.priceInFOG);
                }
            } catch (error) {
                console.error('Error converting prices to FOG:', error);
                toast.error('Failed to convert prices');
            } finally {
                setConvertingPrices(false);
            }
        };
        
        convertPrices();
    }, [service]);

    if (loading) {
        return (
            <div className="bg-[--color-bg-primary] min-h-screen flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[--color-primary] mb-4"></div>
                <p className="text-[--color-text-secondary]">Loading service...</p>
            </div>
        );
    }

    if (!service || !brandData) {
        return (
            <div className="bg-[--color-bg-primary] min-h-screen flex flex-col items-center justify-center">
                <h1 className="text-2xl font-bold mb-4">Service not found!</h1>
                <Button variant="ghost" onClick={() => navigate('fog-services')}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to All Services
                </Button>
            </div>
        );
    }

    return (
        <div className="bg-[--color-bg-primary] min-h-screen">
            <div className="max-w-7xl mx-auto px-4 py-6 pt-20">
                {/* Back Button */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate('fog-services')}
                        className="flex items-center gap-2 px-6 py-3 rounded-full backdrop-blur-xl bg-[--color-card]/70 border-2 border-[--color-border] text-[--color-primary] hover:bg-[--color-bg-secondary]/80 hover:shadow-xl hover:-translate-y-1 transition-all font-semibold shadow-md"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back to Services</span>
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    {/* Left Side - Image Gallery */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Main Image - Keep Original Size */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="backdrop-blur-xl bg-[--color-card]/70 rounded-3xl overflow-hidden shadow-xl border-2 border-[--color-border]"
                        >
                            <div className="aspect-video flex items-center justify-center bg-gradient-to-br from-[--color-primary]/10 via-[--color-accent]/10 to-[--color-primary]/10">
                                {activeImage ? (
                                    <img
                                        src={activeImage}
                                        alt={service.title}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="text-6xl">🎨</div>
                                )}
                            </div>
                        </motion.div>

                        {/* Thumbnail Strip - Small and Compact */}
                        {service.thumbnailImages && service.thumbnailImages.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.1 }}
                                className="grid grid-cols-4 gap-3"
                            >
                                {[service.mainImage, ...service.thumbnailImages.slice(0, 3)].filter(Boolean).map((url, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setActiveImage(url!)}
                                        className={`rounded-2xl overflow-hidden aspect-square border-2 transition-all shadow-md hover:shadow-xl ${
                                            activeImage === url
                                                ? 'border-[--color-primary] ring-2 ring-[--color-primary]/30'
                                                : 'border-[--color-border] hover:border-[--color-primary]/50'
                                        }`}
                                    >
                                        <img
                                            src={url!}
                                            alt={`View ${index + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </button>
                                ))}
                            </motion.div>
                        )}

                        {/* About This Service - Move to left */}
                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.2 }}
                        >
                            <Card className="backdrop-blur-xl bg-[--color-card]/70 rounded-3xl shadow-xl border-2 border-[--color-border]">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-lg font-bold text-[--color-text-primary]">About This Service</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-[--color-text-secondary] leading-relaxed">
                                        {service.description}
                                    </p>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* FAQs - Move to left */}
                        {service.faqs && service.faqs.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: 0.25 }}
                            >
                                <Card className="backdrop-blur-xl bg-[--color-card]/70 rounded-3xl shadow-xl border-2 border-[--color-border]">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-lg font-bold text-[--color-text-primary]">Frequently Asked Questions</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <Accordion>
                                            {service.faqs.map((faq, index) => (
                                                <AccordionItem key={index} value={`item-${index}`}>
                                                    <AccordionTrigger className="text-sm font-semibold text-left py-3 text-[--color-text-primary]">
                                                        {faq.question}
                                                    </AccordionTrigger>
                                                    <AccordionContent className="text-sm text-[--color-text-secondary]">
                                                        {faq.answer}
                                                    </AccordionContent>
                                                </AccordionItem>
                                            ))}
                                        </Accordion>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )}
                    </div>

                    {/* Right Side - Service Details */}
                    <div className="lg:col-span-3 space-y-4">
                        {/* Service Header Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                        >
                            <Card className="backdrop-blur-xl bg-[--color-card]/70 rounded-3xl shadow-xl border-2 border-[--color-border]">
                                <CardContent className="p-6">
                                    {/* Service Title */}
                                    <h1 className="text-2xl md:text-3xl font-bold mb-4 mt-4 text-[--color-text-primary]">
                                        {service.title}
                                    </h1>

                                    {/* Brand Info with Rating */}
                                    <div className="flex items-center gap-3 mb-4 pb-4 border-b-2 border-[--color-border]">
                                        <div className="relative">
                                            {brandData.logoUrl ? (
                                                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[--color-border]">
                                                    <img
                                                        src={brandData.logoUrl}
                                                        alt={brandData.brandName}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[--color-primary] to-[--color-accent] flex items-center justify-center text-white text-xl font-bold">
                                                    🎨
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="text-base font-bold text-[--color-text-primary]">
                                                    {brandData.brandName}
                                                </h3>
                                                <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-primary)' }}>
                                                    <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm">
                                                <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                                                <span className="font-semibold text-[--color-text-primary]">
                                                    {service.stats.rating?.toFixed(1) || '4.8'}
                                                </span>
                                                <span className="text-[--color-text-secondary]">
                                                    ({service.stats.reviews || 0} reviews)
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Rating Badge */}
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg border-2 shadow-md" style={{ backgroundColor: 'var(--color-success-bg)', borderColor: 'var(--color-success-icon)' }}>
                                            <span className="font-bold text-sm" style={{ color: 'var(--color-success-fg)' }}>⚡</span>
                                            <span className="text-sm font-semibold" style={{ color: 'var(--color-success-fg)' }}>
                                                {service.stats.rating?.toFixed(1) || '4.8'}
                                            </span>
                                            <span className="text-xs" style={{ color: 'var(--color-success-fg)' }}>
                                                ({service.stats.reviews || 234} reviews)
                                            </span>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-sm font-semibold border-2 border-[--color-border] text-[--color-text-primary]"
                                        >
                                            Details
                                        </Button>
                                    </div>

                                    {/* Select Package Header */}
                                    <div className="mb-4">
                                        <h2 className="text-base font-bold text-[--color-text-primary]">
                                            Select a Package
                                        </h2>
                                    </div>

                                    {/* Packages Display */}
                                    {service.pricing.type === 'fixed' && service.pricing.packages && service.pricing.packages.length > 0 ? (
                                        <div className="space-y-3">
                                            {service.pricing.packages.map((pkg, index) => (
                                                <div
                                                    key={pkg.id}
                                                    className="border-2 border-[--color-border] rounded-2xl p-4 hover:border-[--color-primary] hover:shadow-lg transition-all cursor-pointer bg-[--color-bg-secondary]/30"
                                                    onClick={() => handlePackageSelect(pkg)}
                                                >
                                                    <div className="flex items-start justify-between mb-3">
                                                        <div className="flex-1">
                                                            <h3 className="text-lg font-bold text-[--color-text-primary] mb-1">
                                                                {pkg.name}
                                                            </h3>
                                                            <p className="text-xs text-[--color-text-secondary] mb-2">
                                                                {pkg.features[0] || 'Professional service package'}
                                                            </p>
                                                        </div>
                                                        <div className="text-right ml-4">
                                                            <div className="text-xl font-bold" style={{ color: 'var(--color-primary)' }}>
                                                                {convertingPrices ? (
                                                                    <span className="text-sm opacity-60">Converting...</span>
                                                                ) : (
                                                                    `${packagePricesInFOG[pkg.id]?.toFixed(2) || '0.00'} FOG`
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-4 text-xs text-[--color-text-secondary] mb-3">
                                                        <div className="flex items-center gap-1">
                                                            <span>⏱️</span>
                                                            <span>{pkg.deliveryTime}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <span>🔄</span>
                                                            <span>{pkg.features.length} features</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}

                                            {/* Order Services Button */}
                                            <Button
                                                onClick={() => {
                                                    if (service.pricing.packages && service.pricing.packages[0]) {
                                                        handlePackageSelect(service.pricing.packages[0]);
                                                    }
                                                }}
                                                size="lg"
                                                className="w-full text-white font-bold rounded-2xl h-12 text-base mt-2 shadow-xl hover:shadow-2xl transition-all"
                                                style={{ backgroundColor: 'var(--color-primary)' }}
                                            >
                                                Order Services
                                            </Button>
                                            <p className="text-xs text-center text-[--color-text-secondary] mt-2">
                                                + Average delivery: 3 days
                                            </p>
                                        </div>
                                    ) : service.pricing.type === 'hourly' && service.pricing.hourlyRate ? (
                                        <div className="space-y-3">
                                            <div className="border-2 border-[--color-border] rounded-2xl p-4 bg-[--color-bg-secondary]/30">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <h3 className="text-lg font-bold text-[--color-text-primary] mb-1">
                                                            Hourly Rate
                                                        </h3>
                                                        <p className="text-xs text-[--color-text-secondary]">
                                                            Minimum {service.pricing.hourlyRate.minimumHours} hours required
                                                        </p>
                                                    </div>
                                                    <div className="text-right ml-4">
                                                        <div className="text-xl font-bold" style={{ color: 'var(--color-primary)' }}>
                                                            {convertingPrices ? (
                                                                <span className="text-sm opacity-60">Converting...</span>
                                                            ) : (
                                                                `${hourlyRateInFOG?.toFixed(2) || '0.00'} FOG/hr`
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <Button
                                                onClick={handleHourlyRateSelect}
                                                size="lg"
                                                className="w-full text-white font-bold rounded-2xl h-12 shadow-xl hover:shadow-2xl transition-all"
                                                style={{ backgroundColor: 'var(--color-primary)' }}
                                            >
                                                Order Services
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="text-center py-6 border-2 border-[--color-border] rounded-2xl bg-[--color-bg-secondary]/30">
                                            <MessageSquare className="w-10 h-10 mx-auto mb-2" style={{ color: 'var(--color-text-secondary)' }} />
                                            <p className="text-base font-semibold mb-1 text-[--color-text-primary]">Contact for Pricing</p>
                                            <p className="text-sm text-[--color-text-secondary] mb-4">
                                                Custom quote required
                                            </p>
                                            <Button
                                                onClick={() => navigate('messages', {
                                                    brandId: brandData.id,
                                                    serviceInquiry: { serviceName: service.title, contactForPricing: true }
                                                })}
                                                size="lg"
                                                className="text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all"
                                                style={{ backgroundColor: 'var(--color-primary)' }}
                                            >
                                                <MessageSquare size={16} className="mr-2" />
                                                Request Quote
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* About The Brand */}
                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.3 }}
                        >
                            <Card className="backdrop-blur-xl bg-[--color-card]/70 rounded-3xl shadow-xl border-2 border-[--color-border]">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-lg font-bold text-[--color-text-primary]">About The Brand</CardTitle>
                                </CardHeader>
                                <CardContent className="flex items-center gap-3">
                                    {brandData.logoUrl ? (
                                        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[--color-border] flex-shrink-0">
                                            <img
                                                src={brandData.logoUrl}
                                                alt={brandData.brandName}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    ) : (
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[--color-primary] to-[--color-accent] flex-shrink-0 flex items-center justify-center text-white text-lg font-bold">
                                            {brandData.brandName.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <h3 className="font-bold text-base text-[--color-text-primary] mb-0.5">
                                            {brandData.brandName}
                                        </h3>
                                        <p className="text-xs text-[--color-text-secondary] mb-1">
                                            {brandData.tagline}
                                        </p>
                                        <Button
                                            variant="link"
                                            className="p-0 h-auto font-semibold text-xs"
                                            style={{ color: 'var(--color-primary)' }}
                                            onClick={() => navigate('fog-service-brand', brandData.id, { name: brandData.brandName })}
                                        >
                                            View Brand Profile
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const CommentSection = () => {
    const [comments, setComments] = useState([
      { id: 1, user: 'Sarah K.', avatar: 'SK', text: 'Does the final delivery include source files? I need them for my own designer.', time: '2 days ago' },
      { id: 2, user: 'Michael T.', avatar: 'MT', text: 'Incredible work! The logo they designed for my startup was exactly what I envisioned. Highly recommend.', time: '5 days ago' },
    ]);
    const [newComment, setNewComment] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (newComment.trim() === '') return;
      
      const commentToAdd = {
        id: Date.now(),
        user: 'Alex Johnson', // Mock logged-in user
        avatar: 'AJ',
        text: newComment,
        time: 'Just now',
      };
      setComments([commentToAdd, ...comments]);
      setNewComment('');
    };

    return (
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.35 }}>
        <Card>
          <CardHeader><CardTitle>Comments & Reviews ({comments.length})</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="mb-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[--color-bg-tertiary] flex items-center justify-center font-bold text-sm">AJ</div>
                <div className="flex-1">
                  <Textarea 
                    placeholder="Ask a question or leave a review..." 
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                  />
                  <Button type="submit" className="mt-2">Post Comment</Button>
                </div>
              </div>
            </form>
            <div className="space-y-6">
              {/* {comments.map(comment => (
                <div key={comment.id} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-[--color-bg-tertiary] flex-shrink-0 flex items-center justify-center font-bold text-sm">{comment.avatar}</div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{comment.user}</p>
                      <p className="text-xs text-[--color-text-secondary]">{comment.time}</p>
                    </div>
                    <p className="text-[--color-text-secondary] mt-1">{comment.text}</p>
                  </div>
                </div>
              ))} */}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

export default FogServiceDetailPage;