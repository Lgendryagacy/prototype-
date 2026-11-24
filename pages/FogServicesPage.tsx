import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { type Route } from '../types';
import { Input } from '../components/ui/Input';
import {
  Search, ShoppingBag, Loader2, Star, Package, ArrowLeft,
  CheckCircle2, Clock
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card, CardContent } from '../components/ui/Card';
import { SearchableSelect } from '../components/ui/SearchableSelect';
import { useBrand } from '../firebase/hooks/useBrand';
import { useApprovedBrands } from '../firebase/hooks/useApprovedBrands';
import ApprovedBrandCard from '../components/ApprovedBrandCard';
import { User } from '../firebase/types/user';
import { collection, query, where, orderBy, getDocs, limit, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { BrandService } from '../firebase/types/service';
import { convertPKRtoFOG } from '../firebase/services/servicePaymentService';

interface FogServicesPageProps {
    navigate: (route: Route, context?: any, options?: { name?: string }) => void;
    user?: User | null;
    isLoggedIn?: boolean;
}

type ViewMode = 'brands' | 'services';
const ITEMS_PER_PAGE = 50;
const MAX_VISIBLE_CATEGORIES = 5;

// Animation Variants
const fadeUp: any = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
};

const scaleIn: any = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } }
};

// ============== ANIMATED BACKGROUND ==============
const AnimatedBackground = () => (
    <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
        <motion.div
            className="absolute w-[500px] h-[500px] rounded-full opacity-40 blur-[80px]"
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
            className="absolute w-[400px] h-[400px] rounded-full opacity-40 blur-[80px]"
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
            className="absolute w-[350px] h-[350px] rounded-full opacity-40 blur-[80px]"
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
    </div>
);

const FogServicesPage = ({ navigate, user, isLoggedIn }: FogServicesPageProps) => {
    const [viewMode, setViewMode] = useState<ViewMode>('services');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    // Restore scroll position and tab when returning from detail pages
    useEffect(() => {
        const shouldReturnToServices = sessionStorage.getItem('return-to-fog-services');
        const shouldReturnToBrands = sessionStorage.getItem('return-to-fog-brands');
        const savedScrollPosition = sessionStorage.getItem('fog-services-scroll-position');

        if (shouldReturnToServices === 'true') {
            // Remove the marker
            sessionStorage.removeItem('return-to-fog-services');
            setViewMode('services');

            // Restore scroll position after a short delay to ensure content is loaded
            if (savedScrollPosition) {
                setTimeout(() => {
                    window.scrollTo({
                        top: parseInt(savedScrollPosition, 10),
                        behavior: 'smooth'
                    });
                    sessionStorage.removeItem('fog-services-scroll-position');
                }, 100);
            }
        } else if (shouldReturnToBrands === 'true') {
            // Remove the marker
            sessionStorage.removeItem('return-to-fog-brands');
            setViewMode('brands');

            // Restore scroll position after a short delay to ensure content is loaded
            if (savedScrollPosition) {
                setTimeout(() => {
                    window.scrollTo({
                        top: parseInt(savedScrollPosition, 10),
                        behavior: 'smooth'
                    });
                    sessionStorage.removeItem('fog-services-scroll-position');
                }, 100);
            }
        }
    }, []);

    // Brand-related states
    const { brandRequest, brand, getBrandStatus, canCreateBrand, loading: brandLoading } = useBrand(user?.uid);
    const { brands: approvedBrands, categories: brandCategories, loading: brandsLoading, error: brandsError, getBrandsByCategory } = useApprovedBrands();

    // Service-related states
    const [services, setServices] = useState<BrandService[]>([]);
    const [servicesLoading, setServicesLoading] = useState(false);
    const [servicesError, setServicesError] = useState<string | null>(null);
    const [serviceCategories, setServiceCategories] = useState<string[]>(['All']);

    // Fetch all services
    useEffect(() => {
        const fetchServices = async () => {
            try {
                setServicesLoading(true);
                setServicesError(null);

                // Query to get all non-frozen services
                const q = query(
                    collection(db, 'BrandsServices'),
                    where('status', '!=', 'frozen'),
                    orderBy('status'),
                    orderBy('createdAt', 'desc'),
                    limit(1000) // Fetch up to 1000 services for client-side filtering
                );

                const querySnapshot = await getDocs(q);



                const fetchedServices: BrandService[] = querySnapshot.docs.map(doc => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        title: data.title,
                        description: data.description,
                        categories: data.categories || [],
                        mainImage: data.mainImage,
                        thumbnailImages: data.thumbnailImages || [],
                        pricing: data.pricing,
                        faqs: data.faqs || [],
                        brandId: data.brandId,
                        brandName: data.brandName,
                        brandTagline: data.brandTagline,
                        brandLogo: data.brandLogo,
                        brandDescription: data.brandDescription,
                        userId: data.userId,
                        status: data.status,
                        soldOut: data.soldOut || false,
                        createdAt: data.createdAt.toDate(),
                        updatedAt: data.updatedAt.toDate(),
                        stats: data.stats || {
                            views: 0,
                            orders: 0,
                            rating: 0,
                            reviews: 0
                        }
                    };
                });


                // Filter out services whose brands are frozen
                // Get unique brand IDs
                const brandIds = [...new Set(fetchedServices.map(s => s.brandId))];

                // Fetch brand statuses
                const brandStatusMap = new Map<string, string>();
                await Promise.all(
                    brandIds.map(async (brandId) => {
                        try {
                            const brandDoc = await getDoc(doc(db, 'brands', brandId));
                            if (brandDoc.exists()) {
                                brandStatusMap.set(brandId, brandDoc.data().status || 'active');
                            }
                        } catch (error) {
                            console.error(`Error fetching brand ${brandId}:`, error);
                        }
                    })
                );

                // Filter services - only show if brand is not frozen AND service is not sold out
                const activeServices = fetchedServices.filter(service => {
                    const brandStatus = brandStatusMap.get(service.brandId);
                    return brandStatus !== 'frozen' && !service.soldOut;
                });

                setServices(activeServices);

                // Extract unique categories from active services
                const categoriesSet = new Set<string>();
                activeServices.forEach(service => {
                    if (service.categories && Array.isArray(service.categories)) {
                        service.categories.forEach(cat => {
                            if (cat && cat.trim()) {
                                categoriesSet.add(cat);
                            }
                        });
                    }
                });

                const extractedCategories = ['All', ...Array.from(categoriesSet).sort()];
                setServiceCategories(extractedCategories);

            } catch (err) {
                console.error('Error fetching services:', err);
                setServicesError('Failed to load services');
            } finally {
                setServicesLoading(false);
            }
        };

        fetchServices();
    }, []);

    // Get current categories based on view mode
    const currentCategories = useMemo(() => {
        const categories = viewMode === 'brands' ? brandCategories : serviceCategories;
        return categories.length > 0 ? categories : ['All'];
    }, [viewMode, brandCategories, serviceCategories]);

    // Filter items based on view mode, category, and search
    const filteredItems = useMemo(() => {

        if (viewMode === 'brands') {
            let brandsToShow = getBrandsByCategory(selectedCategory);

            if (searchTerm.trim()) {
                const searchLower = searchTerm.toLowerCase();
                brandsToShow = brandsToShow.filter(brand =>
                    brand.brandName.toLowerCase().includes(searchLower) ||
                    brand.tagline.toLowerCase().includes(searchLower) ||
                    brand.description.toLowerCase().includes(searchLower) ||
                    brand.categories.some(cat => cat.toLowerCase().includes(searchLower))
                );
            }

            return brandsToShow;
        } else {

            let servicesToShow = selectedCategory === 'All'
                ? services
                : services.filter(service => {
                    // Check if service has categories and if the selected category is in them
                    const hasCategory = service.categories &&
                        Array.isArray(service.categories) &&
                        service.categories.some(cat => cat === selectedCategory);
                    return hasCategory;
                });


            if (searchTerm.trim()) {
                const searchLower = searchTerm.toLowerCase();
                servicesToShow = servicesToShow.filter(service =>
                    service.title.toLowerCase().includes(searchLower) ||
                    service.description.toLowerCase().includes(searchLower) ||
                    service.brandName.toLowerCase().includes(searchLower) ||
                    (service.categories && service.categories.some(cat => cat.toLowerCase().includes(searchLower)))
                );
            }

            return servicesToShow;
        }
    }, [viewMode, selectedCategory, searchTerm, getBrandsByCategory, services]);

    // Pagination
    const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
    const paginatedItems = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        return filteredItems.slice(startIndex, endIndex);
    }, [filteredItems, currentPage]);

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [viewMode, selectedCategory, searchTerm]);

    // Reset category to 'All' when switching view mode
    useEffect(() => {
        setSelectedCategory('All');
    }, [viewMode]);

    const handleBrandAction = () => {
        // Don't do anything if brand data is still loading
        if (brandLoading) {
            return;
        }

        if (!user || !isLoggedIn) {
            navigate('auth');
            return;
        }

        const status = getBrandStatus();

        if (status === 'none' || status === 'rejected') {
            navigate('make-brand-request');
        } else if (status === 'pending') {
            navigate('brand-status');
        } else if (status === 'approved' || status === 'frozen') {
            // Both approved and frozen brands should go to dashboard
            navigate('brand-dashboard');
        }
    };

    const getBrandButtonText = () => {
        // Show loading text while brand data is loading
        if (brandLoading) {
            return 'Loading...';
        }

        if (!user || !isLoggedIn) return 'Make Brand';

        const status = getBrandStatus();

        switch (status) {
            case 'pending':
                return 'Check Request Status';
            case 'approved':
                return 'Manage Brand';
            case 'frozen':
                return 'Manage Brand'; // Frozen brands can still view their dashboard
            case 'rejected':
                return 'Make Brand';
            default:
                return 'Make Brand';
        }
    };

    const shouldShowMakeBrandButton = () => {
        if (!user || !isLoggedIn) return true; // Show for guest users to encourage login
        if (brandLoading) return true; // Show while loading

        // Hide if user is permanently banned from creating brands
        if (brandRequest?.status === 'rejected' && brandRequest?.canResubmit === false) {
            return false;
        }

        return true;
    };


    const isLoading = viewMode === 'brands' ? brandsLoading : servicesLoading;
    const error = viewMode === 'brands' ? brandsError : servicesError;

    return (
        <div className="bg-[--color-bg-base] min-h-screen text-[--color-text-primary] relative overflow-hidden">
            <AnimatedBackground />
            <div className="w-full relative z-10">
                {/* Back Button */}
                <div className="container mx-auto px-4 pt-8">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <button
                            onClick={() => navigate('home')}
                            className="flex items-center gap-2 px-6 py-3 rounded-full backdrop-blur-xl bg-[--color-card]/70 border-2 border-[--color-border] text-[--color-primary] hover:bg-[--color-bg-secondary]/80 hover:shadow-xl hover:-translate-y-1 transition-all font-semibold shadow-md"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>Back to Home</span>
                        </button>
                    </motion.div>
                </div>

                {/* Hero Section */}
                <section className="relative pt-8 pb-16 text-center overflow-hidden">
                    <motion.div variants={fadeUp} initial="hidden" animate="visible" className="container mx-auto px-4">
                        {/* Emoji Badge */}
                        <motion.div
                            className="inline-flex items-center justify-center text-6xl mb-6"
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            🛍️
                        </motion.div>

                        <h2 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter leading-tight text-[--color-text-primary]">
                            Trusted Digital Services  <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[--color-primary] to-[--color-accent]">& Verified Brands</span>
                        </h2>
                        <p className="text-xl md:text-2xl text-[--color-text-secondary] max-w-3xl mx-auto mb-12 font-medium opacity-80">
                            Hire verified brands and professional service providers, or launch your own digital services on Fogsly. Get guaranteed delivery, quality assurance, and secure collaboration through our official curation network.
                        </p>

                        {/* Search Bar with Category */}
                        <div className="max-w-3xl mx-auto backdrop-blur-xl bg-[--color-card]/70 rounded-3xl md:rounded-full p-3 md:p-2.5 mb-8 shadow-2xl flex items-center border-2 border-[--color-border] flex-col md:flex-row gap-3 md:gap-2">
                            <div className="flex-1 flex items-center gap-3 px-4 md:px-6 w-full">
                                <Search className="text-[--color-text-secondary] flex-shrink-0" size={22} />
                                <input
                                    type="text"
                                    placeholder={viewMode === 'brands' ? "Search brands..." : "Search services, brands, or categories..."}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-transparent py-3 md:py-3.5 text-base md:text-lg font-medium outline-none text-[--color-text-primary] placeholder:text-[--color-text-secondary]/50"
                                />
                            </div>
                            <div className="w-full md:w-64 flex-shrink-0 px-2">
                                <SearchableSelect
                                    options={currentCategories || ['All']}
                                    value={selectedCategory}
                                    onChange={(value) => {
                                        // If user clears/resets category, set it to 'All'
                                        setSelectedCategory(value || 'All');
                                    }}
                                    placeholder="All Categories"
                                    className="w-full h-14 bg-[--color-bg-secondary]/50 text-[--color-text-primary] border-[--color-border] rounded-xl"
                                />
                            </div>
                            <Button
                                size="lg"
                                className="w-full md:w-auto px-10 py-3.5 font-bold shadow-lg hover:-translate-y-0.5 transition-all rounded-xl md:rounded-full"
                                style={{
                                    backgroundColor: 'var(--color-primary)',
                                    color: 'white'
                                }}
                            >
                                Search
                            </Button>
                        </div>

                        {/* Services/Brands Toggle Buttons and Make Brand Button */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-0">
                            <div className="flex gap-2">
                                <Button
                                    size="lg"
                                    variant={viewMode === 'services' ? 'default' : 'outline'}
                                    className="rounded-full px-6 md:px-8 h-14 font-bold"
                                    onClick={() => setViewMode('services')}
                                >
                                    <ShoppingBag className="w-4 h-4 mr-2" />
                                    Services
                                </Button>
                                <Button
                                    size="lg"
                                    variant={viewMode === 'brands' ? 'default' : 'outline'}
                                    className="rounded-full px-6 md:px-8 h-14 font-bold"
                                    onClick={() => setViewMode('brands')}
                                >
                                    <Package className="w-4 h-4 mr-2" />
                                    Brands
                                </Button>
                            </div>

                            {shouldShowMakeBrandButton() && (
                                <Button
                                    size="lg"
                                    onClick={handleBrandAction}
                                    disabled={brandLoading}
                                    className="px-8 h-14 font-bold shadow-lg hover:-translate-y-1 transition-all rounded-full"
                                    style={{
                                        backgroundColor: 'var(--color-primary)',
                                        color: 'white',
                                        border: 'none'
                                    }}
                                >
                                    {getBrandButtonText()}
                                </Button>
                            )}
                        </div>
                    </motion.div>
                </section>

                {/* Grid Content */}
                <main className="container mx-auto px-4 pb-16 pt-0">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-16">
                            <div className="text-center">
                                <Loader2 className="h-12 w-12 animate-spin text-[--color-primary] mx-auto mb-4" />
                                <p className="text-[--color-text-secondary] text-lg">Loading {viewMode}...</p>
                            </div>
                        </div>
                    ) : error ? (
                        <div className="text-center py-16">
                            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
                                <p className="text-red-600 font-medium mb-2">Failed to load {viewMode}</p>
                                <p className="text-red-500 text-sm">{error}</p>
                            </div>
                        </div>
                    ) : filteredItems.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="text-6xl mb-4">😞</div>
                            <h3 className="text-xl font-semibold text-[--color-text-primary] mb-2">
                                {searchTerm ? `No ${viewMode} found` : `No ${viewMode} in this category`}
                            </h3>
                            <p className="text-[--color-text-secondary] max-w-md mx-auto">
                                {searchTerm
                                    ? `No ${viewMode} match "${searchTerm}". Try adjusting your search terms.`
                                    : `There are no ${viewMode} in this category yet. Check back later!`
                                }
                            </p>
                            {searchTerm && (
                                <Button
                                    variant="outline"
                                    onClick={() => setSearchTerm('')}
                                    className="mt-4"
                                >
                                    Clear Search
                                </Button>
                            )}
                        </div>
                    ) : (
                        <>
                            {viewMode === 'services' ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                                    {paginatedItems.map((service: any, idx) => (
                                        <ServiceCard
                                            key={service.id}
                                            service={service}
                                            navigate={navigate}
                                            index={idx}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                                    {paginatedItems.map((brand: any, idx) => (
                                        <BrandCard
                                            key={brand.id}
                                            brand={brand}
                                            navigate={navigate}
                                            index={idx}
                                            services={services}
                                        />
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </main>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="container mx-auto px-4 pb-12">
                        <div className="flex justify-center items-center gap-2 mt-8">
                            <Button
                                variant="outline"
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className="rounded-full w-10 h-10 p-0"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </Button>

                            <div className="flex gap-2">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                                    if (
                                        page === 1 ||
                                        page === totalPages ||
                                        (page >= currentPage - 1 && page <= currentPage + 1)
                                    ) {
                                        return (
                                            <Button
                                                key={page}
                                                variant={currentPage === page ? 'default' : 'outline'}
                                                onClick={() => setCurrentPage(page)}
                                                className="rounded-full w-10 h-10 p-0"
                                            >
                                                {page}
                                            </Button>
                                        );
                                    } else if (
                                        page === currentPage - 2 ||
                                        page === currentPage + 2
                                    ) {
                                        return <span key={page} className="flex items-center">...</span>;
                                    }
                                    return null;
                                })}
                            </div>

                            <Button
                                variant="outline"
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                                className="rounded-full w-10 h-10 p-0"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// Brand Card Component with new design
const BrandCard = ({ brand, navigate, index, services }: {
    brand: any;
    navigate: (route: Route, context?: any, options?: { name?: string }) => void;
    index: number;
    services: BrandService[];
}) => {
    // Calculate dynamic stats from services
    const brandServices = services.filter(s => s.brandId === brand.id);
    const serviceCount = brandServices.length;

    // Calculate average rating from all brand services
    const totalRating = brandServices.reduce((sum, service) => sum + (service.stats?.rating || 0), 0);
    const averageRating = serviceCount > 0 ? (totalRating / serviceCount).toFixed(1) : '0.0';

    const handleCardClick = () => {
        // Save current scroll position and set marker to return to brands tab
        sessionStorage.setItem('fog-services-scroll-position', window.scrollY.toString());
        sessionStorage.setItem('return-to-fog-brands', 'true');
        navigate('fog-service-brand', brand.id, { name: brand.brandName });
    };

    return (
        <motion.div
            variants={scaleIn}
            initial="hidden"
            animate="visible"
            transition={{ delay: index * 0.05 }}
            className="group cursor-pointer h-full"
            onClick={handleCardClick}
        >
            <Card className="rounded-[40px] p-8 text-center backdrop-blur-xl bg-[--color-card]/70 border-2 border-[--color-border] hover:bg-[--color-bg-secondary]/80 hover:shadow-2xl hover:border-[--color-primary]/30 transition-all hover:-translate-y-2 h-full flex flex-col shadow-xl">
                <div className="w-24 h-24 mx-auto rounded-full bg-[--color-primary]/10 flex items-center justify-center text-5xl mb-6 shadow-inner ring-4 ring-white/5 overflow-hidden">
                    {brand.logoUrl ? (
                        <img src={brand.logoUrl} alt={brand.brandName} className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-3xl font-semibold text-[--color-primary]">{brand.brandName[0]}</span>
                    )}
                </div>
                <div className="flex items-center justify-center gap-2 mb-2">
                    <h3 className="text-xl font-semibold text-[--color-text-primary] truncate">{brand.brandName}</h3>
                    <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold">✓</div>
                </div>
                <p className="text-sm font-medium text-[--color-text-secondary] opacity-60 mb-6 uppercase tracking-tighter truncate">{brand.tagline}</p>
                <div className="flex justify-center gap-10 mb-8 pt-6 border-t border-white/10 mt-auto">
                    <div>
                        <p className="text-2xl font-bold text-[--color-primary]">{serviceCount}</p>
                        <p className="text-[9px] font-bold uppercase text-[--color-text-secondary] tracking-widest opacity-50">Services</p>
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-[--color-primary]">{averageRating}</p>
                        <p className="text-[9px] font-bold uppercase text-[--color-text-secondary] tracking-widest opacity-50">Rating</p>
                    </div>
                </div>
                <Button className="w-full rounded-2xl h-12 font-semibold group-hover:scale-105 transition-transform">View Profile</Button>
            </Card>
        </motion.div>
    );
};

// Service Card Component with new design
const ServiceCard = ({ service, navigate, index }: { service: BrandService; navigate: (route: Route, context?: any, options?: { name?: string }) => void; index: number }) => {
    const [displayPrice, setDisplayPrice] = useState<string>('Loading...');
    const [isConverting, setIsConverting] = useState(true);

    const firstPackage = service.pricing.type === 'fixed' && service.pricing.packages && service.pricing.packages.length > 0
        ? service.pricing.packages[0]
        : null;

    const hourlyRate = service.pricing.type === 'hourly' && service.pricing.hourlyRate
        ? service.pricing.hourlyRate
        : null;

    const deliveryTime = firstPackage?.deliveryTime || 'Varies';
    const priceType = service.pricing.type;

    // Convert price to FOG coins
    useEffect(() => {
        const convertPrice = async () => {
            try {
                setIsConverting(true);
                if (firstPackage) {
                    const conversion = await convertPKRtoFOG(firstPackage.price);
                    setDisplayPrice(`${conversion.priceInFOG.toFixed(2)} FOG`);
                } else if (hourlyRate) {
                    const conversion = await convertPKRtoFOG(hourlyRate.rate);
                    setDisplayPrice(`${conversion.priceInFOG.toFixed(2)} FOG/hr`);
                } else {
                    setDisplayPrice('Contact for price');
                }
            } catch (error) {
                console.error('Error converting price:', error);
                setDisplayPrice('Price unavailable');
            } finally {
                setIsConverting(false);
            }
        };
        convertPrice();
    }, [firstPackage, hourlyRate]);

    const handleCardClick = () => {
        // Save current scroll position and set marker to return to services tab
        sessionStorage.setItem('fog-services-scroll-position', window.scrollY.toString());
        sessionStorage.setItem('return-to-fog-services', 'true');
        navigate('fog-service-detail', service.id, { name: service.title });
    };

    return (
        <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: index * 0.05 }}
            className="group cursor-pointer h-full"
            onClick={handleCardClick}
        >
            <Card className="rounded-3xl overflow-hidden backdrop-blur-xl bg-[--color-card]/70 border-2 border-[--color-border] hover:bg-[--color-bg-secondary]/80 hover:shadow-2xl hover:border-[--color-primary]/30 transition-all hover:-translate-y-2 h-full flex flex-col shadow-xl">
                <div className="aspect-video bg-gradient-to-br from-[--color-primary]/10 to-[--color-accent]/10 relative overflow-hidden">
                    {service.mainImage ? (
                        <img
                            src={service.mainImage}
                            alt={service.title}
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-125 transition-transform duration-700"
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-6xl opacity-20">
                            {service.brandLogo ? service.brandLogo : service.brandName[0]}
                        </div>
                    )}
                    <div className="absolute top-4 left-4">
                        <Badge className="bg-black/60 backdrop-blur-md border-white/10 uppercase font-semibold text-[9px] tracking-widest">
                            {service.categories[0] || 'Service'}
                        </Badge>
                    </div>
                </div>
                <CardContent className="p-6 pt-4 flex-1 flex flex-col">
                    <div className="flex items-center gap-3 mb-4 mt-2">
                        <div className="w-10 h-10 rounded-full bg-[--color-primary]/10 flex items-center justify-center text-xl shadow-inner border border-white/10 overflow-hidden">
                            {service.brandLogo ? (
                                <img src={service.brandLogo} alt={service.brandName} className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-sm font-semibold">{service.brandName[0]}</span>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                                <span className="font-semibold text-xs truncate text-[--color-text-secondary] uppercase tracking-tighter">{service.brandName}</span>
                                <div className="w-3.5 h-3.5 bg-blue-500 rounded-full flex items-center justify-center text-white text-[8px] font-bold">✓</div>
                            </div>
                        </div>
                    </div>
                    <h3 className="text-lg font-semibold mb-4 leading-tight h-12 line-clamp-2 group-hover:text-[--color-primary] transition-colors">{service.title}</h3>
                    <div className="flex items-center gap-2 mb-6">
                        <Star className="text-yellow-500 fill-yellow-500" size={16} />
                        <span className="font-semibold text-sm">{service.stats.rating || 0}</span>
                        <span className="text-xs text-[--color-text-secondary] font-medium">({service.stats.reviews || 0})</span>
                    </div>
                    <div className="flex items-center justify-between pt-5 border-t border-white/10 mt-auto">
                        <div className="flex flex-col">
                            <span className="text-[9px] font-bold text-[--color-text-secondary] uppercase tracking-widest opacity-50">Delivery</span>
                            <span className="font-semibold text-xs uppercase">{deliveryTime}</span>
                        </div>
                        <div className="text-right">
                            <p className="text-lg font-bold text-[--color-primary]">
                                {isConverting ? (
                                    <span className="text-xs opacity-60">Converting...</span>
                                ) : (
                                    priceType === 'hourly' ? displayPrice : `From ${displayPrice}`
                                )}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
};

export default FogServicesPage;