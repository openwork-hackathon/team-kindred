const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// CoinGecko URLs - reliable CDN
const LOGOS = {
  'Uniswap V4': 'https://assets.coingecko.com/coins/images/12504/standard/uniswap-icon-2x-128x128.png',
  'Aave V3': 'https://assets.coingecko.com/coins/images/12504/standard/aave-icon-2x-128x128.png',
  'Curve Finance': 'https://assets.coingecko.com/coins/images/12124/standard/Curve.png',
  'Hyperliquid': 'https://assets.coingecko.com/coins/images/31896/standard/hyperliquid_200.png',
  'Drift Protocol': 'https://assets.coingecko.com/coins/images/35079/standard/drift.png',
  'Jupiter': 'https://assets.coingecko.com/coins/images/32313/standard/jup.png',
};

async function addLogos() {
  console.log('Adding real logos from CoinGecko...\n');

  for (const [name, url] of Object.entries(LOGOS)) {
    try {
      const updated = await prisma.project.update({
        where: { name },
        data: { image: url }
      });
      console.log(`✅ ${name}`);
      console.log(`   ${url}\n`);
    } catch (e) {
      console.error(`❌ Error: ${name}:`, e.message);
    }
  }

  await prisma.$disconnect();
  console.log('✨ Done');
}

addLogos().catch(console.error);
