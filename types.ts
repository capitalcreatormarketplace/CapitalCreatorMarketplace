
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

export interface UserProfile {
  address: string;
  name: string;
  bio: string;
  role: UserRole;
  avatarUrl?: string;
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

export type AdPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';

export interface InventoryItem {
  id: string;
  creatorAddress: string;
  creatorName: string;
  streamTime: string;
  placementDetail: string;
  priceSol: number;
  sold: boolean;
  platform: 'Twitch' | 'YouTube' | 'Kick' | 'X';
  thumbnailUrl: string;
  adPosition: AdPosition;
  // Stats inherited from creator at listing time
  creatorRevenue?: number;
  creatorHires?: number;
  creatorAvgAudience?: number;
}

export interface TransactionResult {
  signature: string;
  success: boolean;
}
