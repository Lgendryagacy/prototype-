# Earnings Structure Migration Guide

## 📋 Overview

This guide explains how to migrate existing users from the **old earnings structure** to the **new comprehensive 8-source earnings system**.

## 🆕 What's New in the Earnings Structure?

### Old Structure (userEarningsService.ts)
- ❌ Only 3 earning sources: ads, deposits, referrals
- ❌ Simple structure, limited tracking
- ❌ Manual wallet transfers required
- ❌ No daily activity tracking

### New Structure (earningsService.ts)
- ✅ **8 earning sources** with both current balance + lifetime totals:
  - `adsEarnings` / `totalAdsEarnings`
  - `referralEarnings` / `totalReferralEarnings`
  - `taskEarnings` / `totalTaskEarnings`
  - `bonusEarnings` / `totalBonusEarnings`
  - `depositEarnings` / `totalDepositEarnings`
  - `freelanceJobsEarnings` / `totalFreelanceJobsEarnings`
  - `fogslyServicesEarnings` / `totalFogslyServicesEarnings`
  - `fogslyPhysicalEarnings` / `totalFogslyPhysicalEarnings`
- ✅ **Auto-transfer to wallet** - earnings automatically sync with wallet balance
- ✅ **Daily activity tracking** - tracks ad limits, tasks completed, etc.
- ✅ **Transaction history** - complete audit trail of all earnings

## 🚀 How to Run the Migration

### Method 1: Admin Dashboard (Recommended) ⭐

1. **Login as Admin**
   - Navigate to Admin Dashboard

2. **Go to Settings**
   - Click on "Settings" in the left sidebar
   - Select "Database Migrations" tab

3. **Run Migration**
   - Click "🚀 Run Earnings Migration" button
   - Confirm the action
   - Wait for completion

4. **Check Results**
   - Open browser console (F12) to see detailed logs
   - Success message will show when complete
   - All existing user data is preserved

### Method 2: Browser Console (Alternative)

1. **Open your app in browser**
2. **Open Developer Console** (Press F12)
3. **Run this command**:
   ```javascript
   runMigration()
   ```
4. **Wait for completion** - you'll see detailed progress logs

## 📊 What the Migration Does

### Step 1: Migrate userEarnings
- ✅ Fixes `depositsEarnings` → `depositEarnings` naming
- ✅ Adds missing earning source fields (defaults to 0)
- ✅ Adds lifetime total fields
- ✅ Recalculates `availableBalance` and `lifetimeEarnings`
- ✅ Adds `totalWithdrawn` and `totalSpent` fields

### Step 2: Initialize Daily Activities
- ✅ Creates `userDailyActivities` documents for today
- ✅ Sets ad watch limits (default 10 ads/day)
- ✅ Initializes activity counters

### Step 3: Sync Wallet Balances
- ✅ Creates/updates `walletBalances` documents
- ✅ Ensures wallet balance matches earnings balance
- ✅ Auto-syncs for future earnings

## ✅ Safety Features

- **Safe to run multiple times** - Only updates documents that need changes
- **No data loss** - All existing earnings are preserved
- **Idempotent** - Running twice produces the same result
- **Detailed logging** - See exactly what changed in console
- **Error handling** - Continues even if individual user updates fail

## 📈 Expected Results

After migration, you'll see:

```
✅ MIGRATION COMPLETE!

Summary:
  User Earnings: X updated, Y skipped, 0 errors
  Daily Activities: X created, 0 errors  
  Wallet Balances: X synced, 0 errors
```

## 🔍 Verify Migration Success

### Check User Earnings Structure
```javascript
// In browser console
const earnings = await getUserEarnings('USER_ID');
console.log(earnings);

// Should see all 8 earning sources + totals
```

### Verify in Firestore Console
1. Open Firebase Console
2. Go to Firestore Database
3. Check `userEarnings` collection
4. Verify fields exist:
   - All 8 earning sources
   - All 8 lifetime totals
   - `lifetimeEarnings`, `totalWithdrawn`, `totalSpent`

## 🎯 After Migration

### For New Users
✅ All new users automatically get the new structure (already configured)

### For Existing Users  
✅ Run migration once to update all users
✅ Can run again safely if new users were missed

### Code Updates Already Applied
✅ `userService.ts` - New user registration
✅ `adService.ts` - Ad earnings
✅ `paymentsService.ts` - Deposit earnings
✅ `withdrawalService.ts` - Withdrawals
✅ All earning operations use new structure

## 📝 Files Updated

### Migration Files
- `firebase/migrations/migrateEarningsStructure.ts` - Main migration script

### Service Files (Updated to New Structure)
- `firebase/services/earningsService.ts` - NEW unified service
- `firebase/services/userService.ts` - Uses new structure
- `firebase/services/adService.ts` - Uses new structure
- `firebase/services/paymentsService.ts` - Uses new structure
- `firebase/services/withdrawalService.ts` - Uses new structure

### Type Definitions
- `firebase/types/earnings.ts` - NEW comprehensive types

### Deprecated Files (Old Structure)
- ⚠️ `firebase/services/userEarningsService.ts` - Keep for reference only
- ⚠️ `pages/EarningsDashboardPage.tsx` - Use `DashboardPage.tsx` instead
- ⚠️ `components/profile/tabs/OverviewTab_new.tsx` - Update imports

## 🆘 Troubleshooting

### Migration Fails
- Check browser console for detailed error messages
- Verify Firebase permissions
- Ensure you're logged in as admin
- Try running again (it's safe!)

### User Data Missing
- Migration preserves all existing data
- Check console logs for specific errors
- Contact dev team if issues persist

### Need to Rollback?
- Old data structure is preserved
- Can switch back to old service imports if needed
- Contact dev team for assistance

## 📞 Support

If you encounter any issues:
1. Check browser console logs
2. Screenshot any error messages
3. Note which users are affected
4. Contact the development team

---

**Last Updated**: January 14, 2026  
**Version**: 2.0 - New Earnings Structure
