import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../firebase/hooks/useAuth';
import { getUserFreelanceRequest, FreelanceRequest } from '../firebase/services/freelanceRequests';
import {
  Clock,
  CheckCircle,
  XCircle,
  User,
  Mail,
  Briefcase,
  DollarSign,
  Calendar,
  ArrowLeft,
  Loader,
  AlertCircle,
  Award,
  Star
} from 'lucide-react';
import { type Route } from '../types';
import { toast, ToastContainer } from 'react-toastify';

const FreelancerRequestStatusPage = ({ navigate }: { navigate: (route: Route) => void }) => {
  const { user: currentUser } = useAuth();
  const [request, setRequest] = useState<FreelanceRequest | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequestStatus();
  }, [currentUser]);

  const fetchRequestStatus = async () => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const userRequest = await getUserFreelanceRequest(currentUser.uid);
      setRequest(userRequest);
    } catch (error) {
      console.error('Error fetching request status:', error);
      toast.error('Failed to load request status');
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          color: 'bg-yellow-500/20 text-yellow-600 border-yellow-500/30',
          gradientFrom: '#f59e0b',
          gradientTo: '#fbbf24',
          icon: Clock,
          text: 'PENDING REVIEW',
          description: 'Your application is being reviewed by our team.'
        };
      case 'approved':
        return {
          color: 'bg-green-500/20 text-green-600 border-green-500/30',
          gradientFrom: '#10b981',
          gradientTo: '#34d399',
          icon: CheckCircle,
          text: 'APPROVED',
          description: 'Congratulations! Your freelancer profile has been approved.'
        };
      case 'rejected':
        return {
          color: 'bg-red-500/20 text-red-600 border-red-500/30',
          gradientFrom: '#ef4444',
          gradientTo: '#f87171',
          icon: XCircle,
          text: 'REJECTED',
          description: 'Unfortunately, your application was not approved at this time.'
        };
      default:
        return {
          color: 'bg-gray-500/20 text-gray-600 border-gray-500/30',
          gradientFrom: '#6b7280',
          gradientTo: '#9ca3af',
          icon: AlertCircle,
          text: 'UNKNOWN',
          description: 'Status unknown.'
        };
    }
  };

  if (!currentUser) {
    return (
      <>
        <ToastContainer />
        <div className="min-h-screen py-16 px-4" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
          <div className="max-w-2xl mx-auto text-center py-20">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
              className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center bg-yellow-500/20"
            >
              <AlertCircle className="w-10 h-10 text-yellow-500" />
            </motion.div>
            <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-4">Authentication Required</h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
              Please log in to view your freelancer request status.
            </p>
            <button
              onClick={() => navigate('auth')}
              className="px-9 py-5 rounded-2xl font-bold text-base transition-all duration-300 relative overflow-hidden group"
              style={{
                background: `linear-gradient(135deg, var(--color-primary), var(--color-accent))`,
                color: 'white',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
              }}
            >
              <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  background: `linear-gradient(135deg, var(--color-accent), var(--color-primary))`
                }}
              />
              <span className="relative z-10">Go to Login</span>
            </button>
          </div>
        </div>
      </>
    );
  }

  if (loading) {
    return (
      <>
        <ToastContainer />
        <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
          <div className="text-center">
            <motion.div
              className="w-16 h-16 border-4 border-t-transparent rounded-full mx-auto mb-4"
              style={{ borderColor: 'var(--color-primary)' }}
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
            <p className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              Loading request status...
            </p>
          </div>
        </div>
      </>
    );
  }

  if (!request) {
    return (
      <>
        <ToastContainer />
        <div className="min-h-screen py-16 px-4" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
          <div className="max-w-4xl mx-auto">
            <motion.button
              onClick={() => navigate('find-work')}
              className="mb-8 inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all"
              style={{
                border: '2px solid var(--color-border)',
                color: 'var(--color-primary)',
                backgroundColor: 'transparent'
              }}
              whileHover={{
                scale: 1.02,
                backgroundColor: 'var(--color-card)'
              }}
              whileTap={{ scale: 0.98 }}
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Find Work
            </motion.button>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white/[0.85] dark:bg-white/[0.05] backdrop-blur-[20px] border border-blue-500/[0.15] dark:border-white/[0.1] rounded-[24px] p-12 text-center"
            >
              <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, color-mix(in srgb, var(--color-primary) 20%, transparent), color-mix(in srgb, var(--color-accent) 20%, transparent))`
                }}
              >
                <Briefcase className="w-10 h-10" style={{ color: 'var(--color-primary)' }} />
              </div>
              <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-4">No Application Found</h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                You haven't submitted a freelancer application yet.
              </p>
              <button
                onClick={() => navigate('become-freelancer')}
                className="px-9 py-5 rounded-2xl font-bold text-base transition-all duration-300 relative overflow-hidden group"
                style={{
                  background: `linear-gradient(135deg, var(--color-primary), var(--color-accent))`,
                  color: 'white',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
                }}
              >
                <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background: `linear-gradient(135deg, var(--color-accent), var(--color-primary))`
                  }}
                />
                <span className="relative z-10">Become a Freelancer</span>
              </button>
            </motion.div>
          </div>
        </div>
      </>
    );
  }

  const statusConfig = getStatusConfig(request.requestStatus);
  const StatusIcon = statusConfig.icon;

  return (
    <>
      <ToastContainer />

      <div className="min-h-screen py-16 px-4" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
        <div className="max-w-4xl mx-auto">
          <motion.button
            onClick={() => navigate('find-work')}
            className="mb-8 inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all"
            style={{
              border: '2px solid var(--color-border)',
              color: 'var(--color-primary)',
              backgroundColor: 'transparent'
            }}
            whileHover={{
              scale: 1.02,
              backgroundColor: 'var(--color-card)'
            }}
            whileTap={{ scale: 0.98 }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Find Work
          </motion.button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Status Header */}
            <div className="bg-white/[0.85] dark:bg-white/[0.05] backdrop-blur-[20px] border border-blue-500/[0.15] dark:border-white/[0.1] rounded-[24px] p-10">
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", duration: 0.6 }}
                  className="inline-flex items-center justify-center w-24 h-24 rounded-full mb-6"
                  style={{
                    background: `linear-gradient(135deg, ${statusConfig.gradientFrom}, ${statusConfig.gradientTo})`,
                    boxShadow: `0 8px 32px ${statusConfig.gradientFrom}40`
                  }}
                >
                  <StatusIcon className="w-12 h-12 text-white" />
                </motion.div>

                <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-4">Application Status</h1>

                <span
                  className="inline-block px-6 py-3 rounded-2xl text-lg font-bold mb-4"
                  style={{
                    background: `linear-gradient(135deg, ${statusConfig.gradientFrom}20, ${statusConfig.gradientTo}20)`,
                    border: `2px solid ${statusConfig.gradientFrom}50`,
                    color: statusConfig.gradientFrom
                  }}
                >
                  {statusConfig.text}
                </span>

                <p className="text-lg text-gray-600 dark:text-gray-300 mt-4">
                  {statusConfig.description}
                </p>
              </div>

              {request.requestStatus === 'approved' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mt-8 p-6 rounded-2xl"
                  style={{
                    background: 'linear-gradient(135deg, #10b98120, #34d39920)',
                    border: '2px solid #10b98150'
                  }}
                >
                  <p className="text-center text-green-600 dark:text-green-400 font-semibold mb-4 text-lg">
                    🎉 You can now start accepting gigs! Check your manage gigs dashboard.
                  </p>
                  <button
                    onClick={() => navigate('manage-gigs')}
                    className="w-full px-9 py-5 rounded-2xl font-bold text-base transition-all duration-300 relative overflow-hidden group"
                    style={{
                      background: `linear-gradient(135deg, #10b981, #34d399)`,
                      color: 'white',
                      boxShadow: '0 4px 20px rgba(16, 185, 129, 0.3)'
                    }}
                  >
                    <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{
                        background: `linear-gradient(135deg, #34d399, #10b981)`
                      }}
                    />
                    <span className="relative z-10">Go to Manage Gigs</span>
                  </button>
                </motion.div>
              )}
            </div>

            {/* Application Details */}
            <div className="bg-white/[0.85] dark:bg-white/[0.05] backdrop-blur-[20px] border border-blue-500/[0.15] dark:border-white/[0.1] rounded-[24px] p-10">
              <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-8 flex items-center gap-3">
                <Award className="w-8 h-8" style={{ color: 'var(--color-primary)' }} />
                Application Details
              </h2>

              <div className="space-y-6">
                {/* Personal Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-start gap-3 p-4 rounded-2xl" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{
                        background: `linear-gradient(135deg, var(--color-primary), var(--color-accent))`
                      }}
                    >
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Full Name</p>
                      <p className="font-bold text-gray-900 dark:text-white">{request.fullName}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 rounded-2xl" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{
                        background: `linear-gradient(135deg, var(--color-primary), var(--color-accent))`
                      }}
                    >
                      <Mail className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Email</p>
                      <p className="font-bold text-gray-900 dark:text-white break-all">{request.userEmail}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 rounded-2xl" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{
                        background: `linear-gradient(135deg, var(--color-primary), var(--color-accent))`
                      }}
                    >
                      <Briefcase className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Professional Title</p>
                      <p className="font-bold text-gray-900 dark:text-white">{request.title}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 rounded-2xl" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{
                        background: `linear-gradient(135deg, var(--color-primary), var(--color-accent))`
                      }}
                    >
                      <DollarSign className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Hourly Rate</p>
                      <p className="font-bold text-gray-900 dark:text-white">{request.currency} {request.hourlyRate}/hr</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 rounded-2xl md:col-span-2" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{
                        background: `linear-gradient(135deg, var(--color-primary), var(--color-accent))`
                      }}
                    >
                      <Calendar className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Submitted On</p>
                      <p className="font-bold text-gray-900 dark:text-white">
                        {request.createdAt?.toDate().toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Skills */}
                <div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <Star className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
                    Skills
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {request.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-4 py-2 rounded-xl text-sm font-bold"
                        style={{
                          background: `linear-gradient(to right, color-mix(in srgb, var(--color-primary) 20%, transparent), color-mix(in srgb, var(--color-accent) 20%, transparent))`,
                          border: `1px solid var(--color-primary)`,
                          color: 'var(--color-primary)'
                        }}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Categories */}
                <div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <Briefcase className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
                    Categories
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {request.categories.map((category, index) => (
                      <span
                        key={index}
                        className="px-4 py-2 rounded-xl text-sm font-bold"
                        style={{
                          background: `linear-gradient(135deg, var(--color-primary), var(--color-accent))`,
                          color: 'white'
                        }}
                      >
                        {category}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white mb-3">Professional Bio</p>
                  <div className="p-6 rounded-2xl" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
                    <p className="text-gray-900 dark:text-white whitespace-pre-wrap leading-relaxed">
                      {request.bio}
                    </p>
                  </div>
                </div>

                {/* Experience & Availability */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white mb-3">Experience Level</p>
                    <span
                      className="inline-block px-4 py-2 rounded-xl text-sm font-bold capitalize"
                      style={{
                        background: `linear-gradient(to right, color-mix(in srgb, var(--color-primary) 20%, transparent), color-mix(in srgb, var(--color-accent) 20%, transparent))`,
                        border: `1px solid var(--color-primary)`,
                        color: 'var(--color-primary)'
                      }}
                    >
                      {request.experience}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white mb-3">Availability</p>
                    <p className="text-gray-900 dark:text-white font-semibold capitalize">{request.availability}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Info */}
            {request.requestStatus === 'pending' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 rounded-2xl"
                style={{
                  background: 'linear-gradient(135deg, #3b82f620, #60a5fa20)',
                  border: '2px solid #3b82f650'
                }}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{
                      background: `linear-gradient(135deg, #3b82f6, #60a5fa)`
                    }}
                  >
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-blue-600 dark:text-blue-400 mb-2 text-lg">What's Next?</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Our team is reviewing your application. This typically takes 1-3 business days.
                      You'll receive an email notification once a decision is made.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {request.requestStatus === 'rejected' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 rounded-2xl"
                style={{
                  background: 'linear-gradient(135deg, #ef444420, #f8717120)',
                  border: '2px solid #ef444450'
                }}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{
                      background: `linear-gradient(135deg, #ef4444, #f87171)`
                    }}
                  >
                    <AlertCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-red-600 dark:text-red-400 mb-2 text-lg">Application Not Approved</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                      We appreciate your interest in becoming a freelancer on Fogsly.
                      Unfortunately, we couldn't approve your application at this time.
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      You can improve your profile and reapply in the future.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default FreelancerRequestStatusPage;
