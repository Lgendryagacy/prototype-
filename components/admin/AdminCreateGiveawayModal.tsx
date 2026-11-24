import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, Coins, Zap, Calendar, Users, Gift, Sparkles, CheckCircle2, Search } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card, CardContent } from '../ui/Card';
import { createActiveGiveawayDirect, updateActiveGiveaway } from '../../firebase/services/activeGiveawayService';
import { getAllActiveFreelancers } from '../../firebase/services/approvedFreelancers';
import { useApprovedBrands } from '../../firebase/hooks/useApprovedBrands';
import { auth } from '../../firebase/config';
import type { ApprovedFreelancer } from '../../firebase/services/approvedFreelancers';
import type { ApprovedBrand } from '../../firebase/hooks/useApprovedBrands';

interface AdminCreateGiveawayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  giveaway?: any; // For edit mode
}

const AdminCreateGiveawayModal: React.FC<AdminCreateGiveawayModalProps> = ({ 
  isOpen, 
  onClose,
  onSuccess,
  giveaway
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'coins' as 'coins' | 'nft' | 'service',
    totalCoins: 0,
    winnersCount: 1,
    requiredNft: 'Any Fogsly NFT',
    endTime: '',
    whatsappNumber: '',
  });

  const [selectedBrand, setSelectedBrand] = useState<ApprovedBrand | null>(null);
  const [selectedFreelancer, setSelectedFreelancer] = useState<ApprovedFreelancer | null>(null);
  const [freelancers, setFreelancers] = useState<ApprovedFreelancer[]>([]);
  const { brands } = useApprovedBrands();
  
  const [brandSearch, setBrandSearch] = useState('');
  const [freelancerSearch, setFreelancerSearch] = useState('');
  const [showBrandDropdown, setShowBrandDropdown] = useState(false);
  const [showFreelancerDropdown, setShowFreelancerDropdown] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState('');

  // Fetch freelancers
  useEffect(() => {
    const fetchFreelancers = async () => {
      try {
        const data = await getAllActiveFreelancers();
        setFreelancers(data);
      } catch (error) {
        console.error('Error fetching freelancers:', error);
      }
    };
    fetchFreelancers();
  }, []);

  // Initialize or reset form when modal opens/closes
  useEffect(() => {
    if (isOpen && giveaway) {
      // Edit mode - populate form with giveaway data
      const endDate = new Date(giveaway.endTime);
      const formattedEndTime = endDate.toISOString().slice(0, 16);
      
      setFormData({
        title: giveaway.title || '',
        description: giveaway.description || '',
        type: giveaway.type || 'coins',
        totalCoins: giveaway.totalCoins || 0,
        winnersCount: giveaway.winnersCount || 1,
        requiredNft: giveaway.requiredNft || 'Any Fogsly NFT',
        endTime: formattedEndTime,
        whatsappNumber: giveaway.whatsappNumber || '',
      });
      
      // Set selected brand if exists
      if (giveaway.brandId && giveaway.brandName) {
        setSelectedBrand({ id: giveaway.brandId, brandName: giveaway.brandName } as ApprovedBrand);
        setBrandSearch(giveaway.brandName);
      }
      
      // Set selected freelancer if exists
      if (giveaway.freelancerId && giveaway.freelancerName) {
        setSelectedFreelancer({ id: giveaway.freelancerId, fullName: giveaway.freelancerName } as ApprovedFreelancer);
        setFreelancerSearch(giveaway.freelancerName);
      }
    } else if (!isOpen) {
      // Reset form when modal closes
      setFormData({
        title: '',
        description: '',
        type: 'coins',
        totalCoins: 0,
        winnersCount: 1,
        requiredNft: 'Any Fogsly NFT',
        endTime: '',
        whatsappNumber: '',
      });
      setSelectedBrand(null);
      setSelectedFreelancer(null);
      setBrandSearch('');
      setFreelancerSearch('');
      setError('');
      setSubmitSuccess(false);
    }
  }, [isOpen, giveaway]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'totalCoins' || name === 'winnersCount' ? parseInt(value) || 0 : value
    }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const currentUser = auth.currentUser;
    if (!currentUser) {
      setError('You must be logged in as admin');
      return;
    }

    // Validation
    if (!formData.title.trim()) {
      setError('Please enter a giveaway title');
      return;
    }
    if (!formData.description.trim()) {
      setError('Please enter a description');
      return;
    }
    if (!formData.whatsappNumber.trim()) {
      setError('Please enter your WhatsApp number');
      return;
    }
    const phoneRegex = /^(\+92|0)?3[0-9]{9}$/;
    if (!phoneRegex.test(formData.whatsappNumber.replace(/\s+/g, ''))) {
      setError('Please enter a valid Pakistani WhatsApp number');
      return;
    }
    if (!formData.endTime) {
      setError('Please select an end date');
      return;
    }
    if (formData.winnersCount < 1) {
      setError('Winners count must be at least 1');
      return;
    }
    if (formData.type === 'coins' && formData.totalCoins < 1) {
      setError('Total coins must be at least 1 for coin giveaways');
      return;
    }

    // Check if end time is at least 3 hours in the future
    const endDate = new Date(formData.endTime);
    const now = new Date();
    const threeHoursFromNow = new Date(now.getTime() + (3 * 60 * 60 * 1000));
    
    if (endDate <= threeHoursFromNow) {
      setError('End date must be at least 3 hours from now');
      return;
    }

    setIsSubmitting(true);

    try {
      // Build giveaway data object, only including brand/freelancer if selected
      const giveawayData: any = {
        userId: currentUser.uid,
        userEmail: currentUser.email || '',
        userName: currentUser.displayName || currentUser.email?.split('@')[0] || 'Admin',
        title: formData.title,
        description: formData.description,
        type: formData.type,
        totalCoins: formData.totalCoins,
        winnersCount: formData.winnersCount,
        requiredNft: formData.requiredNft,
        endTime: endDate.toISOString(),
        whatsappNumber: formData.whatsappNumber,
      };

      // Only add brand fields if a brand is selected
      if (selectedBrand?.id) {
        giveawayData.brandId = selectedBrand.id;
        giveawayData.brandName = selectedBrand.brandName;
      } else if (giveaway?.id) {
        // In edit mode, explicitly set to null to remove fields
        giveawayData.brandId = null;
        giveawayData.brandName = null;
      }

      // Only add freelancer fields if a freelancer is selected
      if (selectedFreelancer?.id) {
        giveawayData.freelancerId = selectedFreelancer.id;
        giveawayData.freelancerName = selectedFreelancer.fullName;
      } else if (giveaway?.id) {
        // In edit mode, explicitly set to null to remove fields
        giveawayData.freelancerId = null;
        giveawayData.freelancerName = null;
      }

      if (giveaway?.id) {
        // Edit mode - update existing giveaway
        await updateActiveGiveaway(giveaway.id, giveawayData);
      } else {
        // Create mode - create new giveaway
        await createActiveGiveawayDirect(giveawayData, currentUser.uid);
      }

      setSubmitSuccess(true);
      setTimeout(() => {
        onClose();
        setSubmitSuccess(false);
        if (onSuccess) onSuccess();
      }, 2000);
    } catch (err) {
      console.error('Error creating giveaway:', err);
      setError('Failed to create giveaway. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredBrands = brands.filter(brand =>
    brand.brandName.toLowerCase().includes(brandSearch.toLowerCase())
  );

  const filteredFreelancers = freelancers.filter(freelancer =>
    freelancer.fullName.toLowerCase().includes(freelancerSearch.toLowerCase()) ||
    freelancer.title.toLowerCase().includes(freelancerSearch.toLowerCase())
  );

  const typeColors: Record<string, string> = {
    coins: "from-yellow-400 to-amber-600",
    nft: "from-purple-500 to-indigo-700",
    service: "from-blue-500 to-cyan-600"
  };

  const typeIcons: Record<string, any> = {
    coins: Coins,
    nft: Trophy,
    service: Zap
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative bg-[--color-card] rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[--color-border]"
        >
          <CardContent className="p-8">
            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-[--color-bg-tertiary] transition-colors"
            >
              <X size={24} className="text-[--color-text-secondary]" />
            </button>

            {submitSuccess ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-12"
              >
                <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mb-6">
                  <CheckCircle2 size={48} className="text-green-500" />
                </div>
                <h3 className="text-3xl font-black text-[--color-text-primary] mb-3">
                  Giveaway Created!
                </h3>
                <p className="text-[--color-text-secondary] text-center max-w-md">
                  The giveaway is now live and users can participate.
                </p>
              </motion.div>
            ) : (
              <>
                <div className="flex items-center gap-4 mb-8">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${typeColors[formData.type]} flex items-center justify-center shadow-lg`}>
                    <Gift size={28} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-[--color-text-primary]">
                      {giveaway ? 'Edit Giveaway' : 'Create Giveaway (Admin)'}
                    </h2>
                    <p className="text-sm text-[--color-text-secondary]">
                      {giveaway ? 'Update giveaway details' : 'Create and publish a new giveaway immediately'}
                    </p>
                  </div>
                </div>

                {error && (
                  <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Giveaway Type */}
                  <div>
                    <label className="block text-sm font-bold text-[--color-text-primary] mb-3 uppercase tracking-wider">
                      Giveaway Type
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {(['coins', 'nft', 'service'] as const).map((type) => {
                        const Icon = typeIcons[type];
                        return (
                          <button
                            key={type}
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, type }))}
                            className={`p-4 rounded-2xl border-2 transition-all ${
                              formData.type === type
                                ? `border-[--color-primary] bg-[--color-primary]/10`
                                : `border-[--color-border] hover:border-[--color-primary]/50`
                            }`}
                          >
                            <Icon size={24} className={`mx-auto mb-2 ${formData.type === type ? 'text-[--color-primary]' : 'text-[--color-text-secondary]'}`} />
                            <p className={`text-sm font-bold capitalize ${formData.type === type ? 'text-[--color-primary]' : 'text-[--color-text-secondary]'}`}>
                              {type}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Title */}
                  <div>
                    <label className="block text-sm font-bold text-[--color-text-primary] mb-2">
                      Title
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-[--color-bg-tertiary] border border-[--color-border] rounded-xl text-[--color-text-primary] focus:outline-none focus:border-[--color-primary]"
                      placeholder="e.g., 1000 FOG Coins Giveaway"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-bold text-[--color-text-primary] mb-2">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-4 py-3 bg-[--color-bg-tertiary] border border-[--color-border] rounded-xl text-[--color-text-primary] focus:outline-none focus:border-[--color-primary] resize-none"
                      placeholder="Describe your giveaway..."
                    />
                  </div>

                  {/* Brand Selection (Optional) */}
                  <div>
                    <label className="block text-sm font-bold text-[--color-text-primary] mb-2">
                      Associated Brand (Optional)
                      {selectedFreelancer && (
                        <span className="ml-2 text-xs text-orange-500 font-normal">
                          (Disabled - Freelancer selected)
                        </span>
                      )}
                    </label>
                    <div className="relative">
                      <div
                        onClick={() => !selectedFreelancer && setShowBrandDropdown(!showBrandDropdown)}
                        className={`w-full px-4 py-3 bg-[--color-bg-tertiary] border border-[--color-border] rounded-xl text-[--color-text-primary] flex items-center justify-between ${
                          selectedFreelancer ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                        }`}
                      >
                        <span className={selectedBrand ? 'text-[--color-text-primary]' : 'text-[--color-text-secondary]'}>
                          {selectedBrand ? selectedBrand.brandName : 'Select a brand (optional)'}
                        </span>
                        <Search size={18} className="text-[--color-text-secondary]" />
                      </div>
                      
                      {showBrandDropdown && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-[--color-card] border border-[--color-border] rounded-xl shadow-xl z-50 max-h-64 overflow-hidden">
                          <div className="p-2 border-b border-[--color-border]">
                            <input
                              type="text"
                              value={brandSearch}
                              onChange={(e) => setBrandSearch(e.target.value)}
                              placeholder="Search brands..."
                              className="w-full px-3 py-2 bg-[--color-bg-tertiary] border border-[--color-border] rounded-lg text-[--color-text-primary] text-sm focus:outline-none focus:border-[--color-primary]"
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                          <div className="max-h-48 overflow-y-auto">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedBrand(null);
                                setShowBrandDropdown(false);
                                setBrandSearch('');
                              }}
                              className="w-full px-4 py-2 text-left hover:bg-[--color-bg-tertiary] text-[--color-text-secondary] text-sm"
                            >
                              None
                            </button>
                            {filteredBrands.map((brand) => (
                              <button
                                key={brand.id}
                                type="button"
                                onClick={() => {
                                  setSelectedBrand(brand);
                                  setSelectedFreelancer(null); // Clear freelancer when brand is selected
                                  setShowBrandDropdown(false);
                                  setBrandSearch('');
                                }}
                                className="w-full px-4 py-2 text-left hover:bg-[--color-bg-tertiary] text-[--color-text-primary] text-sm"
                              >
                                {brand.brandName}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Freelancer Selection (Optional) */}
                  <div>
                    <label className="block text-sm font-bold text-[--color-text-primary] mb-2">
                      Associated Freelancer (Optional)
                      {selectedBrand && (
                        <span className="ml-2 text-xs text-orange-500 font-normal">
                          (Disabled - Brand selected)
                        </span>
                      )}
                    </label>
                    <div className="relative">
                      <div
                        onClick={() => !selectedBrand && setShowFreelancerDropdown(!showFreelancerDropdown)}
                        className={`w-full px-4 py-3 bg-[--color-bg-tertiary] border border-[--color-border] rounded-xl text-[--color-text-primary] flex items-center justify-between ${
                          selectedBrand ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                        }`}
                      >
                        <span className={selectedFreelancer ? 'text-[--color-text-primary]' : 'text-[--color-text-secondary]'}>
                          {selectedFreelancer ? selectedFreelancer.fullName : 'Select a freelancer (optional)'}
                        </span>
                        <Search size={18} className="text-[--color-text-secondary]" />
                      </div>
                      
                      {showFreelancerDropdown && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-[--color-card] border border-[--color-border] rounded-xl shadow-xl z-50 max-h-64 overflow-hidden">
                          <div className="p-2 border-b border-[--color-border]">
                            <input
                              type="text"
                              value={freelancerSearch}
                              onChange={(e) => setFreelancerSearch(e.target.value)}
                              placeholder="Search freelancers..."
                              className="w-full px-3 py-2 bg-[--color-bg-tertiary] border border-[--color-border] rounded-lg text-[--color-text-primary] text-sm focus:outline-none focus:border-[--color-primary]"
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                          <div className="max-h-48 overflow-y-auto">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedFreelancer(null);
                                setShowFreelancerDropdown(false);
                                setFreelancerSearch('');
                              }}
                              className="w-full px-4 py-2 text-left hover:bg-[--color-bg-tertiary] text-[--color-text-secondary] text-sm"
                            >
                              None
                            </button>
                            {filteredFreelancers.map((freelancer) => (
                              <button
                                key={freelancer.id}
                                type="button"
                                onClick={() => {
                                  setSelectedFreelancer(freelancer);
                                  setSelectedBrand(null); // Clear brand when freelancer is selected
                                  setShowFreelancerDropdown(false);
                                  setFreelancerSearch('');
                                }}
                                className="w-full px-4 py-2 text-left hover:bg-[--color-bg-tertiary] text-sm"
                              >
                                <div className="text-[--color-text-primary] font-medium">{freelancer.fullName}</div>
                                <div className="text-[--color-text-secondary] text-xs">{freelancer.title}</div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Two Column Layout */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Total Coins/Winners */}
                    {formData.type === 'coins' ? (
                      <div>
                        <label className="block text-sm font-bold text-[--color-text-primary] mb-2">
                          Total Coins
                        </label>
                        <input
                          type="number"
                          name="totalCoins"
                          value={formData.totalCoins}
                          onChange={handleInputChange}
                          min="1"
                          className="w-full px-4 py-3 bg-[--color-bg-tertiary] border border-[--color-border] rounded-xl text-[--color-text-primary] focus:outline-none focus:border-[--color-primary]"
                        />
                      </div>
                    ) : (
                      <div>
                        <label className="block text-sm font-bold text-[--color-text-primary] mb-2">
                          Winners Count
                        </label>
                        <input
                          type="number"
                          name="winnersCount"
                          value={formData.winnersCount}
                          onChange={handleInputChange}
                          min="1"
                          className="w-full px-4 py-3 bg-[--color-bg-tertiary] border border-[--color-border] rounded-xl text-[--color-text-primary] focus:outline-none focus:border-[--color-primary]"
                        />
                      </div>
                    )}

                    {/* Required NFT */}
                    <div>
                      <label className="block text-sm font-bold text-[--color-text-primary] mb-2">
                        Required NFT
                      </label>
                      <select
                        name="requiredNft"
                        value={formData.requiredNft}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-[--color-bg-tertiary] border border-[--color-border] rounded-xl text-[--color-text-primary] focus:outline-none focus:border-[--color-primary]"
                      >
                        <option>Any Fogsly NFT</option>
                        <option>Level_1_to_307</option>
                        <option>Founder NFT</option>
                      </select>
                    </div>
                  </div>

                  {/* End Time */}
                  <div>
                    <label className="block text-sm font-bold text-[--color-text-primary] mb-2">
                      End Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      name="endTime"
                      value={formData.endTime}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-[--color-bg-tertiary] border border-[--color-border] rounded-xl text-[--color-text-primary] focus:outline-none focus:border-[--color-primary]"
                    />
                  </div>

                  {/* WhatsApp Number */}
                  <div>
                    <label className="block text-sm font-bold text-[--color-text-primary] mb-2">
                      WhatsApp Number
                    </label>
                    <input
                      type="tel"
                      name="whatsappNumber"
                      value={formData.whatsappNumber}
                      onChange={handleInputChange}
                      placeholder="+923001234567 or 03001234567"
                      className="w-full px-4 py-3 bg-[--color-bg-tertiary] border border-[--color-border] rounded-xl text-[--color-text-primary] focus:outline-none focus:border-[--color-primary]"
                    />
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-14 rounded-2xl font-black text-white shadow-xl bg-gradient-to-r from-[--color-primary] to-[--color-accent]"
                  >
                    {isSubmitting ? 'Creating...' : 'Create & Publish Giveaway'}
                  </Button>
                </form>
              </>
            )}
          </CardContent>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AdminCreateGiveawayModal;
