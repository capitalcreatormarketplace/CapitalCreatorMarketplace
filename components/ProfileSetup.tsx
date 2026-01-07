
import React, { useState, useRef } from 'react';
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  
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

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Simulate upload for UI demonstration
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, avatarUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const renderInitialSetup = () => (
    <div className="glass p-8 md:p-12 rounded-none border-white/20 animate-fadeIn space-y-10 relative overflow-hidden">
      {/* Decorative gold background element */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#BF953F]/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-[#BF953F]/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="text-center space-y-2 relative z-10">
        <h2 className="text-4xl font-black uppercase tracking-tighter text-white">System Initialization</h2>
        <p className="text-[#BF953F] font-bold uppercase tracking-[0.5em] text-[10px]">Configure your Capital Creator profile</p>
      </div>

      {formData.role === UserRole.UNDEFINED ? (
        <div className="space-y-6 relative z-10">
          <div className="text-center">
            <p className="text-[10px] uppercase text-zinc-400 font-black tracking-[0.4em]">[Step 1 of 2] Role Selection Required</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button 
              onClick={() => setFormData({...formData, role: UserRole.CREATOR})}
              className="group p-8 border-2 border-white/10 hover:border-[#BF953F]/40 hover:bg-[#BF953F]/5 transition-all space-y-3 text-left relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-100 transition-opacity">
                 <div className="w-12 h-12 border-t-2 border-r-2 border-[#BF953F]"></div>
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight text-white group-hover:text-[#F1EBD9]">Creator</h3>
              <p className="text-sm text-zinc-400">List your ad inventory, connect with sponsors, and earn revenue directly.</p>
            </button>
            <button 
              onClick={() => setFormData({...formData, role: UserRole.SPONSOR})}
              className="group p-8 border-2 border-white/10 hover:border-[#BF953F]/40 hover:bg-[#BF953F]/5 transition-all space-y-3 text-left relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-100 transition-opacity">
                 <div className="w-12 h-12 border-t-2 border-r-2 border-[#BF953F]"></div>
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight text-white group-hover:text-[#F1EBD9]">Sponsor</h3>
              <p className="text-sm text-zinc-400">Discover creators, purchase ad placements, and grow your brand's reach.</p>
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleProfileSubmit} className="space-y-10 relative z-10">
          <div className="text-center space-y-6">
            <div className="inline-block bg-white text-black px-4 py-1 text-[9px] font-black uppercase tracking-widest mb-2">
              [Step 2 of 2] Complete Your Profile
            </div>
            
            {/* Avatar Upload Circle */}
            <div className="flex flex-col items-center gap-4">
              <div 
                onClick={handleAvatarClick}
                className="relative w-36 h-36 rounded-full border-2 border-[#BF953F] flex items-center justify-center cursor-pointer group hover:bg-[#BF953F]/10 transition-all overflow-hidden bg-black/40 shadow-[0_0_40px_rgba(191,149,63,0.2)]"
              >
                {formData.avatarUrl ? (
                  <img src={formData.avatarUrl} alt="Preview" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                ) : (
                  <div className="text-center space-y-2">
                    <div className="text-[#BF953F] flex justify-center"><Icons.Plus className="w-8 h-8" /></div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-[#BF953F] group-hover:text-white">Upload Brand Logo</span>
                  </div>
                )}
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[8.5px] uppercase text-zinc-500 font-bold tracking-widest">Brand Name</label>
                <input type="text" placeholder="e.g. ChartMaster" className="w-full bg-black/60 border border-white/10 p-5 text-base font-bold focus:border-[#BF953F] outline-none text-white transition-all" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
              </div>
               <div className="space-y-3">
                <label className="text-[8.5px] uppercase text-zinc-500 font-bold tracking-widest">Primary Platform</label>
                <select 
                  className="w-full bg-black/60 border border-white/10 p-5 text-base font-bold focus:border-[#BF953F] outline-none text-white appearance-none cursor-pointer" 
                  value={formData.platform || 'YouTube'} 
                  onChange={e => setFormData({...formData, platform: e.target.value})}
                >
                  <option value="YouTube">YouTube</option>
                  <option value="Twitch">Twitch</option>
                  <option value="X">X (Twitter)</option>
                  <option value="Kick">Kick</option>
                  <option value="TikTok">TikTok</option>
                  <option value="Instagram">Instagram</option>
                  <option value="Zora">Zora</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[8.5px] uppercase text-zinc-500 font-bold tracking-widest">Primary Channel Link</label>
                <input type="url" placeholder="https://..." className="w-full bg-black/60 border border-white/10 p-5 text-base font-bold focus:border-[#BF953F] outline-none text-white transition-all" value={formData.channelLink} onChange={e => setFormData({...formData, channelLink: e.target.value})} required />
              </div>
              <div className="space-y-3">
                <label className="text-[8.5px] uppercase text-zinc-500 font-bold tracking-widest">Category / Niche</label>
                <select 
                   className="w-full bg-black/60 border border-white/10 p-5 text-base font-bold focus:border-[#BF953F] outline-none text-white appearance-none cursor-pointer" 
                   value={formData.niche || ContentCategory.CRYPTO} 
                   onChange={e => setFormData({...formData, niche: e.target.value})}
                >
                  {Object.values(ContentCategory).map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[8.5px] uppercase text-zinc-500 font-bold tracking-widest">Location / Timezone</label>
                <input type="text" placeholder="e.g. UTC-5 / New York" className="w-full bg-black/60 border border-white/10 p-5 text-base font-bold focus:border-[#BF953F] outline-none text-white transition-all" value={formData.timezone} onChange={e => setFormData({...formData, timezone: e.target.value})} />
              </div>
              <div className="space-y-3">
                <label className="text-[8.5px] uppercase text-zinc-500 font-bold tracking-widest">Streaming Schedule</label>
                <input type="text" placeholder="e.g. Mon-Fri 6PM-10PM EST" className="w-full bg-black/60 border border-white/10 p-5 text-base font-bold focus:border-[#BF953F] outline-none text-white transition-all" value={formData.schedule} onChange={e => setFormData({...formData, schedule: e.target.value})} />
              </div>
            </div>

            <div className="space-y-3 pt-4">
               <label className="text-[8.5px] uppercase text-zinc-500 font-bold tracking-widest">Biography / Project Description</label>
              <textarea placeholder="Briefly describe your channel and audience demographics..." className="w-full bg-black/60 border border-white/10 p-5 min-h-[140px] text-sm focus:border-[#BF953F] outline-none text-white transition-all resize-none" value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} required />
            </div>

            <div className="flex justify-between items-center pt-10 border-t border-white/5">
              <button 
                type="button"
                onClick={() => setFormData({...profile, role: UserRole.UNDEFINED})} 
                className="text-[10px] uppercase font-black tracking-[0.4em] text-zinc-500 hover:text-white transition-colors"
              >
                Back
              </button>
              <button type="submit" className="bg-white text-black px-14 py-6 font-black uppercase text-[12px] tracking-widest hover:bg-[#BF953F] hover:text-white transition-all shadow-[0_0_40px_rgba(255,255,255,0.1)]">
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
          <div className="w-20 h-20 bg-black border border-[#BF953F]/30 rounded-full flex items-center justify-center overflow-hidden shrink-0 shadow-[0_0_15px_rgba(191,149,63,0.1)]">
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl font-bold text-[#BF953F] opacity-50">{profile.name.slice(0,2).toUpperCase()}</span>
            )}
          </div>
          
          <div className="flex-grow w-full">
            <div className="space-y-5">
              <div className="flex items-start justify-between border-b border-white/5 pb-5">
                <div>
                  <h2 className="text-3xl font-black uppercase tracking-tighter text-white">{profile.name}</h2>
                  <div className="flex items-center gap-3 mt-1">
                    <p className="mono text-[7.9px] opacity-30 uppercase tracking-widest">{profile.address}</p>
                    <span className="text-[8px] bg-[#BF953F]/10 text-[#BF953F] px-2 py-0.5 font-black uppercase tracking-widest border border-[#BF953F]/20">{profile.platform}</span>
                  </div>
                </div>
                <button onClick={() => { setIsEditing(true); setFormData(profile); }} className="text-[7.9px] text-zinc-500 hover:text-[#BF953F] hover:border-[#BF953F] uppercase font-bold tracking-widest border border-white/10 px-4 py-2 hover:bg-white/5 transition-all">Edit Profile</button>
              </div>
              {profile.role === UserRole.CREATOR && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-2">
                  <div className="space-y-1"><p className="text-[7.9px] uppercase text-zinc-500 font-black tracking-widest">Revenue</p><p className="text-xl font-mono font-bold text-white">${profile.revenueEarned?.toLocaleString()}</p></div>
                  <div className="space-y-1"><p className="text-[7.9px] uppercase text-zinc-500 font-black tracking-widest">Hires</p><p className="text-xl font-mono font-bold text-white">{profile.timesHired}</p></div>
                  <div className="space-y-1"><p className="text-[7.9px] uppercase text-zinc-500 font-black tracking-widest">Audience</p><p className="text-xl font-mono font-bold text-white">{profile.avgAudienceSize?.toLocaleString()}</p></div>
                  <div className="space-y-1"><p className="text-[7.9px] uppercase text-zinc-500 font-black tracking-widest">Niche</p><p className="text-xl font-bold text-[#BF953F] uppercase tracking-tighter">{profile.niche}</p></div>
                </div>
              )}
              <div className="pt-2">
                <p className="text-zinc-400 leading-relaxed text-sm italic max-w-2xl">{profile.bio}</p>
                {profile.channelLink && (
                   <a href={profile.channelLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-[9px] text-[#BF953F] font-black uppercase tracking-widest mt-4 hover:underline">
                     Visit Channel <Icons.External className="w-3 h-3" />
                   </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Creator Portal */}
        <div className={`glass p-7 rounded-none border-white/10 flex flex-col transition-opacity ${profile.role !== UserRole.CREATOR ? 'opacity-30 pointer-events-none' : ''}`}>
          <div className="flex items-center justify-between mb-5">
             <h3 className="text-[0.94rem] font-bold uppercase tracking-tight text-white">Creator Portal</h3>
             <span className="bg-white/5 border border-white/10 px-2.5 py-1 text-[7.9px] uppercase text-[#BF953F] font-black tracking-widest">Vendor</span>
          </div>
          
          <div className="space-y-5 flex-grow">
            <p className="text-sm text-gray-400">List your available content inventory. Reach premium sponsors directly. <span className="text-white font-bold">(Max 7 Days in Advance)</span></p>
            
            <div className="space-y-4 pt-4 border-t border-white/5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[7.9px] uppercase text-gray-500 font-bold">Platform</label>
                  <select className="w-full bg-black border border-white/10 p-2 text-sm text-white" value={invData.platform} onChange={e => setInvData({...invData, platform: e.target.value as any})}>
                    <option>YouTube</option><option>Twitch</option><option>Facebook</option><option>X</option><option>Kick</option><option>Zora</option><option>PumpFun</option><option>Rumble</option><option>Instagram</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[7.9px] uppercase text-gray-500 font-bold">Category</label>
                  <select className="w-full bg-black border border-white/10 p-2 text-sm text-white" value={invData.category} onChange={e => setInvData({...invData, category: e.target.value as ContentCategory})}>
                    {Object.values(ContentCategory).map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[7.9px] uppercase text-gray-500 font-bold">Ad Position</label>
                  <select className="w-full bg-black border border-white/10 p-2 text-sm text-white" value={invData.adPosition} onChange={e => setInvData({...invData, adPosition: e.target.value as any})}>
                    <option value="top-left">Top Left</option>
                    <option value="top-right">Top Right</option>
                    <option value="bottom-left">Bottom Left</option>
                    <option value="bottom-right">Bottom Right</option>
                    <option value="center">Center</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[7.9px] uppercase text-gray-500 font-bold">Price (USDC)</label>
                  <input type="number" className="w-full bg-black border border-white/10 p-2 text-sm text-white" value={invData.priceSol} onChange={e => setInvData({...invData, priceSol: Number(e.target.value)})} required />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[7.9px] uppercase text-gray-500 font-bold">Scheduled Content Date</label>
                <input type="datetime-local" min={minDateString} max={maxDateString} className="w-full bg-black border border-white/10 p-2 text-sm text-white" value={invData.streamTime} onChange={e => setInvData({...invData, streamTime: e.target.value})} required />
              </div>
              <div className="space-y-1">
                <label className="text-[7.9px] uppercase text-gray-500 font-bold">Placement & Strategy Details (Long Form)</label>
                <textarea placeholder="Explain your placement strategy, audience demographic, and how you will highlight the sponsor logo..." className="w-full bg-black border border-white/10 p-2 text-sm h-32 resize-none text-white" value={invData.placementDetail} onChange={e => setInvData({...invData, placementDetail: e.target.value})} required />
              </div>
            </div>
          </div>

          <button onClick={() => onListInventory(invData)} className="mt-8 bg-white text-black w-full py-3.5 font-bold uppercase text-sm flex items-center justify-center gap-2 hover:bg-[#BF953F] hover:text-white transition-all disabled:opacity-50" disabled={profile.role !== UserRole.CREATOR}>
            <Icons.Plus /> List Inventory
          </button>
        </div>

        {/* Sponsor Portal */}
        <div className={`glass p-7 rounded-none border-white/10 flex flex-col transition-opacity ${profile.role !== UserRole.SPONSOR ? 'opacity-30 pointer-events-none' : ''}`}>
          <div className="flex items-center justify-between mb-5"><h3 className="text-[0.94rem] font-bold uppercase tracking-tight text-white">Sponsor Portal</h3><span className="bg-white/5 border border-white/10 px-2.5 py-1 text-[7.9px] uppercase text-[#BF953F] font-black tracking-widest">Client</span></div>
          <div className="space-y-5 flex-grow">
            <p className="text-sm text-gray-400">Apply to become an authorized sponsor. Once approved, purchase listings instantly.</p>
            {sponsorApp?.status === SponsorStatus.APPROVED ? (
              <div className="p-4 bg-white/10 border border-[#BF953F]/40 flex items-center gap-3 h-full"><div className="w-7 h-7 rounded-none bg-[#BF953F] text-white flex items-center justify-center scale-90 shadow-[0_0_10px_rgba(191,149,63,0.5)]"><Icons.Check /></div><div><p className="text-sm font-bold uppercase text-[#F1EBD9]">Account Verified</p><p className="text-xs text-gray-400 mt-0.5">Access to Marketplace unlocked.</p></div></div>
            ) : sponsorApp?.status === SponsorStatus.PENDING ? (
              <div className="p-4 bg-white/5 border border-dashed border-white/20 h-full"><p className="text-sm font-bold uppercase text-white">Application Pending</p><p className="text-xs text-gray-400 mt-1">Review takes 24-48 hours. Notifications sent to terminal dashboard.</p></div>
            ) : (
              <form className="space-y-4 pt-4 border-t border-white/5" onSubmit={(e) => { e.preventDefault(); onApplySponsor(appData); }}>
                <div className="space-y-1"><label className="text-[7.9px] uppercase text-gray-500 font-bold">Contact Name</label><input type="text" className="w-full bg-black border border-white/10 p-2 text-sm text-white" value={appData.name} onChange={e => setAppData({...appData, name: e.target.value})} required /></div>
                <div className="space-y-1"><label className="text-[7.9px] uppercase text-gray-500 font-bold">Company Name</label><input type="text" className="w-full bg-black border border-white/10 p-2 text-sm text-white" value={appData.companyName} onChange={e => setAppData({...appData, companyName: e.target.value})} required /></div>
                <div className="space-y-1"><label className="text-[7.9px] uppercase text-gray-500 font-bold">Months in Business</label><input type="number" className="w-full bg-black border border-white/10 p-2 text-sm text-white" value={appData.monthsInBusiness} onChange={e => setAppData({...appData, monthsInBusiness: Number(e.target.value)})} required /></div>
                <div className="space-y-1"><label className="text-[7.9px] uppercase text-gray-500 font-bold">Logo URL</label><input type="url" placeholder="https://..." className="w-full bg-black border border-white/10 p-2 text-sm text-white" value={appData.logoUrl} onChange={e => setAppData({...appData, logoUrl: e.target.value})} required /></div>
                <button type="submit" className="w-full bg-white text-black py-3.5 mt-3 font-bold uppercase text-sm tracking-widest hover:bg-[#BF953F] hover:text-white transition-all">Submit Application</button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 

export default ProfileSetup;
