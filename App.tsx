
import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import Layout from './components/Layout';
import Marketplace from './components/Marketplace';
import ProfileSetup from './components/ProfileSetup';
import { UserProfile, UserRole, InventoryItem, SponsorApplication, SponsorStatus, ItemStatus } from './types';
import { processPayment } from './services/solana';
import { sendPurchaseNotification } from './services/email';
import { optimizeListingDescription } from './services/gemini';

// NOTE: All data is now fetched from placeholder API endpoints.
// The app is now backend-ready.

const App: React.FC = () => {
  const wallet = useWallet();
  const [currentView, setCurrentView] = useState<'home' | 'marketplace' | 'profile' | 'documents'>('home');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [sponsorApp, setSponsorApp] = useState<SponsorApplication | undefined>();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch all inventory items on initial load
  useEffect(() => {
    const fetchInventory = async () => {
      try {
        // In a real app, this would be a call to your backend API
        // const response = await fetch('/api/inventory');
        // const data = await response.json();
        // setInventory(data);
        console.log("Fetching inventory from backend...");
        // For demonstration, we'll simulate a network delay and load initial items
        await new Promise(res => setTimeout(res, 1000));
        // This is a placeholder for your real API call
        const { INITIAL_ITEMS } = await import('./services/mockApi');
        setInventory(INITIAL_ITEMS);
      } catch (error) {
        console.error("Failed to fetch inventory:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInventory();
  }, []);
  
  // Fetch user profile when wallet connects
  useEffect(() => {
    const fetchProfile = async (address: string) => {
      try {
        // const response = await fetch(`/api/profile/${address}`);
        // if (response.ok) {
        //   const data = await response.json();
        //   setProfile(data);
        // } else if (response.status === 404) {
          // If profile doesn't exist, create a new one for setup
          console.log("No profile found for this wallet, initializing setup.");
          setProfile({
            address, name: '', bio: '', email: '', role: UserRole.UNDEFINED,
          });
          setCurrentView('profile');
        // }
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      }
    };

    if (wallet.publicKey) {
      const address = wallet.publicKey.toBase58();
      fetchProfile(address);
    } else {
      // Reset profile when wallet disconnects
      setProfile(null);
    }
  }, [wallet.publicKey]);

  // Check for expired items periodically
  useEffect(() => {
    const checkExpiredItems = () => {
      const now = Date.now();
      setInventory(prev =>
        prev.map(item =>
          item.status === ItemStatus.AVAILABLE && item.timestamp < now
            ? { ...item, status: ItemStatus.EXPIRED }
            : item
        )
      );
    };
    const intervalId = setInterval(checkExpiredItems, 60000);
    return () => clearInterval(intervalId);
  }, []);

  const handleSaveProfile = async (updatedProfile: UserProfile) => {
    try {
      // In a real app, you would POST this to your backend
      // await fetch('/api/profile', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(updatedProfile),
      // });
      console.log("Saving profile to backend:", updatedProfile);
      setProfile(updatedProfile);
      setCurrentView('marketplace'); // Navigate after saving
    } catch (error) {
      console.error("Failed to save profile:", error);
      alert("Could not save profile. Please try again.");
    }
  };

  const handleApplySponsor = async (app: SponsorApplication) => {
    // This would also be a backend call
    console.log("Submitting sponsor application:", app);
    const newApp = { ...app, status: SponsorStatus.PENDING };
    setSponsorApp(newApp);
    // Simulate backend approval process
    setTimeout(() => {
      setSponsorApp(prev => prev ? { ...prev, status: SponsorStatus.APPROVED } : undefined);
      setProfile(prev => prev ? { ...prev, role: UserRole.SPONSOR } : null);
    }, 4000);
  };

  const handleListInventory = async (data: any) => {
    if (!profile) return;
    
    // This is now a fully backend-driven action
    try {
      // const response = await fetch('/api/inventory', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ ...data, creatorAddress: profile.address, creatorName: profile.name }),
      // });
      // const newItem = await response.json();
      
      console.log("Listing new inventory via backend:", data);
      
      // Simulate backend response
      const dateObj = new Date(data.streamTime);
      const newItem = {
        id: `inv_${Math.random().toString(36).substr(2, 9)}`,
        creatorAddress: profile.address,
        creatorName: profile.name.toUpperCase(),
        streamTime: dateObj.toLocaleString(),
        timestamp: dateObj.getTime(),
        ...data
      };
      // ---

      setInventory([newItem, ...inventory]);
      setProfile({ ...profile, role: UserRole.CREATOR });
      setCurrentView('marketplace');
    } catch (error) {
      console.error("Failed to list inventory:", error);
      alert("Could not list inventory. Please try again.");
    }
  };

  const handlePurchase = async (item: InventoryItem) => {
    if (!wallet.publicKey || !wallet.sendTransaction || !profile) {
      alert('Please connect your wallet and complete your profile to purchase.');
      return;
    }
    
    setIsProcessing(true);
    try {
      const result = await processPayment(wallet, item.creatorAddress, item.priceSol);
      if (result.success) {
        // After successful payment, update state and notify backend
        // In a real app, this state update might come from a WebSocket or re-fetching data
        setInventory(prev => prev.map(inv => inv.id === item.id ? { ...inv, status: ItemStatus.SOLD } : inv));

        // Let the backend know to send notifications etc.
        // await fetch('/api/purchase/complete', { method: 'POST', ... });
        await sendPurchaseNotification(
          { address: item.creatorAddress, name: item.creatorName, email: 'creator@example.com', role: UserRole.CREATOR, bio:'' }, // This creator data would come from backend
          profile,
          item
        );

        alert(`Purchase Successful! A notification has been sent to the creator.\nSignature: ${result.signature}`);
      } else {
        throw new Error(result.signature || "Transaction failed for an unknown reason.");
      }
    } catch (error: any) {
      console.error(error);
      alert(`Payment failed: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const renderView = () => {
    if (isLoading && currentView !== 'home') {
       return <div className="py-40 text-center text-zinc-500 text-sm font-bold tracking-widest uppercase">LOADING TERMINAL...</div>;
    }

    if (currentView === 'home') {
      return (
        // Home content remains largely the same
        <>
          <div className="py-24 md:py-32 text-center space-y-20 animate-fadeIn relative overflow-visible">
            <div className="space-y-4 max-w-[100vw] mx-auto px-4 overflow-hidden">
              <h1 className="flex flex-col uppercase text-center font-['Bebas_Neue'] tracking-[-0.02em] leading-[0.95]">
                <span className="text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.2)] text-[clamp(1.8rem,6.15vw,6.15rem)]">
                  CREATOR REWARDS DONE RIGHT
                </span>
                <span className="bg-gradient-to-r from-[#BF953F] via-[#FCF6BA] to-[#B38728] bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(212,175,55,0.4)] mt-2 text-[clamp(1.8rem,6.15vw,6.15rem)] hover:brightness-125 transition-all duration-500 cursor-default">
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

  return <Layout onNavigate={(v: any) => setCurrentView(v)} currentView={currentView}>{renderView()}</Layout>;
};

export default App;