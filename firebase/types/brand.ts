export interface BrandRequest {
  id: string;
  userId: string;
  brandName: string;
  tagline: string;
  description: string;
  whatsappChannel: string;
  logoUrl?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
  rejectionReason?: string;
  adminComments?: string;
  adminId?: string; // Admin who approved/rejected
  canResubmit?: boolean; // Whether user can resubmit after rejection
  categories?: string[]; // Selected business categories (max 3)
}

export interface Brand extends Omit<BrandRequest, 'status'> {
  status: 'approved' | 'active' | 'frozen';
  services: BrandService[];
  followers?: string[]; // Array of user IDs who follow this brand
  stats: {
    totalOrders: number;
    totalEarnings: number;
    rating: number;
    reviews: number;
    followers?: number; // Count of followers
  };
}

export interface BrandService {
  id: string;
  brandId: string;
  title: string;
  description: string;
  category: string;
  price: number;
  currency: string;
  deliveryTime: string;
  features: string[];
  images: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateBrandRequestData {
  brandName: string;
  tagline: string;
  description: string;
  whatsappChannel: string;
  logoFile?: File;
  categories?: string[];
}

export interface UpdateBrandData {
  brandName?: string;
  tagline?: string;
  description?: string;
  whatsappChannel?: string;
  logoFile?: File;
  categories?: string[];
}