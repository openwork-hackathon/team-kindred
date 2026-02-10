import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * POST /api/projects/create
 * Create a new project directly (from search results)
 * 
 * Body:
 * {
 *   name: string,
 *   category: string (k/defi, k/perp-dex, k/ai, k/memecoin, etc.),
 *   description?: string,
 *   address?: string,
 *   website?: string,
 *   image?: string
 * }
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, category, description, address, website, image } = body;

    // Validation
    if (!name || !category) {
      return NextResponse.json(
        { error: 'Missing required fields: name, category' },
        { status: 400 }
      );
    }

    // Sanitize
    const cleanName = name.trim();
    const cleanCategory = category.toLowerCase();

    // Check if project already exists
    const existing = await prisma.project.findFirst({
      where: { name: cleanName }
    });

    if (existing) {
      return NextResponse.json(
        { error: `Project "${cleanName}" already exists`, projectId: existing.id },
        { status: 409 }
      );
    }

    // Create project - immediately approved for MVP
    const newProject = await prisma.project.create({
      data: {
        name: cleanName,
        category: cleanCategory,
        description: description || null,
        address: address || `addr_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`, // Fallback unique address
        website: website || null,
        image: image || null,
        status: 'approved', // Immediately approved (Platform Agent to be added later)
        reviewedBy: 'user', // User self-approval for MVP
        reviewedAt: new Date(),
      },
      select: {
        id: true,
        name: true,
        category: true,
        status: true,
      }
    });

    return NextResponse.json(
      {
        success: true,
        message: `Project "${cleanName}" created (pending review)`,
        project: newProject,
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Project creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create project', details: String(error) },
      { status: 500 }
    );
  }
}
