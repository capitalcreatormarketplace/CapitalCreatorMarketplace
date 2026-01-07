
import { TREASURY_WALLET, PLATFORM_FEE_PERCENT } from '../constants';
import { TransactionResult } from '../types';

// --- Type Definition for the Phantom Wallet Provider ---
interface PhantomProvider {
  isPhantom: boolean;
  isConnected: boolean;
  publicKey: { toString: () => string } | null;
  connect: (options?: { onlyIfTrusted: boolean }) => Promise<{ publicKey: { toString: () => string } }>;
  disconnect: () => Promise<void>;
  signMessage: (message: Uint8Array, encoding: string) => Promise<{ signature: Uint8Array }>;
}

/**
 * Retrieves the Phantom wallet provider from the window object.
 * @returns The provider if it exists and is Phantom, otherwise undefined.
 */
const getProvider = (): PhantomProvider | undefined => {
  if ('solana' in window) {
    const provider = (window as any).solana;
    if (provider.isPhantom) {
      return provider;
    }
  }
  return undefined;
};

/**
 * Mocks a Solana transaction for the Capital Creator platform.
 * In a real app, this would use @solana/web3.js and a wallet provider like Phantom.
 */
export async function processPayment(
  creatorAddress: string,
  amountUsdc: number
): Promise<TransactionResult> {
  console.log(`Initializing payment split for ${amountUsdc} USDC`);
  
  const totalAtomic = amountUsdc * 1_000_000;
  const tenPercent = Math.floor(totalAtomic * PLATFORM_FEE_PERCENT);
  const creatorAmount = totalAtomic - tenPercent;

  console.log(`Routing ${creatorAmount / 1e6} USDC to Creator: ${creatorAddress}`);
  console.log(`Routing ${tenPercent / 1e6} USDC to Treasury: ${TREASURY_WALLET}`);

  await new Promise(resolve => setTimeout(resolve, 2000));

  return {
    success: true,
    signature: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  };
}

/**
 * Connects to the user's Phantom wallet and requires a signature.
 * This function will ALWAYS force a wallet interaction by requiring a message signature.
 * @returns The wallet's public key as a string, or null if connection/signing fails.
 */
export async function connectWallet(): Promise<string | null> {
  const provider = getProvider();
  if (!provider) {
    alert('Phantom wallet not found! Please install it to continue.');
    window.open('https://phantom.app/', '_blank');
    return null;
  }

  try {
    // 1. Initial Connection
    // Note: onlyIfTrusted: false is used, but some wallets still auto-resolve if already trusted.
    const response = await provider.connect({ onlyIfTrusted: false });
    const publicKey = response.publicKey.toString();

    // 2. FORCED SIGNATURE
    // To prevent "auto-connecting" without user interaction, we force a Sign Message request.
    // This will ALWAYS trigger a wallet popup regardless of the "trusted" state.
    const message = `Sign this to verify your session with Capital Creator.\n\nTimestamp: ${Date.now()}\nWallet: ${publicKey}`;
    const encodedMessage = new TextEncoder().encode(message);
    
    console.log('Requesting signature for verification...');
    const { signature } = await provider.signMessage(encodedMessage, 'utf8');
    
    if (signature) {
      console.log('Phantom Wallet verified with signature:', publicKey);
      return publicKey;
    }
    
    return null;
  } catch (err) {
    console.error('Wallet connection or signature rejected:', err);
    // If the user rejected the signature, we should disconnect to be safe
    if (provider.isConnected) {
      await provider.disconnect();
    }
    return null;
  }
}

/**
 * Disconnects from the user's Phantom wallet and clears session state.
 */
export async function disconnectWallet(): Promise<void> {
  const provider = getProvider();
  if (provider?.isConnected) {
    try {
      await provider.disconnect();
      console.log('Phantom Wallet disconnected.');
    } catch (err) {
      console.error('Wallet disconnection failed:', err);
    }
  }
}
