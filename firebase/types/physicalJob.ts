// Physical Job Types

export type PhysicalJobRequestStatus = 'pending' | 'approved' | 'rejected';
export type FogslyPhysicalJobStatus = 'active' | 'paused' | 'closed' | 'hired' | 'completed';
export type JobType = 'On-Site' | 'Remote' | 'Hybrid';
export type ExperienceLevel = 'Entry' | 'Mid' | 'Senior';
export type EmploymentType = 'Full-time' | 'Part-time' | 'Contract';
export type UrgencyLevel = 'Normal' | 'Urgent';

// Location data from Google Maps
export interface JobLocation {
  latitude: number;
  longitude: number;
  formatted_address: string;
}

// Physical Job Request Interface (for submission/pending approval)
export interface PhysicalJobRequest {
  // IDs
  id: string;
  userId: string; // Who posted the job
  userEmail: string; // Poster's email
  
  // Company Information
  company_name: string;
  company_logo?: string; // Firebase Storage URL
  industry: string;
  company_description: string;
  website?: string;
  company_size: string;
  
  // Company Contact
  email: string; // Company contact email
  phone: string; // Company contact phone
  
  // Location
  country: string;
  city: string;
  address: string; // Complete street address
  location: JobLocation; // Google Maps data
  
  // Job Details
  job_title: string;
  category: string;
  job_type: JobType;
  experience_level: ExperienceLevel;
  employment_type: EmploymentType;
  num_positions: number;
  
  // Compensation
  salary_min: number;
  salary_max: number;
  urgency: UrgencyLevel;
  
  // Job Description
  job_description: string;
  responsibilities: string;
  required_skills: string[]; // Array of skills
  benefits?: string;
  
  // Special Offers
  accommodation: boolean;
  visa_support: boolean;
  deadline: string; // Date string (YYYY-MM-DD)
  
  // Request Status
  status: PhysicalJobRequestStatus;
  rejectionReason?: string;
  
  // Timestamps
  submittedAt: Date;
  updatedAt: Date;
  approvedAt?: Date;
  rejectedAt?: Date;
  
  // Admin tracking
  approvedBy?: string; // Admin UID
  rejectedBy?: string; // Admin UID
}

// Fogsly Physical Job Interface (approved/active jobs)
export interface FogslyPhysicalJob {
  // IDs
  id: string;
  physicalJobRequestId: string; // Reference to original request
  userId: string;
  userEmail: string;
  
  // Company Information (from request)
  company_name: string;
  company_logo?: string;
  industry: string;
  company_description: string;
  website?: string;
  company_size: string;
  
  // Company Contact (from request)
  email: string;
  phone: string;
  
  // Location (from request)
  country: string;
  city: string;
  address: string;
  location: JobLocation;
  
  // Job Details (from request)
  job_title: string;
  category: string;
  job_type: JobType;
  experience_level: ExperienceLevel;
  employment_type: EmploymentType;
  num_positions: number;
  
  // Compensation (from request)
  salary_min: number;
  salary_max: number;
  urgency: UrgencyLevel;
  
  // Job Description (from request)
  job_description: string;
  responsibilities: string;
  required_skills: string[];
  benefits?: string;
  
  // Special Offers (from request)
  accommodation: boolean;
  visa_support: boolean;
  deadline: string;
  
  // Active Job Status
  status: FogslyPhysicalJobStatus;
  paused_reason?: string; // Reason for pausing (if paused)
  
  // Metadata
  posted_date: Date;
  updatedAt: Date;
  approvedAt: Date;
  approvedBy: string; // Admin UID
  verified: boolean; // Always true for approved jobs
  
  // Tracking
  applicant_count: number;
  viewCount: number;
  
  // Completion Tracking
  hired_date?: Date;
  completed_date?: Date;
}

// Data types for creating a new job request
export interface CreatePhysicalJobRequestData {
  userId: string;
  userEmail: string;
  
  // Company Info
  company_name: string;
  company_logo?: string;
  industry: string;
  company_description: string;
  website?: string;
  company_size: string;
  email: string;
  phone: string;
  
  // Location
  country: string;
  city: string;
  address: string;
  location: JobLocation;
  
  // Job Details
  job_title: string;
  category: string;
  job_type: JobType;
  experience_level: ExperienceLevel;
  employment_type: EmploymentType;
  num_positions: number;
  
  // Compensation
  salary_min: number;
  salary_max: number;
  urgency: UrgencyLevel;
  
  // Description
  job_description: string;
  responsibilities: string;
  required_skills: string[];
  benefits?: string;
  
  // Special Offers
  accommodation: boolean;
  visa_support: boolean;
  deadline: string;
}

// Data for updating job request
export interface UpdatePhysicalJobRequestData {
  job_title?: string;
  job_description?: string;
  responsibilities?: string;
  required_skills?: string[];
  salary_min?: number;
  salary_max?: number;
  deadline?: string;
  status?: PhysicalJobRequestStatus;
  rejectionReason?: string;
}

// Industry options
export const INDUSTRIES = [
  'Technology',
  'Construction',
  'Healthcare',
  'Finance',
  'Education',
  'Manufacturing',
  'Retail',
  'Hospitality',
  'Transportation',
  'Real Estate',
  'Marketing',
  'Legal',
  'Agriculture',
  'Energy',
  'Media',
  'Other'
] as const;

// Company size options
export const COMPANY_SIZES = [
  '1-10',
  '11-50',
  '51-200',
  '201-500',
  '501-1000',
  '1000+'
] as const;

// Job categories
export const JOB_CATEGORIES = [
  'Technology',
  'Construction',
  'Healthcare',
  'Engineering',
  'Sales & Marketing',
  'Finance & Accounting',
  'Human Resources',
  'Customer Service',
  'Administration',
  'Operations',
  'Design',
  'Legal',
  'Education',
  'Hospitality',
  'Manufacturing',
  'Other'
] as const;

// Physical Job Application Types
export type PhysicalJobApplicationStatus = 'pending' | 'approved' | 'rejected';

export interface PhysicalJobApplication {
  // IDs
  id: string;
  jobId: string;
  jobTitle: string;
  
  // Applicant Info
  applicantId: string;
  applicantEmail: string;
  applicant_name: string;
  applicant_phone: string;
  applicant_city: string;
  applicant_country: string;
  
  // Job Poster Info
  jobPosterId: string;
  jobPosterEmail: string;
  
  // Application Details
  skills: string[];
  cover_letter: string;
  resume_url?: string;
  
  // Status
  status: PhysicalJobApplicationStatus;
  rejectionReason?: string;
  
  // Timestamps
  appliedAt: Date;
  updatedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
}

export interface CreatePhysicalJobApplicationData {
  jobId: string;
  jobTitle: string;
  applicantId: string;
  applicantEmail: string;
  applicant_name: string;
  applicant_phone: string;
  applicant_city: string;
  applicant_country: string;
  jobPosterId: string;
  jobPosterEmail: string;
  skills: string[];
  cover_letter: string;
  resume_url?: string;
}
