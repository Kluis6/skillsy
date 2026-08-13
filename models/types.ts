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
  hasPublicProfile?: boolean;
  role: "admin" | "user";
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
  /** Private preference controlling whether city and UF are visible publicly. */
  showPublicLocation?: boolean;
  /** Coarse location intentionally copied to a public profile only with consent. */
  publicCity?: string;
  publicState?: string;
  searchTokens?: string[];
  businessComplement?: string;
  gallery?: GalleryItem[];
  rating?: number;
  reviewCount?: number;
  recommendationCount?: number;
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
  fromId?: string;
  authorName?: string;
  score: number;
  comment?: string;
  createdAt: any;
}

export interface CommunityRecommendation {
  recommenderId: string;
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
  status: "new" | "in_review" | "resolved" | "dismissed" | "reviewed";
  priority?: "low" | "normal" | "high";
  assignedAdminId?: string;
  assignedAdminName?: string;
  resolution?: string;
  createdAt: any;
  updatedAt?: any;
  reviewedAt?: any;
  resolvedAt?: any;
}

export type PostCategory = "article" | "job";
export type PostStatus = "draft" | "pending_review" | "published" | "rejected";

export interface Post {
  id?: string;
  authorId: string;
  authorName: string;
  authorEmail: string;
  category: PostCategory;
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

export interface PostReport {
  id?: string;
  postId: string;
  postTitle: string;
  postSlug: string;
  postAuthorId: string;
  reporterId: string;
  reporterEmail: string;
  reason: string;
  details?: string;
  status: "new" | "reviewed" | "resolved";
  createdAt: any;
}

export type OpportunityStatus = "active" | "closed" | "expired";
export type OpportunityUrgency = "normal" | "soon" | "urgent";

/** Public request for help. Contact details are intentionally limited to the
 * WhatsApp number the author chose to publish with this opportunity. */
export interface Opportunity {
  id?: string;
  authorId: string;
  authorName: string;
  authorWhatsApp: string;
  category: string;
  title: string;
  description: string;
  city: string;
  neighborhood: string;
  state: string;
  urgency?: OpportunityUrgency;
  status: OpportunityStatus;
  createdAt: any;
  expiresAt: any;
  closedAt?: any;
  reactivatedAt?: any;
  receivedResponse?: boolean;
  platformSatisfied?: boolean;
  followUpAnsweredAt?: any;
  followUpNotifiedAt?: any;
}

export interface UserNotification {
  id: string;
  type: "opportunity_match" | "opportunity_follow_up";
  title: string;
  message: string;
  opportunityId: string;
  read: boolean;
  createdAt: any;
}
