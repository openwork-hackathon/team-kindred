'use server'

import { google } from '@ai-sdk/google'
import { generateObject } from 'ai'
import { z } from 'zod'

// Ma'at Analysis Schema (Robust Web3 Verification)
const AnalysisSchema = z.object({
  name: z.string().describe('Project Name'),
  type: z.enum(['DEX', 'DeFi', 'NFT', 'Infrastructure', 'Mobile', 'AI', 'Meme', 'Other']).describe('Project Category'),
  chain: z.array(z.string()).describe('Supported Blockchains'),
  score: z.number().min(0).max(5).describe('Trust Score (0.0-5.0)'),
  status: z.enum(['VERIFIED', 'UNSTABLE', 'RISKY']).describe('Verification Status'),
  summary: z.string().describe('2-3 sentence summary in Traditional Chinese (繁體中文)'),
  tvl: z.string().optional().describe('Total Value Locked (e.g. $500M)'),
  tokenSymbol: z.string().optional(),
  tokenPrice: z.string().optional(),
  investors: z.array(z.string()).optional().describe('Key Investors (e.g. a16z, Binance Labs)'),
  features: z.array(z.string()).describe('Key Features in Traditional Chinese'),
  warnings: z.array(z.string()).describe('Risk Warnings in Traditional Chinese'),
  audits: z.array(z.object({
    auditor: z.string(),
    date: z.string().optional()
  })).optional().describe('Security Audits'),
  recentNews: z.array(z.object({
    title: z.string(),
    date: z.string().optional()
  })).optional()
})

export type AnalysisResult = z.infer<typeof AnalysisSchema>

export async function analyzeProject(query: string) {
  try {
    const { object } = await generateObject({
      model: google('gemini-1.5-flash'),
      schema: AnalysisSchema,
      prompt: `You are Ma'at, the Goddess of Truth for Web3. 
      Analyze the project "${query}".

      CRITICAL RULES:
      1. NO HALLUCINATIONS: Only return data you are confident in. If info is missing, omit it or use reasonable estimates based on similar projects if "New".
      2. VERIFY: Check for security audits, TVL, and team background.
      3. OUTPUT: All text fields (summary, features, warnings) MUST be in Traditional Chinese (繁體中文).
      4. SCORING: 
         - 4.0-5.0 (VERIFIED): Established, multiple audits, high TVL.
         - 2.5-3.9 (UNSTABLE): Newer, limited audits, anonymous team.
         - 0.0-2.4 (RISKY): Red flags, no audits, potential rug.

      If the project is technically "unknown" or "new", simulate a "New Launch" analysis:
      - Assign it "UNSTABLE" status.
      - Generate realistic "Projected" data based on its name/category.
      - Explicitly state in summary it is a new/unverified project.
      `,
    })

    return object
  } catch (error) {
    console.error('Ma\'at Verification Failed:', error)
    return {
      name: query,
      type: 'Other',
      chain: [],
      score: 0,
      status: 'UNSTABLE',
      summary: '系統暫時無法完成深度分析 (Analysis Temporarily Unavailable)',
      features: ['無法連線至 Ma\'at 節點'],
      warnings: ['請稍後重試'],
    } as AnalysisResult
  }
}
