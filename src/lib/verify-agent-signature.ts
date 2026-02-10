import { verifyMessage } from 'ethers/lib/utils';
import nacl from 'tweetnacl';
import { PublicKey } from '@solana/web3.js';
import bs58 from 'bs58';

export async function verifyAgentSignature(
  wallet: string,
  message: string,
  signature: string,
  chain: string
): Promise<boolean> {
  try {
    if (chain === 'solana') {
      const publicKey = new PublicKey(wallet);
      const messageBuffer = Buffer.from(message);
      const signatureBuffer = Buffer.from(bs58.decode(signature));
      return nacl.sign.detached.verify(messageBuffer, signatureBuffer, publicKey.toBuffer());
    } else {
      // EVM chains (base, ethereum)
      const recovered = verifyMessage(message, signature);
      return recovered.toLowerCase() === wallet.toLowerCase();
    }
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
}
