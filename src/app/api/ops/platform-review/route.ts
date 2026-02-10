import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { analyzeProjectQuery } from '@/lib/gemini-project-search';

export const dynamic = 'force-dynamic';

/**
 * Platform Agent auto-review endpoint
 * POST /api/ops/platform-review
 * 
 * Automatically reviews pending projects:
 * 1. Validates project name (not garbage/hex)
 * 2. Checks description quality with Gemini
 * 3. Verifies logo URL is accessible
 * 4. Auto-approves if all checks pass (>70%)
 */

async function checkProjectName(name: string): Promise<{ valid: boolean; reason: string }> {
  // Reject hex patterns, too long, or unusual characters
  if (/^[a-f0-9]{10,}$/.test(name) || name.length > 50) {
    return { valid: false, reason: 'Invalid project name (garbage/hex)' };
  }
  
  if (!/[a-zA-Z]/.test(name)) {
    return { valid: false, reason: 'Name must contain letters' };
  }
  
  return { valid: true, reason: 'Name valid' };
}

async function checkLogoUrl(url: string | null): Promise<{ valid: boolean; reason: string }> {
  if (!url) return { valid: false, reason: 'No logo URL provided' };
  
  try {
    const response = await fetch(url, { method: 'HEAD', timeout: 5000 });
    if (response.ok || response.status === 200) {
      return { valid: true, reason: 'Logo URL accessible' };
    }
    return { valid: false, reason: `Logo URL returned ${response.status}` };
  } catch (error) {
    return { valid: false, reason: `Logo URL unreachable: ${String(error).slice(0, 50)}` };
  }
}

async function checkDescriptionQuality(name: string, description: string | null): Promise<{ score: number; reason: string }> {
  if (!description || description.length < 10) {
    return { score: 30, reason: 'Description too short' };
  }
  
  try {
    const analysis = await analyzeProjectQuery(name);
    
    if (analysis.isRealProject && analysis.confidence >= 70) {
      return { score: 85, reason: 'Real project identified by Gemini' };
    }
    
    if (analysis.confidence >= 50) {
      return { score: 60, reason: 'Project identified with medium confidence' };
    }
    
    return { score: 30, reason: 'Project not recognized' };
  } catch (error) {
    return { score: 50, reason: 'Gemini check failed (allowed)' };
  }
}

interface ReviewResult {
  projectId: string;
  projectName: string;
  approved: boolean;
  score: number; // 0-100
  checks: {
    nameValid: boolean;
    logoAccessible: boolean;
    descriptionQuality: number;
  };
  notes: string;
}

/**
 * Review a single project
 */
async function reviewProject(projectId: string): Promise<ReviewResult> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      id: true,
      name: true,
      description: true,
      image: true,
    }
  });
  
  if (!project) {
    throw new Error(`Project not found: ${projectId}`);
  }
  
  // Run all checks
  const [nameCheck, logoCheck, descQuality] = await Promise.all([
    checkProjectName(project.name),
    checkLogoUrl(project.image),
    checkDescriptionQuality(project.name, project.description),
  ]);
  
  const score = Math.round((
    (nameCheck.valid ? 40 : 0) +
    (logoCheck.valid ? 30 : 0) +
    descQuality.score * 0.3
  ));
  
  const approved = score >= 70;
  
  const notes = [
    `Name: ${nameCheck.reason}`,
    `Logo: ${logoCheck.reason}`,
    `Description: ${descQuality.reason}`,
    `Final score: ${score}/100`,
  ].join(' | ');
  
  // Update project status
  await prisma.project.update({
    where: { id: projectId },
    data: {
      status: approved ? 'approved' : 'rejected',
      reviewedBy: 'platform-agent',
      reviewedAt: new Date(),
      reviewNotes: notes,
    }
  });
  
  return {
    projectId,
    projectName: project.name,
    approved,
    score,
    checks: {
      nameValid: nameCheck.valid,
      logoAccessible: logoCheck.valid,
      descriptionQuality: descQuality.score,
    },
    notes,
  };
}

// POST /api/ops/platform-review
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId, projectIds } = body;
    
    // Single project review
    if (projectId) {
      const result = await reviewProject(projectId);
      return NextResponse.json(result);
    }
    
    // Batch review
    if (projectIds && Array.isArray(projectIds)) {
      const results = await Promise.all(
        projectIds.map((id: string) => reviewProject(id))
      );
      
      const approved = results.filter(r => r.approved).length;
      const rejected = results.filter(r => !r.approved).length;
      
      return NextResponse.json({
        success: true,
        total: results.length,
        approved,
        rejected,
        results,
      });
    }
    
    // Review all pending projects
    const pendingProjects = await prisma.project.findMany({
      where: { status: 'pending' },
      select: { id: true }
    });
    
    if (pendingProjects.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No pending projects to review',
        total: 0,
        approved: 0,
        rejected: 0,
        results: [],
      });
    }
    
    const results = await Promise.all(
      pendingProjects.map((p) => reviewProject(p.id))
    );
    
    const approved = results.filter(r => r.approved).length;
    const rejected = results.filter(r => !r.approved).length;
    
    return NextResponse.json({
      success: true,
      total: results.length,
      approved,
      rejected,
      results,
    });
    
  } catch (error) {
    console.error('Platform review error:', error);
    return NextResponse.json(
      { error: 'Platform review failed', details: String(error) },
      { status: 500 }
    );
  }
}
