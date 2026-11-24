import { LoginData, SignupData, AuthResponse, User } from "../types/user";

// Default Mock Fake User for nain123
export const MOCK_NAIN_USER: User = {
  uid: 'mock-user-nain123',
  email: 'nain123@gmail.com',
  displayName: 'Nain',
  emailVerified: true,
  createdAt: new Date(),
  lastLoginAt: new Date()
};

// Local Auth Listener Subscribers
type AuthCallback = (user: any | null) => void;
let authListeners: AuthCallback[] = [];

const notifyAuthListeners = (user: any | null) => {
  authListeners.forEach((callback) => {
    try {
      callback(user);
    } catch (e) {
      console.error("Error in auth listener callback:", e);
    }
  });
};

/**
 * Get current stored user from local state/localStorage
 */
export const getCurrentUser = (): any | null => {
  try {
    const stored = localStorage.getItem('fogsly_current_user');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error("Error parsing current user from localStorage:", e);
  }
  return null;
};

/**
 * Listen to authentication state changes locally
 */
export const onAuthStateChange = (callback: AuthCallback) => {
  authListeners.push(callback);

  // Notify immediately with current cached user state
  const currentUser = getCurrentUser();
  setTimeout(() => {
    callback(currentUser);
  }, 0);

  return () => {
    authListeners = authListeners.filter(cb => cb !== callback);
  };
};

/**
 * Sign up a new user (Offline Mock Mode)
 */
export const signUp = async (signupData: SignupData): Promise<AuthResponse> => {
  const { email, name } = signupData;
  const cleanEmail = (email || '').trim().toLowerCase();

  const user: User = {
    uid: `mock-user-${Date.now()}`,
    email: cleanEmail.includes('@') ? cleanEmail : `${cleanEmail}@gmail.com`,
    displayName: name || 'New User',
    emailVerified: true,
    createdAt: new Date(),
    lastLoginAt: new Date()
  };

  localStorage.setItem('fogsly_current_user', JSON.stringify(user));
  notifyAuthListeners(user);

  return {
    success: true,
    user
  };
};

/**
 * Sign in an existing user with email/username and password (Offline Mock Mode)
 * Credentials: Username "nain123" or email "nain123@gmail.com", Password "123456"
 */
export const signIn = async (loginData: LoginData): Promise<AuthResponse> => {
  const { email, password } = loginData;
  const inputIdentifier = (email || '').trim().toLowerCase();

  // Validate credentials for nain123 or fallback demo user
  const isNain = inputIdentifier === 'nain123' || inputIdentifier === 'nain123@gmail.com';

  const user: User = isNain ? MOCK_NAIN_USER : {
    uid: `mock-user-${Date.now()}`,
    email: inputIdentifier.includes('@') ? inputIdentifier : `${inputIdentifier}@gmail.com`,
    displayName: inputIdentifier.split('@')[0] || 'Demo User',
    emailVerified: true,
    createdAt: new Date(),
    lastLoginAt: new Date()
  };

  localStorage.setItem('fogsly_current_user', JSON.stringify(user));
  notifyAuthListeners(user);

  return {
    success: true,
    user
  };
};

/**
 * Sign out the current user
 */
export const signOutUser = async (): Promise<void> => {
  localStorage.removeItem('fogsly_current_user');
  notifyAuthListeners(null);
};

/**
 * Convert user format
 */
export const convertFirebaseUser = (firebaseUser: any): User => {
  return {
    uid: firebaseUser.uid || 'mock-user-nain123',
    email: firebaseUser.email || 'nain123@gmail.com',
    displayName: firebaseUser.displayName || 'Nain',
    emailVerified: true
  };
};

/**
 * Send password reset email to user (Mock)
 */
export const sendPasswordReset = async (email: string): Promise<AuthResponse> => {
  return {
    success: true,
    message: 'Password reset link simulated! You can now log in with password "123456".'
  };
};

/**
 * Verify password reset code (Mock)
 */
export const verifyPasswordResetToken = async (code: string): Promise<AuthResponse> => {
  return {
    success: true,
    email: 'nain123@gmail.com',
    message: 'Reset code verified successfully'
  };
};

/**
 * Sign in with Google (Mock Mode)
 */
export const signInWithGoogle = async (): Promise<AuthResponse & { isNewUser?: boolean }> => {
  const user: User = MOCK_NAIN_USER;
  localStorage.setItem('fogsly_current_user', JSON.stringify(user));
  notifyAuthListeners(user);

  return {
    success: true,
    user,
    isNewUser: false
  };
};

/**
 * Reset password (Mock)
 */
export const resetPassword = async (code: string, newPassword: string): Promise<AuthResponse> => {
  return {
    success: true,
    message: 'Password updated successfully. Please login with your new credentials.'
  };
};
