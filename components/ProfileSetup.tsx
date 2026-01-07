
import React, { useState } from 'react';
import { UserProfile, UserRole, SponsorApplication, SponsorStatus, ContentCategory } from '../types';
import { Icons } from '../constants';

interface ProfileSetupProps {
  profile: UserProfile;
  sponsorApp?: SponsorApplication;
  onSaveProfile: (profile: UserProfile) => void;
  onApplySponsor: (app: SponsorApplication) => void;
  onListInventory: (item: any) => void;
}

const ProfileSetup: React.FC<ProfileSetupProps> = ({ profile, sponsorApp, onSaveProfile, onApplySponsor, onListInventory }) => {
  const [isEditing, setIsEditing] = useState(!profile.name);
  const [formData, setFormData] = useState<UserProfile>(profile);
  
  const [appData, setAppData] = useState<SponsorApplication>(
    sponsorApp || {
      name: '',
      companyName: '',
      monthsInBusiness: 0,
      logoUrl: '',
      status: SponsorStatus.NONE
    }
  );

  const [invData, setInvData] = useState({
    streamTime: '',
    placementDetail: '',
    priceSol: 100, // USDC Default
    platform: 'YouTube' as const,
    category: ContentCategory.CRYPTO,
    adPosition: 'bottom-right' as const
  });

  const now = new Date();
  const maxDate = new Date();
  maxDate.setDate(now.getDate() + 7);
  const minDateString = now.toISOString().slice(0, 16);
  const maxDateString = maxDate.toISOString().slice(0, 16);

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile(formData);
    setIsEditing(false);
  };

  const renderInitialSetup = () => (
    <div className="glass p-8 md:p-12 rounded-none border-white/20 animate-fadeIn space-y-10">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-black uppercase tracking-tighter">System Initialization</h2>
        <p className="text-zinc-500 font-bold uppercase tracking-[0.5em] text-[10px]">Configure your Capital Creator profile</p>
      </div>

      {formData.role === UserRole.UNDEFINED ? (
        <div className="space-y-6">
          <div className="text-center">
            <p className="text-[10px] uppercase text-zinc-400 font-black tracking-[0.4em]">[Step 1 of 2] Role Selection Required</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button 
              onClick={() => setFormData({...formData, role: UserRole.CREATOR})}
              className="p-8 border-2 border-white/10 hover:border-white/40 hover:bg-white/5 transition-all space-y-3 text-left"
            >
              <h3 className="text-xl font-black uppercase tracking-tight text-white">Creator</h3>
              <p className="text-sm text-zinc-400">List your ad inventory, connect with sponsors, and earn revenue directly.</p>
            </button>
            <button 
              onClick={() => setFormData({...formData, role: UserRole.SPONSOR})}
              className="p-8 border-2 border-white/10 hover:border-white/40 hover:bg-white/5 transition-all space-y-3 text-left"
            >
              <h3 className="text-xl font-black uppercase tracking-tight text-white">Sponsor</h3>
              <p className="text-sm text-zinc-400">Discover creators, purchase ad placements, and grow your brand's reach.</p>
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleProfileSubmit} className="space-y-8">
          <div className="text-center">
            <p className="text-[10px] uppercase text-zinc-400 font-black tracking-[0.4em]">[Step 2 of 2] Complete Your Profile</p>
          </div>
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-[7.9px] uppercase text-zinc-500 font-bold tracking-widest">
                  {formData.role === UserRole.CREATOR ? 'Creator Name' : 'Sponsor / Project Name'}
                </label>
                <input type="text" placeholder="e.g. ChartMaster" className="w-full bg-black/50 border border-white/10 p-4 text-base font-bold focus:border-white/40 outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
              </div>
               <div className="space-y-2">
                <label className="text-[7.9px] uppercase text-zinc-500 font-bold tracking-widest">Avatar URL (Optional)</label>
                <input type="url" placeholder="https://..." className="w-full bg-black/50 border border-white/10 p-4 text-base font-bold focus:border-white/40 outline-none" value={formData.avatarUrl} onChange={e => setFormData({...formData, avatarUrl: e.target.value})} />
              </div>
            </div>

            <div className="space-y-2 pt-4 border-t border-white/5">
               <label className="text-[7.9px] uppercase text-zinc-500 font-bold tracking-widest">Biography / Project Description</label>
              <textarea placeholder="Briefly describe your channel and audience demographics..." className="w-full bg-black/50 border border-white/10 p-4 min-h-[110px] text-sm focus:border-white/40 outline-none" value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} required />
            </div>
            <div className="flex justify-between items-center pt-5">
              <button 
                type="button"
                onClick={() => setFormData({...profile, role: UserRole.UNDEFINED})} 
                className="text-[9.4px] uppercase tracking-[0.5em] text-zinc-500 hover:text-white transition-colors"
              >
                Back
              </button>
              <button type="submit" className="bg-white text-black px-10 py-5 font-black uppercase text-[11px] tracking-widest hover:bg-zinc-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                Save & Initialize Profile
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );

  if (isEditing || !profile.name) {
    return (
      <div className="max-w-4xl mx-auto py-12 md:py-20 animate-fadeIn">
        {renderInitialSetup()}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-10 py-8 animate-fadeIn pb-20">
      <section className="glass p-8 rounded-none border-white/20">
        <div className="flex flex-col md:flex-row items-start gap-8">
          <div className="w-20 h-20 bg-white/10 border border-white/20 flex items-center justify-center overflow-hidden shrink-0">
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl font-bold opacity-20">{profile.name.slice(0,2).toUpperCase()}</span>
            )}
          </div>
          
          <div className="flex-grow w-full">
            <div className="space-y-5">
              <div className="flex items-start justify-between border-b border-white/5 pb-5">
                <div>
                  <h2 className="text-3xl font-black uppercase tracking-tighter">{profile.name}</h2>
                  <p className="mono text-[7.9px] opacity-30 mt-1 uppercase tracking-widest">{profile.address}</p>
                </div>
                <button onClick={() => { setIsEditing(true); setFormData(profile); }} className="text-[7.9px] text-zinc-500 hover:text-white uppercase font-bold tracking-widest border border-white/10 px-4 py-2 hover:bg-white/5 transition-all">Edit Profile</button>
              </div>
              {profile.role === UserRole.CREATOR && (
                <div className="grid grid-cols-3 gap-8 py-2">
                  <div className="space-y-1"><p className="text-[7.9px] uppercase text-zinc-500 font-black tracking-widest">Revenue Earned</p><p className="text-xl font-mono font-bold">${profile.revenueEarned?.toLocaleString()}</p></div>
                  <div className="space-y-1"><p className="text-[7.9px] uppercase text-zinc-500 font-black tracking-widest">Times Hired</p><p className="text-xl font-mono font-bold">{profile.timesHired}</p></div>
                  <div className="space-y-1"><p className="text-[7.9px] uppercase text-zinc-500 font-black tracking-widest">Avg Audience</p><p className="text-xl font-mono font-bold">{profile.avgAudienceSize?.toLocaleString()}</p></div>
                </div>
              )}
              <p className="text-zinc-400 leading-relaxed text-sm italic max-w-2xl pt-2">{profile.bio}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Creator Portal */}
        <div className={`glass p-7 rounded-none border-white/10 flex flex-col transition-opacity ${profile.role !== UserRole.CREATOR ? 'opacity-30 pointer-events-none' : ''}`}>
          <div className="flex items-center justify-between mb-5">
             <h3 className="text-[0.94rem] font-bold uppercase tracking-tight">Creator Portal</h3>
             <span className="bg-white/5 border border-white/10 px-2.5 py-1 text-[7.9px] uppercase">Vendor</span>
          </div>
          
          <div className="space-y-5 flex-grow">
            <p className="text-sm text-gray-400">List your available content inventory. Reach premium sponsors directly. <span className="text-white font-bold">(Max 7 Days in Advance)</span></p>
            
            <div className="space-y-4 pt-4 border-t border-white/5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[7.9px] uppercase text-gray-500 font-bold">Platform</label>
                  <select className="w-full bg-black border border-white/10 p-2 text-sm" value={invData.platform} onChange={e => setInvData({...invData, platform: e.target.value as any})}>
                    <option>YouTube</option><option>Twitch</option><option>Facebook</option><option>X</option><option>Kick</option><option>Zora</option><option>PumpFun</option><option>Rumble</option><option>Instagram</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[7.9px] uppercase text-gray-500 font-bold">Category</label>
                  <select className="w-full bg-black border border-white/10 p-2 text-sm" value={invData.category} onChange={e => setInvData({...invData, category: e.target.value as ContentCategory})}>
                    {Object.values(ContentCategory).map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[7.9px] uppercase text-gray-500 font-bold">Ad Position</label>
                  <select className="w-full bg-black border border-white/10 p-2 text-sm" value={invData.adPosition} onChange={e => setInvData({...invData, adPosition: e.target.value as any})}>
                    <option value="top-left">Top Left</option>
                    <option value="top-right">Top Right</option>
                    <option value="bottom-left">Bottom Left</option>
                    <option value="bottom-right">Bottom Right</option>
                    <option value="center">Center</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[7.9px] uppercase text-gray-500 font-bold">Price (USDC)</label>
                  <input type="number" className="w-full bg-black border border-white/10 p-2 text-sm" value={invData.priceSol} onChange={e => setInvData({...invData, priceSol: Number(e.target.value)})} required />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[7.9px] uppercase text-gray-500 font-bold">Scheduled Content Date</label>
                <input type="datetime-local" min={minDateString} max={maxDateString} className="w-full bg-black border border-white/10 p-2 text-sm" value={invData.streamTime} onChange={e => setInvData({...invData, streamTime: e.target.value})} required />
              </div>
              <div className="space-y-1">
                <label className="text-[7.9px] uppercase text-gray-500 font-bold">Placement & Strategy Details (Long Form)</label>
                <textarea placeholder="Explain your placement strategy, audience demographic, and how you will highlight the sponsor logo..." className="w-full bg-black border border-white/10 p-2 text-sm h-32 resize-none" value={invData.placementDetail} onChange={e => setInvData({...invData, placementDetail: e.target.value})} required />
              </div>
            </div>
          </div>

          <button onClick={() => onListInventory(invData)} className="mt-8 bg-white text-black w-full py-3.5 font-bold uppercase text-sm flex items-center justify-center gap-2 hover:bg-zinc-200 transition-all disabled:opacity-50" disabled={profile.role !== UserRole.CREATOR}>
            <Icons.Plus /> List Inventory
          </button>
        </div>

        {/* Sponsor Portal */}
        <div className={`glass p-7 rounded-none border-white/10 flex flex-col transition-opacity ${profile.role !== UserRole.SPONSOR ? 'opacity-30 pointer-events-none' : ''}`}>
          <div className="flex items-center justify-between mb-5"><h3 className="text-[0.94rem] font-bold uppercase tracking-tight">Sponsor Portal</h3><span className="bg-white/5 border border-white/10 px-2.5 py-1 text-[7.9px] uppercase">Client</span></div>
          <div className="space-y-5 flex-grow">
            <p className="text-sm text-gray-400">Apply to become an authorized sponsor. Once approved, purchase listings instantly.</p>
            {sponsorApp?.status === SponsorStatus.APPROVED ? (
              <div className="p-4 bg-white/10 border border-white/20 flex items-center gap-3 h-full"><div className="w-7 h-7 rounded-none bg-white text-black flex items-center justify-center scale-90"><Icons.Check /></div><div><p className="text-sm font-bold uppercase">Account Verified</p><p className="text-xs text-gray-400 mt-0.5">Access to Marketplace unlocked.</p></div></div>
            ) : sponsorApp?.status === SponsorStatus.PENDING ? (
              <div className="p-4 bg-white/5 border border-dashed border-white/20 h-full"><p className="text-sm font-bold uppercase">Application Pending</p><p className="text-xs text-gray-400 mt-1">Review takes 24-48 hours. Notifications sent to CapitalCreatorMarketplace@gmail.com</p></div>
            ) : (
              <form className="space-y-4 pt-4 border-t border-white/5" onSubmit={(e) => { e.preventDefault(); onApplySponsor(appData); }}>
                <div className="space-y-1"><label className="text-[7.9px] uppercase text-gray-500 font-bold">Contact Name</label><input type="text" className="w-full bg-black border border-white/10 p-2 text-sm" value={appData.name} onChange={e => setAppData({...appData, name: e.target.value})} required /></div>
                <div className="space-y-1"><label className="text-[7.9px] uppercase text-gray-500 font-bold">Company Name</label><input type="text" className="w-full bg-black border border-white/10 p-2 text-sm" value={appData.companyName} onChange={e => setAppData({...appData, companyName: e.target.value})} required /></div>
                <div className="space-y-1"><label className="text-[7.9px] uppercase text-gray-500 font-bold">Months in Business</label><input type="number" className="w-full bg-black border border-white/10 p-2 text-sm" value={appData.monthsInBusiness} onChange={e => setAppData({...appData, monthsInBusiness: Number(e.target.value)})} required /></div>
                <div className="space-y-1"><label className="text-[7.9px] uppercase text-gray-500 font-bold">Logo URL</label><input type="url" placeholder="https://..." className="w-full bg-black border border-white/10 p-2 text-sm" value={appData.logoUrl} onChange={e => setAppData({...appData, logoUrl: e.target.value})} required /></div>
                <button type="submit" className="w-full bg-white text-black py-3.5 mt-3 font-bold uppercase text-sm tracking-widest hover:bg-zinc-200 transition-all">Submit Application</button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 

export default ProfileSetup;
