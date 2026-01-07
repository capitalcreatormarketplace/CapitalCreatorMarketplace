
import React, { useState, useRef, useMemo } from 'react';
import { UserProfile, UserRole, SponsorApplication, SponsorStatus, ContentCategory, AdPosition } from '../types';
import { Icons } from '../constants';
import { processPayment } from '../services/solana';

interface ProfileSetupProps {
  profile: UserProfile;
  sponsorApp?: SponsorApplication;
  onSaveProfile: (profile: UserProfile) => void;
  onApplySponsor: (app: SponsorApplication) => void;
  onListInventory: (item: any) => void;
}

const PLATFORM_OPTIONS = ['YouTube', 'Twitch', 'Facebook', 'X', 'Kick', 'Zora', 'PumpFun', 'Rumble', 'Instagram', 'TikTok', 'Discord', 'Other'];

const ProfileSetup: React.FC<ProfileSetupProps> = ({ profile, sponsorApp, onSaveProfile, onApplySponsor, onListInventory }) => {
  const [isEditing, setIsEditing] = useState(!profile.name);
  const [formData, setFormData] = useState<UserProfile>(profile);
  const [isListing, setIsListing] = useState(false);
  const [isAuthorizingX, setIsAuthorizingX] = useState(false);
  const [showXOverlay, setShowXOverlay] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamImgRef = useRef<HTMLInputElement>(null);
  
  const [appData, setAppData] = useState<SponsorApplication>(
    sponsorApp || {
      name: '',
      companyName: '',
      monthsInBusiness: 0,
      logoUrl: '',
      status: SponsorStatus.NONE
    }
  );

  // Calendar & Time Logic
  const availableDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      days.push(d);
    }
    return days;
  }, []);

  const [selectedDayIdx, setSelectedDayIdx] = useState<number>(0);
  const [selectedTime, setSelectedTime] = useState({
    hour: '12',
    minute: '00',
    period: 'PM',
    timezone: 'UTC'
  });

  const timezones = [
    { label: 'UTC', offset: 0 },
    { label: 'EST (UTC-5)', offset: -5 },
    { label: 'CST (UTC-6)', offset: -6 },
    { label: 'MST (UTC-7)', offset: -7 },
    { label: 'PST (UTC-8)', offset: -8 },
    { label: 'GMT (UTC+0)', offset: 0 },
    { label: 'CET (UTC+1)', offset: 1 },
    { label: 'EET (UTC+2)', offset: 2 },
    { label: 'MSK (UTC+3)', offset: 3 },
    { label: 'IST (UTC+5.5)', offset: 5.5 },
    { label: 'JST (UTC+9)', offset: 9 },
    { label: 'AEDT (UTC+11)', offset: 11 },
  ];

  const [invData, setInvData] = useState({
    streamTime: '', 
    placementDetail: '',
    priceSol: 100, 
    platforms: [] as string[],
    category: ContentCategory.CRYPTO,
    adPosition: 'bottom-right' as AdPosition,
    streamPreviewUrl: ''
  });

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.isXVerified) {
      alert("Please authorize your X account to prove your identity first.");
      return;
    }
    onSaveProfile(formData);
    setIsEditing(false);
  };

  const handleAuthorizeX = () => {
    setIsAuthorizingX(true);
    setShowXOverlay(true);
    
    // Simulating X OAuth process
    // In a real environment, this triggers a redirect to X for auth.
    // Upon callback, we fetch the verified handle.
    setTimeout(() => {
      const verifiedHandle = "verifiedcreator"; 
      
      setFormData({
        ...formData,
        name: verifiedHandle.toUpperCase(), // LOCK IN the verified handle as the account name
        isXVerified: true,
        xHandle: `@${verifiedHandle}`,
        channelLink: `https://x.com/${verifiedHandle}`
      });
      setIsAuthorizingX(false);
      setShowXOverlay(false);
    }, 3200);
  };

  const handleTogglePlatform = (p: string, isProfile: boolean = false) => {
    if (isProfile) {
      const current = formData.platforms || [];
      const updated = current.includes(p) ? current.filter(x => x !== p) : [...current, p];
      setFormData({...formData, platforms: updated});
    } else {
      const current = invData.platforms;
      const updated = current.includes(p) ? current.filter(x => x !== p) : [...current, p];
      setInvData({...invData, platforms: updated});
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, avatarUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStreamPreviewUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setInvData({ ...invData, streamPreviewUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleListSubmit = async () => {
    if (!invData.streamPreviewUrl) {
      alert("Please upload a stream preview image first.");
      return;
    }
    if (invData.platforms.length === 0) {
      alert("Please select at least one broadcast host.");
      return;
    }

    const d = new Date(availableDays[selectedDayIdx]);
    let hourNum = parseInt(selectedTime.hour);
    if (selectedTime.period === 'PM' && hourNum !== 12) hourNum += 12;
    if (selectedTime.period === 'AM' && hourNum === 12) hourNum = 0;
    
    d.setHours(hourNum, parseInt(selectedTime.minute), 0, 0);

    const tz = timezones.find(t => t.label === selectedTime.timezone) || timezones[0];
    const utcTime = new Date(d.getTime() - (tz.offset * 60 * 60 * 1000));
    
    const finalStreamTime = utcTime.toISOString();

    setIsListing(true);
    try {
      const result = await processPayment(profile.address, 0.01);
      if (result.success) {
        onListInventory({ ...invData, streamTime: finalStreamTime });
      }
    } catch (e) {
      console.error(e);
      alert("Spam prevention payment failed. Check your wallet.");
    } finally {
      setIsListing(false);
    }
  };

  const getPositionClasses = (pos: AdPosition) => {
    switch (pos) {
      case 'top-left': return 'top-4 left-4';
      case 'top-center': return 'top-4 left-1/2 -translate-x-1/2';
      case 'top-right': return 'top-4 right-4';
      case 'bottom-left': return 'bottom-4 left-4';
      case 'bottom-center': return 'bottom-4 left-1/2 -translate-x-1/2';
      case 'bottom-right': return 'bottom-4 right-4';
      default: return '';
    }
  };

  if (isEditing || !profile.name) {
    return (
      <div className="max-w-4xl mx-auto py-12 md:py-20 animate-fadeIn relative">
        {showXOverlay && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-2xl animate-fadeIn">
            <div className="text-center space-y-12 max-w-sm">
              <div className="relative w-32 h-32 mx-auto flex items-center justify-center">
                 <div className="absolute inset-0 border-2 border-white/5 rounded-full scale-110"></div>
                 <div className="absolute inset-0 border-t-2 border-[#1DA1F2] rounded-full animate-spin"></div>
                 <Icons.X className="w-12 h-12 text-white" />
              </div>
              <div className="space-y-4">
                <h3 className="text-2xl font-black uppercase tracking-[0.25em] text-white">X Handshake Protocol</h3>
                <p className="text-[10px] text-zinc-500 uppercase tracking-[0.5em] leading-relaxed">Identity verification in progress... <br/> Fetching authorized profile metadata.</p>
              </div>
            </div>
          </div>
        )}

        <div className="glass p-8 md:p-12 rounded-none border-white/20 animate-fadeIn space-y-10 relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#BF953F]/10 rounded-full blur-3xl pointer-events-none"></div>

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
                <button onClick={() => setFormData({...formData, role: UserRole.CREATOR})} className="group p-8 border-2 border-white/10 hover:border-[#BF953F]/40 hover:bg-[#BF953F]/5 transition-all space-y-3 text-left relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-100 transition-opacity">
                    <div className="w-12 h-12 border-t-2 border-r-2 border-[#BF953F]"></div>
                  </div>
                  <h3 className="text-xl font-black uppercase tracking-tight text-white group-hover:text-[#F1EBD9]">Creator</h3>
                  <p className="text-sm text-zinc-400">List your ad inventory, connect with sponsors, and earn revenue directly.</p>
                </button>
                <button onClick={() => setFormData({...formData, role: UserRole.SPONSOR})} className="group p-8 border-2 border-white/10 hover:border-[#BF953F]/40 hover:bg-[#BF953F]/5 transition-all space-y-3 text-left relative overflow-hidden">
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
                <div className="flex flex-col items-center gap-4">
                  <div onClick={handleAvatarClick} className="relative w-36 h-36 rounded-full border-2 border-[#BF953F] flex items-center justify-center cursor-pointer group hover:bg-[#BF953F]/10 transition-all overflow-hidden bg-black/40 shadow-[0_0_40px_rgba(191,149,63,0.2)]">
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
                    <label className="text-[8.5px] uppercase text-zinc-500 font-bold tracking-widest">
                      {formData.isXVerified ? 'Verified Account (Locked)' : 'Brand Name'}
                    </label>
                    <input 
                      type="text" 
                      placeholder="e.g. ChartMaster" 
                      disabled={formData.isXVerified}
                      className={`w-full bg-black/60 border p-5 text-base font-bold outline-none transition-all ${formData.isXVerified ? 'border-[#1DA1F2]/60 text-[#1DA1F2] opacity-90 cursor-not-allowed' : 'border-white/10 focus:border-[#BF953F] text-white'}`} 
                      value={formData.name} 
                      onChange={e => setFormData({...formData, name: e.target.value})} 
                      required 
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[8.5px] uppercase text-zinc-500 font-bold tracking-widest">Broadcast Cluster (Select Multiple)</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {PLATFORM_OPTIONS.map(p => {
                        const isSel = (formData.platforms || []).includes(p);
                        return (
                          <button 
                            key={p} 
                            type="button"
                            onClick={() => handleTogglePlatform(p, true)}
                            className={`p-3 border text-[9px] font-black uppercase tracking-widest transition-all ${isSel ? 'bg-[#BF953F] text-black border-[#BF953F] shadow-[0_0_10px_rgba(191,149,63,0.3)]' : 'bg-black/40 text-zinc-500 border-white/10 hover:border-white/30'}`}
                          >
                            {p}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[8.5px] uppercase text-zinc-500 font-bold tracking-widest">Identity Proof (Primary)</label>
                    {formData.isXVerified ? (
                      <div className="w-full bg-[#080a0c] border-2 border-[#1DA1F2] p-5 pt-7 flex items-center justify-between group transition-all relative overflow-visible h-[100px] shadow-[0_0_20px_rgba(29,161,242,0.1)]">
                        {/* High fidelity "IDENTITY VERIFIED" tab matching screenshot */}
                        <div className="absolute -top-[1px] -right-[1px] px-8 py-2.5 bg-[#1DA1F2] text-black font-black text-[11px] uppercase tracking-[0.05em] z-10 shadow-[0_2px_10px_rgba(0,0,0,0.3)]">
                          IDENTITY VERIFIED
                        </div>
                        
                        <div className="flex items-center gap-6">
                           <div className="text-[#1DA1F2] drop-shadow-[0_0_12px_rgba(29,161,242,0.8)]">
                              <Icons.Check className="w-10 h-10" strokeWidth={5} />
                           </div>
                           <div className="space-y-1">
                             <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#1DA1F2] opacity-90">Verified X Terminal</p>
                             <p className="text-3xl font-black text-white leading-none tracking-tight">{formData.xHandle}</p>
                           </div>
                        </div>
                        
                        <button 
                          type="button" 
                          onClick={() => setFormData({...formData, isXVerified: false, xHandle: '', name: ''})} 
                          className="text-[11px] text-zinc-500 hover:text-white uppercase font-black tracking-widest transition-colors pr-2 mt-4"
                        >
                          RESET
                        </button>
                      </div>
                    ) : (
                      <button 
                        type="button"
                        onClick={handleAuthorizeX}
                        disabled={isAuthorizingX}
                        className="w-full bg-black border-2 border-white/10 p-5 flex items-center justify-center gap-4 hover:border-[#1DA1F2] hover:bg-[#1DA1F2]/5 transition-all group overflow-hidden relative min-h-[100px]"
                      >
                        {isAuthorizingX ? (
                          <div className="flex items-center gap-3 animate-pulse">
                            <div className="w-2 h-2 bg-[#1DA1F2] rounded-full"></div>
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white">Handshaking with X...</span>
                          </div>
                        ) : (
                          <>
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                            <Icons.X className="w-6 h-6 text-white" />
                            <span className="text-[11px] font-black uppercase tracking-[0.4em] text-white">Authorize X to Prove Identity</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                  <div className="space-y-3">
                    <label className="text-[8.5px] uppercase text-zinc-500 font-bold tracking-widest">Category / Niche</label>
                    <select className="w-full bg-black/60 border border-white/10 p-5 text-base font-bold focus:border-[#BF953F] outline-none text-white appearance-none cursor-pointer h-[100px]" value={formData.niche || ContentCategory.CRYPTO} onChange={e => setFormData({...formData, niche: e.target.value})}>
                      {Object.values(ContentCategory).map(cat => (<option key={cat} value={cat}>{cat}</option>))}
                    </select>
                  </div>
                </div>
                <div className="space-y-3 pt-4">
                  <label className="text-[8.5px] uppercase text-zinc-500 font-bold tracking-widest">Biography / Project Description</label>
                  <textarea placeholder="Briefly describe your channel and audience demographics..." className="w-full bg-black/60 border border-white/10 p-5 min-h-[140px] text-sm focus:border-[#BF953F] outline-none text-white transition-all resize-none" value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} required />
                </div>
                <div className="flex justify-between items-center pt-10 border-t border-white/5">
                  <button type="button" onClick={() => setFormData({...profile, role: UserRole.UNDEFINED})} className="text-[10px] uppercase font-black tracking-[0.4em] text-zinc-500 hover:text-white transition-colors">Back</button>
                  <button type="submit" className="bg-white text-black px-14 py-6 font-black uppercase text-[12px] tracking-widest hover:bg-[#BF953F] hover:text-white transition-all shadow-[0_0_40px_rgba(255,255,255,0.1)]">Save & Initialize Profile</button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-12 py-8 animate-fadeIn pb-20">
      <section className="glass p-10 rounded-none border-white/20">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-10">
          <div className="w-32 h-32 bg-black border-2 border-[#BF953F] rounded-full flex items-center justify-center overflow-hidden shrink-0 shadow-[0_0_40px_rgba(191,149,63,0.2)]">
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-4xl font-black text-[#BF953F] opacity-50">{profile.name.slice(0,2).toUpperCase()}</span>
            )}
          </div>
          <div className="flex-grow w-full text-center md:text-left">
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row items-center justify-between border-b border-white/5 pb-8 gap-6">
                <div>
                  <div className="flex items-center justify-center md:justify-start gap-3">
                    <h2 className="text-5xl font-black uppercase tracking-tighter text-white leading-none">{profile.name}</h2>
                    {profile.isXVerified && (
                      <div className="text-[#1DA1F2] flex items-center" title="X Verified Identity">
                        <Icons.Check className="w-8 h-8 drop-shadow-[0_0_15px_rgba(29,161,242,0.6)]" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-4">
                    <p className="mono text-[9px] opacity-40 uppercase tracking-[0.3em] font-bold">{profile.address}</p>
                    <div className="flex flex-wrap gap-2">
                      {(profile.platforms || []).map(p => (
                        <span key={p} className="text-[10px] bg-[#BF953F]/10 text-[#BF953F] px-4 py-1.5 font-black uppercase tracking-widest border border-[#BF953F]/20">{p}</span>
                      ))}
                    </div>
                    <span className="text-[10px] bg-white/5 text-zinc-400 px-4 py-1.5 font-black uppercase tracking-widest border border-white/10">{profile.role} STATION</span>
                  </div>
                </div>
                <button onClick={() => { setIsEditing(true); setFormData(profile); }} className="text-[10px] text-zinc-500 hover:text-[#BF953F] hover:border-[#BF953F] uppercase font-black tracking-[0.4em] border border-white/10 px-8 py-4 hover:bg-white/5 transition-all">Edit Identity</button>
              </div>
              {profile.role === UserRole.CREATOR && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 py-4">
                  <div className="space-y-2"><p className="text-[10px] uppercase text-zinc-500 font-black tracking-widest">Revenue (On-Chain)</p><p className="text-3xl font-mono font-bold text-white">${profile.revenueEarned?.toLocaleString()}</p></div>
                  <div className="space-y-2"><p className="text-[10px] uppercase text-zinc-500 font-black tracking-widest">Active Hires</p><p className="text-3xl font-mono font-bold text-white">{profile.timesHired}</p></div>
                  <div className="space-y-2"><p className="text-[10px] uppercase text-zinc-500 font-black tracking-widest">Avg Concurrent</p><p className="text-3xl font-mono font-bold text-white">{profile.avgAudienceSize?.toLocaleString()}</p></div>
                  <div className="space-y-2"><p className="text-[10px] uppercase text-zinc-500 font-black tracking-widest">Target Niche</p><p className="text-3xl font-bold text-[#BF953F] uppercase tracking-tighter">{profile.niche}</p></div>
                </div>
              )}
              <div className="pt-4">
                <p className="text-zinc-400 leading-relaxed text-lg italic max-w-4xl border-l-4 border-[#BF953F]/30 pl-8 py-4 bg-white/5">{profile.bio}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="animate-fadeIn">
        {profile.role === UserRole.CREATOR ? (
          <div className="glass p-12 rounded-none border-white/10 flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4">
               <span className="bg-[#BF953F] text-black px-6 py-2 text-[10px] font-black uppercase tracking-[0.5em] shadow-[0_0_20px_rgba(191,149,63,0.3)]">CREATOR COMMAND</span>
            </div>
            
            <div className="flex flex-col lg:flex-row gap-20">
              <div className="lg:w-1/3 space-y-10">
                <div className="space-y-4">
                  <h3 className="text-3xl font-black uppercase tracking-tight text-white">Broadcast Inventory</h3>
                  <p className="text-sm text-gray-400 leading-relaxed uppercase tracking-wider font-bold">Deploy your content slots to the marketplace terminal. High visibility for premium sponsors.</p>
                </div>
                <div className="p-8 bg-[#BF953F]/5 border-2 border-[#BF953F]/20 space-y-6">
                  <div className="flex items-center gap-4 text-[#BF953F]">
                    <div className="w-1.5 h-1.5 bg-[#BF953F] rounded-full animate-pulse"></div>
                    <p className="text-[12px] font-black uppercase tracking-[0.4em]">Protocol Parameters</p>
                  </div>
                  <ul className="text-[12px] text-zinc-400 space-y-4 uppercase font-bold tracking-widest">
                    <li className="flex justify-between"><span>Max Lookahead</span> <span className="text-white">7 Days</span></li>
                    <li className="flex justify-between"><span>Listing Fee</span> <span className="text-[#BF953F]">$0.01 USDC</span></li>
                    <li className="flex justify-between"><span>Creator Cut</span> <span className="text-white">90%</span></li>
                    <li className="flex justify-between"><span>Protocol Fee</span> <span className="text-white">10%</span></li>
                  </ul>
                  <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest italic">* $0.01 anti-spam verification fee applied to all broadcasts.</p>
                </div>
              </div>

              <div className="lg:w-2/3 space-y-10">
                <div className="space-y-3">
                  <label className="text-[10px] uppercase text-gray-500 font-black tracking-widest">1. Upload Stream Environment Preview</label>
                  <div onClick={() => streamImgRef.current?.click()} className="relative aspect-video w-full bg-black border-2 border-dashed border-white/10 flex items-center justify-center cursor-pointer group hover:border-[#BF953F]/40 transition-all overflow-hidden">
                    {invData.streamPreviewUrl ? (
                      <>
                        <img src={invData.streamPreviewUrl} className="w-full h-full object-cover" alt="Stream Preview" />
                        <div className={`absolute ${getPositionClasses(invData.adPosition)} z-10 bg-white/40 backdrop-blur-md border border-white px-3 py-1.5 text-[10px] text-black font-black uppercase tracking-tighter shadow-2xl animate-pulse`}>YOUR LOGO HERE</div>
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"><span className="text-white font-black uppercase tracking-widest text-xs">Change Preview</span></div>
                      </>
                    ) : (
                      <div className="text-center space-y-2 opacity-50 group-hover:opacity-100">
                        <Icons.Plus className="w-10 h-10 mx-auto text-zinc-500" />
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Click to upload stream layout</p>
                      </div>
                    )}
                    <input type="file" ref={streamImgRef} className="hidden" accept="image/*" onChange={handleStreamPreviewUpload} />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] uppercase text-gray-500 font-black tracking-widest">2. Select Ad Placement Position</label>
                  <div className="grid grid-cols-3 gap-4">
                    {(['top-left', 'top-center', 'top-right', 'bottom-left', 'bottom-center', 'bottom-right'] as AdPosition[]).map(pos => (
                      <button key={pos} onClick={() => setInvData({...invData, adPosition: pos})} className={`p-4 border text-[9px] font-black uppercase tracking-widest transition-all ${invData.adPosition === pos ? 'bg-[#BF953F] text-black border-[#BF953F]' : 'bg-white/5 text-zinc-500 border-white/5 hover:border-white/20'}`}>{pos.replace('-', ' ')}</button>
                    ))}
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-[10px] uppercase text-gray-500 font-black tracking-widest">3. Select Broadcast Date (Next 7 Days)</label>
                    <div className="grid grid-cols-4 md:grid-cols-7 gap-3">
                      {availableDays.map((date, idx) => {
                        const isSelected = selectedDayIdx === idx;
                        return (
                          <button 
                            key={idx}
                            onClick={() => setSelectedDayIdx(idx)}
                            className={`flex flex-col items-center justify-center py-5 border transition-all ${isSelected ? 'bg-[#BF953F] border-[#BF953F] shadow-[0_0_15px_rgba(191,149,63,0.3)]' : 'bg-white/5 border-white/10 hover:border-white/30'}`}
                          >
                            <span className={`text-[8px] font-black uppercase tracking-widest ${isSelected ? 'text-black' : 'text-zinc-500'}`}>{date.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                            <span className={`text-xl font-black mt-1 ${isSelected ? 'text-black' : 'text-white'}`}>{date.getDate()}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] uppercase text-gray-500 font-black tracking-widest">4. Select Event Start Time & Zone</label>
                    <div className="flex flex-wrap gap-4">
                      <select className="bg-black/60 border border-white/10 p-4 text-white font-bold outline-none flex-1 focus:border-[#BF953F] min-w-[80px]" value={selectedTime.hour} onChange={e => setSelectedTime({...selectedTime, hour: e.target.value})}>
                        {Array.from({length: 12}, (_, i) => String(i + 1).padStart(2, '0')).map(h => <option key={h} value={h}>{h}</option>)}
                      </select>
                      <select className="bg-black/60 border border-white/10 p-4 text-white font-bold outline-none flex-1 focus:border-[#BF953F] min-w-[80px]" value={selectedTime.minute} onChange={e => setSelectedTime({...selectedTime, minute: e.target.value})}>
                        {['00', '15', '30', '45'].map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                      <select className="bg-black/60 border border-white/10 p-4 text-white font-bold outline-none flex-1 focus:border-[#BF953F] min-w-[80px]" value={selectedTime.period} onChange={e => setSelectedTime({...selectedTime, period: e.target.value})}>
                        <option value="AM">AM</option><option value="PM">PM</option>
                      </select>
                      <select className="bg-black/60 border border-white/10 p-4 text-white font-bold outline-none flex-[2] focus:border-[#BF953F] min-w-[150px]" value={selectedTime.timezone} onChange={e => setSelectedTime({...selectedTime, timezone: e.target.value})}>
                        {timezones.map(tz => <option key={tz.label} value={tz.label}>{tz.label}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-4 border-t border-white/5">
                  <div className="space-y-3">
                    <label className="text-[10px] uppercase text-gray-500 font-black tracking-widest">Streaming Host Cluster (Select All Applicable)</label>
                    <div className="grid grid-cols-3 gap-2">
                      {PLATFORM_OPTIONS.map(p => {
                        const isSel = invData.platforms.includes(p);
                        return (
                          <button 
                            key={p} 
                            type="button"
                            onClick={() => handleTogglePlatform(p, false)}
                            className={`p-3 border text-[9px] font-black uppercase tracking-widest transition-all ${isSel ? 'bg-[#BF953F] text-black border-[#BF953F] shadow-[0_0_10px_rgba(191,149,63,0.3)]' : 'bg-black/40 text-zinc-500 border-white/10 hover:border-white/30'}`}
                          >
                            {p}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] uppercase text-gray-500 font-black tracking-widest">Listing Value (USDC)</label>
                    <input type="number" className="w-full bg-black/60 border border-white/10 p-5 text-base text-white focus:border-[#BF953F] outline-none transition-all font-bold" value={invData.priceSol} onChange={e => setInvData({...invData, priceSol: Number(e.target.value)})} required />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] uppercase text-gray-500 font-black tracking-widest">Integration Strategy Detail</label>
                  <textarea placeholder="Explain your placement strategy, audience demographic, and how you will highlight the sponsor logo..." className="w-full bg-black/60 border border-white/10 p-6 text-base h-40 resize-none text-white focus:border-[#BF953F] outline-none transition-all leading-relaxed" value={invData.placementDetail} onChange={e => setInvData({...invData, placementDetail: e.target.value})} required />
                </div>

                <div className="pt-10">
                  <button onClick={handleListSubmit} disabled={isListing} className="w-full bg-white text-black py-8 font-black uppercase text-[14px] tracking-[0.5em] flex flex-col items-center justify-center gap-1 hover:bg-[#BF953F] hover:text-white transition-all shadow-[0_0_50px_rgba(255,255,255,0.1)] disabled:opacity-50">
                    <div className="flex items-center gap-4"><Icons.Plus /> {isListing ? 'AUTHORIZING SOLANA FEE...' : 'DEPLOY INVENTORY TO GLOBAL TERMINAL'}</div>
                    {!isListing && <span className="text-[9px] opacity-70">PAY $0.01 USDC SPAM VERIFICATION FEE</span>}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="glass p-12 rounded-none border-white/10 flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4"><span className="bg-white text-black px-6 py-2 text-[10px] font-black uppercase tracking-[0.5em] shadow-[0_0_20px_rgba(255,255,255,0.2)]">SPONSOR HUB</span></div>
            <div className="flex flex-col lg:flex-row gap-20">
              <div className="lg:w-1/3 space-y-10">
                <div className="space-y-4">
                  <h3 className="text-3xl font-black uppercase tracking-tight text-white">Client Identity</h3>
                  <p className="text-sm text-gray-400 leading-relaxed uppercase tracking-wider font-bold">Acquire premium ad slots across the creator ecosystem. Instant settlement, high impact branding.</p>
                </div>
                <div className="p-8 border-2 border-white/5 bg-white/5 space-y-6">
                   <p className="text-[12px] font-black uppercase tracking-[0.4em] text-zinc-300">Client Privileges</p>
                   <ul className="text-[11px] text-zinc-500 space-y-4 uppercase font-bold tracking-[0.3em]">
                     <li className="flex gap-4 items-center"><div className="w-2 h-2 bg-[#BF953F]"></div> Verified Badge Authorization</li>
                     <li className="flex gap-4 items-center"><div className="w-2 h-2 bg-[#BF953F]"></div> Direct Production Access</li>
                     <li className="flex gap-4 items-center"><div className="w-2 h-2 bg-[#BF953F]"></div> Multi-Campaign Dashboard</li>
                     <li className="flex gap-4 items-center"><div className="w-2 h-2 bg-[#BF953F]"></div> Tax-Compliant Receipts</li>
                   </ul>
                </div>
              </div>
              <div className="lg:w-2/3">
                {sponsorApp?.status === SponsorStatus.APPROVED ? (
                  <div className="p-16 bg-white/5 border-2 border-[#BF953F]/40 flex flex-col items-center justify-center text-center space-y-10">
                    <div className="w-24 h-24 rounded-none bg-[#BF953F] text-white flex items-center justify-center shadow-[0_0_50px_rgba(191,149,63,0.5)]"><Icons.Check className="w-12 h-12" /></div>
                    <div className="space-y-4">
                      <h2 className="text-4xl font-black uppercase text-[#F1EBD9] tracking-tighter">Account Fully Verified</h2>
                      <p className="text-sm text-zinc-500 uppercase tracking-[0.4em] font-black">Authorized for Global Content Acquisition</p>
                    </div>
                    <button onClick={() => window.location.hash = 'marketplace'} className="bg-white text-black px-16 py-6 font-black text-[12px] uppercase tracking-[0.5em] hover:bg-[#BF953F] hover:text-white transition-all shadow-xl">ENTER MARKETPLACE TERMINAL</button>
                  </div>
                ) : sponsorApp?.status === SponsorStatus.PENDING ? (
                  <div className="p-16 bg-white/5 border-2 border-dashed border-white/20 text-center space-y-10">
                    <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
                       <div className="absolute inset-0 border-4 border-[#BF953F]/20 rounded-full"></div>
                       <div className="absolute inset-0 border-t-4 border-[#BF953F] rounded-full animate-spin"></div>
                       <div className="w-4 h-4 bg-[#BF953F] rounded-full shadow-[0_0_20px_#BF953F]"></div>
                    </div>
                    <div className="space-y-4">
                      <p className="text-3xl font-black uppercase text-white tracking-[0.2em]">Verification In Progress</p>
                      <p className="text-xs text-zinc-500 uppercase tracking-[0.4em] leading-relaxed font-bold">Compliance Protocol Phase II. <br /> Expected System Approval: 24 Hours.</p>
                    </div>
                  </div>
                ) : (
                  <form className="space-y-10" onSubmit={(e) => { e.preventDefault(); onApplySponsor(appData); }}>
                    <div className="grid grid-cols-2 gap-10">
                      <div className="space-y-3"><label className="text-[10px] uppercase text-gray-500 font-black tracking-widest">Contact Representative</label><input type="text" className="w-full bg-black/60 border border-white/10 p-5 text-base text-white focus:border-[#BF953F] outline-none transition-all font-bold" value={appData.name} onChange={e => setAppData({...appData, name: e.target.value})} required /></div>
                      <div className="space-y-3"><label className="text-[10px] uppercase text-gray-500 font-black tracking-widest">Legal Business Name</label><input type="text" className="w-full bg-black/60 border border-white/10 p-5 text-base text-white focus:border-[#BF953F] outline-none transition-all font-bold" value={appData.companyName} onChange={e => setAppData({...appData, companyName: e.target.value})} required /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-10">
                      <div className="space-y-3"><label className="text-[10px] uppercase text-gray-500 font-black tracking-widest">Months Established</label><input type="number" className="w-full bg-black/60 border border-white/10 p-5 text-base text-white focus:border-[#BF953F] outline-none transition-all font-bold" value={appData.monthsInBusiness} onChange={e => setAppData({...appData, monthsInBusiness: Number(e.target.value)})} required /></div>
                      <div className="space-y-3"><label className="text-[10px] uppercase text-gray-500 font-black tracking-widest">Corporate Logo Source (URL)</label><input type="url" placeholder="https://..." className="w-full bg-black/60 border border-white/10 p-5 text-base text-white focus:border-[#BF953F] outline-none transition-all font-bold" value={appData.logoUrl} onChange={e => setAppData({...appData, logoUrl: e.target.value})} required /></div>
                    </div>
                    <div className="pt-10">
                      <button type="submit" className="w-full bg-white text-black py-8 font-black uppercase text-[14px] tracking-[0.5em] hover:bg-[#BF953F] hover:text-white transition-all shadow-[0_0_50px_rgba(255,255,255,0.1)]">INITIATE VERIFICATION PROTOCOL</button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 

export default ProfileSetup;
