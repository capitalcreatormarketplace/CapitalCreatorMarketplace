
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

  // Auto-sync and lock name when handle is verified
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
      <div className="max-w-4xl mx-auto py-12 md:py-20 animate-fadeIn relative">
        <div className="glass p-8 md:p-12 rounded-none border-white/20 animate-fadeIn space-y-10 relative overflow-hidden">
          <div className="text-center space-y-2 relative z-10 mb-6">
            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter text-white">System Initialization</h2>
            <p className="text-[#BF953F] font-bold uppercase tracking-[0.5em] text-[10px]">Configure your Terminal Profile</p>
          </div>

          {formData.role === UserRole.UNDEFINED ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
              <button onClick={() => setFormData({...formData, role: UserRole.CREATOR})} className="group p-6 border border-white/10 hover:border-[#BF953F]/40 hover:bg-[#BF953F]/5 transition-all text-left">
                <h3 className="text-lg font-black uppercase tracking-tight text-white">Creator</h3>
                <p className="text-[11px] text-zinc-500 mt-1 uppercase tracking-wider font-bold">List inventory and earn revenue.</p>
              </button>
              <button onClick={() => setFormData({...formData, role: UserRole.SPONSOR})} className="group p-6 border border-white/10 hover:border-[#BF953F]/40 hover:bg-[#BF953F]/5 transition-all text-left">
                <h3 className="text-lg font-black uppercase tracking-tight text-white">Sponsor</h3>
                <p className="text-[11px] text-zinc-500 mt-1 uppercase tracking-wider font-bold">Acquire premium content placements.</p>
              </button>
            </div>
          ) : (
            <form onSubmit={handleProfileSubmit} className="space-y-12 relative z-10">
              <div className="flex flex-col items-center gap-4">
                <div onClick={handleAvatarClick} className="relative w-24 h-24 rounded-full border-2 border-[#BF953F]/40 flex items-center justify-center cursor-pointer group hover:bg-[#BF953F]/10 transition-all overflow-hidden bg-black/40">
                  {formData.avatarUrl ? (
                    <img src={formData.avatarUrl} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center">
                      <Icons.Plus className="w-5 h-5 text-[#BF953F] mx-auto mb-1" />
                      <span className="text-[8px] font-black uppercase tracking-widest text-[#BF953F]">Logo</span>
                    </div>
                  )}
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                </div>
              </div>

              <div className="space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-4">
                    <label className="text-[9px] uppercase text-zinc-500 font-black tracking-[0.3em]">
                      {verificationStep === 'VERIFIED' ? 'VERIFIED ACCOUNT (LOCKED)' : 'BRAND NAME'}
                    </label>
                    <div className={`w-full bg-black border p-5 h-[85px] flex items-center transition-all ${verificationStep === 'VERIFIED' ? 'border-[#1DA1F2]/60 text-[#1DA1F2]' : 'border-white/10 focus-within:border-[#BF953F]'}`}>
                      {verificationStep === 'VERIFIED' ? (
                        <span className="text-xl md:text-2xl font-black uppercase tracking-tighter drop-shadow-[0_0_15px_rgba(29,161,242,0.4)] truncate overflow-hidden whitespace-nowrap">{formData.name}</span>
                      ) : (
                        <input 
                          type="text" 
                          placeholder="e.g. CAPITALCREATOR0" 
                          className="w-full bg-transparent text-lg md:text-xl font-black uppercase tracking-tighter outline-none text-white placeholder:text-zinc-800" 
                          value={formData.name} 
                          onChange={e => setFormData({...formData, name: e.target.value.toUpperCase()})} 
                          required 
                        />
                      )}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <label className="text-[9px] uppercase text-zinc-500 font-black tracking-[0.3em]">STREAMING PLATFORM</label>
                    <div className="grid grid-cols-3 gap-2">
                      {PLATFORM_OPTIONS.map(p => {
                        const isSel = (formData.platforms || []).includes(p);
                        return (
                          <button 
                            key={p} 
                            type="button" 
                            onClick={() => handleToggleProfilePlatform(p)} 
                            className={`p-3 border text-[10px] font-black uppercase tracking-[0.1em] transition-all duration-300 ${isSel ? 'bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.4)]' : 'bg-black text-zinc-600 border-white/5 hover:border-white/20 hover:text-zinc-400'}`}
                          >
                            {p}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
                  <div className="space-y-4">
                    <label className="text-[9px] uppercase text-zinc-500 font-black tracking-[0.3em]">IDENTITY PROOF (PRIMARY)</label>
                    
                    {verificationStep === 'IDLE' && (
                      <div className="flex gap-2 h-[85px]">
                        <input 
                          type="text" 
                          placeholder="@XHandle" 
                          className="flex-grow bg-black border border-white/10 p-5 text-base font-black text-white outline-none focus:border-[#1DA1F2] placeholder:text-zinc-800" 
                          value={tempHandle}
                          onChange={e => setTempHandle(e.target.value)}
                        />
                        <button type="button" onClick={startVerification} className="bg-[#1DA1F2] text-black px-6 font-black uppercase text-[10px] tracking-widest hover:brightness-110 transition-all">Verify</button>
                      </div>
                    )}

                    {verificationStep === 'CHALLENGE' && (
                      <div className="bg-black border border-[#1DA1F2]/20 p-6 space-y-5 animate-fadeIn">
                        <div className="space-y-1">
                           <p className="text-[9px] text-zinc-500 uppercase font-black tracking-[0.3em]">AUTHENTICATION PROTOCOL</p>
                           <p className="text-[9px] text-white/40 leading-relaxed uppercase">1. Post code to X. 2. Paste URL. Handle must match.</p>
                        </div>
                        <div className="space-y-5">
                          <a 
                            href={`https://x.com/intent/tweet?text=Verifying my account for @CapitalCreator0: ${verifyCode}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block bg-[#1DA1F2]/10 p-4 border border-dashed border-[#1DA1F2]/40 text-center hover:bg-[#1DA1F2]/20 transition-all group"
                          >
                            <code className="text-[#1DA1F2] font-black text-lg tracking-[0.2em] group-hover:brightness-125">{verifyCode}</code>
                            <p className="text-[8px] text-[#1DA1F2] mt-1 font-black">CLICK TO DRAFT TWEET</p>
                          </a>
                          <div className="space-y-3">
                             <input 
                               type="url" 
                               placeholder="Post URL"
                               className="w-full bg-black border border-white/10 p-4 text-[11px] text-white outline-none focus:border-[#1DA1F2] placeholder:text-zinc-800"
                               value={tweetUrl}
                               onChange={e => setTweetUrl(e.target.value)}
                             />
                             <button type="button" onClick={handleVerifyNow} className="w-full bg-white text-black py-4 font-black uppercase text-[11px] tracking-widest hover:bg-[#1DA1F2] hover:text-white transition-all">VALIDATE</button>
                          </div>
                        </div>
                      </div>
                    )}

                    {verificationStep === 'SCANNING' && (
                      <div className="w-full bg-black border border-[#1DA1F2]/20 p-8 flex flex-col items-center justify-center space-y-5 h-[85px] relative overflow-hidden">
                        <div className="absolute inset-0 bg-[#1DA1F2]/5 animate-pulse"></div>
                        <div className="w-3/4 h-1 bg-white/5 relative overflow-hidden rounded-full">
                           <div className="absolute inset-0 bg-[#1DA1F2] w-1/4 animate-[scanning_1.5s_infinite] shadow-[0_0_15px_rgba(29,161,242,0.8)]"></div>
                        </div>
                        <p className="text-[9px] text-[#1DA1F2] font-black uppercase tracking-[0.4em] z-10">SCRAPING X API...</p>
                        <style>{`@keyframes scanning { 0% { left: -25% } 100% { left: 100% } }`}</style>
                      </div>
                    )}

                    {verificationStep === 'VERIFIED' && (
                      <div className="w-full bg-black border border-[#1DA1F2]/60 p-4 flex items-center justify-between group relative h-[85px] shadow-[0_0_30px_rgba(29,161,242,0.15)]">
                        <div className="flex items-center gap-4">
                           <div className="text-[#1DA1F2] drop-shadow-[0_0_15px_rgba(29,161,242,0.8)]">
                              <Icons.Check className="w-10 h-10" strokeWidth={5} />
                           </div>
                           <div className="space-y-0.5">
                             <p className="text-[8px] font-black uppercase tracking-[0.2em] text-[#1DA1F2]">VERIFIED TERMINAL</p>
                             <p className="text-xl md:text-2xl font-black text-white leading-none tracking-tighter truncate max-w-[150px]">{formData.xHandle}</p>
                           </div>
                        </div>
                        <div className="flex flex-col items-end justify-between h-full">
                          <div className="absolute -top-[1px] -right-[1px] bg-[#1DA1F2] text-black px-4 py-2 font-black text-[9px] uppercase tracking-widest shadow-lg">
                            IDENTITY VERIFIED
                          </div>
                          <button 
                            type="button" 
                            onClick={() => { setVerificationStep('IDLE'); setFormData({...formData, isXVerified: false, xHandle: '', name: ''}); setTweetUrl(''); }} 
                            className="text-[9px] text-zinc-700 hover:text-white uppercase font-black tracking-[0.3em] transition-colors mt-auto"
                          >
                            RESET
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <label className="text-[9px] uppercase text-zinc-500 font-black tracking-[0.3em]">CATEGORY / NICHE</label>
                    <div className="relative h-[85px]">
                      <select 
                        className="w-full h-full bg-black border border-white/5 px-6 text-2xl font-black uppercase tracking-tighter focus:border-[#BF953F] outline-none text-white appearance-none cursor-pointer text-center" 
                        value={formData.niche || ContentCategory.CRYPTO} 
                        onChange={e => setFormData({...formData, niche: e.target.value as ContentCategory})}
                      >
                        {Object.values(ContentCategory).map(cat => (<option key={cat} value={cat}>{cat}</option>))}
                      </select>
                      <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-700">
                        <Icons.ChevronDown className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-4">
                  <label className="text-[9px] uppercase text-zinc-500 font-black tracking-[0.3em]">PROJECT DIRECTIVE</label>
                  <textarea placeholder="Briefly describe your audience demographics..." className="w-full bg-black border border-white/10 p-6 min-h-[110px] text-[13px] font-medium focus:border-[#BF953F] outline-none text-zinc-400 transition-all resize-none leading-relaxed" value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} required />
                </div>
                
                <div className="flex justify-between items-center pt-10 border-t border-white/5">
                  <button type="button" onClick={() => setFormData({...profile, role: UserRole.UNDEFINED})} className="text-[9px] uppercase font-black tracking-[0.5em] text-zinc-600 hover:text-white transition-colors">BACK</button>
                  <button type="submit" className="bg-white text-black px-14 py-5 font-black uppercase text-[11px] tracking-[0.5em] hover:bg-[#BF953F] hover:text-white transition-all shadow-xl">SAVE IDENTITY</button>
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
          <div className="w-32 h-32 bg-black border-2 border-[#BF953F]/60 rounded-full flex items-center justify-center overflow-hidden shrink-0">
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
                  <div className="flex items-center justify-center md:justify-start gap-3">
                    <h2 className="text-4xl font-black uppercase tracking-tighter text-white leading-none">{profile.name || 'NOT VERIFIED'}</h2>
                    {profile.isXVerified ? (
                      <div className="text-[#1DA1F2] flex items-center" title="X Verified Identity">
                        <Icons.Check className="w-8 h-8 drop-shadow-[0_0_15px_rgba(29,161,242,0.6)]" />
                      </div>
                    ) : (
                      <span className="text-[9px] bg-red-500/10 text-red-500 px-3 py-1 font-black uppercase tracking-widest border border-red-500/20">NOT VERIFIED</span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-4">
                    <p className="mono text-[8px] opacity-40 uppercase tracking-[0.3em] font-bold">{profile.address}</p>
                    <div className="flex flex-wrap gap-2">
                      {(profile.platforms || []).map(p => (
                        <span key={p} className="text-[10px] bg-[#BF953F]/10 text-[#BF953F] px-4 py-1.5 font-black uppercase tracking-widest border border-[#BF953F]/20">{p}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <button onClick={() => setIsEditing(true)} className="text-[10px] text-zinc-500 hover:text-[#BF953F] uppercase font-black tracking-[0.5em] border border-white/10 px-8 py-4 transition-all">Edit Terminal</button>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 py-4">
                <div className="space-y-1"><p className="text-[10px] uppercase text-zinc-500 font-black tracking-widest">Revenue</p><p className="text-3xl font-mono font-bold text-white">${profile.revenueEarned?.toLocaleString()}</p></div>
                <div className="space-y-1"><p className="text-[10px] uppercase text-zinc-500 font-black tracking-widest">Active Hires</p><p className="text-3xl font-mono font-bold text-white">{profile.timesHired}</p></div>
                <div className="space-y-1"><p className="text-[10px] uppercase text-zinc-500 font-black tracking-widest">Avg Concurrent</p><p className="text-3xl font-mono font-bold text-white">{profile.avgAudienceSize?.toLocaleString()}</p></div>
                <div className="space-y-1"><p className="text-[10px] uppercase text-zinc-500 font-black tracking-widest">Niche</p><p className="text-3xl font-bold text-[#BF953F] uppercase tracking-tighter">{profile.niche}</p></div>
              </div>
              <p className="text-zinc-500 leading-relaxed text-sm italic max-w-4xl border-l-4 border-[#BF953F]/20 pl-8 py-3 bg-white/5">{profile.bio}</p>
            </div>
          </div>
        </div>
      </section>

      {profile.role === UserRole.CREATOR && (
        <div className="glass p-8 md:p-12 rounded-none border-white/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4"><span className="bg-[#BF953F] text-black px-6 py-2 text-[10px] font-black uppercase tracking-[0.5em]">CREATOR COMMAND</span></div>
          
          <div className="space-y-12">
            <div className="flex flex-col lg:flex-row gap-12">
              <div className="flex-1 space-y-10">
                <div className="space-y-4">
                  <h3 className="text-2xl font-black uppercase tracking-tight text-white">Broadcast Inventory</h3>
                  <div className="p-6 bg-white/5 border border-white/10 space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#BF953F]">Protocol Parameters</p>
                    <ul className="text-[10px] text-zinc-400 space-y-3 uppercase font-bold tracking-widest">
                      <li className="flex justify-between"><span>Max Lookahead</span> <span className="text-white">7 Days</span></li>
                      <li className="flex justify-between"><span>Listing Fee</span> <span className="text-[#BF953F]">$0.01 USDC</span></li>
                      <li className="flex justify-between"><span>Creator Cut</span> <span className="text-white">90%</span></li>
                    </ul>
                  </div>
                </div>

                {/* Streaming Platform Selection Cluster - Enlarged */}
                <div className="space-y-5">
                  <label className="text-[10px] uppercase text-zinc-600 font-black tracking-[0.4em]">Streaming Platform</label>
                  <div className="grid grid-cols-3 gap-2">
                    {PLATFORM_OPTIONS.map(p => {
                      const isSel = (invData.platforms || []).includes(p);
                      return (
                        <button 
                          key={p} 
                          type="button" 
                          onClick={() => handleToggleInventoryPlatform(p)} 
                          className={`p-4 border text-[11px] font-black uppercase tracking-widest transition-all duration-300 ${isSel ? 'bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.4)]' : 'bg-black text-zinc-600 border-white/5 hover:border-white/20 hover:text-zinc-400'}`}
                        >
                          {p}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] uppercase text-zinc-600 font-black tracking-[0.4em]">Calendar Selection</label>
                  <div className="grid grid-cols-7 gap-1">
                    {availableDays.map((day, idx) => {
                      const dayName = day.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
                      const dateNum = day.getDate();
                      const isSelected = selectedDayIdx === idx;
                      return (
                        <button 
                          key={idx} 
                          onClick={() => setSelectedDayIdx(idx)}
                          className={`aspect-[4/5] flex flex-col items-center justify-center border transition-all ${isSelected ? 'bg-[#BF953F] border-[#BF953F] text-black' : 'bg-black border-white/10 text-zinc-600 hover:border-white/30'}`}
                        >
                          <span className="text-[7px] font-black tracking-widest mb-1">{dayName}</span>
                          <span className="text-lg font-black">{dateNum}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="lg:w-3/5 space-y-8">
                <div onClick={() => streamImgRef.current?.click()} className="relative aspect-video w-full bg-black border border-white/5 flex items-center justify-center cursor-pointer group hover:border-[#BF953F]/40 transition-all overflow-hidden">
                  {invData.streamPreviewUrl ? (
                    <>
                      <img src={invData.streamPreviewUrl} className="w-full h-full object-cover" alt="Stream Preview" />
                      <div className={`absolute ${getPositionClasses(invData.adPosition)} z-10 bg-white/30 backdrop-blur-md border border-white px-3 py-1.5 text-[10px] text-black font-black uppercase animate-pulse`}>YOUR LOGO HERE</div>
                    </>
                  ) : (
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">Click to upload stream layout</p>
                  )}
                  <input type="file" ref={streamImgRef} className="hidden" accept="image/*" onChange={handleStreamPreviewUpload} />
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                  {(['top-left', 'top-center', 'top-right', 'bottom-left', 'bottom-center', 'bottom-right'] as AdPosition[]).map(pos => (
                    <button key={pos} onClick={() => setInvData({...invData, adPosition: pos})} className={`py-3 border text-[8px] font-black uppercase tracking-widest transition-all ${invData.adPosition === pos ? 'bg-[#BF953F] text-black border-[#BF953F]' : 'bg-black text-zinc-600 border-white/5 hover:border-white/10'}`}>{pos.replace('-', ' ')}</button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pt-10 border-t border-white/5">
              <div className="space-y-4">
                <label className="text-[10px] uppercase text-zinc-600 font-black tracking-[0.4em]">Timing Interface</label>
                <div className="flex gap-1 h-[60px] mono">
                  <div className="flex-[3] flex border border-white/10 bg-black items-center overflow-hidden focus-within:border-[#BF953F]">
                    <input 
                      type="text" 
                      maxLength={2}
                      className="w-1/2 bg-transparent text-center text-2xl font-bold text-white outline-none" 
                      value={selectedTime.hour}
                      onChange={e => setSelectedTime({...selectedTime, hour: e.target.value})}
                    />
                    <div className="text-zinc-700 font-black text-xl">:</div>
                    <input 
                      type="text" 
                      maxLength={2}
                      className="w-1/2 bg-transparent text-center text-2xl font-bold text-white outline-none" 
                      value={selectedTime.minute}
                      onChange={e => setSelectedTime({...selectedTime, minute: e.target.value})}
                    />
                  </div>
                  <button 
                    onClick={() => setSelectedTime({...selectedTime, period: selectedTime.period === 'AM' ? 'PM' : 'AM'})}
                    className="flex-1 bg-black border border-white/10 text-[10px] font-black uppercase tracking-widest text-white hover:border-[#BF953F] transition-colors"
                  >
                    {selectedTime.period}
                  </button>
                  <div className="flex-[3] relative">
                    <select 
                      className="w-full h-full bg-black border border-white/10 px-4 text-[9px] font-black uppercase text-white outline-none focus:border-[#BF953F] appearance-none cursor-pointer"
                      value={selectedTime.timezone}
                      onChange={e => setSelectedTime({...selectedTime, timezone: e.target.value})}
                    >
                      {timezones.map(tz => <option key={tz.label} value={tz.label}>{tz.label}</option>)}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-600"><Icons.ChevronDown className="w-4 h-4"/></div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 items-end">
                <div className="flex-1 space-y-4">
                  <label className="text-[10px] uppercase text-zinc-600 font-black tracking-[0.4em]">USDC Value</label>
                  <div className="relative h-[60px]">
                    <input 
                      type="number" 
                      className="w-full h-full bg-black border border-white/10 p-5 text-3xl font-bold text-white focus:border-[#BF953F] outline-none" 
                      value={invData.priceSol} 
                      onChange={e => setInvData({...invData, priceSol: Number(e.target.value)})} 
                      required 
                    />
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 text-[10px] font-black text-zinc-800 uppercase tracking-widest pointer-events-none">SETTLEMENT</div>
                  </div>
                </div>
                <button onClick={handleListSubmit} disabled={isListing} className="flex-1 h-[60px] bg-white text-black font-black uppercase text-[12px] tracking-[0.4em] hover:bg-[#BF953F] hover:text-white transition-all shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                  {isListing ? 'AUTHORIZING...' : 'DEPLOY INVENTORY'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {profile.role === UserRole.SPONSOR && (
        <div className="glass p-12 rounded-none border-white/10 flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4"><span className="bg-white text-black px-6 py-2 text-[10px] font-black uppercase tracking-[0.5em]">SPONSOR HUB</span></div>
          {sponsorApp?.status === SponsorStatus.APPROVED ? (
            <div className="p-16 text-center space-y-10">
              <Icons.Check className="w-24 h-24 mx-auto text-[#BF953F]" />
              <h2 className="text-3xl font-black uppercase text-white tracking-tighter">Account Verified</h2>
              <button onClick={() => window.location.hash = 'marketplace'} className="bg-white text-black px-16 py-6 font-black uppercase tracking-[0.5em] hover:bg-[#BF953F] transition-all">ENTER MARKETPLACE</button>
            </div>
          ) : (
            <form className="space-y-10 max-w-2xl mx-auto w-full" onSubmit={(e) => { e.preventDefault(); onApplySponsor(appData); }}>
              <div className="grid grid-cols-1 gap-8">
                <input type="text" placeholder="Contact Representative" className="w-full bg-black border border-white/10 p-5 text-white outline-none focus:border-[#BF953F]" value={appData.name} onChange={e => setAppData({...appData, name: e.target.value})} required />
                <input type="text" placeholder="Business Name" className="w-full bg-black border border-white/10 p-5 text-white outline-none focus:border-[#BF953F]" value={appData.companyName} onChange={e => setAppData({...appData, companyName: e.target.value})} required />
                <button type="submit" className="w-full bg-white text-black py-8 font-black uppercase text-[12px] tracking-[0.5em] hover:bg-[#BF953F] hover:text-white transition-all">INITIATE VERIFICATION</button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}; 

export default ProfileSetup;
