import React, { useState, useEffect } from 'react';
import { Linkedin, Facebook, Instagram, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { User as FirebaseUser, UserProfile } from '../../firebase/types/user';
import { getAggregatedGigStats, AggregatedGigStats } from '../../firebase/utils/gigStats';
// import TiktokIcon from '../TiktokIcon';
import TikTokIcon from '../icons/TiktokIcon';
import WithdrawalAccountDisplay from './WithdrawalAccountDisplay';

interface ProfileSidebarProps {
  userProfile: UserProfile | null;
  currentUser: FirebaseUser | null;
}

const StatItem = React.memo(({ value, label }: { value: string | number; label: string }) => (
  <div>
    <p className="text-2xl font-bold text-[--color-text-primary]">{value}</p>
    <p className="text-xs text-[--color-text-secondary] uppercase tracking-wider">{label}</p>
  </div>
));

StatItem.displayName = 'StatItem';

const ProfileSidebar = React.memo(({ userProfile, currentUser }: ProfileSidebarProps) => {
  const [gigStats, setGigStats] = useState<AggregatedGigStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    if (userProfile?.uid) {
      fetchGigStats();
    } else {
      setStatsLoading(false);
    }
  }, [userProfile?.uid]);

  const fetchGigStats = async () => {
    try {
      setStatsLoading(true);
      const stats = await getAggregatedGigStats(userProfile!.uid);
      setGigStats(stats);
    } catch (error) {
      console.error('Error fetching gig stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };
  return (
    <aside className="lg:col-span-4 space-y-6">
      {/* About Section */}
      <Card>
        <CardHeader>
          <CardTitle>About</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[--color-text-secondary] leading-relaxed">
            {userProfile?.bio || 'No bio available.'}
          </p>
        </CardContent>
      </Card>

      {/* Stats Section */}
      {/* <Card>
        <CardHeader>
          <CardTitle>Gig Stats</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 text-center">
          {statsLoading ? (
            <div className="col-span-2 flex justify-center py-4">
              <Loader2 className="w-6 h-6 animate-spin text-[--color-primary]" />
            </div>
          ) : gigStats ? (
            <>
              <StatItem 
                value={gigStats.averageRating > 0 ? gigStats.averageRating.toFixed(1) : '0'} 
                label="Avg Rating" 
              />
              <StatItem value={gigStats.totalReviews} label="Reviews" />
              <StatItem value={gigStats.totalJobs} label="Jobs Done" />
              <StatItem value={gigStats.activeGigs} label="Active Gigs" />
            </>
          ) : (
            <>
              <StatItem value="0" label="Avg Rating" />
              <StatItem value="0" label="Reviews" />
              <StatItem value="0" label="Jobs Done" />
              <StatItem value="0" label="Active Gigs" />
            </>
          )}
        </CardContent>
      </Card> */}

      {/* Skills Section */}
      <Card>
        <CardHeader>
          <CardTitle>Skills</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {(userProfile?.skills || ['React', 'TypeScript', 'Firebase']).map(skill => (
            <span 
              key={skill} 
              className="px-3 py-1 bg-[--color-bg-secondary] text-sm font-medium rounded-full"
            >
              {skill}
            </span>
          ))}
        </CardContent>
      </Card>

      {/* Withdrawal Accounts Section */}
      <WithdrawalAccountDisplay 
        withdrawalAccount={userProfile?.withdrawalAccount} 
      />

      {/* Social Links Section */}
      <Card>
        <CardHeader>
          <CardTitle>Socials</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-around">
          <a 
            href={userProfile?.social?.linkedin || '#'} 
            aria-label="LinkedIn" 
            className="p-2 text-[--color-text-secondary] hover:text-[--color-primary] transition-colors"
          >
            <Linkedin size={24} />
          </a>
          <a 
            href={userProfile?.social?.facebook || '#'} 
            aria-label="Facebook" 
            className="p-2 text-[--color-text-secondary] hover:text-[--color-primary] transition-colors"
          >
            <Facebook size={24} />
          </a>
          <a 
            href={userProfile?.social?.instagram || '#'} 
            aria-label="Instagram" 
            className="p-2 text-[--color-text-secondary] hover:text-[--color-primary] transition-colors"
          >
            <Instagram size={24} />
          </a>
          <a 
            href={userProfile?.social?.tiktok || '#'} 
            aria-label="TikTok" 
            className="p-2 text-[--color-text-secondary] hover:text-[--color-primary] transition-colors"
          >
            <TikTokIcon width={24} height={24} />
          </a>
        </CardContent>
      </Card>
    </aside>
  );
});

ProfileSidebar.displayName = 'ProfileSidebar';

export default ProfileSidebar;
