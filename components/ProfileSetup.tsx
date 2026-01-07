
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
  
  // Verification States
  const [verificationStep, setVerificationStep] = useState<'IDLE' | 'CHALLENGE' | 'SCANNING' | 'VERIFIED'>(profile.isXVerified ? 'VERIFIED' : 'IDLE');
  const [tempHandle, setTempHandle] = useState('');
  const [verifyCode] = useState(() => `CAPITAL-${Math.random().toString(36).substring(2, 6).toUpperCase()}`);

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
    if (verificationStep !== 'VERIFIED') {
      alert("Please verify your X account identity first.");
      return;
    }
    onSaveProfile(formData);
    setIsEditing(false);
  };

  const startVerification = () => {
    if (!tempHandle) return alert("Enter your X handle first.");
    setVerificationStep('CHALLENGE');
  };

  const handleVerifyNow = () => {
    setVerificationStep('SCANNING');
    // Simulate Terminal Scanning
    setTimeout(() => {
      setFormData({
        ...formData,
        name: tempHandle.replace('@', '').toUpperCase(),
        isXVerified: true,
        xHandle: tempHandle.startsWith('@') ? tempHandle : `@${tempHandle}`,
        channelLink: `https://x.com/${tempHandle.replace('@', '')}`
      });
      setVerificationStep('VERIFIED');
    }, 4500);
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
    if (invData.platforms.length === 0) return alert("Please select at least one broadcast host.");
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
          <div className="text-center space-y-2 relative z-10">
            <h2 className="text-4xl font-black uppercase tracking-tighter text-white">System Initialization</h2>
            <p className="text-[#BF953F] font-bold uppercase tracking-[0.5em] text-[10px]">Configure your Capital Creator profile</p>
          </div>

          {formData.role === UserRole.UNDEFINED ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
              <button onClick={() => setFormData({...formData, role: UserRole.CREATOR})} className="group p-8 border-2 border-white/10 hover:border-[#BF953F]/40 hover:bg-[#BF953F]/5 transition-all text-left">
                <h3 className="text-xl font-black uppercase tracking-tight text-white">Creator</h3>
                <p className="text-sm text-zinc-400 mt-2">List inventory, connect with sponsors, earn revenue.</p>
              </button>
              <button onClick={() => setFormData({...formData, role: UserRole.SPONSOR})} className="group p-8 border-2 border-white/10 hover:border-[#BF953F]/40 hover:bg-[#BF953F]/5 transition-all text-left">
                <h3 className="text-xl font-black uppercase tracking-tight text-white">Sponsor</h3>
                <p className="text-sm text-zinc-400 mt-2">Discover creators and grow your brand reach.</p>
              </button>
            </div>
          ) : (
            <form onSubmit={handleProfileSubmit} className="space-y-10 relative z-10">
              <div className="flex flex-col items-center gap-4">
                <div onClick={handleAvatarClick} className="relative w-36 h-36 rounded-full border-2 border-[#BF953F] flex items-center justify-center cursor-pointer group hover:bg-[#BF953F]/10 transition-all overflow-hidden bg-black/40 shadow-[0_0_40px_rgba(191,149,63,0.2)]">
                  {formData.avatarUrl ? (
                    <img src={formData.avatarUrl} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center space-y-2">
                      <div className="text-[#BF953F] flex justify-center"><Icons.Plus className="w-8 h-8" /></div>
                      <span className="text-[9px] font-black uppercase tracking-widest text-[#BF953F]">Brand Logo</span>
                    </div>
                  )}
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                </div>
              </div>

              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[8.5px] uppercase text-zinc-500 font-bold tracking-widest">
                      {verificationStep === 'VERIFIED' ? 'Verified Account (Locked)' : 'Brand Name'}
                    </label>
                    <input 
                      type="text" 
                      placeholder="e.g. ChartMaster" 
                      disabled={verificationStep === 'VERIFIED'}
                      className={`w-full bg-black/60 border p-5 text-base font-bold outline-none transition-all ${verificationStep === 'VERIFIED' ? 'border-[#1DA1F2]/60 text-[#1DA1F2] opacity-90' : 'border-white/10 focus:border-[#BF953F] text-white'}`} 
                      value={formData.name} 
                      onChange={e => setFormData({...formData, name: e.target.value})} 
                      required 
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[8.5px] uppercase text-zinc-500 font-bold tracking-widest">Broadcast Cluster</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {PLATFORM_OPTIONS.map(p => {
                        const isSel = (formData.platforms || []).includes(p);
                        return (
                          <button key={p} type="button" onClick={() => handleTogglePlatform(p, true)} className={`p-3 border text-[9px] font-black uppercase tracking-widest transition-all ${isSel ? 'bg-[#BF953F] text-black border-[#BF953F]' : 'bg-black/40 text-zinc-500 border-white/10'}`}>
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
                    
                    {verificationStep === 'IDLE' && (
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          placeholder="@XHandle" 
                          className="flex-grow bg-black/60 border border-white/10 p-5 text-base font-bold text-white outline-none focus:border-[#1DA1F2]" 
                          value={tempHandle}
                          onChange={e => setTempHandle(e.target.value)}
                        />
                        <button type="button" onClick={startVerification} className="bg-[#1DA1F2] text-black px-6 font-black uppercase text-[10px] tracking-widest">Verify</button>
                      </div>
                    )}

                    {verificationStep === 'CHALLENGE' && (
                      <div className="bg-white/5 border border-[#1DA1F2]/30 p-5 space-y-4">
                        <p className="text-[9px] text-zinc-400 uppercase font-bold tracking-widest leading-relaxed">
                          To verify control of <span className="text-white">{tempHandle}</span>, post a tweet with:
                        </p>
                        <div className="bg-black p-3 border border-dashed border-[#1DA1F2] text-center">
                          <code className="text-[#1DA1F2] font-black text-lg tracking-widest">{verifyCode}</code>
                        </div>
                        <div className="flex gap-2">
                          <a 
                            href={`https://x.com/intent/tweet?text=Verifying my account for @CapitalCreator0: ${verifyCode}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-grow bg-[#1DA1F2] text-black text-center py-3 font-black uppercase text-[9px] tracking-widest flex items-center justify-center gap-2"
                          >
                            <Icons.X className="w-3 h-3" /> Post Tweet
                          </a>
                          <button type="button" onClick={handleVerifyNow} className="bg-white text-black px-4 font-black uppercase text-[9px] tracking-widest">I've Posted</button>
                        </div>
                        <button type="button" onClick={() => setVerificationStep('IDLE')} className="text-[8px] text-zinc-600 uppercase font-black tracking-widest hover:text-white">Cancel</button>
                      </div>
                    )}

                    {verificationStep === 'SCANNING' && (
                      <div className="w-full bg-black border border-[#1DA1F2]/40 p-10 flex flex-col items-center justify-center space-y-4">
                        <div className="w-full h-1 bg-white/5 relative overflow-hidden">
                           <div className="absolute inset-0 bg-[#1DA1F2] w-1/3 animate-[scanning_1.5s_infinite]"></div>
                        </div>
                        <p className="text-[9px] text-[#1DA1F2] font-black uppercase tracking-[0.4em] animate-pulse">Scanning X Terminal...</p>
                        <style>{`@keyframes scanning { 0% { left: -33% } 100% { left: 100% } }`}</style>
                      </div>
                    )}

                    {verificationStep === 'VERIFIED' && (
                      <div className="w-full bg-[#080a0c] border-2 border-[#1DA1F2] p-5 pt-7 flex items-center justify-between group transition-all relative overflow-visible h-[100px] shadow-[0_0_20px_rgba(29,161,242,0.1)]">
                        {/* THE BLUE BOX HEADER TAB */}
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
                          onClick={() => { setVerificationStep('IDLE'); setFormData({...formData, isXVerified: false, xHandle: '', name: ''}); }} 
                          className="text-[11px] text-zinc-500 hover:text-white uppercase font-black tracking-widest transition-colors pr-2 mt-4"
                        >
                          RESET
                        </button>
                      </div>
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
                  <label className="text-[8.5px] uppercase text-zinc-500 font-bold tracking-widest">Biography</label>
                  <textarea placeholder="Briefly describe your channel..." className="w-full bg-black/60 border border-white/10 p-5 min-h-[140px] text-sm focus:border-[#BF953F] outline-none text-white transition-all resize-none" value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} required />
                </div>
                <div className="flex justify-between items-center pt-10 border-t border-white/5">
                  <button type="button" onClick={() => setFormData({...profile, role: UserRole.UNDEFINED})} className="text-[10px] uppercase font-black tracking-[0.4em] text-zinc-500 hover:text-white transition-colors">Back</button>
                  <button type="submit" className="bg-white text-black px-14 py-6 font-black uppercase text-[12px] tracking-widest hover:bg-[#BF953F] hover:text-white transition-all shadow-[0_0_40px_rgba(255,255,255,0.1)]">Save Profile</button>
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
                  </div>
                </div>
                <button onClick={() => setIsEditing(true)} className="text-[10px] text-zinc-500 hover:text-[#BF953F] uppercase font-black tracking-[0.4em] border border-white/10 px-8 py-4 transition-all">Edit Identity</button>
              </div>
              {profile.role === UserRole.CREATOR && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 py-4">
                  <div className="space-y-2"><p className="text-[10px] uppercase text-zinc-500 font-black tracking-widest">Revenue</p><p className="text-3xl font-mono font-bold text-white">${profile.revenueEarned?.toLocaleString()}</p></div>
                  <div className="space-y-2"><p className="text-[10px] uppercase text-zinc-500 font-black tracking-widest">Active Hires</p><p className="text-3xl font-mono font-bold text-white">{profile.timesHired}</p></div>
                  <div className="space-y-2"><p className="text-[10px] uppercase text-zinc-500 font-black tracking-widest">Avg Concurrent</p><p className="text-3xl font-mono font-bold text-white">{profile.avgAudienceSize?.toLocaleString()}</p></div>
                  <div className="space-y-2"><p className="text-[10px] uppercase text-zinc-500 font-black tracking-widest">Niche</p><p className="text-3xl font-bold text-[#BF953F] uppercase tracking-tighter">{profile.niche}</p></div>
                </div>
              )}
              <p className="text-zinc-400 leading-relaxed text-lg italic max-w-4xl border-l-4 border-[#BF953F]/30 pl-8 py-4 bg-white/5">{profile.bio}</p>
            </div>
          </div>
        </div>
      </section>

      {profile.role === UserRole.CREATOR && (
        <div className="glass p-12 rounded-none border-white/10 flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4"><span className="bg-[#BF953F] text-black px-6 py-2 text-[10px] font-black uppercase tracking-[0.5em]">CREATOR COMMAND</span></div>
          <div className="flex flex-col lg:flex-row gap-20">
            <div className="lg:w-1/3 space-y-10">
              <h3 className="text-3xl font-black uppercase tracking-tight text-white">Broadcast Inventory</h3>
              <div className="p-8 bg-[#BF953F]/5 border-2 border-[#BF953F]/20 space-y-6">
                <p className="text-[12px] font-black uppercase tracking-[0.4em] text-[#BF953F]">Protocol Parameters</p>
                <ul className="text-[12px] text-zinc-400 space-y-4 uppercase font-bold tracking-widest">
                  <li className="flex justify-between"><span>Max Lookahead</span> <span className="text-white">7 Days</span></li>
                  <li className="flex justify-between"><span>Listing Fee</span> <span className="text-[#BF953F]">$0.01 USDC</span></li>
                  <li className="flex justify-between"><span>Creator Cut</span> <span className="text-white">90%</span></li>
                </ul>
              </div>
            </div>
            <div className="lg:w-2/3 space-y-10">
              <div onClick={() => streamImgRef.current?.click()} className="relative aspect-video w-full bg-black border-2 border-dashed border-white/10 flex items-center justify-center cursor-pointer group hover:border-[#BF953F]/40 transition-all overflow-hidden">
                {invData.streamPreviewUrl ? (
                  <>
                    <img src={invData.streamPreviewUrl} className="w-full h-full object-cover" alt="Stream Preview" />
                    <div className={`absolute ${getPositionClasses(invData.adPosition)} z-10 bg-white/40 backdrop-blur-md border border-white px-3 py-1.5 text-[10px] text-black font-black uppercase animate-pulse`}>YOUR LOGO HERE</div>
                  </>
                ) : (
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Click to upload stream layout</p>
                )}
                <input type="file" ref={streamImgRef} className="hidden" accept="image/*" onChange={handleStreamPreviewUpload} />
              </div>
              <div className="grid grid-cols-3 gap-4">
                {(['top-left', 'top-center', 'top-right', 'bottom-left', 'bottom-center', 'bottom-right'] as AdPosition[]).map(pos => (
                  <button key={pos} onClick={() => setInvData({...invData, adPosition: pos})} className={`p-4 border text-[9px] font-black uppercase tracking-widest transition-all ${invData.adPosition === pos ? 'bg-[#BF953F] text-black border-[#BF953F]' : 'bg-white/5 text-zinc-500 border-white/5'}`}>{pos.replace('-', ' ')}</button>
                ))}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-3">
                  <label className="text-[10px] uppercase text-gray-500 font-black tracking-widest">USDC Value</label>
                  <input type="number" className="w-full bg-black/60 border border-white/10 p-5 text-white focus:border-[#BF953F] outline-none font-bold" value={invData.priceSol} onChange={e => setInvData({...invData, priceSol: Number(e.target.value)})} required />
                </div>
                <button onClick={handleListSubmit} disabled={isListing} className="w-full bg-white text-black py-8 font-black uppercase text-[14px] tracking-[0.5em] hover:bg-[#BF953F] hover:text-white transition-all shadow-[0_0_50px_rgba(255,255,255,0.1)]">
                  {isListing ? 'AUTHORIZING SOLANA FEE...' : 'DEPLOY INVENTORY'}
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
              <h2 className="text-4xl font-black uppercase text-white tracking-tighter">Account Verified</h2>
              <button onClick={() => window.location.hash = 'marketplace'} className="bg-white text-black px-16 py-6 font-black uppercase tracking-[0.5em] hover:bg-[#BF953F] transition-all">ENTER MARKETPLACE</button>
            </div>
          ) : (
            <form className="space-y-10 max-w-2xl mx-auto w-full" onSubmit={(e) => { e.preventDefault(); onApplySponsor(appData); }}>
              <div className="grid grid-cols-1 gap-8">
                <input type="text" placeholder="Contact Representative" className="w-full bg-black border border-white/10 p-5 text-white outline-none focus:border-[#BF953F]" value={appData.name} onChange={e => setAppData({...appData, name: e.target.value})} required />
                <input type="text" placeholder="Business Name" className="w-full bg-black border border-white/10 p-5 text-white outline-none focus:border-[#BF953F]" value={appData.companyName} onChange={e => setAppData({...appData, companyName: e.target.value})} required />
                <button type="submit" className="w-full bg-white text-black py-8 font-black uppercase text-[14px] tracking-[0.5em] hover:bg-[#BF953F] hover:text-white transition-all">INITIATE VERIFICATION</button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}; 

export default ProfileSetup;
