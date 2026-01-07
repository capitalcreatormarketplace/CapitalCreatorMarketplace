
import React, { useState, useRef, useEffect } from 'react';
import { Icons } from '../constants';

interface LayoutProps {
  children: React.ReactNode;
  walletAddress: string | null;
  onConnect: () => void;
  onDisconnect: () => void;
  onNavigate: (view: string) => void;
  currentView: string;
}

const Layout: React.FC<LayoutProps> = ({ children, walletAddress, onConnect, onDisconnect, onNavigate, currentView }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col relative">
      <nav className="sticky top-0 z-50 glass border-b border-white/5 px-7 py-5 flex items-center justify-between">
        <div 
          className="flex items-center gap-4 cursor-pointer group"
          onClick={() => onNavigate('home')}
        >
          <div className="transition-all duration-500 group-hover:scale-110 group-hover:drop-shadow-[0_0_12px_rgba(255,255,255,0.5)]">
            <Icons.Logo className="h-11 w-auto" />
          </div>
          <span className="text-base font-black uppercase tracking-tighter hidden sm:block">
            CAPITAL CREATOR
          </span>
        </div>

        <div className="flex items-center gap-7">
          <a 
            href="https://x.com/CapitalCreator0"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-500 hover:text-white transition-all"
            aria-label="X (Twitter)"
          >
            <Icons.X />
          </a>
          
          <button 
            onClick={() => onNavigate('documents')}
            className={`text-[9.7px] font-bold hover:text-white transition-all uppercase tracking-[0.3em] ${currentView === 'documents' ? 'text-white underline underline-offset-4' : 'text-gray-500'}`}
          >
            DOCUMENTS
          </button>

          {walletAddress ? (
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 bg-white/5 pl-4 pr-3 py-2 border border-white/10 hover:border-white/30 transition-all group"
              >
                <div className="w-1.5 h-1.5 bg-white opacity-50 group-hover:opacity-100"></div>
                <span className="mono text-[8.2px] tracking-tight opacity-70 group-hover:opacity-100">
                  {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                </span>
                <Icons.ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {isDropdownOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 glass rounded-none border-white/10 shadow-xl animate-fadeIn z-[60]">
                  <div className="p-2 space-y-1">
                    <button onClick={() => { onNavigate('profile'); setIsDropdownOpen(false); }} className="w-full text-left px-3 py-2 text-[10px] font-bold tracking-widest uppercase hover:bg-white/5 transition-colors">
                      Profile
                    </button>
                    <button onClick={() => { onDisconnect(); setIsDropdownOpen(false); }} className="w-full text-left px-3 py-2 text-[10px] font-bold tracking-widest uppercase hover:bg-white/5 transition-colors text-red-400">
                      Disconnect
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            (currentView === 'marketplace' || currentView === 'profile') && (
              <button 
                onClick={onConnect}
                className="bg-white text-black px-5 py-2 text-[8.2px] font-black uppercase tracking-[0.2em] hover:bg-zinc-200 transition-all"
              >
                Connect Wallet
              </button>
            )
          )}
        </div>
      </nav>

      <main className="flex-grow max-w-6xl mx-auto w-full px-7">
        {children}
      </main>

      <footer className="border-t border-white/5 py-10 px-7 flex flex-col items-center gap-4">
        <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-3"></div>
        <p className="text-white/60 text-[9.7px] tracking-[0.5em] uppercase font-bold">
          CAPITAL CREATOR 2026
        </p>
      </footer>
    </div>
  );
};

export default Layout;
