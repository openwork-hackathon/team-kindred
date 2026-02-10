const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// CoinGecko URLs - reliable CDN
const LOGOS = {
  '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984': 'https://assets.coingecko.com/coins/images/12504/standard/uniswap-icon-2x-128x128.png',
  '0x7fc66500c84a76ad7e9c93437e434122a1649a15': 'https://assets.coingecko.com/coins/images/12504/standard/aave-icon-2x-128x128.png',
  '0xd533a949740bb3306d119cc777fa900ba034cd52': 'https://assets.coingecko.com/coins/images/12124/standard/Curve.png',
  '0x1': 'https://assets.coingecko.com/coins/images/31896/standard/hyperliquid_200.png',
  '0x2': 'https://assets.coingecko.com/coins/images/35079/standard/drift.png',
  '0x3': 'https://assets.coingecko.com/coins/images/32313/standard/jup.png',
};

async function addLogos() {
  console.log('Adding real logos from CoinGecko...\n');

  for (const [address, url] of Object.entries(LOGOS)) {
    try {
      const updated = await prisma.project.update({
        where: { address },
        data: { image: url }
      });
      console.log(`✅ ${updated.name}`);
      console.log(`   ${url}\n`);
    } catch (e) {
      console.error(`❌ Error for ${address}:`, e.message);
    }
  }

  await prisma.$disconnect();
  console.log('✨ Done');
}

addLogos().catch(console.error);
