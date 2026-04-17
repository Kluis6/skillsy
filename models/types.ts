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
  phones?: string[];
  ward?: string;
  companyName?: string;
  gallery?: string[];
  rating?: number;
  reviewCount?: number;
  experienceYears?: number;
  baptismYear?: number;
  availability?: string[];
  serviceHours?: string;
  verifiedMember?: boolean;
  isBlocked?: boolean;
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
