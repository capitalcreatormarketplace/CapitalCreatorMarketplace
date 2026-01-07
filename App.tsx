
import React, { useState } from 'react';
import Layout from './components/Layout';
import Marketplace from './components/Marketplace';
import ProfileSetup from './components/ProfileSetup';
import { UserProfile, UserRole, InventoryItem, SponsorApplication, SponsorStatus, ContentCategory } from './types';
import { connectWallet, processPayment, disconnectWallet } from './services/solana';
// Fix: Import Icons from constants to provide access to navigation and step icons
import { Icons } from './constants';

const INITIAL_ITEMS: InventoryItem[] = [
  {
    id: 'inv_1',
    creatorAddress: '8x8j...',
    creatorName: 'CHARTMASTER',
    streamTime: 'Monday July 13th 2pm - 4pm',
    timestamp: new Date('2026-07-13T14:00:00').getTime(),
    placementDetail: 'High Alpha Crypto Podcast Spot. We integrate your logo directly into the stream feed with a pinned link in live chat. Audience is 90% male, interested in high-risk DeFi assets.',
    priceSol: 450,
    sold: false,
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
    sold: false,
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
    sold: false,
    platforms: ['Kick', 'X'],
    category: ContentCategory.JUST_CHATTING,
    thumbnailUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=800&auto=format&fit=crop',
    adPosition: 'bottom-right',
    creatorRevenue: 34000,
    creatorHires: 28,
    creatorAvgAudience: 22000
  }
];

const App: React.FC = () => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<'home' | 'marketplace' | 'profile' | 'documents'>('home');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [sponsorApp, setSponsorApp] = useState<SponsorApplication | undefined>();
  const [inventory, setInventory] = useState<InventoryItem[]>(INITIAL_ITEMS);
  const [isProcessing, setIsProcessing] = useState(false);

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
          platforms: []
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
    const newApp = { ...app, status: SponsorStatus.PENDING };
    setSponsorApp(newApp);
    setTimeout(() => {
      setSponsorApp(prev => prev ? { ...prev, status: SponsorStatus.APPROVED } : undefined);
      setProfile(prev => prev ? { ...prev, role: UserRole.SPONSOR } : null);
    }, 8000);
  };

  const handleListInventory = async (data: any) => {
    if (!profile) return;
    
    const dateObj = new Date(data.streamTime);
    const displayTime = dateObj.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric', 
      hour: 'numeric', 
      minute: '2-digit' 
    });

    const newItem: InventoryItem = {
      id: `inv_${Math.random().toString(36).substr(2, 9)}`,
      creatorAddress: profile.address,
      creatorName: profile.name.toUpperCase(),
      streamTime: displayTime,
      timestamp: dateObj.getTime(),
      placementDetail: data.placementDetail,
      priceSol: data.priceSol,
      sold: false,
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
    if (!walletAddress) {
      alert('Please connect your wallet to make a purchase.');
      return;
    }
    
    setIsProcessing(true);
    try {
      const result = await processPayment(item.creatorAddress, item.priceSol);
      if (result.success) {
        setInventory(prevInventory => 
          prevInventory.map(inv => {
            if (inv.creatorAddress === item.creatorAddress) {
              const updatedInv = {
                ...inv,
                creatorHires: (inv.creatorHires || 0) + 1,
                creatorRevenue: (inv.creatorRevenue || 0) + item.priceSol,
              };
              if (inv.id === item.id) {
                updatedInv.sold = true;
              }
              return updatedInv;
            }
            return inv;
          })
        );

        if (profile && profile.address === item.creatorAddress) {
          setProfile(p => p ? {
            ...p,
            revenueEarned: (p.revenueEarned || 0) + item.priceSol,
            timesHired: (p.timesHired || 0) + 1,
          } : null);
        }

        alert(`Purchase Successful!\nSignature: ${result.signature}\n90% routed to creator, 10% to treasury.`);
      }
    } catch (error) {
      console.error(error);
      alert("Payment failed. Please check your wallet.");
    } finally {
      setIsProcessing(false);
    }
  };

  const renderView = () => {
    if (currentView === 'home') {
      return (
        <>
          <div className="py-24 md:py-32 text-center space-y-20 animate-fadeIn relative overflow-visible">
            <div className="space-y-4 max-w-[100vw] mx-auto px-4 overflow-hidden">
              <h1 className="flex flex-col uppercase text-center font-['Bebas_Neue'] tracking-[-0.02em] leading-[0.95]">
                <span className="text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.2)] text-[clamp(2.15rem,7.35vw,7.35rem)]">
                  CREATOR REWARDS DONE RIGHT
                </span>
                <span className="bg-gradient-to-r from-[#BF953F] via-[#FCF6BA] to-[#B38728] bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(212,175,55,0.4)] mt-2 text-[clamp(2.15rem,7.35vw,7.35rem)] hover:brightness-125 transition-all duration-500 cursor-default">
                  MARKETING THAT ACTUALLY WORKS
                </span>
              </h1>
            </div>
            
            <div className="flex flex-col items-center justify-center pt-4">
              <button onClick={() => setCurrentView('marketplace')} className="group relative bg-white text-black px-20 py-8 font-black uppercase tracking-[0.3em] hover:bg-black hover:text-white transition-all duration-500 text-[1rem] overflow-hidden border border-white">
                <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-black group-hover:border-white m-1"></div>
                <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-black group-hover:border-white m-1"></div>
                ENTER <span className="bg-gradient-to-r from-[#BF953F] via-[#B38728] to-[#8A6E2F] bg-clip-text text-transparent inline-block drop-shadow-[0_0_1px_rgba(0,0,0,0.2)]">MARKETPLACE</span>
              </button>
            </div>

            <div className="flex flex-wrap justify-center items-center gap-10 md:gap-14 max-w-6xl mx-auto pt-16 group">
               {['CREATORS EARN', 'PROJECTS BRAND', 'BUILD TOGETHER'].map(text => (
                  <div key={text} className="text-center transition-all duration-500 w-56">
                    <p className="text-[10px] font-black uppercase tracking-[0.45em] text-[#F1EBD9] mb-3 drop-shadow-[0_0_8px_rgba(241,235,217,0.6)]">{text}</p>
                    <div className="w-full h-[1px] bg-[#F1EBD9]/30 drop-shadow-[0_0_3px_rgba(241,235,217,0.8)]"></div>
                  </div>
               ))}
            </div>
          </div>

          <div className="py-20 md:py-32 space-y-24 animate-fadeIn">
            <div className="space-y-12">
              <div className="text-center space-y-2 max-w-2xl mx-auto">
                <p className="text-zinc-500 text-[10px] font-black tracking-[0.5em] uppercase">The Protocol</p>
                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-white">A Frictionless, On-Chain Workflow</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 text-center md:text-left pt-12">
                <div className="relative border-t border-white/10 pt-8 space-y-4 px-4">
                  <div className="flex items-center gap-4 justify-center md:justify-start">
                    <div className="text-white/40"><Icons.Connect /></div>
                    <h3 className="text-lg font-bold uppercase tracking-wider">Connect & Profile</h3>
                  </div>
                  <p className="text-zinc-400 text-sm leading-relaxed max-w-xs mx-auto md:mx-0">
                    Your Solana wallet is your passport. No emails, no passwords. Build your creator or sponsor profile in minutes.
                  </p>
                </div>
                <div className="relative border-t border-white/10 pt-8 space-y-4 px-4">
                  <div className="flex items-center gap-4 justify-center md:justify-start">
                    <div className="text-white/40"><Icons.Discover /></div>
                    <h3 className="text-lg font-bold uppercase tracking-wider">List & Discover</h3>
                  </div>
                  <p className="text-zinc-400 text-sm leading-relaxed max-w-xs mx-auto md:mx-0">
                    Creators list ad inventory in a real-time terminal. Sponsors filter by category and platform to find the perfect fit.
                  </p>
                </div>
                <div className="relative border-t border-white/10 pt-8 space-y-4 px-4">
                  <div className="flex items-center gap-4 justify-center md:justify-start">
                    <div className="text-white/40"><Icons.Transact /></div>
                    <h3 className="text-lg font-bold uppercase tracking-wider">Settle Instantly</h3>
                  </div>
                  <p className="text-zinc-400 text-sm leading-relaxed max-w-xs mx-auto md:mx-0">
                    Sponsors purchase with a 'Buy It Now' transaction. Payments split instantly on-chain: 90% to creator, 10% to treasury.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      );
    }
    if (currentView === 'marketplace') return <Marketplace items={inventory} sponsorStatus={sponsorApp?.status || SponsorStatus.NONE} onPurchase={handlePurchase} loading={isProcessing} />;
    if (currentView === 'profile' && profile) return <ProfileSetup profile={profile} sponsorApp={sponsorApp} onSaveProfile={handleSaveProfile} onApplySponsor={handleApplySponsor} onListInventory={handleListInventory} />;
    if (currentView === 'documents') return (
      <div className="py-28 text-center animate-fadeIn max-w-2xl mx-auto space-y-10">
         <h2 className="text-4xl font-black uppercase tracking-[0.3em]">DOCUMENTS</h2>
         <div className="w-full h-px bg-white/10"></div>
         <p className="text-zinc-500 leading-relaxed text-[12.2px] tracking-widest text-justify">
           CAPITAL CREATOR technical documentation is currently being compiled into a comprehensive whitepaper version 1.0. Protocol settlement via USDC on Solana.
         </p>
         <div className="pt-8"><button onClick={() => setCurrentView('home')} className="text-[9.4px] uppercase tracking-[0.5em] text-zinc-500 hover:text-white transition-colors border-b border-zinc-800 pb-1">EXIT TO TERMINAL</button></div>
      </div>
    );
    return null;
  };

  return <Layout walletAddress={walletAddress} onConnect={handleConnect} onDisconnect={handleDisconnect} onNavigate={(v: any) => setCurrentView(v)} currentView={currentView}>{renderView()}</Layout>;
};

export default App;
