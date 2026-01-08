import { InventoryItem, ItemStatus, ContentCategory } from '../types';

// This file simulates a backend API response for initial data loading.
// In a real application, this data would come from a database.

export const INITIAL_ITEMS: InventoryItem[] = [
  {
    id: 'inv_1',
    creatorAddress: '8x8j...',
    creatorName: 'CHARTMASTER',
    streamTime: 'Monday July 13th 2pm - 4pm',
    timestamp: new Date('2026-07-13T14:00:00').getTime(),
    placementDetail: 'High Alpha Crypto Podcast Spot. We integrate your logo directly into the stream feed with a pinned link in live chat. Audience is 90% male, interested in high-risk DeFi assets.',
    priceSol: 450,
    status: ItemStatus.AVAILABLE,
    platforms: ['YouTube', 'X'],
    category: ContentCategory.CRYPTO,
    thumbnailUrl: 'https://images.unsplash.com/photo-1640340434855-6084b1f4901c?q=80&w=800&auto=format&fit=crop',
    adPosition: 'bottom-left',
    creatorRevenue: 12500,
    creatorHires: 42,
    creatorAvgAudience: 15000
  },
  {
    id: 'inv_2',
    creatorAddress: '4y9k...',
    creatorName: 'NINJA CLONE',
    streamTime: 'Tuesday July 14th 6pm - 8pm',
    timestamp: new Date('2026-07-14T18:00:00').getTime(),
    placementDetail: 'Premium Overlay Placement on 4K Stream. Your brand will be featured during competitive play sessions. Guaranteed shoutouts every 30 minutes.',
    priceSol: 1200,
    status: ItemStatus.AVAILABLE,
    platforms: ['Twitch', 'YouTube', 'Kick'],
    category: ContentCategory.GAMING,
    thumbnailUrl: 'https://images.unsplash.com/photo-1593340073024-d0f91373ec36?q=80&w=800&auto=format&fit=crop',
    adPosition: 'top-right',
    creatorRevenue: 85000,
    creatorHires: 112,
    creatorAvgAudience: 45000
  },
  {
    id: 'inv_3',
    creatorAddress: '7u2p...',
    creatorName: 'JUST CHATTY',
    streamTime: 'Wednesday July 15th 1pm - 3pm',
    timestamp: new Date('2026-07-15T13:00:00').getTime(),
    placementDetail: 'Mid Roll Shoutout and Dynamic Banner. I discuss community news and interact with viewers personally. High trust factor with audience.',
    priceSol: 820,
    status: ItemStatus.AVAILABLE,
    platforms: ['Kick', 'X'],
    category: ContentCategory.JUST_CHATTING,
    thumbnailUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=800&auto=format&fit=crop',
    adPosition: 'bottom-right',
    creatorRevenue: 34000,
    creatorHires: 28,
    creatorAvgAudience: 22000
  },
];
