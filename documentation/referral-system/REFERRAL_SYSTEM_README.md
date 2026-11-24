# FOGSLY Referral System Documentation

## Overview
The FOGSLY Referral System is a comprehensive growth feature that enables users to invite friends, track referrals, and expand the FOGSLY community. This system includes automated referral code generation, survey collection, and a dedicated referrals dashboard.

## Table of Contents
1. [Features](#features)
2. [User Flow](#user-flow)
3. [Technical Implementation](#technical-implementation)
4. [Components](#components)
5. [Firebase Collections](#firebase-collections)
6. [Security Rules](#security-rules)
7. [API Reference](#api-reference)

---

## Features

### ✅ Implemented Features
- **Automatic Referral Code Generation**: Every new user gets a unique referral code
- **Survey Popup**: Mandatory two-step survey for all new users
- **Referral Input Modal**: Optional referral code entry during signup
- **Referrals Dashboard**: Track total, active, and monthly referrals
- **Profile Dropdown**: Easy access to "Refer a Friend" from header
- **URL Referral Links**: Share referral links with embedded codes
- **Code Validation**: Real-time validation of referral codes
- **Referral Tracking**: Complete history of all referrals

### 🎯 Key Highlights
- **Non-intrusive UX**: Survey appears after signup, not blocking authentication
- **Flexible Referral Entry**: Users can skip or enter referral codes
- **Shareable Links**: Generate links like `fogsly.com/auth?ref=JOHN_1234`
- **Copy to Clipboard**: One-click code copying
- **Responsive Design**: Mobile and desktop optimized
- **Dark Mode Support**: Full theme compatibility

---

## User Flow

### New User Signup Journey

```
1. User signs up (Email/Password or Google)
   ↓
2. Account created successfully
   ↓
3. [MODAL] Referral Input Modal appears
   - Option A: Enter referral code → Validates → Creates referral record
   - Option B: Skip → Continue without referral
   ↓
4. [MODAL] Survey Popup Modal appears (mandatory)
   - Step 1: "How did you hear about FOGSLY?" (required)
   - Step 2: "What's your primary goal on FOGSLY?" (required)
   ↓
5. Survey submitted & referral code generated automatically
   ↓
6. Wait 2 minutes...
   ↓
7. [MODAL] Rank Congratulations Modal appears
   ↓
8. User redirected to Home page
```

### Referral Code Usage Journey

```
1. User A shares referral link: fogsly.com/auth?ref=USERA_1234
   ↓
2. User B clicks the link
   ↓
3. User B signs up
   ↓
4. Referral Input Modal auto-fills with "USERA_1234"
   ↓
5. User B continues → Referral record created
   ↓
6. User A can see User B in their referrals dashboard
```

---

## Technical Implementation

### Project Structure

```
Fogsly-Freelance/
├── components/
│   └── modals/
│       ├── SurveyPopupModal.tsx          # Two-step survey modal
│       └── ReferralInputModal.tsx        # Referral code input
├── firebase/
│   ├── services/
│   │   └── referralService.ts            # All referral logic
│   └── types/
│       └── referral.ts                   # TypeScript types
├── pages/
│   ├── AuthPage.tsx                      # Integrated survey & referral flow
│   └── ReferralsPage.tsx                 # Referrals dashboard
├── firestore.rules                        # Security rules
└── REFERRAL_SYSTEM_README.md             # This file
```

---

## Components

### 1. SurveyPopupModal

**Location**: `components/modals/SurveyPopupModal.tsx`

**Purpose**: Collect user insights during signup

**Props**:
```typescript
interface SurveyPopupModalProps {
  userName: string;
  onComplete: (hearAboutUs: string, primaryGoal: string) => void;
}
```

**Features**:
- Two-step progress indicator
- Radio button options for both questions
- No close button on step 1 (mandatory first question)
- Gradient header with welcome message
- Responsive design

**Survey Questions**:

**Step 1: "How did you hear about FOGSLY?"**
- Google Search
- Social Media (Facebook, Instagram, Twitter)
- Friend or Colleague Referral
- YouTube
- Online Advertisement
- Blog or Article
- Other

**Step 2: "What's your primary goal on FOGSLY?"**
- Find Freelance Work
- Hire Freelancers
- Get Tasks Done
- Become a Tasker
- Create a Service Brand
- Explore Opportunities
- Other

---

### 2. ReferralInputModal

**Location**: `components/modals/ReferralInputModal.tsx`

**Purpose**: Allow new users to enter referral codes

**Props**:
```typescript
interface ReferralInputModalProps {
  onSubmit: (referralCode: string) => void;
  onSkip: () => void;
  isValidating?: boolean;
  error?: string;
}
```

**Features**:
- Auto-uppercase input
- Real-time validation
- Error display
- Skip option
- Gift icon and catchy heading
- Pro tip callout box

**UX Flow**:
1. User enters code (e.g., "JOHN_1234")
2. Clicks "Continue" → Validates code
3. If valid → Creates referral record → Shows survey
4. If invalid → Shows error message
5. User can click "Skip" to bypass referral

---

### 3. ReferralsPage

**Location**: `pages/ReferralsPage.tsx`

**Purpose**: Dashboard to view and manage referrals

**Features**:
- **Referral Code Card**: Displays user's unique code with copy/share buttons
- **Stats Cards**: 
  - Total Referrals
  - Active Referrals
  - This Month Referrals
- **Referrals Table**: List of all referred users with name, email, date, status
- **Empty State**: Friendly message when no referrals yet
- **Loading States**: Spinner while generating code or loading data

**Referral Code Generation**:
- Format: `{username/email}_{random_4_digits}`
- Example: `john_3847`, `alice_doe_1234`
- Uniqueness guaranteed by database check
- Max 10 attempts to find unique code

---

## Firebase Collections

### 1. FogslySurvey

**Collection**: `FogslySurvey`

**Purpose**: Store user survey responses

**Schema**:
```typescript
{
  id: string;                    // Auto-generated document ID
  userId: string;                // User who completed survey
  userName: string;              // User's display name
  userEmail: string;             // User's email
  hearAboutUs: string;           // Answer to question 1
  primaryGoal: string;           // Answer to question 2
  timestamp: Timestamp;          // When survey was completed
}
```

**Indexes**: None required

**Security**:
- Users can only create their own survey
- Admins can read all surveys
- No updates or deletes allowed

---

### 2. referrals

**Collection**: `referrals`

**Purpose**: Track all referral relationships

**Schema**:
```typescript
{
  id: string;                    // Auto-generated document ID
  referrerId: string;            // User who referred
  referredUserId: string;        // User who was referred
  referredUserName: string;      // Referred user's name
  referredUserEmail: string;     // Referred user's email
  referralCode: string;          // Code that was used
  timestamp: Timestamp;          // When referral was created
  status: 'active' | 'inactive'; // Referral status
}
```

**Indexes Required**:
- `referrerId` (ascending) + `timestamp` (descending)
- Reason: For getUserReferrals query

**Security**:
- Users can read their own referrals (as referrer or referred)
- Users can create referral records for themselves (as referred)
- Referrers can update status of their referrals
- Admins can read all referrals

---

### 3. users (Extended Fields)

**Collection**: `users`

**Purpose**: Store user data including referral info

**New Fields Added**:
```typescript
{
  // ... existing user fields
  
  // Referral-related fields
  referralCode: string;          // User's unique referral code
  referralCodeCreatedAt: Timestamp; // When code was generated
  surveyCompleted: boolean;      // Whether user completed survey
  surveyCompletedAt: Timestamp;  // When survey was completed
  referredBy: string;            // User ID who referred them (optional)
  referralCodeUsed: string;      // The referral code they used (optional)
  referredAt: Timestamp;         // When they were referred (optional)
}
```

**Note**: Existing users do NOT get referral codes automatically. Only new signups get codes.

---

## Security Rules

### Firestore Rules

**Location**: `firestore.rules`

```javascript
// FogslySurvey - users can only write their own survey, admins can read all
match /FogslySurvey/{surveyId} {
  allow create: if isAuthenticated() && request.resource.data.userId == request.auth.uid;
  allow read: if isAdmin();
}

// Referrals - users can read their own, create for themselves, update their referrals
match /referrals/{referralId} {
  allow read: if isAuthenticated() && 
    (resource.data.referrerId == request.auth.uid || 
     resource.data.referredUserId == request.auth.uid);
  allow create: if isAuthenticated() && 
    request.resource.data.referredUserId == request.auth.uid;
  allow update: if isAuthenticated() && 
    resource.data.referrerId == request.auth.uid;
  allow read: if isAdmin();
}
```

---

## API Reference

### referralService.ts

**Location**: `firebase/services/referralService.ts`

#### Functions

##### `generateReferralCode(identifier: string): string`

Generates a unique referral code from username or email.

**Parameters**:
- `identifier`: Username or email to base code on

**Returns**: Referral code (e.g., "john_3847")

**Example**:
```typescript
const code = generateReferralCode("john_doe");
// Returns: "john_doe_3847"
```

---

##### `createReferralCodeForUser(userId, username, email): Promise<string>`

Creates and assigns a referral code to a user.

**Parameters**:
- `userId`: Firebase Auth UID
- `username`: User's display name
- `email`: User's email address

**Returns**: Generated referral code

**Behavior**:
- Checks if user already has a code (returns existing)
- Generates new code if needed
- Ensures uniqueness (max 10 attempts)
- Updates user document with code and timestamp

**Example**:
```typescript
const code = await createReferralCodeForUser(
  "uid123",
  "john_doe",
  "john@example.com"
);
```

---

##### `submitSurvey(surveyData): Promise<void>`

Submits user survey responses.

**Parameters**:
```typescript
{
  userId: string;
  userName: string;
  userEmail: string;
  hearAboutUs: string;
  primaryGoal: string;
}
```

**Behavior**:
- Creates survey document
- Marks user as survey completed
- Adds timestamp

**Example**:
```typescript
await submitSurvey({
  userId: "uid123",
  userName: "John Doe",
  userEmail: "john@example.com",
  hearAboutUs: "Friend or Colleague Referral",
  primaryGoal: "Find Freelance Work"
});
```

---

##### `validateReferralCode(referralCode): Promise<{valid, referrerId?}>`

Validates if a referral code exists.

**Parameters**:
- `referralCode`: Code to validate

**Returns**:
```typescript
{
  valid: boolean;
  referrerId?: string;  // Only if valid
}
```

**Example**:
```typescript
const result = await validateReferralCode("JOHN_1234");
if (result.valid) {
  console.log("Referrer ID:", result.referrerId);
}
```

---

##### `createReferral(referralCode, referredUserId, name, email): Promise<void>`

Creates a referral record.

**Parameters**:
- `referralCode`: Valid referral code
- `referredUserId`: New user's ID
- `name`: New user's name
- `email`: New user's email

**Behavior**:
- Validates referral code
- Creates referral document
- Updates referred user with referrer info

**Example**:
```typescript
await createReferral(
  "JOHN_1234",
  "uid456",
  "Jane Doe",
  "jane@example.com"
);
```

---

##### `getUserReferrals(userId): Promise<ReferralStats>`

Gets all referrals for a user.

**Parameters**:
- `userId`: User ID to get referrals for

**Returns**:
```typescript
{
  totalReferrals: number;
  activeReferrals: number;
  thisMonthReferrals: number;
  referrals: Referral[];
}
```

**Example**:
```typescript
const stats = await getUserReferrals("uid123");
console.log(`Total: ${stats.totalReferrals}`);
```

---

##### `hasCompletedSurvey(userId): Promise<boolean>`

Checks if user completed survey.

**Parameters**:
- `userId`: User ID to check

**Returns**: `true` if completed, `false` otherwise

**Example**:
```typescript
const completed = await hasCompletedSurvey("uid123");
```

---

## Integration Points

### AuthPage Integration

**Location**: `pages/AuthPage.tsx`

**New States**:
```typescript
const [showReferralInput, setShowReferralInput] = useState(false);
const [showSurvey, setShowSurvey] = useState(false);
const [newUserId, setNewUserId] = useState('');
const [newUserName, setNewUserName] = useState('');
const [newUserEmail, setNewUserEmail] = useState('');
const [referralError, setReferralError] = useState('');
const [isValidatingReferral, setIsValidatingReferral] = useState(false);
```

**Flow Integration**:
```typescript
// After successful signup
startSignupFlow(userId, userName, email);
  ↓
// Show referral input modal
setShowReferralInput(true);
  ↓
// User submits or skips
handleReferralSubmit() or handleReferralSkip();
  ↓
// Show survey modal
setShowSurvey(true);
  ↓
// User completes survey
handleSurveyComplete();
  ↓
// Generate referral code for user
await createReferralCodeForUser();
  ↓
// Navigate to home
navigate('home');
```

---

### Header Integration

**Location**: `components/Header.tsx`

**New Features**:
- Profile dropdown menu
- "Refer a Friend" menu item with Gift icon
- Click handler navigates to `/referrals`

**Code**:
```typescript
<button onClick={() => navigate('referrals')}>
  <Gift className="w-4 h-4" />
  <span>Refer a Friend</span>
</button>
```

---

## URL Referral System

### How It Works

1. **User A** gets their referral code: `ALICE_5678`
2. **User A** clicks "Share Link" button
3. System generates: `https://fogsly.com/auth?ref=ALICE_5678`
4. **User B** clicks the link
5. `AuthPage` detects `?ref=ALICE_5678` in URL
6. Code is stored in `sessionStorage`
7. After signup, referral modal shows with pre-filled code
8. User can continue or edit the code

### Implementation

```typescript
// AuthPage.tsx - URL detection
useEffect(() => {
  const urlParams = new URLSearchParams(window.location.search);
  const refCode = urlParams.get('ref');
  if (refCode) {
    sessionStorage.setItem('pendingReferralCode', refCode);
  }
}, []);

// Later in signup flow
const pendingRefCode = sessionStorage.getItem('pendingReferralCode');
if (pendingRefCode) {
  // Auto-fill referral input modal
  setShowReferralInput(true);
}
```

---

## Testing Checklist

### User Signup Flow
- [ ] Email/password signup triggers survey and referral flow
- [ ] Google signup triggers survey and referral flow
- [ ] Referral input modal can be skipped
- [ ] Survey step 1 cannot be skipped
- [ ] Survey step 2 cannot be skipped
- [ ] Referral code is generated after survey completion
- [ ] User is redirected to home after survey

### Referral Code Validation
- [ ] Valid code is accepted
- [ ] Invalid code shows error
- [ ] Error message is clear and helpful
- [ ] User can retry after error
- [ ] Skip button works

### Referrals Dashboard
- [ ] User can see their referral code
- [ ] Copy button works
- [ ] Share link button works (mobile share API)
- [ ] Stats cards show correct numbers
- [ ] Referrals table displays all referrals
- [ ] Empty state shows when no referrals
- [ ] Loading state shows while fetching data

### URL Referral Links
- [ ] Link with `?ref=CODE` pre-fills referral input
- [ ] Code is validated on submission
- [ ] Invalid URL code shows error
- [ ] User can edit pre-filled code

### Security
- [ ] Users can only read their own referrals
- [ ] Users cannot modify other users' referral codes
- [ ] Survey can only be submitted once per user
- [ ] Referral codes are unique

---

## Future Enhancements

### Possible Features (Not Implemented)
1. **Referral Rewards**: Give FogCoins/badges for successful referrals
2. **Leaderboard**: Top referrers ranking
3. **Email Notifications**: Alert referrers when someone uses their code
4. **Analytics**: Track referral conversion rates
5. **Social Sharing**: Direct Facebook/Twitter/WhatsApp share buttons
6. **Referral Tiers**: Bronze/Silver/Gold based on referral count
7. **Custom Referral Codes**: Allow users to customize their codes
8. **Referral Challenges**: Time-limited referral competitions

---

## Troubleshooting

### Common Issues

**Issue**: Referral code not generating
- **Solution**: Check Firebase permissions for users collection
- **Solution**: Verify user document exists

**Issue**: Survey not showing after signup
- **Solution**: Check `startSignupFlow()` is being called
- **Solution**: Verify modal states are being set

**Issue**: Referral link doesn't auto-fill code
- **Solution**: Check URL parameter is correct format
- **Solution**: Verify sessionStorage is working

**Issue**: "Invalid referral code" error for valid code
- **Solution**: Code might have expired or been deleted
- **Solution**: User might have typo in code

**Issue**: Referrals page shows empty even with referrals
- **Solution**: Check Firestore indexes are created
- **Solution**: Verify security rules allow reading

---

## Support

For issues or questions:
1. Check this documentation
2. Review Firebase console for errors
3. Check browser console for JavaScript errors
4. Verify Firestore rules are deployed
5. Test with Firebase emulator first

---

## Changelog

### Version 1.0.0 (Initial Release)
- ✅ Referral code generation
- ✅ Two-step survey modal
- ✅ Referral input modal
- ✅ Referrals dashboard
- ✅ Profile dropdown integration
- ✅ URL referral links
- ✅ Firebase security rules
- ✅ TypeScript types
- ✅ Dark mode support

---

**Last Updated**: October 15, 2025  
**Author**: FOGSLY Development Team  
**Version**: 1.0.0
