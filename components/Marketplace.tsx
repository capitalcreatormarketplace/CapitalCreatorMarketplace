
import React, { useState } from 'react';
import { InventoryItem, SponsorStatus, AdPosition } from '../types';

interface MarketplaceProps {
  items: InventoryItem[];
  sponsorStatus: SponsorStatus;
  onPurchase: (item: InventoryItem) => void;
  loading: boolean;
}

const AdBadge: React.FC<{ position: AdPosition }> = ({ position }) => {
  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'center': 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
  };

  return (
    <div className={`absolute ${positionClasses[position]} z-10 bg-white/30 backdrop-blur-md border border-white/60 px-3 py-1 rounded text-white font-black text-lg tracking-tighter drop-shadow-2xl uppercase`}>
      AD
    </div>
  );
};

const Marketplace: React.FC<MarketplaceProps> = ({ items, sponsorStatus, onPurchase, loading }) => {
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  return (
    <div className="space-y-12 animate-fadeIn pb-24">
      <div className="text-center py-12">
        <h1 className="text-6xl md:text-8xl font-normal text-white uppercase tracking-tight">
          CREATOR MARKETPLACE
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
        {items.map((item) => (
          <div 
            key={item.id} 
            className={`group cursor-pointer transition-all ${item.sold ? 'opacity-40 grayscale' : 'hover:opacity-90'}`}
            onClick={() => !item.sold && setSelectedItem(item)}
          >
            <div className="relative aspect-video bg-zinc-900 overflow-hidden border border-white/5">
              <img 
                src={item.thumbnailUrl} 
                alt={item.placementDetail} 
                className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-500"
              />
              <AdBadge position={item.adPosition} />
              
              {item.sold && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60">
                   <span className="text-white font-black text-2xl uppercase tracking-widest border-2 border-white px-4 py-1">SOLD</span>
                </div>
              )}

              {!item.sold && (
                <div className="absolute inset-0 z-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                  <div className="bg-white text-black px-6 py-2 font-bold uppercase text-[10px] tracking-[0.2em]">
                    VIEW PERFORMANCE DATA
                  </div>
                </div>
              )}
            </div>
            
            <div className="mt-6 text-center space-y-1">
              <h3 className="text-white text-lg font-bold tracking-tighter uppercase">
                {item.creatorName}
              </h3>
              <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-[0.3em]">
                {item.platform} // {item.priceSol} SOL
              </p>
            </div>
          </div>
        ))}
      </div>

      {selectedItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 md:px-0">
          <div 
            className="absolute inset-0 bg-black/90 backdrop-blur-sm" 
            onClick={() => setSelectedItem(null)}
          ></div>
          
          <div className="glass relative w-full max-w-4xl p-0 overflow-hidden animate-fadeIn rounded-none border-white/20">
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="relative bg-zinc-900 aspect-square md:aspect-auto">
                <img 
                  src={selectedItem.thumbnailUrl} 
                  className="w-full h-full object-cover grayscale-[0.3]"
                  alt="Listing"
                />
                <div className="absolute top-6 left-6 bg-black/80 px-4 py-2 border border-white/20">
                   <p className="text-[10px] font-black uppercase tracking-widest">Platform: {selectedItem.platform}</p>
                </div>
              </div>

              <div className="p-10 space-y-8 flex flex-col justify-center">
                <div className="space-y-2 border-b border-white/10 pb-6">
                   <h2 className="text-xs uppercase text-zinc-500 font-black tracking-[0.4em]">Project Identity</h2>
                   <p className="text-4xl font-black uppercase tracking-tighter text-white">{selectedItem.creatorName}</p>
                </div>

                <div className="grid grid-cols-2 gap-y-10 gap-x-6">
                   <div className="space-y-1">
                      <h4 className="text-[9px] uppercase text-zinc-500 font-bold tracking-widest">Ad Revenue</h4>
                      <p className="text-2xl font-mono text-white font-bold tracking-tighter">
                        ${selectedItem.creatorRevenue?.toLocaleString() || '0'}
                      </p>
                   </div>
                   <div className="space-y-1">
                      <h4 className="text-[9px] uppercase text-zinc-500 font-bold tracking-widest">Times Hired</h4>
                      <p className="text-2xl font-mono text-white font-bold tracking-tighter">
                        {selectedItem.creatorHires || '0'} Hires
                      </p>
                   </div>
                   <div className="space-y-1">
                      <h4 className="text-[9px] uppercase text-zinc-500 font-bold tracking-widest">Average Audience</h4>
                      <p className="text-2xl font-mono text-white font-bold tracking-tighter">
                        {selectedItem.creatorAvgAudience?.toLocaleString() || '0'}
                      </p>
                   </div>
                   <div className="space-y-1">
                      <h4 className="text-[9px] uppercase text-[#F1EBD9] font-black tracking-widest">Ad Price</h4>
                      <p className="text-2xl font-mono text-[#F1EBD9] font-bold tracking-tighter drop-shadow-[0_0_8px_rgba(241,235,217,0.4)]">
                        {selectedItem.priceSol} SOL
                      </p>
                   </div>
                </div>

                <div className="pt-8 space-y-6">
                  <div className="bg-white/5 border border-white/10 p-4">
                     <p className="text-[10px] uppercase text-zinc-500 mb-2 font-bold tracking-widest">Placement Detail</p>
                     <p className="text-sm italic text-zinc-300 leading-relaxed font-mono">"{selectedItem.placementDetail}"</p>
                  </div>

                  {sponsorStatus === SponsorStatus.APPROVED ? (
                    <button 
                      onClick={() => {
                        onPurchase(selectedItem);
                        setSelectedItem(null);
                      }}
                      className="w-full bg-white text-black py-5 font-black uppercase text-sm tracking-[0.3em] hover:bg-zinc-200 transition-all flex items-center justify-center gap-3"
                    >
                      {loading ? 'INITIATING_PAYMENT_PROTOCOL...' : 'BUY_IT_NOW'}
                    </button>
                  ) : (
                    <div className="text-center p-4 border border-dashed border-white/20">
                       <p className="text-[10px] uppercase text-zinc-500 font-bold tracking-widest">
                         SPONSOR_APPROVAL_REQUIRED_TO_PURCHASE
                       </p>
                    </div>
                  )}
                  
                  <button 
                    onClick={() => setSelectedItem(null)}
                    className="w-full text-zinc-500 text-[9px] uppercase font-bold tracking-widest hover:text-white transition-colors"
                  >
                    RETURN_TO_MARKETPLACE
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Marketplace;
