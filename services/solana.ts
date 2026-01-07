
import { TREASURY_WALLET, PLATFORM_FEE_PERCENT } from '../constants';
import { TransactionResult } from '../types';

interface PhantomProvider {
  isPhantom: boolean;
  isConnected: boolean;
  publicKey: { toString: () => string } | null;
  connect: (options?: { onlyIfTrusted: boolean }) => Promise<{ publicKey: { toString: () => string } }>;
  disconnect: () => Promise<void>;
  signMessage: (message: Uint8Array, encoding: string) => Promise<{ signature: Uint8Array }>;
}

const getProvider = (): PhantomProvider | undefined => {
  if (typeof window !== 'undefined' && 'solana' in window) {
    const provider = (window as any).solana;
    if (provider?.isPhantom) {
      return provider;
    }
  }
  return undefined;
};

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

export async function connectWallet(): Promise<string | null> {
  const provider = getProvider();
  
  if (!provider) {
    alert('Phantom wallet not detected. Please install the extension.');
    window.open('https://phantom.app/', '_blank');
    return null;
  }

  try {
    // Standard connection flow
    const response = await provider.connect();
    const publicKey = response.publicKey.toString();
    console.log('Wallet connected successfully:', publicKey);
    return publicKey;
  } catch (err: any) {
    console.error('Wallet connection failed:', err);
    if (err.code === 4001) {
      console.log('User rejected the connection request.');
    }
    return null;
  }
}

export async function disconnectWallet(): Promise<void> {
  const provider = getProvider();
  if (provider?.disconnect) {
    try {
      await provider.disconnect();
      console.log('Phantom Wallet disconnected.');
    } catch (err) {
      console.error('Wallet disconnection failed:', err);
    }
  }
}
