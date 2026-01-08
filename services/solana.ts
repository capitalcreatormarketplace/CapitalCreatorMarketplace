import {
  Connection,
  PublicKey,
  Transaction,
  TransactionInstruction,
  clusterApiUrl,
} from '@solana/web3.js';
import {
  getAccount,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
} from '@solana/spl-token';
import { TREASURY_WALLET, PLATFORM_FEE_PERCENT } from '../constants';
import { TransactionResult } from '../types';
import { WalletContextState } from '@solana/wallet-adapter-react';

// Mainnet USDC Mint Address
const USDC_MINT_ADDRESS = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyB7uP3');

export async function processPayment(
  wallet: WalletContextState,
  creatorAddress: string,
  amountUsdc: number
): Promise<TransactionResult> {
  if (!wallet.publicKey || !wallet.sendTransaction) {
    throw new Error('Wallet is not connected or does not support sending transactions.');
  }
  
  const connection = new Connection(clusterApiUrl('mainnet-beta'), 'confirmed');
  const creatorPublicKey = new PublicKey(creatorAddress);
  const treasuryPublicKey = new PublicKey(TREASURY_WALLET);
  const sponsorPublicKey = wallet.publicKey;

  try {
    const transaction = new Transaction();

    // Helper to check for an Associated Token Account and create the instruction if it doesn't exist.
    // This is the standard frontend pattern.
    const getOrCreateAtaInstruction = async (
      mint: PublicKey,
      owner: PublicKey,
      payer: PublicKey
    ): Promise<{ ata: PublicKey, ix: TransactionInstruction | null }> => {
      const ata = await getAssociatedTokenAddress(mint, owner, false);
      try {
        await getAccount(connection, ata);
        return { ata, ix: null }; // Account already exists
      } catch (error) {
        // Account does not exist, create instruction to create it
        const ix = createAssociatedTokenAccountInstruction(payer, ata, owner, mint);
        return { ata, ix };
      }
    };

    // 1. Calculate payment split
    const totalAmount = Math.floor(amountUsdc * 1_000_000); // USDC has 6 decimals
    const treasuryFee = Math.floor(totalAmount * PLATFORM_FEE_PERCENT);
    const creatorAmount = totalAmount - treasuryFee;
    
    // 2. Get the sponsor's ATA. The sponsor must have USDC to make a payment.
    const sponsorUsdcAccountAddress = await getAssociatedTokenAddress(USDC_MINT_ADDRESS, sponsorPublicKey, false);

    // 3. Get or create instructions for the creator and treasury ATAs.
    // The sponsor (payer) will fund the creation if they don't exist.
    const { ata: creatorAta, ix: createCreatorAtaIx } = await getOrCreateAtaInstruction(USDC_MINT_ADDRESS, creatorPublicKey, sponsorPublicKey);
    if (createCreatorAtaIx) {
      transaction.add(createCreatorAtaIx);
    }

    const { ata: treasuryAta, ix: createTreasuryAtaIx } = await getOrCreateAtaInstruction(USDC_MINT_ADDRESS, treasuryPublicKey, sponsorPublicKey);
    if (createTreasuryAtaIx) {
      transaction.add(createTreasuryAtaIx);
    }
    
    // 4. Create the transfer instructions
    // Instruction to pay the creator
    transaction.add(
      createTransferInstruction(
        sponsorUsdcAccountAddress,
        creatorAta,
        sponsorPublicKey,
        creatorAmount
      )
    );

    // Instruction to pay the treasury
    transaction.add(
      createTransferInstruction(
        sponsorUsdcAccountAddress,
        treasuryAta,
        sponsorPublicKey,
        treasuryFee
      )
    );

    // 5. Get a recent blockhash and have the wallet send the transaction
    transaction.feePayer = sponsorPublicKey;
    transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

    const signature = await wallet.sendTransaction(transaction, connection);
    await connection.confirmTransaction(signature, 'processed');

    console.log(`Transaction successful! Signature: ${signature}`);
    return {
      success: true,
      signature: signature,
    };
  } catch (error: any) {
    console.error('Solana payment failed:', error);
    return {
      success: false,
      signature: error.message || 'An unknown error occurred.',
    };
  }
}