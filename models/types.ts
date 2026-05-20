export interface GalleryItem {
  url: string;
  description?: string;
}

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  photoURL?: string;
  bannerURL?: string;
  bio?: string;
  category?: string;
  isProvider: boolean;
  role: 'admin' | 'user';
  contacts: string[];
  location?: string;
  whatsapp?: string;
  instagram?: string;
  facebook?: string;
  linkedin?: string;
  website?: string;
  serviceType?: string;
  phone?: string;
  phones?: string[];
  ward?: string;
  companyName?: string;
  businessAddress?: string;
  businessAddressNumber?: string;
  businessNeighborhood?: string;
  businessState?: string;
  businessComplement?: string;
  gallery?: GalleryItem[];
  rating?: number;
  reviewCount?: number;
  experienceYears?: number;
  baptismYear?: number;
  memberVerified?: boolean;
  membershipYears?: number;
  availability?: string[];
  serviceHours?: string;
  isBlocked?: boolean;
  isDeleted?: boolean;
  deletedByUser?: boolean;
  deletedAt?: any;
  createdAt: any;
}

export interface Service {
  id?: string;
  providerId: string;
  title: string;
  description: string;
  category: string;
  price?: string;
  createdAt: any;
}

export interface Rating {
  id?: string;
  toId: string;
  score: number;
  comment?: string;
  createdAt: any;
}

export interface UserReport {
  id?: string;
  reportedUserId: string;
  reportedUserName?: string;
  reporterId: string;
  reporterEmail: string;
  reason: string;
  details?: string;
  status: 'new' | 'reviewed' | 'resolved';
  createdAt: any;
}

export type PostStatus = 'draft' | 'pending_review' | 'published' | 'rejected';

export interface Post {
  id?: string;
  authorId: string;
  authorName: string;
  authorEmail: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImageUrl?: string;
  tags?: string[];
  status: PostStatus;
  createdAt: any;
  updatedAt: any;
  publishedAt?: any;
  reviewedAt?: any;
  reviewedBy?: string;
  rejectionReason?: string;
  isFeatured?: boolean;
}
