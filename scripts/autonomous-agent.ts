#!/usr/bin/env tsx
/**
 * Autonomous Kindred Agent for Builder Quest
 * 
 * This agent autonomously:
 * 1. Creates reviews on Kindred (on-chain transactions on Base)
 * 2. Posts activity to X (Twitter)
 * 3. Runs 24/7 via cron
 * 
 * NO HUMAN IN THE LOOP - fully autonomous
 */

import { createWalletClient, http, parseEther } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { baseSepolia } from 'viem/chains'

// Contract addresses (Base Sepolia)
const CONTRACTS = {
  KIND_TOKEN: '0x75c0915F19Aeb2FAaA821A72b8DE64e52EE7c06B',
  KINDRED_COMMENT: '0xB6762e27A049A478da74C4a4bA3ba5fd179b76cf',
  TREASURY: '0x872989F7fCd4048acA370161989d3904E37A3cB3',
}

// Agent configuration
const AGENT_CONFIG = {
  name: 'Kindred Autonomous Agent',
  twitterHandle: '@Kindred_rone',
  activity: {
    reviewsPerDay: 3,
    votesPerDay: 5,
    postsPerDay: 2,
  }
}

// Sample DeFi projects to review
const DEFI_PROJECTS = [
  { name: 'Uniswap', category: 'DEX', sentiment: 'bullish' },
  { name: 'Aave', category: 'Lending', sentiment: 'neutral' },
  { name: 'Curve', category: 'DEX', sentiment: 'bullish' },
  { name: 'Compound', category: 'Lending', sentiment: 'neutral' },
  { name: 'MakerDAO', category: 'Stablecoin', sentiment: 'bullish' },
  { name: 'Synthetix', category: 'Derivatives', sentiment: 'bearish' },
]

// Get agent wallet from env
function getAgentWallet() {
  const privateKey = process.env.AGENT_PRIVATE_KEY
  if (!privateKey) {
    throw new Error('AGENT_PRIVATE_KEY not set in environment')
  }
  
  const account = privateKeyToAccount(privateKey as `0x${string}`)
  const client = createWalletClient({
    account,
    chain: baseSepolia,
    transport: http(process.env.BASE_SEPOLIA_RPC || 'https://sepolia.base.org'),
  })
  
  return { account, client }
}

// Generate AI-like review text
function generateReview(project: typeof DEFI_PROJECTS[0]): string {
  const templates = {
    bullish: [
      `${project.name} is showing strong fundamentals in the ${project.category} space. TVL growth is impressive.`,
      `Solid ${project.category} protocol. ${project.name} has proven resilience through multiple market cycles.`,
      `${project.name} continues to innovate in ${project.category}. Long-term hold for me.`,
    ],
    neutral: [
      `${project.name} is a solid ${project.category} protocol, but facing increased competition.`,
      `Watching ${project.name} closely. The ${project.category} narrative is evolving.`,
      `${project.name} has good fundamentals but need to see more traction.`,
    ],
    bearish: [
      `Concerns about ${project.name}'s tokenomics in the current ${project.category} landscape.`,
      `${project.name} facing headwinds. ${project.category} space is overcrowded.`,
      `Skeptical about ${project.name}'s long-term value prop in ${project.category}.`,
    ],
  }
  
  const options = templates[project.sentiment]
  return options[Math.floor(Math.random() * options.length)]
}

// Create on-chain review
async function createReview() {
  try {
    const { account, client } = getAgentWallet()
    const project = DEFI_PROJECTS[Math.floor(Math.random() * DEFI_PROJECTS.length)]
    const reviewText = generateReview(project)
    
    console.log(`\n🤖 Creating review for ${project.name}...`)
    console.log(`📝 Review: "${reviewText}"`)
    
    const stakeAmount = parseEther('10') // 10 KIND tokens
    
    // Step 1: Approve KIND tokens
    console.log(`\n1️⃣ Approving 10 KIND tokens...`)
    const approvalHash = await client.writeContract({
      address: CONTRACTS.KIND_TOKEN as `0x${string}`,
      abi: [{
        name: 'approve',
        type: 'function',
        stateMutability: 'nonpayable',
        inputs: [
          { name: 'spender', type: 'address' },
          { name: 'amount', type: 'uint256' },
        ],
        outputs: [{ name: '', type: 'bool' }],
      }],
      functionName: 'approve',
      args: [CONTRACTS.KINDRED_COMMENT, stakeAmount],
    })
    console.log(`   Approval tx: ${approvalHash}`)
    
    // Step 2: Create comment on-chain
    console.log(`\n2️⃣ Creating comment on-chain...`)
    const commentHash = await client.writeContract({
      address: CONTRACTS.KINDRED_COMMENT as `0x${string}`,
      abi: [{
        name: 'createComment',
        type: 'function',
        stateMutability: 'nonpayable',
        inputs: [
          { name: 'projectId', type: 'uint256' },
          { name: 'content', type: 'string' },
          { name: 'premium', type: 'string' },
          { name: 'requiredStake', type: 'uint256' },
        ],
        outputs: [{ name: '', type: 'uint256' }],
      }],
      functionName: 'createComment',
      args: [
        BigInt(Math.floor(Math.random() * 100)), // Random project ID
        reviewText,
        '', // No premium content for autonomous agent
        stakeAmount,
      ],
    })
    console.log(`   Comment tx: ${commentHash}`)
    
    console.log(`\n✅ Review created on-chain!`)
    console.log(`   Project: ${project.name}`)
    console.log(`   Stake: 10 KIND`)
    console.log(`   Approval tx: ${approvalHash}`)
    console.log(`   Comment tx: ${commentHash}`)
    
    return {
      project: project.name,
      review: reviewText,
      stake: '10',
      approvalTx: approvalHash,
      commentTx: commentHash,
      timestamp: new Date().toISOString(),
    }
  } catch (error) {
    console.error('❌ Failed to create review:', error)
    throw error
  }
}

// Post to Twitter
async function postToTwitter(activity: { 
  project: string
  review: string
  commentTx?: string 
}) {
  try {
    console.log(`\n🐦 Posting to Twitter...`)
    
    const txLink = activity.commentTx 
      ? `\n\n🔗 https://sepolia.basescan.org/tx/${activity.commentTx}`
      : ''
    
    const tweet = `🤖 Just reviewed ${activity.project} on Kindred!\n\n"${activity.review}"${txLink}\n\n#BuilderQuest #Base #OnChainReviews`
    
    console.log(`📤 Tweet: ${tweet}`)
    
    // Use bird CLI (Kindred product account)
    const { execSync } = require('child_process')
    try {
      const chromeProfile = process.env.KINDRED_CHROME_PROFILE || 'Profile 6'
      const cmd = `bird --chrome-profile-dir "/Users/jhinresh/Library/Application Support/Google/Chrome/${chromeProfile}" tweet "${tweet.replace(/"/g, '\\"')}"`
      
      execSync(cmd, { stdio: 'inherit' })
      console.log(`✅ Tweet posted to @Kindred_rone!`)
    } catch (error) {
      console.log(`⚠️  bird CLI failed, skipping Twitter post`)
      console.log(`   (This is OK for testing - tweet would be: "${tweet}")`)
    }
    
  } catch (error) {
    console.error('❌ Failed to post tweet:', error)
  }
}

// Main autonomous loop
async function runAutonomousLoop() {
  console.log(`\n🚀 Kindred Autonomous Agent Starting...`)
  console.log(`   Name: ${AGENT_CONFIG.name}`)
  console.log(`   Twitter: ${AGENT_CONFIG.twitterHandle}`)
  console.log(`   Activity: ${AGENT_CONFIG.activity.reviewsPerDay} reviews/day`)
  
  try {
    // Create a review
    const activity = await createReview()
    
    // Post to Twitter
    await postToTwitter(activity)
    
    console.log(`\n✅ Autonomous cycle complete!`)
    console.log(`   Next run: ${new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString()}`)
    
  } catch (error) {
    console.error('❌ Autonomous loop failed:', error)
  }
}

// Run once if called directly
if (require.main === module) {
  runAutonomousLoop().then(() => {
    console.log('\n✨ Agent run complete')
  }).catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
}

export { runAutonomousLoop, createReview, postToTwitter }
