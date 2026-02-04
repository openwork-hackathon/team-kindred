'use server'

import { GoogleGenAI } from '@google/genai'
import { z } from 'zod'

// Initialize Gemini Client
const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || ''
const ai = new GoogleGenAI({ apiKey })

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

export async function analyzeProject(query: string): Promise<AnalysisResult> {
  console.log(`[Ma'at] Analyzing: ${query} with Gemini 3 Flash...`)

  try {
    const prompt = `Search for comprehensive information about the Web3/DeFi project: "${query}".
    
    TASK: Use Google Search to find the LATEST data.
    1. Look for TVL (Total Value Locked) on DeFiLlama.
    2. Check for Security Audits (CertiK, Paladin, etc.).
    3. Identify Investors (Crunchbase, CryptoRank).
    4. Scan for bad news, hacks, or risk warnings.`

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp', 
      contents: prompt,
      config: {
        systemInstruction: `You are Ma'at, the Egyptian goddess of Truth, now analyzing Web3.

TASK: Research and verify Web3/DeFi/NFT projects.

CRITICAL RULES:
1. NO HALLUCINATIONS: Only report data you actually find.
2. VERIFY THE PROJECT: Make sure the project matches the query.
3. OUTPUT: JSON format ONLY. All text (summary, features) in Traditional Chinese (繁體中文).

RETURN JSON FORMAT:
{
  "name": "Project Name",
  "type": "DEX",
  "chain": ["Ethereum"],
  "score": 4.5,
  "status": "VERIFIED",
  "summary": "Summary in Traditional Chinese.",
  "tvl": "$500M",
  "tokenSymbol": "TOKEN",
  "tokenPrice": "$1.23",
  "investors": ["a16z"],
  "features": ["Feature 1", "Feature 2"],
  "warnings": ["Warning 1"],
  "audits": [{"auditor": "CertiK", "date": "2024"}],
  "recentNews": [{"title": "News", "date": "2024"}]
}`,
        tools: [{ googleSearch: {} }] // Enable Google Search Grounding
      }
    })

    const text = response.text || ''
    console.log("[Ma'at] Response:", text.substring(0, 100) + "...")

    // Extract JSON
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('No JSON found in response')
    }

    const data = JSON.parse(jsonMatch[0])

    // Validate/Map to AnalysisResult
    // Ensure all required fields exist or have defaults
    return {
      name: data.name || query,
      type: data.type || 'Other',
      chain: data.chain || [],
      score: typeof data.score === 'number' ? data.score : 0,
      status: data.status || 'UNSTABLE',
      summary: data.summary || '暫無詳細分析',
      tvl: data.tvl || undefined,
      tokenSymbol: data.tokenSymbol || undefined,
      tokenPrice: data.tokenPrice || undefined,
      investors: data.investors || [],
      features: data.features || [],
      warnings: data.warnings || [],
      audits: data.audits || [],
      recentNews: data.recentNews || []
    } as AnalysisResult

  } catch (error) {
    console.error('Ma\'at Verification Failed:', error)
    return {
      name: query,
      type: 'Other',
      chain: [],
      score: 0,
      status: 'UNSTABLE',
      summary: '系統暫時無法完成深度分析 (連線逾時中斷)',
      features: ['請稍後重試'],
      warnings: ['Ma\'at 節點忙碌中'],
    } as AnalysisResult
  }
}
