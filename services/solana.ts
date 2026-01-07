import { TREASURY_WALLET, PLATFORM_FEE_PERCENT } from '../constants';
import { TransactionResult } from '../types';

/**
 * Mocks a Solana transaction for the Capital Creator platform.
 * In a real app, this would use @solana/web3.js and a wallet provider like Phantom.
 */
export async function processPayment(
  creatorAddress: string,
  amountUsdc: number
): Promise<TransactionResult> {
  console.log(`Initializing payment split for ${amountUsdc} USDC`);
  
  // Real math as requested for USDC (6 decimals on Solana)
  const totalAtomic = amountUsdc * 1_000_000;
  const tenPercent = Math.floor(totalAtomic * PLATFORM_FEE_PERCENT);
  const creatorAmount = totalAtomic - tenPercent;

  console.log(`Routing ${creatorAmount / 1e6} USDC to Creator: ${creatorAddress}`);
  console.log(`Routing ${tenPercent / 1e6} USDC to Treasury: ${TREASURY_WALLET}`);

  // Simulating on-chain delay
  await new Promise(resolve => setTimeout(resolve, 2000));

  return {
    success: true,
    signature: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  };
}

export async function connectWallet(): Promise<string | null> {
  // Mocking for the UI
  await new Promise(resolve => setTimeout(resolve, 1000));
  return 'CapCrea7orW4lletXXXXXXXXXXXXXXXp2q3r4s5t6u';
}