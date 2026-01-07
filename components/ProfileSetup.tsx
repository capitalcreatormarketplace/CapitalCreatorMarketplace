
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
  const [editing, setEditing] = useState(!profile.name);
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
    setEditing(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 py-8 animate-fadeIn pb-20">
      <section className="glass p-8 rounded-xl border-white/20">
        <div className="flex flex-col md:flex-row items-start gap-8">
          <div className="w-20 h-20 rounded-full bg-white/10 border border-white/20 flex items-center justify-center overflow-hidden shrink-0">
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl font-bold opacity-20">{profile.address.slice(0,2).toUpperCase()}</span>
            )}
          </div>
          
          <div className="flex-grow w-full">
            {editing ? (
              <form onSubmit={handleProfileSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-[7.9px] uppercase text-zinc-500 font-bold tracking-widest">Creator / Project Name</label>
                    <input type="text" placeholder="e.g. ChartMaster" className="w-full bg-black/50 border border-white/10 p-4 rounded text-base font-bold focus:border-white/40 outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[7.9px] uppercase text-zinc-500 font-bold tracking-widest">Avg Audience Size</label>
                    <input type="number" placeholder="e.g. 5000" className="w-full bg-black/50 border border-white/10 p-4 rounded text-base font-bold focus:border-white/40 outline-none" value={formData.avgAudienceSize} onChange={e => setFormData({...formData, avgAudienceSize: Number(e.target.value)})} required />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-[7.9px] uppercase text-zinc-500 font-bold tracking-widest">Total Ad Revenue Earned ($)</label>
                    <input type="number" placeholder="e.g. 10000" className="w-full bg-black/50 border border-white/10 p-4 rounded text-base font-bold focus:border-white/40 outline-none" value={formData.revenueEarned} onChange={e => setFormData({...formData, revenueEarned: Number(e.target.value)})} required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[7.9px] uppercase text-zinc-500 font-bold tracking-widest">Times Hired by Sponsors</label>
                    <input type="number" placeholder="e.g. 15" className="w-full bg-black/50 border border-white/10 p-4 rounded text-base font-bold focus:border-white/40 outline-none" value={formData.timesHired} onChange={e => setFormData({...formData, timesHired: Number(e.target.value)})} required />
                  </div>
                </div>
                <div className="space-y-2">
                   <label className="text-[7.9px] uppercase text-zinc-500 font-bold tracking-widest">Project Biography</label>
                  <textarea placeholder="Briefly describe your channel and audience demographics..." className="w-full bg-black/50 border border-white/10 p-4 rounded min-h-[110px] text-[12.2px] focus:border-white/40 outline-none" value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} required />
                </div>
                <button type="submit" className="bg-white text-black px-8 py-4 font-black rounded-none uppercase text-[10.3px] tracking-widest hover:bg-zinc-200 transition-all">Save Profile and Stats</button>
              </form>
            ) : (
              <div className="space-y-5">
                <div className="flex items-center justify-between border-b border-white/5 pb-5">
                  <div>
                    <h2 className="text-3xl font-black uppercase tracking-tighter">{profile.name || 'Anonymous Project'}</h2>
                    <p className="mono text-[7.9px] opacity-30 mt-1 uppercase tracking-widest">{profile.address}</p>
                  </div>
                  <button onClick={() => setEditing(true)} className="text-[7.9px] text-zinc-500 hover:text-white uppercase font-bold tracking-widest border border-white/10 px-4 py-2 hover:bg-white/5 transition-all">Edit Profile</button>
                </div>
                <div className="grid grid-cols-3 gap-8 py-2">
                  <div className="space-y-1"><p className="text-[7.9px] uppercase text-zinc-500 font-black tracking-widest">Revenue Earned</p><p className="text-xl font-mono font-bold">${profile.revenueEarned?.toLocaleString()}</p></div>
                  <div className="space-y-1"><p className="text-[7.9px] uppercase text-zinc-500 font-black tracking-widest">Times Hired</p><p className="text-xl font-mono font-bold">{profile.timesHired}</p></div>
                  <div className="space-y-1"><p className="text-[7.9px] uppercase text-zinc-500 font-black tracking-widest">Avg Audience</p><p className="text-xl font-mono font-bold">{profile.avgAudienceSize?.toLocaleString()}</p></div>
                </div>
                <p className="text-zinc-400 leading-relaxed text-[12.2px] italic max-w-2xl">{profile.bio || 'Your project stats are locked in. Ready to list inventory.'}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {!editing && profile.name && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className={`glass p-7 rounded-xl border-white/10 flex flex-col ${profile.role === UserRole.SPONSOR ? 'opacity-30 pointer-events-none' : ''}`}>
            <div className="flex items-center justify-between mb-5">
               <h3 className="text-[0.94rem] font-bold uppercase tracking-tight">Creator Portal</h3>
               <span className="bg-white/5 border border-white/10 px-2.5 py-1 text-[7.9px] uppercase">Vendor</span>
            </div>
            
            <div className="space-y-5 flex-grow">
              <p className="text-[12.2px] text-gray-400">List your available content inventory. Reach premium sponsors directly. <span className="text-white font-bold">(Max 7 Days in Advance)</span></p>
              
              <div className="space-y-4 pt-4 border-t border-white/5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[7.9px] uppercase text-gray-500 font-bold">Platform</label>
                    <select className="w-full bg-black border border-white/10 p-2 rounded text-[12.2px]" value={invData.platform} onChange={e => setInvData({...invData, platform: e.target.value as any})}>
                      <option>YouTube</option><option>Twitch</option><option>Facebook</option><option>X</option><option>Kick</option><option>Zora</option><option>PumpFun</option><option>Rumble</option><option>Instagram</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[7.9px] uppercase text-gray-500 font-bold">Category</label>
                    <select className="w-full bg-black border border-white/10 p-2 rounded text-[12.2px]" value={invData.category} onChange={e => setInvData({...invData, category: e.target.value as ContentCategory})}>
                      {Object.values(ContentCategory).map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[7.9px] uppercase text-gray-500 font-bold">Ad Position</label>
                    <select className="w-full bg-black border border-white/10 p-2 rounded text-[12.2px]" value={invData.adPosition} onChange={e => setInvData({...invData, adPosition: e.target.value as any})}>
                      <option value="top-left">Top Left</option>
                      <option value="top-right">Top Right</option>
                      <option value="bottom-left">Bottom Left</option>
                      <option value="bottom-right">Bottom Right</option>
                      <option value="center">Center</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[7.9px] uppercase text-gray-500 font-bold">Price (USDC)</label>
                    <input type="number" className="w-full bg-black border border-white/10 p-2 rounded text-[12.2px]" value={invData.priceSol} onChange={e => setInvData({...invData, priceSol: Number(e.target.value)})} required />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[7.9px] uppercase text-gray-500 font-bold">Scheduled Content Date</label>
                  <input type="datetime-local" min={minDateString} max={maxDateString} className="w-full bg-black border border-white/10 p-2 rounded text-[12.2px]" value={invData.streamTime} onChange={e => setInvData({...invData, streamTime: e.target.value})} required />
                </div>
                <div className="space-y-1">
                  <label className="text-[7.9px] uppercase text-gray-500 font-bold">Placement & Strategy Details (Long Form)</label>
                  <textarea placeholder="Explain your placement strategy, audience demographic, and how you will highlight the sponsor logo..." className="w-full bg-black border border-white/10 p-2 rounded text-[12.2px] h-32 resize-none" value={invData.placementDetail} onChange={e => setInvData({...invData, placementDetail: e.target.value})} required />
                </div>
              </div>
            </div>

            <button onClick={() => onListInventory(invData)} className="mt-8 bg-white text-black w-full py-3.5 font-bold uppercase text-[10.3px] flex items-center justify-center gap-2">
              <Icons.Plus /> List Inventory
            </button>
          </div>

          <div className={`glass p-7 rounded-xl border-white/10 flex flex-col ${profile.role === UserRole.CREATOR ? 'opacity-30 pointer-events-none' : ''}`}>
            <div className="flex items-center justify-between mb-5"><h3 className="text-[0.94rem] font-bold uppercase tracking-tight">Sponsor Portal</h3><span className="bg-white/5 border border-white/10 px-2.5 py-1 text-[7.9px] uppercase">Client</span></div>
            <div className="space-y-5 flex-grow">
              <p className="text-[12.2px] text-gray-400">Apply to become an authorized sponsor. Once approved, purchase listings instantly.</p>
              {sponsorApp?.status === SponsorStatus.APPROVED ? (
                <div className="p-4 bg-white/10 border border-white/20 rounded-lg flex items-center gap-3"><div className="w-7 h-7 rounded-full bg-white text-black flex items-center justify-center scale-90"><Icons.Check /></div><div><p className="text-[11.2px] font-bold uppercase">Account Verified</p><p className="text-[9.4px] text-gray-400">Access to Marketplace unlocked.</p></div></div>
              ) : sponsorApp?.status === SponsorStatus.PENDING ? (
                <div className="p-4 bg-white/5 border border-dashed border-white/20 rounded-lg"><p className="text-[11.2px] font-bold uppercase">Application Pending</p><p className="text-[9.4px] text-gray-400 mt-1">Review takes 24-48 hours. Notifications sent to CapitalCreatorMarketplace@gmail.com</p></div>
              ) : (
                <form className="space-y-4 pt-4 border-t border-white/5" onSubmit={(e) => { e.preventDefault(); onApplySponsor(appData); }}>
                  <div className="space-y-1"><label className="text-[7.9px] uppercase text-gray-500 font-bold">Contact Name</label><input type="text" className="w-full bg-black border border-white/10 p-2 rounded text-[12.2px]" value={appData.name} onChange={e => setAppData({...appData, name: e.target.value})} required /></div>
                  <div className="space-y-1"><label className="text-[7.9px] uppercase text-gray-500 font-bold">Company Name</label><input type="text" className="w-full bg-black border border-white/10 p-2 rounded text-[12.2px]" value={appData.companyName} onChange={e => setAppData({...appData, companyName: e.target.value})} required /></div>
                  <div className="space-y-1"><label className="text-[7.9px] uppercase text-gray-500 font-bold">Months in Business</label><input type="number" className="w-full bg-black border border-white/10 p-2 rounded text-[12.2px]" value={appData.monthsInBusiness} onChange={e => setAppData({...appData, monthsInBusiness: Number(e.target.value)})} required /></div>
                  <div className="space-y-1"><label className="text-[7.9px] uppercase text-gray-500 font-bold">Logo URL</label><input type="url" placeholder="https://..." className="w-full bg-black border border-white/10 p-2 rounded text-[12.2px]" value={appData.logoUrl} onChange={e => setAppData({...appData, logoUrl: e.target.value})} required /></div>
                  <button type="submit" className="w-full bg-white text-black py-3.5 mt-3 font-bold uppercase text-[10.3px] tracking-widest">Submit Application</button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; export default ProfileSetup;
