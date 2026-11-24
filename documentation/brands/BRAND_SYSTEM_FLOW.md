# Brand System Flow Documentation

## 📚 Overview
The brand system uses **TWO separate Firestore collections** to manage brands:

### Collections:
1. **`brandRequests`** - Stores all brand requests submitted by users
2. **`brands`** - Stores approved brands that are live on the platform

---

## 🔄 Complete Flow

### 1️⃣ **User Submits Brand Request**
**Location:** User creates a brand through the brand creation form

**Collection:** `brandRequests`
```typescript
{
  id: string,
  userId: string,
  brandName: string,
  tagline: string,
  description: string,
  whatsappChannel: string,
  logoUrl: string,
  categories: string[],
  status: 'pending',  // ← Status in brandRequests collection
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

**Function:** `createBrandRequest(userId, data)`
- Creates document in `brandRequests` collection
- Status is set to `'pending'`
- Uploads logo to Firebase Storage

---

### 2️⃣ **Admin Reviews Brand Request**
**Location:** Admin Dashboard → Brand Requests Tab

**What Admin Sees:** All documents from `brandRequests` collection

**Actions Admin Can Take:**
- ✅ **Approve** → Creates brand in `brands` collection
- ❌ **Reject** → Updates status in `brandRequests` to 'rejected'
- 🗑️ **Delete** → Removes from `brandRequests` collection

---

### 3️⃣ **Admin Approves Brand Request**
**Function:** `approveBrandRequest(requestId, adminId, comments)`

**What Happens:**
1. **Updates `brandRequests` collection:**
   ```typescript
   {
     status: 'approved',  // ← Updated from 'pending' to 'approved'
     adminId: adminId,
     adminComments: comments,
     updatedAt: new Date()
   }
   ```

2. **Creates NEW document in `brands` collection:**
   ```typescript
   {
     id: string,
     userId: string,
     brandName: string,
     tagline: string,
     description: string,
     whatsappChannel: string,
     logoUrl: string,
     categories: string[],
     status: 'active',  // ← NEW brands start as 'active'
     createdAt: Timestamp,
     updatedAt: Timestamp,
     services: [],
     stats: {
       totalOrders: 0,
       totalEarnings: 0,
       rating: 0,
       reviews: 0
     }
   }
   ```

**Important:** The brand now exists in BOTH collections:
- `brandRequests` with status: `'approved'`
- `brands` with status: `'active'`

---

### 4️⃣ **Brand Dashboard (User View)**
**Hook:** `useBrand(userId)`

**What It Does:**
1. Fetches brand request from `brandRequests` collection
2. If request status is `'approved'`, fetches actual brand from `brands` collection
3. Returns both objects:
   - `brandRequest` - From `brandRequests` (status: pending/approved/rejected)
   - `brand` - From `brands` (status: active/frozen)

**Code Flow:**
```typescript
const { brandRequest, brand } = useBrand(user?.uid);

// brandRequest = { status: 'approved', ... } from 'brandRequests'
// brand = { status: 'active', ... } from 'brands'
```

**Editable When:**
- `brandRequest.status === 'approved'` AND
- `brand.status !== 'frozen'`

---

### 5️⃣ **Admin Freezes Brand**
**Location:** Admin Dashboard → Approved Brands Tab

**Function:** `toggleBrandFreeze(brandId, freeze: true)`

**What Happens:**
- **ONLY updates `brands` collection:**
  ```typescript
  {
    status: 'frozen',  // Changed from 'active' to 'frozen'
    updatedAt: new Date()
  }
  ```

- **Does NOT update `brandRequests` collection**
  - Request status remains `'approved'`

**Effect on User:**
- User sees "Brand Paused" alert
- Cannot edit brand
- Cannot add/edit services
- Services hidden from marketplace

---

### 6️⃣ **Admin Unfreezes Brand**
**Function:** `toggleBrandFreeze(brandId, freeze: false)`

**What Happens:**
- Updates `brands` collection:
  ```typescript
  {
    status: 'active',  // Changed from 'frozen' back to 'active'
    updatedAt: new Date()
  }
  ```

**Effect on User:**
- Can edit brand again
- Can manage services
- Services visible in marketplace

---

## 📊 Status Fields Explained

### `brandRequests` Collection Status
- **`pending`** - Waiting for admin review
- **`approved`** - Admin approved (brand created in `brands` collection)
- **`rejected`** - Admin rejected the request

### `brands` Collection Status
- **`active`** - Brand is live and operational
- **`frozen`** - Brand is paused by admin (not visible to users)

---

## 🎯 Key Functions & Their Collections

### Reading Data
| Function | Collection | Purpose |
|----------|-----------|---------|
| `getUserBrandRequest()` | `brandRequests` | Get user's brand request |
| `getUserBrand()` | `brands` | Get user's active/frozen brand |
| `getAllBrandRequests()` | `brandRequests` | Admin: Get all requests |
| `getAllBrands()` | `brands` | Admin: Get all live brands |
| `useApprovedBrands()` | `brands` | Frontend: Get active brands only |

### Writing Data
| Function | Collection | Action |
|----------|-----------|--------|
| `createBrandRequest()` | `brandRequests` | Create new request |
| `approveBrandRequest()` | Both | Update request + Create brand |
| `rejectBrandRequest()` | `brandRequests` | Update status to rejected |
| `updateBrand()` | `brands` | Update brand details |
| `toggleBrandFreeze()` | `brands` | Freeze/unfreeze brand |

---

## 🔐 Permission Logic

### Can User Edit Brand?
```typescript
canEditBrand() {
  return (
    brand !== null &&                    // Brand exists in 'brands' collection
    brandRequest?.status === 'approved' && // Request is approved
    brand.status !== 'frozen'            // Brand is not frozen
  );
}
```

### What User Sees in Dashboard
```typescript
// If brandRequest.status === 'pending'
→ Shows "Brand Under Review" alert

// If brandRequest.status === 'approved' && brand.status === 'active'
→ Shows "Brand Approved" alert
→ Can edit brand and services

// If brandRequest.status === 'approved' && brand.status === 'frozen'
→ Shows "Brand Paused" alert
→ Cannot edit anything

// If brandRequest.status === 'rejected'
→ Shows "Brand Request Rejected" alert
```

---

## 🛡️ Marketplace Visibility

### Which Brands Show in FogServicesPage?
```typescript
// Query: brands collection
where('status', 'in', ['approved', 'active'])  // ✅ Shows active brands
                                                // ❌ Hides frozen brands
```

**Note:** The `'approved'` check is legacy - all new brands use `'active'` status.

### Which Services Show in Marketplace?
```typescript
// Query: BrandsServices collection
where('status', '!=', 'frozen')  // ✅ Shows active services

// PLUS additional check:
Filter out services where parent brand.status === 'frozen'
```

---

## 🐛 Issues Fixed

### ✅ Issue 1: Status Hardcoding
**Problem:** `getUserBrand()` was returning `status: 'approved'` instead of actual status
```typescript
// ❌ BEFORE
return { ...data, status: 'approved' };

// ✅ AFTER
return { ...data, status: data.status || 'active' };
```

### ✅ Issue 2: Wrong Initial Status
**Problem:** New brands created with `status: 'approved'` instead of `'active'`
```typescript
// ❌ BEFORE
const brandData = { ...data, status: 'approved' };

// ✅ AFTER
const brandData = { ...data, status: 'active' };
```

### ✅ Issue 3: Freeze Check Missing
**Problem:** `canEditBrand()` didn't check if brand was frozen
```typescript
// ❌ BEFORE
canEditBrand() {
  return brand && brandRequest?.status === 'approved';
}

// ✅ AFTER
canEditBrand() {
  return brand && brandRequest?.status === 'approved' && brand.status !== 'frozen';
}
```

---

## 📝 Summary

### Two Collections, Different Purposes:
- **`brandRequests`** = Workflow management (pending → approved/rejected)
- **`brands`** = Live brand data (active ↔ frozen)

### Status Lifecycle:
```
User Submits
    ↓
brandRequests: 'pending'
    ↓
Admin Approves
    ↓
brandRequests: 'approved' (never changes)
brands: 'active' (can become 'frozen')
    ↓
Admin Freezes/Unfreezes
    ↓
brands: 'frozen' ↔ 'active'
```

### Key Principle:
- **Once approved, `brandRequests.status` stays `'approved'` forever**
- **Admin controls live status via `brands.status` (`active`/`frozen`)**
- **User dashboard checks BOTH collections to determine permissions**

---

## 🎬 End Result

✅ Clear separation of concerns
✅ Proper status tracking
✅ Correct freeze behavior
✅ No confusion between collections
✅ Scalable admin controls
