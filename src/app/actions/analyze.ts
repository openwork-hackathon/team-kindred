'use server'

import { google } from '@ai-sdk/google'
import { generateObject } from 'ai'
import { z } from 'zod'

// Define the schema for the analysis result
const AnalysisSchema = z.object({
  name: z.string().describe('The name of the project or token'),
  category: z.string().describe('The category of the project, must start with k/ (e.g. k/defi, k/ai, k/memecoin)'),
  aiVerdict: z.enum(['bullish', 'bearish', 'neutral']).describe('The overall sentiment verdict'),
  aiScore: z.number().min(0).max(100).describe('A customized score from 0-100 based on sentiment and potential'),
  aiSummary: z.string().describe('A concise 2-3 sentence summary of the project status and sentiment'),
  keyPoints: z.array(z.string()).describe('3 key bullet points highlighting main pros/cons or news'),
  price: z.string().optional().describe('Current price if available, else estimate or "N/A"'),
  marketCap: z.string().optional().describe('Market cap if available'),
  volume24h: z.string().optional().describe('24h volume if available'),
})

export type AnalysisResult = z.infer<typeof AnalysisSchema>

export async function analyzeProject(query: string) {
  try {
    const { object } = await generateObject({
      model: google('gemini-1.5-flash'),
      schema: AnalysisSchema,
      prompt: `Analyze the crypto project "${query}". 
      If it's a known project (like Solana, Doge, etc.), provide real recent data and sentiment.
      If it's a new or unknown project, simulate a realistic "new launch" analysis based on the name.
      
      For the category, determine the most fitting sector (e.g., k/l1, k/defi, k/ai, k/memecoin).
      
      Provide a "bullish", "bearish", or "neutral" verdict based on current market trends for this specific project.
      
      Format price/marketCap with $ symbols (e.g. $1.20, $500M).`,
    })

    return object
  } catch (error) {
    console.error('Gemini Analysis Failed:', error)
    // Fallback to a safe mock if API fails
    return {
      name: query,
      category: 'k/unknown',
      aiVerdict: 'neutral',
      aiScore: 50,
      aiSummary: 'Unable to generate live analysis at this moment. Please try again later.',
      keyPoints: ['Analysis service unavailable', 'Please check connection', 'Try again later'],
      price: '-',
      marketCap: '-',
      volume24h: '-',
    } as AnalysisResult
  }
}
