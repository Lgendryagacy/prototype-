export interface ServicePackage {
  id: string;
  name: string;
  price: number;
  currency: 'PKR' | 'USD';
  features: string[];
  deliveryTime: string;
}

export interface ServiceFAQ {
  id: string;
  question: string;
  answer: string;
}

export interface ServicePricing {
  type: 'hourly' | 'fixed' | 'contact';
  hourlyRate?: {
    rate: number;
    currency: 'PKR' | 'USD';
    minimumHours: number;
  };
  packages?: ServicePackage[];
}

export interface BrandService {
  id: string;
  
  // Service Details (Step 1)
  title: string;
  description: string;
  categories: string[];
  mainImage: string;
  thumbnailImages: string[]; // max 5, min 1
  
  // Pricing (Step 2)
  pricing: ServicePricing;
  
  // FAQs (Step 3)
  faqs: ServiceFAQ[];
  
  // Brand Information
  brandId: string;
  brandName: string;
  brandTagline: string;
  brandLogo: string;
  brandDescription: string;
  userId: string;
  
  // Service Metadata
  status: 'active' | 'inactive' | 'frozen';
  soldOut: boolean; // New field to mark service as sold out
  createdAt: Date;
  updatedAt: Date;
  
  // Statistics
  stats: {
    views: number;
    orders: number;
    rating: number;
    reviews: number;
  };
}

export interface CreateServiceData {
  title: string;
  description: string;
  categories: string[];
  mainImageFile?: File;
  thumbnailImageFiles?: File[];
  pricing: ServicePricing;
  faqs: ServiceFAQ[];
}

export interface UpdateServiceData extends Partial<CreateServiceData> {
  status?: 'active' | 'inactive' | 'frozen';
  soldOut?: boolean; // Allow updating soldOut status
}