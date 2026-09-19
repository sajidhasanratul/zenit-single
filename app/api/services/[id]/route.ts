import { NextRequest, NextResponse } from 'next/server';
import { deleteService, updateService } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const adminSession = req.cookies.get('zenit_admin_session');
    if (!adminSession || (adminSession.value !== 'admin' && adminSession.value !== 'manager' && adminSession.value !== 'authenticated')) {
      return NextResponse.json({ success: false, error: 'Unauthorized access. Log-in required.' }, { status: 401 });
    }

    const { id } = params;
    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing service ID path parameter.' }, { status: 400 });
    }

    await deleteService(id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Failed to delete service:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const adminSession = req.cookies.get('zenit_admin_session');
    if (!adminSession || (adminSession.value !== 'admin' && adminSession.value !== 'manager' && adminSession.value !== 'authenticated')) {
      return NextResponse.json({ success: false, error: 'Unauthorized access. Log-in required.' }, { status: 401 });
    }

    const { id } = params;
    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing service ID path parameter.' }, { status: 400 });
    }

    const body = await req.json();
    await updateService(id, body);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Failed to update service:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
