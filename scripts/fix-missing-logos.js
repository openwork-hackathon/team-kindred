#!/usr/bin/env node

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// CoinGecko logo URLs mapping
const logoMap = {
  "Uniswap V4": "https://assets.coingecko.com/coins/images/24291/standard/uniswap-uni-logo.png",
  "Aave V3": "https://assets.coingecko.com/coins/images/12645/standard/aave-coin-logo.png",
  "Curve Finance": "https://assets.coingecko.com/coins/images/12124/standard/Curve_DAO_logo.png",
  "Hyperliquid": "https://assets.coingecko.com/coins/images/30127/standard/hyperliquid-hype-logo.png",
  "Drift Protocol": "https://assets.coingecko.com/coins/images/27103/standard/drift_protocol.png",
  "Jupiter": "https://assets.coingecko.com/coins/images/27837/standard/jupiter.png",
  "Morpho": "https://assets.coingecko.com/coins/images/29324/standard/morpho.png",
  "Lido": "https://assets.coingecko.com/coins/images/13573/standard/Lido_DAO.png",
  "Ethena": "https://assets.coingecko.com/coins/images/31135/standard/ethena.png",
  "Compound": "https://assets.coingecko.com/coins/images/9956/standard/compound.png",
  "Circle": "https://assets.coingecko.com/coins/images/16697/standard/usdc.png",
  "ether.fi": "https://assets.coingecko.com/coins/images/32736/standard/ethefi.png",
  "Jito": "https://assets.coingecko.com/coins/images/30743/standard/jito.png",
  "Sanctum": "https://assets.coingecko.com/coins/images/32678/standard/sanctum.png",
  "Backpack Exchange": "https://assets.coingecko.com/coins/images/32886/standard/backpack.png",
  "USDC": "https://assets.coingecko.com/coins/images/6319/standard/usdc.png",
  "Lighter": "https://assets.coingecko.com/coins/images/30752/standard/lighter.png",
  "Aster": "https://assets.coingecko.com/coins/images/31556/standard/aster.png",
  "Solayer": "https://assets.coingecko.com/coins/images/32646/standard/solayer.png",
  "EigenLayer": "https://assets.coingecko.com/coins/images/30753/standard/eigenlayer.png",
  "Magic Eden": "https://assets.coingecko.com/coins/images/28323/standard/me.png",
  "Phantom Wallet": "https://assets.coingecko.com/coins/images/30748/standard/phantom.png",
  "MetaMask": "https://assets.coingecko.com/coins/images/12504/standard/metamask.png",
  "Polymarket": "https://assets.coingecko.com/coins/images/31584/standard/polymarket.png",
  "Kalshi": "https://assets.coingecko.com/coins/images/32089/standard/kalshi.png",
};

async function fixMissingLogos() {
  try {
    console.log("🔍 Checking for missing logos...\n");

    // Get all approved projects
    const projects = await prisma.project.findMany({
      where: { status: "approved" },
      select: { id: true, name: true, image: true },
      orderBy: { name: "asc" },
    });

  console.log(`📊 Total approved projects: ${projects.length}\n`);

  // Check which ones have missing logos
  const withoutLogos = projects.filter((p) => !p.image);
  console.log(`❌ Projects without logos: ${withoutLogos.length}`);
  if (withoutLogos.length > 0) {
    withoutLogos.forEach((p) => console.log(`  - ${p.name}`));
    console.log("");
  }

  // Update missing logos
  let updated = 0;
  for (const project of withoutLogos) {
    const logoUrl = logoMap[project.name];
    if (logoUrl) {
      await prisma.project.update({
        where: { id: project.id },
        data: { image: logoUrl },
      });
      console.log(`✅ ${project.name} → ${logoUrl}`);
      updated++;
    } else {
      console.log(`⚠️  ${project.name} → No logo mapping found`);
    }
  }

  console.log(`\n✅ Updated ${updated} projects with logos\n`);

  // Show all projects with logos
  const allProjects = await prisma.project.findMany({
    where: { status: "approved" },
    select: { name, image },
    orderBy: { name: "asc" },
  });

  console.log("📸 Final state of all projects:");
  allProjects.forEach((p) => {
    if (p.image) {
      console.log(`✅ ${p.name}`);
    } else {
      console.log(`❌ ${p.name} (still missing)`);
    }
  });

    await prisma.$disconnect();
    console.log("\n✅ Done!");
  } catch (err) {
    console.error("❌ Error:", err);
    await prisma.$disconnect();
    process.exit(1);
  }
}

fixMissingLogos();
