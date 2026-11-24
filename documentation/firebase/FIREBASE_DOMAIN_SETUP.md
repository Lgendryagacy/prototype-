# Firebase Console Configuration for Custom Password Reset Domain

## Steps to Configure Firebase Console:

### 1. Open Firebase Console
- Go to [Firebase Console](https://console.firebase.google.com)
- Select your project: `fogsly-57a8e`

### 2. Navigate to Authentication Settings
- Click on "Authentication" in the left sidebar
- Go to "Settings" tab
- Click on "Authorized domains"

### 3. Add Your Custom Domain
Add your domain(s) to the authorized domains list:
- `localhost` (for development)
- `your-custom-domain.com` (your production domain)
- Any other domains you're using

### 4. Configure Action URL (Advanced)
- In Authentication Settings, look for "Customize action URL"
- If you want to completely customize the URL structure, you can set up a custom action URL handler

### Alternative: Handle Firebase Default URLs

If you can't immediately change the Firebase configuration, you can create a redirect handler.

## Current Implementation Status:

✅ **Updated sendPasswordReset()** - Now sends custom URL in action code settings
✅ **Updated ResetPasswordPage** - Handles URL parameters from Firebase emails  
✅ **Updated routing** - Properly extracts reset codes from URL
✅ **Added session storage** - Stores reset code for form submission

## Testing Steps:

1. **Test Forgot Password Flow:**
   ```
   1. Go to /forgot-password
   2. Enter email and submit
   3. Check email for reset link
   4. Click link - should now go to your domain/reset-password
   ```

2. **Verify URL Structure:**
   - New email links should look like: `your-domain.com/reset-password?oobCode=...`
   - Instead of: `fogsly-57a8e.firebaseapp.com/__/auth/action?mode=resetPassword&oobCode=...`

## If Firebase Console Changes Don't Take Effect:

You can create a redirect page on your Firebase hosting that forwards users to your custom domain:

```html
<!-- public/__/auth/action/index.html -->
<!DOCTYPE html>
<html>
<head>
  <script>
    // Extract parameters and redirect to custom domain
    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get('mode');
    const oobCode = urlParams.get('oobCode');
    
    if (mode === 'resetPassword' && oobCode) {
      // Redirect to your custom domain
      window.location.href = `https://your-domain.com/reset-password?oobCode=${oobCode}`;
    } else {
      // Fallback to your main domain
      window.location.href = 'https://your-domain.com/auth';
    }
  </script>
</head>
<body>
  <p>Redirecting...</p>
</body>
</html>
```

## Next Steps:

1. **Deploy your changes** to test the new password reset flow
2. **Configure Firebase Console** as described above
3. **Test the complete flow** from forgot password to successful reset
4. **Monitor Firebase Auth logs** for any issues

The system should now properly redirect users to your custom domain instead of the default Firebase hosting URL!
