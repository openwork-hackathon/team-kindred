/**
 * Gemini API integration for smart project search
 * Analyzes search queries to identify real projects
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

interface ProjectSearchResult {
  isRealProject: boolean;
  projectName: string;
  category?: string;
  description?: string;
  confidence: number; // 0-100
  reason: string;
}

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || '');

/**
 * Analyze if search query refers to a real project
 */
export async function analyzeProjectQuery(
  query: string
): Promise<ProjectSearchResult> {
  try {
    if (!process.env.GOOGLE_GEMINI_API_KEY) {
      console.warn('Gemini API key not configured, skipping project analysis');
      return {
        isRealProject: false,
        projectName: query,
        confidence: 0,
        reason: 'API not configured',
      };
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `You are a crypto project identifier. Analyze this search query and return ONLY valid JSON (no markdown):

{
  "isRealProject": <true|false>,
  "projectName": "<canonical project name if real>",
  "category": "<k/defi|k/perp-dex|k/ai|k/memecoin|k/prediction|k/infra|null>",
  "description": "<brief description if real>",
  "confidence": <0-100>,
  "reason": "<explanation>"
}

Rules:
- isRealProject = true ONLY if this is a known, established Web3/crypto project
- confidence: how sure you are (100 = definitely real, 0 = definitely fake/not a project)
- category: guess the most relevant category
- Return false for: typos, gibberish, random words, non-crypto things

Search query: "${query}"

Return ONLY the JSON object, nothing else:`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Parse JSON response
    let parsed;
    try {
      // Extract JSON from response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      parsed = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error('Failed to parse Gemini search response:', responseText);
      return {
        isRealProject: false,
        projectName: query,
        confidence: 0,
        reason: 'Analysis inconclusive',
      };
    }

    const {
      isRealProject = false,
      projectName = query,
      category = null,
      description = '',
      confidence = 0,
      reason = '',
    } = parsed;

    return {
      isRealProject: isRealProject === true,
      projectName: projectName || query,
      category,
      description,
      confidence: Math.max(0, Math.min(100, confidence)),
      reason,
    };
  } catch (error) {
    console.error('Error analyzing project query with Gemini:', error);
    // Fail open: assume it might be real but low confidence
    return {
      isRealProject: false,
      projectName: query,
      confidence: 20,
      reason: 'Analysis error (allowed to proceed)',
    };
  }
}

/**
 * Batch analyze multiple queries
 */
export async function analyzeProjectQueriesBatch(
  queries: string[]
): Promise<ProjectSearchResult[]> {
  return Promise.all(queries.map((q) => analyzeProjectQuery(q)));
}
