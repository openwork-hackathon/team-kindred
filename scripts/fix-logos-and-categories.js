#!/usr/bin/env node
/**
 * Fix project logos from CoinGecko and correct categories
 */

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// CoinGecko mappings
const COINGECKO_LOGOS = {
  'Uniswap': 'https://assets.coingecko.com/coins/images/12504/standard/uniswap-uni.png',
  'Aave': 'https://assets.coingecko.com/coins/images/12645/standard/aave-token-round.png',
  'Curve Finance': 'https://assets.coingecko.com/coins/images/12124/standard/Curve.png',
  'Hyperliquid': 'https://assets.coingecko.com/coins/images/32286/standard/hyperliquid-hype-logo.png',
  'Drift Protocol': 'https://assets.coingecko.com/coins/images/27837/standard/jupiter.png',
  'Jupiter': 'https://assets.coingecko.com/coins/images/27837/standard/jupiter.png',
  'Morpho': 'https://assets.coingecko.com/coins/images/29016/standard/morpho.png',
  'Lido': 'https://assets.coingecko.com/coins/images/13973/standard/lido.png',
  'Ethena': 'https://assets.coingecko.com/coins/images/33389/standard/ethena_logo.webp',
  'Compound': 'https://assets.coingecko.com/coins/images/9619/standard/compound-governance-token.png',
  'Circle': 'https://assets.coingecko.com/coins/images/6319/standard/USD_Coin_icon.png',
  'ether.fi': 'https://assets.coingecko.com/coins/images/33467/standard/ether-fi-logo.png',
  'Jito': 'https://assets.coingecko.com/coins/images/35823/standard/jito-token.png',
  'Magic Eden': 'https://assets.coingecko.com/coins/images/18125/standard/me.png',
  'USDC': 'https://assets.coingecko.com/coins/images/6319/standard/USD_Coin_icon.png',
}

// Category corrections
const CATEGORY_FIXES = {
  'Lighter': 'k/perp-dex',
  'Aster': 'k/perp-dex',
}

async function main() {
  console.log('🎨 Fixing project logos and categories...\n')
  
  try {
    let updated = 0
    
    // Update logos
    for (const [name, logoUrl] of Object.entries(COINGECKO_LOGOS)) {
      const result = await prisma.project.updateMany({
        where: { name: { equals: name, mode: 'insensitive' } },
        data: { image: logoUrl }
      })
      
      if (result.count > 0) {
        console.log(`✅ ${name}: Logo updated (${result.count} projects)`)
        updated += result.count
      }
    }
    
    // Fix categories
    for (const [name, category] of Object.entries(CATEGORY_FIXES)) {
      const result = await prisma.project.updateMany({
        where: { name: { equals: name, mode: 'insensitive' } },
        data: { category }
      })
      
      if (result.count > 0) {
        console.log(`📁 ${name}: Category → ${category} (${result.count} projects)`)
        updated += result.count
      }
    }
    
    console.log(`\n✨ Fixed ${updated} total updates`)
    
  } catch (error) {
    console.error('Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

main()
