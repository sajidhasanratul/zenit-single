import { NextRequest, NextResponse } from 'next/server';
import { deleteProject, updateProject } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const adminSession = req.cookies.get('zenit_admin_session');
    if (!adminSession || (adminSession.value !== 'admin' && adminSession.value !== 'manager')) {
      return NextResponse.json({ success: false, error: 'Unauthorized access. Log-in required.' }, { status: 401 });
    }

    const { id } = params;
    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing project ID parameter.' }, { status: 400 });
    }

    const body = await req.json();
    await updateProject(id, body);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Failed to update project:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const adminSession = req.cookies.get('zenit_admin_session');
    if (!adminSession || (adminSession.value !== 'admin' && adminSession.value !== 'manager')) {
      return NextResponse.json({ success: false, error: 'Unauthorized access. Log-in required.' }, { status: 401 });
    }

    const { id } = params;
    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing project ID parameter.' }, { status: 400 });
    }

    await deleteProject(id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Failed to delete project:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
