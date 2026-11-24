
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { type Route } from '../types';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ArrowLeft, Star, MessageSquare, ExternalLink, Calendar, Award, Users, Loader2, UserPlus, UserCheck, Package, Search } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebase/config';
import { Brand } from '../firebase/types/brand';
import { BrandService } from '../firebase/types/service';
import { getBrandServices } from '../firebase/services/brandServiceService';
import { followBrand, unfollowBrand, isFollowingBrand } from '../firebase/services/brandService';
import { convertPKRtoFOG } from '../firebase/services/servicePaymentService';

// Animation variants
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } }
};

const FogServiceBrandPage = ({ navigate, context: brandId }: { navigate: (route: Route, context?: any, options?: { name?: string }) => void; context: any; }) => {
  const [brand, setBrand] = useState<Brand | null>(null);
  const [services, setServices] = useState<BrandService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [isHoveringFollow, setIsHoveringFollow] = useState(false);
  const [activeTab, setActiveTab] = useState<'active' | 'soldOut'>('active');
  const [servicePricesInFOG, setServicePricesInFOG] = useState<{ [serviceId: string]: string }>({});
  const [convertingPrices, setConvertingPrices] = useState(false);

  const currentUser = auth.currentUser;

  // Filter services based on search term and active tab
  const filteredServices = services.filter(service => {
    const matchesSearch = service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.categories.some(cat => cat.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesTab = activeTab === 'active' ? !service.soldOut : service.soldOut;

    return matchesSearch && matchesTab;
  });

  useEffect(() => {
    const fetchBrandAndServices = async () => {
      if (!brandId) {
        setError('Brand ID not provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Fetch brand details
        const brandDoc = await getDoc(doc(db, 'brands', brandId));

        if (!brandDoc.exists()) {
          setError('Brand not found');
          return;
        }

        const data = brandDoc.data();
        const brandData: Brand = {
          id: brandDoc.id,
          userId: data.userId,
          brandName: data.brandName,
          tagline: data.tagline,
          description: data.description,
          whatsappChannel: data.whatsappChannel,
          logoUrl: data.logoUrl || '',
          categories: data.categories || [],
          followers: data.followers || [],
          status: data.status,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
          services: data.services || [],
          stats: data.stats || {
            totalOrders: 0,
            totalEarnings: 0,
            rating: 0,
            reviews: 0,
            followers: 0
          }
        };

        setBrand(brandData);

        // Check follow status if user is logged in
        if (currentUser) {
          const followStatus = await isFollowingBrand(brandId, currentUser.uid);
          setIsFollowing(followStatus);
        }

        // Check if brand is frozen - redirect to marketplace
        if (brandData.status === 'frozen') {
          setError('This brand is currently unavailable');
          setTimeout(() => navigate('fog-services'), 2000);
          return;
        }

        // Fetch brand services (only active ones for display, but get all for tabs)
        const brandServices = await getBrandServices(brandId);
        // Filter out frozen services (but keep sold-out services for the sold-out tab)
        const activeServices = brandServices.filter(service => service.status === 'active');
        setServices(activeServices);

      } catch (err) {
        console.error('Error fetching brand:', err);
        setError('Failed to load brand details');
      } finally {
        setLoading(false);
      }
    };

    fetchBrandAndServices();
  }, [brandId, currentUser]);

  // Convert service prices to FOG coins
  useEffect(() => {
    const convertAllPrices = async () => {
      if (services.length === 0) return;
      
      try {
        setConvertingPrices(true);
        const priceConversions: { [serviceId: string]: string } = {};
        
        for (const service of services) {
          const firstPackage = service.pricing.type === 'fixed' && service.pricing.packages?.[0];
          const hourlyRate = service.pricing.type === 'hourly' && service.pricing.hourlyRate;
          
          if (firstPackage) {
            const conversion = await convertPKRtoFOG(firstPackage.price);
            priceConversions[service.id] = `${conversion.priceInFOG.toFixed(2)} FOG`;
          } else if (hourlyRate) {
            const conversion = await convertPKRtoFOG(hourlyRate.rate);
            priceConversions[service.id] = `${conversion.priceInFOG.toFixed(2)} FOG/hr`;
          } else {
            priceConversions[service.id] = 'Contact for price';
          }
        }
        
        setServicePricesInFOG(priceConversions);
      } catch (error) {
        console.error('Error converting prices to FOG:', error);
      } finally {
        setConvertingPrices(false);
      }
    };
    
    convertAllPrices();
  }, [services]);

  // Handle follow/unfollow
  const handleFollowToggle = async () => {
    if (!currentUser) {
      navigate('auth', 'login');
      return;
    }

    if (!brand) return;

    setFollowLoading(true);
    try {
      if (isFollowing) {
        const result = await unfollowBrand(brand.id, currentUser.uid);
        if (result.success) {
          setIsFollowing(false);
          // Update local brand stats
          setBrand(prev => prev ? {
            ...prev,
            stats: {
              ...prev.stats,
              followers: Math.max(0, (prev.stats.followers || 0) - 1)
            }
          } : null);
        } else {
          console.error('Failed to unfollow:', result.error);
        }
      } else {
        const result = await followBrand(brand.id, currentUser.uid);
        if (result.success) {
          setIsFollowing(true);
          // Update local brand stats
          setBrand(prev => prev ? {
            ...prev,
            stats: {
              ...prev.stats,
              followers: (prev.stats.followers || 0) + 1
            }
          } : null);
        } else {
          console.error('Failed to follow:', result.error);
        }
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
    } finally {
      setFollowLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-[--color-bg-base] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-16 w-16 animate-spin text-[--color-primary] mx-auto mb-4" />
          <p className="text-[--color-text-secondary] text-lg font-medium">Loading brand details...</p>
        </div>
      </div>
    );
  }

  if (error || !brand) {
    return (
      <div className="bg-[--color-bg-base] min-h-screen flex flex-col items-center justify-center p-4">
        <motion.div
          className="text-center max-w-md"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="text-8xl mb-6">😞</div>
          <h1 className="text-3xl font-black mb-3 text-[--color-text-primary]">Brand Not Found</h1>
          <p className="text-[--color-text-secondary] mb-8 text-lg">{error || 'The brand you are looking for does not exist.'}</p>
          <Button
            onClick={() => navigate('fog-services')}
            size="lg"
            className="rounded-full px-8 py-6 text-lg font-bold shadow-xl hover:-translate-y-1 transition-transform"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to All Brands
          </Button>
        </motion.div>
      </div>
    );
  }

  const joinedDate = brand.createdAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long'
  });

  const activeServicesCount = services.filter(s => !s.soldOut).length;
  const soldOutServicesCount = services.filter(s => s.soldOut).length;

  return (
    <div className="bg-[--color-bg-base] min-h-screen relative overflow-hidden">
      {/* Animated Background Blobs */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
        <motion.div
          className="absolute w-[500px] h-[500px] rounded-full opacity-30 blur-[100px]"
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
          className="absolute w-[400px] h-[400px] rounded-full opacity-30 blur-[100px]"
          style={{
            background: 'radial-gradient(circle, var(--color-accent) 0%, transparent 70%)',
            top: '40%',
            right: '10%'
          }}
          animate={{
            x: [0, -40, 30, -20, 0],
            y: [0, 40, -30, 20, 0],
            scale: [1, 0.9, 1.1, 0.95, 1]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut', delay: 5 }}
        />
      </div>

      <div className="w-full relative z-10">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-8">
          {/* Back Button */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <button
              onClick={() => navigate('fog-services')}
              className="flex items-center gap-2 px-6 py-3 rounded-full backdrop-blur-xl bg-[--color-card]/70 border-2 border-[--color-border] text-[--color-primary] hover:bg-[--color-bg-secondary]/80 hover:shadow-xl hover:-translate-y-1 transition-all font-semibold shadow-md"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to All Brands</span>
            </button>
          </motion.div>

          {/* Brand Header Card */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="backdrop-blur-xl bg-[--color-card]/70 border-2 border-[--color-border] rounded-[40px] p-8 md:p-12 shadow-2xl mb-8"
          >
            <div className="flex flex-col lg:flex-row items-start gap-8">
              {/* Logo */}
              <div className="relative mx-auto lg:mx-0">
                {brand.logoUrl ? (
                  <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden ring-8 ring-white/10 shadow-2xl">
                    <img
                      src={brand.logoUrl}
                      alt={`${brand.brandName} logo`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-[--color-primary] to-[--color-accent] flex items-center justify-center text-white font-black text-5xl ring-8 ring-white/10 shadow-2xl">
                    {brand.brandName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                )}
                {/* Verified Badge */}
                <div
                  className="absolute bottom-1 right-1 md:bottom-2 md:right-2 w-7 h-7 md:w-10 md:h-10 rounded-full flex items-center justify-center text-white text-sm md:text-lg font-bold shadow-lg ring-2 md:ring-4 ring-white/20"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                >
                  ✓
                </div>
              </div>

              <div className="flex-1 w-full">
                {/* Title and Follow Button */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                  <div className="flex-1 min-w-0">
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-[--color-text-primary] tracking-tight leading-tight mb-2">
                      {brand.brandName}
                    </h1>
                    <p className="text-base md:text-lg text-[--color-text-secondary] font-normal opacity-70">
                      {brand.tagline}
                    </p>
                  </div>

                  {/* Follow Button - Hide if user owns the brand */}
                  {currentUser?.uid !== brand.userId && (
                    <Button
                      variant={isFollowing ? "outline" : "default"}
                      size="lg"
                      onClick={handleFollowToggle}
                      disabled={followLoading || !currentUser}
                      onMouseEnter={() => setIsHoveringFollow(true)}
                      onMouseLeave={() => setIsHoveringFollow(false)}
                      className={`flex-shrink-0 self-start sm:self-auto rounded-full px-8 py-6 font-bold text-lg shadow-xl hover:-translate-y-1 transition-all ${
                        isFollowing && isHoveringFollow
                          ? 'border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-950'
                          : ''
                      }`}
                      title={!currentUser ? 'Login to follow this brand' : ''}
                    >
                      {followLoading ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          <span>{isFollowing ? 'Unfollowing...' : 'Following...'}</span>
                        </>
                      ) : isFollowing ? (
                        <>
                          <UserCheck className="w-5 h-5 mr-2" />
                          <span>{isHoveringFollow ? 'Unfollow' : 'Following'}</span>
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-5 h-5 mr-2" />
                          <span>Follow</span>
                        </>
                      )}
                    </Button>
                  )}
                </div>

                {/* Stats Row */}
                <div className="flex flex-wrap items-center gap-6 mb-6">
                  <div className="flex items-center gap-2">
                    <Star size={20} className="fill-yellow-400 text-yellow-400" />
                    <span className="font-black text-xl text-[--color-text-primary]">
                      {brand.stats.rating || 4.9}
                    </span>
                    <span className="text-[--color-text-secondary] font-semibold">
                      ({brand.stats.reviews || 0} reviews)
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[--color-text-secondary]">
                    <Users size={18} />
                    <span className="font-semibold">{brand.stats.followers || 0} Followers</span>
                  </div>
                  <div className="flex items-center gap-2 text-[--color-text-secondary]">
                    <Calendar size={18} />
                    <span className="font-semibold">Joined {joinedDate}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[--color-text-secondary]">
                    <Package size={18} />
                    <span className="font-semibold">{services.length} Services</span>
                  </div>
                </div>

                {/* Categories */}
                <div className="flex flex-wrap gap-2 mb-8">
                  {brand.categories.map((category) => (
                    <Badge
                      key={category}
                      className="px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider border-2"
                      style={{
                        backgroundColor: 'var(--color-primary)',
                        color: 'var(--color-bg-primary)',
                        borderColor: 'var(--color-primary)'
                      }}
                    >
                      {category}
                    </Badge>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row flex-wrap gap-4">
                  <Button
                    size="lg"
                    onClick={() => navigate('messages', { brandId: brand.id })}
                    className="rounded-full px-10 py-6 font-bold text-lg shadow-2xl hover:-translate-y-1 transition-all"
                  >
                    <MessageSquare size={20} className="mr-2" />
                    Message Brand
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => window.open(brand.whatsappChannel, '_blank')}
                    className="rounded-full px-10 py-6 border-2 font-bold text-lg shadow-xl hover:-translate-y-1 transition-all"
                  >
                    <ExternalLink size={20} className="mr-2" />
                    WhatsApp Channel
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* About Section */}
              <motion.div
                variants={scaleIn}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.1 }}
                className="backdrop-blur-xl bg-[--color-card]/70 border-2 border-[--color-border] rounded-[32px] p-8 md:p-10 shadow-xl"
              >
                <h2 className="text-2xl md:text-3xl font-black mb-4 md:mb-6 text-[--color-text-primary]">
                  About {brand.brandName}
                </h2>
                <p className="text-sm md:text-base text-[--color-text-secondary] leading-relaxed whitespace-pre-wrap font-normal">
                  {brand.description}
                </p>
              </motion.div>

              {/* Services Section */}
              <motion.div
                variants={scaleIn}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.2 }}
                className="backdrop-blur-xl bg-[--color-card]/70 border-2 border-[--color-border] rounded-[32px] p-8 md:p-10 shadow-xl"
              >
                {/* Tabs */}
                <div className="flex gap-2 md:gap-3 mb-6 md:mb-8 overflow-x-auto">
                  <button
                    onClick={() => setActiveTab('active')}
                    className={`px-4 md:px-8 py-2.5 md:py-4 rounded-full font-bold text-xs md:text-base whitespace-nowrap capitalize transition-all shadow-md flex-shrink-0 ${
                      activeTab === 'active'
                        ? 'bg-[--color-primary] text-white shadow-lg shadow-[--color-primary]/30'
                        : 'bg-[--color-bg-secondary]/50 text-[--color-text-primary] hover:bg-[--color-bg-secondary] border-2 border-[--color-border]'
                    }`}
                  >
                    Active Services ({activeServicesCount})
                  </button>
                  <button
                    onClick={() => setActiveTab('soldOut')}
                    className={`px-4 md:px-8 py-2.5 md:py-4 rounded-full font-bold text-xs md:text-base whitespace-nowrap capitalize transition-all shadow-md flex-shrink-0 ${
                      activeTab === 'soldOut'
                        ? 'bg-[--color-primary] text-white shadow-lg shadow-[--color-primary]/30'
                        : 'bg-[--color-bg-secondary]/50 text-[--color-text-primary] hover:bg-[--color-bg-secondary] border-2 border-[--color-border]'
                    }`}
                  >
                    Sold Out ({soldOutServicesCount})
                  </button>
                </div>

                {/* Title and Search */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 md:gap-4 mb-6 md:mb-8">
                  <h2 className="text-lg md:text-2xl font-black text-[--color-text-primary]">
                    {activeTab === 'active' ? 'Available' : 'Sold Out'} Services ({filteredServices.length})
                  </h2>
                  <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 w-4 md:w-5 h-4 md:h-5 text-[--color-text-secondary]" />
                    <input
                      type="text"
                      placeholder="Search services..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-4 md:px-6 py-2.5 md:py-3 pl-10 md:pl-12 rounded-full backdrop-blur-md bg-[--color-bg-secondary] border-2 border-[--color-border] text-[--color-text-primary] placeholder:text-[--color-text-secondary] text-sm md:text-base font-medium focus:outline-none focus:ring-2 focus:ring-[--color-primary] focus:border-transparent transition-all shadow-md"
                    />
                  </div>
                </div>

                {/* Services Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  {filteredServices.map((service, index) => {
                    const displayPrice = convertingPrices 
                      ? 'Converting...'
                      : servicePricesInFOG[service.id] || 'Loading...';

                    const firstPackage = service.pricing.type === 'fixed' && service.pricing.packages?.[0];
                    const deliveryTime = firstPackage?.deliveryTime || 'Varies';

                    return (
                      <motion.div
                        key={service.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className={`backdrop-blur-xl bg-[--color-card]/70 border-2 border-[--color-border] rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all relative group ${
                          service.soldOut ? 'opacity-60' : 'cursor-pointer'
                        }`}
                        onClick={() => !service.soldOut && navigate('fog-service-detail', service.id, { name: service.title })}
                      >
                        {/* Sold Out Badge */}
                        {service.soldOut && (
                          <div className="absolute top-2 md:top-4 right-2 md:right-4 z-10">
                            <Badge
                              className="text-white px-2 md:px-4 py-1 md:py-2 rounded-full text-[10px] md:text-xs font-black uppercase shadow-lg border border-white/20 md:border-2"
                              style={{
                                backgroundColor: '#EF4444',
                                borderColor: 'rgba(255, 255, 255, 0.2)'
                              }}
                            >
                              SOLD OUT
                            </Badge>
                          </div>
                        )}

                        {/* Image */}
                        <div className="aspect-video bg-gradient-to-br from-[--color-primary]/10 to-[--color-accent]/10 relative overflow-hidden">
                          {service.mainImage ? (
                            <img
                              src={service.mainImage}
                              alt={service.title}
                              className={`absolute inset-0 w-full h-full object-cover transition-transform duration-700 ${
                                service.soldOut ? 'grayscale' : 'group-hover:scale-110'
                              }`}
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-6xl opacity-20">
                              {service.brandLogo || service.brandName[0]}
                            </div>
                          )}
                          {/* Category Badge */}
                          <div className="absolute top-2 md:top-4 left-2 md:left-4">
                            <Badge
                              className="backdrop-blur-md uppercase font-semibold text-[8px] md:text-[9px] tracking-widest px-2 md:px-3 py-0.5 md:py-1 rounded-full shadow-lg border"
                              style={{
                                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                                color: 'white',
                                borderColor: 'rgba(255, 255, 255, 0.2)'
                              }}
                            >
                              {service.categories[0] || 'Service'}
                            </Badge>
                          </div>
                        </div>

                        <div className="p-4 md:p-6">
                          <h3 className="text-base md:text-lg font-bold mb-2 md:mb-3 text-[--color-text-primary] line-clamp-2 min-h-[40px] md:min-h-[56px] group-hover:text-[--color-primary] transition-colors">
                            {service.title}
                          </h3>
                          <p className="text-xs md:text-sm text-[--color-text-secondary] mb-3 md:mb-4 line-clamp-2">
                            {service.description}
                          </p>

                          {/* Rating */}
                          <div className="flex items-center gap-1.5 md:gap-2 mb-3 md:mb-4">
                            <Star size={14} className="fill-yellow-400 text-yellow-400 md:w-4 md:h-4" />
                            <span className="font-bold text-xs md:text-sm text-[--color-text-primary]">
                              {service.stats.rating || 0}
                            </span>
                            <span className="text-[10px] md:text-xs text-[--color-text-secondary]">
                              ({service.stats.reviews || 0})
                            </span>
                          </div>

                          {/* Price and Delivery */}
                          <div className="flex items-center justify-between pt-3 md:pt-4 border-t-2 border-white/10">
                            <div>
                              <p className="text-[8px] md:text-[9px] font-bold uppercase text-[--color-text-secondary] tracking-widest opacity-50 mb-0.5 md:mb-1">
                                Delivery
                              </p>
                              <p className="font-bold text-xs md:text-sm text-[--color-text-primary]">
                                {deliveryTime}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-base md:text-xl font-black text-[--color-primary]">
                                {convertingPrices ? (
                                  <span className="text-xs md:text-sm opacity-60">Converting...</span>
                                ) : (
                                  service.pricing.type === 'hourly' ? displayPrice : `From ${displayPrice}`
                                )}
                              </p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {filteredServices.length === 0 && (
                  <div className="text-center py-12 md:py-16">
                    <div className="text-6xl md:text-8xl mb-4 md:mb-6">🔍</div>
                    <h3 className="text-xl md:text-2xl font-black mb-2 md:mb-3 text-[--color-text-primary]">No Services Found</h3>
                    <p className="text-sm md:text-lg text-[--color-text-secondary] mb-4 md:mb-6 px-4">
                      {searchTerm ? 'No services match your search.' : 'No services available yet.'}
                    </p>
                    {searchTerm && (
                      <Button
                        onClick={() => setSearchTerm('')}
                        className="rounded-full px-6 md:px-8 py-3 md:py-4 font-bold text-sm md:text-base"
                      >
                        Clear Search
                      </Button>
                    )}
                  </div>
                )}
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Performance Stats Card */}
              <motion.div
                variants={scaleIn}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.3 }}
                className="backdrop-blur-xl bg-[--color-card]/70 border-2 border-[--color-border] rounded-[32px] p-8 shadow-xl sticky top-24"
              >
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 rounded-full bg-[--color-primary]/10 flex items-center justify-center">
                    <Award size={24} className="text-[--color-primary]" />
                  </div>
                  <h3 className="text-2xl font-black text-[--color-text-primary]">Performance</h3>
                </div>

                <div className="space-y-6">
                  <div className="flex justify-between items-center py-3 border-b border-white/10">
                    <span className="text-[--color-text-secondary] font-semibold text-sm uppercase tracking-wider">
                      Response Time
                    </span>
                    <span className="font-black text-[--color-primary] text-lg">Within 1 hour</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-white/10">
                    <span className="text-[--color-text-secondary] font-semibold text-sm uppercase tracking-wider">
                      Delivery Rate
                    </span>
                    <span className="font-black text-green-600 text-lg">98%</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-white/10">
                    <span className="text-[--color-text-secondary] font-semibold text-sm uppercase tracking-wider">
                      Repeat Clients
                    </span>
                    <span className="font-black text-[--color-primary] text-lg">85%</span>
                  </div>
                  <div className="flex justify-between items-center py-3">
                    <span className="text-[--color-text-secondary] font-semibold text-sm uppercase tracking-wider">
                      Total Orders
                    </span>
                    <span className="font-black text-[--color-primary] text-lg">
                      {brand.stats.totalOrders || 0}
                    </span>
                  </div>
                </div>

                {/* Contact Buttons */}
                <div className="space-y-3 mt-8 pt-8 border-t-2 border-white/10">
                  <h4 className="text-lg font-black text-[--color-text-primary] mb-4">Get In Touch</h4>
                  <Button
                    className="w-full rounded-2xl py-6 font-bold shadow-lg hover:-translate-y-1 transition-all"
                    size="lg"
                    onClick={() => navigate('messages', { brandId: brand.id })}
                  >
                    <MessageSquare size={20} className="mr-2" />
                    Send Message
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full rounded-2xl py-6 border-2 font-bold shadow-lg hover:-translate-y-1 transition-all"
                    size="lg"
                    onClick={() => window.open(brand.whatsappChannel, '_blank')}
                  >
                    <ExternalLink size={20} className="mr-2" />
                    WhatsApp Channel
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FogServiceBrandPage;
