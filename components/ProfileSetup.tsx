
import React, { useState, useRef, useMemo, useEffect } from 'react';
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

const PLATFORM_OPTIONS = [
  'YouTube', 'Twitch', 'Facebook', 'X', 
  'Kick', 'Zora', 'PumpFun', 'Rumble', 
  'Instagram', 'TikTok', 'Discord', 'Other'
];

const ProfileSetup: React.FC<ProfileSetupProps> = ({ profile, sponsorApp, onSaveProfile, onApplySponsor, onListInventory }) => {
  const [isEditing, setIsEditing] = useState(!profile.name);
  const [formData, setFormData] = useState<UserProfile>(profile);
  const [isListing, setIsListing] = useState(false);
  
  const [verificationStep, setVerificationStep] = useState<'IDLE' | 'CHALLENGE' | 'SCANNING' | 'VERIFIED'>(profile.isXVerified ? 'VERIFIED' : 'IDLE');
  const [tempHandle, setTempHandle] = useState('');
  const [tweetUrl, setTweetUrl] = useState('');
  const [verifyCode] = useState(() => `CAPITAL-${Math.random().toString(36).substring(2, 6).toUpperCase()}`);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamImgRef = useRef<HTMLInputElement>(null);
  
  const [appData, setAppData] = useState<SponsorApplication>(
    sponsorApp || {
      name: '', companyName: '', monthsInBusiness: 0, logoUrl: '', status: SponsorStatus.NONE
    }
  );

  useEffect(() => {
    if (verificationStep === 'VERIFIED' && formData.xHandle) {
      setFormData(prev => ({ ...prev, name: prev.xHandle?.toUpperCase() || '' }));
    }
  }, [verificationStep, formData.xHandle]);

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
    hour: '12', minute: '00', period: 'PM', timezone: 'UTC'
  });

  const timezones = [
    { label: 'UTC', offset: 0 }, { label: 'EST (UTC-5)', offset: -5 },
    { label: 'CST (UTC-6)', offset: -6 }, { label: 'MST (UTC-7)', offset: -7 },
    { label: 'PST (UTC-8)', offset: -8 }, { label: 'GMT (UTC+0)', offset: 0 },
    { label: 'CET (UTC+1)', offset: 1 }, { label: 'EET (UTC+2)', offset: 2 },
    { label: 'MSK (UTC+3)', offset: 3 }, { label: 'IST (UTC+5.5)', offset: 5.5 },
    { label: 'JST (UTC+9)', offset: 9 }, { label: 'AEDT (UTC+11)', offset: 11 },
  ];

  const [invData, setInvData] = useState({
    streamTime: '', placementDetail: '', priceSol: 100, platforms: [] as string[],
    category: ContentCategory.CRYPTO, adPosition: 'bottom-right' as AdPosition, streamPreviewUrl: ''
  });

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile(formData);
    setIsEditing(false);
  };

  const startVerification = () => {
    const cleanHandle = tempHandle.trim().replace('@', '').toLowerCase();
    if (!cleanHandle) return alert("Enter your X handle first.");
    setTempHandle(cleanHandle);
    setVerificationStep('CHALLENGE');
  };

  const extractHandleFromUrl = (url: string): string | null => {
    try {
      const regex = /(?:twitter\.com|x\.com)\/([^\/]+)/i;
      const match = url.match(regex);
      if (match && match[1]) return match[1].toLowerCase();
    } catch (e) {
      return null;
    }
    return null;
  };

  const handleVerifyNow = () => {
    const urlHandle = extractHandleFromUrl(tweetUrl);
    if (!urlHandle) {
      alert("Verification Failed: Invalid URL format.");
      return;
    }
    if (urlHandle !== tempHandle) {
      alert(`Verification Error: Mismatch detected.`);
      return;
    }
    setVerificationStep('SCANNING');
    setTimeout(() => {
      const handleWithAt = `@${tempHandle}`;
      setFormData({
        ...formData,
        name: handleWithAt.toUpperCase(),
        isXVerified: true,
        xHandle: handleWithAt,
        channelLink: `https://x.com/${tempHandle}`
      });
      setVerificationStep('VERIFIED');
    }, 4500);
  };

  const handleToggleProfilePlatform = (p: string) => {
    const current = formData.platforms || [];
    const updated = current.includes(p) ? current.filter(x => x !== p) : [...current, p];
    setFormData({...formData, platforms: updated});
  };

  const handleToggleInventoryPlatform = (p: string) => {
    const current = invData.platforms || [];
    const updated = current.includes(p) ? current.filter(x => x !== p) : [...current, p];
    setInvData({...invData, platforms: updated});
  };

  const handleAvatarClick = () => fileInputRef.current?.click();
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFormData({ ...formData, avatarUrl: reader.result as string });
      reader.readAsDataURL(file);
    }
  };

  const handleStreamPreviewUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setInvData({ ...invData, streamPreviewUrl: reader.result as string });
      reader.readAsDataURL(file);
    }
  };

  const handleListSubmit = async () => {
    if (!invData.streamPreviewUrl) return alert("Please upload a stream preview image first.");
    if (invData.platforms.length === 0) return alert("Please select at least one streaming platform.");
    const d = new Date(availableDays[selectedDayIdx]);
    let hourNum = parseInt(selectedTime.hour);
    if (selectedTime.period === 'PM' && hourNum !== 12) hourNum += 12;
    if (selectedTime.period === 'AM' && hourNum === 12) hourNum = 0;
    d.setHours(hourNum, parseInt(selectedTime.minute), 0, 0);
    const tz = timezones.find(t => t.label === selectedTime.timezone) || timezones[0];
    const utcTime = new Date(d.getTime() - (tz.offset * 60 * 60 * 1000));
    setIsListing(true);
    try {
      const result = await processPayment(profile.address, 0.01);
      if (result.success) onListInventory({ ...invData, streamTime: utcTime.toISOString() });
    } catch (e) {
      alert("Payment failed.");
    } finally { setIsListing(false); }
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
      <div className="max-w-5xl mx-auto py-12 md:py-24 animate-fadeIn relative">
        <div className="glass p-10 md:p-16 rounded-none border-white/10 animate-fadeIn space-y-12 relative overflow-hidden">
          {/* HUD Corner Accents */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#BF953F]/40 m-4"></div>
          <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[#BF953F]/40 m-4"></div>
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-[#BF953F]/40 m-4"></div>
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#BF953F]/40 m-4"></div>

          <div className="text-center space-y-3 relative z-10 mb-8">
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-white">System Initialization</h2>
            <p className="text-[#BF953F] font-bold uppercase tracking-[0.6em] text-[11px] opacity-80">Sync Terminal Identity Profile</p>
          </div>

          {formData.role === UserRole.UNDEFINED ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10 max-w-4xl mx-auto">
              <button onClick={() => setFormData({...formData, role: UserRole.CREATOR})} className="group p-8 border-2 border-white/5 hover:border-[#BF953F]/60 hover:bg-[#BF953F]/5 transition-all text-left bg-black/40">
                <h3 className="text-2xl font-black uppercase tracking-tight text-white mb-2">Creator Mode</h3>
                <p className="text-[12px] text-zinc-500 uppercase tracking-[0.2em] font-bold leading-relaxed">Broadcast ad inventory and generate on-chain revenue through global sponsorship splits.</p>
              </button>
              <button onClick={() => setFormData({...formData, role: UserRole.SPONSOR})} className="group p-8 border-2 border-white/5 hover:border-[#BF953F]/60 hover:bg-[#BF953F]/5 transition-all text-left bg-black/40">
                <h3 className="text-2xl font-black uppercase tracking-tight text-white mb-2">Sponsor Mode</h3>
                <p className="text-[12px] text-zinc-500 uppercase tracking-[0.2em] font-bold leading-relaxed">Acquire premium real estate in live creator feeds and manage global campaign deployments.</p>
              </button>
            </div>
          ) : (
            <form onSubmit={handleProfileSubmit} className="space-y-16 relative z-10">
              <div className="flex flex-col items-center gap-6">
                <div onClick={handleAvatarClick} className="relative w-32 h-32 rounded-full border-2 border-[#BF953F]/40 flex items-center justify-center cursor-pointer group hover:bg-[#BF953F]/10 transition-all overflow-hidden bg-black shadow-[0_0_30px_rgba(191,149,63,0.1)]">
                  {formData.avatarUrl ? (
                    <img src={formData.avatarUrl} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center">
                      <Icons.Plus className="w-6 h-6 text-[#BF953F] mx-auto mb-2" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-[#BF953F]">Terminal Logo</span>
                    </div>
                  )}
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                </div>
              </div>

              <div className="space-y-16 max-w-5xl mx-auto">
                {/* Row 1: Brand Name & Platform */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  <div className="space-y-5">
                    <label className="text-[11px] uppercase text-zinc-600 font-black tracking-[0.4em]">Identity Label</label>
                    <div className={`w-full bg-black/40 border-2 p-6 h-[95px] flex items-center transition-all ${verificationStep === 'VERIFIED' ? 'border-[#1DA1F2]/60 text-[#1DA1F2]' : 'border-white/5 focus-within:border-[#BF953F]/60'}`}>
                      {verificationStep === 'VERIFIED' ? (
                        <span className="text-2xl md:text-3xl font-black uppercase tracking-tighter drop-shadow-[0_0_20px_rgba(29,161,242,0.4)] whitespace-nowrap overflow-visible">{formData.name}</span>
                      ) : (
                        <input 
                          type="text" 
                          placeholder="ENTER BRAND NAME" 
                          className="w-full bg-transparent text-xl md:text-2xl font-black uppercase tracking-tighter outline-none text-white placeholder:text-zinc-800" 
                          value={formData.name} 
                          onChange={e => setFormData({...formData, name: e.target.value.toUpperCase()})} 
                          required 
                        />
                      )}
                    </div>
                  </div>
                  <div className="space-y-5">
                    <label className="text-[11px] uppercase text-zinc-600 font-black tracking-[0.4em]">Streaming Platform</label>
                    <div className="grid grid-cols-3 gap-2">
                      {PLATFORM_OPTIONS.map(p => {
                        const isSel = (formData.platforms || []).includes(p);
                        return (
                          <button 
                            key={p} 
                            type="button" 
                            onClick={() => handleToggleProfilePlatform(p)} 
                            className={`p-4 border-2 text-[11px] font-black uppercase tracking-[0.15em] transition-all duration-300 ${isSel ? 'bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.4)]' : 'bg-black/20 text-zinc-700 border-white/5 hover:border-white/20 hover:text-zinc-400'}`}
                          >
                            {p}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Row 2: Identity Proof & Niche */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  <div className="space-y-5">
                    <label className="text-[11px] uppercase text-zinc-600 font-black tracking-[0.4em]">Identity Proof (X Verification)</label>
                    
                    {verificationStep === 'IDLE' && (
                      <div className="flex gap-3 h-[95px]">
                        <input 
                          type="text" 
                          placeholder="@Handle" 
                          className="flex-grow bg-black/40 border-2 border-white/5 p-6 text-lg font-black text-white outline-none focus:border-[#1DA1F2]/60 placeholder:text-zinc-800" 
                          value={tempHandle}
                          onChange={e => setTempHandle(e.target.value)}
                        />
                        <button type="button" onClick={startVerification} className="bg-[#1DA1F2] text-black px-8 font-black uppercase text-[11px] tracking-widest hover:brightness-110 transition-all shadow-[0_0_20px_rgba(29,161,242,0.3)]">Verify</button>
                      </div>
                    )}

                    {verificationStep === 'CHALLENGE' && (
                      <div className="bg-black/60 border-2 border-[#1DA1F2]/30 p-8 space-y-6 animate-fadeIn">
                        <div className="space-y-2">
                           <p className="text-[10px] text-[#1DA1F2] uppercase font-black tracking-[0.3em]">CHALLENGE PROTOCOL</p>
                           <p className="text-[10px] text-zinc-500 leading-relaxed uppercase font-bold">1. Broadcast code to X. 2. Verify URL. Handle parity is mandatory.</p>
                        </div>
                        <div className="space-y-6">
                          <a 
                            href={`https://x.com/intent/tweet?text=Verifying my account for @CapitalCreator0: ${verifyCode}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block bg-[#1DA1F2]/5 p-5 border-2 border-dashed border-[#1DA1F2]/40 text-center hover:bg-[#1DA1F2]/10 transition-all group"
                          >
                            <code className="text-[#1DA1F2] font-black text-2xl tracking-[0.25em] group-hover:brightness-125">{verifyCode}</code>
                            <p className="text-[9px] text-[#1DA1F2]/60 mt-2 font-black tracking-widest uppercase">AUTO-DRAFT BROADCAST</p>
                          </a>
                          <div className="space-y-3">
                             <input 
                               type="url" 
                               placeholder="PASTE BROADCAST URL"
                               className="w-full bg-black border-2 border-white/5 p-5 text-[12px] font-mono text-white outline-none focus:border-[#1DA1F2]/60 placeholder:text-zinc-800"
                               value={tweetUrl}
                               onChange={e => setTweetUrl(e.target.value)}
                             />
                             <button type="button" onClick={handleVerifyNow} className="w-full bg-white text-black py-5 font-black uppercase text-[12px] tracking-[0.4em] hover:bg-[#1DA1F2] hover:text-white transition-all">INITIALIZE VALIDATION</button>
                          </div>
                        </div>
                      </div>
                    )}

                    {verificationStep === 'SCANNING' && (
                      <div className="w-full bg-black/60 border-2 border-[#1DA1F2]/20 p-10 flex flex-col items-center justify-center space-y-6 h-[95px] relative overflow-hidden">
                        <div className="absolute inset-0 bg-[#1DA1F2]/5 animate-pulse"></div>
                        <div className="w-3/4 h-1.5 bg-white/5 relative overflow-hidden rounded-full">
                           <div className="absolute inset-0 bg-[#1DA1F2] w-1/4 animate-[scanning_1.2s_infinite] shadow-[0_0_20px_rgba(29,161,242,0.9)]"></div>
                        </div>
                        <p className="text-[11px] text-[#1DA1F2] font-black uppercase tracking-[0.5em] z-10">SCRAPING X PROTOCOL...</p>
                        <style>{`@keyframes scanning { 0% { left: -25% } 100% { left: 100% } }`}</style>
                      </div>
                    )}

                    {verificationStep === 'VERIFIED' && (
                      <div className="w-full bg-black border-2 border-[#1DA1F2]/60 p-5 flex items-center justify-between group relative h-[95px] shadow-[0_0_40px_rgba(29,161,242,0.1)]">
                        <div className="flex items-center gap-6">
                           <div className="text-[#1DA1F2] drop-shadow-[0_0_20px_rgba(29,161,242,0.8)]">
                              <Icons.Check className="w-12 h-12" strokeWidth={5} />
                           </div>
                           <div className="space-y-1">
                             <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[#1DA1F2]">VERIFIED TERMINAL IDENTITY</p>
                             <p className="text-2xl md:text-3xl font-black text-white leading-none tracking-tighter whitespace-nowrap overflow-visible">{formData.xHandle}</p>
                           </div>
                        </div>
                        <div className="flex flex-col items-end justify-between h-full">
                          <button 
                            type="button" 
                            onClick={() => { setVerificationStep('IDLE'); setFormData({...formData, isXVerified: false, xHandle: '', name: ''}); setTweetUrl(''); }} 
                            className="text-[10px] text-zinc-700 hover:text-white uppercase font-black tracking-[0.4em] transition-colors"
                          >
                            RESET
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-5">
                    <label className="text-[11px] uppercase text-zinc-600 font-black tracking-[0.4em]">Content Category</label>
                    <div className="relative h-[95px]">
                      <select 
                        className="w-full h-full bg-black border-2 border-white/5 px-8 text-2xl font-black uppercase tracking-tighter focus:border-[#BF953F]/60 outline-none text-white appearance-none cursor-pointer text-center" 
                        value={formData.niche || ContentCategory.CRYPTO} 
                        onChange={e => setFormData({...formData, niche: e.target.value as ContentCategory})}
                      >
                        {Object.values(ContentCategory).map(cat => (<option key={cat} value={cat}>{cat}</option>))}
                      </select>
                      <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-700">
                        <Icons.ChevronDown className="w-6 h-6" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-5 pt-4">
                  <label className="text-[11px] uppercase text-zinc-600 font-black tracking-[0.4em]">Terminal Directive (Bio)</label>
                  <textarea placeholder="DESCRIBE TARGET AUDIENCE AND CONTENT STRATEGY..." className="w-full bg-black border-2 border-white/5 p-8 min-h-[140px] text-sm font-bold uppercase tracking-wider focus:border-[#BF953F]/60 outline-none text-zinc-400 transition-all resize-none leading-relaxed placeholder:text-zinc-800" value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} required />
                </div>
                
                <div className="flex justify-between items-center pt-12 border-t border-white/5">
                  <button type="button" onClick={() => setFormData({...profile, role: UserRole.UNDEFINED})} className="text-[10px] uppercase font-black tracking-[0.6em] text-zinc-700 hover:text-white transition-colors">BACK TO MODE SELECTION</button>
                  <button type="submit" className="bg-white text-black px-16 py-6 font-black uppercase text-[12px] tracking-[0.6em] hover:bg-[#BF953F] hover:text-white transition-all shadow-2xl">COMMIT TERMINAL IDENTITY</button>
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
          <div className="w-32 h-32 bg-black border-2 border-[#BF953F]/60 rounded-full flex items-center justify-center overflow-hidden shrink-0 shadow-[0_0_40px_rgba(191,149,63,0.15)]">
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-4xl font-black text-[#BF953F] opacity-40">{profile.name.slice(0,2).toUpperCase() || 'UN'}</span>
            )}
          </div>
          <div className="flex-grow w-full text-center md:text-left">
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row items-center justify-between border-b border-white/5 pb-8 gap-6">
                <div>
                  <div className="flex items-center justify-center md:justify-start gap-4">
                    <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-white leading-none whitespace-nowrap overflow-visible">{profile.name || 'NOT VERIFIED'}</h2>
                    {profile.isXVerified ? (
                      <div className="text-[#1DA1F2] flex items-center shrink-0" title="X Verified Identity">
                        <Icons.Check className="w-9 h-9 drop-shadow-[0_0_20px_rgba(29,161,242,0.8)]" />
                      </div>
                    ) : (
                      <span className="text-[9px] bg-red-500/10 text-red-500 px-4 py-1.5 font-black uppercase tracking-widest border border-red-500/20 shrink-0">NOT VERIFIED</span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-5">
                    <p className="mono text-[9px] opacity-40 uppercase tracking-[0.3em] font-bold">{profile.address}</p>
                    <div className="flex flex-wrap gap-2">
                      {(profile.platforms || []).map(p => (
                        <span key={p} className="text-[10px] bg-[#BF953F]/10 text-[#BF953F] px-4 py-2 font-black uppercase tracking-widest border border-[#BF953F]/20">{p}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <button onClick={() => setIsEditing(true)} className="text-[10px] text-zinc-500 hover:text-[#BF953F] uppercase font-black tracking-[0.5em] border-2 border-white/5 px-8 py-4 transition-all bg-black/20">Edit Terminal</button>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 py-4">
                <div className="space-y-1"><p className="text-[11px] uppercase text-zinc-500 font-black tracking-widest">Revenue</p><p className="text-3xl font-mono font-bold text-white">${profile.revenueEarned?.toLocaleString()}</p></div>
                <div className="space-y-1"><p className="text-[11px] uppercase text-zinc-500 font-black tracking-widest">Active Hires</p><p className="text-3xl font-mono font-bold text-white">{profile.timesHired}</p></div>
                <div className="space-y-1"><p className="text-[11px] uppercase text-zinc-500 font-black tracking-widest">Avg Concurrent</p><p className="text-3xl font-mono font-bold text-white">{profile.avgAudienceSize?.toLocaleString()}</p></div>
                <div className="space-y-1"><p className="text-[11px] uppercase text-zinc-500 font-black tracking-widest">Niche</p><p className="text-3xl font-bold text-[#BF953F] uppercase tracking-tighter">{profile.niche}</p></div>
              </div>
              <p className="text-zinc-500 leading-relaxed text-sm italic max-w-4xl border-l-4 border-[#BF953F]/20 pl-8 py-4 bg-white/5 uppercase tracking-wide font-medium">{profile.bio}</p>
            </div>
          </div>
        </div>
      </section>

      {profile.role === UserRole.CREATOR && (
        <div className="glass p-10 md:p-14 rounded-none border-white/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-5"><span className="bg-[#BF953F] text-black px-8 py-2.5 text-[11px] font-black uppercase tracking-[0.5em] shadow-xl">CREATOR COMMAND</span></div>
          
          <div className="space-y-16">
            <div className="flex flex-col lg:flex-row gap-16">
              <div className="flex-1 space-y-12">
                <div className="space-y-5">
                  <h3 className="text-3xl font-black uppercase tracking-tight text-white">Broadcast Inventory</h3>
                  <div className="p-8 bg-white/5 border border-white/10 space-y-5">
                    <p className="text-[11px] font-black uppercase tracking-[0.5em] text-[#BF953F]">Protocol Parameters</p>
                    <ul className="text-[11px] text-zinc-400 space-y-4 uppercase font-bold tracking-widest">
                      <li className="flex justify-between"><span>Max Lookahead</span> <span className="text-white">7 Days</span></li>
                      <li className="flex justify-between"><span>Listing Fee</span> <span className="text-[#BF953F]">$0.01 USDC</span></li>
                      <li className="flex justify-between"><span>Creator Cut</span> <span className="text-white">90%</span></li>
                    </ul>
                  </div>
                </div>

                <div className="space-y-6">
                  <label className="text-[11px] uppercase text-zinc-600 font-black tracking-[0.5em]">Streaming Platform</label>
                  <div className="grid grid-cols-3 gap-2">
                    {PLATFORM_OPTIONS.map(p => {
                      const isSel = (invData.platforms || []).includes(p);
                      return (
                        <button 
                          key={p} 
                          type="button" 
                          onClick={() => handleToggleInventoryPlatform(p)} 
                          className={`p-5 border-2 text-[12px] font-black uppercase tracking-widest transition-all duration-300 ${isSel ? 'bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.5)]' : 'bg-black text-zinc-700 border-white/5 hover:border-white/20 hover:text-zinc-400'}`}
                        >
                          {p}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-5">
                  <label className="text-[11px] uppercase text-zinc-600 font-black tracking-[0.5em]">Calendar Selection</label>
                  <div className="grid grid-cols-7 gap-1.5">
                    {availableDays.map((day, idx) => {
                      const dayName = day.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
                      const dateNum = day.getDate();
                      const isSelected = selectedDayIdx === idx;
                      return (
                        <button 
                          key={idx} 
                          onClick={() => setSelectedDayIdx(idx)}
                          className={`aspect-[4/5] flex flex-col items-center justify-center border-2 transition-all ${isSelected ? 'bg-[#BF953F] border-[#BF953F] text-black shadow-[0_0_15px_rgba(191,149,63,0.3)]' : 'bg-black border-white/5 text-zinc-700 hover:border-white/30'}`}
                        >
                          <span className="text-[8px] font-black tracking-widest mb-1.5">{dayName}</span>
                          <span className="text-xl font-black">{dateNum}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="lg:w-3/5 space-y-10">
                <div onClick={() => streamImgRef.current?.click()} className="relative aspect-video w-full bg-black border-2 border-white/5 flex items-center justify-center cursor-pointer group hover:border-[#BF953F]/40 transition-all overflow-hidden shadow-2xl">
                  {invData.streamPreviewUrl ? (
                    <>
                      <img src={invData.streamPreviewUrl} className="w-full h-full object-cover" alt="Stream Preview" />
                      <div className={`absolute ${getPositionClasses(invData.adPosition)} z-10 bg-white/30 backdrop-blur-md border border-white px-4 py-2 text-[11px] text-black font-black uppercase animate-pulse shadow-xl`}>YOUR LOGO HERE</div>
                    </>
                  ) : (
                    <div className="text-center space-y-3">
                      <Icons.Plus className="w-8 h-8 mx-auto text-zinc-700 group-hover:text-[#BF953F] transition-colors" />
                      <p className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-700 group-hover:text-zinc-400">Upload Stream Layout Frame</p>
                    </div>
                  )}
                  <input type="file" ref={streamImgRef} className="hidden" accept="image/*" onChange={handleStreamPreviewUpload} />
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                  {(['top-left', 'top-center', 'top-right', 'bottom-left', 'bottom-center', 'bottom-right'] as AdPosition[]).map(pos => (
                    <button key={pos} onClick={() => setInvData({...invData, adPosition: pos})} className={`py-4 border-2 text-[10px] font-black uppercase tracking-widest transition-all ${invData.adPosition === pos ? 'bg-[#BF953F] text-black border-[#BF953F]' : 'bg-black text-zinc-700 border-white/5 hover:border-white/10'}`}>{pos.replace('-', ' ')}</button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 pt-12 border-t border-white/5">
              <div className="space-y-5">
                <label className="text-[11px] uppercase text-zinc-600 font-black tracking-[0.5em]">Timing Interface</label>
                <div className="flex gap-2 h-[75px] mono">
                  <div className="flex-[3] flex border-2 border-white/5 bg-black items-center overflow-hidden focus-within:border-[#BF953F]/60">
                    <input 
                      type="text" 
                      maxLength={2}
                      className="w-1/2 bg-transparent text-center text-3xl font-bold text-white outline-none" 
                      value={selectedTime.hour}
                      onChange={e => setSelectedTime({...selectedTime, hour: e.target.value})}
                    />
                    <div className="text-zinc-800 font-black text-2xl">:</div>
                    <input 
                      type="text" 
                      maxLength={2}
                      className="w-1/2 bg-transparent text-center text-3xl font-bold text-white outline-none" 
                      value={selectedTime.minute}
                      onChange={e => setSelectedTime({...selectedTime, minute: e.target.value})}
                    />
                  </div>
                  <button 
                    onClick={() => setSelectedTime({...selectedTime, period: selectedTime.period === 'AM' ? 'PM' : 'AM'})}
                    className="flex-1 bg-black border-2 border-white/5 text-[11px] font-black uppercase tracking-widest text-white hover:border-[#BF953F]/60 transition-colors"
                  >
                    {selectedTime.period}
                  </button>
                  <div className="flex-[3] relative">
                    <select 
                      className="w-full h-full bg-black border-2 border-white/5 px-6 text-[10px] font-black uppercase text-white outline-none focus:border-[#BF953F]/60 appearance-none cursor-pointer"
                      value={selectedTime.timezone}
                      onChange={e => setSelectedTime({...selectedTime, timezone: e.target.value})}
                    >
                      {timezones.map(tz => <option key={tz.label} value={tz.label}>{tz.label}</option>)}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-700"><Icons.ChevronDown className="w-5 h-5"/></div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 items-end">
                <div className="flex-1 space-y-5">
                  <label className="text-[11px] uppercase text-zinc-600 font-black tracking-[0.5em]">USDC Settlement Value</label>
                  <div className="relative h-[75px]">
                    <input 
                      type="number" 
                      className="w-full h-full bg-black border-2 border-white/5 p-6 text-4xl font-bold text-white focus:border-[#BF953F]/60 outline-none" 
                      value={invData.priceSol} 
                      onChange={e => setInvData({...invData, priceSol: Number(e.target.value)})} 
                      required 
                    />
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 text-[11px] font-black text-zinc-800 uppercase tracking-[0.2em] pointer-events-none">USDC</div>
                  </div>
                </div>
                <button onClick={handleListSubmit} disabled={isListing} className="flex-1 h-[75px] bg-white text-black font-black uppercase text-[13px] tracking-[0.5em] hover:bg-[#BF953F] hover:text-white transition-all shadow-[0_0_40px_rgba(255,255,255,0.15)]">
                  {isListing ? 'SYNCING...' : 'DEPLOY INVENTORY'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {profile.role === UserRole.SPONSOR && (
        <div className="glass p-16 rounded-none border-white/10 flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6"><span className="bg-white text-black px-8 py-2.5 text-[11px] font-black uppercase tracking-[0.5em] shadow-xl">SPONSOR HUB</span></div>
          {sponsorApp?.status === SponsorStatus.APPROVED ? (
            <div className="p-20 text-center space-y-12">
              <Icons.Check className="w-28 h-28 mx-auto text-[#BF953F] drop-shadow-[0_0_20px_rgba(191,149,63,0.4)]" />
              <h2 className="text-4xl font-black uppercase text-white tracking-tighter">Terminal Authorization Confirmed</h2>
              <button onClick={() => window.location.hash = 'marketplace'} className="bg-white text-black px-20 py-8 font-black uppercase tracking-[0.6em] hover:bg-[#BF953F] transition-all text-sm shadow-2xl">ACCESS GLOBAL MARKETPLACE</button>
            </div>
          ) : (
            <form className="space-y-12 max-w-3xl mx-auto w-full" onSubmit={(e) => { e.preventDefault(); onApplySponsor(appData); }}>
              <div className="grid grid-cols-1 gap-10">
                <div className="space-y-3">
                  <label className="text-[11px] uppercase text-zinc-600 font-black tracking-[0.4em]">Corporate Lead</label>
                  <input type="text" placeholder="FULL NAME" className="w-full bg-black border-2 border-white/5 p-6 text-white outline-none focus:border-[#BF953F]/60 text-lg font-bold" value={appData.name} onChange={e => setAppData({...appData, name: e.target.value})} required />
                </div>
                <div className="space-y-3">
                  <label className="text-[11px] uppercase text-zinc-600 font-black tracking-[0.4em]">Organization Identity</label>
                  <input type="text" placeholder="COMPANY NAME" className="w-full bg-black border-2 border-white/5 p-6 text-white outline-none focus:border-[#BF953F]/60 text-lg font-bold" value={appData.companyName} onChange={e => setAppData({...appData, companyName: e.target.value})} required />
                </div>
                <button type="submit" className="w-full bg-white text-black py-10 font-black uppercase text-[14px] tracking-[0.6em] hover:bg-[#BF953F] hover:text-white transition-all shadow-2xl">INITIATE SPONSOR VERIFICATION</button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}; 

export default ProfileSetup;
