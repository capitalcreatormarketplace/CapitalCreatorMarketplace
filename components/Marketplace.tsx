
import React, { useState, useMemo } from 'react';
import { InventoryItem, SponsorStatus, AdPosition, ContentCategory, ItemStatus } from '../types';

interface MarketplaceProps {
  items: InventoryItem[];
  sponsorStatus: SponsorStatus;
  onPurchase: (item: InventoryItem) => void;
  loading: boolean;
}

const AdBadge: React.FC<{ position: AdPosition; isPreview?: boolean }> = ({ position, isPreview }) => {
  const getPositionClasses = (pos: AdPosition) => {
    switch (pos) {
      case 'top-left': return 'top-4 left-4';
      case 'top-center': return 'top-4 left-1/2 -translate-x-1/2';
      case 'top-right': return 'top-4 right-4';
      case 'bottom-left': return 'bottom-4 left-4';
      case 'bottom-center': return 'bottom-4 left-1/2 -translate-x-1/2';
      case 'bottom-right': return 'bottom-4 right-4';
      default: return 'bottom-4 right-4';
    }
  };

  return (
    <div className={`absolute ${getPositionClasses(position)} z-10 bg-white/30 backdrop-blur-md border border-white/60 px-2.5 py-1 rounded text-white font-black ${isPreview ? 'text-sm px-4 py-2 border-2' : 'text-xs'} tracking-tighter drop-shadow-xl uppercase animate-pulse`}>
      {isPreview ? 'YOUR LOGO HERE' : 'AD'}
    </div>
  );
};

const Marketplace: React.FC<MarketplaceProps> = ({ items, sponsorStatus, onPurchase, loading }) => {
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [showEnded, setShowEnded] = useState(false);
  
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [filterPlatform, setFilterPlatform] = useState<string>('ALL');

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesStatus = showEnded 
        ? (item.status === ItemStatus.SOLD || item.status === ItemStatus.EXPIRED)
        : item.status === ItemStatus.AVAILABLE;
      
      const matchesCategory = filterCategory === 'ALL' || item.category === filterCategory;
      const matchesPlatform = filterPlatform === 'ALL' || (item.platforms || []).some(p => p.toUpperCase() === filterPlatform);

      return matchesStatus && matchesCategory && matchesPlatform;
    });
  }, [items, filterCategory, filterPlatform, showEnded]);

  return (
    <div className="space-y-10 animate-fadeIn pb-20">
      <div className="text-center py-12 space-y-4">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white uppercase tracking-tighter leading-none">
          CONTENT SPONSORSHIP <br /> 
          <span className="bg-gradient-to-r from-[#BF953F] via-[#FCF6BA] to-[#B38728] bg-clip-text text-transparent">MARKETPLACE</span>
        </h1>
        
        <div className="flex justify-center gap-4 pt-8">
          <button 
            onClick={() => setShowEnded(false)} 
            className={`px-8 py-3 text-[10px] font-black uppercase tracking-[0.3em] border transition-all ${!showEnded ? 'bg-white text-black border-white' : 'text-zinc-500 border-white/10 hover:border-white/20'}`}
          >
            Active Spots
          </button>
          <button 
            onClick={() => setShowEnded(true)} 
            className={`px-8 py-3 text-[10px] font-black uppercase tracking-[0.3em] border transition-all ${showEnded ? 'bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.2)]' : 'text-zinc-500 border-white/10 hover:border-white/20'}`}
          >
            Ended Terminal
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {filteredItems.map((item) => (
          <div 
            key={item.id} 
            className={`group cursor-pointer transition-all ${item.status !== ItemStatus.AVAILABLE ? 'opacity-60' : 'hover:opacity-90'}`}
            onClick={() => item.status === ItemStatus.AVAILABLE && setSelectedItem(item)}
          >
            <div className="relative aspect-video bg-zinc-900 border border-white/5">
              <img src={item.thumbnailUrl} alt="Thumbnail" className="w-full h-full object-cover grayscale-[0.2]" />
              <AdBadge position={item.adPosition} />
              
              {item.status === ItemStatus.SOLD && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60">
                  <span className="text-white font-black text-xl border border-white px-4 py-1">SOLD</span>
                </div>
              )}
              {item.status === ItemStatus.EXPIRED && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60">
                  <span className="text-zinc-500 font-black text-xl border border-zinc-500 px-4 py-1">ENDED</span>
                </div>
              )}
            </div>
            <div className="mt-4 text-center space-y-1">
              <h3 className="text-white text-base font-bold uppercase">{item.creatorName}</h3>
              <p className="text-zinc-500 text-[8px] uppercase font-bold tracking-widest">{item.streamTime}</p>
              <p className="text-[#F1EBD9] text-[10px] font-black tracking-widest">${item.priceSol} USDC</p>
            </div>
          </div>
        ))}
      </div>

      {selectedItem && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/98 backdrop-blur-2xl" onClick={() => setSelectedItem(null)}></div>
          <div className="glass relative w-full max-w-4xl p-0 animate-fadeIn flex flex-col md:flex-row h-auto md:h-[70vh]">
            <div className="flex-1 bg-black overflow-hidden relative">
               <img src={selectedItem.thumbnailUrl} className="w-full h-full object-cover opacity-50" />
               <AdBadge position={selectedItem.adPosition} isPreview />
            </div>
            <div className="w-full md:w-[350px] p-8 space-y-8 flex flex-col justify-between bg-zinc-900/50">
              <div className="space-y-6">
                <p className="text-[9px] uppercase text-zinc-600 font-black tracking-widest">Selected Terminal Spot</p>
                <h2 className="text-3xl font-black text-white uppercase tracking-tighter">{selectedItem.creatorName}</h2>
                <div className="space-y-2">
                   <p className="text-[11px] text-zinc-400 uppercase font-bold tracking-widest">{selectedItem.streamTime}</p>
                   <p className="text-xs text-zinc-500 leading-relaxed italic">{selectedItem.placementDetail}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                   <span className="text-[10px] uppercase font-black tracking-widest text-zinc-400">Settlement</span>
                   <span className="text-2xl font-mono text-[#F1EBD9] font-black">${selectedItem.priceSol}</span>
                </div>
                {sponsorStatus === SponsorStatus.APPROVED ? (
                  <button onClick={() => { onPurchase(selectedItem); setSelectedItem(null); }} className="w-full bg-white text-black py-5 font-black uppercase text-[10px] tracking-widest hover:bg-[#BF953F] transition-all">
                    {loading ? 'PAYING...' : 'BUY PLACEMENT'}
                  </button>
                ) : (
                  <div className="text-center p-4 border border-dashed border-white/10 text-[8px] uppercase font-black text-zinc-500">Verification Required</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; export default Marketplace;
