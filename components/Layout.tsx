import React from 'react';
import { Icons } from '../constants.tsx';

interface LayoutProps {
  children: React.ReactNode;
  walletAddress: string | null;
  onConnect: () => void;
  onNavigate: (view: string) => void;
  currentView: string;
}

const Layout: React.FC<LayoutProps> = ({ children, walletAddress, onConnect, onNavigate, currentView }) => {
  return (
    <div className="min-h-screen flex flex-col relative">
      <nav className="sticky top-0 z-50 glass border-b border-white/5 px-8 py-5 flex items-center justify-between">
        <div 
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => onNavigate('home')}
        >
          <div className="w-9 h-9 bg-white text-black flex items-center justify-center font-black text-xl rounded-none group-hover:invert transition-all duration-500">
            C
          </div>
          <span className="text-lg font-bold tracking-tighter uppercase hidden sm:block font-mono">
            CAPITAL CREATOR
          </span>
        </div>

        <div className="flex items-center gap-10">
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
            className={`text-[11px] font-bold hover:text-white transition-all uppercase tracking-[0.3em] font-mono ${currentView === 'documents' ? 'text-white underline underline-offset-4' : 'text-gray-500'}`}
          >
            DOCUMENTS
          </button>

          {walletAddress ? (
            <button 
              onClick={() => onNavigate('profile')}
              className="flex items-center gap-2 bg-white/5 px-4 py-2 border border-white/10 hover:border-white/30 transition-all group"
            >
              <div className="w-1.5 h-1.5 bg-white opacity-50 group-hover:opacity-100"></div>
              <span className="mono text-[10px] tracking-tight opacity-70 group-hover:opacity-100">
                {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
              </span>
            </button>
          ) : (
            currentView !== 'home' && (
              <button 
                onClick={onConnect}
                className="bg-white text-black px-4 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-200 transition-all"
              >
                Connect Wallet
              </button>
            )
          )}
        </div>
      </nav>

      <main className="flex-grow max-w-7xl mx-auto w-full px-6">
        {children}
      </main>

      <footer className="border-t border-white/5 py-10 px-8 flex flex-col items-center gap-4">
        <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-4"></div>
        <p className="text-white/70 text-[11px] tracking-[0.4em] uppercase font-mono font-bold">
          CAPITAL CREATOR 2026
        </p>
      </footer>
    </div>
  );
};

export default Layout;