# Admin User Setup Guide

## Overview

This guide explains how to create admin users in the Fogsly system. Admin users have special privileges and are not part of the regular ranking system.

## Admin User Characteristics

- **Role**: `admin` in the database
- **Rank**: `0` (not part of ranking system)
- **Modal**: Don't see congratulations modal on login
- **Collections**: Removed from `userRankings` collection

## Setup Process

### Step 1: Create a Regular User
1. Go to your website's signup page
2. Create a new account normally (this will assign them a rank)
3. Complete the signup process
4. Note down the user's email or UID

### Step 2: Get the User's UID
Option A - From Browser Console:
```javascript
// Login as the user, then run in console:
firebase.auth().currentUser.uid
```

Option B - From Firebase Console:
1. Go to Firebase Console → Authentication
2. Find the user by email
3. Copy their UID

### Step 3: Promote User to Admin

#### Method 1: Browser Console (Recommended)
1. Open your website in the browser
2. Open Developer Tools (F12)
3. Go to the Console tab
4. Import the promotion function:

```javascript
// Import the promotion function
import('./firebase/services/adminPromotion.js').then(module => {
  window.promoteToAdmin = module.promoteToAdmin;
  console.log('✅ Admin promotion function loaded');
});
```

5. Promote the user (replace with actual UID):
```javascript
promoteToAdmin('actual-user-uid-here')
```

#### Method 2: Direct Database Update
Update these collections manually in Firebase Console:

**1. Update `users` collection:**
```json
{
  "role": "admin",
  "rank": 0
}
```

**2. Update `userProfile` collection:**
```json
{
  "role": "Admin", 
  "rank": 0
}
```

**3. Delete document from `userRankings` collection**

## Verification

### Check Admin Status
Run in browser console after promotion:
```javascript
// Check if user is admin
import('./firebase/services/adminPromotion.js').then(async module => {
  const isAdmin = await module.isUserAdmin('user-uid-here');
  console.log('Is admin:', isAdmin);
});
```

### Expected Behavior
After promotion, the admin user should:
- ✅ Have access to admin pages
- ✅ Have rank 0 in profile
- ✅ Not see congratulations modal on login
- ✅ Be removed from user rankings

## Collections Affected

### Modified Collections:
1. **`users`** - role changed to 'admin', rank set to 0
2. **`userProfile`** - role changed to 'Admin', rank set to 0

### Removed From:
3. **`userRankings`** - Document deleted (admins don't participate in rankings)

## Troubleshooting

### Common Issues:

**Modal still showing for admin:**
- Check if `isUserAdmin()` function is imported in App.tsx
- Verify the user's role field is exactly 'admin' (lowercase)

**Admin promotion fails:**
- Ensure user exists in both `users` and `userProfile` collections
- Check Firebase permissions
- Verify the UID is correct

**Can't access admin functions:**
- Clear browser cache and cookies
- Log out and log back in
- Check browser console for errors

## Development Notes

### Code Files Involved:
- `firebase/services/adminPromotion.ts` - Admin promotion functions
- `App.tsx` - Modal logic with admin check
- `firebase/services/userService.ts` - User creation and management

### Functions Available:
- `promoteUserToAdmin(userId)` - Promote user to admin
- `isUserAdmin(userId)` - Check if user is admin
- `promoteToAdmin(userId)` - Browser console helper

## Security Considerations

1. **Only promote trusted users** to admin status
2. **Test admin functions** in development first
3. **Backup database** before making changes
4. **Use browser console method** for safety (includes error handling)
5. **Verify changes** after promotion

## Example Complete Workflow

```bash
# 1. User signs up normally
# Email: admin@fogsly.com, gets rank #1234

# 2. Get UID from Firebase Console or browser
# UID: abc123def456

# 3. Open website, go to console, run:
import('./firebase/services/adminPromotion.js').then(module => {
  window.promoteToAdmin = module.promoteToAdmin;
  promoteToAdmin('abc123def456');
});

# 4. Verify admin status:
# - Check rank is 0 in profile
# - Login and confirm no congratulations modal
# - Access admin pages

# Result: User is now admin with no ranking
```

This approach is simple, safe, and uses the existing user infrastructure while properly separating admin privileges from the ranking system.
2. Click "Add New Theme"
3. Enter theme name
4. Use color pickers to select colors:
   - Primary Color
   - Secondary Color
   - Background Color
   - Text Color
   - Border Color
5. Click "Create Theme"

### Editing Themes
1. Click edit icon on any theme card
2. Modify colors using color pickers
3. Click "Update Theme"

### Deleting Themes
1. Click delete icon on theme card
2. Confirm deletion (note: cannot delete if it's the current active theme)

## File Structure

```
firebase/
├── types/
│   └── admin.ts           # Admin and theme types
├── services/
│   ├── adminAuthService.ts        # Admin authentication
│   ├── themeService.ts           # Theme CRUD operations
│   ├── adminSetupService.ts      # Setup utilities
│   └── themeIntegrationService.ts # Theme loading/application
│
components/admin/
├── AdminPanelLayout.tsx   # Admin layout with sidebar
└── ThemeManagement.tsx    # Theme management interface
│
pages/
├── AdminAuthPage.tsx      # Admin login page
└── AdminPage.tsx         # Main admin dashboard
```

## Security Notes

- Admin authentication is separate from regular user auth
- Only users marked in `adminUsers` collection can access admin panel
- Theme changes are applied in real-time across the application
- All admin actions are logged and tracked

## Troubleshooting

### Cannot Access Admin Panel
- Ensure user is in `adminUsers` Firestore collection
- Check that user has correct permissions
- Verify Firebase Auth is working

### Themes Not Applying
- Check browser console for errors
- Ensure theme document exists in Firestore
- Verify CSS variables are properly set

### Color Picker Issues
- Ensure modern browser support for input[type="color"]
- Check that color values are in hex format (#rrggbb)
