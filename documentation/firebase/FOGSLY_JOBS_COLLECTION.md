# FogslyJobs Collection - Approved Jobs System

## Overview
When a job request is approved by admin, it's automatically copied to the `FogslyJobs` collection with status "active". This creates a public-facing job marketplace separate from the internal job requests system.

---

## Architecture

### Two-Collection System

**1. JobRequests Collection** (Internal/Admin)
- Stores all job submissions (pending, approved, rejected)
- Used for admin approval workflow
- Contains rejection reasons and approval metadata
- Not publicly accessible

**2. FogslyJobs Collection** (Public/Marketplace)
- Contains only approved jobs
- Public-facing job listings
- Searchable by categories, skills, location
- Tracks views and applications
- Status: active → in-progress → completed/closed

---

## Data Flow

```
User Submits Job
      ↓
JobRequests Collection (status: pending)
      ↓
Admin Reviews
      ↓
   ┌──────┴──────┐
   ↓             ↓
Approve      Reject
   ↓             ↓
JobRequests   JobRequests
(approved)    (rejected)
   ↓             ↓
FogslyJobs    ❌ Not copied
(active)      to FogslyJobs
```

---

## Database Structure

### FogslyJobs Collection

```typescript
interface FogslyJob {
  // IDs
  id: string;                    // Unique FogslyJob ID
  jobRequestId: string;          // Reference to original JobRequest
  userId: string;                // Client who posted
  
  // Job Details (copied from JobRequest)
  jobTitle: string;
  jobDescription: string;
  categories: string[];          // Max 3
  skills: string[];              // 1-10
  budgetType: 'hourly' | 'fixed' | 'quote';
  budgetAmount?: number;
  budgetCurrency: string;
  
  // Client Contact (snapshot from approval time)
  userName: string;
  userEmail: string;
  userPhone: string;
  userCity: string;
  userCountry: string;
  
  // Status Management
  status: 'active' | 'in-progress' | 'completed' | 'closed';
  
  // Timestamps
  createdAt: Date;               // When added to FogslyJobs
  updatedAt: Date;
  approvedAt: Date;              // From JobRequest
  approvedBy: string;            // Admin ID
  
  // Metrics
  viewCount: number;             // Default: 0
  applicationCount: number;      // Default: 0
}
```

---

## Service Functions

### Location: `firebase/services/fogslyJobsService.ts`

#### 1. createFogslyJob()
**Called automatically by approveJobRequest()**

```typescript
createFogslyJob(jobData): Promise<{
  success: boolean;
  error?: string;
  jobId?: string;
}>
```

**Purpose**: Create new FogslyJob from approved JobRequest
**Initial Status**: Always 'active'
**Initial Metrics**: viewCount = 0, applicationCount = 0

#### 2. getFogslyJobById()
```typescript
getFogslyJobById(jobId: string): Promise<FogslyJob | null>
```
**Purpose**: Fetch single job by ID
**Use Case**: Job detail page

#### 3. getActiveFogslyJobs()
```typescript
getActiveFogslyJobs(limit: number = 50): Promise<FogslyJob[]>
```
**Purpose**: Get all active jobs (public marketplace)
**Filter**: status === 'active'
**Order**: createdAt DESC (newest first)

#### 4. getAllFogslyJobs()
```typescript
getAllFogslyJobs(
  statusFilter?: FogslyJobStatus,
  searchTerm?: string,
  limit: number = 100
): Promise<FogslyJob[]>
```
**Purpose**: Admin view with filters
**Search**: Title, description, user name, categories, skills
**Filter**: By status (optional)

#### 5. getUserFogslyJobs()
```typescript
getUserFogslyJobs(userId: string): Promise<FogslyJob[]>
```
**Purpose**: Get all jobs posted by specific user
**Use Case**: User dashboard - "My Posted Jobs"

#### 6. updateFogslyJobStatus()
```typescript
updateFogslyJobStatus(
  jobId: string,
  newStatus: FogslyJobStatus
): Promise<{ success: boolean; error?: string }>
```
**Purpose**: Change job status
**Use Cases**:
- active → in-progress (freelancer hired)
- in-progress → completed (work finished)
- active → closed (job cancelled)

#### 7. incrementJobViewCount()
```typescript
incrementJobViewCount(jobId: string): Promise<void>
```
**Purpose**: Track job views
**Use Case**: Call when user views job detail page

#### 8. incrementJobApplicationCount()
```typescript
incrementJobApplicationCount(jobId: string): Promise<void>
```
**Purpose**: Track applications
**Use Case**: Call when freelancer applies to job

#### 9. getFogslyJobsStats()
```typescript
getFogslyJobsStats(): Promise<{
  total: number;
  active: number;
  closed: number;
  inProgress: number;
  completed: number;
}>
```
**Purpose**: Dashboard statistics
**Use Case**: Admin dashboard, public stats

#### 10. searchJobsByCategory()
```typescript
searchJobsByCategory(category: string): Promise<FogslyJob[]>
```
**Purpose**: Filter active jobs by category
**Use Case**: Category browse page

#### 11. searchJobsBySkill()
```typescript
searchJobsBySkill(skill: string): Promise<FogslyJob[]>
```
**Purpose**: Filter active jobs by skill
**Use Case**: Skill-based job recommendations

---

## Updated Functions

### Location: `firebase/services/jobRequestService.ts`

#### approveJobRequest() - Enhanced

```typescript
approveJobRequest(
  jobRequestId: string,
  adminId: string
): Promise<{
  success: boolean;
  error?: string;
  fogslyJobId?: string;  // NEW: Returns created FogslyJob ID
}>
```

**New Workflow**:
1. Fetch JobRequest by ID
2. Validate status is 'pending'
3. Update JobRequest status to 'approved'
4. **Create FogslyJob with all data**
5. Return success + fogslyJobId

**Error Handling**:
- If FogslyJob creation fails, JobRequest still marked approved
- Returns success with error message
- Logs error for debugging

**Data Copied to FogslyJob**:
- All job details (title, description, categories, skills)
- Budget information
- Client contact snapshot
- Approval metadata (approvedAt, approvedBy)
- Status set to 'active'

---

## Job Status Lifecycle

### JobRequest Statuses
```
pending → approved (creates FogslyJob)
pending → rejected (no FogslyJob created)
```

### FogslyJob Statuses
```
active → in-progress → completed
active → closed
in-progress → closed
```

**Status Definitions**:
- **active**: Available for freelancers to apply
- **in-progress**: Freelancer hired, work ongoing
- **completed**: Work successfully finished
- **closed**: Job cancelled or no longer available

---

## Use Cases

### 1. Public Job Marketplace
```typescript
// Get all active jobs for browse page
const activeJobs = await getActiveFogslyJobs(50);

// Search by category
const webDevJobs = await searchJobsByCategory('Web Development');

// Search by skill
const reactJobs = await searchJobsBySkill('React');
```

### 2. Job Detail Page
```typescript
// View job and increment view count
const job = await getFogslyJobById(jobId);
if (job) {
  await incrementJobViewCount(jobId);
}
```

### 3. Freelancer Application
```typescript
// User applies to job
await incrementJobApplicationCount(jobId);
// Then create application record in Applications collection
```

### 4. Client Hires Freelancer
```typescript
// Change status when work begins
await updateFogslyJobStatus(jobId, 'in-progress');
```

### 5. Complete Job
```typescript
// Mark job as completed
await updateFogslyJobStatus(jobId, 'completed');
```

### 6. User Dashboard
```typescript
// Show user's posted jobs
const myJobs = await getUserFogslyJobs(userId);

// Show stats
myJobs.forEach(job => {
  console.log(`${job.jobTitle}: ${job.viewCount} views, ${job.applicationCount} applications`);
});
```

---

## Admin Workflow

### Approval Process

1. **Admin views JobRequest in admin panel**
2. **Admin clicks "Approve" button**
3. **System executes**:
   ```typescript
   const result = await approveJobRequest(jobRequestId, adminId);
   
   if (result.success) {
     // JobRequest marked approved
     // FogslyJob created with ID: result.fogslyJobId
     // Status set to 'active'
     toast.success('Job approved and published!');
   }
   ```

### Rejection Process

1. **Admin clicks "Reject" button**
2. **Admin provides rejection reason**
3. **System executes**:
   ```typescript
   const result = await rejectJobRequest(jobRequestId, adminId, reason);
   
   if (result.success) {
     // JobRequest marked rejected
     // NO FogslyJob created
     // Reason stored in JobRequest
     toast.success('Job request rejected');
   }
   ```

---

## Key Features

### ✅ Data Integrity
- FogslyJob is snapshot at approval time
- Changes to JobRequest don't affect FogslyJob
- Client profile changes don't update published jobs

### ✅ Separation of Concerns
- JobRequests = Admin management
- FogslyJobs = Public marketplace
- Clean data separation

### ✅ Metrics Tracking
- View count for analytics
- Application count for popularity
- Updated timestamp for activity

### ✅ Search & Filter
- By category (array-contains)
- By skill (array-contains)
- By status
- Client-side text search

### ✅ Status Management
- Clear lifecycle (active → in-progress → completed)
- Flexible workflow (can close at any stage)
- Prevents stale jobs

---

## Future Enhancements

### Possible Additions
- [ ] Job expiration dates (auto-close after X days)
- [ ] Featured jobs (premium placement)
- [ ] Job bumping (move to top for fee)
- [ ] Saved searches for freelancers
- [ ] Email alerts for new jobs matching criteria
- [ ] Job recommendations based on freelancer skills
- [ ] Salary range instead of fixed budget
- [ ] Remote/onsite filtering
- [ ] Job difficulty level
- [ ] Estimated duration field

---

## Testing Checklist

### Approval Flow
- [ ] Approve pending job → creates FogslyJob
- [ ] FogslyJob has status 'active'
- [ ] FogslyJob has all data from JobRequest
- [ ] fogslyJobId returned in response
- [ ] Reject job → no FogslyJob created
- [ ] Cannot approve already approved job
- [ ] Cannot approve rejected job

### FogslyJob CRUD
- [ ] Create FogslyJob with valid data
- [ ] Fetch FogslyJob by ID
- [ ] Get all active FogslyJobs
- [ ] Filter by status
- [ ] Search by category works
- [ ] Search by skill works
- [ ] Get user's jobs returns correct data

### Metrics
- [ ] View count increments
- [ ] Application count increments
- [ ] Updated timestamp changes

### Status Updates
- [ ] active → in-progress works
- [ ] in-progress → completed works
- [ ] active → closed works
- [ ] Invalid status rejected

---

## Error Handling

### Common Scenarios

**Job Request Not Found**
```typescript
{
  success: false,
  error: 'Job request not found'
}
```

**Job Already Processed**
```typescript
{
  success: false,
  error: 'Job request has already been processed'
}
```

**FogslyJob Creation Fails**
```typescript
{
  success: true,
  error: 'Job approved but failed to create public listing',
  fogslyJobId: undefined
}
```
*Note: JobRequest still marked approved*

---

## Security Rules (Firestore)

### Recommended Rules

```javascript
// FogslyJobs Collection
match /FogslyJobs/{jobId} {
  // Anyone can read active jobs
  allow read: if resource.data.status == 'active';
  
  // Job owner can read their own jobs
  allow read: if request.auth != null && 
                 request.auth.uid == resource.data.userId;
  
  // Only job owner can update status (to closed)
  allow update: if request.auth != null && 
                   request.auth.uid == resource.data.userId &&
                   request.resource.data.status == 'closed';
  
  // Admins can do everything
  allow read, write: if request.auth != null && 
                        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
}
```

---

## Integration Points

### Files Modified
- `firebase/types/job.ts` - Added FogslyJob types
- `firebase/services/jobRequestService.ts` - Enhanced approveJobRequest()

### Files Created
- `firebase/services/fogslyJobsService.ts` - Complete CRUD for FogslyJobs

### Next Steps for Integration
1. Create job marketplace/browse page
2. Create job detail page with view tracking
3. Add "My Posted Jobs" to user dashboard
4. Implement application system
5. Add status management UI for job owners
6. Create search/filter components

---

## Summary

The FogslyJobs collection creates a clean separation between:
- **Admin workflow** (JobRequests) - internal management
- **Public marketplace** (FogslyJobs) - user-facing jobs

**Approval** → Automatically creates public listing
**Rejection** → No public listing created

This architecture enables:
- Better performance (smaller public collection)
- Enhanced security (rejected jobs never public)
- Flexible status management (job lifecycle)
- Detailed metrics (views, applications)
- Advanced search capabilities

---

**Documentation Last Updated**: December 2024
