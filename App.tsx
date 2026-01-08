
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Marketplace from './components/Marketplace';
import ProfileSetup from './components/ProfileSetup';
import { UserProfile, UserRole, InventoryItem, SponsorApplication, SponsorStatus, ContentCategory, ItemStatus, UserNotification } from './types';
import { connectWallet, processPayment, disconnectWallet } from './services/solana';
import { Icons } from './constants';

const INITIAL_ITEMS: InventoryItem[] = [
  {
    id: 'inv_1',
    creatorAddress: '8x8j...',
    creatorName: 'CHARTMASTER',
    streamTime: 'Monday July 13th 2pm - 4pm',
    timestamp: new Date('2026-07-13T14:00:00').getTime(),
    placementDetail: 'High Alpha Crypto Podcast Spot. We integrate your logo directly into the stream feed with a pinned link in live chat.',
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
    placementDetail: 'Premium Overlay Placement on 4K Stream. Your brand will be featured during competitive play sessions.',
    priceSol: 1200,
    status: ItemStatus.AVAILABLE,
    platforms: ['Twitch', 'YouTube', 'Kick'],
    category: ContentCategory.GAMING,
    thumbnailUrl: 'https://images.unsplash.com/photo-1593340073024-d0f91373ec36?q=80&w=800&auto=format&fit=crop',
    adPosition: 'top-right',
    creatorRevenue: 85000,
    creatorHires: 112,
    creatorAvgAudience: 45000
  }
];

const App: React.FC = () => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<'home' | 'marketplace' | 'profile' | 'documents'>('home');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [sponsorApp, setSponsorApp] = useState<SponsorApplication | undefined>();
  const [inventory, setInventory] = useState<InventoryItem[]>(INITIAL_ITEMS);
  const [isProcessing, setIsProcessing] = useState(false);

  // Expiration Logic Loop: Run every 10 seconds to check for expired listings
  useEffect(() => {
    const checkExpiration = () => {
      const now = Date.now();
      setInventory(prev => prev.map(item => {
        if (item.status === ItemStatus.AVAILABLE && now >= item.timestamp) {
          return { ...item, status: ItemStatus.EXPIRED };
        }
        return item;
      }));
    };

    const interval = setInterval(checkExpiration, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleConnect = async () => {
    const addr = await connectWallet();
    if (addr) {
      setWalletAddress(addr);
      if (!profile) {
        setProfile({
          address: addr,
          name: '',
          bio: '',
          role: UserRole.UNDEFINED,
          revenueEarned: 0,
          timesHired: 0,
          avgAudienceSize: 0,
          platforms: [],
          notifications: []
        });
        setCurrentView('profile');
      }
    }
  };

  const handleDisconnect = async () => {
    await disconnectWallet();
    window.location.reload();
  };

  const handleSaveProfile = (updatedProfile: UserProfile) => {
    setProfile(updatedProfile);
  };

  const handleApplySponsor = (app: SponsorApplication) => {
    setSponsorApp({ ...app, status: SponsorStatus.PENDING });
    setTimeout(() => {
      setSponsorApp(prev => prev ? { ...prev, status: SponsorStatus.APPROVED } : undefined);
      setProfile(prev => prev ? { ...prev, role: UserRole.SPONSOR } : null);
    }, 5000);
  };

  const handleListInventory = async (data: any) => {
    if (!profile) return;
    const dateObj = new Date(data.streamTime);
    const displayTime = dateObj.toLocaleDateString('en-US', { 
      weekday: 'long', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit' 
    });

    const newItem: InventoryItem = {
      id: `inv_${Math.random().toString(36).substr(2, 9)}`,
      creatorAddress: profile.address,
      creatorName: profile.name.toUpperCase(),
      streamTime: displayTime,
      timestamp: dateObj.getTime(),
      placementDetail: data.placementDetail,
      priceSol: data.priceSol,
      status: ItemStatus.AVAILABLE,
      platforms: data.platforms || [],
      category: data.category,
      thumbnailUrl: data.streamPreviewUrl || 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=800&auto=format&fit=crop',
      adPosition: data.adPosition || 'bottom-right',
      creatorRevenue: profile.revenueEarned,
      creatorHires: profile.timesHired,
      creatorAvgAudience: profile.avgAudienceSize
    };

    setInventory([newItem, ...inventory]);
    setProfile({ ...profile, role: UserRole.CREATOR });
    setCurrentView('marketplace');
  };

  const handlePurchase = async (item: InventoryItem) => {
    if (!walletAddress) return alert('Connect wallet.');
    setIsProcessing(true);
    try {
      const result = await processPayment(item.creatorAddress, item.priceSol);
      if (result.success) {
        setInventory(prev => prev.map(inv => {
          if (inv.id === item.id) return { ...inv, status: ItemStatus.SOLD };
          return inv;
        }));

        // Notification for the seller
        const newNotification: UserNotification = {
          id: `notif_${Date.now()}`,
          message: `SYSTEM ALERT: Inventory spot bought by Sponsor for $${item.priceSol} USDC.`,
          timestamp: Date.now(),
          read: false
        };

        if (profile && profile.address === item.creatorAddress) {
          setProfile(p => p ? {
            ...p,
            revenueEarned: (p.revenueEarned || 0) + item.priceSol,
            timesHired: (p.timesHired || 0) + 1,
            notifications: [newNotification, ...(p.notifications || [])]
          } : null);
        }

        alert(`Purchase Successful! 90% routed to creator, 10% to treasury.`);
      }
    } catch (e) {
      alert("Payment failed.");
    } finally {
      setIsProcessing(false);
    }
  };

  const renderView = () => {
    if (currentView === 'home') {
      return (
        <div className="py-24 md:py-32 text-center space-y-20 animate-fadeIn relative">
          <div className="space-y-4">
            <h1 className="flex flex-col uppercase text-center font-['Bebas_Neue'] tracking-[-0.02em] leading-[0.95]">
              <span className="text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.2)] text-[clamp(1.8rem,6.15vw,6.15rem)]">
                CREATOR REWARDS DONE RIGHT
              </span>
              <span className="bg-gradient-to-r from-[#BF953F] via-[#FCF6BA] to-[#B38728] bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(212,175,55,0.4)] mt-2 text-[clamp(1.8rem,6.15vw,6.15rem)]">
                MARKETING THAT ACTUALLY WORKS
              </span>
            </h1>
          </div>
          <button onClick={() => setCurrentView('marketplace')} className="group relative bg-white text-black px-20 py-8 font-black uppercase tracking-[0.3em] hover:bg-black hover:text-white transition-all duration-500 text-[1rem] border border-white">
            ENTER MARKETPLACE
          </button>
        </div>
      );
    }
    if (currentView === 'marketplace') return <Marketplace items={inventory} sponsorStatus={sponsorApp?.status || SponsorStatus.NONE} onPurchase={handlePurchase} loading={isProcessing} />;
    if (currentView === 'profile' && profile) return <ProfileSetup profile={profile} sponsorApp={sponsorApp} onSaveProfile={handleSaveProfile} onApplySponsor={handleApplySponsor} onListInventory={handleListInventory} />;
    if (currentView === 'documents') return (
      <div className="py-28 text-center animate-fadeIn max-w-2xl mx-auto space-y-10">
         <h2 className="text-4xl font-black uppercase tracking-[0.3em]">DOCUMENTS</h2>
         <p className="text-zinc-500 tracking-widest text-justify">Whitepaper v1.0. Settlement on Solana.</p>
         <button onClick={() => setCurrentView('home')} className="text-[9.4px] uppercase tracking-[0.5em] text-zinc-500 border-b border-zinc-800 pb-1">EXIT</button>
      </div>
    );
    return null;
  };

  return <Layout walletAddress={walletAddress} onConnect={handleConnect} onDisconnect={handleDisconnect} onNavigate={(v: any) => setCurrentView(v)} currentView={currentView}>{renderView()}</Layout>;
};

export default App;
