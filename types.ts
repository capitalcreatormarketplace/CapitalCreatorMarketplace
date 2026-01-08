
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

export enum ItemStatus {
  AVAILABLE = 'AVAILABLE',
  SOLD = 'SOLD',
  EXPIRED = 'EXPIRED'
}

export interface UserNotification {
  id: string;
  message: string;
  timestamp: number;
  read: boolean;
}

export interface UserProfile {
  address: string;
  name: string;
  bio: string;
  role: UserRole;
  avatarUrl?: string;
  platforms?: string[];
  channelLink?: string;
  xHandle?: string;
  isXVerified?: boolean;
  niche?: string;
  timezone?: string;
  schedule?: string;
  revenueEarned?: number;
  timesHired?: number;
  avgAudienceSize?: number;
  notifications?: UserNotification[];
}

export interface SponsorApplication {
  name: string;
  companyName: string;
  monthsInBusiness: number;
  logoUrl: string;
  status: SponsorStatus;
}

export type AdPosition = 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';

export interface InventoryItem {
  id: string;
  creatorAddress: string;
  creatorName: string;
  streamTime: string;
  timestamp: number;
  placementDetail: string;
  priceSol: number; 
  status: ItemStatus;
  platforms: string[];
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
