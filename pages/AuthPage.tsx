import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Lock, Eye, EyeOff, Trophy, Users, Chrome, Facebook, Twitter, Linkedin, ArrowRight } from "lucide-react";
import GoogleIcon from "../components/icons/GoogleIcon";
import { type Route } from '../types';
import { signUp, signIn, signOutUser, signInWithGoogle } from '../firebase/services/authService';
import { setupNewUser, getUserData } from '../firebase/services/userService';
import { getTotalUserCount, getUserRank } from '../firebase/services/rankingService';
import {
  createReferralCodeForUser,
  submitSurvey,
  validateReferralCode,
  createReferral
} from '../firebase/services/referralService';
import { toast, ToastContainer } from 'react-toastify';
import { useScrollingNavigate } from '@/utils/navigationUtils';
import SurveyPopupModal from '../components/modals/SurveyPopupModal';
import ReferralInputModal from '../components/modals/ReferralInputModal';
import ProfileCompletionModal from '../components/modals/ProfileCompletionModal';
import { updateUserProfile } from '../firebase/services/userService';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/toast.css';

type AuthMode = 'login' | 'signup';

interface AuthPageProps {
  navigate: (route: Route) => void;
  onLogin: () => void;
  initialMode?: AuthMode; // Add optional initial mode prop
}

export default function AuthPage({ navigate, onLogin, initialMode = 'login' }: AuthPageProps) {
  // Check for referral code FIRST to determine initial mode
  const getInitialMode = (): AuthMode => {
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get('ref');
    // If referral code exists, default to signup mode
    return refCode ? 'signup' : initialMode;
  };

  const [mode, setMode] = useState<AuthMode>(getInitialMode());
  const [email, setEmail] = useState('nain123');
  const [password, setPassword] = useState('123456');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [totalUsers, setTotalUsers] = useState<number | null>(null);
  const navigateWithScroll = useScrollingNavigate(navigate);
  
  // Referral system states
  const [showProfileCompletion, setShowProfileCompletion] = useState(false);
  const [showReferralInput, setShowReferralInput] = useState(false);
  const [showSurvey, setShowSurvey] = useState(false);
  const [newUserId, setNewUserId] = useState<string>('');
  const [newUserName, setNewUserName] = useState<string>('');
  const [newUserEmail, setNewUserEmail] = useState<string>('');
  const [referralError, setReferralError] = useState<string>('');
  const [isValidatingReferral, setIsValidatingReferral] = useState(false);
  const [isCompletingProfile, setIsCompletingProfile] = useState(false);
  const [surveyCompletedTime, setSurveyCompletedTime] = useState<number | null>(null);
  const [pendingReferralCode, setPendingReferralCode] = useState<string>('');

  // Check for referral code in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get('ref');
    if (refCode) {
      // Store referral code for later use
      sessionStorage.setItem('pendingReferralCode', refCode);
      setPendingReferralCode(refCode);
      // Auto-switch to signup mode
      setMode('signup');
    }
  }, []);
  
  // Load total user count when component mounts
  React.useEffect(() => {
    const loadTotalUsers = async () => {
      try {
        const count = await getTotalUserCount();
        setTotalUsers(count);
      } catch (error) {
        console.error('Error loading total user count:', error);
      }
    };

    loadTotalUsers();
  }, []);

  // Client-side validation
  const validateForm = () => {
    if (mode === 'signup') {
      if (!name.trim() || name.trim().length < 2) {
        toast.error('Please enter a valid name (at least 2 characters)');
        return false;
      }
    }

    if (!email.trim()) {
      toast.error('Email or username is required');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email.trim() !== 'nain123' && !email.trim().includes('@') && !emailRegex.test(email)) {
      toast.error('Please enter a valid email or username');
      return false;
    }

    if (!password) {
      toast.error('Password is required');
      return false;
    }

    if (mode === 'signup' && password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return false;
    }

    return true;
  };

  const handleGoogleAuth = async () => {
    setIsLoading(true);

    try {
      const result = await signInWithGoogle();

      if (result.success && result.user) {
        if (result.isNewUser) {
          // New user - setup their profile and assign rank
          await setupNewUser(result.user.uid, result.user.email, result.user.displayName || 'User');
          
          // Update total user count
          setTotalUsers(prev => prev ? prev + 1 : 1);

          // Start signup flow (referral + survey)
          startSignupFlow(
            result.user.uid,
            result.user.displayName || 'User',
            result.user.email || ''
          );
        } else {
          // Existing user - check if account is suspended
          const userData = await getUserData(result.user.uid);
          
          // Check if user is suspended
          if (userData && userData.status === 'suspended') {
            await signOutUser(); // Sign them out immediately
            toast.error('❌ Your account has been suspended. Please contact support for assistance.');
            setIsLoading(false);
            return;
          }
          
          const userRank = await getUserRank(result.user.uid);

          if (userData && userData.role === 'admin') {
            toast.success(
              userRank
                ? `🔧 Welcome back, Admin! (Member #${userRank})`
                : '🔧 Welcome back, Admin!'
            );
            onLogin(); // Set login state in App
            navigateWithScroll('admin-dashboard');
            return;
          } else {
            toast.success(
              userRank
                ? `🎉 Welcome back to FOGSLY, Member #${userRank}!`
                : '🎉 Welcome back to FOGSLY!'
            );
          }

          // Set login state and navigate
          onLogin();
          navigate('home');
        }
      } else {
        toast.error(result.error || 'Failed to sign in with Google');
      }
    } catch (error: any) {
      console.error('Google auth error:', error);
      toast.error('❌ An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side validation first
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      if (mode === 'signup') {
        // Sign up new user
        const result = await signUp({ name, email, password });

        if (result.success && result.user) {
          // Setup user data and profile in Firestore (this will assign rank)
          await setupNewUser(result.user.uid, email, name);

          // Update total user count
          setTotalUsers(prev => prev ? prev + 1 : 1);

          // Start signup flow (referral + survey)
          startSignupFlow(result.user.uid, name, email);
        } else {
          toast.error(result.error || 'Failed to create account');
        }
      } else {
        // Sign in existing user
        const result = await signIn({ email, password });

        if (result.success && result.user) {
          try {
            const userData = await getUserData(result.user.uid);
            
            // Check if user is suspended
            if (userData && userData.status === 'suspended') {
              await signOutUser(); // Sign them out immediately
              toast.error('❌ Your account has been suspended. Please contact support for assistance.');
              setIsLoading(false);
              return;
            }
            
            const userRank = await getUserRank(result.user.uid);

            if (userData && userData.role === 'admin') {
              toast.success(
                userRank
                  ? `🔧 Welcome back, Admin! (Member #${userRank})`
                  : '🔧 Welcome back, Admin!'
              );
              onLogin(); // Set login state in App
              navigateWithScroll('admin-dashboard');
            } else {
              toast.success(
                userRank
                  ? `🎉 Welcome back to FOGSLY, Member #${userRank}!`
                  : '🎉 Welcome back to FOGSLY!'
              );
              onLogin(); // Set login state in App
              navigate('home'); // Redirect to home
            }
          } catch (userError) {
            console.error('Error fetching user data:', userError);
            toast.success('🎉 Welcome back to FOGSLY!');
            onLogin();
            navigate('profile');
          }
        } else {
          toast.error(result.error || 'Failed to log in');
        }
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      toast.error('❌ An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    setPassword(''); // Clear password for security
    // Dismiss any existing toasts
    toast.dismiss();
  };

  // Handle referral code submission
  const handleReferralSubmit = async (referralCode: string) => {
    setIsValidatingReferral(true);
    setReferralError('');

    try {
      const validation = await validateReferralCode(referralCode);
      
      if (!validation.valid) {
        setReferralError('Invalid referral code. Please check and try again.');
        setIsValidatingReferral(false);
        return;
      }

      // Create referral record
      await createReferral(referralCode, newUserId, newUserName, newUserEmail);
      
      // Clear pending referral code
      sessionStorage.removeItem('pendingReferralCode');
      
      // Close referral modal and show survey
      setShowReferralInput(false);
      setShowSurvey(true);
    } catch (error) {
      console.error('Error processing referral:', error);
      setReferralError('Failed to process referral code. Please try again.');
    } finally {
      setIsValidatingReferral(false);
    }
  };

  // Handle skipping referral code
  const handleReferralSkip = () => {
    sessionStorage.removeItem('pendingReferralCode');
    setShowReferralInput(false);
    setShowSurvey(true);
  };

  // Handle survey completion
  const handleSurveyComplete = async (hearAboutUs: string, primaryGoal: string) => {
    try {
      // Submit survey
      await submitSurvey({
        userId: newUserId,
        userName: newUserName,
        userEmail: newUserEmail,
        hearAboutUs,
        primaryGoal
      });

      // Generate referral code for the new user
      await createReferralCodeForUser(newUserId, newUserName, newUserEmail);

      // Record survey completion time
      setSurveyCompletedTime(Date.now());
      
      // Close survey modal
      setShowSurvey(false);

      toast.success('🎉 Welcome to FOGSLY! Your account is all set up!');

      // Navigate to home after survey
      onLogin();
      navigate('home');

      // Show rank modal after 2 minutes
      setTimeout(() => {
        // The rank modal logic should be in the home page or App.tsx
        // For now, we'll just log it
        console.log('Should show rank modal now');
      }, 120000); // 2 minutes
    } catch (error) {
      console.error('Error completing survey:', error);
      toast.error('Failed to save survey. Please try again.');
    }
  };

  // Handle profile completion
  const handleProfileComplete = async (profileData: {
    country: string;
    city: string;
    phone: string;
    role: string;
  }) => {
    setIsCompletingProfile(true);
    
    try {
      // Update user profile with the provided data
      await updateUserProfile(newUserId, {
        country: profileData.country,
        city: profileData.city,
        phone: profileData.phone,
        role: profileData.role
      });

      // Close profile completion modal
      setShowProfileCompletion(false);

      // Check for pending referral code from URL
      const pendingRefCode = sessionStorage.getItem('pendingReferralCode');
      
      if (pendingRefCode) {
        // Show referral input modal with pre-filled code
        setShowReferralInput(true);
      } else {
        // Show referral input modal to ask if they have a code
        setShowReferralInput(true);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to save profile information. Please try again.');
    } finally {
      setIsCompletingProfile(false);
    }
  };

  // Start signup flow for new users
  const startSignupFlow = async (userId: string, userName: string, userEmail: string) => {
    setNewUserId(userId);
    setNewUserName(userName);
    setNewUserEmail(userEmail);

    // Show profile completion modal FIRST
    setShowProfileCompletion(true);
  };

  // Test function - expose to window for console testing
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).showProfileModal = () => {
        setNewUserId('test-user-id');
        setNewUserName('Test User');
        setNewUserEmail('test@example.com');
        setShowProfileCompletion(true);
        console.log('✅ Profile Completion Modal opened!');
      };
      
      (window as any).hideProfileModal = () => {
        setShowProfileCompletion(false);
        console.log('❌ Profile Completion Modal closed!');
      };
    }
  }, []);

  // Input variants for smooth transitions
  const inputVariants = {
    hidden: { opacity: 0, y: 10, height: 0, marginBottom: 0 },
    visible: { opacity: 1, y: 0, height: "auto", marginBottom: 16 },
    exit: { opacity: 0, y: -10, height: 0, marginBottom: 0 }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[--color-bg-secondary] p-4 font-sans overflow-x-hidden transition-colors duration-500">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        toastClassName="text-sm"
        aria-label="Notifications"
      />

      {/* Background Blobs - Theme Aware */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[--color-primary]/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-[--color-primary]/5 rounded-full blur-[100px]" />
      </div>

      {/* Logo in top-left corner */}
      <div className="fixed top-6 left-6 z-30">
        <button
          onClick={() => navigate('home')}
          className="flex items-center gap-2"
          aria-label="Go to homepage"
        >
          <span className="text-xl font-bold text-[--color-primary]">FOGSLY</span>
        </button>
      </div>

      {/* Community Stats - Positioned above card */}
      {totalUsers !== null && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-[1000px] mb-4 text-center z-20"
        >
          <div className="inline-flex items-center justify-center gap-2 text-[--color-text-secondary] text-sm bg-[--color-card] px-5 py-2.5 rounded-full shadow-md ring-1 ring-[--color-border]">
            <Users className="w-4 h-4 flex-shrink-0" />
            <span className="whitespace-nowrap">Join {totalUsers.toLocaleString()} members in the FOGSLY community</span>
          </div>
        </motion.div>
      )}

      {/* Main Card Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-[1000px] bg-[--color-card] rounded-[32px] shadow-2xl overflow-hidden flex flex-col md:flex-row ring-1 ring-[--color-border] z-10"
      >

        {/* Left Panel: Primary Gradient & Welcome Message */}
        <div className="relative w-full md:w-[45%] bg-[--color-primary] text-white flex flex-col justify-center items-center text-center p-8 md:p-10 min-h-[300px] md:min-h-[600px] z-20 overflow-hidden transition-colors duration-500">

          {/* Dynamic Circles Background Decoration */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute top-[-30%] left-[-30%] w-[400px] h-[400px] rounded-[40%] border-[2px] border-white/10 blur-[2px]"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-[-20%] right-[-20%] w-[300px] h-[300px] bg-white/5 rounded-[35%] blur-[40px]"
          />

          {/* Curve Separator (Desktop Only) */}
          <div className="hidden md:block absolute top-0 right-[-1px] translate-x-[99%] h-full w-[120px] z-20 pointer-events-none text-[--color-primary]">
             <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full fill-current">
                <path d="M0 0 C 30 0 80 0 80 0 L 80 100 C 80 100 30 100 0 100 C 50 50 50 50 0 0 Z" className="text-[--color-card] fill-current"/>
             </svg>
          </div>

          {/* Content Switching Animation */}
          <div className="relative z-10 max-w-xs mx-auto min-h-[180px] flex flex-col justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={mode === 'login' ? "login-msg" : "signup-msg"}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                <h2 className="text-3xl md:text-4xl font-bold mb-4 font-heading tracking-tight drop-shadow-md text-white">
                  {mode === 'login' ? "New here?" : "One of us?"}
                </h2>
                <p className="mb-8 text-white/90 text-base leading-relaxed font-light">
                  {mode === 'login'
                    ? "Join us today and discover a world of possibilities. Create your account in seconds!"
                    : "If you already have an account, just sign in. We've missed you!"}
                </p>
              </motion.div>
            </AnimatePresence>

            <motion.button
              onClick={() => switchMode(mode === 'login' ? 'signup' : 'login')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3 border-2 border-white rounded-full font-bold text-sm tracking-widest uppercase text-white hover:bg-white hover:text-[--color-primary] transition-all duration-300 shadow-lg"
            >
              {mode === 'login' ? "Sign Up" : "Sign In"}
            </motion.button>
          </div>
        </div>

        {/* Right Panel: Form Section */}
        <div className="flex-1 bg-[--color-card] flex flex-col justify-center items-center p-6 md:p-8 relative z-10">

          <div className="w-full max-w-[380px]">
            <div className="text-center mb-6">
              <AnimatePresence mode="wait">
                <motion.h2
                  key={mode === 'login' ? "signin-header" : "signup-header"}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-3xl font-extrabold text-[--color-text-primary] font-heading mb-2"
                >
                  {mode === 'login' ? "Sign in" : "Create Account"}
                </motion.h2>
              </AnimatePresence>
              {totalUsers !== null && mode === 'signup' && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs text-[--color-text-secondary] flex items-center justify-center gap-2"
                >
                  <Trophy className="w-3 h-3 text-[--color-primary]" />
                  Become member #{totalUsers + 1} of our growing community!
                </motion.p>
              )}
            </div>

            {/* Social Icons */}
            <div className="flex justify-center gap-3 mb-6">
              <SocialButton
                icon={<GoogleIcon size={18} />}
                index={0}
                onClick={handleGoogleAuth}
                disabled={isLoading}
              />
              {[<Facebook size={18} />, <Twitter size={18} />, <Linkedin size={18} />].map((icon, index) => (
                <SocialButton
                  key={index + 1}
                  icon={icon}
                  index={index + 1}
                  onClick={() => toast.info('Coming soon!')}
                  disabled={false}
                />
              ))}
            </div>

            <div className="relative mb-5">
               <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[--color-border]"></div></div>
               <div className="relative flex justify-center text-xs"><span className="px-4 bg-[--color-card] text-[--color-text-secondary] font-medium">Or use your email</span></div>
            </div>

            <form onSubmit={handleSubmit} className="relative">
              <AnimatePresence initial={false}>
                {mode === 'signup' && (
                   <motion.div
                      key="fullname-input"
                      variants={inputVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="overflow-hidden"
                   >
                      <InputGroup
                        icon={<User size={18} />}
                        type="text"
                        placeholder="Full Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                   </motion.div>
                )}
              </AnimatePresence>

              <motion.div layout className="mb-3">
                <InputGroup
                  icon={<Mail size={18} />}
                  type="text"
                  placeholder="Username or Email (e.g. nain123)"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </motion.div>

              <motion.div layout className="mb-3">
                <InputGroup
                  icon={<Lock size={18} />}
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  isPassword
                  showPassword={showPassword}
                  setShowPassword={setShowPassword}
                  required
                  minLength={mode === 'signup' ? 8 : undefined}
                />
              </motion.div>

              {mode === 'signup' && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs text-[--color-text-secondary] mb-3"
                >
                  Password must be at least 8 characters.
                </motion.p>
              )}

              <AnimatePresence>
                {mode === 'login' && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 p-3 bg-[--color-primary]/10 border border-[--color-primary]/25 rounded-2xl text-center"
                  >
                    <p className="text-xs font-bold text-[--color-primary] mb-1 flex items-center justify-center gap-1">
                      <span>⚡</span> Fake User Demo Credentials
                    </p>
                    <div className="text-xs text-[--color-text-secondary] flex items-center justify-center gap-3">
                      <span>User: <strong className="text-[--color-text-primary]">nain123</strong></span>
                      <span>Pass: <strong className="text-[--color-text-primary]">123456</strong></span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {mode === 'login' && (
                    <motion.div
                      key="forgot-password"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex justify-center w-full mb-4 overflow-hidden"
                    >
                        <button
                          type="button"
                          onClick={() => navigate('forgot-password')}
                          className="text-[--color-text-secondary] text-xs font-semibold hover:text-[--color-primary] transition-colors border-b-2 border-transparent hover:border-[--color-primary] pb-0.5"
                        >
                            Forgot your password?
                        </button>
                    </motion.div>
                )}
              </AnimatePresence>

              <motion.button
                  layout
                  type="submit"
                  disabled={isLoading}
                  whileHover={{ scale: 1.02, boxShadow: "0 20px 25px -5px rgba(var(--color-primary), 0.4)" }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-[--color-primary] hover:bg-[--color-primary]/90 text-white font-bold py-3.5 rounded-full shadow-lg shadow-[--color-primary]/30 transition-all duration-300 mt-2 uppercase text-sm tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
              >
                  {isLoading ? (
                    <span className="animate-pulse">Processing...</span>
                  ) : mode === 'login' ? (
                    'Login'
                  ) : (
                    `Join as Member #${totalUsers !== null ? totalUsers + 1 : '...'}`
                  )}
              </motion.button>

              {/* Switch Mode Link */}
              <motion.div layout className="mt-3 text-center">
                <button
                  type="button"
                  onClick={() => switchMode(mode === 'login' ? 'signup' : 'login')}
                  className="text-sm text-[--color-text-secondary] hover:text-[--color-primary] transition-colors"
                >
                  {mode === 'login' ? (
                    <>Don't have an account? <span className="font-semibold">Sign up</span></>
                  ) : (
                    <>Already have an account? <span className="font-semibold">Log in</span></>
                  )}
                </button>
              </motion.div>
            </form>

            {/* Guest Login */}
            <motion.div
              layout
              className="mt-6 pt-4 border-t border-[--color-border] flex justify-center"
            >
               <motion.button
                  onClick={() => {
                    onLogin();
                    navigate('home');
                  }}
                  whileHover={{ x: 5 }}
                  className="group flex items-center gap-2 px-5 py-1.5 rounded-full text-[--color-text-secondary] hover:text-[--color-primary] hover:bg-[--color-bg-secondary] transition-all text-xs font-bold"
               >
                  <span>Continue as Guest</span>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
               </motion.button>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Profile Completion Modal - Shows FIRST */}
      {showProfileCompletion && (
        <ProfileCompletionModal
          userName={newUserName}
          onComplete={handleProfileComplete}
          isSubmitting={isCompletingProfile}
        />
      )}

      {/* Referral Input Modal */}
      {showReferralInput && (
        <ReferralInputModal
          onSubmit={handleReferralSubmit}
          onSkip={handleReferralSkip}
          isValidating={isValidatingReferral}
          error={referralError}
          initialCode={pendingReferralCode}
        />
      )}

      {/* Survey Popup Modal */}
      {showSurvey && (
        <SurveyPopupModal
          userName={newUserName}
          onComplete={handleSurveyComplete}
        />
      )}
    </div>
  );
}

// --- Helper Components ---

const InputGroup = ({ icon, type, placeholder, isPassword, showPassword, setShowPassword, value, onChange, required, minLength }: any) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <motion.div
      animate={isFocused ? {
        scale: 1.01,
        borderColor: "rgb(var(--color-primary))",
        backgroundColor: "rgb(var(--color-card))"
      } : {
        scale: 1,
        borderColor: "transparent",
        backgroundColor: "rgb(var(--color-bg-secondary))"
      }}
      className={`group rounded-xl flex items-center px-4 py-3 transition-all border border-transparent shadow-sm`}
    >
      <div className={`mr-3 transition-colors ${isFocused ? "text-[--color-primary]" : "text-[--color-text-secondary]"}`}>
        {icon}
      </div>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="bg-transparent outline-none flex-1 text-[--color-text-primary] placeholder-[--color-text-secondary] font-medium text-sm"
        required={required}
        minLength={minLength}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
      {isPassword && (
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="text-[--color-text-secondary] hover:text-[--color-primary] transition-colors focus:outline-none p-1"
        >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      )}
    </motion.div>
  );
};

const SocialButton: React.FC<{ icon: React.ReactNode, index: number, onClick: () => void, disabled: boolean }> = ({ icon, index, onClick, disabled }) => (
  <motion.button
    type="button"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.1 * index, duration: 0.4 }}
    whileHover={{ y: -3, scale: 1.08, boxShadow: "0 8px 12px -3px rgba(0, 0, 0, 0.1)" }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    disabled={disabled}
    className="w-11 h-11 rounded-full border border-[--color-border] flex items-center justify-center text-[--color-text-secondary] hover:bg-[--color-card] hover:border-[--color-primary] hover:text-[--color-primary] transition-colors bg-[--color-bg-secondary]/50 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
  >
    {icon}
  </motion.button>
);