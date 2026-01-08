import React from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Icons } from '../constants';

interface LayoutProps {
  children: React.ReactNode;
  onNavigate: (view: string) => void;
  currentView: string;
}

const Layout: React.FC<LayoutProps> = ({ children, onNavigate, currentView }) => {
  const { publicKey } = useWallet();

  return (
    <div className="min-h-screen flex flex-col relative">
      <nav className="sticky top-0 z-50 glass border-b border-white/5 px-7 py-4 flex items-center justify-between">
        <div 
          className="flex items-center cursor-pointer group"
          onClick={() => onNavigate('home')}
        >
          <div className="transition-all duration-300 group-hover:brightness-125">
            <Icons.Logo className="text-[1.1rem]" />
          </div>
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
           {publicKey && (
             <button 
                onClick={() => onNavigate('profile')}
                className={`text-[9.7px] font-bold hover:text-white transition-all uppercase tracking-[0.3em] ${currentView === 'profile' ? 'text-white underline underline-offset-4' : 'text-gray-500'}`}
             >
                PROFILE
             </button>
           )}

          {currentView !== 'home' && (
            <WalletMultiButton style={{ 
              height: '38px', 
              backgroundColor: 'rgba(255,255,255,0.05)', 
              border: '1px solid rgba(255,255,255,0.1)',
              fontSize: '10px',
              textTransform: 'uppercase',
              fontWeight: 800,
              letterSpacing: '0.2em'
            }} />
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