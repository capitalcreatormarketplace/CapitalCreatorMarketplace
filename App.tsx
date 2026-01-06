
import React, { useState, useEffect, useCallback } from 'react';
import Layout from './components/Layout';
import Marketplace from './components/Marketplace';
import ProfileSetup from './components/ProfileSetup';
import { UserProfile, UserRole, InventoryItem, SponsorApplication, SponsorStatus } from './types';
import { connectWallet, processPayment } from './services/solana';
import { optimizeListingDescription } from './services/gemini';

const INITIAL_ITEMS: InventoryItem[] = [
  {
    id: 'inv_1',
    creatorAddress: '8x8j...',
    creatorName: 'ChartMaster',
    streamTime: 'Monday July 13th 2pm - 4pm',
    placementDetail: 'Crypto podcast',
    priceSol: 4.5,
    sold: false,
    platform: 'YouTube',
    thumbnailUrl: 'https://images.unsplash.com/photo-1640340434855-6084b1f4901c?q=80&w=800&auto=format&fit=crop',
    adPosition: 'bottom-left'
  },
  {
    id: 'inv_2',
    creatorAddress: '4y9k...',
    creatorName: 'The Paul Show',
    streamTime: 'Monday July 13th 2pm - 4pm',
    placementDetail: 'Crypto podcast',
    priceSol: 12.0,
    sold: false,
    platform: 'X',
    thumbnailUrl: 'https://images.unsplash.com/photo-1593340073024-d0f91373ec36?q=80&w=800&auto=format&fit=crop',
    adPosition: 'top-right'
  },
  {
    id: 'inv_3',
    creatorAddress: '7u2p...',
    creatorName: 'Discover Crypto',
    streamTime: 'Monday July 13th 2pm - 4pm',
    placementDetail: 'Crypto podcast',
    priceSol: 8.2,
    sold: false,
    platform: 'YouTube',
    thumbnailUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=800&auto=format&fit=crop',
    adPosition: 'bottom-right'
  },
  {
    id: 'inv_4',
    creatorAddress: '9l1m...',
    creatorName: 'Altcoin Daily',
    streamTime: 'Monday July 13th 2pm - 4pm',
    placementDetail: 'Crypto podcast',
    priceSol: 15.5,
    sold: false,
    platform: 'YouTube',
    thumbnailUrl: 'https://images.unsplash.com/photo-1551817958-c115383e9c2e?q=80&w=800&auto=format&fit=crop',
    adPosition: 'bottom-left'
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
          role: UserRole.UNDEFINED
        });
        setCurrentView('profile');
      }
    }
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
    setIsProcessing(true);
    
    const optimized = await optimizeListingDescription(data.streamTime, data.placementDetail, data.platform);
    
    const newItem: InventoryItem = {
      id: `inv_${Math.random().toString(36).substr(2, 9)}`,
      creatorAddress: profile.address,
      creatorName: profile.name,
      streamTime: data.streamTime,
      placementDetail: optimized,
      priceSol: data.priceSol,
      sold: false,
      platform: data.platform,
      thumbnailUrl: 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=800&auto=format&fit=crop',
      adPosition: 'bottom-right'
    };

    setInventory([newItem, ...inventory]);
    setProfile({ ...profile, role: UserRole.CREATOR });
    setIsProcessing(false);
    setCurrentView('marketplace');
  };

  const handlePurchase = async (item: InventoryItem) => {
    if (!walletAddress) {
      handleConnect();
      return;
    }
    setIsProcessing(true);
    try {
      const result = await processPayment(item.creatorAddress, item.priceSol);
      if (result.success) {
        setInventory(prev => prev.map(inv => inv.id === item.id ? { ...inv, sold: true } : inv));
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
        <div className="py-12 md:py-16 text-center space-y-10 animate-fadeIn relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1px] h-12 bg-gradient-to-b from-transparent to-white/20"></div>
          
          <div className="space-y-4 pt-4 max-w-[95vw] mx-auto overflow-hidden px-4">
            <h1 className="flex flex-col text-3xl md:text-5xl lg:text-[4.9rem] font-black uppercase tracking-tighter leading-[1.0] font-mono text-center">
              <span className="text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.2)] whitespace-nowrap">
                CREATOR REWARDS DONE RIGHT.
              </span>
              <span className="text-zinc-500 transition-colors hover:text-zinc-400 duration-1000 whitespace-nowrap mt-2">
                MARKETING THAT ACTUALLY WORKS.
              </span>
            </h1>
          </div>
          
          <div className="flex flex-col items-center justify-center pt-2">
            <button 
              onClick={() => setCurrentView('marketplace')}
              className="group relative bg-white text-black px-16 py-6 font-black uppercase tracking-[0.2em] hover:bg-black hover:text-white transition-all duration-300 text-xl overflow-hidden border border-white"
            >
              <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-black group-hover:border-white m-2"></div>
              <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-black group-hover:border-white m-2"></div>
              ENTER MARKETPLACE
            </button>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-10 md:gap-16 max-w-6xl mx-auto pt-16 group">
             <div className="text-center transition-all duration-500 w-60">
               <p className="text-[14px] font-black uppercase tracking-[0.45em] text-[#F1EBD9] mb-2 font-mono drop-shadow-[0_0_12px_rgba(241,235,217,0.6)]">CREATORS EARN</p>
               <div className="w-full h-[2px] bg-[#F1EBD9] drop-shadow-[0_0_5px_rgba(241,235,217,0.8)]"></div>
             </div>
             <div className="text-center transition-all duration-500 w-60">
               <p className="text-[14px] font-black uppercase tracking-[0.45em] text-[#F1EBD9] mb-2 font-mono drop-shadow-[0_0_12px_rgba(241,235,217,0.6)]">PROJECTS BRAND</p>
               <div className="w-full h-[2px] bg-[#F1EBD9] drop-shadow-[0_0_5px_rgba(241,235,217,0.8)]"></div>
             </div>
             <div className="text-center transition-all duration-500 w-60">
               <p className="text-[14px] font-black uppercase tracking-[0.45em] text-[#F1EBD9] mb-2 font-mono drop-shadow-[0_0_12px_rgba(241,235,217,0.6)]">BUILD TOGETHER</p>
               <div className="w-full h-[2px] bg-[#F1EBD9] drop-shadow-[0_0_5px_rgba(241,235,217,0.8)]"></div>
             </div>
          </div>
        </div>
      );
    }

    if (currentView === 'marketplace') {
      return (
        <Marketplace 
          items={inventory} 
          sponsorStatus={sponsorApp?.status || SponsorStatus.NONE}
          onPurchase={handlePurchase}
          loading={isProcessing}
        />
      );
    }

    if (currentView === 'profile' && profile) {
      return (
        <ProfileSetup 
          profile={profile} 
          sponsorApp={sponsorApp}
          onSaveProfile={handleSaveProfile}
          onApplySponsor={handleApplySponsor}
          onListInventory={handleListInventory}
        />
      );
    }

    if (currentView === 'documents') {
      return (
        <div className="py-32 text-center animate-fadeIn max-w-2xl mx-auto space-y-12">
           <h2 className="text-5xl font-black uppercase tracking-[0.3em] font-mono">DOCUMENTS_01</h2>
           <div className="w-full h-px bg-white/10"></div>
           <p className="text-zinc-500 leading-relaxed font-mono text-sm tracking-widest text-justify">
             CAPITAL CREATOR technical documentation is currently being compiled into a comprehensive whitepaper [v1.0]. 
             <br /><br />
             PROTOCOL_DETAILS:
             - inventory_settlement_layer (active)
             - fee_distribution_arch (10% split)
             - solana_program_id (pending_mainnet)
           </p>
           <div className="pt-8">
             <button onClick={() => setCurrentView('home')} className="text-[10px] uppercase tracking-[0.5em] text-zinc-500 hover:text-white transition-colors border-b border-zinc-800 pb-1 font-mono">EXIT_TO_TERMINAL</button>
           </div>
        </div>
      );
    }

    return null;
  };

  return (
    <Layout 
      walletAddress={walletAddress} 
      onConnect={handleConnect} 
      onNavigate={(v: any) => setCurrentView(v)}
      currentView={currentView}
    >
      {renderView()}
    </Layout>
  );
};

export default App;
