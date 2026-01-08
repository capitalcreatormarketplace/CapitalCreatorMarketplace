
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
  const [filterDay, setFilterDay] = useState<string>('ALL');
  const [filterTime, setFilterTime] = useState<string>('ALL');

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      // Primary filter: Active vs. Ended
      const isEnded = item.status === ItemStatus.SOLD || item.status === ItemStatus.EXPIRED;
      if (showEnded !== isEnded) {
        return false;
      }

      // Secondary filters from modal
      const date = new Date(item.timestamp);
      const dayName = date.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
      const hour = date.getHours();
      
      let timeOfDay = 'NIGHT';
      if (hour >= 6 && hour < 12) timeOfDay = 'MORNING';
      else if (hour >= 12 && hour < 18) timeOfDay = 'AFTERNOON';
      else if (hour >= 18 && hour < 24) timeOfDay = 'EVENING';

      const matchesCategory = filterCategory === 'ALL' || item.category === filterCategory;
      const matchesPlatform = filterPlatform === 'ALL' || (item.platforms || []).some(p => p.toUpperCase() === filterPlatform);
      const matchesDay = filterDay === 'ALL' || dayName === filterDay;
      const matchesTime = filterTime === 'ALL' || timeOfDay === filterTime;

      return matchesCategory && matchesPlatform && matchesDay && matchesTime;
    });
  }, [items, filterCategory, filterPlatform, filterDay, filterTime, showEnded]);

  const FilterButton: React.FC<{ label: string, active: boolean, onClick: () => void }> = ({ label, active, onClick }) => (
    <button 
      onClick={onClick}
      className={`px-3 py-1.5 text-[9px] font-black tracking-[0.2em] border transition-all uppercase ${
        active 
        ? 'bg-white text-black border-white shadow-[0_0_10px_rgba(255,255,255,0.3)]' 
        : 'bg-transparent text-zinc-500 border-white/10 hover:border-white/30 hover:text-zinc-300'
      }`}
    >
      {label}
    </button>
  );

  const activeFilterCount = [filterCategory, filterPlatform, filterDay, filterTime].filter(f => f !== 'ALL').length;

  return (
    <div className="space-y-10 animate-fadeIn pb-20">
      <div className="text-center py-12 space-y-4">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white uppercase tracking-tighter leading-none">
          CONTENT SPONSORSHIP <br className="hidden md:block" /> 
          <span className="bg-gradient-to-r from-[#BF953F] via-[#FCF6BA] to-[#B38728] bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(212,175,55,0.3)]">MARKETPLACE</span>
        </h1>
        <p className="text-zinc-500 font-bold uppercase tracking-[0.5em] text-[10px] md:text-xs">
          BUY CONTENT AD PLACEMENTS
        </p>

        <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-8 max-w-4xl mx-auto">
          <button 
            onClick={() => setIsFilterOpen(true)}
            className="group relative inline-flex items-center gap-4 bg-white/5 border border-white/10 px-6 py-3 hover:border-white/20 transition-all duration-300"
          >
            <span className="text-[9px] font-black tracking-[0.3em] uppercase">Filter Terminal</span>
            {activeFilterCount > 0 && (
              <span className="bg-white text-black px-2 py-0.5 text-[8px] font-black">
                {activeFilterCount}
              </span>
            )}
          </button>
          <div className="flex gap-2 p-1 bg-black/40 border border-white/5">
            <button
              onClick={() => setShowEnded(false)}
              className={`px-6 py-2 text-[9px] font-black tracking-widest uppercase transition-all ${!showEnded ? 'bg-white text-black shadow-lg' : 'text-zinc-600 hover:text-white'}`}
            >
              Active Spots
            </button>
            <button
              onClick={() => setShowEnded(true)}
              className={`px-6 py-2 text-[9px] font-black tracking-widest uppercase transition-all ${showEnded ? 'bg-white text-black shadow-lg' : 'text-zinc-600 hover:text-white'}`}
            >
              Ended
            </button>
          </div>
        </div>
      </div>

      {isFilterOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-xl" onClick={() => setIsFilterOpen(false)}></div>
          <div className="glass relative w-full max-w-2xl p-8 border-white/20 animate-fadeIn">
            <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-5">
              <div className="space-y-1">
                <h2 className="text-xl font-black uppercase tracking-widest text-white">Filter Terminal</h2>
                <p className="text-[8px] text-zinc-500 uppercase tracking-[0.5em]">Configure inventory search parameters</p>
              </div>
              <button onClick={() => setIsFilterOpen(false)} className="text-zinc-500 hover:text-white text-[10px] font-black tracking-widest uppercase underline underline-offset-4">Close</button>
            </div>
            <div className="space-y-8 max-h-[70vh] overflow-y-auto pr-4 custom-scrollbar">
              <div className="space-y-3">
                <span className="text-[9px] font-black text-zinc-600 tracking-[0.4em] uppercase border-l-2 border-white/20 pl-3">Category</span>
                <div className="flex flex-wrap gap-2">
                  {['ALL', ...Object.values(ContentCategory)].map(cat => (
                    <FilterButton key={cat} label={cat} active={filterCategory === cat} onClick={() => setFilterCategory(cat)} />
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <span className="text-[9px] font-black text-zinc-600 tracking-[0.4em] uppercase border-l-2 border-white/20 pl-3">Platform</span>
                <div className="flex flex-wrap gap-2">
                  {['ALL', 'YOUTUBE', 'TWITCH', 'KICK', 'X', 'FACEBOOK', 'ZORA', 'PUMPFUN', 'RUMBLE', 'INSTAGRAM', 'DISCORD', 'OTHER'].map(plt => (
                    <FilterButton key={plt} label={plt} active={filterPlatform === plt} onClick={() => setFilterPlatform(plt)} />
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-white/5">
                <div className="space-y-3">
                  <span className="text-[9px] font-black text-zinc-600 tracking-[0.4em] uppercase border-l-2 border-white/20 pl-3">Day of Week</span>
                  <div className="flex flex-wrap gap-2">
                    {['ALL', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'].map(day => (
                      <FilterButton key={day} label={day.slice(0,3)} active={filterDay === day} onClick={() => setFilterDay(day)} />
                    ))}
                  </div>
                </div>
                <div className="space-y-3">
                  <span className="text-[9px] font-black text-zinc-600 tracking-[0.4em] uppercase border-l-2 border-white/20 pl-3">Time of Day</span>
                  <div className="flex flex-wrap gap-2">
                    {['ALL', 'MORNING', 'AFTERNOON', 'EVENING', 'NIGHT'].map(t => (
                      <FilterButton key={t} label={t} active={filterTime === t} onClick={() => setFilterTime(t)} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-10 pt-8 border-t border-white/10 flex gap-4">
              <button onClick={() => { setFilterCategory('ALL'); setFilterPlatform('ALL'); setFilterDay('ALL'); setFilterTime('ALL'); }} className="flex-1 border border-white/10 py-4 text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-all">Reset All</button>
              <button onClick={() => setIsFilterOpen(false)} className="flex-[2] bg-white text-black py-4 text-[10px] font-black uppercase tracking-widest hover:bg-zinc-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)]">Apply Parameters</button>
            </div>
          </div>
        </div>
      )}

      {filteredItems.length === 0 ? (
        <div className="py-20 text-center border border-dashed border-white/10">
          <p className="text-zinc-600 text-[10px] font-black tracking-[0.5em] uppercase">No matching inventory found in the terminal</p>
          <button onClick={() => { setFilterCategory('ALL'); setFilterPlatform('ALL'); setFilterDay('ALL'); setFilterTime('ALL'); }} className="mt-4 text-white text-[8px] font-black uppercase tracking-widest underline underline-offset-4">Clear Filters</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-14">
          {filteredItems.map((item) => (
            <div key={item.id} className={`group transition-all ${item.status !== ItemStatus.AVAILABLE ? 'opacity-40 grayscale' : 'hover:opacity-90 cursor-pointer'}`} onClick={() => item.status === ItemStatus.AVAILABLE && setSelectedItem(item)}>
              <div className="relative aspect-video bg-zinc-900 overflow-hidden border border-white/5">
                <img src={item.thumbnailUrl} alt={item.placementDetail} className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-500" />
                <AdBadge position={item.adPosition} />
                {item.status === ItemStatus.SOLD && (
                  <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60">
                    <span className="text-white font-black text-xl uppercase tracking-widest border border-white px-4 py-1">SOLD</span>
                  </div>
                )}
                {item.status === ItemStatus.EXPIRED && (
                  <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60">
                    <span className="text-zinc-500 font-black text-xl uppercase tracking-widest border border-zinc-700 px-4 py-1">ENDED</span>
                  </div>
                )}
                {item.status === ItemStatus.AVAILABLE && (
                  <div className="absolute inset-0 z-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                    <div className="bg-white text-black px-5 py-2 font-bold uppercase text-[7.5px] tracking-[0.2em]">VIEW DETAILS</div>
                  </div>
                )}
              </div>
              <div className="mt-5 text-center space-y-2">
                <h3 className="text-white text-[1rem] font-bold tracking-tighter uppercase">{item.creatorName}</h3>
                <div className="space-y-1">
                  <p className="text-zinc-500 text-[8px] uppercase font-bold tracking-widest truncate px-2">{item.streamTime}</p>
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex flex-wrap justify-center gap-1">
                      {(item.platforms || []).map(p => (
                        <span key={p} className="text-[7px] bg-[#BF953F]/10 text-[#BF953F] px-1.5 py-0.5 font-black uppercase tracking-widest border border-[#BF953F]/10">{p}</span>
                      ))}
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-zinc-600 text-[7px] border border-zinc-800 px-1.5 py-0.5 font-black uppercase tracking-widest">{item.category}</span>
                      <p className="text-[#F1EBD9] text-[10px] font-black tracking-widest drop-shadow-[0_0_8px_rgba(241,235,217,0.3)]">${item.priceSol} USDC</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedItem && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center px-4 md:px-0">
          <div className="absolute inset-0 bg-black/98 backdrop-blur-2xl" onClick={() => setSelectedItem(null)}></div>
          
          <div className="glass relative w-full max-w-6xl p-0 overflow-hidden animate-fadeIn rounded-none border-white/20 shadow-2xl flex flex-col md:flex-row h-auto md:h-[85vh]">
            <div className="flex-1 flex flex-col bg-black overflow-hidden">
               <div className="relative aspect-video w-full bg-zinc-900 border-b border-white/5 group">
                  <img src={selectedItem.thumbnailUrl} className="w-full h-full object-cover" alt="Stream Screen" />
                  <AdBadge position={selectedItem.adPosition} isPreview />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none"></div>
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between pointer-events-none opacity-60">
                    <div className="flex items-center gap-4">
                      <div className="w-1.5 h-1.5 bg-red-600 rounded-full"></div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-white">LIVE PREVIEW</span>
                    </div>
                    <span className="text-[10px] font-mono text-white">4K • HDR</span>
                  </div>
               </div>
               <div className="flex-grow p-8 overflow-y-auto custom-scrollbar bg-zinc-950/50">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-white/5 pb-4">
                       <div className="space-y-1">
                          <h2 className="text-[10px] uppercase text-zinc-500 font-black tracking-[0.4em]">Placement Strategy</h2>
                          <p className="text-xl font-black uppercase text-white tracking-tighter">Detailed Coverage Breakdown</p>
                       </div>
                       <div className="flex flex-wrap gap-2">
                         {(selectedItem.platforms || []).map(p => (
                            <div key={p} className="bg-white/5 border border-white/10 px-4 py-2 text-[10px] font-bold text-white uppercase tracking-widest">
                              {p} HOST
                            </div>
                         ))}
                       </div>
                    </div>
                    <div className="prose prose-invert max-w-none">
                       <p className="text-sm text-zinc-400 leading-relaxed font-medium whitespace-pre-wrap">
                         {selectedItem.placementDetail || "No specific details provided beyond the standard listing. This creator typically ensures high visibility for sponsors through active call-to-outs and on-screen graphical overlays."}
                         {"\n\n"}
                         The placement will remain active for the entire duration of the stream. Our production team ensures that no UI elements from the native platform conflict with your branding at the {selectedItem.adPosition} coordinate.
                         {"\n\n"}
                         Expected impressions are based on a 30-day average audience retention rate. All metrics are verified on-chain.
                       </p>
                    </div>
                  </div>
               </div>
               <div className="bg-black p-6 border-t border-white/5 flex items-center justify-around grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all">
                  {['YOUTUBE', 'FACEBOOK', 'TWITCH', 'KICK', 'INSTAGRAM', 'ZORA', 'DISCORD'].map(p => (
                    <span key={p} className="text-[10px] font-black tracking-widest uppercase cursor-default">{p}</span>
                  ))}
               </div>
            </div>
            <div className="w-full md:w-[400px] bg-zinc-900/50 border-l border-white/5 p-8 flex flex-col justify-between">
              <div className="space-y-10">
                <div className="space-y-2">
                   <h2 className="text-[10px] uppercase text-zinc-500 font-black tracking-[0.4em]">Identity</h2>
                   <p className="text-4xl font-black uppercase tracking-tighter text-white leading-none">{selectedItem.creatorName}</p>
                </div>
                <div className="space-y-6">
                   <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-1">
                         <h4 className="text-[9px] uppercase text-zinc-500 font-bold tracking-widest">Global Hires</h4>
                         <p className="text-2xl font-mono text-white font-bold">{selectedItem.creatorHires || '0'}</p>
                      </div>
                      <div className="space-y-1">
                         <h4 className="text-[9px] uppercase text-zinc-500 font-bold tracking-widest">AVG Concurrent</h4>
                         <p className="text-2xl font-mono text-white font-bold">{selectedItem.creatorAvgAudience?.toLocaleString() || '0'}</p>
                      </div>
                   </div>
                   <div className="space-y-1 border-t border-white/5 pt-6">
                      <h4 className="text-[9px] uppercase text-zinc-500 font-bold tracking-widest">Scheduling</h4>
                      <p className="text-base font-black text-white uppercase tracking-tighter">{selectedItem.streamTime}</p>
                   </div>
                </div>
              </div>
              <div className="space-y-6 pt-10 border-t border-white/10">
                <div className="flex items-center justify-between">
                   <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">Total Settlement</span>
                   <span className="text-3xl font-mono text-[#F1EBD9] font-black drop-shadow-[0_0_10px_rgba(241,235,217,0.3)]">
                     ${selectedItem.priceSol} <span className="text-sm">USDC</span>
                   </span>
                </div>
                {sponsorStatus === SponsorStatus.APPROVED ? (
                  <button onClick={() => { onPurchase(selectedItem); setSelectedItem(null); }} className="w-full bg-white text-black py-6 font-black uppercase text-[12px] tracking-0.4em hover:bg-zinc-200 transition-all flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(255,255,255,0.15)]">
                    {loading ? 'INITIATING SOLANA SPLIT...' : 'BUY PLACEMENT NOW'}
                  </button>
                ) : (
                  <div className="text-center p-6 border-2 border-dashed border-white/10 space-y-2">
                     <p className="text-[10px] uppercase text-white font-black tracking-widest">Sponsor Key Required</p>
                     <p className="text-[8px] uppercase text-zinc-500 tracking-widest leading-relaxed">You must be a verified sponsor to purchase this inventory. Submit application in profile terminal.</p>
                  </div>
                )}
                <button onClick={() => setSelectedItem(null)} className="w-full text-zinc-500 text-[10px] uppercase font-black tracking-[0.4em] hover:text-white transition-colors">Return to Marketplace</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; export default Marketplace;