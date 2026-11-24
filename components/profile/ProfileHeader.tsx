import React, { useRef, useState } from 'react';
import { ArrowLeft, Edit2, MapPin, MoreVertical, Camera, Edit } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { User as FirebaseUser, UserProfile } from '../../firebase/types/user';
import { toast } from 'react-hot-toast';
import ProfileRankBanner from '../badges/ProfileRankBanner';
import { getRankData } from '../../utils/rankUtils';
import ImageCropModal from '../modals/ImageCropModal';
import { compressImage, compressionPresets } from '../../utils/imageCompression';
import { type Route } from '../../types';

interface ProfileHeaderProps {
  userProfile: UserProfile | null;
  currentUser: FirebaseUser | null;
  isEditing: boolean;
  onNavigateHome: () => void;
  onToggleEdit: () => void;
  onNavigateToSettings: () => void;
  onAvatarUpload: (file: File) => Promise<void>;
  onCoverUpload: (file: File) => Promise<void>;
  isSaving: boolean;
  navigate?: (route: Route, context?: any) => void;
}

const ProfileHeader = React.memo(({
  userProfile,
  currentUser,
  isEditing,
  onNavigateHome,
  onToggleEdit,
  onNavigateToSettings,
  onAvatarUpload,
  onCoverUpload,
  isSaving,
  navigate
}: ProfileHeaderProps) => {
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [isAvatarUploading, setIsAvatarUploading] = useState(false);
  const [isCoverUploading, setIsCoverUploading] = useState(false);

  // Image Crop Modal States
  const [showAvatarCrop, setShowAvatarCrop] = useState(false);
  const [showCoverCrop, setShowCoverCrop] = useState(false);
  const [pendingAvatarImage, setPendingAvatarImage] = useState<File | null>(null);
  const [pendingCoverImage, setPendingCoverImage] = useState<File | null>(null);

  const handleAvatarClick = () => {
    if (avatarInputRef.current) {
      avatarInputRef.current.click();
    }
  };

  const handleCoverClick = () => {
    if (coverInputRef.current) {
      coverInputRef.current.click();
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('File size must be less than 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }

      // Open crop modal instead of uploading directly
      setPendingAvatarImage(file);
      setShowAvatarCrop(true);
      e.target.value = ''; // Reset input
    }
  };

  const handleAvatarCropComplete = async (croppedFile: File) => {
    try {
      // Show compression toast
      const toastId = toast.loading('Compressing avatar...');
      
      // Compress the cropped image with avatar preset
      const compressedFile = await compressImage(croppedFile, {
        maxWidth: 512,
        maxHeight: 512,
        quality: 0.85,
        format: 'jpeg'
      });
      
      const savedBytes = croppedFile.size - compressedFile.size;
      const savedPercentage = Math.round((savedBytes / croppedFile.size) * 100);
      
      toast.success(
        `Avatar ready! Compressed ${savedPercentage}% (${(croppedFile.size / 1024 / 1024).toFixed(2)}MB → ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB)`,
        { id: toastId, duration: 3000 }
      );

      setIsAvatarUploading(true);
      await onAvatarUpload(compressedFile);
      setPendingAvatarImage(null);
    } catch (error) {
      console.error('Avatar processing failed:', error);
      toast.error('Failed to process avatar. Please try again.');
    } finally {
      setIsAvatarUploading(false);
    }
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit for cover
        toast.error('File size must be less than 10MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }

      // Open crop modal instead of uploading directly
      setPendingCoverImage(file);
      setShowCoverCrop(true);
      e.target.value = ''; // Reset input
    }
  };

  const handleCoverCropComplete = async (croppedFile: File) => {
    try {
      // Show compression toast
      const toastId = toast.loading('Compressing cover image...');
      
      // Compress the cropped cover image
      const compressedFile = await compressImage(croppedFile, {
        maxWidth: 1920,
        maxHeight: 600,
        quality: 0.9,
        format: 'jpeg'
      });
      
      const savedBytes = croppedFile.size - compressedFile.size;
      const savedPercentage = Math.round((savedBytes / croppedFile.size) * 100);
      
      toast.success(
        `Cover ready! Compressed ${savedPercentage}% (${(croppedFile.size / 1024 / 1024).toFixed(2)}MB → ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB)`,
        { id: toastId, duration: 3000 }
      );

      setIsCoverUploading(true);
      await onCoverUpload(compressedFile);
      setPendingCoverImage(null);
    } catch (error) {
      console.error('Cover processing failed:', error);
      toast.error('Failed to process cover image. Please try again.');
    } finally {
      setIsCoverUploading(false);
    }
  };



  return (
    <>
      <Card className="mb-8 overflow-visible">
        <div
          className="h-40 md:h-80 rounded-t-xl bg-cover bg-center relative"
          style={{ backgroundImage: `url(${userProfile?.coverUrl || 'https://images.unsplash.com/photo-1554147090-e1221a04a025?w=800&q=80'})` }}
        >
          {/* Cover Upload Overlay */}
          {isCoverUploading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm">
              <div className="text-center text-white">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                <p className="text-sm">Uploading cover image...</p>
              </div>
            </div>
          )}

          <div className="absolute top-4 left-4">
            <Button
              variant="ghost"
              onClick={onNavigateHome}
              className="bg-black/20 hover:bg-black/40 text-white backdrop-blur-sm"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>
          
          {/* Only show edit buttons if user is viewing their own profile */}
          {currentUser && (
            <>
              <a href="#profile-tabs">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-4 right-4 bg-black/20 hover:bg-black/40 text-white backdrop-blur-sm"
                  onClick={onNavigateToSettings}
                  disabled={isSaving || isAvatarUploading || isCoverUploading}
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
              </a>

              {/* Cover Upload Button */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute bottom-4 right-4 bg-black/20 hover:bg-black/40 text-white backdrop-blur-sm"
                onClick={handleCoverClick}
                disabled={isSaving || isAvatarUploading || isCoverUploading}
              >
                <Camera className="w-4 h-4" />
              </Button>

              {/* Hidden Cover Input */}
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                onChange={handleCoverChange}
                className="hidden"
              />
            </>
          )}
        </div>

        <div className="p-2 lg:p-6 bg-[--color-card] flex flex-col lg:flex-row items-center lg:items-start relative">
          {/* Avatar */}
          <div className="absolute left-3 -top-8 lg:static lg:-mt-24 ml-0 lg:ml-4 relative">
            <div className="w-32 h-32 md:w-52 md:h-52 rounded-full bg-[--color-bg-tertiary] border-4 border-[--color-card] flex items-center justify-center text-5xl font-bold text-[--color-text-secondary] ring-4 ring-[--color-card] overflow-hidden   relative">
              {userProfile?.avatarUrl ? (
                <img
                  src={userProfile.avatarUrl}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                (userProfile?.name || currentUser?.displayName || 'U').charAt(0).toUpperCase()
              )}

              {/* Avatar Upload Overlay */}
              {isAvatarUploading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                </div>
              )}

            </div>

            {/* Avatar Edit Button - Only show for own profile */}
            {currentUser && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute bottom-0 lg:bottom-12 lg:mb-7 left-12 bg-black/50 hover:bg-black text-white rounded-full w-6 h-6 shadow-lg"
                  onClick={handleAvatarClick}
                  disabled={isSaving || isAvatarUploading || isCoverUploading}
                >
                  <Edit className="w-4 h-4" />
                </Button>

                {/* Hidden Avatar Input */}
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </>
            )}
          </div>

          <div className="flex-1 text-center lg:text-left mt-0 lg:mt-0 lg:ml-6 ">
            <h1 className="text-3xl font-bold text-[--color-text-primary] ">
              {(userProfile?.name || currentUser?.displayName || 'User').toUpperCase()}
            </h1>
            <p className="text-[--color-text-secondary]">{userProfile?.role || 'User'}</p>
            <div className="flex items-center justify-center lg:justify-start text-sm text-[--color-text-secondary] mt-1">
              <MapPin size={14} className="mr-1" />
              {userProfile?.city && userProfile?.country
                ? `${userProfile.city}, ${userProfile.country}`
                : 'Location not set'}
            </div>
          </div>

          <div className="flex items-center flex-col mt-6 lg:mt-0">
            {/* Rank Banner with consistent logic - Profile optimized */}
            <div className="w-full">
              {userProfile?.rank !== undefined && userProfile?.rank !== null ? (
                (() => {
                  const { tier, label } = getRankData(userProfile.rank);
                  return (
                    <ProfileRankBanner
                      rank={userProfile.rank}
                      tier={tier}
                      label={label}
                    />
                  );
                })()
              ) : (
                <ProfileRankBanner
                  rank={1337}
                  tier="champion"
                  label="FOGSLY CHAMPION"
                />
              )}
            </div>
            <div className="pt-2 lg:pt-4 buttons-follow flex items-center gap-2 mt-2 lg:mt-0">
              <Button 
                variant="outline" 
                onClick={() => navigate && navigate('messages', { selectedUserId: userProfile.uid })}
              >
                Send Message
              </Button>
              <Button>Follow</Button>
              <Button variant="ghost" size="icon">
                <MoreVertical size={20} />
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Image Crop Modals */}
      {pendingAvatarImage && (
        <ImageCropModal
          isOpen={showAvatarCrop}
          onClose={() => {
            setShowAvatarCrop(false);
            setPendingAvatarImage(null);
          }}
          imageFile={pendingAvatarImage}
          onCropComplete={handleAvatarCropComplete}
          aspectRatio={1}
          title="Crop Profile Picture"
          circularCrop={true}
        />
      )}

      {pendingCoverImage && (
        <ImageCropModal
          isOpen={showCoverCrop}
          onClose={() => {
            setShowCoverCrop(false);
            setPendingCoverImage(null);
          }}
          imageFile={pendingCoverImage}
          onCropComplete={handleCoverCropComplete}
          aspectRatio={16 / 5}
          title="Crop Cover Image"
        />
      )}
    </>
  );
});

ProfileHeader.displayName = 'ProfileHeader';

export default ProfileHeader;
