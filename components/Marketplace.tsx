
import React from 'react';
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
            onClick={() => !item.sold && sponsorStatus === SponsorStatus.APPROVED && onPurchase(item)}
          >
            {/* Thumbnail Container */}
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

              {/* Hover overlay for Buy It Now */}
              {!item.sold && sponsorStatus === SponsorStatus.APPROVED && (
                <div className="absolute inset-0 z-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                  <div className="bg-white text-black px-6 py-2 font-bold uppercase text-sm">
                    {loading ? 'Processing...' : `Buy It Now - ${item.priceSol} SOL`}
                  </div>
                </div>
              )}
            </div>
            
            {/* Minimalist Info Section */}
            <div className="mt-6 text-center space-y-1">
              <h3 className="text-white text-lg font-medium tracking-tight">
                {item.placementDetail}
              </h3>
              <p className="text-zinc-400 text-sm">
                {item.streamTime}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Marketplace;
