# FOGSLY Brand Management - Firebase Setup Guide

## Initial Setup Steps

### 1. Firestore Security Rules

Update your Firestore security rules in the Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection (existing)
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Brand requests - users can create and read their own, admins can manage all
    match /brandRequests/{requestId} {
      // Users can create their own brand requests
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.userId;
      
      // Users can read their own, admins can read all
      allow read: if request.auth != null && 
        (request.auth.uid == resource.data.userId || 
         exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
      
      // Only admins can update/delete
      allow update, delete: if request.auth != null && 
        exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Brands - public read, owner update, admin create/delete
    match /brands/{brandId} {
      allow read: if true; // Public read for browsing brands
      
      // Only admins can create (when approving requests)
      allow create: if request.auth != null && 
        exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
      
      // Brand owners can update their own brands
      allow update: if request.auth != null && 
        request.auth.uid == resource.data.userId;
      
      // Only admins can delete
      allow delete: if request.auth != null && 
        exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Other existing rules...
    match /{document=**} {
      allow read, write: if false; // Deny by default
    }
  }
}
```

### 2. Firebase Storage Rules

Update your Storage security rules:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Brand logos - authenticated users can upload, everyone can read
    match /brand-logos/{fileName} {
      allow read: if true;
      allow write: if request.auth != null && 
        fileName.matches('.*' + request.auth.uid + '.*');
      allow delete: if request.auth != null;
    }
    
    // Other existing rules...
  }
}
```

### 3. Admin User Setup

To make a user an admin, you need to add an `isAdmin: true` field to their user document in Firestore.

1. Go to Firebase Console > Firestore Database
2. Navigate to the `users` collection
3. Find the user document you want to make admin
4. Add a field: `isAdmin` (boolean) = `true`

Or use the existing admin promotion service in your code.

### 4. Testing the System

1. **Create Brand Request**:
   - Login as a regular user
   - Go to Fog Services page
   - Click "Make Brand" button
   - Fill out the form and submit

2. **Admin Review**:
   - Login as an admin user
   - Go to Admin Dashboard
   - Navigate to Brand Management
   - Review, approve, or reject requests

3. **Brand Management**:
   - Once approved, users can access their brand dashboard
   - Edit brand information
   - View brand statistics

### 5. Database Indexes

You may need to create these Firestore indexes for optimal performance:

```
Collection: brandRequests
- userId (Ascending), createdAt (Descending)
- status (Ascending), createdAt (Descending)

Collection: brands
- userId (Ascending), createdAt (Descending)
```

Create these indexes in Firebase Console > Firestore Database > Indexes.

### 6. Environment Variables

Make sure your Firebase configuration is properly set up in your app. Check the `firebase/config.ts` file.

### 7. Error Monitoring

Consider setting up error monitoring to track any issues:

1. Firebase Crashlytics for mobile apps
2. Sentry or similar for web applications
3. Firebase Analytics for user behavior tracking

## Common Issues and Solutions

### Issue: Permission Denied Errors
**Solution**: Check that Firestore security rules are properly configured and the user has the correct permissions.

### Issue: File Upload Failures
**Solution**: Verify Storage security rules and check file size/type limitations.

### Issue: Admin Functions Not Working
**Solution**: Ensure the user has `isAdmin: true` in their Firestore user document.

### Issue: Real-time Updates Not Working
**Solution**: Check that Firebase listeners are properly set up and not being blocked by security rules.

## Performance Optimization

1. **Pagination**: Already implemented for admin brand request listing
2. **Indexes**: Create appropriate Firestore indexes for queries
3. **Caching**: Consider implementing caching for frequently accessed data
4. **Image Optimization**: Implement image compression before upload

## Security Best Practices

1. **Never expose admin credentials**: Use server-side admin SDK for sensitive operations
2. **Validate all inputs**: Both client-side and server-side validation
3. **Rate limiting**: Implement rate limiting for API calls
4. **File validation**: Validate file types and sizes before upload
5. **Regular security audits**: Review security rules and user permissions regularly

## Monitoring and Analytics

Track these key metrics:
- Brand request submission rate
- Admin approval/rejection rates
- User engagement with brand features
- File upload success/failure rates
- Page load times and performance metrics