
export enum UserRole {
  UNDEFINED = 'UNDEFINED',
  CREATOR = 'CREATOR',
  SPONSOR = 'SPONSOR'
}

export enum SponsorStatus {
  NONE = 'NONE',
  PENDING = 'PENDING',
  APPROVED = 'APPROVED'
}

export enum ContentCategory {
  CRYPTO = 'CRYPTO',
  GAMING = 'GAMING',
  JUST_CHATTING = 'JUST CHATTING',
  FINANCE = 'FINANCE',
  TECH = 'TECH',
  LIFESTYLE = 'LIFESTYLE',
  MUSIC = 'MUSIC',
  ENTERTAINMENT = 'ENTERTAINMENT'
}

export interface UserProfile {
  address: string;
  name: string;
  bio: string;
  role: UserRole;
  avatarUrl?: string;
  email?: string;
  // New Brand/Creator Fields
  platforms?: string[]; // Array for multi-platform support
  channelLink?: string;
  xHandle?: string;      // New field for verified X handle
  isXVerified?: boolean; // New field for verification status
  niche?: string;
  timezone?: string;
  schedule?: string;
  // Creator Metrics
  revenueEarned?: number;
  timesHired?: number;
  avgAudienceSize?: number;
}

export interface SponsorApplication {
  name: string;
  companyName: string;
  monthsInBusiness: number;
  logoUrl: string;
  status: SponsorStatus;
}

export type AdPosition = 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';

export enum ItemStatus {
  AVAILABLE = 'AVAILABLE',
  SOLD = 'SOLD',
  EXPIRED = 'EXPIRED',
}

export interface InventoryItem {
  id: string;
  creatorAddress: string;
  creatorName: string;
  streamTime: string; // Display string
  timestamp: number;   // For filtering logic
  placementDetail: string;
  priceSol: number; 
  status: ItemStatus;
  platforms: string[]; // Array for multi-platform support
  category: ContentCategory;
  thumbnailUrl: string;
  adPosition: AdPosition;
  creatorRevenue?: number;
  creatorHires?: number;
  creatorAvgAudience?: number;
}

export interface TransactionResult {
  signature: string;
  success: boolean;
}