import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, Coins, Zap, Calendar, Users, Gift, Sparkles, CheckCircle2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { submitGiveawayRequest, updateGiveawayRequest } from '../firebase/services/giveawayRequestService';
import { updateActiveGiveaway } from '../firebase/services/activeGiveawayService';
import { auth } from '../firebase/config';
import type { GiveawayRequest, ActiveGiveaway } from '../types/giveaway';

interface PostGiveawayModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: any;
  editMode?: boolean;
  editData?: GiveawayRequest | ActiveGiveaway;
  onSuccess?: () => void;
}

const PostGiveawayModal: React.FC<PostGiveawayModalProps> = ({ 
  isOpen, 
  onClose, 
  currentUser,
  editMode = false,
  editData,
  onSuccess
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

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState('');

  // Pre-fill form data when in edit mode
  useEffect(() => {
    if (editMode && editData) {
      // Convert ISO string to datetime-local format
      const endTimeValue = editData.endTime ? new Date(editData.endTime).toISOString().slice(0, 16) : '';
      
      setFormData({
        title: editData.title || '',
        description: editData.description || '',
        type: editData.type || 'coins',
        totalCoins: editData.totalCoins || 0,
        winnersCount: editData.winnersCount || 1,
        requiredNft: editData.requiredNft || 'Any Fogsly NFT',
        endTime: endTimeValue,
        whatsappNumber: editData.whatsappNumber || '',
      });
    } else {
      // Reset form when not in edit mode
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
    }
  }, [editMode, editData, isOpen]);

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

    // Get the current Firebase user
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) {
      setError('You must be logged in to submit a giveaway');
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
    // Validate Pakistani phone number format
    const phoneRegex = /^(\+92|0)?3[0-9]{9}$/;
    if (!phoneRegex.test(formData.whatsappNumber.replace(/\s+/g, ''))) {
      setError('Please enter a valid Pakistani WhatsApp number (e.g., +923001234567 or 03001234567)');
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
    const threeHoursFromNow = new Date(now.getTime() + (3 * 60 * 60 * 1000)); // Add 3 hours in milliseconds
    
    if (endDate <= threeHoursFromNow) {
      setError('End date must be at least 3 hours from now');
      return;
    }

    setIsSubmitting(true);

    try {
      if (editMode && editData?.id) {
        // Update existing giveaway
        const updateData = {
          title: formData.title,
          description: formData.description,
          type: formData.type,
          totalCoins: formData.totalCoins,
          winnersCount: formData.winnersCount,
          requiredNft: formData.requiredNft,
          endTime: endDate.toISOString(),
          whatsappNumber: formData.whatsappNumber,
        };

        // Check if it's an active giveaway or a request
        if ('status' in editData && (editData.status === 'active' || editData.status === 'paused' || editData.status === 'closed')) {
          // If it's a closed giveaway being reactivated, change status to active
          const finalUpdateData = editData.status === 'closed' 
            ? { ...updateData, status: 'active' }
            : updateData;
          
          // Update active giveaway
          await updateActiveGiveaway(editData.id, finalUpdateData);
        } else {
          // Update giveaway request
          await updateGiveawayRequest(editData.id, updateData);
        }
      } else {
        // Create new giveaway request
        await submitGiveawayRequest(
          firebaseUser.uid,
          firebaseUser.email || '',
          firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
          {
            ...formData,
            endTime: endDate.toISOString(),
          }
        );
      }

      setSubmitSuccess(true);
      setTimeout(() => {
        onClose();
        setSubmitSuccess(false);
        if (onSuccess) onSuccess();
        // Reset form only if not in edit mode
        if (!editMode) {
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
        }
      }, 2000);
    } catch (err) {
      console.error('Error submitting giveaway request:', err);
      setError('Failed to submit giveaway request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        >
          <Card className=" glass-panel shadow-2xl bg-[--color-card] border-0">
            {/* Header */}
            <div className={`h-2 w-full bg-gradient-to-r ${typeColors[formData.type]}`} />
            
            <CardContent className="p-8">
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-[--color-bg-tertiary] transition-colors"
              >
                <X size={24} className="text-[--color-text-secondary]" />
              </button>

              {/* Success State */}
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
                    {editMode ? 'Updated Successfully!' : 'Request Submitted!'}
                  </h3>
                  <p className="text-[--color-text-secondary] text-center max-w-md">
                    {editMode 
                      ? 'Your giveaway has been updated successfully.' 
                      : 'Your giveaway request has been submitted for review. You\'ll be notified once it\'s approved.'
                    }
                  </p>
                </motion.div>
              ) : (
                <>
                  {/* Title */}
                  <div className="flex items-center gap-4 mb-8">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${typeColors[formData.type]} flex items-center justify-center shadow-lg`}>
                      <Gift size={28} className="text-white" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-black text-[--color-text-primary]">
                        {editMode ? (editData && 'status' in editData && editData.status === 'closed' ? 'Reactivate Giveaway' : 'Edit Giveaway') : 'Post Giveaway'}
                      </h2>
                      <p className="text-sm text-[--color-text-secondary]">
                        {editMode 
                          ? (editData && 'status' in editData && editData.status === 'closed' 
                              ? '⚠️ Please update the end date to reactivate this giveaway' 
                              : 'Update your giveaway details')
                          : 'Submit your giveaway for approval'
                        }
                      </p>
                    </div>
                  </div>

                  {/* Form */}
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
                                  : 'border-[--color-border] bg-[--color-bg-tertiary]/50 hover:border-[--color-primary]/50'
                              }`}
                            >
                              <Icon size={24} className={`mx-auto mb-2 ${formData.type === type ? 'text-[--color-primary]' : 'text-[--color-text-secondary]'}`} />
                              <span className={`text-sm font-bold capitalize ${formData.type === type ? 'text-[--color-primary]' : 'text-[--color-text-secondary]'}`}>
                                {type}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Title */}
                    <div>
                      <label className="block text-sm font-bold text-[--color-text-primary] mb-2 uppercase tracking-wider">
                        Giveaway Title
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        placeholder="e.g., 100 Fog Coin Community Drop"
                        className="w-full px-4 py-3 rounded-2xl bg-[--color-bg-tertiary] border-2 border-[--color-border] text-[--color-text-primary] placeholder:text-[--color-text-secondary]/50 focus:border-[--color-primary] focus:outline-none transition-colors"
                        required
                      />
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-sm font-bold text-[--color-text-primary] mb-2 uppercase tracking-wider">
                        Description
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Describe your giveaway..."
                        rows={4}
                        className="w-full px-4 py-3 rounded-2xl bg-[--color-bg-tertiary] border-2 border-[--color-border] text-[--color-text-primary] placeholder:text-[--color-text-secondary]/50 focus:border-[--color-primary] focus:outline-none transition-colors resize-none"
                        required
                      />
                    </div>

                    {/* Two Column Layout */}
                    <div className="grid md:grid-cols-2 gap-4">
                      {/* Total Coins (only for coins type) */}
                      {formData.type === 'coins' && (
                        <div>
                          <label className="block text-sm font-bold text-[--color-text-primary] mb-2 uppercase tracking-wider">
                            <Coins size={14} className="inline mr-1" />
                            Total Coins
                          </label>
                          <input
                            type="number"
                            name="totalCoins"
                            value={formData.totalCoins || ''}
                            onChange={handleInputChange}
                            placeholder="100"
                            min="1"
                            className="w-full px-4 py-3 rounded-2xl bg-[--color-bg-tertiary] border-2 border-[--color-border] text-[--color-text-primary] placeholder:text-[--color-text-secondary]/50 focus:border-[--color-primary] focus:outline-none transition-colors"
                            required
                          />
                        </div>
                      )}

                      {/* Winners Count */}
                      <div>
                        <label className="block text-sm font-bold text-[--color-text-primary] mb-2 uppercase tracking-wider">
                          <Users size={14} className="inline mr-1" />
                          Winners Count
                        </label>
                        <input
                          type="number"
                          name="winnersCount"
                          value={formData.winnersCount || ''}
                          onChange={handleInputChange}
                          placeholder="10"
                          min="1"
                          className="w-full px-4 py-3 rounded-2xl bg-[--color-bg-tertiary] border-2 border-[--color-border] text-[--color-text-primary] placeholder:text-[--color-text-secondary]/50 focus:border-[--color-primary] focus:outline-none transition-colors"
                          required
                        />
                      </div>
                    </div>

                    {/* Required NFT */}
                    <div>
                      <label className="block text-sm font-bold text-[--color-text-primary] mb-2 uppercase tracking-wider">
                        Required NFT
                      </label>
                      <select
                        name="requiredNft"
                        value={formData.requiredNft}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-2xl bg-[--color-bg-tertiary] border-2 border-[--color-border] text-[--color-text-primary] focus:border-[--color-primary] focus:outline-none transition-colors"
                      >
                        <option value="Any Fogsly NFT">Any Fogsly NFT</option>
                        <option value="Early Bird">Early Bird</option>
                        <option value="Legendary">Legendary</option>
                        <option value="Level_1_to_307">Level 1 to 307</option>
                      </select>
                    </div>

                    {/* WhatsApp Number */}
                    <div>
                      <label className="block text-sm font-bold text-[--color-text-primary] mb-2 uppercase tracking-wider">
                        WhatsApp Number
                      </label>
                      <input
                        type="text"
                        name="whatsappNumber"
                        value={formData.whatsappNumber}
                        onChange={handleInputChange}
                        placeholder="+923001234567 or 03001234567"
                        className="w-full px-4 py-3 rounded-2xl bg-[--color-bg-tertiary] border-2 border-[--color-border] text-[--color-text-primary] placeholder:text-[--color-text-secondary]/50 focus:border-[--color-primary] focus:outline-none transition-colors"
                        required
                      />
                      <p className="mt-1 text-xs text-[--color-text-secondary]">
                        Enter your Pakistani WhatsApp number for contact purposes
                      </p>
                    </div>

                    {/* End Time */}
                    <div>
                      <label className="block text-sm font-bold text-[--color-text-primary] mb-2 uppercase tracking-wider">
                        <Calendar size={14} className="inline mr-1" />
                        End Date & Time
                      </label>
                      <input
                        type="datetime-local"
                        name="endTime"
                        value={formData.endTime}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-2xl bg-[--color-bg-tertiary] border-2 border-[--color-border] text-[--color-text-primary] focus:border-[--color-primary] focus:outline-none transition-colors"
                        required
                      />
                    </div>

                    {/* Error Message */}
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 rounded-2xl bg-red-500/10 border-2 border-red-500/20"
                      >
                        <p className="text-red-500 text-sm font-semibold">{error}</p>
                      </motion.div>
                    )}

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className={`w-full h-14 rounded-2xl font-black text-white shadow-xl bg-gradient-to-r ${typeColors[formData.type]}`}
                    >
                      {isSubmitting ? (
                        <span className="flex items-center justify-center gap-2">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                          />
                          {editMode ? 'Updating...' : 'Submitting...'}
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          <Sparkles size={20} />
                          {editMode ? 'Update Giveaway' : 'Submit for Review'}
                        </span>
                      )}
                    </Button>

                    <p className="text-xs text-center text-[--color-text-secondary] opacity-60">
                      {editMode 
                        ? 'Your changes will be saved immediately'
                        : 'Your giveaway will be reviewed and you\'ll be notified of the status'
                      }
                    </p>
                  </form>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default PostGiveawayModal;
