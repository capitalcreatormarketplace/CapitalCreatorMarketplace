import React, { useState } from 'react';
import { UserProfile, UserRole, SponsorApplication, SponsorStatus } from '../types.ts';
import { Icons } from '../constants.tsx';

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
    priceSol: 1,
    platform: 'Twitch'
  });

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile(formData);
    setEditing(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 py-8 animate-fadeIn">
      {/* Profile Header */}
      <section className="glass p-8 rounded-2xl border-white/20">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
          <div className="w-24 h-24 rounded-full bg-white/10 border-2 border-white/20 flex items-center justify-center overflow-hidden">
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-3xl font-bold opacity-20">{profile.address.slice(0,2)}</span>
            )}
          </div>
          
          <div className="flex-grow">
            {editing ? (
              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <input 
                  type="text" 
                  placeholder="Your Name"
                  className="w-full bg-black/50 border border-white/20 p-3 rounded text-xl font-bold"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  required
                />
                <textarea 
                  placeholder="Profile Bio"
                  className="w-full bg-black/50 border border-white/20 p-3 rounded"
                  value={formData.bio}
                  onChange={e => setFormData({...formData, bio: e.target.value})}
                  required
                />
                <button type="submit" className="bg-white text-black px-6 py-2 font-bold rounded uppercase text-sm">Save Profile</button>
              </form>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-4">
                  <h2 className="text-3xl font-black uppercase tracking-tighter">{profile.name || 'Anonymous User'}</h2>
                  <button onClick={() => setEditing(true)} className="text-xs text-gray-500 hover:text-white uppercase">Edit</button>
                </div>
                <p className="text-gray-400">{profile.bio || 'Enter a bio to complete your identity on Capital Creator.'}</p>
                <p className="mono text-xs opacity-50">{profile.address}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Role Selection & Specific Flows */}
      {!editing && profile.name && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Creator Segment */}
          <div className={`glass p-8 rounded-2xl border-white/10 flex flex-col ${profile.role === UserRole.SPONSOR ? 'opacity-30 pointer-events-none' : ''}`}>
            <div className="flex items-center justify-between mb-6">
               <h3 className="text-xl font-bold uppercase tracking-tight">Creator Portal</h3>
               <span className="bg-white/5 border border-white/10 px-2 py-1 text-[10px] uppercase">Vendor</span>
            </div>
            
            <div className="space-y-6 flex-grow">
              <p className="text-sm text-gray-400">List your available livestream inventory. Reach premium sponsors directly with no middleman.</p>
              
              <div className="space-y-4 pt-4 border-t border-white/5">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-gray-500 font-bold">Stream Platform</label>
                  <select 
                    className="w-full bg-black border border-white/10 p-2 rounded text-sm"
                    value={invData.platform}
                    onChange={e => setInvData({...invData, platform: e.target.value})}
                  >
                    <option>Twitch</option>
                    <option>YouTube</option>
                    <option>Kick</option>
                    <option>X</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-gray-500 font-bold">Stream Date & Time</label>
                  <input 
                    type="datetime-local" 
                    className="w-full bg-black border border-white/10 p-2 rounded text-sm"
                    value={invData.streamTime}
                    onChange={e => setInvData({...invData, streamTime: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-gray-500 font-bold">Placement Details</label>
                  <textarea 
                    placeholder="e.g. 30 second mid-roll shoutout + pinned link"
                    className="w-full bg-black border border-white/10 p-2 rounded text-sm h-20"
                    value={invData.placementDetail}
                    onChange={e => setInvData({...invData, placementDetail: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-gray-500 font-bold">Price (SOL)</label>
                  <input 
                    type="number" 
                    className="w-full bg-black border border-white/10 p-2 rounded text-sm"
                    value={invData.priceSol}
                    onChange={e => setInvData({...invData, priceSol: Number(e.target.value)})}
                  />
                </div>
              </div>
            </div>

            <button 
              onClick={() => onListInventory(invData)}
              className="mt-8 bg-white text-black w-full py-3 font-bold uppercase text-sm flex items-center justify-center gap-2"
            >
              <Icons.Plus /> List Inventory
            </button>
          </div>

          {/* Sponsor Segment */}
          <div className={`glass p-8 rounded-2xl border-white/10 flex flex-col ${profile.role === UserRole.CREATOR ? 'opacity-30 pointer-events-none' : ''}`}>
            <div className="flex items-center justify-between mb-6">
               <h3 className="text-xl font-bold uppercase tracking-tight">Sponsor Portal</h3>
               <span className="bg-white/5 border border-white/10 px-2 py-1 text-[10px] uppercase">Client</span>
            </div>

            <div className="space-y-6 flex-grow">
              <p className="text-sm text-gray-400">Apply to become an authorized sponsor. Once approved, you can purchase any listing instantly.</p>

              {sponsorApp?.status === SponsorStatus.APPROVED ? (
                <div className="p-4 bg-white/10 border border-white/20 rounded-lg flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center">
                    <Icons.Check />
                  </div>
                  <div>
                    <p className="text-sm font-bold uppercase">Account Verified</p>
                    <p className="text-xs text-gray-400">Access to Marketplace unlocked.</p>
                  </div>
                </div>
              ) : sponsorApp?.status === SponsorStatus.PENDING ? (
                <div className="p-4 bg-white/5 border border-dashed border-white/20 rounded-lg">
                  <p className="text-sm font-bold uppercase">Application Pending</p>
                  <p className="text-xs text-gray-400 mt-1">Review typically takes 24-48 hours. Notifications sent to CapitalCreatorMarketplace@gmail.com</p>
                </div>
              ) : (
                <form className="space-y-4 pt-4 border-t border-white/5" onSubmit={(e) => { e.preventDefault(); onApplySponsor(appData); }}>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase text-gray-500 font-bold">Contact Name</label>
                    <input 
                      type="text" 
                      className="w-full bg-black border border-white/10 p-2 rounded text-sm"
                      value={appData.name}
                      onChange={e => setAppData({...appData, name: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase text-gray-500 font-bold">Company Name</label>
                    <input 
                      type="text" 
                      className="w-full bg-black border border-white/10 p-2 rounded text-sm"
                      value={appData.companyName}
                      onChange={e => setAppData({...appData, companyName: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase text-gray-500 font-bold">Months in Business</label>
                    <input 
                      type="number" 
                      className="w-full bg-black border border-white/10 p-2 rounded text-sm"
                      value={appData.monthsInBusiness}
                      onChange={e => setAppData({...appData, monthsInBusiness: Number(e.target.value)})}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase text-gray-500 font-bold">Logo URL (Preview)</label>
                    <input 
                      type="url" 
                      placeholder="https://..."
                      className="w-full bg-black border border-white/10 p-2 rounded text-sm"
                      value={appData.logoUrl}
                      onChange={e => setAppData({...appData, logoUrl: e.target.value})}
                      required
                    />
                  </div>
                  <button type="submit" className="w-full bg-white text-black py-3 mt-4 font-bold uppercase text-sm">
                    Submit Application
                  </button>
                </form>
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default ProfileSetup;