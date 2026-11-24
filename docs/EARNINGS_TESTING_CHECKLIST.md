# ✅ Earnings Structure Testing Checklist

## 🔍 Verify Migration Success

### 1. Check Firestore Database

**Go to Firebase Console → Firestore Database**

#### Check `userEarnings` Collection:
Pick any user document and verify it has:

```javascript
✅ userId: "..."
✅ adsEarnings: 0 (or current value)
✅ referralEarnings: 0
✅ taskEarnings: 0
✅ bonusEarnings: 0
✅ depositEarnings: 0  // ⚠️ Should be "depositEarnings" NOT "depositsEarnings"
✅ freelanceJobsEarnings: 0
✅ fogslyServicesEarnings: 0
✅ fogslyPhysicalEarnings: 0
✅ availableBalance: (sum of all above)

// Lifetime totals
✅ totalAdsEarnings: 0 (or higher)
✅ totalReferralEarnings: 0
✅ totalTaskEarnings: 0
✅ totalBonusEarnings: 0
✅ totalDepositEarnings: 0
✅ totalFreelanceJobsEarnings: 0
✅ totalFogslyServicesEarnings: 0
✅ totalFogslyPhysicalEarnings: 0
✅ lifetimeEarnings: (sum of all totals)

// Other fields
✅ totalWithdrawn: 0
✅ totalSpent: 0
✅ createdAt: timestamp
✅ updatedAt: timestamp
```

#### Check `walletBalances` Collection:
Each user should have:
```javascript
✅ userId: "..."
✅ balance: (matches userEarnings.availableBalance)
✅ updatedAt: timestamp
```

#### Check `userDailyActivities` Collection:
Documents should follow format: `{userId}_{YYYY-MM-DD}`
```javascript
✅ userId: "..."
✅ date: "2026-01-14"
✅ adsWatched: 0
✅ adsEarned: 0
✅ adWatchLimit: 10
✅ adsRemaining: 10
✅ referralsMade: 0
✅ tasksCompleted: 0
✅ jobsCompleted: 0
✅ servicesCompleted: 0
```

---

## 🧪 Test New User Registration

### Step 1: Create Test User
1. **Logout** if logged in
2. **Sign up** with new test email (e.g., `test@test.com`)
3. Complete registration

### Step 2: Verify in Firestore
Check that new user has:
- ✅ `userEarnings` document with ALL 8 earning sources
- ✅ `walletBalances` document
- ✅ `userDailyActivities` for today
- ✅ All fields initialized to 0

### Step 3: Browser Console Check
```javascript
// Open console (F12) and run:
const earnings = await getUserEarnings('NEW_USER_ID');
console.log('New user earnings:', earnings);

// Should see complete structure
```

---

## 💰 Test Earning Operations

### Test 1: Watch an Ad
1. **Login** as test user
2. **Navigate** to "Watch Ads" page
3. **Watch** 1 ad completely
4. **Check Results:**

**In Firestore** (`userEarnings` for user):
```javascript
✅ adsEarnings: 0.10 (or configured amount)
✅ totalAdsEarnings: 0.10
✅ availableBalance: 0.10
✅ lifetimeEarnings: 0.10
```

**In Firestore** (`walletBalances` for user):
```javascript
✅ balance: 0.10 (auto-synced!)
```

**In Firestore** (`userDailyActivities` for today):
```javascript
✅ adsWatched: 1
✅ adsEarned: 0.10
✅ adsRemaining: 9
```

**In Firestore** (`transactions`):
```javascript
✅ New transaction with type: 'earning'
✅ sourceType: 'ads'
✅ amount: 0.10
✅ status: 'completed'
```

**In UI:**
- ✅ User's balance should update in header
- ✅ Dashboard should show correct earnings

### Test 2: Make a Deposit (Admin Approval)
1. **User:** Submit payment request
2. **Admin:** Approve payment request
3. **Check Results:**

**In Firestore** (`userEarnings`):
```javascript
✅ depositEarnings: (deposit amount)
✅ totalDepositEarnings: (deposit amount)
✅ availableBalance: increased
```

**In Firestore** (`walletBalances`):
```javascript
✅ balance: matches availableBalance (auto-synced)
```

**In Firestore** (`transactions`):
```javascript
✅ New transaction with type: 'earning'
✅ sourceType: 'deposit'
✅ description: 'Deposit approved by admin'
```

### Test 3: Job Payment Flow
1. **Post a Job** (should deduct FOG coins)
2. **Check:**

**In Firestore** (`userEarnings`):
```javascript
✅ availableBalance: decreased by job amount
✅ totalSpent: increased by job amount
```

**In Firestore** (`walletBalances`):
```javascript
✅ balance: decreased (auto-synced)
```

3. **Complete Job** (freelancer earns)
4. **Check Freelancer's Earnings:**

**In Firestore** (`userEarnings`):
```javascript
✅ freelanceJobsEarnings: job amount - 2.5% tax
✅ totalFreelanceJobsEarnings: same
✅ availableBalance: increased
```

---

## 📊 Test Dashboard Display

### User Dashboard
1. **Login** as user
2. **Navigate** to Dashboard
3. **Verify Display Shows:**

```
✅ Available Balance (sum of all earning sources)
✅ Lifetime Earnings
✅ Earnings breakdown by source
✅ Recent transactions
✅ Today's activity stats
✅ Weekly activity chart
```

### Admin Dashboard
1. **Login** as admin
2. **Navigate** to Admin Dashboard
3. **Verify:**

```
✅ Can see all users' earnings
✅ Can view total platform earnings
✅ Statistics are accurate
```

---

## 🔄 Test Auto-Transfer Feature

**The new system auto-transfers earnings to wallet!**

### Test:
1. **Earn** FOG coins (ads, deposit, job, etc.)
2. **Check** that:
   ```
   ✅ userEarnings.availableBalance updated
   ✅ walletBalances.balance updated AUTOMATICALLY
   ✅ No manual transfer needed!
   ```

---

## 🧪 Browser Console Tests

Open browser console (F12) and run these tests:

### Test 1: Get User Earnings
```javascript
// Get earnings for current user
const earnings = await getUserEarnings('YOUR_USER_ID');
console.log('📊 Earnings:', earnings);

// Should see all 8 earning sources + totals
console.log('Ads:', earnings.adsEarnings, '/', earnings.totalAdsEarnings);
console.log('Deposits:', earnings.depositEarnings, '/', earnings.totalDepositEarnings);
console.log('Available:', earnings.availableBalance);
console.log('Lifetime:', earnings.lifetimeEarnings);
```

### Test 2: Check Today's Activity
```javascript
const activity = await getTodayActivity('YOUR_USER_ID');
console.log('📅 Today\'s Activity:', activity);

// Should see ad watch limits and counts
console.log('Ads watched:', activity.adsWatched, '/', activity.adWatchLimit);
console.log('Ads remaining:', activity.adsRemaining);
```

### Test 3: Get Recent Transactions
```javascript
const transactions = await getRecentTransactions('YOUR_USER_ID', 10);
console.log('💳 Recent Transactions:', transactions);

// Should see earning transactions with proper sourceType
transactions.forEach(t => {
  console.log(`${t.type} - ${t.sourceType}: ${t.amount} FOG`);
});
```

### Test 4: Test Adding Earnings
```javascript
// Test adding ad earnings
await addAdsEarnings('YOUR_USER_ID', 0.10, 'test-ad-id');
console.log('✅ Ad earnings added!');

// Check it updated
const updated = await getUserEarnings('YOUR_USER_ID');
console.log('Updated balance:', updated.availableBalance);
```

---

## ✅ Success Criteria

All tests pass if:

1. ✅ **All users have new structure** (8 earning sources + totals)
2. ✅ **New users get new structure automatically**
3. ✅ **Earning operations update correct fields**
4. ✅ **Auto-transfer to wallet works** (no manual transfer needed)
5. ✅ **Daily activities track properly**
6. ✅ **Transactions are created** for all earnings
7. ✅ **Dashboards display correctly**
8. ✅ **No console errors** during operations
9. ✅ **Old field name removed** (`depositsEarnings` → `depositEarnings`)
10. ✅ **Lifetime totals never decrease**

---

## 🐛 Common Issues & Solutions

### Issue: User has old structure
**Solution:** Run migration again (it's safe!)

### Issue: Wallet not syncing
**Solution:** Check console for errors, verify wallet service is using new structure

### Issue: Dashboard shows wrong amounts
**Solution:** 
1. Hard refresh (Ctrl+F5)
2. Check if using old `EarningsDashboardPage` instead of `DashboardPage`
3. Update component imports to use new `earningsService`

### Issue: Transactions not created
**Solution:** Verify all earning functions use `addEarnings()` from new service

---

## 📱 Quick Test Scenarios

### Scenario 1: Complete User Journey
```
1. Register new user → Check structure ✅
2. Watch 3 ads → Check earnings + wallet ✅
3. Make deposit → Check deposit field ✅
4. Post job → Check deduction ✅
5. Complete job → Check freelancer earnings ✅
6. View dashboard → Check display ✅
```

### Scenario 2: Existing User Journey
```
1. Login existing user → Check migrated structure ✅
2. Watch ad → Check new fields update ✅
3. Check balance → Verify auto-sync ✅
4. View transactions → See earning history ✅
```

---

## 📞 Need Help?

If any test fails:
1. 📸 Screenshot the error
2. 📋 Copy console logs
3. 🔍 Check which collection/field has issue
4. 📝 Document the test scenario
5. 🆘 Contact dev team

---

**Good Luck Testing! 🚀**
