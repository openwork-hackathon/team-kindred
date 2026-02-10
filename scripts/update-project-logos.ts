#!/usr/bin/env node
/**
 * Update project logos from CoinGecko
 * Usage: npx ts-node scripts/update-project-logos.ts
 */

import { PrismaClient } from '@prisma/client'
import { getCoinGeckoLogoUrl } from '../src/lib/coingecko'

const prisma = new PrismaClient()

async function updateProjectLogos() {
  console.log('🎨 Fetching project logos from CoinGecko...')
  
  try {
    // Get all projects without logos or with old emoji-only placeholders
    const projects = await prisma.project.findMany({
      where: {
        OR: [
          { image: null },
          { image: '' },
        ]
      },
    })

    console.log(`Found ${projects.length} projects without logos`)

    let updated = 0
    for (const project of projects) {
      const logoUrl = await getCoinGeckoLogoUrl(project.name)
      
      if (logoUrl) {
        await prisma.project.update({
          where: { id: project.id },
          data: { image: logoUrl }
        })
        console.log(`✅ ${project.name}: ${logoUrl.substring(0, 50)}...`)
        updated++
      } else {
        console.log(`⚠️  ${project.name}: No logo found in CoinGecko`)
      }
      
      // Rate limit
      await new Promise(resolve => setTimeout(resolve, 150))
    }

    console.log(`\n✨ Updated ${updated}/${projects.length} projects with logos`)
  } catch (error) {
    console.error('Error updating logos:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updateProjectLogos()
