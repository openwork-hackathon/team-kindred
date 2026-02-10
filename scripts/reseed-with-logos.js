const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const PROJECTS = [
  { 
    name: 'Uniswap V4', 
    address: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984', 
    category: 'k/defi', 
    description: 'Decentralized AMM with hooks',
    image: 'https://token.uniswap.org/UNI.png'
  },
  { 
    name: 'Aave V3', 
    address: '0x7fc66500c84a76ad7e9c93437e434122a1649a15', 
    category: 'k/defi', 
    description: 'Lending protocol',
    image: 'https://aave.com/logo.svg'
  },
  { 
    name: 'Curve Finance', 
    address: '0xd533a949740bb3306d119cc777fa900ba034cd52', 
    category: 'k/defi', 
    description: 'Stablecoin DEX',
    image: 'https://cdn.curve.fi/Logo_Blue.svg'
  },
  { 
    name: 'Hyperliquid', 
    address: '0x1', 
    category: 'k/perp-dex', 
    description: 'Perpetual DEX',
    image: 'https://hyperliquid.xyz/logo.png'
  },
  { 
    name: 'Drift Protocol', 
    address: '0x2', 
    category: 'k/perp-dex', 
    description: 'Solana perp DEX',
    image: 'https://drift.trade/logo.svg'
  },
  { 
    name: 'Jupiter', 
    address: '0x3', 
    category: 'k/ai', 
    description: 'AI routing protocol',
    image: 'https://jup.ag/logo.svg'
  },
];

async function reseed() {
  console.log('Adding logos to projects...\n');

  for (const p of PROJECTS) {
    try {
      const updated = await prisma.project.update({
        where: { address: p.address },
        data: { image: p.image }
      });
      console.log(`✅ Updated: ${p.name} (${p.image})`);
    } catch (e) {
      console.error(`❌ Error: ${p.name}:`, e.message);
    }
  }

  await prisma.$disconnect();
  console.log('\n✨ Done');
}

reseed().catch(console.error);
