const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const NEW_PROJECTS = [
  {
    name: 'Uniswap V4',
    address: '0xUniswapV4', // Placeholder
    category: 'k/defi',
    image: 'https://assets.coingecko.com/coins/images/24291/standard/uniswap-uni-logo.png',
    status: 'approved'
  },
  {
    name: 'Aave V3',
    address: '0xAaveV3',
    category: 'k/defi',
    image: 'https://assets.coingecko.com/coins/images/12645/standard/aave-coin-logo.png',
    status: 'approved'
  },
  {
    name: 'Drift Protocol',
    address: '0xDriftProtocol',
    category: 'k/perp-dex',
    image: 'https://assets.coingecko.com/coins/images/27103/standard/drift_protocol.png',
    status: 'approved'
  }
];

async function main() {
  console.log('Adding missing projects...\n');
  
  for (const proj of NEW_PROJECTS) {
    try {
      await prisma.project.create({ data: proj });
      console.log(`✅ ${proj.name}`);
    } catch (e) {
      console.log(`⚠️  ${proj.name} - ${e.message.split('\n')[0]}`);
    }
  }
  
  await prisma.$disconnect();
}

main();
