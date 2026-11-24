# Referral Code Migration Guide

## Overview

This guide explains how to generate referral codes for **all existing users** who signed up before the referral system was implemented.

## Problem

- New users automatically get referral codes when they sign up
- Existing users don't have referral codes yet
- Existing users can't refer others and earn benefits

## Solution

We've created a migration tool that:
- ✅ Generates referral codes for ALL existing users
- ✅ Uses the same structure as new user signups
- ✅ Preserves existing codes (safe to run multiple times)
- ✅ Ensures all codes are unique
- ✅ Updates user documents in Firestore

---

## Quick Start (3 Steps)

### Step 1: Access Admin Migration Tool

Add the route to your app (if not already added):

```typescript
// In App.tsx, add:
case 'admin-referral-migration': {
  if (!isLoggedIn || !isAdmin) {
    return <HomePage navigate={navigate} />;
  }
  return <ReferralCodeMigrationPage />;
}
```

### Step 2: Navigate to the Tool

Visit: `https://yourapp.com/admin-referral-migration`

### Step 3: Run Migration

1. Click **"Verify Now"** to see current state
2. Click **"Start Migration"** to generate codes
3. Click **"Verify Now"** again to confirm success

**That's it!** All users now have referral codes! 🎉

---

## Detailed Instructions

### Method 1: Using the Admin UI (Recommended)

#### 1. Access the Migration Page

Navigate to the admin migration tool:
```
/admin-referral-migration
```

#### 2. Verify Current State

Click **"Verify Now"** to see:
- Total number of users
- How many have codes
- How many need codes
- List of users without codes

#### 3. Run Migration

Click **"Start Migration"** button:
- A confirmation dialog will appear
- Click "OK" to proceed
- Wait for the process to complete (usually takes 5-30 seconds)

#### 4. Review Results

The tool will show:
- ✅ Total users processed
- ✅ Codes already existing
- ✅ New codes generated
- ❌ Any errors (if any)

#### 5. Download Report (Optional)

Click **"Download Report"** to save a JSON file with:
- Complete migration results
- List of all processed users
- Any errors encountered

### Method 2: Using Browser Console (Alternative)

If you prefer to use the console:

#### 1. Open Browser Console

Press `F12` and navigate to the Console tab

#### 2. Run Verification

```javascript
await verifyReferralCodes()
```

This will show:
```
📊 Referral Code Verification Report:
   Total users: 150
   With codes: 45 (30.0%)
   Without codes: 105 (70.0%)

❌ Users without codes:
   - user1@example.com
   - user2@example.com
   ...
```

#### 3. Run Migration

```javascript
const result = await generateReferralCodesForExistingUsers()
```

This will:
- Process all users
- Generate codes for users without them
- Show progress in console
- Return detailed results

#### 4. Verify Again

```javascript
await verifyReferralCodes()
```

Should now show:
```
📊 Referral Code Verification Report:
   Total users: 150
   With codes: 150 (100.0%)
   Without codes: 0 (0.0%)
```

#### 5. Generate Code for Single User (If Needed)

```javascript
await generateReferralCodeForSingleUser('USER_ID_HERE')
```

---

## Code Structure Comparison

### New Users (Automatic - Already Working)

```typescript
// During signup in AuthPage.tsx
const startSignupFlow = async (userId, userName, userEmail) => {
  // 1. Submit survey
  await submitSurvey({...});
  
  // 2. Generate referral code
  await createReferralCodeForUser(userId, userName, userEmail);
  
  // Result: User has referral code immediately
};
```

### Existing Users (Migration - What We're Doing Now)

```typescript
// Migration script
export const generateReferralCodesForExistingUsers = async () => {
  // 1. Get all users from Firestore
  const users = await getDocs(collection(db, 'users'));
  
  // 2. For each user without a code:
  for (const user of users) {
    if (!user.referralCode) {
      // 3. Generate unique code (same logic as signup)
      const code = generateReferralCode(user.email);
      
      // 4. Update user document
      await updateDoc(userRef, {
        referralCode: code,
        referralCodeCreatedAt: Timestamp.now(),
        referralCodeMigrated: true // Flag for tracking
      });
    }
  }
};
```

**Both methods use the same `generateReferralCode()` function!**

---

## What Gets Updated

### User Document Structure

**Before Migration:**
```json
{
  "uid": "abc123",
  "email": "john@example.com",
  "name": "John Doe",
  "createdAt": "2024-01-15T10:30:00Z"
  // No referralCode field
}
```

**After Migration:**
```json
{
  "uid": "abc123",
  "email": "john@example.com",
  "name": "John Doe",
  "createdAt": "2024-01-15T10:30:00Z",
  "referralCode": "john_1234", // ✅ NEW
  "referralCodeCreatedAt": "2025-10-21T15:45:00Z", // ✅ NEW
  "referralCodeMigrated": true // ✅ NEW (tracking flag)
}
```

### Fields Added:
- `referralCode` (string) - The unique referral code (e.g., "john_1234")
- `referralCodeCreatedAt` (timestamp) - When the code was generated
- `referralCodeMigrated` (boolean) - Flag indicating this was from migration (not signup)

---

## Safety Features

### 1. Idempotent (Safe to Run Multiple Times)

```typescript
// Users with codes are automatically skipped
if (userData.referralCode) {
  console.log('⏭️  Skipping - already has code');
  continue;
}
```

### 2. Uniqueness Guaranteed

```typescript
// Checks for duplicates before assigning
while (generatedCodes.has(referralCode)) {
  referralCode = generateReferralCode(identifier);
}
```

### 3. Error Handling

```typescript
// Individual user errors don't stop the migration
try {
  // Generate code for user
} catch (error) {
  result.errors.push({ userId, error: error.message });
  // Continue with next user
}
```

### 4. Detailed Logging

```typescript
// Every step is logged
console.log('✅ Generated code for john@example.com: john_1234');
console.log('⏭️  Skipping jane@example.com - already has code');
console.log('❌ Error for user123: Failed to generate unique code');
```

---

## Verification Process

### Before Migration
```bash
✅ Step 1: Run verification
   Total users: 150
   With codes: 45
   Without codes: 105
```

### During Migration
```bash
🚀 Starting referral code migration...
📊 Found 150 total users
✅ Users with codes: 45
❌ Users without codes: 105

✅ Generated code for user1@example.com: user1_4567
✅ Generated code for user2@example.com: user2_8901
⏭️  Skipping user3@example.com - already has code: user3_1234
✅ Generated code for user4@example.com: user4_2345
...

🎉 Migration completed!
📊 Results:
   - Total users: 150
   - Already had codes: 45
   - Needed codes: 105
   - Codes generated: 105
   - Errors: 0
```

### After Migration
```bash
✅ Step 3: Verify again
   Total users: 150
   With codes: 150 ✅
   Without codes: 0 ✅
```

---

## Troubleshooting

### Issue: Some users still don't have codes

**Solution 1: Run migration again**
```javascript
await generateReferralCodesForExistingUsers()
```

**Solution 2: Generate for specific user**
```javascript
await generateReferralCodeForSingleUser('USER_ID_HERE')
```

### Issue: Duplicate codes error

**Cause:** Very rare, but possible if two users have same email prefix

**Solution:** The script automatically retries with different random numbers
```typescript
// Automatically tries up to 20 times
while (!isUnique && attempts < maxAttempts) {
  referralCode = generateReferralCode(identifier);
  attempts++;
}
```

### Issue: Firestore permission denied

**Cause:** User running migration doesn't have admin access

**Solution:** Ensure you're logged in as an admin:
```typescript
// Check in console
const user = firebase.auth().currentUser;
const isAdmin = await isUserAdmin(user.uid);
console.log('Is admin:', isAdmin);
```

---

## Testing

### 1. Test with Small Dataset

```javascript
// Verify first
const report = await verifyReferralCodes();
console.log('Users without codes:', report.withoutCodes);

// If small number, test migration
await generateReferralCodesForExistingUsers();

// Verify again
await verifyReferralCodes();
```

### 2. Test Single User

```javascript
// Test with one user first
await generateReferralCodeForSingleUser('TEST_USER_ID');

// Check the user document
const userDoc = await getDoc(doc(db, 'users', 'TEST_USER_ID'));
console.log('Referral code:', userDoc.data().referralCode);
```

### 3. Test Code Uniqueness

```javascript
// Generate multiple codes and check for duplicates
const codes = new Set();
for (let i = 0; i < 100; i++) {
  const code = generateReferralCode('test@example.com');
  if (codes.has(code)) {
    console.log('❌ Duplicate found:', code);
  }
  codes.add(code);
}
console.log('✅ Generated', codes.size, 'unique codes');
```

---

## Files Created/Modified

### New Files:
1. **`firebase/services/referralCodeMigration.ts`**
   - Main migration logic
   - Verification functions
   - Single user code generation

2. **`pages/admin/ReferralCodeMigrationPage.tsx`**
   - Admin UI for migration
   - Visual progress and results
   - Download reports

3. **`REFERRAL_CODE_MIGRATION_GUIDE.md`**
   - This documentation file

### Existing Files (No Changes Needed):
- `firebase/services/referralService.ts` - Reuses existing functions
- `firebase/types/referral.ts` - Same types
- `pages/AuthPage.tsx` - New users still work the same
- `pages/ReferralsPage.tsx` - Shows codes for all users now

---

## Benefits After Migration

### For Existing Users:
✅ Can now refer friends and earn rewards
✅ Have unique shareable referral code
✅ Can track their referrals
✅ Earn FogCoins for successful referrals

### For New Users Being Referred:
✅ Can use existing users' referral codes
✅ Both parties benefit from referral

### For Platform:
✅ Increased user engagement
✅ Viral growth through referrals
✅ Unified referral system for all users

---

## FAQ

### Q: Will this affect existing referral codes?
**A:** No! Users who already have codes will be skipped. Their codes remain unchanged.

### Q: Can I run this migration multiple times?
**A:** Yes! It's completely safe. Users with codes are automatically skipped.

### Q: How long does migration take?
**A:** Usually 5-30 seconds depending on number of users (100-1000 users)

### Q: What if a user's email changes after migration?
**A:** The referral code stays the same. It's based on the email at migration time.

### Q: Can users customize their referral code?
**A:** Not currently. All codes follow the format: `username_1234`

### Q: What happens if migration fails halfway?
**A:** No problem! Already processed users keep their codes. Just run again.

### Q: Do I need to notify users about their new codes?
**A:** Optional, but recommended. Users can find their codes in the Referrals page.

---

## Next Steps After Migration

1. **✅ Verify all users have codes**
   ```javascript
   await verifyReferralCodes()
   ```

2. **📧 Notify users (optional)**
   - Send email: "You now have a referral code!"
   - In-app notification
   - Blog post announcement

3. **📊 Monitor referral activity**
   - Check referrals dashboard
   - Track new referrals
   - Monitor FogCoin rewards

4. **🎉 Promote referral program**
   - Social media announcement
   - In-app banners
   - Email campaigns

---

## Support

If you encounter issues:

1. **Check console logs** - All operations are logged
2. **Download report** - Use the "Download Report" button
3. **Run verification** - Check current state
4. **Try single user** - Test with one user first

---

## Summary

✅ **What:** Generate referral codes for all existing users
✅ **Why:** So they can refer others and earn rewards
✅ **How:** Run the migration tool once
✅ **Safe:** Users with codes are skipped
✅ **Fast:** Takes 5-30 seconds
✅ **Easy:** 3 clicks in admin UI

**Go ahead and run the migration - your users are waiting to refer their friends!** 🚀
