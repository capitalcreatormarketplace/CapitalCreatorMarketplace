
import React, { useState, useRef, useMemo } from 'react';
import { UserProfile, UserRole, SponsorApplication, SponsorStatus, ContentCategory, AdPosition } from '../types';
import { Icons } from '../constants';
import { processPayment } from '../services/solana';
import { verifyXProtocol } from '../services/gemini';

interface ProfileSetupProps {
  profile: UserProfile;
  sponsorApp?: SponsorApplication;
  onSaveProfile: (profile: UserProfile) => void;
  onApplySponsor: (app: SponsorApplication) => void;
  onListInventory: (item: any) => void;
}

const PLATFORM_OPTIONS = [
  'YouTube', 'Twitch', 'Facebook', 'X', 'Kick', 'Zora', 'PumpFun', 'Rumble', 'Instagram', 'TikTok', 'Discord', 'Other'
];

const ProfileSetup: React.FC<ProfileSetupProps> = ({ profile, sponsorApp, onSaveProfile, onApplySponsor, onListInventory }) => {
  const [isEditing, setIsEditing] = useState(!profile.name);
  const [formData, setFormData] = useState<UserProfile>(profile);
  const [isListing, setIsListing] = useState(false);
  
  // Verification Terminal State
  const [verificationStep, setVerificationStep] = useState<'IDLE' | 'AWAITING_POST' | 'SCANNING' | 'VERIFIED'>(profile.isXVerified ? 'VERIFIED' : 'IDLE');
  const [scanningStatus, setScanningStatus] = useState<string>('INITIALIZING...');
  const [tempHandle, setTempHandle] = useState(profile.xHandle || '');
  const [verifyCode] = useState(() => `CAPITAL-${Math.random().toString(36).substring(2, 6).toUpperCase()}`);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamImgRef = useRef<HTMLInputElement>(null);
  
  const [appData, setAppData] = useState<SponsorApplication>(
    sponsorApp || { name: '', companyName: '', monthsInBusiness: 0, logoUrl: '', status: SponsorStatus.NONE }
  );

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
  const [selectedTime, setSelectedTime] = useState({ hour: '12', minute: '00', period: 'PM', timezone: 'UTC' });
  const [invData, setInvData] = useState({ streamTime: '', placementDetail: '', priceSol: 100, platforms: [] as string[], category: ContentCategory.CRYPTO, adPosition: 'bottom-right' as AdPosition, streamPreviewUrl: '' });

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile(formData);
    setIsEditing(false);
  };

  const launchXIntent = () => {
    if (!tempHandle) return alert("Enter your X handle first.");
    const cleanHandle = tempHandle.replace('@', '');
    const tweetText = encodeURIComponent(`Verifying my identity for the @CapitalCreator0 Protocol. Proof: ${verifyCode}`);
    window.open(`https://x.com/intent/tweet?text=${tweetText}`, '_blank');
    setVerificationStep('AWAITING_POST');
  };

  const handleVerifySync = async () => {
    setVerificationStep('SCANNING');
    setScanningStatus('CONNECTING TO NEURAL MESH...');
    
    // Neural scan simulation sequence
    setTimeout(() => setScanningStatus('SEARCHING LIVE X FEED...'), 1200);
    setTimeout(() => setScanningStatus('EXTRACTING GROUNDING DATA...'), 2400);
    setTimeout(() => setScanningStatus('COMPARING CHALLENGE KEY...'), 3600);

    const result = await verifyXProtocol(tempHandle, `https://x.com/${tempHandle.replace('@','')}`, verifyCode);

    if (result.success) {
      setFormData({
        ...formData,
        isXVerified: true,
        xHandle: tempHandle.startsWith('@') ? tempHandle : `@${tempHandle}`,
        channelLink: `https://x.com/${tempHandle.replace('@','')}`
      });
      setVerificationStep('VERIFIED');
    } else {
      alert(`SYNC FAILED: ${result.message}. Ensure your tweet is public.`);
      setVerificationStep('AWAITING_POST');
    }
  };

  const handleListSubmit = async () => {
    if (!invData.streamPreviewUrl) return alert("Upload preview image.");
    const d = new Date(availableDays[selectedDayIdx]);
    let hourNum = parseInt(selectedTime.hour);
    if (selectedTime.period === 'PM' && hourNum !== 12) hourNum += 12;
    if (selectedTime.period === 'AM' && hourNum === 12) hourNum = 0;
    d.setHours(hourNum, parseInt(selectedTime.minute), 0, 0);
    setIsListing(true);
    try {
      const result = await processPayment(profile.address, 0.01);
      if (result.success) onListInventory({ ...invData, streamTime: d.toISOString() });
    } catch (e) { alert("Payment failed."); } finally { setIsListing(false); }
  };

  if (isEditing || !profile.name) {
    return (
      <div className="max-w-4xl mx-auto py-12 animate-fadeIn relative">
        <div className="glass p-8 md:p-12 rounded-none border-white/5 relative overflow-hidden bg-black/60">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#BF953F]/30 to-transparent"></div>
          
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black uppercase text-white tracking-tighter">Identity Core</h2>
            <p className="text-[#BF953F] font-bold uppercase tracking-[0.5em] text-[10px] opacity-60">Terminal Initialization</p>
          </div>

          {formData.role === UserRole.UNDEFINED ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-xl mx-auto">
              <button onClick={() => setFormData({...formData, role: UserRole.CREATOR})} className="group p-8 border border-white/5 hover:border-[#BF953F]/40 bg-black/40 text-left transition-all relative overflow-hidden">
                <div className="relative z-10">
                  <h3 className="text-lg font-black uppercase text-white mb-1">Creator</h3>
                  <p className="text-[9px] text-zinc-500 uppercase font-black tracking-widest leading-relaxed">Monetize content reach.</p>
                </div>
                <div className="absolute bottom-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity"><Icons.Plus className="w-12 h-12" /></div>
              </button>
              <button onClick={() => setFormData({...formData, role: UserRole.SPONSOR})} className="group p-8 border border-white/5 hover:border-[#BF953F]/40 bg-black/40 text-left transition-all relative overflow-hidden">
                <div className="relative z-10">
                  <h3 className="text-lg font-black uppercase text-white mb-1">Sponsor</h3>
                  <p className="text-[9px] text-zinc-500 uppercase font-black tracking-widest leading-relaxed">Secure premium placement.</p>
                </div>
                <div className="absolute bottom-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity"><Icons.Transact className="w-12 h-12" /></div>
              </button>
            </div>
          ) : (
            <form onSubmit={handleProfileSubmit} className="space-y-10">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <div className="lg:col-span-7 space-y-8">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase text-zinc-600 font-black tracking-widest">Display Label (Identity)</label>
                    <input 
                      type="text" 
                      className="w-full bg-black/80 border border-white/10 p-5 text-xl text-white font-black uppercase outline-none focus:border-[#BF953F]/40 transition-all placeholder:text-zinc-900" 
                      value={formData.name} 
                      onChange={e => setFormData({...formData, name: e.target.value.toUpperCase()})} 
                      placeholder="E.G. CAPITAL_ONE"
                      required 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase text-zinc-600 font-black tracking-widest">Identity Sync (X Protocol)</label>
                    <div className={`glass bg-black border p-6 flex flex-col justify-center min-h-[100px] transition-all duration-500 ${verificationStep === 'VERIFIED' ? 'border-[#1DA1F2]/40' : 'border-white/5'}`}>
                      {verificationStep === 'IDLE' && (
                        <div className="flex flex-col md:flex-row gap-4">
                           <input 
                             type="text" 
                             className="flex-grow bg-transparent text-lg text-white font-black outline-none placeholder:text-zinc-800" 
                             value={tempHandle} 
                             onChange={e => setTempHandle(e.target.value)} 
                             placeholder="@XHANDLE" 
                           />
                           <button 
                             type="button" 
                             onClick={launchXIntent} 
                             className="bg-[#1DA1F2] text-black px-8 py-3 font-black uppercase text-[10px] tracking-widest hover:brightness-110 shadow-[0_0_20px_rgba(29,161,242,0.2)]"
                           >
                             Sync with X
                           </button>
                        </div>
                      )}
                      
                      {verificationStep === 'AWAITING_POST' && (
                        <div className="space-y-5 animate-fadeIn">
                           <div className="flex items-center justify-between border-b border-white/5 pb-3">
                              <p className="text-[9px] text-[#1DA1F2] uppercase font-black tracking-widest">Protocol Initiated</p>
                              <code className="text-[#1DA1F2] font-mono text-xs">{verifyCode}</code>
                           </div>
                           <p className="text-[11px] text-zinc-400 font-medium leading-relaxed">We've opened X. Hit "Post" on the pre-filled tweet, then return here to finalize identity sync.</p>
                           <button 
                             type="button" 
                             onClick={handleVerifySync} 
                             className="w-full bg-white text-black py-4 font-black uppercase text-[11px] tracking-[0.3em] hover:bg-[#1DA1F2] hover:text-white transition-all shadow-xl"
                           >
                             I've Posted - Sync Identity
                           </button>
                        </div>
                      )}

                      {verificationStep === 'SCANNING' && (
                        <div className="flex flex-col items-center gap-4 py-4">
                           <div className="w-8 h-8 border-4 border-[#1DA1F2]/20 border-t-[#1DA1F2] rounded-full animate-spin"></div>
                           <div className="text-center">
                              <span className="text-[10px] text-[#1DA1F2] font-black uppercase tracking-[0.4em] block mb-1">NEURAL SCAN IN PROGRESS</span>
                              <span className="text-[8px] text-zinc-600 font-mono uppercase tracking-widest">{scanningStatus}</span>
                           </div>
                        </div>
                      )}

                      {verificationStep === 'VERIFIED' && (
                        <div className="flex items-center justify-between">
                           <div className="flex items-center gap-4">
                              <div className="text-[#1DA1F2] shadow-[0_0_20px_rgba(29,161,242,0.4)] p-1 border-2 border-[#1DA1F2] rounded-full">
                                <Icons.Check className="w-6 h-6" strokeWidth={5} />
                              </div>
                              <div className="space-y-0.5">
                                <span className="text-lg font-black text-white tracking-tight uppercase block leading-none">{formData.xHandle}</span>
                                <span className="text-[9px] text-[#1DA1F2] font-black uppercase tracking-widest opacity-80">IDENTITY SYNCED</span>
                              </div>
                           </div>
                           <button type="button" onClick={() => { setVerificationStep('IDLE'); setFormData({...formData, isXVerified: false}); }} className="text-[9px] text-zinc-700 hover:text-white uppercase font-black tracking-widest underline underline-offset-4">Reset Sync</button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-5 space-y-8">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase text-zinc-600 font-black tracking-widest">Platforms (Broadcast Nodes)</label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {PLATFORM_OPTIONS.slice(0, 9).map(p => {
                        const isSel = formData.platforms?.includes(p);
                        return (
                          <button 
                            key={p} 
                            type="button" 
                            onClick={() => {
                              const cur = formData.platforms || [];
                              setFormData({...formData, platforms: cur.includes(p) ? cur.filter(x => x !== p) : [...cur, p]});
                            }} 
                            className={`p-3 border text-[9px] font-black uppercase tracking-tighter transition-all ${isSel ? 'bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.2)]' : 'bg-black text-zinc-500 border-white/5 hover:border-white/10'}`}
                          >
                            {p}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase text-zinc-600 font-black tracking-widest">Content Vertical</label>
                    <div className="relative">
                      <select 
                        className="w-full bg-black/80 border border-white/10 p-5 text-[11px] text-white font-black uppercase outline-none appearance-none cursor-pointer focus:border-white/30" 
                        value={formData.niche} 
                        onChange={e => setFormData({...formData, niche: e.target.value})}
                      >
                         {Object.values(ContentCategory).map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                      <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-600"><Icons.ChevronDown /></div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="pt-8 border-t border-white/5">
                <button type="submit" className="w-full bg-white text-black py-6 font-black uppercase text-[12px] tracking-[0.5em] hover:bg-[#BF953F] hover:text-white transition-all shadow-2xl">Deploy Terminal Identity</button>
                <button type="button" onClick={() => setFormData({...profile, role: UserRole.UNDEFINED})} className="w-full mt-4 text-[9px] uppercase font-black text-zinc-700 hover:text-zinc-500 tracking-widest">Reset Role Selection</button>
              </div>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-8 animate-fadeIn pb-20">
      {(profile.notifications || []).length > 0 && (
        <div className="space-y-2">
          {profile.notifications?.slice(0, 3).map(notif => (
            <div key={notif.id} className="bg-[#BF953F]/10 border border-[#BF953F]/40 p-4 flex items-center gap-4 animate-pulse">
               <div className="text-[#BF953F]"><Icons.Check strokeWidth={4} /></div>
               <p className="text-[10px] text-white font-black uppercase tracking-widest">{notif.message}</p>
               <span className="ml-auto text-[8px] text-zinc-500 font-mono">{new Date(notif.timestamp).toLocaleTimeString()}</span>
            </div>
          ))}
        </div>
      )}

      <section className="glass p-8 rounded-none border-white/10 flex flex-col md:flex-row gap-8 relative overflow-hidden bg-black/40">
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-[#BF953F]/5 to-transparent pointer-events-none"></div>
        <div className="w-24 h-24 bg-black border border-white/10 rounded-full flex items-center justify-center overflow-hidden shrink-0 shadow-2xl relative z-10">
          {profile.avatarUrl ? <img src={profile.avatarUrl} className="w-full h-full object-cover" /> : <span className="text-3xl font-black text-[#BF953F] opacity-20">{profile.name.slice(0,2)}</span>}
        </div>
        <div className="flex-grow space-y-4 relative z-10">
          <div className="flex justify-between items-start">
             <div className="space-y-1">
                <h2 className="text-4xl font-black text-white uppercase tracking-tighter leading-none">{profile.name}</h2>
                {profile.isXVerified && (
                  <a href={profile.channelLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-[#1DA1F2] group hover:brightness-125 transition-all">
                    <Icons.Check className="w-4 h-4 drop-shadow-[0_0_5px_rgba(29,161,242,0.5)]" strokeWidth={5} />
                    <span className="text-[11px] font-black uppercase tracking-widest border-b border-[#1DA1F2]/20 group-hover:border-[#1DA1F2]">{profile.xHandle} Verified</span>
                  </a>
                )}
             </div>
             <button onClick={() => setIsEditing(true)} className="text-[9px] text-zinc-500 hover:text-white uppercase font-black border border-white/5 px-6 py-2 bg-black/40 hover:bg-white/5 transition-all">Edit Terminal</button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center md:text-left pt-2">
             <div className="p-4 border border-white/5 bg-white/2"><p className="text-[8px] uppercase text-zinc-500 font-black mb-1">Settled Yield</p><p className="text-2xl font-bold font-mono text-white">${profile.revenueEarned}</p></div>
             <div className="p-4 border border-white/5 bg-white/2"><p className="text-[8px] uppercase text-zinc-500 font-black mb-1">Sync Points</p><p className="text-2xl font-bold font-mono text-white">{profile.timesHired}</p></div>
             <div className="p-4 border border-white/5 bg-white/2"><p className="text-[8px] uppercase text-zinc-500 font-black mb-1">Identity Core</p><p className="text-sm font-black text-[#BF953F] uppercase tracking-widest">{profile.niche || 'CRYPTO'}</p></div>
          </div>
        </div>
      </section>

      {profile.role === UserRole.CREATOR && (
        <div className="glass p-10 border-white/5 space-y-12 bg-black/40 relative">
          <div className="absolute top-0 right-0 p-4 opacity-10 font-black text-6xl select-none pointer-events-none tracking-tighter">COMMAND</div>
          <h3 className="text-2xl font-black uppercase text-white tracking-tighter">Broadcast Inventory Terminal</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-8">
               <div className="space-y-2">
                  <label className="text-[9px] uppercase text-zinc-600 font-black tracking-widest">Preview Visualization</label>
                  <div onClick={() => streamImgRef.current?.click()} className="relative aspect-video w-full bg-black border border-white/5 flex items-center justify-center cursor-pointer group overflow-hidden shadow-2xl hover:border-white/20 transition-all">
                      {invData.streamPreviewUrl ? <img src={invData.streamPreviewUrl} className="w-full h-full object-cover" /> : <p className="text-[9px] font-black text-zinc-700 uppercase tracking-widest">Upload Feed Frame</p>}
                      <input type="file" ref={streamImgRef} className="hidden" accept="image/*" onChange={e => {
                        const reader = new FileReader();
                        reader.onloadend = () => setInvData({...invData, streamPreviewUrl: reader.result as string});
                        if (e.target.files?.[0]) reader.readAsDataURL(e.target.files[0]);
                      }} />
                  </div>
               </div>
               <div className="grid grid-cols-3 gap-1">
                 {(['top-left', 'top-center', 'top-right', 'bottom-left', 'bottom-center', 'bottom-right'] as AdPosition[]).map(pos => (
                    <button key={pos} onClick={() => setInvData({...invData, adPosition: pos})} className={`py-3 border text-[9px] font-black uppercase transition-all ${invData.adPosition === pos ? 'bg-[#BF953F] text-black border-[#BF953F]' : 'bg-black text-zinc-700 border-white/5 hover:border-white/10'}`}>{pos.split('-').join(' ')}</button>
                 ))}
               </div>
            </div>
            <div className="space-y-8">
               <div className="space-y-3">
                 <label className="text-[9px] uppercase text-zinc-600 font-black tracking-widest">Scheduling Matrix</label>
                 <div className="grid grid-cols-7 gap-1">
                    {availableDays.map((d, i) => (
                      <button key={i} onClick={() => setSelectedDayIdx(i)} className={`aspect-square flex flex-col items-center justify-center border text-[8px] font-black uppercase transition-all ${selectedDayIdx === i ? 'bg-[#BF953F] text-black border-[#BF953F]' : 'bg-black text-zinc-700 border-white/5 hover:border-white/10'}`}>
                        <span className="opacity-60">{d.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                        <span className="text-sm font-bold">{d.getDate()}</span>
                      </button>
                    ))}
                 </div>
                 <div className="flex gap-2 h-[55px]">
                    <div className="flex-1 flex bg-black border border-white/5 items-center overflow-hidden">
                       <input type="text" className="w-1/2 bg-transparent text-center text-white font-bold text-xl outline-none" value={selectedTime.hour} onChange={e => setSelectedTime({...selectedTime, hour: e.target.value})} maxLength={2} />
                       <span className="text-zinc-800">:</span>
                       <input type="text" className="w-1/2 bg-transparent text-center text-white font-bold text-xl outline-none" value={selectedTime.minute} onChange={e => setSelectedTime({...selectedTime, minute: e.target.value})} maxLength={2} />
                    </div>
                    <button onClick={() => setSelectedTime({...selectedTime, period: selectedTime.period === 'AM' ? 'PM' : 'AM'})} className="w-20 bg-black border border-white/5 text-[10px] font-black uppercase text-white hover:border-white/20">{selectedTime.period}</button>
                 </div>
               </div>
               <div className="space-y-3">
                  <label className="text-[9px] uppercase text-zinc-600 font-black tracking-widest">Settlement USDC</label>
                  <div className="relative">
                    <input type="number" className="w-full bg-black border border-white/5 p-5 text-4xl font-bold text-white outline-none focus:border-[#BF953F]/40" value={invData.priceSol} onChange={e => setInvData({...invData, priceSol: Number(e.target.value)})} />
                    <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[10px] font-black text-zinc-700 tracking-[0.3em]">USDC</span>
                  </div>
               </div>
               <button onClick={handleListSubmit} disabled={isListing} className="w-full bg-white text-black py-6 font-black uppercase text-[12px] tracking-[0.4em] hover:bg-[#BF953F] hover:text-white transition-all shadow-2xl">DEPLOY INVENTORY</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; export default ProfileSetup;
