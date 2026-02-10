import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { analyzeProjectQuery } from '@/lib/gemini-project-search';

export const dynamic = 'force-dynamic';

/**
 * GET /api/search?q=<query>
 * 
 * Search for projects by name
 * 1. Search local DB first
 * 2. If not found, use Gemini to analyze if it's a real project
 * 3. Return results with "add project" suggestion if not in DB
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query || query.length < 2) {
    return NextResponse.json(
      { error: 'Search query required (minimum 2 characters)' },
      { status: 400 }
    );
  }

  try {
    const searchTerm = query.toLowerCase().trim();

    // 1. Search local DB
    const localResults = await prisma.project.findMany({
      where: {
        OR: [
          { name: { contains: searchTerm, mode: 'insensitive' } },
          { category: { contains: searchTerm, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        name: true,
        address: true,
        category: true,
        description: true,
        image: true,
        avgRating: true,
        reviewCount: true,
      },
      take: 5,
    });

    // If found in DB, return immediately
    if (localResults.length > 0) {
      return NextResponse.json({
        found: true,
        source: 'local',
        results: localResults,
        message: `Found ${localResults.length} project(s)`,
      });
    }

    // 2. Not found locally - use Gemini to analyze
    const analysis = await analyzeProjectQuery(query);

    // If Gemini says it's a real project
    if (analysis.isRealProject && analysis.confidence >= 70) {
      return NextResponse.json({
        found: false,
        source: 'gemini',
        analysis,
        suggestion: {
          text: `"${analysis.projectName}" is a real project but not in Kindred yet.`,
          action: 'Write a review to add it',
          category: analysis.category,
        },
      });
    }

    // If Gemini says it's not a real project
    return NextResponse.json({
      found: false,
      source: 'gemini',
      analysis,
      message: `"${query}" doesn't appear to be a recognized project.`,
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Search failed', details: String(error) },
      { status: 500 }
    );
  }
}
