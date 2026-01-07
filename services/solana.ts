
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
    if (provider?.isPhantom) return provider;
  }
  return undefined;
};

export async function processPayment(
  creatorAddress: string,
  amountUsdc: number
): Promise<TransactionResult> {
  // Mocking the payment split logic for the demo environment
  const totalAtomic = amountUsdc * 1_000_000;
  const tenPercent = Math.floor(totalAtomic * PLATFORM_FEE_PERCENT);
  const creatorAmount = totalAtomic - tenPercent;

  console.log(`Split route: ${creatorAmount / 1e6} to creator, ${tenPercent / 1e6} to protocol treasury.`);

  await new Promise(resolve => setTimeout(resolve, 1500));

  return {
    success: true,
    signature: Math.random().toString(36).substring(2, 15)
  };
}

export async function connectWallet(): Promise<string | null> {
  const provider = getProvider();
  
  if (!provider) {
    alert('Phantom wallet not detected. Install the extension to proceed.');
    window.open('https://phantom.app/', '_blank');
    return null;
  }

  try {
    // 1. Establish connection (Forcing a fresh request)
    const response = await provider.connect();
    const pubKey = response.publicKey.toString();

    // 2. Mandatory Signature Verification (The step requested to be permanent)
    // We use a unique message each time to ensure the wallet actually prompts the user
    const message = new TextEncoder().encode(`Verify Ownership for Capital Creator Protocol\nTimestamp: ${Date.now()}\nTerminal Access: Authorized`);
    await provider.signMessage(message, 'utf8');
    
    console.log('Wallet verified and signed:', pubKey);
    return pubKey;
  } catch (err: any) {
    console.error('Wallet connection or signing rejected:', err);
    return null;
  }
}

export async function disconnectWallet(): Promise<void> {
  const provider = getProvider();
  if (provider?.disconnect) {
    try {
      await provider.disconnect();
      console.log('Phantom session terminated.');
    } catch (err) {
      console.error('Wallet disconnect failed:', err);
    }
  }
}
