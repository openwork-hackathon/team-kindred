/**
 * Deploy KIND Token on Base using Mint Club V2
 * 
 * Spec: /docs/PLATFORM_TOKEN_SPEC.md
 * Run: npx ts-node scripts/deploy-token.ts
 */

import { createPublicClient, createWalletClient, http, parseEther, formatEther } from 'viem';
import { base } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';

// Mint Club V2 Contracts on Base
const MCV2_BOND_ADDRESS = '0xc5a076cad94176c2996B32d8466Be1cE757FAa27' as const;
const OPENWORK_TOKEN = '0x299c30DD5974BF4D5bFE42C340CA40462816AB07' as const;

// ABI for MCV2_Bond
const BOND_ABI = [
  {
    name: 'createToken',
    type: 'function',
    stateMutability: 'payable',
    inputs: [
      { 
        name: 'tp', 
        type: 'tuple', 
        components: [
          { name: 'name', type: 'string' },
          { name: 'symbol', type: 'string' }
        ]
      },
      { 
        name: 'bp', 
        type: 'tuple', 
        components: [
          { name: 'mintRoyalty', type: 'uint16' },
          { name: 'burnRoyalty', type: 'uint16' },
          { name: 'reserveToken', type: 'address' },
          { name: 'maxSupply', type: 'uint128' },
          { name: 'stepRanges', type: 'uint128[]' },
          { name: 'stepPrices', type: 'uint128[]' }
        ]
      }
    ],
    outputs: [{ name: 'token', type: 'address' }]
  },
  {
    name: 'creationFee',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint256' }]
  }
] as const;

// Token Created event to parse address
const TOKEN_CREATED_EVENT = {
  type: 'event',
  name: 'TokenCreated',
  inputs: [
    { name: 'token', type: 'address', indexed: true },
    { name: 'name', type: 'string', indexed: false },
    { name: 'symbol', type: 'string', indexed: false }
  ]
} as const;

async function main() {
  console.log('🦞 Kindred Token Deployment Script');
  console.log('===================================\n');

  // Get private key
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    console.error('❌ PRIVATE_KEY environment variable not set');
    console.log('Usage: PRIVATE_KEY=0x... npx ts-node scripts/deploy-token.ts');
    process.exit(1);
  }

  // Setup account
  const account = privateKeyToAccount(privateKey as `0x${string}`);
  console.log('👛 Deployer:', account.address);

  // Setup clients
  const publicClient = createPublicClient({
    chain: base,
    transport: http('https://mainnet.base.org')
  });

  const walletClient = createWalletClient({
    account,
    chain: base,
    transport: http('https://mainnet.base.org')
  });

  // Check balance
  const balance = await publicClient.getBalance({ address: account.address });
  console.log('💰 Balance:', formatEther(balance), 'ETH');

  if (balance < parseEther('0.001')) {
    console.error('❌ Insufficient balance. Need at least 0.001 ETH for gas.');
    process.exit(1);
  }

  // Token parameters (from spec)
  const tokenParams = {
    name: 'Kindred Token',
    symbol: 'KIND'
  };

  // Bond parameters (from spec)
  const bondParams = {
    mintRoyalty: 100,      // 1% buy fee
    burnRoyalty: 100,      // 1% sell fee
    reserveToken: OPENWORK_TOKEN,
    maxSupply: parseEther('1000000'),  // 1M tokens
    
    // 3-step bonding curve
    stepRanges: [
      parseEther('100000'),    // 0-100k: Early stage
      parseEther('500000'),    // 100k-500k: Growth stage
      parseEther('1000000')    // 500k-1M: Mature stage
    ],
    stepPrices: [
      parseEther('0.001'),     // 0.001 OPENWORK per KIND
      parseEther('0.005'),     // 5x price increase
      parseEther('0.01')       // 10x from start
    ]
  };

  console.log('\n📋 Token Parameters:');
  console.log('  Name:', tokenParams.name);
  console.log('  Symbol:', tokenParams.symbol);
  console.log('  Max Supply:', formatEther(bondParams.maxSupply), 'KIND');
  console.log('  Mint Royalty:', bondParams.mintRoyalty / 100, '%');
  console.log('  Burn Royalty:', bondParams.burnRoyalty / 100, '%');
  console.log('\n📈 Bonding Curve:');
  console.log('  Stage 1 (0-100k):', formatEther(bondParams.stepPrices[0]), 'OPENWORK');
  console.log('  Stage 2 (100k-500k):', formatEther(bondParams.stepPrices[1]), 'OPENWORK');
  console.log('  Stage 3 (500k-1M):', formatEther(bondParams.stepPrices[2]), 'OPENWORK');

  // Check creation fee
  let creationFee = 0n;
  try {
    creationFee = await publicClient.readContract({
      address: MCV2_BOND_ADDRESS,
      abi: BOND_ABI,
      functionName: 'creationFee'
    });
    console.log('\n💸 Creation Fee:', formatEther(creationFee), 'ETH');
  } catch (e) {
    console.log('\n⚠️ Could not read creation fee, assuming 0');
  }

  console.log('\n🚀 Creating token...\n');

  try {
    const hash = await walletClient.writeContract({
      address: MCV2_BOND_ADDRESS,
      abi: BOND_ABI,
      functionName: 'createToken',
      args: [tokenParams, bondParams],
      value: creationFee
    });

    console.log('📝 Transaction submitted:', hash);
    console.log('⏳ Waiting for confirmation...\n');

    const receipt = await publicClient.waitForTransactionReceipt({ 
      hash,
      confirmations: 1 
    });

    console.log('✅ Transaction confirmed!');
    console.log('   Block:', receipt.blockNumber);
    console.log('   Gas Used:', receipt.gasUsed.toString());
    console.log('   Status:', receipt.status);

    // Try to find token address from logs
    // MCV2_Token is at 0xAa70bC79fD1cB4a6FBA717018351F0C3c64B79Df
    // The token is created at a deterministic address based on symbol
    
    console.log('\n🎉 SUCCESS! $KIND Token Created!');
    console.log('\n📍 Token Details:');
    console.log('   Mint Club URL: https://mint.club/token/base/KIND');
    console.log('   BaseScan TX:', `https://basescan.org/tx/${hash}`);
    
    console.log('\n📋 Next Steps:');
    console.log('   1. Verify token on Mint Club: https://mint.club/token/base/KIND');
    console.log('   2. Register with OpenWork API (PM task)');
    console.log('   3. Add buy button to frontend');

  } catch (error: any) {
    console.error('❌ Transaction failed:', error.message);
    
    if (error.message.includes('insufficient funds')) {
      console.log('\n💡 Tip: Send some ETH to', account.address, 'on Base');
    }
    
    process.exit(1);
  }
}

main().catch(console.error);
