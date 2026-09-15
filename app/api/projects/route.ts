import { NextRequest, NextResponse } from 'next/server';
import { getProjects, addProject } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const projects = getProjects();
    return NextResponse.json({ success: true, projects });
  } catch (err: any) {
    console.error('Failed to get projects:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const adminSession = req.cookies.get('zenit_admin_session');
    if (!adminSession || (adminSession.value !== 'admin' && adminSession.value !== 'manager')) {
      return NextResponse.json({ success: false, error: 'Unauthorized access. Log-in required.' }, { status: 401 });
    }

    const body = await req.json();
    const {
      title,
      category,
      clientName,
      tagline,
      challenge,
      solution,
      demoUrl,
      imageUrl,
      techBadges,
      metrics,
      priority
    } = body;

    if (!title || !category || !clientName) {
      return NextResponse.json({ 
        success: false, 
        error: 'Title, category, and client name are required.' 
      }, { status: 400 });
    }

    const project = addProject({
      title,
      category: category.trim(),
      clientName: clientName.trim(),
      tagline: tagline || '',
      challenge: challenge || '',
      solution: solution || '',
      demoUrl: demoUrl || '',
      imageUrl: imageUrl || '',
      techBadges: Array.isArray(techBadges) ? techBadges : [],
      metrics: Array.isArray(metrics) ? metrics : [],
      priority: Number(priority) || 0
    });

    return NextResponse.json({ success: true, project });
  } catch (err: any) {
    console.error('Failed to create new showcase project:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
