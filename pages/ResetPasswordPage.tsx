import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Label } from "../components/ui/Label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/Card";
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle } from "lucide-react";
import { type Route } from '../types';
import { verifyPasswordResetToken, resetPassword } from '../firebase/services/authService';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/toast.css';

interface ResetPasswordPageProps {
  navigate: (route: Route) => void;
  resetCode?: string; // Optional - will be extracted from URL if not provided
}

export default function ResetPasswordPage({ navigate, resetCode }: ResetPasswordPageProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [isValidCode, setIsValidCode] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [isPasswordReset, setIsPasswordReset] = useState(false);

  // Password strength validation
  const getPasswordStrength = (password: string) => {
    let score = 0;
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };

    Object.values(checks).forEach(check => check && score++);

    if (score < 2) return { strength: 'weak', color: 'red', text: 'Weak' };
    if (score < 4) return { strength: 'medium', color: 'yellow', text: 'Medium' };
    return { strength: 'strong', color: 'green', text: 'Strong' };
  };

  const passwordStrength = getPasswordStrength(password);

  // Verify reset code on component mount
  useEffect(() => {
    const verifyCode = async () => {
      // Get reset code from URL parameters (Firebase sends it as 'oobCode')
      const urlParams = new URLSearchParams(window.location.search);
      const codeFromUrl = urlParams.get('oobCode') || urlParams.get('code') || resetCode;
      
      if (!codeFromUrl) {
        toast.error('Invalid password reset link');
        navigate('auth');
        return;
      }

      setIsVerifying(true);
      try {
        const result = await verifyPasswordResetToken(codeFromUrl);
        if (result.success && result.email) {
          setIsValidCode(true);
          setUserEmail(result.email);
          // Store the code for later use
          window.sessionStorage.setItem('resetCode', codeFromUrl);
        } else {
          toast.error(result.error || 'Invalid or expired reset code');
          setTimeout(() => navigate('auth'), 3000);
        }
      } catch (error) {
        console.error('Error verifying reset code:', error);
        toast.error('Failed to verify reset code');
        setTimeout(() => navigate('auth'), 3000);
      } finally {
        setIsVerifying(false);
      }
    };

    verifyCode();
  }, [resetCode, navigate]);

  const validateForm = (): boolean => {
    if (!password) {
      toast.error('Please enter a new password');
      return false;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return false;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    // Get the reset code from session storage or URL
    const urlParams = new URLSearchParams(window.location.search);
    const codeFromUrl = urlParams.get('oobCode') || urlParams.get('code') || resetCode;
    const storedCode = window.sessionStorage.getItem('resetCode');
    const finalCode = codeFromUrl || storedCode;

    if (!finalCode) {
      toast.error('Reset code not found. Please try again.');
      return;
    }

    setIsLoading(true);

    try {
      const result = await resetPassword(finalCode, password);
      
      if (result.success) {
        setIsPasswordReset(true);
        toast.success(result.message || 'Password reset successfully!');
        // Clear the stored code
        window.sessionStorage.removeItem('resetCode');
        setTimeout(() => navigate('auth'), 3000);
      } else {
        toast.error(result.error || 'Failed to reset password');
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate('auth');
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600">Verifying reset code...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isValidCode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Invalid Reset Link</h3>
            <p className="text-gray-600 mb-6">This password reset link is invalid or has expired.</p>
            <Button onClick={handleBackToLogin} className="w-full">
              Back to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
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
        className="custom-toast-container"
      />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mx-auto mb-4 w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center"
            >
              {isPasswordReset ? (
                <CheckCircle className="w-8 h-8 text-white" />
              ) : (
                <Lock className="w-8 h-8 text-white" />
              )}
            </motion.div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              {isPasswordReset ? 'Password Reset Successfully!' : 'Reset Your Password'}
            </CardTitle>
            <CardDescription className="text-gray-600 mt-2">
              {isPasswordReset 
                ? 'You can now sign in with your new password'
                : `Create a new password for ${userEmail}`
              }
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {!isPasswordReset ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                    New Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your new password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {password && (
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        {[1, 2, 3].map((level) => (
                          <div
                            key={level}
                            className={`h-1 w-8 rounded ${
                              passwordStrength.strength === 'weak' && level === 1
                                ? 'bg-red-500'
                                : passwordStrength.strength === 'medium' && level <= 2
                                ? 'bg-yellow-500'
                                : passwordStrength.strength === 'strong'
                                ? 'bg-green-500'
                                : 'bg-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                      <span className={`text-xs font-medium text-${passwordStrength.color}-600`}>
                        {passwordStrength.text}
                      </span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                    Confirm New Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10 pr-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {confirmPassword && password !== confirmPassword && (
                    <p className="text-sm text-red-600">Passwords do not match</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-105"
                  disabled={isLoading || password !== confirmPassword}
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Updating...</span>
                    </div>
                  ) : (
                    'Update Password'
                  )}
                </Button>
              </form>
            ) : (
              <div className="text-center space-y-4">
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm text-green-800">
                    Your password has been successfully updated. You will be redirected to the login page.
                  </p>
                </div>
              </div>
            )}
          </CardContent>

          <CardFooter className="pt-6">
            <Button
              onClick={handleBackToLogin}
              variant="ghost"
              className="w-full text-gray-600 hover:text-gray-800 h-12"
            >
              Back to Login
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
