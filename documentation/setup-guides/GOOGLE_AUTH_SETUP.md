# Google Authentication Setup Guide

## Firebase Console Configuration

To enable Google authentication in your Firebase project, follow these steps:

### 1. Enable Google Sign-In Provider

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Select your project (`fogsly-57a8e`)
3. Navigate to **Authentication** → **Sign-in method**
4. Click on **Google** from the providers list
5. Toggle **Enable** to ON
6. Configure the provider:
   - **Project support email**: Use your project email
   - **Project public-facing name**: "FOGSLY" 
7. Click **Save**

### 2. Configure OAuth Consent Screen (if needed)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your Firebase project
3. Navigate to **APIs & Services** → **OAuth consent screen**
4. Configure the consent screen with your app details

### 3. Domain Authorization

Make sure your domain is authorized in Firebase:
1. In Firebase Console → **Authentication** → **Settings** → **Authorized domains**
2. Add your production domain if not already present

## Features Implemented

### Google Authentication Flow

1. **Sign Up with Google**: 
   - New users are automatically registered
   - User profile is created in Firestore
   - Rank is assigned and congratulation message shown
   - Total user count is updated

2. **Sign In with Google**:
   - Existing users are logged in
   - Admin users are redirected to admin dashboard
   - Regular users see welcome message with rank
   - User rank is fetched and displayed

### UI Components

- **Google Sign-in Button**: Clean, professional design with Google logo
- **Rank Congratulations**: Shows user rank for both new and returning users
- **Admin Detection**: Automatically detects admin users and redirects appropriately
- **Error Handling**: Comprehensive error handling for popup blocked, cancelled, etc.

### Technical Details

- Uses Firebase `signInWithPopup` with `GoogleAuthProvider`
- Proper error handling for common Google auth issues
- Integrates with existing user ranking system
- Maintains consistency with email/password auth flow
- Shows appropriate success messages with rank information

## Testing

1. Make sure Google auth is enabled in Firebase Console
2. Test sign up with Google (should show "Welcome! You are member #X!")
3. Test sign in with existing Google account (should show "Welcome back, Member #X!")
4. Test admin Google account (should redirect to admin dashboard)
5. Test error scenarios (popup blocked, cancelled, etc.)

## Security Considerations

- Google OAuth provides secure authentication
- User data is only stored after successful authentication
- Email verification is automatic with Google accounts
- Admin detection works seamlessly with Google auth

## Troubleshooting

**Popup Blocked**: 
- User will see friendly error message
- Instruct users to allow popups for the site

**Domain Not Authorized**:
- Add domain to Firebase authorized domains list

**OAuth Configuration Issues**:
- Check Google Cloud Console OAuth consent screen
- Ensure all required fields are filled

## Code Files Modified

- `firebase/services/authService.ts`: Added `signInWithGoogle` function
- `pages/AuthPage.tsx`: Added Google auth button and handler
- `components/icons/GoogleIcon.tsx`: New Google icon component

The implementation seamlessly integrates with your existing auth flow while providing the professional Google sign-in experience users expect.
