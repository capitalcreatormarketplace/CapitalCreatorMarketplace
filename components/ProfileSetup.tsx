
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

const PLATFORM_OPTIONS = [
  'YouTube', 'Twitch', 'Facebook', 'X', 'Kick', 'Zora', 'PumpFun', 'Rumble', 'Instagram', 'TikTok', 'Discord', 'Other'
];

const ProfileSetup: React.FC<ProfileSetupProps> = ({ profile, sponsorApp, onSaveProfile, onApplySponsor, onListInventory }) => {
  const [isEditing, setIsEditing] = useState(!profile.name);
  const [formData, setFormData] = useState<UserProfile>(profile);
  const [isListing, setIsListing] = useState(false);
  const [verificationStep, setVerificationStep] = useState<'IDLE' | 'CHALLENGE' | 'SCANNING' | 'VERIFIED'>(profile.isXVerified ? 'VERIFIED' : 'IDLE');
  const [tempHandle, setTempHandle] = useState(profile.xHandle || '');
  const [tweetUrl, setTweetUrl] = useState('');
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

  const handleListSubmit = async () => {
    if (!invData.streamPreviewUrl) return alert("Upload preview image.");
    if (invData.platforms.length === 0) return alert("Select platform.");
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
        <div className="glass p-8 rounded-none border-white/5 relative">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-black uppercase text-white">System Initialization</h2>
            <p className="text-[#BF953F] font-bold uppercase tracking-[0.4em] text-[9px]">Terminal Identity Protocol</p>
          </div>
          {formData.role === UserRole.UNDEFINED ? (
            <div className="grid grid-cols-2 gap-4 max-w-xl mx-auto">
              <button onClick={() => setFormData({...formData, role: UserRole.CREATOR})} className="p-6 border border-white/5 hover:border-[#BF953F]/40 bg-black/40 text-left uppercase text-xs font-black tracking-widest text-white">Creator Mode</button>
              <button onClick={() => setFormData({...formData, role: UserRole.SPONSOR})} className="p-6 border border-white/5 hover:border-[#BF953F]/40 bg-black/40 text-left uppercase text-xs font-black tracking-widest text-white">Sponsor Mode</button>
            </div>
          ) : (
            <form onSubmit={handleProfileSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase text-zinc-600 font-black tracking-widest">Brand Name</label>
                    <input type="text" className="w-full bg-black/60 border border-white/10 p-4 text-white font-black uppercase outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value.toUpperCase()})} required />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase text-zinc-600 font-black tracking-widest">X Identity</label>
                    <input type="text" className="w-full bg-black/60 border border-white/10 p-4 text-white font-black outline-none" value={tempHandle} onChange={e => setTempHandle(e.target.value)} placeholder="@Handle" />
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="text-[9px] uppercase text-zinc-600 font-black tracking-widest">Platforms</label>
                  <div className="grid grid-cols-3 gap-1">
                    {PLATFORM_OPTIONS.slice(0, 9).map(p => (
                      <button key={p} type="button" onClick={() => {
                        const cur = formData.platforms || [];
                        setFormData({...formData, platforms: cur.includes(p) ? cur.filter(x => x !== p) : [...cur, p]});
                      }} className={`p-2 border text-[8px] font-black uppercase transition-all ${formData.platforms?.includes(p) ? 'bg-white text-black' : 'text-zinc-500 border-white/5'}`}>{p}</button>
                    ))}
                  </div>
                </div>
              </div>
              <button type="submit" className="w-full bg-white text-black py-4 font-black uppercase text-[10px] tracking-widest">Commit Terminal Identity</button>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-8 animate-fadeIn pb-20">
      {/* Notification Area for the Seller */}
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

      <section className="glass p-6 rounded-none border-white/10 flex flex-col md:flex-row gap-6">
        <div className="w-20 h-20 bg-black border border-white/10 rounded-full flex items-center justify-center overflow-hidden shrink-0">
          {profile.avatarUrl ? <img src={profile.avatarUrl} className="w-full h-full object-cover" /> : <span className="text-2xl font-black text-[#BF953F] opacity-20">{profile.name.slice(0,2)}</span>}
        </div>
        <div className="flex-grow space-y-4">
          <div className="flex justify-between items-start">
             <div>
                <h2 className="text-2xl font-black text-white uppercase">{profile.name}</h2>
                <span className="text-[10px] text-[#1DA1F2] font-black uppercase tracking-widest">{profile.xHandle}</span>
             </div>
             <button onClick={() => setIsEditing(true)} className="text-[9px] text-zinc-500 hover:text-white uppercase font-black border border-white/5 px-4 py-1.5">Edit</button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center md:text-left">
             <div><p className="text-[8px] uppercase text-zinc-500 font-black">Revenue</p><p className="text-xl font-bold font-mono">${profile.revenueEarned}</p></div>
             <div><p className="text-[8px] uppercase text-zinc-500 font-black">Hires</p><p className="text-xl font-bold font-mono">{profile.timesHired}</p></div>
             <div><p className="text-[8px] uppercase text-zinc-500 font-black">Niche</p><p className="text-sm font-black text-[#BF953F]">{profile.niche || 'N/A'}</p></div>
          </div>
        </div>
      </section>

      {profile.role === UserRole.CREATOR && (
        <div className="glass p-8 border-white/5 space-y-10">
          <h3 className="text-xl font-black uppercase text-white tracking-widest">Broadcast Command Terminal</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
               <div onClick={() => streamImgRef.current?.click()} className="relative aspect-video w-full bg-black border border-white/5 flex items-center justify-center cursor-pointer group overflow-hidden">
                  {invData.streamPreviewUrl ? <img src={invData.streamPreviewUrl} className="w-full h-full object-cover" /> : <p className="text-[9px] font-black text-zinc-700 uppercase">Upload Feed Frame</p>}
                  <input type="file" ref={streamImgRef} className="hidden" accept="image/*" onChange={e => {
                    const reader = new FileReader();
                    reader.onloadend = () => setInvData({...invData, streamPreviewUrl: reader.result as string});
                    if (e.target.files?.[0]) reader.readAsDataURL(e.target.files[0]);
                  }} />
               </div>
               <div className="grid grid-cols-3 gap-1">
                 {(['top-left', 'top-center', 'top-right', 'bottom-left', 'bottom-center', 'bottom-right'] as AdPosition[]).map(pos => (
                    <button key={pos} onClick={() => setInvData({...invData, adPosition: pos})} className={`py-2 border text-[8px] font-black uppercase transition-all ${invData.adPosition === pos ? 'bg-[#BF953F] text-black border-[#BF953F]' : 'bg-black text-zinc-700 border-white/5'}`}>{pos.split('-').join(' ')}</button>
                 ))}
               </div>
            </div>
            <div className="space-y-6">
               <div className="space-y-2">
                 <label className="text-[9px] uppercase text-zinc-600 font-black">Calendar & Timing</label>
                 <div className="grid grid-cols-7 gap-1">
                    {availableDays.map((d, i) => (
                      <button key={i} onClick={() => setSelectedDayIdx(i)} className={`aspect-square flex flex-col items-center justify-center border text-[8px] font-black uppercase ${selectedDayIdx === i ? 'bg-[#BF953F] text-black' : 'bg-black text-zinc-700 border-white/5'}`}>
                        <span>{d.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                        <span className="text-xs">{d.getDate()}</span>
                      </button>
                    ))}
                 </div>
                 <div className="flex gap-1 h-[45px]">
                    <input type="text" className="w-1/2 bg-black border border-white/5 text-center text-white font-bold" value={selectedTime.hour} onChange={e => setSelectedTime({...selectedTime, hour: e.target.value})} maxLength={2} />
                    <button onClick={() => setSelectedTime({...selectedTime, period: selectedTime.period === 'AM' ? 'PM' : 'AM'})} className="flex-1 bg-black border border-white/5 text-[10px] font-black uppercase text-white">{selectedTime.period}</button>
                 </div>
               </div>
               <div className="space-y-2">
                  <label className="text-[9px] uppercase text-zinc-600 font-black">Settlement USDC</label>
                  <input type="number" className="w-full bg-black border border-white/5 p-4 text-xl font-bold text-white outline-none" value={invData.priceSol} onChange={e => setInvData({...invData, priceSol: Number(e.target.value)})} />
               </div>
               <button onClick={handleListSubmit} disabled={isListing} className="w-full bg-white text-black py-5 font-black uppercase text-[10px] tracking-widest hover:bg-[#BF953F] transition-all">DEPLOY INVENTORY</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; export default ProfileSetup;
